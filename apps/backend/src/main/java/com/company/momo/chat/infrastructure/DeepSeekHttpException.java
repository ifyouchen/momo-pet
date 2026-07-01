package com.company.momo.chat.infrastructure;

/**
 * 携带 HTTP 状态码的 DeepSeek 网关异常，便于重试策略识别可重试状态码。
 */
final class DeepSeekHttpException extends IllegalStateException {

    private final int statusCode;

    DeepSeekHttpException(int statusCode, String message) {
        super(message);
        this.statusCode = statusCode;
    }

    int statusCode() {
        return statusCode;
    }
}
