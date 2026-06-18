# 14 - Backend

## 1. 后端目标

后端负责：

- 用户数据
- 对话数据
- AI 调用
- Reflection
- Second Brain
- 知识卡片
- 能力画像
- 项目理解
- 面试流程

## 2. 推荐目录

```text
backend/
  cmd/server/
  internal/
    api/
    auth/
    chat/
    mentor/
    reflection/
    knowledge/
    capability/
    project/
    interview/
    ai/
    database/
    config/
  pkg/
  migrations/
```

## 3. 核心 API

### Auth

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Chat

```text
POST /api/chat/sessions
GET  /api/chat/sessions
GET  /api/chat/sessions/:id
POST /api/chat/sessions/:id/messages
POST /api/chat/sessions/:id/reflection
```

### Knowledge

```text
GET  /api/knowledge
POST /api/knowledge
GET  /api/knowledge/:id
PUT  /api/knowledge/:id
POST /api/knowledge/:id/mindmap
```

### Interview

```text
POST /api/interview/start
POST /api/interview/:id/answer
POST /api/interview/:id/evaluate
GET  /api/interview/:id/report
```

### Project

```text
POST /api/projects
POST /api/projects/:id/analyze
GET  /api/projects/:id
```

### Capability

```text
GET /api/capabilities
PUT /api/capabilities/:id
```

## 4. AI 调用封装

不要在业务里直接调用模型。

必须统一通过 AI Service：

```go
type AIProvider interface {
    Chat(ctx context.Context, req ChatRequest) (ChatResponse, error)
    Embed(ctx context.Context, text string) ([]float32, error)
}
```

## 5. Reflection 异步化

MVP 可以同步调用。

后续改为 Worker：

```text
message saved
↓
enqueue reflection job
↓
worker executes
↓
brain update
```
