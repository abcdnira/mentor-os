package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"mentor-os-api/internal/service"
)

type ResumeHandler struct {
	resumeSvc *service.ResumeService
}

func NewResumeHandler(svc *service.ResumeService) *ResumeHandler {
	return &ResumeHandler{resumeSvc: svc}
}

func (h *ResumeHandler) Generate(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	var input service.GenerateResumeInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	markdown, err := h.resumeSvc.Generate(c.Request.Context(), userID, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"markdown": markdown, "version": input.Version})
}
