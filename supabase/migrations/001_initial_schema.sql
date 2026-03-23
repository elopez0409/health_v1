create extension if not exists "pgcrypto";

create type source_provider as enum ('apple_health', 'oura', 'strava', 'garmin', 'whoop', 'fitbit');
create type sync_status as enum ('pending', 'synced', 'error');
create type metric_category as enum ('sleep', 'recovery', 'activity', 'cardio', 'body', 'hydration', 'nutrition');
create type goal_category as enum ('performance', 'recovery', 'body', 'wellness');
create type goal_status as enum ('active', 'completed', 'paused');

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'HealthHub User',
  avatar_url text,
  onboarding_completed boolean not null default false,
  hydration_bottle_oz integer not null default 24,
  privacy_settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists connected_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  provider source_provider not null,
  auth_token_encrypted text,
  sync_status sync_status not null default 'pending',
  source_metadata jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists raw_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  source_id uuid references connected_sources(id) on delete set null,
  metric_type text not null,
  raw_value jsonb not null,
  recorded_at timestamptz not null,
  ingested_at timestamptz not null default timezone('utc', now())
);

create table if not exists normalized_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  date date not null,
  category metric_category not null,
  metric_name text not null,
  value numeric(10, 3) not null,
  unit text not null,
  source_id uuid references connected_sources(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, date, metric_name, source_id)
);

create table if not exists readiness_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  date date not null,
  score numeric(5, 2) not null check (score >= 0 and score <= 100),
  drivers jsonb not null default '[]'::jsonb,
  model_version text not null default 'v1.0.0',
  weights_used jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, date)
);

create table if not exists user_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  date date not null,
  feeling_score integer not null check (feeling_score between 1 and 10),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, date)
);

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  category goal_category not null,
  target_value numeric(10, 2),
  current_value numeric(10, 2) not null default 0,
  unit text,
  status goal_status not null default 'active',
  deadline date,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists dashboard_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade unique,
  card_order jsonb not null default '[]'::jsonb,
  pinned_charts jsonb not null default '[]'::jsonb,
  favorite_metrics jsonb not null default '[]'::jsonb,
  selected_views jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table profiles enable row level security;
alter table connected_sources enable row level security;
alter table raw_metrics enable row level security;
alter table normalized_metrics enable row level security;
alter table readiness_results enable row level security;
alter table user_feedback enable row level security;
alter table goals enable row level security;
alter table dashboard_preferences enable row level security;

create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);

create policy "connected_sources_owner_all" on connected_sources for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "raw_metrics_owner_all" on raw_metrics for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "normalized_metrics_owner_all" on normalized_metrics for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "readiness_results_owner_all" on readiness_results for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_feedback_owner_all" on user_feedback for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "goals_owner_all" on goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "dashboard_preferences_owner_all" on dashboard_preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
