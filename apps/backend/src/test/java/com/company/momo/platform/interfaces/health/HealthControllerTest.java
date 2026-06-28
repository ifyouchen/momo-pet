package com.company.momo.platform.interfaces.health;

import com.company.momo.MomoBackendApplication;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * HealthController 的接口测试，验证 Sprint 0 健康检查契约稳定。
 */
@SpringBootTest(classes = MomoBackendApplication.class)
@AutoConfigureMockMvc
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    /**
     * 验证健康检查接口返回统一成功响应。
     *
     * <p>前置条件：Spring 测试上下文已启动。后置条件：响应体包含 OK、UP 和服务名。
     * 可能抛出 MockMvc 执行异常。</p>
     *
     * @throws Exception MockMvc 请求执行失败
     */
    @Test
    void getHealth_whenServiceStarted_shouldReturnUp() throws Exception {
        mockMvc.perform(get("/api/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success", is(true)))
            .andExpect(jsonPath("$.code", is("OK")))
            .andExpect(jsonPath("$.data.status", is("UP")))
            .andExpect(jsonPath("$.data.serviceName", is("momo-backend")));
    }
}
