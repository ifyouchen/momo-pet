package com.company.momo.pet.interfaces;

import com.company.momo.pet.application.ConfirmPetDnaApplicationService;
import com.company.momo.pet.domain.PetDnaSource;
import com.company.momo.platform.interfaces.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * pet Interface 层 Controller，负责 Pet DNA 用户确认。
 */
@RestController
public class PetDnaController {

    private final ConfirmPetDnaApplicationService confirmPetDnaApplicationService;

    public PetDnaController(ConfirmPetDnaApplicationService confirmPetDnaApplicationService) {
        this.confirmPetDnaApplicationService = confirmPetDnaApplicationService;
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
}
