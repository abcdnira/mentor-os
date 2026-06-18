# 02 - Product Requirement Document

## 1. 产品名称

Mentor OS

## 2. 产品一句话描述

一个能长期理解用户、记录用户、分析用户、规划用户，并陪伴用户成长的 AI 导师与第二大脑系统。

## 3. 目标用户

MVP 阶段目标用户：

- 正在准备跳槽的后端工程师
- 需要整理项目经验的人
- 需要面试模拟训练的人
- 想从传统后端转 AI Backend / Agent Backend 的工程师

## 4. MVP 必须实现的功能

### 4.1 Mentor Chat

用户可以与 Mentor 对话。

要求：

- 支持多轮对话
- 支持保存会话
- 支持调用用户画像上下文
- 支持根据用户目标定制回答
- 支持对话结束后触发 Reflection

### 4.2 Second Brain

系统应维护用户长期知识模型。

包括：

- Identity Profile
- Capability Profile
- Knowledge Nodes
- Project Nodes
- Interview Records
- Reflection Records
- Roadmap

### 4.3 Reflection

每次重要对话后，系统应自动总结：

- 新增知识
- 新增能力
- 新增项目经验
- 新增短板
- 情绪/决策变化
- 下一步建议

### 4.4 Knowledge Card

系统能把对话内容、面试题、项目经验转为知识卡片。

卡片字段：

- title
- summary
- key_points
- interview_answer
- common_followups
- project_connection
- mastery_score
- tags

### 4.5 MindMap

系统能把知识节点生成思维导图。

MVP 可用 Mermaid mindmap 或 JSON tree 表达。

### 4.6 Interview Simulation

系统支持模拟面试。

模式：

- Golang 八股
- Redis
- MySQL
- MQ
- IM 项目
- 红包/钱包项目
- Agent 工程
- 系统设计
- 综合模拟

流程：

```text
选择模式
↓
Mentor 出题
↓
用户回答
↓
Mentor 追问
↓
评分
↓
指出漏洞
↓
生成知识卡片
↓
更新能力画像
```

### 4.7 Project Understanding

MVP 支持用户上传项目 zip 或粘贴项目说明。

系统应输出：

- 项目架构总结
- 技术栈识别
- 核心模块
- 用户职责
- 技术难点
- 业务难点
- 简历描述
- 面试追问
- 能力提炼

后续版本支持 Git 仓库扫描。

### 4.8 Dashboard

首页不是普通聊天页，而是成长面板。

应展示：

- 今日建议
- 当前目标
- 能力分布
- 最近学习
- 待复习知识
- 项目整理进度
- 面试准备进度

## 5. 非目标

MVP 不做：

- 多用户社交
- 移动 App
- 小程序
- 复杂权限系统
- 企业级 SaaS
- K8s
- 微服务
- GPU 训练
- 本地大模型微调

## 6. MVP 优先级

P0：

- 登录
- Mentor Chat
- 数据库存储
- Reflection
- Knowledge Card
- Dashboard

P1：

- Interview Simulation
- Capability Graph
- MindMap
- Project Understanding

P2：

- RAG
- Code Understanding
- Resume Generator
- Roadmap Engine

P3：

- 多模型路由
- Agent Skill Marketplace
- 插件系统
- 浏览器插件
