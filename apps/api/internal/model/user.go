package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Email        string    `gorm:"uniqueIndex;size:255;not null" json:"email"`
	PasswordHash string    `gorm:"not null" json:"-"`
	Name         string    `gorm:"size:100" json:"name"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

type UserProfile struct {
	ID                uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	UserID            uuid.UUID `gorm:"type:uuid;uniqueIndex;not null" json:"user_id"`
	CurrentRole       string    `json:"current_role"`
	TargetRole        string    `json:"target_role"`
	MainStack         JSON      `gorm:"type:jsonb;default:'[]'" json:"main_stack"`
	CareerGoals       JSON      `gorm:"type:jsonb;default:'[]'" json:"career_goals"`
	ThinkingStyle     JSON      `gorm:"type:jsonb;default:'{}'" json:"thinking_style"`
	EmotionalPatterns JSON      `gorm:"type:jsonb;default:'{}'" json:"emotional_patterns"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

func (p *UserProfile) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}
