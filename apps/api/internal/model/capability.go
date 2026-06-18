package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CapabilityNode struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	UserID    uuid.UUID `gorm:"type:uuid;index;not null" json:"user_id"`
	Name      string    `gorm:"not null" json:"name"`
	Category  string    `json:"category"`
	Score     int       `gorm:"default:0" json:"score"`
	Evidence  JSON      `gorm:"type:jsonb;default:'[]'" json:"evidence"`
	Weakness  JSON      `gorm:"type:jsonb;default:'[]'" json:"weakness"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (c *CapabilityNode) TableName() string {
	return "capability_nodes"
}

func (c *CapabilityNode) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}
