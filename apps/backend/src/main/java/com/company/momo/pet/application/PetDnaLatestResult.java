package com.company.momo.pet.application;

import com.fasterxml.jackson.databind.JsonNode;

import java.time.Instant;

/**
 * pet 应用层 Pet DNA 最新记录结果。
 *
 * @param petId 宠物 ID
 * @param version Pet DNA 版本
 * @param source 来源
 * @param dna Pet DNA JSON
 * @param confirmedAt 确认时间
 */
public record PetDnaLatestResult(
    String petId,
    int version,
    String source,
    JsonNode dna,
    Instant confirmedAt
) {
}
