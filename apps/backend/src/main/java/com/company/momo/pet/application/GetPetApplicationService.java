package com.company.momo.pet.application;

import com.company.momo.pet.domain.Pet;
import com.company.momo.pet.domain.PetId;
import com.company.momo.pet.domain.PetRepository;
import com.company.momo.pet.domain.PetStateRepository;
import com.company.momo.platform.domain.BusinessException;
import com.company.momo.platform.domain.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * pet 应用服务，编排查询宠物详情和状态用例。
 */
@Service
public class GetPetApplicationService {

    private final PetRepository petRepository;
    private final PetStateRepository petStateRepository;

    public GetPetApplicationService(PetRepository petRepository, PetStateRepository petStateRepository) {
        this.petRepository = petRepository;
        this.petStateRepository = petStateRepository;
    }

    /**
     * 查询宠物详情。
     *
     * @param petId 宠物 ID
     * @return 宠物详情结果
     */
    @Transactional(readOnly = true)
    public PetDetailResult getPet(String petId) {
        return PetDetailResult.from(findActivePet(petId));
    }

    /**
     * 查询宠物状态。
     *
     * @param petId 宠物 ID
     * @return 宠物状态结果
     */
    @Transactional(readOnly = true)
    public PetStateResult getState(String petId) {
        Pet pet = findActivePet(petId);
        return petStateRepository.findStateByPetId(pet.id())
            .map(PetStateResult::from)
            .orElseThrow(() -> new BusinessException(ErrorCode.PET_NOT_FOUND));
    }

    private Pet findActivePet(String petId) {
        return petRepository.findActivePetById(PetId.of(petId))
            .orElseThrow(() -> new BusinessException(ErrorCode.PET_NOT_FOUND));
    }
}
