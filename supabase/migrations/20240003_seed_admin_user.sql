insert into public.users (id, email, full_name, role, status)
values (
  '81930181-fabd-40ad-97dc-73b672990c49',
  'gabugozo@gmail.com',
  'Admin',
  'admin',
  'active'
)
on conflict (id) do update set role = 'admin', status = 'active';
