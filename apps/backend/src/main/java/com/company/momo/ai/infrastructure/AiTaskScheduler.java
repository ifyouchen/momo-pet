package com.company.momo.ai.infrastructure;

import com.company.momo.ai.application.ExecuteAiTaskApplicationService;
import com.company.momo.ai.application.PetDnaAiGateway;
import com.company.momo.ai.domain.AiGenerationTask;
import com.company.momo.ai.domain.AiTaskErrorCode;
import com.company.momo.platform.domain.BusinessException;
import com.company.momo.platform.domain.ErrorCode;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * ai Infrastructure 层任务调度器，负责执行 Sprint 5 的异步 Pet DNA 任务。
 */
@Component
class AiTaskScheduler {

    private static final int BATCH_SIZE = 5;

    private final ExecuteAiTaskApplicationService executeAiTaskApplicationService;
    private final PetDnaAiGateway petDnaAiGateway;

    AiTaskScheduler(
        ExecuteAiTaskApplicationService executeAiTaskApplicationService,
        PetDnaAiGateway petDnaAiGateway
    ) {
        this.executeAiTaskApplicationService = executeAiTaskApplicationService;
        this.petDnaAiGateway = petDnaAiGateway;
    }

    /**
     * 定时执行待处理的 AI 任务。
     */
    @Scheduled(fixedDelay = 1500)
    void executePendingTasks() {
        executeAiTaskApplicationService.findPendingTasks(BATCH_SIZE).forEach(this::executeTask);
    }

    private void executeTask(AiGenerationTask pendingTask) {
        AiGenerationTask runningTask = executeAiTaskApplicationService.markRunning(pendingTask.id().value());
        try {
            String resultPayload = petDnaAiGateway.generatePetDnaDraft(runningTask.requestPayload());
            executeAiTaskApplicationService.markSucceeded(runningTask.id().value(), resultPayload);
        } catch (BusinessException exception) {
            executeAiTaskApplicationService.markFailed(runningTask.id().value(), toAiErrorCode(exception));
        } catch (RuntimeException exception) {
            executeAiTaskApplicationService.markFailed(runningTask.id().value(), AiTaskErrorCode.AI_GENERATION_FAILED);
        }
    }

    private AiTaskErrorCode toAiErrorCode(BusinessException exception) {
        if (exception.errorCode() == ErrorCode.AI_RESULT_INVALID) {
            return AiTaskErrorCode.AI_RESULT_INVALID;
        }
        return AiTaskErrorCode.AI_GENERATION_FAILED;
    }
}
