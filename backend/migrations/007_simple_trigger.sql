-- Simple trigger migration for Supabase SQL Editor
-- Copy and paste this into your Supabase SQL Editor and run it

-- Step 1: Create the trigger function
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
    free_plan_id UUID;
BEGIN
    -- Get Free plan ID
    SELECT id INTO free_plan_id 
    FROM user_plans 
    WHERE name = 'Free' 
    LIMIT 1;
    
    -- Ensure Free plan exists
    IF free_plan_id IS NULL THEN
        RAISE EXCEPTION 'Free plan not found in user_plans table';
    END IF;
    
    -- Create profile with Free plan (only if it doesn't exist)
    INSERT INTO profiles (user_id, plan_id)
    VALUES (NEW.id, free_plan_id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Create usage stats record (only if it doesn't exist)
    INSERT INTO ai_usage_stats (user_id, rate_limit_remaining)
    VALUES (NEW.id, 10)  -- Free plan default
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't prevent user creation
        RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
        RETURN NEW;  -- Allow user creation to continue
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create the trigger (this will work in Supabase)
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION handle_new_user();

-- Step 3: Add helpful indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_stats_user_id ON ai_usage_stats(user_id);

-- Step 4: Add documentation
COMMENT ON FUNCTION handle_new_user() IS 'Automatically creates profile with Free plan and usage stats for new users';

-- Verification queries (run these to check if everything worked)
-- SELECT routine_name FROM information_schema.routines WHERE routine_name = 'handle_new_user';
-- SELECT trigger_name FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';
