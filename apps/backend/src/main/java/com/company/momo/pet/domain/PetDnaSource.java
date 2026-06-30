package com.company.momo.pet.domain;

import com.company.momo.platform.domain.BusinessException;
import com.company.momo.platform.domain.ErrorCode;

/**
 * pet 限界上下文 Pet DNA 来源。
 */
public enum PetDnaSource {
    /**
     * AI 生成后由用户确认。
     */
    AI,

    /**
     * 用户手动创建。
     */
    MANUAL,

    /**
     * AI 草稿经过用户较大修改。
     */
    MIXED;

    /**
     * 从接口字符串解析来源。
     *
     * @param value 来源字符串
     * @return Pet DNA 来源
     */
    public static PetDnaSource parse(String value) {
        try {
            return PetDnaSource.valueOf(value);
        } catch (RuntimeException exception) {
            throw new BusinessException(ErrorCode.PET_DNA_INVALID);
        }
    }
}
