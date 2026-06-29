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
