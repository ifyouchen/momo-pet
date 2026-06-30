package com.company.momo.pet.interfaces;

import com.company.momo.pet.application.ConfirmPetDnaApplicationService;
import com.company.momo.pet.application.GetPetDnaApplicationService;
import com.company.momo.pet.domain.PetDnaSource;
import com.company.momo.platform.interfaces.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * pet Interface 层 Controller，负责 Pet DNA 确认和最新版本查询。
 */
@RestController
public class PetDnaController {

    private final ConfirmPetDnaApplicationService confirmPetDnaApplicationService;
    private final GetPetDnaApplicationService getPetDnaApplicationService;

    public PetDnaController(
        ConfirmPetDnaApplicationService confirmPetDnaApplicationService,
        GetPetDnaApplicationService getPetDnaApplicationService
    ) {
        this.confirmPetDnaApplicationService = confirmPetDnaApplicationService;
        this.getPetDnaApplicationService = getPetDnaApplicationService;
    }

    /**
     * 确认或修订 Pet DNA。
     *
     * @param petId 宠物 ID
     * @param request 确认请求
     * @return 确认响应
     */
    @PutMapping("/api/pets/{petId}/dna")
    public ApiResponse<ConfirmPetDnaResponse> confirmPetDna(
        @PathVariable String petId,
        @Valid @RequestBody ConfirmPetDnaRequest request
    ) {
        return ApiResponse.success(ConfirmPetDnaResponse.from(
            confirmPetDnaApplicationService.confirmPetDna(petId, PetDnaSource.parse(request.source()), request.dna())
        ));
    }

    /**
     * 查询宠物最新 Pet DNA。
     *
     * @param petId 宠物 ID
     * @return 最新 Pet DNA 响应
     */
    @GetMapping("/api/pets/{petId}/dna/latest")
    public ApiResponse<PetDnaLatestResponse> getLatestPetDna(@PathVariable String petId) {
        return ApiResponse.success(PetDnaLatestResponse.from(getPetDnaApplicationService.getLatestPetDna(petId)));
    }
}
