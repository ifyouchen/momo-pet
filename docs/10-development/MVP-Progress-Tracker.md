# MVP Progress Tracker

## 状态定义

| 状态        | 说明             |
| ----------- | ---------------- |
| Not Started | 尚未开始         |
| In Progress | 正在实现         |
| Review      | 等待人工验收     |
| Blocked     | 被依赖或问题阻塞 |
| Done        | 验收通过         |

## 总览

| Sprint   | 目标                       | 状态        | 验收人确认              |
| -------- | -------------------------- | ----------- | ----------------------- |
| Sprint 0 | 工程骨架                   | Review      | No                      |
| Sprint 1 | 默认宠物闭环               | Review      | No                      |
| Sprint 2 | Windows/macOS 桌面端运行时 | Review      | macOS Yes / Windows Yes |
| Sprint 3 | 宠物交互模式               | Review      | Yes                     |
| Sprint 4 | Pet Studio                 | Review      | No                      |
| Sprint 5 | AI Pet DNA 任务            | Done        | Yes                     |
| Sprint 6 | 基础聊天                   | Review      | No                      |
| Sprint 7 | 后台 MVP                   | Review      | No                      |
| Sprint 8 | Beta 验收                  | Not Started | No                      |

说明：

- Sprint 0 到 Sprint 6 是用户侧 MVP 主闭环。
- Sprint 7 是内部后台支撑，不得影响用户侧主闭环交付。
- Sprint 3 的交互模式只服务于喂食、抚摸、铲屎三个既有 MVP 功能，不新增玩具、追逐、宠物交友等范围。
- 当前质量基线：`pnpm lint`、`pnpm format:check`、`pnpm build:packages`、`pnpm build:desktop`、`pnpm build:admin` 通过；`cargo check --locked` 和 `pnpm --filter @momo/desktop tauri:dev` 在 macOS 通过；后端在 JDK 21 下 `mvn test` 通过（38 个测试，含 AI cancel 领域测试 5 个、Chat 500/501 长度测试 2 个）。

## Sprint 0：工程骨架

| 任务               | 状态   | 依赖       | 验收标准                                          |
| ------------------ | ------ | ---------- | ------------------------------------------------- |
| 创建 monorepo 目录 | Review | 无         | `apps/backend`、`apps/desktop`、`apps/admin` 存在 |
| 后端工程初始化     | Review | 无         | 健康检查接口可访问                                |
| 桌面端工程初始化   | Review | 无         | Tauri 窗口可打开                                  |
| Admin 工程初始化   | Review | 无         | Admin 页面可打开                                  |
| Momo Pet 资源目录  | Review | 无         | `assets/sprites/momo-pet` 存在                    |
| README 启动说明    | Review | 工程初始化 | 可以按 README 启动                                |

## Sprint 1：默认宠物闭环

| 任务              | 状态   | 依赖       | 验收标准              |
| ----------------- | ------ | ---------- | --------------------- |
| Pet 聚合实现      | Review | 后端工程   | 领域测试通过          |
| PetState 聚合实现 | Review | 后端工程   | 状态初始化正确        |
| Feed API          | Review | PetState   | 饱食度变化            |
| Touch API         | Review | PetState   | 亲密度变化            |
| Clean API         | Review | PetState   | 清洁度变化            |
| 宠物主页静态 UI   | Review | 桌面端工程 | 页面与 Figma 基本一致 |
| 状态条绑定        | Review | API        | 前端显示后端状态      |

## Sprint 2：Windows/macOS 桌面端运行时

| 任务             | 状态   | 依赖     | 验收标准                           |
| ---------------- | ------ | -------- | ---------------------------------- |
| Windows 透明窗口 | Review | Tauri    | Windows 窗口透明无边框             |
| macOS 透明窗口   | Done   | Tauri    | macOS 窗口透明无边框               |
| 基础置顶窗口     | Review | Tauri    | Windows/macOS 普通桌面场景保持置顶 |
| 拖动宠物         | Review | 透明窗口 | 两个平台可拖动                     |
| 位置缓存         | Review | 本地缓存 | 两个平台重启恢复位置               |
| Windows 托盘     | Review | Tauri    | 可显示、隐藏、退出                 |
| macOS 菜单栏     | Done   | Tauri    | 可显示、隐藏、退出                 |

## Sprint 3：宠物交互模式

| 任务         | 状态   | 依赖       | 验收标准            |
| ------------ | ------ | ---------- | ------------------- |
| FeedingMode  | Review | Sprint 1/2 | 拖食物触发喂食      |
| PettingMode  | Review | Sprint 1/2 | 滑动触发抚摸        |
| CleaningMode | Review | Sprint 1/2 | 点击清理事件成功    |
| 模式退出规则 | Review | 三个模式   | Esc/超时/成功可退出 |
| 交互反馈     | Review | 三个模式   | 有气泡和状态增量    |

## Sprint 4：Pet Studio

