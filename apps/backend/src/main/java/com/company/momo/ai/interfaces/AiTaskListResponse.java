package com.company.momo.ai.interfaces;

import com.company.momo.ai.application.AiTaskListResult;
import com.company.momo.ai.application.AiTaskSummaryResult;

import java.util.List;

/**
 * ai Interface 层任务列表响应。
 */
public record AiTaskListResponse(List<AiTaskSummaryResponse> items, long total, int page, int size) {

    /**
     * 从应用层结果转换为接口响应。
     *
     * @param result 应用层结果
     * @return 接口响应
     */
    public static AiTaskListResponse from(AiTaskListResult result) {
        List<AiTaskSummaryResponse> items = result.items().stream().map(AiTaskSummaryResponse::from).toList();
        return new AiTaskListResponse(items, result.total(), result.page(), result.size());
    }
}
