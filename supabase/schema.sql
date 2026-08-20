create extension if not exists vector;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.knowledge (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  content text not null,
  category text not null default 'General',
  source_url text,
  source_type text not null default 'manual',
  verified boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.knowledge_chunks (
  id bigserial primary key,
  knowledge_id uuid not null references public.knowledge(id) on delete cascade,
  chunk_text text not null,
  embedding vector(1536),
  created_at timestamptz not null default now()
);

create index if not exists knowledge_chunks_embedding_idx
on public.knowledge_chunks using hnsw (embedding vector_cosine_ops);

create or replace function public.match_knowledge(
  query_embedding vector(1536),
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
    and 1 - (c.embedding <=> query_embedding) > match_threshold
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

alter table public.projects enable row level security;
alter table public.knowledge enable row level security;
alter table public.knowledge_chunks enable row level security;

-- MVP dùng Service Role ở server API, vì vậy không mở policy public.
-- Khi thêm Supabase Auth ở Phase 2, tạo owner_id + RLS theo auth.uid().
