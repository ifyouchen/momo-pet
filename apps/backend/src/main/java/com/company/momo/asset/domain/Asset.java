package com.company.momo.asset.domain;

import com.company.momo.pet.domain.PetId;
import com.company.momo.pet.domain.UserId;

import java.time.Instant;

/**
 * asset 聚合根，封装用户上传资源的身份、归属、角色和可用状态。
 */
public final class Asset {

    private final AssetId id;
    private final PetId petId;
    private final UserId ownerId;
    private final AssetType assetType;
    private final PhotoRole photoRole;
    private final StorageKey storageKey;
    private final String originalFilename;
    private final String contentType;
    private final long sizeBytes;
    private final AssetStatus status;
    private final Instant createdAt;

    private Asset(
        AssetId id,
        PetId petId,
        UserId ownerId,
        AssetType assetType,
        PhotoRole photoRole,
        StorageKey storageKey,
        String originalFilename,
        String contentType,
        long sizeBytes,
        AssetStatus status,
        Instant createdAt
    ) {
        this.id = id;
        this.petId = petId;
        this.ownerId = ownerId;
        this.assetType = assetType;
        this.photoRole = photoRole;
        this.storageKey = storageKey;
        this.originalFilename = originalFilename;
        this.contentType = contentType;
        this.sizeBytes = sizeBytes;
        this.status = status;
        this.createdAt = createdAt;
    }

    /**
     * 创建已就绪的原始宠物照片资源。
     *
     * @param petId 宠物 ID
     * @param ownerId 用户 ID
     * @param photoRole 照片角色
     * @param storageKey 存储 key
     * @param originalFilename 原始文件名
     * @param contentType 文件内容类型
     * @param sizeBytes 文件大小
     * @return 图片资源聚合
     */
    public static Asset createReadyOriginalPhoto(
        PetId petId,
        UserId ownerId,
        PhotoRole photoRole,
        StorageKey storageKey,
        String originalFilename,
        String contentType,
        long sizeBytes
    ) {
        return new Asset(
            AssetId.newId(),
            petId,
            ownerId,
            AssetType.ORIGINAL_PHOTO,
            photoRole,
            storageKey,
            originalFilename,
            contentType,
            sizeBytes,
            AssetStatus.READY,
            Instant.now()
        );
    }

    /**
     * 从持久化对象恢复资源聚合。
     *
     * @return 资源聚合
     */
    public static Asset restore(
        AssetId id,
        PetId petId,
        UserId ownerId,
        AssetType assetType,
        PhotoRole photoRole,
        StorageKey storageKey,
        String originalFilename,
        String contentType,
        long sizeBytes,
        AssetStatus status,
        Instant createdAt
    ) {
        return new Asset(id, petId, ownerId, assetType, photoRole, storageKey, originalFilename, contentType, sizeBytes, status, createdAt);
    }

    public AssetId id() {
        return id;
    }

    public PetId petId() {
        return petId;
    }

    public UserId ownerId() {
        return ownerId;
    }

    public AssetType assetType() {
        return assetType;
    }

    public PhotoRole photoRole() {
        return photoRole;
    }

    public StorageKey storageKey() {
        return storageKey;
    }

    public String originalFilename() {
        return originalFilename;
    }

    public String contentType() {
        return contentType;
    }

    public long sizeBytes() {
        return sizeBytes;
    }

    public AssetStatus status() {
        return status;
    }

    public Instant createdAt() {
        return createdAt;
    }
}
