package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"mentor-os-api/internal/service"
)

type ReflectionHandler struct {
	reflectionSvc *service.ReflectionService
}

func NewReflectionHandler(svc *service.ReflectionService) *ReflectionHandler {
	return &ReflectionHandler{reflectionSvc: svc}
}

func (h *ReflectionHandler) GenerateReflection(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	sessionID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid session id"})
		return
	}

	result, err := h.reflectionSvc.GenerateReflection(c.Request.Context(), userID, sessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}
