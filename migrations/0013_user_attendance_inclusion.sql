-- Attendance inclusion is a display/reporting control. Existing users remain
-- included, while excluded users and their historical records stay preserved.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS include_in_attendance boolean NOT NULL DEFAULT true;