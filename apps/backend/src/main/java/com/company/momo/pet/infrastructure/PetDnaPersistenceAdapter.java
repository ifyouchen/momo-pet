package com.company.momo.pet.infrastructure;

import com.company.momo.pet.domain.PetDnaRepository;
import com.company.momo.pet.domain.PetDnaSource;
import com.company.momo.pet.domain.PetId;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.UUID;

/**
 * pet Infrastructure 仓储适配器，负责 Pet DNA 版本化保存。
 */
@Repository
class PetDnaPersistenceAdapter implements PetDnaRepository {

    private final PetDnaJpaRepository petDnaJpaRepository;

    PetDnaPersistenceAdapter(PetDnaJpaRepository petDnaJpaRepository) {
        this.petDnaJpaRepository = petDnaJpaRepository;
    }

    /**
     * 查询指定宠物下一个 Pet DNA 版本。
     *
     * @param petId 宠物 ID
     * @return 下一个版本
     */
    @Override
    public int nextVersionForPet(PetId petId) {
        return petDnaJpaRepository.findMaxVersionByPetId(petId.value()).orElse(0) + 1;
    }

    /**
     * 保存用户确认后的 Pet DNA。
     *
     * @param petId 宠物 ID
     * @param version Pet DNA 版本
     * @param source Pet DNA 来源
     * @param dnaPayload Pet DNA JSON
     */
    @Override
    public void saveConfirmedPetDna(PetId petId, int version, PetDnaSource source, String dnaPayload) {
        petDnaJpaRepository.save(new PetDnaJpaEntity(
            "dna_" + UUID.randomUUID(),
            petId.value(),
            version,
            source,
            dnaPayload,
            Instant.now()
        ));
    }
}
