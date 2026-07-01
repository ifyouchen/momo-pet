import type { ReactNode } from 'react';

/**
 * PageHeader 通用入参：标题、副标题与右上角操作区。
 */
interface PageHeaderProps {
  /** 主标题，渲染为 h1，建议在 16 字以内。 */
  readonly title: string;
  /** 副标题，可空，常用于显示查询摘要（如总条数、过滤状态）。 */
  readonly description?: string;
  /** 右上角操作区，通常是按钮或下拉菜单的组合。 */
  readonly actions?: ReactNode;
}

/**
 * 通用页面标题和操作区。
 *
 * @param props 标题、描述和操作按钮
 * @returns 页面标题组件
 */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </header>
  );
}
