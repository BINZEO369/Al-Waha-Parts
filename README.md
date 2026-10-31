# Al Waha Parts

SaaS-ready monorepo foundation for the Al Waha Parts automotive parts platform.

## Repository layout

- `apps/web` — customer-facing Next.js storefront.
- `apps/admin` — admin/operations Next.js dashboard shell.
- `apps/api` — Node.js + Fastify TypeScript API.
- `packages/shared` — shared domain types and API contracts.
- `packages/config` — shared TypeScript configuration.
- `database` — PostgreSQL schema, migrations, seed data, and functions.
- `infra` — local development services.
- `.github/workflows` — CI pipeline foundation.

## Prerequisites

Node.js 22+, pnpm 9+, Docker, and PostgreSQL client tools.

## Quick start

```bash
cp .env.example .env
pnpm install
pnpm db:up
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Web runs on `http://localhost:3000`, admin on `http://localhost:3001`, and API on `http://localhost:4000`.

## Environment strategy

Use `.env.example` as the baseline. Keep environment-specific values in deployment secret stores:
`development`, `staging`, and `production` should never share credentials. App-specific `.env.local`
files are ignored by Git.

## Scope of this phase

This commit intentionally provides only the platform foundation: structure, configuration, health/API
wiring, database baseline, and CI. Business workflows, authentication, catalog management, orders,
payments, and tenant features should be implemented in subsequent milestones.
