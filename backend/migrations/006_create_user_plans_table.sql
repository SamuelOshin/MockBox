-- 006_create_user_plans_table.sql
-- Migration: Create user_plans table to define free and paid plans with quotas

CREATE TABLE IF NOT EXISTS public.user_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE, -- e.g., 'free', 'pro', 'enterprise'
    daily_request_quota int NOT NULL,
    monthly_token_quota int NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Insert default plans
INSERT INTO public.user_plans (name, daily_request_quota, monthly_token_quota)
VALUES
    ('free', 10, 10000),
    ('pro', 1000, 100000),
    ('enterprise', 10000, 1000000)
ON CONFLICT (name) DO NOTHING;

-- End of migration
