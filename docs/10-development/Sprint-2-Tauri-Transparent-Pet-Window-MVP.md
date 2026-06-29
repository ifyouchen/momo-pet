# Sprint 2 Plan: Tauri Transparent Desktop Pet Window MVP

## Summary

Sprint 2 的目标是把当前 React 桌面主页中的 Momo Pet，从“浏览器页面里的宠物”推进到“真正运行在 Windows/macOS 桌面上的透明桌宠窗口”。

本 Sprint 不改后端养成规则，不做完整动画系统，不接 Pet Studio 和 AI。重点是验证桌宠产品最核心的系统能力：

```text
启动桌面端 -> 出现透明桌宠窗口 -> 可拖动 -> 可置顶 -> 可隐藏/恢复 -> 重启后恢复位置
```

## Product Goal

用户打开 Momo 后，应该先看到一个像桌宠的透明小窗口，而不是一个网页大卡片。宠物可以陪在桌面上，用户可以拖到合适位置，并通过托盘或菜单栏恢复、隐藏或退出。

## Product References

本 Sprint 必须遵守以下文档：

- `docs/00-project/Architecture-Principles.md`
- `docs/01-product/MVP.md`
- `docs/01-product/FeatureList.md`
- `docs/05-desktop-runtime/Architecture.md`
- `docs/05-desktop-runtime/WindowManager.md`
- `docs/05-desktop-runtime/Platform-Support.md`
- `docs/10-development/CodingSpec.md`
- `docs/10-development/AI-Coding-Guardrails.md`

如果实现时发现这些文档和本计划冲突，以产品与平台文档为准，先更新文档再继续编码。

## Scope

### In Scope

- Tauri 桌面端以独立窗口运行当前 React 应用。
- 新增桌宠透明窗口模式。
- 桌宠窗口透明、无边框、基础置顶。
- 桌宠窗口可拖动。
- 保存并恢复窗口位置。
- Windows 托盘入口：显示、隐藏、退出。
- macOS 菜单栏入口：显示、隐藏、退出。
- 保留当前 Sprint 1 养成闭环 API。
- 保留当前 Sprint 1.7 单帧透明猫咪资源和 manifest fallback。
- 提供普通窗口降级：透明或置顶失败时，应用仍可启动。

### Out of Scope

- 不做完整多帧动画系统。
- 不做鼠标穿透切换。
- 不做开机启动。
- 不做全屏应用自动隐藏。
- 不做多显示器复杂策略，只做基本可见区域校正。
- 不做 Pet Studio。
- 不接 AI。
- 不做宠物交友、商城、插件、支付。
- 不重构后端领域模型。

## User Flow

### First Launch

```text
用户启动 Momo
-> Tauri 创建桌宠窗口
-> React 加载默认 Momo Pet
-> 若没有 petId，复用 Sprint 1 逻辑创建默认宠物
-> 透明桌宠窗口显示在桌面右下或屏幕安全区域
-> 显示首次气泡
```

### Drag And Restore

```text
用户拖动宠物到屏幕某处
-> Tauri 保存窗口坐标
-> 用户退出应用
-> 用户再次启动应用
-> 桌宠恢复到上次位置
-> 如果上次位置不可见，自动回到当前主屏安全区域
```

### Hide And Show

```text
用户从托盘/菜单栏点击隐藏
-> 桌宠窗口隐藏
-> 用户从托盘/菜单栏点击显示
-> 桌宠窗口恢复到上次位置
```

### Exit

```text
用户从托盘/菜单栏点击退出
-> 保存窗口位置
-> 关闭应用
```

## Window Modes

### Pet Window Mode

桌宠窗口模式是 Sprint 2 的主目标。

特点：

- 透明背景。
- 无边框。
- 基础置顶。
- 小尺寸窗口。
- 只显示宠物、气泡、最小必要反馈。
- 不显示完整状态面板和操作大卡片。
- 可拖动。

建议初始尺寸：

```text
width: 420
height: 520
```

后续可以根据宠物姿态和气泡尺寸微调。

### Home Window Mode

主页窗口模式保留当前完整 React 页面，用于查看状态和操作。

特点：

- 普通窗口。
- 可显示完整状态面板。
- 可进入后续设置、Pet Studio、后台入口。
- Sprint 2 只保证可从桌宠入口打开，不做大量视觉重构。

## Key Changes

### Desktop App

- 检查并完善 `apps/desktop/src-tauri` 配置。
- 增加透明桌宠窗口配置：
  - `transparent: true`
  - `decorations: false`
  - `alwaysOnTop: true`
  - `resizable: false`
  - `skipTaskbar` 可按平台验证后决定
- 增加普通主页窗口配置：
  - 非透明
  - 可调整大小
  - 用于完整状态和后续设置
- React 根据窗口模式渲染不同布局：
  - `pet-window`: 透明桌宠模式
  - `home-window`: 当前主页模式

### Native Runtime

