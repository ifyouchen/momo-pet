# 06 Pet DNA

## 定义

Pet DNA 是宠物的数字身份。它不是图片文件，而是一组长期稳定的数据，用于驱动外观、性格、聊天、动作、故事和记忆。

## 字段设计

| 字段 | 含义 | 示例 |
| --- | --- | --- |
| petId | 宠物唯一标识 | pet_001 |
| ownerId | 所属用户 | user_001 |
| name | 用户确认的宠物名称 | 奶糖 |
| species | 宠物类型 | CAT |
| breed | 品种 | British Shorthair |
| birthday | 生日或创建日 | 2026-06-28 |
| color | 主色 | Blue White |
| pattern | 花纹 | White belly |
| eyeColor | 眼睛颜色 | Yellow |
| bodyShape | 体型 | Round |
| personality | 主性格 | Curious |
| energyLevel | 精力水平 | HIGH |
| favoriteFoods | 喜欢的食物 | 小鱼干、鸡胸肉 |
| dislikedThings | 讨厌的事物 | 洗澡、吸尘器 |
| catchphrases | 口头禅 | 主人，摸摸我 |
| voiceStyle | 语气风格 | Cute |
| createdAt | 创建时间 | 2026-06-28T10:00:00 |

## 不变量

- 宠物必须属于一个用户。
- 宠物名称不能为空。
- 宠物类型必须在支持范围内。
- Pet DNA 创建后可以修订，但必须保留版本历史。
- AI 生成字段必须允许用户覆盖。

## 支持的宠物类型

MVP 支持：

- CAT
- DOG
- BIRD
- RABBIT

后续支持：

- HAMSTER
- REPTILE
- FANTASY
- CUSTOM_CHARACTER

## 示例

```yaml
name: 奶糖
species: CAT
breed: British Shorthair
color: Blue White
eyeColor: Yellow
bodyShape: Round
personality: Curious
energyLevel: HIGH
favoriteFoods:
  - 小鱼干
  - 鸡胸肉
dislikedThings:
  - 吸尘器
  - 洗澡
catchphrases:
  - 主人，今天也要陪我玩
  - 我只是路过你的键盘
```

