import React, { useState } from 'react';
import {
  Activity,
  ScanFace,
  CalendarClock,
  FileSignature,
  GraduationCap,
  CreditCard,
  MessageSquareHeart,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Lock,
  LogOut,
  Globe,
} from 'lucide-react';
import {
  UserRole,
  AppLocale,
  detectDefaultLocale,
  canRolePerformAction,
  tText,
} from './utils/workforceRules';
import {
  ROLE_PROFILES,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_DAYMARK_LOGS,
  INITIAL_SHIFTS,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_CONTRACTS,
  INITIAL_BIWEEKLY_REVIEWS,
  INITIAL_PAYROLL_ITEMS,
  INITIAL_AUDIT_LOGS,
  ROLE_PERMISSION_MATRIX_ROWS,
  AttendanceRecord,
  DaymarkAuditEntry,
  ShiftItem,
  LeaveRequest,
  CandidateContract,
  BiWeeklyReview,
  interfacePayrollSeedItem,
  SystemAuditLog,
} from './data/seedWorkforceData';
import { LoginAndStageshowView } from './components/LoginAndStageshowView';
import { DashboardModule } from './components/DashboardModule';
import { AttendanceDaymarkModule } from './components/AttendanceDaymarkModule';
import { ShiftLeaveModule } from './components/ShiftLeaveModule';
import { RecruitmentContractModule } from './components/RecruitmentContractModule';
import { TrainingEvaluationModule } from './components/TrainingEvaluationModule';
import { PayrollPayslipModule } from './components/PayrollPayslipModule';
import {
  SupportChatbotModule,
  AccountSecurityModal,
} from './components/SupportAuthModals';
import {
  ClinicianDossierModal,
  FacilityInspectorModal,
  resolveClinicianDossier,
  InspectedClinician,
} from './components/InteractiveInspectorModals';
import { Window } from './kit';

import avatarAdminImg from './assets/images/avatar_admin_director_1794049572242.jpg';
import avatarClientImg from './assets/images/avatar_client_coordinator_1794049574109.jpg';

export type ModuleKey =
  | 'dashboard'
  | 'attendance'
  | 'shifts'
  | 'contracts'
  | 'training'
  | 'payroll'
  | 'support'
  | 'rbac';

