// ============================================================
// ENUMS — mirror Prisma schema exactly
// ============================================================

export type Role =
  | "CLINICIAN"
  | "FOCAL_PERSON"
  | "HOSPITAL_ADMIN"
  | "SYS_ADMIN";

export type HospitalLevel = "DISTRICT" | "REFERRAL";

export type WardType =
  | "GENERAL_MEDICAL"
  | "SURGICAL"
  | "ICU"
  | "HDU"
  | "MATERNITY"
  | "PEDIATRIC";

export type SpecialistDiscipline =
  | "GENERAL_SURGERY"
  | "ORTHOPEDIC_SURGERY"
  | "OBSTETRICS_GYNECOLOGY"
  | "INTERNAL_MEDICINE"
  | "PEDIATRICS"
  | "NEUROLOGY"
  | "ANESTHESIA"
  | "INTENSIVE_CARE";

export type SpecialistStatus =
  | "AVAILABLE"
  | "UNAVAILABLE";


export type ReferralStatus =
  | "SUBMITTED"
  | "ADMITTED"
  | "DISCHARGED"
  | "COUNTER_REFERRED";

// ============================================================
// MODELS — mirror Prisma schema fields (camelCase for API DTOs)
// ============================================================

export interface File {
  id: string;
  name: string;
  originalName: string;
  url: string;
  folder: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface Hospital {
  id: string;
  name: string;
  level: HospitalLevel;
  location: string;
  contactNumber: string | null;
  beds?: BedCapacity[];
  specialists?: Specialist[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  telephone: string | null;
  hospitalId: string | null;
  hospital?: Hospital;
  profilePictureId: string | null;
  profilePicture?: File;
  createdAt: string;
  updatedAt: string;
}

export interface BedCapacity {
  id: string;
  wardType: WardType;
  totalBeds: number;
  occupiedBeds: number;
  hospitalId: string;
  hospital?: Hospital;
  updatedAt: string;
}

export interface Specialist {
  id: string;
  firstName: string;
  lastName: string;
  discipline: SpecialistDiscipline;
  status: SpecialistStatus;
  hospitalId: string;
  hospital?: Hospital;
  updatedAt: string;
}

export interface Patient {
  id: string;
  nationalId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  insurance?: string | null;
  contactNumber: string | null;
  email?: string | null;
  isActive: boolean;
  hospitalId?: string | null;
  cell?: string | null;
  sector?: string | null;
  district?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CounterReferral {
  id: string;
  referralId: string;
  dischargeNotes: string;
  followUpInstructions: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string | null;
  entityId: string | null;
  details: string | null;
  performedById: string | null;
  referralId: string | null;
  createdAt: string;
}

export interface Referral {
  id: string;
  patientId: string;
  patient?: Patient;
  referringHospitalId: string;
  referringHospital?: Hospital;
  receivingHospitalId: string;
  receivingHospital?: Hospital;
  initiatedById: string;
  initiatedBy?: User;
  status: ReferralStatus;
  reasonForTransfer: string;
  diagnosis: string;
  preTransferTreatment: string | null;
  transportType: 'AMBULANCE' | 'PRIVATE' | null;
  targetWardType?: string | null;
  targetSpecialistId?: string | null;
  targetSpecialist?: Specialist | null;
  counterReferral?: CounterReferral;
  logs?: AuditLog[];
  significantFindings?: string | null;
  proceduresReceived?: string | null;
  currentMedications?: string | null;
  patientCondition?: string | null;
  monitoringRequired?: string | null;
  isEmergency: boolean;
  urgency: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  referringDoctorName?: string | null;
  referringDoctorContact?: string | null;
  expectedAdmissionDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  recipientId: string;
  referralId?: string | null;
  createdAt: string;
}

// ============================================================
// API REQUEST / RESPONSE HELPERS
// ============================================================

/** Standard API response wrapper */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/** Standard paginated response */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: Role;
  hospitalId?: string | null;
  telephone?: string | null;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: Role;
  hospitalId?: string;
}

// Referral creation
export interface CreateReferralRequest {
  patientId: string;
  referringHospitalId: string;
  receivingHospitalId: string;
  targetWardType?: string;
  targetSpecialistId?: string;
  reasonForTransfer: string;
  diagnosis: string;
  preTransferTreatment?: string | null;
  transportType?: string | null;
  significantFindings?: string | null;
  proceduresReceived?: string | null;
  currentMedications?: string | null;
  patientCondition?: string | null;
  monitoringRequired?: string | null;
  isEmergency?: boolean;
  urgency?: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  referringDoctorName?: string;
  referringDoctorContact?: string;
  expectedAdmissionDate?: string;
}

export interface UpdateReferralStatusRequest {
  status: ReferralStatus;
}

export interface CreateCounterReferralRequest {
  dischargeNotes: string;
  followUpInstructions: string;
}

// Patient creation
export interface CreatePatientRequest {
  nationalId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  insurance?: string;
  contactNumber?: string;
  email?: string;
  hospitalId?: string;
}

// Bed capacity update
export interface UpdateBedCapacityRequest {
  occupiedBeds: number;
}

// Specialist update
export interface UpdateSpecialistStatusRequest {
  status: 'AVAILABLE' | 'UNAVAILABLE';
}

// ============================================================
// UI HELPERS
// ============================================================

/** Human-readable label maps for display in tables/badges */
export const WARD_TYPE_LABELS: Record<WardType, string> = {
  GENERAL_MEDICAL: "General Medical",
  SURGICAL: "Surgical",
  ICU: "ICU",
  HDU: "HDU",
  MATERNITY: "Maternity",
  PEDIATRIC: "Pediatric",
};

export const SPECIALIST_DISCIPLINE_LABELS: Record<SpecialistDiscipline, string> = {
  GENERAL_SURGERY: "General Surgery",
  ORTHOPEDIC_SURGERY: "Orthopedic Surgery",
  OBSTETRICS_GYNECOLOGY: "Obstetrics & Gynecology",
  INTERNAL_MEDICINE: "Internal Medicine",
  PEDIATRICS: "Pediatrics",
  NEUROLOGY: "Neurology",
  ANESTHESIA: "Anesthesia",
  INTENSIVE_CARE: "Intensive Care",
};

export const ROLE_LABELS: Record<string, string> = {
  HOSPITAL_ADMIN: "Hospital Admin",
  SYS_ADMIN: "System Admin",
};

export const HOSPITAL_LEVEL_LABELS: Record<HospitalLevel, string> = {
  DISTRICT: "District Hospital",
  REFERRAL: "Referral Hospital",
};
