-- 009_create_profile_on_user_signup.sql
-- Migration: Create trigger to auto-create profile for new users

-- 1. Function to insert a profile row when a new user is created
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (user_id, plan_id)
    VALUES (
        NEW.id,
        (SELECT id FROM public.user_plans WHERE name = 'free' LIMIT 1)
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger to call the function after insert on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- End of migration
