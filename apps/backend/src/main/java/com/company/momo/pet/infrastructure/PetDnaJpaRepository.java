package com.company.momo.pet.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * pet Infrastructure 层 Pet DNA Spring Data 仓储。
 */
interface PetDnaJpaRepository extends JpaRepository<PetDnaJpaEntity, String> {

    /**
     * 查询指定宠物当前最大 Pet DNA 版本。
     *
     * @param petId 宠物 ID
     * @return 最大版本
     */
    @Query("select max(d.version) from PetDnaJpaEntity d where d.petId = :petId")
    Optional<Integer> findMaxVersionByPetId(@Param("petId") String petId);
}
