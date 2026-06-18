package handler

import (
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"mentor-os-api/internal/service"
)

type CodeUploadHandler struct {
	codeAnalyzer *service.CodeAnalyzerService
}

func NewCodeUploadHandler(svc *service.CodeAnalyzerService) *CodeUploadHandler {
	return &CodeUploadHandler{codeAnalyzer: svc}
}

func (h *CodeUploadHandler) Upload(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	projectID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid project id"})
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file required"})
		return
	}

	// Limit to 50MB
	if file.Size > 50<<20 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file too large (max 50MB)"})
		return
	}

	// Save to temp
	tmpDir := os.TempDir()
	tmpPath := filepath.Join(tmpDir, "mentor-upload-"+uuid.New().String()+".zip")
	if err := c.SaveUploadedFile(file, tmpPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "save file: " + err.Error()})
		return
	}

	project, err := h.codeAnalyzer.AnalyzeAndSave(c.Request.Context(), userID, projectID, tmpPath)
	if err != nil {
		os.Remove(tmpPath)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, project)
}
