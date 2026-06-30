import type { ReactNode } from 'react';

export interface DataTableColumn<Row> {
  readonly key: string;
  readonly header: string;
  readonly render: (row: Row) => ReactNode;
  readonly width?: string;
}

interface DataTableProps<Row> {
  readonly columns: ReadonlyArray<DataTableColumn<Row>>;
  readonly rows: ReadonlyArray<Row>;
  readonly rowKey: (row: Row) => string;
  readonly onRowClick?: (row: Row) => void;
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
