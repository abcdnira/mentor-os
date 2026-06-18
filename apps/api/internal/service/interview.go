package service

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"mentor-os-api/internal/ai"
	"mentor-os-api/internal/model"
)

type InterviewService struct {
	db       *gorm.DB
	provider ai.Provider
}

func NewInterviewService(db *gorm.DB, provider ai.Provider) *InterviewService {
	return &InterviewService{db: db, provider: provider}
}

var interviewTopics = map[string]string{
	"golang":        "Golang 后端开发",
	"redis":         "Redis",
	"mysql":         "MySQL",
	"mq":            "消息队列 (Kafka/RabbitMQ/RocketMQ)",
	"im":            "IM 即时通讯项目",
	"wallet":        "红包/钱包/支付项目",
	"agent":         "AI Agent Backend",
	"system_design": "系统设计",
}

func interviewSystemPrompt(topic, topicLabel string) string {
	return fmt.Sprintf(`You are a senior technical interviewer conducting a mock interview.

Topic: %s

Rules:
1. Ask ONE question at a time
2. Start with a medium-difficulty question related to %s
3. After the candidate answers, evaluate briefly and ask a follow-up that digs deeper
4. Be realistic — ask what real interviewers ask
5. After 3-5 rounds of Q&A, if the user says "评估" or "evaluate", provide a full evaluation
6. Use Markdown formatting: bold key terms, use code blocks for code
7. Respond in the same language as the user

Start by introducing yourself briefly and asking the first question.`, topicLabel, topicLabel)
}

const evaluatePrompt = `Based on the entire interview conversation above, provide a comprehensive evaluation.

You MUST respond with ONLY valid JSON (no markdown fences) in this format:
{
  "overall_score": 70,
  "summary": "2-3 sentence overall assessment",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "knowledge_gaps": [
    {
      "title": "Topic Name",
      "category": "golang/redis/mysql/mq/architecture/ai",
      "mastery_score": 40,
      "suggestion": "What to study"
    }
  ],
  "capability_updates": [
    {
      "name": "Capability Name",
      "category": "backend/project/ai_backend/interview",
      "score": 50,
      "evidence": "Why this score",
      "weakness": "What needs improvement"
    }
  ],
  "next_actions": ["action 1", "action 2", "action 3"]
}`

type StartInterviewInput struct {
	Topic string `json:"topic" binding:"required"`
}

func (s *InterviewService) Start(ctx context.Context, userID uuid.UUID, input StartInterviewInput) (*model.Conversation, *model.Message, error) {
	topicLabel, ok := interviewTopics[input.Topic]
	if !ok {
		return nil, nil, fmt.Errorf("unknown topic: %s", input.Topic)
	}

	conv := model.Conversation{
		ID:     uuid.New(),
		UserID: userID,
		Title:  "Mock Interview: " + topicLabel,
		Type:   "interview",
	}
	if err := s.db.Create(&conv).Error; err != nil {
		return nil, nil, err
	}

	// Call AI to generate first question
	sysPrompt := interviewSystemPrompt(input.Topic, topicLabel)
	aiMessages := []ai.Message{
		{Role: "system", Content: sysPrompt},
		{Role: "user", Content: "请开始面试"},
	}

	reply, err := s.provider.Chat(ctx, aiMessages)
	if err != nil {
		return nil, nil, fmt.Errorf("ai call: %w", err)
	}

	// Save system context as metadata, first AI message
	aiMsg := model.Message{
		ID:             uuid.New(),
		ConversationID: conv.ID,
		Role:           "assistant",
		Content:        reply,
	}
	if err := s.db.Create(&aiMsg).Error; err != nil {
		return nil, nil, err
	}

	return &conv, &aiMsg, nil
}

func (s *InterviewService) GetTopics() map[string]string {
	return interviewTopics
}

// SendAnswer sends user answer and gets interviewer follow-up
func (s *InterviewService) SendAnswer(ctx context.Context, userID, sessionID uuid.UUID, content string, topic string) (*model.Message, *model.Message, error) {
	var conv model.Conversation
	if err := s.db.Where("id = ? AND user_id = ? AND \"type\" = 'interview'", sessionID, userID).First(&conv).Error; err != nil {
		return nil, nil, fmt.Errorf("interview session not found")
	}

	userMsg := model.Message{
		ID:             uuid.New(),
		ConversationID: sessionID,
		Role:           "user",
		Content:        content,
	}
	s.db.Create(&userMsg)

	var history []model.Message
	s.db.Where("conversation_id = ?", sessionID).Order("created_at ASC").Find(&history)

	topicLabel := interviewTopics[topic]
	if topicLabel == "" {
		topicLabel = "技术面试"
	}

	aiMessages := []ai.Message{
		{Role: "system", Content: interviewSystemPrompt(topic, topicLabel)},
	}
	for _, msg := range history {
		aiMessages = append(aiMessages, ai.Message{Role: msg.Role, Content: msg.Content})
	}

	reply, err := s.provider.Chat(ctx, aiMessages)
	if err != nil {
		return nil, nil, err
	}

	aiMsg := model.Message{
		ID:             uuid.New(),
		ConversationID: sessionID,
		Role:           "assistant",
		Content:        reply,
	}
	s.db.Create(&aiMsg)
	s.db.Model(&conv).Update("updated_at", aiMsg.CreatedAt)

	return &userMsg, &aiMsg, nil
}

