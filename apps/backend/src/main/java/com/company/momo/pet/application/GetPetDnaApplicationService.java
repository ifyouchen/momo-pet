package com.company.momo.pet.application;

import com.company.momo.pet.domain.PetDnaRepository;
import com.company.momo.pet.domain.PetId;
import com.company.momo.pet.domain.PetRepository;
import com.company.momo.platform.domain.BusinessException;
import com.company.momo.platform.domain.ErrorCode;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * pet 应用服务，查询宠物最新 Pet DNA。
 */
@Service
public class GetPetDnaApplicationService {

    private final PetRepository petRepository;
    private final PetDnaRepository petDnaRepository;
    private final ObjectMapper objectMapper;

    public GetPetDnaApplicationService(
        PetRepository petRepository,
        PetDnaRepository petDnaRepository,
        ObjectMapper objectMapper
    ) {
        this.petRepository = petRepository;
        this.petDnaRepository = petDnaRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * 查询宠物最新 Pet DNA。
     *
     * @param petIdValue 宠物 ID
     * @return Pet DNA 详情结果
     */
    @Transactional(readOnly = true)
    public PetDnaLatestResult getLatestPetDna(String petIdValue) {
        PetId petId = PetId.of(petIdValue);
        petRepository.findActivePetById(petId).orElseThrow(() -> new BusinessException(ErrorCode.PET_NOT_FOUND));
        PetDnaRepository.LatestPetDna latest = petDnaRepository.findLatestByPetId(petId);
        if (latest == null) {
            throw new BusinessException(ErrorCode.PET_DNA_INVALID);
        }
        return new PetDnaLatestResult(
            petId.value(),
            latest.version(),
            latest.source().name(),
            parseDna(latest.dnaPayload()),
            latest.confirmedAt()
        );
    }

    private JsonNode parseDna(String dnaPayload) {
        if (dnaPayload == null || dnaPayload.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readTree(dnaPayload);
        } catch (JsonProcessingException exception) {
            throw new BusinessException(ErrorCode.AI_RESULT_INVALID);
        }
    }
}
