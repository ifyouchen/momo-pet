import type { PetState } from '@momo/shared';
import type { StateDelta } from '../types';

const DELTA_LABELS = {
  hunger: '饱食',
  mood: '心情',
  cleanliness: '清洁',
  intimacy: '亲密',
  experience: '经验',
} as const;

type DeltaField = keyof typeof DELTA_LABELS;

/**
 * 计算前后两次宠物状态之间的正向变化项（数值大于 0 时展示）。
 *
 * @param previousState 旧状态，可空
 * @param nextState 新状态
 * @returns 状态增量列表
 */
export function getStateDeltas(
  previousState: PetState | null,
  nextState: PetState,
): readonly StateDelta[] {
  if (!previousState) {
    return [];
  }
  return (Object.keys(DELTA_LABELS) as DeltaField[])
    .map((field) => createDelta(DELTA_LABELS[field], nextState[field] - previousState[field]))
    .filter((delta): delta is StateDelta => Boolean(delta));
}

function createDelta(label: string, value: number): StateDelta | null {
  return value > 0 ? { label, value } : null;
}
