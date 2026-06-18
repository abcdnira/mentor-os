# 15 - AI Context For Claude / Codex

## 1. Read This First

You are building Mentor OS.

Mentor OS is not a chatbot.

Mentor OS is an AI Mentor Operating System designed to help a user grow over months and years.

Before coding, always understand the following principles:

1. Chat is only the interface.
2. Second Brain is the core.
3. Reflection converts conversations into long-term structured memory.
4. Knowledge must support Markdown, Card, MindMap, Graph and Interview Answer.
5. The Mentor must guide the user, not merely answer questions.
6. User growth is the main success metric.

## 2. Product Must Not Degrade Into

- A simple ChatGPT wrapper
- A generic note-taking app
- A plain interview question bank
- A static knowledge base

## 3. Required MVP

Build a web application with:

- Login
- Dashboard
- Mentor Chat
- Conversation storage
- Reflection generation
- Knowledge Card generation
- Capability profile
- Knowledge list
- MindMap rendering
- Interview simulation

## 4. Tech Stack

Use:

- Next.js frontend
- Golang Gin backend
- PostgreSQL + pgvector
- Docker Compose
- Nginx
- Configurable LLM API

Do not use:

- Kubernetes
- Microservices
- Complex SaaS tenant system
- GPU inference
- Native mobile app

## 5. Design Style

UI should feel like:

- Notion clarity
- ChatGPT simplicity
- Linear professionalism
- Obsidian knowledge depth

## 6. Data Rule

Do not store only raw chats.

Always produce structured reflections:

- knowledge_updates
- capability_updates
- project_updates
- roadmap_updates
- next_actions

## 7. Coding Rule

Write clean, maintainable code.

Backend:

- clear service boundaries
- no AI logic scattered across handlers
- all AI calls through AI Provider service
- all Reflection writes through Reflection Service

Frontend:

- component-based
- clear routes
- clean state management
- Markdown rendering
- Mermaid rendering

## 8. MVP First

Do not over-engineer.

First working version should be:

```text
User logs in
↓
Chats with Mentor
↓
Mentor responds
↓
User triggers Reflection
↓
System generates Knowledge Card
↓
Dashboard shows updated capability
```
