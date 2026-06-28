package com.company.momo.care.interfaces;

import com.company.momo.care.application.CarePetApplicationService;
import com.company.momo.pet.domain.FoodCode;
import com.company.momo.pet.domain.TouchType;
import com.company.momo.platform.interfaces.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * care Interface 层 Controller，负责 MVP 照顾行为入口。
 */
@RestController
@RequestMapping("/api/pets/{petId}/care")
public class CareController {

    private final CarePetApplicationService carePetApplicationService;

    public CareController(CarePetApplicationService carePetApplicationService) {
        this.carePetApplicationService = carePetApplicationService;
    }

    /**
     * 喂食宠物。
     *
     * @param petId 宠物 ID
     * @param request 喂食请求
     * @return 统一照顾响应
     */
    @PostMapping("/feed")
    public ApiResponse<CarePetResponse> feed(@PathVariable String petId, @Valid @RequestBody FeedPetRequest request) {
        return ApiResponse.success(CarePetResponse.from(
            carePetApplicationService.feed(petId, FoodCode.parse(request.foodCode()))
        ));
    }

    /**
     * 抚摸宠物。
     *
     * @param petId 宠物 ID
     * @param request 抚摸请求
     * @return 统一照顾响应
     */
    @PostMapping("/touch")
    public ApiResponse<CarePetResponse> touch(@PathVariable String petId, @Valid @RequestBody TouchPetRequest request) {
        return ApiResponse.success(CarePetResponse.from(
            carePetApplicationService.touch(petId, TouchType.parse(request.touchType()))
        ));
    }

    /**
     * 清理宠物事件。
     *
     * @param petId 宠物 ID
     * @param request 清理请求
     * @return 统一照顾响应
     */
    @PostMapping("/clean")
    public ApiResponse<CarePetResponse> clean(@PathVariable String petId, @Valid @RequestBody CleanPetRequest request) {
        return ApiResponse.success(CarePetResponse.from(
            carePetApplicationService.clean(petId, request.cleanEventId())
        ));
    }
}