type EvaluationResult struct {
	OverallScore int      `json:"overall_score"`
	Summary      string   `json:"summary"`
	Strengths    []string `json:"strengths"`
	Weaknesses   []string `json:"weaknesses"`
	NextActions  []string `json:"next_actions"`
	// Also triggers knowledge + capability updates
	KnowledgeNodes  []model.KnowledgeNode  `json:"knowledge_nodes"`
	CapabilityNodes []model.CapabilityNode `json:"capability_nodes"`
}

type aiEvalOutput struct {
	OverallScore      int    `json:"overall_score"`
	Summary           string `json:"summary"`
	Strengths         []string `json:"strengths"`
	Weaknesses        []string `json:"weaknesses"`
	KnowledgeGaps     []struct {
		Title        string `json:"title"`
		Category     string `json:"category"`
		MasteryScore int    `json:"mastery_score"`
		Suggestion   string `json:"suggestion"`
	} `json:"knowledge_gaps"`
	CapabilityUpdates []struct {
		Name     string `json:"name"`
		Category string `json:"category"`
		Score    int    `json:"score"`
		Evidence string `json:"evidence"`
		Weakness string `json:"weakness"`
	} `json:"capability_updates"`
	NextActions []string `json:"next_actions"`
}

func (s *InterviewService) Evaluate(ctx context.Context, userID, sessionID uuid.UUID) (*EvaluationResult, error) {
	var conv model.Conversation
	if err := s.db.Where("id = ? AND user_id = ? AND \"type\" = 'interview'", sessionID, userID).First(&conv).Error; err != nil {
		return nil, fmt.Errorf("interview session not found")
	}

	var history []model.Message
	s.db.Where("conversation_id = ?", sessionID).Order("created_at ASC").Find(&history)
	if len(history) < 2 {
		return nil, fmt.Errorf("not enough conversation to evaluate")
	}

	aiMessages := []ai.Message{
		{Role: "system", Content: "You are evaluating a mock technical interview."},
	}
	for _, msg := range history {
		aiMessages = append(aiMessages, ai.Message{Role: msg.Role, Content: msg.Content})
	}
	aiMessages = append(aiMessages, ai.Message{Role: "user", Content: evaluatePrompt})

	raw, err := s.provider.Chat(ctx, aiMessages)
	if err != nil {
		return nil, fmt.Errorf("ai evaluation: %w", err)
	}

	var output aiEvalOutput
	if err := json.Unmarshal([]byte(raw), &output); err != nil {
		return nil, fmt.Errorf("parse evaluation JSON: %w\nRaw: %s", err, raw)
	}

	// Upsert knowledge nodes from gaps
	var knowledgeNodes []model.KnowledgeNode
	for _, g := range output.KnowledgeGaps {
		cardJSON, _ := json.Marshal(map[string]string{
			"suggestion": g.Suggestion,
		})
		tagsJSON, _ := json.Marshal([]string{g.Category, "interview-gap"})

		var existing model.KnowledgeNode
		if s.db.Where("user_id = ? AND title = ?", userID, g.Title).First(&existing).Error == nil {
			if g.MasteryScore < existing.MasteryScore {
				existing.MasteryScore = g.MasteryScore
			}
			s.db.Save(&existing)
			knowledgeNodes = append(knowledgeNodes, existing)
		} else {
			node := model.KnowledgeNode{
				ID:           uuid.New(),
				UserID:       userID,
				Title:        g.Title,
				Category:     g.Category,
				Summary:      g.Suggestion,
				Card:         model.JSON(cardJSON),
				Tags:         model.JSON(tagsJSON),
				MasteryScore: g.MasteryScore,
			}
			s.db.Create(&node)
			knowledgeNodes = append(knowledgeNodes, node)
		}
	}

	// Upsert capabilities
	var capNodes []model.CapabilityNode
	for _, c := range output.CapabilityUpdates {
		evidenceJSON, _ := json.Marshal([]string{c.Evidence})
		weaknessJSON, _ := json.Marshal([]string{c.Weakness})

		var existing model.CapabilityNode
		if s.db.Where("user_id = ? AND name = ?", userID, c.Name).First(&existing).Error == nil {
			existing.Score = c.Score
			existing.Evidence = model.JSON(evidenceJSON)
			existing.Weakness = model.JSON(weaknessJSON)
			s.db.Save(&existing)
			capNodes = append(capNodes, existing)
		} else {
			node := model.CapabilityNode{
				ID:       uuid.New(),
				UserID:   userID,
				Name:     c.Name,
				Category: c.Category,
				Score:    c.Score,
				Evidence: model.JSON(evidenceJSON),
				Weakness: model.JSON(weaknessJSON),
			}
			s.db.Create(&node)
			capNodes = append(capNodes, node)
		}
	}

	return &EvaluationResult{
		OverallScore:    output.OverallScore,
		Summary:         output.Summary,
		Strengths:       output.Strengths,
		Weaknesses:      output.Weaknesses,
		NextActions:     output.NextActions,
		KnowledgeNodes:  knowledgeNodes,
		CapabilityNodes: capNodes,
	}, nil
}
