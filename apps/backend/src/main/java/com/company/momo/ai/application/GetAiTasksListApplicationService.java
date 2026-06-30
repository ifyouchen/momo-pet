package com.company.momo.ai.application;

import com.company.momo.ai.domain.AiGenerationTask;
import com.company.momo.ai.domain.AiGenerationTaskRepository;
import com.company.momo.ai.domain.AiTaskStatus;
import com.company.momo.ai.domain.AiTaskType;
import com.company.momo.platform.domain.BusinessException;
import com.company.momo.platform.domain.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * ai 应用服务，查询任务列表供后台使用。
 */
@Service
public class GetAiTasksListApplicationService {

    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 100;

    private final AiGenerationTaskRepository aiGenerationTaskRepository;

    public GetAiTasksListApplicationService(AiGenerationTaskRepository aiGenerationTaskRepository) {
        this.aiGenerationTaskRepository = aiGenerationTaskRepository;
    }

    /**
     * 按状态和类型分页查询 AI 任务。
     *
     * @param statusRaw 状态过滤，可空
     * @param taskTypeRaw 类型过滤，可空
     * @param page 页码
     * @param size 每页大小
     * @return AI 任务列表结果
     */
    @Transactional(readOnly = true)
    public AiTaskListResult getTasks(String statusRaw, String taskTypeRaw, int page, int size) {
        AiTaskStatus status = parseStatus(statusRaw);
        AiTaskType taskType = parseTaskType(taskTypeRaw);
        int resolvedPage = Math.max(0, page);
        int resolvedSize = size <= 0 ? DEFAULT_PAGE_SIZE : Math.min(size, MAX_PAGE_SIZE);
        AiGenerationTaskRepository.TaskPage taskPage = aiGenerationTaskRepository.findTasks(
            status, taskType, resolvedPage, resolvedSize
        );
        List<AiTaskSummaryResult> items = taskPage.items().stream()
            .map(GetAiTasksListApplicationService::toSummary)
            .toList();
        return new AiTaskListResult(items, taskPage.total(), taskPage.page(), taskPage.size());
    }

    private static AiTaskSummaryResult toSummary(AiGenerationTask task) {
        return new AiTaskSummaryResult(
            task.id().value(),
            task.petId().value(),
            task.taskType().name(),
            task.status().name(),
            task.errorCode() == null ? null : task.errorCode().name(),
            task.createdAt(),
            task.updatedAt()
        );
    }

    private static AiTaskStatus parseStatus(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return AiTaskStatus.valueOf(value);
        } catch (RuntimeException exception) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED);
        }
    }

    private static AiTaskType parseTaskType(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return AiTaskType.valueOf(value);
        } catch (RuntimeException exception) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED);
        }
    }
}
