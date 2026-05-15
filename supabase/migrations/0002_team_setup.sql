-- Virtual Office — team setup
-- Run AFTER creating the 6 auth accounts in Supabase Dashboard → Authentication → Users

-- 1. Extend status constraint to include checked_out
ALTER TABLE public.statuses
  DROP CONSTRAINT IF EXISTS statuses_status_check;

ALTER TABLE public.statuses
  ADD CONSTRAINT statuses_status_check
  CHECK (status IN ('online', 'pause', 'dnd', 'offline', 'checked_out'));

-- 2. Insert public.users rows (looks up UUID from auth.users by email)
INSERT INTO public.users (id, name, avatar_id, desk_position)
SELECT id, 'Suzin Prozesky', 1, 1 FROM auth.users WHERE email = 'sp@ppw.de'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, name, avatar_id, desk_position)
SELECT id, 'Alexander Stroh', 2, 2 FROM auth.users WHERE email = 'as@ppw.de'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, name, avatar_id, desk_position)
SELECT id, 'Saskia Zierer', 3, 3 FROM auth.users WHERE email = 'sz@ppw.de'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, name, avatar_id, desk_position)
SELECT id, 'Oliver Schirok', 4, 4 FROM auth.users WHERE email = 'os@ppw.de'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, name, avatar_id, desk_position)
SELECT id, 'Thomas Memel', 5, 5 FROM auth.users WHERE email = 'tm@ppw.de'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, name, avatar_id, desk_position)
SELECT id, 'Max Härle', 6, 6 FROM auth.users WHERE email = 'mh@ppw.de'
ON CONFLICT (id) DO NOTHING;

-- 3. Seed default checked_out status for all users
INSERT INTO public.statuses (user_id, status)
SELECT id, 'checked_out' FROM public.users
ON CONFLICT (user_id) DO NOTHING;
