alter table public.leads
  drop constraint if exists leads_budget_check;

alter table public.leads
  add constraint leads_budget_check
  check (
    budget is null
    or budget in (
      'Solo — RM2,800',
      'Duo — RM4,200',
      'Panel — RM6,500',
      'Monthly Partnership',
      'Others',
      -- Retained for historical leads created before package selection launched.
      'Below RM5,000',
      'RM5,000 - RM15,000',
      'RM15,000 - RM30,000',
      'RM30,000+'
    )
  );
