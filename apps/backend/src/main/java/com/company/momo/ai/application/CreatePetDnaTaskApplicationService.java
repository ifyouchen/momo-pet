package com.company.momo.ai.application;

import com.company.momo.ai.domain.AiGenerationTask;
import com.company.momo.ai.domain.AiGenerationTaskRepository;
import com.company.momo.asset.domain.Asset;
import com.company.momo.asset.domain.AssetId;
import com.company.momo.asset.domain.AssetRepository;
import com.company.momo.asset.domain.PhotoRole;
import com.company.momo.pet.domain.Pet;
import com.company.momo.pet.domain.PetId;
import com.company.momo.pet.domain.PetRepository;
import com.company.momo.platform.domain.BusinessException;
import com.company.momo.platform.domain.ErrorCode;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * ai 应用服务，编排 Pet DNA 生成任务创建。
 */
@Service
public class CreatePetDnaTaskApplicationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(CreatePetDnaTaskApplicationService.class);
    private static final int MAX_REFERENCE_PHOTO_COUNT = 4;

    private final AiGenerationTaskRepository aiGenerationTaskRepository;
    private final AssetRepository assetRepository;
    private final PetRepository petRepository;
    private final ObjectMapper objectMapper;

    public CreatePetDnaTaskApplicationService(
        AiGenerationTaskRepository aiGenerationTaskRepository,
        AssetRepository assetRepository,
        PetRepository petRepository,
        ObjectMapper objectMapper
    ) {
        this.aiGenerationTaskRepository = aiGenerationTaskRepository;
        this.assetRepository = assetRepository;
        this.petRepository = petRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * 创建 Pet DNA 生成任务。
     *
     * @param petIdValue 宠物 ID
     * @param command 创建任务命令
     * @return 创建任务结果
     */
    @Transactional
    public CreateAiTaskResult createTask(String petIdValue, CreatePetDnaTaskCommand command) {
        Pet pet = petRepository.findActivePetById(PetId.of(petIdValue))
            .orElseThrow(() -> new BusinessException(ErrorCode.PET_NOT_FOUND));
        List<Asset> assets = findAndValidateAssets(pet, command);
        String requestPayload = buildRequestPayload(command, assets);
        AiGenerationTask task = AiGenerationTask.createPetDnaTask(pet.id(), pet.ownerId(), requestPayload);
        aiGenerationTaskRepository.save(task);
        LOGGER.info("【AI任务创建】【taskId={} petId={}】【type=PET_DNA_GENERATION status=PENDING】", task.id().value(), pet.id().value());
        return CreateAiTaskResult.from(task);
    }

    private List<Asset> findAndValidateAssets(Pet pet, CreatePetDnaTaskCommand command) {
        if (command.primaryPhotoAssetId() == null || command.primaryPhotoAssetId().isBlank()) {
            throw new BusinessException(ErrorCode.PRIMARY_PHOTO_REQUIRED);
        }
        List<String> referenceIds = command.referencePhotoAssetIds() == null ? List.of() : command.referencePhotoAssetIds();
        if (referenceIds.size() > MAX_REFERENCE_PHOTO_COUNT) {
            throw new BusinessException(ErrorCode.REFERENCE_PHOTO_LIMIT_EXCEEDED);
        }
        List<AssetId> requestedIds = new ArrayList<>();
        requestedIds.add(AssetId.of(command.primaryPhotoAssetId()));
        requestedIds.addAll(referenceIds.stream().map(AssetId::of).toList());
        List<Asset> assets = assetRepository.findReadyOriginalPhotosByAssetIds(requestedIds);
        ensureAllAssetsFound(requestedIds, assets);
        ensureAssetsBelongToPet(pet, assets);
        ensurePrimaryPhoto(command.primaryPhotoAssetId(), assets);
        return assets;
    }

    private void ensureAllAssetsFound(List<AssetId> requestedIds, List<Asset> assets) {
        if (assets.size() != requestedIds.size()) {
            throw new BusinessException(ErrorCode.ASSET_NOT_FOUND);
        }
    }

    private void ensureAssetsBelongToPet(Pet pet, List<Asset> assets) {
        boolean hasMismatch = assets.stream().anyMatch(asset -> !asset.petId().equals(pet.id()));
        if (hasMismatch) {
            throw new BusinessException(ErrorCode.ASSET_OWNER_MISMATCH);
        }
    }

    private void ensurePrimaryPhoto(String primaryPhotoAssetId, List<Asset> assets) {
        Asset primaryAsset = assets.stream()
            .filter(asset -> asset.id().value().equals(primaryPhotoAssetId))
            .findFirst()
            .orElseThrow(() -> new BusinessException(ErrorCode.PRIMARY_PHOTO_REQUIRED));
        if (primaryAsset.photoRole() != PhotoRole.PRIMARY) {
            throw new BusinessException(ErrorCode.PRIMARY_PHOTO_REQUIRED);
        }
    }

    private String buildRequestPayload(CreatePetDnaTaskCommand command, List<Asset> assets) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("name", command.name());
        payload.put("speciesHint", command.speciesHint());
        payload.put("userDescription", command.userDescription());
        payload.put("photos", assets.stream().map(this::photoPayload).toList());
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException exception) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED);
        }
    }

    private Map<String, Object> photoPayload(Asset asset) {
        Map<String, Object> photo = new LinkedHashMap<>();
        photo.put("assetId", asset.id().value());
        photo.put("photoRole", asset.photoRole().name());
        photo.put("storageKey", asset.storageKey().value());
        photo.put("contentType", asset.contentType());
        return photo;
    }
}
