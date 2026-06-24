-- Create public visitor messages table for QR memorial keepsake MVP.

create table if not exists public.visitor_messages (
  id uuid primary key default gen_random_uuid(),
  archive_id uuid not null references public.archives(id) on delete cascade,
  name text not null,
  message text not null,
  created_at timestamptz not null default now(),
  constraint visitor_messages_name_check check (nullif(btrim(name), '') is not null),
  constraint visitor_messages_message_check check (nullif(btrim(message), '') is not null)
);

create index if not exists visitor_messages_archive_id_idx on public.visitor_messages (archive_id);

alter table public.visitor_messages enable row level security;

-- Policies for visitor_messages
drop policy if exists "Anyone can insert visitor messages" on public.visitor_messages;
create policy "Anyone can insert visitor messages"
on public.visitor_messages
for insert
to anon, authenticated
with check (true);

drop policy if exists "Anyone can read visitor messages for public archives" on public.visitor_messages;
create policy "Anyone can read visitor messages for public archives"
on public.visitor_messages
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.archives
    where archives.id = visitor_messages.archive_id
      and archives.visibility = 'public'
  )
);

drop policy if exists "Owners can manage messages" on public.visitor_messages;
create policy "Owners can manage messages"
on public.visitor_messages
for all
to authenticated
using (
  exists (
    select 1
    from public.archives
    where archives.id = visitor_messages.archive_id
      and archives.owner_id = auth.uid()
  )
);
