# MVP Progress Tracker

## 状态定义

| 状态 | 说明 |
| --- | --- |
| Not Started | 尚未开始 |
| In Progress | 正在实现 |
| Review | 等待人工验收 |
| Blocked | 被依赖或问题阻塞 |
| Done | 验收通过 |

## 总览

| Sprint | 目标 | 状态 | 验收人确认 |
| --- | --- | --- | --- |
| Sprint 0 | 工程骨架 | Review | No |
| Sprint 1 | 默认宠物闭环 | Review | No |
| Sprint 2 | Windows/macOS 桌面端运行时 | In Progress | macOS Yes / Windows No |
| Sprint 3 | 宠物交互模式 | In Progress | No |
| Sprint 4 | Pet Studio | Not Started | No |
| Sprint 5 | AI Pet DNA 任务 | Not Started | No |
| Sprint 6 | 基础聊天 | Not Started | No |
| Sprint 7 | 后台 MVP | Not Started | No |
| Sprint 8 | Beta 验收 | Not Started | No |

说明：

- Sprint 0 到 Sprint 6 是用户侧 MVP 主闭环。
- Sprint 7 是内部后台支撑，不得影响用户侧主闭环交付。
- Sprint 3 的交互模式只服务于喂食、抚摸、铲屎三个既有 MVP 功能，不新增玩具、追逐、宠物交友等范围。
- 当前质量基线：`pnpm lint`、`pnpm format:check`、`pnpm build:packages`、`pnpm build:desktop`、`pnpm build:admin` 通过；`cargo check --locked` 和 `pnpm --filter @momo/desktop tauri:dev` 在 macOS 通过；后端在 JDK 21 下 `mvn test` 通过。

## Sprint 0：工程骨架

| 任务 | 状态 | 依赖 | 验收标准 |
| --- | --- | --- | --- |
| 创建 monorepo 目录 | Review | 无 | `apps/backend`、`apps/desktop`、`apps/admin` 存在 |
| 后端工程初始化 | Review | 无 | 健康检查接口可访问 |
| 桌面端工程初始化 | Review | 无 | Tauri 窗口可打开 |
| Admin 工程初始化 | Review | 无 | Admin 页面可打开 |
| Momo Pet 资源目录 | Review | 无 | `assets/sprites/momo-pet` 存在 |
| README 启动说明 | Review | 工程初始化 | 可以按 README 启动 |

## Sprint 1：默认宠物闭环

| 任务 | 状态 | 依赖 | 验收标准 |
| --- | --- | --- | --- |
| Pet 聚合实现 | Review | 后端工程 | 领域测试通过 |
| PetState 聚合实现 | Review | 后端工程 | 状态初始化正确 |
| Feed API | Review | PetState | 饱食度变化 |
| Touch API | Review | PetState | 亲密度变化 |
| Clean API | Review | PetState | 清洁度变化 |
| 宠物主页静态 UI | Review | 桌面端工程 | 页面与 Figma 基本一致 |
| 状态条绑定 | Review | API | 前端显示后端状态 |

## Sprint 2：Windows/macOS 桌面端运行时

| 任务 | 状态 | 依赖 | 验收标准 |
| --- | --- | --- | --- |
| Windows 透明窗口 | In Progress | Tauri | Windows 窗口透明无边框 |
| macOS 透明窗口 | Done | Tauri | macOS 窗口透明无边框 |
| 基础置顶窗口 | In Progress | Tauri | Windows/macOS 普通桌面场景保持置顶 |
| 拖动宠物 | In Progress | 透明窗口 | 两个平台可拖动 |
| 位置缓存 | In Progress | 本地缓存 | 两个平台重启恢复位置 |
| Windows 托盘 | In Progress | Tauri | 可显示、隐藏、退出 |
| macOS 菜单栏 | Done | Tauri | 可显示、隐藏、退出 |

## Sprint 3：宠物交互模式

