package com.company.momo.ai.interfaces;

import com.company.momo.ai.application.AiTaskDetailResult;
import com.fasterxml.jackson.databind.JsonNode;

/**
 * ai Interface 层任务详情响应。
 *
 * @param taskId AI 任务 ID
 * @param petId 宠物 ID
 * @param taskType 任务类型
 * @param status 任务状态
 * @param result 成功结果
 * @param errorCode 失败错误码
 */
public record AiTaskResponse(
    String taskId,
    String petId,
    String taskType,
    String status,
    JsonNode result,
    String errorCode
) {

    /**
     * 从应用层结果转换接口响应。
     *
     * @param result 任务详情结果
     * @return 任务详情响应
     */
    public static AiTaskResponse from(AiTaskDetailResult result) {
        return new AiTaskResponse(
            result.taskId(),
            result.petId(),
            result.taskType(),
            result.status(),
            result.result(),
            result.errorCode()
        );
    }
}
