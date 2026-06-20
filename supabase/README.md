# Supabase

Database schema, migrations and seed data for the WILOOK backoffice.

```
supabase/
├── config.toml                              # CLI project config
├── migrations/
│   └── 20260620120000_initial_schema.sql    # full schema: tables, views, RPC, RLS, storage
├── seed.sql                                 # small demo dataset (mirrors the mock data)
└── seed_bulk.sql                            # optional: large generated dataset for load testing
```

## Applying the schema

The migration files are plain SQL, so you have two equivalent options.

### A. Supabase CLI (versioned, reproducible — recommended)

```bash
supabase link --project-ref erpmvjoqcgibojttzqdp
supabase db push          # applies every file in migrations/ not yet applied
```

Local development against a throwaway database:

```bash
supabase start            # local stack
supabase db reset         # recreate DB, run all migrations, then seed.sql
```

### B. SQL Editor (manual)

Paste the contents of `migrations/20260620120000_initial_schema.sql` into the
Supabase SQL Editor and run it. It is idempotent (safe to re-run).

## Seeding

- `seed.sql` — a few demo rows. With the CLI it runs automatically on
  `supabase db reset` (see `config.toml`).
- `seed_bulk.sql` — generates ~500 products / 200 customers / 120 looks with
  placeholder images, for pagination / filter / load testing. Run it manually in
  the SQL Editor (or via `psql`). A commented CLEANUP block at the bottom removes
  only the generated rows.

## Adding a change

Create a new timestamped file in `migrations/` (e.g.
`20260701090000_add_column.sql`) containing just the delta, then `supabase db
push`. Never edit an already-applied migration — add a new one.
