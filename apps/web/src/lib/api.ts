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

export function sendMessage(sessionId: string, content: string) {
  return request<{ user_message: Message; ai_message: Message }>(
    `/chat/sessions/${sessionId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ content }),
    }
  );
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
