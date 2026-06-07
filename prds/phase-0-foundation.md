# PRD — Phase 0: Foundation

**Parent plan**: `PLAN.md` § Phase 0  
**Status**: ready to implement  
**Exit criteria**: `docker compose up --build -d` on the VPS → `https://${DOMAIN}/api/health` returns `{"status":"ok","network":"mainnet","db":"ok"}` with HTTP 200; app startup logs the network name.

---

## Goal

Bootstrap an empty repo into a runnable Next.js 15 app behind Traefik with Postgres, matching the existing oil-payments infra patterns. No application logic, no design system, no wallet operations — just the foundation every subsequent phase builds on.

---

## Scope

### In scope
- `pnpm` workspace + Next.js 15 App Router + TypeScript (strict)
- Tailwind v4 (oxide) — config only, no custom tokens yet
- Prisma installed and configured — `schema.prisma` with datasource block, no models yet
- `docker-compose.yml` — production stack (app + postgres + Traefik labels)
- `docker-compose.dev.yml` — Postgres only, port 5432 exposed to host, for local dev
- Multi-stage `Dockerfile` (Node 22-alpine, pnpm, standalone Next.js output)
- `GET /api/health` — returns `{ status, network, db }`, pings Postgres
- pino logger — structured JSON, reads `LOG_LEVEL` env var
- `TRON_NETWORK` env var — read at startup, logged, exposed to health endpoint
- `.env.example` — documents all required env vars with descriptions
- `README.md` — minimal: what it is, local dev steps, production deploy steps

### Out of scope
- Any application UI beyond a minimal branded placeholder page
- TRON SDK wiring
- Prisma migrations or models
- CI/CD (Phase 11)
- Traefik itself (already running on VPS)
- Custom design tokens or component library (Phase 1)

---

## File structure

```
tron-ctl/
├── app/
│   ├── api/
│   │   └── health/
│   │       └── route.ts          # GET /api/health
│   ├── layout.tsx                # root layout — minimal, imports globals.css
│   ├── page.tsx                  # placeholder page
│   └── globals.css               # Tailwind v4 @import + bare resets
├── lib/
│   └── db.ts                     # Prisma client singleton
│   └── logger.ts                 # pino instance
├── prisma/
│   └── schema.prisma             # datasource + generator, no models yet
├── public/                       # empty
├── docker-compose.yml            # production
├── docker-compose.dev.yml        # local dev: postgres only
├── Dockerfile                    # multi-stage
├── .env.example
├── .gitignore
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts            # v4 — minimal
├── package.json
├── pnpm-lock.yaml
└── README.md
```

---

## Detailed requirements

### `docker-compose.yml` (production)

Matches oil-payments patterns exactly:

```yaml
services:
  app:
    build: .
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      TRON_NETWORK: ${TRON_NETWORK}
      LOG_LEVEL: ${LOG_LEVEL:-info}
    expose:
      - "3000"
    networks:
      - default
      - traefik-public
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=traefik-public"
      - "traefik.http.routers.tron-ctl.rule=Host(`${DOMAIN}`)"
      - "traefik.http.routers.tron-ctl.entrypoints=websecure"
      - "traefik.http.routers.tron-ctl.tls.certresolver=le"
      - "traefik.http.services.tron-ctl.loadbalancer.server.port=3000"

  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pg_data:

networks:
  traefik-public:
    external: true
```

### `docker-compose.dev.yml` (local dev)

Postgres only, port exposed to host so `pnpm dev` can reach it:

```yaml
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-tron}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-tron}
      POSTGRES_DB: ${POSTGRES_DB:-tron_ctl_dev}
    volumes:
      - pg_data_dev:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-tron} -d ${POSTGRES_DB:-tron_ctl_dev}"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pg_data_dev:
```

Local dev workflow:
```bash
docker compose -f docker-compose.dev.yml up -d   # start Postgres
pnpm dev                                          # start Next.js with hot reload
```

### `Dockerfile`

