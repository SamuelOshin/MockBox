-- Trigger function to create ai_usage_stats row on new user
CREATE OR REPLACE FUNCTION create_ai_usage_stats_on_user_insert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.ai_usage_stats (user_id, created_at, updated_at)
    VALUES (NEW.id, now(), now())
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on auth.users to call the function after insert
DROP TRIGGER IF EXISTS trg_create_ai_usage_stats ON auth.users;
CREATE TRIGGER trg_create_ai_usage_stats
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE create_ai_usage_stats_on_user_insert();
