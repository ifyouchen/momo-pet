package com.company.momo.ai.infrastructure;

import com.company.momo.ai.domain.AiTaskErrorCode;
import com.company.momo.ai.domain.AiTaskStatus;
import com.company.momo.ai.domain.AiTaskType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * ai Infrastructure 层 JPA 实体，保存异步 AI 任务。
 */
@Entity
@Table(name = "ai_generation_task")
class AiGenerationTaskJpaEntity {

    @Id
    @Column(name = "task_id", nullable = false, length = 64)
    private String id;

    @Column(name = "pet_id", nullable = false, length = 64)
    private String petId;

    @Column(name = "owner_id", nullable = false, length = 64)
    private String ownerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "task_type", nullable = false, length = 64)
    private AiTaskType taskType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private AiTaskStatus status;

    @Lob
    @Column(name = "request_payload", nullable = false)
    private String requestPayload;

    @Lob
    @Column(name = "result_payload")
    private String resultPayload;

    @Enumerated(EnumType.STRING)
    @Column(name = "error_code", length = 64)
    private AiTaskErrorCode errorCode;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected AiGenerationTaskJpaEntity() {
    }

    AiGenerationTaskJpaEntity(
        String id,
        String petId,
        String ownerId,
        AiTaskType taskType,
        AiTaskStatus status,
        String requestPayload,
        String resultPayload,
        AiTaskErrorCode errorCode,
        Instant createdAt,
        Instant updatedAt
    ) {
        this.id = id;
        this.petId = petId;
        this.ownerId = ownerId;
        this.taskType = taskType;
        this.status = status;
        this.requestPayload = requestPayload;
        this.resultPayload = resultPayload;
        this.errorCode = errorCode;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    String id() {
        return id;
    }

    String petId() {
        return petId;
    }

    String ownerId() {
        return ownerId;
    }

    AiTaskType taskType() {
        return taskType;
    }

    AiTaskStatus status() {
        return status;
    }

    String requestPayload() {
        return requestPayload;
    }

    String resultPayload() {
        return resultPayload;
    }

    AiTaskErrorCode errorCode() {
        return errorCode;
    }

    Instant createdAt() {
        return createdAt;
    }

    Instant updatedAt() {
        return updatedAt;
    }
}
