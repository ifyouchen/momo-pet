# Sprint 5 AI Pet DNA Acceptance Checklist

## Goal

验收 Sprint 5：Pet Studio 从本地前端草稿升级为真实后端任务链路。用户上传主图和参考图后，系统保存 asset、创建 AI Pet DNA 任务、查询任务状态、展示 Pet DNA 草稿，并在失败时保留手动确认路径。

## Scope

包含：

- 宠物照片上传接口。
- asset 元数据保存。
- AI Pet DNA 任务创建。
- AI 任务状态查询。
- Pet DNA 草稿返回。
- Pet DNA 用户确认和版本化保存。
- 前端上传中、分析中、成功、失败降级状态。

不包含：

- 真实 Sprite 生成。
- 真实动画帧生成。
- 聊天能力。
- 后台管理页。
- 付费、登录、多用户权限。
- 云对象存储。

## Static Checks

- [ ] Desktop lint 通过。

```bash
pnpm --filter @momo/desktop lint
```

- [ ] Desktop build 通过。

```bash
pnpm --filter @momo/desktop build
```

- [ ] Packages build 通过。

```bash
pnpm build:packages
```

- [ ] Prettier 检查通过。

```bash
pnpm format:check
```

- [ ] Backend tests 通过。

```bash
cd apps/backend && mvn test
```

## Backend: Asset Upload

- [ ] `POST /api/pets/{petId}/photos` 可上传合法 JPG。
- [ ] `POST /api/pets/{petId}/photos` 可上传合法 PNG。
- [ ] `POST /api/pets/{petId}/photos` 可上传合法 WebP。
- [ ] 上传成功返回 `assetId`、`assetType`、`photoRole`、`status`、`contentType`、`sizeBytes`。
- [ ] 上传成功后 `asset` 表存在对应记录。
- [ ] 上传成功后本地存储目录存在文件。
- [ ] 数据库只保存 storage key，不保存机器绝对路径。
- [ ] 原始文件名不会被直接用作存储文件名。
- [ ] 非支持格式返回 `ASSET_TYPE_UNSUPPORTED`。
- [ ] 单文件超过 10 MB 返回 `ASSET_TOO_LARGE`。
- [ ] 不存在 petId 返回 `PET_NOT_FOUND`。
- [ ] 文件写入失败时返回 `ASSET_UPLOAD_FAILED`，且不产生 READY 脏数据。

## Backend: Task Creation

- [ ] `POST /api/pets/{petId}/dna/generation-tasks` 可以用 1 张 PRIMARY 主图创建任务。
- [ ] 创建任务成功返回 `taskId` 和 `PENDING`。
- [ ] `ai_generation_task` 表存在任务记录。
- [ ] `requestPayload` 包含 `primaryPhotoAssetId`。
- [ ] `requestPayload` 包含 `referencePhotoAssetIds`。
- [ ] `requestPayload` 包含 `name`、`speciesHint`、`userDescription`。
- [ ] 缺少主图返回 `PRIMARY_PHOTO_REQUIRED`。
- [ ] 参考图超过 4 张返回 `REFERENCE_PHOTO_LIMIT_EXCEEDED`。
- [ ] 不存在 assetId 返回 `ASSET_NOT_FOUND`。
- [ ] 非 READY asset 返回 `ASSET_NOT_READY`。
- [ ] 跨 petId asset 返回 `ASSET_OWNER_MISMATCH`。
- [ ] 主图 asset 的 photoRole 不是 PRIMARY 时创建失败。
- [ ] 创建任务接口不在请求线程内调用 AI Gateway。

## Backend: AI Task Execution

