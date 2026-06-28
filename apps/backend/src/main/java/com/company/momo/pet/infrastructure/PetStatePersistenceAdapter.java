package com.company.momo.pet.infrastructure;

import com.company.momo.pet.domain.PetId;
import com.company.momo.pet.domain.PetState;
import com.company.momo.pet.domain.PetStateRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * pet 状态 Infrastructure 仓储实现，负责 Domain 与 JPA 对象转换。
 */
@Repository
class PetStatePersistenceAdapter implements PetStateRepository {

    private final PetStateJpaRepository petStateJpaRepository;

    PetStatePersistenceAdapter(PetStateJpaRepository petStateJpaRepository) {
        this.petStateJpaRepository = petStateJpaRepository;
    }

    /**
     * 按宠物 ID 查询宠物状态。
     *
     * @param petId 宠物 ID
     * @return 宠物状态聚合根
     */
    @Override
    public Optional<PetState> findStateByPetId(PetId petId) {
        return petStateJpaRepository.findById(petId.value()).map(this::toDomain);
    }

    /**
     * 保存宠物状态。
     *
     * @param petState 宠物状态聚合根
     */
    @Override
    public void save(PetState petState) {
        petStateJpaRepository.save(toEntity(petState));
    }

    private PetState toDomain(PetStateJpaEntity entity) {
        return PetState.restore(
            PetId.of(entity.petId()),
            entity.hunger(),
            entity.mood(),
            entity.cleanliness(),
            entity.energy(),
            entity.intimacy(),
            entity.experience(),
            entity.level(),
            entity.updatedAt()
        );
    }

    private PetStateJpaEntity toEntity(PetState petState) {
        return new PetStateJpaEntity(
            petState.petId().value(),
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
