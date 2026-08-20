-- Second Brain v0.3 migration: chạy 1 lần trong Supabase SQL Editor.
alter table public.knowledge add column if not exists topic text;
alter table public.knowledge add column if not exists tags text[] not null default '{}'::text[];

create index if not exists knowledge_category_idx on public.knowledge(category);
create index if not exists knowledge_topic_idx on public.knowledge(topic);
create index if not exists knowledge_tags_gin_idx on public.knowledge using gin(tags);

create table if not exists public.brain_backups (
  id uuid primary key default gen_random_uuid(),
  label text not null default 'Manual backup',
  payload jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.brain_backups enable row level security;
