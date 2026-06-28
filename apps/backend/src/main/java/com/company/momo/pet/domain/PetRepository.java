package com.company.momo.pet.domain;

import java.util.Optional;

/**
 * pet 限界上下文宠物仓储接口，由 Domain 定义、Infrastructure 实现。
 */
public interface PetRepository {

    /**
     * 按宠物 ID 查找处于可用状态的宠物。
     *
     * @param petId 宠物 ID
     * @return 宠物聚合根
     */
    Optional<Pet> findActivePetById(PetId petId);

    /**
     * 保存宠物聚合根。
     *
     * @param pet 宠物聚合根
     */
    void save(Pet pet);
}
