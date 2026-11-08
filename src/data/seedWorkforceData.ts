import { ClinicalDepartment, UserRole, Coordinates, LocalizedText } from '../utils/workforceRules';

export interface RoleProfile {
  role: UserRole;
  code: string;
  label: LocalizedText;
  shortRoleLabel: LocalizedText;
  fullName: LocalizedText;
  title: LocalizedText;
  organization: LocalizedText;
  email: string;
  demoPassword: string;
  avatarUrl?: string;
  initials: string;
  mfaEnabled: boolean;
  emailVerified: boolean;
  ssoProvider: 'Google Workspace' | 'Microsoft Entra ID' | 'Email/Password + TOTP';
}

export interface HospitalSite {
  id: string;
  name: LocalizedText;
  address: LocalizedText;
  departmentFocus: ClinicalDepartment[];
  coords: Coordinates;
  geofenceRadiusMeters: number;
  contactCoordinator: LocalizedText;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: LocalizedText;
  employeeRoleTitle: LocalizedText;
  department: ClinicalDepartment;
  siteId: string;
  siteName: LocalizedText;
  shiftLabel: LocalizedText;
  clockInTime: string;
  clockOutTime: string | null;
  gpsDistanceMeters: number;
  geofenceValid: boolean;
  livenessScore: number;
  faceMatchScore: number;
  verificationMethod: LocalizedText;
  isDaymarkException: boolean;
  status: LocalizedText;
}

export interface DaymarkAuditEntry {
  id: string;
  timestamp: string;
  employeeId: string;
  employeeName: LocalizedText;
  department: ClinicalDepartment;
  siteName: LocalizedText;
  shiftDate: string;
  shiftWindow: LocalizedText;
  verifiedHours: number;
  markedByClientName: LocalizedText;
  markedByRole: LocalizedText;
  reasonCategory: LocalizedText;
  reasonDetail: LocalizedText;
  auditHash: string;
  acknowledgedByEmployee: boolean;
}

export interface ShiftItem {
  id: string;
  date: string;
  window: string;
  shiftType: LocalizedText;
  department: ClinicalDepartment;
  siteId: string;
  siteName: LocalizedText;
  assignedEmployeeId: string;
  assignedEmployeeName: LocalizedText;
  hourlyRateThb: number;
  status: LocalizedText;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: LocalizedText;
  department: ClinicalDepartment;
  siteName: LocalizedText;
  leaveType: LocalizedText;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: LocalizedText;
  statusKey: 'pending' | 'client_approved' | 'admin_approved' | 'rejected';
  status: LocalizedText;
  approvedBy?: LocalizedText;
  createdAt: string;
}

export interface CandidateContract {
  id: string;
  candidateName: LocalizedText;
  specialtyTitle: LocalizedText;
  department: ClinicalDepartment;
  medicalLicenseNo: string;
  experienceYears: number;
  appliedSite: LocalizedText;
  contractCode: string;
  contractType: LocalizedText;
  hourlyRateThb: number;
  statusKey: 'pending_sign' | 'esigned' | 'admin_approved';
  status: LocalizedText;
  signedAt?: string;
  signatureSvgDataUrl?: string;
}

export interface TrainingCourse {
  id: string;
  department: ClinicalDepartment;
  title: LocalizedText;
  durationMinutes: number;
  instructor: LocalizedText;
  modulesCount: number;
  completionPct: number;
  videoTopicSummary: LocalizedText;
  keyProtocols: LocalizedText[];
  quizQuestions: {
    question: LocalizedText;
    options: LocalizedText[];
    correctIndex: number;
  }[];
}

export interface BiWeeklyReview {
  id: string;
  periodLabel: LocalizedText;
  employeeId: string;
  employeeName: LocalizedText;
  department: ClinicalDepartment;
  siteName: LocalizedText;
  reviewerName: LocalizedText;
  clinicalCompetencyScore: number;
  punctualityScore: number;
  patientSatisfactionScore: number;
  discCode: string;
  revenueContributionThb: number;
  notes: LocalizedText;
}

export interface interfacePayrollSeedItem {
  id: string;
  period: LocalizedText;
  employeeId: string;
  employeeName: LocalizedText;
  roleTitle: LocalizedText;
  email: string;
  department: ClinicalDepartment;
  siteName: LocalizedText;
  hourlyRateThb: number;
  regularHours: number;
  overtimeHours: number;
  daymarkVerifiedHours: number;
  shiftsCompleted: number;
  kpiBonusThb: number;
  statusKey: 'approved' | 'pending';
  status: LocalizedText;
  emailSent: boolean;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  actorName: LocalizedText;
  actorRole: UserRole;
  moduleName: LocalizedText;
  actionSummary: LocalizedText;
  securityHash: string;
}

export const ROLE_PROFILES: Record<UserRole, RoleProfile> = {
  admin: {
    role: 'admin',
    code: 'ADM-TH-01',
    label: {
      en: 'Executive Governance & Medical Directorate',
      th: 'คณะผู้บริหารระบบและผู้อำนวยการฝ่ายการแพทย์',
    },
    shortRoleLabel: {
      en: 'Executive Director',
      th: 'ผู้บริหารระบบ',
    },
    fullName: {
      en: 'Dr. Chakrit Charoensuk, MD',
      th: 'นพ. จักรกฤษณ์ เจริญสุข',
    },
    title: {
      en: 'Chief Executive Officer & Medical Staffing Director',
      th: 'ประธานเจ้าหน้าที่บริหารและผู้อำนวยการฝ่ายบริหารบุคลากรทางการแพทย์',
    },
    organization: {
      en: 'Daymark Healthcare Staffing (Thailand) Co., Ltd.',
      th: 'บริษัท เดย์มาร์ค เฮลท์แคร์ สตาฟฟิ่ง (ประเทศไทย) จำกัด',
    },
    email: 'admin@daymark.co.th',
    demoPassword: 'Daymark@2026',
    avatarUrl: '/src/assets/images/avatar_admin_director_1794049572242.jpg',
    initials: 'CC',
    mfaEnabled: true,
    emailVerified: true,
    ssoProvider: 'Google Workspace',
  },
  client: {
    role: 'client',
    code: 'BHM-TH-01',
    label: {
      en: 'Partner Hospital Operations Directorate',
      th: 'ฝ่ายบริหารจัดการเวรโรงพยาบาลพันธมิตร',
    },
    shortRoleLabel: {
      en: 'Hospital Director',
      th: 'ผู้ประสานงานโรงพยาบาล',
    },
    fullName: {
      en: 'Nalinee Rattanakorn, RN, MSc',
      th: 'พว. นลินี รัตนากร (พยาบาลวิชาชีพชำนาญการ)',
    },
    title: {
      en: 'Head of On-site Clinical Workforce Coordination',
      th: 'หัวหน้าฝ่ายประสานงานบุคลากรทางการแพทย์ประจำโรงพยาบาล',
    },
    organization: {
      en: 'Bumrungrad International Hospital (Sukhumvit, Bangkok)',
      th: 'โรงพยาบาลบำรุงราษฎร์ อินเตอร์เนชั่นแนล (สุขุมวิท กรุงเทพฯ)',
    },
    email: 'client@bumrungrad.co.th',
    demoPassword: 'Daymark@2026',
    avatarUrl: '/src/assets/images/avatar_client_coordinator_1794049574109.jpg',
    initials: 'NR',
    mfaEnabled: true,
    emailVerified: true,
    ssoProvider: 'Microsoft Entra ID',
  },
  employee: {
    role: 'employee',
    code: 'DM-TH-0842',
    label: {
      en: 'Attending Physician & Clinical Specialist',
      th: 'แพทย์เฉพาะทางและบุคลากรทางการแพทย์',
    },
    shortRoleLabel: {
      en: 'Attending Clinician',
      th: 'แพทย์และพยาบาลวิชาชีพ',
    },
    fullName: {
      en: 'Dr. Thanakorn Srisuwan, MD',
      th: 'นพ. ธนกร ศรีสุวรรณ',
    },
    title: {
      en: 'Critical Care & ICU Specialist Physician',
      th: 'แพทย์เฉพาะทางเวชบำบัดวิกฤต (Critical Care / ICU)',
    },
    organization: {
      en: 'Assigned to Bumrungrad International Hospital · ICU Tower A',
      th: 'ปฏิบัติงานประจำ โรงพยาบาลบำรุงราษฎร์ อินเตอร์เนชั่นแนล · อาคาร ICU',
    },
    email: 'clinician@daymark.co.th',
    demoPassword: 'Daymark@2026',
    initials: 'TS',
    mfaEnabled: true,
    emailVerified: true,
    ssoProvider: 'Email/Password + TOTP',
  },
};

