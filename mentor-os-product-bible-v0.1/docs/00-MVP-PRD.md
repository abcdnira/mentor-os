# 00 - MVP PRD

## 1. 文档目的

本文档是 Mentor OS 的 MVP 开发执行版 PRD。

它不重复描述长期愿景，而是明确第一版要做什么、做到什么程度、开发如何拆模块、最终如何验收。

Mentor OS 的长期定位是 AI Mentor Operating System，但 MVP 的目标只有一个：

> 让用户可以登录系统，和 Mentor 对话，并把一次对话沉淀为结构化的知识卡片、能力变化和 Dashboard 展示。

## 2. MVP 一句话目标

构建一个最小可用的 AI 成长系统：

```text
用户登录
↓
进入 Dashboard
↓
和 Mentor 对话
↓
保存聊天记录
↓
手动触发 Reflection
↓
生成 Knowledge Card
↓
更新 Capability
↓
Dashboard 展示成长结果
```

## 3. MVP 范围

### 3.1 MVP 必须做

P0 功能：

- 用户注册、登录、退出登录
- Dashboard 首页
- Mentor Chat 对话页
- 会话列表与消息存储
- AI 回复生成
- 手动触发 Reflection
- 生成 Knowledge Card
- 更新 Capability Profile
- Knowledge Card 列表页
- 基础 Settings 页面，用于配置 AI Provider

### 3.2 MVP 可以简化

- Reflection 可以由用户手动点击触发，不必自动异步执行
- Capability 分数可以先用 AI 输出结果直接更新，不需要复杂评分模型
- Knowledge Graph 可以先不做图谱，只做列表和详情
- MindMap 可以先用 Mermaid 文本渲染
- Interview Simulation 可以先做一个基础模式，后续增强
- RAG 可以先不做，只使用数据库里的结构化内容作为上下文

### 3.3 MVP 暂不做

- 多用户社交
- 企业 SaaS 多租户
- 复杂权限系统
- K8s
- 微服务
- GPU 推理
- 本地大模型训练
- 浏览器插件
- Agent Skill Marketplace
- Git 仓库自动扫描
- 多模型复杂路由
- 自动定时 Reflection Worker

## 4. 目标用户

MVP 的第一目标用户是正在成长中的后端工程师，尤其是：

- Golang 后端开发
- 准备跳槽、加薪或面试
- 想从普通后端升级到高级后端、AI Backend、Agent Backend
- 有项目经验，但需要提炼成简历、面试表达和能力画像
- 容易因为知识碎片化、面试压力、职业路线不清晰而焦虑

## 5. 核心用户故事

### 5.1 作为用户，我希望登录后看到自己的成长状态

用户进入系统后，不应该看到一个空白聊天框，而应该看到 Dashboard：

- 今日建议
- 当前目标
- 能力分布
- 最近学习内容
- 待复习知识卡片
- 项目整理进度
- 面试准备进度

### 5.2 作为用户，我希望 Mentor 能结合我的目标回答问题

用户在 Mentor Chat 中提问时，系统应尽量参考：

- 用户身份
- 当前目标
- 最近学习内容
- 已有知识卡片
- 已有能力画像

MVP 阶段可以只读取基础 Profile、最近若干条 Reflection、相关 Knowledge Card。

### 5.3 作为用户，我希望一次聊天能沉淀为长期知识

用户完成一次技术学习、项目复盘或面试训练后，可以点击“生成复盘”。

系统需要生成：

- Conversation Summary
- Knowledge Updates
- Capability Updates
- Project Updates
- Next Actions
- Knowledge Card

### 5.4 作为用户，我希望看到自己哪里变强、哪里还弱

Reflection 后，Dashboard 与 Capability 页面应展示能力变化。

例如：

```text
Redis 分布式锁：65 → 72
Go map 并发安全：40 → 55
IM 消息可靠性：70 → 75
```

## 6. MVP 主流程

### 6.1 注册登录流程

```text
打开网站
↓
注册账号
↓
登录
↓
进入 Dashboard
```

验收标准：

- 用户可以注册账号
- 密码必须加密存储
- 用户可以登录
- 登录后可以获取当前用户信息
- 未登录用户访问核心页面时跳转到登录页

### 6.2 Mentor Chat 流程

```text
用户进入 Mentor Chat
↓
创建新会话
↓
输入问题
↓
后端保存用户消息
↓
后端调用 AI Provider
↓
保存 AI 回复
↓
前端展示完整对话
```

验收标准：

- 用户可以创建会话
- 用户可以发送消息
- AI 可以返回内容
- 用户消息和 AI 消息都必须落库
- 页面刷新后历史消息不丢失
- 会话列表可以展示历史会话

### 6.3 Reflection 流程

```text
用户点击“生成复盘”
↓
后端读取当前会话消息
↓
后端读取用户 Profile 和相关历史上下文
↓
调用 AI 生成结构化 Reflection
↓
写入 reflections 表
↓
生成或更新 knowledge_nodes
↓
更新 capability_nodes
↓
返回 Reflection Report
```

