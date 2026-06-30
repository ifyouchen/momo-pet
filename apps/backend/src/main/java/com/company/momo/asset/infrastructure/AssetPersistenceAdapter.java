package com.company.momo.asset.infrastructure;

import com.company.momo.asset.domain.Asset;
import com.company.momo.asset.domain.AssetId;
import com.company.momo.asset.domain.AssetRepository;
import com.company.momo.asset.domain.AssetStatus;
import com.company.momo.asset.domain.AssetType;
import com.company.momo.asset.domain.StorageKey;
import com.company.momo.pet.domain.PetId;
import com.company.momo.pet.domain.UserId;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * asset Infrastructure 仓储适配器，负责 Domain 与 JPA 实体转换。
 */
@Repository
class AssetPersistenceAdapter implements AssetRepository {

    private final AssetJpaRepository assetJpaRepository;

    AssetPersistenceAdapter(AssetJpaRepository assetJpaRepository) {
        this.assetJpaRepository = assetJpaRepository;
    }

    /**
     * 保存资源聚合。
     *
     * @param asset 资源聚合
     */
    @Override
    public void save(Asset asset) {
        assetJpaRepository.save(toEntity(asset));
    }

    /**
     * 按资源 ID 查找可用原始照片。
     *
     * @param assetId 资源 ID
     * @return 资源聚合
     */
    @Override
    public Optional<Asset> findReadyOriginalPhotoByAssetId(AssetId assetId) {
        return assetJpaRepository
            .findByIdAndAssetTypeAndStatus(assetId.value(), AssetType.ORIGINAL_PHOTO, AssetStatus.READY)
            .map(this::toDomain);
    }

    /**
     * 批量查找可用原始照片。
     *
     * @param assetIds 资源 ID 集合
     * @return 资源聚合列表
     */
    @Override
    public List<Asset> findReadyOriginalPhotosByAssetIds(Collection<AssetId> assetIds) {
        List<String> ids = assetIds.stream().map(AssetId::value).toList();
        return assetJpaRepository
            .findByIdInAndAssetTypeAndStatus(ids, AssetType.ORIGINAL_PHOTO, AssetStatus.READY)
            .stream()
            .map(this::toDomain)
            .toList();
    }

    private Asset toDomain(AssetJpaEntity entity) {
        return Asset.restore(
            AssetId.of(entity.id()),
            PetId.of(entity.petId()),
            new UserId(entity.ownerId()),
            entity.assetType(),
            entity.photoRole(),
            new StorageKey(entity.storageKey()),
            entity.originalFilename(),
            entity.contentType(),
            entity.sizeBytes(),
            entity.status(),
            entity.createdAt()
        );
    }

    private AssetJpaEntity toEntity(Asset asset) {
        return new AssetJpaEntity(
            asset.id().value(),
            asset.petId().value(),
            asset.ownerId().value(),
            asset.assetType(),
            asset.photoRole(),
            asset.storageKey().value(),
            asset.originalFilename(),
            asset.contentType(),
            asset.sizeBytes(),
            asset.status(),
            asset.createdAt()
        );
    }
}