export const HOSPITAL_SITES: HospitalSite[] = [
  {
    id: 'site-bumrungrad',
    name: {
      en: 'Bumrungrad International Hospital (Bangkok)',
      th: 'โรงพยาบาลบำรุงราษฎร์ อินเตอร์เนชั่นแนล (กรุงเทพฯ)',
    },
    address: {
      en: '33 Sukhumvit 3 (Soi Nana Nua), Watthana, Bangkok 10110',
      th: '33 สุขุมวิท ซอย 3 (นานาเหนือ) แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพฯ 10110',
    },
    departmentFocus: ['Critical Care', 'IPD', 'OPD'],
    coords: { lat: 13.7462, lng: 100.5528 },
    geofenceRadiusMeters: 250,
    contactCoordinator: {
      en: 'Nalinee Rattanakorn, RN · Staffing Director',
      th: 'พว. นลินี รัตนากร · หัวหน้าฝ่ายจัดสรรเวร',
    },
  },
  {
    id: 'site-bdms-hq',
    name: {
      en: 'Bangkok Hospital Headquarters — BDMS',
      th: 'โรงพยาบาลกรุงเทพ สำนักงานใหญ่ (BDMS ซอยศูนย์วิจัย)',
    },
    address: {
      en: '2 Soi Soonvijai 7, New Petchaburi Rd, Huai Khwang, Bangkok 10310',
      th: '2 ซอยศูนย์วิจัย 7 ถนนเพชรบุรีตัดใหม่ แขวงบางกะปิ เขตห้วยขวาง กรุงเทพฯ 10310',
    },
    departmentFocus: ['Critical Care', 'IPD'],
    coords: { lat: 13.7483, lng: 100.5836 },
    geofenceRadiusMeters: 250,
    contactCoordinator: {
      en: 'Dr. Somchai Vorapong, MD · Medical Operations',
      th: 'นพ. สมชาย วรพงศ์ · ผู้อำนวยการฝ่ายปฏิบัติการแพทย์',
    },
  },
  {
    id: 'site-samitivej',
    name: {
      en: 'Samitivej Sukhumvit Hospital',
      th: 'โรงพยาบาลสมิติเวช สุขุมวิท',
    },
    address: {
      en: '133 Sukhumvit 49, Khlong Tan Nuea, Watthana, Bangkok 10110',
      th: '133 สุขุมวิท 49 แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110',
    },
    departmentFocus: ['OPD', 'IPD'],
    coords: { lat: 13.7354, lng: 100.5768 },
    geofenceRadiusMeters: 250,
    contactCoordinator: {
      en: 'Kanyawee Pongpat, RN · Nursing Director',
      th: 'พว. กัญญาวีร์ พงศ์พัฒน์ · หัวหน้าพยาบาลประสานงาน',
    },
  },
  {
    id: 'site-siriraj-siph',
    name: {
      en: 'Siriraj Piyamaharajkarun Hospital (SiPH)',
      th: 'โรงพยาบาลศิริราช ปิยมหาราชการุณย์ (SiPH)',
    },
    address: {
      en: '2 Wanglang Rd, Siriraj, Bangkok Noi, Bangkok 10700',
      th: '2 ถนนวังหลัง แขวงศิริราช เขตบางกอกน้อย กรุงเทพฯ 10700',
    },
    departmentFocus: ['Critical Care', 'IPD', 'OPD'],
    coords: { lat: 13.7592, lng: 100.4856 },
    geofenceRadiusMeters: 250,
    contactCoordinator: {
      en: 'Assoc. Prof. Dr. Piyawat K., MD · ICU Chair',
      th: 'รศ.นพ. ปิยะวัฒน์ กิตติกุล · ประธานศูนย์เวชบำบัดวิกฤต',
    },
  },
];

export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  {
    id: 'att-101',
    employeeId: 'DM-TH-0842',
    employeeName: {
      en: 'Dr. Thanakorn Srisuwan, MD',
      th: 'นพ. ธนกร ศรีสุวรรณ',
    },
    employeeRoleTitle: {
      en: 'Critical Care Physician (ICU)',
      th: 'แพทย์เวชบำบัดวิกฤต (ICU)',
    },
    department: 'Critical Care',
    siteId: 'site-bumrungrad',
    siteName: {
      en: 'Bumrungrad International Hospital (Bangkok)',
      th: 'โรงพยาบาลบำรุงราษฎร์ อินเตอร์เนชั่นแนล',
    },
    shiftLabel: {
      en: 'Morning ICU Shift (07:00 - 15:00)',
      th: 'เวรเช้าหอผู้ป่วยวิกฤต ICU (07:00 - 15:00)',
    },
    clockInTime: '06:54:18 · 07/11/2026',
    clockOutTime: null,
    gpsDistanceMeters: 42,
    geofenceValid: true,
    livenessScore: 0.98,
    faceMatchScore: 0.99,
    verificationMethod: {
      en: 'Biometric GPS + Face-scan',
      th: 'สแกนใบหน้าชีวมิติ + พิกัด GPS',
    },
    isDaymarkException: false,
    status: {
      en: 'Active On-Shift',
      th: 'กำลังปฏิบัติงาน',
    },
  },
  {
    id: 'att-102',
    employeeId: 'DM-TH-1104',
    employeeName: {
      en: 'Pimchanok Wattana, RN',
      th: 'พว. พิมพ์ชนก วัฒนา',
    },
    employeeRoleTitle: {
      en: 'Senior Inpatient Charge Nurse (IPD)',
      th: 'หัวหน้าพยาบาลหอผู้ป่วยใน (IPD)',
    },
    department: 'IPD',
    siteId: 'site-bumrungrad',
    siteName: {
      en: 'Bumrungrad International Hospital (Bangkok)',
      th: 'โรงพยาบาลบำรุงราษฎร์ อินเตอร์เนชั่นแนล',
    },
    shiftLabel: {
      en: 'Morning IPD Ward Shift (07:00 - 15:00)',
      th: 'เวรเช้าหอผู้ป่วยใน IPD (07:00 - 15:00)',
    },
    clockInTime: '06:51:05 · 07/11/2026',
    clockOutTime: null,
    gpsDistanceMeters: 64,
    geofenceValid: true,
    livenessScore: 0.96,
    faceMatchScore: 0.97,
    verificationMethod: {
      en: 'Biometric GPS + Face-scan',
      th: 'สแกนใบหน้าชีวมิติ + พิกัด GPS',
    },
    isDaymarkException: false,
    status: {
      en: 'Active On-Shift',
      th: 'กำลังปฏิบัติงาน',
    },
  },
  {
    id: 'att-103',
    employeeId: 'DM-TH-0915',
    employeeName: {
      en: 'Dr. Supachai Limpongsai, MD',
      th: 'นพ. ศุภชัย ลิ้มพงษ์ไพศาล',
    },
    employeeRoleTitle: {
      en: 'Outpatient Specialist Physician (OPD)',
      th: 'แพทย์ตรวจรักษาผู้ป่วยนอก (OPD)',
    },
    department: 'OPD',
    siteId: 'site-samitivej',
    siteName: {
      en: 'Samitivej Sukhumvit Hospital',
      th: 'โรงพยาบาลสมิติเวช สุขุมวิท',
    },
    shiftLabel: {
      en: 'OPD Day Clinic Shift (08:00 - 17:00)',
      th: 'เวรคลินิกผู้ป่วยนอก OPD (08:00 - 17:00)',
    },
    clockInTime: '07:48:40 · 07/11/2026',
    clockOutTime: null,
    gpsDistanceMeters: 52,
    geofenceValid: true,
    livenessScore: 0.95,
    faceMatchScore: 0.98,
    verificationMethod: {
      en: 'Biometric GPS + Face-scan',
      th: 'สแกนใบหน้าชีวมิติ + พิกัด GPS',
    },
    isDaymarkException: false,
    status: {
      en: 'Active On-Shift',
      th: 'กำลังปฏิบัติงาน',
    },
  },
  {
    id: 'att-104',
    employeeId: 'DM-TH-0419',
    employeeName: {
      en: 'Kittipong Suwan, Perfusionist & ECMO Tech',
      th: 'กิตติพงศ์ สุวรรณ (นักเทคโนโลยีหัวใจและทรวงอก ECMO)',
    },
    employeeRoleTitle: {
      en: 'ECMO & Ventilator Perfusion Specialist',
      th: 'ผู้เชี่ยวชาญเครื่องปอดและหัวใจเทียม ECMO',
    },
    department: 'Critical Care',
    siteId: 'site-bumrungrad',
    siteName: {
      en: 'Bumrungrad International Hospital (Bangkok)',
      th: 'โรงพยาบาลบำรุงราษฎร์ อินเตอร์เนชั่นแนล',
    },
    shiftLabel: {
      en: 'Night Emergency Shift (22:00 - 06:00)',
      th: 'เวรดึกฉุกเฉินวิกฤต (22:00 - 06:00)',
    },
    clockInTime: '22:00:00 · 06/11/2026',
    clockOutTime: '06:05:12 · 07/11/2026',
    gpsDistanceMeters: 0,
    geofenceValid: true,
    livenessScore: 1.0,
    faceMatchScore: 1.0,
    verificationMethod: {
      en: 'Daymark (Client Verified)',
      th: 'Daymark (โรงพยาบาลยืนยันเวลาทำงาน)',
    },
    isDaymarkException: true,
    status: {
      en: 'Daymark Verified',
      th: 'ยืนยันผ่าน Daymark',
    },
  },
];

