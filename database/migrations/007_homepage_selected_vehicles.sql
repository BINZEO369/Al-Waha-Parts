create table if not exists public.homepage_selected_vehicles (
  vehicle_id uuid primary key references public.vehicles(id) on delete cascade,
  display_order integer not null default 0 check (display_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_homepage_selected_vehicles_active_order
  on public.homepage_selected_vehicles (is_active, display_order);

alter table public.homepage_selected_vehicles enable row level security;

-- Seed up to 200 active, already-featured vehicles once; preserve future selections.
with defaults as (
  select id, row_number() over (order by sort_order, manufacturer_name, model_name) - 1 as display_order
  from public.vehicles
  where status = 'active' and is_featured = true
  order by sort_order, manufacturer_name, model_name
  limit 200
)
insert into public.homepage_selected_vehicles (vehicle_id, display_order, is_active)
select id, display_order::integer, true
from defaults
on conflict (vehicle_id) do nothing;
