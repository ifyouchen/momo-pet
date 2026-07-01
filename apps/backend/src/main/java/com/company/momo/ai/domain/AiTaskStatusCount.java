package com.company.momo.ai.domain;

/**
 * 领域层任务状态聚合结果，承载某一种 AI 任务状态对应的任务数量。
 *
 * @param status 任务状态枚举
 * @param count  对应状态的任务数量
 */
public record AiTaskStatusCount(AiTaskStatus status, long count) {
}
