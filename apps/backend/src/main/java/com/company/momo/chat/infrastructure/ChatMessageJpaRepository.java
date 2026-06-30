package com.company.momo.chat.infrastructure;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * chat Infrastructure 层 Spring Data 仓储，仅供持久化适配器使用。
 */
interface ChatMessageJpaRepository extends JpaRepository<ChatMessageJpaEntity, String> {

    /**
     * 按宠物 ID 倒序查询最近聊天消息。
     *
     * @param petId 宠物 ID
     * @param pageable 分页限制
     * @return 聊天消息实体列表
     */
    List<ChatMessageJpaEntity> findByPetIdOrderByCreatedAtDesc(String petId, Pageable pageable);
}
