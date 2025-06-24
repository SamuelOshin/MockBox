-- MockBox Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create mocks table
CREATE TABLE IF NOT EXISTS mocks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS')),
    response JSONB DEFAULT '{}',
    headers JSONB DEFAULT '{}',
    status_code INTEGER DEFAULT 200 CHECK (status_code >= 100 AND status_code <= 599),
    delay_ms INTEGER DEFAULT 0 CHECK (delay_ms >= 0 AND delay_ms <= 30000),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    is_public BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,

    -- Ensure unique endpoint per user and method
    UNIQUE(user_id, endpoint, method)
);

-- Create mock_stats table
CREATE TABLE IF NOT EXISTS mock_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mock_id UUID NOT NULL REFERENCES mocks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    access_logs JSONB DEFAULT '[]',
    daily_stats JSONB DEFAULT '{}',
    monthly_stats JSONB DEFAULT '{}',
    avg_response_time REAL DEFAULT 0.0,
    total_requests INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create mock_templates table
CREATE TABLE IF NOT EXISTS mock_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    template_data JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create mock_collections table
CREATE TABLE IF NOT EXISTS mock_collections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    mock_ids UUID[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mocks_user_id ON mocks(user_id);
CREATE INDEX IF NOT EXISTS idx_mocks_endpoint_method ON mocks(endpoint, method);
CREATE INDEX IF NOT EXISTS idx_mocks_status ON mocks(status);
CREATE INDEX IF NOT EXISTS idx_mocks_is_public ON mocks(is_public);
CREATE INDEX IF NOT EXISTS idx_mocks_tags ON mocks USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_mocks_created_at ON mocks(created_at);

CREATE INDEX IF NOT EXISTS idx_mock_stats_mock_id ON mock_stats(mock_id);
CREATE INDEX IF NOT EXISTS idx_mock_stats_user_id ON mock_stats(user_id);

CREATE INDEX IF NOT EXISTS idx_mock_templates_category ON mock_templates(category);
CREATE INDEX IF NOT EXISTS idx_mock_templates_is_public ON mock_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_mock_templates_tags ON mock_templates USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_mock_collections_user_id ON mock_collections(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE mocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_collections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mocks table
CREATE POLICY "Users can view own mocks and public mocks" ON mocks
    FOR SELECT
    USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own mocks" ON mocks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mocks" ON mocks
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own mocks" ON mocks
    FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for mock_stats table
CREATE POLICY "Users can view own mock stats" ON mock_stats
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mock stats" ON mock_stats
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mock stats" ON mock_stats
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own mock stats" ON mock_stats
    FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for mock_collections table
CREATE POLICY "Users can view own collections and public collections" ON mock_collections
    FOR SELECT
    USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own collections" ON mock_collections
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections" ON mock_collections
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections" ON mock_collections
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create trigger functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_mocks_updated_at
    BEFORE UPDATE ON mocks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mock_stats_updated_at
    BEFORE UPDATE ON mock_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mock_templates_updated_at
    BEFORE UPDATE ON mock_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mock_collections_updated_at
    BEFORE UPDATE ON mock_collections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
