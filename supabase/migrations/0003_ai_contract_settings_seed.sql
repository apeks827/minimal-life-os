create extension if not exists vector;

alter table inbox_items add column if not exists attempts integer not null default 0;
alter table inbox_items add column if not exists last_error text;
alter table inbox_items add column if not exists next_retry_at timestamptz;

alter table inbox_items add column if not exists idempotency_key text;
create unique index if not exists inbox_items_user_idempotency_idx on inbox_items(user_id, idempotency_key) where idempotency_key is not null;
create index if not exists inbox_items_user_status_retry_idx on inbox_items(user_id, status, next_retry_at);
create index if not exists tasks_user_due_idx on tasks(user_id, due_at);
create index if not exists goals_user_area_idx on goals(user_id, area);
create index if not exists habits_user_active_idx on habits(user_id, recurrence);
create index if not exists events_user_starts_idx on events(user_id, starts_at);
create index if not exists memories_user_created_idx on memories(user_id, created_at);

alter table settings add column if not exists advanced jsonb not null default '{}'::jsonb;

create table if not exists ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  action text not null,
  life_area text,
  source text not null default 'system',
  accepted_at timestamptz,
  dismissed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists ai_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  tags jsonb not null default '[]'::jsonb,
  embedding vector(1536),
  created_at timestamptz not null default now()
);

create or replace view user_settings as select * from settings;
create or replace view calendar_events as select * from events;

alter table ai_suggestions enable row level security;
alter table ai_memories enable row level security;

create policy "ai_suggestions_all_own" on ai_suggestions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ai_memories_all_own" on ai_memories for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists ai_suggestions_user_state_idx on ai_suggestions(user_id, accepted_at, dismissed_at);
create index if not exists ai_memories_user_created_idx on ai_memories(user_id, created_at);
