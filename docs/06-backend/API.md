# 09 API

## 统一响应

```json
{
  "success": true,
  "code": "OK",
  "message": "success",
  "data": {}
}
```

错误响应：

```json
{
  "success": false,
  "code": "PET_NOT_FOUND",
  "message": "宠物不存在",
  "data": null
}
```

## 宠物创建

### POST /api/pets

创建宠物档案。

请求：

```json
{
  "name": "奶糖",
  "species": "CAT",
  "birthday": "2026-06-28"
}
```

响应：

```json
{
  "petId": "pet_001",
  "name": "奶糖",
  "species": "CAT"
}
```

## 上传宠物照片

### POST /api/pets/{petId}/photos

上传单张宠物照片，返回资源 ID。多图创建时前端可以并行上传多张图片，但每张图片仍独立生成 assetId。

约束：

- 文件大小不超过 10 MB。
- 支持 JPG、PNG、WebP。
- photoRole 支持 PRIMARY、FRONT、SIDE、BACK、DETAIL、OTHER。
- 上传失败必须返回明确错误码。

## 生成 Pet DNA

### POST /api/pets/{petId}/dna/generate

创建 AI 生成任务。

请求：

```json
{
  "primaryPhotoAssetId": "asset_001",
  "referencePhotoAssetIds": ["asset_002", "asset_003"],
  "userDescription": "有点傲娇，喜欢睡觉"
}
```

约束：

- primaryPhotoAssetId 必填。
- referencePhotoAssetIds 最多 4 个。
- 所有 assetId 必须属于同一 petId。
- 事务内只创建任务记录，不直接调用 AI。

响应：

```json
{
  "taskId": "task_001",
  "status": "PENDING"
}
```

## 查询生成任务

### GET /api/ai/tasks/{taskId}

响应：

```json
{
  "taskId": "task_001",
  "status": "SUCCEEDED",
  "resultRef": "pet_dna_001"
}
```

## 获取宠物状态

### GET /api/pets/{petId}/state

响应：

```json
{
  "hunger": 80,
  "mood": 90,
  "cleanliness": 70,
  "energy": 60,
  "intimacy": 30,
  "level": 2,
  "experience": 120
}
```

## 喂食

### POST /api/pets/{petId}/care/feed

请求：

```json
{
  "foodCode": "DRIED_FISH"
}
```

## 铲屎

### POST /api/pets/{petId}/care/clean

清理宠物产生的便便事件。

## 抚摸

### POST /api/pets/{petId}/care/touch

记录抚摸行为并更新亲密度。

## 聊天

### POST /api/pets/{petId}/chat/messages

请求：

```json
{
  "content": "今天工作好累"
}
```

响应：

```json
{
  "messageId": "msg_001",
  "reply": "辛苦啦主人，先喝口水，我陪你休息一下。"
}
```
