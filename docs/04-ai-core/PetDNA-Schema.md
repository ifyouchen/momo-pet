# Pet DNA Schema

## 目标

定义 Pet DNA 的结构化 Schema，保证 AI 输出、后端存储、前端展示和 Prompt 输入使用同一份契约。

## JSON Schema

```json
{
  "petId": "pet_001",
  "version": 1,
  "name": "奶糖",
  "species": "CAT",
  "breed": "UNKNOWN",
  "birthday": "2026-06-28",
  "appearance": {
    "primaryColor": "Orange",
    "secondaryColor": "White",
    "pattern": "White belly",
    "eyeColor": "Green",
    "earShape": "Pointed",
    "tailShape": "Short",
    "bodyShape": "Round",
    "furLength": "Short"
  },
  "personality": {
    "primary": "Proud",
    "secondary": "Lazy",
    "energyLevel": "MEDIUM",
    "socialLevel": "MEDIUM",
    "curiosityLevel": "HIGH"
  },
  "preferences": {
    "favoriteFoods": ["DRIED_FISH"],
    "favoriteToys": ["BALL"],
    "dislikedThings": ["BATH"]
  },
  "voice": {
    "style": "Cute",
    "catchphrases": ["主人，摸摸我", "我只是路过你的键盘"]
  },
  "generation": {
    "source": "AI",
    "confidence": 0.82,
    "model": "multimodal-model",
    "generatedAt": "2026-06-28T10:00:00"
  }
}
```

## 枚举

### species

- CAT
- DOG
- BIRD
- RABBIT

### personality.primary

- Curious
- Friendly
- Lazy
- Proud
- Greedy

### energyLevel

- LOW
- MEDIUM
- HIGH

### source

- AI
- MANUAL
- MIXED

## 校验规则

- name 长度为 1 到 20。
- species 必须在支持枚举内。
- version 从 1 开始递增。
- confidence 范围为 0 到 1。
- favoriteFoods 最多 5 个。
- catchphrases 最多 5 条，每条不超过 30 个中文字符。
- AI 不确定的字段必须使用 UNKNOWN，不允许编造过度确定信息。

## 版本策略

用户每次确认修改 Pet DNA，都生成新版本。

只允许最新版本驱动聊天和桌宠行为，历史版本用于审计和回滚。

## 前端展示字段

MVP 必须展示并允许编辑：

- name
- species
- breed
- primaryColor
- pattern
- eyeColor
- primary personality
- energyLevel
- favoriteFoods
- dislikedThings
- catchphrases

## Prompt 输入裁剪

聊天时不需要注入完整 Pet DNA，只注入：

- name
- species
- personality
- current state
- catchphrases
- favoriteFoods
- dislikedThings

