-- =====================================================================
-- Issues: Public issue reporting system
-- Anyone (public, members, volunteers) can report local problems with media.
-- Limits: Up to 10 images (max 1 MB each), 1 video (max 30 MB), optional PDF.
-- =====================================================================

create table if not exists public.issues (
  id           bigint generated always as identity primary key,
  member_id    bigint references public.members (id) on delete set null,
  volunteer_id bigint references public.volunteers (id) on delete set null,
  user_id      uuid references auth.users (id) on delete set null,
  author_name  text not null,
  author_phone text,
  description  text not null,
  city         text not null,          -- city / village / town
  needs        text,                   -- what help or action is required
  images       text[] not null default '{}',   -- up to 10 image URLs (max 1MB each)
  video        text,                   -- one video URL (max 30MB)
  pdf          text,                   -- all-in-one PDF document (optional)
  status       text not null default 'open'
                 check (status in ('open', 'in_progress', 'resolved', 'closed')),
  admin_note   text,
  created_at   timestamptz not null default now()
);

-- Safely ensure column exists if table was created previously
alter table public.issues add column if not exists pdf text;

create index if not exists issues_created_idx on public.issues (created_at desc);
create index if not exists issues_user_idx on public.issues (user_id);
create index if not exists issues_status_idx on public.issues (status);

-- RLS: Everyone can read all issues. Anyone (including anonymous public) can insert.
-- Admins can view, update status, and delete.
alter table public.issues enable row level security;

drop policy if exists "public read issues" on public.issues;
create policy "public read issues" on public.issues
  for select to anon, authenticated using (true);

drop policy if exists "anyone insert issues" on public.issues;
create policy "anyone insert issues" on public.issues
  for insert to anon, authenticated with check (true);

drop policy if exists "admin manage issues" on public.issues;
create policy "admin manage issues" on public.issues
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Storage: Ensure 'media' bucket allows PDFs alongside images and videos
update storage.buckets
set allowed_mime_types = array[
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/webm', 'video/quicktime',
  'application/pdf'
]
where id = 'media';

-- Storage: let ANYONE (including anonymous) upload to the issues/ folder in the media bucket
drop policy if exists "members upload issue media" on storage.objects;
drop policy if exists "anyone upload issue media" on storage.objects;
create policy "anyone upload issue media" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = 'issues');

-- =====================================================================
-- Sample data with images, video, and PDF
-- =====================================================================
insert into public.issues (author_name, author_phone, description, city, needs, images, video, pdf, status) values
(
  'Dr. Manjunath Swamy',
  '9448011223',
  'We have compiled an all-in-one petition document signed by 142 villagers requesting an urgent upgrade of the local Primary Health Centre (PHC). Patients currently have to travel 35 km for basic emergency treatment. The attached official petition details the full list of grievances, patient records, and specific staff requirements.',
  'Channapatna',
  'Deputation of full-time Medical Officer, appointment of night-duty nursing staff, and stationing of a 108 Emergency Ambulance.',
  array['/images/gallery/rally-crowd.jpg'],
  null,
  '/documents/complaint-petition-sample.pdf',
  'open'
),
(
  'Ramesh Kumar',
  '9876543210',
  'The main road connecting the market to the bus stand has developed severe potholes over the last 3 months. Vehicles are getting damaged daily and several two-wheeler riders have suffered injuries. During rainfall, the potholes fill up and become invisible death traps for riders.',
  'Bengaluru',
  'Urgent asphalt patching and road resurfacing needed from BBMP / PWD.',
  array['/images/gallery/rally-crowd.jpg', '/images/gallery/rally-flags.jpg'],
  '/video/hero-mobile.mp4',
  null,
  'open'
),
(
  'Lakshmi Devi',
  '9845012345',
  'Our ward has been suffering from acute drinking water shortage for over 2 weeks. The main municipal supply pipeline broke near the junction and thousands of litres of water are getting wasted into the gutter while residents have to wait in queues for commercial tankers at exorbitant rates.',
  'Mysuru',
  'Immediate pipeline repair by water board and deployment of free emergency drinking water tankers.',
  array['/images/gallery/mysore-palace.jpg', '/images/gallery/waterfall.jpg'],
  null,
  null,
  'in_progress'
),
(
  'Suresh Gowda',
  '9901234567',
  'Unregulated garbage dumping near the primary school premises has created a severe health hazard. Stray dogs and cattle congregate there, and the stench makes it impossible for children to attend classes. Corporation sanitation trucks have not visited this lane for 20 days.',
  'Hubballi',
  'Clear accumulated waste, disinfect the surroundings with bleaching powder, and resume daily garbage collection.',
  array['/images/gallery/vidhana-soudha.jpg'],
  '/video/hero.mp4',
  null,
  'open'
),
(
  'Kavitha R',
  '7766554433',
  'The roof of the government high school building is leaking badly and structural cracks have appeared on the side walls. Two classrooms had to be closed down for safety reasons, forcing students to sit in the open corridor. 120 children study here.',
  'Mandya',
  'Emergency civil repair works to waterproof the roof and reinforce structural columns.',
  array['/images/gallery/heritage-chariot.jpg', '/images/gallery/veerangane.jpg', '/images/gallery/hill-fort.jpg'],
  null,
  null,
  'resolved'
),
(
  'Anjali Patil',
  '9988776655',
  'All 5 streetlights on the village main road have been non-functional for past two months. Women, students returning from evening coaching, and elders feel completely unsafe walking in pitch dark.',
  'Dharwad',
  'HESCOM / Gram Panchayat to replace burned-out sodium vapor bulbs with LED streetlights.',
  array['/images/gallery/soudha-sunset.jpg'],
  null,
  null,
  'open'
);
