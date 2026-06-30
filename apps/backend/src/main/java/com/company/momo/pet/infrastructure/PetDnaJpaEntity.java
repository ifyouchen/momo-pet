package com.company.momo.pet.infrastructure;

import com.company.momo.pet.domain.PetDnaSource;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * pet Infrastructure 层 Pet DNA JPA 实体，保存用户确认后的版本化 DNA。
 */
@Entity
@Table(name = "pet_dna")
class PetDnaJpaEntity {

    @Id
    @Column(name = "pet_dna_id", nullable = false, length = 64)
    private String id;

    @Column(name = "pet_id", nullable = false, length = 64)
    private String petId;

    @Column(name = "version", nullable = false)
    private int version;

    @Enumerated(EnumType.STRING)
    @Column(name = "source", nullable = false, length = 32)
    private PetDnaSource source;

    @Lob
    @Column(name = "dna_payload", nullable = false)
    private String dnaPayload;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "confirmed_at", nullable = false)
    private Instant confirmedAt;

    protected PetDnaJpaEntity() {
    }

    PetDnaJpaEntity(String id, String petId, int version, PetDnaSource source, String dnaPayload, Instant confirmedAt) {
        this.id = id;
        this.petId = petId;
        this.version = version;
        this.source = source;
        this.dnaPayload = dnaPayload;
        this.createdAt = confirmedAt;
        this.confirmedAt = confirmedAt;
    }
}
