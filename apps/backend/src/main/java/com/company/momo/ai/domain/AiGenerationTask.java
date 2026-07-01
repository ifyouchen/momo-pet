package com.company.momo.ai.domain;

import com.company.momo.pet.domain.PetId;
import com.company.momo.pet.domain.UserId;
import com.company.momo.platform.domain.BusinessException;
import com.company.momo.platform.domain.ErrorCode;

import java.time.Instant;

/**
 * ai 聚合根，封装 AI 任务请求、状态流转和结果。
 */
public final class AiGenerationTask {

    private final AiTaskId id;
    private final PetId petId;
    private final UserId ownerId;
    private final AiTaskType taskType;
    private final AiTaskStatus status;
    private final String requestPayload;
    private final String resultPayload;
    private final AiTaskErrorCode errorCode;
    private final Instant createdAt;
    private final Instant updatedAt;

    private AiGenerationTask(
        AiTaskId id,
        PetId petId,
        UserId ownerId,
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

    /**
     * 创建待执行的 Pet DNA 生成任务。
     *
     * @param petId 宠物 ID
     * @param ownerId 用户 ID
     * @param requestPayload 结构化请求 JSON
     * @return AI 任务聚合
     */
    public static AiGenerationTask createPetDnaTask(PetId petId, UserId ownerId, String requestPayload) {
        Instant now = Instant.now();
        return new AiGenerationTask(
            AiTaskId.newId(),
            petId,
            ownerId,
            AiTaskType.PET_DNA_GENERATION,
            AiTaskStatus.PENDING,
            requestPayload,
            null,
            null,
            now,
            now
        );
    }

    /**
     * 从持久化对象恢复 AI 任务聚合。
     *
     * @return AI 任务聚合
     */
    public static AiGenerationTask restore(
        AiTaskId id,
        PetId petId,
        UserId ownerId,
        AiTaskType taskType,
        AiTaskStatus status,
        String requestPayload,
        String resultPayload,
        AiTaskErrorCode errorCode,
        Instant createdAt,
        Instant updatedAt
    ) {
        return new AiGenerationTask(id, petId, ownerId, taskType, status, requestPayload, resultPayload, errorCode, createdAt, updatedAt);
    }

    /**
     * 标记任务开始运行。
     *
     * @return 运行中的任务
     */
    public AiGenerationTask markRunning() {
        ensureStatus(AiTaskStatus.PENDING);
        return copy(AiTaskStatus.RUNNING, resultPayload, errorCode);
    }

    /**
     * 标记任务执行成功并保存结果。
     *
     * @param resultPayload Pet DNA 草稿 JSON
     * @return 成功任务
     */
    public AiGenerationTask markSucceeded(String resultPayload) {
        ensureStatus(AiTaskStatus.RUNNING);
        return copy(AiTaskStatus.SUCCEEDED, resultPayload, null);
    }

    /**
     * 标记任务执行失败。
     *
     * @param errorCode 失败错误码
     * @return 失败任务
     */
    public AiGenerationTask markFailed(AiTaskErrorCode errorCode) {
        ensureStatus(AiTaskStatus.RUNNING);
        return copy(AiTaskStatus.FAILED, null, errorCode);
    }

    /**
     * 取消任务。仅 PENDING 和 RUNNING 状态可取消。
     *
     * @return 已取消任务
     * @throws BusinessException 当任务不在可取消状态时抛出 AI_TASK_NOT_CANCELABLE
     */
    public AiGenerationTask cancel() {
        if (status != AiTaskStatus.PENDING && status != AiTaskStatus.RUNNING) {
            throw new BusinessException(ErrorCode.AI_TASK_NOT_CANCELABLE);
        }
        return copy(AiTaskStatus.CANCELED, null, null);
    }

    public AiTaskId id() {
        return id;
    }

    public PetId petId() {
        return petId;
    }

    public UserId ownerId() {
        return ownerId;
    }

    public AiTaskType taskType() {
        return taskType;
    }

    public AiTaskStatus status() {
        return status;
    }

    public String requestPayload() {
        return requestPayload;
    }

    public String resultPayload() {
        return resultPayload;
    }

    public AiTaskErrorCode errorCode() {
        return errorCode;
    }

    public Instant createdAt() {
        return createdAt;
    }

    public Instant updatedAt() {
        return updatedAt;
    }

    private void ensureStatus(AiTaskStatus expectedStatus) {
        if (status != expectedStatus) {
            throw new BusinessException(ErrorCode.CARE_ACTION_NOT_ALLOWED);
        }
    }

    private AiGenerationTask copy(AiTaskStatus nextStatus, String nextResultPayload, AiTaskErrorCode nextErrorCode) {
        return new AiGenerationTask(
            id,
            petId,
            ownerId,
            taskType,
            nextStatus,
            requestPayload,
            nextResultPayload,
            nextErrorCode,
            createdAt,
            Instant.now()
        );
    }
}
