package ai

import "context"

// Provider is the unified interface for all AI model backends.
// Business code must only depend on this interface.
type Provider interface {
	Chat(ctx context.Context, messages []Message) (string, error)
}

// Message represents a single chat message sent to the AI model.
type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}
