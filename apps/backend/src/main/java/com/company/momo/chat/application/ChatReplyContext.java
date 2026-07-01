package com.company.momo.chat.application;

import com.company.momo.pet.domain.Pet;
import com.company.momo.pet.domain.PetState;

/**
 * chat 应用层单次聊天的回复上下文，跨事务边界传递已加载的领域对象。
 *
 * @param pet 当前聊天的宠物档案
 * @param petState 聊天开始时的宠物状态快照
 * @param userMessageId 已保存的用户消息 ID
 */
public record ChatReplyContext(Pet pet, PetState petState, String userMessageId) {
}
