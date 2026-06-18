-- ─────────────────────────────────────────────────────────────────────────────
-- LOADLY — Initial Schema
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID generation
create extension if not exists "uuid-ossp";
create extension if not exists "postgis"; -- for future geo queries

-- ─── Enums ───────────────────────────────────────────────────────────────────

create type user_role as enum ('customer', 'driver', 'admin');
create type vehicle_category as enum ('pickup_van', 'truck_1t', 'truck_3t', 'truck_5t', 'lorry');
create type approval_status as enum ('pending', 'approved', 'rejected');
create type booking_status as enum (
  'pending', 'assigned', 'driver_en_route', 'arrived_pickup',
  'loading', 'in_transit', 'arrived_dropoff', 'unloading',
  'delivered', 'completed', 'cancelled'
);
create type payment_status as enum ('pending', 'authorized', 'captured', 'refunded', 'failed');
create type goods_type as enum (
  'furniture', 'appliances', 'building_materials', 'boxes_general',
  'office_equipment', 'tiles_flooring', 'bricks_blocks', 'other'
);
create type payout_status as enum ('pending', 'paid');

-- ─── Users ───────────────────────────────────────────────────────────────────

create table public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null unique,
  phone        text,
  full_name    text not null,
  role         user_role not null default 'customer',
  avatar_url   text,
  status       text not null default 'active' check (status in ('active', 'suspended')),
  created_at   timestamptz not null default now()
);

alter table public.users enable row level security;

-- Users can read and update their own row; admin reads all
create policy "users: own row read" on public.users
  for select using (auth.uid() = id);
create policy "users: own row update" on public.users
  for update using (auth.uid() = id);
create policy "users: insert own" on public.users
  for insert with check (auth.uid() = id);

-- ─── Driver profiles ─────────────────────────────────────────────────────────

create table public.driver_profiles (
  user_id             uuid primary key references public.users(id) on delete cascade,
  license_number      text not null,
  license_expiry      date not null,
  license_doc_url     text,
  approval_status     approval_status not null default 'pending',
  rejection_reason    text,
  is_online           boolean not null default false,
  current_lat         double precision,
  current_lng         double precision,
  last_location_at    timestamptz,
  created_at          timestamptz not null default now()
);

alter table public.driver_profiles enable row level security;

create policy "driver_profiles: own row" on public.driver_profiles
  for all using (auth.uid() = user_id);

-- ─── Vehicles ────────────────────────────────────────────────────────────────

create table public.vehicles (
  id                      uuid primary key default uuid_generate_v4(),
  driver_id               uuid not null references public.users(id) on delete cascade,
  category                vehicle_category not null,
  make                    text not null,
  model                   text not null,
  year                    int not null,
  plate_number            text not null,
  max_weight_kg           int not null,
  color                   text not null default '',
  insurance_doc_url       text,
  registration_doc_url    text,
  photos                  text[] not null default '{}',
  approval_status         approval_status not null default 'pending',
  is_active               boolean not null default true,
  created_at              timestamptz not null default now()
);

alter table public.vehicles enable row level security;

create policy "vehicles: driver owns" on public.vehicles
  for all using (auth.uid() = driver_id);

-- ─── Pricing rules ───────────────────────────────────────────────────────────

create table public.pricing_rules (
  id                      uuid primary key default uuid_generate_v4(),
  vehicle_category        vehicle_category not null,
  base_fee                numeric(10,2) not null,
  per_km_rate             numeric(10,2) not null,
  per_minute_rate         numeric(10,4) not null default 0,
  loading_fee             numeric(10,2) not null default 0,
  platform_fee_percent    numeric(5,2) not null default 10,
  cancellation_fee        numeric(10,2) not null default 0,
  effective_from          timestamptz not null default now(),
  is_active               boolean not null default true,
  created_at              timestamptz not null default now()
);

alter table public.pricing_rules enable row level security;

-- Everyone can read active pricing (needed for estimate)
create policy "pricing_rules: public read" on public.pricing_rules
  for select using (is_active = true);

-- ─── Helper pricing ──────────────────────────────────────────────────────────

create table public.helper_pricing (
  id                      uuid primary key default uuid_generate_v4(),
  per_helper_base_fee     numeric(10,2) not null,
  per_helper_per_hour     numeric(10,2) not null default 0,
  effective_from          timestamptz not null default now(),
  created_at              timestamptz not null default now()
);

alter table public.helper_pricing enable row level security;

create policy "helper_pricing: public read" on public.helper_pricing
  for select using (true);

-- ─── Bookings ────────────────────────────────────────────────────────────────

