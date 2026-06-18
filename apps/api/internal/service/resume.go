package service

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"mentor-os-api/internal/ai"
	"mentor-os-api/internal/model"
)

type ResumeService struct {
	db       *gorm.DB
	provider ai.Provider
}

func NewResumeService(db *gorm.DB, provider ai.Provider) *ResumeService {
	return &ResumeService{db: db, provider: provider}
}

type GenerateResumeInput struct {
	Version string `json:"version" binding:"required"` // "backend" or "ai_backend"
}

const resumePrompt = `You are an expert resume writer for software engineers.

Given the user's projects, capabilities, and career goals, generate polished resume content.

Output in Markdown format with these sections:

## Professional Summary
2-3 sentences positioning the candidate

## Technical Skills
Categorized skill list

## Project Experience
For each project:
### Project Name
- **Role**: ...
- **Tech Stack**: ...
- **Key Achievements**: 3-4 bullet points using STAR format, quantify impact where possible
- **Technical Highlights**: 2-3 bullets on technical depth

## Career Highlights
3-5 bullet points of standout achievements

Rules:
- Use action verbs (Designed, Implemented, Optimized, Led)
- Quantify results where possible (reduced latency by 40%, handled 10K QPS)
- For "backend" version: emphasize system design, performance, reliability
- For "ai_backend" version: emphasize AI/LLM integration, Agent architecture, RAG, Tool Calling
- Write in the same language as the user's project descriptions
- Keep it concise — recruiters spend 6 seconds scanning`

func (s *ResumeService) Generate(ctx context.Context, userID uuid.UUID, input GenerateResumeInput) (string, error) {
	// Gather user data
	var profile model.UserProfile
	s.db.Where("user_id = ?", userID).First(&profile)

	var projects []model.ProjectNode
	s.db.Where("user_id = ?", userID).Order("updated_at DESC").Find(&projects)

	var caps []model.CapabilityNode
	s.db.Where("user_id = ?", userID).Order("score DESC").Find(&caps)

	// Build input for AI
	var parts []string

	parts = append(parts, fmt.Sprintf("Resume Version: %s", input.Version))
	parts = append(parts, fmt.Sprintf("Current Role: %s", nvl(profile.CurrentRole, "Backend Engineer")))
	parts = append(parts, fmt.Sprintf("Target Role: %s", nvl(profile.TargetRole, "Senior Backend / AI Backend")))

	if len(caps) > 0 {
		var capLines []string
		for _, c := range caps {
			capLines = append(capLines, fmt.Sprintf("- %s (%s): %d/100", c.Name, c.Category, c.Score))
		}
		parts = append(parts, "Capabilities:\n"+strings.Join(capLines, "\n"))
	}

	if len(projects) > 0 {
		for _, p := range projects {
			pDesc := fmt.Sprintf("Project: %s\nBackground: %s\nTech Stack: %s\nResponsibilities: %s\nChallenges: %s",
				p.Name, p.Background, string(p.TechStack), p.Responsibilities, p.Challenges)
			if p.AISummary != "" {
				pDesc += "\nAI Summary: " + p.AISummary
			}
			if p.AIResume != "" {
				pDesc += "\nPrevious Resume Draft: " + p.AIResume
			}
			parts = append(parts, pDesc)
		}
	}

	if len(projects) == 0 && len(caps) == 0 {
		return "", fmt.Errorf("no projects or capabilities found — add some data first")
	}

	aiMessages := []ai.Message{
		{Role: "system", Content: resumePrompt},
		{Role: "user", Content: strings.Join(parts, "\n\n---\n\n")},
	}

	result, err := s.provider.Chat(ctx, aiMessages)
	if err != nil {
		return "", fmt.Errorf("ai resume generation: %w", err)
	}

	return result, nil
}
