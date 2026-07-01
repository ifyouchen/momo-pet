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

    /**
     * 按状态和类型分页查询任务。
     *
     * @param status 状态过滤，可空
     * @param taskType 类型过滤，可空
     * @param page 页码
     * @param size 每页大小
     * @return 任务分页
     */
    TaskPage findTasks(AiTaskStatus status, AiTaskType taskType, int page, int size);

    /**
     * 按状态统计任务数量。
     *
     * @param status 任务状态
     * @return 数量
     */
    long countByStatus(AiTaskStatus status);

    /**
     * 一次性聚合所有状态的任务数量，按状态分组返回结果列表。
     *
     * @return 状态到数量的领域结果列表
     */
    List<AiTaskStatusCount> countTasksGroupedByStatus();

    /**
     * 统计所有 AI 任务数量。
     *
     * @return 数量
     */
    long count();

    /**
     * 查询指定状态的最近任务，按更新时间倒序。
     *
     * @param status 任务状态
     * @param limit 最大任务数
     * @return 任务列表
     */
    List<AiGenerationTask> findRecentByStatus(AiTaskStatus status, int limit);

    /**
     * 任务分页结果，承载领域数据。
     *
     * @param items 任务聚合列表
     * @param total 总数
     * @param page 页码
     * @param size 每页大小
     */
    record TaskPage(List<AiGenerationTask> items, long total, int page, int size) {
    }
}
