package com.company.momo.asset.infrastructure;

import com.company.momo.asset.domain.AssetStatus;
import com.company.momo.asset.domain.AssetType;
import com.company.momo.asset.domain.PhotoRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * asset Infrastructure 层 JPA 实体，显式映射上传资源元数据。
 */
@Entity
@Table(name = "asset")
class AssetJpaEntity {

    @Id
    @Column(name = "asset_id", nullable = false, length = 64)
    private String id;

    @Column(name = "pet_id", nullable = false, length = 64)
    private String petId;

    @Column(name = "owner_id", nullable = false, length = 64)
    private String ownerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "asset_type", nullable = false, length = 32)
    private AssetType assetType;

    @Enumerated(EnumType.STRING)
    @Column(name = "photo_role", nullable = false, length = 32)
    private PhotoRole photoRole;

    @Column(name = "storage_key", nullable = false, length = 255)
    private String storageKey;

    @Column(name = "original_filename", nullable = false, length = 255)
    private String originalFilename;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(name = "size_bytes", nullable = false)
    private long sizeBytes;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private AssetStatus status;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected AssetJpaEntity() {
    }

    AssetJpaEntity(
        String id,
        String petId,
        String ownerId,
        AssetType assetType,
        PhotoRole photoRole,
        String storageKey,
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
        this.updatedAt = createdAt;
    }

    String id() {
        return id;
    }

    String petId() {
        return petId;
    }

    String ownerId() {
        return ownerId;
    }

    AssetType assetType() {
        return assetType;
    }

    PhotoRole photoRole() {
        return photoRole;
    }

    String storageKey() {
        return storageKey;
    }

    String originalFilename() {
        return originalFilename;
    }

    String contentType() {
        return contentType;
    }

    long sizeBytes() {
        return sizeBytes;
    }

    AssetStatus status() {
        return status;
    }

    Instant createdAt() {
        return createdAt;
    }
}
