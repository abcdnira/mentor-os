# Database Design

## 1. Database

Use PostgreSQL + pgvector.

## 2. Core Tables

### users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### user_profiles

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  current_role TEXT,
  target_role TEXT,
  main_stack JSONB,
  career_goals JSONB,
  thinking_style JSONB,
  emotional_patterns JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### conversations

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT,
  type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### messages

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### reflections

```sql
CREATE TABLE reflections (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  conversation_id UUID REFERENCES conversations(id),
  summary TEXT,
  knowledge_updates JSONB,
  capability_updates JSONB,
  project_updates JSONB,
  roadmap_updates JSONB,
  next_actions JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### knowledge_nodes

```sql
CREATE TABLE knowledge_nodes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  category TEXT,
  summary TEXT,
  markdown TEXT,
  card JSONB,
  mindmap TEXT,
  tags JSONB,
  mastery_score INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### capability_nodes

```sql
CREATE TABLE capability_nodes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  category TEXT,
  score INT DEFAULT 0,
  evidence JSONB,
  weakness JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### project_nodes

```sql
CREATE TABLE project_nodes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  tech_stack JSONB,
  modules JSONB,
  interview_points JSONB,
  resume_points JSONB,
  mindmap TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### interview_sessions

```sql
CREATE TABLE interview_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  mode TEXT,
  score INT,
  report JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 3. Vector Embeddings

Enable pgvector:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Example:

```sql
CREATE TABLE embeddings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  source_type TEXT,
  source_id UUID,
  content TEXT,
  embedding vector(1536),
  created_at TIMESTAMP DEFAULT NOW()
);
```
