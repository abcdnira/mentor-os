package service

import (
	"fmt"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"mentor-os-api/internal/model"
)

// ContextService builds a user context string for AI prompts
// by retrieving relevant data from the user's Second Brain.
type ContextService struct {
	db *gorm.DB
}

func NewContextService(db *gorm.DB) *ContextService {
	return &ContextService{db: db}
}

// BuildChatContext retrieves user's profile, recent capabilities, knowledge, projects,
// and recent reflections, then formats them into a concise context block.
// The userQuery is used to select more relevant knowledge nodes.
func (s *ContextService) BuildChatContext(userID uuid.UUID, userQuery string) string {
	var parts []string

	// 1. User profile
	var profile model.UserProfile
	if s.db.Where("user_id = ?", userID).First(&profile).Error == nil {
		if profile.CurrentRole != "" || profile.TargetRole != "" {
			parts = append(parts, fmt.Sprintf("## User Profile\n- Current Role: %s\n- Target Role: %s\n- Tech Stack: %s",
				nvl(profile.CurrentRole, "Not set"),
				nvl(profile.TargetRole, "Not set"),
				nvlJSON(profile.MainStack)))
		}
	}

	// 2. Top capabilities (max 8, by score desc)
	var caps []model.CapabilityNode
	s.db.Where("user_id = ?", userID).Order("score DESC").Limit(8).Find(&caps)
	if len(caps) > 0 {
		var lines []string
		for _, c := range caps {
			lines = append(lines, fmt.Sprintf("- %s: %d/100 (%s)", c.Name, c.Score, c.Category))
		}
		parts = append(parts, "## Capability Profile\n"+strings.Join(lines, "\n"))
	}

	// 3. Relevant knowledge nodes
	// Strategy: keyword match from user query + recent nodes
	var knowledge []model.KnowledgeNode
	if userQuery != "" {
		// Try to find relevant nodes by title/summary keyword match
		likeQuery := "%" + truncate(userQuery, 30) + "%"
		s.db.Where("user_id = ? AND (title ILIKE ? OR summary ILIKE ? OR category ILIKE ?)",
			userID, likeQuery, likeQuery, likeQuery).
			Order("mastery_score DESC").Limit(5).Find(&knowledge)
	}
	// If no keyword matches, fall back to recent
	if len(knowledge) == 0 {
		s.db.Where("user_id = ?", userID).Order("updated_at DESC").Limit(5).Find(&knowledge)
	}
	if len(knowledge) > 0 {
		var lines []string
		for _, k := range knowledge {
			lines = append(lines, fmt.Sprintf("- %s (mastery: %d/100): %s", k.Title, k.MasteryScore, truncate(k.Summary, 80)))
		}
		parts = append(parts, "## Known Knowledge\n"+strings.Join(lines, "\n"))
	}

	// 4. Projects (max 3)
	var projects []model.ProjectNode
	s.db.Where("user_id = ?", userID).Order("updated_at DESC").Limit(3).Find(&projects)
	if len(projects) > 0 {
		var lines []string
		for _, p := range projects {
			desc := truncate(p.AISummary, 80)
			if desc == "" {
				desc = truncate(p.Background, 80)
			}
			lines = append(lines, fmt.Sprintf("- %s: %s", p.Name, desc))
		}
		parts = append(parts, "## User Projects\n"+strings.Join(lines, "\n"))
	}

	// 5. Latest reflection next_actions (actionable context)
	var latestReflection model.Reflection
	if s.db.Where("user_id = ?", userID).Order("created_at DESC").First(&latestReflection).Error == nil {
		if len(latestReflection.NextActions) > 4 { // not empty JSON
			parts = append(parts, fmt.Sprintf("## Last Reflection Next Actions\n%s", string(latestReflection.NextActions)))
		}
	}

	if len(parts) == 0 {
		return ""
	}

	result := "\n\n# User Context (from Second Brain — use this to personalize your response)\n\n" +
		strings.Join(parts, "\n\n")

	// Hard limit: keep context under ~2000 chars to avoid blowing up token limits
	if len([]rune(result)) > 2000 {
		result = string([]rune(result)[:2000]) + "\n\n(context truncated)"
	}
	return result
}

func nvl(s, fallback string) string {
	if s == "" {
		return fallback
	}
	return s
}

func nvlJSON(j model.JSON) string {
	s := string(j)
	if s == "" || s == "null" || s == "[]" {
		return "Not set"
	}
	return s
}

func truncate(s string, maxLen int) string {
	// Truncate by rune count for CJK safety
	runes := []rune(s)
	if len(runes) <= maxLen {
		return s
	}
	return string(runes[:maxLen]) + "..."
}
