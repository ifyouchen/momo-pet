package com.company.momo.platform.domain;

import java.util.List;

/**
 * 平台层分页结果，避免 Domain 依赖 Spring Data Page。
 *
 * @param items 当前页数据
 * @param total 总数
 * @param page 页码
 * @param size 每页大小
 */
public record PageResult<T>(List<T> items, long total, int page, int size) {
}
