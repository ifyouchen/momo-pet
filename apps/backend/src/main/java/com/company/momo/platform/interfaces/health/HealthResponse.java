package com.company.momo.platform.interfaces.health;

/**
 * 健康检查响应，描述后端服务当前是否可被桌面端和后台访问。
 */
public final class HealthResponse {

    /**
     * 服务健康状态，供部署、验收脚本和人工测试判断服务是否可用。
     */
    private final String status;

    /**
     * 服务名称，帮助多服务日志和健康检查面板定位来源。
     */
    private final String serviceName;

    public HealthResponse(String status, String serviceName) {
        this.status = status;
        this.serviceName = serviceName;
    }

    public String getStatus() {
        return status;
    }

    public String getServiceName() {
        return serviceName;
    }
}
