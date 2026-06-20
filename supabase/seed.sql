-- ============================================================================
-- WILOOK Backoffice — sample seed data (optional)
-- Mirrors the demo-mode mock data. Run after schema.sql. Safe to re-run.
-- ============================================================================

-- Products (fixed UUIDs so looks can reference them)
insert into public.products
  (id, title, description, category, type, condition, brand, provider,
   colors, materials, details, sizes, shoe_sizes, price, final_price, images, thumbnail)
values
  ('11111111-1111-1111-1111-111111111111', 'T-shirt Basic Noir', 'T-shirt en coton bio',
   'top', 'T-shirt', 'new', 'Basics', 'FashionCo',
   '{Noir}', '{Coton}', '{"Col rond"}', '{S,M,L,XL}', '{}', 29.99, null, '{}', null),
  ('22222222-2222-2222-2222-222222222222', 'Jean Slim Bleu', 'Jean slim fit en denim',
   'bottom', 'Jean', 'new', 'DenimBrand', 'JeansCo',
   '{Bleu}', '{Denim,Coton}', '{"Slim fit","5 poches"}', '{38,40,42,44}', '{}', 89.99, 69.99, '{}', null),
  ('33333333-3333-3333-3333-333333333333', 'Sneakers Blanches', 'Sneakers en cuir blanc',
   'shoes', 'Sneakers', 'new', 'SportStyle', 'ShoesCo',
   '{Blanc}', '{Cuir}', '{"Semelle caoutchouc"}', '{}', '{40,41,42,43,44}', 129.99, null, '{}', null)
on conflict (id) do nothing;

-- Profiles
insert into public.profiles
  (email, first_name, last_name, budget, style_preferences, sizes, questionnaire_data)
values
  ('john@example.com', 'John', 'Doe', 500,
   '{"styles":["Casual","Sport"],"colors":["Noir","Bleu"]}', '{"top":"M","bottom":"40","shoes":"42"}', null),
  ('jane@example.com', 'Jane', 'Smith', 800,
   '{"styles":["Chic","Business"],"colors":["Beige","Blanc"]}', '{"top":"S","bottom":"36","shoes":"38"}', null)
on conflict (email) do nothing;

-- Look
insert into public.looks
  (id, name, designer, universe, is_public, left_top, left_bottom, right_bottom)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Casual Friday', 'Marie', 'Casual', true,
   '11111111-1111-1111-1111-111111111111',
   '22222222-2222-2222-2222-222222222222',
   '33333333-3333-3333-3333-333333333333')
on conflict (id) do nothing;

-- Assign the look to both customers
insert into public.looks_profiles (look_id, profile_email) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'john@example.com'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'jane@example.com')
on conflict do nothing;
