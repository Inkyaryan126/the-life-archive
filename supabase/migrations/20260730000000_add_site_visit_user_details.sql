-- Add optional user identity tracking fields to site_visits table.
-- Allows identifying signed-in members and admin session activity.

alter table public.site_visits
  add column if not exists user_email text,
  add column if not exists user_display_name text;

alter table public.site_visits
  drop constraint if exists site_visits_user_email_check,
  drop constraint if exists site_visits_user_display_name_check;

alter table public.site_visits
  add constraint site_visits_user_email_check
  check (user_email is null or length(user_email) <= 320),
  add constraint site_visits_user_display_name_check
  check (user_display_name is null or length(user_display_name) <= 200);
