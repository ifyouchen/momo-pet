package com.company.momo.pet.application;

import com.company.momo.pet.domain.Pet;
import com.company.momo.pet.domain.PetName;
import com.company.momo.pet.domain.PetRepository;
import com.company.momo.pet.domain.PetState;
import com.company.momo.pet.domain.PetStateRepository;
import com.company.momo.pet.domain.Species;
import com.company.momo.pet.domain.UserId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * pet 应用服务，编排创建宠物和初始化宠物状态用例。
 */
@Service
public class CreatePetApplicationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(CreatePetApplicationService.class);

    private final PetRepository petRepository;
    private final PetStateRepository petStateRepository;

    public CreatePetApplicationService(PetRepository petRepository, PetStateRepository petStateRepository) {
        this.petRepository = petRepository;
        this.petStateRepository = petStateRepository;
    }

    /**
     * 创建宠物并初始化状态。
     *
     * @param name 宠物名称
     * @param species 宠物类型
     * @param birthday 宠物生日
     * @return 宠物详情结果
     */
    @Transactional
    public PetDetailResult createPet(String name, Species species, LocalDate birthday) {
        Pet pet = Pet.create(UserId.localUser(), new PetName(name), species, birthday);
        petRepository.save(pet);
        petStateRepository.save(PetState.initialize(pet.id()));
        LOGGER.info("【创建宠物】【petId={},userId={}】【species={},status={}】", pet.id().value(), pet.ownerId().value(), pet.species(), pet.status());
        return PetDetailResult.from(pet);
    }
}
