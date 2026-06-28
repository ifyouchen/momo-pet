package com.company.momo.care.application;

import com.company.momo.pet.application.PetStateResult;
import com.company.momo.pet.domain.FoodCode;
import com.company.momo.pet.domain.Pet;
import com.company.momo.pet.domain.PetId;
import com.company.momo.pet.domain.PetRepository;
import com.company.momo.pet.domain.PetState;
import com.company.momo.pet.domain.PetStateRepository;
import com.company.momo.pet.domain.TouchType;
import com.company.momo.platform.domain.BusinessException;
import com.company.momo.platform.domain.ErrorCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * care 应用服务，编排喂食、抚摸和清理三个 MVP 照顾用例。
 */
@Service
public class CarePetApplicationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(CarePetApplicationService.class);

    private final PetRepository petRepository;
    private final PetStateRepository petStateRepository;

    public CarePetApplicationService(PetRepository petRepository, PetStateRepository petStateRepository) {
        this.petRepository = petRepository;
        this.petStateRepository = petStateRepository;
    }

    /**
     * 喂食宠物。
     *
     * @param petId 宠物 ID
     * @param foodCode 食物编码
     * @return 更新后的宠物状态
     */
    @Transactional
    public PetStateResult feed(String petId, FoodCode foodCode) {
        Pet pet = findPet(petId);
        PetState state = findState(pet.id());
        state.feed(foodCode);
        petStateRepository.save(state);
        LOGGER.info("【喂食宠物】【petId={}】【foodCode={},hunger={}】", petId, foodCode, state.hunger());
        return PetStateResult.from(state);
    }

    /**
     * 抚摸宠物。
     *
     * @param petId 宠物 ID
     * @param touchType 抚摸类型
     * @return 更新后的宠物状态
     */
    @Transactional
    public PetStateResult touch(String petId, TouchType touchType) {
        Pet pet = findPet(petId);
        PetState state = findState(pet.id());
        state.touch(touchType);
        petStateRepository.save(state);
        LOGGER.info("【抚摸宠物】【petId={}】【touchType={},intimacy={}】", petId, touchType, state.intimacy());
        return PetStateResult.from(state);
    }

    /**
     * 清理宠物事件。
     *
     * @param petId 宠物 ID
     * @param cleanEventId 清理事件 ID
     * @return 更新后的宠物状态
     */
    @Transactional
    public PetStateResult clean(String petId, String cleanEventId) {
        Pet pet = findPet(petId);
        PetState state = findState(pet.id());
        state.clean(cleanEventId);
        petStateRepository.save(state);
        LOGGER.info("【清理宠物】【petId={}】【cleanEventId={},cleanliness={}】", petId, cleanEventId, state.cleanliness());
        return PetStateResult.from(state);
    }

    private Pet findPet(String petId) {
        return petRepository.findActivePetById(PetId.of(petId))
            .orElseThrow(() -> new BusinessException(ErrorCode.PET_NOT_FOUND));
    }

    private PetState findState(PetId petId) {
        return petStateRepository.findStateByPetId(petId)
            .orElseThrow(() -> new BusinessException(ErrorCode.PET_NOT_FOUND));
    }
}