验收标准：

- 每次 Reflection 都生成一条 reflections 记录
- Reflection 必须包含 summary、knowledge_updates、capability_updates、next_actions
- 至少能生成一张 Knowledge Card
- Dashboard 能看到最新 Reflection 结果

### 6.4 Knowledge Card 流程

```text
Reflection 生成知识更新
↓
系统生成 Knowledge Card
↓
用户进入 Knowledge 页面
↓
查看卡片列表
↓
打开卡片详情
```

验收标准：

- Knowledge Card 可以创建
- Knowledge Card 可以列表展示
- Knowledge Card 可以查看详情
- 卡片至少包含 title、one_sentence、core_principle、interview_answer、common_followups、mastery_score

## 7. 页面需求

### 7.1 Login / Register

路径建议：

```text
/login
/register
```

页面功能：

- 邮箱输入
- 密码输入
- 注册
- 登录
- 错误提示

验收标准：

- 表单校验可用
- 登录成功后跳转 Dashboard
- 登录失败有明确错误提示

### 7.2 Dashboard

路径建议：

```text
/dashboard
```

页面模块：

- 当前目标
- 今日建议
- 能力概览
- 最近 Reflection
- 最近 Knowledge Cards
- 下一步行动

MVP 展示优先级：

```text
当前目标
能力列表
最近知识卡片
最近复盘
下一步建议
```

验收标准：

- 登录后默认进入 Dashboard
- 能展示当前用户数据
- Reflection 后 Dashboard 数据会更新

### 7.3 Mentor Chat

路径建议：

```text
/chat
/chat/:session_id
```

页面布局：

```text
左侧：会话列表
中间：聊天窗口
右侧：本轮提炼结果 / 用户上下文
底部：输入框
```

MVP 功能：

- 创建新会话
- 查看历史会话
- 发送消息
- 展示 AI 回复
- 手动点击“生成复盘”
- 展示 Reflection Report

验收标准：

- 会话切换正常
- 消息发送正常
- AI 回复正常
- 消息落库正常
- Reflection 按钮可用

### 7.4 Knowledge

路径建议：

```text
/knowledge
/knowledge/:id
```

页面功能：

- 知识卡片列表
- 标签筛选
- 详情查看
- Markdown 展示
- 面试回答展示
- 常见追问展示

验收标准：

- 可以看到当前用户的知识卡片
- 可以打开卡片详情
- 卡片内容来自 Reflection 或用户手动创建

### 7.5 Capability

路径建议：

```text
/capabilities
```

页面功能：

- 能力列表
- 能力分类
- 分数展示
- 证据展示
- 薄弱点展示

能力分类：

- Backend
- Project
- AI Backend
- Interview

验收标准：

- 可以展示当前用户能力分数
- Reflection 后可以更新能力分数
- 每个能力有 evidence 和 weakness

### 7.6 Settings

路径建议：

```text
/settings
```

页面功能：

- 查看当前用户信息
- 配置 AI Provider
- 配置 API Key
- 配置 Model

安全要求：

- API Key 不应该暴露给前端明文展示
- 后端保存时应谨慎处理
- MVP 可以先使用服务端统一环境变量，不开放用户自定义 Key

## 8. 后端接口需求

### 8.1 Auth API

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### 8.2 Chat API

```text
POST /api/chat/sessions
GET  /api/chat/sessions
GET  /api/chat/sessions/:id
POST /api/chat/sessions/:id/messages
POST /api/chat/sessions/:id/reflection
```

### 8.3 Reflection API

```text
GET  /api/reflections
GET  /api/reflections/:id
POST /api/reflections
```

MVP 中 `POST /api/chat/sessions/:id/reflection` 可以直接调用 Reflection Service。

### 8.4 Knowledge API

```text
GET  /api/knowledge
POST /api/knowledge
GET  /api/knowledge/:id
PUT  /api/knowledge/:id
DELETE /api/knowledge/:id
```

### 8.5 Capability API

```text
GET /api/capabilities
GET /api/capabilities/:id
PUT /api/capabilities/:id
```

### 8.6 AI API 内部封装

业务代码不直接调用第三方模型。

必须统一通过 AI Provider：

```go
type AIProvider interface {
    Chat(ctx context.Context, req ChatRequest) (ChatResponse, error)
    Embed(ctx context.Context, text string) ([]float32, error)
}
```

MVP 第一版如果暂时不做向量检索，`Embed` 可以先保留接口，不实现实际调用。

## 9. 数据模型需求

### 9.1 users

用途：保存用户基础账号。

关键字段：

- id
- email
- password_hash
- name
- created_at
- updated_at

### 9.2 user_profiles

用途：保存用户成长画像。

关键字段：

- current_role
- target_role
- main_stack
- career_goals
- thinking_style
- emotional_patterns

### 9.3 conversations

用途：保存会话。

关键字段：

- id
- user_id
- title
- type
- created_at
- updated_at

### 9.4 messages

用途：保存聊天消息。

关键字段：

- id
- conversation_id
- role
- content
- metadata
- created_at

