alter table public.threads_replies
  add column if not exists kind text not null default 'keyword' check (kind in ('self', 'keyword', 'conversation', 'ignored')),
  add column if not exists comment_text text,
  add column if not exists reply_text text,
  add column if not exists reply_to text,
  add column if not exists username text;

alter table public.threads_replies drop constraint if exists threads_replies_status_check;
alter table public.threads_replies add constraint threads_replies_status_check
  check (status in ('pending', 'container', 'publishing', 'done', 'failed', 'ignored'));
