package com.company.momo.platform.domain;

/**
 * 通用业务异常，携带稳定错误码并交由全局异常处理器转换为统一响应。
 */
public class BusinessException extends RuntimeException {

    private final ErrorCode errorCode;

    /**
     * 创建业务异常。
     *
     * @param errorCode 业务错误码
     */
    public BusinessException(ErrorCode errorCode) {
        super(errorCode.message());
        this.errorCode = errorCode;
    }

    /**
     * 返回业务错误码。
     *
     * @return 业务错误码
     */
    public ErrorCode errorCode() {
        return errorCode;
    }
}