- 新增 Window Manager 封装，不让 React 业务组件直接调用零散 Tauri API。
- Rust/Tauri 负责：
  - 创建窗口。
  - 显示/隐藏窗口。
  - 设置置顶。
  - 获取和保存窗口位置。
  - 托盘/菜单栏事件。
- 前端负责：
  - 宠物视觉渲染。
  - 气泡反馈。
  - 调用已有 care API。
  - 根据 runtime 状态展示友好错误。

### Local Position Cache

MVP 先保存本地窗口位置，不引入云同步。

建议数据结构：

```json
{
  "petWindow": {
    "x": 1200,
    "y": 540,
    "width": 420,
    "height": 520,
    "displayId": "primary",
    "updatedAt": "2026-06-29T00:00:00+08:00"
  }
}
```

存储位置：

- 优先使用 Tauri app data 目录。
- 不放在前端 `localStorage`，因为窗口位置属于桌面 runtime 状态。

### Tray And Menu Bar

Windows：

- 系统托盘显示 Momo 图标。
- 菜单项：
  - Show Momo
  - Hide Momo
  - Open Home
  - Quit

macOS：

- 菜单栏状态项显示 Momo 图标或文字入口。
- 菜单项：
  - Show Momo
  - Hide Momo
  - Open Home
  - Quit

MVP 不要求托盘菜单视觉精致，优先保证稳定可恢复。

### Dragging

Sprint 2 采用最小可行拖动策略：

- 用户按住宠物主体区域即可拖动窗口。
- 拖动结束后保存位置。
- 拖动过程中不触发抚摸。
- 点击宠物可以保留为后续 Sprint 3 的抚摸入口，本 Sprint 不强行实现复杂手势。

### Fallback Strategy

平台能力失败时必须降级：

| 失败场景             | 降级策略                             |
| -------------------- | ------------------------------------ |
| 透明窗口失败         | 使用普通无边框或普通窗口启动         |
| 置顶失败             | 普通窗口展示，并提示“置顶能力不可用” |
| 托盘/菜单栏失败      | 保留窗口内关闭/隐藏入口              |
| 位置读取失败         | 使用默认安全位置                     |
| 位置恢复到不可见区域 | 回到主屏右下安全区域                 |
| 宠物图片缺失         | 使用 Sprint 1.7 manifest fallback    |

## Architecture Boundaries

### React

React 负责 UI 和交互：

- `DesktopPetWindow`：透明桌宠窗口布局。
- `HomeWindow`：完整主页布局。
- `MomoPetAvatar`：继续读取 sprite manifest。
- `SpeechBubble`：桌宠气泡。
- `useDefaultPet`：继续负责宠物初始化和 care API。
- `useWindowMode`：读取当前窗口模式。

React 不负责：

- 直接操作系统托盘。
- 直接读写 app data 文件。
- 直接判断 Windows/macOS 分支。
- 实现宠物养成业务规则。

### Tauri/Rust

Tauri/Rust 负责系统能力：

- `window_manager`：窗口创建、显示、隐藏、置顶。
- `position_store`：窗口位置读写。
- `tray` 或 `menu_bar`：平台恢复入口。
- `runtime_error`：统一 runtime 错误返回。

Rust 不负责：

- PetState 数值计算。
- 喂食、抚摸、清理业务规则。
- AI 生成。
- 复杂 UI 状态。

### Backend

本 Sprint 不新增后端 API。

继续使用：

- `POST /api/pets`
- `GET /api/pets/{petId}`
- `GET /api/pets/{petId}/state`
- `POST /api/pets/{petId}/care/feed`
- `POST /api/pets/{petId}/care/touch`
- `POST /api/pets/{petId}/care/clean`

## Proposed File Changes

具体实现时可按项目现状微调，但建议先按以下方向组织：

```text
apps/desktop/
├── src/
│   ├── features/desktop-pet/
│   │   ├── components/
│   │   │   ├── DesktopScene.tsx
│   │   │   ├── DesktopPetWindow.tsx
│   │   │   └── HomeWindow.tsx
│   │   ├── hooks/
│   │   │   ├── use-default-pet.ts
│   │   │   └── use-window-mode.ts
│   │   └── runtime/
│   │       └── desktop-runtime-api.ts
│   └── styles.css
└── src-tauri/
    ├── src/
    │   ├── main.rs
    │   ├── window_manager.rs
    │   ├── position_store.rs
    │   └── runtime_error.rs
    └── tauri.conf.json
```

## Implementation Order

### Step 1: Audit Current Tauri Setup

- 确认 `apps/desktop/src-tauri` 是否完整。
- 确认当前 React 页面能被 Tauri 加载。
- 确认 Windows 本机能启动 Tauri dev。

验收：

- `pnpm --filter @momo/desktop tauri dev` 或项目等价命令可以打开窗口。

### Step 2: Create Pet Window Mode

- 新增透明桌宠窗口布局。
- 只渲染宠物、气泡和最小反馈。
- 背景必须透明，不出现页面大白卡。
- 保留 Sprint 1.7 透明猫咪资产。

验收：

