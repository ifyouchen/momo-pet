package com.company.momo.pet.interfaces;

import com.company.momo.pet.application.PetStateResult;

import java.time.Instant;

/**
 * pet Interface 层宠物状态响应。
 */
public record PetStateResponse(int hunger, int mood, int cleanliness, int energy, int intimacy, int experience, int level, Instant updatedAt) {

    /**
     * 从应用层结果转换为接口响应。
     *
     * @param result 应用层宠物状态结果
     * @return 接口响应
     */
    public static PetStateResponse from(PetStateResult result) {
        return new PetStateResponse(
            result.hunger(),
            result.mood(),
            result.cleanliness(),
            result.energy(),
            result.intimacy(),
            result.experience(),
            result.level(),
            result.updatedAt()
        );
    }
}
