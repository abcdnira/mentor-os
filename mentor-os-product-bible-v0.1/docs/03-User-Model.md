# 03 - User Model

## 1. 用户模型目标

Mentor OS 需要建立一个比普通 Profile 更深的用户模型。

普通 Profile 只记录：

- name
- email
- avatar

Mentor OS 需要记录：

- 用户是谁
- 用户想成为什么
- 用户会什么
- 用户不会什么
- 用户做过什么
- 用户如何思考
- 用户如何焦虑
- 用户如何学习
- 用户下一步该做什么

## 2. Identity Profile

字段建议：

- current_role
- target_role
- years_of_experience
- main_stack
- target_salary
- preferred_company_type
- current_constraints
- career_stage

示例：

```json
{
  "current_role": "Golang Backend Engineer",
  "target_role": "AI Backend Engineer / Agent Backend Engineer",
  "main_stack": ["Golang", "Redis", "MySQL", "MQ", "IM"],
  "current_constraints": ["在职骑驴找马", "需要稳定工作记录", "准备跳槽加薪"]
}
```

## 3. Thinking Style

Mentor 应识别用户思维偏好。

示例：

- 喜欢先建立框架，再深入细节
- 容易被高手面经触发焦虑
- 对抽象概念需要翻译成后端工程语言
- 学习需要项目落地
- 不喜欢碎片化答案

## 4. Emotional Pattern

系统不做心理治疗，但应识别学习与职业焦虑模式。

示例：

```json
{
  "trigger": "看到别人Agent面经很强",
  "reaction": "焦虑，怀疑自己不会",
  "mentor_strategy": "先翻译术语，再映射到已有后端能力，再给学习路线"
}
```

## 5. Career Goal

用户职业目标应是动态的。

例如：

```text
Golang 后端
↓
高级 Golang 后端
↓
AI Backend
↓
Agent Backend
↓
AI Infra
```

Mentor 每次规划都应参考该目标，而不是随机推荐内容。
