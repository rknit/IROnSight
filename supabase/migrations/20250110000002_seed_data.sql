-- Seed data for IR protocols

-- Insert dummy IR protocols for testing
INSERT INTO ir_protocols (name, summary, protocol_type, frequency_khz, is_selected) VALUES
  ('NEC Protocol', 'Common protocol used in many Japanese electronics. Uses pulse distance encoding with 38kHz carrier.', 'NEC', 38, true),
  ('RC5 Protocol', 'Philips protocol using bi-phase encoding. Popular in European devices.', 'RC5', 36, false),
  ('RC6 Protocol', 'Enhanced version of RC5 with better reliability and more commands.', 'RC6', 36, false),
  ('Sony SIRC', 'Sony Infrared Remote Control protocol. Uses pulse width encoding.', 'SIRC', 40, false),
  ('Samsung Protocol', 'Samsung proprietary protocol similar to NEC but with different timing.', 'Samsung', 38, false),
  ('LG Protocol', 'LG proprietary protocol with extended address field.', 'LG', 38, false),
  ('Panasonic Protocol', 'Panasonic air conditioner protocol with complex state management.', 'Panasonic', 37, false),
  ('Sharp Protocol', 'Sharp protocol with unique address and command structure.', 'Sharp', 38, false);

-- Insert initial temperature reading for testing
INSERT INTO temperature_readings (temperature, unit) VALUES
  (25.5, 'celsius');

-- Add comment
COMMENT ON COLUMN ir_protocols.is_selected IS 'Only one protocol can be selected at a time (enforced by trigger)';
