package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Reflection struct {
	ID                uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	UserID            uuid.UUID `gorm:"type:uuid;index;not null" json:"user_id"`
	ConversationID    uuid.UUID `gorm:"type:uuid" json:"conversation_id"`
	Summary           string    `json:"summary"`
	KnowledgeUpdates  JSON      `gorm:"type:jsonb" json:"knowledge_updates"`
	CapabilityUpdates JSON      `gorm:"type:jsonb" json:"capability_updates"`
	ProjectUpdates    JSON      `gorm:"type:jsonb" json:"project_updates"`
	RoadmapUpdates    JSON      `gorm:"type:jsonb" json:"roadmap_updates"`
	NextActions       JSON      `gorm:"type:jsonb" json:"next_actions"`
	CreatedAt         time.Time `json:"created_at"`
}

func (r *Reflection) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return nil
}
