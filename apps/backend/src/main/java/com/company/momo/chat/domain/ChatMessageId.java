package com.company.momo.chat.domain;

import java.util.Objects;
import java.util.UUID;

/**
 * chat 限界上下文聊天消息 ID。
 */
public record ChatMessageId(String value) {

    public ChatMessageId {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("messageId must not be blank");
        }
    }

    /**
     * 创建新的聊天消息 ID。
     *
     * @return 聊天消息 ID
     */
    public static ChatMessageId newId() {
        return new ChatMessageId("msg_" + UUID.randomUUID());
    }

    /**
     * 从持久化值恢复聊天消息 ID。
     *
     * @param value 持久化值
     * @return 聊天消息 ID
     */
    public static ChatMessageId of(String value) {
        return new ChatMessageId(Objects.requireNonNull(value, "messageId must not be null"));
    }
}
