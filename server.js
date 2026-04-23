const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");
const AUDIT_LOG_FILE = path.join(DATA_DIR, "audit.log");
const APP_HOST = process.env.APP_HOST || "skill.quantproc.com";
const PG_ENABLED = String(process.env.PG_ENABLED || "false").toLowerCase() === "true";
const PGHOST = process.env.PGHOST || "127.0.0.1";
const PGPORT = Number(process.env.PGPORT || 5432);
const PGDATABASE = process.env.PGDATABASE || "skill_quantproc";
const PGUSER = process.env.PGUSER || "skill_quantproc_user";
const PGPASSWORD = process.env.PGPASSWORD || "";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const SECRET_SEED = process.env.APP_SECRET || "quantproc-skill-security-baseline";
const OTP_PROVIDER = process.env.OTP_PROVIDER || "demo";
const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY || "";
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID || "";
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID || "";
const MSG91_REAL_OTP = String(process.env.MSG91_REAL_OTP || "false").toLowerCase() === "true";
const TRUSTED_ORIGINS = new Set([
  `https://${APP_HOST}`,
  `http://${APP_HOST}`,
  `http://localhost:${PORT}`,
  "http://127.0.0.1:3000",
  "http://localhost:3000",
]);
const TRUSTED_HOSTS = new Set([APP_HOST, `localhost:${PORT}`, "localhost:3000", "127.0.0.1:3000"]);
const rateLimits = new Map();

const roleCards = {
  ADMIN: [
    { title: "Approvals", description: "Approve workers, clients, and ambassadors from one control tower." },
    { title: "Category Master", description: "Maintain industries and skills used in registration and search." },
    { title: "Live Tracking", description: "Monitor client and worker locations in real time." },
    { title: "Operations", description: "Review requests, deployments, and exceptions by city or site." },
  ],
  AMBASSADOR: [
    { title: "Referrals", description: "Register manpower leads and follow onboarding completion." },
    { title: "My Workers", description: "See only the workers sourced through your network." },
    { title: "Location Watch", description: "Track field workers and client site positions." },
    { title: "Conversion", description: "Measure approvals, fulfilment, and payout readiness." },
  ],
  CLIENT: [
    { title: "Manpower Search", description: "Browse approved workers by industry, skill, and city." },
    { title: "Demand Planning", description: "Raise requirements for immediate or scheduled deployment." },
    { title: "Assigned Workforce", description: "Monitor active workers mapped to your projects." },
    { title: "Site Tracking", description: "Share site location and follow worker movement around it." },
  ],
  WORKER: [
    { title: "My Profile", description: "Update skills, availability, and personal details." },
    { title: "Live Location", description: "Share current location from your mobile device." },
    { title: "Assignments", description: "View pending and active project allocation." },
    { title: "Documents", description: "Keep KYC and trade credentials ready for approval." },
  ],
};

const categorySeed = [
  { code: "CONSTRUCTION", name: "Construction", skills: ["Mason", "Bar Bender", "Shuttering Carpenter", "Tile Setter"] },
  { code: "ELECTRICAL", name: "Electrical", skills: ["Industrial Electrician", "Wireman", "Panel Technician", "Cable Jointer"] },
  { code: "MECHANICAL", name: "Mechanical", skills: ["Welder", "Fitter", "Turner", "Lathe Operator"] },
  { code: "HVAC", name: "HVAC", skills: ["AC Technician", "Duct Installer", "Chiller Operator"] },
  { code: "FACILITY", name: "Facility Management", skills: ["Housekeeping Supervisor", "Security Guard", "Plumber"] },
];

const roles = [
  { code: "ADMIN", label: "Admin" },
  { code: "AMBASSADOR", label: "Ambassador" },
  { code: "CLIENT", label: "Client" },
  { code: "WORKER", label: "Worker" },
];
let PoolCtor = null;
let pgPool = null;
let storageReady = null;

try {
  ({ Pool: PoolCtor } = require("pg"));
} catch {}

function hashValue(value) {
  return crypto.createHmac("sha256", SECRET_SEED).update(String(value)).digest("hex");
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "unknown";
}

function audit(event, details = {}) {
  const record = {
    time: new Date().toISOString(),
    event,
    ...details,
  };
  try {
    fs.appendFileSync(AUDIT_LOG_FILE, JSON.stringify(record) + "\n", "utf8");
  } catch {}
}

function normalizeDataShape(raw) {
  let data = raw;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      data = {};
    }
  }
  const initial = buildInitialData();
  return {
    users: Array.isArray(data?.users)
      ? data.users.map((user) => ({
          ...user,
          alertPreferences: {
            nearbyAlertsEnabled: user?.alertPreferences?.nearbyAlertsEnabled !== false,
          },
        }))
      : initial.users,
    workers: Array.isArray(data?.workers) ? data.workers : initial.workers,
    engineers: Array.isArray(data?.engineers) ? data.engineers : [],
    notifications: Array.isArray(data?.notifications) ? data.notifications : [],
    locationPings: Array.isArray(data?.locationPings) ? data.locationPings : initial.locationPings,
    projectLocations: Array.isArray(data?.projectLocations) ? data.projectLocations : [],
    wageOffers: Array.isArray(data?.wageOffers) ? data.wageOffers : [],
    otpRequests: Array.isArray(data?.otpRequests) ? data.otpRequests : [],
    sessions: Array.isArray(data?.sessions) ? data.sessions : [],
    categories: Array.isArray(data?.categories) ? data.categories : initial.categories,
  };
}

function cleanExpiredSecurityState(data) {
  const now = Date.now();
  data.otpRequests = Array.isArray(data?.otpRequests) ? data.otpRequests.filter((item) => item.expiresAt > now) : [];
  data.sessions = Array.isArray(data?.sessions) ? data.sessions.filter((item) => item.expiresAt > now) : [];
}

function setSecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(self), camera=(), microphone=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data:",
      "connect-src 'self'",
      "manifest-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
    ].join("; ")
  );
}

function sendEmpty(res, status) {
  setSecurityHeaders(res);
  res.writeHead(status);
  res.end();
}

function allowCors(req, res) {
  const origin = req.headers.origin;
  if (origin && TRUSTED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  }
}

function normalizeHost(req) {
  return String(req.headers.host || "").toLowerCase();
}

function isTrustedHost(req) {
  const host = normalizeHost(req).split("/")[0];
  return TRUSTED_HOSTS.has(host);
}

function ensureTrustedRequest(req, res) {
  if (!isTrustedHost(req)) {
    audit("blocked_host", { host: req.headers.host, ip: getClientIp(req) });
    sendJson(res, 403, { message: "Untrusted host." });
    return false;
  }
  const origin = req.headers.origin;
  if (origin && !TRUSTED_ORIGINS.has(origin)) {
    audit("blocked_origin", { origin, ip: getClientIp(req) });
    sendJson(res, 403, { message: "Untrusted origin." });
    return false;
  }
  return true;
}

function enforceRateLimit(req, res, key, limit, windowMs) {
  const bucketKey = `${key}:${getClientIp(req)}`;
  const now = Date.now();
  const existing = rateLimits.get(bucketKey);
  const bucket = !existing || existing.resetAt <= now ? { count: 0, resetAt: now + windowMs } : existing;
  bucket.count += 1;
  rateLimits.set(bucketKey, bucket);
  res.setHeader("X-RateLimit-Limit", String(limit));
  res.setHeader("X-RateLimit-Remaining", String(Math.max(limit - bucket.count, 0)));
  if (bucket.count > limit) {
    audit("rate_limit", { key, ip: getClientIp(req) });
    sendJson(res, 429, { message: "Too many requests. Please try again later." });
    return false;
  }
  return true;
}

