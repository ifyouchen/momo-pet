package com.company.momo.platform.admin.application;

import com.company.momo.ai.application.AiTaskSummaryResult;
import com.company.momo.ai.domain.AiGenerationTaskRepository;
import com.company.momo.ai.domain.AiTaskStatus;
import com.company.momo.pet.domain.PetRepository;
import com.company.momo.pet.domain.PetStatus;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * platform.admin 应用服务，聚合后台 Dashboard 核心指标。
 */
@Service
public class GetAdminDashboardApplicationService {

    private static final int RECENT_FAILURE_SIZE = 5;

    private final PetRepository petRepository;
    private final AiGenerationTaskRepository aiGenerationTaskRepository;

    public GetAdminDashboardApplicationService(
        PetRepository petRepository,
        AiGenerationTaskRepository aiGenerationTaskRepository
    ) {
        this.petRepository = petRepository;
        this.aiGenerationTaskRepository = aiGenerationTaskRepository;
    }

    /**
     * 聚合 Dashboard 指标。
     *
     * @return Dashboard 指标结果
     */
    @Transactional(readOnly = true)
    public AdminDashboardResult getDashboard() {
        long totalPets = petRepository.findPets(null, null,
            PageRequest.of(0, 1, Sort.by(Sort.Direction.DESC, "createdAt"))).getTotalElements();
        long activePets = petRepository.countByStatus(PetStatus.ACTIVE);
        long totalAiTasks = aiGenerationTaskRepository.findTasks(null, null, 0, 1).total();
        long pendingAiTasks = aiGenerationTaskRepository.countByStatus(AiTaskStatus.PENDING);
        long runningAiTasks = aiGenerationTaskRepository.countByStatus(AiTaskStatus.RUNNING);
        long succeededAiTasks = aiGenerationTaskRepository.countByStatus(AiTaskStatus.SUCCEEDED);
        long failedAiTasks = aiGenerationTaskRepository.countByStatus(AiTaskStatus.FAILED);
        long timeoutAiTasks = aiGenerationTaskRepository.countByStatus(AiTaskStatus.TIMEOUT);

        AiGenerationTaskRepository.TaskPage failedPage = aiGenerationTaskRepository.findTasks(
            AiTaskStatus.FAILED, null, 0, RECENT_FAILURE_SIZE
        );
        AiGenerationTaskRepository.TaskPage timeoutPage = aiGenerationTaskRepository.findTasks(
            AiTaskStatus.TIMEOUT, null, 0, RECENT_FAILURE_SIZE
        );
        List<AiTaskSummaryResult> recentFailures = failedPage.items().stream()
            .map(task -> new AiTaskSummaryResult(
                task.id().value(),
                task.petId().value(),
                task.taskType().name(),
                task.status().name(),
                task.errorCode() == null ? null : task.errorCode().name(),
                task.createdAt(),
                task.updatedAt()
            ))
            .toList();
        List<AiTaskSummaryResult> recentTimeouts = timeoutPage.items().stream()
            .map(task -> new AiTaskSummaryResult(
                task.id().value(),
                task.petId().value(),
                task.taskType().name(),
                task.status().name(),
                task.errorCode() == null ? null : task.errorCode().name(),
                task.createdAt(),
                task.updatedAt()
            ))
            .toList();
        return new AdminDashboardResult(
            totalPets,
            activePets,
            totalAiTasks,
            pendingAiTasks,
            runningAiTasks,
            succeededAiTasks,
            failedAiTasks,
            timeoutAiTasks,
            recentFailures,
            recentTimeouts
        );
    }
}
