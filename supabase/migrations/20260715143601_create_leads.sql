create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 100),
  company text check (company is null or char_length(company) <= 120),
  email text not null check (char_length(email) <= 254),
  phone text not null check (char_length(phone) between 1 and 30),
  budget text check (budget is null or budget in ('Below RM5,000', 'RM5,000 - RM15,000', 'RM15,000 - RM30,000', 'RM30,000+')),
  message text not null check (char_length(message) between 1 and 2000),
  source text not null default 'website',
  user_agent text check (user_agent is null or char_length(user_agent) <= 500)
);

alter table public.leads enable row level security;
revoke all on table public.leads from anon, authenticated;
grant insert, select on table public.leads to service_role;

comment on table public.leads is 'Private website enquiries. Server-side service role access only.';
create index if not exists leads_created_at_idx on public.leads (created_at desc);
