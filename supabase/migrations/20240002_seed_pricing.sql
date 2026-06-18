-- ─────────────────────────────────────────────────────────────────────────────
-- LOADLY — Seed Data
-- Run after migrations to set up default pricing and admin user
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Default pricing rules ───────────────────────────────────────────────────
-- Prices in USD — adjust before launch

insert into public.pricing_rules
  (vehicle_category, base_fee, per_km_rate, per_minute_rate, loading_fee, platform_fee_percent, cancellation_fee)
values
  ('pickup_van',  5.00,  0.80, 0.05,  3.00, 10.00, 2.00),
  ('truck_1t',    8.00,  1.10, 0.07,  5.00, 10.00, 3.00),
  ('truck_3t',   12.00,  1.50, 0.10,  8.00, 10.00, 5.00),
  ('truck_5t',   18.00,  1.90, 0.12, 12.00, 10.00, 8.00),
  ('lorry',      30.00,  2.50, 0.15, 20.00, 10.00,15.00);

-- ─── Default helper pricing ──────────────────────────────────────────────────

insert into public.helper_pricing (per_helper_base_fee, per_helper_per_hour)
values (5.00, 3.00);

-- ─── Note on admin user ──────────────────────────────────────────────────────
-- Admin user must be created via Supabase Dashboard → Authentication → Users
-- Then run this UPDATE replacing the UUID with the actual admin user's auth.uid():
--
-- update public.users set role = 'admin' where id = '<admin-user-uuid>';
--
-- Or insert directly after creating auth user:
-- insert into public.users (id, email, full_name, role)
-- values ('<uuid>', 'admin@loadly.com', 'Loadly Admin', 'admin');
