package com.company.momo.pet.interfaces;

import com.company.momo.MomoBackendApplication;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 宠物创建和照顾接口集成测试。
 */
@SpringBootTest(classes = MomoBackendApplication.class)
@AutoConfigureMockMvc
class PetCareApiTest {

    @Autowired
    private MockMvc mockMvc;

    /**
     * 验证创建宠物会同时初始化状态，并能执行三个照顾行为。
     *
     * @throws Exception MockMvc 执行失败
     */
    @Test
    void petCareFlow_whenDefaultPetCreated_shouldUpdateState() throws Exception {
        String response = mockMvc.perform(post("/api/pets")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Momo Pet\",\"species\":\"CAT\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.petId", startsWith("pet_")))
            .andReturn()
            .getResponse()
            .getContentAsString();
        String petId = response.replaceAll(".*\\\"petId\\\":\\\"([^\\\"]+)\\\".*", "$1");

        mockMvc.perform(get("/api/pets/" + petId + "/state"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.hunger").value(70));

        mockMvc.perform(post("/api/pets/" + petId + "/care/feed")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"foodCode\":\"DRIED_FISH\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.state.hunger").value(88));

        mockMvc.perform(post("/api/pets/" + petId + "/care/touch")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"touchType\":\"HEAD\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.state.intimacy").value(23));

        mockMvc.perform(post("/api/pets/" + petId + "/care/clean")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"cleanEventId\":\"default-clean-event\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.state.cleanliness").value(95));
    }

    /**
     * 验证不存在的宠物返回统一错误码。
     *
     * @throws Exception MockMvc 执行失败
     */
    @Test
    void getState_whenPetMissing_shouldReturnPetNotFound() throws Exception {
        mockMvc.perform(get("/api/pets/pet_missing/state"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.code").value("PET_NOT_FOUND"));
    }
}
