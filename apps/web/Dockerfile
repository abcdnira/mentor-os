# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder

WORKDIR /app

# 1. Install deps — cached unless package.json changes
COPY package.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install

# 2. Copy source
COPY . .

# 3. Build — cache .next/cache across builds (biggest speedup)
RUN --mount=type=cache,target=/app/.next/cache \
    npm run build

# --- Production image ---
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV BACKEND_URL=http://api:8080
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
