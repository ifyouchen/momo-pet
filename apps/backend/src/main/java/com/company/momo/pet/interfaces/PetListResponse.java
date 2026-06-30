package com.company.momo.pet.interfaces;

import com.company.momo.pet.application.PetDetailResult;
import com.company.momo.pet.application.PetListResult;

import java.util.List;

/**
 * pet Interface 层宠物列表响应。
 */
public record PetListResponse(List<PetResponse> items, long total, int page, int size) {

    /**
     * 从应用层结果转换为接口响应。
     *
     * @param result 应用层结果
     * @return 接口响应
     */
    public static PetListResponse from(PetListResult result) {
        List<PetResponse> items = result.items().stream().map(PetResponse::from).toList();
        return new PetListResponse(items, result.total(), result.page(), result.size());
    }
}
