package com.company.momo.ai.infrastructure;

import com.company.momo.ai.domain.AiTaskStatus;
import com.company.momo.ai.domain.AiTaskType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

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
}
