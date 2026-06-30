package com.company.momo.pet.application;

/**
 * pet Application 层 Pet DNA 确认结果。
 *
 * @param petId 宠物 ID
 * @param version Pet DNA 版本
 */
public record ConfirmPetDnaResult(String petId, int version) {
}
