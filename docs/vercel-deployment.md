# Vercel deployment

## Projects

Create three Vercel projects from this repository: `apps/web`, `apps/admin`, and `apps/api`. Set each
project's Root Directory to its app directory. The API project uses `apps/api/vercel.json` and exposes
`/health` plus `/api/v1/*`.

## API project variables

Add these in Vercel Project Settings → Environment Variables for Preview, Staging, and Production as
appropriate:

- `NODE_ENV` — `production` in Production.
- `CORS_ORIGINS` — comma-separated deployed web and admin URLs.
- `SUPABASE_URL` — Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service-role key; server-only, never use `NEXT_PUBLIC_`.

## Web and admin variables

- `NEXT_PUBLIC_API_URL` — deployed API URL, for example `https://al-waha-parts-api.vercel.app`.

Do not commit real `.env` values. After deployment, verify `GET /health`, `GET /api/v1/categories`, and
submit a test booking from a non-production environment.

## Endpoint map

Public: `GET /health`, `GET /api/v1`, `GET /api/v1/categories`, `GET /api/v1/vehicles`,
`GET /api/v1/parts`, `POST /api/v1/bookings`.

Admin bearer-token routes: `GET /api/v1/admin/dashboard`, `GET /api/v1/admin/bookings`,
`PATCH /api/v1/admin/bookings/:id`, `GET /api/v1/admin/parts`. The token must be a Supabase Auth access
token and its user must have an active row in `public.admins`.

## Initial page map

Customer web: `/`, `/catalog`, `/vehicles`, `/booking`, `/contact`, `/login`, `/account`.
Admin panel: `/`, `/dashboard`, `/parts`, `/vehicles`, `/categories`, `/bookings`, `/admins`, `/settings`, `/login`.
These are intentionally basic route shells; business UI is the next milestone.
