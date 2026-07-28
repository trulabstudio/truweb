-- EXAMPLE ONLY: do not execute this file as part of normal content editing.
--
-- New submissions store permanent package IDs in the existing `budget` column:
--   solo, duo, panel, monthly-partnership, others
--
-- Package names, prices, descriptions, features and form labels remain editable
-- in lib/EDIT-SITE-HERE.ts and do not require a database migration.
--
-- If a developer adds a genuinely new package ID, create a new timestamped
-- migration. Never rewrite a migration that may already have run in production.

alter table public.leads
  drop constraint if exists leads_budget_check;

alter table public.leads
  add constraint leads_budget_check
  check (
    budget is null
    or budget in (
      'solo',
      'duo',
      'panel',
      'monthly-partnership',
      'others',
      -- Historical values remain accepted for backward compatibility.
      'Solo — RM2,800',
      'Duo — RM4,200',
      'Panel — RM6,500',
      'Monthly Partnership',
      'Others',
      'Below RM5,000',
      'RM5,000 - RM15,000',
      'RM15,000 - RM30,000',
      'RM30,000+'
    )
  ) not valid;
