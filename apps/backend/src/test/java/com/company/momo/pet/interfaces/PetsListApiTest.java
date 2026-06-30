package com.company.momo.pet.interfaces;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Sprint 7 宠物列表接口测试。
 */
@SpringBootTest
@AutoConfigureMockMvc
class PetsListApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldListAllPetsByDefault() throws Exception {
        String petId = createPet("List Test Cat", "CAT");

        mockMvc.perform(get("/api/pets"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.total", greaterThanOrEqualTo(1)))
            .andExpect(jsonPath("$.data.items", hasSize(greaterThanOrEqualTo(1))))
            .andExpect(jsonPath("$.data.items[0].petId").value(petId))
            .andExpect(jsonPath("$.data.items[0].species").value("CAT"));
    }

    @Test
    void shouldFilterPetsBySpecies() throws Exception {
        createPet("Bird Filter", "BIRD");

        mockMvc.perform(get("/api/pets").param("species", "BIRD"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.items[*].species", org.hamcrest.Matchers.everyItem(org.hamcrest.Matchers.is("BIRD"))));
    }

    @Test
    void shouldReturnBadRequestForUnknownSpecies() throws Exception {
        mockMvc.perform(get("/api/pets").param("species", "DINOSAUR"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.code").value("SPECIES_UNSUPPORTED"));
    }

    @Test
    void shouldReturnEmptyPageForUnknownPetIdInDetail() throws Exception {
        mockMvc.perform(get("/api/pets/{petId}", "pet_does_not_exist"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("PET_NOT_FOUND"));
    }

    private String createPet(String name, String species) throws Exception {
        return mockMvc.perform(post("/api/pets")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"" + name + "\",\"species\":\"" + species + "\",\"birthday\":\"2026-06-30\"}"))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString()
            .replaceAll(".*\\\"petId\\\":\\\"([^\\\"]+)\\\".*", "$1");
    }
}
