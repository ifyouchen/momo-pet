# Project Momo Documentation

Project Momo 是一款 AI Native Desktop Pet 产品，目标是把真实宠物数字化为可陪伴、可成长、可记忆、可互动的 Windows/macOS 桌面宠物。

本目录是项目知识库。它不是为了堆文档，而是为了让后续 Codex、Cursor、Claude、GPT 等 AI 编码工具拥有稳定上下文。

## 文档结构

```text
docs/
├── 00-project
├── 01-product
├── 02-ux
├── 03-ui
├── 04-ai-core
├── 05-desktop-runtime
├── 06-backend
├── 07-pet-studio
├── 08-pet-life
├── 09-pet-story
├── 10-development
├── 11-qa
├── 12-prompts
└── 13-admin
```

## 推荐阅读顺序

1. [00-project/Vision.md](00-project/Vision.md)
2. [00-project/Architecture-Principles.md](00-project/Architecture-Principles.md)
3. [01-product/PRD.md](01-product/PRD.md)
4. [01-product/PRD-MVP-Detail.md](01-product/PRD-MVP-Detail.md)
5. [01-product/MVP.md](01-product/MVP.md)
6. [01-product/FeatureList.md](01-product/FeatureList.md)
7. [02-ux/InformationArchitecture.md](02-ux/InformationArchitecture.md)
8. [02-ux/MVP-ScreenFlow.md](02-ux/MVP-ScreenFlow.md)
9. [02-ux/Pet-Interaction-UX.md](02-ux/Pet-Interaction-UX.md)
10. [03-ui/MVP-Wireframe-Spec.md](03-ui/MVP-Wireframe-Spec.md)
11. [03-ui/Pet-Interaction-UI.md](03-ui/Pet-Interaction-UI.md)
12. [03-ui/Pet-Operation-Page-Spec.md](03-ui/Pet-Operation-Page-Spec.md)
13. [04-ai-core/AI-System-Design.md](04-ai-core/AI-System-Design.md)
14. [04-ai-core/PetDNA-Schema.md](04-ai-core/PetDNA-Schema.md)
15. [04-ai-core/LifeEngine-Rules.md](04-ai-core/LifeEngine-Rules.md)
16. [04-ai-core/AiTask-Execution.md](04-ai-core/AiTask-Execution.md)
17. [07-pet-studio/Image-To-Pet-Pipeline.md](07-pet-studio/Image-To-Pet-Pipeline.md)
18. [07-pet-studio/Asset-Pipeline.md](07-pet-studio/Asset-Pipeline.md)
19. [05-desktop-runtime/Runtime-Interaction-Spec.md](05-desktop-runtime/Runtime-Interaction-Spec.md)
20. [05-desktop-runtime/Local-Cache-And-Sync.md](05-desktop-runtime/Local-Cache-And-Sync.md)
21. [06-backend/Domain-Model-Spec.md](06-backend/Domain-Model-Spec.md)
22. [06-backend/OpenAPI-MVP.md](06-backend/OpenAPI-MVP.md)
23. [13-admin/Admin-Console-Spec.md](13-admin/Admin-Console-Spec.md)
24. [11-qa/MVP-Acceptance-Cases.md](11-qa/MVP-Acceptance-Cases.md)
25. [10-development/CodingSpec.md](10-development/CodingSpec.md)
26. [10-development/AI-Coding-Guardrails.md](10-development/AI-Coding-Guardrails.md)
27. [10-development/MVP-Development-Plan.md](10-development/MVP-Development-Plan.md)
28. [10-development/MVP-Progress-Tracker.md](10-development/MVP-Progress-Tracker.md)
29. [10-development/AI-Developer-Working-Agreement.md](10-development/AI-Developer-Working-Agreement.md)
30. [10-development/SprintPlan.md](10-development/SprintPlan.md)

## 当前阶段

当前阶段只做 MVP 级别的产品定义和研发约束：

- 用户上传宠物照片并创建宠物档案。
- AI 生成 Pet DNA。
- 桌宠支持取名、喂食、铲屎、抚摸、基础聊天和状态成长。
- Windows/macOS 桌面端使用 Tauri 2 + React + TypeScript。
- 后端使用 Spring Boot + DDD。

## 文档驱动开发约束

任何新功能进入编码前，必须先补齐：

- 业务目的
- 用户流程
- 领域模型
- API 契约
- 异常与错误码
- 数据存储
- 验收标准
