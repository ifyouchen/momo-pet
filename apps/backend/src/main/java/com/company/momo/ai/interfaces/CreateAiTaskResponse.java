package com.company.momo.ai.interfaces;

import com.company.momo.ai.application.CreateAiTaskResult;

/**
 * ai Interface 层创建任务响应。
 *
 * @param taskId AI 任务 ID
 * @param status 当前任务状态
 */
public record CreateAiTaskResponse(String taskId, String status) {

    /**
     * 从应用层结果转换接口响应。
     *
     * @param result 创建任务结果
     * @return 创建任务响应
     */
    public static CreateAiTaskResponse from(CreateAiTaskResult result) {
        return new CreateAiTaskResponse(result.taskId(), result.status());
    }
}
