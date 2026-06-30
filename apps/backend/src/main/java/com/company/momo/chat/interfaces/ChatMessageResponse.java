package com.company.momo.chat.interfaces;

import com.company.momo.chat.application.ChatMessageResult;

/**
 * chat Interface 层聊天消息响应。
 */
public record ChatMessageResponse(String messageId, String role, String content, String createdAt) {

    /**
     * 从应用层结果转换响应。
     *
     * @param result 应用层消息结果
     * @return 响应
     */
    public static ChatMessageResponse from(ChatMessageResult result) {
        return new ChatMessageResponse(
            result.messageId(),
            result.role(),
            result.content(),
            result.createdAt().toString()
        );
    }
}
