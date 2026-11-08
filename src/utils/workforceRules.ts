export type UserRole = 'admin' | 'client' | 'employee';
export type AppLocale = 'en' | 'th';
export type ClinicalDepartment = 'OPD' | 'IPD' | 'Critical Care';

export interface LocalizedText {
  en: string;
  th: string;
}

export function tText(item: LocalizedText | string, locale: AppLocale): string {
  if (typeof item === 'string') return item;
  return item[locale] || item.en;
}

/**
 * Defaults to English ('en') unless the browser's default language is Thai ('th' / 'th-TH').
 */
export function detectDefaultLocale(browserLang?: string): AppLocale {
  const lang =
    browserLang ??
    (typeof navigator !== 'undefined'
      ? navigator.language || (navigator.languages && navigator.languages[0]) || 'en'
      : 'en');
  return lang.toLowerCase().startsWith('th') ? 'th' : 'en';
}

export type PermissionAction =
  | 'attendance.view_all'
  | 'attendance.view_site'
  | 'attendance.execute_clock'
  | 'dashboard.full_analytics'
  | 'dashboard.site_analytics'
  | 'dashboard.personal_view'
  | 'shift.manage_all'
  | 'shift.assign_site'
  | 'shift.view_personal'
  | 'leave.approve_high'
  | 'leave.approve_site'
  | 'leave.create_request'
  | 'daymark.view_log'
  | 'daymark.execute_mark'
  | 'recruitment.manage_approve'
  | 'recruitment.view_info'
  | 'recruitment.apply_sign'
  | 'training.manage_content'
  | 'training.assign_view'
  | 'training.learn_test'
  | 'evaluation.view_summary'
  | 'evaluation.execute_review'
  | 'evaluation.view_result'
  | 'payroll.manage_approve'
  | 'payroll.view_site_cost'
  | 'payroll.receive_payslip';

const ROLE_PERMISSION_MAP: Record<UserRole, PermissionAction[]> = {
  admin: [
    'attendance.view_all',
    'dashboard.full_analytics',
    'shift.manage_all',
    'leave.approve_high',
    'daymark.view_log',
    'recruitment.manage_approve',
    'training.manage_content',
    'evaluation.view_summary',
    'payroll.manage_approve',
  ],
  client: [
    'attendance.view_site',
    'dashboard.site_analytics',
    'shift.assign_site',
    'leave.approve_site',
    'daymark.execute_mark',
    'daymark.view_log',
    'recruitment.view_info',
    'training.assign_view',
    'evaluation.execute_review',
    'payroll.view_site_cost',
  ],
  employee: [
    'attendance.execute_clock',
    'dashboard.personal_view',
    'shift.view_personal',
    'leave.create_request',
    'daymark.view_log',
    'recruitment.apply_sign',
    'training.learn_test',
    'evaluation.view_result',
    'payroll.receive_payslip',
  ],
};

export function canRolePerformAction(role: UserRole, action: PermissionAction): boolean {
  return ROLE_PERMISSION_MAP[role]?.includes(action) ?? false;
}

/**
 * Account-based Role Resolution:
 * Every role and permission set strictly depends on the authenticated login account.
 */
export interface AccountCredentialMapping {
  email: string;
  role: UserRole;
  accountId: string;
}

const REGISTERED_ACCOUNTS: AccountCredentialMapping[] = [
  { email: 'admin@daymark.co.th', role: 'admin', accountId: 'ADM-TH-01' },
  { email: 'chakrit.c@daymark.co.th', role: 'admin', accountId: 'ADM-TH-01' },
  { email: 'client@bumrungrad.co.th', role: 'client', accountId: 'BHM-TH-01' },
  { email: 'nalinee.r@bumrungrad.co.th', role: 'client', accountId: 'BHM-TH-01' },
  { email: 'clinician@daymark.co.th', role: 'employee', accountId: 'DM-TH-0842' },
  { email: 'thanakorn.s@daymark.co.th', role: 'employee', accountId: 'DM-TH-0842' },
];

export function resolveAccountRoleByEmail(email: string): AccountCredentialMapping | null {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  const exact = REGISTERED_ACCOUNTS.find((a) => a.email === normalized);
  if (exact) return exact;
  if (normalized.includes('admin') || normalized.includes('owner')) {
    return { email: normalized, role: 'admin', accountId: 'ADM-TH-01' };
  }
  if (
    normalized.includes('client') ||
    normalized.includes('hospital') ||
    normalized.includes('bumrungrad') ||
    normalized.includes('bdms') ||
    normalized.includes('samitivej')
  ) {
    return { email: normalized, role: 'client', accountId: 'BHM-TH-01' };
  }
  return { email: normalized, role: 'employee', accountId: 'DM-TH-0842' };
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeofenceCheckResult {
  distanceMeters: number;
  maxRadiusMeters: number;
  isWithinGeofence: boolean;
  statusLabel: LocalizedText;
}

export function calculateHaversineDistanceMeters(a: Coordinates, b: Coordinates): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return Math.round(R * c);
}

