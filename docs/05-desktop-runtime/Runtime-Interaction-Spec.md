# Runtime Interaction Spec

## 目标

定义桌宠运行时的交互事件、窗口行为、本地状态和前后端通信方式。

## 技术边界

Rust 负责：

- 创建透明无边框窗口。
- 置顶。
- 拖动。
- 托盘。
- 开机启动。
- 多显示器信息。
- 本地文件访问。

React 负责：

- 宠物渲染。
- 动画播放。
- 面板 UI。
- 用户交互。
- API 调用。
- 状态展示。

## 窗口类型

### PetWindow

用途：展示宠物本体。

属性：

- transparent: true
- decorations: false
- alwaysOnTop: true
- resizable: false
- skipTaskbar: true

### PanelWindow

用途：互动面板、聊天、设置。

MVP 可与 PetWindow 同窗口浮层实现，后续再拆独立窗口。

## 本地状态

桌面端必须保存：

```json
{
  "selectedPetId": "pet_001",
  "windowPosition": {
    "x": 1200,
    "y": 700
  },
  "isPetVisible": true,
  "reduceMotion": false,
  "activeReminder": true
}
```

存储位置：

- MVP 可使用 Tauri app data 目录中的 JSON 文件。
- 后续可迁移 SQLite。

## 事件模型

### 用户事件

| 事件 | 来源 | 结果 |
| --- | --- | --- |
| PET_CLICKED | 宠物本体 | 打开互动面板 |
| PET_RIGHT_CLICKED | 宠物本体 | 打开快捷菜单 |
| PET_DRAG_STARTED | 宠物本体 | 暂停随机移动 |
| PET_DRAG_ENDED | 宠物本体 | 保存窗口位置 |
| FEED_CLICKED | 互动面板 | 调用喂食 API |
| CLEAN_CLICKED | 互动面板 | 调用清理 API |
| TOUCH_CLICKED | 互动面板 | 调用抚摸 API |
| CHAT_SENT | 聊天面板 | 调用聊天 API |

### 系统事件

| 事件 | 来源 | 结果 |
| --- | --- | --- |
| APP_STARTED | Tauri | 加载本地状态 |
| APP_EXITING | Tauri | 保存状态 |
| NETWORK_OFFLINE | 前端检测 | 进入本地模式 |
| NETWORK_ONLINE | 前端检测 | 同步待处理事件 |

## 动画状态切换

用户行为优先级高于自动行为。

优先级：

1. Eat
2. Happy
3. Drag
4. Sleep
5. Walk
6. Idle

当用户触发喂食：

```text
FEED_CLICKED -> API 成功 -> state updated -> play Eat -> play Happy -> Idle
```

API 失败：

```text
FEED_CLICKED -> API 失败 -> show error bubble -> Idle
```

## 离线模式

离线时允许：

- 展示桌宠
- 打开状态面板
- 本地抚摸反馈
- 使用最近一次状态

离线时禁止：

- AI 聊天
- Pet DNA 生成
- 照片上传

待同步事件：

- TOUCH_CLICKED 可以进入本地队列。
- FEED_CLICKED 和 CLEAN_CLICKED 默认不离线提交，避免状态冲突。

## 面板行为

互动面板：

- 点击宠物打开。
- 点击桌面其他区域关闭。
- 发送请求时按钮进入 loading。
- 请求失败展示错误，不关闭面板。

聊天面板：

- 输入框聚焦时接收键盘。
- Escape 关闭面板。
- Enter 发送，Shift+Enter 换行。

## 错误气泡

错误气泡只显示用户可理解内容：

- “我刚刚没吃到，再试一次？”
- “现在还很干净。”
- “网络好像断开了。”

技术错误码写入日志，不直接作为主文案。

## 性能约束

- Idle 动画应低频循环。
- 状态轮询间隔不低于 30 秒。
- AI 任务查询间隔不低于 2 秒。
- 宠物位置变化不能触发 React 大范围重渲染。

## 验收标准

- 拖动宠物不会卡顿。
- 面板打开关闭无明显闪烁。
- 网络失败不白屏。
- 退出后再次打开能恢复位置。
- 喂食、铲屎、抚摸都有动画或文案反馈。

