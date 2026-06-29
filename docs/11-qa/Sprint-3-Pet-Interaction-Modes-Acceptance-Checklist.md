# Sprint 3 Pet Interaction Modes Acceptance Checklist

## 目标

验收默认 Momo Pet 的三种鼠标交互模式：拖食物喂食、滑动抚摸、点击清理。Sprint 3 只升级交互方式，继续复用 Sprint 1 的 Feed、Touch、Clean API。

## 范围

包含：

- Home 窗口中的 FeedingMode、PettingMode、CleaningMode。
- 透明桌宠窗口中的 FeedingMode、PettingMode、CleaningMode。
- Esc、超时、关闭按钮退出模式。
- 成功后展示气泡和状态增量。

不包含：

- 新食物系统、库存、玩具、追逐、宠物交友。
- 鼠标穿透、复杂手势识别、多宠物互动。

## 前置条件

- Sprint 1 默认宠物闭环可用。
- Sprint 2 macOS 桌面运行时已验收通过。
- 后端运行在 `127.0.0.1:8080`。
- 桌面端可通过 `pnpm --filter @momo/desktop tauri:dev` 启动。

## 静态与构建检查

- [ ] TypeScript 构建通过。

```bash
pnpm build:desktop
```

- [ ] lint 通过。

```bash
pnpm lint
```

- [ ] 格式检查通过。

```bash
pnpm format:check
```

## Home 窗口验收

- [ ] 点击“喂食”进入喂食模式，不立即调用 Feed API。
- [ ] 将小鱼干拖到宠物命中区域后松开，触发喂食并展示状态增量。
- [ ] 点击“抚摸”进入抚摸模式，不立即调用 Touch API。
- [ ] 在宠物区域连续滑动约 1 秒后，触发抚摸并展示反馈。
- [ ] 点击“清理”进入清理模式，不立即调用 Clean API。
- [ ] 点击清理提示后，触发清理并展示反馈。
- [ ] Esc、关闭按钮、12 秒无操作都能退出当前模式。

## 透明桌宠窗口验收

- [ ] 小窗口工具栏可进入喂食、抚摸、清理模式。
- [ ] 交互模式中不会误触发窗口拖动。
- [ ] 非交互模式下仍可拖动桌宠窗口。
- [ ] 三种交互成功后调用对应 API 并展示气泡。
- [ ] 打开主页和隐藏桌宠按钮仍可用。

## 失败降级验收

- [ ] 后端未启动时，交互失败展示友好错误，不白屏。
- [ ] 模式退出后可重新进入同一模式。
- [ ] 操作提交中按钮禁用，避免重复提交。

## 通过标准

- Home 窗口和透明桌宠窗口的三种模式都通过。
- 构建、lint、格式检查通过。
- 不新增 Sprint 3 范围外的产品能力。
