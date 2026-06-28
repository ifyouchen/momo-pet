# 10 Database

## 数据库

MVP 后端使用 PostgreSQL。

桌面端可使用 SQLite 做本地缓存，后端同步成功后以服务端数据为准。

## 核心表

### users

保存用户身份。

关键字段：

- id
- email
- nickname
- status
- created_at

### pets

保存宠物基础档案。

关键字段：

- id
- owner_id
- name
- species
- birthday
- status
- created_at

### pet_dna

保存宠物数字身份。

关键字段：

- id
- pet_id
- version
- breed
- color
- pattern
- eye_color
- body_shape
- personality
- energy_level
- favorite_foods
- disliked_things
- catchphrases
- source
- created_at

### pet_state

保存宠物当前状态。

关键字段：

- pet_id
- hunger
- mood
- cleanliness
- energy
- intimacy
- level
- experience
- updated_at

### care_events

保存喂食、铲屎、抚摸等养成事件。

关键字段：

- id
- pet_id
- action_type
- action_value
- state_snapshot
- created_at

### pet_assets

保存照片和动画资源元数据。

关键字段：

- id
- pet_id
- asset_type
- storage_key
- content_type
- status
- created_at

### ai_generation_tasks

保存 AI 生成任务。

关键字段：

- id
- pet_id
- task_type
- status
- request_payload
- result_payload
- error_code
- created_at
- completed_at

### chat_messages

保存宠物聊天记录。

关键字段：

- id
- pet_id
- role
- content
- summary
- created_at

## 索引要求

- pets.owner_id
- pet_dna.pet_id, pet_dna.version
- care_events.pet_id, care_events.created_at
- ai_generation_tasks.pet_id, ai_generation_tasks.status
- chat_messages.pet_id, chat_messages.created_at

## 性能约束

- 列表查询必须分页。
- 不允许循环内查询数据库。
- 聊天记录长期表需要归档策略。
- AI 任务结果大字段后续可迁移到对象存储。

