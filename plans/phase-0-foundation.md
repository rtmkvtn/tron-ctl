# Plan: Phase 0 — Foundation

> Source PRD: `prds/phase-0-foundation.md`

## Architectural decisions

- **Route**: `GET /api/health` → `{ status: "ok"|"degraded", network: string, db: "ok"|"error" }`; 200 if DB reachable, 503 if not
- **Runtime**: Next.js 15 App Router, `output: 'standalone'` in `next.config.ts`
- **DB client**: Prisma singleton in `lib/db.ts` — global var pattern to avoid connection exhaustion in dev
- **Logger**: pino singleton in `lib/logger.ts` — reads `LOG_LEVEL` env var
- **Env contract**: `TRON_NETWORK` (mainnet|nile|shasta), `DATABASE_URL`, `LOG_LEVEL`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `DOMAIN`
- **Compose split**: `docker-compose.yml` (production, app + db + Traefik labels) vs `docker-compose.dev.yml` (Postgres only, port 5432 exposed to host)

---

## Phase 1: Project skeleton

**User stories**: Developer can run `pnpm dev` locally and see a branded placeholder page confirming which TRON network is active.

### What to build

Bootstrap the repo with pnpm, Next.js 15 App Router, TypeScript strict mode, and Tailwind v4. Wire `TRON_NETWORK` from environment into a minimal placeholder page so the network is visible at a glance. No backend, no DB — just the frontend scaffolding every subsequent phase builds on.

Deliverables: `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `.gitignore`.

### Acceptance criteria

- [ ] `pnpm install && pnpm dev` starts without errors
- [ ] `http://localhost:3000` returns HTTP 200
- [ ] Placeholder page displays "tron-ctl", "Personal USDT TRC20 wallet manager", and a network chip reading the `TRON_NETWORK` env var (falls back to "unknown")
- [ ] TypeScript strict mode — `pnpm build` completes with zero type errors
- [ ] Tailwind v4 CSS builds without errors

---

## Phase 2: Health endpoint

**User stories**: Operator can hit `/api/health` to verify the app is running and the database is reachable — both locally and in production.

### What to build

Add the Prisma schema (datasource + generator, no models), the Prisma client singleton, the pino logger, and the `GET /api/health` route handler. On startup, log the active TRON network. The health route pings Postgres with `SELECT 1` and returns structured JSON reflecting DB reachability.

Deliverables: `prisma/schema.prisma`, `lib/db.ts`, `lib/logger.ts`, `app/api/health/route.ts`, startup log in `app/layout.tsx`.

### Acceptance criteria

- [ ] `GET /api/health` returns `{ status: "ok", network: "mainnet", db: "ok" }` with HTTP 200 when Postgres is reachable
- [ ] `GET /api/health` returns `{ status: "degraded", network: "...", db: "error" }` with HTTP 503 when Postgres is down
- [ ] App startup logs `{ network: "mainnet" }` at info level (visible in `pnpm dev` console)
- [ ] `LOG_LEVEL` env var controls pino log level
- [ ] `pnpm prisma generate` succeeds against the schema

---

## Phase 3: Docker stack

**User stories**: Operator can deploy the full production stack on the VPS with a single `docker compose up --build -d` and reach the health endpoint over HTTPS via Traefik.

### What to build

Add the multi-stage Dockerfile (Node 22-alpine, pnpm, standalone Next.js output), the production `docker-compose.yml` (app + Postgres + Traefik labels for `tron-ctl` router on `traefik-public` network), the dev `docker-compose.dev.yml` (Postgres only, port 5432 exposed), `.env.example`, and `README.md`.

Deliverables: `Dockerfile`, `docker-compose.yml`, `docker-compose.dev.yml`, `.env.example`, `README.md`.

### Acceptance criteria

- [ ] `docker compose up --build -d` starts both `app` and `db` containers cleanly
- [ ] App container waits for Postgres healthcheck before starting (`depends_on: condition: service_healthy`)
- [ ] `curl http://localhost:3000/api/health` → `{ "status": "ok", "network": "mainnet", "db": "ok" }` from within Docker stack
- [ ] `docker compose logs app` shows startup log with network name
- [ ] `docker compose -f docker-compose.dev.yml up -d` + `pnpm dev` → health endpoint reachable at `http://localhost:3000/api/health`
- [ ] `.env.example` documents all required env vars with inline descriptions
- [ ] Traefik labels present in `docker-compose.yml`: `tron-ctl` router, `websecure` entrypoint, `le` cert resolver, `traefik-public` network
- [ ] `README.md` covers: what it is, prerequisites, local dev workflow, production deploy workflow
