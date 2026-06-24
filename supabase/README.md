# Supabase

Database schema, migrations and seed data for the WILOOK backoffice.

```
supabase/
├── config.toml                              # CLI project config
├── migrations/
│   └── 20260620120000_initial_schema.sql    # full schema: tables, views, RPC, RLS, storage
├── seed.sql                                 # small demo dataset (mirrors the mock data)
├── seed_bulk.sql                            # optional: large generated dataset for load testing
└── functions/
    └── ai-suggestions/                      # Claude-powered clothing suggestions (Edge Function)
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

## Edge Functions

### `ai-suggestions` — Claude-powered clothing recommendations

Ranks catalogue products against a customer's questionnaire and composes a full
look, using Claude (`claude-opus-4-8`) with structured outputs. The app calls it
from the customer profile page; if Supabase or the function is unavailable, the
client falls back to a **local scoring engine** (`src/services/suggestions.ts`),
so the feature works in demo mode too — just without generative AI.

```bash
# Set the Anthropic API key as a function secret (server-side only — never shipped to the browser)
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

# Deploy
supabase functions deploy ai-suggestions

# Local testing
supabase functions serve ai-suggestions --env-file supabase/functions/.env.local
```

The function only returns product **ids** (plus scores/reasons); the client maps
them back to real products, so the model can never inject bogus catalogue data.

## Adding a change

Create a new timestamped file in `migrations/` (e.g.
`20260701090000_add_column.sql`) containing just the delta, then `supabase db
push`. Never edit an already-applied migration — add a new one.
