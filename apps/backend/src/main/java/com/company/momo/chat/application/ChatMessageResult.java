package com.company.momo.chat.application;

import com.company.momo.chat.domain.ChatMessage;

import java.time.Instant;

/**
 * chat 应用层消息查询结果。
 */
public record ChatMessageResult(String messageId, String role, String content, Instant createdAt) {

    /**
     * 从领域消息转换查询结果。
     *
     * @param chatMessage 聊天消息
     * @return 查询结果
     */
    public static ChatMessageResult from(ChatMessage chatMessage) {
        return new ChatMessageResult(
            chatMessage.id().value(),
            chatMessage.role().name(),
            chatMessage.content(),
            chatMessage.createdAt()
        );
    }
}
