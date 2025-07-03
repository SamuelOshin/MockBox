-- Migration: 007_auto_profile_creation_trigger.sql
-- Description: Add trigger to automatically create profile and usage stats for new users
-- Date: 2025-07-03
-- Purpose: Eliminate race conditions and ensure 100% user plan assignment

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
    free_plan_id UUID;
    user_profile_exists BOOLEAN;
    user_stats_exists BOOLEAN;
BEGIN
    -- Log the new user creation for debugging
    RAISE LOG 'Creating profile for new user: %', NEW.id;
    
    -- Check if profile already exists (safety check)
    SELECT EXISTS(
        SELECT 1 FROM profiles WHERE user_id = NEW.id
    ) INTO user_profile_exists;
    
    -- Check if usage stats already exist (safety check)
    SELECT EXISTS(
        SELECT 1 FROM ai_usage_stats WHERE user_id = NEW.id
    ) INTO user_stats_exists;
    
    -- Only proceed if profile doesn't exist
    IF NOT user_profile_exists THEN
        -- Get Free plan ID
        SELECT id INTO free_plan_id 
        FROM user_plans 
        WHERE name = 'Free' 
        LIMIT 1;
        
        -- Ensure Free plan exists
        IF free_plan_id IS NULL THEN
            RAISE EXCEPTION 'Free plan not found in user_plans table';
        END IF;
        
        -- Create profile with Free plan
        INSERT INTO profiles (user_id, plan_id, created_at, updated_at)
        VALUES (
            NEW.id, 
            free_plan_id,
            NOW(),
            NOW()
        );
        
        RAISE LOG 'Created profile for user % with Free plan %', NEW.id, free_plan_id;
    ELSE
        RAISE LOG 'Profile already exists for user %', NEW.id;
    END IF;
    
    -- Only create usage stats if they don't exist
    IF NOT user_stats_exists THEN
        -- Create usage stats record with default values
        INSERT INTO ai_usage_stats (
            user_id,
            requests_today,
            requests_this_month,
            tokens_used_today,
            tokens_used_this_month,
            rate_limit_remaining,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            0,  -- requests_today
            0,  -- requests_this_month
            0,  -- tokens_used_today
            0,  -- tokens_used_this_month
            10, -- rate_limit_remaining (Free plan default)
            NOW(),
            NOW()
        );
        
        RAISE LOG 'Created usage stats for user %', NEW.id;
    ELSE
        RAISE LOG 'Usage stats already exist for user %', NEW.id;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't prevent user creation
        RAISE LOG 'Error in handle_new_user trigger for user %: %', NEW.id, SQLERRM;
        -- Re-raise the exception to prevent user creation if profile creation fails
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
-- Note: This requires superuser privileges or being the owner of auth.users
DO $$
BEGIN
    -- Drop trigger if it already exists
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    
    -- Create the trigger
    CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW 
        EXECUTE FUNCTION handle_new_user();
        
    RAISE LOG 'Created trigger on_auth_user_created on auth.users table';
EXCEPTION
    WHEN insufficient_privilege THEN
        RAISE LOG 'Insufficient privileges to create trigger on auth.users. This is normal if not running as superuser.';
    WHEN OTHERS THEN
        RAISE LOG 'Error creating trigger: %', SQLERRM;
END
$$;

-- Grant necessary permissions for the trigger function
-- The function runs with SECURITY DEFINER, so it will have the privileges of the function owner

GRANT USAGE ON SCHEMA auth TO postgres;
GRANT SELECT ON auth.users TO postgres;

-- Create an index for faster lookups on profiles.user_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_stats_user_id ON ai_usage_stats(user_id);

-- Add comment for documentation
COMMENT ON FUNCTION handle_new_user() IS 'Automatically creates profile with Free plan and usage stats for new users';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Ensures every new user gets a profile and usage stats record';

-- Migration completed
SELECT 'Migration 007_auto_profile_creation_trigger.sql completed successfully' as status;
