package com.company.momo.pet.domain;

import com.company.momo.platform.domain.BusinessException;
import com.company.momo.platform.domain.ErrorCode;

import java.util.UUID;

/**
 * pet 限界上下文宠物 ID 值对象，避免接口层字符串直接泄漏到领域逻辑。
 *
 * @param value 宠物唯一标识
 */
public record PetId(String value) {

    /**
     * 创建新的宠物 ID。
     *
     * @return 宠物 ID
     */
    public static PetId newId() {
        return new PetId("pet_" + UUID.randomUUID());
    }

    /**
     * 从字符串恢复宠物 ID。
     *
     * @param value 宠物 ID 字符串
     * @return 宠物 ID
     */
    public static PetId of(String value) {
        return new PetId(value);
    }

    public PetId {
        if (value == null || value.isBlank()) {
            throw new BusinessException(ErrorCode.PET_NOT_FOUND);
        }
    }
}
