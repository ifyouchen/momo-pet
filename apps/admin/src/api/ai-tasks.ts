import { get } from './client';

export interface AiTaskSummary {
  readonly taskId: string;
  readonly petId: string;
  readonly taskType: string;
  readonly status: string;
  readonly errorCode: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AiTaskList {
  readonly items: ReadonlyArray<AiTaskSummary>;
  readonly total: number;
  readonly page: number;
  readonly size: number;
}

export interface AiTaskDetail {
  readonly taskId: string;
  readonly petId: string;
  readonly taskType: string;
  readonly status: string;
  readonly result: unknown;
  readonly errorCode: string | null;
}

export function listAiTasks(params: {
  status?: string;
  taskType?: string;
  page?: number;
  size?: number;
}) {
  return get<AiTaskList>('/api/ai/tasks', { params });
}

export function getAiTask(taskId: string) {
  return get<AiTaskDetail>(`/api/ai/tasks/${encodeURIComponent(taskId)}`);
}
