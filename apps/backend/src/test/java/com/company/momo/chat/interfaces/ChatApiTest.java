package com.company.momo.chat.interfaces;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.blankOrNullString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Sprint 6 基础聊天接口测试。
 */
@SpringBootTest(properties = "momo.ai.deepseek.api-key=")
@AutoConfigureMockMvc
class ChatApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldSendChatMessageAndPersistConversation() throws Exception {
        String petId = createPet("Chat Test Cat");

        mockMvc.perform(post("/api/pets/{petId}/chat/messages", petId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"content\":\"今天工作好累\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.messageId", not(blankOrNullString())))
            .andExpect(jsonPath("$.data.reply").value("辛苦啦，先喝口水，我在旁边陪你慢慢缓一缓。"))
            .andExpect(jsonPath("$.data.state.intimacy").value(greaterThan(20)))
            .andExpect(jsonPath("$.data.fallback").value(false));

        mockMvc.perform(get("/api/pets/{petId}/chat/messages", petId).param("limit", "10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.items", hasSize(2)))
            .andExpect(jsonPath("$.data.items[0].role").value("USER"))
            .andExpect(jsonPath("$.data.items[1].role").value("PET"));
    }

    @Test
    void shouldReturnFallbackReplyWhenChatGatewayFails() throws Exception {
        String petId = createPet("Fallback Chat Cat");

        mockMvc.perform(post("/api/pets/{petId}/chat/messages", petId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"content\":\"__mock_chat_fail__\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.reply").value("我刚刚走神了，但我还在这里陪你。"))
            .andExpect(jsonPath("$.data.fallback").value(true));
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
}
