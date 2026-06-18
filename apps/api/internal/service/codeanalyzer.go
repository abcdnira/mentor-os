package service

import (
	"archive/zip"
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"mentor-os-api/internal/ai"
	"mentor-os-api/internal/model"
)

type CodeAnalyzerService struct {
	db       *gorm.DB
	provider ai.Provider
}

func NewCodeAnalyzerService(db *gorm.DB, provider ai.Provider) *CodeAnalyzerService {
	return &CodeAnalyzerService{db: db, provider: provider}
}

// Directories to skip when scanning
var skipDirs = map[string]bool{
	"node_modules": true, ".git": true, "dist": true, "build": true,
	".next": true, "vendor": true, "__pycache__": true, ".idea": true,
	".vscode": true, "target": true, "bin": true, ".DS_Store": true,
	"tmp": true, "coverage": true, ".cache": true,
}

// ScanZip extracts a zip, scans the directory structure, and returns a tree summary.
func (s *CodeAnalyzerService) ScanZip(zipPath string) (string, error) {
	tmpDir, err := os.MkdirTemp("", "mentor-code-*")
	if err != nil {
		return "", fmt.Errorf("create temp dir: %w", err)
	}
	defer os.RemoveAll(tmpDir)

	if err := extractZip(zipPath, tmpDir); err != nil {
		return "", fmt.Errorf("extract zip: %w", err)
	}

	tree := scanDirectory(tmpDir, "", 0)
	return tree, nil
}

func extractZip(src, dest string) error {
	r, err := zip.OpenReader(src)
	if err != nil {
		return err
	}
	defer r.Close()

	for _, f := range r.File {
		path := filepath.Join(dest, f.Name)

		// Security: prevent zip slip
		if !strings.HasPrefix(filepath.Clean(path), filepath.Clean(dest)+string(os.PathSeparator)) {
			continue
		}

		if f.FileInfo().IsDir() {
			os.MkdirAll(path, 0755)
			continue
		}

		os.MkdirAll(filepath.Dir(path), 0755)

		outFile, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.Mode())
		if err != nil {
			continue
		}

		rc, err := f.Open()
		if err != nil {
			outFile.Close()
			continue
		}

		// Limit file size to 1MB per file
		io.Copy(outFile, io.LimitReader(rc, 1<<20))
		rc.Close()
		outFile.Close()
	}
	return nil
}

func scanDirectory(root, prefix string, depth int) string {
	if depth > 5 {
		return prefix + "...\n"
	}

	entries, err := os.ReadDir(root)
	if err != nil {
		return ""
	}

	// Sort: dirs first, then files
	sort.Slice(entries, func(i, j int) bool {
		if entries[i].IsDir() != entries[j].IsDir() {
			return entries[i].IsDir()
		}
		return entries[i].Name() < entries[j].Name()
	})

	var sb strings.Builder
	for _, e := range entries {
		name := e.Name()
		if skipDirs[name] {
			continue
		}
		if strings.HasPrefix(name, ".") && name != ".env.example" {
			continue
		}

		if e.IsDir() {
			sb.WriteString(prefix + name + "/\n")
			sb.WriteString(scanDirectory(filepath.Join(root, name), prefix+"  ", depth+1))
		} else {
			sb.WriteString(prefix + name + "\n")
		}
	}
	return sb.String()
}

const codeAnalysisPrompt = `You are analyzing a software project's directory structure.

Given the directory tree below, generate a comprehensive project analysis.

You MUST respond with ONLY valid JSON (no markdown fences):
{
  "summary": "2-3 sentence project summary",
  "tech_stack": ["Go", "PostgreSQL", "Docker", ...],
  "architecture": "Description of the architecture pattern (monolith, microservices, clean arch, etc.)",
  "core_modules": [
    {"name": "module name", "description": "what it does", "files": ["key files"]}
  ],
  "highlights": ["technical highlight 1", "highlight 2"],
  "resume_description": "2-3 resume bullet points for this project",
  "interview_points": ["likely interview question about this project"],
  "mindmap": "mermaid mindmap source code showing project architecture"
}

Respond in the same language as any code comments or file names suggest.`

type CodeAnalysisResult struct {
	Summary          string           `json:"summary"`
	TechStack        []string         `json:"tech_stack"`
	Architecture     string           `json:"architecture"`
	CoreModules      []CoreModule     `json:"core_modules"`
	Highlights       []string         `json:"highlights"`
	ResumeDesc       string           `json:"resume_description"`
	InterviewPoints  []string         `json:"interview_points"`
	Mindmap          string           `json:"mindmap"`
}

type CoreModule struct {
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Files       []string `json:"files"`
}

func (s *CodeAnalyzerService) AnalyzeAndSave(ctx context.Context, userID, projectID uuid.UUID, zipPath string) (*model.ProjectNode, error) {
	tree, err := s.ScanZip(zipPath)
	if err != nil {
		return nil, err
	}

	// Call AI
	aiMessages := []ai.Message{
		{Role: "system", Content: codeAnalysisPrompt},
		{Role: "user", Content: "Directory structure:\n\n" + tree},
	}

	raw, err := s.provider.Chat(ctx, aiMessages)
	if err != nil {
		return nil, fmt.Errorf("ai code analysis: %w", err)
	}

	// Parse result (best effort — don't fail if JSON is imperfect)
	// Update project node
	var project model.ProjectNode
	if err := s.db.Where("id = ? AND user_id = ?", projectID, userID).First(&project).Error; err != nil {
		return nil, fmt.Errorf("project not found")
	}

	// Store raw AI analysis + tree in project
	project.AISummary = "Code analysis: " + truncateStr(raw, 500)
	project.AIMindmap = tree // Store directory tree as mindmap source
	project.Status = "analyzed"
	s.db.Save(&project)

	// Remove uploaded zip
	os.Remove(zipPath)

	return &project, nil
}

func truncateStr(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n] + "..."
}
