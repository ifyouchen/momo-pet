package com.company.momo.ai.application;

import java.time.Instant;

/**
 * ai 应用层任务摘要结果，供后台列表使用。
 */
public record AiTaskSummaryResult(
    String taskId,
    String petId,
    String taskType,
    String status,
    String errorCode,
    Instant createdAt,
    Instant updatedAt
) {
}