- [ ] 执行器可以拉取 `PENDING` 任务。
- [ ] 执行器开始处理后任务状态变为 `RUNNING`。
- [ ] Mock AI 成功后任务状态变为 `SUCCEEDED`。
- [ ] 成功任务写入 `resultPayload`。
- [ ] `resultPayload` 符合 `PetDNA-Schema.md` 的 MVP 字段要求。
- [ ] `resultPayload.generation.source` 为 `AI`。
- [ ] `resultPayload.generation.confidence` 范围为 0 到 1。
- [ ] AI 输出不合法时任务变为 `FAILED`，错误码为 `AI_RESULT_INVALID`。
- [ ] Mock AI 失败时任务变为 `FAILED`，错误码为 `AI_GENERATION_FAILED`。
- [ ] Mock AI 超时时任务变为 `TIMEOUT` 或 `FAILED`，错误码为 `AI_GENERATION_TIMEOUT`。
- [ ] 任务执行日志包含 taskId、petId、状态变化和错误码。
- [ ] 不打印完整图片内容、完整 Prompt 或超大 JSON。

## Backend: Task Query

- [ ] `GET /api/ai/tasks/{taskId}` 可查询 `PENDING`。
- [ ] `GET /api/ai/tasks/{taskId}` 可查询 `RUNNING`。
- [ ] `GET /api/ai/tasks/{taskId}` 可查询 `SUCCEEDED`。
- [ ] `GET /api/ai/tasks/{taskId}` 可查询 `FAILED`。
- [ ] 成功任务返回 Pet DNA 草稿。
- [ ] 失败任务返回 `errorCode`，`result` 为 null。
- [ ] 不存在 taskId 返回 `AI_TASK_NOT_FOUND`。

## Backend: Pet DNA Confirm

- [ ] `PUT /api/pets/{petId}/dna` 可以保存 AI 草稿。
- [ ] 确认成功返回 `petId` 和 `version`。
- [ ] 首次确认 version 为 1。
- [ ] 再次确认 version 递增。
- [ ] `pet_dna` 表保存完整 `dna_payload`。
- [ ] `source` 支持 `AI / MANUAL / MIXED`。
- [ ] name 为空返回 `PET_DNA_INVALID` 或 `VALIDATION_FAILED`。
- [ ] confidence 超出 0 到 1 时返回 `PET_DNA_INVALID`。
- [ ] 不存在 petId 返回 `PET_NOT_FOUND`。

## Frontend: Upload Flow

- [ ] Pet Studio 入口仍可从桌宠主页打开。
- [ ] 未选择主图时不能开始生成。
- [ ] 点击继续后进入 `uploading` 状态。
- [ ] 上传中按钮禁用，不能重复提交。
- [ ] 多张图片上传时最多并行 5 个请求。
- [ ] 任一图片上传失败时展示上传失败提示。
- [ ] 上传失败后保留用户已填表单。
- [ ] 上传失败后可以重试。
- [ ] 上传失败后可以进入手动 Pet DNA 确认。

## Frontend: AI Task Flow

- [ ] 图片上传成功后创建 AI Pet DNA 任务。
- [ ] 创建任务成功后展示 AI 分析中页面。
- [ ] 前端按固定间隔轮询任务状态。
- [ ] 轮询中展示明确的分析中文案，不承诺生成可动 Sprite。
- [ ] 查询到 `SUCCEEDED` 后进入 Pet DNA 确认页。
- [ ] 查询到 `FAILED` 后展示失败降级。
- [ ] 查询到 `TIMEOUT` 后展示超时降级。
- [ ] 用户关闭 Pet Studio 后停止轮询。
- [ ] 用户取消 Pet Studio 后停止轮询。
- [ ] 网络异常时不白屏，展示可重试或手动创建。

## Frontend: Pet DNA Draft

- [ ] AI 成功后 name 填入确认页。
- [ ] AI 成功后 species 填入确认页。
- [ ] AI 成功后 breed 填入确认页。
- [ ] AI 成功后 primaryColor 填入确认页。
- [ ] AI 成功后 pattern 填入确认页。
- [ ] AI 成功后 eyeColor 填入确认页。
- [ ] AI 成功后 personality.primary 填入确认页。
- [ ] AI 成功后 energyLevel 填入确认页。
- [ ] AI 成功后 favoriteFoods 填入确认页。
- [ ] AI 成功后 dislikedThings 填入确认页。
- [ ] AI 成功后 catchphrases 填入确认页。
- [ ] 若存在 `mismatchWarning`，确认页展示多图一致性提醒。
- [ ] 用户可以编辑所有 MVP Pet DNA 字段。
- [ ] 用户确认后调用 `PUT /api/pets/{petId}/dna`。
- [ ] 确认成功后返回桌宠主页。

