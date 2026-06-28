package com.company.momo.pet.infrastructure;

import com.company.momo.pet.domain.PetStatus;
import com.company.momo.pet.domain.Species;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;

/**
 * pet 基础档案 JPA 持久化对象，仅用于 Infrastructure 层数据库映射。
 */
@Entity
@Table(name = "pets")
class PetJpaEntity {

    @Id
    private String id;
    private String ownerId;
    private String name;
    @Enumerated(EnumType.STRING)
    private Species species;
    private LocalDate birthday;
    @Enumerated(EnumType.STRING)
    private PetStatus status;
    private Instant createdAt;

    protected PetJpaEntity() {
    }

    PetJpaEntity(String id, String ownerId, String name, Species species, LocalDate birthday, PetStatus status, Instant createdAt) {
        this.id = id;
        this.ownerId = ownerId;
        this.name = name;
        this.species = species;
        this.birthday = birthday;
        this.status = status;
        this.createdAt = createdAt;
    }

    String id() {
        return id;
    }

    String ownerId() {
        return ownerId;
    }

    String name() {
        return name;
    }

    Species species() {
        return species;
    }

    LocalDate birthday() {
        return birthday;
    }

    PetStatus status() {
        return status;
    }

    Instant createdAt() {
        return createdAt;
    }
}
