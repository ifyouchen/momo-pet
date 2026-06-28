# 08 Backend Architecture

## 架构边界

后端遵循 [Architecture-Principles.md](../00-project/Architecture-Principles.md)：

```text
Java 管大脑。
```

Spring Boot 负责 Pet DNA、Life Engine、Memory、AI Task、状态持久化、后台管理 API 和统一错误处理，不负责桌面窗口控制或宠物逐帧渲染。

## 技术栈

- Spring Boot
- Java 21+
- PostgreSQL
- Redis
- MinIO 或兼容对象存储
- WebSocket
- OpenAPI

## 分层架构

后端采用 DDD，包结构按限界上下文 + 分层组织。

```text
com.company.momopet.pet.domain
com.company.momopet.pet.application
com.company.momopet.pet.infrastructure
com.company.momopet.pet.interface
```

依赖方向：

```text
Interface -> Application -> Domain
Infrastructure -> Domain
```

Domain 层不引入 Spring 注解。

## 限界上下文

### identity

负责用户身份、登录、权限。

### pet

负责宠物档案、Pet DNA、宠物状态。

### care

负责喂食、铲屎、抚摸、成长值变化。

### ai

负责 AI 任务、模型调用、Prompt、生成结果。

### asset

负责照片、桌宠资源、动画资源。

### chat

负责宠物聊天、消息记录、摘要。

## 领域聚合

- Pet
- PetDna
- PetState
- CareAction
- AiGenerationTask
- PetAsset
- ChatSession

## 事务边界

应用服务使用事务控制边界。

事务内禁止远程调用 AI、对象存储、HTTP API。需要远程调用时，先创建任务，提交事务后由异步任务执行。

## 异常体系

业务异常统一使用错误码：

- PET_NOT_FOUND
- PET_DNA_INVALID
- PET_PHOTO_REQUIRED
- PET_STATE_CONFLICT
- AI_GENERATION_FAILED
- ASSET_UPLOAD_FAILED
- CARE_ACTION_NOT_ALLOWED

全局异常处理器统一转换为标准响应。

## 基础设施策略

Redis 只用于 AI 任务短期状态、聊天限流和上传防重复提交，不缓存强一致核心状态。

对象存储保存用户上传照片、AI 生成头像、Sprite 和动画元数据。数据库只保存 storage key。

调度器负责 AI 任务执行、聊天摘要、状态自然衰减和失败任务重试。调度任务必须幂等。

## 安全与日志

用户只能访问自己的宠物和资源。对象存储 URL 必须使用临时签名。

日志格式：

```text
【业务动作】【业务标识】【关键状态快照】
```

日志禁止打印 Token、带签名图片 URL、完整大对象和敏感信息。

## 监控指标

MVP 监控：

- 宠物创建成功率
- 照片上传成功率
- Pet DNA 生成成功率
- AI 平均耗时
- 聊天失败率
- 桌宠活跃用户数
