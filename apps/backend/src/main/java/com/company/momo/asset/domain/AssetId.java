package com.company.momo.asset.domain;

import com.company.momo.platform.domain.BusinessException;
import com.company.momo.platform.domain.ErrorCode;

import java.util.UUID;

/**
 * asset 限界上下文资源 ID 值对象，用于标识上传图片等可复用资源。
 *
 * @param value 资源唯一标识
 */
public record AssetId(String value) {

    /**
     * 创建新的资源 ID。
     *
     * @return 资源 ID
     */
    public static AssetId newId() {
        return new AssetId("asset_" + UUID.randomUUID());
    }

    /**
     * 从接口字符串恢复资源 ID。
     *
     * @param value 资源 ID 字符串
     * @return 资源 ID
     */
    public static AssetId of(String value) {
        return new AssetId(value);
    }

    public AssetId {
        if (value == null || value.isBlank()) {
            throw new BusinessException(ErrorCode.ASSET_NOT_FOUND);
        }
    }
}
