# 12 Sprint Plan

## Sprint 0：文档与工程准备

目标：

- 完成核心文档。
- 创建后端、桌面端工程骨架。
- 确定 API 契约和数据模型。

交付：

- docs 核心文档
- Spring Boot DDD 目录
- Tauri + React 目录
- 基础 CI 和格式化配置

## Sprint 1：宠物创建闭环

目标：

- 用户可创建宠物档案。
- 用户可上传 1 张主图和最多 4 张参考图。
- 后端可保存宠物和资源元数据。

交付：

- 宠物创建 API
- 图片上传 API，支持 photoRole
- 前端创建流程
- 基础错误态

## Sprint 2：Pet DNA

目标：

- 创建 Pet DNA 生成任务。
- 任务请求支持 primaryPhotoAssetId 和 referencePhotoAssetIds。
- 支持 AI 生成失败后的手动编辑。
- Pet DNA 可展示、保存、版本化。

交付：

- AI 任务表
- Pet DNA 聚合
- 任务查询接口
- Pet DNA 确认页面

## Sprint 3：桌宠运行时

目标：

- 桌宠可在 Windows 桌面显示。
- 支持透明、置顶、拖动、隐藏。
- 支持基础动作切换。

交付：

- Tauri 窗口模块
- React Pet 组件
- Idle、Walk、Sleep、Eat 动作
- 系统托盘退出

## Sprint 4：养成互动

目标：

- 支持喂食、铲屎、抚摸。
- 状态可变化并保存。
- 前端有即时反馈。

交付：

- care 上下文
- Pet State 聚合
- 喂食、铲屎、抚摸 API
- 状态面板

## Sprint 5：基础聊天

目标：

- 支持用户与宠物聊天。
- AI 回复符合 Pet DNA 和当前状态。
- 聊天失败有降级提示。

交付：

- chat 上下文
- Dialogue Engine
- 聊天面板
- 最近聊天摘要

## Sprint 6：Beta 打磨

目标：

- 修复核心体验问题。
- 增加本地缓存。
- 完成打包和安装体验。

交付：

- Windows 安装包
- 本地缓存
- 崩溃与错误日志
- Beta 验收清单
