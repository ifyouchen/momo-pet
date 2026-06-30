package com.company.momo.ai.application;

import java.util.List;

/**
 * ai Application 层创建 Pet DNA 任务命令。
 *
 * @param name 用户填写的宠物名称
 * @param speciesHint 用户选择的物种提示
 * @param primaryPhotoAssetId 主图资源 ID
 * @param referencePhotoAssetIds 参考图资源 ID 列表
 * @param userDescription 用户描述
 */
public record CreatePetDnaTaskCommand(
    String name,
    String speciesHint,
    String primaryPhotoAssetId,
    List<String> referencePhotoAssetIds,
    String userDescription
) {
}
