package com.company.momo.asset.domain;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * asset 领域仓储接口，由基础设施层实现资源持久化。
 */
public interface AssetRepository {

    /**
     * 保存资源聚合。
     *
     * @param asset 资源聚合
     */
    void save(Asset asset);

    /**
     * 按资源 ID 查找可用于 AI 任务的原始照片。
     *
     * @param assetId 资源 ID
     * @return 资源聚合
     */
    Optional<Asset> findReadyOriginalPhotoByAssetId(AssetId assetId);

    /**
     * 批量查找可用于 AI 任务的原始照片，避免循环查库。
     *
     * @param assetIds 资源 ID 集合
     * @return 资源聚合列表
     */
    List<Asset> findReadyOriginalPhotosByAssetIds(Collection<AssetId> assetIds);
}
