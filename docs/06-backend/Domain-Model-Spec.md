# Domain Model Spec

## 目标

定义 MVP 后端领域模型，作为 Spring Boot DDD 工程的实现依据。

## 限界上下文

MVP 包含：

- pet：宠物档案、Pet DNA、宠物状态。
- care：照顾行为。
- asset：照片和桌宠资源。
- ai：AI 生成任务。
- chat：宠物聊天。

identity 先保留 userId，不实现完整登录。

## pet 上下文

### Pet 聚合根

职责：

- 表示一只宠物的基础身份。
- 管理宠物创建、重命名、启用和停用。

字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | PetId | 宠物 ID |
| ownerId | UserId | 所属用户 |
| name | PetName | 宠物名称 |
| species | Species | 宠物类型 |
| birthday | LocalDate | 生日 |
| status | PetStatus | 状态 |
| createdAt | Instant | 创建时间 |

行为：

- create(ownerId, name, species, birthday)
- rename(name)
- deactivate()
- ensureOwnedBy(userId)

不变量：

- name 不能为空。
- species 必须在支持范围内。
- ownerId 不能为空。

### PetDna 聚合根

职责：

- 管理 Pet DNA 当前版本。
- 保存 AI 生成和用户确认后的数字身份。

字段：

- id
- petId
- version
- appearance
- personality
- preferences
- voice
- source
- confidence
- createdAt

行为：

- createFromAi(petId, schema)
- createManual(petId, schema)
- revise(schema)
- ensureValid()

不变量：

- Pet DNA 必须绑定 petId。
- version 从 1 递增。
- AI 不确定字段使用 UNKNOWN。

### PetState 聚合根

职责：

- 管理宠物当前养成状态。
- 应用 Life Engine 规则。

字段：

- petId
- hunger
- mood
- cleanliness
- energy
- intimacy
- experience
- level
- updatedAt

行为：

- initialize(petId)
- feed(food)
- clean()
- touch(personality)
- chat()
- decay(elapsedTime)

不变量：

- 数值状态范围为 0 到 100。
- experience 不小于 0。
- level 不小于 1。

## care 上下文

### CareEvent 聚合根

职责：

- 记录一次照顾行为及行为后的状态快照。

字段：

- id
- petId
- actionType
- actionValue
- stateSnapshot
- occurredAt

行为：

- recordFeed(petId, foodCode, stateSnapshot)
- recordClean(petId, stateSnapshot)
- recordTouch(petId, stateSnapshot)

## asset 上下文

### PetAsset 聚合根

职责：

- 管理宠物照片和生成资源元数据。

字段：

- id
- petId
- assetType
- photoRole
- storageKey
- contentType
- size
- status
- createdAt

行为：

- createOriginalPhoto(petId, photoRole, storageKey, contentType, size)
- markReady()
- markFailed(reason)

## ai 上下文

### AiGenerationTask 聚合根

职责：

- 管理 AI 生成任务生命周期。

字段：

- id
- petId
- taskType
- status
- requestPayload
- resultPayload
- errorCode
- createdAt
- completedAt

行为：

- createPetDnaTask(petId, primaryPhotoAssetId, referencePhotoAssetIds)
- markRunning()
- markSucceeded(resultPayload)
- markFailed(errorCode)
- ensureRetryable()

不变量：

- 终态任务不能再次变更。
- 失败必须记录 errorCode。
- Pet DNA 任务必须包含 1 个主图资源。
- Pet DNA 任务最多包含 4 个参考图资源。
- 任务创建前必须校验所有图片资源属于同一 petId。

## chat 上下文

### ChatSession 聚合根

职责：

- 管理宠物聊天消息和摘要。

字段：

- id
- petId
- messages
- summary
- createdAt
- updatedAt

行为：

- appendUserMessage(content)
- appendPetReply(content)
- updateSummary(summary)

## Repository 接口

Repository 接口定义在 Domain 层。

命名示例：

- findActivePetById(PetId petId)
- findLatestDnaByPetId(PetId petId)
- findStateByPetId(PetId petId)
- findPendingTasksByType(TaskType taskType)
- save(Pet pet)

禁止：

- 返回 List<Object[]>
- 返回 Map 作为领域结果
- 使用技术化命名，如 queryByCondition

## 应用服务

应用服务只编排任务：

- CreatePetApplicationService
- UploadPetPhotoApplicationService
- GeneratePetDnaApplicationService
- ConfirmPetDnaApplicationService
- FeedPetApplicationService
- CleanPetApplicationService
- TouchPetApplicationService
- ChatWithPetApplicationService

事务内允许：

- 加载聚合
- 调用聚合方法
- 保存聚合
- 创建任务记录

事务内禁止：

- 调用 AI
- 上传对象存储
- 调用 HTTP/RPC