| 任务           | 状态   | 依赖           | 验收标准                                         |
| -------------- | ------ | -------------- | ------------------------------------------------ |
| 创建宠物页面   | Review | UI 基础        | 可填写名称和类型                                 |
| 主图上传       | Review | UI 基础        | 必须选择 1 张主图并完成格式、大小校验            |
| 参考图上传     | Review | 主图上传       | 可选上传最多 4 张参考图                          |
| 图片顺序与角色 | Review | 参考图上传     | 可区分 PRIMARY、FRONT、SIDE、BACK、DETAIL、OTHER |
| 多图错误提示   | Review | 图片校验       | 超限、格式错误、过大时有明确提示                 |
| AI 分析中页面  | Review | UI 基础        | 有生成仪式感                                     |
| Pet DNA 确认页 | Review | Pet DNA Schema | 可编辑字段                                       |
| 手动创建流程   | Review | Pet DNA 确认页 | 不依赖 AI 也能完成                               |

## Sprint 5：AI Pet DNA 任务

| 任务           | 状态   | 依赖         | 验收标准                                                        |
| -------------- | ------ | ------------ | --------------------------------------------------------------- |
| 图片上传接口   | Done | asset 上下文 | 返回 assetId                                                    |
| 图片角色保存   | Done | 图片上传接口 | 保存 photoRole 并校验所属 petId                                 |
| AI 任务创建    | Done | ai 上下文    | 接收 primaryPhotoAssetId 和 referencePhotoAssetIds，返回 taskId |
| AI 任务查询    | Done | ai 上下文    | 返回状态                                                        |
| Pet DNA 草稿   | Done | AI Gateway   | 符合 Schema                                                     |
| 多图一致性提醒 | Done | AI Gateway   | 可展示 mismatchWarning 和低置信度字段                           |
| 失败降级       | Done | 任务状态     | 可手动创建                                                      |

## Sprint 6：基础聊天

| 任务         | 状态        | 依赖        | 验收标准         |
| ------------ | ----------- | ----------- | ---------------- |
| Chat API     | Review | chat 上下文 | 可保存消息       |
| Chat Panel   | Review | UI          | 可发送和展示回复 |
| 宠物口吻回复 | Review | AI Gateway  | 回复符合 Pet DNA |
| AI 失败降级  | Review | Chat API    | 不白屏，输入保留 |

## Sprint 7：后台 MVP

| 任务          | 状态   | 依赖       | 验收标准           |
| ------------- | ------ | ---------- | ------------------ |
| Dashboard     | Review | Admin 工程 | 展示核心指标       |
| Pets 列表     | Review | Pet API    | 可查看宠物         |
| Pet Detail    | Review | Pet API    | 可查看状态/DNA     |
| AI Tasks 列表 | Review | AI API     | 可查看任务状态     |
| 失败详情      | Review | AI Tasks   | 可查看 errorCode   |
| AI Task 取消  | Review | AI API     | 可取消 PENDING/RUNNING 任务 |
| 聊天长度 500  | Review | Chat API   | 500 字正常发送，超过 501 被拒 |
| DNA 来源修正  | Review | 前端       | 跳过照片/AI 失败后 source=MANUAL，AI 成功后 source=AI |
| 首启 Onboarding | Review | 前端     | 欢迎→创建→上传→分析→确认→部署完整流程 |
| 照片校验共享  | Review | 前端       | 单张<=10MB，总<=30MB，最多5张，PRIMARY 唯一 |

## Sprint 8：Beta 验收

| 任务             | 状态        | 依赖        | 验收标准             |
| ---------------- | ----------- | ----------- | -------------------- |
| P0 用例回归      | Not Started | 所有 Sprint | P0 全通过            |
| 错误文案整理     | Not Started | 功能完成    | 文案一致             |
| 本地缓存稳定性   | Not Started | Sprint 2    | 重启不丢状态         |
| Windows 打包验证 | Not Started | 桌面端      | Windows 可安装或运行 |
| macOS 打包验证   | Not Started | 桌面端      | macOS 可安装或运行   |

## 2026-06-30 自动化验证记录

本节记录由 AI 助手自动执行的非 UI 验证。UI 体验相关条目（鼠标交互、动画反馈、托盘点击、拖动等）仍需人工签字，状态字段保持 `Review`。

### 通用质量门禁

| 命令 | 结果 |
| --- | --- |
| `pnpm build:packages` | ✅ Done (4 packages) |
| `pnpm build:desktop` | ✅ Vite build 1.86s，1608 modules |
| `pnpm build:admin` | ✅ Vite build 1.73s，1579 modules |
| `pnpm lint` | ✅ 6/6 workspace projects |
| `pnpm format:check` | ✅ All files conform |
| `mvn test` (JDK 21) | ✅ 14 tests，0 failures，0 errors，0 skipped |
| `cargo check --locked` | ✅ Finished `dev` profile in 0.45s |

### Sprint 1 · 后端 API 验证（curl）

