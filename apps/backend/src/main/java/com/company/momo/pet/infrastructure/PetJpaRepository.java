package com.company.momo.pet.infrastructure;

import com.company.momo.pet.domain.PetStatus;
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
}
