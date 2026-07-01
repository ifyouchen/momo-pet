/**
 * EmptyState 通用入参：用于说明「为什么没有数据」和「下一步做什么」。
 */
interface EmptyStateProps {
  /** 空态主标题，简短描述当前列表/区域无内容。 */
  readonly title: string;
  /** 副描述，可空，用于提示用户如何补充数据或调整过滤。 */
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
