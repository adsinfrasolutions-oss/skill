CREATE TABLE roles (
  id BIGSERIAL PRIMARY KEY,
  role_code VARCHAR(30) UNIQUE NOT NULL,
  role_name VARCHAR(80) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (role_code, role_name) VALUES
  ('ADMIN', 'Admin'),
  ('AMBASSADOR', 'Ambassador'),
  ('CLIENT', 'Client'),
  ('WORKER', 'Worker');

CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  role_id BIGINT NOT NULL REFERENCES roles(id),
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  mobile_number VARCHAR(20) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clients (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE REFERENCES users(id),
  company_name VARCHAR(180) NOT NULL,
  company_type VARCHAR(80),
  industry_focus VARCHAR(120),
  city VARCHAR(120),
  state_name VARCHAR(120),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ambassadors (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE REFERENCES users(id),
  referral_code VARCHAR(40) UNIQUE NOT NULL,
  zone_name VARCHAR(120),
  onboarding_status VARCHAR(20) NOT NULL DEFAULT 'APPROVED',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE industry_categories (
  id BIGSERIAL PRIMARY KEY,
  category_code VARCHAR(50) UNIQUE NOT NULL,
  category_name VARCHAR(150) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE industry_skills (
  id BIGSERIAL PRIMARY KEY,
  category_id BIGINT NOT NULL REFERENCES industry_categories(id),
  skill_code VARCHAR(50) UNIQUE NOT NULL,
  skill_name VARCHAR(150) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE worker_registrations (
  id BIGSERIAL PRIMARY KEY,
  worker_code VARCHAR(40) UNIQUE NOT NULL,
  user_id BIGINT UNIQUE REFERENCES users(id),
  ambassador_id BIGINT REFERENCES ambassadors(id),
  full_name VARCHAR(150) NOT NULL,
  mobile_number VARCHAR(20) NOT NULL,
  email VARCHAR(150),
  city VARCHAR(120) NOT NULL,
  state_name VARCHAR(120),
  category_id BIGINT NOT NULL REFERENCES industry_categories(id),
  primary_skill_id BIGINT NOT NULL REFERENCES industry_skills(id),
  experience_band VARCHAR(40) NOT NULL,
  availability_status VARCHAR(40) NOT NULL,
  worker_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  profile_summary TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE manpower_requests (
  id BIGSERIAL PRIMARY KEY,
  request_code VARCHAR(40) UNIQUE NOT NULL,
  client_id BIGINT NOT NULL REFERENCES clients(id),
  category_id BIGINT NOT NULL REFERENCES industry_categories(id),
  skill_id BIGINT REFERENCES industry_skills(id),
  required_count INTEGER NOT NULL,
  work_city VARCHAR(120) NOT NULL,
  work_state VARCHAR(120),
  start_date DATE,
  request_status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
  remarks TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE worker_location_pings (
  id BIGSERIAL PRIMARY KEY,
  worker_registration_id BIGINT NOT NULL REFERENCES worker_registrations(id),
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  accuracy_meters NUMERIC(8, 2),
  speed_kmph NUMERIC(8, 2),
  captured_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE client_location_pings (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES clients(id),
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  accuracy_meters NUMERIC(8, 2),
  captured_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE worker_assignments (
  id BIGSERIAL PRIMARY KEY,
  manpower_request_id BIGINT NOT NULL REFERENCES manpower_requests(id),
  worker_registration_id BIGINT NOT NULL REFERENCES worker_registrations(id),
  assignment_status VARCHAR(20) NOT NULL DEFAULT 'ASSIGNED',
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  check_in_time TIMESTAMP,
  check_out_time TIMESTAMP,
  UNIQUE (manpower_request_id, worker_registration_id)
);

CREATE TABLE location_alerts (
  id BIGSERIAL PRIMARY KEY,
  alert_type VARCHAR(40) NOT NULL,
  worker_assignment_id BIGINT REFERENCES worker_assignments(id),
  client_id BIGINT REFERENCES clients(id),
  alert_message TEXT NOT NULL,
  is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE worker_request_matches (
  id BIGSERIAL PRIMARY KEY,
  manpower_request_id BIGINT NOT NULL REFERENCES manpower_requests(id),
  worker_registration_id BIGINT NOT NULL REFERENCES worker_registrations(id),
  match_status VARCHAR(20) NOT NULL DEFAULT 'SHORTLISTED',
  matched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (manpower_request_id, worker_registration_id)
);

INSERT INTO industry_categories (category_code, category_name, description) VALUES
  ('CONSTRUCTION', 'Construction', 'Civil and structural manpower'),
  ('ELECTRICAL', 'Electrical', 'Industrial and project electrical manpower'),
  ('MECHANICAL', 'Mechanical', 'Fabrication and maintenance workforce'),
  ('HVAC', 'HVAC', 'Cooling and ventilation technicians'),
  ('FACILITY', 'Facility Management', 'Facility support and maintenance workforce');

INSERT INTO industry_skills (category_id, skill_code, skill_name)
SELECT c.id, s.skill_code, s.skill_name
FROM industry_categories c
JOIN (
  VALUES
    ('CONSTRUCTION', 'MASON', 'Mason'),
    ('CONSTRUCTION', 'BAR_BENDER', 'Bar Bender'),
    ('CONSTRUCTION', 'SHUTTERING_CARPENTER', 'Shuttering Carpenter'),
    ('ELECTRICAL', 'INDUSTRIAL_ELECTRICIAN', 'Industrial Electrician'),
    ('ELECTRICAL', 'PANEL_TECHNICIAN', 'Panel Technician'),
    ('MECHANICAL', 'WELDER', 'Welder'),
    ('MECHANICAL', 'FITTER', 'Fitter'),
    ('HVAC', 'AC_TECHNICIAN', 'AC Technician'),
    ('HVAC', 'DUCT_INSTALLER', 'Duct Installer'),
    ('FACILITY', 'HOUSEKEEPING_SUPERVISOR', 'Housekeeping Supervisor'),
    ('FACILITY', 'PLUMBER', 'Plumber')
) AS s(category_code, skill_code, skill_name)
  ON c.category_code = s.category_code;
