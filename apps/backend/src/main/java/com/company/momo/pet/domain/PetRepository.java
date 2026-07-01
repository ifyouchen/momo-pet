package com.company.momo.pet.domain;

import com.company.momo.platform.domain.PageQuery;
import com.company.momo.platform.domain.PageResult;

import java.util.List;
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
     * @param pageQuery 分页参数
     * @return 宠物分页结果
     */
    PageResult<Pet> findPets(Species species, PetStatus status, PageQuery pageQuery);

    /**
     * 按状态统计宠物数量。
     *
     * @param status 宠物状态
     * @return 数量
     */
    long countByStatus(PetStatus status);

    /**
     * 统计所有宠物数量。
     *
     * @return 数量
     */
    long count();

    /**
     * 按宠物状态聚合统计数量。
     *
     * @return 状态分组统计结果
     */
    List<PetStatusCount> countPetsGroupedByStatus();
}
