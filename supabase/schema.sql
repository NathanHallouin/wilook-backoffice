-- ============================================================================
-- WILOOK Backoffice — database schema
-- Reconstructed from the application code (src/types, src/services, src/config).
-- Apply once on a fresh Supabase project (SQL Editor or psql).
-- Idempotent: safe to re-run.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------

-- Products
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  title       text not null,
  description text,
  category    text not null check (category in ('top','bottom','shoes','accessories','set')),
  type        text not null,
  condition   text not null check (condition in ('new','like_new','good','fair')),
  brand       text,
  provider    text,
  colors      text[] not null default '{}',
  materials   text[] not null default '{}',
  details     text[] not null default '{}',
  sizes       text[] not null default '{}',
  shoe_sizes  text[] not null default '{}',
  price       numeric not null,
  final_price numeric,
  images      text[] not null default '{}',
  thumbnail   text
);

-- Customer profiles (email is the primary key, per the app)
create table if not exists public.profiles (
  email              text primary key,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  first_name         text,
  last_name          text,
  budget             numeric,
  style_preferences  jsonb,
  sizes              jsonb,
  questionnaire_data jsonb
);

-- Looks (outfits): 5 product slots, each an FK to products.
-- Constraint names MUST match the PostgREST embed hints used in src/services/looks.ts
-- (e.g. products!looks_left_top_fkey).
create table if not exists public.looks (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  name         text,
  designer     text,
  universe     text,
  is_public    boolean not null default false,
  thumbnail    text,
  left_top     uuid constraint looks_left_top_fkey     references public.products(id) on delete set null,
  left_bottom  uuid constraint looks_left_bottom_fkey  references public.products(id) on delete set null,
  right_top    uuid constraint looks_right_top_fkey    references public.products(id) on delete set null,
  right_middle uuid constraint looks_right_middle_fkey references public.products(id) on delete set null,
  right_bottom uuid constraint looks_right_bottom_fkey references public.products(id) on delete set null
);

-- Junction: which customers a look is assigned to
create table if not exists public.looks_profiles (
  look_id       uuid not null references public.looks(id) on delete cascade,
  profile_email text not null references public.profiles(email) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (look_id, profile_email)
);

create index if not exists idx_looks_profiles_email on public.looks_profiles(profile_email);
create index if not exists idx_looks_profiles_look  on public.looks_profiles(look_id);
create index if not exists idx_products_category    on public.products(category);
create index if not exists idx_looks_is_public      on public.looks(is_public);

-- ----------------------------------------------------------------------------
-- View: distinct brands (queried as .from('brands').select('brand'))
-- ----------------------------------------------------------------------------
create or replace view public.brands as
  select distinct brand from public.products where brand is not null;

-- ----------------------------------------------------------------------------
-- RPC functions
-- ----------------------------------------------------------------------------

-- get_customers_with_stats(...): profiles + look stats, with optional
-- server-side search (email/first/last name) and sorting.
-- Signature changed (added params) → drop the old 2-arg version first.
drop function if exists public.get_customers_with_stats(int, int);
create or replace function public.get_customers_with_stats(
  page_number int,
  page_size   int,
  search      text default null,
  sort_column text default 'created_at',
  sort_dir    text default 'desc'
)
returns table (
  email              text,
  created_at         timestamptz,
  updated_at         timestamptz,
  first_name         text,
  last_name          text,
  budget             numeric,
  style_preferences  jsonb,
  sizes              jsonb,
  questionnaire_data jsonb,
  nb_looks           bigint,
  last_look_date     timestamptz
)
language sql
stable
as $$
  with base as (
    select
      p.email, p.created_at, p.updated_at, p.first_name, p.last_name,
      p.budget, p.style_preferences, p.sizes, p.questionnaire_data,
      count(lp.look_id) as nb_looks,
      max(l.created_at) as last_look_date
    from public.profiles p
    left join public.looks_profiles lp on lp.profile_email = p.email
    left join public.looks l          on l.id = lp.look_id
    where search is null or search = ''
       or p.email                 ilike '%' || search || '%'
       or coalesce(p.first_name, '') ilike '%' || search || '%'
       or coalesce(p.last_name, '')  ilike '%' || search || '%'
    group by p.email
  )
  select * from base
  order by
    case when sort_dir = 'asc'  and sort_column = 'email'          then email end asc,
    case when sort_dir = 'desc' and sort_column = 'email'          then email end desc,
    case when sort_dir = 'asc'  and sort_column = 'nb_looks'       then nb_looks end asc,
    case when sort_dir = 'desc' and sort_column = 'nb_looks'       then nb_looks end desc,
    case when sort_dir = 'asc'  and sort_column = 'last_look_date' then last_look_date end asc nulls last,
    case when sort_dir = 'desc' and sort_column = 'last_look_date' then last_look_date end desc nulls last,
    created_at desc
  limit greatest(page_size, 1)
  offset (greatest(page_number, 1) - 1) * greatest(page_size, 1);
$$;

-- get_unused_looks(): looks not assigned to any customer
create or replace function public.get_unused_looks()
returns setof public.looks
language sql
stable
as $$
  select l.*
  from public.looks l
  where not exists (
    select 1 from public.looks_profiles lp where lp.look_id = l.id
  )
  order by l.created_at desc;
$$;

-- ----------------------------------------------------------------------------
-- Storage buckets
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public) values
  ('products-images', 'products-images', true),
  ('looks-images',    'looks-images',    true),
  ('public-looks',    'public-looks',    true)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Row Level Security
--
-- The app authenticates staff via Supabase Auth (email + password). All access
-- is granted to the `authenticated` role only — signed-out (`anon`) requests
-- see nothing. Public product/look images stay readable because their buckets
-- are public (served via the public storage endpoint, which bypasses RLS).
--
-- To go further, replace `using (true)` with a staff allowlist / claim check.
-- ----------------------------------------------------------------------------
alter table public.products       enable row level security;
alter table public.profiles       enable row level security;
alter table public.looks          enable row level security;
alter table public.looks_profiles enable row level security;

do $$
declare t text;
begin
  foreach t in array array['products','profiles','looks','looks_profiles'] loop
    execute format('drop policy if exists "anon_all" on public.%I', t);
    execute format('drop policy if exists "auth_all" on public.%I', t);
    execute format(
      'create policy "auth_all" on public.%I for all to authenticated using (true) with check (true)',
      t
    );
  end loop;
end $$;

-- Storage policies: signed-in staff manage the app buckets
drop policy if exists "anon_storage_read"   on storage.objects;
drop policy if exists "anon_storage_write"  on storage.objects;
drop policy if exists "anon_storage_update" on storage.objects;
drop policy if exists "anon_storage_delete" on storage.objects;
drop policy if exists "auth_storage_read"   on storage.objects;
drop policy if exists "auth_storage_write"  on storage.objects;
drop policy if exists "auth_storage_update" on storage.objects;
drop policy if exists "auth_storage_delete" on storage.objects;

create policy "auth_storage_read" on storage.objects for select to authenticated
  using (bucket_id in ('products-images','looks-images','public-looks'));
create policy "auth_storage_write" on storage.objects for insert to authenticated
  with check (bucket_id in ('products-images','looks-images','public-looks'));
create policy "auth_storage_update" on storage.objects for update to authenticated
  using (bucket_id in ('products-images','looks-images','public-looks'));
create policy "auth_storage_delete" on storage.objects for delete to authenticated
  using (bucket_id in ('products-images','looks-images','public-looks'));
