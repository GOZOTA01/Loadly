-- ─────────────────────────────────────────────────────────────────────────────
-- Admin RLS policies — lets logged-in admin users access all operational data
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

-- users
create policy "users: admin read all" on public.users
  for select using (public.is_admin());

create policy "users: admin update all" on public.users
  for update using (public.is_admin());

-- driver_profiles
create policy "driver_profiles: admin all" on public.driver_profiles
  for all using (public.is_admin());

-- vehicles
create policy "vehicles: admin all" on public.vehicles
  for all using (public.is_admin());

-- bookings
create policy "bookings: admin all" on public.bookings
  for all using (public.is_admin());

-- booking_photos
create policy "booking_photos: admin all" on public.booking_photos
  for all using (public.is_admin());

-- booking_status_history
create policy "booking_status_history: admin read" on public.booking_status_history
  for select using (public.is_admin());

create policy "booking_status_history: admin insert" on public.booking_status_history
  for insert with check (public.is_admin());

-- ratings
create policy "ratings: admin read" on public.ratings
  for select using (public.is_admin());

-- driver_earnings
create policy "driver_earnings: admin all" on public.driver_earnings
  for all using (public.is_admin());

-- pricing_rules — admin can read inactive rules too
create policy "pricing_rules: admin all" on public.pricing_rules
  for all using (public.is_admin());

-- helper_pricing
create policy "helper_pricing: admin all" on public.helper_pricing
  for all using (public.is_admin());
