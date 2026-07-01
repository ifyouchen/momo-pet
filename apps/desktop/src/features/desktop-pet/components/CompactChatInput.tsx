import { CHAT_MESSAGE_MAX_LENGTH } from '@momo/shared';
import { LoaderCircle, Send, X } from 'lucide-react';
import type { FormEvent } from 'react';
import type { PetChatModel } from '../hooks/use-pet-chat';

interface CompactChatInputProps {
  /** 聊天视图模型，负责输入、发送、错误和加载状态。 */
  readonly chat: PetChatModel;
  /** 关闭透明桌宠小窗里的快速聊天输入条。 */
  readonly onClose: () => void;
}

/**
 * 透明桌宠快速聊天输入条。
 *
 * 前置条件：chat 来自 usePetChat。后置条件：用户可在不打开完整聊天面板的情况下发送消息。
 */
export function CompactChatInput({ chat, onClose }: CompactChatInputProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void chat.sendMessage();
  };

  const statusText =
    chat.errorMessage ??
    (chat.isSending ? '正在等 Momo 回复。' : chat.isLoadingHistory ? '正在取回最近聊天。' : null);

  return (
    <aside className="compact-chat" aria-label="快速聊天">
      {statusText ? (
        <div
          className={`compact-chat-status${chat.errorMessage ? ' compact-chat-status-error' : ''}`}
          role={chat.errorMessage ? 'alert' : 'status'}
        >
          {statusText}
        </div>
      ) : null}
      <form className="compact-chat-row" onSubmit={handleSubmit}>
        <input
          aria-label="聊天输入"
          maxLength={CHAT_MESSAGE_MAX_LENGTH}
          placeholder="今天工作好累"
          value={chat.draft}
          disabled={chat.isSending}
          onChange={(event) => chat.setDraft(event.target.value)}
        />
        <button type="submit" aria-label="发送聊天" disabled={chat.isSending || !chat.draft.trim()}>
          {chat.isSending ? (
            <LoaderCircle className="compact-chat-loading-icon" size={17} />
          ) : (
            <Send size={17} />
          )}
        </button>
        <button type="button" aria-label="关闭聊天" onClick={onClose}>
          <X size={17} />
        </button>
      </form>
    </aside>
  );
}
