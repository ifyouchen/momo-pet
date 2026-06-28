package com.company.momo.pet.domain;

import com.company.momo.platform.domain.BusinessException;
import com.company.momo.platform.domain.ErrorCode;

/**
 * pet 限界上下文支持的宠物类型。
 */
public enum Species {

    /**
     * 猫。
     */
    CAT,

    /**
     * 狗。
     */
    DOG,

    /**
     * 鸟。
     */
    BIRD,

    /**
     * 兔子。
     */
    RABBIT;

    /**
     * 从接口字符串解析宠物类型。
     *
     * @param value 接口传入类型
     * @return 宠物类型
     */
    public static Species parse(String value) {
        try {
            return Species.valueOf(value);
        } catch (RuntimeException exception) {
            throw new BusinessException(ErrorCode.SPECIES_UNSUPPORTED);
        }
    }
}
