/**
 * ErrorState 通用入参：用于向用户解释错误并提示下一步。
 */
interface ErrorStateProps {
  /** 错误标题，默认 '出错了'，用于概括错误类别（如网络异常 / 权限不足）。 */
  readonly title?: string;
  /** 错误消息，建议是已面向用户的中文文案而非堆栈。 */
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
