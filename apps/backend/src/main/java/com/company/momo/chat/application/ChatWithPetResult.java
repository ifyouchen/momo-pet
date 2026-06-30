package com.company.momo.chat.application;

import com.company.momo.pet.application.PetStateResult;

/**
 * chat 应用层发送消息结果。
 */
public record ChatWithPetResult(String messageId, String reply, PetStateResult state, boolean fallback) {
}
