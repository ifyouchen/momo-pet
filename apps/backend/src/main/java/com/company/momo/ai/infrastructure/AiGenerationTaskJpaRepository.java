package com.company.momo.ai.infrastructure;

import com.company.momo.ai.domain.AiTaskStatus;
import com.company.momo.ai.domain.AiTaskType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;

/**
 * ai Infrastructure 层 Spring Data 仓储，仅供持久化适配器使用。
 */
interface AiGenerationTaskJpaRepository extends JpaRepository<AiGenerationTaskJpaEntity, String> {

    /**
     * 按任务状态和创建时间查询任务。
     *
     * @param status 任务状态
     * @param pageable 分页限制
     * @return 任务实体列表
     */
    List<AiGenerationTaskJpaEntity> findByStatusOrderByCreatedAtAsc(AiTaskStatus status, Pageable pageable);

    /**
     * 按任务状态和更新时间倒序查询，用于后台展示最近失败或超时任务。
     *
     * @param status 任务状态
     * @param pageable 分页限制
     * @return 任务实体列表
     */
    List<AiGenerationTaskJpaEntity> findByStatusOrderByUpdatedAtDesc(AiTaskStatus status, Pageable pageable);

    /**
     * 按任务状态分页查询。
     *
     * @param status 任务状态
     * @param pageable 分页
     * @return 任务分页结果
     */
    Page<AiGenerationTaskJpaEntity> findByStatus(AiTaskStatus status, Pageable pageable);

    /**
     * 按任务类型分页查询。
     *
     * @param taskType 任务类型
     * @param pageable 分页
     * @return 任务分页结果
     */
    Page<AiGenerationTaskJpaEntity> findByTaskType(AiTaskType taskType, Pageable pageable);

    /**
     * 按任务状态和类型分页查询。
     *
     * @param status 任务状态
     * @param taskType 任务类型
     * @param pageable 分页
     * @return 任务分页结果
     */
    Page<AiGenerationTaskJpaEntity> findByStatusAndTaskType(AiTaskStatus status, AiTaskType taskType, Pageable pageable);

    /**
     * 按任务状态统计。
     *
     * @param status 任务状态
     * @return 数量
     */
    long countByStatus(AiTaskStatus status);

    /**
     * 批量按任务状态统计。
     *
     * @param statuses 任务状态集合
     * @return 数量
     */
    long countByStatusIn(Collection<AiTaskStatus> statuses);

    /**
     * 一次性聚合所有状态的任务数量，供 Dashboard 指标使用。
     *
     * @return 状态枚举到数量的投影列表
     */
    @Query("select t.status as status, count(t) as count from AiGenerationTaskJpaEntity t group by t.status")
    List<AiTaskStatusCountProjection> countTasksGroupedByStatus();
}
