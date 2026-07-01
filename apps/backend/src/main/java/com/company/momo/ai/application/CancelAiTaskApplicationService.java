package com.company.momo.ai.application;

import com.company.momo.ai.domain.AiGenerationTask;
import com.company.momo.ai.domain.AiGenerationTaskRepository;
import com.company.momo.ai.domain.AiTaskId;
import com.company.momo.platform.domain.BusinessException;
import com.company.momo.platform.domain.ErrorCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * ai 应用服务，负责取消 AI 任务。
 */
@Service
public class CancelAiTaskApplicationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(CancelAiTaskApplicationService.class);

    private final AiGenerationTaskRepository aiGenerationTaskRepository;

    public CancelAiTaskApplicationService(AiGenerationTaskRepository aiGenerationTaskRepository) {
        this.aiGenerationTaskRepository = aiGenerationTaskRepository;
    }

    /**
     * 取消 AI 任务。仅 PENDING 和 RUNNING 状态可取消。
     *
     * @param taskIdValue AI 任务 ID
     * @return 取消后的任务详情
     */
    @Transactional
    public AiTaskDetailResult cancel(String taskIdValue) {
        AiGenerationTask task = aiGenerationTaskRepository.findByTaskId(AiTaskId.of(taskIdValue))
            .orElseThrow(() -> new BusinessException(ErrorCode.AI_TASK_NOT_FOUND));
        AiGenerationTask canceledTask = task.cancel();
        aiGenerationTaskRepository.save(canceledTask);
        LOGGER.info("【AI任务取消】【taskId={} petId={}】【fromStatus={} toStatus=CANCELED】",
            canceledTask.id().value(), canceledTask.petId().value(), task.status().name());
        return AiTaskDetailResult.from(canceledTask, null);
    }
}
