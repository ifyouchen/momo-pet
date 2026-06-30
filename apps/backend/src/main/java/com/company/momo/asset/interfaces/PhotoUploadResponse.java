package com.company.momo.asset.interfaces;

import com.company.momo.asset.application.UploadedAssetResult;

/**
 * asset Interface 层照片上传响应。
 *
 * @param assetId 资源 ID
 * @param assetType 资源类型
 * @param photoRole 照片角色
 * @param status 资源状态
 * @param contentType 文件类型
 * @param sizeBytes 文件大小
 */
public record PhotoUploadResponse(
    String assetId,
    String assetType,
    String photoRole,
    String status,
    String contentType,
    long sizeBytes
) {

    /**
     * 从应用层结果转换接口响应。
     *
     * @param result 上传结果
     * @return 上传响应
     */
    public static PhotoUploadResponse from(UploadedAssetResult result) {
        return new PhotoUploadResponse(
            result.assetId(),
            result.assetType(),
            result.photoRole(),
            result.status(),
            result.contentType(),
            result.sizeBytes()
        );
    }
}
