# 11 - Agent, Skill and Workflow

## 1. 总体原则

Mentor OS 不应设计成一堆互相聊天的 Agent。

MVP 应采用：

```text
一个 Mentor
多个 Skills
多个 Workflows
```

## 2. Mentor

Mentor 是唯一主人格。

它负责：

- 理解用户
- 调用 Skill
- 启动 Workflow
- 生成最终输出
- 保持长期一致人格

## 3. Skill

Skill 是 Mentor 可调用的能力模块。

MVP Skills：

- Interview Skill
- Reflection Skill
- Knowledge Card Skill
- MindMap Skill
- Project Understanding Skill
- Resume Skill
- Roadmap Skill
- Capability Assessment Skill

## 4. Workflow

Workflow 是稳定流程。

例如 Interview Workflow：

```text
prepare_context
↓
generate_question
↓
receive_answer
↓
follow_up
↓
evaluate
↓
generate_card
↓
update_capability
```

## 5. Planning

Planning 用于动态任务规划。

使用场景：

- 今日学习计划
- 面试训练计划
- 项目整理计划
- 职业路线调整

## 6. 不同场景的选型

### Workflow 适合

- 面试流程
- Reflection
- 知识卡片生成
- 项目总结
- 复习计划

### Agent Planning 适合

- 用户不知道今天学什么
- 用户上传复杂 JD
- 用户焦虑时需要重新规划
- 用户要设计长期路线

## 7. Skill 文件格式

每个 Skill 目录包含：

```text
Skill.md
prompts.md
workflow.md
examples.md
evaluation.md
```
