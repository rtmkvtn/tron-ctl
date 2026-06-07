# tron-ctl

Personal USDT TRC20 wallet manager — self-hosted, single-user.

## Prerequisites

- Docker + Docker Compose
- Node.js 22 + pnpm
- A VPS with Traefik already running (for production TLS)

## Local development

```bash
# 1. Copy env file and fill in values
cp .env.example .env

# 2. Start Postgres
docker compose -f docker-compose.dev.yml up -d

# 3. Install deps and start Next.js
pnpm install
pnpm prisma generate
pnpm dev
```

Health check: `curl http://localhost:3000/api/health`

## Production deploy

```bash
# 1. On the VPS, clone the repo
git clone https://github.com/rtmkvtn/tron-ctl && cd tron-ctl

# 2. Copy env and fill in all values including DOMAIN
cp .env.example .env

# 3. Start the stack (builds the image, starts app + db)
docker compose up --build -d
```

> The `traefik-public` Docker network must exist on the VPS before deploying.  
> DNS for `DOMAIN` must resolve to the VPS IP before a TLS cert is issued.

Health check: `curl https://${DOMAIN}/api/health`
