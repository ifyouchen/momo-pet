package com.company.momo.ai.application;

import com.company.momo.ai.domain.AiGenerationTask;
import com.fasterxml.jackson.databind.JsonNode;

/**
 * ai Application 层任务详情结果。
 *
 * @param taskId AI 任务 ID
 * @param petId 宠物 ID
 * @param taskType 任务类型
 * @param status 任务状态
 * @param result 任务成功结果
 * @param errorCode 任务失败错误码
 */
public record AiTaskDetailResult(
    String taskId,
    String petId,
    String taskType,
    String status,
    JsonNode result,
    String errorCode
) {

    /**
     * 从 AI 任务聚合转换详情结果。
     *
     * @param task AI 任务聚合
     * @param result 解析后的结果 JSON
     * @return 任务详情结果
     */
    public static AiTaskDetailResult from(AiGenerationTask task, JsonNode result) {
        return new AiTaskDetailResult(
            task.id().value(),
            task.petId().value(),
            task.taskType().name(),
            task.status().name(),
            result,
            task.errorCode() == null ? null : task.errorCode().name()
        );
    }
}
