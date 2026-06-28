package com.company.momo.platform.interfaces.common;

/**
 * Interface 层统一响应体，保证前端和桌面端以一致结构处理成功与失败结果。
 *
 * @param <T> data 字段承载的业务响应类型
 */
public final class ApiResponse<T> {

    /**
     * 表示本次请求是否按预期完成，前端据此选择成功态或错误态。
     */
    private final boolean success;

    /**
     * 业务错误码或 OK，用于前端映射用户可读提示。
     */
    private final String code;

    /**
     * 面向用户或调用方的简短说明，不承载敏感上下文。
     */
    private final String message;

    /**
     * 请求成功时返回的业务数据，失败时保持为 null。
     */
    private final T data;

    private ApiResponse(boolean success, String code, String message, T data) {
        this.success = success;
        this.code = code;
        this.message = message;
        this.data = data;
    }

    /**
     * 创建成功响应。
     *
     * <p>前置条件：data 已完成脱敏和接口层转换。后置条件：返回 code 为 OK 的统一响应体。
     * 本方法不抛出业务异常。</p>
     *
     * @param data 业务响应数据
     * @param <T> 响应数据类型
     * @return 成功响应体
     */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "OK", "success", data);
    }

    /**
     * 创建失败响应。
     *
     * <p>前置条件：code 和 message 已完成脱敏。后置条件：返回 success=false 的统一响应体。
     * 本方法不抛出业务异常。</p>
     *
     * @param code 业务错误码
     * @param message 用户可读错误文案
     * @param <T> 响应数据类型
     * @return 失败响应体
     */
    public static <T> ApiResponse<T> failure(String code, String message) {
        return new ApiResponse<>(false, code, message, null);
    }

    public boolean isSuccess() {
        return success;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public T getData() {
        return data;
    }
}
