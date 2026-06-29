# Sprint 1 Acceptance Checklist

## 目标

验收默认 Momo Pet 的最小养成闭环：创建默认宠物、读取状态、喂食、抚摸、清理，并在桌面端看到状态变化与即时反馈。

## 范围

包含：

- Pet 聚合与 PetState 初始化。
- `POST /api/pets`、`GET /api/pets/{petId}`、`GET /api/pets/{petId}/state`。
- `POST /api/pets/{petId}/care/feed`、`touch`、`clean`。
- 桌面端默认宠物初始化、状态条绑定、状态增量反馈。

不包含：

- Pet Studio、照片上传、AI Pet DNA、聊天、Tauri 跨平台窗口验收。

## 前置条件

- 使用 JDK 21。
- 已执行 `pnpm install`，并允许 `esbuild` build script。
- 后端端口为 `127.0.0.1:8080`。
- 如需干净数据，可先删除 `apps/backend/data/` 后重新启动后端。

## 启动与质量门禁

- [ ] 后端启动成功：

```bash
cd apps/backend
JAVA_HOME=$(/usr/libexec/java_home -v 21) mvn spring-boot:run
```

- [ ] 桌面 React surface 启动成功：

```bash
pnpm dev:desktop
```

- [ ] 质量门禁通过：

```bash
pnpm lint
pnpm format:check
pnpm build:packages
pnpm build:desktop
cd apps/backend && JAVA_HOME=$(/usr/libexec/java_home -v 21) mvn test
```

## API 验收

- [ ] 健康检查返回 `success=true`、`status=UP`。

```bash
curl http://127.0.0.1:8080/api/health
```

- [ ] 创建默认宠物成功，响应包含 `petId`、`name`、`species`、`status=ACTIVE`。

```bash
curl -X POST http://127.0.0.1:8080/api/pets \
  -H 'Content-Type: application/json' \
  -d '{"name":"Momo Pet","species":"CAT"}'
```

- [ ] 使用上一步 `petId` 查询宠物详情成功。

```bash
curl http://127.0.0.1:8080/api/pets/{petId}
```

- [ ] 查询宠物状态成功，包含 `hunger`、`mood`、`cleanliness`、`energy`、`intimacy`、`experience`、`level`。

```bash
curl http://127.0.0.1:8080/api/pets/{petId}/state
```

- [ ] 喂食成功，`hunger`、`mood`、`experience` 至少一项按规则增加。

```bash
curl -X POST http://127.0.0.1:8080/api/pets/{petId}/care/feed \
  -H 'Content-Type: application/json' \
  -d '{"foodCode":"DRIED_FISH"}'
```

- [ ] 抚摸成功，`intimacy`、`mood`、`experience` 至少一项按规则增加。

```bash
curl -X POST http://127.0.0.1:8080/api/pets/{petId}/care/touch \
  -H 'Content-Type: application/json' \
  -d '{"touchType":"HEAD"}'
```

- [ ] 清理成功，`cleanliness`、`mood`、`experience` 至少一项按规则增加。

```bash
curl -X POST http://127.0.0.1:8080/api/pets/{petId}/care/clean \
  -H 'Content-Type: application/json' \
  -d '{"cleanEventId":"default-clean-event"}'
```

- [ ] 不存在的 `petId` 返回 `success=false`，错误码为 `PET_NOT_FOUND`，且服务不崩溃。

## 桌面端验收

- [ ] 首次打开桌面端时自动创建默认 `Momo Pet`，并把 `petId` 写入 `localStorage` 的 `momo.defaultPetId`。
- [ ] 刷新页面后复用已有 `petId`，不重复创建默认宠物。
- [ ] 状态面板展示名称、等级、饱食、心情、清洁、能量、亲密度。
- [ ] 点击喂食后显示成功反馈，宠物进入 Eat/Happy 反馈动作，状态增量浮层出现。
- [ ] 点击抚摸后显示成功反馈，宠物进入 Happy 反馈动作，状态增量浮层出现。
- [ ] 点击清理后显示成功反馈，清洁度相关状态更新，状态增量浮层出现。
- [ ] 后端未启动时，桌面端展示友好错误文案，不白屏。

## 通过标准

- 所有 API 验收项通过。
- 桌面端能完成“打开应用 -> 默认宠物出现 -> 三个照顾行为 -> 状态变化展示”。
- `pnpm` 质量门禁和后端 `mvn test` 全部通过。
- 未通过项需记录复现步骤、实际结果、日志或截图，并回填到 Sprint 1 缺陷列表。
