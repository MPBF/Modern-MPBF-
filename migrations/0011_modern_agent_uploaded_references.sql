-- Private, long-lived references saved by Modern AI agent administrators.
-- These must never be placed in the global modern_agent_knowledge prompt store.

CREATE TABLE IF NOT EXISTS modern_agent_uploaded_references (
  id serial PRIMARY KEY,
  owner_id integer NOT NULL REFERENCES users(id),
  title varchar(300) NOT NULL,
  content text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_modern_agent_uploaded_refs_owner
  ON modern_agent_uploaded_references (owner_id, created_at);