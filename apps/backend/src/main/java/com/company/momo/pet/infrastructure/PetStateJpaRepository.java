package com.company.momo.pet.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * pet 状态 Spring Data JPA 仓储。
 */
interface PetStateJpaRepository extends JpaRepository<PetStateJpaEntity, String> {
}
