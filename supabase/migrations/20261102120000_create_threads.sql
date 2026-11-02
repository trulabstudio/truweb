create table if not exists public.threads_posts (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  text text not null check (char_length(text) between 1 and 500),
  stage text not null check (stage in ('attract', 'trust', 'offer')),
  topic text,
  status text not null check (status in ('draft', 'scheduled', 'container', 'publishing', 'published', 'failed')),
  scheduled_at timestamptz not null,
  container_id text,
  container_at timestamptz,
  external_id text unique,
  posted_at timestamptz,
  error text,
  views integer not null default 0,
  likes integer not null default 0,
  replies integer not null default 0,
  reposts integer not null default 0
);
create index if not exists threads_posts_status_idx on public.threads_posts (status, scheduled_at);

create table if not exists public.threads_replies (
  reply_id text primary key,
  created_at timestamptz not null default now(),
  post_id bigint not null references public.threads_posts (id) on delete cascade,
  status text not null check (status in ('pending', 'container', 'publishing', 'done', 'failed')),
  container_id text,
  container_at timestamptz,
  error text
);
create index if not exists threads_replies_status_idx on public.threads_replies (status);

create table if not exists public.threads_state (
  key text primary key,
  value text not null
);

alter table public.threads_posts enable row level security;
alter table public.threads_replies enable row level security;
alter table public.threads_state enable row level security;
revoke all on table public.threads_posts, public.threads_replies, public.threads_state from anon, authenticated;
grant all on table public.threads_posts, public.threads_replies, public.threads_state to service_role;

comment on table public.threads_posts is 'Threads post queue. Server-side service role access only.';
