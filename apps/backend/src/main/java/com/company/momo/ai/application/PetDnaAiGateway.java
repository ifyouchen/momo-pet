package com.company.momo.ai.application;

/**
 * ai Application 层 Pet DNA AI 网关接口，隔离真实模型或 Mock 实现。
 */
public interface PetDnaAiGateway {

    /**
     * 根据结构化请求生成 Pet DNA 草稿 JSON。
     *
     * @param requestPayload 任务请求 JSON
     * @return Pet DNA 草稿 JSON
     */
    String generatePetDnaDraft(String requestPayload);
}