export const INITIAL_DAYMARK_LOGS: DaymarkAuditEntry[] = [
  {
    id: 'dm-log-01',
    timestamp: '06:10:22 · 07/11/2026',
    employeeId: 'DM-TH-0419',
    employeeName: {
      en: 'Kittipong Suwan (ECMO Specialist)',
      th: 'กิตติพงศ์ สุวรรณ (ผู้เชี่ยวชาญ ECMO)',
    },
    department: 'Critical Care',
    siteName: {
      en: 'Bumrungrad International Hospital (Bangkok)',
      th: 'โรงพยาบาลบำรุงราษฎร์ อินเตอร์เนชั่นแนล',
    },
    shiftDate: '06/11/2026',
    shiftWindow: {
      en: '22:00 - 06:00 (Night ICU Shift)',
      th: '22:00 - 06:00 (เวรดึก ICU)',
    },
    verifiedHours: 8,
    markedByClientName: {
      en: 'Nalinee Rattanakorn, RN',
      th: 'พว. นลินี รัตนากร',
    },
    markedByRole: {
      en: 'Bumrungrad Clinical Workforce Director',
      th: 'หัวหน้าฝ่ายประสานงานบุคลากรโรงพยาบาลบำรุงราษฎร์',
    },
    reasonCategory: {
      en: 'Emergency Resuscitation (Code Blue)',
      th: 'ภารกิจกู้ชีพฉุกเฉินเร่งด่วน (Code Blue)',
    },
    reasonDetail: {
      en: 'Clinician entered Cardiothoracic OR #3 directly at 21:50 for emergency ECMO cannulation and could not access personal mobile device for face scan.',
      th: 'บุคลากรเข้าห้องผ่าตัดหัวใจและทรวงอกหมายเลข 3 ทันทีเวลา 21:50 น. เพื่อติดตั้งเครื่อง ECMO ฉุกเฉิน จึงไม่สามารถใช้โทรศัพท์ส่วนตัวสแกนใบหน้าได้',
    },
    auditHash: 'SHA256-9F8A2D41E7C0',
    acknowledgedByEmployee: true,
  },
  {
    id: 'dm-log-02',
    timestamp: '15:18:45 · 05/11/2026',
    employeeId: 'DM-TH-0842',
    employeeName: {
      en: 'Dr. Thanakorn Srisuwan, MD',
      th: 'นพ. ธนกร ศรีสุวรรณ',
    },
    department: 'Critical Care',
    siteName: {
      en: 'Bumrungrad International Hospital (Bangkok)',
      th: 'โรงพยาบาลบำรุงราษฎร์ อินเตอร์เนชั่นแนล',
    },
    shiftDate: '05/11/2026',
    shiftWindow: {
      en: '07:00 - 15:00 (Morning ICU Shift)',
      th: '07:00 - 15:00 (เวรเช้า ICU)',
    },
    verifiedHours: 8,
    markedByClientName: {
      en: 'Nalinee Rattanakorn, RN',
      th: 'พว. นลินี รัตนากร',
    },
    markedByRole: {
      en: 'Bumrungrad Clinical Workforce Director',
      th: 'หัวหน้าฝ่ายประสานงานบุคลากรโรงพยาบาลบำรุงราษฎร์',
    },
    reasonCategory: {
      en: 'Inter-Departmental Trauma Dispatch',
      th: 'การระดมทีมแพทย์ฉุกเฉินข้ามแผนก',
    },
    reasonDetail: {
      en: 'Dr. Thanakorn was dispatched immediately to Sub-Basement B2 Trauma Bay upon arrival (temporary GPS shielding indoors). Verified via hospital security badge log.',
      th: 'นพ. ธนกร ถูกตามตัวด่วนไปยังห้องฉุกเฉินชั้นใต้ดิน B2 ทันทีที่มาถึง (สัญญาณ GPS อับชั่วคราวภายในอาคาร) ตรวจสอบยืนยันผ่านระบบบัตรผ่านโรงพยาบาลเรียบร้อยแล้ว',
    },
    auditHash: 'SHA256-4C1B7E09A23D',
    acknowledgedByEmployee: true,
  },
];

export const INITIAL_SHIFTS: ShiftItem[] = [
  {
    id: 'sh-201',
    date: '07/11/2026',
    window: '07:00 - 15:00',
    shiftType: {
      en: '24/7 Critical Care Shift',
      th: 'เวรวิกฤตฉุกเฉิน 24 ชั่วโมง',
    },
    department: 'Critical Care',
    siteId: 'site-bumrungrad',
    siteName: {
      en: 'Bumrungrad International Hospital (Bangkok)',
      th: 'โรงพยาบาลบำรุงราษฎร์ อินเตอร์เนชั่นแนล',
    },
    assignedEmployeeId: 'DM-TH-0842',
    assignedEmployeeName: {
      en: 'Dr. Thanakorn Srisuwan, MD',
      th: 'นพ. ธนกร ศรีสุวรรณ',
    },
    hourlyRateThb: 1200,
    status: {
      en: 'In Progress',
      th: 'กำลังปฏิบัติงาน',
    },
  },
  {
    id: 'sh-202',
    date: '07/11/2026',
    window: '07:00 - 15:00',
    shiftType: {
      en: 'Fixed Ward Shift',
      th: 'เวรประจำหอผู้ป่วยใน',
    },
    department: 'IPD',
    siteId: 'site-bumrungrad',
    siteName: {
      en: 'Bumrungrad International Hospital (Bangkok)',
      th: 'โรงพยาบาลบำรุงราษฎร์ อินเตอร์เนชั่นแนล',
    },
    assignedEmployeeId: 'DM-TH-1104',
    assignedEmployeeName: {
      en: 'Pimchanok Wattana, RN',
      th: 'พว. พิมพ์ชนก วัฒนา',
    },
    hourlyRateThb: 650,
    status: {
      en: 'In Progress',
      th: 'กำลังปฏิบัติงาน',
    },
  },
  {
    id: 'sh-203',
    date: '08/11/2026',
    window: '15:00 - 23:00',
    shiftType: {
      en: 'Rotating Shift',
      th: 'เวรหมุนเวียน (Rotating)',
    },
    department: 'Critical Care',
    siteId: 'site-bdms-hq',
    siteName: {
      en: 'Bangkok Hospital Headquarters — BDMS',
      th: 'โรงพยาบาลกรุงเทพ สำนักงานใหญ่ (BDMS)',
    },
    assignedEmployeeId: 'DM-TH-0842',
    assignedEmployeeName: {
      en: 'Dr. Thanakorn Srisuwan, MD',
      th: 'นพ. ธนกร ศรีสุวรรณ',
    },
    hourlyRateThb: 1200,
    status: {
      en: 'Confirmed',
      th: 'ยืนยันตารางเวรแล้ว',
    },
  },
  {
    id: 'sh-204',
    date: '08/11/2026',
    window: '08:00 - 17:00',
    shiftType: {
      en: 'Fixed Outpatient Shift',
      th: 'เวรคลินิกผู้ป่วยนอกประจำ',
    },
    department: 'OPD',
    siteId: 'site-samitivej',
    siteName: {
      en: 'Samitivej Sukhumvit Hospital',
      th: 'โรงพยาบาลสมิติเวช สุขุมวิท',
    },
    assignedEmployeeId: 'DM-TH-0915',
    assignedEmployeeName: {
      en: 'Dr. Supachai Limpongsai, MD',
      th: 'นพ. ศุภชัย ลิ้มพงษ์ไพศาล',
    },
    hourlyRateThb: 1050,
    status: {
      en: 'Confirmed',
      th: 'ยืนยันตารางเวรแล้ว',
    },
  },
];

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'lv-301',
    employeeId: 'DM-TH-1104',
    employeeName: {
      en: 'Pimchanok Wattana, RN',
      th: 'พว. พิมพ์ชนก วัฒนา',
    },
    department: 'IPD',
    siteName: {
      en: 'Bumrungrad International Hospital (Bangkok)',
      th: 'โรงพยาบาลบำรุงราษฎร์ อินเตอร์เนชั่นแนล',
    },
    leaveType: {
      en: 'Annual Leave',
      th: 'ลาพักร้อนประจำปี',
    },
    startDate: '12/11/2026',
    endDate: '13/11/2026',
    daysCount: 2,
    reason: {
      en: 'Attending Thailand National Nursing Council Symposium in Chiang Mai.',
      th: 'เข้าร่วมการประชุมวิชาการสภาการพยาบาลแห่งประเทศไทย ณ จังหวัดเชียงใหม่',
    },
    statusKey: 'pending',
    status: {
      en: 'Pending Approval',
      th: 'รอการอนุมัติ',
    },
    createdAt: '06/11/2026 · 16:40',
  },
  {
    id: 'lv-302',
    employeeId: 'DM-TH-0842',
    employeeName: {
      en: 'Dr. Thanakorn Srisuwan, MD',
      th: 'นพ. ธนกร ศรีสุวรรณ',
    },
    department: 'Critical Care',
    siteName: {
      en: 'Bumrungrad International Hospital (Bangkok)',
      th: 'โรงพยาบาลบำรุงราษฎร์ อินเตอร์เนชั่นแนล',
    },
    leaveType: {
      en: 'Annual Leave (CME)',
      th: 'ลาพักร้อนเพื่อศึกษาต่อเนื่องทางการแพทย์ (CME)',
    },
    startDate: '18/11/2026',
    endDate: '18/11/2026',
    daysCount: 1,
    reason: {
      en: 'Medical Council of Thailand Critical Care Recertification Workshop.',
      th: 'อบรมต่ออายุใบรับรองเวชบำบัดวิกฤตของแพทยสภาแห่งประเทศไทย',
    },
    statusKey: 'admin_approved',
    status: {
      en: 'Approved by Admin',
      th: 'อนุมัติขั้นสูงสุดโดย Admin แล้ว',
    },
    approvedBy: {
      en: 'Dr. Chakrit Charoensuk, MD (Admin)',
      th: 'นพ. จักรกฤษณ์ เจริญสุข (Admin)',
    },
    createdAt: '02/11/2026 · 09:15',
  },
];