create table public.bookings (
  id                          uuid primary key default uuid_generate_v4(),
  customer_id                 uuid not null references public.users(id),
  driver_id                   uuid references public.users(id),
  vehicle_id                  uuid references public.vehicles(id),
  vehicle_category            vehicle_category not null,
  status                      booking_status not null default 'pending',
  goods_type                  goods_type not null,
  goods_description           text,
  helper_count                int not null default 0 check (helper_count >= 0),
  pickup_address              text not null,
  pickup_lat                  double precision not null,
  pickup_lng                  double precision not null,
  dropoff_address             text not null,
  dropoff_lat                 double precision not null,
  dropoff_lng                 double precision not null,
  scheduled_at                timestamptz,
  is_immediate                boolean not null default true,
  distance_km                 numeric(8,2),
  estimated_duration_min      int,
  subtotal                    numeric(10,2),
  platform_fee                numeric(10,2),
  total_amount                numeric(10,2),
  currency                    text not null default 'USD',
  payment_status              payment_status not null default 'pending',
  stripe_payment_intent_id    text,
  created_at                  timestamptz not null default now(),
  completed_at                timestamptz
);

alter table public.bookings enable row level security;

create policy "bookings: customer owns" on public.bookings
  for all using (auth.uid() = customer_id);

create policy "bookings: driver sees assigned" on public.bookings
  for select using (auth.uid() = driver_id);

create policy "bookings: driver sees pending" on public.bookings
  for select using (
    status = 'pending'
    and exists (
      select 1 from public.driver_profiles dp
      where dp.user_id = auth.uid()
      and dp.is_online = true
      and dp.approval_status = 'approved'
    )
  );

create policy "bookings: driver updates own" on public.bookings
  for update using (auth.uid() = driver_id);

-- Indexes
create index bookings_status_idx on public.bookings(status);
create index bookings_customer_idx on public.bookings(customer_id);
create index bookings_driver_idx on public.bookings(driver_id);
create index bookings_created_idx on public.bookings(created_at desc);

-- ─── Booking photos ──────────────────────────────────────────────────────────

create table public.booking_photos (
  id          uuid primary key default uuid_generate_v4(),
  booking_id  uuid not null references public.bookings(id) on delete cascade,
  url         text not null,
  type        text not null check (type in ('load', 'proof_of_delivery')),
  created_at  timestamptz not null default now()
);

alter table public.booking_photos enable row level security;

create policy "booking_photos: booking participant" on public.booking_photos
  for all using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id
      and (b.customer_id = auth.uid() or b.driver_id = auth.uid())
    )
  );

-- ─── Booking status history ──────────────────────────────────────────────────

create table public.booking_status_history (
  id          uuid primary key default uuid_generate_v4(),
  booking_id  uuid not null references public.bookings(id) on delete cascade,
  status      booking_status not null,
  changed_by  uuid not null references public.users(id),
  note        text,
  created_at  timestamptz not null default now()
);

alter table public.booking_status_history enable row level security;

create policy "booking_status_history: participant read" on public.booking_status_history
  for select using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id
      and (b.customer_id = auth.uid() or b.driver_id = auth.uid())
    )
  );

-- Auto-insert status history on booking status change
create or replace function log_booking_status()
returns trigger language plpgsql as $$
begin
  if new.status <> old.status then
    insert into public.booking_status_history(booking_id, status, changed_by)
    values (new.id, new.status, coalesce(auth.uid(), new.driver_id, new.customer_id));
  end if;
  return new;
end;
$$;

create trigger on_booking_status_change
  after update on public.bookings
  for each row execute function log_booking_status();

-- ─── Ratings ─────────────────────────────────────────────────────────────────

create table public.ratings (
  id          uuid primary key default uuid_generate_v4(),
  booking_id  uuid not null unique references public.bookings(id),
  customer_id uuid not null references public.users(id),
  driver_id   uuid not null references public.users(id),
  score       int not null check (score between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now()
);

alter table public.ratings enable row level security;

create policy "ratings: customer inserts own" on public.ratings
  for insert with check (auth.uid() = customer_id);

create policy "ratings: driver reads own" on public.ratings
  for select using (auth.uid() = driver_id or auth.uid() = customer_id);

-- ─── Driver earnings ─────────────────────────────────────────────────────────

create table public.driver_earnings (
  id              uuid primary key default uuid_generate_v4(),
  driver_id       uuid not null references public.users(id),
  booking_id      uuid not null unique references public.bookings(id),
  gross_amount    numeric(10,2) not null,
  platform_fee    numeric(10,2) not null,
  net_amount      numeric(10,2) not null,
  payout_status   payout_status not null default 'pending',
  created_at      timestamptz not null default now()
);

alter table public.driver_earnings enable row level security;

create policy "driver_earnings: driver reads own" on public.driver_earnings
  for select using (auth.uid() = driver_id);

-- ─── Admin RLS bypass (service role key bypasses RLS automatically) ──────────
-- Admin dashboard uses service-role key via server-side calls — no extra policies needed.
-- For admin reads in dashboard, use supabase admin client (service_role).
