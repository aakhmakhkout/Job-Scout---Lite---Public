-- JobScout Lite — Supabase schema (Step 2)
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: every statement is guarded with IF NOT EXISTS / DROP-then-CREATE.

-- ─────────────────────────────────────────────────────────────
-- 1. profiles — one row per user, created automatically on signup
-- ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  telegram_chat_id text,               -- for the notification step (later)
  recovery_key text unique,            -- used for the no-email password reset flow
  created_at timestamptz default now()
);

-- Safe to re-run on an already-existing profiles table (e.g. if you ran
-- schema.sql back in Step 2 before this column existed).
alter table public.profiles add column if not exists recovery_key text unique;

alter table public.profiles enable row level security;

drop policy if exists "profiles: select own" on public.profiles;
create policy "profiles: select own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user is created, so the
-- app never has to remember to do it client-side (keeps this bulletproof
-- and free — no extra function invocations beyond the trigger itself).
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- 2. saved_jobs — jobs a user bookmarked, with optional notes
--    (job data is a lightweight snapshot, not a foreign key into the
--    SQLite job cache — the two databases stay fully decoupled)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_apply_url text not null,
  job_title text,
  job_company text,
  job_location text,
  notes text,
  created_at timestamptz default now(),
  unique (user_id, job_apply_url)
);

alter table public.saved_jobs enable row level security;

drop policy if exists "saved_jobs: owner all" on public.saved_jobs;
create policy "saved_jobs: owner all"
  on public.saved_jobs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists saved_jobs_user_id_idx on public.saved_jobs(user_id);

-- ─────────────────────────────────────────────────────────────
-- 3. applications — the application tracker
-- ─────────────────────────────────────────────────────────────
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_title text not null,
  company text not null,
  apply_url text,
  applied_date date,
  status text not null default 'Saved'
    check (status in ('Saved', 'Applied', 'Interview', 'Offer', 'Rejected')),
  notes text,
  interview_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.applications enable row level security;

drop policy if exists "applications: owner all" on public.applications;
create policy "applications: owner all"
  on public.applications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists applications_user_id_idx on public.applications(user_id);
create index if not exists applications_interview_date_idx on public.applications(interview_date);

-- Keep updated_at current on every edit.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
  before update on public.applications
  for each row execute procedure public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 4. blocked_companies — per-user company blocklist
-- ─────────────────────────────────────────────────────────────
create table if not exists public.blocked_companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_name text not null,
  created_at timestamptz default now(),
  unique (user_id, company_name)
);

alter table public.blocked_companies enable row level security;

drop policy if exists "blocked_companies: owner all" on public.blocked_companies;
create policy "blocked_companies: owner all"
  on public.blocked_companies for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists blocked_companies_user_id_idx on public.blocked_companies(user_id);

-- ─────────────────────────────────────────────────────────────
-- 5. Admin Import System (Step 12, Phase 1: schema + auth only —
--    the upload/review UI is Phase 2, not built yet)
--
--    Architecture note: admin auth is COMPLETELY SEPARATE from the
--    Supabase Auth used by regular users above. There is no admin
--    signup flow, no Supabase session for admins, and admin_users has
--    no foreign key into auth.users. See lib/adminAuth/ for the actual
--    session mechanism (HMAC-signed cookies, not Supabase).
--
--    RLS note: every table below has RLS enabled with ZERO policies —
--    intentional default-deny. Nothing is reachable through the
--    anon/public key at all; every read or write from the app goes
--    through lib/supabase/admin.js (the service-role client), which
--    bypasses RLS entirely. This is deliberate: these tables are never
--    touched by end users, only by the isolated admin auth layer, so
--    there's no "owner" concept for a policy to express.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,     -- scrypt, see lib/adminAuth/password.js
  recovery_key text unique,        -- stored for a future admin-recovery
                                    -- flow — not built yet in Phase 1,
                                    -- see PROGRESS.md backlog
  created_at timestamptz default now()
);

alter table public.admin_users enable row level security;
-- No policies — see RLS note above.

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,               -- e.g. "WhatsApp — Bangalore Tech",
                                     -- "Telegram — Remote India Jobs"
  created_at timestamptz default now()
);

