package com.company.momo.platform.interfaces;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * platform Interface 层开发期 CORS 配置，允许桌面端和管理后台本地调试访问后端 API。
 */
@Configuration
public class WebCorsConfiguration implements WebMvcConfigurer {

    /**
     * 注册本地开发跨域规则。
     *
     * <p>前置条件：Spring MVC 已启动。后置条件：5173/5174 本地前端可访问 /api。
     * 本方法不抛出业务异常。</p>
     *
     * @param registry CORS 注册器
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://127.0.0.1:5173", "http://localhost:5173", "http://127.0.0.1:5174", "http://localhost:5174")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*");
    }
}
