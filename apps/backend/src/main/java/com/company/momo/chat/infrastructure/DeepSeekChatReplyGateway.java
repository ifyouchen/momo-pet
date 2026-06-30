package com.company.momo.chat.infrastructure;

import com.company.momo.chat.application.ChatReplyGateway;
import com.company.momo.pet.domain.Pet;
import com.company.momo.pet.domain.PetState;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * chat Infrastructure 层 DeepSeek 回复网关，用于 Sprint 6 基础聊天主路径。
 */
@Component
class DeepSeekChatReplyGateway implements ChatReplyGateway {

    private static final int MAX_REPLY_LENGTH = 80;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final String apiKey;
    private final String baseUrl;
    private final String model;
    private final Duration timeout;

    DeepSeekChatReplyGateway(
        ObjectMapper objectMapper,
        @Value("${momo.ai.deepseek.api-key:}") String apiKey,
        @Value("${momo.ai.deepseek.base-url:https://api.deepseek.com}") String baseUrl,
        @Value("${momo.ai.deepseek.model:deepseek-v4-flash}") String model,
        @Value("${momo.ai.deepseek.timeout-ms:8000}") long timeoutMs
    ) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofMillis(timeoutMs)).build();
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.baseUrl = trimTrailingSlash(baseUrl);
        this.model = model;
        this.timeout = Duration.ofMillis(timeoutMs);
    }

    /**
     * 生成宠物口吻回复。
     */
    @Override
    public String generateReply(Pet pet, PetState state, String userMessage) {
        if (userMessage.contains("__mock_chat_fail__")) {
            throw new IllegalStateException("mock chat failure");
        }
        if (apiKey.isBlank()) {
            return localTemplateReply(state, userMessage);
        }
        return requestDeepSeekReply(pet, state, userMessage);
    }

    private String requestDeepSeekReply(Pet pet, PetState state, String userMessage) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/chat/completions"))
                .timeout(timeout)
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestBody(pet, state, userMessage))))
                .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException("DeepSeek request failed with status " + response.statusCode());
            }
            return normalizeReply(parseReply(response.body()));
        } catch (IOException exception) {
            throw new IllegalStateException("DeepSeek request failed", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("DeepSeek request interrupted", exception);
        }
    }

    private Map<String, Object> requestBody(Pet pet, PetState state, String userMessage) {
        return Map.of(
            "model", model,
            "messages", List.of(
                Map.of("role", "system", "content", systemPrompt(pet, state)),
                Map.of("role", "user", "content", userMessage)
            ),
            "thinking", Map.of("type", "disabled"),
            "max_tokens", 120,
            "stream", false
        );
    }

    private String systemPrompt(Pet pet, PetState state) {
        return """
            你是用户的桌面宠物，名字是%s。你要用温暖、短句、带一点宠物感的中文回复用户。
            当前状态：饱食=%d，心情=%d，清洁=%d，能量=%d，亲密=%d。
            回复不超过80个中文字符。不要提供医疗、法律、金融等专业建议。不要解释规则。
            """.formatted(
            pet.name().value(),
            state.hunger(),
            state.mood(),
            state.cleanliness(),
            state.energy(),
            state.intimacy()
        );
    }

    private String parseReply(String responseBody) throws IOException {
        JsonNode root = objectMapper.readTree(responseBody);
        String content = root.path("choices").path(0).path("message").path("content").asText("");
        if (content.isBlank()) {
            throw new IllegalStateException("DeepSeek response content is blank");
        }
        return content;
    }

    private String localTemplateReply(PetState state, String userMessage) {
        if (userMessage.contains("累") || userMessage.contains("辛苦")) {
            return "辛苦啦，先喝口水，我在旁边陪你慢慢缓一缓。";
        }
        if (state.hunger() < 35) {
            return "我有点想念小鱼干，但也会认真听你说完。";
        }
        return "嗯嗯，我听见啦。今天也要把尾巴摇给你看。";
    }

    private String normalizeReply(String reply) {
        String normalizedReply = reply.replace('\n', ' ').trim();
        if (normalizedReply.length() <= MAX_REPLY_LENGTH) {
            return normalizedReply;
        }
        return normalizedReply.substring(0, MAX_REPLY_LENGTH);
    }

    private String trimTrailingSlash(String value) {
        if (value == null || value.isBlank()) {
            return "https://api.deepseek.com";
        }
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
