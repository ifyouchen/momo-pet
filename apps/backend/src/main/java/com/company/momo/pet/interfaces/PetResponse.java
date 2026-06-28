package com.company.momo.pet.interfaces;

import com.company.momo.pet.application.PetDetailResult;

import java.time.Instant;
import java.time.LocalDate;

/**
 * pet Interface 层宠物详情响应。
 */
public record PetResponse(String petId, String name, String species, LocalDate birthday, String status, Instant createdAt) {

    /**
     * 从应用层结果转换为接口响应。
     *
     * @param result 应用层宠物详情结果
     * @return 接口响应
     */
    public static PetResponse from(PetDetailResult result) {
        return new PetResponse(
            result.petId(),
            result.name(),
            result.species().name(),
            result.birthday(),
            result.status().name(),
            result.createdAt()
        );
    }
}
