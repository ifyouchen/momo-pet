# Admin Console Spec

## 目标

后台管理控制台用于运营、排障、AI 任务观察和资源管理。它不是用户侧产品体验，不使用可爱化视觉，而使用安静、高效、可扫描的管理界面。

## MVP 范围 vs 后续版本

### MVP 必做（Sprint 7）

- Dashboard：展示核心健康指标。
- Pets 列表：分页、按 species/status 过滤。
- Pet Detail：Overview、Pet DNA、State 三个标签页。
- AI Tasks 列表：按 status/taskType 过滤。
- AI Task Detail：展示错误原因、状态、耗时。

### 后续版本（非 MVP）

- Users
- Pet DNA 独立管理页
- Assets
- Care Events
- Chat Logs
- Prompt Library
- Analytics
- System Settings

## 使用对象

- 产品负责人
- 运营人员
- 后端开发
- AI 调试人员
- 客服支持

## 设计原则

- 信息密度高，但层级清晰。
- 表格、筛选、详情抽屉优先。
- 所有危险操作需要二次确认。
- 不展示敏感签名 URL、Token 或完整 Prompt。
- 后台操作必须留审计记录。

## 一级导航（含后续版本）

```text
Admin
├── Dashboard（MVP）
├── Pets（MVP）
├── AI Tasks（MVP）
├── Pet DNA（后续）
├── Users（后续）
├── Assets（后续）
├── Care Events（后续）
├── Chat Logs（后续）
├── Prompt Library（后续）
├── Analytics（后续）
└── System Settings（后续）
```

## Dashboard

### 指标卡

| 指标 | 说明 |
| --- | --- |
| 今日新增用户 | 当日注册或激活用户 |
| 今日新建宠物 | 当日创建宠物数 |
| Pet DNA 成功率 | AI 生成成功 / 总任务 |
| AI 平均耗时 | 按任务类型聚合 |
| AI 失败任务 | FAILED、TIMEOUT 数量 |
| 今日互动次数 | 喂食、铲屎、抚摸、聊天总数 |

### 图表

- 7 日宠物创建趋势。
- AI 任务成功率趋势。
- 平均 AI 成本趋势。
- 互动行为分布。

### 异常队列

展示最近异常：

- 上传失败
- AI 任务超时
- Sprite 加载失败
- 聊天失败

操作：

- 查看详情
- 重试任务
- 标记已处理

## Users

### 列表字段

| 字段 | 说明 |
| --- | --- |
| userId | 用户 ID |
| nickname | 昵称 |
| email | 邮箱，脱敏展示 |
| petCount | 宠物数量 |
| plan | FREE / PRO |
| status | ACTIVE / DISABLED |
| createdAt | 创建时间 |
| lastActiveAt | 最近活跃 |

### 操作

- 查看用户详情。
- 查看该用户宠物。
- 禁用用户。
- 恢复用户。

### 权限

禁用和恢复必须有管理员权限，并记录操作原因。

## Pets

### 列表字段

| 字段 | 说明 |
| --- | --- |
| petId | 宠物 ID |
| ownerId | 所属用户 |
| name | 宠物名称 |
| species | 类型 |
| level | 等级 |
| status | ACTIVE / DELETED / DISABLED |
| dnaVersion | 最新 DNA 版本 |
| createdAt | 创建时间 |

### 筛选

- species
- status
- createdAt range
- ownerId
- name

### 操作

- 查看详情。
- 查看 Pet DNA。
- 查看状态。
- 查看资源。
- 禁用宠物。

## Pet Detail

详情页分 Tabs：

- Overview
- Pet DNA
- State
- Assets
- Care Events
- Chat Logs
- AI Tasks

### Overview

展示：

- 基础档案
- 当前状态摘要
- 最新资源
- 最近互动

### State

展示：

- hunger
- mood
- cleanliness
- energy
- intimacy
- experience
- level
- updatedAt

后台不建议直接修改状态。需要修改时必须通过“运营修正”能力，并记录原因。

## Pet DNA

### 列表字段

| 字段 | 说明 |
| --- | --- |
| petId | 宠物 ID |
| version | 版本 |
| species | 类型 |
| breed | 品种 |
| personality | 主性格 |
| source | AI / MANUAL / MIXED |
| confidence | AI 置信度 |
| createdAt | 创建时间 |

### 操作

