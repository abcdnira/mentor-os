package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Conversation struct {
	ID        uuid.UUID  `gorm:"type:uuid;primaryKey" json:"id"`
	UserID    uuid.UUID  `gorm:"type:uuid;index;not null" json:"user_id"`
	Title     string     `json:"title"`
	Type      string     `gorm:"size:50;default:'mentor_chat'" json:"type"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	Messages  []Message  `gorm:"foreignKey:ConversationID" json:"messages,omitempty"`
}

func (c *Conversation) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}

type Message struct {
	ID             uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	ConversationID uuid.UUID `gorm:"type:uuid;index;not null" json:"conversation_id"`
	Role           string    `gorm:"size:20;not null" json:"role"`
	Content        string    `gorm:"not null" json:"content"`
	Metadata       JSON      `gorm:"type:jsonb" json:"metadata,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
}

func (m *Message) BeforeCreate(tx *gorm.DB) error {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	return nil
}
