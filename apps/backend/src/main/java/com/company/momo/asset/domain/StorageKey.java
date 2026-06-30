package com.company.momo.asset.domain;

import com.company.momo.platform.domain.BusinessException;
import com.company.momo.platform.domain.ErrorCode;

/**
 * asset 限界上下文存储 key 值对象，数据库只保存相对定位信息。
 *
 * @param value 本地或对象存储中的相对 key
 */
public record StorageKey(String value) {

    public StorageKey {
        if (value == null || value.isBlank()) {
            throw new BusinessException(ErrorCode.ASSET_UPLOAD_FAILED);
        }
    }
}
