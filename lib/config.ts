import type { Role } from "@/lib/types";

// ── Role-based module access ─────────────────────────────────
export const ROLE_MODULES: Record<string, string[]> = {
  SYS_ADMIN: ["dashboard", "hospitals", "users", "audit-logs", "wards"],
  HOSPITAL_ADMIN: [
    "dashboard",
    "referrals",
    "patients",
    "hospitals",
    "wards",
    "specialists",
    "users",
    "notifications",
    "audit-logs",
  ],
  FOCAL_PERSON: [
    "dashboard",
    "referrals",
    "patients",
    "hospitals",
    "wards",
    "specialists",
    "notifications",
  ],
  CLINICIAN: [
    "dashboard",
    "referrals",
    "patients",
    "wards",
    "notifications",
  ],
};

// ── Action-level permissions ─────────────────────────────────
export const ACTION_PERMISSIONS: Record<string, Role[]> = {
  // Referrals
  create_referral: ["HOSPITAL_ADMIN"],
  accept_referral: ["HOSPITAL_ADMIN"],
  reject_referral: ["HOSPITAL_ADMIN"],
  counter_refer: ["HOSPITAL_ADMIN"],

  // Bed capacity
  update_bed_capacity: ["HOSPITAL_ADMIN"],

  // Specialists
  update_specialist_status: ["HOSPITAL_ADMIN"],
  create_specialist: ["HOSPITAL_ADMIN"],

  // Hospitals
  manage_hospitals: ["SYS_ADMIN"],

  // Users
  manage_users: ["HOSPITAL_ADMIN", "SYS_ADMIN"],

  // Reports & audit
  view_reports: ["HOSPITAL_ADMIN", "SYS_ADMIN"],
  view_audit_logs: ["HOSPITAL_ADMIN", "SYS_ADMIN"],
};

// ── Application-level rules ──────────────────────────────────
export const APP_CONFIG = {
  session_timeout_minutes: 30,
  password_min_length: 8,
  notification_poll_interval_ms: 30_000,
  default_page_size: 20,
};

// ── Helpers ──────────────────────────────────────────────────

/** Returns the list of modules accessible by a given role */
export const getModuleAccess = (role: Role): string[] => {
  return ROLE_MODULES[role] ?? [];
};

/** Checks if a given role can perform a specific action */
export const hasActionPermission = (role: Role, action: string): boolean => {
  const allowedRoles = ACTION_PERMISSIONS[action] ?? [];
  return allowedRoles.includes(role);
};
