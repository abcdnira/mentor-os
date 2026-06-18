package service

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"mentor-os-api/internal/ai"
	"mentor-os-api/internal/model"
)

type ChatService struct {
	db       *gorm.DB
	provider ai.Provider
}

func NewChatService(db *gorm.DB, provider ai.Provider) *ChatService {
	return &ChatService{db: db, provider: provider}
}

const mentorSystemPrompt = `You are Mentor, an AI growth mentor in Mentor OS.

Your role is NOT just to answer questions. You must:
1. Understand what the user truly wants to solve
2. Connect answers to the user's career goals
3. Explain principles clearly with project-level value
4. For interview questions, provide structured expression frameworks
5. End with actionable next steps
6. Avoid information overload

## Response Format (IMPORTANT)

Always respond in well-structured Markdown:
- Use **## headings** to organize sections (e.g. "## 结论", "## 原理", "## 项目结合", "## 面试表达")
- Use **bold** for key terms and important concepts
- Use bullet lists or numbered lists for multiple points — never dump a wall of text
- Use inline code backticks for technical terms, function names, types (e.g. ` + "`sync.Map`" + `, ` + "`O(1)`" + `)
- Use fenced code blocks with language tags for code examples
- Use > blockquotes for important takeaways or interview tips
- Use tables when comparing multiple items
- Use mermaid code blocks (` + "```mermaid" + `) for flowcharts, architecture diagrams, or process flows when they help clarify
- Keep paragraphs short (2-4 sentences max)

For technical questions, structure your answer as:
1. **结论** — direct answer first
2. **原理** — explain the why
3. **代码示例** — if applicable
4. **项目结合** — how this applies in real projects
5. **面试表达** — how to articulate this in an interview

Keep responses focused, practical, and growth-oriented.
Respond in the same language as the user's message.`

type CreateSessionInput struct {
	Title string `json:"title"`
	Type  string `json:"type"`
}

func (s *ChatService) CreateSession(userID uuid.UUID, input CreateSessionInput) (*model.Conversation, error) {
	if input.Type == "" {
		input.Type = "mentor_chat"
	}
	if input.Title == "" {
		input.Title = "New Chat"
	}

	conv := model.Conversation{
		ID:     uuid.New(),
		UserID: userID,
		Title:  input.Title,
		Type:   input.Type,
	}

	if err := s.db.Create(&conv).Error; err != nil {
		return nil, err
	}
	return &conv, nil
}

func (s *ChatService) ListSessions(userID uuid.UUID) ([]model.Conversation, error) {
	var convs []model.Conversation
	err := s.db.Where("user_id = ?", userID).Order("updated_at DESC").Find(&convs).Error
	return convs, err
}

func (s *ChatService) GetSession(userID, sessionID uuid.UUID) (*model.Conversation, error) {
	var conv model.Conversation
	err := s.db.Preload("Messages", func(db *gorm.DB) *gorm.DB {
		return db.Order("created_at ASC")
	}).Where("id = ? AND user_id = ?", sessionID, userID).First(&conv).Error
	if err != nil {
		return nil, err
	}
	return &conv, nil
}

type SendMessageInput struct {
	Content string `json:"content" binding:"required"`
}

type SendMessageResult struct {
	UserMessage *model.Message `json:"user_message"`
	AIMessage   *model.Message `json:"ai_message"`
}

func (s *ChatService) SendMessage(ctx context.Context, userID, sessionID uuid.UUID, input SendMessageInput) (*SendMessageResult, error) {
	// Verify ownership
	var conv model.Conversation
	if err := s.db.Where("id = ? AND user_id = ?", sessionID, userID).First(&conv).Error; err != nil {
		return nil, errors.New("conversation not found")
	}

	// Save user message
	userMsg := model.Message{
		ID:             uuid.New(),
		ConversationID: sessionID,
		Role:           "user",
		Content:        input.Content,
	}
	if err := s.db.Create(&userMsg).Error; err != nil {
		return nil, err
	}

	// Load conversation history for context
	var history []model.Message
	s.db.Where("conversation_id = ?", sessionID).Order("created_at ASC").Find(&history)

	// Build messages for AI
	aiMessages := []ai.Message{
		{Role: "system", Content: mentorSystemPrompt},
	}
	for _, msg := range history {
		if msg.Role == "system" {
			continue
		}
		aiMessages = append(aiMessages, ai.Message{
			Role:    msg.Role,
			Content: msg.Content,
		})
	}

	// Call AI
	reply, err := s.provider.Chat(ctx, aiMessages)
	if err != nil {
		return nil, err
	}

	// Save AI message
	aiMsg := model.Message{
		ID:             uuid.New(),
		ConversationID: sessionID,
		Role:           "assistant",
		Content:        reply,
	}
	if err := s.db.Create(&aiMsg).Error; err != nil {
		return nil, err
	}

	// Update conversation title from first message
	if conv.Title == "New Chat" {
		title := input.Content
		if len(title) > 50 {
			title = title[:50] + "..."
		}
		s.db.Model(&conv).Update("title", title)
	}

	// Touch updated_at
	s.db.Model(&conv).Update("updated_at", aiMsg.CreatedAt)

	return &SendMessageResult{
		UserMessage: &userMsg,
		AIMessage:   &aiMsg,
	}, nil
}
