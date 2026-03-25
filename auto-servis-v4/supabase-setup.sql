-- ═══════════════════════════════════════════════
-- АВТО СЕРВИС v4 — Full Setup
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  shop_name TEXT NOT NULL DEFAULT 'Auto Servis',
  pin TEXT DEFAULT '',
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active BOOLEAN DEFAULT true,
  subscription_months INTEGER DEFAULT 1,
  subscription_expires TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 month'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT DEFAULT '',
  car_brand TEXT NOT NULL DEFAULT '',
  car_model TEXT DEFAULT '',
  plates TEXT DEFAULT '',
  year TEXT DEFAULT '',
  vin TEXT DEFAULT '',
  vin_photo TEXT DEFAULT '',
  services JSONB DEFAULT '[]'::jsonb,
  parts_used JSONB DEFAULT '[]'::jsonb,
  notes TEXT DEFAULT '',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'done')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  car_brand TEXT DEFAULT '',
  car_model TEXT DEFAULT '',
  plates TEXT DEFAULT '',
  vin TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  serial_number TEXT DEFAULT '',
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  buying_price NUMERIC DEFAULT 0,
  selling_price NUMERIC DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_updated BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER parts_updated BEFORE UPDATE ON parts FOR EACH ROW EXECUTE FUNCTION update_timestamp();

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE parts DISABLE ROW LEVEL SECURITY;

ALTER PUBLICATION supabase_realtime ADD TABLE jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE parts;

INSERT INTO users (username, password, shop_name, role, is_active)
VALUES ('admin', 'admin123', 'Admin', 'admin', true);
