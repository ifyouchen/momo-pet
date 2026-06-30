package com.company.momo.pet.interfaces;

import com.company.momo.pet.domain.PetDnaSource;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Sprint 7 Pet DNA 最新版本查询接口测试。
 */
@SpringBootTest
@AutoConfigureMockMvc
class PetDnaLatestApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldReturnLatestPetDna() throws Exception {
        String petId = createPet("DNA Latest Cat");
        confirmPetDna(petId);

        mockMvc.perform(get("/api/pets/{petId}/dna/latest", petId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.petId").value(petId))
            .andExpect(jsonPath("$.data.version").value(1))
            .andExpect(jsonPath("$.data.source").value("MANUAL"));
    }

    @Test
    void shouldReturnNotFoundForUnknownPet() throws Exception {
        mockMvc.perform(get("/api/pets/{petId}/dna/latest", "pet_does_not_exist"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("PET_NOT_FOUND"));
    }

    private String createPet(String name) throws Exception {
        return mockMvc.perform(post("/api/pets")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"" + name + "\",\"species\":\"CAT\",\"birthday\":\"2026-06-30\"}"))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString()
            .replaceAll(".*\\\"petId\\\":\\\"([^\\\"]+)\\\".*", "$1");
    }

    private void confirmPetDna(String petId) throws Exception {
        Map<String, Object> dna = Map.of(
            "name", "DNA Latest Cat",
            "species", "CAT",
            "appearance", Map.of("primaryColor", "Orange", "pattern", "Striped"),
            "personality", Map.of("primary", "Curious", "energyLevel", "MEDIUM"),
            "preferences", Map.of("favoriteFoods", java.util.List.of("DRIED_FISH"), "dislikedThings", java.util.List.of("BATH")),
            "voice", Map.of("catchphrases", java.util.List.of("摸摸我"))
        );
        String body = objectMapper.writeValueAsString(Map.of(
            "source", PetDnaSource.MANUAL.name(),
            "dna", dna
        ));
        mockMvc.perform(put("/api/pets/{petId}/dna", petId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isOk());
    }
}
