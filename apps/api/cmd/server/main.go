package main

import (
	"log"

	"github.com/joho/godotenv"

	"mentor-os-api/internal/config"
	"mentor-os-api/internal/database"
	"mentor-os-api/internal/router"
)

func main() {
	// Load .env for local development (ignored if not present)
	_ = godotenv.Load()
	_ = godotenv.Load("../../.env") // monorepo root

	cfg := config.Load()

	db := database.Connect(cfg)

	// Run migrations
	if err := database.RunMigrations(db, "migrations"); err != nil {
		log.Printf("Warning: migration error: %v", err)
	}

	r := router.Setup(cfg, db)

	log.Printf("Mentor OS API starting on :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
