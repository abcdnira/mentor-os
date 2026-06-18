package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"mentor-os-api/internal/service"
)

type RoadmapHandler struct {
	roadmapSvc *service.RoadmapService
}

func NewRoadmapHandler(svc *service.RoadmapService) *RoadmapHandler {
	return &RoadmapHandler{roadmapSvc: svc}
}

func (h *RoadmapHandler) List(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	items, err := h.roadmapSvc.List(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, items)
}

func (h *RoadmapHandler) Generate(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	items, err := h.roadmapSvc.Generate(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, items)
}

type updateStatusInput struct {
	Status string `json:"status" binding:"required"`
}

func (h *RoadmapHandler) UpdateStatus(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var input updateStatusInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.roadmapSvc.UpdateStatus(userID, id, input.Status); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "updated"})
}
