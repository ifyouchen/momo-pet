interface ErrorStateProps {
  readonly title?: string;
  readonly message: string;
}

/**
 * 通用错误态。
 *
 * @param props 标题和错误消息
 * @returns 错误态组件
 */
export function ErrorState({ title = '出错了', message }: ErrorStateProps) {
  return (
    <div className="state-block state-block-error" role="alert">
      <strong>{title}</strong>
      <span>{message}</span>
    </div>
  );
}
