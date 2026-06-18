# 10 - Reflection System

## 1. 定义

Reflection 是 Mentor OS 的核心机制。

它负责把原始聊天压缩为长期记忆。

## 2. Reflection 不是聊天总结

错误：

```text
今天用户聊了 Redis 和 Agent。
```

正确：

```json
{
  "new_knowledge": ["Redis Lua 解锁"],
  "updated_capabilities": [{"Redis 分布式锁": "+5"}],
  "weaknesses": ["RedLock 还不会"],
  "project_updates": ["红包项目可以加入 Lua 解锁话术"],
  "next_actions": ["明天补 RedLock 争议"]
}
```

## 3. 触发时机

- 每次 Mentor 对话结束
- 每次模拟面试结束
- 每次项目分析结束
- 每天晚上定时
- 用户手动点击“总结今天”

## 4. Reflection 输出

应包含：

- conversation_summary
- knowledge_updates
- capability_updates
- project_updates
- roadmap_updates
- emotional_pattern_updates
- next_actions

## 5. Reflection Workflow

```text
读取本轮会话
↓
判断哪些内容值得长期保存
↓
提炼知识节点
↓
提炼能力变化
↓
提炼项目变化
↓
提炼情绪/决策模式
↓
生成下一步建议
↓
写入 Second Brain
↓
更新向量索引
```

## 6. Reflection Prompt 要求

模型必须区分：

- 长期有价值信息
- 临时闲聊
- 已有信息重复
- 用户误解
- 需要纠偏的知识

## 7. Conflict Resolution

如果新记忆和旧记忆冲突，需要标记：

- replace
- update
- keep_both
- needs_review

例如：

旧目标：Golang 高级后端  
新目标：AI Backend

处理：

```json
{
  "action": "update",
  "reason": "用户职业目标已从传统后端升级为 AI Backend"
}
```