function requireJson(req, res) {
  const contentType = String(req.headers["content-type"] || "");
  if (req.method === "POST" && !contentType.includes("application/json")) {
    sendJson(res, 415, { message: "Content-Type must be application/json." });
    return false;
  }
  return true;
}

function validateRole(role) {
  return roles.some((entry) => entry.code === role);
}

function sanitizeMobile(mobile) {
  return String(mobile || "").replace(/\D/g, "").slice(-10);
}

function sanitizeText(value, max = 120) {
  return String(value || "").replace(/[<>]/g, "").trim().slice(0, max);
}

function validateWorkerPayload(body) {
  const mobile = sanitizeMobile(body.mobile);
  const city = sanitizeText(body.city, 80);
  const fullName = sanitizeText(body.fullName, 150);
  const email = sanitizeText(body.email, 150).toLowerCase();
  const notes = sanitizeText(body.notes, 500);

  if (!fullName || fullName.length < 2) return { error: "Worker full name is required." };
  if (!/^\d{10}$/.test(mobile)) return { error: "Worker mobile must be a valid 10-digit number." };
  if (!city) return { error: "City is required." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Email is invalid." };

  const visibilityStatus = sanitizeText(body.visibilityStatus || "VISIBLE", 20).toUpperCase();
  const shiftPreference = sanitizeText(body.shiftPreference || "DAY", 20).toUpperCase();
  const wageFlexibility = sanitizeText(body.wageFlexibility || "NEGOTIABLE", 20).toUpperCase();
  const preferredDayWage = Number(body.preferredDayWage || 0);
  const preferredNightWage = Number(body.preferredNightWage || 0);
  const serviceRadiusKm = Number(body.serviceRadiusKm || 25);

  return {
    value: {
      fullName,
      mobile,
      email,
      city,
      categoryCode: sanitizeText(body.categoryCode, 50).toUpperCase(),
      skillName: sanitizeText(body.skillName, 150),
      experienceBand: sanitizeText(body.experienceBand, 40),
      availabilityStatus: sanitizeText(body.availabilityStatus, 40),
      visibilityStatus: ["VISIBLE", "HIDDEN"].includes(visibilityStatus) ? visibilityStatus : "VISIBLE",
      shiftPreference: ["DAY", "NIGHT", "BOTH"].includes(shiftPreference) ? shiftPreference : "DAY",
      preferredDayWage: Number.isFinite(preferredDayWage) ? Math.max(0, Math.round(preferredDayWage)) : 0,
      preferredNightWage: Number.isFinite(preferredNightWage) ? Math.max(0, Math.round(preferredNightWage)) : 0,
      wageFlexibility: ["FIXED", "NEGOTIABLE"].includes(wageFlexibility) ? wageFlexibility : "NEGOTIABLE",
      serviceRadiusKm: Number.isFinite(serviceRadiusKm) ? Math.min(500, Math.max(1, Math.round(serviceRadiusKm))) : 25,
      notes,
    },
  };
}

function validateWorkerPreferencePayload(body) {
  const visibilityStatus = sanitizeText(body.visibilityStatus || "VISIBLE", 20).toUpperCase();
  const shiftPreference = sanitizeText(body.shiftPreference || "DAY", 20).toUpperCase();
  const wageFlexibility = sanitizeText(body.wageFlexibility || "NEGOTIABLE", 20).toUpperCase();
  const liveStatus = sanitizeText(body.liveStatus || "AVAILABLE", 20).toUpperCase();
  const preferredDayWage = Number(body.preferredDayWage || 0);
  const preferredNightWage = Number(body.preferredNightWage || 0);
  const serviceRadiusKm = Number(body.serviceRadiusKm || 25);

  if (!["VISIBLE", "HIDDEN"].includes(visibilityStatus)) return { error: "Visibility choice is invalid." };
  if (!["DAY", "NIGHT", "BOTH"].includes(shiftPreference)) return { error: "Shift choice is invalid." };
  if (!["FIXED", "NEGOTIABLE"].includes(wageFlexibility)) return { error: "Wage flexibility is invalid." };
  if (!["AVAILABLE", "OFF_DUTY"].includes(liveStatus)) return { error: "Duty status is invalid." };
  if (!Number.isFinite(preferredDayWage) || preferredDayWage < 0) return { error: "Day wage is invalid." };
  if (!Number.isFinite(preferredNightWage) || preferredNightWage < 0) return { error: "Night wage is invalid." };
  if (!Number.isFinite(serviceRadiusKm) || serviceRadiusKm < 1 || serviceRadiusKm > 500) return { error: "Service radius must be between 1 and 500 km." };

  return {
    value: {
      visibilityStatus,
      shiftPreference,
      preferredDayWage: Math.round(preferredDayWage),
      preferredNightWage: Math.round(preferredNightWage),
      wageFlexibility,
      serviceRadiusKm: Math.round(serviceRadiusKm),
      liveStatus,
    },
  };
}

function validateWageOfferPayload(body) {
  const workerId = sanitizeText(body.workerId, 40);
  const shiftType = sanitizeText(body.shiftType || "DAY", 20).toUpperCase();
  const offeredDayWage = Number(body.offeredDayWage || 0);
  const offeredNightWage = Number(body.offeredNightWage || 0);
  const message = sanitizeText(body.message, 240);

  if (!workerId) return { error: "Worker is required." };
  if (!["DAY", "NIGHT", "BOTH"].includes(shiftType)) return { error: "Shift type is invalid." };
  if (!Number.isFinite(offeredDayWage) || offeredDayWage < 0) return { error: "Offer day wage is invalid." };
  if (!Number.isFinite(offeredNightWage) || offeredNightWage < 0) return { error: "Offer night wage is invalid." };

  return {
    value: {
      workerId,
      shiftType,
      offeredDayWage: Math.round(offeredDayWage),
      offeredNightWage: Math.round(offeredNightWage),
      message,
    },
  };
}

function validateProjectLocationPayload(body) {
  const siteName = sanitizeText(body.siteName, 150);
  const country = sanitizeText(body.country, 80);
  const state = sanitizeText(body.state, 80);
  const district = sanitizeText(body.district, 80);
  const streetAddress = sanitizeText(body.streetAddress, 220);
  const latitude = body.latitude === null || body.latitude === undefined || body.latitude === "" ? null : Number(body.latitude);
  const longitude = body.longitude === null || body.longitude === undefined || body.longitude === "" ? null : Number(body.longitude);

  if (!siteName) return { error: "Project/site name is required." };
  if (!country || !state || !district) return { error: "Country, state, and district are required." };
  if (!streetAddress) return { error: "Street address is required." };
  if ((latitude !== null && !Number.isFinite(latitude)) || (longitude !== null && !Number.isFinite(longitude))) {
    return { error: "Project latitude/longitude is invalid." };
  }
  if ((latitude !== null && (latitude < -90 || latitude > 90)) || (longitude !== null && (longitude < -180 || longitude > 180))) {
    return { error: "Project latitude/longitude is out of range." };
  }

  return {
    value: {
      siteName,
      country,
      state,
      district,
      streetAddress,
      latitude,
      longitude,
    },
  };
}

function validateEngineerPayload(body) {
  const fullName = sanitizeText(body.fullName, 150);
  const mobile = sanitizeMobile(body.mobile);
  const email = sanitizeText(body.email, 150).toLowerCase();
  const city = sanitizeText(body.city, 80);
  const educationLevel = sanitizeText(body.educationLevel, 60);
  const professionalField = sanitizeText(body.professionalField, 80);
  const professionalCategory = sanitizeText(body.professionalCategory, 120);
  const specialization = sanitizeText(body.specialization, 160);
  const experienceBand = sanitizeText(body.experienceBand, 40);
  const currentEmployer = sanitizeText(body.currentEmployer, 160);
  const currentDesignation = sanitizeText(body.currentDesignation, 120);
  const noticePeriod = sanitizeText(body.noticePeriod, 40);
  const resumeSummary = sanitizeText(body.resumeSummary, 2000);
  const currentSalary = Number(body.currentSalary || 0);
  const expectedSalary = Number(body.expectedSalary || 0);
  const resumeAttachment = body.resumeAttachment && typeof body.resumeAttachment === "object"
    ? {
        fileName: sanitizeText(body.resumeAttachment.fileName, 160),
        fileType: sanitizeText(body.resumeAttachment.fileType, 120),
        dataUrl: String(body.resumeAttachment.dataUrl || "").slice(0, 8_000_000),
      }
    : null;

  if (!fullName || fullName.length < 2) return { error: "Professional candidate full name is required." };
  if (!/^\d{10}$/.test(mobile)) return { error: "Mobile must be a valid 10-digit number." };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Valid email is required." };
  if (!city) return { error: "Current city is required." };
  if (!educationLevel) return { error: "Education level is required." };
  if (!professionalField) return { error: "Field / stream is required." };
  if (!professionalCategory) return { error: "Role applied is required." };
  if (!specialization) return { error: "Specialization is required." };
  if (!experienceBand) return { error: "Experience is required." };
  if (!currentEmployer) return { error: "Current employer is required." };
  if (!currentDesignation) return { error: "Current designation is required." };
  if (!noticePeriod) return { error: "Notice period is required." };
  if (!resumeSummary || resumeSummary.length < 20) return { error: "Resume summary is required." };
  if (!Number.isFinite(currentSalary) || currentSalary < 0) return { error: "Current salary is invalid." };
  if (!Number.isFinite(expectedSalary) || expectedSalary < 0) return { error: "Expected salary is invalid." };
  if (resumeAttachment && (!resumeAttachment.fileName || !resumeAttachment.dataUrl.startsWith("data:"))) {
    return { error: "Resume file is invalid." };
  }

  return {
    value: {
      fullName,
      mobile,
      email,
      city,
      educationLevel,
      professionalField,
      professionalCategory,
      specialization,
      experienceBand,
      currentEmployer,
      currentDesignation,
      currentSalary: Math.round(currentSalary),
      expectedSalary: Math.round(expectedSalary),
      noticePeriod,
      resumeSummary,
      resumeAttachment,
    },
  };
}

function buildInitialData() {
  const now = new Date().toISOString();
  return {
    users: [
      {
        id: "USR-1",
        role: "ADMIN",
        roleLabel: "Admin",
        fullName: "Platform Admin",
        email: "admin@skill.quantproc.com",
        mobile: "9000000001",
        alertPreferences: { nearbyAlertsEnabled: true },
      },
      {
        id: "USR-2",
        role: "AMBASSADOR",
        roleLabel: "Ambassador",
        fullName: "Field Ambassador",
        email: "ambassador@skill.quantproc.com",
        mobile: "9000000002",
        alertPreferences: { nearbyAlertsEnabled: true },
      },
      {
        id: "USR-3",
        role: "CLIENT",
        roleLabel: "Client",
        fullName: "Client Coordinator",
        email: "client@skill.quantproc.com",
        mobile: "9000000003",
        alertPreferences: { nearbyAlertsEnabled: true },
      },
      {
        id: "USR-4",
        role: "WORKER",
        roleLabel: "Worker",
        fullName: "Raj Kumar",
        email: "worker@skill.quantproc.com",
        mobile: "9000000004",
        alertPreferences: { nearbyAlertsEnabled: true },
      },
      {
        id: "USR-5",
        role: "CLIENT",
        roleLabel: "Client",
        fullName: "Test Client",
        email: "testclient@skill.quantproc.com",
        mobile: "8220208102",
        alertPreferences: { nearbyAlertsEnabled: true },
      },
      {
        id: "USR-6",
        role: "WORKER",
        roleLabel: "Worker",
        fullName: "Test Worker",
        email: "testworker@skill.quantproc.com",
        mobile: "6387454132",
        alertPreferences: { nearbyAlertsEnabled: true },
      }
    ],
    workers: [
      {
        id: "WRK-1",
        workerCode: "WKR-2026-001",
        fullName: "Raj Kumar",
        mobile: "9000000004",
        email: "worker@skill.quantproc.com",
        city: "Pune",
        categoryCode: "ELECTRICAL",
        categoryName: "Electrical",
        skillName: "Industrial Electrician",
        experienceBand: "5-10 Years",
        availabilityStatus: "Immediate",
        visibilityStatus: "VISIBLE",
        shiftPreference: "DAY",
        preferredDayWage: 950,
        preferredNightWage: 1250,
        wageFlexibility: "NEGOTIABLE",
        serviceRadiusKm: 30,
        liveStatus: "AVAILABLE",
        workerStatus: "APPROVED",
        notes: "Industrial project experience",
        ambassadorUserId: "USR-2",
      },
      {
        id: "WRK-2",
        workerCode: "WKR-2026-002",
        fullName: "Salim Shaikh",
        mobile: "9000000005",
        email: "salim@skill.quantproc.com",
        city: "Mumbai",
        categoryCode: "MECHANICAL",
        categoryName: "Mechanical",
        skillName: "Welder",
        experienceBand: "3-5 Years",
        availabilityStatus: "Within 7 Days",
        visibilityStatus: "VISIBLE",
        shiftPreference: "BOTH",
        preferredDayWage: 1100,
        preferredNightWage: 1450,
        wageFlexibility: "NEGOTIABLE",
        serviceRadiusKm: 45,
        liveStatus: "AVAILABLE",
        workerStatus: "PENDING",
        notes: "Fabrication yard welder",
        ambassadorUserId: "USR-2",
      },
      {
        id: "WRK-3",
        workerCode: "WKR-2026-003",
        fullName: "Test Worker",
        mobile: "6387454132",
        email: "testworker@skill.quantproc.com",
        city: "Chennai",
        categoryCode: "FACILITY",
        categoryName: "Facility Management",
        skillName: "Security Guard",
        experienceBand: "1-3 Years",
        availabilityStatus: "Immediate",
        visibilityStatus: "VISIBLE",
        shiftPreference: "NIGHT",
        preferredDayWage: 700,
        preferredNightWage: 950,
        wageFlexibility: "FIXED",
        serviceRadiusKm: 20,
        liveStatus: "AVAILABLE",
        workerStatus: "APPROVED",
        notes: "OTP test worker account",
        ambassadorUserId: "USR-2",
      }
    ],
    locationPings: [
      {
        userId: "USR-3",
        role: "CLIENT",
        roleLabel: "Client",
        name: "Client Coordinator",
        mobile: "9000000003",
        label: "Warehouse Expansion Site",
        latitude: 18.52043,
        longitude: 73.85674,
        capturedAt: now,
      },
      {
        userId: "USR-4",
        role: "WORKER",
        roleLabel: "Worker",
        name: "Raj Kumar",
        mobile: "9000000004",
        label: "On route to Metro Panel Upgrade",
        latitude: 18.5312,
        longitude: 73.8471,
        capturedAt: now,
      },
    ],
    projectLocations: [],
    wageOffers: [],
    engineers: [],
    notifications: [],
    otpRequests: [],
    sessions: [],
    categories: categorySeed,
  };
}

function ensureData() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DATA_FILE)) return;
  fs.writeFileSync(DATA_FILE, JSON.stringify(buildInitialData(), null, 2), "utf8");
}

