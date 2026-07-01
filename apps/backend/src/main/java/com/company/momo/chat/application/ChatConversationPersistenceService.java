package com.company.momo.chat.application;

import com.company.momo.chat.domain.ChatMessage;
import com.company.momo.chat.domain.ChatMessageRepository;
import com.company.momo.pet.application.PetStateResult;
import com.company.momo.pet.domain.Pet;
import com.company.momo.pet.domain.PetId;
import com.company.momo.pet.domain.PetRepository;
import com.company.momo.pet.domain.PetState;
import com.company.momo.pet.domain.PetStateRepository;
import com.company.momo.platform.domain.BusinessException;
import com.company.momo.platform.domain.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * chat 应用层聊天持久化服务，把"查宠物 / 保存用户消息"与"保存宠物回复 / 更新状态"分别包在独立事务里。
 *
 * 业务约定：远程 AI 调用必须发生在两个事务之间，避免长事务持有数据库连接。
 */
@Service
public class ChatConversationPersistenceService {

    private final PetRepository petRepository;
    private final PetStateRepository petStateRepository;
    private final ChatMessageRepository chatMessageRepository;

    public ChatConversationPersistenceService(
        PetRepository petRepository,
        PetStateRepository petStateRepository,
        ChatMessageRepository chatMessageRepository
    ) {
        this.petRepository = petRepository;
        this.petStateRepository = petStateRepository;
        this.chatMessageRepository = chatMessageRepository;
    }

    /**
     * 开启一次聊天会话：加载宠物与状态、保存用户消息，返回后续 AI 调用所需的上下文。
     *
     * @param petIdValue 宠物 ID
     * @param normalizedContent 已归一化的用户消息
     * @return 聊天回复上下文
     */
    @Transactional
    public ChatReplyContext startConversation(String petIdValue, String normalizedContent) {
        Pet pet = petRepository.findActivePetById(PetId.of(petIdValue))
            .orElseThrow(() -> new BusinessException(ErrorCode.PET_NOT_FOUND));
        PetState petState = petStateRepository.findStateByPetId(pet.id())
            .orElseThrow(() -> new BusinessException(ErrorCode.PET_NOT_FOUND));
        ChatMessage userMessage = ChatMessage.user(pet.id(), normalizedContent);
        chatMessageRepository.save(userMessage);
        return new ChatReplyContext(pet, petState, userMessage.id().value());
    }

    /**
     * 结束一次聊天会话：保存宠物回复、按聊天对状态进行扣减并落库。
     *
     * @param pet 聊天目标宠物
     * @param userMessageId 用户消息 ID
     * @param reply 宠物回复内容
     * @param fallback 是否走降级回复
     * @return 聊天结果
     */
    @Transactional
    public ChatWithPetResult finishConversation(
        Pet pet,
        String userMessageId,
        String reply,
        boolean fallback
    ) {
        chatMessageRepository.save(ChatMessage.pet(pet.id(), reply));
        PetState petState = petStateRepository.findStateByPetId(pet.id())
            .orElseThrow(() -> new BusinessException(ErrorCode.PET_NOT_FOUND));
        petState.chat();
        petStateRepository.save(petState);
        return new ChatWithPetResult(userMessageId, reply, PetStateResult.from(petState), fallback);
    }
}
