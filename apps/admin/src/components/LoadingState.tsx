/**
 * LoadingState 通用入参：仅展示加载中文案。
 */
interface LoadingStateProps {
  /** 加载提示文案，默认 '加载中…'，建议在异步耗时较长时给出更具体的描述。 */
  readonly label?: string;
}

/**
 * 通用加载态。
 *
 * @param props 加载文案
 * @returns 加载态组件
 */
export function LoadingState({ label = '加载中…' }: LoadingStateProps) {
  return (
    <div className="state-block" role="status" aria-live="polite">
      <span>{label}</span>
    </div>
  );
}
