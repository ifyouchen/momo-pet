package com.company.momo.platform.admin.interfaces;

import com.company.momo.ai.application.AiTaskSummaryResult;
import com.company.momo.platform.admin.application.AdminDashboardResult;

import java.util.List;

/**
 * platform.admin Interface 层 Dashboard 响应。
 */
public record AdminDashboardResponse(
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

    /**
     * 从应用层结果转换为接口响应。
     *
     * @param result 应用层结果
     * @return 接口响应
     */
    public static AdminDashboardResponse from(AdminDashboardResult result) {
        return new AdminDashboardResponse(
            result.totalPets(),
            result.activePets(),
            result.totalAiTasks(),
            result.pendingAiTasks(),
            result.runningAiTasks(),
            result.succeededAiTasks(),
            result.failedAiTasks(),
            result.timeoutAiTasks(),
            result.recentFailures(),
            result.recentTimeouts()
        );
    }
}
