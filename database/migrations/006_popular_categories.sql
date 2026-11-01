create table if not exists public.popular_categories (
  category_id uuid primary key references public.parts_categories(id) on delete cascade,
  display_order integer not null default 0 check (display_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_popular_categories_active_order
  on public.popular_categories (is_active, display_order);

alter table public.popular_categories enable row level security;

-- Seed up to eight active, already-featured categories once; preserve future selections.
with defaults as (
  select id, row_number() over (order by sort_order, category_name) - 1 as display_order
  from public.parts_categories
  where status = 'active' and is_featured = true
  order by sort_order, category_name
  limit 8
)
insert into public.popular_categories (category_id, display_order, is_active)
select id, display_order::integer, true
from defaults
on conflict (category_id) do nothing;
