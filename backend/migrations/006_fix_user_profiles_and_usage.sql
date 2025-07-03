-- Migration: Fix user profiles and usage stats
-- Ensures all users have profiles with plans and usage stats

-- First, ensure we have the required plans (matching your actual schema)
INSERT INTO public.user_plans (name, daily_request_quota, monthly_token_quota)
VALUES 
    ('Free', 10, 10000),
    ('Pro', 100, 100000),
    ('Enterprise', 1000, 1000000)
ON CONFLICT (name) DO UPDATE SET
    daily_request_quota = EXCLUDED.daily_request_quota,
    monthly_token_quota = EXCLUDED.monthly_token_quota,
    updated_at = now();

-- Ensure all users in auth.users have profiles
DO $$
DECLARE
    free_plan_uuid uuid;
BEGIN
    -- Get the Free plan ID dynamically
    SELECT id INTO free_plan_uuid FROM public.user_plans WHERE name = 'Free' LIMIT 1;
    
    IF free_plan_uuid IS NULL THEN
        RAISE EXCEPTION 'Free plan not found in user_plans table';
    END IF;
    
    -- Insert profiles for users who don't have them
    INSERT INTO public.profiles (user_id, plan_id)
    SELECT 
        au.id,
        free_plan_uuid
    FROM auth.users au
    LEFT JOIN public.profiles p ON p.user_id = au.id
    WHERE p.user_id IS NULL
    ON CONFLICT (user_id) DO UPDATE SET
        plan_id = COALESCE(profiles.plan_id, free_plan_uuid),
        updated_at = now();
    
    -- Ensure AI usage stats exist for all users (let triggers handle rate_limit_remaining)
    INSERT INTO public.ai_usage_stats (user_id)
    SELECT au.id
    FROM auth.users au
    LEFT JOIN public.ai_usage_stats aus ON aus.user_id = au.id
    WHERE aus.user_id IS NULL
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Update any profiles that don't have a plan assigned
    UPDATE public.profiles 
    SET plan_id = free_plan_uuid, updated_at = now()
    WHERE plan_id IS NULL;
    
END $$;

-- Verify the results
SELECT 
    'Users without profiles' as check_type,
    COUNT(*) as count
FROM auth.users au
LEFT JOIN public.profiles p ON p.user_id = au.id
WHERE p.user_id IS NULL

UNION ALL

SELECT 
    'Users without usage stats' as check_type,
    COUNT(*) as count
FROM auth.users au
LEFT JOIN public.ai_usage_stats aus ON aus.user_id = au.id
WHERE aus.user_id IS NULL

UNION ALL

SELECT 
    'Profiles without plans' as check_type,
    COUNT(*) as count
FROM public.profiles
WHERE plan_id IS NULL;
