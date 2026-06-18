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
	ctxSvc   *ContextService
}

func NewChatService(db *gorm.DB, provider ai.Provider) *ChatService {
	return &ChatService{db: db, provider: provider, ctxSvc: NewContextService(db)}
}

const mentorBasePrompt = `You are Mentor, an AI growth mentor in Mentor OS.

Your role is NOT just to answer questions. You must:
1. Understand what the user truly wants to solve
2. Connect answers to the user's career goals
3. Explain principles clearly with project-level value
4. For interview questions, provide structured expression frameworks
5. End with actionable next steps
6. Avoid information overload

## Response Format (IMPORTANT)

Always respond in well-structured Markdown:
- Use **## headings** to organize sections
- Use **bold** for key terms and important concepts
- Use bullet lists or numbered lists for multiple points
- Use inline code backticks for technical terms, function names, types
- Use fenced code blocks with language tags for code examples
- Use > blockquotes for important takeaways or interview tips
- Use tables when comparing multiple items
- Use mermaid code blocks for flowcharts or architecture diagrams when helpful
- Keep paragraphs short (2-4 sentences max)

Respond in the same language as the user's message.`

const modeQuick = `
## Answer Density: QUICK MODE

You MUST keep your response extremely concise:
- Total length: 150-250 Chinese characters (or ~80-120 English words)
- Structure:
  1. **一句话结论** — one sentence direct answer
  2. **核心要点** — exactly 3 bullet points, each one line
  3. **下一步** — one actionable next step
- NO code blocks, NO tables, NO mermaid diagrams
- NO detailed explanations
- If the user needs more, they will ask`

const modeStandard = `
## Answer Density: STANDARD MODE

Keep your response focused and moderate:
- Total length: 400-700 Chinese characters (or ~200-350 English words)
- Structure for technical questions:
  1. **结论** — direct answer first (2-3 sentences)
  2. **原理** — explain the why (short paragraph)
  3. **项目结合** — one practical example (2-3 sentences)
  4. **面试表达** — how to say this in an interview (2-3 sentences)
  5. **下一步** — one next action
- Use code blocks only when essential (keep short)
- Do NOT write exhaustive explanations
- Prefer clarity over completeness`

const modeDeep = `
## Answer Density: DEEP MODE

Provide a thorough, well-structured deep-dive:
- No strict length limit, but use clear sections
- Structure for technical questions:
  1. **结论** — direct answer
  2. **原理** — detailed explanation with diagrams if helpful
  3. **代码示例** — working code examples with comments
  4. **对比** — use tables to compare alternatives
  5. **易错点** — common mistakes and pitfalls
  6. **项目结合** — real-world application scenarios
  7. **面试表达** — full interview answer framework
  8. **延伸** — related topics and follow-up questions
  9. **下一步** — prioritized action items
- Use mermaid diagrams for flows and architecture
- Use tables for comparisons
- Each section must have clear headings`

func buildSystemPrompt(mode string) string {
	prompt := mentorBasePrompt
	switch mode {
	case "quick":
		prompt += modeQuick
	case "deep":
		prompt += modeDeep
	default:
		prompt += modeStandard
	}
	return prompt
}

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
	Content      string `json:"content" binding:"required"`
	ResponseMode string `json:"response_mode"`
}

type SendMessageResult struct {
	UserMessage *model.Message `json:"user_message"`
	AIMessage   *model.Message `json:"ai_message"`
}

func (s *ChatService) SendMessage(ctx context.Context, userID, sessionID uuid.UUID, input SendMessageInput) (*SendMessageResult, error) {
	var conv model.Conversation
	if err := s.db.Where("id = ? AND user_id = ?", sessionID, userID).First(&conv).Error; err != nil {
		return nil, errors.New("conversation not found")
	}

	userMsg := model.Message{
		ID:             uuid.New(),
		ConversationID: sessionID,
		Role:           "user",
		Content:        input.Content,
	}
	if err := s.db.Create(&userMsg).Error; err != nil {
		return nil, err
	}

	var history []model.Message
	s.db.Where("conversation_id = ?", sessionID).Order("created_at ASC").Find(&history)

	// Build system prompt with user's Second Brain context (RAG)
	systemPrompt := buildSystemPrompt(input.ResponseMode)
	userContext := s.ctxSvc.BuildChatContext(userID, input.Content)
	aiMessages := []ai.Message{
		{Role: "system", Content: systemPrompt + userContext},
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

	reply, err := s.provider.Chat(ctx, aiMessages)
	if err != nil {
		return nil, err
	}

	aiMsg := model.Message{
		ID:             uuid.New(),
		ConversationID: sessionID,
		Role:           "assistant",
		Content:        reply,
	}
	if err := s.db.Create(&aiMsg).Error; err != nil {
		return nil, err
	}

	if conv.Title == "New Chat" {
		title := input.Content
		if len(title) > 50 {
			title = title[:50] + "..."
		}
		s.db.Model(&conv).Update("title", title)
	}

	s.db.Model(&conv).Update("updated_at", aiMsg.CreatedAt)

	return &SendMessageResult{
		UserMessage: &userMsg,
		AIMessage:   &aiMsg,
	}, nil
}
