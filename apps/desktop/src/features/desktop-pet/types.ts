/**
 * MVP 桌宠照顾动作，仅包含 Sprint 1 已接入后端的真实操作。
 */
export type CareAction = 'feed' | 'touch' | 'clean';

/**
 * 默认宠物运行时视觉动作，和 sprite manifest 中的 action 保持一致。
 */
export type PetVisualAction =
  'idle' | 'happy' | 'eat' | 'sleep' | 'low-head' | 'lying' | 'grooming';

/**
 * 透明桌宠自主生活行为，只影响前端运行时表现，不直接改变领域状态。
 */
export type PetLifeBehavior = 'idle' | 'walk' | 'play' | 'rest' | 'sleep' | 'remind';

/**
 * 桌宠自主移动方向。
 */
export type PetLifeDirection = 'left' | 'right';

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
