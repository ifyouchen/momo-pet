package com.company.momo.platform.admin.application;

import com.company.momo.ai.application.AiTaskSummaryResult;

import java.util.List;

/**
 * platform.admin Dashboard 聚合结果。
 *
 * @param totalPets 宠物总数
 * @param activePets 活跃宠物数
 * @param totalAiTasks AI 任务总数
 * @param pendingAiTasks PENDING 任务数
 * @param runningAiTasks RUNNING 任务数
 * @param succeededAiTasks SUCCEEDED 任务数
 * @param failedAiTasks FAILED 任务数
 * @param timeoutAiTasks TIMEOUT 任务数
 * @param recentFailures 最近 FAILED 任务
 * @param recentTimeouts 最近 TIMEOUT 任务
 */
public record AdminDashboardResult(
    long totalPets,
    long activePets,
    long totalAiTasks,
    long pendingAiTasks,
    long runningAiTasks,
    long succeededAiTasks,
    long failedAiTasks,
    long timeoutAiTasks,
    List<AiTaskSummaryResult> recentFailures,
    List<AiTaskSummaryResult> recentTimeouts
) {
}
