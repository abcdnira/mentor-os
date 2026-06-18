package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ProjectNode struct {
	ID               uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	UserID           uuid.UUID `gorm:"type:uuid;index;not null" json:"user_id"`
	Name             string    `gorm:"not null" json:"name"`
	Background       string    `json:"background"`
	TechStack        JSON      `gorm:"type:jsonb;default:'[]'" json:"tech_stack"`
	Modules          JSON      `gorm:"type:jsonb;default:'[]'" json:"modules"`
	Responsibilities string    `json:"responsibilities"`
	Challenges       string    `json:"challenges"`
	AISummary        string    `json:"ai_summary"`
	AIHighlights     JSON      `gorm:"type:jsonb" json:"ai_highlights"`
	AIResume         string    `json:"ai_resume"`
	AIInterviewAnswer string   `json:"ai_interview_answer"`
	AIFollowups      JSON      `gorm:"type:jsonb" json:"ai_followups"`
	AIMindmap        string    `json:"ai_mindmap"`
	Status           string    `gorm:"size:20;default:'draft'" json:"status"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

func (p *ProjectNode) TableName() string {
	return "project_nodes"
}

func (p *ProjectNode) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}
