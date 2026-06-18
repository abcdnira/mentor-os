# 13 - Frontend

## 1. 前端目标

前端不是普通 Chat UI，而是成长操作台。

## 2. 页面结构

### 2.1 Dashboard

展示：

- 今日建议
- 当前目标
- 能力图谱
- 最近薄弱点
- 待复习卡片
- 项目整理进度
- 面试准备进度

### 2.2 Mentor Chat

布局建议：

左侧：Second Brain Context  
中间：聊天  
右侧：本轮提炼结果

### 2.3 Knowledge

展示知识节点。

支持视图：

- Markdown
- Card
- MindMap
- Graph
- FlashCard

### 2.4 Cards

卡片复习系统。

字段：

- 正面问题
- 背面答案
- 掌握度
- 下次复习时间

### 2.5 MindMap

MVP 使用 Mermaid 渲染。

后续可用 React Flow / XMind-like Canvas。

### 2.6 Interview

支持：

- 选择模式
- 开始模拟
- 回答问题
- 查看追问
- 查看评分
- 生成复盘

### 2.7 Projects

展示：

- 项目列表
- 项目图谱
- 项目面试话术
- 项目简历描述
- 项目追问

### 2.8 Roadmap

展示长期路线：

```text
Golang 高级后端
↓
AI Backend
↓
Agent Backend
↓
AI Infra
```

## 3. UI 风格

- 安静
- 稳定
- 专业
- 不花哨
- 强成长感
- 类 Notion + ChatGPT + Linear

## 4. MVP 页面优先级

P0：

- 登录
- Dashboard
- Mentor Chat
- Knowledge Cards

P1：

- Interview
- MindMap
- Projects
- Roadmap
