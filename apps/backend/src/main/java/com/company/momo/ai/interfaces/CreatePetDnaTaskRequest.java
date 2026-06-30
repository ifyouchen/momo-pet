package com.company.momo.ai.interfaces;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

/**
 * ai Interface 层创建 Pet DNA 任务请求。
 *
 * @param name 宠物名称
 * @param speciesHint 物种提示
 * @param primaryPhotoAssetId 主图资源 ID
 * @param referencePhotoAssetIds 参考图资源 ID 列表
 * @param userDescription 用户描述
 */
public record CreatePetDnaTaskRequest(
    @NotBlank String name,
    @NotBlank String speciesHint,
    @NotBlank String primaryPhotoAssetId,
    List<String> referencePhotoAssetIds,
    String userDescription
) {
}
