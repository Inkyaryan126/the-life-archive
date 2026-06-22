-- Protected public example archives for The Life Archive.
-- Example archives intentionally have owner_id = null and is_demo = true.
-- RLS prevents normal authenticated users from updating or deleting them.

insert into public.archives (
  id,
  slug,
  archive_name,
  person_name,
  bio,
  profile_photo_url,
  visibility,
  memorial_mode,
  relationship_to_owner,
  is_demo,
  created_at,
  updated_at
)
values
  (
    '9e1b0e95-1d3b-4e91-9c42-5b8bf6c8d501',
    'sari-rae',
    'Sari Rae''s Life Archive',
    'Sari Rae',
    'Sari Rae is a devoted mother whose life centers on family, care, and the small moments that become lasting memories. With a background in cosmetology and a gift for making people feel their best, her archive holds the stories, lessons, and moments that reflect a warm, grounded life well lived.',
    '/images/sari-rae.png',
    'public',
    false,
    'other',
    true,
    '2026-06-01T00:00:00Z',
    '2026-06-01T00:00:00Z'
  ),
  (
    'f7d2eb3c-2c6c-4c11-b7f2-90c2d6c1c5be',
    'dustin-sigley',
    'Dustin Sigley''s Life Archive',
    'Dustin Sigley',
    'Dustin Sigley is the founder of The Life Archive, built from the belief that a person deserves to leave behind more than a name, a date, and a few scattered memories. His archive preserves the ideas, lessons, music, and moments that shaped the beginning of the project.',
    '/images/dustin-sigley.png',
    'public',
    false,
    'self',
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
  relationship_to_owner = excluded.relationship_to_owner,
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
      'sari-rae',
      'The kitchen table rule',
      'lesson',
      'Sari always said the best conversations happen after the dishes are cleared, when nobody is in a hurry and the family can just be together.',
      null,
      date '2021-11-24',
      array['family', 'lesson', 'home']::text[],
      '2021-11-24T00:00:00Z'::timestamptz,
      '2021-11-24T00:00:00Z'::timestamptz
    ),
    (
      'sari-rae',
      'A day at the salon',
      'photo',
      'A moment from the salon, where Sari helped someone leave feeling a little lighter and a little more confident.',
      '/images/sari-rae.png',
      date '2019-07-12',
      array['cosmetology', 'family']::text[],
      '2019-07-12T00:00:00Z'::timestamptz,
      '2019-07-12T00:00:00Z'::timestamptz
    ),
    (
      'sari-rae',
      'A letter for the first hard year',
      'journal',
      'If you are reading this during a hard season, remember that love is often built in the ordinary things: a meal, a ride home, a calm voice, and showing up again tomorrow.',
      null,
      date '2024-01-02',
      array['future', 'journal']::text[],
      '2024-01-02T00:00:00Z'::timestamptz,
      '2024-01-02T00:00:00Z'::timestamptz
    ),
    (
      'sari-rae',
      'Her Sunday playlist',
      'song',
      'The songs that played while Sari cooked on Sunday mornings and the family drifted in one by one.',
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
      'A song connected to the earliest days of The Life Archive and the belief that music can bring a moment back.',
      'https://open.spotify.com/',
      date '2026-06-20',
      array['song', 'beginning']::text[],
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
