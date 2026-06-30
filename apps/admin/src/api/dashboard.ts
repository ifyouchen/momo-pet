import { get } from './client';
import type { AiTaskSummary } from './ai-tasks';

export interface AdminDashboard {
  readonly totalPets: number;
  readonly activePets: number;
  readonly totalAiTasks: number;
  readonly pendingAiTasks: number;
  readonly runningAiTasks: number;
  readonly succeededAiTasks: number;
  readonly failedAiTasks: number;
  readonly timeoutAiTasks: number;
  readonly recentFailures: ReadonlyArray<AiTaskSummary>;
  readonly recentTimeouts: ReadonlyArray<AiTaskSummary>;
}

export function getDashboardMetrics() {
  return get<AdminDashboard>('/api/admin/dashboard/metrics');
}
