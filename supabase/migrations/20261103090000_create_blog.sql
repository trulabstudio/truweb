create table if not exists public.blog_posts (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 100),
  title text not null check (char_length(title) between 1 and 120),
  description text not null check (char_length(description) between 1 and 300),
  body text not null check (char_length(body) between 1 and 30000),
  keyword text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  updated_at timestamptz not null default now()
);
create index if not exists blog_posts_status_idx on public.blog_posts (status, published_at desc);

alter table public.blog_posts enable row level security;
revoke all on table public.blog_posts from anon, authenticated;
grant all on table public.blog_posts to service_role;

comment on table public.blog_posts is 'Malay blog articles. Drafts are written by Claude and published by the owner. Server-side service role access only.';
