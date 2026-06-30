package com.company.momo.ai.infrastructure;

import com.company.momo.ai.application.PetDnaAiGateway;
import com.company.momo.platform.domain.BusinessException;
import com.company.momo.platform.domain.ErrorCode;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * ai Infrastructure 层 Mock Pet DNA 网关，用于 Sprint 5 打通异步任务闭环。
 */
@Component
class MockPetDnaAiGateway implements PetDnaAiGateway {

    private static final String MOCK_MODEL = "pet-dna-mock-v1";

    private final ObjectMapper objectMapper;

    MockPetDnaAiGateway(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * 生成稳定的 Pet DNA 草稿 JSON。
     *
     * @param requestPayload 任务请求 JSON
     * @return Pet DNA 草稿 JSON
     */
    @Override
    public String generatePetDnaDraft(String requestPayload) {
        JsonNode request = parseRequest(requestPayload);
        String description = request.path("userDescription").asText("");
        if (description.contains("__mock_ai_fail__")) {
            throw new BusinessException(ErrorCode.AI_GENERATION_FAILED);
        }
        return writeResult(Map.of("petDnaDraft", buildPetDnaDraft(request)));
    }

    private JsonNode parseRequest(String requestPayload) {
        try {
            return objectMapper.readTree(requestPayload);
        } catch (JsonProcessingException exception) {
            throw new BusinessException(ErrorCode.AI_RESULT_INVALID);
        }
    }

    private Map<String, Object> buildPetDnaDraft(JsonNode request) {
        Map<String, Object> draft = new LinkedHashMap<>();
        draft.put("name", fallback(request.path("name").asText(), "Momo Pet"));
        draft.put("species", fallback(request.path("speciesHint").asText(), "CAT"));
        draft.put("breed", "UNKNOWN");
        draft.put("appearance", appearance());
        draft.put("personality", personality());
        draft.put("preferences", preferences());
        draft.put("voice", voice());
        draft.put("generation", generation(request));
        return draft;
    }

    private Map<String, Object> appearance() {
        Map<String, Object> appearance = new LinkedHashMap<>();
        appearance.put("primaryColor", "Orange");
        appearance.put("secondaryColor", "White");
        appearance.put("pattern", "Tabby");
        appearance.put("eyeColor", "Amber");
        return appearance;
    }

    private Map<String, Object> personality() {
        Map<String, Object> personality = new LinkedHashMap<>();
        personality.put("primary", "Friendly");
        personality.put("energyLevel", "MEDIUM");
        return personality;
    }

    private Map<String, Object> preferences() {
        Map<String, Object> preferences = new LinkedHashMap<>();
        preferences.put("favoriteFoods", List.of("DRIED_FISH"));
        preferences.put("dislikedThings", List.of("BATH"));
        return preferences;
    }

    private Map<String, Object> voice() {
        Map<String, Object> voice = new LinkedHashMap<>();
        voice.put("catchphrases", List.of("摸摸头会更舒服"));
        return voice;
    }

    private Map<String, Object> generation(JsonNode request) {
        Map<String, Object> generation = new LinkedHashMap<>();
        generation.put("source", "AI");
        generation.put("confidence", 0.78);
        generation.put("model", MOCK_MODEL);
        generation.put("generatedAt", Instant.now().toString());
        generation.put("evidenceSummary", evidenceSummary(request));
        generation.put("mismatchWarning", null);
        return generation;
    }

    private String evidenceSummary(JsonNode request) {
        int photoCount = request.path("photos").size();
        return photoCount > 1 ? "主图识别整体外观，参考图补充了毛色和体型。" : "主图识别了宠物的主要外观。";
    }

    private String fallback(String value, String fallbackValue) {
        return value == null || value.isBlank() ? fallbackValue : value;
    }

    private String writeResult(Map<String, Object> result) {
        try {
            return objectMapper.writeValueAsString(result);
        } catch (JsonProcessingException exception) {
            throw new BusinessException(ErrorCode.AI_RESULT_INVALID);
        }
    }
}
