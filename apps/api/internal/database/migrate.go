package database

import (
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"gorm.io/gorm"
)

// RunMigrations executes SQL migration files from the given directory.
// It tracks applied migrations in a schema_migrations table.
func RunMigrations(db *gorm.DB, dir string) error {
	// Create migrations tracking table
	db.Exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
		version VARCHAR(255) PRIMARY KEY,
		applied_at TIMESTAMP DEFAULT NOW()
	)`)

	files, err := filepath.Glob(filepath.Join(dir, "*.up.sql"))
	if err != nil {
		return err
	}
	sort.Strings(files)

	for _, f := range files {
		version := strings.TrimSuffix(filepath.Base(f), ".up.sql")

		var count int64
		db.Raw("SELECT COUNT(*) FROM schema_migrations WHERE version = ?", version).Scan(&count)
		if count > 0 {
			continue
		}

		log.Printf("Applying migration: %s", version)
		sql, err := os.ReadFile(f)
		if err != nil {
			return err
		}

		if err := db.Exec(string(sql)).Error; err != nil {
			return err
		}

		db.Exec("INSERT INTO schema_migrations (version) VALUES (?)", version)
		log.Printf("Applied migration: %s", version)
	}

	return nil
}
