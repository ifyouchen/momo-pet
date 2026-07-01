package com.company.momo.platform.domain;

/**
 * 平台层分页参数，承载纯领域分页语义。
 *
 * @param page 页码，从 0 开始
 * @param size 每页大小，必须大于 0
 */
public record PageQuery(int page, int size) {

    /**
     * 紧凑构造器：校验 page >= 0 且 size > 0，保护领域值对象不变量。
     *
     * @throws IllegalArgumentException 参数越界时抛出
     */
    public PageQuery {
        if (page < 0) {
            throw new IllegalArgumentException("page must be >= 0");
        }
        if (size <= 0) {
            throw new IllegalArgumentException("size must be > 0");
        }
    }
}
