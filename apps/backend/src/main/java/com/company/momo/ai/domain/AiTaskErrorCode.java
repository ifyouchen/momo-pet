package com.company.momo.ai.domain;

/**
 * ai 限界上下文任务失败原因，用于前端展示降级路径。
 */
public enum AiTaskErrorCode {
    /**
     * AI 生成失败。
     */
    AI_GENERATION_FAILED,

    /**
     * AI 生成超时。
     */
    AI_GENERATION_TIMEOUT,

    /**
     * AI 输出不符合 Pet DNA Schema。
     */
    AI_RESULT_INVALID
}
