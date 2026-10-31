# Architecture foundation

The repository uses a pnpm workspace. Deployable applications live under `apps/`; reusable code lives
under `packages/`; database-owned assets live under `database/`.

The API exposes a versioned `/api/v1` namespace and a `/health` endpoint. Frontend applications call the
API through `NEXT_PUBLIC_API_URL`; the shared package defines stable request/response types so API and UI
contracts can evolve together.

PostgreSQL is the system of record. The baseline migration establishes UUID-backed tenants/users and
an auditable parts catalog boundary without implementing full SaaS workflows yet. Future migrations must
be additive and reversible where possible.

Security defaults: no secrets in source control, explicit CORS origins, parameterized SQL, validation at
API boundaries, least-privilege database roles in deployment, and CI checks on every pull request.
