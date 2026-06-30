package com.company.momo.chat.interfaces;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * chat Interface 层发送聊天消息请求。
 */
public record SendChatMessageRequest(
    @NotBlank
    @Size(max = 300)
    String content
) {
}
