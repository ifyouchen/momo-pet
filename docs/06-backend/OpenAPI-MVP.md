# OpenAPI MVP

## 目标

定义 MVP API 契约。实际工程应基于本文档生成或维护 OpenAPI 规范。

## 通用响应

成功：

```json
{
  "success": true,
  "code": "OK",
  "message": "success",
  "data": {}
}
```

失败：

```json
{
  "success": false,
  "code": "PET_NOT_FOUND",
  "message": "宠物不存在",
  "data": null
}
```

## POST /api/pets

创建宠物。

请求：

```json
{
  "name": "奶糖",
  "species": "CAT",
  "birthday": "2026-06-28",
  "description": "有点傲娇，喜欢睡觉"
}
```

响应 data：

```json
{
  "petId": "pet_001",
  "name": "奶糖",
  "species": "CAT",
  "status": "ACTIVE"
}
```

错误码：

- VALIDATION_FAILED
- SPECIES_UNSUPPORTED

## GET /api/pets/{petId}

获取宠物详情。

响应 data：

```json
{
  "petId": "pet_001",
  "name": "奶糖",
  "species": "CAT",
  "birthday": "2026-06-28",
  "status": "ACTIVE",
  "createdAt": "2026-06-28T10:00:00Z"
}
```

## POST /api/pets/{petId}/photos

上传单张宠物照片。多图流程通过多次调用该接口获取 assetId，再在创建 Pet DNA 任务时传入主图和参考图 ID。

请求：

- multipart/form-data
- file: JPG、PNG、WebP
- photoRole: PRIMARY、FRONT、SIDE、BACK、DETAIL、OTHER

响应 data：

```json
{
  "assetId": "asset_001",
  "assetType": "ORIGINAL_PHOTO",
  "photoRole": "PRIMARY",
  "status": "READY"
}
```

错误码：

- PET_NOT_FOUND
- ASSET_TYPE_UNSUPPORTED
- ASSET_TOO_LARGE
- ASSET_UPLOAD_FAILED

## POST /api/pets/{petId}/dna/generation-tasks

创建 Pet DNA 生成任务。

请求：

```json
{
  "primaryPhotoAssetId": "asset_001",
  "referencePhotoAssetIds": ["asset_002", "asset_003"],
  "userDescription": "有点傲娇，喜欢睡觉"
}
```

响应 data：

```json
{
  "taskId": "task_001",
  "status": "PENDING"
}
```

说明：

该接口只创建任务，不在请求线程内调用 AI。
primaryPhotoAssetId 必填，referencePhotoAssetIds 最多 4 个。
后端必须校验所有 assetId 都属于当前 petId，避免跨宠物资源串用。

## GET /api/ai/tasks/{taskId}

查询 AI 任务。

响应 data：

```json
{
  "taskId": "task_001",
  "taskType": "PET_DNA",
  "status": "SUCCEEDED",
  "result": {
    "petDnaDraftId": "dna_draft_001"
  },
  "errorCode": null
}
```

## GET /api/pets/{petId}/dna/latest

获取最新 Pet DNA。

响应 data：

```json
{
  "petId": "pet_001",
  "version": 1,
  "name": "奶糖",
  "species": "CAT",
  "appearance": {
    "primaryColor": "Orange",
    "pattern": "White belly"
  },
  "personality": {
    "primary": "Proud",
    "energyLevel": "MEDIUM"
  },
  "preferences": {
    "favoriteFoods": ["DRIED_FISH"],
    "dislikedThings": ["BATH"]
  },
  "voice": {
    "catchphrases": ["主人，摸摸我"]
  }
}
```

## PUT /api/pets/{petId}/dna

确认或修订 Pet DNA。

请求：

```json
{
  "name": "奶糖",
  "species": "CAT",
  "appearance": {
    "primaryColor": "Orange",
    "pattern": "White belly"
  },
  "personality": {
    "primary": "Proud",
    "energyLevel": "MEDIUM"
  },
  "preferences": {
    "favoriteFoods": ["DRIED_FISH"],
    "dislikedThings": ["BATH"]
  },
  "voice": {
    "catchphrases": ["主人，摸摸我"]
  }
}
```

响应 data：

```json
{
  "petId": "pet_001",
  "version": 2
}
```

## GET /api/pets/{petId}/state

获取宠物状态。

响应 data：

```json
{
  "hunger": 70,
  "mood": 80,
  "cleanliness": 60,
  "energy": 50,
  "intimacy": 30,
  "experience": 120,
  "level": 2,
  "updatedAt": "2026-06-28T10:00:00Z"
}
```

## POST /api/pets/{petId}/care/feed

喂食。

请求：

```json
{
  "foodCode": "DRIED_FISH"
}
```

响应 data：

```json
{
  "state": {
    "hunger": 88,
    "mood": 85,
    "experience": 130,
    "level": 2
  },
  "effects": [
    {
      "field": "hunger",
      "delta": 18
    }
  ]
}
```

错误码：

- PET_ALREADY_FULL
- CARE_ACTION_NOT_ALLOWED

## POST /api/pets/{petId}/care/clean

铲屎。

请求：

```json
{
  "cleanEventId": "clean_001"
}
```

响应 data：

```json
{
  "state": {
    "cleanliness": 85,
    "mood": 84,
    "experience": 138
  }
}
```

错误码：

- CLEAN_EVENT_NOT_FOUND

## POST /api/pets/{petId}/care/touch

抚摸。

请求：

```json
{
  "touchType": "HEAD"
}
```

响应 data：

```json
{
  "state": {
    "intimacy": 33,
    "mood": 90,
    "experience": 143
  },
  "reaction": "HAPPY"
}
```

## POST /api/pets/{petId}/chat/messages

发送聊天消息。

请求：

```json
{
  "content": "今天工作好累"
}
```

响应 data：

```json
{
  "messageId": "msg_001",
  "reply": "辛苦啦主人，先喝口水，我陪你休息一下。",
  "state": {
    "intimacy": 34,
    "experience": 146
  }
}
```

错误码：

- CHAT_MESSAGE_TOO_LONG
- AI_GENERATION_FAILED

## GET /api/pets/{petId}/chat/messages

查询最近聊天。

查询参数：

- limit：默认 20，最大 50。

响应 data：

```json
{
  "items": [
    {
      "messageId": "msg_001",
      "role": "USER",
      "content": "今天工作好累",
      "createdAt": "2026-06-28T10:00:00Z"
    }
  ]
}
```
