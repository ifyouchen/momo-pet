import type { PetState } from '@momo/shared';
import type { PetLifeBehavior, PetVisualAction } from '../types';

export type PetLifeWeighted = readonly (readonly [PetLifeBehavior, number])[];

/**
 * 在加权列表中按累计权重挑选一个行为。
 *
 * 行为约定：
 * - 总权重为 0 时回退到 'idle'，避免随机数 NaN 导致返回 undefined。
 * - randomValue 默认走 Math.random()，测试时可注入固定值确保可重复。
 */
export function weightedPick(
  items: readonly (readonly [PetLifeBehavior, number])[],
  randomValue: number = Math.random(),
): PetLifeBehavior {
  const totalWeight = items.reduce((sum, [, weight]) => sum + weight, 0);
  if (totalWeight <= 0) {
    return 'idle';
  }
  let cursor = randomValue * totalWeight;
  for (const [behavior, weight] of items) {
    cursor -= weight;
    if (cursor <= 0) {
      return behavior;
    }
  }
  return 'idle';
}

/**
 * 根据当前 PetState 决定下一次自主行为。
 *
 * 业务规则：
 * - energy <= 24 → 倾向 sleep/rest 恢复体力。
 * - mood >= 72 → 倾向 walk/play 释放情绪。
 * - 其余情况按 idle/walk/rest/play 默认权重选择。
 */
export function chooseNextBehavior(
  state: PetState | null,
  randomValue: number = Math.random(),
): PetLifeBehavior {
  if (state && state.energy <= 24) {
    return weightedPick(
      [
        ['sleep', 58],
        ['rest', 24],
        ['idle', 18],
      ],
      randomValue,
    );
  }
  if (state && state.mood >= 72) {
    return weightedPick(
      [
        ['walk', 34],
        ['play', 30],
        ['idle', 24],
        ['rest', 12],
      ],
      randomValue,
    );
  }
  return weightedPick(
    [
      ['idle', 38],
      ['walk', 32],
      ['rest', 18],
      ['play', 12],
    ],
    randomValue,
  );
}

/**
 * 将自主生活行为映射为可用的单帧视觉动作。
 *
 * - play / remind → happy
 * - sleep → sleep
 * - rest → lying
 * - idle / walk → null，由调用方沿用既有视觉动作
 */
export function getVisualActionForBehavior(behavior: PetLifeBehavior): PetVisualAction | null {
  if (behavior === 'play' || behavior === 'remind') {
    return 'happy';
  }
  if (behavior === 'sleep') {
    return 'sleep';
  }
  if (behavior === 'rest') {
    return 'lying';
  }
  return null;
}