alter table public.sources enable row level security;

create table if not exists public.imports (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.sources(id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'reviewed')),
  total_items int not null default 0,
  approved_count int not null default 0,
  rejected_count int not null default 0,
  uploaded_at timestamptz default now()
);

alter table public.imports enable row level security;
create index if not exists imports_source_id_idx on public.imports(source_id);
create index if not exists imports_status_idx on public.imports(status);

-- Canonical table for admin-approved listings. Created before
-- import_items below (which references it via duplicate_of) even
-- though it's conceptually "downstream" — Postgres needs the target of
-- a foreign key to already exist. Deliberately shaped to match
-- cache/jobs.json's field names (see scraper/cache_writer.py) so that
-- merging scraper jobs + admin jobs on the public Jobs/Internships
-- pages later is a data-source change, not a shape change — same
-- principle the original mock-data-to-real-data swap followed.
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  location text,
  apply_url text not null unique,
  description text,
  job_type text not null default 'Job'
    check (job_type in ('Job', 'Internship')),
  trust_score int not null default 0,
  trust_reasons jsonb default '[]'::jsonb,
  posted_at timestamptz,
  import_item_id uuid,              -- FK added below, after import_items exists
  created_at timestamptz default now()
);

alter table public.jobs enable row level security;
create index if not exists jobs_apply_url_idx on public.jobs(apply_url);
create index if not exists jobs_posted_at_idx on public.jobs(posted_at);

-- Added in Step 18, safe to re-run on an existing table. See
-- scraper/trust_scoring.py's module docstring for the full reasoning —
-- short version: 'Suspicious' now means an actual red flag fired, not
-- just a low score, so it needs to be stored explicitly rather than
-- re-derived from trust_score alone everywhere it's displayed.
alter table public.jobs add column if not exists trust_tier text default 'Unverified';

-- ─────────────────────────────────────────────────────────────
-- 6. Login rate limiting (Step 13)
--
--    Why a table instead of an in-memory counter: this app runs on
--    Vercel's free tier, where every API route is a serverless
--    function — there's no guarantee two consecutive requests hit the
--    same running instance, so an in-memory Map would silently reset
--    and fail to actually rate-limit anything in production. A table
--    persists correctly across invocations. Shared by both the admin
--    login (max 3 attempts) and regular user login (max 5 attempts) —
--    same mechanism, different scope/threshold, see lib/rateLimit.js.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.login_attempts (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('admin', 'user')),
  identifier text not null,          -- lowercased email
  failed_count int not null default 0,
  locked_until timestamptz,
  updated_at timestamptz default now(),
  unique (scope, identifier)
);

alter table public.login_attempts enable row level security;
-- No policies — only ever touched via the service-role client (same
-- pattern as admin_users/sources/imports/import_items/jobs above).
-- This isn't user-owned data, so there's no "owner" for a normal RLS
-- policy to check against.

create table if not exists public.import_items (
  id uuid primary key default gen_random_uuid(),
  import_id uuid not null references public.imports(id) on delete cascade,
  raw_payload jsonb not null,       -- the job exactly as uploaded, before
                                     -- any normalization — kept so a bad
                                     -- approve/reject decision can always
                                     -- be traced back to the source data
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'duplicate')),
  duplicate_of uuid references public.jobs(id) on delete set null,
  reviewer_notes text,
  created_at timestamptz default now()
);

alter table public.import_items enable row level security;
create index if not exists import_items_import_id_idx on public.import_items(import_id);
create index if not exists import_items_status_idx on public.import_items(status);

-- Added in Step 14 (Phase 2), safe to re-run on an existing table.
alter table public.import_items add column if not exists validation_errors jsonb default '[]'::jsonb;

-- Now that import_items exists, wire up jobs.import_item_id's FK.
-- Guarded so re-running this whole script is still safe.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'jobs_import_item_id_fkey'
  ) then
    alter table public.jobs
      add constraint jobs_import_item_id_fkey
      foreign key (import_item_id) references public.import_items(id)
      on delete set null;
  end if;
end $$;
