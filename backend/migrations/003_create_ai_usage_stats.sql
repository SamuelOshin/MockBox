-- Migration: Create ai_usage_stats table for tracking AI usage per user
-- Roll forward
CREATE TABLE IF NOT EXISTS ai_usage_stats (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    requests_today integer NOT NULL DEFAULT 0,
    requests_this_month integer NOT NULL DEFAULT 0,
    tokens_used_today integer NOT NULL DEFAULT 0,
    tokens_used_this_month integer NOT NULL DEFAULT 0,
    rate_limit_remaining integer NOT NULL DEFAULT 0,
    rate_limit_reset timestamptz,
    last_request timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Index for fast lookup by user
CREATE INDEX IF NOT EXISTS idx_ai_usage_stats_user_id ON ai_usage_stats(user_id);

-- Trigger to update updated_at on row modification
CREATE OR REPLACE FUNCTION update_ai_usage_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_ai_usage_stats_updated_at ON ai_usage_stats;
CREATE TRIGGER trg_update_ai_usage_stats_updated_at
BEFORE UPDATE ON ai_usage_stats
FOR EACH ROW EXECUTE PROCEDURE update_ai_usage_stats_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE ai_usage_stats ENABLE ROW LEVEL SECURITY;

-- Hybrid RLS: Trust backend to set correct user_id, allow only valid UUIDs
CREATE POLICY "Authenticated insert with backend validation" ON ai_usage_stats
    FOR INSERT
    WITH CHECK (
        user_id IS NOT NULL
        AND user_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    );

-- Allow users to view their own usage stats (application should filter by user)
CREATE POLICY "Authenticated select for own usage stats" ON ai_usage_stats
    FOR SELECT
    USING (
        true
    );

-- Allow updates (application will validate ownership)
CREATE POLICY "Authenticated update with app validation" ON ai_usage_stats
    FOR UPDATE
    USING (user_id IS NOT NULL)
    WITH CHECK (user_id IS NOT NULL);

-- Allow deletes (application will validate ownership)
CREATE POLICY "Authenticated delete with app validation" ON ai_usage_stats
    FOR DELETE
    USING (user_id IS NOT NULL);
