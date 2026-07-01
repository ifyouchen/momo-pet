package com.company.momo.chat.infrastructure;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

/**
 * chat Infrastructure 层 DeepSeek 熔断器：连续失败达阈值后短暂开启，期间所有调用直接失败。
 */
final class DeepSeekCircuitBreaker {

    private final int failureThreshold;
    private final long openDurationMs;
    private final AtomicInteger consecutiveFailureCount = new AtomicInteger(0);
    private final AtomicReference<Instant> openedAt = new AtomicReference<>();

    DeepSeekCircuitBreaker(int failureThreshold, long openDurationMs) {
        this.failureThreshold = failureThreshold;
        this.openDurationMs = openDurationMs;
    }

    /**
     * 进入方法前调用：若熔断开启且未到恢复时间则抛 IllegalStateException。
     */
    void rejectIfOpen() {
        Instant openedAtSnapshot = openedAt.get();
        if (openedAtSnapshot == null) {
            return;
        }
        long elapsedMs = Duration.between(openedAtSnapshot, Instant.now()).toMillis();
        if (elapsedMs >= openDurationMs) {
            openedAt.compareAndSet(openedAtSnapshot, null);
            consecutiveFailureCount.set(0);
            return;
        }
        throw new IllegalStateException("DeepSeek circuit open, fallback triggered");
    }

    /**
     * 记录一次成功调用，重置失败计数并关闭熔断。
     */
    void recordSuccess() {
        consecutiveFailureCount.set(0);
        openedAt.set(null);
    }

    /**
     * 记录一次失败调用；累计达到阈值后开启熔断。
     */
    void recordFailure() {
        if (consecutiveFailureCount.incrementAndGet() >= failureThreshold) {
            openedAt.set(Instant.now());
        }
    }
}
