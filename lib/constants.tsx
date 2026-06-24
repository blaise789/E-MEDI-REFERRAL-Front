import type { Role } from "@/lib/types";

export const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL;

// ── App Branding ────────────────────────────────────────────
export const APP_NAME = "MediRefer";
export const APP_DESCRIPTION = "Digital Referral & Transfer Management";
export const COMPANY_NAME = "MediRefer";
export const COMPANY_PHONE = "+250788000000";
export const COMPANY_LOCATION = "Kigali, Rwanda";

// ── Referral Statuses ────────────────────────────────────────
export const REFERRAL_STATUSES = {
  SUBMITTED: "SUBMITTED",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  IN_TRANSIT: "IN_TRANSIT",
  ADMITTED: "ADMITTED",
  COUNTER_REFERRED: "COUNTER_REFERRED",
} as const;

// ── Referral Urgency ─────────────────────────────────────────
export const REFERRAL_URGENCY = {
  ROUTINE: "ROUTINE",
  EMERGENCY: "EMERGENCY",
} as const;

// ── Specialist Statuses ──────────────────────────────────────
export const SPECIALIST_STATUSES = {
  AVAILABLE: "AVAILABLE",
  IN_THEATRE: "IN_THEATRE",
  ON_CALL: "ON_CALL",
  UNAVAILABLE: "UNAVAILABLE",
} as const;

// ── Ward Types ───────────────────────────────────────────────
export const WARD_TYPES = {
  GENERAL_MEDICAL: "GENERAL_MEDICAL",
  SURGICAL: "SURGICAL",
  ICU: "ICU",
  HDU: "HDU",
  MATERNITY: "MATERNITY",
  PEDIATRIC: "PEDIATRIC",
} as const;

// ── User Roles ───────────────────────────────────────────────
export const USER_ROLES: Record<Role, Role> = {
  CLINICIAN: "CLINICIAN",
  FOCAL_PERSON: "FOCAL_PERSON",
  HOSPITAL_ADMIN: "HOSPITAL_ADMIN",
  SYS_ADMIN: "SYS_ADMIN",
} as const;

// ── Hospital Levels ──────────────────────────────────────────
export const HOSPITAL_LEVELS = {
  DISTRICT: "DISTRICT",
  REFERRAL: "REFERRAL",
} as const;
