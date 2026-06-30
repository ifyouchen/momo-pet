import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listAiTasks, type AiTaskSummary } from '../api/ai-tasks';
import { DataTable, type DataTableColumn } from '../components/DataTable';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { useAsync } from '../hooks/use-async';

const columns: ReadonlyArray<DataTableColumn<AiTaskSummary>> = [
  { key: 'taskId', header: 'Task ID', render: (row) => row.taskId },
  { key: 'petId', header: 'Pet ID', render: (row) => row.petId },
  { key: 'taskType', header: 'Type', render: (row) => row.taskType },
  { key: 'status', header: 'Status', render: (row) => row.status },
  { key: 'errorCode', header: 'Error Code', render: (row) => row.errorCode ?? '-' },
  { key: 'createdAt', header: 'Created At', render: (row) => row.createdAt },
];

/**
 * AI Tasks 列表页面，支持 status 和 taskType 过滤。
 *
 * @returns AI Tasks 列表页面
 */
export function AiTasksListPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [taskType, setTaskType] = useState('');
  const [page, setPage] = useState(0);
  const { state, refetch } = useAsync({
    fetcher: () => listAiTasks({ status, taskType, page, size: 20 }),
    deps: [status, taskType, page],
  });

  if (state.status === 'loading' || state.status === 'idle') {
    return (
      <>
        <PageHeader title="AI Tasks" description="分页查询所有 AI 任务" />
        <LoadingState />
      </>
    );
  }
  if (state.status === 'error') {
    return (
      <>
        <PageHeader
          title="AI Tasks"
          actions={
            <button type="button" onClick={refetch}>
              重试
            </button>
          }
        />
        <ErrorState message={state.error} />
      </>
    );
  }
  const list = state.data;
  const totalPages = Math.max(1, Math.ceil(list.total / list.size));
  return (
    <>
      <PageHeader title="AI Tasks" description={`共 ${list.total} 个任务`} />
      <div className="filter-bar" aria-label="AI Tasks 过滤">
        <label>
          状态
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(0);
            }}
          >
            <option value="">全部</option>
            <option value="PENDING">PENDING</option>
            <option value="RUNNING">RUNNING</option>
            <option value="SUCCEEDED">SUCCEEDED</option>
            <option value="FAILED">FAILED</option>
            <option value="TIMEOUT">TIMEOUT</option>
          </select>
        </label>
        <label>
          类型
          <select
            value={taskType}
            onChange={(event) => {
              setTaskType(event.target.value);
              setPage(0);
            }}
          >
            <option value="">全部</option>
            <option value="PET_DNA_GENERATION">PET_DNA_GENERATION</option>
          </select>
        </label>
      </div>
      <DataTable
        columns={columns}
        rows={list.items}
        rowKey={(row) => row.taskId}
        onRowClick={(row) => navigate(`/ai-tasks/${encodeURIComponent(row.taskId)}`)}
      />
      <div className="pager" aria-label="AI Tasks 分页">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => setPage((value) => Math.max(0, value - 1))}
        >
          上一页
        </button>
        <span>
          第 {page + 1} / {totalPages} 页
        </span>
        <button
          type="button"
          disabled={page + 1 >= totalPages}
          onClick={() => setPage((value) => value + 1)}
        >
          下一页
        </button>
      </div>
    </>
  );
}
