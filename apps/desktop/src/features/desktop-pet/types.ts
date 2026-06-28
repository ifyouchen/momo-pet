/**
 * MVP 桌宠照顾动作，仅包含 Sprint 1 已接入后端的真实操作。
 */
export type CareAction = 'feed' | 'touch' | 'clean';

/**
 * 用户反馈气泡语气，用于统一成功、错误和默认提示的视觉状态。
 */
export type FeedbackTone = 'idle' | 'success' | 'error';

/**
 * 后端状态变化的轻量展示项，只用于视觉反馈，不作为最终业务状态。
 */
export interface StateDelta {
  readonly label: string;
  readonly value: number;
}
