package com.company.momo.pet.domain;

import java.util.Optional;

/**
 * pet 限界上下文宠物状态仓储接口，由 Domain 定义、Infrastructure 实现。
 */
public interface PetStateRepository {

    /**
     * 按宠物 ID 查找状态。
     *
     * @param petId 宠物 ID
     * @return 宠物状态聚合根
     */
    Optional<PetState> findStateByPetId(PetId petId);

    /**
     * 保存宠物状态聚合根。
     *
     * @param petState 宠物状态聚合根
     */
    void save(PetState petState);
}
