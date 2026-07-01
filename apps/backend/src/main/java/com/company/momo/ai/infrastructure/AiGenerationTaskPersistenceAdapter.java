package com.company.momo.ai.infrastructure;

import com.company.momo.ai.domain.AiGenerationTask;
import com.company.momo.ai.domain.AiGenerationTaskRepository;
import com.company.momo.ai.domain.AiTaskId;
import com.company.momo.ai.domain.AiTaskStatus;
import com.company.momo.ai.domain.AiTaskStatusCount;
import com.company.momo.ai.domain.AiTaskType;
import com.company.momo.pet.domain.PetId;
import com.company.momo.pet.domain.UserId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * ai Infrastructure 仓储适配器，负责 AI 任务 Domain 与 JPA 对象转换。
 */
@Repository
class AiGenerationTaskPersistenceAdapter implements AiGenerationTaskRepository {

    private final AiGenerationTaskJpaRepository aiGenerationTaskJpaRepository;

    AiGenerationTaskPersistenceAdapter(AiGenerationTaskJpaRepository aiGenerationTaskJpaRepository) {
        this.aiGenerationTaskJpaRepository = aiGenerationTaskJpaRepository;
    }

    /**
     * 保存 AI 任务聚合。
     *
     * @param task AI 任务聚合
     */
    @Override
    public void save(AiGenerationTask task) {
        aiGenerationTaskJpaRepository.save(toEntity(task));
    }

    /**
     * 按任务 ID 查询 AI 任务。
     *
     * @param taskId AI 任务 ID
     * @return AI 任务聚合
     */
    @Override
    public Optional<AiGenerationTask> findByTaskId(AiTaskId taskId) {
        return aiGenerationTaskJpaRepository.findById(taskId.value()).map(this::toDomain);
    }

    /**
     * 查询待执行任务。
     *
     * @param limit 最大任务数
     * @return 待执行任务列表
     */
    @Override
    public List<AiGenerationTask> findPendingTasks(int limit) {
        return aiGenerationTaskJpaRepository
            .findByStatusOrderByCreatedAtAsc(AiTaskStatus.PENDING, PageRequest.of(0, limit))
            .stream()
            .map(this::toDomain)
            .toList();
    }

    /**
     * 按状态和类型分页查询任务。
     *
     * @param status 状态过滤，可空
     * @param taskType 类型过滤，可空
     * @param page 页码
     * @param size 每页大小
     * @return 任务分页
     */
    @Override
    public TaskPage findTasks(AiTaskStatus status, AiTaskType taskType, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<AiGenerationTaskJpaEntity> result;
        if (status != null && taskType != null) {
            result = aiGenerationTaskJpaRepository.findByStatusAndTaskType(status, taskType, pageable);
        } else if (status != null) {
            result = aiGenerationTaskJpaRepository.findByStatus(status, pageable);
        } else if (taskType != null) {
            result = aiGenerationTaskJpaRepository.findByTaskType(taskType, pageable);
        } else {
            result = aiGenerationTaskJpaRepository.findAll(pageable);
        }
        List<AiGenerationTask> items = result.getContent().stream().map(this::toDomain).toList();
        return new TaskPage(items, result.getTotalElements(), page, size);
    }

    /**
     * 按状态统计任务数量。
     *
     * @param status 任务状态
     * @return 数量
     */
    @Override
    public long countByStatus(AiTaskStatus status) {
        return aiGenerationTaskJpaRepository.countByStatus(status);
    }

    /**
     * 一次性聚合所有状态的任务数量。
     *
     * @return 状态到数量的领域结果列表
     */
    @Override
    public List<AiTaskStatusCount> countTasksGroupedByStatus() {
        return aiGenerationTaskJpaRepository.countTasksGroupedByStatus()
            .stream()
            .map(row -> new AiTaskStatusCount(row.getStatus(), row.getCount()))
            .toList();
    }

    /**
     * 统计所有 AI 任务数量。
     *
     * @return 数量
     */
    @Override
    public long count() {
        return aiGenerationTaskJpaRepository.count();
    }

    /**
     * 查询指定状态的最近任务，按更新时间倒序。
     *
     * @param status 任务状态
     * @param limit 最大任务数
     * @return 任务列表
     */
    @Override
    public List<AiGenerationTask> findRecentByStatus(AiTaskStatus status, int limit) {
        return aiGenerationTaskJpaRepository
            .findByStatusOrderByUpdatedAtDesc(status, PageRequest.of(0, limit))
            .stream()
            .map(this::toDomain)
            .toList();
    }

    private AiGenerationTask toDomain(AiGenerationTaskJpaEntity entity) {
        return AiGenerationTask.restore(
            AiTaskId.of(entity.id()),
            PetId.of(entity.petId()),
            new UserId(entity.ownerId()),
            entity.taskType(),
            entity.status(),
            entity.requestPayload(),
            entity.resultPayload(),
            entity.errorCode(),
            entity.createdAt(),
            entity.updatedAt()
        );
    }

    private AiGenerationTaskJpaEntity toEntity(AiGenerationTask task) {
        return new AiGenerationTaskJpaEntity(
            task.id().value(),
            task.petId().value(),
            task.ownerId().value(),
            task.taskType(),
            task.status(),
            task.requestPayload(),
            task.resultPayload(),
            task.errorCode(),
            task.createdAt(),
            task.updatedAt()
        );
    }
}
