package com.company.momo.platform.admin.application;

import com.company.momo.ai.application.AiTaskSummaryAssembler;
import com.company.momo.ai.application.AiTaskSummaryResult;
import com.company.momo.ai.domain.AiGenerationTask;
import com.company.momo.ai.domain.AiGenerationTaskRepository;
import com.company.momo.ai.domain.AiTaskStatus;
import com.company.momo.pet.domain.PetRepository;
import com.company.momo.pet.domain.PetStatus;
import com.company.momo.pet.domain.PetStatusCount;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * platform.admin Dashboard 实际查询服务。
 *
 * <p>每个 public 方法都自带 @Transactional(readOnly = true)，由后台 Dashboard
 * 编排服务以 supplyAsync 并行调用，避免在单一事务里跨线程共享 JPA EntityManager。</p>
 */
@Service
public class AdminDashboardQueryService {

    private static final int RECENT_FAILURE_SIZE = 5;

    private final PetRepository petRepository;
    private final AiGenerationTaskRepository aiGenerationTaskRepository;

    public AdminDashboardQueryService(
        PetRepository petRepository,
        AiGenerationTaskRepository aiGenerationTaskRepository
    ) {
        this.petRepository = petRepository;
        this.aiGenerationTaskRepository = aiGenerationTaskRepository;
    }

    /**
     * 加载宠物基础统计指标。
     *
     * @return 宠物指标结果
     */
    @Transactional(readOnly = true)
    public AdminDashboardPetMetrics loadPetMetrics() {
        List<PetStatusCount> counts = petRepository.countPetsGroupedByStatus();
        long total = counts.stream().mapToLong(PetStatusCount::count).sum();
        long active = counts.stream()
            .filter(row -> row.status() == PetStatus.ACTIVE)
            .mapToLong(PetStatusCount::count)
            .sum();
        return new AdminDashboardPetMetrics(total, active);
    }

    /**
     * 加载 AI 任务状态指标。total 由 grouped 计数求和，不再单独 count()。
     *
     * @return AI 状态指标结果
     */
    @Transactional(readOnly = true)
    public AdminDashboardAiStatusMetrics loadAiStatusMetrics() {
        long total = 0L;
        long pending = 0L;
        long running = 0L;
        long succeeded = 0L;
        long failed = 0L;
        long timeout = 0L;
        for (var row : aiGenerationTaskRepository.countTasksGroupedByStatus()) {
            total += row.count();
            switch (row.status()) {
                case PENDING -> pending = row.count();
                case RUNNING -> running = row.count();
                case SUCCEEDED -> succeeded = row.count();
                case FAILED -> failed = row.count();
                case TIMEOUT -> timeout = row.count();
            }
        }
        return new AdminDashboardAiStatusMetrics(total, pending, running, succeeded, failed, timeout);
    }

    /**
     * 加载最近失败任务摘要。
     *
     * @return 失败任务摘要列表
     */
    @Transactional(readOnly = true)
    public List<AiTaskSummaryResult> findRecentFailures() {
        List<AiGenerationTask> tasks = aiGenerationTaskRepository.findRecentByStatus(
            AiTaskStatus.FAILED, RECENT_FAILURE_SIZE
        );
        return AiTaskSummaryAssembler.toSummaries(tasks);
    }

    /**
     * 加载最近超时任务摘要。
     *
     * @return 超时任务摘要列表
     */
    @Transactional(readOnly = true)
    public List<AiTaskSummaryResult> findRecentTimeouts() {
        List<AiGenerationTask> tasks = aiGenerationTaskRepository.findRecentByStatus(
            AiTaskStatus.TIMEOUT, RECENT_FAILURE_SIZE
        );
        return AiTaskSummaryAssembler.toSummaries(tasks);
    }
}
