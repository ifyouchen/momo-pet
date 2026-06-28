# 11 Coding Spec

## 总原则

代码必须服务于文档定义。任何偏离 PRD、AI 设计、API 契约或数据库设计的实现，都需要先更新文档。

AI 编码工具还必须遵循 [AI-Coding-Guardrails.md](AI-Coding-Guardrails.md)。

## 后端规范

后端基于 Spring Boot 和 DDD。

分层依赖：

```text
Interface -> Application -> Domain
Infrastructure -> Domain
```

要求：

- Domain 层不使用 Spring 注解。
- 聚合根通过构造函数或工厂方法创建。
- 聚合根不暴露 setter 随意修改状态。
- 值对象使用 record 或不可变类。
- Repository 接口定义在 Domain 层，实现放在 Infrastructure 层。
- Application Service 只编排任务，不写业务规则。
- Controller 只做参数校验、调用应用服务、转换响应。
- 事务内不进行 AI、HTTP、RPC、对象存储等远程调用。
- 所有 public 方法必须有 JavaDoc。
- 禁止在代码逻辑中使用完整类名，必须在文件顶部使用 import。
- 合理使用设计模式，禁止为了模式而模式，且要遵循方法和类的单一职责原则。
- 单个方法不超过 30 行，单个类不超过 200 行。
- 严格避免 N+1 查询，循环内不得执行数据库查询或远程调用。
- 高频低变更数据可合理使用缓存，缓存必须有过期和降级策略。
- AI、对象存储、图片处理、摘要生成等耗时任务必须异步化。

## 前端规范

桌面端前端使用 React + TypeScript。

要求：

- UI 展示与业务逻辑分离。
- 业务逻辑提取为 hooks。
- API 请求统一封装。
- 组件 Props 必须有 TypeScript 类型和 JSDoc。
- 用户操作必须有加载态、空态、错误态。
- 列表渲染必须使用稳定 key。
- 禁止在业务组件中重复写通用错误处理。

## 桌面端规范

Rust 只负责系统能力和性能敏感能力。

要求：

- 窗口、托盘、开机启动、鼠标穿透封装为独立模块。
- React 不直接调用底层 Windows API。
- Tauri command 输入输出必须有明确类型。
- 系统能力失败时必须返回可识别错误码。

## AI 调用规范

要求：

- Prompt 必须版本化。
- AI 输出必须结构化。
- AI 结果入库前必须校验。
- AI 调用必须设置超时。
- 失败必须可重试。
- 高成本任务必须异步化。

## 日志规范

业务日志格式：

```text
【业务动作】【业务标识】【关键状态快照】
```

禁止打印：

- 密码
- Token
- 手机号
- 身份证
- 完整大对象
- 原始宠物照片地址的敏感签名

日志必须携带业务标识和关键状态快照。异常日志必须包含完整上下文，但不能打印敏感信息。