## Frontend: Failure Fallback

- [ ] AI 失败时展示 `我没能看清它的样子，你可以先手动填写，之后再重新生成。`
- [ ] AI 超时时展示 `分析时间有点久，我们先用手动草稿继续。`
- [ ] 上传失败时展示 `照片上传失败了，可以重试，也可以先手动创建。`
- [ ] 失败后点击手动创建进入 Pet DNA 手动确认页。
- [ ] 手动确认保存时 `source` 为 `MANUAL` 或 `MIXED`。
- [ ] 失败降级不影响桌宠主页已有喂食、抚摸、清理功能。

## Regression

- [ ] 桌宠主页仍能展示默认 Momo Pet。
- [ ] 喂食交互仍调用既有后端 API。
- [ ] 抚摸交互仍调用既有后端 API。
- [ ] 清理交互仍调用既有后端 API。
- [ ] Pet Studio 取消后返回主页。
- [ ] 主页 X 只关闭主页，不退出程序。
- [ ] 托盘 Quit 仍可退出程序。
- [ ] 桌宠窗口仍可拖动。

## Manual Acceptance Script

### 成功路径

1. 启动后端和桌面端。
2. 打开桌宠主页。
3. 进入 Pet Studio。
4. 填写名称、类型、描述。
5. 上传 1 张主图和 2 张参考图。
6. 点击继续。
7. 确认进入上传中。
8. 确认进入 AI 分析中。
9. 等待任务成功。
10. 检查 Pet DNA 确认页字段是否有 AI 草稿值。
11. 修改一个字段。
12. 点击确认。
13. 确认返回桌宠主页。
14. 检查数据库 `pet_dna` 存在 version 1。

### 失败路径

1. 开启 Mock AI 失败模式。
2. 重复成功路径到 AI 分析中。
3. 等待任务失败。
4. 确认展示失败降级文案。
5. 点击手动创建。
6. 填写或确认 Pet DNA。
7. 点击确认。
8. 确认返回桌宠主页。
9. 检查数据库 `pet_dna.source` 为 `MANUAL` 或 `MIXED`。

## Exit Criteria

- 所有静态检查通过。
- 后端新增领域和接口测试通过。
- 成功路径浏览器或 Tauri 预览通过。
- 失败降级路径浏览器或 Tauri 预览通过。
- Sprint 1 到 Sprint 4 的主流程没有回归。
- `docs/10-development/MVP-Progress-Tracker.md` 中 Sprint 5 状态可推进到 `Review`。

## 2026-06-30 实现验证记录

静态检查：

- [x] `cd apps/backend && mvn test`
- [x] `pnpm build:packages`
- [x] `pnpm --filter @momo/desktop lint`
- [x] `pnpm --filter @momo/desktop build`
- [x] `pnpm format:check`

端到端冒烟：

- [x] `POST /api/pets` 创建测试宠物成功。
- [x] `POST /api/pets/{petId}/photos` 上传 PNG 主图成功，返回 `assetId`。
- [x] `POST /api/pets/{petId}/dna/generation-tasks` 创建 `PET_DNA_GENERATION` 任务成功，返回 `taskId`。
- [x] `GET /api/ai/tasks/{taskId}` 轮询到 `SUCCEEDED`。
- [x] Mock AI 返回 `petDnaDraft`。
- [x] `PUT /api/pets/{petId}/dna` 确认 Pet DNA 成功，返回 `version=1`。

实现说明：

- [x] Sprint 5 使用 `MockPetDnaAiGateway` 打通异步任务闭环。
- [x] 本轮未接真实多模态模型。
- [x] 本轮未生成真实 Sprite 或动画资产。
- [x] 本轮未改后台管理页和聊天能力。

待人工体验：

- [ ] 在桌面端 Pet Studio 上传真实图片走完整 UI 流程。
- [ ] 验证 AI 失败降级文案和手动创建体验是否符合预期。
- [ ] 验证 Tauri 窗口、托盘和桌宠拖动没有回归。
