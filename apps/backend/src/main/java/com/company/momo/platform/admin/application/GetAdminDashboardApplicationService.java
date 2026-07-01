package com.company.momo.platform.admin.application;

import com.company.momo.ai.application.AiTaskSummaryResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.Executor;

/**
 * platform.admin Dashboard 编排服务。
 *
 * <p>不再直接持有 Repository 查询，而是把 4 个独立读模型并行派发到
 * {@code adminDashboardExecutor} 线程池，由 {@link AdminDashboardQueryService}
 * 在各自事务中完成查询。Controller 仍然是同步返回。</p>
 */
@Service
public class GetAdminDashboardApplicationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(GetAdminDashboardApplicationService.class);

    private final AdminDashboardQueryService queryService;
    private final Executor dashboardExecutor;

    public GetAdminDashboardApplicationService(
        AdminDashboardQueryService queryService,
        @Qualifier("adminDashboardExecutor") Executor dashboardExecutor
    ) {
        this.queryService = queryService;
        this.dashboardExecutor = dashboardExecutor;
    }

    /**
     * 聚合 Dashboard 指标：并行派发 4 个查询，等待完成后组装结果。
     *
     * @return Dashboard 指标结果
     */
    public AdminDashboardResult getDashboard() {
        DashboardQueries queries = startDashboardQueries();
        joinDashboardQueries(queries);
        return assembleResult(
            queries.pets().join(),
            queries.aiStatus().join(),
            queries.recentFailures().join(),
            queries.recentTimeouts().join()
        );
    }

    /**
     * 异步派发 4 个 Dashboard 查询，立即返回 future 句柄。
     */
    private DashboardQueries startDashboardQueries() {
        CompletableFuture<AdminDashboardPetMetrics> pets = CompletableFuture.supplyAsync(
            queryService::loadPetMetrics, dashboardExecutor
        );
        CompletableFuture<AdminDashboardAiStatusMetrics> aiStatus = CompletableFuture.supplyAsync(
            queryService::loadAiStatusMetrics, dashboardExecutor
        );
        CompletableFuture<List<AiTaskSummaryResult>> recentFailures = CompletableFuture.supplyAsync(
            queryService::findRecentFailures, dashboardExecutor
        );
        CompletableFuture<List<AiTaskSummaryResult>> recentTimeouts = CompletableFuture.supplyAsync(
            queryService::findRecentTimeouts, dashboardExecutor
        );
        return new DashboardQueries(pets, aiStatus, recentFailures, recentTimeouts);
    }

    /**
     * 等待所有 Dashboard 查询完成，异常时 unwrap CompletionException 重新抛出。
     */
    private void joinDashboardQueries(DashboardQueries queries) {
        try {
            CompletableFuture.allOf(queries.pets(), queries.aiStatus(), queries.recentFailures(), queries.recentTimeouts())
                .join();
        } catch (CompletionException exception) {
            Throwable cause = exception.getCause() != null ? exception.getCause() : exception;
            LOGGER.error("【Dashboard 并行查询失败】【reason={}】", cause.getClass().getSimpleName(), cause);
            throw rethrow(cause);
        }
    }

    private AdminDashboardResult assembleResult(
        AdminDashboardPetMetrics pets,
        AdminDashboardAiStatusMetrics ai,
        List<AiTaskSummaryResult> recentFailures,
        List<AiTaskSummaryResult> recentTimeouts
    ) {
        return new AdminDashboardResult(
            pets.total(),
            pets.active(),
            ai.total(),
            ai.pending(),
            ai.running(),
            ai.succeeded(),
            ai.failed(),
            ai.timeout(),
            recentFailures,
            recentTimeouts
        );
    }

    private static RuntimeException rethrow(Throwable throwable) {
        if (throwable instanceof RuntimeException runtimeException) {
            return runtimeException;
        }
        return new RuntimeException(throwable);
    }

    /**
     * Dashboard 4 路并行查询的 future 集合，编排层与查询层解耦。
     */
    private record DashboardQueries(
        CompletableFuture<AdminDashboardPetMetrics> pets,
        CompletableFuture<AdminDashboardAiStatusMetrics> aiStatus,
        CompletableFuture<List<AiTaskSummaryResult>> recentFailures,
        CompletableFuture<List<AiTaskSummaryResult>> recentTimeouts
    ) {
    }
}