- 浏览器模式下可通过 query 或 mock mode 预览 `pet-window`。
- Tauri 模式下显示小型桌宠窗口。

### Step 3: Configure Transparent Window

- 配置透明、无边框、不可调整尺寸。
- 设置基础置顶。
- 验证 Windows 透明效果。
- 预留 macOS 配置路径。

验收：

- Windows 桌面只看到猫咪和气泡，不看到背景色块。
- 窗口不会出现在普通网页大卡片形态。

### Step 4: Implement Drag And Position Restore

- 支持拖动宠物窗口。
- 拖动结束保存窗口位置。
- 启动时读取位置。
- 位置不可见时回到安全区域。

验收：

- 拖动后退出，再启动能回到上次位置。
- 手动改坏位置缓存时，能回到安全区域。

### Step 5: Add Tray/Menu Bar Entry

- Windows 实现托盘入口。
- macOS 实现菜单栏入口。
- 支持显示、隐藏、打开主页、退出。

验收：

- 隐藏后可恢复。
- 退出前保存位置。
- 没有托盘/菜单栏时仍有窗口内降级入口。

### Step 6: Keep Home Window Available

- 保留当前完整主页。
- 从托盘/菜单栏可打开 Home Window。
- Home Window 继续展示状态条和操作 Dock。

验收：

- 桌宠窗口和主页窗口职责清晰。
- 主页打开后不破坏桌宠窗口。

## Acceptance Criteria

### P0

- Windows 可启动 Tauri 桌面端。
- Windows 显示透明无边框桌宠窗口。
- Windows 桌宠窗口基础置顶。
- Windows 可拖动桌宠。
- Windows 重启后恢复窗口位置。
- Windows 可通过托盘显示、隐藏、退出。
- 后端未启动时桌宠不白屏，显示友好错误。
- 宠物资源缺失时仍可 fallback。
- 当前 Sprint 1 care API 仍可使用。

### P1

- macOS 可启动 Tauri 桌面端。
- macOS 显示透明无边框桌宠窗口。
- macOS 可通过菜单栏显示、隐藏、退出。
- macOS 重启后恢复窗口位置。
- 位置恢复能处理基本屏幕边界。

### P2

- 支持从桌宠窗口打开主页窗口。
- 支持窗口内降级提示。
- 支持基础 runtime 错误日志。

## Test Plan

### Frontend

- `pnpm format:check`
- `pnpm --filter @momo/desktop lint`
- `pnpm --filter @momo/desktop build`
- `pnpm build:packages`

### Tauri Windows

- 启动桌面端。
- 检查透明背景。
- 检查无边框。
- 检查置顶。
- 拖动窗口并重启，确认位置恢复。
- 隐藏并通过托盘恢复。
- 从托盘退出。
- 后端关闭时确认不白屏。

### Tauri macOS

macOS 需要在真实 macOS 环境验证：

- 启动桌面端。
- 检查透明背景。
- 检查基础置顶。
- 拖动窗口并重启，确认位置恢复。
- 隐藏并通过菜单栏恢复。
- 从菜单栏退出。

### Backend Regression

- 使用 JDK 21 运行：

```text
cd apps/backend
mvn test
```

后端不应因 Sprint 2 变更出现测试回归。

## Logging

Tauri/Rust runtime 日志至少覆盖：

- 窗口创建成功或失败。
- 透明/置顶能力设置失败。
- 位置读取失败。
- 位置保存失败。
- 托盘/菜单栏创建失败。

日志必须包含业务动作和关键上下文，避免打印完整大对象或用户隐私。

## Risks

| 风险                         | 影响                   | 应对                                                 |
| ---------------------------- | ---------------------- | ---------------------------------------------------- |
| Windows 透明窗口点击区域异常 | 桌宠可能难以拖动或点击 | 先不做鼠标穿透，保持窗口区域可交互                   |
| macOS Space/全屏应用层级差异 | 置顶表现不一致         | MVP 只承诺普通桌面场景置顶                           |
| 托盘/菜单栏 API 差异         | 恢复入口不稳定         | 平台 adapter 分离，失败时保留窗口内入口              |
| 多显示器坐标复杂             | 重启后窗口可能不可见   | 做可见区域校正，复杂多屏策略后置                     |
| 透明资源边界过大             | 点击/拖动区域不自然    | Sprint 2 先接受窗口矩形拖动，Sprint 3 再优化命中区域 |

## Done Definition

Sprint 2 完成必须满足：

- Windows P0 验收通过。
- macOS P1 至少完成代码路径，并在可用 macOS 环境完成验证或标记待验收。
- 前端构建和 lint 通过。
- 后端测试通过。
- 文档更新，包括已知限制和启动方式。
- 没有引入 Pet Studio、AI、完整动画系统等越界功能。

## Next Sprint

Sprint 2 完成后，进入 Sprint 3：宠物交互模式。

Sprint 3 再做：

- 拖食物喂食。
- 鼠标滑动抚摸。
- 点击清理事件。
- Esc/超时退出交互模式。
- 更自然的桌宠互动反馈。
