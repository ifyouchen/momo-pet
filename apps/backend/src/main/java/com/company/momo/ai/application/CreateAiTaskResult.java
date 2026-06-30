package com.company.momo.ai.application;

import com.company.momo.ai.domain.AiGenerationTask;

/**
 * ai Application 层任务创建结果。
 *
 * @param taskId AI 任务 ID
 * @param status 当前状态
 */
public record CreateAiTaskResult(String taskId, String status) {

    /**
     * 从 AI 任务聚合转换创建结果。
     *
     * @param task AI 任务聚合
     * @return 创建结果
     */
    public static CreateAiTaskResult from(AiGenerationTask task) {
        return new CreateAiTaskResult(task.id().value(), task.status().name());
    }
}
