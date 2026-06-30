package com.company.momo.ai.application;

import com.company.momo.ai.domain.AiGenerationTask;
import com.company.momo.ai.domain.AiGenerationTaskRepository;
import com.company.momo.ai.domain.AiTaskErrorCode;
import com.company.momo.ai.domain.AiTaskId;
import com.company.momo.platform.domain.BusinessException;
import com.company.momo.platform.domain.ErrorCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * ai 应用服务，提供任务执行器需要的状态读写操作。
 */
@Service
public class ExecuteAiTaskApplicationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ExecuteAiTaskApplicationService.class);

    private final AiGenerationTaskRepository aiGenerationTaskRepository;

    public ExecuteAiTaskApplicationService(AiGenerationTaskRepository aiGenerationTaskRepository) {
        this.aiGenerationTaskRepository = aiGenerationTaskRepository;
    }

    /**
     * 查询待执行任务。
     *
     * @param limit 最大任务数
     * @return 待执行任务列表
     */
    @Transactional(readOnly = true)
    public List<AiGenerationTask> findPendingTasks(int limit) {
        return aiGenerationTaskRepository.findPendingTasks(limit);
    }

    /**
     * 将任务标记为运行中。
     *
     * @param taskIdValue AI 任务 ID
     * @return 运行中的任务
     */
    @Transactional
    public AiGenerationTask markRunning(String taskIdValue) {
        AiGenerationTask task = findTask(taskIdValue);
        AiGenerationTask runningTask = task.markRunning();
        aiGenerationTaskRepository.save(runningTask);
        LOGGER.info("【AI任务状态变化】【taskId={}】【from=PENDING to=RUNNING】", taskIdValue);
        return runningTask;
    }

    /**
     * 保存任务成功结果。
     *
     * @param taskIdValue AI 任务 ID
     * @param resultPayload Pet DNA 草稿 JSON
     */
    @Transactional
    public void markSucceeded(String taskIdValue, String resultPayload) {
        AiGenerationTask task = findTask(taskIdValue);
        aiGenerationTaskRepository.save(task.markSucceeded(resultPayload));
        LOGGER.info("【AI任务状态变化】【taskId={}】【from=RUNNING to=SUCCEEDED】", taskIdValue);
    }

    /**
     * 保存任务失败原因。
     *
     * @param taskIdValue AI 任务 ID
     * @param errorCode 失败错误码
     */
    @Transactional
    public void markFailed(String taskIdValue, AiTaskErrorCode errorCode) {
        AiGenerationTask task = findTask(taskIdValue);
        aiGenerationTaskRepository.save(task.markFailed(errorCode));
        LOGGER.info("【AI任务失败】【taskId={} petId={}】【errorCode={}]",
            taskIdValue, task.petId().value(), errorCode);
    }

    private AiGenerationTask findTask(String taskIdValue) {
        return aiGenerationTaskRepository.findByTaskId(AiTaskId.of(taskIdValue))
            .orElseThrow(() -> new BusinessException(ErrorCode.AI_TASK_NOT_FOUND));
    }
}