| 任务 | 状态 | 依赖 | 验收标准 |
| --- | --- | --- | --- |
| FeedingMode | In Progress | Sprint 1/2 | 拖食物触发喂食 |
| PettingMode | In Progress | Sprint 1/2 | 滑动触发抚摸 |
| CleaningMode | In Progress | Sprint 1/2 | 点击清理事件成功 |
| 模式退出规则 | In Progress | 三个模式 | Esc/超时/成功可退出 |
| 交互反馈 | In Progress | 三个模式 | 有气泡和状态增量 |

## Sprint 4：Pet Studio

| 任务 | 状态 | 依赖 | 验收标准 |
| --- | --- | --- | --- |
| 创建宠物页面 | Not Started | UI 基础 | 可填写名称和类型 |
| 主图上传 | Not Started | UI 基础 | 必须选择 1 张主图并完成格式、大小校验 |
| 参考图上传 | Not Started | 主图上传 | 可选上传最多 4 张参考图 |
| 图片顺序与角色 | Not Started | 参考图上传 | 可区分 PRIMARY、FRONT、SIDE、BACK、DETAIL、OTHER |
| 多图错误提示 | Not Started | 图片校验 | 超限、格式错误、过大时有明确提示 |
| AI 分析中页面 | Not Started | UI 基础 | 有生成仪式感 |
| Pet DNA 确认页 | Not Started | Pet DNA Schema | 可编辑字段 |
| 手动创建流程 | Not Started | Pet DNA 确认页 | 不依赖 AI 也能完成 |

## Sprint 5：AI Pet DNA 任务

| 任务 | 状态 | 依赖 | 验收标准 |
| --- | --- | --- | --- |
| 图片上传接口 | Not Started | asset 上下文 | 返回 assetId |
| 图片角色保存 | Not Started | 图片上传接口 | 保存 photoRole 并校验所属 petId |
| AI 任务创建 | Not Started | ai 上下文 | 接收 primaryPhotoAssetId 和 referencePhotoAssetIds，返回 taskId |
| AI 任务查询 | Not Started | ai 上下文 | 返回状态 |
| Pet DNA 草稿 | Not Started | AI Gateway | 符合 Schema |
| 多图一致性提醒 | Not Started | AI Gateway | 可展示 mismatchWarning 和低置信度字段 |
| 失败降级 | Not Started | 任务状态 | 可手动创建 |

## Sprint 6：基础聊天

| 任务 | 状态 | 依赖 | 验收标准 |
| --- | --- | --- | --- |
| Chat API | Not Started | chat 上下文 | 可保存消息 |
| Chat Panel | Not Started | UI | 可发送和展示回复 |
| 宠物口吻回复 | Not Started | AI Gateway | 回复符合 Pet DNA |
| AI 失败降级 | Not Started | Chat API | 不白屏，输入保留 |

## Sprint 7：后台 MVP

| 任务 | 状态 | 依赖 | 验收标准 |
| --- | --- | --- | --- |
| Dashboard | Not Started | Admin 工程 | 展示核心指标 |
| Pets 列表 | Not Started | Pet API | 可查看宠物 |
| Pet Detail | Not Started | Pet API | 可查看状态/DNA |
| AI Tasks 列表 | Not Started | AI API | 可查看任务状态 |
| 失败详情 | Not Started | AI Tasks | 可查看 errorCode |

## Sprint 8：Beta 验收

| 任务 | 状态 | 依赖 | 验收标准 |
| --- | --- | --- | --- |
| P0 用例回归 | Not Started | 所有 Sprint | P0 全通过 |
| 错误文案整理 | Not Started | 功能完成 | 文案一致 |
| 本地缓存稳定性 | Not Started | Sprint 2 | 重启不丢状态 |
| Windows 打包验证 | Not Started | 桌面端 | Windows 可安装或运行 |
| macOS 打包验证 | Not Started | 桌面端 | macOS 可安装或运行 |
