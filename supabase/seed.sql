-- Public read-only demo data for Life Archive.
-- Demo archives intentionally have owner_id = null and is_demo = true.
-- RLS prevents normal authenticated users from updating/deleting demo archives.

insert into public.archives (
  slug,
  archive_name,
  person_name,
  bio,
  profile_photo_url,
  visibility,
  memorial_mode,
  is_demo,
  created_at,
  updated_at
)
values
  (
    'maya-rivera',
    'Maya Rivera''s Life Archive',
    'Maya Rivera',
    'Teacher, gardener, Sunday dinner host, and the steady voice everyone called when life felt too loud.',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
    'public',
    false,
    true,
    '2026-06-01T00:00:00Z',
    '2026-06-01T00:00:00Z'
  ),
  (
    'dustin-sigley',
    'Founders Archive',
    'Dustin Sigley',
    'Founder seed archive for Life Archive, built to show how a person''s ideas, lessons, and memories can live together in one simple place.',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80',
    'public',
    false,
    true,
    '2026-06-20T00:00:00Z',
    '2026-06-20T00:00:00Z'
  )
on conflict (slug) do update
set
  archive_name = excluded.archive_name,
  person_name = excluded.person_name,
  bio = excluded.bio,
  profile_photo_url = excluded.profile_photo_url,
  visibility = excluded.visibility,
  memorial_mode = excluded.memorial_mode,
  is_demo = excluded.is_demo,
  updated_at = excluded.updated_at;

with seeded_memories (
  archive_slug,
  title,
  type,
  content,
  media_url,
  memory_date,
  tags,
  created_at,
  updated_at
) as (
  values
    (
      'maya-rivera',
      'The kitchen table rule',
      'lesson',
      'Maya always said the best conversations happen after the plates are cleared, when no one is rushing to be anywhere else.',
      null,
      date '2021-11-24',
      array['family', 'lesson', 'home']::text[],
      '2021-11-24T00:00:00Z'::timestamptz,
      '2021-11-24T00:00:00Z'::timestamptz
    ),
    (
      'maya-rivera',
      'Summer roses',
      'photo',
      'A favorite photo from the first summer the rose bushes finally climbed over the back fence.',
      'https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=1200&q=80',
      date '2019-07-12',
      array['garden', 'summer']::text[],
      '2019-07-12T00:00:00Z'::timestamptz,
      '2019-07-12T00:00:00Z'::timestamptz
    ),
    (
      'maya-rivera',
      'A letter for the first hard year',
      'journal',
      'If you are reading this during a hard season, make the next right choice and let tomorrow get its own turn.',
      null,
      date '2024-01-02',
      array['future', 'journal']::text[],
      '2024-01-02T00:00:00Z'::timestamptz,
      '2024-01-02T00:00:00Z'::timestamptz
    ),
    (
      'maya-rivera',
      'Her Sunday playlist',
      'song',
      'The songs that played while Maya cooked on Sunday mornings, before anyone else arrived.',
      'https://open.spotify.com/',
      date '2020-03-08',
      array['music', 'sunday']::text[],
      '2020-03-08T00:00:00Z'::timestamptz,
      '2020-03-08T00:00:00Z'::timestamptz
    ),
    (
      'dustin-sigley',
      'The first version',
      'journal',
      'The Life Archive started with a simple belief: people should not need a perfect biography to preserve what mattered. A few memories, lessons, songs, and notes can become a doorway back into a life.',
      null,
      date '2026-06-20',
      array['founder', 'journal', 'beginning']::text[],
      '2026-06-20T00:00:00Z'::timestamptz,
      '2026-06-20T00:00:00Z'::timestamptz
    ),
    (
      'dustin-sigley',
      'Preserve stories before they disappear',
      'lesson',
      'Do not wait for the perfect time to ask for the story. Save the voice note, write the sentence down, collect the photo, and keep the detail while it is still close.',
      null,
      date '2026-06-20',
      array['lesson', 'stories', 'legacy']::text[],
      '2026-06-20T00:00:00Z'::timestamptz,
      '2026-06-20T00:00:00Z'::timestamptz
    ),
    (
      'dustin-sigley',
      'A song for the first scan',
      'song',
      'A placeholder song memory for the founder demo. This shows how a QR scan can surface music alongside written memories.',
      'https://open.spotify.com/',
      date '2026-06-20',
      array['song', 'demo']::text[],
      '2026-06-20T00:00:00Z'::timestamptz,
      '2026-06-20T00:00:00Z'::timestamptz
    )
)
insert into public.memories (
  archive_id,
  title,
  type,
  content,
  media_url,
  memory_date,
  tags,
  created_at,
  updated_at
)
select
  archives.id,
  seeded_memories.title,
  seeded_memories.type,
  seeded_memories.content,
  seeded_memories.media_url,
  seeded_memories.memory_date,
  seeded_memories.tags,
  seeded_memories.created_at,
  seeded_memories.updated_at
from seeded_memories
join public.archives
  on archives.slug = seeded_memories.archive_slug
where not exists (
  select 1
  from public.memories existing
  where existing.archive_id = archives.id
    and existing.title = seeded_memories.title
    and existing.type = seeded_memories.type
);
