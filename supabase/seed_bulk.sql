-- ============================================================================
-- WILOOK Backoffice — BULK test data generator
-- ----------------------------------------------------------------------------
-- Generates a large, varied dataset for load / UX testing: pagination,
-- infinite scroll, filters, search. Run in the Supabase SQL Editor AFTER
-- schema.sql (the editor runs as a superuser, so RLS does not block inserts).
--
-- Volumes: edit the three generate_series(1, N) calls below.
--   products  : 500
--   customers : 200
--   looks     : 120
--
-- All generated rows are tagged so they can be removed without touching the
-- demo seed:
--   products  -> description starts with 'BULK '
--   customers -> email ends with '@bulk.test'
--   looks     -> name starts with 'BULK '
-- Run the CLEANUP block at the bottom to wipe just the generated data.
--
-- Images use picsum.photos (stable per seed url), so cards render real images.
-- Vocabulary is kept in sync with src/config/formValues.ts.
--
-- NOTE on the (g-g) / (g is not null) terms below: they reference the outer
-- generate_series row `g`, which forces Postgres to re-evaluate each random()
-- pick PER ROW. Without that correlation, an uncorrelated sub-select/LATERAL is
-- evaluated once and every generated row comes out identical.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) PRODUCTS
-- ---------------------------------------------------------------------------
with vocab as (
  select
    array['Basics','DenimBrand','SportStyle','Maison Lou','Atelier 9','Vesto','Norden','Brume','Faune','Cèdre'] as brands,
    array['FashionCo','JeansCo','ShoesCo','TextilePro','EuroModa','NordSupply'] as providers,
    array['Parme','Noir','Orange','Marine','Gris','Anthracite','Vert','Beige','Bleu','Rose','Blanc','Rouge','Kaki','Jaune','Marron','Camel','Bordeaux','Taupe'] as colors,
    array['Coton','Laine','Cachemire','Cuir','Lin','Daim','Nylon','Polyester','Jean','Velours','Soie'] as materials,
    array['Uni','Fleuri','Carreaux','Jacquard','Tweed','Rayure','Satin','Broderie','Animal Print','Velours','Logo'] as details,
    array['36','38','40','42','44','46','48','50','Taille Unique'] as clothing_sizes,
    array['36','37','38','39','40','41','42','43','44','45'] as shoe_sizes
),
cat_types(cat, label, types) as (
  values
    ('top','Haut',         array['Veste','Sweat','Top','Blouse/Chemise','Pull/Maille','Manteau','Cardigan']),
    ('bottom','Bas',       array['Jean','Jupe','Short','Pantalon']),
    ('shoes','Chaussures', array['Bottes','Boots','Escarpin','Basket','Sandale','Mocassin']),
    ('accessories','Accessoire', array['Cabas','Ceinture','Foulard','Sac à main','Bijoux','Chapeau/Bonnet/Gants','Lunettes']),
    ('set','Ensemble',     array['Combinaison','Robe','Ensemble'])
)
insert into public.products
  (title, description, category, type, condition, brand, provider,
   colors, materials, details, sizes, shoe_sizes, price, final_price, images, thumbnail)
select
  ct.label || ' ' || ct.type || ' #' || g,
  'BULK produit de test ' || g,
  ct.cat,
  ct.type,
  (array['new','like_new','good','fair'])[1 + floor(random() * 4)::int],
  v.brands[1 + floor(random() * cardinality(v.brands))::int],
  v.providers[1 + floor(random() * cardinality(v.providers))::int],
  col.vals,
  mat.vals,
  det.vals,
  case when ct.cat = 'shoes' then '{}'::text[] else clo.vals end,
  case when ct.cat = 'shoes' then sho.vals else '{}'::text[] end,
  pr.price,
  case when random() < 0.3 then round((pr.price * (0.5 + random() * 0.35))::numeric, 2) else null end,
  array[
    'https://picsum.photos/seed/wilook-' || g || 'a/600/800',
    'https://picsum.photos/seed/wilook-' || g || 'b/600/800',
    'https://picsum.photos/seed/wilook-' || g || 'c/600/800'
  ],
  'https://picsum.photos/seed/wilook-' || g || 'a/600/800'
from generate_series(1, 500) g
cross join vocab v
-- one random category (+ a type from it) per product
cross join lateral (
  select cat, label, types, types[1 + floor(random() * cardinality(types))::int] as type
  from cat_types
  order by random() + (g - g)
  limit 1
) ct
-- 1..3 colors, 1..2 materials, 1..2 details, sizes / shoe sizes per product
cross join lateral (
  select array_agg(distinct x) as vals
  from (select v.colors[1 + floor(random() * cardinality(v.colors))::int] as x
        from generate_series(1, (g - g) + 1 + floor(random() * 3)::int)) s
) col
cross join lateral (
  select array_agg(distinct x) as vals
  from (select v.materials[1 + floor(random() * cardinality(v.materials))::int] as x
        from generate_series(1, (g - g) + 1 + floor(random() * 2)::int)) s
) mat
cross join lateral (
  select array_agg(distinct x) as vals
  from (select v.details[1 + floor(random() * cardinality(v.details))::int] as x
        from generate_series(1, (g - g) + 1 + floor(random() * 2)::int)) s
) det
cross join lateral (
  select array_agg(distinct x) as vals
  from (select v.clothing_sizes[1 + floor(random() * cardinality(v.clothing_sizes))::int] as x
        from generate_series(1, (g - g) + 2 + floor(random() * 3)::int)) s
) clo
cross join lateral (
  select array_agg(distinct x) as vals
  from (select v.shoe_sizes[1 + floor(random() * cardinality(v.shoe_sizes))::int] as x
        from generate_series(1, (g - g) + 2 + floor(random() * 4)::int)) s
) sho
cross join lateral (select round((15 + random() * 285 + (g - g))::numeric, 2) as price) pr;

