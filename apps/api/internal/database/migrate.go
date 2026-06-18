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
func migrationDir(dir string) string {
	if info, err := os.Stat(dir); err == nil && info.IsDir() {
		return dir
	}

	// Fallback: resolve relative to this source file (for `go run`)
	_, filename, _, ok := runtime.Caller(0)
	if ok {
		candidate := filepath.Join(filepath.Dir(filename), "..", "..", "migrations")
		if info, err := os.Stat(candidate); err == nil && info.IsDir() {
			return candidate
		}
	}

	return dir
}

// splitStatements splits a SQL file into individual statements by semicolons.
// It respects dollar-quoted strings ($$...$$) and single-quoted strings.
func splitStatements(sql string) []string {
	var stmts []string
	var buf strings.Builder
	i := 0
	n := len(sql)

	for i < n {
		ch := sql[i]

		// Skip single-quoted strings
		if ch == '\'' {
			buf.WriteByte(ch)
			i++
			for i < n {
				if sql[i] == '\'' {
					buf.WriteByte(sql[i])
					i++
					if i < n && sql[i] == '\'' {
						// escaped quote ''
						buf.WriteByte(sql[i])
						i++
						continue
					}
					break
				}
				buf.WriteByte(sql[i])
				i++
			}
			continue
		}

		// Skip dollar-quoted strings ($$...$$)
		if ch == '$' && i+1 < n && sql[i+1] == '$' {
			buf.WriteString("$$")
			i += 2
			for i+1 < n {
				if sql[i] == '$' && sql[i+1] == '$' {
					buf.WriteString("$$")
					i += 2
					break
				}
				buf.WriteByte(sql[i])
				i++
			}
			continue
		}

		// Skip -- line comments
		if ch == '-' && i+1 < n && sql[i+1] == '-' {
			for i < n && sql[i] != '\n' {
				i++
			}
			continue
		}

		// Statement terminator
		if ch == ';' {
			stmt := strings.TrimSpace(buf.String())
			if stmt != "" {
				stmts = append(stmts, stmt)
			}
			buf.Reset()
			i++
			continue
		}

		buf.WriteByte(ch)
		i++
	}

	// Trailing statement without semicolon
	if stmt := strings.TrimSpace(buf.String()); stmt != "" {
		stmts = append(stmts, stmt)
	}

	return stmts
}

// RunMigrations executes SQL migration files from the given directory.
// Each file is split into individual statements and executed one by one.
func RunMigrations(db *gorm.DB, dir string) error {
	dir = migrationDir(dir)
	log.Printf("Migration dir: %s", dir)

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
			log.Printf("Migration already applied: %s", version)
			continue
		}

		log.Printf("Applying migration: %s", version)
		raw, err := os.ReadFile(f)
		if err != nil {
			return fmt.Errorf("read %s: %w", f, err)
		}

		stmts := splitStatements(string(raw))
		for idx, stmt := range stmts {
			if err := db.Exec(stmt).Error; err != nil {
				return fmt.Errorf("migration %s statement #%d failed: %w\nSQL: %s", version, idx+1, err, stmt)
			}
		}

		if err := db.Exec("INSERT INTO schema_migrations (version) VALUES (?)", version).Error; err != nil {
			return fmt.Errorf("record migration %s: %w", version, err)
		}
		log.Printf("Applied migration: %s (%d statements)", version, len(stmts))
	}

	return nil
}
