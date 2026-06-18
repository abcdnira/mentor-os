package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"mentor-os-api/internal/service"
)

type ChatHandler struct {
	chatSvc *service.ChatService
}

func NewChatHandler(chatSvc *service.ChatService) *ChatHandler {
	return &ChatHandler{chatSvc: chatSvc}
}

func (h *ChatHandler) CreateSession(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	var input service.CreateSessionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		// Allow empty body - use defaults
		input = service.CreateSessionInput{}
	}

	conv, err := h.chatSvc.CreateSession(userID, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, conv)
}

func (h *ChatHandler) ListSessions(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	convs, err := h.chatSvc.ListSessions(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, convs)
}

func (h *ChatHandler) GetSession(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	sessionID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid session id"})
		return
	}

	conv, err := h.chatSvc.GetSession(userID, sessionID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "session not found"})
		return
	}

	c.JSON(http.StatusOK, conv)
}

func (h *ChatHandler) SendMessage(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	sessionID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid session id"})
		return
	}

	var input service.SendMessageInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := h.chatSvc.SendMessage(c.Request.Context(), userID, sessionID, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}
