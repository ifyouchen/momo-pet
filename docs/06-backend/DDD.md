# DDD

## 限界上下文

- identity：用户身份。
- pet：宠物档案和 Pet DNA。
- care：喂食、铲屎、抚摸等照顾行为。
- ai：AI 任务和模型调用。
- asset：照片和动画资源。
- chat：宠物聊天。

## 聚合根

- Pet
- PetDna
- PetState
- CareEvent
- AiGenerationTask
- PetAsset
- ChatSession

## 分层

```text
interface -> application -> domain
infrastructure -> domain
```

Domain 层不依赖 Spring。

## 领域规则

- Pet 必须属于一个用户。
- Pet DNA 必须版本化。
- Care 行为必须产生状态快照。
- AI 远程调用不能放在事务内。

