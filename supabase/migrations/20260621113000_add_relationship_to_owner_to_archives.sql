-- Add descriptive archive ownership/relationship metadata.
-- This field is presentation data only and does not affect RLS or ownership.

alter table public.archives
  add column if not exists relationship_to_owner text;

update public.archives
set relationship_to_owner = 'other'
where relationship_to_owner is null
   or relationship_to_owner not in (
     'self',
     'parent',
     'child',
     'partner',
     'sibling',
     'grandparent',
     'grandchild',
     'friend',
     'mentor',
     'other'
   );

update public.archives
set relationship_to_owner = 'self'
where is_demo = true
  and slug = 'dustin-sigley';

alter table public.archives
  alter column relationship_to_owner set default 'other';

alter table public.archives
  alter column relationship_to_owner set not null;

alter table public.archives
  drop constraint if exists archives_relationship_to_owner_check,
  add constraint archives_relationship_to_owner_check
  check (
    relationship_to_owner in (
      'self',
      'parent',
      'child',
      'partner',
      'sibling',
      'grandparent',
      'grandchild',
      'friend',
      'mentor',
      'other'
    )
  );