async function initStorage() {
  if (storageReady) return storageReady;
  storageReady = (async () => {
    if (!PG_ENABLED) {
      ensureData();
      return;
    }
    if (!PoolCtor) {
      throw new Error("PG_ENABLED is true but the pg package is not installed.");
    }
    pgPool = new PoolCtor({
      host: PGHOST,
      port: PGPORT,
      database: PGDATABASE,
      user: PGUSER,
      password: PGPASSWORD,
      ssl: false,
      max: 10,
      idleTimeoutMillis: 30000,
    });
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS skill_app_state (
        id INTEGER PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    const existing = await pgPool.query("SELECT id FROM skill_app_state WHERE id = 1");
    if (!existing.rowCount) {
      await pgPool.query(
        "INSERT INTO skill_app_state (id, data, updated_at) VALUES (1, $1::jsonb, NOW())",
        [JSON.stringify(buildInitialData())]
      );
    }
  })();
  return storageReady;
}

async function readData() {
  await initStorage();
  if (PG_ENABLED && pgPool) {
    const result = await pgPool.query("SELECT data FROM skill_app_state WHERE id = 1");
    if (!result.rowCount) {
      const initial = buildInitialData();
      await writeData(initial);
      return initial;
    }
    return normalizeDataShape(result.rows[0].data);
  }
  ensureData();
  return normalizeDataShape(JSON.parse(fs.readFileSync(DATA_FILE, "utf8")));
}

async function writeData(data) {
  await initStorage();
  if (PG_ENABLED && pgPool) {
    await pgPool.query(
      `
        INSERT INTO skill_app_state (id, data, updated_at)
        VALUES (1, $1::jsonb, NOW())
        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
      `,
      [JSON.stringify(data)]
    );
    return;
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

function sendJson(res, status, payload) {
  setSecurityHeaders(res);
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

function sendFile(res, filePath, contentType) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendJson(res, 404, { message: "Not found" });
      return;
    }
    setSecurityHeaders(res);
    if (contentType.includes("html")) {
      res.setHeader("Cache-Control", "no-store");
    } else if (filePath.endsWith("sw.js")) {
      res.setHeader("Cache-Control", "no-cache");
    } else {
      res.setHeader("Cache-Control", "public, max-age=3600");
    }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  });
}

