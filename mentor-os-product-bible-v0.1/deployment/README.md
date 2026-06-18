# Deployment Guide

## 1. Recommended MVP Deployment

Use one overseas lightweight server.

Recommended configuration:

- 2 Core CPU
- 4GB RAM
- 60GB SSD
- Ubuntu 22.04 / 24.04

## 2. Why Overseas Server

For MVP:

- no ICP filing
- easier AI API access
- faster iteration
- lower operational friction

Recommended regions:

- Hong Kong
- Singapore
- Japan
- US

## 3. Cloud Provider

Beginner friendly:

- Tencent Cloud Lighthouse overseas
- Alibaba Cloud overseas lightweight server

Cheaper but less beginner friendly:

- Hetzner
- Vultr
- DigitalOcean
- Linode

## 4. Services

Run everything with Docker Compose:

```text
mentor-web
mentor-api
mentor-postgres
mentor-nginx
```

MVP does not require Redis.

## 5. Domain

User should prepare:

- domain
- DNS access
- server IP
- SSH access
- AI API key

## 6. Deployment Steps

```bash
# 1. install docker
sudo apt update
sudo apt install -y docker.io docker-compose-plugin

# 2. clone repo
git clone <repo-url> mentor-os
cd mentor-os

# 3. configure env
cp .env.example .env
vim .env

# 4. start services
docker compose up -d

# 5. configure nginx
# 6. enable https
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 7. Backup

At minimum:

```bash
pg_dump mentor_os > backup.sql
```

Later:

- daily backup
- object storage backup
- encrypted backup
