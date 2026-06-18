package config

import (
	"os"
)

type Config struct {
	AppEnv     string
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	JWTSecret  string
	AIProvider string
	AIAPIKey   string
	AIBaseURL  string
	AIModel    string
	Port       string
}

func Load() *Config {
	return &Config{
		AppEnv:     getEnv("APP_ENV", "development"),
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("POSTGRES_USER", "mentor"),
		DBPassword: getEnv("POSTGRES_PASSWORD", ""),
		DBName:     getEnv("POSTGRES_DB", "mentor_os"),
		JWTSecret:  getEnv("JWT_SECRET", "dev-secret-change-me"),
		AIProvider: getEnv("AI_PROVIDER", "deepseek"),
		AIAPIKey:   getEnv("AI_API_KEY", ""),
		AIBaseURL:  getEnv("AI_BASE_URL", "https://api.deepseek.com"),
		AIModel:    getEnv("AI_MODEL", "deepseek-chat"),
		Port:       getEnv("PORT", "8080"),
	}
}

func (c *Config) IsProduction() bool {
	return c.AppEnv == "production"
}

func (c *Config) DSN() string {
	return "host=" + c.DBHost +
		" user=" + c.DBUser +
		" password=" + c.DBPassword +
		" dbname=" + c.DBName +
		" port=" + c.DBPort +
		" sslmode=disable"
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
