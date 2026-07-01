package com.company.momo.ai.infrastructure;

import com.company.momo.ai.domain.AiTaskStatus;

/**
 * ai 任务状态分组统计的 JPA 投影，避免基础设施层返回 Object[]。
 */
interface AiTaskStatusCountProjection {

    /**
     * 获取任务状态。
     *
     * @return 任务状态枚举
     */
    AiTaskStatus getStatus();

    /**
     * 获取该状态对应的任务数量。
     *
     * @return 任务数量
     */
    long getCount();
}
