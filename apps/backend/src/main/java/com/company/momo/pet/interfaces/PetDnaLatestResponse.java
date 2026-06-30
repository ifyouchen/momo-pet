package com.company.momo.pet.interfaces;

import com.company.momo.pet.application.PetDnaLatestResult;
import com.fasterxml.jackson.databind.JsonNode;

import java.time.Instant;

/**
 * pet Interface 层 Pet DNA 最新记录响应。
 */
public record PetDnaLatestResponse(
    String petId,
    int version,
    String source,
    JsonNode dna,
    Instant confirmedAt
) {

    /**
     * 从应用层结果转换为接口响应。
     *
     * @param result 应用层结果
     * @return 接口响应
     */
    public static PetDnaLatestResponse from(PetDnaLatestResult result) {
        return new PetDnaLatestResponse(
            result.petId(),
            result.version(),
            result.source(),
            result.dna(),
            result.confirmedAt()
        );
    }
}
