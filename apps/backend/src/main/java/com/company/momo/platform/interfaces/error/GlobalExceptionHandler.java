package com.company.momo.platform.interfaces.error;

import com.company.momo.platform.domain.BusinessException;
import com.company.momo.platform.domain.ErrorCode;
import com.company.momo.platform.interfaces.common.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * platform Interface 层全局异常处理器，负责把异常转换为统一响应体。
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * 处理业务异常。
     *
     * <p>前置条件：业务层抛出 BusinessException。后置条件：返回统一失败响应。
     * 本方法不再向外抛出业务异常。</p>
     *
     * @param exception 业务异常
     * @return 统一失败响应
     */
    @ExceptionHandler(BusinessException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Void> handleBusinessException(BusinessException exception) {
        LOGGER.info("【业务异常】【code={}】【message={}】", exception.errorCode(), exception.getMessage());
        return ApiResponse.failure(exception.errorCode().name(), exception.getMessage());
    }

    /**
     * 处理参数校验异常。
     *
     * @param exception 参数校验异常
     * @return 统一失败响应
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Void> handleValidationException(MethodArgumentNotValidException exception) {
        LOGGER.info("【参数校验失败】【errorCount={}】【status=REJECTED】", exception.getErrorCount());
        return ApiResponse.failure(ErrorCode.VALIDATION_FAILED.name(), ErrorCode.VALIDATION_FAILED.message());
    }

    /**
     * 处理未预期异常。
     *
     * @param exception 未预期异常
     * @return 统一失败响应
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<Void> handleException(Exception exception) {
        LOGGER.error("【系统异常】【type={}】【status=FAILED】", exception.getClass().getSimpleName(), exception);
        return ApiResponse.failure(ErrorCode.INTERNAL_ERROR.name(), ErrorCode.INTERNAL_ERROR.message());
    }
}
