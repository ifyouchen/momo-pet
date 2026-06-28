package com.company.momo.pet.application;

import com.company.momo.pet.domain.Pet;
import com.company.momo.pet.domain.PetStatus;
import com.company.momo.pet.domain.Species;

import java.time.Instant;
import java.time.LocalDate;

/**
 * pet 应用层宠物详情结果，用于隔离接口 DTO 与领域聚合。
 */
public record PetDetailResult(String petId, String name, Species species, LocalDate birthday, PetStatus status, Instant createdAt) {

    /**
     * 从领域聚合转换为应用结果。
     *
     * @param pet 宠物聚合根
     * @return 宠物详情结果
     */
    public static PetDetailResult from(Pet pet) {
        return new PetDetailResult(
            pet.id().value(),
            pet.name().value(),
            pet.species(),
            pet.birthday(),
            pet.status(),
            pet.createdAt()
        );
    }
}
