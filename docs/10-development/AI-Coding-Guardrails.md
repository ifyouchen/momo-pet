# AI Coding Guardrails

## 目标

本文件是给 Codex、Cursor、Claude、GPT 等 AI 编码工具使用的硬性约束。任何代码生成、重构、修复和测试编写都必须遵循本文件。

## 编码前必须读取

所有任务必须先读取：

- `docs/00-project/Architecture-Principles.md`

后端任务至少读取：

- `docs/10-development/CodingSpec.md`
- `docs/06-backend/Architecture.md`
- `docs/06-backend/DDD.md`
- `docs/06-backend/Domain-Model-Spec.md`
- `docs/06-backend/OpenAPI-MVP.md`
- `docs/06-backend/ErrorCode.md`

前端和桌面端任务至少读取：

- `docs/10-development/CodingSpec.md`
- `docs/03-ui/DesignSystem.md`
- `docs/03-ui/Pet-Operation-Page-Spec.md`
- `docs/05-desktop-runtime/Architecture.md`
- `docs/05-desktop-runtime/Runtime-Interaction-Spec.md`
- `docs/05-desktop-runtime/Local-Cache-And-Sync.md`

AI 功能任务至少读取：

- `docs/04-ai-core/AI-System-Design.md`
- `docs/04-ai-core/PetDNA-Schema.md`
- `docs/04-ai-core/AiTask-Execution.md`
- `docs/12-prompts/README.md`

## 后端硬约束

### 分层依赖

必须遵循：

```text
Interface -> Application -> Domain
Infrastructure -> Domain
```

禁止：

- Domain 层依赖 Spring、JPA、MyBatis、HTTP Client 等框架。
- Controller 直接访问 Repository。
- Controller 编写业务判断。
- Infrastructure 业务规则外溢到应用服务。

### 包结构

包结构按限界上下文和分层组织：

```text
com.company.momopet.pet.domain
com.company.momopet.pet.application
com.company.momopet.pet.infrastructure
com.company.momopet.pet.interface
```

禁止按纯技术层大平铺：

```text
controller
service
entity
mapper
```

### import 规范

禁止在代码中显示使用完整类名：

```java
com.company.momopet.pet.domain.Pet pet = ...
```

必须使用顶部 import：

```java
import com.company.momopet.pet.domain.Pet;
```

代码中不允许出现未使用 import。

### 聚合与值对象

- 聚合根通过构造函数或工厂方法创建。
- 聚合根内部封装不变量校验。
- 禁止公开 setter 随意修改聚合状态。
- 值对象必须不可变，优先使用 `record`。
- 可能抛出业务校验异常的方法以 `ensure` 开头。
- 返回 `Optional` 的方法以 `find` 开头。

## 设计模式使用原则

可以合理使用设计模式，但禁止为了模式而模式。

推荐使用：

- Factory：创建聚合根或复杂值对象。
- Strategy：处理不同宠物类型、食物效果、AI 模型供应商。
- Template Method：AI 任务执行流程。
- Adapter：封装外部 AI、对象存储、支付等第三方接口。
- Domain Event：跨聚合协作和异步后续动作。
- Specification：复杂业务校验规则。

禁止：

- 用过度抽象隐藏简单逻辑。
- 为每个小功能都建接口和实现。
- 在没有多实现需求时强行 Strategy。
- 用设计模式绕开 DDD 分层。

## 事务与远程调用

事务内允许：

- 加载聚合。
- 调用聚合方法。
- 保存聚合。
- 创建任务记录。

事务内禁止：

- 调用 AI。
- 上传对象存储。
- 调用 HTTP/RPC。
- 发送 WebSocket。
- 执行耗时文件处理。

正确做法：

1. 事务内创建 `AiGenerationTask`。
2. 提交事务。
3. 异步任务执行远程调用。
4. 回写任务结果。

## 性能约束

### 避免 N+1

禁止在循环内查询数据库：

```java
for (Pet pet : pets) {
    repository.findStateByPetId(pet.id());
}
```

必须使用批量查询：

```java
repository.findStatesByPetIds(petIds);
```

复杂查询应放在 Repository 定制方法中，使用 JOIN、IN 或批量加载策略。

### 分页

所有列表接口必须分页。

禁止一次性返回大列表。

### 缓存

适合缓存：

- 配置数据。
- Prompt 版本信息。
- Sprite manifest。
- 低频变化的模型配置。

不适合缓存：

