package com.company.momo.chat.domain;

import com.company.momo.pet.domain.PetId;

import java.util.List;

/**
 * chat 限界上下文聊天消息仓储接口。
 */
public interface ChatMessageRepository {

    /**
     * 保存聊天消息。
     *
     * @param chatMessage 聊天消息
     */
    void save(ChatMessage chatMessage);

    /**
     * 查询宠物最近聊天消息。
     *
     * @param petId 宠物 ID
     * @param limit 最大条数
     * @return 按创建时间升序排列的消息
     */
    List<ChatMessage> findRecentMessages(PetId petId, int limit);
}
