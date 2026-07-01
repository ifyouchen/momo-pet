import type { CareAction, PetVisualAction } from '../types';

export interface PetVisualStep {
  /** 目标视觉动作。 */
  readonly action: PetVisualAction;
  /** 距离开场多少毫秒后切换。 */
  readonly atMs: number;
}

const FEED_SEQUENCE: readonly PetVisualStep[] = [
  { action: 'low-head', atMs: 0 },
  { action: 'eat', atMs: 360 },
  { action: 'happy', atMs: 1450 },
  { action: 'idle', atMs: 2200 },
];

const CLEAN_SEQUENCE: readonly PetVisualStep[] = [
  { action: 'grooming', atMs: 0 },
  { action: 'happy', atMs: 1800 },
  { action: 'idle', atMs: 2400 },
];

const TOUCH_SEQUENCE: readonly PetVisualStep[] = [
  { action: 'happy', atMs: 0 },
  { action: 'idle', atMs: 1700 },
];

/**
 * 获取某个照顾动作触发后的视觉动作序列。
 *
 * @param action 照顾动作
 * @returns 视觉动作时间线，按 atMs 升序
 */
export function getVisualActionSequence(action: CareAction): readonly PetVisualStep[] {
  if (action === 'feed') {
    return FEED_SEQUENCE;
  }
  if (action === 'clean') {
    return CLEAN_SEQUENCE;
  }
  return TOUCH_SEQUENCE;
}

const SUCCESS_MESSAGE: Record<CareAction, string> = {
  feed: '吃到啦，谢谢你。',
  touch: '舒服多啦。',
  clean: '干净清爽了。',
};

/**
 * 获取照顾动作成功的反馈文案。
 *
 * @param action 照顾动作
 * @returns 用户可读的成功反馈
 */
export function getSuccessMessage(action: CareAction): string {
  return SUCCESS_MESSAGE[action];
}
