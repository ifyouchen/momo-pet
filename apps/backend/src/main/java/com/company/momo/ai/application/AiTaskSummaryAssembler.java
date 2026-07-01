package com.company.momo.ai.application;

import com.company.momo.ai.domain.AiGenerationTask;

import java.util.List;

/**
 * ai 应用层转换器，将 AI 任务聚合转换为后台展示摘要结果。
 */
public final class AiTaskSummaryAssembler {

    private AiTaskSummaryAssembler() {
    }

    /**
     * 将单个 AI 任务聚合转换为后台摘要结果。
     *
     * @param task AI 任务聚合
     * @return 后台展示摘要结果
     */
    public static AiTaskSummaryResult toSummary(AiGenerationTask task) {
        return new AiTaskSummaryResult(
            task.id().value(),
            task.petId().value(),
            task.taskType().name(),
            task.status().name(),
            task.errorCode() == null ? null : task.errorCode().name(),
            task.createdAt(),
            task.updatedAt()
        );
    }

    /**
     * 批量转换 AI 任务聚合为后台摘要结果列表。
     *
     * @param tasks AI 任务聚合列表
     * @return 后台展示摘要结果列表
     */
    public static List<AiTaskSummaryResult> toSummaries(List<AiGenerationTask> tasks) {
        return tasks.stream().map(AiTaskSummaryAssembler::toSummary).toList();
    }
}
