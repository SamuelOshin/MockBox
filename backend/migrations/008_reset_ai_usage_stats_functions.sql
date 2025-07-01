-- 008_reset_ai_usage_stats_functions.sql
-- Migration: Create functions and schedules to reset AI usage stats daily and monthly

-- 1. Function to reset daily usage counters
CREATE OR REPLACE FUNCTION public.reset_ai_usage_stats_daily()
RETURNS void AS $$
BEGIN
    UPDATE public.ai_usage_stats
    SET requests_today = 0,
        tokens_used_today = 0;
END;
$$ LANGUAGE plpgsql;

-- 2. Function to reset monthly usage counters
CREATE OR REPLACE FUNCTION public.reset_ai_usage_stats_monthly()
RETURNS void AS $$
BEGIN
    UPDATE public.ai_usage_stats
    SET requests_this_month = 0,
        tokens_used_this_month = 0;
END;
$$ LANGUAGE plpgsql;

-- 3. (Optional) Schedule these functions using pg_cron or Supabase scheduled triggers
-- Example for pg_cron (run daily at midnight UTC):
-- SELECT cron.schedule('reset_ai_usage_stats_daily', '0 0 * * *', $$CALL public.reset_ai_usage_stats_daily();$$);
-- Example for monthly reset (run at midnight on the 1st of each month):
-- SELECT cron.schedule('reset_ai_usage_stats_monthly', '0 0 1 * *', $$CALL public.reset_ai_usage_stats_monthly();$$);

-- If using Supabase Scheduled Triggers UI, configure the schedule and set the function name accordingly.

-- End of migration
