package com.company.momo.ai.domain;

import com.company.momo.pet.domain.PetId;
import com.company.momo.pet.domain.UserId;
import com.company.momo.platform.domain.BusinessException;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * AiGenerationTask 聚合根领域测试。
 */
class AiGenerationTaskTest {

    @Test
    void cancel_whenPending_shouldBecomeCanceled() {
        AiGenerationTask task = AiGenerationTask.createPetDnaTask(
            PetId.of("pet_001"),
            UserId.localUser(),
            "{}"
        );

        AiGenerationTask canceled = task.cancel();

        assertThat(canceled.status()).isEqualTo(AiTaskStatus.CANCELED);
    }

    @Test
    void cancel_whenRunning_shouldBecomeCanceled() {
        AiGenerationTask task = AiGenerationTask.createPetDnaTask(
            PetId.of("pet_001"),
            UserId.localUser(),
            "{}"
        ).markRunning();

        AiGenerationTask canceled = task.cancel();

        assertThat(canceled.status()).isEqualTo(AiTaskStatus.CANCELED);
    }

    @Test
    void cancel_whenSucceeded_shouldThrowNotCancelable() {
        AiGenerationTask task = AiGenerationTask.createPetDnaTask(
            PetId.of("pet_001"),
            UserId.localUser(),
            "{}"
        ).markRunning().markSucceeded("{\"name\":\"Momo\"}");

        assertThatThrownBy(task::cancel)
            .isInstanceOf(BusinessException.class);
    }

    @Test
    void cancel_whenFailed_shouldThrowNotCancelable() {
        AiGenerationTask task = AiGenerationTask.createPetDnaTask(
            PetId.of("pet_001"),
            UserId.localUser(),
            "{}"
        ).markRunning().markFailed(AiTaskErrorCode.AI_GENERATION_FAILED);

        assertThatThrownBy(task::cancel)
            .isInstanceOf(BusinessException.class);
    }

    @Test
    void cancel_whenAlreadyCanceled_shouldThrowNotCancelable() {
        AiGenerationTask task = AiGenerationTask.createPetDnaTask(
            PetId.of("pet_001"),
            UserId.localUser(),
            "{}"
        ).cancel();

        assertThatThrownBy(task::cancel)
            .isInstanceOf(BusinessException.class);
    }
}
