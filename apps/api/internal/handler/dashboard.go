package handler

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"mentor-os-api/internal/model"
)

type DashboardHandler struct {
	db *gorm.DB
}

func NewDashboardHandler(db *gorm.DB) *DashboardHandler {
	return &DashboardHandler{db: db}
}

type DashboardData struct {
	Capabilities      []model.CapabilityNode `json:"capabilities"`
	RecentKnowledge   []model.KnowledgeNode  `json:"recent_knowledge"`
	RecentReflections []model.Reflection     `json:"recent_reflections"`
	NextActions       []string               `json:"next_actions"`
}

func (h *DashboardHandler) Get(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	var caps []model.CapabilityNode
	h.db.Where("user_id = ?", userID).Order("score DESC").Limit(10).Find(&caps)

	var knowledge []model.KnowledgeNode
	h.db.Where("user_id = ?", userID).Order("updated_at DESC").Limit(5).Find(&knowledge)

	var reflections []model.Reflection
	h.db.Where("user_id = ?", userID).Order("created_at DESC").Limit(5).Find(&reflections)

	// Collect next_actions from the most recent reflection
	var nextActions []string
	if len(reflections) > 0 {
		latest := reflections[0]
		if len(latest.NextActions) > 0 {
			// Parse JSON array of strings
			_ = json.Unmarshal([]byte(latest.NextActions), &nextActions)
		}
	}

	c.JSON(http.StatusOK, DashboardData{
		Capabilities:      caps,
		RecentKnowledge:   knowledge,
		RecentReflections: reflections,
		NextActions:       nextActions,
	})
}
