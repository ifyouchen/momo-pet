package com.company.momo.platform.admin.interfaces;

import com.company.momo.platform.admin.application.GetAdminDashboardApplicationService;
import com.company.momo.platform.interfaces.common.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * platform.admin Interface 层 Controller，负责后台 Dashboard 指标聚合。
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final GetAdminDashboardApplicationService getAdminDashboardApplicationService;

    public AdminController(GetAdminDashboardApplicationService getAdminDashboardApplicationService) {
        this.getAdminDashboardApplicationService = getAdminDashboardApplicationService;
    }

    /**
     * 获取后台 Dashboard 核心指标。
     *
     * @return Dashboard 响应
     */
    @GetMapping("/dashboard/metrics")
    public ApiResponse<AdminDashboardResponse> getDashboardMetrics() {
        return ApiResponse.success(AdminDashboardResponse.from(getAdminDashboardApplicationService.getDashboard()));
    }
}
