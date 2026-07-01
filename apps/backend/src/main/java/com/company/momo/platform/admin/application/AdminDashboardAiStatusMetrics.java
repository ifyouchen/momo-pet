package com.company.momo.platform.admin.application;

/**
 * platform.admin Dashboard AI 任务状态统计结果。
 *
 * @param total 全部 AI 任务数量
 * @param pending PENDING 状态数量
 * @param running RUNNING 状态数量
 * @param succeeded SUCCEEDED 状态数量
 * @param failed FAILED 状态数量
 * @param timeout TIMEOUT 状态数量
 */
public record AdminDashboardAiStatusMetrics(
    long total,
    long pending,
    long running,
    long succeeded,
    long failed,
    long timeout
) {
}