- 强一致宠物状态。
- 支付状态。
- 权限判断结果，除非有明确过期策略。

缓存必须设置：

- 过期时间。
- key 命名规范。
- 缓存失败降级策略。

### 异步与并行

适合异步：

- AI 生成任务。
- 图片处理。
- 资源清理。
- 聊天摘要。
- 埋点上报。

适合并行：

- 多个互不依赖的只读查询。
- 多资源预加载。
- 后台统计聚合。

禁止：

- 为了并行破坏事务一致性。
- 在请求线程中启动不可控线程。
- 无边界线程池。

## 日志规范

日志格式：

```text
【业务动作】【业务标识】【关键状态快照】
```

示例：

```text
【创建宠物】【petId=pet_001,userId=user_001】【species=CAT,status=ACTIVE】
```

级别：

- DEBUG：入口、出口、关键编排节点。
- INFO：业务状态变化、任务状态变化、重要分支。
- WARN：可恢复异常、降级、重试。
- ERROR：不可恢复异常，必须携带上下文。

禁止打印：

- 密码。
- Token。
- 手机号。
- 身份证。
- 带签名的对象存储 URL。
- 完整大对象。
- 原始 Prompt 全文。
- 用户聊天全文，除非脱敏并有审计需求。

禁止使用：

```java
e.printStackTrace();
```

## 注释规范

所有 public 类必须有 JavaDoc，说明：

- 核心职责。
- 所属限界上下文。
- 业务边界。

所有 public 方法必须有 JavaDoc，说明：

- 业务目的。
- 前置条件。
- 后置条件。
- 可能抛出的业务异常。

字段注释必须解释业务含义，不能只是翻译字段名。

允许少量实现注释，用于解释复杂业务规则。禁止注释复述代码。

## 文件与方法大小

后端：

- 单个方法不超过 30 行。
- 单个类不超过 200 行。
- 一个应用服务方法只编排一个用例。
- 一个领域服务只处理一个聚合的核心逻辑。

前端：

- 单个 `.tsx` 文件不超过 200 行。
- 组件内函数不超过 50 行。
- UI 展示与业务逻辑分离。
- 复杂逻辑抽到 hooks、services 或 utils。

超过限制必须拆分。

## 前端约束

- API 请求必须统一封装。
- Token、错误码、网络异常在拦截器处理。
- 业务组件不能重复写通用 try-catch。
- 所有用户操作必须有 loading、success、error 或 empty state。
- 禁止 `console.log`。
- 列表渲染必须使用稳定 key，禁止使用 index 作为 key。
- 搜索、输入联想等高频操作必须防抖或节流。
- 同参数并发请求必须去重。

## 桌面端约束

- Rust 负责系统能力，React 负责 UI。
- React 画宠物，Rust 控窗口，Java 管大脑。
- React 不直接调用 Windows API。
- React 不直接调用 macOS AppKit API。
- Rust/Tauri 不实现宠物养成业务规则。
- Java/Spring Boot 不实现桌面窗口控制。
- Tauri command 输入输出必须有明确类型。
- 系统能力失败必须返回可识别错误码。
- 窗口位置、可见性、减少动画等设置必须本地持久化。
- 退出前保存本地状态。

## AI 功能约束

- Prompt 必须版本化。
- AI 输出必须结构化。
- AI 输出入库前必须 Schema 校验。
- AI 调用必须有超时。
- 高成本任务必须异步化。
- AI 失败必须有降级路径。
- 用户确认前，AI 生成 Pet DNA 只能作为草稿。

## 测试要求

后端：

- 领域逻辑必须有单元测试。
- 应用服务可 mock Repository 和 Gateway。
- 测试类命名：`被测类名Test`。
- 测试方法命名：`方法名_测试场景_预期结果`。

前端：

- 核心 hooks 必须测试。
- 关键页面必须覆盖 loading、error、empty、success。

桌面端：

- 窗口、托盘、本地缓存至少有手动验收清单。

## 生成代码后的自检清单

提交代码前必须确认：

- 是否符合 DDD 分层。
- 是否有 Controller 业务逻辑。
- 是否有事务内远程调用。
- 是否存在 N+1 查询。
- 是否有大方法或大类。
- 是否有未使用 import。
- 是否有完整类名直接出现在代码逻辑中。
- 是否有敏感日志。
- 是否有 `console.log` 或 `printStackTrace`。
- 是否有 loading、error、empty state。
- 是否补充了必要测试。
