package com.company.momo.pet.interfaces;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

/**
 * pet Interface 层创建宠物请求。
 */
public record CreatePetRequest(
    @NotBlank String name,
    @NotBlank String species,
    LocalDate birthday
) {
}
