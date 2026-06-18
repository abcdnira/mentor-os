CREATE TABLE IF NOT EXISTS project_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    background TEXT,
    tech_stack JSONB DEFAULT '[]',
    modules JSONB DEFAULT '[]',
    responsibilities TEXT,
    challenges TEXT,
    ai_summary TEXT,
    ai_highlights JSONB,
    ai_resume TEXT,
    ai_interview_answer TEXT,
    ai_followups JSONB,
    ai_mindmap TEXT,
    "status" VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_nodes_user_id ON project_nodes(user_id);

CREATE TABLE IF NOT EXISTS roadmap_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    reason TEXT,
    priority INT DEFAULT 0,
    "status" VARCHAR(20) DEFAULT 'pending',
    next_action TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roadmap_items_user_id ON roadmap_items(user_id);
