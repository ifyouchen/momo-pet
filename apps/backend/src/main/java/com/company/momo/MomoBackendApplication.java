package com.company.momo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Project Momo 后端启动入口，负责装配 Spring Boot 运行时。
 *
 * <p>前置条件：运行环境已安装 Java 8 及以上版本。后置条件：应用启动后暴露 MVP 所需的 HTTP
 * 接口。可能抛出运行时启动异常，例如端口占用或配置错误。</p>
 */
@SpringBootApplication
@EnableScheduling
public class MomoBackendApplication {

    /**
     * 启动 Project Momo 后端服务。
     *
     * <p>前置条件：启动参数由 JVM 或命令行传入。后置条件：Spring 应用上下文完成初始化。
     * 可能抛出 Spring Boot 启动异常。</p>
     *
     * @param args 命令行启动参数
     */
    public static void main(String[] args) {
        SpringApplication.run(MomoBackendApplication.class, args);
    }
}
