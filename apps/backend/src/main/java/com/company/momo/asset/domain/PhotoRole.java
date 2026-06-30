package com.company.momo.asset.domain;

import com.company.momo.platform.domain.BusinessException;
import com.company.momo.platform.domain.ErrorCode;

/**
 * asset 限界上下文照片角色，帮助 AI 区分主图和参考图用途。
 */
public enum PhotoRole {
    /**
     * 主识别图。
     */
    PRIMARY,

    /**
     * 正面参考图。
     */
    FRONT,

    /**
     * 侧面参考图。
     */
    SIDE,

    /**
     * 背面参考图。
     */
    BACK,

    /**
     * 局部细节参考图。
     */
    DETAIL,

    /**
     * 其他参考图。
     */
    OTHER;

    /**
     * 从接口字符串解析照片角色。
     *
     * @param value 接口提交的角色字符串
     * @return 照片角色
     */
    public static PhotoRole parse(String value) {
        try {
            return PhotoRole.valueOf(value);
        } catch (RuntimeException exception) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED);
        }
    }
}
