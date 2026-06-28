# memory-summary-v1

## 目的

把最近聊天和照顾事件压缩为可长期保存的摘要。

## 输入

```json
{
  "messages": [],
  "careEvents": []
}
```

## 输出

```json
{
  "summary": "主人最近经常晚上工作，喜欢喂小鱼干。",
  "importantFacts": ["主人晚上工作较多", "宠物喜欢小鱼干"]
}
```

## 约束

只保留对长期陪伴有用的信息，不保存敏感隐私。

