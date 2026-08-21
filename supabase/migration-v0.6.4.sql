-- Second Brain v0.6.4 — AI Vault theo từng tài khoản
-- Chạy SAU migration-v0.6.2.sql
create table if not exists public.second_brain_ai_accounts (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.second_brain_users(id) on delete cascade,
 provider text not null,
 name text not null,
 api_key_encrypted text not null,
 key_last4 text,
 model text not null,
 base_url text,
 priority int not null default 100,
 enabled boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists second_brain_ai_accounts_user_priority_idx on public.second_brain_ai_accounts(user_id,priority);
alter table public.second_brain_ai_accounts enable row level security;

create table if not exists public.second_brain_ai_preferences (
 user_id uuid primary key references public.second_brain_users(id) on delete cascade,
 active_account text not null default 'auto',
 auto_rotate boolean not null default true,
 updated_at timestamptz not null default now()
);
alter table public.second_brain_ai_preferences enable row level security;
