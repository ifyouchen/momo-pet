# Architecture Principles

## 核心原则

```text
React 画宠物
Rust 控窗口
Java 管大脑
Packages 管共识
Assets 管表现
Docs 管决策
```

## React 画宠物

React 负责用户能看见和操作的体验层：

- 宠物渲染。
- 动画播放界面。
- 互动 UI。
- Pet Studio。
- 聊天面板。
- 状态展示。
- Admin 管理后台界面。

React 不负责：

- 复杂 Life Engine 业务规则。
- Pet DNA 持久化。
- AI 任务调度。
- 原生窗口置顶、托盘、菜单栏等系统能力。

## Rust 控窗口

Rust/Tauri 负责桌面系统层：

- 透明窗口。
- 无边框。
- 基础置顶。
- 拖动。
- Windows 托盘。
- macOS 菜单栏。
- 本地文件和窗口位置缓存。
- Windows/macOS 平台能力适配。

Rust 不负责：

- 宠物养成规则。
- Pet DNA 生成。
- 用户业务数据决策。
- 后台管理 API。

## Java 管大脑

Java/Spring Boot 负责业务大脑：

- Pet DNA。
- Life Engine。
- Memory。
- AI Task。
- 宠物状态持久化。
- 用户数据。
- 后台管理 API。
- 统一错误码和业务日志。

Java 不负责：

- 桌面窗口如何置顶。
- 宠物动画如何逐帧播放。
- 前端 UI 组件状态。

## Packages 管共识

`packages/*` 负责跨应用共享但不属于后端权威业务的前端共识：

- `packages/shared`：共享类型、枚举、客户端协议。
- `packages/pet-runtime`：前端宠物状态机和互动事件。
- `packages/animation-engine`：动画播放、Sprite fallback、帧控制。
- `packages/ui`：通用 UI 组件和代码化设计 token。

约束：

- 不把后端领域模型复制成前端领域模型。
- 不把平台原生能力塞进 packages。
- 不把页面业务流程塞进 UI 包。

## Assets 管表现

`assets/*` 负责可替换的表现资源：

- `assets/sprites`：宠物 Sprite 和动画资源。
- `assets/sounds`：音效资源。
- `assets/themes`：主题资源。

资源缺失时必须能回退到 Momo Pet 或静默降级，不能阻断 MVP 主流程。

## Docs 管决策

产品范围、技术边界、验收标准和编码约束必须先写入 docs，再进入实现。

如果代码实现与 docs 冲突：

1. 先判断 docs 是否过期。
2. 若 docs 正确，调整代码。
3. 若产品决策变化，先更新 docs，再改代码。