- 查看 JSON。
- 查看版本差异。
- 回滚版本，Beta 后支持。

## AI Tasks

### 列表字段

| 字段 | 说明 |
| --- | --- |
| taskId | 任务 ID |
| petId | 宠物 ID |
| taskType | PET_DNA_GENERATION / CHAT_REPLY / MEMORY_SUMMARY |
| status | PENDING / RUNNING / SUCCEEDED / FAILED / TIMEOUT |
| model | 使用模型 |
| retryCount | 重试次数 |
| latencyMs | 耗时 |
| errorCode | 错误码 |
| createdAt | 创建时间 |
| completedAt | 完成时间 |

### 筛选

- taskType
- status
- errorCode
- createdAt range
- model

### 操作

- 查看任务详情。
- 重试任务。
- 取消任务。
- 查看输出结果。

### 任务详情

展示：

- 输入摘要。
- 输出结果。
- 错误码。
- 错误信息。
- 耗时。
- token 与成本。

不展示：

- 完整敏感 Prompt。
- 带签名图片 URL。
- 用户隐私明文。

## Assets

### 列表字段

| 字段 | 说明 |
| --- | --- |
| assetId | 资源 ID |
| petId | 宠物 ID |
| assetType | ORIGINAL_PHOTO / SPRITE_SHEET / ANIMATION_META |
| status | READY / FAILED / DELETED |
| contentType | 文件类型 |
| size | 文件大小 |
| createdAt | 创建时间 |

### 操作

- 查看元数据。
- 查看预览，需权限控制。
- 标记待清理。
- 重试生成资源，Beta 后支持。

## Care Events

### 列表字段

| 字段 | 说明 |
| --- | --- |
| eventId | 事件 ID |
| petId | 宠物 ID |
| actionType | FEED / CLEAN / TOUCH / CHAT |
| actionValue | 食物或触摸类型 |
| stateSnapshot | 行为后状态快照 |
| occurredAt | 发生时间 |

### 用途

- 排查状态变化。
- 统计用户互动。
- 支撑 Pet Story 时间线。

## Chat Logs

### 列表字段

| 字段 | 说明 |
| --- | --- |
| messageId | 消息 ID |
| petId | 宠物 ID |
| role | USER / PET |
| contentPreview | 内容摘要 |
| createdAt | 创建时间 |

### 隐私

默认只展示摘要，查看全文需要高级权限，并记录审计日志。

## Prompt Library

### 列表字段

| 字段 | 说明 |
| --- | --- |
| promptKey | Prompt 标识 |
| version | 版本 |
| scenario | 使用场景 |
| status | DRAFT / ACTIVE / DISABLED |
| successRate | 成功率 |
| updatedAt | 更新时间 |

### 操作

- 查看 Prompt。
- 创建新版本。
- 启用版本。
- 禁用版本。
- 查看调用统计。

MVP 可先只读，避免后台直接修改 Prompt 造成不可控风险。

## Analytics

### MVP 指标

- 创建流程完成率。
- 照片上传成功率。
- Pet DNA 生成成功率。
- AI 平均耗时。
- 次日留存。
- 人均互动次数。
- 喂食、铲屎、抚摸、聊天占比。

### 漏斗

```text
打开应用
↓
开始创建
↓
上传照片
↓
AI 生成成功
↓
确认 Pet DNA
↓
部署桌宠
↓
首次互动
```

## System Settings

MVP 设置：

- AI 任务开关。
- 上传文件大小限制。
- 支持的宠物类型。
- 默认 Sprite fallback。
- 维护模式。

## 权限模型

角色：

- ADMIN：全部权限。
- OPS：运营查看与有限重试。
- SUPPORT：用户和宠物查看。
- AI_OPERATOR：AI 任务和 Prompt 查看。

危险操作：

- 禁用用户。
- 禁用宠物。
- 重试大成本 AI 任务。
- 查看聊天全文。
- 查看原始照片。

这些操作必须记录审计日志。

## 审计日志

记录字段：

- operatorId
- action
- targetType
- targetId
- reason
- createdAt

## 验收标准

- 管理员可以查到用户、宠物、AI 任务和资源。
- AI 失败任务可以筛选并查看错误原因。
- 后台不展示敏感 URL 和 Token。
- 危险操作有二次确认和审计记录。
- Dashboard 能回答“今天产品是否健康运行”。

