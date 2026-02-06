-- Tables for Distributed Secure Storage Demo

-- Files metadata table
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    size BIGINT NOT NULL,
    root_hash TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Logs table for system events
CREATE TABLE IF NOT EXISTS logs (
    id BIGSERIAL PRIMARY KEY,
    time TIMESTAMPTZ DEFAULT now(),
    server TEXT NOT NULL,
    action TEXT NOT NULL
);

-- Enable Row Level Security (RLS) but for demo purposes, 
-- we might either disable it or add simple policies.
-- ALTER TABLE files ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
