# Sprint 2 Desktop Runtime Acceptance Checklist

## 目标

验收桌宠从浏览器页面推进到真实 Tauri 桌面运行时：透明桌宠窗口可启动、可拖动、可隐藏/恢复、可打开主页窗口，并能在重启后恢复位置。

## 范围

包含：

- Tauri `pet` 透明窗口和 `home` 普通窗口。
- 无边框、透明、基础置顶、跳过任务栏、小尺寸桌宠窗口。
- 宠物主体拖动窗口。
- 本地 app data 目录保存和恢复 `window-position.json`。
- 托盘/菜单栏入口：Show Momo、Hide Momo、Open Home、Quit。
- 浏览器预览降级：`?window=pet` 和 `?window=home`。

不包含：

- 鼠标穿透、开机启动、全屏 Space 完整适配、多显示器复杂策略、安装包签名、公证。
- Pet Studio、AI Pet DNA、聊天、Sprint 3 拖食物/滑动抚摸/点击清理模式。

## 前置条件

- Sprint 1 默认宠物闭环可用。
- Node.js 24+、pnpm 11+。
- Rust 和 Cargo 已安装，并能执行 `cargo --version`。
- 后端运行在 `127.0.0.1:8080`，桌面端 dev server 运行在 `127.0.0.1:5173`。
- macOS 和 Windows 都需要实机验收；单平台通过不能标记 Sprint 2 Done。

## 静态与构建检查

- [ ] 桌面前端构建通过。

```bash
pnpm build:desktop
```

- [ ] Tauri Rust 工程编译检查通过。

```bash
cd apps/desktop/src-tauri
cargo check
```

- [ ] Tauri dev shell 可启动。

```bash
pnpm --filter @momo/desktop tauri:dev
```

- [ ] `tauri.conf.json` 中 `pet` 窗口具备 `transparent=true`、`decorations=false`、`alwaysOnTop=true`、`resizable=false`、`skipTaskbar=true`。
- [ ] `window_manager.rs` 注册 Show/Hide/Open Home/Quit 菜单，并在退出或隐藏前保存位置。
- [ ] `position_store.rs` 使用 Tauri app data 目录保存 `window-position.json`。

## 浏览器预览验收

- [ ] `http://127.0.0.1:5173/?window=pet` 渲染透明桌宠布局，不显示完整主页卡片。
- [ ] `http://127.0.0.1:5173/?window=home` 渲染完整主页布局，显示状态面板和操作 Dock。
- [ ] 浏览器模式下点击“打开主页”“隐藏桌宠”不会报错或白屏。
- [ ] 后端未启动时，桌宠/主页都展示友好错误文案。

## macOS 实机验收

- [ ] 启动 Tauri 后出现透明、无边框桌宠窗口。
- [ ] 桌宠窗口在普通桌面场景保持置顶。
- [ ] 按住宠物主体可拖动窗口，拖动过程不触发照顾行为。
- [ ] 隐藏桌宠后，可通过菜单栏/托盘入口 Show Momo 恢复。
- [ ] Open Home 打开普通主页窗口，主页可聚焦且可操作。
- [ ] Quit 前保存窗口位置；重启后恢复到上次位置。
- [ ] 若保存位置不可见，重启后回到主屏右下安全区域。
- [ ] 菜单栏/托盘入口包含 Show Momo、Hide Momo、Open Home、Quit。

## Windows 实机验收

- [ ] 启动 Tauri 后出现透明、无边框桌宠窗口。
- [ ] 桌宠窗口在普通桌面场景保持置顶。
- [ ] 按住宠物主体可拖动窗口，拖动过程不触发照顾行为。
- [ ] 隐藏桌宠后，可通过系统托盘 Show Momo 恢复。
- [ ] Open Home 打开普通主页窗口，主页可聚焦且可操作。
- [ ] Quit 前保存窗口位置；重启后恢复到上次位置。
- [ ] 若保存位置不可见，重启后回到主屏右下安全区域。
- [ ] 托盘菜单包含 Show Momo、Hide Momo、Open Home、Quit。

## 失败降级验收

- [ ] Tauri runtime mode 读取失败时，前端降级到 `home-window` 并展示提示。
- [ ] 宠物资源缺失时使用默认 Momo Pet fallback，不白屏。
- [ ] 位置缓存损坏时应用仍能启动，并使用默认安全位置。
- [ ] 托盘/菜单栏不可用时，窗口内隐藏和打开主页按钮仍可用。

## 当前阻塞记录

- macOS 已完成人工实机验收，通过透明窗口、拖动、隐藏/恢复、主页打开和位置恢复检查。
- Windows 实机验收待执行；Sprint 2 整体在 Windows 通过前不标记 Done。
- 已验证 `pnpm build:desktop`、`cargo check --locked` 和 `pnpm --filter @momo/desktop tauri:dev` 通过。

## 通过标准

- macOS 和 Windows 实机验收项全部通过。
- `cargo check`、`pnpm build:desktop` 通过。
- 隐藏/恢复/退出/重启恢复位置无阻断性问题。
- 未通过项需记录平台、系统版本、复现步骤、实际表现、日志或截图。
