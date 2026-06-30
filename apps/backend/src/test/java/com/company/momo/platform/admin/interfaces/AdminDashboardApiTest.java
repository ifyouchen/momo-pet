package com.company.momo.platform.admin.interfaces;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Sprint 7 Admin Dashboard 接口测试。
 */
@SpringBootTest
@AutoConfigureMockMvc
class AdminDashboardApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldReturnDashboardMetrics() throws Exception {
        createPet("Dashboard Test Cat");

        mockMvc.perform(get("/api/admin/dashboard/metrics"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.totalPets", greaterThanOrEqualTo(1)))
            .andExpect(jsonPath("$.data.activePets", greaterThanOrEqualTo(1)))
            .andExpect(jsonPath("$.data.totalAiTasks").exists())
            .andExpect(jsonPath("$.data.pendingAiTasks").exists())
            .andExpect(jsonPath("$.data.succeededAiTasks").exists())
            .andExpect(jsonPath("$.data.failedAiTasks").exists())
            .andExpect(jsonPath("$.data.recentFailures").isArray())
            .andExpect(jsonPath("$.data.recentTimeouts").isArray());
    }

    private void createPet(String name) throws Exception {
        mockMvc.perform(post("/api/pets")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"" + name + "\",\"species\":\"CAT\",\"birthday\":\"2026-06-30\"}"))
            .andExpect(status().isOk());
    }
}
