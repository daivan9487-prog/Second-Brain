-- Second Brain v0.6.2 — Accounts, Admin, per-user data
-- Chạy SAU migration-v0.6.1.sql trong Supabase SQL Editor.

create table if not exists public.second_brain_users (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  username_norm text not null unique,
  password_hash text not null,
  password_salt text not null,
  phone text,
  role text not null default 'user' check (role in ('admin','user')),
  is_locked boolean not null default false,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists second_brain_users_role_idx on public.second_brain_users(role);
create index if not exists second_brain_users_locked_idx on public.second_brain_users(is_locked);
alter table public.second_brain_users enable row level security;

alter table public.knowledge add column if not exists user_id uuid references public.second_brain_users(id) on delete cascade;
alter table public.quick_notes add column if not exists user_id uuid references public.second_brain_users(id) on delete cascade;
alter table public.brain_backups add column if not exists user_id uuid references public.second_brain_users(id) on delete cascade;
alter table public.projects add column if not exists user_id uuid references public.second_brain_users(id) on delete cascade;
create index if not exists knowledge_user_created_idx on public.knowledge(user_id,created_at desc);
create index if not exists quick_notes_user_created_idx on public.quick_notes(user_id,created_at desc);
create index if not exists brain_backups_user_created_idx on public.brain_backups(user_id,created_at desc);
create index if not exists projects_user_idx on public.projects(user_id);

create or replace function public.match_knowledge_user(
  query_embedding vector(1536),
  p_user_id uuid,
  match_threshold float default 0.2,
  match_count int default 8
)
returns table (
  id uuid,
  title text,
  category text,
  chunk_text text,
  similarity float
)
language sql stable
as $$
  select k.id, k.title, k.category, c.chunk_text,
         1 - (c.embedding <=> query_embedding) as similarity
  from public.knowledge_chunks c
  join public.knowledge k on k.id = c.knowledge_id
  where c.embedding is not null
    and k.user_id = p_user_id
    and 1 - (c.embedding <=> query_embedding) > match_threshold
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

-- Admin mặc định KHÔNG lưu mật khẩu thô trong SQL.
-- Lần đầu đăng nhập bằng Admin / 123, server sẽ tự tạo tài khoản Admin
-- bằng scrypt hash + salt, sau đó gán dữ liệu cũ chưa có user_id cho Admin.
