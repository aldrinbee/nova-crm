-- NOVA initial schema
-- Run on a fresh Supabase project to set up all tables, RLS policies, and triggers.
-- Idempotent: safe to re-run.

-- =====================================================================
-- TABLES
-- =====================================================================

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text check (type in ('company','government','ngo','military')),
  country text,
  website text,
  sector text,
  created_at timestamptz default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text check (type in ('conference','trade_mission','bilateral','dinner','other')),
  location text,
  country text,
  start_date date,
  end_date date,
  notes text,
  created_at timestamptz default now()
);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  job_title text,
  organization_id uuid references organizations(id) on delete set null,
  country text,
  linkedin_url text,
  photo_url text,
  priority text not null default 'warm' check (priority in ('hot','warm','cold')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists interactions (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references contacts(id) on delete cascade,
  event_id uuid references events(id) on delete set null,
  type text not null check (type in ('met_in_person','call','email','other')),
  date date not null,
  summary text,
  outcome text,
  created_at timestamptz default now()
);

create table if not exists follow_ups (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references contacts(id) on delete cascade,
  interaction_id uuid references interactions(id) on delete set null,
  due_date date not null,
  description text not null,
  status text not null default 'pending' check (status in ('pending','done','snoozed')),
  priority text not null default 'warm' check (priority in ('hot','warm','cold')),
  created_at timestamptz default now()
);

create table if not exists contact_events (
  contact_id uuid not null references contacts(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  role text,
  notes text,
  primary key (contact_id, event_id)
);

-- =====================================================================
-- TRIGGERS
-- =====================================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists contacts_updated_at on contacts;
create trigger contacts_updated_at
before update on contacts
for each row execute function update_updated_at();

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================

alter table organizations enable row level security;
alter table events enable row level security;
alter table contacts enable row level security;
alter table interactions enable row level security;
alter table follow_ups enable row level security;
alter table contact_events enable row level security;

drop policy if exists "authenticated access" on organizations;
drop policy if exists "authenticated access" on events;
drop policy if exists "authenticated access" on contacts;
drop policy if exists "authenticated access" on interactions;
drop policy if exists "authenticated access" on follow_ups;
drop policy if exists "authenticated access" on contact_events;

create policy "authenticated access" on organizations for all to authenticated using (true) with check (true);
create policy "authenticated access" on events       for all to authenticated using (true) with check (true);
create policy "authenticated access" on contacts     for all to authenticated using (true) with check (true);
create policy "authenticated access" on interactions for all to authenticated using (true) with check (true);
create policy "authenticated access" on follow_ups   for all to authenticated using (true) with check (true);
create policy "authenticated access" on contact_events for all to authenticated using (true) with check (true);
