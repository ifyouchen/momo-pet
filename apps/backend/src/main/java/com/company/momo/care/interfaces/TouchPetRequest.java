package com.company.momo.care.interfaces;

import jakarta.validation.constraints.NotBlank;

/**
 * care Interface 层抚摸请求。
 */
public record TouchPetRequest(@NotBlank String touchType) {
}
