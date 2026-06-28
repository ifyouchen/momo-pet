package com.company.momo.care.interfaces;

import jakarta.validation.constraints.NotBlank;

/**
 * care Interface 层清理请求。
 */
public record CleanPetRequest(@NotBlank String cleanEventId) {
}
