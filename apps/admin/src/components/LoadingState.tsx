interface LoadingStateProps {
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
