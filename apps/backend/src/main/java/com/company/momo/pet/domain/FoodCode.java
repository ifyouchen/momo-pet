package com.company.momo.pet.domain;

import com.company.momo.platform.domain.BusinessException;
import com.company.momo.platform.domain.ErrorCode;

/**
 * pet 限界上下文 MVP 支持的食物编码。
 */
public enum FoodCode {

    /**
     * 默认小鱼干。
     */
    DRIED_FISH;

    /**
     * 从接口字符串解析食物编码。
     *
     * @param value 接口传入食物编码
     * @return 食物编码
     */
    public static FoodCode parse(String value) {
        try {
            return FoodCode.valueOf(value);
        } catch (RuntimeException exception) {
            throw new BusinessException(ErrorCode.CARE_ACTION_NOT_ALLOWED);
        }
    }
}
