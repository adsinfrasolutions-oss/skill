CREATE TABLE IF NOT EXISTS skill_app_state (
  id INTEGER PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO skill_app_state (id, data, updated_at)
VALUES (
  1,
  $${
    "users": [
      {
        "id": "USR-1",
        "role": "ADMIN",
        "roleLabel": "Admin",
        "fullName": "Platform Admin",
        "email": "admin@skill.quantproc.com",
        "mobile": "9000000001"
      },
      {
        "id": "USR-2",
        "role": "AMBASSADOR",
        "roleLabel": "Ambassador",
        "fullName": "Field Ambassador",
        "email": "ambassador@skill.quantproc.com",
        "mobile": "9000000002"
      },
      {
        "id": "USR-3",
        "role": "CLIENT",
        "roleLabel": "Client",
        "fullName": "Client Coordinator",
        "email": "client@skill.quantproc.com",
        "mobile": "9000000003"
      },
      {
        "id": "USR-4",
        "role": "WORKER",
        "roleLabel": "Worker",
        "fullName": "Raj Kumar",
        "email": "worker@skill.quantproc.com",
        "mobile": "9000000004"
      },
      {
        "id": "USR-5",
        "role": "CLIENT",
        "roleLabel": "Client",
        "fullName": "Test Client",
        "email": "testclient@skill.quantproc.com",
        "mobile": "8220208102"
      },
      {
        "id": "USR-6",
        "role": "WORKER",
        "roleLabel": "Worker",
        "fullName": "Test Worker",
        "email": "testworker@skill.quantproc.com",
        "mobile": "6387454132"
      }
    ],
    "workers": [
      {
        "id": "WRK-1",
        "workerCode": "WKR-2026-001",
        "fullName": "Raj Kumar",
        "mobile": "9000000004",
        "email": "worker@skill.quantproc.com",
        "city": "Pune",
        "categoryCode": "ELECTRICAL",
        "categoryName": "Electrical",
        "skillName": "Industrial Electrician",
        "experienceBand": "5-10 Years",
        "availabilityStatus": "Immediate",
        "workerStatus": "APPROVED",
        "notes": "Industrial project experience",
        "ambassadorUserId": "USR-2"
      },
      {
        "id": "WRK-2",
        "workerCode": "WKR-2026-002",
        "fullName": "Salim Shaikh",
        "mobile": "9000000005",
        "email": "salim@skill.quantproc.com",
        "city": "Mumbai",
        "categoryCode": "MECHANICAL",
        "categoryName": "Mechanical",
        "skillName": "Welder",
        "experienceBand": "3-5 Years",
        "availabilityStatus": "Within 7 Days",
        "workerStatus": "PENDING",
        "notes": "Fabrication yard welder",
        "ambassadorUserId": "USR-2"
      },
      {
        "id": "WRK-3",
        "workerCode": "WKR-2026-003",
        "fullName": "Test Worker",
        "mobile": "6387454132",
        "email": "testworker@skill.quantproc.com",
        "city": "Chennai",
        "categoryCode": "FACILITY",
        "categoryName": "Facility Management",
        "skillName": "Security Guard",
        "experienceBand": "1-3 Years",
        "availabilityStatus": "Immediate",
        "workerStatus": "APPROVED",
        "notes": "OTP test worker account",
        "ambassadorUserId": "USR-2"
      }
    ],
    "locationPings": [
      {
        "userId": "USR-3",
        "role": "CLIENT",
        "roleLabel": "Client",
        "name": "Client Coordinator",
        "mobile": "9000000003",
        "label": "Warehouse Expansion Site",
        "latitude": 18.52043,
        "longitude": 73.85674,
        "capturedAt": "2026-04-23T09:53:02.643Z"
      },
      {
        "userId": "USR-4",
        "role": "WORKER",
        "roleLabel": "Worker",
        "name": "Raj Kumar",
        "mobile": "9000000004",
        "label": "On route to Metro Panel Upgrade",
        "latitude": 18.5312,
        "longitude": 73.8471,
        "capturedAt": "2026-04-23T09:53:02.643Z"
      }
    ],
    "otpRequests": [],
    "sessions": [],
    "categories": [
      {
        "code": "CONSTRUCTION",
        "name": "Construction",
        "skills": ["Mason", "Bar Bender", "Shuttering Carpenter", "Tile Setter"]
      },
      {
        "code": "ELECTRICAL",
        "name": "Electrical",
        "skills": ["Industrial Electrician", "Wireman", "Panel Technician", "Cable Jointer"]
      },
      {
        "code": "MECHANICAL",
        "name": "Mechanical",
        "skills": ["Welder", "Fitter", "Turner", "Lathe Operator"]
      },
      {
        "code": "HVAC",
        "name": "HVAC",
        "skills": ["AC Technician", "Duct Installer", "Chiller Operator"]
      },
      {
        "code": "FACILITY",
        "name": "Facility Management",
        "skills": ["Housekeeping Supervisor", "Security Guard", "Plumber"]
      }
    ]
  }$$::jsonb,
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET data = EXCLUDED.data,
    updated_at = NOW();