export default function App() {
  // Default language is English ('en') unless browser default language starts with 'th'
  const [locale, setLocale] = useState<AppLocale>(() => detectDefaultLocale());

  // Check URL params for deep-link testing (?role=admin|client|employee or ?autostart=1)
  const initialUrlState = (): { authenticated: boolean; role: UserRole } => {
    if (typeof window === 'undefined') {
      return { authenticated: false, role: 'admin' };
    }
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    if (roleParam === 'admin' || roleParam === 'client' || roleParam === 'employee') {
      return { authenticated: true, role: roleParam };
    }
    if (params.get('autostart') === '1') {
      return { authenticated: true, role: 'admin' };
    }
    return { authenticated: false, role: 'admin' };
  };

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => initialUrlState().authenticated
  );
  const [currentRole, setCurrentRole] = useState<UserRole>(
    () => initialUrlState().role
  );
  const [activeModule, setActiveModule] = useState<ModuleKey>('dashboard');
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [inspectedClinician, setInspectedClinician] = useState<InspectedClinician | null>(null);
  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);

  const handleInspectClinician = (idOrName: string) => {
    setInspectedClinician(resolveClinicianDossier(idOrName));
  };

  const handleInspectFacility = () => {
    setIsFacilityModalOpen(true);
  };

  // Interactive stateful data across all clinical workforce modules
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(
    INITIAL_ATTENDANCE_RECORDS
  );
  const [daymarkLogs, setDaymarkLogs] = useState<DaymarkAuditEntry[]>(
    INITIAL_DAYMARK_LOGS
  );
  const [shifts, setShifts] = useState<ShiftItem[]>(INITIAL_SHIFTS);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(
    INITIAL_LEAVE_REQUESTS
  );
  const [contracts, setContracts] = useState<CandidateContract[]>(
    INITIAL_CONTRACTS
  );
  const [reviews, setReviews] = useState<BiWeeklyReview[]>(
    INITIAL_BIWEEKLY_REVIEWS
  );
  const [payrollItems, setPayrollItems] = useState<interfacePayrollSeedItem[]>(
    INITIAL_PAYROLL_ITEMS
  );
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>(INITIAL_AUDIT_LOGS);

  const activeProfile = ROLE_PROFILES[currentRole];

  const handleAddAuditLog = (newLog: SystemAuditLog) => {
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Account Login Handler — sets role strictly based on authenticated account
  const handleLoginSuccess = (role: UserRole, email: string) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
    setActiveModule('dashboard');

    const profile = ROLE_PROFILES[role];
    handleAddAuditLog({
      id: `aud-${Math.floor(100 + Math.random() * 899)}`,
      timestamp: '07/11/2026 · 09:00:00',
      actorName: profile.fullName,
      actorRole: role,
      moduleName: {
        en: 'Authentication & RBAC Session',
        th: 'การเข้าสู่ระบบและกำหนดสิทธิ์ตามบัญชี (RBAC)',
      },
      actionSummary: {
        en: `Authenticated session established for ${email} with fixed RBAC role [${role.toUpperCase()}].`,
        th: `เข้าสู่ระบบสำเร็จด้วยบัญชี ${email} พร้อมสิทธิ์ตามบทบาท [${role.toUpperCase()}]`,
      },
      securityHash: 'SHA256-AUTH2FA',
    });
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
  };

  // Biometric Clock-In & Clock-Out handlers
  const handleAddAttendanceRecord = (newRecord: AttendanceRecord) => {
    setAttendanceRecords((prev) => [newRecord, ...prev]);
    handleAddAuditLog({
      id: `aud-${Math.floor(100 + Math.random() * 899)}`,
      timestamp: '07/11/2026 · 06:58:20',
      actorName: newRecord.employeeName,
      actorRole: currentRole,
      moduleName: {
        en: 'Biometric Attendance',
        th: 'ลงเวลาด้วยข้อมูลชีวมิติ',
      },
      actionSummary: {
        en: `GPS (${newRecord.gpsDistanceMeters}m) + Liveness (${Math.round(
          newRecord.livenessScore * 100
        )}%) + 1:N Face Match (${Math.round(newRecord.faceMatchScore * 100)}%).`,
        th: `สแกนใบหน้าเข้าเวรสำเร็จ พิกัด GPS (${newRecord.gpsDistanceMeters} ม.) + Liveness (${Math.round(
          newRecord.livenessScore * 100
        )}%)`,
      },
      securityHash: 'AES256-BIO992',
    });
  };

  const handleClockOutRecord = (recordId: string, clockOutTime: string) => {
    setAttendanceRecords((prev) =>
      prev.map((rec) =>
        rec.id === recordId
          ? {
              ...rec,
              clockOutTime,
              status: {
                en: 'Completed Shift (Verified)',
                th: 'ออกเวรเรียบร้อยแล้ว (ยืนยันชีวมิติ)',
              },
            }
          : rec
      )
    );
  };

  // Daymark Confirmation handler (Hospital Director / Executive Director)
  const handleAddDaymarkEntry = (
    entry: DaymarkAuditEntry,
    correspondingAttendance: AttendanceRecord
  ) => {
    setDaymarkLogs((prev) => [entry, ...prev]);
    setAttendanceRecords((prev) => [correspondingAttendance, ...prev]);

    setPayrollItems((prev) =>
      prev.map((p, idx) =>
        idx === 0
          ? {
              ...p,
              daymarkVerifiedHours: p.daymarkVerifiedHours + entry.verifiedHours,
            }
          : p
      )
    );

    handleAddAuditLog({
      id: `aud-${Math.floor(100 + Math.random() * 899)}`,
      timestamp: entry.timestamp,
      actorName: activeProfile.fullName,
      actorRole: currentRole,
      moduleName: {
        en: 'Daymark Verification',
        th: 'การยืนยันเวลาทำงาน Daymark',
      },
      actionSummary: {
        en: `Hospital Daymark confirmed ${entry.verifiedHours}h clinical shift for ${entry.employeeName.en}. Reason: ${entry.reasonCategory.en}`,
        th: `โรงพยาบาลยืนยันเวลาทำงาน Daymark (${entry.verifiedHours} ชม.) ให้ ${entry.employeeName.th} เหตุผล: ${entry.reasonCategory.th}`,
      },
      securityHash: entry.auditHash,
    });
  };

  // Shifts & Leave handlers
  const handleCreateShift = (newShift: ShiftItem) => {
    setShifts((prev) => [newShift, ...prev]);
    handleAddAuditLog({
      id: `aud-${Math.floor(100 + Math.random() * 899)}`,
      timestamp: '07/11/2026 · 10:05:00',
      actorName: activeProfile.fullName,
      actorRole: currentRole,
      moduleName: {
        en: 'Clinical Shift Roster',
        th: 'ตารางเวรบุคลากรทางการแพทย์',
      },
      actionSummary: {
        en: `Assigned ${newShift.window} shift for ${newShift.assignedEmployeeName.en} on ${newShift.date}.`,
        th: `จัดสรรตารางเวร ${newShift.window} ให้แก่ ${newShift.assignedEmployeeName.th} วันที่ ${newShift.date}`,
      },
      securityHash: 'SHA256-SHF701',
    });
  };

  const handleUpdateLeaveStatus = (
    leaveId: string,
    newStatusKey: LeaveRequest['statusKey'],
    comment: string
  ) => {
    const statusMap: Record<
      LeaveRequest['statusKey'],
      { en: string; th: string }
    > = {
      pending: { en: 'Pending Approval', th: 'รออนุมัติ' },
      client_approved: {
        en: 'Client Confirmed Handover',
        th: 'รพ. ยืนยันผู้รับเวรแทนแล้ว',
      },
      admin_approved: {
        en: 'Approved by Admin',
        th: 'อนุมัติขั้นสุดท้ายแล้ว',
      },
      rejected: { en: 'Declined', th: 'ไม่อนุมัติ' },
    };

    setLeaveRequests((prev) =>
      prev.map((lv) =>
        lv.id === leaveId
          ? {
              ...lv,
              statusKey: newStatusKey,
              status: statusMap[newStatusKey],
              approvedBy: activeProfile.fullName,
            }
          : lv
      )
    );
    handleAddAuditLog({
      id: `aud-${Math.floor(100 + Math.random() * 899)}`,
      timestamp: '07/11/2026 · 10:12:45',
      actorName: activeProfile.fullName,
      actorRole: currentRole,
      moduleName: {
        en: 'Leave & Handover Approval',
        th: 'การอนุมัติใบลาและส่งมอบเวร',
      },
      actionSummary: { en: comment, th: comment },
      securityHash: 'SHA256-LVE402',
    });
  };

  const handleSubmitLeaveRequest = (newLeave: LeaveRequest) => {
    setLeaveRequests((prev) => [newLeave, ...prev]);
    handleAddAuditLog({
      id: `aud-${Math.floor(100 + Math.random() * 899)}`,
      timestamp: '07/11/2026 · 10:15:00',
      actorName: activeProfile.fullName,
      actorRole: currentRole,
      moduleName: {
        en: 'Leave Request Submission',
        th: 'ยื่นใบลาออนไลน์',
      },
      actionSummary: {
        en: `Requested ${newLeave.daysCount} days (${newLeave.leaveType.en}).`,
        th: `ยื่นใบลา ${newLeave.daysCount} วัน (${newLeave.leaveType.th})`,
      },
      securityHash: 'SHA256-LVE509',
    });
  };

  // Contract E-Sign & Executive Approval
  const handleSignContract = (contractId: string, signatureDataUrl: string) => {
    setContracts((prev) =>
      prev.map((c) =>
        c.id === contractId
          ? {
              ...c,
              statusKey: c.statusKey === 'pending_sign' ? 'esigned' : c.statusKey,
              status:
                c.statusKey === 'pending_sign'
                  ? { en: 'E-Signed by Clinician', th: 'บุคลากรลงนาม E-Sign แล้ว' }
                  : c.status,
              signedAt: '07/11/2026 10:30',
              signatureSvgDataUrl: signatureDataUrl,
            }
          : c
      )
    );
    handleAddAuditLog({
      id: `aud-${Math.floor(100 + Math.random() * 899)}`,
      timestamp: '07/11/2026 · 10:30:00',
      actorName: activeProfile.fullName,
      actorRole: currentRole,
      moduleName: {
        en: 'E-Contract Signature',
        th: 'ลงนามสัญญาอิเล็กทรอนิกส์ (E-Sign)',
      },
      actionSummary: {
        en: `Signed digital clinical employment contract (${contractId}) with SHA-256 verification.`,
        th: `ลงลายมือชื่ออิเล็กทรอนิกส์ (E-Sign) บนสัญญาจ้างบุคลากรทางการแพทย์ (${contractId})`,
      },
      securityHash: 'SHA256-CNT881',
    });
  };

  const handleAdminApproveContract = (contractId: string) => {
    setContracts((prev) =>
      prev.map((c) =>
        c.id === contractId
          ? {
              ...c,
              statusKey: 'admin_approved',
              status: {
                en: 'Countersigned & Active',
                th: 'ผู้บริหารอนุมัติและมีผลบังคับใช้',
              },
            }
          : c
      )
    );
    handleAddAuditLog({
      id: `aud-${Math.floor(100 + Math.random() * 899)}`,
      timestamp: '07/11/2026 · 10:32:10',
      actorName: activeProfile.fullName,
      actorRole: currentRole,
      moduleName: {
        en: 'Executive Contract Approval',
        th: 'ผู้บริหารอนุมัติสัญญาจ้าง',
      },
      actionSummary: {
        en: `Executive Director countersigned and activated clinical contract (${contractId}).`,
        th: `ผู้บริหารระบบอนุมัติและเปิดใช้งานสัญญาจ้างบุคลากรทางการแพทย์ (${contractId})`,
      },
      securityHash: 'SHA256-CNT992',
    });
  };

  // Bi-Weekly Review handler
  const handleAddReview = (newReview: BiWeeklyReview) => {
    setReviews((prev) => [newReview, ...prev]);
    handleAddAuditLog({
      id: `aud-${Math.floor(100 + Math.random() * 899)}`,
      timestamp: '07/11/2026 · 10:45:00',
      actorName: activeProfile.fullName,
      actorRole: currentRole,
      moduleName: {
        en: 'Bi-Weekly Clinical Evaluation',
        th: 'ประเมินผลการปฏิบัติงานรายปักษ์',
      },
      actionSummary: {
        en: `Recorded Bi-Weekly evaluation for ${newReview.employeeName.en}.`,
        th: `บันทึกผลประเมินรายปักษ์สำหรับ ${newReview.employeeName.th}`,
      },
      securityHash: 'SHA256-REV310',
    });
  };

  // Payroll Approval handler
  const handleApprovePayroll = (payrollId: string) => {
    setPayrollItems((prev) =>
      prev.map((p) =>
        p.id === payrollId
          ? {
              ...p,
              statusKey: 'approved',
              status: {
                en: 'Approved & Disbursed',
                th: 'อนุมัติโอนจ่ายเรียบร้อยแล้ว',
              },
            }
          : p
      )
    );
    handleAddAuditLog({
      id: `aud-${Math.floor(100 + Math.random() * 899)}`,
      timestamp: '07/11/2026 · 11:00:00',
      actorName: activeProfile.fullName,
      actorRole: currentRole,
      moduleName: {
        en: 'THB Payroll & E-Payslip',
        th: 'อนุมัติเงินเดือนและสลิปอิเล็กทรอนิกส์',
      },
      actionSummary: {
        en: `Approved THB electronic payroll disbursement (${payrollId}) & released encrypted E-Payslip.`,
        th: `อนุมัติการโอนจ่ายเงินเดือน THB (${payrollId}) และออกสลิปเงินเดือนอิเล็กทรอนิกส์`,
      },
      securityHash: 'AES256-PAY772',
    });
  };

  // If not authenticated, render the dedicated Login + Stageshow Product Walkthrough view
  if (!isAuthenticated) {
    return (
      <LoginAndStageshowView
        locale={locale}
        onToggleLocale={setLocale}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // Navigation items filtered or badged by the logged-in account's role
  const navItems: {
    key: ModuleKey;
    label: string;
    shortDesc: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      key: 'dashboard',
      label: locale === 'th' ? 'แดชบอร์ดและวิเคราะห์' : 'Clinical Dashboard',
      shortDesc:
        currentRole === 'admin'
          ? locale === 'th'
            ? 'ภาพรวมรายได้ & ชั่วโมงทั้งระบบ'
            : 'System Revenue & Hours'
          : currentRole === 'client'
          ? locale === 'th'
            ? 'สถิติเวรประจำโรงพยาบาล'
            : 'Facility Roster & Hours'
          : locale === 'th'
          ? 'ตารางเวรและรายได้สะสม'
          : 'My Shifts & Earnings',
      icon: Activity,
    },
    {
      key: 'attendance',
      label: locale === 'th' ? 'สแกนใบหน้า & Daymark' : 'Biometric & Daymark',
      shortDesc:
        locale === 'th'
          ? 'พิกัด GPS, สแกนใบหน้า & ยืนยันเวลา'
          : 'GPS Geofence, Face-Scan & Daymark',
      icon: ScanFace,
    },
    {
      key: 'shifts',
      label: locale === 'th' ? 'ตารางเวร & การลา' : 'Shifts & Leave',
      shortDesc:
        locale === 'th'
          ? 'OPD / IPD / ICU & ส่งมอบเวร'
          : 'OPD / IPD / ICU & Handover',
      icon: CalendarClock,
    },
    {
      key: 'contracts',
      label: locale === 'th' ? 'ใบอนุญาต & สัญญา E-Sign' : 'Credentials & E-Contract',
      shortDesc:
        locale === 'th'
          ? 'ใบอนุญาตแพทยสภา & ลงนามดิจิทัล'
          : 'Thai Medical Council & E-Sign',
      icon: FileSignature,
    },
    {
      key: 'training',
      label: locale === 'th' ? 'ฝึกอบรม & ประเมินผล' : 'Clinical LMS & Reviews',
      shortDesc:
        locale === 'th'
          ? 'สอบ CME, DISC & ประเมินรายปักษ์'
          : 'CME Quiz, DISC & Bi-Weekly KPI',
      icon: GraduationCap,
    },
    {
      key: 'payroll',
      label: locale === 'th' ? 'เงินเดือน & E-Payslip' : 'THB Payroll & Receipt',
      shortDesc:
        locale === 'th'
          ? 'คำนวณบาทไทย (THB) & สลิปเข้ารหัส'
          : 'THB Ledger & Encrypted Receipt',
      icon: CreditCard,
    },
    {
      key: 'support',
      label: locale === 'th' ? 'ศูนย์ช่วยเหลือ RAG 24/7' : 'Support RAG & Escalation',
      shortDesc:
        locale === 'th'
          ? 'ถาม-ตอบระเบียบ รพ. & ติดต่อเจ้าหน้าที่'
          : 'Hospital SOP RAG & Concierge Desk',
      icon: MessageSquareHeart,
    },
    {
      key: 'rbac',
      label: locale === 'th' ? 'สิทธิ์ RBAC & Audit Log' : 'RBAC Matrix & Audit Log',
      shortDesc:
        locale === 'th'
          ? 'ตารางสิทธิ์ตามบัญชี & ประวัติระบบ'
          : 'Account Permissions & Security Log',
      icon: ShieldCheck,
    },
  ];

  const getAvatarForRole = (role: UserRole) => {
    if (role === 'admin') {
      return (
        <img
          src={avatarAdminImg}
          alt={tText(ROLE_PROFILES.admin.fullName, locale)}
          className="w-9 h-9 rounded-full object-cover border border-teal-500/40 shrink-0"
        />
      );
    }
    if (role === 'client') {
      return (
        <img
          src={avatarClientImg}
          alt={tText(ROLE_PROFILES.client.fullName, locale)}
          className="w-9 h-9 rounded-full object-cover border border-sky-500/40 shrink-0"
        />
      );
    }
    return (
      <div className="w-9 h-9 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center border border-teal-400/30 shrink-0">
        {ROLE_PROFILES.employee.initials}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8FAFC] text-[#0F172A]">
      {/* Left Clinical Command Sidebar (264px fixed on desktop) */}
      <aside className="w-full lg:w-[264px] shrink-0 bg-[#0B192C] text-slate-100 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveModule('dashboard')}
              className="flex items-center gap-3 text-left cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                D
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base tracking-tight text-white">
                    Daymark
                  </span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800/60">
                    THAILAND
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {locale === 'th'
                    ? 'ระบบบริหารบุคลากรทางการแพทย์'
                    : 'Healthcare Workforce OS'}
                </p>
              </div>
            </button>
          </div>

          {/* Authenticated Account Identity Card (Clickable to inspect dossier — NO Role Switcher) */}
          <button
            type="button"
            onClick={() => handleInspectClinician(activeProfile.code)}
            className="w-[calc(100%-24px)] text-left p-4 mx-3 my-3 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800/90 transition-colors cursor-pointer"
            title={locale === 'th' ? 'คลิกเพื่อดูแฟ้มข้อมูลบัญชี' : 'Click to inspect clinical dossier'}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-semibold">
                {tText(activeProfile.shortRoleLabel, locale)}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                2FA
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              {getAvatarForRole(currentRole)}
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {tText(activeProfile.fullName, locale)}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {tText(activeProfile.title, locale)}
                </p>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate font-mono">{activeProfile.email}</span>
            </div>
          </button>

          {/* Navigation Menu */}
          <nav className="px-3 py-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveModule(item.key)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-start gap-3 cursor-pointer ${
                    isActive
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 mt-0.5 shrink-0 ${
                      isActive ? 'text-white' : 'text-teal-400'
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold leading-tight truncate">
                      {item.label}
                    </div>
                    <div
                      className={`text-[10px] mt-0.5 truncate ${
                        isActive ? 'text-teal-100' : 'text-slate-400'
                      }`}
                    >
                      {item.shortDesc}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Account Security & Sign Out */}
        <div className="p-4 border-t border-slate-800/80 space-y-2">
          <button
            type="button"
            onClick={() => setIsSecurityModalOpen(true)}
            className="w-full py-2 px-3 rounded-lg bg-slate-800/90 hover:bg-slate-800 text-slate-200 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-teal-400" />
              {locale === 'th' ? 'ความปลอดภัยบัญชี & 2FA' : 'Account Security & 2FA'}
            </span>
            <span className="text-[10px] font-mono text-teal-400">SSO</span>
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            data-testid="sign-out-btn"
            className="w-full py-2 px-3 rounded-lg bg-rose-950/60 hover:bg-rose-900/70 border border-rose-800/50 text-rose-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            {locale === 'th'
              ? 'ออกจากระบบ (เปลี่ยนบัญชี)'
              : 'Sign Out (Switch Account)'}
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Workspace Header — Displays Authenticated Account Context + EN/TH Toggle + Sign Out (NO Role Switcher) */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-6 py-3.5">
          <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleInspectFacility}
                className="w-8 h-8 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-800 transition-colors cursor-pointer"
                title={locale === 'th' ? 'ดูข้อมูลโรงพยาบาลพันธมิตร' : 'Inspect Hospital Facility & Geofence'}
              >
                <Building2 className="w-4 h-4 shrink-0" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleInspectFacility}
                    className="text-xs font-bold text-slate-900 hover:text-teal-800 cursor-pointer"
                  >
                    {tText(activeProfile.organization, locale)}
                  </button>
                  <span className="text-[11px] font-mono text-teal-700 font-semibold">
                    [{tText(activeProfile.shortRoleLabel, locale)}]
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {locale === 'th' ? 'เข้าสู่ระบบในนาม:' : 'Authenticated as:'}{' '}
                  <button
                    type="button"
                    onClick={() => handleInspectClinician(activeProfile.code)}
                    className="font-bold text-slate-800 hover:text-teal-800 underline decoration-dotted underline-offset-2 cursor-pointer"
                  >
                    {tText(activeProfile.fullName, locale)}
                  </button>{' '}
                  ({activeProfile.email}) · {activeProfile.code}
                </p>
              </div>
            </div>

            {/* Right Controls: Language Switcher (EN / ไทย) & Sign Out */}
            <div className="flex items-center gap-3">
              <div
                className="inline-flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200"
                role="group"
                aria-label="Language Switcher"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500 ml-2 mr-1" />
                <button
                  type="button"
                  onClick={() => setLocale('en')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    locale === 'en'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLocale('th')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    locale === 'th'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ไทย (TH)
                </button>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>{locale === 'th' ? 'ออกจากระบบ' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Active Module Viewport */}
        <main className="flex-1 p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
          {activeModule === 'dashboard' && (
            <DashboardModule
              currentRole={currentRole}
              locale={locale}
              attendanceRecords={attendanceRecords}
              daymarkLogs={daymarkLogs}
              shifts={shifts}
              leaveRequests={leaveRequests}
              reviews={reviews}
              payrollItems={payrollItems}
              auditLogs={auditLogs}
              onNavigateModule={(mod) => setActiveModule(mod as ModuleKey)}
              onInspectClinician={handleInspectClinician}
              onInspectFacility={handleInspectFacility}
            />
          )}

          {activeModule === 'attendance' && (
            <AttendanceDaymarkModule
              currentRole={currentRole}
              locale={locale}
              attendanceRecords={attendanceRecords}
              daymarkLogs={daymarkLogs}
              onAddAttendanceRecord={handleAddAttendanceRecord}
              onClockOutRecord={handleClockOutRecord}
              onAddDaymarkEntry={handleAddDaymarkEntry}
              onInspectClinician={handleInspectClinician}
              onInspectFacility={handleInspectFacility}
            />
          )}

          {activeModule === 'shifts' && (
            <ShiftLeaveModule
              currentRole={currentRole}
              locale={locale}
              shifts={shifts}
              onCreateShift={handleCreateShift}
              leaveRequests={leaveRequests}
              onUpdateLeaveStatus={handleUpdateLeaveStatus}
              onSubmitLeaveRequest={handleSubmitLeaveRequest}
              onInspectClinician={handleInspectClinician}
              onInspectFacility={handleInspectFacility}
            />
          )}

          {activeModule === 'contracts' && (
            <RecruitmentContractModule
              currentRole={currentRole}
              locale={locale}
              contracts={contracts}
              onSignContract={handleSignContract}
              onAdminApproveContract={handleAdminApproveContract}
              onInspectClinician={handleInspectClinician}
              onInspectFacility={handleInspectFacility}
            />
          )}

          {activeModule === 'training' && (
            <TrainingEvaluationModule
              currentRole={currentRole}
              locale={locale}
              reviews={reviews}
              onAddReview={handleAddReview}
              onInspectClinician={handleInspectClinician}
            />
          )}

          {activeModule === 'payroll' && (
            <PayrollPayslipModule
              currentRole={currentRole}
              locale={locale}
              payrollItems={payrollItems}
              onApprovePayroll={handleApprovePayroll}
              onInspectClinician={handleInspectClinician}
            />
          )}

          {activeModule === 'support' && (
            <SupportChatbotModule
              currentRole={currentRole}
              locale={locale}
              onAddAuditLog={handleAddAuditLog}
            />
          )}

          {activeModule === 'rbac' && (
            <div className="space-y-6">
              {/* Role-Based Access Control Matrix inside Stageshow Window */}
              <Window
                title={
                  locale === 'th'
                    ? 'daymark.co.th/security/rbac — ตารางสิทธิ์การเข้าถึงตามบัญชีที่ล็อกอิน (RBAC Matrix)'
                    : 'daymark.co.th/security/rbac — Account-Bound Role Permission Matrix (RBAC)'
                }
                url="https://app.daymark.co.th/security/rbac"
              >
                <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {locale === 'th'
                        ? 'ตารางเปรียบเทียบสิทธิ์ตามบทบาทบัญชี (ผู้บริหารระบบ vs โรงพยาบาล vs บุคลากรทางการแพทย์)'
                        : 'Role-Based Access Control (RBAC) Matrix by Authenticated Account'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {locale === 'th'
                        ? 'สิทธิ์ทั้งหมดถูกกำหนดตามบัญชีที่ล็อกอินเข้ามา ไม่สามารถเปลี่ยนบทบาทเองภายในเซสชันได้'
                        : 'Permissions are strictly enforced by the logged-in account credentials.'}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-teal-800 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200">
                    {locale === 'th' ? 'บัญชีปัจจุบัน:' : 'Current Session:'}{' '}
                    <strong>{activeProfile.email}</strong> (
                    {canRolePerformAction(currentRole, 'daymark.execute_mark')
                      ? locale === 'th'
                        ? 'มีสิทธิ์ยืนยัน Daymark'
                        : 'Daymark Authorized'
                      : locale === 'th'
                      ? 'สิทธิ์ตามบทบาทบัญชี'
                      : 'Role-Bound Access'}
                    )
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/70">
                        <th className="py-3.5 px-5">
                          {locale === 'th'
                            ? 'ฟีเจอร์และขอบเขตการดำเนินงาน'
                            : 'System Capability / Domain'}
                        </th>
                        <th
                          className={`py-3.5 px-4 ${
                            currentRole === 'admin' ? 'bg-teal-50/70 text-teal-900' : ''
                          }`}
                        >
                          {locale === 'th' ? 'ผู้บริหารระบบ (Executive Director)' : 'Executive Director'}
                        </th>
                        <th
                          className={`py-3.5 px-4 ${
                            currentRole === 'client' ? 'bg-teal-50/70 text-teal-900' : ''
                          }`}
                        >
                          {locale === 'th' ? 'ผู้อำนวยการโรงพยาบาล (Hospital Director)' : 'Hospital Roster Director'}
                        </th>
                        <th
                          className={`py-3.5 px-5 ${
                            currentRole === 'employee'
                              ? 'bg-teal-50/70 text-teal-900'
                              : ''
                          }`}
                        >
                          {locale === 'th' ? 'บุคลากรทางการแพทย์ (Attending Clinician)' : 'Attending Clinician'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/70 text-xs">
                      {ROLE_PERMISSION_MATRIX_ROWS.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70">
                          <td className="py-3.5 px-5 font-bold text-slate-900">
                            {tText(row.feature, locale)}
                          </td>
                          <td
                            className={`py-3.5 px-4 text-slate-700 ${
                              currentRole === 'admin'
                                ? 'bg-teal-50/40 font-semibold text-slate-900'
                                : ''
                            }`}
                          >
                            {tText(row.admin, locale)}
                          </td>
                          <td
                            className={`py-3.5 px-4 text-slate-700 ${
                              currentRole === 'client'
                                ? 'bg-teal-50/40 font-semibold text-slate-900'
                                : ''
                            }`}
                          >
                            {tText(row.client, locale)}
                          </td>
                          <td
                            className={`py-3.5 px-5 text-slate-700 ${
                              currentRole === 'employee'
                                ? 'bg-teal-50/40 font-semibold text-slate-900'
                                : ''
                            }`}
                          >
                            {tText(row.employee, locale)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Window>

              {/* Immutable Audit Trail */}
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {locale === 'th'
                        ? 'บันทึกประวัติธุรกรรมและความปลอดภัย (Immutable Security Audit Logs)'
                        : 'Immutable Clinical Security & Daymark Audit Trail'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {locale === 'th'
                        ? 'บันทึกทุกการล็อกอิน การสแกนใบหน้า การอนุมัติ Daymark และการโอนเงินเดือน THB'
                        : 'Tracks every account login, biometric clock-in, Daymark confirmation, and THB payroll event'}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    {auditLogs.length} {locale === 'th' ? 'รายการ' : 'events'}
                  </span>
                </div>

                <div className="divide-y divide-slate-200/70">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50/60 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-teal-800">
                            {tText(log.moduleName, locale)}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="font-semibold text-slate-900">
                            {tText(log.actorName, locale)}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            ({log.actorRole.toUpperCase()})
                          </span>
                        </div>
                        <p className="text-slate-600">{tText(log.actionSummary, locale)}</p>
                      </div>
                      <div className="text-right font-mono text-[11px] text-slate-500">
                        <div>{log.timestamp}</div>
                        <div className="flex items-center justify-end gap-1 text-emerald-700">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{log.securityHash}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Account Security & 2FA Modal */}
      <AccountSecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        currentRole={currentRole}
        locale={locale}
        onSignOut={handleSignOut}
      />

      {/* Interactive Clinician Dossier Modal (triggered by clicking any avatar or clinician row) */}
      <ClinicianDossierModal
        clinician={inspectedClinician}
        locale={locale}
        onClose={() => setInspectedClinician(null)}
        onNavigateModule={(mod: string) => setActiveModule(mod as ModuleKey)}
      />

      {/* Interactive Hospital Facility & Geofence Inspector Modal (triggered by clicking any hospital image or badge) */}
      <FacilityInspectorModal
        isOpen={isFacilityModalOpen}
        locale={locale}
        onClose={() => setIsFacilityModalOpen(false)}
      />
    </div>
  );
}
