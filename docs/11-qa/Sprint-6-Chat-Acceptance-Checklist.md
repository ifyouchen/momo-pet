# Sprint 6 Chat Acceptance Checklist

## Goal

验收 Sprint 6：用户可以在桌面端打开聊天面板，向宠物发送基础聊天消息，看到宠物口吻回复，并能查询最近聊天记录。AI 回复失败时必须有可理解的降级体验，不白屏、不丢失用户输入。

## Scope

包含：

- Chat API 发送消息。
- Chat API 查询最近消息。
- 聊天消息持久化。
- 宠物口吻回复。
- AI 失败降级。
- 桌面端 Chat Panel 的加载态、空态、发送态、错误态。

不包含：

- 长期记忆召回。
- 多轮复杂 Agent 编排。
- 语音聊天。
- 聊天记录搜索。
- 后台管理页。
- 付费、登录、多用户权限。

## Static Checks

- [ ] Backend tests 通过。

```bash
cd apps/backend && mvn test
```

- [ ] Packages build 通过。

```bash
pnpm build:packages
```

- [ ] Desktop build 通过。

```bash
pnpm build:desktop
```

- [ ] Admin build 通过。

```bash
pnpm build:admin
```

- [ ] ESLint 通过。

```bash
pnpm lint
```

- [ ] Prettier 检查通过。

```bash
pnpm format:check
```

## Backend: Send Message

- [ ] `POST /api/pets/{petId}/chat/messages` 可发送合法消息。
- [ ] 响应 data 包含 `messageId`、`reply`、`state`。
- [ ] 用户消息被保存为 `USER` 角色。
- [ ] 宠物回复被保存为 `PET` 角色。
- [ ] 发送成功后宠物经验或亲密度按 MVP 规则变化。
- [ ] 不存在的 `petId` 返回 `PET_NOT_FOUND`。
- [ ] 空消息或纯空白消息返回标准校验错误。
- [ ] 超过 300 字的消息返回 `CHAT_MESSAGE_TOO_LONG` 或标准校验错误。
- [ ] Controller 只做参数校验、调用应用服务和返回统一响应体。

## Backend: Message History

- [ ] `GET /api/pets/{petId}/chat/messages` 可查询最近聊天。
- [ ] 不传 `limit` 时返回默认数量。
- [ ] `limit=1` 时只返回最近 1 条消息。
- [ ] `limit` 大于 50 时最多返回 50 条。
- [ ] 返回项包含 `messageId`、`role`、`content`、`createdAt`。
- [ ] 返回顺序符合前端展示预期。
- [ ] 不存在的 `petId` 返回 `PET_NOT_FOUND`。

## Backend: AI Fallback

- [ ] AI Gateway 正常时返回宠物口吻回复。
- [ ] AI Gateway 异常时接口仍返回可展示的降级回复。
- [ ] AI 失败时用户消息仍被保存。
- [ ] AI 失败日志包含 `petId`、`messageId` 和失败原因。
- [ ] 日志不打印完整敏感上下文或完整大对象。

## Desktop: Chat Panel

- [ ] 点击聊天入口可以打开 Chat Panel。
- [ ] Chat Panel 打开时会拉取最近聊天记录。
- [ ] 拉取中展示加载态，不白屏。
- [ ] 没有历史消息时展示空态。
- [ ] 输入框最多允许 300 字。
- [ ] 输入为空或纯空白时发送按钮不可用。
- [ ] 点击发送后按钮进入不可重复提交状态。
- [ ] 发送成功后展示用户消息和宠物回复。
- [ ] 发送成功后输入框清空。
- [ ] 消息列表自动滚动到最新消息。
- [ ] 关闭按钮可以关闭 Chat Panel。

## Desktop: Failure Experience

- [ ] 后端不可用时展示错误态。
- [ ] 发送失败时保留输入框内容，方便用户重试。
- [ ] 历史消息拉取失败时仍允许用户输入。
- [ ] 失败提示文案用户可理解，不暴露堆栈或内部异常类名。
- [ ] 网络恢复后再次发送可以成功。

## Regression

- [ ] Sprint 1 默认宠物创建和状态展示不回归。
- [ ] Sprint 3 喂食、抚摸、清理交互不回归。
- [ ] Sprint 4 Pet Studio 手动创建流程不回归。
- [ ] Sprint 5 图片上传和 AI Pet DNA 任务链路不回归。
- [ ] 桌宠窗口模式下聊天入口不遮挡核心宠物操作。

## Completion Criteria

- [ ] Static Checks 全部通过。
- [ ] Backend 和 Desktop 验收项无 P0/P1 问题。
- [ ] MVP AC-09 基础聊天成功通过。
- [ ] MVP AC-10 聊天 AI 失败通过。
- [ ] `docs/10-development/MVP-Progress-Tracker.md` 中 Sprint 6 可从 `Review` 推进到 `Done`。
