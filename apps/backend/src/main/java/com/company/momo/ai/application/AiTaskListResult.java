package com.company.momo.ai.application;

import java.util.List;

/**
 * ai 应用层任务列表分页结果。
 *
 * @param items 当前页任务
 * @param total 总数
 * @param page 当前页
 * @param size 每页大小
 */
public record AiTaskListResult(List<AiTaskSummaryResult> items, long total, int page, int size) {
}
