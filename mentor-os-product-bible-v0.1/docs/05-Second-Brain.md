# 05 - Second Brain

## 1. 定义

Second Brain 是 Mentor OS 的核心。

它不是聊天记录库，而是用户长期成长模型。

## 2. Second Brain 包含什么

- Identity Graph
- Capability Graph
- Knowledge Graph
- Project Graph
- Career Graph
- Learning Timeline
- Interview History
- Reflection History
- Thinking Style
- Emotional Pattern

## 3. 设计原则

### 3.1 原始对话不是长期记忆

原始对话可以短期保存，但长期使用的是 Reflection 后的结构化结果。

### 3.2 结构化优先

每次对话后应提炼为：

```json
{
  "new_knowledge": [],
  "updated_capabilities": [],
  "project_updates": [],
  "weaknesses": [],
  "next_actions": []
}
```

### 3.3 可检索

Second Brain 的每个节点都应支持：

- keyword search
- vector search
- tag filter
- graph relation

## 4. 核心对象

### 4.1 Knowledge Node

```json
{
  "title": "Go map 并发安全",
  "type": "golang",
  "summary": "Go 原生 map 不是并发安全的",
  "mastery_score": 62,
  "tags": ["golang", "map", "concurrency"],
  "related_projects": ["红包系统", "IM系统"]
}
```

### 4.2 Capability Node

```json
{
  "name": "Redis 分布式锁",
  "score": 75,
  "evidence": ["能讲 SET NX EX", "还需要补 Lua 释放锁"],
  "last_updated": "2026-06-18"
}
```

### 4.3 Project Node

```json
{
  "name": "IM 系统",
  "modules": ["消息", "群聊", "WebSocket", "离线消息"],
  "interview_score": 80,
  "weakness": ["十万人大群表达还需要加强"]
}
```

## 5. Brain Retrieval

每次 Mentor 回答前，不应加载全部 Brain，而应按当前问题检索：

- 用户身份
- 当前目标
- 相关知识节点
- 相关项目节点
- 最近 Reflection
- 最近薄弱点

## 6. Brain Update

Brain 更新不由 Chat 直接写入，而由 Reflection Agent 写入。

流程：

```text
chat
↓
reflection
↓
structured memory
↓
brain update
↓
retrieval index update
```
