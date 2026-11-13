-- =====================================================================
-- Suvarna Karnataka Janashakti Vedike — Supabase schema
-- Run once in the Supabase SQL editor (or `supabase db push`).
-- Creates: tables, number generators, row-level security, RPCs, storage.
-- =====================================================================


-- ---------------------------------------------------------------------
-- Content tables (managed from the admin panel, readable by everyone)
-- ---------------------------------------------------------------------

create table if not exists public.settings (
  key   text primary key,
  value text
);

create table if not exists public.slides (
  id         bigint generated always as identity primary key,
  image      text not null,
  title      text,
  link       text,
  sort       integer not null default 0,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.news (
  id           bigint generated always as identity primary key,
  slug         text not null unique,
  title_en     text not null,
  title_kn     text,
  category     text not null default 'Announcement'
               check (category in ('Announcement', 'Protest', 'Culture', 'Service', 'Press')),
  published_at date not null default current_date,
  excerpt_en   text,
  excerpt_kn   text,
  body_en      text,
  body_kn      text,
  image        text,
  images       text[] not null default '{}',
  featured     boolean not null default false,
  created_at   timestamptz not null default now()
);
create index if not exists news_published_idx on public.news (published_at desc, id desc);

-- Campaigns double as events. Status (upcoming / ongoing / completed) is computed from the dates.
create table if not exists public.campaigns (
  id          bigint generated always as identity primary key,
  slug        text not null unique,
  title_en    text not null,
  title_kn    text,
  summary_en  text,
  summary_kn  text,
  body_en     text,
  body_kn     text,
  image       text,
  images      text[] not null default '{}',
  start_date  date not null,
  end_date    date,
  time        text,
  venue_en    text,
  venue_kn    text,
  created_at  timestamptz not null default now(),
  constraint campaigns_dates_chk check (end_date is null or end_date >= start_date)
);
create index if not exists campaigns_start_idx on public.campaigns (start_date);

create table if not exists public.gallery (
  id         bigint generated always as identity primary key,
  image      text,
  images     text[] not null default '{}',
  video      text,
  title_en   text,
  title_kn   text,
  album      text not null default 'Events'
             check (album in ('Events', 'Protests', 'Culture', 'Service', 'Heritage')),
  sort       integer not null default 0,
  created_at timestamptz not null default now(),
  constraint gallery_media_chk check (image is not null or video is not null)
);

create table if not exists public.leaders (
  id         bigint generated always as identity primary key,
  name_en    text not null,
  name_kn    text,
  role_en    text not null,
  role_kn    text,
  tier       text not null default 'state' check (tier in ('founder', 'state', 'district', 'taluk')),
  district   text,
  photo      text,
  bio_en     text,
  bio_kn     text,
  quote_en   text,
  quote_kn   text,
  sort       integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.partners (
  id         bigint generated always as identity primary key,
  name       text not null,
  logo       text,
  url        text,
  sort       integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.instagram (
  id         bigint generated always as identity primary key,
  image      text not null,
  caption    text,
  url        text,
  likes      integer not null default 0,
  sort       integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.wards (
  id         bigint generated always as identity primary key,
  name       text not null unique,
  sort       integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- People & money
-- ---------------------------------------------------------------------

-- Admins are Supabase Auth users listed here.
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  name       text not null default 'Admin',
  email      text not null,
  created_at timestamptz not null default now()
);

-- Members sign in with Supabase Auth. `auth_email` is the login e-mail used behind the scenes
-- (members log in with their mobile number or member ID; e-mail is optional for them).
create table if not exists public.members (
  id           bigint generated always as identity primary key,
  member_no    text unique,
  user_id      uuid unique references auth.users (id) on delete set null,
  auth_email   text unique,
  name         text not null,
  email        text,
  phone        text not null unique check (phone ~ '^[6-9][0-9]{9}$'),
  ward         text,
  pincode      text check (pincode is null or pincode ~ '^[1-9][0-9]{5}$'),
  photo        text,
  status       text not null default 'active' check (status in ('active', 'suspended')),
  amount       integer not null default 0,
  order_id     text,
  payment_id   text,
  payment_mode text,
  created_at   timestamptz not null default now()
);
create index if not exists members_created_idx on public.members (created_at desc);
create index if not exists members_ward_idx on public.members (ward);

-- Razorpay orders waiting for payment. Holds the sign-up / donation form until payment is verified.
create table if not exists public.pending_orders (
  order_id   text primary key,
  kind       text not null check (kind in ('membership', 'donation')),
  payload    jsonb not null,
  amount     integer not null check (amount > 0),
  status     text not null default 'created' check (status in ('created', 'processing', 'paid')),
  result_id  bigint,
  created_at timestamptz not null default now()
);

create table if not exists public.donations (
  id           bigint generated always as identity primary key,
  receipt_no   text unique,
  name         text not null,
  email        text,
  phone        text,
  pan          text,
  amount       integer not null check (amount > 0),
  campaign_id  bigint references public.campaigns (id) on delete set null,
  message      text,
  anonymous    boolean not null default false,
  order_id     text,
  payment_id   text,
  payment_mode text,
  created_at   timestamptz not null default now()
);
create index if not exists donations_created_idx on public.donations (created_at desc);

create table if not exists public.messages (
  id         bigint generated always as identity primary key,
  name       text not null,
  email      text,
  phone      text,
  subject    text,
  message    text not null,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Member numbers & receipt numbers: SKJV-2026-000001 / SKJV-DON-2026-000001
-- ---------------------------------------------------------------------

create or replace function public.set_member_no() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.member_no is null then
    new.member_no := 'SKJV-' || to_char(now(), 'YYYY') || '-' || lpad(new.id::text, 6, '0');
  end if;
  return new;
end $$;

drop trigger if exists members_member_no on public.members;
create trigger members_member_no before insert on public.members
  for each row execute function public.set_member_no();

create or replace function public.set_receipt_no() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.receipt_no is null then
    new.receipt_no := 'SKJV-DON-' || to_char(now(), 'YYYY') || '-' || lpad(new.id::text, 6, '0');
  end if;
  return new;
end $$;

drop trigger if exists donations_receipt_no on public.donations;
create trigger donations_receipt_no before insert on public.donations
  for each row execute function public.set_receipt_no();

-- ---------------------------------------------------------------------
-- Helpers & RPCs
-- ---------------------------------------------------------------------

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- Public QR-code verification: returns only what is printed on the ID card.
create or replace function public.verify_member(p_member_no text)
returns table (member_no text, name text, ward text, photo text, status text, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select m.member_no, m.name, m.ward, m.photo, m.status, m.created_at
  from public.members m
  where upper(m.member_no) = upper(trim(p_member_no))
  limit 1;
$$;

-- Dashboard numbers in one round trip (admins only).
create or replace function public.admin_stats() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  result jsonb;
  tz constant text := 'Asia/Kolkata';
begin
  if not public.is_admin() then
    raise exception 'not authorised' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'members',            (select count(*) from public.members),
    'membersMonth',       (select count(*) from public.members
                            where created_at >= date_trunc('month', now() at time zone tz) at time zone tz),
    'membershipRevenue',  (select coalesce(sum(amount), 0) from public.members),
    'donationsTotal',     (select coalesce(sum(amount), 0) from public.donations),
    'donationsCount',     (select count(*) from public.donations),
    'unread',             (select count(*) from public.messages where not is_read),
    'upcoming',           (select count(*) from public.campaigns
                            where coalesce(end_date, start_date) >= (now() at time zone tz)::date),
    'months', (
      select coalesce(jsonb_agg(jsonb_build_object(
               'key',       to_char(m, 'YYYY-MM'),
               'label',     to_char(m, 'Mon'),
               'members',   (select count(*) from public.members
                              where to_char(created_at at time zone tz, 'YYYY-MM') = to_char(m, 'YYYY-MM')),
               'donations', (select coalesce(sum(amount), 0) from public.donations
                              where to_char(created_at at time zone tz, 'YYYY-MM') = to_char(m, 'YYYY-MM'))
             ) order by m), '[]'::jsonb)
      from generate_series(
        date_trunc('month', now() at time zone tz) - interval '5 months',
        date_trunc('month', now() at time zone tz),
        interval '1 month') as m
    ),
    'wards', (
      select coalesce(jsonb_agg(w), '[]'::jsonb) from (
        select ward, count(*)::int as c from public.members
        group by ward order by c desc limit 6) w
    ),
    'recentMembers', (
      select coalesce(jsonb_agg(r), '[]'::jsonb) from (
        select id, member_no, name, ward, photo, created_at from public.members
        order by id desc limit 6) r
    ),
    'recentDonations', (
      select coalesce(jsonb_agg(r), '[]'::jsonb) from (
        select id, receipt_no, name, amount, anonymous, created_at from public.donations
        order by id desc limit 6) r
    )
  ) into result;

  return result;
end $$;

revoke execute on function public.admin_stats() from anon;
grant execute on function public.verify_member(text) to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------
-- Row-level security
--   * content: everyone can read, only admins can write
--   * members: a member reads their own row; admins read/manage all
--   * money & messages: admins only (the server writes with the service role)
-- ---------------------------------------------------------------------

do $$
declare t text;
begin
  foreach t in array array['settings', 'news', 'campaigns', 'gallery', 'leaders', 'partners', 'instagram', 'wards'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('drop policy if exists "admin write" on public.%I', t);
    execute format('create policy "admin write" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Hidden banners are visible to admins only.
alter table public.slides enable row level security;
drop policy if exists "public read" on public.slides;
create policy "public read" on public.slides for select to anon, authenticated using (active or public.is_admin());
drop policy if exists "admin write" on public.slides;
create policy "admin write" on public.slides for all to authenticated using (public.is_admin()) with check (public.is_admin());

alter table public.admins enable row level security;
drop policy if exists "admins read" on public.admins;
create policy "admins read" on public.admins for select to authenticated using (user_id = auth.uid() or public.is_admin());

alter table public.members enable row level security;
drop policy if exists "member reads own row" on public.members;
create policy "member reads own row" on public.members for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists "admin manages members" on public.members;
create policy "admin manages members" on public.members for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin deletes members" on public.members;
create policy "admin deletes members" on public.members for delete to authenticated using (public.is_admin());

alter table public.donations enable row level security;
drop policy if exists "admin reads donations" on public.donations;
create policy "admin reads donations" on public.donations for select to authenticated using (public.is_admin());

alter table public.messages enable row level security;
drop policy if exists "admin manages messages" on public.messages;
create policy "admin manages messages" on public.messages for all to authenticated using (public.is_admin()) with check (public.is_admin());

alter table public.pending_orders enable row level security;
drop policy if exists "admin reads orders" on public.pending_orders;
create policy "admin reads orders" on public.pending_orders for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------
-- Storage: public buckets for site media and member photos
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('media', 'media', true, 104857600,
   array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']),
  ('members', 'members', true, 4194304,
   array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "admins upload media" on storage.objects;
create policy "admins upload media" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "admins update media" on storage.objects;
create policy "admins update media" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin());
drop policy if exists "admins delete media" on storage.objects;
create policy "admins delete media" on storage.objects for delete to authenticated
  using (bucket_id in ('media', 'members') and public.is_admin());
-- Member photos are uploaded by the server (service role) after validation.
