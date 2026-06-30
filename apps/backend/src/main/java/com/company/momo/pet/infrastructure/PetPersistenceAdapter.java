package com.company.momo.pet.infrastructure;

import com.company.momo.pet.domain.Pet;
import com.company.momo.pet.domain.PetId;
import com.company.momo.pet.domain.PetName;
import com.company.momo.pet.domain.PetRepository;
import com.company.momo.pet.domain.PetStatus;
import com.company.momo.pet.domain.Species;
import com.company.momo.pet.domain.UserId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * pet 基础档案 Infrastructure 仓储实现，负责 Domain 与 JPA 对象转换。
 */
@Repository
class PetPersistenceAdapter implements PetRepository {

    private final PetJpaRepository petJpaRepository;

    PetPersistenceAdapter(PetJpaRepository petJpaRepository) {
        this.petJpaRepository = petJpaRepository;
    }

    /**
     * 按宠物 ID 查询可用宠物。
     *
     * @param petId 宠物 ID
     * @return 宠物聚合根
     */
    @Override
    public Optional<Pet> findActivePetById(PetId petId) {
        return petJpaRepository.findByIdAndStatus(petId.value(), PetStatus.ACTIVE).map(this::toDomain);
    }

    /**
     * 保存宠物聚合根。
     *
     * @param pet 宠物聚合根
     */
    @Override
    public void save(Pet pet) {
        petJpaRepository.save(toEntity(pet));
    }

    /**
     * 按物种和状态分页查询宠物。
     *
     * @param species 物种过滤，可空
     * @param status 状态过滤，可空
     * @param pageable 分页
     * @return 宠物分页
     */
    @Override
    public Page<Pet> findPets(Species species, PetStatus status, Pageable pageable) {
        Page<PetJpaEntity> page;
        if (species != null && status != null) {
            page = petJpaRepository.findBySpeciesAndStatus(species, status, pageable);
        } else if (species != null) {
            page = petJpaRepository.findBySpecies(species, pageable);
        } else if (status != null) {
            page = petJpaRepository.findByStatus(status, pageable);
        } else {
            page = petJpaRepository.findAll(pageable);
        }
        return page.map(this::toDomain);
    }

    /**
     * 按状态统计宠物数量。
     *
     * @param status 宠物状态
     * @return 数量
     */
    @Override
    public long countByStatus(PetStatus status) {
        return petJpaRepository.countByStatus(status);
    }

    private Pet toDomain(PetJpaEntity entity) {
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

    private PetJpaEntity toEntity(Pet pet) {
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
