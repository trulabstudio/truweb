-- Run once in the Supabase SQL editor after the threads migration.
-- Replace YOUR_CRON_SECRET with the CRON_SECRET value set in Vercel.
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'threads-tick',
  '* * * * *',
  $$
  select net.http_get(
    url := 'https://www.trulabstudio.com/api/cron/threads',
    headers := jsonb_build_object('Authorization', 'Bearer YOUR_CRON_SECRET'),
    timeout_milliseconds := 300000
  );
  $$
);
