package com.company.momo.ai.infrastructure;

import com.company.momo.ai.domain.AiTaskStatus;
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
}
