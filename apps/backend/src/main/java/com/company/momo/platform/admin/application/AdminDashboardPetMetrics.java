package com.company.momo.platform.admin.application;

/**
 * platform.admin Dashboard 宠物基础统计结果。
 *
 * @param total 全部宠物数量
 * @param active 处于 ACTIVE 状态的宠物数量
 */
public record AdminDashboardPetMetrics(long total, long active) {
}
