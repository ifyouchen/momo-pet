# petdna-generate-v1

## 目的

根据用户上传的宠物照片和基础输入生成 Pet DNA。

## 输入

```json
{
  "name": "奶糖",
  "speciesHint": "CAT",
  "userDescription": "有点傲娇，喜欢睡觉"
}
```

## 输出

```json
{
  "species": "CAT",
  "breed": "UNKNOWN",
  "color": "Orange",
  "personality": "Proud",
  "favoriteFoods": ["小鱼干"],
  "dislikedThings": ["洗澡"],
  "catchphrases": ["主人，我才不是想你"]
}
```

## 约束

只输出 JSON。字段未知时使用 UNKNOWN，不要编造过度确定的品种。

