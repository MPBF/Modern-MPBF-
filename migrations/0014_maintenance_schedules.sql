CREATE TABLE IF NOT EXISTS maintenance_schedules (
  id serial PRIMARY KEY,
  name varchar(200) NOT NULL,
  section_id varchar(20) NOT NULL REFERENCES sections(id),
  start_date date NOT NULL,
  next_due_date date NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  description text,
  created_by integer NOT NULL REFERENCES users(id),
  updated_by integer REFERENCES users(id),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_section
  ON maintenance_schedules (section_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_due
  ON maintenance_schedules (is_active, next_due_date);

CREATE TABLE IF NOT EXISTS maintenance_schedule_machines (
  id serial PRIMARY KEY,
  schedule_id integer NOT NULL REFERENCES maintenance_schedules(id) ON DELETE CASCADE,
  machine_id varchar(20) NOT NULL REFERENCES machines(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_schedule_machine
  ON maintenance_schedule_machines (schedule_id, machine_id);
CREATE INDEX IF NOT EXISTS idx_schedule_machines_schedule
  ON maintenance_schedule_machines (schedule_id);
CREATE INDEX IF NOT EXISTS idx_schedule_machines_machine
  ON maintenance_schedule_machines (machine_id);

CREATE TABLE IF NOT EXISTS maintenance_schedule_items (
  id serial PRIMARY KEY,
  schedule_id integer NOT NULL REFERENCES maintenance_schedules(id) ON DELETE CASCADE,
  component_id integer REFERENCES maintenance_component_catalog(id),
  component_name_ar varchar(200) NOT NULL,
  component_name_en varchar(200) NOT NULL,
  action_type varchar(40) NOT NULL DEFAULT 'inspection',
  quantity integer NOT NULL DEFAULT 1,
  notes text,
  created_at timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_schedule_items_schedule
  ON maintenance_schedule_items (schedule_id);
CREATE INDEX IF NOT EXISTS idx_schedule_items_component
  ON maintenance_schedule_items (component_id);

CREATE TABLE IF NOT EXISTS maintenance_schedule_runs (
  id serial PRIMARY KEY,
  schedule_id integer NOT NULL REFERENCES maintenance_schedules(id) ON DELETE CASCADE,
  scheduled_date date NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'pending',
  created_action_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  error_message text,
  started_at timestamp,
  completed_at timestamp,
  created_at timestamp DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_schedule_run_date
  ON maintenance_schedule_runs (schedule_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_schedule_runs_schedule
  ON maintenance_schedule_runs (schedule_id);
CREATE INDEX IF NOT EXISTS idx_schedule_runs_status
  ON maintenance_schedule_runs (status);