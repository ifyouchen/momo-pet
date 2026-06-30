import { Send, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import type { PetChatModel } from '../hooks/use-pet-chat';

interface ChatPanelProps {
  /** 宠物名称。 */
  readonly petName: string;
  /** 聊天视图模型。 */
  readonly chat: PetChatModel;
  /** 关闭聊天面板。 */
  readonly onClose: () => void;
}

/**
 * Sprint 6 基础聊天面板。
 *
 * 前置条件：chat 由 usePetChat 提供。后置条件：用户可以发送消息并查看宠物回复。
 */
export function ChatPanel({ petName, chat, onClose }: ChatPanelProps) {
  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const messagesElement = messagesRef.current;
    if (messagesElement) {
      messagesElement.scrollTop = messagesElement.scrollHeight;
    }
  }, [chat.messages.length, chat.errorMessage]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void chat.sendMessage();
  };

  return (
    <aside className="chat-panel" aria-label={`和${petName}聊天`}>
      <header className="chat-panel-header">
        <div>
          <span>Chat</span>
          <h2>和{petName}聊天</h2>
        </div>
        <button type="button" aria-label="关闭聊天" onClick={onClose}>
          <X size={17} />
        </button>
      </header>

      <div className="chat-messages" aria-label="聊天记录" ref={messagesRef}>
        {chat.isLoadingHistory ? <p className="chat-empty">正在取回最近聊天。</p> : null}
        {!chat.isLoadingHistory && chat.messages.length === 0 ? (
          <p className="chat-empty">今天想和我说什么？</p>
        ) : null}
        {chat.messages.map((message) => (
          <article
            className={`chat-message chat-message-${message.role === 'USER' ? 'user' : 'pet'}`}
            key={`${message.messageId}-${message.createdAt}`}
          >
            <span>{message.role === 'USER' ? '你' : petName}</span>
            <p>{message.content}</p>
          </article>
        ))}
      </div>

      {chat.errorMessage ? (
        <div className="chat-error" role="alert">
          {chat.errorMessage}
        </div>
      ) : null}

      <form className="chat-input-row" onSubmit={handleSubmit}>
        <input
          aria-label="聊天输入"
          maxLength={300}
          placeholder="今天工作好累"
          value={chat.draft}
          onChange={(event) => chat.setDraft(event.target.value)}
        />
        <button type="submit" aria-label="发送聊天" disabled={chat.isSending || !chat.draft.trim()}>
          <Send size={17} />
        </button>
      </form>
    </aside>
  );
}
