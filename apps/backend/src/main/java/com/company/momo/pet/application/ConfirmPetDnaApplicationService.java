package com.company.momo.pet.application;

import com.company.momo.pet.domain.Pet;
import com.company.momo.pet.domain.PetDnaRepository;
import com.company.momo.pet.domain.PetDnaSource;
import com.company.momo.pet.domain.PetId;
import com.company.momo.pet.domain.PetRepository;
import com.company.momo.platform.domain.BusinessException;
import com.company.momo.platform.domain.ErrorCode;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * pet 应用服务，编排用户确认或手动保存 Pet DNA。
 */
@Service
public class ConfirmPetDnaApplicationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ConfirmPetDnaApplicationService.class);

    private final PetRepository petRepository;
    private final PetDnaRepository petDnaRepository;
    private final ObjectMapper objectMapper;

    public ConfirmPetDnaApplicationService(
        PetRepository petRepository,
        PetDnaRepository petDnaRepository,
        ObjectMapper objectMapper
    ) {
        this.petRepository = petRepository;
        this.petDnaRepository = petDnaRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * 确认 Pet DNA 并生成新版本。
     *
     * @param petIdValue 宠物 ID
     * @param source Pet DNA 来源
     * @param dnaPayload Pet DNA JSON
     * @return 确认结果
     */
    @Transactional
    public ConfirmPetDnaResult confirmPetDna(String petIdValue, PetDnaSource source, JsonNode dnaPayload) {
        ensureValidDnaPayload(dnaPayload);
        Pet pet = petRepository.findActivePetById(PetId.of(petIdValue))
            .orElseThrow(() -> new BusinessException(ErrorCode.PET_NOT_FOUND));
        int nextVersion = petDnaRepository.nextVersionForPet(pet.id());
        petDnaRepository.saveConfirmedPetDna(pet.id(), nextVersion, source, writePayload(dnaPayload));
        LOGGER.info("【PetDNA确认】【petId={} version={}】【source={}】", pet.id().value(), nextVersion, source);
        return new ConfirmPetDnaResult(pet.id().value(), nextVersion);
    }

    private void ensureValidDnaPayload(JsonNode dnaPayload) {
        if (dnaPayload == null || dnaPayload.path("name").asText("").isBlank()) {
            throw new BusinessException(ErrorCode.PET_DNA_INVALID);
        }
        if (dnaPayload.path("species").asText("").isBlank()) {
            throw new BusinessException(ErrorCode.PET_DNA_INVALID);
        }
    }

    private String writePayload(JsonNode dnaPayload) {
        try {
            return objectMapper.writeValueAsString(dnaPayload);
        } catch (JsonProcessingException exception) {
            throw new BusinessException(ErrorCode.PET_DNA_INVALID);
        }
    }
}
