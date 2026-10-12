-- J&J Jukebox private archive schema
-- Apply to a dedicated Supabase project only.

create extension if not exists pgcrypto;

create table if not exists public.members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null default 'member' check (role in ('owner','member')),
  created_at timestamptz not null default now()
);

create table if not exists public.tracks (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  artist text not null check (artist in ('Jacob Darling','Jeffrey Taylor')),
  bucket text not null check (bucket in ('featured','archive','raw')),
  kind text not null check (kind in ('original','cover','jam','duet')),
  source_type text not null check (source_type in ('drive','cloudinary','storage')),
  source_ref text not null,
  artwork_key text,
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.track_comments (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.tracks(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.playlist_tracks (
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  track_id uuid not null references public.tracks(id) on delete cascade,
  position integer not null default 0,
  added_by uuid references auth.users(id),
  added_at timestamptz not null default now(),
  primary key (playlist_id, track_id)
);

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id uuid not null references public.tracks(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, track_id)
);

create table if not exists public.mood_tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null unique
);

create table if not exists public.track_mood_tags (
  track_id uuid not null references public.tracks(id) on delete cascade,
  mood_tag_id uuid not null references public.mood_tags(id) on delete cascade,
  primary key (track_id, mood_tag_id)
);

create table if not exists public.uploads (
  id uuid primary key default gen_random_uuid(),
  uploaded_by uuid not null references auth.users(id) on delete cascade,
  storage_path text not null unique,
  original_filename text not null,
  mime_type text not null,
  size_bytes bigint,
  status text not null default 'raw' check (status in ('raw','review','published','rejected')),
  created_at timestamptz not null default now()
);

insert into public.mood_tags (slug, label) values
  ('late-night','Late Night'),
  ('acoustic','Acoustic'),
  ('jam','Jam'),
  ('covers','Covers'),
  ('rough-cuts','Rough Cuts'),
  ('guitar','Guitar'),
  ('mandolin','Mandolin'),
  ('weird-stuff','Weird Stuff')
on conflict (slug) do nothing;

alter table public.members enable row level security;
alter table public.tracks enable row level security;
alter table public.track_comments enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_tracks enable row level security;
alter table public.favorites enable row level security;
alter table public.mood_tags enable row level security;
alter table public.track_mood_tags enable row level security;
alter table public.uploads enable row level security;

create or replace function public.is_jj_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from public.members where user_id = auth.uid());
$$;

revoke all on function public.is_jj_member() from public;
grant execute on function public.is_jj_member() to authenticated;

-- Read access is limited to authenticated J&J members.
create policy "members read members" on public.members for select to authenticated using (public.is_jj_member());
create policy "members read tracks" on public.tracks for select to authenticated using (public.is_jj_member());
create policy "members read comments" on public.track_comments for select to authenticated using (public.is_jj_member());
create policy "members read playlists" on public.playlists for select to authenticated using (public.is_jj_member());
create policy "members read playlist tracks" on public.playlist_tracks for select to authenticated using (public.is_jj_member());
create policy "members read favorites" on public.favorites for select to authenticated using (public.is_jj_member());
create policy "members read moods" on public.mood_tags for select to authenticated using (public.is_jj_member());
create policy "members read track moods" on public.track_mood_tags for select to authenticated using (public.is_jj_member());
create policy "members read uploads" on public.uploads for select to authenticated using (public.is_jj_member());

-- Members can collaborate on comments, playlists, favorites and uploads.
create policy "members create comments" on public.track_comments for insert to authenticated with check (public.is_jj_member() and author_id = auth.uid());
create policy "authors update comments" on public.track_comments for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "authors delete comments" on public.track_comments for delete to authenticated using (author_id = auth.uid());

create policy "members create playlists" on public.playlists for insert to authenticated with check (public.is_jj_member() and created_by = auth.uid());
create policy "members update playlists" on public.playlists for update to authenticated using (public.is_jj_member()) with check (public.is_jj_member());
create policy "members delete playlists" on public.playlists for delete to authenticated using (public.is_jj_member());

create policy "members manage playlist tracks" on public.playlist_tracks for all to authenticated using (public.is_jj_member()) with check (public.is_jj_member());
create policy "members manage own favorites" on public.favorites for all to authenticated using (user_id = auth.uid()) with check (public.is_jj_member() and user_id = auth.uid());
create policy "members manage track moods" on public.track_mood_tags for all to authenticated using (public.is_jj_member()) with check (public.is_jj_member());
create policy "members create uploads" on public.uploads for insert to authenticated with check (public.is_jj_member() and uploaded_by = auth.uid());
create policy "members update own uploads" on public.uploads for update to authenticated using (uploaded_by = auth.uid()) with check (uploaded_by = auth.uid());

-- Private storage bucket for future direct uploads/recordings.
insert into storage.buckets (id, name, public, file_size_limit)
values ('jj-recordings', 'jj-recordings', false, 262144000)
on conflict (id) do nothing;

create policy "members read jj recordings" on storage.objects for select to authenticated
using (bucket_id = 'jj-recordings' and public.is_jj_member());

create policy "members upload jj recordings" on storage.objects for insert to authenticated
with check (bucket_id = 'jj-recordings' and public.is_jj_member());

create policy "members update own jj recordings" on storage.objects for update to authenticated
using (bucket_id = 'jj-recordings' and owner_id = auth.uid()::text)
with check (bucket_id = 'jj-recordings' and owner_id = auth.uid()::text);

create policy "members delete own jj recordings" on storage.objects for delete to authenticated
using (bucket_id = 'jj-recordings' and owner_id = auth.uid()::text);
