# Life Engine Rules

## 目标

定义宠物状态变化规则。MVP 阶段所有普通状态变化使用确定性规则，避免频繁调用 AI。

## 状态字段

| 字段 | 范围 | 初始值 | 说明 |
| --- | --- | --- | --- |
| hunger | 0-100 | 70 | 饱食度，越高越饱 |
| mood | 0-100 | 75 | 心情 |
| cleanliness | 0-100 | 80 | 清洁度 |
| energy | 0-100 | 70 | 能量 |
| intimacy | 0-100 | 10 | 亲密度 |
| experience | >=0 | 0 | 经验 |
| level | >=1 | 1 | 等级 |

## 时间衰减

每 30 分钟执行一次状态衰减：

```text
hunger -= 3
energy -= 2
cleanliness -= 1
```

状态下限为 0，上限为 100。

## mood 派生规则

mood 不是完全独立字段，每次状态变化后重新计算修正：

```text
baseMood = mood
if hunger < 30 then baseMood -= 8
if cleanliness < 40 then baseMood -= 6
if energy < 20 then baseMood -= 4
if intimacy > 70 then baseMood += 4
mood = clamp(baseMood, 0, 100)
```

## 喂食规则

输入：foodCode。

默认效果：

```text
hunger += 18
mood += 5
energy += 2
experience += 10
```

限制：

- hunger >= 95 时拒绝喂食，错误码 PET_ALREADY_FULL。
- 每 10 分钟最多喂食 3 次。

食物类型可覆盖默认效果：

| foodCode | hunger | mood | experience |
| --- | ---: | ---: | ---: |
| DRIED_FISH | +18 | +8 | +10 |
| CHICKEN | +25 | +5 | +12 |
| MILK | +12 | +4 | +8 |
| SNACK | +8 | +10 | +6 |

## 铲屎规则

清理事件生成：

- cleanliness < 60 时有概率生成。
- 每天最多生成 3 次。

清理效果：

```text
cleanliness += 25
mood += 4
experience += 8
```

没有清理事件时不调用后端。

## 抚摸规则

默认效果：

```text
intimacy += 3
mood += 6
experience += 5
```

频率限制：

- 1 分钟内超过 10 次，Proud 性格 mood -= 3。
- Friendly 性格不惩罚，但 experience 不再增加。

## 聊天规则

每次有效聊天：

```text
intimacy += 1
experience += 3
```

每日聊天经验上限为 60。

## 等级规则

等级计算：

```text
level = floor(sqrt(experience / 100)) + 1
```

升级时：

- 播放 Happy 动作。
- 生成 timeline 事件。

## 行为选择权重

默认：

| 行为 | 权重 |
| --- | ---: |
| Idle | 50 |
| Walk | 20 |
| Sleep | 10 |
| LookMouse | 10 |
| SayBubble | 10 |

修正：

- energy < 25：Sleep +30。
- hunger < 30：SayBubble +20。
- mood > 80：Walk +10。
- Lazy 性格：Sleep +15。
- Curious 性格：LookMouse +15。

## AI 介入点

只在以下场景调用 AI：

- 主动提醒短句生成。
- 聊天回复。
- 每日摘要。
- 重要 timeline 文案。

状态数值变化不调用 AI。

