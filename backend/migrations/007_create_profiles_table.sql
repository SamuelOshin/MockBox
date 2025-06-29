-- 007_create_profiles_table.sql
-- Migration: Create profiles table to store user plan and metadata, linked to auth.users

CREATE TABLE IF NOT EXISTS public.profiles (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id uuid REFERENCES public.user_plans(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Set all existing users to the 'free' plan by default
UPDATE public.profiles
SET plan_id = (SELECT id FROM public.user_plans WHERE name = 'free')
WHERE plan_id IS NULL;

-- For new users, you can set up a trigger to auto-insert a profile row on signup if desired.
-- End of migration
