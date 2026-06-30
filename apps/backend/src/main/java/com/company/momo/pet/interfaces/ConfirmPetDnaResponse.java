package com.company.momo.pet.interfaces;

import com.company.momo.pet.application.ConfirmPetDnaResult;

/**
 * pet Interface 层 Pet DNA 确认响应。
 *
 * @param petId 宠物 ID
 * @param version Pet DNA 版本
 */
public record ConfirmPetDnaResponse(String petId, int version) {

    /**
     * 从应用层确认结果转换接口响应。
     *
     * @param result 确认结果
     * @return 确认响应
     */
    public static ConfirmPetDnaResponse from(ConfirmPetDnaResult result) {
        return new ConfirmPetDnaResponse(result.petId(), result.version());
    }
}
