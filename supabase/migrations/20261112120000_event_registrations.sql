-- Event registrations: logged-in members register for the campaigns / events they will take part in.
-- Run this once in Supabase → SQL Editor (after 20261112000000_skjv_init.sql).

create table if not exists public.event_registrations (
  id           bigint generated always as identity primary key,
  campaign_id  bigint not null references public.campaigns (id) on delete cascade,
  member_id    bigint not null references public.members (id) on delete cascade,
  created_at   timestamptz not null default now(),
  unique (campaign_id, member_id)
);

create index if not exists event_registrations_member_idx on public.event_registrations (member_id);

alter table public.event_registrations enable row level security;

-- A member sees only their own registrations; admins see all.
-- Registering / cancelling is done by the server (service role) after it checks the member and the event.
drop policy if exists "member reads own registrations" on public.event_registrations;
create policy "member reads own registrations" on public.event_registrations for select to authenticated
  using (public.is_admin() or member_id in (select m.id from public.members m where m.user_id = auth.uid()));

drop policy if exists "admin removes registrations" on public.event_registrations;
create policy "admin removes registrations" on public.event_registrations for delete to authenticated
  using (public.is_admin());

-- Public count shown on the event page ("120 members registered") without exposing who registered.
create or replace function public.event_registration_count(p_campaign_id bigint) returns integer
language sql stable security definer set search_path = '' as $$
  select count(*)::integer from public.event_registrations where campaign_id = p_campaign_id;
$$;

revoke execute on function public.event_registration_count(bigint) from public;
grant execute on function public.event_registration_count(bigint) to anon, authenticated;
