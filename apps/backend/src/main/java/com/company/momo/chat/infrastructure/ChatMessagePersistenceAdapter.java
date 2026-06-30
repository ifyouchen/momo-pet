package com.company.momo.chat.infrastructure;

import com.company.momo.chat.domain.ChatMessage;
import com.company.momo.chat.domain.ChatMessageId;
import com.company.momo.chat.domain.ChatMessageRepository;
import com.company.momo.pet.domain.PetId;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

import java.util.Comparator;
import java.util.List;

/**
 * chat Infrastructure 仓储适配器，负责聊天消息 Domain 与 JPA 对象转换。
 */
@Repository
class ChatMessagePersistenceAdapter implements ChatMessageRepository {

    private final ChatMessageJpaRepository chatMessageJpaRepository;

    ChatMessagePersistenceAdapter(ChatMessageJpaRepository chatMessageJpaRepository) {
        this.chatMessageJpaRepository = chatMessageJpaRepository;
    }

    /**
     * 保存聊天消息。
     *
     * @param chatMessage 聊天消息
     */
    @Override
    public void save(ChatMessage chatMessage) {
        chatMessageJpaRepository.save(toEntity(chatMessage));
    }

    /**
     * 查询宠物最近聊天消息。
     *
     * @param petId 宠物 ID
     * @param limit 最大条数
     * @return 按创建时间升序排列的消息
     */
    @Override
    public List<ChatMessage> findRecentMessages(PetId petId, int limit) {
        return chatMessageJpaRepository
            .findByPetIdOrderByCreatedAtDesc(petId.value(), PageRequest.of(0, limit))
            .stream()
            .map(this::toDomain)
            .sorted(Comparator.comparing(ChatMessage::createdAt))
            .toList();
    }

    private ChatMessage toDomain(ChatMessageJpaEntity entity) {
        return ChatMessage.restore(
            ChatMessageId.of(entity.id()),
            PetId.of(entity.petId()),
            entity.role(),
            entity.content(),
            entity.createdAt()
        );
    }

    private ChatMessageJpaEntity toEntity(ChatMessage chatMessage) {
        return new ChatMessageJpaEntity(
            chatMessage.id().value(),
            chatMessage.petId().value(),
            chatMessage.role(),
            chatMessage.content(),
            chatMessage.createdAt()
        );
    }
}
