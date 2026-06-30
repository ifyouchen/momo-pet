package com.company.momo.chat.application;

import com.company.momo.chat.domain.ChatMessageRepository;
import com.company.momo.pet.domain.PetId;
import com.company.momo.pet.domain.PetRepository;
import com.company.momo.platform.domain.BusinessException;
import com.company.momo.platform.domain.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * chat 应用服务，查询最近聊天记录。
 */
@Service
public class GetChatMessagesApplicationService {

    private static final int DEFAULT_LIMIT = 20;
    private static final int MAX_LIMIT = 50;

    private final PetRepository petRepository;
    private final ChatMessageRepository chatMessageRepository;

    public GetChatMessagesApplicationService(
        PetRepository petRepository,
        ChatMessageRepository chatMessageRepository
    ) {
        this.petRepository = petRepository;
        this.chatMessageRepository = chatMessageRepository;
    }

    /**
     * 查询指定宠物的最近聊天记录。
     *
     * @param petIdValue 宠物 ID
     * @param limit 最大条数
     * @return 最近聊天记录
     */
    @Transactional(readOnly = true)
    public List<ChatMessageResult> getRecentMessages(String petIdValue, Integer limit) {
        PetId petId = PetId.of(petIdValue);
        petRepository.findActivePetById(petId).orElseThrow(() -> new BusinessException(ErrorCode.PET_NOT_FOUND));
        int resolvedLimit = resolveLimit(limit);
        return chatMessageRepository.findRecentMessages(petId, resolvedLimit)
            .stream()
            .map(ChatMessageResult::from)
            .toList();
    }

    private int resolveLimit(Integer limit) {
        if (limit == null || limit <= 0) {
            return DEFAULT_LIMIT;
        }
        return Math.min(limit, MAX_LIMIT);
    }
}
