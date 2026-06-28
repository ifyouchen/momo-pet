package com.company.momo.pet.domain;

import java.time.Instant;
import java.time.LocalDate;

/**
 * pet 限界上下文 Pet 聚合根，管理宠物基础身份与启停状态。
 */
public final class Pet {

    private final PetId id;
    private final UserId ownerId;
    private PetName name;
    private final Species species;
    private final LocalDate birthday;
    private PetStatus status;
    private final Instant createdAt;

    private Pet(PetId id, UserId ownerId, PetName name, Species species, LocalDate birthday, PetStatus status, Instant createdAt) {
        this.id = id;
        this.ownerId = ownerId;
        this.name = name;
        this.species = species;
        this.birthday = birthday;
        this.status = status;
        this.createdAt = createdAt;
    }

    /**
     * 创建新宠物档案。
     *
     * @param ownerId 所属用户
     * @param name 宠物名称
     * @param species 宠物类型
     * @param birthday 生日，可为空
     * @return 宠物聚合根
     */
    public static Pet create(UserId ownerId, PetName name, Species species, LocalDate birthday) {
        LocalDate resolvedBirthday = birthday == null ? LocalDate.now() : birthday;
        return new Pet(PetId.newId(), ownerId, name, species, resolvedBirthday, PetStatus.ACTIVE, Instant.now());
    }

    /**
     * 从持久化数据恢复宠物聚合根。
     *
     * @return 宠物聚合根
     */
    public static Pet restore(PetId id, UserId ownerId, PetName name, Species species, LocalDate birthday, PetStatus status, Instant createdAt) {
        return new Pet(id, ownerId, name, species, birthday, status, createdAt);
    }

    /**
     * 重命名宠物。
     *
     * @param name 新名称
     */
    public void rename(PetName name) {
        this.name = name;
    }

    /**
     * 停用宠物档案。
     */
    public void deactivate() {
        this.status = PetStatus.INACTIVE;
    }

    public PetId id() {
        return id;
    }

    public UserId ownerId() {
        return ownerId;
    }

    public PetName name() {
        return name;
    }

    public Species species() {
        return species;
    }

    public LocalDate birthday() {
        return birthday;
    }

    public PetStatus status() {
        return status;
    }

    public Instant createdAt() {
        return createdAt;
    }
}
