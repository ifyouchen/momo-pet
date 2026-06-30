import { useNavigate } from 'react-router-dom';
import { Activity, Bot, Database, ListChecks } from 'lucide-react';
import { getDashboardMetrics, type AdminDashboard } from '../api/dashboard';
import type { AiTaskSummary } from '../api/ai-tasks';
import { DataTable, type DataTableColumn } from '../components/DataTable';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { useAsync } from '../hooks/use-async';

interface MetricCard {
  readonly key: keyof Pick<
    AdminDashboard,
    'totalPets' | 'activePets' | 'totalAiTasks' | 'failedAiTasks' | 'timeoutAiTasks'
  >;
  readonly label: string;
  readonly icon: typeof Bot;
}

const metricCards: ReadonlyArray<MetricCard> = [
  { key: 'totalPets', label: 'Pets', icon: Bot },
  { key: 'activePets', label: 'Active Pets', icon: ListChecks },
  { key: 'totalAiTasks', label: 'AI Tasks', icon: Database },
  { key: 'failedAiTasks', label: 'Failed Tasks', icon: Activity },
];

const failureColumns: ReadonlyArray<DataTableColumn<AiTaskSummary>> = [
  { key: 'taskId', header: 'Task ID', render: (row) => row.taskId },
  { key: 'petId', header: 'Pet ID', render: (row) => row.petId },
  { key: 'status', header: 'Status', render: (row) => row.status },
  { key: 'errorCode', header: 'Error Code', render: (row) => row.errorCode ?? '-' },
  { key: 'updatedAt', header: 'Updated At', render: (row) => row.updatedAt },
];

/**
 * Dashboard 页面，展示后台核心指标和最近失败任务。
 *
 * @returns Dashboard 页面
 */
export function DashboardPage() {
  const navigate = useNavigate();
  const { state, refetch } = useAsync({ fetcher: getDashboardMetrics });

  if (state.status === 'loading' || state.status === 'idle') {
    return (
      <>
        <PageHeader title="Dashboard" description="后台核心指标和最近失败任务" />
        <LoadingState />
      </>
    );
  }
  if (state.status === 'error') {
    return (
      <>
        <PageHeader
          title="Dashboard"
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
  const dashboard = state.data;
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="后台核心指标和最近失败任务"
        actions={
          <button type="button" onClick={refetch}>
            刷新
          </button>
        }
      />
      <section className="metrics" aria-label="MVP metrics">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <article className="metric-card" key={card.key}>
              <Icon size={20} aria-hidden="true" />
              <span>{card.label}</span>
              <strong>{dashboard[card.key]}</strong>
            </article>
          );
        })}
      </section>
      <section className="dashboard-section">
        <h2>最近失败任务</h2>
        <DataTable
          columns={failureColumns}
          rows={dashboard.recentFailures}
          rowKey={(row) => row.taskId}
          onRowClick={(row) => navigate(`/ai-tasks/${encodeURIComponent(row.taskId)}`)}
          emptyLabel="暂无失败任务"
        />
      </section>
      <section className="dashboard-section">
        <h2>最近超时任务</h2>
        <DataTable
          columns={failureColumns}
          rows={dashboard.recentTimeouts}
          rowKey={(row) => row.taskId}
          onRowClick={(row) => navigate(`/ai-tasks/${encodeURIComponent(row.taskId)}`)}
          emptyLabel="暂无超时任务"
        />
      </section>
    </>
  );
}
