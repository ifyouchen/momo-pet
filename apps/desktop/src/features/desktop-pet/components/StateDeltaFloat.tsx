import type { StateDelta } from '../types';

interface StateDeltaFloatProps {
  /** 本次操作带来的正向状态变化，只作为短暂视觉反馈。 */
  readonly deltas: readonly StateDelta[];
}

/**
 * 操作后的状态变化浮层。
 *
 * 前置条件：deltas 仅包含正向变化。后置条件：展示轻量上浮反馈。
 * @throws 本组件不抛出异常。
 */
export function StateDeltaFloat({ deltas }: StateDeltaFloatProps) {
  if (deltas.length === 0) {
    return null;
  }

  return (
    <div className="state-delta-float" aria-live="polite">
      {deltas.map((delta) => (
        <span key={delta.label}>
          + {delta.label} {delta.value}
        </span>
      ))}
    </div>
  );
}
