import type { FeedbackTone } from '../types';

interface SpeechBubbleProps {
  /** 展示给用户的短反馈文案，建议不超过 20 个中文字符。 */
  readonly message: string;
  /** 反馈语气，决定气泡颜色和可访问状态。 */
  readonly tone: FeedbackTone;
}

/**
 * 桌宠短气泡，用于承载操作成功、错误和日常短句。
 *
 * 前置条件：message 已经是用户可理解文案。后置条件：反馈通过 aria-live 被读屏捕获。
 * @throws 本组件不抛出异常。
 */
export function SpeechBubble({ message, tone }: SpeechBubbleProps) {
  return (
    <div className={`speech-bubble speech-bubble-${tone}`} aria-live="polite">
      {message}
    </div>
  );
}
