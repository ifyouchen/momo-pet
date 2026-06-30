package com.company.momo.ai.interfaces;

import com.company.momo.ai.application.AiTaskSummaryResult;

import java.time.Instant;

/**
 * ai Interface 层任务摘要响应，供列表使用。
 */
public record AiTaskSummaryResponse(
    String taskId,
    String petId,
    String taskType,
    String status,
    String errorCode,
    Instant createdAt,
    Instant updatedAt
) {

    /**
     * 从应用层结果转换为接口响应。
     *
     * @param result 应用层结果
     * @return 接口响应
     */
    public static AiTaskSummaryResponse from(AiTaskSummaryResult result) {
        return new AiTaskSummaryResponse(
            result.taskId(),
            result.petId(),
            result.taskType(),
            result.status(),
            result.errorCode(),
            result.createdAt(),
            result.updatedAt()
        );
    }
}
