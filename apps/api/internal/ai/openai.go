package ai

import (
	"context"
	"net/http"
)

// OpenAIProvider implements Provider using the OpenAI API.
type OpenAIProvider struct {
	apiKey  string
	baseURL string
	model   string
	client  *http.Client
}

func NewOpenAIProvider(apiKey, baseURL, model string) *OpenAIProvider {
	if baseURL == "" {
		baseURL = "https://api.openai.com"
	}
	if model == "" {
		model = "gpt-4o-mini"
	}
	return &OpenAIProvider{
		apiKey:  apiKey,
		baseURL: baseURL,
		model:   model,
		client:  &http.Client{},
	}
}

func (p *OpenAIProvider) Chat(ctx context.Context, messages []Message) (string, error) {
	return openAICompatibleChat(ctx, p.client, p.baseURL, p.apiKey, p.model, messages)
}
