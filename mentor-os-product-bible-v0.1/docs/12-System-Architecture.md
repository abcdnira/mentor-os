# 12 - System Architecture

## 1. MVP 技术栈

推荐：

- Frontend: Next.js + Tailwind + shadcn/ui
- Backend: Golang Gin
- Database: PostgreSQL + pgvector
- Cache: MVP 暂不使用 Redis
- AI API: DeepSeek / OpenAI 可配置
- Deploy: Docker Compose + Nginx + HTTPS

## 2. 架构图

```text
Browser
  ↓
Next.js Web
  ↓
Golang API
  ↓
PostgreSQL + pgvector
  ↓
LLM API
```

后续增强：

```text
Browser
  ↓
Next.js
  ↓
Golang API
  ↓
Redis
  ↓
PostgreSQL + pgvector
  ↓
Worker
  ↓
LLM API
```

## 3. 服务模块

### Frontend

- Dashboard
- Mentor Chat
- Knowledge
- Cards
- MindMap
- Interview
- Projects
- Roadmap
- Settings

### Backend

- Auth Service
- User Profile Service
- Chat Service
- Mentor Orchestrator
- Reflection Service
- Knowledge Service
- Capability Service
- Project Service
- Interview Service
- AI Provider Service

### Database

- users
- conversations
- messages
- reflections
- knowledge_nodes
- knowledge_cards
- capability_nodes
- project_nodes
- interview_sessions
- roadmap_items
- embeddings

## 4. AI Provider

支持配置：

```env
AI_PROVIDER=deepseek
AI_API_KEY=
AI_BASE_URL=
AI_MODEL=
```

未来支持多模型路由：

- 便宜模型处理 Reflection
- 强模型处理复杂规划
- 长上下文模型处理代码/项目

## 5. 安全原则

- API Key 只保存在服务端
- 用户私有数据不可暴露给前端
- 上传代码默认本地处理
- 支持删除所有个人数据
- 支持导出 Markdown
