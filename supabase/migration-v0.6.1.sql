-- Second Brain v0.6.1 — Knowledge-first + Quick Notes
-- Chạy 1 lần trong Supabase SQL Editor.

-- Cho phép kiến thức chỉ có tiêu đề, không bắt buộc nội dung.
alter table public.knowledge alter column content set default '';

create table if not exists public.quick_notes (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  content text not null default '',
  remind_at timestamptz,
  is_done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists quick_notes_created_at_idx on public.quick_notes(created_at desc);
create index if not exists quick_notes_remind_at_idx on public.quick_notes(remind_at);
alter table public.quick_notes enable row level security;
