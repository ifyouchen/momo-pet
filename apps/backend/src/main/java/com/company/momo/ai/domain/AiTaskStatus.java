package com.company.momo.ai.domain;

/**
 * ai 限界上下文任务状态，驱动前端轮询和失败降级。
 */
public enum AiTaskStatus {
    /**
     * 等待执行。
     */
    PENDING,

    /**
     * 正在执行。
     */
    RUNNING,

    /**
     * 执行成功。
     */
    SUCCEEDED,

    /**
     * 执行失败。
     */
    FAILED,

    /**
     * 执行超时。
     */
    TIMEOUT
}
