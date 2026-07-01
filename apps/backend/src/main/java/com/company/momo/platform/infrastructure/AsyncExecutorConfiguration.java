package com.company.momo.platform.infrastructure;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * platform Infrastructure 层线程池配置。
 *
 * 业务约定：禁止把任务直接丢进 ForkJoinPool.commonPool() 或 parallelStream()，
 * 所有受控的并发读模型必须走专属线程池。
 */
@Configuration
public class AsyncExecutorConfiguration {

    /**
     * 后台 Dashboard 并行读模型专用线程池。
     *
     * <p>core=2 / max=4 / queue=20 / prefix=admin-dashboard-。
     * 取值依据：Dashboard 同时只跑 4 个独立查询，core=2 覆盖稳态，max=4 覆盖峰值。</p>
     *
     * @return Spring 托管的 Executor
     */
    @Bean(name = "adminDashboardExecutor")
    public Executor adminDashboardExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(4);
        executor.setQueueCapacity(20);
        executor.setThreadNamePrefix("admin-dashboard-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(10);
        executor.initialize();
        return executor;
    }
}
