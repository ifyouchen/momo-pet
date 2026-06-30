package com.company.momo.pet.domain;

/**
 * pet 领域仓储接口，负责用户确认后的 Pet DNA 版本化持久化。
 */
public interface PetDnaRepository {

    /**
     * 查询指定宠物的下一个 Pet DNA 版本号。
     *
     * @param petId 宠物 ID
     * @return 下一个版本号
     */
    int nextVersionForPet(PetId petId);

    /**
     * 保存用户确认后的 Pet DNA。
     *
     * @param petId 宠物 ID
     * @param version Pet DNA 版本
     * @param source Pet DNA 来源
     * @param dnaPayload Pet DNA JSON
     */
    void saveConfirmedPetDna(PetId petId, int version, PetDnaSource source, String dnaPayload);

    /**
     * 查询指定宠物的最新 Pet DNA 记录。
     *
     * @param petId 宠物 ID
     * @return 最新 Pet DNA 记录
     */
    LatestPetDna findLatestByPetId(PetId petId);

    /**
     * 最新 Pet DNA 记录。
     *
     * @param version 版本
     * @param source 来源
     * @param dnaPayload Pet DNA JSON
     * @param confirmedAt 确认时间
     */
    record LatestPetDna(int version, PetDnaSource source, String dnaPayload, java.time.Instant confirmedAt) {
    }
}
