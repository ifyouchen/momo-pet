package com.company.momo.pet.domain;

/**
 * pet 领域状态分组统计结果，用于跨层传递语义化计数。
 *
 * @param status 宠物状态
 * @param count 该状态下的宠物数量
 */
public record PetStatusCount(PetStatus status, long count) {
}
