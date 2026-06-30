package com.company.momo.pet.infrastructure;

import com.company.momo.pet.domain.PetStatus;
import com.company.momo.pet.domain.Species;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * pet 基础档案 Spring Data JPA 仓储。
 */
interface PetJpaRepository extends JpaRepository<PetJpaEntity, String> {

    /**
     * 查询指定状态的宠物。
     *
     * @param id 宠物 ID
     * @param status 宠物状态
     * @return 宠物持久化对象
     */
    Optional<PetJpaEntity> findByIdAndStatus(String id, PetStatus status);

    /**
     * 按状态分页查询宠物。
     *
     * @param status 宠物状态
     * @param pageable 分页
     * @return 宠物分页结果
     */
    Page<PetJpaEntity> findByStatus(PetStatus status, Pageable pageable);

    /**
     * 按物种和状态分页查询宠物。
     *
     * @param species 物种
     * @param status 宠物状态
     * @param pageable 分页
     * @return 宠物分页结果
     */
    Page<PetJpaEntity> findBySpeciesAndStatus(Species species, PetStatus status, Pageable pageable);

    /**
     * 按物种分页查询宠物。
     *
     * @param species 物种
     * @param pageable 分页
     * @return 宠物分页结果
     */
    Page<PetJpaEntity> findBySpecies(Species species, Pageable pageable);

    /**
     * 按状态统计宠物数量。
     *
     * @param status 宠物状态
     * @return 数量
     */
    long countByStatus(PetStatus status);
}
