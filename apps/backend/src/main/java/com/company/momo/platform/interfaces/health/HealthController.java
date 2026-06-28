package com.company.momo.platform.interfaces.health;

import com.company.momo.platform.interfaces.common.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * platform 限界上下文的健康检查 Controller，用于 Sprint 0 验证后端 HTTP 服务可访问。
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    private static final Logger LOGGER = LoggerFactory.getLogger(HealthController.class);
    private static final String SERVICE_NAME = "momo-backend";
    private static final String STATUS_UP = "UP";

    /**
     * 返回后端服务健康状态。
     *
     * <p>前置条件：Spring MVC 已完成路由注册。后置条件：返回统一响应体，data.status 为 UP。
     * 本接口不抛出业务异常。</p>
     *
     * @return 统一健康检查响应
     */
    @GetMapping
    public ApiResponse<HealthResponse> getHealth() {
        LOGGER.debug("【健康检查】【服务={}】【状态={}】", SERVICE_NAME, STATUS_UP);
        return ApiResponse.success(new HealthResponse(STATUS_UP, SERVICE_NAME));
    }
}
