-- 007_add_plan_id_to_users.sql
-- Migration: Add plan_id column to users table and link to user_plans

-- Add plan_id column to auth.users (Supabase default users table)
ALTER TABLE auth.users
ADD COLUMN IF NOT EXISTS plan_id uuid REFERENCES public.user_plans(id);

-- Set all existing users to the 'free' plan by default
UPDATE auth.users
SET plan_id = (SELECT id FROM public.user_plans WHERE name = 'free')
WHERE plan_id IS NULL;

-- Optionally, set NOT NULL constraint if all users must have a plan
-- ALTER TABLE auth.users ALTER COLUMN plan_id SET NOT NULL;

-- End of migration
