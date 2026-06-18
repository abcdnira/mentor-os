package ai

import (
	"fmt"
	"strings"

	"mentor-os-api/internal/config"
)

// NewProvider creates a Provider based on the config.
// Supported: "deepseek", "openai".
func NewProvider(cfg *config.Config) (Provider, error) {
	switch strings.ToLower(cfg.AIProvider) {
	case "deepseek":
		return NewDeepSeekProvider(cfg.AIAPIKey, cfg.AIBaseURL, cfg.AIModel), nil
	case "openai":
		return NewOpenAIProvider(cfg.AIAPIKey, cfg.AIBaseURL, cfg.AIModel), nil
	default:
		return nil, fmt.Errorf("unsupported AI provider: %s", cfg.AIProvider)
	}
}
