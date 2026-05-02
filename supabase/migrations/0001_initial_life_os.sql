create extension if not exists "pgcrypto";
create extension if not exists "vector";

create type locale as enum ('ru', 'en');
create type inbox_status as enum ('pending', 'classified', 'needs_clarification', 'failed');
create type entity_type as enum ('task', 'goal', 'habit', 'note', 'event', 'memory');
create type priority as enum ('low', 'medium', 'high');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  locale locale not null default 'ru',
  created_at timestamptz not null default now()
);

create table settings (
  user_id uuid primary key references profiles(id) on delete cascade,
  ai_enabled boolean not null default true,
  ai_tone text not null default 'gentle',
  daily_plan_hour integer not null default 8,
  week_starts_on text not null default 'monday'
);

create table onboarding_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  answers jsonb not null,
  created_at timestamptz not null default now()
);

create table inbox_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  raw_text text not null,
  status inbox_status not null default 'pending',
  classification jsonb,
  retryable boolean not null default false,
  created_at timestamptz not null default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  inbox_item_id uuid references inbox_items(id),
  title text not null,
  priority priority not null default 'medium',
  due_at timestamptz,
  completed_at timestamptz
);

create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  area text,
  target_date date
);

create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  recurrence text not null default 'daily',
  active boolean not null default true
);

create table habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits(id) on delete cascade,
  logged_on date not null,
  value integer not null default 1,
  unique (habit_id, logged_on)
);

create table life_areas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  key text not null,
  label text not null,
  unique (user_id, key)
);

create table balance_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  area_key text not null,
  score integer not null check (score between 1 and 10),
  scored_on date not null
);

create table suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  text text not null,
  source text not null default 'system',
  dismissed_at timestamptz
);

create table memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  tags jsonb not null default '[]'::jsonb,
  embedding vector(1536)
);

create table events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  starts_at timestamptz,
  ends_at timestamptz
);

create table daily_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  plan_date date not null,
  items jsonb not null default '[]'::jsonb,
  unique (user_id, plan_date)
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  channel text not null,
  payload jsonb not null,
  sent_at timestamptz
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table settings enable row level security;
alter table onboarding_answers enable row level security;
alter table inbox_items enable row level security;
alter table tasks enable row level security;
alter table goals enable row level security;
alter table habits enable row level security;
alter table habit_logs enable row level security;
alter table life_areas enable row level security;
alter table balance_scores enable row level security;
alter table suggestions enable row level security;
alter table memories enable row level security;
alter table events enable row level security;
alter table daily_plans enable row level security;
alter table notifications enable row level security;
alter table audit_logs enable row level security;
