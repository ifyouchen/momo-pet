# Sprint 4 Pet Studio Acceptance Checklist

## Goal

验收 Pet Studio MVP 前端创建流程：用户可以进入创建页、选择主图和参考图、完成前端校验、进入手动 Pet DNA 确认，并返回桌宠主页。

## Scope

包含：

- Pet Studio 入口。
- 基础信息表单。
- 主图上传。
- 最多 4 张参考图上传。
- 图片角色标记。
- 本地校验和错误提示。
- 生成仪式感页面。
- 手动 Pet DNA 确认页。

不包含：

- 后端上传接口。
- assetId。
- AI Pet DNA 任务。
- 正式 Pet DNA 持久化。
- 真实 Sprite 生成。

## Static Checks

- [ ] Desktop lint 通过。

```bash
pnpm --filter @momo/desktop lint
```

- [ ] Desktop build 通过。

```bash
pnpm --filter @momo/desktop build
```

- [ ] Prettier 检查通过。

```bash
pnpm format:check
```

## Entry

- [ ] 桌宠主页中的“生成”入口可点击。
- [ ] 点击后进入 Pet Studio，而不是显示禁用状态。
- [ ] 取消 Pet Studio 后可以返回桌宠主页。
- [ ] 返回主页后喂食、抚摸、清理仍可用。

## Basic Info

- [ ] 可以填写宠物名称。
- [ ] 可以选择物种。
- [ ] 可以填写描述。
- [ ] 名称为空时不能继续。
- [ ] 名称超过 20 个字符时展示错误。

## Photo Upload

- [ ] 未上传主图时不能继续。
- [ ] 上传 1 张合法主图后可以继续。
- [ ] 可选上传最多 4 张参考图。
- [ ] 第 5 张参考图被阻止。
- [ ] 支持 JPG、PNG、WebP。
- [ ] 非支持格式文件被阻止。
- [ ] 单文件超过 10 MB 被阻止。
- [ ] 批次总大小超过 30 MB 被阻止。
- [ ] 删除图片后可以重新上传。

## Photo Roles

- [ ] 主图角色固定为 PRIMARY。
- [ ] 参考图可选择 FRONT、SIDE、BACK、DETAIL、OTHER。
- [ ] 参考图角色变更后界面立即更新。

## Ritual

- [ ] 校验通过后进入生成仪式感页面。
- [ ] 页面文案不承诺真实 AI 生成。
- [ ] 短暂停留后进入 Pet DNA 手动确认页。

## Pet DNA Manual Confirm

- [ ] 可编辑 name。
- [ ] 可编辑 species。
- [ ] 可编辑 breed。
- [ ] 可编辑 primaryColor。
- [ ] 可编辑 pattern。
- [ ] 可编辑 eyeColor。
- [ ] 可编辑 personality.primary。
- [ ] 可编辑 energyLevel。
- [ ] 可编辑 favoriteFoods。
- [ ] 可编辑 dislikedThings。
- [ ] 可编辑 catchphrases。
- [ ] 确认后返回桌宠主页。

## Regression

- [ ] 桌宠窗口仍可拖动。
- [ ] 主页 X 只关闭主页，不退出程序。
- [ ] 托盘 Quit 仍可退出程序。
- [ ] 当前默认 Momo Pet 状态不丢失。

## 2026-06-30 验收修复记录

静态检查：

- [x] `pnpm --filter @momo/desktop lint`
- [x] `pnpm --filter @momo/desktop build`
- [x] `pnpm format:check`

浏览器预览：

- [x] 桌宠主页存在可点击的 Pet Studio 入口。
- [x] 未上传主图时继续按钮禁用，并展示 `需要先上传一张主图。`
- [x] 拖拽非 JPG/PNG/WebP 文件时展示 `只支持 JPG、PNG 或 WebP。`
- [x] 拖拽无法解码的图片时展示 `这张图片无法读取，请换一张更清晰的。`
- [x] 拖拽合法 PNG 后生成 PRIMARY 主图，继续按钮可用。
- [x] 4 张参考图可加入，并可将参考图角色改为 FRONT。
- [x] 第 5 张参考图被阻止，并展示 `最多上传 1 张主图和 4 张参考图。`
- [x] 单文件超过 10 MB 时展示 `单张图片不能超过 10 MB。`
- [x] 批次总大小超过 30 MB 时展示 `本次图片总大小不能超过 30 MB。`
- [x] 通过校验后进入生成仪式感页面。
- [x] 生成仪式感页面短暂停留后进入 Pet DNA 手动确认页。
- [x] 确认后返回桌宠主页，Pet Studio 视图关闭。

未在本轮重复实测：

- [ ] Tauri 桌宠窗口拖动、主页 X、托盘 Quit。Sprint 4 未改动 Tauri 运行时代码，进入人工验收前可按 Sprint 2 回归清单复测。
