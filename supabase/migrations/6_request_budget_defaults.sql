set local search_path = public;

update settings
set value = '30'
where key = 'live_poll_active_interval_sec'
  and case
    when value ~ '^[0-9]+$' then value::integer < 30
    else true
  end;

insert into settings (key, value)
values ('live_poll_active_interval_sec', '30')
on conflict (key) do nothing;

insert into settings (key, value)
values ('schema_bootstrap_version', 'postgres-2026-08-28-request-budget-v1')
on conflict (key) do update set value = excluded.value;
