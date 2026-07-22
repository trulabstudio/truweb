-- EXAMPLE ONLY: do not execute this file directly as part of normal migrations.
-- Copy it into supabase/migrations/, rename the copy with a new timestamp,
-- keep these values synchronized with lib/types/lead.ts, then run that migration.

alter table public.leads
  drop constraint if exists leads_budget_check;

alter table public.leads
  add constraint leads_budget_check
  check (
    budget is null
    or budget in (
      'Below RM5,000',
      'RM5,000 - RM15,000',
      'RM15,000 - RM30,000',
      'RM30,000+'
    )
  );
