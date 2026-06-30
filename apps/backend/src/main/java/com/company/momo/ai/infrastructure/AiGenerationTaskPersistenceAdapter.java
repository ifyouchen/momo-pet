package com.company.momo.ai.infrastructure;

import com.company.momo.ai.domain.AiGenerationTask;
import com.company.momo.ai.domain.AiGenerationTaskRepository;
import com.company.momo.ai.domain.AiTaskId;
import com.company.momo.ai.domain.AiTaskStatus;
import com.company.momo.pet.domain.PetId;
import com.company.momo.pet.domain.UserId;
import org.springframework.data.domain.PageRequest;
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