export function verifyGeofence(
  userCoords: Coordinates,
  siteCoords: Coordinates,
  maxRadiusMeters = 250
): GeofenceCheckResult {
  const distanceMeters = calculateHaversineDistanceMeters(userCoords, siteCoords);
  const isWithinGeofence = distanceMeters <= maxRadiusMeters;
  return {
    distanceMeters,
    maxRadiusMeters,
    isWithinGeofence,
    statusLabel: isWithinGeofence
      ? {
          en: `Within Geofence (${distanceMeters}m / ${maxRadiusMeters}m)`,
          th: `อยู่ในเขตพื้นที่โรงพยาบาล (${distanceMeters} ม. / ${maxRadiusMeters} ม.)`,
        }
      : {
          en: `Outside Geofence (${distanceMeters}m > ${maxRadiusMeters}m)`,
          th: `อยู่นอกเขต Geofence (${distanceMeters} ม. > ${maxRadiusMeters} ม.)`,
        },
  };
}

export interface BiometricVerificationResult {
  livenessPassed: boolean;
  faceMatchPassed: boolean;
  overallVerified: boolean;
  livenessPct: number;
  faceMatchPct: number;
  summaryText: LocalizedText;
}

export function verifyBiometricFaceMatch(
  livenessScore: number,
  faceSimilarityScore: number,
  minLiveness = 0.88,
  minSimilarity = 0.92
): BiometricVerificationResult {
  const livenessPassed = livenessScore >= minLiveness;
  const faceMatchPassed = faceSimilarityScore >= minSimilarity;
  const overallVerified = livenessPassed && faceMatchPassed;
  const livenessPct = Math.round(livenessScore * 1000) / 10;
  const faceMatchPct = Math.round(faceSimilarityScore * 1000) / 10;

  let summaryText: LocalizedText = {
    en: `1:N Match (${faceMatchPct}%) · Liveness (${livenessPct}%)`,
    th: `ยืนยันใบหน้า 1:N (${faceMatchPct}%) · Liveness (${livenessPct}%)`,
  };
  if (!livenessPassed) {
    summaryText = {
      en: `Spoof Alert: Low Liveness (${livenessPct}% < ${Math.round(minLiveness * 100)}%)`,
      th: `แจ้งเตือนป้องกันภาพปลอม: Liveness ต่ำ (${livenessPct}% < ${Math.round(minLiveness * 100)}%)`,
    };
  } else if (!faceMatchPassed) {
    summaryText = {
      en: `1:N Biometric Mismatch (${faceMatchPct}% < ${Math.round(minSimilarity * 100)}%)`,
      th: `ข้อมูลชีวมิติไม่ตรงกัน (${faceMatchPct}% < ${Math.round(minSimilarity * 100)}%)`,
    };
  }

  return {
    livenessPassed,
    faceMatchPassed,
    overallVerified,
    livenessPct,
    faceMatchPct,
    summaryText,
  };
}

export interface PayrollCalculationInput {
  hourlyRateThb: number;
  regularHours: number;
  overtimeHours: number;
  daymarkVerifiedHours: number;
  department: ClinicalDepartment;
  shiftsCompleted: number;
  kpiBonusThb: number;
}

export interface PayrollCalculationBreakdown {
  baseSalaryThb: number;
  daymarkSalaryThb: number;
  overtimeSalaryThb: number;
  specialtyAllowanceThb: number;
  kpiBonusThb: number;
  grossSalaryThb: number;
  socialSecurityAndTaxThb: number;
  netSalaryThb: number;
  totalBillableHours: number;
}

export const SPECIALTY_ALLOWANCE_PER_SHIFT_THB: Record<ClinicalDepartment, number> = {
  'Critical Care': 1500,
  IPD: 900,
  OPD: 600,
};

export function calculatePayrollItem(input: PayrollCalculationInput): PayrollCalculationBreakdown {
  const baseSalaryThb = Math.round(input.regularHours * input.hourlyRateThb);
  const daymarkSalaryThb = Math.round(input.daymarkVerifiedHours * input.hourlyRateThb);
  const overtimeSalaryThb = Math.round(input.overtimeHours * input.hourlyRateThb * 1.5);
  const allowanceRate = SPECIALTY_ALLOWANCE_PER_SHIFT_THB[input.department] ?? 600;
  const specialtyAllowanceThb = Math.round(input.shiftsCompleted * allowanceRate);
  const kpiBonusThb = Math.max(0, Math.round(input.kpiBonusThb));

  const grossSalaryThb =
    baseSalaryThb + daymarkSalaryThb + overtimeSalaryThb + specialtyAllowanceThb + kpiBonusThb;
  const socialSecurityAndTaxThb = Math.round(grossSalaryThb * 0.105);
  const netSalaryThb = grossSalaryThb - socialSecurityAndTaxThb;
  const totalBillableHours =
    Math.round((input.regularHours + input.daymarkVerifiedHours + input.overtimeHours) * 10) / 10;

  return {
    baseSalaryThb,
    daymarkSalaryThb,
    overtimeSalaryThb,
    specialtyAllowanceThb,
    kpiBonusThb,
    grossSalaryThb,
    socialSecurityAndTaxThb,
    netSalaryThb,
    totalBillableHours,
  };
}

