package com.company.momo.asset.infrastructure;

import com.company.momo.asset.domain.AssetStatus;
import com.company.momo.asset.domain.AssetType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * asset Infrastructure 层 Spring Data 仓储，仅服务持久化适配器。
 */
interface AssetJpaRepository extends JpaRepository<AssetJpaEntity, String> {

    /**
     * 按资源 ID、类型和状态查询资源实体。
     *
     * @param id 资源 ID
     * @param assetType 资源类型
     * @param status 资源状态
     * @return 资源实体
     */
    Optional<AssetJpaEntity> findByIdAndAssetTypeAndStatus(String id, AssetType assetType, AssetStatus status);

    /**
     * 批量查询可用资源实体，避免 N+1 查询。
     *
     * @param ids 资源 ID 集合
     * @param assetType 资源类型
     * @param status 资源状态
     * @return 资源实体列表
     */
    List<AssetJpaEntity> findByIdInAndAssetTypeAndStatus(Collection<String> ids, AssetType assetType, AssetStatus status);
}
