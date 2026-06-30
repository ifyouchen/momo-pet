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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * chat 应用服务，编排用户与宠物基础聊天。
 */
@Service
public class ChatWithPetApplicationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ChatWithPetApplicationService.class);
    private static final int MAX_MESSAGE_LENGTH = 300;
    private static final String FALLBACK_REPLY = "我刚刚走神了，但我还在这里陪你。";

    private final PetRepository petRepository;
    private final PetStateRepository petStateRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatReplyGateway chatReplyGateway;

    public ChatWithPetApplicationService(
        PetRepository petRepository,
        PetStateRepository petStateRepository,
        ChatMessageRepository chatMessageRepository,
        ChatReplyGateway chatReplyGateway
    ) {
        this.petRepository = petRepository;
        this.petStateRepository = petStateRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.chatReplyGateway = chatReplyGateway;
    }

    /**
     * 发送用户消息并返回宠物回复。
     *
     * @param petIdValue 宠物 ID
     * @param content 用户消息
     * @return 聊天结果
     */
    @Transactional
    public ChatWithPetResult chat(String petIdValue, String content) {
        String normalizedContent = normalizeContent(content);
        Pet pet = findActivePet(petIdValue);
        PetState petState = petStateRepository.findStateByPetId(pet.id())
            .orElseThrow(() -> new BusinessException(ErrorCode.PET_NOT_FOUND));
        ChatMessage userMessage = ChatMessage.user(pet.id(), normalizedContent);
        chatMessageRepository.save(userMessage);

        boolean fallback = false;
        String reply;
        try {
            reply = chatReplyGateway.generateReply(pet, petState, normalizedContent);
        } catch (RuntimeException exception) {
            fallback = true;
            reply = FALLBACK_REPLY;
            LOGGER.info("【聊天降级】【petId={} messageId={}】【reason={}】", pet.id().value(), userMessage.id().value(), exception.getClass().getSimpleName());
        }

        chatMessageRepository.save(ChatMessage.pet(pet.id(), reply));
        petState.chat();
        petStateRepository.save(petState);
        LOGGER.info("【宠物聊天】【petId={} messageId={}】【fallback={}]",
            pet.id().value(),
            userMessage.id().value(),
            fallback);
        return new ChatWithPetResult(userMessage.id().value(), reply, PetStateResult.from(petState), fallback);
    }

    private Pet findActivePet(String petIdValue) {
        return petRepository.findActivePetById(PetId.of(petIdValue))
            .orElseThrow(() -> new BusinessException(ErrorCode.PET_NOT_FOUND));
    }

    private String normalizeContent(String content) {
        String normalizedContent = content == null ? "" : content.trim();
        if (normalizedContent.isBlank()) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED);
        }
        if (normalizedContent.length() > MAX_MESSAGE_LENGTH) {
            throw new BusinessException(ErrorCode.CHAT_MESSAGE_TOO_LONG);
        }
        return normalizedContent;
    }
}
