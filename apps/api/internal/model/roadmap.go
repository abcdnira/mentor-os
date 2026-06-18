package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RoadmapItem struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	UserID     uuid.UUID `gorm:"type:uuid;index;not null" json:"user_id"`
	Title      string    `gorm:"not null" json:"title"`
	Reason     string    `json:"reason"`
	Priority   int       `gorm:"default:0" json:"priority"`
	Status     string    `gorm:"size:20;default:'pending'" json:"status"`
	NextAction string    `json:"next_action"`
	SortOrder  int       `gorm:"default:0" json:"sort_order"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func (r *RoadmapItem) TableName() string {
	return "roadmap_items"
}

func (r *RoadmapItem) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return nil
}
