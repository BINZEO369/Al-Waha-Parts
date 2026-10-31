# Al Waha Parts data access model

The Supabase migration `enable_rls_and_access_policies` enables Row Level Security on all seven public tables.
The API uses the Supabase service role only on the server, so the service-role key must never be exposed to the
browser or prefixed with `NEXT_PUBLIC_`.

## Public user / visitor

Public visitors can see only active catalog data:

- `vehicles`: active vehicle fitment records.
- `parts_categories`: active categories.
- `parts`: active parts, pricing, stock, brand, SKU/OEM/part numbers and descriptions.
- `part_vehicles`: compatibility links where both the part and vehicle are active.

Public visitors cannot read `admins`, `bookings`, or `booking_items`. They submit a booking request through
`POST /api/v1/bookings`; the server validates and stores the request with its service-role connection.

## Authenticated admin

An authenticated Supabase user becomes an admin only when `public.admins.auth_user_id` matches the Auth user
and that row has `status = 'active'`. Active admins can read and manage all seven tables through the protected
admin endpoints and the admin dashboard.

Admin routes require `Authorization: Bearer <supabase_access_token>`:

- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/parts`
- `GET /api/v1/admin/bookings`
- `PATCH /api/v1/admin/bookings/:id`

## Role field

The `admins.role` field supports `super_admin`, `admin`, `manager`, and `staff`. The current baseline grants
all active admin roles the same table-level access. Fine-grained permissions by role should be the next security
milestone, especially before giving staff accounts destructive actions.
