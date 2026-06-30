package com.company.momo.pet.domain;

import com.company.momo.platform.domain.BusinessException;
import com.company.momo.platform.domain.ErrorCode;

import java.time.Instant;

/**
 * pet 限界上下文 PetState 聚合根，管理宠物养成状态与照顾行为规则。
 */
public final class PetState {

    private static final int MAX_STATUS = 100;
    private static final int MIN_STATUS = 0;
    private static final int FULL_THRESHOLD = 95;

    private final PetId petId;
    private int hunger;
    private int mood;
    private int cleanliness;
    private int energy;
    private int intimacy;
    private int experience;
    private int level;
    private Instant updatedAt;

    private PetState(PetId petId, int hunger, int mood, int cleanliness, int energy, int intimacy, int experience, int level, Instant updatedAt) {
        this.petId = petId;
        this.hunger = clamp(hunger);
        this.mood = clamp(mood);
        this.cleanliness = clamp(cleanliness);
        this.energy = clamp(energy);
        this.intimacy = clamp(intimacy);
        this.experience = Math.max(0, experience);
        this.level = Math.max(1, level);
        this.updatedAt = updatedAt;
    }

    /**
     * 初始化宠物状态。
     *
     * @param petId 宠物 ID
     * @return 初始状态聚合根
     */
    public static PetState initialize(PetId petId) {
        return new PetState(petId, 70, 80, 70, 60, 20, 0, 1, Instant.now());
    }

    /**
     * 从持久化数据恢复宠物状态。
     *
     * @return 状态聚合根
     */
    public static PetState restore(PetId petId, int hunger, int mood, int cleanliness, int energy, int intimacy, int experience, int level, Instant updatedAt) {
        return new PetState(petId, hunger, mood, cleanliness, energy, intimacy, experience, level, updatedAt);
    }

    /**
     * 喂食并应用 MVP 状态变化。
     *
     * @param foodCode 食物编码
     */
    public void feed(FoodCode foodCode) {
        if (hunger >= FULL_THRESHOLD) {
            throw new BusinessException(ErrorCode.PET_ALREADY_FULL);
        }
        hunger = clamp(hunger + 18);
        mood = clamp(mood + 5);
        gainExperience(10);
        touchUpdatedAt();
    }

    /**
     * 抚摸并应用 MVP 状态变化。
     *
     * @param touchType 抚摸类型
     */
    public void touch(TouchType touchType) {
        intimacy = clamp(intimacy + 3);
        mood = clamp(mood + 8);
        gainExperience(5);
        touchUpdatedAt();
    }

    /**
     * 清理并应用 MVP 状态变化。
     *
     * @param cleanEventId 清理事件 ID
     */
    public void clean(String cleanEventId) {
        if (cleanEventId == null || cleanEventId.isBlank()) {
            throw new BusinessException(ErrorCode.CLEAN_EVENT_NOT_FOUND);
        }
        cleanliness = clamp(cleanliness + 25);
        mood = clamp(mood + 4);
        gainExperience(8);
        touchUpdatedAt();
    }

    /**
     * 聊天并应用 MVP 状态变化。
     */
    public void chat() {
        intimacy = clamp(intimacy + 2);
        mood = clamp(mood + 2);
        gainExperience(6);
        touchUpdatedAt();
    }

    private void gainExperience(int delta) {
        experience += delta;
        level = Math.max(1, experience / 100 + 1);
    }

    private void touchUpdatedAt() {
        updatedAt = Instant.now();
    }

    private static int clamp(int value) {
        return Math.max(MIN_STATUS, Math.min(MAX_STATUS, value));
    }

    public PetId petId() {
        return petId;
    }

    public int hunger() {
        return hunger;
    }

    public int mood() {
        return mood;
    }

    public int cleanliness() {
        return cleanliness;
    }

    public int energy() {
        return energy;
    }

    public int intimacy() {
        return intimacy;
    }

    public int experience() {
        return experience;
    }

    public int level() {
        return level;
    }

    public Instant updatedAt() {
        return updatedAt;
    }
}