Multi-stage, pnpm, standalone Next.js output:

```dockerfile
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma generate
RUN pnpm build

FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

`next.config.ts` must set `output: 'standalone'`.

### `GET /api/health`

Route handler at `app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

export async function GET() {
  const network = process.env.TRON_NETWORK ?? 'unknown'
  
  let dbStatus: 'ok' | 'error' = 'error'
  try {
    await db.$queryRaw`SELECT 1`
    dbStatus = 'ok'
  } catch (err) {
    logger.error({ err }, 'health check db ping failed')
  }

  const status = dbStatus === 'ok' ? 'ok' : 'degraded'
  const code = status === 'ok' ? 200 : 503

  return NextResponse.json({ status, network, db: dbStatus }, { status: code })
}
```

Returns 200 when both network is set and db is reachable; 503 if db is down.

### `lib/logger.ts`

```typescript
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
})
```

### `lib/db.ts`

Prisma client singleton (standard Next.js pattern to avoid exhausting connections in dev):

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

### `prisma/schema.prisma`

No models yet — just datasource + generator:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Startup logging

`app/layout.tsx` or a server-side init module logs the network on startup:

```typescript
import { logger } from '@/lib/logger'
logger.info({ network: process.env.TRON_NETWORK }, 'tron-ctl starting')
```

### Placeholder page (`app/page.tsx`)

Minimal branded stub — dark background, "tron-ctl" brand mark, network chip. No design system yet; inline styles or bare Tailwind utilities only. Content:

```
tron-ctl
Personal USDT TRC20 wallet manager
● mainnet          ← reads TRON_NETWORK env var
```

No navigation, no layout shell yet — that's Phase 1.

### `.env.example`

```bash
# PostgreSQL
POSTGRES_USER=tron
POSTGRES_PASSWORD=changeme
POSTGRES_DB=tron_ctl_mainnet

# App
DATABASE_URL=postgresql://tron:changeme@db:5432/tron_ctl_mainnet
TRON_NETWORK=mainnet          # mainnet | nile | shasta
LOG_LEVEL=info                # trace | debug | info | warn | error

# Traefik
DOMAIN=wallet.yourdomain.com  # set once domain is registered
```

---

## Dependencies (install list)

```json
{
  "dependencies": {
    "next": "^15",
    "react": "^18",
    "react-dom": "^18",
    "@prisma/client": "^6",
    "pino": "^9"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^22",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "prisma": "^6",
    "tailwindcss": "^4",
    "@tailwindcss/postcss": "^4"
  }
}
```

---

## Test strategy

Phase 0 has no business logic to unit test. Verification is manual + integration:

1. **Local dev smoke test**
   - `docker compose -f docker-compose.dev.yml up -d`
   - `cp .env.example .env` → fill in dev values
   - `pnpm install && pnpm dev`
   - `curl http://localhost:3000/api/health` → `{"status":"ok","network":"mainnet","db":"ok"}`
   - Check console logs include network name at startup

2. **Docker production smoke test**
   - `docker compose up --build -d`
   - `curl http://localhost:3000/api/health` → same response
   - `docker compose logs app` → startup log with network name visible

3. **Traefik integration** (on VPS, once domain is set)
   - Set `DOMAIN` in `.env`, `docker compose up -d`
   - `curl https://${DOMAIN}/api/health` → 200 with valid JSON
   - TLS cert issued by Let's Encrypt

4. **DB-down degraded test**
   - `docker compose stop db`
   - `curl http://localhost:3000/api/health` → 503 with `{"status":"degraded","db":"error"}`

---

## README minimal content

- What tron-ctl is (one sentence)
- Prerequisites: Docker, Docker Compose, pnpm, Node 22
- Local dev: copy `.env.example`, start DB, run `pnpm dev`
- Production deploy: copy `.env.example`, fill in values including `DOMAIN`, `docker compose up --build -d`
- Note: domain must be configured in DNS before TLS cert is issued
