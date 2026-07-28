-- Package names and prices are client-editable, so new leads store permanent
-- package IDs in the historical `budget` column. The column is intentionally
-- retained to preserve existing integrations and historical lead records.

do $migration$
declare
  budget_constraint record;
begin
  for budget_constraint in
    select constraint_name.conname
    from pg_constraint as constraint_name
    where constraint_name.conrelid = 'public.leads'::regclass
      and constraint_name.contype = 'c'
      and pg_get_constraintdef(constraint_name.oid) ilike '%budget%'
  loop
    execute format(
      'alter table public.leads drop constraint %I',
      budget_constraint.conname
    );
  end loop;
end
$migration$;

alter table public.leads
  add constraint leads_budget_check
  check (
    budget is null
    or budget in (
      -- Permanent IDs for all new submissions.
      'solo',
      'duo',
      'panel',
      'monthly-partnership',
      'others',

      -- Historical labels retained for records created before stable IDs.
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
