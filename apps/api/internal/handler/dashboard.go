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
	TodayTasks        []TodayTask            `json:"today_tasks"`
	WeakAreas         []model.CapabilityNode `json:"weak_areas"`
}

type TodayTask struct {
	Title  string `json:"title"`
	Source string `json:"source"` // "roadmap", "reflection", "interview_gap"
	Action string `json:"action"`
}

func (h *DashboardHandler) Get(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	var caps []model.CapabilityNode
	h.db.Where("user_id = ?", userID).Order("score DESC").Limit(10).Find(&caps)

	var knowledge []model.KnowledgeNode
	h.db.Where("user_id = ?", userID).Order("updated_at DESC").Limit(5).Find(&knowledge)

	var reflections []model.Reflection
	h.db.Where("user_id = ?", userID).Order("created_at DESC").Limit(5).Find(&reflections)

	// Next actions from latest reflection
	var nextActions []string
	if len(reflections) > 0 {
		if len(reflections[0].NextActions) > 0 {
			_ = json.Unmarshal([]byte(reflections[0].NextActions), &nextActions)
		}
	}

	// Today's tasks: from in_progress roadmap items
	var todayTasks []TodayTask
	var roadmapItems []model.RoadmapItem
	h.db.Where("user_id = ? AND \"status\" = 'in_progress'", userID).Order("priority ASC").Limit(3).Find(&roadmapItems)
	for _, ri := range roadmapItems {
		todayTasks = append(todayTasks, TodayTask{
			Title:  ri.Title,
			Source: "roadmap",
			Action: ri.NextAction,
		})
	}
	// Add top reflection next_actions as tasks
	for i, a := range nextActions {
		if i >= 2 {
			break
		}
		todayTasks = append(todayTasks, TodayTask{
			Title:  a,
			Source: "reflection",
			Action: a,
		})
	}

	// Weak areas: capabilities with score < 50
	var weakAreas []model.CapabilityNode
	h.db.Where("user_id = ? AND score < 50", userID).Order("score ASC").Limit(5).Find(&weakAreas)

	c.JSON(http.StatusOK, DashboardData{
		Capabilities:      caps,
		RecentKnowledge:   knowledge,
		RecentReflections: reflections,
		NextActions:       nextActions,
		TodayTasks:        todayTasks,
		WeakAreas:         weakAreas,
	})
}