-- ---------------------------------------------------------------------------
-- 2) CUSTOMERS (profiles)
-- ---------------------------------------------------------------------------
insert into public.profiles
  (email, first_name, last_name, budget, style_preferences, sizes, questionnaire_data)
select
  'client' || g || '@bulk.test',
  fn.v,
  ln.v,
  (array[300, 500, 800, 1000, 1500, 2000, 3000])[1 + floor(random() * 7)::int],
  jsonb_build_object(
    'styles', to_jsonb((array['Casual','Chic','Business','Sport','Bohème','Minimaliste'])[1 + floor(random() * 6)::int]),
    'colors', to_jsonb((array['Noir','Bleu','Beige','Blanc','Rouge','Vert'])[1 + floor(random() * 6)::int])
  ),
  jsonb_build_object(
    'top',    (array['36','38','40','42','44'])[1 + floor(random() * 5)::int],
    'bottom', (array['36','38','40','42','44'])[1 + floor(random() * 5)::int],
    'shoes',  (array['37','38','39','40','41','42'])[1 + floor(random() * 6)::int]
  ),
  null
from generate_series(1, 200) g
cross join lateral (
  select (array['Emma','Louis','Léa','Hugo','Chloé','Tom','Inès','Jules','Manon','Nathan',
               'Alice','Lucas','Camille','Théo','Sarah','Adam','Jade','Paul','Lina','Gabriel'])
         [1 + floor(random() * 20 + (g - g))::int] as v
) fn
cross join lateral (
  select (array['Martin','Bernard','Dubois','Thomas','Robert','Petit','Durand','Leroy',
               'Moreau','Simon','Laurent','Lefebvre','Michel','Garcia','Roux','Fontaine'])
         [1 + floor(random() * 16 + (g - g))::int] as v
) ln
on conflict (email) do nothing;

-- ---------------------------------------------------------------------------
-- 3) LOOKS — each slot references a category-appropriate random product
-- ---------------------------------------------------------------------------
insert into public.looks
  (name, designer, universe, is_public, left_top, left_bottom, right_top, right_middle, right_bottom)
select
  'BULK Look #' || g,
  (array['Marie','Léa','Inès','Tom','Hugo','Chloé','Studio Lou','Atelier N'])[1 + floor(random() * 8)::int],
  (array['Casual','Chic','Business','Soirée','Week-end','Sport','Vacances'])[1 + floor(random() * 7)::int],
  random() < 0.5,
  (select id from public.products where category in ('top','set') order by random() + (g - g) limit 1),
  (select id from public.products where category = 'bottom'       order by random() + (g - g) limit 1),
  (select id from public.products where category = 'top'          order by random() + (g - g) limit 1),
  (select id from public.products where category = 'accessories'  order by random() + (g - g) limit 1),
  (select id from public.products where category = 'shoes'        order by random() + (g - g) limit 1)
from generate_series(1, 120) g;

-- Give each generated look a thumbnail from its left_top product.
update public.looks l
set thumbnail = p.thumbnail
from public.products p
where l.name like 'BULK %' and l.thumbnail is null and l.left_top = p.id;

-- ---------------------------------------------------------------------------
-- 4) ASSIGN looks to customers (1..4 random customers per look)
-- ---------------------------------------------------------------------------
insert into public.looks_profiles (look_id, profile_email)
select distinct l.id, c.email
from public.looks l
cross join lateral (
  select email from public.profiles
  where email like '%@bulk.test' and (l.id is not null)
  order by random()
  limit (1 + floor(random() * 4)::int)
) c
where l.name like 'BULK %'
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Quick check
-- ---------------------------------------------------------------------------
-- select
--   (select count(*) from public.products  where description like 'BULK %') as products,
--   (select count(*) from public.profiles  where email like '%@bulk.test') as customers,
--   (select count(*) from public.looks     where name like 'BULK %')        as looks,
--   (select count(*) from public.looks_profiles lp join public.looks l on l.id = lp.look_id
--      where l.name like 'BULK %')                                          as assignments;

-- ============================================================================
-- CLEANUP — removes ONLY the generated bulk data (run on its own when done)
-- ============================================================================
-- delete from public.looks_profiles
--   where look_id in (select id from public.looks where name like 'BULK %');
-- delete from public.looks    where name like 'BULK %';
-- delete from public.products where description like 'BULK %';
-- delete from public.profiles where email like '%@bulk.test';