export const INITIAL_CONTRACTS: CandidateContract[] = [
  {
    id: 'ctr-401',
    candidateName: {
      en: 'Dr. Thanakorn Srisuwan, MD',
      th: 'นพ. ธนกร ศรีสุวรรณ',
    },
    specialtyTitle: {
      en: 'Board-Certified Critical Care Physician',
      th: 'แพทย์ผู้เชี่ยวชาญเฉพาะทางเวชบำบัดวิกฤต (วว.)',
    },
    department: 'Critical Care',
    medicalLicenseNo: 'TMC-ว.48291 (แพทยสภา)',
    experienceYears: 7,
    appliedSite: {
      en: 'Bumrungrad International Hospital (Bangkok)',
      th: 'โรงพยาบาลบำรุงราษฎร์ อินเตอร์เนชั่นแนล',
    },
    contractCode: 'CTR-TH-2026-0842',
    contractType: {
      en: 'Full-Time Clinical Specialist Agreement',
      th: 'สัญญาจ้างแพทย์ผู้เชี่ยวชาญเต็มเวลา (Full-Time)',
    },
    hourlyRateThb: 1200,
    statusKey: 'admin_approved',
    status: {
      en: 'Approved & Active PDF',
      th: 'อนุมัติและมีผลบังคับใช้แล้ว',
    },
    signedAt: '15/10/2026 · 14:20',
  },
  {
    id: 'ctr-402',
    candidateName: {
      en: 'Dr. Narongrit Panyarachun, MD',
      th: 'นพ. ณรงค์ฤทธิ์ ปัญญารชุน',
    },
    specialtyTitle: {
      en: 'Internal Medicine & Hospitalist Physician',
      th: 'อายุรแพทย์ประจำหอผู้ป่วยใน (Hospitalist)',
    },
    department: 'IPD',
    medicalLicenseNo: 'TMC-ว.59104 (แพทยสภา)',
    experienceYears: 5,
    appliedSite: {
      en: 'Bangkok Hospital Headquarters — BDMS',
      th: 'โรงพยาบาลกรุงเทพ สำนักงานใหญ่ (BDMS)',
    },
    contractCode: 'CTR-TH-2026-0988',
    contractType: {
      en: 'Locum Tenens Clinical Staffing Contract',
      th: 'สัญญาจ้างแพทย์หมุนเวียนตามตารางเวร (Locum)',
    },
    hourlyRateThb: 1100,
    statusKey: 'pending_sign',
    status: {
      en: 'Awaiting E-Signature',
      th: 'รอการลงนามอิเล็กทรอนิกส์ (E-Signature)',
    },
  },
  {
    id: 'ctr-403',
    candidateName: {
      en: 'Chulalak Boonmee, RN',
      th: 'พว. จุฑาลักษณ์ บุญมี',
    },
    specialtyTitle: {
      en: 'Registered Outpatient Triage Nurse',
      th: 'พยาบาลวิชาชีพคัดกรองผู้ป่วยนอก (OPD)',
    },
    department: 'OPD',
    medicalLicenseNo: 'TNMC-พย.31882 (สภาการพยาบาล)',
    experienceYears: 4,
    appliedSite: {
      en: 'Samitivej Sukhumvit Hospital',
      th: 'โรงพยาบาลสมิติเวช สุขุมวิท',
    },
    contractCode: 'CTR-TH-2026-1012',
    contractType: {
      en: 'Locum Tenens Clinical Staffing Contract',
      th: 'สัญญาจ้างพยาบาลหมุนเวียนตามตารางเวร (Locum)',
    },
    hourlyRateThb: 600,
    statusKey: 'esigned',
    status: {
      en: 'E-Signed by Clinician',
      th: 'บุคลากรลงนาม E-Signature แล้ว',
    },
    signedAt: '06/11/2026 · 11:05',
  },
];

