package com.company.momo.pet.infrastructure;

import com.company.momo.pet.domain.Pet;
import com.company.momo.pet.domain.PetId;
import com.company.momo.pet.domain.PetName;
import com.company.momo.pet.domain.UserId;

/**
 * pet JPA 实体与领域对象互转工具，由 {@link PetPersistenceAdapter} 私有调用。
 */
final class PetJpaMapper {

    private PetJpaMapper() {
    }

    /**
     * JPA 实体 → 领域聚合。
     */
    static Pet toDomain(PetJpaEntity entity) {
        return Pet.restore(
            PetId.of(entity.id()),
            new UserId(entity.ownerId()),
            new PetName(entity.name()),
            entity.species(),
            entity.birthday(),
            entity.status(),
            entity.createdAt()
        );
    }

    /**
     * 领域聚合 → JPA 实体（不持久化）。
     */
    static PetJpaEntity toEntity(Pet pet) {
        return new PetJpaEntity(
            pet.id().value(),
            pet.ownerId().value(),
            pet.name().value(),
            pet.species(),
            pet.birthday(),
            pet.status(),
            pet.createdAt()
        );
    }
}
