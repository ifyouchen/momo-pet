package com.company.momo.asset.application;

import com.company.momo.asset.domain.Asset;

/**
 * asset Application 层上传结果，用于向 Interface 层返回脱敏资源信息。
 *
 * @param assetId 资源 ID
 * @param assetType 资源类型
 * @param photoRole 照片角色
 * @param status 资源状态
 * @param contentType 文件类型
 * @param sizeBytes 文件大小
 */
public record UploadedAssetResult(
    String assetId,
    String assetType,
    String photoRole,
    String status,
    String contentType,
    long sizeBytes
) {

    /**
     * 从资源聚合转换上传结果。
     *
     * @param asset 资源聚合
     * @return 上传结果
     */
    public static UploadedAssetResult from(Asset asset) {
        return new UploadedAssetResult(
            asset.id().value(),
            asset.assetType().name(),
            asset.photoRole().name(),
            asset.status().name(),
            asset.contentType(),
            asset.sizeBytes()
        );
    }
}
