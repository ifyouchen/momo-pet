import type { FocusEventHandler, PointerEventHandler } from 'react';
import type { FeedbackTone } from '../types';

interface SpeechBubbleProps {
  /** 展示给用户的短反馈文案，建议不超过 20 个中文字符。 */
  readonly message: string;
  /** 反馈语气，决定气泡颜色和可访问状态。 */
  readonly tone: FeedbackTone;
  /** 气泡使用场景，聊天回复会启用更适合长文的布局。 */
  readonly variant?: 'feedback' | 'chat';
  /** 用户开始阅读聊天气泡时暂停自动隐藏。 */
  readonly onPauseAutoHide?: PointerEventHandler<HTMLDivElement> &
    FocusEventHandler<HTMLDivElement>;
  /** 用户离开聊天气泡时恢复自动隐藏。 */
  readonly onResumeAutoHide?: PointerEventHandler<HTMLDivElement> &
    FocusEventHandler<HTMLDivElement>;
}

/**
 * 桌宠短气泡，用于承载操作成功、错误和日常短句。
 *
 * 前置条件：message 已经是用户可理解文案。后置条件：反馈通过 aria-live 被读屏捕获。
 * @throws 本组件不抛出异常。
 */
export function SpeechBubble({
  message,
  tone,
  variant = 'feedback',
  onPauseAutoHide,
  onResumeAutoHide,
}: SpeechBubbleProps) {
  const isLongMessage = variant === 'chat' && message.length > 42;
  const canPauseAutoHide = variant === 'chat';
  const className = [
    'speech-bubble',
    `speech-bubble-${tone}`,
    variant === 'chat' ? 'speech-bubble-chat' : null,
    isLongMessage ? 'speech-bubble-long' : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={className}
      aria-live="polite"
      tabIndex={canPauseAutoHide ? 0 : undefined}
      onBlur={canPauseAutoHide ? onResumeAutoHide : undefined}
      onFocus={canPauseAutoHide ? onPauseAutoHide : undefined}
      onPointerEnter={canPauseAutoHide ? onPauseAutoHide : undefined}
      onPointerLeave={canPauseAutoHide ? onResumeAutoHide : undefined}
    >
      {message}
    </div>
  );
}
