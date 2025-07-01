-- 005_update_ai_usage_stats_trigger_and_patch_existing.sql
-- Migration: Update ai_usage_stats trigger to set nonzero initial quota, and patch existing rows

-- 1. Update the trigger function to set nonzero initial quota for new users
DROP FUNCTION IF EXISTS public.handle_new_user_ai_usage_stats CASCADE;

CREATE FUNCTION public.handle_new_user_ai_usage_stats()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.ai_usage_stats (
        user_id,
        requests_today,
        requests_this_month,
        tokens_used_today,
        tokens_used_this_month
    )
    VALUES (
        NEW.id,
        1,      -- initial requests_today
        1,      -- initial requests_this_month
        1000,   -- initial tokens_used_today
        1000    -- initial tokens_used_this_month
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Recreate the trigger (if needed)
DROP TRIGGER IF EXISTS on_auth_user_created_ai_usage_stats ON auth.users;

CREATE TRIGGER on_auth_user_created_ai_usage_stats
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_ai_usage_stats();

-- 3. Patch existing ai_usage_stats rows to have nonzero initial quota
UPDATE public.ai_usage_stats
SET
    requests_today = 1,
    requests_this_month = 1,
    tokens_used_today = 1000,
    tokens_used_this_month = 1000
WHERE TRUE;

-- End of migration
