-- ═══════════════════════════════════════════════
-- АВТО СЕРВИС v3 — Simple Auth Setup
-- ═══════════════════════════════════════════════
-- Run in: Supabase → SQL Editor → New Query → Paste → Run
-- ═══════════════════════════════════════════════

-- USERS: admin creates these manually
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  shop_name TEXT NOT NULL DEFAULT 'Авто Сервис',
  pin TEXT DEFAULT '',
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- JOBS
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT DEFAULT '',
  car_brand TEXT NOT NULL DEFAULT '',
  car_model TEXT DEFAULT '',
  plates TEXT DEFAULT '',
  year TEXT DEFAULT '',
  services JSONB DEFAULT '[]'::jsonb,
  notes TEXT DEFAULT '',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'done')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_updated BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Disable RLS (we handle auth in the app with username/password)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE jobs;

-- ═══════════════════════════════════════════════
-- CREATE YOUR ADMIN ACCOUNT:
-- Change 'admin' and 'your-password' below, then run:
-- ═══════════════════════════════════════════════

INSERT INTO users (username, password, shop_name, role, is_active)
VALUES ('admin', 'admin123', 'Admin', 'admin', true);

-- ═══════════════════════════════════════════════
-- DONE! Login with username: admin, password: admin123
-- CHANGE THE PASSWORD from the admin panel after first login!
-- ═══════════════════════════════════════════════
