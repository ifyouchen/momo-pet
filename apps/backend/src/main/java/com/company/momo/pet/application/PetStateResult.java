package com.company.momo.pet.application;

import com.company.momo.pet.domain.PetState;

import java.time.Instant;

/**
 * pet 应用层宠物状态结果，用于返回当前养成状态快照。
 */
public record PetStateResult(int hunger, int mood, int cleanliness, int energy, int intimacy, int experience, int level, Instant updatedAt) {

    /**
     * 从领域聚合转换为应用结果。
     *
     * @param petState 宠物状态聚合根
     * @return 宠物状态结果
     */
    public static PetStateResult from(PetState petState) {
        return new PetStateResult(
            petState.hunger(),
            petState.mood(),
            petState.cleanliness(),
            petState.energy(),
            petState.intimacy(),
            petState.experience(),
            petState.level(),
            petState.updatedAt()
        );
    }
}
