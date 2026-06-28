package com.company.momo.pet.domain;

/**
 * pet 限界上下文用户 ID 值对象，Sprint 1 使用固定本地用户。
 *
 * @param value 用户唯一标识
 */
public record UserId(String value) {

    /**
     * 返回 Sprint 1 默认本地用户。
     *
     * @return 默认用户 ID
     */
    public static UserId localUser() {
        return new UserId("local-user");
    }
}
