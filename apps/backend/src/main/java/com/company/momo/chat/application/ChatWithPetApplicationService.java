package com.company.momo.chat.application;

import com.company.momo.platform.domain.BusinessException;
import com.company.momo.platform.domain.ErrorCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * chat 应用服务，编排用户与宠物基础聊天。
 *
 * 业务约定：本服务不持有事务，远程 AI 调用必须发生在 startConversation 与
 * finishConversation 两个事务之间，避免长事务占用数据库连接。
 */
@Service
public class ChatWithPetApplicationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ChatWithPetApplicationService.class);
    private static final int MAX_MESSAGE_LENGTH = 500;
    private static final String FALLBACK_REPLY = "我刚刚走神了，但我还在这里陪你。";

    private final ChatConversationPersistenceService persistenceService;
    private final ChatReplyGateway chatReplyGateway;

    public ChatWithPetApplicationService(
        ChatConversationPersistenceService persistenceService,
        ChatReplyGateway chatReplyGateway
    ) {
        this.persistenceService = persistenceService;
        this.chatReplyGateway = chatReplyGateway;
    }

    /**
     * 发送用户消息并返回宠物回复。
     *
     * @param petIdValue 宠物 ID
     * @param content 用户消息
     * @return 聊天结果
     */
    public ChatWithPetResult chat(String petIdValue, String content) {
        String normalizedContent = normalizeContent(content);
        ChatReplyContext context = persistenceService.startConversation(petIdValue, normalizedContent);

        boolean fallback = false;
        String reply;
        try {
            reply = chatReplyGateway.generateReply(context.pet(), context.petState(), normalizedContent);
        } catch (RuntimeException exception) {
            fallback = true;
            reply = FALLBACK_REPLY;
            LOGGER.info("【聊天降级】【petId={} messageId={}】【reason={}】",
                context.pet().id().value(), context.userMessageId(), exception.getClass().getSimpleName());
        }

        ChatWithPetResult result = persistenceService.finishConversation(
            context.pet(), context.userMessageId(), reply, fallback
        );
        LOGGER.info("【宠物聊天】【petId={} messageId={}】【fallback={}]",
            context.pet().id().value(), context.userMessageId(), fallback);
        return result;
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
