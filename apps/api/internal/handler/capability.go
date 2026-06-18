package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"mentor-os-api/internal/model"
)

type CapabilityHandler struct {
	db *gorm.DB
}

func NewCapabilityHandler(db *gorm.DB) *CapabilityHandler {
	return &CapabilityHandler{db: db}
}

func (h *CapabilityHandler) List(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	var nodes []model.CapabilityNode
	h.db.Where("user_id = ?", userID).Order("score DESC").Find(&nodes)

	c.JSON(http.StatusOK, nodes)
}

func (h *CapabilityHandler) Get(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var node model.CapabilityNode
	if err := h.db.Where("id = ? AND user_id = ?", id, userID).First(&node).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	c.JSON(http.StatusOK, node)
}
