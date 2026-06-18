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

type RoadmapService struct {
	db       *gorm.DB
	provider ai.Provider
}

func NewRoadmapService(db *gorm.DB, provider ai.Provider) *RoadmapService {
	return &RoadmapService{db: db, provider: provider}
}

func (s *RoadmapService) List(userID uuid.UUID) ([]model.RoadmapItem, error) {
	var items []model.RoadmapItem
	err := s.db.Where("user_id = ?", userID).Order("sort_order ASC").Find(&items).Error
	return items, err
}

const roadmapPrompt = `Based on the user's current role and target role, generate a career growth roadmap.

You MUST respond with ONLY valid JSON (no markdown fences):
{
  "items": [
    {
      "title": "Stage/Skill Name",
      "reason": "Why this is important for the career path",
      "priority": 1,
      "status": "pending",
      "next_action": "Specific actionable next step"
    }
  ]
}

Rules:
- Generate 8-15 roadmap items
- Order from current skill level to target role
- priority: 1=highest, 5=lowest
- status: "completed", "in_progress", "pending"
- Each item should be a concrete skill or milestone, not vague
- Include both technical skills and soft skills
- Respond in the same language as the input`

type aiRoadmapOutput struct {
	Items []struct {
		Title      string `json:"title"`
		Reason     string `json:"reason"`
		Priority   int    `json:"priority"`
		Status     string `json:"status"`
		NextAction string `json:"next_action"`
	} `json:"items"`
}

func (s *RoadmapService) Generate(ctx context.Context, userID uuid.UUID) ([]model.RoadmapItem, error) {
	// Read user profile
	var profile model.UserProfile
	s.db.Where("user_id = ?", userID).First(&profile)

	currentRole := profile.CurrentRole
	targetRole := profile.TargetRole
	if currentRole == "" {
		currentRole = "Golang 后端开发"
	}
	if targetRole == "" {
		targetRole = "AI Backend / Agent Backend"
	}

	input := fmt.Sprintf("Current Role: %s\nTarget Role: %s\nTech Stack: %s\nCareer Goals: %s",
		currentRole, targetRole, string(profile.MainStack), string(profile.CareerGoals))

	aiMessages := []ai.Message{
		{Role: "system", Content: roadmapPrompt},
		{Role: "user", Content: input},
	}

	raw, err := s.provider.Chat(ctx, aiMessages)
	if err != nil {
		return nil, fmt.Errorf("ai roadmap: %w", err)
	}

	var output aiRoadmapOutput
	if err := json.Unmarshal([]byte(raw), &output); err != nil {
		return nil, fmt.Errorf("parse roadmap: %w\nRaw: %s", err, raw)
	}

	// Delete old roadmap items and insert new ones
	s.db.Where("user_id = ?", userID).Delete(&model.RoadmapItem{})

	var items []model.RoadmapItem
	for i, item := range output.Items {
		ri := model.RoadmapItem{
			ID:         uuid.New(),
			UserID:     userID,
			Title:      item.Title,
			Reason:     item.Reason,
			Priority:   item.Priority,
			Status:     item.Status,
			NextAction: item.NextAction,
			SortOrder:  i,
		}
		s.db.Create(&ri)
		items = append(items, ri)
	}

	return items, nil
}

func (s *RoadmapService) UpdateStatus(userID, itemID uuid.UUID, status string) error {
	return s.db.Model(&model.RoadmapItem{}).
		Where("id = ? AND user_id = ?", itemID, userID).
		Update("status", status).Error
}