| 端点 | 输入 | 结果 |
| --- | --- | --- |
| `GET /api/health` | — | ✅ `success=true, status=UP` |
| `POST /api/pets` | `{"name":"Momo Pet","species":"CAT"}` | ✅ `petId=pet_1c70fa22...`, `status=ACTIVE` |
| `GET /api/pets/{id}` | — | ✅ 名称/物种/生日/状态/createdAt 完整 |
| `GET /api/pets/{id}/state` | — | ✅ hunger/mood/cleanliness/energy/intimacy/experience/level 7 字段 |
| `POST .../care/feed` | `{"foodCode":"DRIED_FISH"}` | ✅ hunger 70→88, mood 80→85, exp 0→10 |
| `POST .../care/touch` | `{"touchType":"HEAD"}` | ✅ intimacy 20→23, mood 85→93, exp 10→15 |
| `POST .../care/clean` | `{"cleanEventId":"default-clean-event"}` | ✅ cleanliness 70→95, mood 93→97, exp 15→23 |
| `GET /api/pets/pet_does_not_exist` | — | ✅ `code=PET_NOT_FOUND`，服务不崩溃 |

后端 PetCareApiTest/PetTest/PetStateTest/ChatApiTest/HealthControllerTest 共 14 个测试已通过。

### Sprint 2 · 静态与 Rust 检查

| 检查项 | 证据 |
| --- | --- |
| `tauri.conf.json` `pet` 窗口 | `transparent=true`、`decorations=false`、`alwaysOnTop=true`、`resizable=false`、`skipTaskbar=true` 全在 |
| `tauri.conf.json` `home` 窗口 | 普通装饰、可见性默认 `false`（由 setup 函数 `configure_home_window` 隐藏） |
| `position_store.rs` | 使用 `app.path().app_data_dir().join("window-position.json")` |
| `window_manager.rs` | 注册 Show Momo / Hide Momo / Open Home / Quit 4 个菜单项；`Moved` 事件 + `handle_close_requested` 双路径保存位置；`is_position_visible` 校验 + `set_default_pet_window_position` 主屏右下安全区回退 |
| `main.rs` invoke handler | 8 个命令：`open_home_window` / `show_pet_window` / `hide_pet_window` / `hide_all_windows_to_tray` / `get_runtime_window_mode` / `start_pet_window_drag` / `get_pet_window_placement` / `set_pet_window_position` |
| `cargo check --locked` | ✅ Finished in 0.45s |

### Sprint 6 · 后端 Chat API 验证（curl）

| 用例 | 输入 | 期望 | 实际 |
| --- | --- | --- | --- |
| 正常发送 | `{"content":"你好呀"}` | USER+PET 双消息 + reply + state | ✅ 两条消息保存，回复含 `reply`/`state`/`fallback=false` |
| 空消息 | `{"content":""}` | 校验失败 | ✅ `code=VALIDATION_FAILED` |
| 纯空白 | `{"content":"   "}` | 校验失败 | ✅ `code=VALIDATION_FAILED` |
| 超长 301 字 | 301 个字符 | 校验失败 | ✅ `code=VALIDATION_FAILED`（满足"或标准校验错误"） |
| 不存在 petId | `pet_nope` | `PET_NOT_FOUND` | ✅ |
| 默认 limit | — | 多个 | ✅ 返回 2 条（USER+PET） |
| `limit=1` | — | 1 条 | ✅ |
| `limit=999` | — | 上限 50 | ✅ 返回 10 条（被仓库数据量限制，未触达 50 上限，但 clamp 逻辑已实现） |
| 顺序 | — | 时间升序 | ✅ USER 在前 PET 紧跟 |
| AI 降级 | `MockPetDnaAiGateway` 不可用时 | fallback 回复 + 用户消息保留 | ✅ mvn test 日志 `【聊天降级】reason=IllegalStateException, fallback=true` |

实现细节：`SendChatMessageRequest` 用 `@NotBlank @Size(max=300)`；`GetChatMessagesApplicationService.resolveLimit` 把 null/≤0 视为默认 20，并 `Math.min(limit, 50)`。

### Sprint 4 · 静态与 Pet Studio 入口

| 检查项 | 证据 |
| --- | --- |
| `pnpm --filter @momo/desktop lint` | ✅ |
| `pnpm --filter @momo/desktop build` | ✅ |
| `pnpm format:check` | ✅ |
| 浏览器预览回归 | 已在 2026-06-30 修复记录中勾选 12/12 项 |

### 仍需人工签字的 UI 项

下列条目需要人工在实机/浏览器中完成：

- **Sprint 0**：浏览每个工程，确认可启动
- **Sprint 1**：浏览器加载桌宠主页，确认默认宠物自动出现、状态条变化、三个按钮反馈动效
- **Sprint 2**：macOS + Windows 实机拖动、托盘/菜单栏点击、隐藏恢复、重启位置恢复
- **Sprint 3**：Home 窗口和桌宠窗口下的三模式（拖食物、滑动抚摸、点击清理）实操
- **Sprint 6**：Chat Panel 的加载/空/发送/错误四态切换、桌面端不白屏检查

### 验证脚本摘要

```text
mvn test      → 14/14 ✅
cargo check   → ✅
pnpm build    → desktop/admin/packages 全通 ✅
pnpm lint     → 6/6 ✅
pnpm format:check → ✅
curl Sprint 1 → 8/8 ✅
curl Sprint 6 → 9/9 ✅
```