function sendBuffer(res, status, buffer, contentType, fileName, inline = true) {
  setSecurityHeaders(res);
  res.writeHead(status, {
    "Content-Type": contentType,
    "Content-Length": buffer.length,
    "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${fileName}"`,
  });
  res.end(buffer);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
      if (body.length > 1_000_000) {
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function authUser(req, data) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  const tokenHash = hashValue(token);
  const session = data.sessions.find((item) => safeEqual(item.tokenHash, tokenHash));
  if (!session) return null;
  return data.users.find((user) => user.id === session.userId) || null;
}

function workerViewForUser(data, user) {
  if (!user) return [];
  if (user.role === "ADMIN") return data.workers;
  if (user.role === "CLIENT") {
    return data.workers.filter(
      (worker) => worker.workerStatus === "APPROVED" && worker.visibilityStatus !== "HIDDEN" && worker.liveStatus !== "OFF_DUTY"
    );
  }
  if (user.role === "AMBASSADOR") {
    return data.workers.filter((worker) => worker.ambassadorUserId === user.id);
  }
  return data.workers.filter((worker) => worker.mobile === user.mobile || worker.email === user.email);
}

function visibleLocationsForUser(data, user) {
  return data.locationPings.filter((item) => {
    if (user.role === "ADMIN") return true;
    if (user.role === "CLIENT") {
      if (item.role === "WORKER") {
        const worker = data.workers.find((entry) => entry.mobile === item.mobile);
        return worker && worker.visibilityStatus !== "HIDDEN" && worker.liveStatus !== "OFF_DUTY";
      }
      return item.userId === user.id;
    }
    if (user.role === "AMBASSADOR") {
      const worker = data.workers.find((entry) => entry.mobile === item.mobile);
      return item.userId === user.id || worker?.ambassadorUserId === user.id;
    }
    return item.userId === user.id || item.role === "CLIENT";
  });
}

function buildWageInsightForWorker(worker) {
  const nightPremium = Math.max(0, (worker.preferredNightWage || 0) - (worker.preferredDayWage || 0));
  const visibilityLine =
    worker.visibilityStatus === "HIDDEN"
      ? "You are hidden from clients right now."
      : "Clients can see you right now.";
  return {
    title: "Worker wage guide",
    message: `${visibilityLine} Preferred shift: ${worker.shiftPreference}. Day wage Rs ${worker.preferredDayWage || 0}, night wage Rs ${worker.preferredNightWage || 0}. Night premium Rs ${nightPremium}.`,
  };
}

function buildClientInsight(data) {
  const visibleWorkers = data.workers.filter(
    (worker) => worker.workerStatus === "APPROVED" && worker.visibilityStatus !== "HIDDEN" && worker.liveStatus !== "OFF_DUTY"
  );
  if (!visibleWorkers.length) {
    return {
      title: "Client hiring tip",
      message: "No visible worker is available right now. Ask admin or wait for workers to switch on visibility.",
    };
  }
  const dayAverage = Math.round(visibleWorkers.reduce((sum, worker) => sum + (worker.preferredDayWage || 0), 0) / visibleWorkers.length);
  const nightAverage = Math.round(visibleWorkers.reduce((sum, worker) => sum + (worker.preferredNightWage || 0), 0) / visibleWorkers.length);
  return {
    title: "AI wage hint",
    message: `Visible workers are currently around Rs ${dayAverage} for day duty and Rs ${nightAverage} for night duty. Sending fair offers improves acceptance.`,
  };
}

function buildOfferSummary(worker, offer) {
  const dayGap = offer.offeredDayWage - (worker.preferredDayWage || 0);
  const nightGap = offer.offeredNightWage - (worker.preferredNightWage || 0);
  if (dayGap >= 0 && nightGap >= 0) {
    return "This offer meets or beats the worker's preferred wage.";
  }
  if (worker.wageFlexibility === "FIXED") {
    return "This worker prefers fixed wages. Lower offers are less likely to be accepted.";
  }
  return "This offer is below the worker's preferred wage. Worker may decline or wait for a better offer.";
}

function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function projectToPoint(project, index = 0) {
  if (Number.isFinite(Number(project.latitude)) && Number.isFinite(Number(project.longitude))) {
    return {
      latitude: Number(project.latitude),
      longitude: Number(project.longitude),
    };
  }
  const key = `${project.country}|${project.state}|${project.district}|${project.streetAddress}|${project.siteName}`;
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
  }
  return {
    latitude: 8 + Math.abs(hash % 70) + index * 0.01,
    longitude: 68 + Math.abs((hash >> 3) % 70) + index * 0.01,
  };
}

function buildNearbyMatches(data, user) {
  const workersWithLocation = (data.workers || [])
    .filter((worker) => worker.workerStatus === "APPROVED" && worker.visibilityStatus !== "HIDDEN" && worker.liveStatus !== "OFF_DUTY")
    .map((worker) => {
      const ping = (data.locationPings || []).find((item) => item.role === "WORKER" && item.mobile === worker.mobile);
      return ping ? { worker, ping } : null;
    })
    .filter(Boolean);

  const targets = [
    ...(data.locationPings || [])
      .filter((item) => item.role === "CLIENT")
      .map((item) => ({
        type: "Client Mobile",
        targetId: item.userId,
        targetName: item.name,
        latitude: item.latitude,
        longitude: item.longitude,
        summary: item.label || "Client live mobile position",
      })),
    ...((data.projectLocations || []).map((project, index) => {
      const point = projectToPoint(project, index);
      return {
        type: "Project Site",
        targetId: project.id,
        targetName: project.siteName,
        latitude: point.latitude,
        longitude: point.longitude,
        summary: `${project.streetAddress}, ${project.district}, ${project.state}`,
      };
    })),
  ];

  let matches = [];
  for (const { worker, ping } of workersWithLocation) {
    for (const target of targets) {
      const distanceKm = haversineDistanceKm(Number(ping.latitude), Number(ping.longitude), Number(target.latitude), Number(target.longitude));
      const serviceRadiusKm = Number(worker.serviceRadiusKm || 25);
      if (distanceKm <= serviceRadiusKm) {
        matches.push({
          workerId: worker.id,
          workerName: worker.fullName,
          targetId: target.targetId,
          targetName: target.targetName,
          matchType: target.type,
          distanceKm: Number(distanceKm.toFixed(1)),
          serviceRadiusKm,
          summary: `${worker.skillName} available near ${target.targetName}.`,
          clientUserId: target.type === "Client Mobile" ? target.targetId : null,
        });
      }
    }
  }

  if (user.role === "WORKER") {
    const myWorker = (data.workers || []).find((item) => item.mobile === user.mobile || item.email === user.email);
    matches = myWorker ? matches.filter((item) => item.workerId === myWorker.id) : [];
  } else if (user.role === "CLIENT") {
    matches = matches.filter((item) => item.clientUserId === user.id || item.matchType === "Project Site");
  } else if (user.role === "AMBASSADOR") {
    matches = matches.filter((item) => {
      const worker = (data.workers || []).find((entry) => entry.id === item.workerId);
      return worker?.ambassadorUserId === user.id;
    });
  }

  return matches.sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 12);
}

function ensureNearbyNotifications(data) {
  data.notifications = Array.isArray(data.notifications) ? data.notifications : [];
  const adminUsers = (data.users || []).filter((user) => user.role === "ADMIN");
  const allMatches = buildNearbyMatches(data, adminUsers[0] || { role: "ADMIN", id: "SYSTEM" });

  for (const match of allMatches) {
    const notificationKey = `${match.workerId}:${match.targetId}:${match.matchType}`;
    const exists = data.notifications.some((item) => item.matchKey === notificationKey);
    if (exists) continue;

    const worker = (data.workers || []).find((item) => item.id === match.workerId);
    if (!worker) continue;
    const recipients = new Set();
    if (worker.ambassadorUserId) recipients.add(worker.ambassadorUserId);
    adminUsers.forEach((user) => recipients.add(user.id));
    if (match.clientUserId) recipients.add(match.clientUserId);
    const workerUser = (data.users || []).find((user) => user.mobile === worker.mobile || user.email === worker.email);
    if (workerUser) recipients.add(workerUser.id);

    for (const recipientUserId of recipients) {
      const recipient = (data.users || []).find((user) => user.id === recipientUserId);
      if (recipient?.alertPreferences?.nearbyAlertsEnabled === false) {
        continue;
      }
      data.notifications.push({
        id: `NTF-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        recipientUserId,
        matchKey: notificationKey,
        title: `${match.workerName} is nearby`,
        message: `${match.workerName} is within ${match.distanceKm} km of ${match.targetName}. Radius set: ${match.serviceRadiusKm} km.`,
        createdAt: new Date().toISOString(),
        readAt: null,
      });
    }
  }
}

