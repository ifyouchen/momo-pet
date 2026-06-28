# Information Architecture

## 一级结构

```text
Home
├── Pet Studio
├── Desktop Pet
├── Pet Life
├── Chat
├── Story
└── Settings
```

## MVP 信息架构

MVP 只保留必要入口：

- 创建宠物
- 宠物状态
- 互动面板
- 聊天面板
- 设置

## 导航原则

- 用户第一次打开必须进入创建流程。
- 已有宠物时默认进入桌宠陪伴。
- 设置入口不抢占主流程。
- AI 生成中的进度必须可返回查看。

## 核心对象

- User
- Pet
- Pet DNA
- Pet State
- Care Action
- Chat Message
- Asset
- AI Task

## 关键交互约束

- 创建流程为 Welcome -> Upload Photo -> AI Analysis -> Pet DNA Confirm -> Deploy Desktop。
- 点击宠物打开互动面板，右键打开快捷菜单，托盘提供显示、隐藏、设置和退出。
- 喂食、铲屎、抚摸和聊天必须有即时反馈。
- AI 生成失败时提供重试和手动创建，不阻断用户进入产品。
- 后端不可用时进入本地模式，保留基础互动。

## 桌面 UX 约束

- 桌宠必须低打扰，不能长期遮挡系统关键区域。
- 全屏、会议、办公场景应降低动作频率或自动隐藏。
- 必须支持隐藏桌宠、减少动画和关闭主动提醒。

## 可访问性

- 所有操作按钮需要文本或 tooltip。
- 状态不能只依赖颜色表达。
- 聊天输入支持键盘操作。
- 错误提示必须可读且可恢复。
