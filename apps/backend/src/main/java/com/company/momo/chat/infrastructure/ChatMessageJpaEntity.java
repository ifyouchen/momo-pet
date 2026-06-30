package com.company.momo.chat.infrastructure;

import com.company.momo.chat.domain.ChatMessageRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * chat Infrastructure 层 JPA 实体，保存宠物聊天记录。
 */
@Entity
@Table(name = "chat_messages")
class ChatMessageJpaEntity {

    @Id
    @Column(name = "message_id", nullable = false, length = 64)
    private String id;

    @Column(name = "pet_id", nullable = false, length = 64)
    private String petId;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 16)
    private ChatMessageRole role;

    @Lob
    @Column(name = "content", nullable = false)
    private String content;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected ChatMessageJpaEntity() {
    }

    ChatMessageJpaEntity(String id, String petId, ChatMessageRole role, String content, Instant createdAt) {
        this.id = id;
        this.petId = petId;
        this.role = role;
        this.content = content;
        this.createdAt = createdAt;
    }

    String id() {
        return id;
    }

    String petId() {
        return petId;
    }

    ChatMessageRole role() {
        return role;
    }

    String content() {
        return content;
    }

    Instant createdAt() {
        return createdAt;
    }
}
