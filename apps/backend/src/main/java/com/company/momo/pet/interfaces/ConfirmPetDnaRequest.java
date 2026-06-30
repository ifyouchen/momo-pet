package com.company.momo.pet.interfaces;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * pet Interface 层 Pet DNA 确认请求。
 *
 * @param source Pet DNA 来源
 * @param dna Pet DNA 完整 JSON
 */
public record ConfirmPetDnaRequest(@NotBlank String source, @NotNull JsonNode dna) {
}
