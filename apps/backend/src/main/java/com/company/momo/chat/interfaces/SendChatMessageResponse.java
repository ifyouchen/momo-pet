package com.company.momo.chat.interfaces;

import com.company.momo.chat.application.ChatWithPetResult;
import com.company.momo.pet.interfaces.PetStateResponse;

/**
 * chat Interface 层发送聊天消息响应。
 */
public record SendChatMessageResponse(
    String messageId,
    String reply,
    PetStateResponse state,
    boolean fallback
) {

    /**
     * 从应用层结果转换响应。
     *
     * @param result 应用层聊天结果
     * @return 响应
     */
    public static SendChatMessageResponse from(ChatWithPetResult result) {
        return new SendChatMessageResponse(
            result.messageId(),
            result.reply(),
            PetStateResponse.from(result.state()),
            result.fallback()
        );
    }
}
