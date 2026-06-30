interface EmptyStateProps {
  readonly title: string;
  readonly description?: string;
}

/**
 * 通用空态。
 *
 * @param props 标题和描述
 * @returns 空态组件
 */
export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="state-block" role="status">
      <strong>{title}</strong>
      {description ? <span>{description}</span> : null}
    </div>
  );
}
