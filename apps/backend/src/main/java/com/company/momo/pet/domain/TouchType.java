package com.company.momo.pet.domain;

import com.company.momo.platform.domain.BusinessException;
import com.company.momo.platform.domain.ErrorCode;

/**
 * pet 限界上下文 MVP 支持的抚摸类型。
 */
public enum TouchType {

    /**
     * 摸头。
     */
    HEAD;

    /**
     * 从接口字符串解析抚摸类型。
     *
     * @param value 接口传入抚摸类型
     * @return 抚摸类型
     */
    public static TouchType parse(String value) {
        try {
            return TouchType.valueOf(value);
        } catch (RuntimeException exception) {
            throw new BusinessException(ErrorCode.CARE_ACTION_NOT_ALLOWED);
        }
    }
}
