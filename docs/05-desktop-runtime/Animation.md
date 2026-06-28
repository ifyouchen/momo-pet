# Animation

## 资源格式

MVP 支持：

- PNG 序列
- Sprite Sheet
- JSON 元数据

## 动作元数据

每个动作需要：

- actionCode
- frameCount
- fps
- loop
- width
- height
- anchor

## 播放约束

- 动画不能导致窗口尺寸频繁变化。
- 资源加载失败时回退 Idle。
- 高频动作需要预加载。

