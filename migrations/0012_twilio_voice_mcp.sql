-- Twilio Voice MCP support. All statements are idempotent so this migration
-- can be safely applied to existing MODERN databases.

ALTER TABLE mcp_api_keys
  ADD COLUMN IF NOT EXISTS voice_access boolean NOT NULL DEFAULT false;
ALTER TABLE mcp_api_keys
  ADD COLUMN IF NOT EXISTS voice_allowlist_bypass boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS twilio_allowed_phone_numbers (
  id serial PRIMARY KEY,
  phone_number varchar(20) NOT NULL UNIQUE,
  label varchar(200),
  is_active boolean NOT NULL DEFAULT true,
  created_by integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS twilio_voice_calls (
  id serial PRIMARY KEY,
  call_sid varchar(64) UNIQUE,
  requested_by integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mcp_api_key_id integer REFERENCES mcp_api_keys(id) ON DELETE CASCADE,
  to_number varchar(20) NOT NULL,
  from_number varchar(20) NOT NULL,
  message text,
  language varchar(10) NOT NULL DEFAULT 'ar-SA',
  voice_token_hash varchar(128) NOT NULL UNIQUE,
  status varchar(30) NOT NULL DEFAULT 'pending',
  error_code varchar(50),
  error_message varchar(500),
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  twiml_served_at timestamp,
  completed_at timestamp
);

CREATE INDEX IF NOT EXISTS idx_twilio_voice_calls_requested_created
  ON twilio_voice_calls (requested_by, created_at);
CREATE INDEX IF NOT EXISTS idx_twilio_voice_calls_status
  ON twilio_voice_calls (status);