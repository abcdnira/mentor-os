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

type ReflectionService struct {
	db       *gorm.DB
	provider ai.Provider
}

func NewReflectionService(db *gorm.DB, provider ai.Provider) *ReflectionService {
	return &ReflectionService{db: db, provider: provider}
}

const reflectionPrompt = `You are a Reflection Engine for Mentor OS.

Given a conversation between a user and their AI mentor, produce a structured reflection.

You MUST respond with ONLY valid JSON (no markdown fences, no extra text) in this exact format:
{
  "conversation_summary": "2-3 sentence summary of what was discussed",
  "knowledge_updates": [
    {
      "title": "Topic Name",
      "category": "one of: golang, database, architecture, networking, ai, interview, career",
      "one_sentence": "One sentence explanation",
      "core_principle": "The core principle or key insight",
      "interview_answer": "How to explain this in an interview (2-3 sentences)",
      "common_followups": ["follow-up question 1", "follow-up question 2"],
      "mastery_score": 50
    }
  ],
  "capability_updates": [
    {
      "name": "Capability Name",
      "category": "one of: backend, project, ai_backend, interview",
      "score": 50,
      "evidence": "Why this score",
      "weakness": "What needs improvement"
    }
  ],
  "next_actions": ["action 1", "action 2"]
}

Rules:
- mastery_score and score: 0-100
- Extract 1-3 knowledge items that were meaningfully discussed
- Extract 1-3 capability updates based on demonstrated understanding
- If the conversation is casual or off-topic, return minimal updates
- Respond in the same language as the conversation`

type ReflectionResult struct {
	Reflection   *model.Reflection     `json:"reflection"`
	Knowledge    []model.KnowledgeNode `json:"knowledge_nodes"`
	Capabilities []model.CapabilityNode `json:"capability_nodes"`
}

type aiReflectionOutput struct {
	ConversationSummary string              `json:"conversation_summary"`
	KnowledgeUpdates    []aiKnowledgeItem   `json:"knowledge_updates"`
	CapabilityUpdates   []aiCapabilityItem  `json:"capability_updates"`
	NextActions         []string            `json:"next_actions"`
}

type aiKnowledgeItem struct {
	Title           string   `json:"title"`
	Category        string   `json:"category"`
	OneSentence     string   `json:"one_sentence"`
	CorePrinciple   string   `json:"core_principle"`
	InterviewAnswer string   `json:"interview_answer"`
	CommonFollowups []string `json:"common_followups"`
	MasteryScore    int      `json:"mastery_score"`
}

type aiCapabilityItem struct {
	Name     string `json:"name"`
	Category string `json:"category"`
	Score    int    `json:"score"`
	Evidence string `json:"evidence"`
	Weakness string `json:"weakness"`
}

func (s *ReflectionService) GenerateReflection(ctx context.Context, userID, sessionID uuid.UUID) (*ReflectionResult, error) {
	// 1. Load conversation
	var conv model.Conversation
	if err := s.db.Where("id = ? AND user_id = ?", sessionID, userID).First(&conv).Error; err != nil {
		return nil, fmt.Errorf("conversation not found")
	}

	var messages []model.Message
	s.db.Where("conversation_id = ?", sessionID).Order("created_at ASC").Find(&messages)
	if len(messages) == 0 {
		return nil, fmt.Errorf("no messages in conversation")
	}

	// 2. Build prompt
	var convText string
	for _, m := range messages {
		convText += fmt.Sprintf("[%s]: %s\n\n", m.Role, m.Content)
	}

	aiMessages := []ai.Message{
		{Role: "system", Content: reflectionPrompt},
		{Role: "user", Content: "Here is the conversation to reflect on:\n\n" + convText},
	}

	// 3. Call AI
	raw, err := s.provider.Chat(ctx, aiMessages)
	if err != nil {
		return nil, fmt.Errorf("ai reflection call: %w", err)
	}

	// 4. Parse JSON response
	var output aiReflectionOutput
	if err := json.Unmarshal([]byte(raw), &output); err != nil {
		return nil, fmt.Errorf("parse reflection JSON: %w\nRaw response: %s", err, raw)
	}

	// 5. Write reflection record
	knowledgeJSON, _ := json.Marshal(output.KnowledgeUpdates)
	capabilityJSON, _ := json.Marshal(output.CapabilityUpdates)
	nextActionsJSON, _ := json.Marshal(output.NextActions)

	reflection := model.Reflection{
		ID:                uuid.New(),
		UserID:            userID,
		ConversationID:    sessionID,
		Summary:           output.ConversationSummary,
		KnowledgeUpdates:  model.JSON(knowledgeJSON),
		CapabilityUpdates: model.JSON(capabilityJSON),
		NextActions:       model.JSON(nextActionsJSON),
	}
	if err := s.db.Create(&reflection).Error; err != nil {
		return nil, fmt.Errorf("save reflection: %w", err)
	}

	// 6. Upsert knowledge nodes
	var knowledgeNodes []model.KnowledgeNode
	for _, k := range output.KnowledgeUpdates {
		cardJSON, _ := json.Marshal(map[string]interface{}{
			"one_sentence":     k.OneSentence,
			"core_principle":   k.CorePrinciple,
			"interview_answer": k.InterviewAnswer,
			"common_followups": k.CommonFollowups,
		})
		tagsJSON, _ := json.Marshal([]string{k.Category})

		var existing model.KnowledgeNode
		err := s.db.Where("user_id = ? AND title = ?", userID, k.Title).First(&existing).Error

		if err == nil {
			// Update existing
			existing.Summary = k.OneSentence
			existing.Card = model.JSON(cardJSON)
			existing.MasteryScore = k.MasteryScore
			existing.Category = k.Category
			s.db.Save(&existing)
			knowledgeNodes = append(knowledgeNodes, existing)
		} else {
			// Create new
			node := model.KnowledgeNode{
				ID:           uuid.New(),
				UserID:       userID,
				Title:        k.Title,
				Category:     k.Category,
				Summary:      k.OneSentence,
				Card:         model.JSON(cardJSON),
				Tags:         model.JSON(tagsJSON),
				MasteryScore: k.MasteryScore,
			}
			s.db.Create(&node)
			knowledgeNodes = append(knowledgeNodes, node)
		}
	}

	// 7. Upsert capability nodes
	var capabilityNodes []model.CapabilityNode
	for _, c := range output.CapabilityUpdates {
		evidenceJSON, _ := json.Marshal([]string{c.Evidence})
		weaknessJSON, _ := json.Marshal([]string{c.Weakness})

		var existing model.CapabilityNode
		err := s.db.Where("user_id = ? AND name = ?", userID, c.Name).First(&existing).Error

		if err == nil {
			// Update: keep higher score, append evidence
			if c.Score > existing.Score {
				existing.Score = c.Score
			}
			existing.Evidence = model.JSON(evidenceJSON)
			existing.Weakness = model.JSON(weaknessJSON)
			s.db.Save(&existing)
			capabilityNodes = append(capabilityNodes, existing)
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
			capabilityNodes = append(capabilityNodes, node)
		}
	}

	return &ReflectionResult{
		Reflection:   &reflection,
		Knowledge:    knowledgeNodes,
		Capabilities: capabilityNodes,
	}, nil
}