function visibleOffersForUser(data, user) {
  if (user.role === "ADMIN" || user.role === "AMBASSADOR") return data.wageOffers || [];
  if (user.role === "CLIENT") return (data.wageOffers || []).filter((offer) => offer.clientUserId === user.id);
  const worker = data.workers.find((entry) => entry.mobile === user.mobile || entry.email === user.email);
  return worker ? (data.wageOffers || []).filter((offer) => offer.workerId === worker.id) : [];
}

function buildDashboard(data, user) {
  const visibleWorkers = workerViewForUser(data, user);
  const visibleLocations = visibleLocationsForUser(data, user);
  const visibleEngineers =
    user.role === "ADMIN" || user.role === "CLIENT"
      ? (data.engineers || [])
      : user.role === "AMBASSADOR"
        ? (data.engineers || []).filter((engineer) => engineer.ambassadorUserId === user.id)
        : [];
  const myWorkerProfile = data.workers.find((worker) => worker.mobile === user.mobile || worker.email === user.email) || null;
  const aiInsights = [];
  if (user.role === "WORKER" && myWorkerProfile) {
    aiInsights.push(buildWageInsightForWorker(myWorkerProfile));
  }
  if (user.role === "CLIENT") {
    aiInsights.push(buildClientInsight(data));
  }
  if (user.role === "ADMIN") {
    aiInsights.push({
      title: "Operations pulse",
      message: `${data.workers.filter((worker) => worker.visibilityStatus === "HIDDEN").length} workers are hidden and ${data.wageOffers.filter((offer) => offer.status === "PENDING").length} wage offers are waiting for action.`,
    });
  }

  return {
    cards: roleCards[user.role],
    stats: {
      totalWorkers: data.workers.length,
      totalProfessionals: (data.engineers || []).length,
      approvedWorkers: data.workers.filter((worker) => worker.workerStatus === "APPROVED").length,
      clientsTracked: data.locationPings.filter((item) => item.role === "CLIENT").length,
      workersTracked: data.locationPings.filter((item) => item.role === "WORKER").length,
      pendingOffers: data.wageOffers.filter((offer) => offer.status === "PENDING").length,
    },
    workers: visibleWorkers,
    engineers: visibleEngineers,
    locations: visibleLocations.sort((a, b) => new Date(b.capturedAt) - new Date(a.capturedAt)).slice(0, 10),
    projectLocations: Array.isArray(data.projectLocations) ? data.projectLocations : [],
    nearbyMatches: buildNearbyMatches(data, user),
    notifications: (data.notifications || [])
      .filter((item) => item.recipientUserId === user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20),
    alertPreferences: user.alertPreferences || { nearbyAlertsEnabled: true },
    wageOffers: visibleOffersForUser(data, user).map((offer) => {
      const worker = data.workers.find((entry) => entry.id === offer.workerId);
      return {
        ...offer,
        aiSummary: worker ? buildOfferSummary(worker, offer) : offer.aiSummary || "",
      };
    }),
    aiInsights,
    myWorkerProfile,
  };
}

function createOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function createToken() {
  return crypto.randomBytes(24).toString("hex");
}

function isLocalHost(host) {
  return host.startsWith("localhost") || host.startsWith("127.0.0.1");
}

function hasMsg91Config() {
  return Boolean(MSG91_AUTH_KEY && MSG91_TEMPLATE_ID);
}

function buildMsg91Url(mobile, otp) {
  const params = new URLSearchParams({
    authkey: MSG91_AUTH_KEY,
    mobile: `91${mobile}`,
    template_id: MSG91_TEMPLATE_ID,
    otp,
    otp_length: String(otp.length),
    otp_expiry: String(Math.max(1, Math.floor(OTP_TTL_MS / 60000))),
  });
  if (MSG91_SENDER_ID) params.set("sender", MSG91_SENDER_ID);
  return `https://control.msg91.com/api/v5/otp?${params.toString()}`;
}

async function sendOtpViaMsg91(mobile, otp) {
  const response = await fetch(buildMsg91Url(mobile, otp), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { raw: text };
  }

  if (!response.ok) {
    throw new Error(payload?.message || payload?.type || "MSG91 OTP send failed.");
  }

  return payload;
}

