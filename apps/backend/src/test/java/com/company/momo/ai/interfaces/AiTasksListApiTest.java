package com.company.momo.ai.interfaces;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Sprint 7 AI 任务列表接口测试。
 */
@SpringBootTest(properties = "momo.ai.deepseek.api-key=")
@AutoConfigureMockMvc
class AiTasksListApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldListAllAiTasksByDefault() throws Exception {
        String petId = createPet("AI Task List Cat");
        createPetDnaTask(petId);

        mockMvc.perform(get("/api/ai/tasks"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.total", greaterThanOrEqualTo(1)))
            .andExpect(jsonPath("$.data.items[0].taskType").value("PET_DNA_GENERATION"));
    }

    @Test
    void shouldFilterAiTasksByStatus() throws Exception {
        mockMvc.perform(get("/api/ai/tasks").param("status", "FAILED"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void shouldReturnBadRequestForInvalidStatus() throws Exception {
        mockMvc.perform(get("/api/ai/tasks").param("status", "INVALID_STATUS"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
    }

    @Test
    void cancel_whenTaskPending_shouldReturnCanceled() throws Exception {
        String petId = createPet("Cancel Pending Cat");
        String taskId = createPetDnaTask(petId);

        mockMvc.perform(post("/api/ai/tasks/{taskId}/cancel", taskId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.status").value("CANCELED"));
    }

    @Test
    void cancel_whenTaskSucceeded_shouldReturnNotCancelable() throws Exception {
        String petId = createPet("Cancel Succeeded Cat");
        String taskId = createPetDnaTask(petId);

        // 等待 AI 任务完成
        Thread.sleep(2000);

        mockMvc.perform(post("/api/ai/tasks/{taskId}/cancel", taskId))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value(equalTo("AI_TASK_NOT_CANCELABLE")));
    }

    @Test
    void listTasks_whenStatusCanceled_shouldReturnCanceledTasks() throws Exception {
        String petId = createPet("Cancel List Cat");
        String taskId = createPetDnaTask(petId);

        mockMvc.perform(post("/api/ai/tasks/{taskId}/cancel", taskId))
            .andExpect(status().isOk());

        mockMvc.perform(get("/api/ai/tasks").param("status", "CANCELED"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void shouldReturnNotFoundForUnknownTask() throws Exception {
        mockMvc.perform(get("/api/ai/tasks/{taskId}", "task_does_not_exist"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("AI_TASK_NOT_FOUND"));
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

    private String createPetDnaTask(String petId) throws Exception {
        MockMultipartFile photo = new MockMultipartFile(
            "file", "cat.png", "image/png", new byte[]{(byte) 0x89, 'P', 'N', 'G'}
        );
        String assetId = mockMvc.perform(multipart("/api/pets/{petId}/photos", petId)
                .file(photo)
                .param("photoRole", "PRIMARY"))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString()
            .replaceAll(".*\\\"assetId\\\":\\\"([^\\\"]+)\\\".*", "$1");

        String response = mockMvc.perform(post("/api/pets/{petId}/dna/generation-tasks", petId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"AI List Cat\",\"speciesHint\":\"CAT\",\"primaryPhotoAssetId\":\"" + assetId + "\"}"))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
        return response.replaceAll(".*\\\"taskId\\\":\\\"([^\\\"]+)\\\".*", "$1");
    }
}
