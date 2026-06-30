package com.company.momo.chat.interfaces;

import com.company.momo.chat.application.ChatMessageResult;

import java.util.List;

/**
 * chat Interface 层最近聊天消息列表响应。
 */
public record ChatMessagesResponse(List<ChatMessageResponse> items) {

    /**
     * 从应用层结果转换响应。
     *
     * @param results 应用层消息结果列表
     * @return 响应
     */
    public static ChatMessagesResponse from(List<ChatMessageResult> results) {
        return new ChatMessagesResponse(results.stream().map(ChatMessageResponse::from).toList());
    }
}
