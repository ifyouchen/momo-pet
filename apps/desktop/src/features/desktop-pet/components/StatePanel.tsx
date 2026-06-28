import type { PetState } from '@momo/shared';

interface StatePanelProps {
  /** 当前宠物状态；为空时展示后端连接等待态。 */
  readonly state: PetState | null;
  /** 初始化中状态，用于展示骨架态而非空白。 */
  readonly isLoading: boolean;
}

const STATUS_ITEMS: Array<{
  readonly key: keyof Pick<PetState, 'hunger' | 'mood' | 'cleanliness' | 'energy' | 'intimacy'>;
  readonly label: string;
  readonly tone: string;
}> = [
  { key: 'hunger', label: '饱食', tone: 'hunger' },
  { key: 'mood', label: '心情', tone: 'mood' },
  { key: 'cleanliness', label: '清洁', tone: 'cleanliness' },
  { key: 'energy', label: '能量', tone: 'energy' },
  { key: 'intimacy', label: '亲密', tone: 'intimacy' },
];

/**
 * 展示宠物等级、经验和五项 MVP 状态。
 *
 * 前置条件：state 来自后端 API。后置条件：所有状态值以进度条和数字同步展示。
 * @throws 本组件不抛出异常。
 */
export function StatePanel({ state, isLoading }: StatePanelProps) {
  if (isLoading) {
    return (
      <section className="state-panel state-panel-loading" aria-label="Momo Pet state loading" />
    );
  }

  if (!state) {
    return (
      <section className="state-panel empty-state" aria-label="Momo Pet state">
        <strong>正在等待后端连接</strong>
        <span>启动后端后刷新页面，Momo Pet 会继续陪你。</span>
      </section>
    );
  }

  return (
    <section className="state-panel" aria-label="Momo Pet state">
      <div className="level-row">
        <span>Level {state.level}</span>
        <span>{state.experience} XP</span>
      </div>
      {STATUS_ITEMS.map((item) => (
        <label className={`state-row state-row-${item.tone}`} key={item.key}>
          <span>{item.label}</span>
          <span className="meter-track" aria-hidden="true">
            <span className="meter-fill" style={{ width: `${state[item.key]}%` }} />
          </span>
          <strong>{state[item.key]}</strong>
        </label>
      ))}
    </section>
  );
}
