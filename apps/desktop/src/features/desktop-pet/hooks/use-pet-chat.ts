import type { ChatMessage, PetState } from '@momo/shared';
import { useCallback, useEffect, useState } from 'react';
import { getChatMessages, sendChatMessage } from '../api/chat-api';

const CHAT_SYNC_CHANNEL_NAME = 'momo-pet-chat-sync';

interface UsePetChatOptions {
  /** 当前宠物 ID。 */
  readonly petId: string | null;
  /** 聊天成功后同步主页状态。 */
  readonly onStateChange: (state: PetState) => void;
}

export interface PetChatModel {
  readonly messages: readonly ChatMessage[];
  readonly draft: string;
  readonly errorMessage: string | null;
  readonly isLoadingHistory: boolean;
  readonly isSending: boolean;
  readonly latestSentPetReplyId: string | null;
  readonly setDraft: (value: string) => void;
  readonly sendMessage: () => Promise<void>;
}

interface ChatSyncPayload {
  /** 被同步的宠物 ID，避免多宠物或历史窗口串消息。 */
  readonly petId: string;
  /** 发送动作产生的新消息，包含用户消息和宠物回复。 */
  readonly messages: readonly ChatMessage[];
}

/**
 * 管理 Sprint 6 基础聊天面板状态。
 *
 * 前置条件：petId 来自默认宠物模型。后置条件：消息列表和输入态可直接驱动 ChatPanel。
 */
export function usePetChat({ petId, onStateChange }: UsePetChatOptions): PetChatModel {
  const [messages, setMessages] = useState<readonly ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [latestSentPetReplyId, setLatestSentPetReplyId] = useState<string | null>(null);

  useEffect(() => {
    if (!petId || typeof BroadcastChannel === 'undefined') {
      return undefined;
    }
    const channel = new BroadcastChannel(CHAT_SYNC_CHANNEL_NAME);
    channel.onmessage = (event: MessageEvent<ChatSyncPayload>) => {
      if (event.data.petId !== petId) {
        return;
      }
      setMessages((currentMessages) => mergeMessages(currentMessages, event.data.messages));
    };
    return () => channel.close();
  }, [petId]);

  useEffect(() => {
    if (!petId) {
      return undefined;
    }
    let isCancelled = false;
    setIsLoadingHistory(true);
    setErrorMessage(null);
    getChatMessages(petId)
      .then((response) => {
        if (!isCancelled) {
          setMessages(response.items);
        }
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          setErrorMessage(getErrorMessage(error));
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingHistory(false);
        }
      });
    return () => {
      isCancelled = true;
    };
  }, [petId]);

  const sendMessage = useCallback(async () => {
    const content = draft.trim();
    if (!petId || content.length === 0 || isSending) {
      return;
    }
    setIsSending(true);
    setErrorMessage(null);
    try {
      const response = await sendChatMessage(petId, { content });
      const now = new Date().toISOString();
      const petReplyMessageId = `${response.messageId}-reply`;
      const newMessages: readonly ChatMessage[] = [
        { messageId: response.messageId, role: 'USER', content, createdAt: now },
        {
          messageId: petReplyMessageId,
          role: 'PET',
          content: response.reply,
          createdAt: now,
        },
      ];
      setMessages((currentMessages) => mergeMessages(currentMessages, newMessages));
      broadcastChatMessages(petId, newMessages);
      setLatestSentPetReplyId(petReplyMessageId);
      setDraft('');
      onStateChange(response.state);
      if (response.fallback) {
        setErrorMessage('刚才网络有点晃，我先用本地回复陪你。');
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSending(false);
    }
  }, [draft, isSending, onStateChange, petId]);

  return {
    messages,
    draft,
    errorMessage,
    isLoadingHistory,
    isSending,
    latestSentPetReplyId,
    setDraft,
    sendMessage,
  };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '聊天失败了，可以稍后再试。';
}

function mergeMessages(
  currentMessages: readonly ChatMessage[],
  incomingMessages: readonly ChatMessage[],
): readonly ChatMessage[] {
  const currentMessageIds = new Set(currentMessages.map((message) => message.messageId));
  const uniqueIncomingMessages = incomingMessages.filter(
    (message) => !currentMessageIds.has(message.messageId),
  );
  return uniqueIncomingMessages.length > 0
    ? [...currentMessages, ...uniqueIncomingMessages]
    : currentMessages;
}

function broadcastChatMessages(petId: string, messages: readonly ChatMessage[]): void {
  if (typeof BroadcastChannel === 'undefined') {
    return;
  }
  const channel = new BroadcastChannel(CHAT_SYNC_CHANNEL_NAME);
  channel.postMessage({ petId, messages } satisfies ChatSyncPayload);
  channel.close();
}