const server = http.createServer(async (req, res) => {
  allowCors(req, res);
  if (req.method === "OPTIONS") {
    sendEmpty(res, 204);
    return;
  }

  const host = normalizeHost(req) || `localhost:${PORT}`;
  const protocol = req.socket.encrypted || String(req.headers["x-forwarded-proto"] || "") === "https" ? "https" : "http";
  const url = new URL(req.url, `${protocol}://${host}`);
  const pathname = url.pathname;

  if (!ensureTrustedRequest(req, res)) return;

  if (req.method === "GET" && pathname === "/") {
    sendFile(res, path.join(ROOT, "index.html"), "text/html; charset=utf-8");
    return;
  }

  if (req.method === "GET" && pathname === "/styles.css") {
    sendFile(res, path.join(ROOT, "styles.css"), "text/css; charset=utf-8");
    return;
  }

  if (req.method === "GET" && pathname === "/app.js") {
    sendFile(res, path.join(ROOT, "app.js"), "application/javascript; charset=utf-8");
    return;
  }

  if (req.method === "GET" && pathname === "/manifest.webmanifest") {
    sendFile(res, path.join(ROOT, "manifest.webmanifest"), "application/manifest+json; charset=utf-8");
    return;
  }

  if (req.method === "GET" && pathname === "/sw.js") {
    sendFile(res, path.join(ROOT, "sw.js"), "application/javascript; charset=utf-8");
    return;
  }

  if (req.method === "GET" && pathname.startsWith("/icons/")) {
    const iconPath = path.join(ROOT, pathname.replace(/^\/+/, ""));
    const contentType = pathname.endsWith(".svg") ? "image/svg+xml" : "application/octet-stream";
    sendFile(res, iconPath, contentType);
    return;
  }

  if (req.method === "GET" && pathname === "/api/bootstrap") {
    const data = await readData();
    cleanExpiredSecurityState(data);
    await writeData(data);
    sendJson(res, 200, {
      roles,
      categories: data.categories,
      demoUsers: data.users.map((user) => ({
        role: user.roleLabel,
        mobile: user.mobile,
        email: user.email,
      })),
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/auth/request-otp") {
    try {
      if (!requireJson(req, res)) return;
      if (!enforceRateLimit(req, res, "request-otp", 5, 10 * 60 * 1000)) return;
      const body = await parseBody(req);
      const data = await readData();
      cleanExpiredSecurityState(data);
      const role = sanitizeText(body.role, 20).toUpperCase();
      const mobile = sanitizeMobile(body.mobile);
      if (!validateRole(role) || !/^\d{10}$/.test(mobile)) {
        sendJson(res, 400, { message: "Role or mobile number is invalid." });
        return;
      }
      const user = data.users.find((item) => item.role === role && item.mobile === mobile);
      if (!user) {
        audit("otp_request_failed", { role, mobile, ip: getClientIp(req) });
        sendJson(res, 404, { message: "Mobile number is not registered for that role." });
        return;
      }

      const otp = createOtp();
      const exposeDemoOtp = isLocalHost(host) && (!hasMsg91Config() || !MSG91_REAL_OTP);
      data.otpRequests = data.otpRequests.filter((item) => item.mobile !== mobile || item.role !== role);
      data.otpRequests.push({
        role,
        mobile,
        otpHash: hashValue(`${role}:${mobile}:${otp}`),
        attempts: 0,
        expiresAt: Date.now() + OTP_TTL_MS,
      });
      if (hasMsg91Config()) {
        await sendOtpViaMsg91(mobile, otp);
      }
      await writeData(data);
      audit("otp_requested", { role, mobile, ip: getClientIp(req) });
      const payload = { message: "OTP generated." };
      if (exposeDemoOtp) payload.demoOtp = otp;
      sendJson(res, 200, payload);
    } catch (error) {
      sendJson(res, 400, { message: error.message });
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/auth/verify-otp") {
    try {
      if (!requireJson(req, res)) return;
      if (!enforceRateLimit(req, res, "verify-otp", 10, 10 * 60 * 1000)) return;
      const body = await parseBody(req);
      const data = await readData();
      cleanExpiredSecurityState(data);
      const role = sanitizeText(body.role, 20).toUpperCase();
      const mobile = sanitizeMobile(body.mobile);
      const otp = sanitizeText(body.otp, 6);
      const request = data.otpRequests.find(
        (item) => item.mobile === mobile && item.role === role
      );
      if (!request || request.expiresAt < Date.now()) {
        await writeData(data);
        sendJson(res, 401, { message: "Invalid or expired OTP." });
        return;
      }
      if (request.attempts >= OTP_MAX_ATTEMPTS) {
        data.otpRequests = data.otpRequests.filter((item) => !(item.mobile === mobile && item.role === role));
        await writeData(data);
        audit("otp_locked", { role, mobile, ip: getClientIp(req) });
        sendJson(res, 429, { message: "OTP locked. Request a new code." });
        return;
      }
      const otpHash = hashValue(`${role}:${mobile}:${otp}`);
      if (!safeEqual(request.otpHash, otpHash)) {
        request.attempts += 1;
        await writeData(data);
        audit("otp_verify_failed", { role, mobile, ip: getClientIp(req) });
        sendJson(res, 401, { message: "Invalid or expired OTP." });
        return;
      }

      const user = data.users.find((item) => item.role === role && item.mobile === mobile);
      const token = createToken();
      data.sessions = data.sessions.filter((item) => item.userId !== user.id);
      data.sessions.push({
        tokenHash: hashValue(token),
        userId: user.id,
        createdAt: new Date().toISOString(),
        expiresAt: Date.now() + SESSION_TTL_MS,
      });
      data.otpRequests = data.otpRequests.filter((item) => !(item.mobile === mobile && item.role === role));
      await writeData(data);
      audit("login_success", { role, mobile, userId: user.id, ip: getClientIp(req) });
      sendJson(res, 200, { token, user });
    } catch (error) {
      sendJson(res, 400, { message: error.message });
    }
    return;
  }

  if (req.method === "GET" && pathname === "/api/dashboard") {
    const data = await readData();
    cleanExpiredSecurityState(data);
    ensureNearbyNotifications(data);
    await writeData(data);
    const user = authUser(req, data);
    if (!user) {
      sendJson(res, 401, { message: "Unauthorized" });
      return;
    }
    sendJson(res, 200, buildDashboard(data, user));
    return;
  }

  if (req.method === "POST" && pathname === "/api/workers/register") {
    try {
      if (!requireJson(req, res)) return;
      if (!enforceRateLimit(req, res, "workers-register", 20, 10 * 60 * 1000)) return;
      const data = await readData();
      cleanExpiredSecurityState(data);
      const user = authUser(req, data);
      if (!user || !["ADMIN", "AMBASSADOR"].includes(user.role)) {
        sendJson(res, 403, { message: "Only admin or ambassador can register workers." });
        return;
      }

      const body = await parseBody(req);
      const validation = validateWorkerPayload(body);
      if (validation.error) {
        sendJson(res, 400, { message: validation.error });
        return;
      }
      const workerInput = validation.value;
      if (!workerInput.categoryCode || !workerInput.skillName) {
        sendJson(res, 400, { message: "Missing required worker fields." });
        return;
      }
      if (data.users.some((entry) => entry.mobile === workerInput.mobile)) {
        sendJson(res, 409, { message: "Mobile number already exists." });
        return;
      }

      const category = data.categories.find((entry) => entry.code === workerInput.categoryCode);
      if (!category || !category.skills.includes(workerInput.skillName)) {
        sendJson(res, 400, { message: "Invalid category or skill mapping." });
        return;
      }

      const userId = `USR-${data.users.length + 1}`;
      const workerId = `WRK-${data.workers.length + 1}`;
      const workerCode = `WKR-2026-${String(data.workers.length + 1).padStart(3, "0")}`;
      const email = workerInput.email || `${workerInput.mobile}@skill.quantproc.com`;
      const workerUser = {
        id: userId,
        role: "WORKER",
        roleLabel: "Worker",
        fullName: workerInput.fullName,
        email,
        mobile: workerInput.mobile,
      };
      const worker = {
        id: workerId,
        workerCode,
        fullName: workerInput.fullName,
        mobile: workerInput.mobile,
        email,
        city: workerInput.city,
        categoryCode: category.code,
        categoryName: category.name,
        skillName: workerInput.skillName,
        experienceBand: workerInput.experienceBand,
        availabilityStatus: workerInput.availabilityStatus,
        visibilityStatus: workerInput.visibilityStatus,
        shiftPreference: workerInput.shiftPreference,
        preferredDayWage: workerInput.preferredDayWage,
        preferredNightWage: workerInput.preferredNightWage,
        wageFlexibility: workerInput.wageFlexibility,
        serviceRadiusKm: workerInput.serviceRadiusKm,
        liveStatus: "AVAILABLE",
        workerStatus: "PENDING",
        notes: workerInput.notes,
        ambassadorUserId: user.role === "AMBASSADOR" ? user.id : null,
      };

      data.users.push(workerUser);
      data.workers.push(worker);
      await writeData(data);
      audit("worker_registered", { actorUserId: user.id, workerId, workerCode, ip: getClientIp(req) });
      sendJson(res, 201, { message: "Worker registered.", worker });
    } catch (error) {
      sendJson(res, 400, { message: error.message });
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/engineers/register") {
    try {
      if (!requireJson(req, res)) return;
      if (!enforceRateLimit(req, res, "engineers-register", 20, 10 * 60 * 1000)) return;
      const data = await readData();
      cleanExpiredSecurityState(data);
      const user = authUser(req, data);
      if (!user || !["ADMIN", "AMBASSADOR"].includes(user.role)) {
        sendJson(res, 403, { message: "Only admin or ambassador can register professional candidates." });
        return;
      }

      const body = await parseBody(req);
      const validation = validateEngineerPayload(body);
      if (validation.error) {
        sendJson(res, 400, { message: validation.error });
        return;
      }

      const engineerInput = validation.value;
      if (data.users.some((entry) => entry.mobile === engineerInput.mobile || entry.email === engineerInput.email)) {
        sendJson(res, 409, { message: "Mobile number or email already exists." });
        return;
      }

      const userId = `USR-${data.users.length + 1}`;
      const engineerId = `ENG-${(data.engineers || []).length + 1}`;
      const engineerCode = `PRO-2026-${String((data.engineers || []).length + 1).padStart(3, "0")}`;
      const candidateUser = {
        id: userId,
        role: "WORKER",
        roleLabel: "Worker",
        fullName: engineerInput.fullName,
        email: engineerInput.email,
        mobile: engineerInput.mobile,
      };
      const engineer = {
        id: engineerId,
        engineerCode,
        fullName: engineerInput.fullName,
        mobile: engineerInput.mobile,
        email: engineerInput.email,
        city: engineerInput.city,
        educationLevel: engineerInput.educationLevel,
        professionalField: engineerInput.professionalField,
        professionalCategory: engineerInput.professionalCategory,
        specialization: engineerInput.specialization,
        experienceBand: engineerInput.experienceBand,
        currentEmployer: engineerInput.currentEmployer,
        currentDesignation: engineerInput.currentDesignation,
        currentSalary: engineerInput.currentSalary,
        expectedSalary: engineerInput.expectedSalary,
        noticePeriod: engineerInput.noticePeriod,
        resumeSummary: engineerInput.resumeSummary,
        resumeAttachment: engineerInput.resumeAttachment,
        preScreened: false,
        preScreenComments: "",
        preScreenedAt: null,
        preScreenedBy: null,
        candidateType: "PROFESSIONAL",
        candidateStatus: "PENDING",
        ambassadorUserId: user.role === "AMBASSADOR" ? user.id : null,
        createdAt: new Date().toISOString(),
      };

      data.users.push(candidateUser);
      data.engineers = Array.isArray(data.engineers) ? data.engineers : [];
      data.engineers.push(engineer);
      await writeData(data);
      audit("engineer_registered", { actorUserId: user.id, engineerId, engineerCode, ip: getClientIp(req) });
      sendJson(res, 201, { message: "Professional candidate registered.", engineer });
    } catch (error) {
      sendJson(res, 400, { message: error.message });
    }
    return;
  }

  if (req.method === "GET" && pathname === "/api/engineers/resume") {
    try {
      const data = await readData();
      cleanExpiredSecurityState(data);
      const user = authUser(req, data);
      if (!user || !["ADMIN", "CLIENT", "AMBASSADOR"].includes(user.role)) {
        sendJson(res, 403, { message: "Only admin, client, or ambassador can access resumes." });
        return;
      }
      const id = sanitizeText(url.searchParams.get("id"), 40);
      const engineer = (data.engineers || []).find((item) => item.id === id);
      if (!engineer || !engineer.resumeAttachment?.dataUrl) {
        sendJson(res, 404, { message: "Resume not found." });
        return;
      }

      const match = String(engineer.resumeAttachment.dataUrl).match(/^data:([^;]+);base64,(.+)$/);
      if (!match) {
        sendJson(res, 400, { message: "Stored resume format is invalid." });
        return;
      }
      const mimeType = engineer.resumeAttachment.fileType || match[1] || "application/octet-stream";
      const base64 = match[2];
      const fileBuffer = Buffer.from(base64, "base64");
      const fileName = engineer.resumeAttachment.fileName || `${engineer.fullName}-resume`;
      const inline = url.searchParams.get("download") !== "1";
      sendBuffer(res, 200, fileBuffer, mimeType, fileName, inline);
    } catch (error) {
      sendJson(res, 400, { message: error.message });
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/location/ping") {
    try {
      if (!requireJson(req, res)) return;
      if (!enforceRateLimit(req, res, "location-ping", 60, 10 * 60 * 1000)) return;
      const data = await readData();
      cleanExpiredSecurityState(data);
      const user = authUser(req, data);
      if (!user) {
        sendJson(res, 401, { message: "Unauthorized" });
        return;
      }
      const body = await parseBody(req);
      if (typeof body.latitude !== "number" || typeof body.longitude !== "number") {
        sendJson(res, 400, { message: "Latitude and longitude are required." });
        return;
      }
      if (
        !Number.isFinite(body.latitude) ||
        !Number.isFinite(body.longitude) ||
        body.latitude < -90 ||
        body.latitude > 90 ||
        body.longitude < -180 ||
        body.longitude > 180
      ) {
        sendJson(res, 400, { message: "Latitude or longitude is out of range." });
        return;
      }

      const label =
        user.role === "CLIENT"
          ? "Client mobile site position"
          : user.role === "WORKER"
            ? "Worker mobile live position"
            : `${user.roleLabel} mobile live position`;

      data.locationPings = data.locationPings.filter((item) => item.userId !== user.id);
      data.locationPings.push({
        userId: user.id,
        role: user.role,
        roleLabel: user.roleLabel,
        name: user.fullName,
        mobile: user.mobile,
        label,
        latitude: Number(body.latitude),
        longitude: Number(body.longitude),
        accuracy: Number.isFinite(body.accuracy) ? Number(body.accuracy) : null,
        capturedAt: new Date().toISOString(),
      });
      ensureNearbyNotifications(data);
      await writeData(data);
      audit("location_updated", { userId: user.id, role: user.role, ip: getClientIp(req) });
      sendJson(res, 200, { message: "Location updated." });
    } catch (error) {
      sendJson(res, 400, { message: error.message });
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/worker/preferences") {
    try {
      if (!requireJson(req, res)) return;
      if (!enforceRateLimit(req, res, "worker-preferences", 20, 10 * 60 * 1000)) return;
      const data = await readData();
      cleanExpiredSecurityState(data);
      const user = authUser(req, data);
      if (!user || user.role !== "WORKER") {
        sendJson(res, 403, { message: "Only worker users can update worker preferences." });
        return;
      }

      const body = await parseBody(req);
      const validation = validateWorkerPreferencePayload(body);
      if (validation.error) {
        sendJson(res, 400, { message: validation.error });
        return;
      }

      const worker = (data.workers || []).find((item) => item.mobile === user.mobile || item.email === user.email);
      if (!worker) {
        sendJson(res, 404, { message: "Worker profile not found." });
        return;
      }

      Object.assign(worker, validation.value);
      ensureNearbyNotifications(data);
      await writeData(data);
      audit("worker_preferences_updated", { userId: user.id, workerId: worker.id, ip: getClientIp(req) });
      sendJson(res, 200, { message: "Worker preferences updated.", worker });
    } catch (error) {
      sendJson(res, 400, { message: error.message });
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/project-location") {
    try {
      if (!requireJson(req, res)) return;
      if (!enforceRateLimit(req, res, "project-location", 20, 10 * 60 * 1000)) return;
      const data = await readData();
      cleanExpiredSecurityState(data);
      const user = authUser(req, data);
      if (!user || user.role !== "CLIENT") {
        sendJson(res, 403, { message: "Only client users can save project location." });
        return;
      }

      const body = await parseBody(req);
      const validation = validateProjectLocationPayload(body);
      if (validation.error) {
        sendJson(res, 400, { message: validation.error });
        return;
      }

      const project = {
        id: `PRJ-${Date.now()}`,
        clientUserId: user.id,
        clientName: user.fullName,
        siteName: validation.value.siteName,
        country: validation.value.country,
        state: validation.value.state,
        district: validation.value.district,
        streetAddress: validation.value.streetAddress,
        latitude: validation.value.latitude,
        longitude: validation.value.longitude,
        createdAt: new Date().toISOString(),
      };

      data.projectLocations = Array.isArray(data.projectLocations)
        ? data.projectLocations.filter((item) => item.clientUserId !== user.id)
        : [];
      data.projectLocations.unshift(project);
      ensureNearbyNotifications(data);
      await writeData(data);
      audit("project_location_saved", { userId: user.id, projectId: project.id, ip: getClientIp(req) });
      sendJson(res, 201, { message: "Project location saved.", project });
    } catch (error) {
      sendJson(res, 400, { message: error.message });
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/notifications/read") {
    try {
      if (!requireJson(req, res)) return;
      const data = await readData();
      cleanExpiredSecurityState(data);
      const user = authUser(req, data);
      if (!user) {
        sendJson(res, 401, { message: "Unauthorized" });
        return;
      }
      const body = await parseBody(req);
      const notificationId = sanitizeText(body.notificationId, 80);
      const notification = (data.notifications || []).find((item) => item.id === notificationId && item.recipientUserId === user.id);
      if (!notification) {
        sendJson(res, 404, { message: "Notification not found." });
        return;
      }
      notification.readAt = new Date().toISOString();
      await writeData(data);
      sendJson(res, 200, { message: "Notification marked as read." });
    } catch (error) {
      sendJson(res, 400, { message: error.message });
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/alerts/preferences") {
    try {
      if (!requireJson(req, res)) return;
      const data = await readData();
      cleanExpiredSecurityState(data);
      const user = authUser(req, data);
      if (!user) {
        sendJson(res, 401, { message: "Unauthorized" });
        return;
      }
      const body = await parseBody(req);
      const savedUser = (data.users || []).find((item) => item.id === user.id);
      if (!savedUser) {
        sendJson(res, 404, { message: "User not found." });
        return;
      }
      savedUser.alertPreferences = {
        nearbyAlertsEnabled: body.nearbyAlertsEnabled !== false,
      };
      await writeData(data);
      sendJson(res, 200, { message: "Alert preferences updated.", alertPreferences: savedUser.alertPreferences });
    } catch (error) {
      sendJson(res, 400, { message: error.message });
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/registry/status") {
    try {
      if (!requireJson(req, res)) return;
      const data = await readData();
      cleanExpiredSecurityState(data);
      const user = authUser(req, data);
      if (!user || user.role !== "ADMIN") {
        sendJson(res, 403, { message: "Only admin can update registry approval status." });
        return;
      }
      const body = await parseBody(req);
      const type = sanitizeText(body.type, 20).toLowerCase();
      const id = sanitizeText(body.id, 40);
      const status = sanitizeText(body.status, 20).toUpperCase();
      if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
        sendJson(res, 400, { message: "Invalid approval status." });
        return;
      }

      if (type === "worker") {
        const worker = (data.workers || []).find((item) => item.id === id);
        if (!worker) {
          sendJson(res, 404, { message: "Worker not found." });
          return;
        }
        worker.workerStatus = status;
        await writeData(data);
        audit("worker_status_updated", { actorUserId: user.id, workerId: worker.id, status, ip: getClientIp(req) });
        sendJson(res, 200, { message: "Worker status updated.", worker });
        return;
      }

      if (type === "engineer") {
        const engineer = (data.engineers || []).find((item) => item.id === id);
        if (!engineer) {
          sendJson(res, 404, { message: "Professional candidate not found." });
          return;
        }
        engineer.candidateStatus = status;
        await writeData(data);
        audit("engineer_status_updated", { actorUserId: user.id, engineerId: engineer.id, status, ip: getClientIp(req) });
        sendJson(res, 200, { message: "Professional candidate status updated.", engineer });
        return;
      }

      sendJson(res, 400, { message: "Invalid registry type." });
    } catch (error) {
      sendJson(res, 400, { message: error.message });
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/registry/prescreen") {
    try {
      if (!requireJson(req, res)) return;
      const data = await readData();
      cleanExpiredSecurityState(data);
      const user = authUser(req, data);
      if (!user || user.role !== "ADMIN") {
        sendJson(res, 403, { message: "Only admin can mark a candidate as pre screened." });
        return;
      }
      const body = await parseBody(req);
      const id = sanitizeText(body.id, 40);
      const comments = sanitizeText(body.comments, 1000);
      if (!comments || comments.length < 5) {
        sendJson(res, 400, { message: "Expert comments are required for pre screening." });
        return;
      }
      const engineer = (data.engineers || []).find((item) => item.id === id);
      if (!engineer) {
        sendJson(res, 404, { message: "Professional candidate not found." });
        return;
      }
      engineer.preScreened = true;
      engineer.preScreenComments = comments;
      engineer.preScreenedAt = new Date().toISOString();
      engineer.preScreenedBy = user.fullName;
      await writeData(data);
      audit("engineer_prescreened", { actorUserId: user.id, engineerId: engineer.id, ip: getClientIp(req) });
      sendJson(res, 200, { message: "Professional candidate marked as pre screened.", engineer });
    } catch (error) {
      sendJson(res, 400, { message: error.message });
    }
    return;
  }

  sendJson(res, 404, { message: "Not found" });
});

server.listen(PORT, () => {
  ensureData();
  console.log(`Manpower portal app running on http://localhost:${PORT}`);
});
