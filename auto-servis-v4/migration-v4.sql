-- ═══════════════════════════════════════════════
-- MIGRATION to v4 — Run on existing database
-- ═══════════════════════════════════════════════

-- Add subscription fields if missing
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_months INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 month');

-- Add VIN and parts to jobs
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS vin TEXT DEFAULT '';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS vin_photo TEXT DEFAULT '';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS parts_used JSONB DEFAULT '[]'::jsonb;

-- Add car info to customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS car_brand TEXT DEFAULT '';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS car_model TEXT DEFAULT '';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS plates TEXT DEFAULT '';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS vin TEXT DEFAULT '';

-- Create parts table
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

ALTER TABLE parts DISABLE ROW LEVEL SECURITY;
ALTER PUBLICATION supabase_realtime ADD TABLE parts;

CREATE TRIGGER parts_updated BEFORE UPDATE ON parts FOR EACH ROW EXECUTE FUNCTION update_timestamp();