export interface QuizGradeResult {
  correctCount: number;
  totalQuestions: number;
  scorePercentage: number;
  passed: boolean;
  statusText: LocalizedText;
}

export function evaluateAssessmentQuiz(
  selectedAnswers: number[],
  correctAnswers: number[],
  passThresholdPct = 80
): QuizGradeResult {
  const totalQuestions = correctAnswers.length;
  if (totalQuestions === 0) {
    return {
      correctCount: 0,
      totalQuestions: 0,
      scorePercentage: 0,
      passed: false,
      statusText: { en: 'No questions', th: 'ไม่มีคำถาม' },
    };
  }
  let correctCount = 0;
  for (let i = 0; i < totalQuestions; i++) {
    if (selectedAnswers[i] === correctAnswers[i]) {
      correctCount++;
    }
  }
  const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
  const passed = scorePercentage >= passThresholdPct;

  return {
    correctCount,
    totalQuestions,
    scorePercentage,
    passed,
    statusText: passed
      ? {
          en: `Clinical Standard Passed (${scorePercentage}%)`,
          th: `ผ่านเกณฑ์มาตรฐานวิชาชีพ (${scorePercentage}%)`,
        }
      : {
          en: `Retake Required (${scorePercentage}% < ${passThresholdPct}%)`,
          th: `ต้องทบทวนและสอบใหม่ (${scorePercentage}% < ${passThresholdPct}%)`,
        },
  };
}

export interface DiscScores {
  D: number;
  I: number;
  S: number;
  C: number;
}

export interface DiscProfileAnalysis {
  dominantTrait: 'D' | 'I' | 'S' | 'C';
  secondaryTrait: 'D' | 'I' | 'S' | 'C';
  profileCode: string;
  title: LocalizedText;
  recommendedDepartment: ClinicalDepartment;
  shiftSchedulingAdvice: LocalizedText;
}

export function calculateDiscProfile(scores: DiscScores): DiscProfileAnalysis {
  const entries = (Object.entries(scores) as Array<['D' | 'I' | 'S' | 'C', number]>).sort(
    (a, b) => b[1] - a[1]
  );
  const dominantTrait = entries[0][0];
  const secondaryTrait = entries[1][0];
  const profileCode = `${dominantTrait}-${secondaryTrait}`;

  if (dominantTrait === 'D' || (dominantTrait === 'C' && secondaryTrait === 'D')) {
    return {
      dominantTrait,
      secondaryTrait,
      profileCode,
      title: {
        en: 'Decisive & Rapid Clinical Responder (Dominance - Compliance)',
        th: 'ตัดสินใจเฉียบคมและตอบสนองภาวะวิกฤต (Dominance - Compliance)',
      },
      recommendedDepartment: 'Critical Care',
      shiftSchedulingAdvice: {
        en: 'Optimal fit for ICU / Emergency Trauma shifts, Code Blue resuscitation, and high-acuity night rotations.',
        th: 'เหมาะอย่างยิ่งสำหรับเวรหอผู้ป่วยวิกฤต (ICU/ER) ทีมกู้ชีพ Code Blue และเวรผลัดกลางคืนที่มีความซับซ้อนสูง',
      },
    };
  }

  if (dominantTrait === 'I') {
    return {
      dominantTrait,
      secondaryTrait,
      profileCode,
      title: {
        en: 'Empathetic Communicator & Patient Advocate (Influence - Steadiness)',
        th: 'สื่อสารสร้างความเชื่อมั่นและดูแลผู้ป่วยนอก (Influence - Steadiness)',
      },
      recommendedDepartment: 'OPD',
      shiftSchedulingAdvice: {
        en: 'Optimal fit for Outpatient Department (OPD), international patient consultation, and daytime triage.',
        th: 'เหมาะอย่างยิ่งสำหรับแผนกผู้ป่วยนอก (OPD) การให้คำปรึกษาผู้ป่วยนานาชาติ และการคัดกรองผู้ป่วยภาคกลางวัน',
      },
    };
  }

  return {
    dominantTrait,
    secondaryTrait,
    profileCode,
    title: {
      en: 'Methodical, Steady & Protocol-Driven (Steadiness - Compliance)',
      th: 'รอบคอบ มั่นคง และยึดมั่นมาตรฐานความปลอดภัย (Steadiness - Compliance)',
    },
    recommendedDepartment: 'IPD',
    shiftSchedulingAdvice: {
      en: 'Optimal fit for Inpatient Ward (IPD) continuity of care, SBAR handovers, and JCI infection control.',
      th: 'เหมาะอย่างยิ่งสำหรับหอผู้ป่วยใน (IPD) การดูแลต่อเนื่อง การส่งต่อเวร SBAR และการควบคุมการติดเชื้อมาตรฐาน JCI',
    },
  };
}

export function formatCurrencyThb(amount: number): string {
  return '฿' + new Intl.NumberFormat('en-US').format(Math.round(amount));
}