export const TRAINING_COURSES: TrainingCourse[] = [
  {
    id: 'trn-cc-01',
    department: 'Critical Care',
    title: {
      en: 'ACLS Resuscitation & Lung-Protective ICU Ventilation Protocol',
      th: 'แนวทางปฏิบัติการช่วยชีวิตขั้นสูง (ACLS) และการตั้งเครื่องช่วยหายใจใน ICU',
    },
    durationMinutes: 45,
    instructor: {
      en: 'Prof. Dr. Somsakเกียรติกุล, MD (Siriraj / Bumrungrad ICU)',
      th: 'ศ.นพ. สมศักดิ์ เกียรติกุล (ผู้เชี่ยวชาญเวชบำบัดวิกฤต)',
    },
    modulesCount: 4,
    completionPct: 100,
    videoTopicSummary: {
      en: 'Standardized Code Blue airway management, ARDS lung-protective mechanical ventilation (6 ml/kg PBW), and ICU SBAR shift handovers for Thai JCI-accredited hospitals.',
      th: 'มาตรฐานการจัดการทางเดินหายใจกรณี Code Blue การตั้งค่าเครื่องช่วยหายใจเพื่อปกป้องปอดในผู้ป่วย ARDS และการส่งต่อเวรด้วยระบบ SBAR ตามมาตรฐานโรงพยาบาล JCI ในประเทศไทย',
    },
    keyProtocols: [
      {
        en: 'Early recognition of Sepsis-3 and execution of the Surviving Sepsis Hour-1 Bundle',
        th: 'การประเมินภาวะติดเชื้อในกระแสเลือด (Sepsis-3) และการดำเนินการตามชุดปฏิบัติการภายใน 1 ชั่วโมงแรก (Hour-1 Bundle)',
      },
      {
        en: 'Initial ARDS ventilator targets: Tidal Volume (Vt) 6 ml/kg PBW and Plateau Pressure (Pplat) <= 30 cmH2O',
        th: 'การตั้งค่าเครื่องช่วยหายใจผู้ป่วย ARDS: ปริมาตรอากาศ (Vt) 6 ml/kg PBW และควบคุมความดัน Pplat <= 30 cmH2O',
      },
      {
        en: 'Daymark exception workflow when responding to immediate Code Blue emergencies prior to mobile face-scan',
        th: 'ขั้นตอนการขอยืนยันเวลาทำงานผ่านฟีเจอร์ Daymark เมื่อต้องเข้าช่วยฟื้นคืนชีพ Code Blue ทันทีโดยไม่ทันสแกนใบหน้า',
      },
    ],
    quizQuestions: [
      {
        question: {
          en: 'What is the target Tidal Volume (Vt) for lung-protective mechanical ventilation in an ICU patient with ARDS?',
          th: 'เป้าหมายปริมาตรอากาศหายใจเข้า (Tidal Volume - Vt) สำหรับการตั้งเครื่องช่วยหายใจแบบปกป้องปอดในผู้ป่วย ARDS ที่หอผู้ป่วยวิกฤตคือเท่าใด?',
        },
        options: [
          {
            en: '6 ml/kg Predicted Body Weight (PBW) with Plateau Pressure <= 30 cmH2O',
            th: '6 มล./กก. ของน้ำหนักตัวอุดมคติ (PBW) และควบคุมความดัน Pplat <= 30 cmH2O',
          },
          {
            en: '12 ml/kg actual body weight without pressure limits',
            th: '12 มล./กก. ของน้ำหนักตัวจริงโดยไม่จำกัดความดัน',
          },
          {
            en: '3 ml/kg actual body weight at 6 breaths/min',
            th: '3 มล./กก. ของน้ำหนักตัวจริง ที่อัตราการหายใจ 6 ครั้ง/นาที',
          },
          {
            en: '15 ml/kg PBW across all patients',
            th: '15 มล./กก. PBW ในผู้ป่วยทุกราย',
          },
        ],
        correctIndex: 0,
      },
      {
        question: {
          en: 'Which action is required within the first hour under the Sepsis Hour-1 Bundle?',
          th: 'ข้อใดคือขั้นตอนที่ต้องปฏิบัติภายในชั่วโมงแรกตามแนวทาง Sepsis Hour-1 Bundle?',
        },
        options: [
          {
            en: 'Delay antibiotics for 48 hours until blood culture final report',
            th: 'ชะลอการให้ยาปฏิชีวนะออกไป 48 ชั่วโมงจนกว่าผลเพาะเชื้อจะออกครบ',
          },
          {
            en: 'Measure serum lactate, obtain blood cultures prior to antibiotics, and administer broad-spectrum IV antibiotics',
            th: 'เจาะตรวจระดับแลคเตทในเลือด ส่งเพาะเชื้อจากเลือดก่อนให้ยา และให้ยาปฏิชีวนะทางหลอดเลือดดำทันที',
          },
          {
            en: 'Administer fluids only if systolic BP drops below 50 mmHg',
            th: 'ให้สารน้ำเฉพาะเมื่อความดันโลหิตตัวบนต่ำกว่า 50 mmHg เท่านั้น',
          },
          {
            en: 'Omit urine output monitoring during the first 6 hours',
            th: 'งดการติดตามปริมาณปัสสาวะในช่วง 6 ชั่วโมงแรก',
          },
        ],
        correctIndex: 1,
      },
      {
        question: {
          en: 'When an ICU physician misses mobile Clock-in due to an immediate Code Blue resuscitation, what is the compliant Daymark protocol?',
          th: 'หากแพทย์เวรวิกฤตไม่สามารถกด Clock-in บนมือถือได้ทันเนื่องจากต้องเข้ากู้ชีพ Code Blue ทันที ขั้นตอนที่ถูกต้องบนระบบ Daymark คือข้อใด?',
        },
        options: [
          {
            en: 'Ask a colleague to scan a printed photograph on the camera',
            th: 'ให้เพื่อนร่วมงานนำภาพถ่ายหน้าตรงมาสแกนแทนหน้ากล้อง',
          },
          {
            en: 'Leave the shift unrecorded and forfeit compensation',
            th: 'ปล่อยเวรว่างไว้โดยไม่ต้องบันทึกเวลาทำงาน',
          },
          {
            en: 'The Hospital Roster Director executes a Daymark verification entry with the Code Blue reason logged in the Audit Trail',
            th: 'ผู้อำนวยการประสานงานโรงพยาบาลทำรายการยืนยันเวลาทำงานผ่านฟีเจอร์ Daymark พร้อมระบุเหตุผล Code Blue ลงใน Audit Log',
          },
          {
            en: 'Manually alter the smartphone system clock',
            th: 'แก้ไขเวลาในตั้งค่าโทรศัพท์มือถือด้วยตนเอง',
          },
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    id: 'trn-ipd-02',
    department: 'IPD',
    title: {
      en: 'JCI Inpatient Safety Goals, Medication 5-Rights & SBAR Handover',
      th: 'มาตรฐานความปลอดภัยผู้ป่วยใน JCI การให้ยา 5-Rights และการส่งเวร SBAR',
    },
    durationMinutes: 35,
    instructor: {
      en: 'Dr. Anchalee Siriporn, RN, PhD',
      th: 'ดร.พว. อัญชลี ศิริพร',
    },
    modulesCount: 3,
    completionPct: 90,
    videoTopicSummary: {
      en: 'Enforcing the 6 International Patient Safety Goals (IPSG) across inpatient wards at BDMS and Bumrungrad partner facilities.',
      th: 'การบังคับใช้เป้าหมายความปลอดภัยผู้ป่วยสากล 6 ประการ (IPSG) ในหอผู้ป่วยในของโรงพยาบาลพันธมิตรเครือ BDMS และบำรุงราษฎร์',
    },
    keyProtocols: [
      {
        en: 'Verify at least 2 patient identifiers (Full Name + Date of Birth / HN) before administering any medication or blood product',
        th: 'ตรวจสอบตัวตนผู้ป่วยอย่างน้อย 2 ตัวบ่งชี้ (ชื่อ-นามสกุลจริง + วันเดือนปีเกิด หรือหมายเลข HN) ก่อนให้ยาหรือทำหัตถการทุกครั้ง',
      },
      {
        en: 'Conduct structured SBAR shift handovers (Situation, Background, Assessment, Recommendation)',
        th: 'ดำเนินการส่งต่อเวรระหว่างทีมอย่างเป็นระบบตามโครงสร้าง SBAR (Situation, Background, Assessment, Recommendation)',
      },
      {
        en: 'Comply with WHO 5 Moments for Hand Hygiene and high-alert medication double-checks',
        th: 'ปฏิบัติตามหลักการล้างมือ 5 ขั้นตอนของ WHO และการตรวจสอบซ้ำโดยพยาบาล 2 ท่านสำหรับยาความเสี่ยงสูง (High-Alert Medications)',
      },
    ],
    quizQuestions: [
      {
        question: {
          en: 'Under JCI International Patient Safety Goals in an IPD ward, how many patient identifiers must be verified prior to IV medication?',
          th: 'ตามมาตรฐานความปลอดภัยสากล JCI ในหอผู้ป่วยใน (IPD) ต้องตรวจสอบตัวบ่งชี้ผู้ป่วยอย่างน้อยกี่อย่างก่อนให้ยาทางหลอดเลือดดำ?',
        },
        options: [
          {
            en: 'Room number only',
            th: 'ดูเฉพาะหมายเลขเตียงหรือห้องพักเท่านั้น',
          },
          {
            en: 'At least 2 independent identifiers (Full Name + Date of Birth or Hospital Number HN)',
            th: 'อย่างน้อย 2 ตัวบ่งชี้ (ชื่อ-นามสกุลเต็ม + วันเดือนปีเกิด หรือรหัสประจำตัวผู้ป่วย HN)',
          },
          {
            en: 'Visual recognition by the nurse',
            th: 'การจำหน้าผู้ป่วยได้โดยพยาบาลเวร',
          },
          {
            en: 'Asking a visitor in the hallway',
            th: 'สอบถามจากญาติที่เดินผ่านหน้าห้อง',
          },
        ],
        correctIndex: 1,
      },
      {
        question: {
          en: 'In the SBAR clinical handover framework, what does the letter "A" stand for?',
          th: 'ในรูปแบบการส่งต่อข้อมูลทางคลินิก SBAR ตัวอักษร "A" หมายถึงข้อใด?',
        },
        options: [
          {
            en: 'Accounting & Billing',
            th: 'Accounting (การคิดค่ารักษาพยาบาล)',
          },
          {
            en: 'Assessment (Current clinical findings and vital sign trends)',
            th: 'Assessment (การประเมินอาการทางคลินิกและแนวโน้มสัญญาณชีพในปัจจุบัน)',
          },
          {
            en: 'Admission Date',
            th: 'Admission (วันที่รับผู้ป่วยเข้าโรงพยาบาล)',
          },
          {
            en: 'Authorization Code',
            th: 'Authorization (รหัสอนุมัติสิทธิ์ประกัน)',
          },
        ],
        correctIndex: 1,
      },
      {
        question: {
          en: 'What is the required procedure before administering a High-Alert Medication (such as IV Insulin or Heparin) in the IPD ward?',
          th: 'ข้อใดคือขั้นตอนบังคับก่อนการบริหารยาความเสี่ยงสูง (High-Alert Medication เช่น อินซูลินทางหลอดเลือดดำ หรือเฮพาริน) ในหอผู้ป่วยใน?',
        },
        options: [
          {
            en: 'Independent double-check by two licensed clinicians prior to administration',
            th: 'ต้องมีการตรวจสอบซ้ำอย่างเป็นอิสระ (Independent Double-Check) โดยบุคลากรวิชาชีพ 2 ท่านก่อนให้ยาเสมอ',
          },
          {
            en: 'Administer immediately and document at the end of the week',
            th: 'ฉีดยาทันทีและค่อยลงบันทึกเมื่อสิ้นสุดสัปดาห์',
          },
          {
            en: 'Dilute without checking the physician order',
            th: 'ผสมยาตามความคุ้นเคยโดยไม่ต้องดูคำสั่งแพทย์',
          },
          {
            en: 'Leave the syringe unlabeled at the bedside',
            th: 'วางกระบอกฉีดยาไว้ข้างเตียงโดยไม่ต้องติดฉลาก',
          },
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'trn-opd-03',
    department: 'OPD',
    title: {
      en: 'Outpatient Triage Red-Flag Screening & PDPA Data Privacy Compliance',
      th: 'การคัดกรองผู้ป่วยนอก (OPD Triage) และการคุ้มครองข้อมูลส่วนบุคคลทางการแพทย์ (PDPA)',
    },
    durationMinutes: 30,
    instructor: {
      en: 'Dr. Supachai Limpongsai, MD',
      th: 'นพ. ศุภชัย ลิ้มพงษ์ไพศาล',
    },
    modulesCount: 3,
    completionPct: 95,
    videoTopicSummary: {
      en: 'Rapid triage screening for chest pain/stroke red flags in high-volume Bangkok outpatient clinics and Thailand PDPA / HIPAA compliance.',
      th: 'การคัดกรองสัญญาณอันตรายเร่งด่วน (เจ็บหน้าอกเฉียบพลัน/โรคหลอดเลือดสมอง) ในคลินิกผู้ป่วยนอก และการปฏิบัติตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)',
    },
    keyProtocols: [
      {
        en: 'Identify acute coronary and FAST stroke red flags within 3 minutes of OPD arrival',
        th: 'คัดกรองอาการเจ็บหน้าอกหัวใจขาดเลือดและอาการโรคหลอดเลือดสมอง (FAST) ภายใน 3 นาทีแรกที่มาถึงจุดคัดกรอง OPD',
      },
      {
        en: 'Explain medication regimens, drug allergy checks, and follow-up schedules clearly to Thai and international patients',
        th: 'อธิบายขนาดยา ตรวจสอบประวัติแพ้ยา และนัดหมายติดตามอาการอย่างชัดเจนทั้งผู้ป่วยชาวไทยและชาวต่างชาติ',
      },
      {
        en: 'Enforce Thailand PDPA & HIPAA electronic medical record (EMR) workstation locking',
        th: 'ล็อกหน้าจอระบบเวชระเบียนอิเล็กทรอนิกส์ (EMR) ทุกครั้งที่ลุกจากโต๊ะตรวจตามมาตรฐาน PDPA และ HIPAA',
      },
    ],
    quizQuestions: [
      {
        question: {
          en: 'What is the primary clinical objective of initial OPD Triage upon patient arrival?',
          th: 'เป้าหมายสำคัญที่สุดของการคัดกรองผู้ป่วยเบื้องต้น (OPD Triage) เมื่อผู้ป่วยมาถึงเคาน์เตอร์พยาบาลคือข้อใด?',
        },
        options: [
          {
            en: 'Queue patients strictly by insurance tier',
            th: 'จัดคิวตรวจตามระดับวงเงินประกันชีวิตเท่านั้น',
          },
          {
            en: 'Rapidly detect life-threatening Red Flags (e.g., acute chest pain, stroke) for immediate ER transfer',
            th: 'ตรวจจับสัญญาณอันตรายถึงชีวิต (Red Flags เช่น เจ็บหน้าอกเฉียบพลัน หรืออัมพาตเฉียบพลัน) เพื่อส่งต่อห้องฉุกเฉินทันที',
          },
          {
            en: 'Collect pharmacy payment prior to vital signs',
            th: 'เก็บเงินค่ายาก่อนวัดสัญญาณชีพ',
          },
          {
            en: 'Skip blood pressure measurement for walk-in patients',
            th: 'ข้ามการวัดความดันโลหิตในผู้ป่วยที่เดินมาเองได้',
          },
        ],
        correctIndex: 1,
      },
      {
        question: {
          en: 'To comply with Thailand PDPA and HIPAA when stepping away from an OPD examination workstation, a clinician must:',
          th: 'เพื่อปฏิบัติตามกฎหมาย PDPA และมาตรฐาน HIPAA เมื่อแพทย์หรือพยาบาลต้องลุกออกจากหน้าจอคอมพิวเตอร์ห้องตรวจ OPD ต้องทำอย่างไร?',
        },
        options: [
          {
            en: 'Leave the patient EMR open for convenience',
            th: 'เปิดหน้าจอเวชระเบียนผู้ป่วยค้างไว้เพื่อความสะดวก',
          },
          {
            en: 'Lock the EMR session immediately and never store patient identifiers on personal phones',
            th: 'ล็อกเซสชันหน้าจอ EMR ทันที และห้ามถ่ายภาพข้อมูลผู้ป่วยเก็บไว้ในโทรศัพท์ส่วนตัวเด็ดขาด',
          },
          {
            en: 'Post anonymized lab charts on public messaging groups',
            th: 'ส่งภาพผลแล็บผู้ป่วยลงในกลุ่มแชทสาธารณะ',
          },
          {
            en: 'Share login credentials with temporary staff',
            th: 'บอกรหัสผ่านเข้าใช้งานระบบแก่เจ้าหน้าที่ท่านอื่น',
          },
        ],
        correctIndex: 1,
      },
      {
        question: {
          en: 'Which practice directly improves Bi-Weekly Patient Satisfaction scores in the OPD clinic?',
          th: 'แนวปฏิบัติใดช่วยยกระดับคะแนนความพึงพอใจของผู้ป่วยในการประเมินผลรายปักษ์ (Bi-Weekly Evaluation) ของแผนก OPD ได้โดยตรง?',
        },
        options: [
          {
            en: 'Completing consultations in under 45 seconds without answering questions',
            th: 'ตรวจให้เสร็จภายใน 45 วินาทีโดยไม่เปิดโอกาสให้ผู้ป่วยซักถาม',
          },
          {
            en: 'Verifying drug allergies, explaining diagnosis clearly, and outlining warning signs requiring early return',
            th: 'ตรวจสอบประวัติแพ้ยา อธิบายการวินิจฉัยและวิธีใช้ยาอย่างชัดเจน พร้อมแจ้งอาการผิดปกติที่ต้องกลับมาพบแพทย์ก่อนนัด',
          },
          {
            en: 'Prescribing maximum medications without explanation',
            th: 'สั่งยาจำนวนมากที่สุดโดยไม่อธิบายสรรพคุณ',
          },
          {
            en: 'Skipping vital sign review',
            th: 'ไม่อ่านค่าสัญญาณชีพที่พยาบาลคัดกรองไว้',
          },
        ],
        correctIndex: 1,
      },
    ],
  },
];

export const INITIAL_BIWEEKLY_REVIEWS: BiWeeklyReview[] = [
  {
    id: 'rev-501',
    periodLabel: {
      en: 'Cycle 2 · Oct 2026 (16–31 Oct)',
      th: 'รอบที่ 2 · ตุลาคม 2569 (16–31 ต.ค.)',
    },
    employeeId: 'DM-TH-0842',
    employeeName: {
      en: 'Dr. Thanakorn Srisuwan, MD',
      th: 'นพ. ธนกร ศรีสุวรรณ',
    },
    department: 'Critical Care',
    siteName: {
      en: 'Bumrungrad International Hospital (Bangkok)',
      th: 'โรงพยาบาลบำรุงราษฎร์ อินเตอร์เนชั่นแนล',
    },
    reviewerName: {
      en: 'Nalinee Rattanakorn, RN (Hospital Roster Director)',
      th: 'พว. นลินี รัตนากร (หัวหน้าฝ่ายประสานงาน รพ.)',
    },
    clinicalCompetencyScore: 97,
    punctualityScore: 99,
    patientSatisfactionScore: 96,
    discCode: 'D-C',
    revenueContributionThb: 640000,
    notes: {
      en: 'Outstanding leadership during 4 complex cardiogenic shock admissions at Bumrungrad ICU Tower A.',
      th: 'มีความเป็นผู้นำทางการแพทย์ยอดเยี่ยมในการดูแลผู้ป่วยภาวะช็อกจากโรคหัวใจขั้นวิกฤต 4 ราย ณ หอผู้ป่วย ICU อาคาร A',
    },
  },
  {
    id: 'rev-502',
    periodLabel: {
      en: 'Cycle 2 · Oct 2026 (16–31 Oct)',
      th: 'รอบที่ 2 · ตุลาคม 2569 (16–31 ต.ค.)',
    },
    employeeId: 'DM-TH-1104',
    employeeName: {
      en: 'Pimchanok Wattana, RN',
      th: 'พว. พิมพ์ชนก วัฒนา',
    },
    department: 'IPD',
    siteName: {
      en: 'Bumrungrad International Hospital (Bangkok)',
      th: 'โรงพยาบาลบำรุงราษฎร์ อินเตอร์เนชั่นแนล',
    },
    reviewerName: {
      en: 'Nalinee Rattanakorn, RN (Hospital Roster Director)',
      th: 'พว. นลินี รัตนากร (หัวหน้าฝ่ายประสานงาน รพ.)',
    },
    clinicalCompetencyScore: 94,
    punctualityScore: 98,
    patientSatisfactionScore: 97,
    discCode: 'S-C',
    revenueContributionThb: 385000,
    notes: {
      en: 'Zero medication errors and exemplary SBAR bedside handovers across international inpatient suites.',
      th: 'ไม่พบความคลาดเคลื่อนทางยา (Zero Medication Error) และส่งต่อเวรข้างเตียงด้วยระบบ SBAR ได้อย่างดีเยี่ยม',
    },
  },
  {
    id: 'rev-503',
    periodLabel: {
      en: 'Cycle 2 · Oct 2026 (16–31 Oct)',
      th: 'รอบที่ 2 · ตุลาคม 2569 (16–31 ต.ค.)',
    },
    employeeId: 'DM-TH-0915',
    employeeName: {
      en: 'Dr. Supachai Limpongsai, MD',
      th: 'นพ. ศุภชัย ลิ้มพงษ์ไพศาล',
    },
    department: 'OPD',
    siteName: {
      en: 'Samitivej Sukhumvit Hospital',
      th: 'โรงพยาบาลสมิติเวช สุขุมวิท',
    },
    reviewerName: {
      en: 'Kanyawee Pongpat, RN (Hospital Roster Director)',
      th: 'พว. กัญญาวีร์ พงศ์พัฒน์ (หัวหน้าฝ่ายประสานงาน รพ.)',
    },
    clinicalCompetencyScore: 93,
    punctualityScore: 96,
    patientSatisfactionScore: 98,
    discCode: 'I-S',
    revenueContributionThb: 492000,
    notes: {
      en: '95% patient follow-up retention rate across bilingual Thai/Expat outpatient consultations.',
      th: 'อัตราการกลับมาตรวจติดตามของผู้ป่วยชาวไทยและชาวต่างชาติสูงถึง 95% ด้วยการสื่อสารที่ชัดเจนและใส่ใจ',
    },
  },
];

export const INITIAL_PAYROLL_ITEMS: interfacePayrollSeedItem[] = [
  {
    id: 'pay-601',
    period: {
      en: 'October 2026 Payroll Cycle',
      th: 'งวดบัญชีเงินเดือน ตุลาคม 2569',
    },
    employeeId: 'DM-TH-0842',
    employeeName: {
      en: 'Dr. Thanakorn Srisuwan, MD',
      th: 'นพ. ธนกร ศรีสุวรรณ',
    },
    roleTitle: {
      en: 'Critical Care Physician (ICU)',
      th: 'แพทย์เฉพาะทางเวชบำบัดวิกฤต (ICU)',
    },
    email: 'clinician@daymark.co.th',
    department: 'Critical Care',
    siteName: {
      en: 'Bumrungrad International Hospital (Bangkok)',
      th: 'โรงพยาบาลบำรุงราษฎร์ อินเตอร์เนชั่นแนล',
    },
    hourlyRateThb: 1200,
    regularHours: 152,
    overtimeHours: 16,
    daymarkVerifiedHours: 8,
    shiftsCompleted: 22,
    kpiBonusThb: 18000,
    statusKey: 'approved',
    status: {
      en: 'Approved & E-Payslip Issued',
      th: 'อนุมัติและจัดส่งสลิปเงินเดือนอิเล็กทรอนิกส์แล้ว',
    },
    emailSent: true,
  },
  {
    id: 'pay-602',
    period: {
      en: 'October 2026 Payroll Cycle',
      th: 'งวดบัญชีเงินเดือน ตุลาคม 2569',
    },
    employeeId: 'DM-TH-1104',
    employeeName: {
      en: 'Pimchanok Wattana, RN',
      th: 'พว. พิมพ์ชนก วัฒนา',
    },
    roleTitle: {
      en: 'Senior Inpatient Charge Nurse (IPD)',
      th: 'หัวหน้าพยาบาลหอผู้ป่วยใน (IPD)',
    },
    email: 'pimchanok.w@daymark.co.th',
    department: 'IPD',
    siteName: {
      en: 'Bumrungrad International Hospital (Bangkok)',
      th: 'โรงพยาบาลบำรุงราษฎร์ อินเตอร์เนชั่นแนล',
    },
    hourlyRateThb: 650,
    regularHours: 160,
    overtimeHours: 10,
    daymarkVerifiedHours: 0,
    shiftsCompleted: 21,
    kpiBonusThb: 8500,
    statusKey: 'pending',
    status: {
      en: 'Pending Admin Approval',
      th: 'รอการอนุมัติจากผู้ดูแลระบบ (Admin)',
    },
    emailSent: false,
  },
  {
    id: 'pay-603',
    period: {
      en: 'October 2026 Payroll Cycle',
      th: 'งวดบัญชีเงินเดือน ตุลาคม 2569',
    },
    employeeId: 'DM-TH-0915',
    employeeName: {
      en: 'Dr. Supachai Limpongsai, MD',
      th: 'นพ. ศุภชัย ลิ้มพงษ์ไพศาล',
    },
    roleTitle: {
      en: 'Outpatient Specialist Physician (OPD)',
      th: 'แพทย์ตรวจรักษาผู้ป่วยนอก (OPD)',
    },
    email: 'supachai.l@daymark.co.th',
    department: 'OPD',
    siteName: {
      en: 'Samitivej Sukhumvit Hospital',
      th: 'โรงพยาบาลสมิติเวช สุขุมวิท',
    },
    hourlyRateThb: 1050,
    regularHours: 160,
    overtimeHours: 8,
    daymarkVerifiedHours: 0,
    shiftsCompleted: 20,
    kpiBonusThb: 12000,
    statusKey: 'approved',
    status: {
      en: 'Approved & E-Payslip Issued',
      th: 'อนุมัติและจัดส่งสลิปเงินเดือนอิเล็กทรอนิกส์แล้ว',
    },
    emailSent: true,
  },
  {
    id: 'pay-604',
    period: {
      en: 'October 2026 Payroll Cycle',
      th: 'งวดบัญชีเงินเดือน ตุลาคม 2569',
    },
    employeeId: 'DM-TH-0419',
    employeeName: {
      en: 'Kittipong Suwan (ECMO Specialist)',
      th: 'กิตติพงศ์ สุวรรณ (ผู้เชี่ยวชาญ ECMO)',
    },
    roleTitle: {
      en: 'ECMO & Ventilator Perfusion Specialist',
      th: 'ผู้เชี่ยวชาญเครื่องปอดและหัวใจเทียม ECMO',
    },
    email: 'kittipong.s@daymark.co.th',
    department: 'Critical Care',
    siteName: {
      en: 'Bumrungrad International Hospital (Bangkok)',
      th: 'โรงพยาบาลบำรุงราษฎร์ อินเตอร์เนชั่นแนล',
    },
    hourlyRateThb: 850,
    regularHours: 144,
    overtimeHours: 14,
    daymarkVerifiedHours: 8,
    shiftsCompleted: 20,
    kpiBonusThb: 9000,
    statusKey: 'pending',
    status: {
      en: 'Pending Admin Approval',
      th: 'รอการอนุมัติจากผู้ดูแลระบบ (Admin)',
    },
    emailSent: false,
  },
];

export const INITIAL_AUDIT_LOGS: SystemAuditLog[] = [
  {
    id: 'aud-901',
    timestamp: '07/11/2026 · 06:54:18',
    actorName: {
      en: 'Dr. Thanakorn Srisuwan, MD',
      th: 'นพ. ธนกร ศรีสุวรรณ',
    },
    actorRole: 'employee',
    moduleName: {
      en: 'Biometric Attendance',
      th: 'ระบบลงเวลาชีวมิติ',
    },
    actionSummary: {
      en: 'Biometric Clock-in verified at Bumrungrad International Hospital (GPS 42m, Liveness 98%, 1:N Match 99%)',
      th: 'สแกนใบหน้าเข้าเวรสำเร็จ ณ โรงพยาบาลบำรุงราษฎร์ (ระยะ GPS 42 ม., Liveness 98%, 1:N Match 99%)',
    },
    securityHash: 'AES256-7B2E901A',
  },
  {
    id: 'aud-902',
    timestamp: '07/11/2026 · 06:10:22',
    actorName: {
      en: 'Nalinee Rattanakorn, RN',
      th: 'พว. นลินี รัตนากร',
    },
    actorRole: 'client',
    moduleName: {
      en: 'Daymark Verification',
      th: 'การยืนยันเวลาทำงาน Daymark',
    },
    actionSummary: {
      en: 'Hospital Roster Director verified 8.0h Daymark attendance for Kittipong Suwan — Reason: Emergency ECMO Code Blue',
      th: 'หัวหน้าฝ่ายประสานงานโรงพยาบาลยืนยันเวลาทำงาน Daymark 8.0 ชม. ให้ กิตติพงศ์ สุวรรณ — เหตุผล: กู้ชีพฉุกเฉิน ECMO Code Blue',
    },
    securityHash: 'SHA256-9F8A2D41',
  },
  {
    id: 'aud-903',
    timestamp: '06/11/2026 · 17:30:00',
    actorName: {
      en: 'Dr. Chakrit Charoensuk, MD',
      th: 'นพ. จักรกฤษณ์ เจริญสุข',
    },
    actorRole: 'admin',
    moduleName: {
      en: 'Compensation & E-Payslip',
      th: 'อนุมัติเงินเดือนและ E-Payslip',
    },
    actionSummary: {
      en: 'Approved encrypted PDF E-Payslips in THB for Dr. Thanakorn Srisuwan and Dr. Supachai Limpongsai',
      th: 'อนุมัติและเข้ารหัสสลิปเงินเดือน PDF (บาท THB) สำหรับ นพ. ธนกร และ นพ. ศุภชัย เรียบร้อยแล้ว',
    },
    securityHash: 'AES256-4D8C11F3',
  },
];

export const ROLE_PERMISSION_MATRIX_ROWS: {
  feature: LocalizedText;
  admin: LocalizedText;
  client: LocalizedText;
  employee: LocalizedText;
}[] = [
  {
    feature: {
      en: 'GPS & Biometric Face-Scan',
      th: 'ลงเวลา GPS และสแกนใบหน้าชีวมิติ',
    },
    admin: { en: 'View All Hospital Sites', th: 'ดูข้อมูลทั้งหมดทุกโรงพยาบาล' },
    client: { en: 'Monitor On-Site Clinicians', th: 'ตรวจสอบบุคลากรประจำโรงพยาบาล' },
    employee: { en: 'Execute Clock-in / Clock-out', th: 'สแกนลงเวลาเข้า-ออกงาน' },
  },
  {
    feature: {
      en: 'Clinical Operations Analytics',
      th: 'แดชบอร์ดและรายงานวิเคราะห์',
    },
    admin: { en: 'Full THB Revenue & Workforce Analytics', th: 'วิเคราะห์รายได้และภาพรวมทั้งระบบ' },
    client: { en: 'Hospital Site Analytics & Shift Coverage', th: 'สถิติชั่วโมงทำงานและเวรประจำโรงพยาบาล' },
    employee: { en: 'Personal Hours, Shifts & Leave Balance', th: 'ดูชั่วโมงทำงาน ตารางเวร และวันลาคงเหลือ' },
  },
  {
    feature: {
      en: 'On-Site Shift Scheduling',
      th: 'การจัดตารางเวรปฏิบัติงาน',
    },
    admin: { en: 'Global Shift Administration', th: 'บริหารและสร้างตารางเวรทั้งหมด' },
    client: { en: 'Assign Hospital Site Shifts', th: 'จัดสรรตารางเวรภายในโรงพยาบาล' },
    employee: { en: 'View Assigned Clinical Shifts', th: 'ดูตารางเวรส่วนบุคคล' },
  },
  {
    feature: {
      en: 'Leave & Handover Approval',
      th: 'การอนุมัติใบลาและส่งมอบเวร',
    },
    admin: { en: 'Final Executive Approval', th: 'อนุมัติขั้นสูงสุดและตัดโควตาวันลา' },
    client: { en: 'On-Site Coverage Approval', th: 'อนุมัติระดับโรงพยาบาลและจัดคนแทนเวร' },
    employee: { en: 'Submit Leave Requests', th: 'ยื่นคำร้องขอลาหยุด' },
  },
  {
    feature: {
      en: 'Daymark Exception Verification',
      th: 'การยืนยันเวลาทำงาน Daymark',
    },
    admin: { en: 'Audit Immutable Logs', th: 'ตรวจสอบบันทึก Audit Log ทั้งหมด' },
    client: { en: 'Execute Daymark Marking (Exclusive)', th: 'ดำเนินการยืนยันเวลา Daymark แทนบุคลากร' },
    employee: { en: 'Inspect Personal Daymark Logs', th: 'ตรวจสอบประวัติ Daymark อย่างโปร่งใส' },
  },
  {
    feature: {
      en: 'Credentialing & E-Contracts',
      th: 'ใบประกอบวิชาชีพและสัญญาอิเล็กทรอนิกส์',
    },
    admin: { en: 'Approve & Manage Contract Templates', th: 'อนุมัติและจัดการแม่แบบสัญญาจ้าง' },
    client: { en: 'Inspect Medical Council Licenses (TMC)', th: 'ตรวจสอบใบประกอบวิชาชีพเวชกรรม' },
    employee: { en: 'Apply & Execute E-Signature', th: 'ยื่นใบสมัครและลงนาม E-Signature' },
  },
  {
    feature: {
      en: 'Clinical Academy & CME Exams',
      th: 'หลักสูตรฝึกอบรมและแบบทดสอบ CME',
    },
    admin: { en: 'Manage OPD / IPD / ICU Curriculum', th: 'จัดการหลักสูตร OPD / IPD / ICU' },
    client: { en: 'Assign & Track Clinician Readiness', th: 'มอบหมายและติดตามผลการอบรม' },
    employee: { en: 'Study Modules & Take Online Quiz', th: 'เข้าเรียนและทำแบบทดสอบออนไลน์' },
  },
  {
    feature: {
      en: 'DISC & Bi-Weekly Competency Reviews',
      th: 'การวิเคราะห์ DISC และประเมินผลรายปักษ์',
    },
    admin: { en: 'View System-Wide Performance & Revenue', th: 'ดูสรุปผลงานและรายได้รวมทั้งระบบ' },
    client: { en: 'Conduct Bi-Weekly Clinician Reviews', th: 'ประเมินผลการปฏิบัติงานทุก 2 สัปดาห์' },
    employee: { en: 'Take DISC Assessment & View Scores', th: 'ทำแบบประเมิน DISC และดูผลคะแนน' },
  },
  {
    feature: {
      en: 'THB Compensation & Encrypted E-Payslip',
      th: 'การคำนวณค่าตอบแทนและสลิป E-Payslip',
    },
    admin: { en: 'Approve Payroll & Dispatch PDF E-Payslips', th: 'อนุมัติงวดเงินเดือนและส่ง E-Payslip' },
    client: { en: 'View Hospital Site Staffing Cost', th: 'ดูสรุปต้นทุนบุคลากรประจำโรงพยาบาล' },
    employee: { en: 'Download Encrypted PDF E-Payslip', th: 'รับและดาวน์โหลดสลิปเงินเดือน PDF' },
  },
];
