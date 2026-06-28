package com.company.momo.pet.domain;

import com.company.momo.platform.domain.BusinessException;
import com.company.momo.platform.domain.ErrorCode;

/**
 * pet 限界上下文宠物名称值对象，负责名称基础不变量校验。
 *
 * @param value 宠物名称
 */
public record PetName(String value) {

    private static final int MAX_LENGTH = 20;

    public PetName {
        if (value == null || value.isBlank() || value.length() > MAX_LENGTH) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED);
        }
    }
}
