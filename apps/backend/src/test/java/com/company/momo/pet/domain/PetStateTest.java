package com.company.momo.pet.domain;

import com.company.momo.platform.domain.BusinessException;
import com.company.momo.platform.domain.ErrorCode;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * PetState 聚合根领域测试。
 */
class PetStateTest {

    /**
     * 验证初始化状态符合 Sprint 1 默认值。
     */
    @Test
    void initialize_whenPetCreated_shouldUseDefaultState() {
        PetState state = PetState.initialize(PetId.newId());

        assertThat(state.hunger()).isEqualTo(70);
        assertThat(state.mood()).isEqualTo(80);
        assertThat(state.cleanliness()).isEqualTo(70);
        assertThat(state.energy()).isEqualTo(60);
        assertThat(state.intimacy()).isEqualTo(20);
        assertThat(state.level()).isEqualTo(1);
    }

    /**
     * 验证喂食会提升饱食度、心情和经验。
     */
    @Test
    void feed_whenNotFull_shouldIncreaseState() {
        PetState state = PetState.initialize(PetId.newId());

        state.feed(FoodCode.DRIED_FISH);

        assertThat(state.hunger()).isEqualTo(88);
        assertThat(state.mood()).isEqualTo(85);
        assertThat(state.experience()).isEqualTo(10);
    }

    /**
     * 验证过饱时不能继续喂食。
     */
    @Test
    void feed_whenAlreadyFull_shouldThrowPetAlreadyFull() {
        PetState state = PetState.restore(PetId.newId(), 96, 80, 70, 60, 20, 0, 1, java.time.Instant.now());

        assertThatThrownBy(() -> state.feed(FoodCode.DRIED_FISH))
            .isInstanceOf(BusinessException.class)
            .extracting("errorCode")
            .isEqualTo(ErrorCode.PET_ALREADY_FULL);
    }

    /**
     * 验证抚摸会提升亲密度、心情和经验。
     */
    @Test
    void touch_whenHeadTouched_shouldIncreaseState() {
        PetState state = PetState.initialize(PetId.newId());

        state.touch(TouchType.HEAD);

        assertThat(state.intimacy()).isEqualTo(23);
        assertThat(state.mood()).isEqualTo(88);
        assertThat(state.experience()).isEqualTo(5);
    }

    /**
     * 验证清理会提升清洁度、心情和经验。
     */
    @Test
    void clean_whenEventExists_shouldIncreaseState() {
        PetState state = PetState.initialize(PetId.newId());

        state.clean("default-clean-event");

        assertThat(state.cleanliness()).isEqualTo(95);
        assertThat(state.mood()).isEqualTo(84);
        assertThat(state.experience()).isEqualTo(8);
    }

    /**
     * 验证状态值不会超过 100。
     */
    @Test
    void clean_whenStateNearMax_shouldClampToMax() {
        PetState state = PetState.restore(PetId.newId(), 70, 99, 99, 60, 20, 0, 1, java.time.Instant.now());

        state.clean("default-clean-event");

        assertThat(state.cleanliness()).isEqualTo(100);
        assertThat(state.mood()).isEqualTo(100);
    }
}
