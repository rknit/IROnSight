-- Initial schema for Ironsight dashboard

-- Temperature readings table
CREATE TABLE IF NOT EXISTS temperature_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  temperature DECIMAL(5,2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'celsius' CHECK (unit IN ('celsius', 'fahrenheit')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries on latest temperature
CREATE INDEX idx_temperature_readings_timestamp ON temperature_readings(timestamp DESC);

-- Aircon state table
CREATE TABLE IF NOT EXISTS aircon_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_on BOOLEAN NOT NULL DEFAULT false,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Insert initial aircon state
INSERT INTO aircon_state (is_on) VALUES (false);

-- IR protocols catalogue table
CREATE TABLE IF NOT EXISTS ir_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  protocol_type TEXT NOT NULL,
  frequency_khz INTEGER,
  is_selected BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure only one protocol can be selected at a time (trigger)
CREATE OR REPLACE FUNCTION ensure_single_protocol_selection()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_selected = true THEN
    UPDATE ir_protocols SET is_selected = false WHERE id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_single_protocol_selection
  BEFORE UPDATE OF is_selected ON ir_protocols
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_protocol_selection();

-- Enable Row Level Security
ALTER TABLE temperature_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE aircon_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE ir_protocols ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access
CREATE POLICY "Allow public read access on temperature_readings"
  ON temperature_readings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access on aircon_state"
  ON aircon_state FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access on ir_protocols"
  ON ir_protocols FOR SELECT
  TO public
  USING (true);

-- RLS Policies for public write access (can be restricted later with auth)
CREATE POLICY "Allow public insert on temperature_readings"
  ON temperature_readings FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update on aircon_state"
  ON aircon_state FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public update on ir_protocols"
  ON ir_protocols FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Enable Realtime for temperature readings
ALTER PUBLICATION supabase_realtime ADD TABLE temperature_readings;

-- Comments for documentation
COMMENT ON TABLE temperature_readings IS 'Stores temperature readings from sensors with timestamp';
COMMENT ON TABLE aircon_state IS 'Stores current state of the air conditioner (on/off)';
COMMENT ON TABLE ir_protocols IS 'Catalogue of available IR signal protocols for remote control';
