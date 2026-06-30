import type { ChatMessage, PetState } from '@momo/shared';
import { useCallback, useEffect, useState } from 'react';
import { getChatMessages, sendChatMessage } from '../api/chat-api';

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
  readonly setDraft: (value: string) => void;
  readonly sendMessage: () => Promise<void>;
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
      setMessages((currentMessages) => [
        ...currentMessages,
        { messageId: response.messageId, role: 'USER', content, createdAt: now },
        {
          messageId: `${response.messageId}-reply`,
          role: 'PET',
          content: response.reply,
          createdAt: now,
        },
      ]);
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
    setDraft,
    sendMessage,
  };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '聊天失败了，可以稍后再试。';
}
