package com.company.momo.ai.domain;

import java.util.List;
import java.util.Optional;

/**
 * ai 领域仓储接口，由基础设施层实现任务持久化。
 */
public interface AiGenerationTaskRepository {

    /**
     * 保存 AI 任务聚合。
     *
     * @param task AI 任务聚合
     */
    void save(AiGenerationTask task);

    /**
     * 按任务 ID 查询 AI 任务。
     *
     * @param taskId AI 任务 ID
     * @return AI 任务聚合
     */
    Optional<AiGenerationTask> findByTaskId(AiTaskId taskId);

    /**
     * 查询待执行任务。
     *
     * @param limit 最大任务数
     * @return 待执行任务列表
     */
    List<AiGenerationTask> findPendingTasks(int limit);
}
