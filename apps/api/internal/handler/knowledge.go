package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"mentor-os-api/internal/model"
)

type KnowledgeHandler struct {
	db *gorm.DB
}

func NewKnowledgeHandler(db *gorm.DB) *KnowledgeHandler {
	return &KnowledgeHandler{db: db}
}

func (h *KnowledgeHandler) List(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	var nodes []model.KnowledgeNode
	h.db.Where("user_id = ?", userID).Order("updated_at DESC").Find(&nodes)

	c.JSON(http.StatusOK, nodes)
}

func (h *KnowledgeHandler) Get(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var node model.KnowledgeNode
	if err := h.db.Where("id = ? AND user_id = ?", id, userID).First(&node).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	c.JSON(http.StatusOK, node)
}
