import type { ReactNode } from 'react';

/**
 * DataTable 单列定义：描述列标题、单元格渲染逻辑与可选的列宽。
 */
export interface DataTableColumn<Row> {
  /** 列的唯一标识，参与 React key，不应随展示文案变化。 */
  readonly key: string;
  /** 表头文案，鼠标悬浮提示可后续扩展 title。 */
  readonly header: string;
  /** 当前行渲染函数，建议保持纯函数以避免每次重渲染。 */
  readonly render: (row: Row) => ReactNode;
  /** 列宽，如 '120px' 或 '20%'；不传则按内容自适应。 */
  readonly width?: string;
}

/**
 * DataTable 通用入参：列定义、行数据、行键提取与可选的点击交互。
 */
interface DataTableProps<Row> {
  /** 表格列定义，按显示顺序传入，至少需要 1 列。 */
  readonly columns: ReadonlyArray<DataTableColumn<Row>>;
  /** 表格行数据，组件不持有内部分页与排序状态。 */
  readonly rows: ReadonlyArray<Row>;
  /** 提取行稳定唯一键的函数，用于 React key，不应返回空字符串。 */
  readonly rowKey: (row: Row) => string;
  /** 单击行时回调，传入后整行变为可点击视觉。 */
  readonly onRowClick?: (row: Row) => void;
  /** 数据为空时展示的占位文案，默认 '暂无数据'。 */
  readonly emptyLabel?: string;
}

/**
 * 通用数据表格。
 *
 * @param props 表格列、行、点击行为
 * @returns 表格组件
 */
export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  onRowClick,
  emptyLabel = '暂无数据',
}: DataTableProps<Row>) {
  if (rows.length === 0) {
    return <div className="state-block">{emptyLabel}</div>;
  }
  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} style={column.width ? { width: column.width } : undefined}>
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={rowKey(row)}
            className={onRowClick ? 'data-table-row-clickable' : undefined}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
          >
            {columns.map((column) => (
              <td key={column.key}>{column.render(row)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
