FROM golang:1.23-alpine AS builder

WORKDIR /app

RUN cat > go.mod <<'GOMOD'
module mentor-os-api

go 1.23
GOMOD

RUN cat > main.go <<'GO'
package main

import (
	"encoding/json"
	"log"
	"net/http"
)

func main() {
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewEncoder(w).Encode(map[string]string{
			"status": "ok",
			"service": "mentor-os-api",
		})
	})

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewEncoder(w).Encode(map[string]string{
			"message": "Mentor OS API is running",
		})
	})

	log.Println("Mentor OS API listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
GO

RUN go build -o server .

FROM alpine:3.20

WORKDIR /app

COPY --from=builder /app/server /app/server

EXPOSE 8080

CMD ["/app/server"]
