package com.company.momo.pet.interfaces;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
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
            .andExpect(jsonPath("$.data.items[*].species", everyItem(is("BIRD"))));
    }

    @Test
    void shouldFilterPetsByStatus() throws Exception {
        createPet("Status Filter Cat", "CAT");

        mockMvc.perform(get("/api/pets").param("status", "ACTIVE"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.items[*].status", everyItem(is("ACTIVE"))));
    }

    @Test
    void shouldFilterPetsBySpeciesAndStatus() throws Exception {
        createPet("Bird Status Filter", "BIRD");

        mockMvc.perform(get("/api/pets").param("species", "BIRD").param("status", "ACTIVE"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.items[*].species", everyItem(is("BIRD"))))
            .andExpect(jsonPath("$.data.items[*].status", everyItem(is("ACTIVE"))));
    }

    @Test
    void shouldPagePets() throws Exception {
        createPet("Pager A", "CAT");
        createPet("Pager B", "CAT");

        mockMvc.perform(get("/api/pets").param("page", "0").param("size", "1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.items", hasSize(1)))
            .andExpect(jsonPath("$.data.total", greaterThanOrEqualTo(2)))
            .andExpect(jsonPath("$.data.page").value(0))
            .andExpect(jsonPath("$.data.size").value(1));
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
