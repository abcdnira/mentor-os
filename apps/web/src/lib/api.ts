const BASE = "/api";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers as Record<string, string>),
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

// Auth
export function register(email: string, password: string, name: string) {
  return request<{ user: User }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
}

export function login(email: string, password: string) {
  return request<{ user: User }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logout() {
  return request<{ message: string }>("/auth/logout", { method: "POST" });
}

export function getMe() {
  return request<{ user: User }>("/auth/me");
}

// Dashboard
export function getDashboard() {
  return request<DashboardData>("/dashboard");
}

// Chat
export function createSession(title?: string) {
  return request<Conversation>("/chat/sessions", {
    method: "POST",
    body: JSON.stringify({ title: title || "" }),
  });
}

export function listSessions() {
  return request<Conversation[]>("/chat/sessions");
}

export function getSession(id: string) {
  return request<Conversation>(`/chat/sessions/${id}`);
}

export function sendMessage(
  sessionId: string,
  content: string,
  responseMode?: string
) {
  return request<{ user_message: Message; ai_message: Message }>(
    `/chat/sessions/${sessionId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({
        content,
        response_mode: responseMode || "standard",
      }),
    }
  );
}

// Reflection
export function generateReflection(sessionId: string) {
  return request<ReflectionResult>(
    `/chat/sessions/${sessionId}/reflection`,
    { method: "POST" }
  );
}

// Knowledge
export function listKnowledge() {
  return request<KnowledgeNode[]>("/knowledge");
}

export function getKnowledge(id: string) {
  return request<KnowledgeNode>(`/knowledge/${id}`);
}

// Capabilities
export function listCapabilities() {
  return request<CapabilityNode[]>("/capabilities");
}

// Interview
export function getInterviewTopics() {
  return request<Record<string, string>>("/interview/topics");
}

export function startInterview(topic: string) {
  return request<{ conversation: Conversation; first_message: Message }>(
    "/interview/start",
    { method: "POST", body: JSON.stringify({ topic }) }
  );
}

export function sendInterviewAnswer(sessionId: string, content: string, topic: string) {
  return request<{ user_message: Message; ai_message: Message }>(
    `/interview/${sessionId}/answer`,
    { method: "POST", body: JSON.stringify({ content, topic }) }
  );
}

export function evaluateInterview(sessionId: string) {
  return request<EvaluationResult>(`/interview/${sessionId}/evaluate`, {
    method: "POST",
  });
}

// Projects
export function createProject(input: CreateProjectInput) {
  return request<ProjectNode>("/projects", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listProjects() {
  return request<ProjectNode[]>("/projects");
}

export function getProject(id: string) {
  return request<ProjectNode>(`/projects/${id}`);
}

export function analyzeProject(id: string) {
  return request<ProjectNode>(`/projects/${id}/analyze`, { method: "POST" });
}

export async function uploadProjectCode(projectId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE}/projects/${projectId}/upload`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Upload failed: ${res.status}`);
  }
  return res.json() as Promise<ProjectNode>;
}

// Resume
export function generateResume(version: string) {
  return request<{ markdown: string; version: string }>("/resume/generate", {
    method: "POST",
    body: JSON.stringify({ version }),
  });
}

// Roadmap
export function listRoadmap() {
  return request<RoadmapItem[]>("/roadmap");
}

export function generateRoadmap() {
  return request<RoadmapItem[]>("/roadmap/generate", { method: "POST" });
}

export function updateRoadmapStatus(id: string, status: string) {
  return request<{ status: string }>(`/roadmap/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  type: string;
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

export interface Reflection {
  id: string;
  user_id: string;
  conversation_id: string;
  summary: string;
  knowledge_updates: any;
  capability_updates: any;
  next_actions: any;
  created_at: string;
}

export interface KnowledgeNode {
  id: string;
  user_id: string;
  title: string;
  category: string;
  summary: string;
  markdown: string;
  card: {
    one_sentence?: string;
    core_principle?: string;
    interview_answer?: string;
    common_followups?: string[];
  } | null;
  tags: string[];
  mastery_score: number;
  created_at: string;
  updated_at: string;
}

export interface CapabilityNode {
  id: string;
  user_id: string;
  name: string;
  category: string;
  score: number;
  evidence: string[];
  weakness: string[];
  created_at: string;
  updated_at: string;
}

export interface ReflectionResult {
  reflection: Reflection;
  knowledge_nodes: KnowledgeNode[];
  capability_nodes: CapabilityNode[];
}

export interface TodayTask {
  title: string;
  source: string;
  action: string;
}

export interface DashboardData {
  capabilities: CapabilityNode[];
  recent_knowledge: KnowledgeNode[];
  recent_reflections: Reflection[];
  next_actions: string[];
  today_tasks: TodayTask[];
  weak_areas: CapabilityNode[];
}

export interface EvaluationResult {
  overall_score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  next_actions: string[];
  knowledge_nodes: KnowledgeNode[];
  capability_nodes: CapabilityNode[];
}

export interface CreateProjectInput {
  name: string;
  background: string;
  tech_stack: string[];
  modules: string[];
  responsibilities: string;
  challenges: string;
}

export interface ProjectNode {
  id: string;
  user_id: string;
  name: string;
  background: string;
  tech_stack: string[];
  modules: string[];
  responsibilities: string;
  challenges: string;
  ai_summary: string;
  ai_highlights: string[];
  ai_resume: string;
  ai_interview_answer: string;
  ai_followups: string[];
  ai_mindmap: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface RoadmapItem {
  id: string;
  title: string;
  reason: string;
  priority: number;
  status: string;
  next_action: string;
  sort_order: number;
}