role 可选值：

```text
user
assistant
system
tool
```

### 9.5 reflections

用途：保存结构化复盘结果。

关键字段：

- summary
- knowledge_updates
- capability_updates
- project_updates
- roadmap_updates
- next_actions

### 9.6 knowledge_nodes

用途：保存知识节点和知识卡片。

关键字段：

- title
- category
- summary
- markdown
- card
- mindmap
- tags
- mastery_score

### 9.7 capability_nodes

用途：保存能力画像。

关键字段：

- name
- category
- score
- evidence
- weakness

## 10. AI Prompt 需求

### 10.1 Mentor Chat Prompt

Mentor 回答时必须遵守：

- 不只是回答问题，要判断用户真正想解决什么
- 优先结合用户当前目标
- 不制造信息过载
- 技术问题要讲清楚原理和项目价值
- 面试问题要给出表达框架
- 最后尽量收口到下一步

### 10.2 Reflection Prompt

Reflection 不是普通总结。

必须输出结构化 JSON：

```json
{
  "conversation_summary": "",
  "knowledge_updates": [],
  "capability_updates": [],
  "project_updates": [],
  "roadmap_updates": [],
  "thinking_style_updates": [],
  "emotional_pattern_updates": [],
  "next_actions": [],
  "discard_reason_for_unimportant_content": ""
}
```

### 10.3 Knowledge Card Prompt

Knowledge Card 至少包含：

```json
{
  "title": "",
  "one_sentence": "",
  "core_principle": "",
  "interview_answer": "",
  "common_followups": [],
  "project_connection": "",
  "mastery_score": 0
}
```

## 11. 非功能需求

### 11.1 性能

MVP 阶段要求：

- 普通页面首屏加载可接受
- Chat 回复允许有明显等待
- AI 调用需要有 loading 状态
- 数据库查询避免一次性加载全部历史消息

### 11.2 安全

必须满足：

- 密码哈希存储
- 用户只能访问自己的数据
- API Key 不写死在前端
- 服务端环境变量管理 AI Key
- 基础接口鉴权

### 11.3 可维护性

后端要求：

- Handler 不写复杂业务逻辑
- AI 调用统一通过 AI Provider
- Reflection 写入统一通过 Reflection Service
- Knowledge 和 Capability 更新有清晰 Service

前端要求：

- 页面组件拆分清晰
- API 请求封装
- Markdown 渲染组件统一
- Mermaid 渲染组件统一

## 12. 技术栈

MVP 推荐：

- Frontend: Next.js + Tailwind CSS + shadcn/ui
- Backend: Golang + Gin
- Database: PostgreSQL + pgvector
- AI Provider: OpenAI / DeepSeek 可配置
- Deploy: Docker Compose + Nginx

MVP 暂不引入：

- Kubernetes
- 微服务
- Redis
- 消息队列
- 复杂 Worker 系统

## 13. MVP 验收标准

MVP 完成时，必须能跑通以下闭环：

```text
用户注册账号
↓
用户登录
↓
进入 Dashboard
↓
创建一个 Mentor Chat 会话
↓
发送一个 Redis 或 Golang 技术问题
↓
AI 返回回答
↓
消息保存到数据库
↓
用户点击生成 Reflection
↓
系统生成结构化 Reflection
↓
系统生成 Knowledge Card
↓
系统更新 Capability
↓
Dashboard 展示最新知识卡片和能力变化
```

具体验收清单：

- [ ] 用户可以注册、登录、退出
- [ ] 登录态可以保持
- [ ] 未登录用户不能访问核心页面
- [ ] 用户可以创建会话
- [ ] 用户可以发送消息
- [ ] AI 可以返回消息
- [ ] 消息可以持久化
- [ ] 页面刷新后消息不丢失
- [ ] 用户可以手动触发 Reflection
- [ ] Reflection 可以写入数据库
- [ ] Knowledge Card 可以生成并展示
- [ ] Capability 可以更新并展示
- [ ] Dashboard 可以展示当前目标、最近卡片、能力列表、下一步行动

## 14. 开发优先级

### Phase 1：基础骨架

- 初始化前端项目
- 初始化后端项目
- 初始化数据库
- Docker Compose
- Auth
- 基础页面路由

### Phase 2：Chat 闭环

- Conversation API
- Message API
- AI Provider
- Chat 页面
- 消息持久化

### Phase 3：Reflection 闭环

- Reflection Prompt
- Reflection Service
- Knowledge Card 生成
- Capability 更新
- Dashboard 更新

### Phase 4：体验增强

- Knowledge 页面
- Capability 页面
- Mermaid MindMap
- Interview 基础模式
- Settings

## 15. 第一版成功标准

第一版不是功能越多越好。

第一版成功的标准是：

> 用户完成一次对话后，系统真的能帮用户沉淀出一张有用的知识卡片，并让用户看到自己能力画像发生了变化。

如果这个闭环跑通，Mentor OS 就不是普通 ChatGPT Wrapper，而是一个真正的成长系统雏形。
