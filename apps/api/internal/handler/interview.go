package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"mentor-os-api/internal/service"
)

type InterviewHandler struct {
	interviewSvc *service.InterviewService
}

func NewInterviewHandler(svc *service.InterviewService) *InterviewHandler {
	return &InterviewHandler{interviewSvc: svc}
}

func (h *InterviewHandler) GetTopics(c *gin.Context) {
	c.JSON(http.StatusOK, h.interviewSvc.GetTopics())
}

func (h *InterviewHandler) Start(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)

	var input service.StartInterviewInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	conv, msg, err := h.interviewSvc.Start(c.Request.Context(), userID, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"conversation": conv,
		"first_message": msg,
	})
}

type answerInput struct {
	Content string `json:"content" binding:"required"`
	Topic   string `json:"topic"`
}

func (h *InterviewHandler) Answer(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	sessionID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid session id"})
		return
	}

	var input answerInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userMsg, aiMsg, err := h.interviewSvc.SendAnswer(c.Request.Context(), userID, sessionID, input.Content, input.Topic)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user_message": userMsg,
		"ai_message":   aiMsg,
	})
}

func (h *InterviewHandler) Evaluate(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	sessionID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid session id"})
		return
	}

	result, err := h.interviewSvc.Evaluate(c.Request.Context(), userID, sessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}
