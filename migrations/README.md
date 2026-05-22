# Database migrations

Numbered SQL files capturing every schema change made to the Supabase database. The current schema = the result of running every file in this folder in order.

## How to use

**When setting up a fresh Supabase project for a new deployment:**

1. Open the new Supabase project's SQL Editor
2. Paste and run each `*.sql` file in this folder, in numeric order
3. Done — schema matches the current app

**When making a schema change:**

1. Make the change in your local Supabase project via SQL Editor
2. Save the SQL you ran as the next numbered file (e.g., `003_add_tags.sql`)
3. Commit it with the code change that depends on it
4. Run the same SQL against any other deployments (e.g., the boss's Supabase project) before pushing the code

## Convention

- `001_initial.sql` — first migration, full schema
- `002_*.sql`, `003_*.sql`, etc. — incremental changes
- Use descriptive suffixes: `004_add_tags.sql`, `005_drop_unused_column.sql`
- Each file must be idempotent (use `if not exists`, `or replace`, etc.) so re-running is safe
