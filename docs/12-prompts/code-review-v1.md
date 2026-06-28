# code-review-v1

## 目的

审查 AI 生成代码是否符合 Project Momo 编码规范。

## 检查项

- 是否符合 DDD 分层。
- Domain 层是否引入框架注解。
- Controller 是否包含业务逻辑。
- 是否有统一错误码。
- public 方法是否有注释。
- 前端是否有加载态、空态、错误态。
- 是否有未使用导入和 console.log。

## 输出

按严重程度输出问题、文件、行号和修改建议。

