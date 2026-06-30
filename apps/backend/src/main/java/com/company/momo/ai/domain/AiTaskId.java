package com.company.momo.ai.domain;

import com.company.momo.platform.domain.BusinessException;
import com.company.momo.platform.domain.ErrorCode;

import java.util.UUID;

/**
 * ai 限界上下文任务 ID 值对象。
 *
 * @param value AI 任务唯一标识
 */
public record AiTaskId(String value) {

    /**
     * 创建新的 AI 任务 ID。
     *
     * @return AI 任务 ID
     */
    public static AiTaskId newId() {
        return new AiTaskId("task_" + UUID.randomUUID());
    }

    /**
     * 从接口字符串恢复 AI 任务 ID。
     *
     * @param value AI 任务 ID 字符串
     * @return AI 任务 ID
     */
    public static AiTaskId of(String value) {
        return new AiTaskId(value);
    }

    public AiTaskId {
        if (value == null || value.isBlank()) {
            throw new BusinessException(ErrorCode.AI_TASK_NOT_FOUND);
        }
    }
}
