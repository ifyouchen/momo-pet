import { useParams } from 'react-router-dom';
import { getAiTask, type AiTaskDetail } from '../api/ai-tasks';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { useAsync } from '../hooks/use-async';

/**
 * AI Task 详情页面，展示输入摘要、输出结果、错误码。
 *
 * @returns AI Task 详情页面
 */
export function AiTaskDetailPage() {
  const { taskId = '' } = useParams<{ taskId: string }>();
  const { state, refetch } = useAsync({
    fetcher: (signal) => getAiTask(taskId, { signal }),
    deps: [taskId],
  });

  if (state.status === 'loading' || state.status === 'idle') {
    return (
      <>
        <PageHeader title="AI Task" />
        <LoadingState />
      </>
    );
  }
  if (state.status === 'error') {
    return (
      <>
        <PageHeader
          title="AI Task"
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
  const task: AiTaskDetail = state.data;
  return (
    <>
      <PageHeader
        title={`AI Task · ${task.taskId}`}
        description={`${task.taskType} · ${task.status}`}
        actions={
          <button type="button" onClick={() => window.history.back()}>
            返回
          </button>
        }
      />
      <div className="detail-grid">
        <article className="detail-card">
          <h3>基础信息</h3>
          <dl>
            <dt>Task ID</dt>
            <dd>{task.taskId}</dd>
            <dt>Pet ID</dt>
            <dd>{task.petId}</dd>
            <dt>Type</dt>
            <dd>{task.taskType}</dd>
            <dt>Status</dt>
            <dd>{task.status}</dd>
            <dt>Error Code</dt>
            <dd>{task.errorCode ?? '-'}</dd>
          </dl>
        </article>
        <article className="detail-card">
          <h3>输出结果</h3>
          {task.result ? (
            <pre className="json-block">{JSON.stringify(task.result, null, 2)}</pre>
          ) : (
            <span>暂无结果</span>
          )}
        </article>
      </div>
    </>
  );
}
