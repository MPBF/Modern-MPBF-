ALTER TABLE maintenance_schedules
  ADD COLUMN IF NOT EXISTS frequency_months integer NOT NULL DEFAULT 12;

ALTER TABLE maintenance_schedule_runs
  ADD COLUMN IF NOT EXISTS performed_by integer REFERENCES users(id);
ALTER TABLE maintenance_schedule_runs
  ADD COLUMN IF NOT EXISTS completed_by integer REFERENCES users(id);
ALTER TABLE maintenance_schedule_runs
  ADD COLUMN IF NOT EXISTS report_notes text;

CREATE TABLE IF NOT EXISTS maintenance_schedule_run_items (
  id serial PRIMARY KEY,
  run_id integer NOT NULL REFERENCES maintenance_schedule_runs(id) ON DELETE CASCADE,
  component_id integer REFERENCES maintenance_component_catalog(id),
  component_name_ar varchar(200) NOT NULL,
  component_name_en varchar(200) NOT NULL,
  required_action varchar(40) NOT NULL DEFAULT 'inspection',
  checked boolean NOT NULL DEFAULT false,
  condition varchar(20),
  result varchar(20),
  notes text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_schedule_run_items_run
  ON maintenance_schedule_run_items (run_id);
CREATE INDEX IF NOT EXISTS idx_schedule_run_items_component
  ON maintenance_schedule_run_items (component_id);