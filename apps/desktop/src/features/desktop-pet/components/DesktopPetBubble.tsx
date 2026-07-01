import type { FeedbackTone } from '../types';
import { SpeechBubble } from './SpeechBubble';

interface DesktopPetBubbleProps {
  /** 气泡文案；为空时父级不渲染本组件。 */
  readonly message: string;
  /** 气泡语气，决定颜色与可达性状态。 */
  readonly tone: FeedbackTone;
  /** 气泡使用场景，聊天回复会启用更适合长文的布局。 */
  readonly variant: 'feedback' | 'chat';
  /** 鼠标进入气泡时回调，用于暂停自动隐藏。 */
  readonly onPauseAutoHide: () => void;
  /** 鼠标离开气泡时回调，用于恢复自动隐藏。 */
  readonly onResumeAutoHide: () => void;
}

/**
 * 桌宠气泡展示层：只关心如何把文案和语气渲染出来，不持有任何状态。
 *
 * 前置条件：父级已经决定 message / tone / variant 并管理可见性。
 * 后置条件：渲染 SpeechBubble 并透传 hover/focus 事件。
 */
export function DesktopPetBubble({
  message,
  tone,
  variant,
  onPauseAutoHide,
  onResumeAutoHide,
}: DesktopPetBubbleProps) {
  return (
    <SpeechBubble
      message={message}
      tone={tone}
      variant={variant}
      onPauseAutoHide={onPauseAutoHide}
      onResumeAutoHide={onResumeAutoHide}
    />
  );
}
