package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type KnowledgeNode struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	UserID       uuid.UUID `gorm:"type:uuid;index;not null" json:"user_id"`
	Title        string    `gorm:"not null" json:"title"`
	Category     string    `json:"category"`
	Summary      string    `json:"summary"`
	Markdown     string    `json:"markdown"`
	Card         JSON      `gorm:"type:jsonb" json:"card"`
	Mindmap      string    `json:"mindmap"`
	Tags         JSON      `gorm:"type:jsonb;default:'[]'" json:"tags"`
	MasteryScore int       `gorm:"default:0" json:"mastery_score"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (k *KnowledgeNode) TableName() string {
	return "knowledge_nodes"
}

func (k *KnowledgeNode) BeforeCreate(tx *gorm.DB) error {
	if k.ID == uuid.Nil {
		k.ID = uuid.New()
	}
	return nil
}
