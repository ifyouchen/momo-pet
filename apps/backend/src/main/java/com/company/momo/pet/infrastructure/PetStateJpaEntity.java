package com.company.momo.pet.infrastructure;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * pet 状态 JPA 持久化对象，仅用于 Infrastructure 层数据库映射。
 */
@Entity
@Table(name = "pet_states")
class PetStateJpaEntity {

    @Id
    private String petId;
    private int hunger;
    private int mood;
    private int cleanliness;
    private int energy;
    private int intimacy;
    private int experience;
    private int level;
    private Instant updatedAt;

    protected PetStateJpaEntity() {
    }

    PetStateJpaEntity(String petId, int hunger, int mood, int cleanliness, int energy, int intimacy, int experience, int level, Instant updatedAt) {
        this.petId = petId;
        this.hunger = hunger;
        this.mood = mood;
        this.cleanliness = cleanliness;
        this.energy = energy;
        this.intimacy = intimacy;
        this.experience = experience;
        this.level = level;
        this.updatedAt = updatedAt;
    }

    String petId() {
        return petId;
    }

    int hunger() {
        return hunger;
    }

    int mood() {
        return mood;
    }

    int cleanliness() {
        return cleanliness;
    }

    int energy() {
        return energy;
    }

    int intimacy() {
        return intimacy;
    }

    int experience() {
        return experience;
    }

    int level() {
        return level;
    }

    Instant updatedAt() {
        return updatedAt;
    }
}
