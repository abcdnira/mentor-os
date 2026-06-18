package database

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"runtime"
	"sort"
	"strings"

	"gorm.io/gorm"
)

// migrationDir resolves the migrations directory.
// It checks the given dir first; if empty, falls back to a path
// relative to this source file (works for `go run`).
func migrationDir(dir string) string {
	// 1. If the caller-specified dir exists, use it
	if info, err := os.Stat(dir); err == nil && info.IsDir() {
		return dir
	}

	// 2. Fallback: resolve relative to this source file
	//    (handles `go run ./cmd/server/` from any working directory)
	_, filename, _, ok := runtime.Caller(0)
	if ok {
		candidate := filepath.Join(filepath.Dir(filename), "..", "..", "migrations")
		if info, err := os.Stat(candidate); err == nil && info.IsDir() {
			return candidate
		}
	}

	return dir
}

// RunMigrations executes SQL migration files from the given directory.
// It tracks applied migrations in a schema_migrations table.
func RunMigrations(db *gorm.DB, dir string) error {
	dir = migrationDir(dir)
	log.Printf("Migration dir: %s", dir)

	// Create migrations tracking table
	if err := db.Exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
		version VARCHAR(255) PRIMARY KEY,
		applied_at TIMESTAMP DEFAULT NOW()
	)`).Error; err != nil {
		return fmt.Errorf("create schema_migrations table: %w", err)
	}

	pattern := filepath.Join(dir, "*.up.sql")
	files, err := filepath.Glob(pattern)
	if err != nil {
		return fmt.Errorf("glob migrations: %w", err)
	}
	if len(files) == 0 {
		return fmt.Errorf("no migration files found in %s (glob: %s)", dir, pattern)
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
