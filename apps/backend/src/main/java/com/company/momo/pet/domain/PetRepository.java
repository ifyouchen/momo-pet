package com.company.momo.pet.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

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

    /**
     * 按物种和状态分页查询宠物。
     *
     * @param species 物种过滤，可空
     * @param status 状态过滤，可空
     * @param pageable 分页
     * @return 宠物分页
     */
    Page<Pet> findPets(Species species, PetStatus status, Pageable pageable);

    /**
     * 按状态统计宠物数量。
     *
     * @param status 宠物状态
     * @return 数量
     */
    long countByStatus(PetStatus status);
}
