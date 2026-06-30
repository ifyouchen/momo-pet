package com.company.momo.pet.application;

import java.util.List;

/**
 * pet 应用层宠物列表分页结果。
 *
 * @param items 当前页宠物
 * @param total 总数
 * @param page 当前页
 * @param size 每页大小
 */
public record PetListResult(List<PetDetailResult> items, long total, int page, int size) {
}
