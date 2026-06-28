package com.company.momo.care.interfaces;

import jakarta.validation.constraints.NotBlank;

/**
 * care Interface 层喂食请求。
 */
public record FeedPetRequest(@NotBlank String foodCode) {
}
