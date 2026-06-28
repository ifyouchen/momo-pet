package com.company.momo.pet.domain;

import com.company.momo.platform.domain.BusinessException;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Pet 聚合根领域测试。
 */
class PetTest {

    /**
     * 验证创建宠物时名称不能为空。
     */
    @Test
    void create_whenNameBlank_shouldThrowValidationException() {
        assertThatThrownBy(() -> Pet.create(UserId.localUser(), new PetName(""), Species.CAT, null))
            .isInstanceOf(BusinessException.class);
    }

    /**
     * 验证创建宠物时默认状态为可用。
     */
    @Test
    void create_whenValidInput_shouldCreateActivePet() {
        Pet pet = Pet.create(UserId.localUser(), new PetName("Momo Pet"), Species.CAT, null);

        assertThat(pet.id().value()).startsWith("pet_");
        assertThat(pet.status()).isEqualTo(PetStatus.ACTIVE);
    }
}
