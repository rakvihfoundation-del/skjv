-- Volunteers: free sign-up (no payment, no ID card) with one ID proof, kept in a PRIVATE bucket.
-- Volunteers can log in and register for events. Admins can verify, suspend or delete them.
-- Run once in Supabase → SQL Editor, after the earlier migrations. Safe to run again.

-- ---------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------
create table if not exists public.volunteers (
  id            bigint generated always as identity primary key,
  volunteer_no  text unique,
  user_id       uuid unique references auth.users (id) on delete set null,
  auth_email    text unique,
  name          text not null,
  phone         text not null unique check (phone ~ '^[6-9][0-9]{9}$'),
  email         text,
  ward          text,
  pincode       text,
  proof_type    text not null check (proof_type in ('aadhaar', 'voter', 'driving', 'pan')),
  proof_path    text not null,          -- object path in the private "proofs" bucket
  verified      boolean not null default false,
  status        text not null default 'active' check (status in ('active', 'suspended')),
  created_at    timestamptz not null default now()
);

create index if not exists volunteers_created_idx on public.volunteers (created_at desc);

create or replace function public.set_volunteer_no() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.volunteer_no is null then
    new.volunteer_no := 'SKJV-VOL-' || to_char(now(), 'YYYY') || '-' || lpad(new.id::text, 6, '0');
  end if;
  return new;
end $$;

drop trigger if exists volunteers_volunteer_no on public.volunteers;
create trigger volunteers_volunteer_no before insert on public.volunteers
  for each row execute function public.set_volunteer_no();

-- A volunteer reads only their own row; admins manage all. The server inserts with the service role.
alter table public.volunteers enable row level security;
drop policy if exists "volunteer reads own row" on public.volunteers;
create policy "volunteer reads own row" on public.volunteers for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists "admin manages volunteers" on public.volunteers;
create policy "admin manages volunteers" on public.volunteers for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin deletes volunteers" on public.volunteers;
create policy "admin deletes volunteers" on public.volunteers for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- Event registrations: a registration belongs to a member OR a volunteer
-- ---------------------------------------------------------------------
alter table public.event_registrations alter column member_id drop not null;
alter table public.event_registrations
  add column if not exists volunteer_id bigint references public.volunteers (id) on delete cascade;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'event_registrations_one_person') then
    alter table public.event_registrations
      add constraint event_registrations_one_person check (num_nonnulls(member_id, volunteer_id) = 1);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'event_registrations_campaign_volunteer_key') then
    alter table public.event_registrations
      add constraint event_registrations_campaign_volunteer_key unique (campaign_id, volunteer_id);
  end if;
end $$;

create index if not exists event_registrations_volunteer_idx on public.event_registrations (volunteer_id);

drop policy if exists "member reads own registrations" on public.event_registrations;
create policy "member reads own registrations" on public.event_registrations for select to authenticated
  using (
    public.is_admin()
    or member_id in (select m.id from public.members m where m.user_id = auth.uid())
    or volunteer_id in (select v.id from public.volunteers v where v.user_id = auth.uid())
  );

-- ---------------------------------------------------------------------
-- Private bucket for ID proofs (no public access; admins view through short-lived signed links)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('proofs', 'proofs', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "admins read proofs" on storage.objects;
create policy "admins read proofs" on storage.objects for select to authenticated
  using (bucket_id = 'proofs' and public.is_admin());
drop policy if exists "admins delete proofs" on storage.objects;
create policy "admins delete proofs" on storage.objects for delete to authenticated
  using (bucket_id = 'proofs' and public.is_admin());

-- ---------------------------------------------------------------------
-- Dashboard numbers: add volunteers
-- ---------------------------------------------------------------------
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
    'volunteers',         (select count(*) from public.volunteers),
    'volunteersMonth',    (select count(*) from public.volunteers
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

-- ---------------------------------------------------------------------
-- Home page: Ammana Neralu Foundation (old age home) — editable in Admin → Settings
-- ---------------------------------------------------------------------
insert into public.settings (key, value) values
  ('trust_name_en', 'Ammana Neralu Foundation'),
  ('trust_name_kn', 'ಅಮ್ಮನ ನೆರಳು ಫೌಂಡೇಶನ್'),
  ('trust_tagline_en', 'Old age home'),
  ('trust_tagline_kn', 'ವೃದ್ಧಾಶ್ರಮ'),
  ('trust_about_en', 'Ammana Neralu Foundation runs an old age home where elders who need care find a safe roof, warm meals, medical attention and, above all, a family that treats them with dignity and love. Supported by the Vedike and its members, the home is a reminder that service to the land begins with caring for those who raised us.'),
  ('trust_about_kn', 'ಅಮ್ಮನ ನೆರಳು ಫೌಂಡೇಶನ್ ನಡೆಸುವ ವೃದ್ಧಾಶ್ರಮದಲ್ಲಿ ಆರೈಕೆಯ ಅಗತ್ಯವಿರುವ ಹಿರಿಯರಿಗೆ ಸುರಕ್ಷಿತ ಆಶ್ರಯ, ಬಿಸಿ ಊಟ, ವೈದ್ಯಕೀಯ ಆರೈಕೆ ಮತ್ತು ಎಲ್ಲಕ್ಕಿಂತ ಮಿಗಿಲಾಗಿ ಗೌರವ ಮತ್ತು ಪ್ರೀತಿಯಿಂದ ನೋಡಿಕೊಳ್ಳುವ ಕುಟುಂಬ ಸಿಗುತ್ತದೆ. ವೇದಿಕೆ ಮತ್ತು ಅದರ ಸದಸ್ಯರ ಬೆಂಬಲದೊಂದಿಗೆ ನಡೆಯುವ ಈ ಆಶ್ರಮ, ನಮ್ಮನ್ನು ಬೆಳೆಸಿದವರನ್ನು ಆರೈಕೆ ಮಾಡುವುದರಿಂದಲೇ ನಾಡಸೇವೆ ಆರಂಭವಾಗುತ್ತದೆ ಎಂಬುದನ್ನು ನೆನಪಿಸುತ್ತದೆ.'),
  ('trust_image', '/images/trust/old-age-home.jpg'),
  ('trust_phone', ''),
  ('trust_address', '')
on conflict (key) do nothing;
