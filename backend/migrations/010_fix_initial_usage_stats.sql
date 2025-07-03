-- 010_fix_initial_usage_stats.sql
-- Migration: Fix initial usage statistics for existing users and improve triggers

-- 1. Reset incorrect initial usage values to 0
UPDATE public.ai_usage_stats 
SET 
    requests_today = 0,
    requests_this_month = 0,
    tokens_used_today = 0,
    tokens_used_this_month = 0,
    updated_at = now()
WHERE 
    -- Only reset users with the old "test" values
    requests_today = 1 
    AND requests_this_month = 1 
    AND tokens_used_today = 1000 
    AND tokens_used_this_month = 1000;

-- 2. Update the trigger function to use proper initial values for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_ai_usage_stats()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.ai_usage_stats (
        user_id,
        requests_today,
        requests_this_month,
        tokens_used_today,
        tokens_used_this_month,
        rate_limit_remaining,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        0,  -- Start with 0 requests used today
        0,  -- Start with 0 requests used this month
        0,  -- Start with 0 tokens used today
        0,  -- Start with 0 tokens used this month
        10, -- Free plan default daily quota
        now(),
        now()
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure all existing users have profiles with free plan
INSERT INTO public.profiles (user_id, plan_id)
SELECT 
    u.id,
    (SELECT id FROM public.user_plans WHERE name = 'free' LIMIT 1) as plan_id
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- 4. Ensure all users with profiles have ai_usage_stats
INSERT INTO public.ai_usage_stats (user_id, requests_today, requests_this_month, tokens_used_today, tokens_used_this_month, rate_limit_remaining)
SELECT 
    p.user_id,
    0,  -- requests_today
    0,  -- requests_this_month
    0,  -- tokens_used_today
    0,  -- tokens_used_this_month
    10  -- rate_limit_remaining (free plan default)
FROM public.profiles p
LEFT JOIN public.ai_usage_stats aus ON p.user_id = aus.user_id
WHERE aus.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- End of migration
