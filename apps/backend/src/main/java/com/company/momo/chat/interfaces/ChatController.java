package com.company.momo.chat.interfaces;

import com.company.momo.chat.application.ChatWithPetApplicationService;
import com.company.momo.chat.application.GetChatMessagesApplicationService;
import com.company.momo.platform.interfaces.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * chat Interface 层 Controller，负责 Sprint 6 基础聊天入口。
 */
@RestController
@RequestMapping("/api/pets/{petId}/chat/messages")
public class ChatController {

    private final ChatWithPetApplicationService chatWithPetApplicationService;
    private final GetChatMessagesApplicationService getChatMessagesApplicationService;

    public ChatController(
        ChatWithPetApplicationService chatWithPetApplicationService,
        GetChatMessagesApplicationService getChatMessagesApplicationService
    ) {
        this.chatWithPetApplicationService = chatWithPetApplicationService;
        this.getChatMessagesApplicationService = getChatMessagesApplicationService;
    }

    /**
     * 发送聊天消息。
     *
     * @param petId 宠物 ID
     * @param request 请求体
     * @return 统一发送响应
     */
    @PostMapping
    public ApiResponse<SendChatMessageResponse> sendMessage(
        @PathVariable String petId,
        @Valid @RequestBody SendChatMessageRequest request
    ) {
        return ApiResponse.success(SendChatMessageResponse.from(
            chatWithPetApplicationService.chat(petId, request.content())
        ));
    }

    /**
     * 查询最近聊天消息。
     *
     * @param petId 宠物 ID
     * @param limit 最大条数
     * @return 统一列表响应
     */
    @GetMapping
    public ApiResponse<ChatMessagesResponse> getMessages(
        @PathVariable String petId,
        @RequestParam(required = false) Integer limit
    ) {
        return ApiResponse.success(ChatMessagesResponse.from(
            getChatMessagesApplicationService.getRecentMessages(petId, limit)
        ));
    }
}
