-- ═══════════════════════════════════════════════
-- АВТО СЕРВИС — Supabase Database Setup
-- ═══════════════════════════════════════════════
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- ═══════════════════════════════════════════════

-- Main table: stores the entire shop data as JSON
CREATE TABLE IF NOT EXISTS shop_data (
  id TEXT PRIMARY KEY DEFAULT 'default',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial row
INSERT INTO shop_data (id, data) 
VALUES ('default', '{"shopName": "Авто Сервис", "pin": "", "jobs": [], "customers": []}')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE shop_data ENABLE ROW LEVEL SECURITY;

-- Allow anyone with the anon key to read and write
-- (The app is protected by the PIN system, not by Supabase auth)
CREATE POLICY "Allow all access" ON shop_data
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shop_data_updated
  BEFORE UPDATE ON shop_data
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- Enable realtime for live sync between devices
ALTER PUBLICATION supabase_realtime ADD TABLE shop_data;
