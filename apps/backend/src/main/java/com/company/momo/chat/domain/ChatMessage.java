package com.company.momo.chat.domain;

import com.company.momo.pet.domain.PetId;

import java.time.Instant;

/**
 * chat 限界上下文聊天消息实体。
 */
public final class ChatMessage {

    private final ChatMessageId id;
    private final PetId petId;
    private final ChatMessageRole role;
    private final String content;
    private final Instant createdAt;

    private ChatMessage(
        ChatMessageId id,
        PetId petId,
        ChatMessageRole role,
        String content,
        Instant createdAt
    ) {
        this.id = id;
        this.petId = petId;
        this.role = role;
        this.content = content;
        this.createdAt = createdAt;
    }

    /**
     * 创建用户聊天消息。
     *
     * @param petId 宠物 ID
     * @param content 消息内容
     * @return 用户聊天消息
     */
    public static ChatMessage user(PetId petId, String content) {
        return new ChatMessage(ChatMessageId.newId(), petId, ChatMessageRole.USER, content, Instant.now());
    }

    /**
     * 创建宠物回复消息。
     *
     * @param petId 宠物 ID
     * @param content 消息内容
     * @return 宠物回复消息
     */
    public static ChatMessage pet(PetId petId, String content) {
        return new ChatMessage(ChatMessageId.newId(), petId, ChatMessageRole.PET, content, Instant.now());
    }

    /**
     * 从持久化数据恢复聊天消息。
     */
    public static ChatMessage restore(
        ChatMessageId id,
        PetId petId,
        ChatMessageRole role,
        String content,
        Instant createdAt
    ) {
        return new ChatMessage(id, petId, role, content, createdAt);
    }

    public ChatMessageId id() {
        return id;
    }

    public PetId petId() {
        return petId;
    }

    public ChatMessageRole role() {
        return role;
    }

    public String content() {
        return content;
    }

    public Instant createdAt() {
        return createdAt;
    }
}
