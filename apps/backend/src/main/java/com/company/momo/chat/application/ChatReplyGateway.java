package com.company.momo.chat.application;

import com.company.momo.pet.domain.Pet;
import com.company.momo.pet.domain.PetState;

/**
 * chat 应用层宠物回复网关。
 */
public interface ChatReplyGateway {

    /**
     * 生成宠物口吻回复。
     *
     * @param pet 宠物资料
     * @param state 宠物状态
     * @param userMessage 用户消息
     * @return 宠物回复
     */
    String generateReply(Pet pet, PetState state, String userMessage);
}
