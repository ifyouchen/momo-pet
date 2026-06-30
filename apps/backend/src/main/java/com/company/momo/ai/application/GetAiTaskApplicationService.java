package com.company.momo.ai.application;

import com.company.momo.ai.domain.AiGenerationTask;
import com.company.momo.ai.domain.AiGenerationTaskRepository;
import com.company.momo.ai.domain.AiTaskId;
import com.company.momo.platform.domain.BusinessException;
import com.company.momo.platform.domain.ErrorCode;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * ai 应用服务，负责查询 AI 任务详情。
 */
@Service
public class GetAiTaskApplicationService {

    private final AiGenerationTaskRepository aiGenerationTaskRepository;
    private final ObjectMapper objectMapper;

    public GetAiTaskApplicationService(AiGenerationTaskRepository aiGenerationTaskRepository, ObjectMapper objectMapper) {
        this.aiGenerationTaskRepository = aiGenerationTaskRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * 查询 AI 任务详情。
     *
     * @param taskIdValue AI 任务 ID
     * @return AI 任务详情
     */
    @Transactional(readOnly = true)
    public AiTaskDetailResult getTask(String taskIdValue) {
        AiGenerationTask task = aiGenerationTaskRepository.findByTaskId(AiTaskId.of(taskIdValue))
            .orElseThrow(() -> new BusinessException(ErrorCode.AI_TASK_NOT_FOUND));
        return AiTaskDetailResult.from(task, parseResult(task.resultPayload()));
    }

    private JsonNode parseResult(String resultPayload) {
        if (resultPayload == null || resultPayload.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readTree(resultPayload);
        } catch (JsonProcessingException exception) {
            throw new BusinessException(ErrorCode.AI_RESULT_INVALID);
        }
    }
}
