package com.company.momo.pet.interfaces;

import com.company.momo.pet.application.CreatePetApplicationService;
import com.company.momo.pet.application.GetPetApplicationService;
import com.company.momo.pet.domain.Species;
import com.company.momo.platform.interfaces.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * pet Interface 层 Controller，负责宠物创建、详情和状态查询。
 */
@RestController
@RequestMapping("/api/pets")
public class PetController {

    private final CreatePetApplicationService createPetApplicationService;
    private final GetPetApplicationService getPetApplicationService;

    public PetController(CreatePetApplicationService createPetApplicationService, GetPetApplicationService getPetApplicationService) {
        this.createPetApplicationService = createPetApplicationService;
        this.getPetApplicationService = getPetApplicationService;
    }

    /**
     * 创建宠物并初始化状态。
     *
     * @param request 创建宠物请求
     * @return 统一宠物详情响应
     */
    @PostMapping
    public ApiResponse<PetResponse> createPet(@Valid @RequestBody CreatePetRequest request) {
        return ApiResponse.success(PetResponse.from(
            createPetApplicationService.createPet(request.name(), Species.parse(request.species()), request.birthday())
        ));
    }

    /**
     * 获取宠物详情。
     *
     * @param petId 宠物 ID
     * @return 统一宠物详情响应
     */
    @GetMapping("/{petId}")
    public ApiResponse<PetResponse> getPet(@PathVariable String petId) {
        return ApiResponse.success(PetResponse.from(getPetApplicationService.getPet(petId)));
    }

    /**
     * 获取宠物状态。
     *
     * @param petId 宠物 ID
     * @return 统一宠物状态响应
     */
    @GetMapping("/{petId}/state")
    public ApiResponse<PetStateResponse> getState(@PathVariable String petId) {
        return ApiResponse.success(PetStateResponse.from(getPetApplicationService.getState(petId)));
    }
}
