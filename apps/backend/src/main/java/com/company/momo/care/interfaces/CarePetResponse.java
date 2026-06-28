package com.company.momo.care.interfaces;

import com.company.momo.pet.application.PetStateResult;
import com.company.momo.pet.interfaces.PetStateResponse;

/**
 * care Interface 层照顾行为响应。
 */
public record CarePetResponse(PetStateResponse state) {

    /**
     * 从应用层状态结果转换为照顾响应。
     *
     * @param result 宠物状态结果
     * @return 照顾行为响应
     */
    public static CarePetResponse from(PetStateResult result) {
        return new CarePetResponse(PetStateResponse.from(result));
    }
}
