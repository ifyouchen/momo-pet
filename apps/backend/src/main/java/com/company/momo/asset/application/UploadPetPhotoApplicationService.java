package com.company.momo.asset.application;

import com.company.momo.asset.domain.Asset;
import com.company.momo.asset.domain.AssetId;
import com.company.momo.asset.domain.AssetRepository;
import com.company.momo.asset.domain.AssetStatus;
import com.company.momo.asset.domain.AssetType;
import com.company.momo.asset.domain.PhotoRole;
import com.company.momo.asset.domain.StorageKey;
import com.company.momo.pet.domain.Pet;
import com.company.momo.pet.domain.PetId;
import com.company.momo.pet.domain.PetRepository;
import com.company.momo.platform.domain.BusinessException;
import com.company.momo.platform.domain.ErrorCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.Set;

/**
 * asset 应用服务，编排宠物照片上传和资源元数据保存。
 */
@Service
public class UploadPetPhotoApplicationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(UploadPetPhotoApplicationService.class);
    private static final long MAX_FILE_SIZE_BYTES = 10L * 1024L * 1024L;
    private static final Set<String> SUPPORTED_CONTENT_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

    private final AssetRepository assetRepository;
    private final PetRepository petRepository;
    private final LocalAssetStorage localAssetStorage;

    public UploadPetPhotoApplicationService(
        AssetRepository assetRepository,
        PetRepository petRepository,
        LocalAssetStorage localAssetStorage
    ) {
        this.assetRepository = assetRepository;
        this.petRepository = petRepository;
        this.localAssetStorage = localAssetStorage;
    }

    /**
     * 上传宠物照片并保存资源元数据。
     *
     * @param petIdValue 宠物 ID
     * @param file 上传文件
     * @param photoRole 照片角色
     * @return 上传资源结果
     */
    @Transactional
    public UploadedAssetResult uploadPhoto(String petIdValue, MultipartFile file, PhotoRole photoRole) {
        ensureSupportedFile(file);
        Pet pet = petRepository.findActivePetById(PetId.of(petIdValue))
            .orElseThrow(() -> new BusinessException(ErrorCode.PET_NOT_FOUND));
        AssetId assetId = AssetId.newId();
        StorageKey storageKey = localAssetStorage.saveOriginalPhoto(assetId, file);
        Asset asset = Asset.restore(
            assetId,
            pet.id(),
            pet.ownerId(),
            AssetType.ORIGINAL_PHOTO,
            photoRole,
            storageKey,
            safeFilename(file.getOriginalFilename()),
            file.getContentType(),
            file.getSize(),
            AssetStatus.READY,
            Instant.now()
        );
        assetRepository.save(asset);
        LOGGER.info("【照片上传】【petId={} assetId={}】【role={} sizeBytes={} status=READY】", pet.id().value(), asset.id().value(), photoRole, file.getSize());
        return UploadedAssetResult.from(asset);
    }

    private void ensureSupportedFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.ASSET_UPLOAD_FAILED);
        }
        if (!isSupportedImage(file)) {
            throw new BusinessException(ErrorCode.ASSET_TYPE_UNSUPPORTED);
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BusinessException(ErrorCode.ASSET_TOO_LARGE);
        }
    }

    private String safeFilename(String filename) {
        if (filename == null || filename.isBlank()) {
            return "upload";
        }
        return filename.length() > 240 ? filename.substring(0, 240) : filename;
    }

    private boolean isSupportedImage(MultipartFile file) {
        if (SUPPORTED_CONTENT_TYPES.contains(file.getContentType())) {
            return true;
        }
        String filename = file.getOriginalFilename();
        if (filename == null) {
            return false;
        }
        String normalizedFilename = filename.toLowerCase();
        return normalizedFilename.endsWith(".jpg")
            || normalizedFilename.endsWith(".jpeg")
            || normalizedFilename.endsWith(".png")
            || normalizedFilename.endsWith(".webp");
    }
}
