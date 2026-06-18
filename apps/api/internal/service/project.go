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

type ProjectService struct {
	db       *gorm.DB
	provider ai.Provider
}

func NewProjectService(db *gorm.DB, provider ai.Provider) *ProjectService {
	return &ProjectService{db: db, provider: provider}
}

type CreateProjectInput struct {
	Name             string   `json:"name" binding:"required"`
	Background       string   `json:"background"`
	TechStack        []string `json:"tech_stack"`
	Modules          []string `json:"modules"`
	Responsibilities string   `json:"responsibilities"`
	Challenges       string   `json:"challenges"`
}

func (s *ProjectService) Create(userID uuid.UUID, input CreateProjectInput) (*model.ProjectNode, error) {
	techJSON, _ := json.Marshal(input.TechStack)
	modulesJSON, _ := json.Marshal(input.Modules)

	p := model.ProjectNode{
		ID:               uuid.New(),
		UserID:           userID,
		Name:             input.Name,
		Background:       input.Background,
		TechStack:        model.JSON(techJSON),
		Modules:          model.JSON(modulesJSON),
		Responsibilities: input.Responsibilities,
		Challenges:       input.Challenges,
		Status:           "draft",
	}
	if err := s.db.Create(&p).Error; err != nil {
		return nil, err
	}
	return &p, nil
}

func (s *ProjectService) List(userID uuid.UUID) ([]model.ProjectNode, error) {
	var projects []model.ProjectNode
	err := s.db.Where("user_id = ?", userID).Order("updated_at DESC").Find(&projects).Error
	return projects, err
}

func (s *ProjectService) Get(userID, id uuid.UUID) (*model.ProjectNode, error) {
	var p model.ProjectNode
	err := s.db.Where("id = ? AND user_id = ?", id, userID).First(&p).Error
	return &p, err
}

const projectAnalyzePrompt = `Analyze this project and generate structured content for a software engineer's career growth.

You MUST respond with ONLY valid JSON (no markdown fences):
{
  "summary": "2-3 sentence project summary highlighting technical depth",
  "highlights": ["technical highlight 1", "technical highlight 2", "technical highlight 3"],
  "resume_description": "2-3 bullet points suitable for a resume, emphasizing impact and technical decisions",
  "interview_answer": "A structured interview answer explaining this project (STAR format, 200-300 words)",
  "followups": ["likely interview follow-up question 1", "question 2", "question 3", "question 4", "question 5"],
  "mindmap": "mermaid mindmap diagram source code showing project architecture"
}

Respond in the same language as the input.`

type aiProjectAnalysis struct {
	Summary           string   `json:"summary"`
	Highlights        []string `json:"highlights"`
	ResumeDescription string   `json:"resume_description"`
	InterviewAnswer   string   `json:"interview_answer"`
	Followups         []string `json:"followups"`
	Mindmap           string   `json:"mindmap"`
}

func (s *ProjectService) Analyze(ctx context.Context, userID, projectID uuid.UUID) (*model.ProjectNode, error) {
	var p model.ProjectNode
	if err := s.db.Where("id = ? AND user_id = ?", projectID, userID).First(&p).Error; err != nil {
		return nil, fmt.Errorf("project not found")
	}

	input := fmt.Sprintf(`Project: %s
Background: %s
Tech Stack: %s
Modules: %s
Responsibilities: %s
Challenges: %s`, p.Name, p.Background, string(p.TechStack), string(p.Modules), p.Responsibilities, p.Challenges)

	aiMessages := []ai.Message{
		{Role: "system", Content: projectAnalyzePrompt},
		{Role: "user", Content: input},
	}

	raw, err := s.provider.Chat(ctx, aiMessages)
	if err != nil {
		return nil, fmt.Errorf("ai analysis: %w", err)
	}

	var analysis aiProjectAnalysis
	if err := json.Unmarshal([]byte(raw), &analysis); err != nil {
		return nil, fmt.Errorf("parse analysis: %w\nRaw: %s", err, raw)
	}

	highlightsJSON, _ := json.Marshal(analysis.Highlights)
	followupsJSON, _ := json.Marshal(analysis.Followups)

	p.AISummary = analysis.Summary
	p.AIHighlights = model.JSON(highlightsJSON)
	p.AIResume = analysis.ResumeDescription
	p.AIInterviewAnswer = analysis.InterviewAnswer
	p.AIFollowups = model.JSON(followupsJSON)
	p.AIMindmap = analysis.Mindmap
	p.Status = "analyzed"

	s.db.Save(&p)
	return &p, nil
}
