import React, { useState } from 'react';
import {
  AttendanceRecord,
  DaymarkAuditEntry,
  LeaveRequest,
  ShiftItem,
  BiWeeklyReview,
  interfacePayrollSeedItem,
  SystemAuditLog,
} from '../data/seedWorkforceData';
import {
  UserRole,
  AppLocale,
  tText,
  calculatePayrollItem,
  formatCurrencyThb,
} from '../utils/workforceRules';
import {
  Window,
  Roll,
  Bar,
  Row,
  Avatar,
  Button,
  Badge,
  Segmented,
  Chart,
  Receipt,
} from '../kit/index';
import {
  ShieldCheck,
  Clock,
  CalendarCheck,
  FileSignature,
  GraduationCap,
  Wallet,
  ArrowUpRight,
  MapPin,
} from 'lucide-react';

import heroFacilityImg from '../assets/images/hero_clinical_facility_1794049576284.jpg';

interface DashboardModuleProps {
  currentRole: UserRole;
  locale: AppLocale;
  attendanceRecords: AttendanceRecord[];
  daymarkLogs: DaymarkAuditEntry[];
  shifts: ShiftItem[];
  leaveRequests: LeaveRequest[];
  reviews: BiWeeklyReview[];
  payrollItems: interfacePayrollSeedItem[];
  auditLogs: SystemAuditLog[];
  onNavigateModule: (moduleKey: string) => void;
  onInspectClinician: (idOrName: string) => void;
  onInspectFacility: () => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  currentRole,
  locale,
  attendanceRecords,
  daymarkLogs,
  shifts,
  leaveRequests,
  reviews,
  payrollItems,
  auditLogs,
  onNavigateModule,
  onInspectClinician,
  onInspectFacility,
}) => {
  const [departmentFilter, setDepartmentFilter] = useState<
    'ALL' | 'Critical Care' | 'IPD' | 'OPD'
  >('ALL');
  const [scrubDayIndex, setScrubDayIndex] = useState<number>(5);
  const isTh = locale === 'th';

  const totalSystemHours = payrollItems.reduce(
    (sum, item) =>
      sum + item.regularHours + item.overtimeHours + item.daymarkVerifiedHours,
    0
  );

  const totalPayrollNetThb = payrollItems.reduce((sum, item) => {
    const calc = calculatePayrollItem({
      hourlyRateThb: item.hourlyRateThb,
      regularHours: item.regularHours,
      overtimeHours: item.overtimeHours,
      daymarkVerifiedHours: item.daymarkVerifiedHours,
      department: item.department,
      shiftsCompleted: item.shiftsCompleted,
      kpiBonusThb: item.kpiBonusThb,
    });
    return sum + calc.netSalaryThb;
  }, 0);

  const totalSystemRevenueThb = reviews.reduce(
    (sum, r) => sum + r.revenueContributionThb,
    0
  );

  const pendingLeavesCount = leaveRequests.filter(
    (l) => l.statusKey === 'pending' || l.statusKey === 'client_approved'
  ).length;

  const filteredAttendance = attendanceRecords.filter((rec) =>
    departmentFilter === 'ALL' ? true : rec.department === departmentFilter
  );

  // Interactive Chart-Scrub data (`chart-scrub` gold pattern)
  const weeklyScrubPoints = [
    { label: isTh ? 'จ.' : 'Mon', value: 142000, hours: 94 },
    { label: isTh ? 'อ.' : 'Tue', value: 168000, hours: 112 },
    { label: isTh ? 'พ.' : 'Wed', value: 159000, hours: 106 },
    { label: isTh ? 'พฤ.' : 'Thu', value: 184000, hours: 124 },
    { label: isTh ? 'ศ.' : 'Fri', value: 212000, hours: 142 },
    { label: isTh ? 'ส.' : 'Sat', value: 254300, hours: 176 },
    { label: isTh ? 'อา.' : 'Sun', value: 196000, hours: 132 },
  ];
  const activeScrub = weeklyScrubPoints[scrubDayIndex] || weeklyScrubPoints[5];

  return (
    <div className="space-y-6">
      {/* Top Executive Hero Banner — Image and buttons are 100% interactive */}
      <section className="rounded-2xl border border-slate-200/85 bg-white p-6 shadow-2xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="teal">
                {isTh
                  ? 'เครือข่ายโรงพยาบาลมาตรฐาน JCI · กรุงเทพมหานคร'
                  : 'JCI Accredited Hospital Network · Bangkok'}
              </Badge>
              <span className="text-xs font-mono text-slate-400">·</span>
              <button
                type="button"
                onClick={onInspectFacility}
                className="text-xs font-mono text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>250m GPS Geofence</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
              {currentRole === 'admin'
                ? isTh
                  ? 'ศูนย์บัญชาการบุคลากรทางการแพทย์และงบการเงิน (THB)'
                  : 'Executive Clinical Workforce & THB Revenue Command'
                : currentRole === 'client'
                ? isTh
                  ? 'ศูนย์บริหารจัดการเวรประจำโรงพยาบาลบำรุงราษฎร์'
                  : 'Bumrungrad International Hospital · Clinical Roster Operations'
                : isTh
                ? 'ตารางเวร การลงเวลาชีวมิติ และรายได้ของ นพ. ธนกร ศรีสุวรรณ'
                : 'Personal Clinical Schedule & Compensation · Dr. Thanakorn S.'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
              {currentRole === 'admin'
                ? isTh
                  ? 'ตรวจสอบชั่วโมงการปฏิบัติงานจริงจากระบบสแกนใบหน้า 1:N, รายการยืนยันเวลา Daymark จากโรงพยาบาลพันธมิตร และการอนุมัติงวดค่าตอบแทนบาทไทย (THB)'
                  : 'Real-time oversight of 1:N biometric clock-ins, partner hospital Daymark verifications, Medical Council credentials, and THB compensation cycles.'
                : currentRole === 'client'
                ? isTh
                  ? 'บริหารตารางเวรแพทย์และพยาบาลประจำโรงพยาบาล ยืนยันเวลาทำงานแทนผ่านฟีเจอร์ Daymark ในกรณีฉุกเฉิน (Code Blue) และประเมินผลงานรายปักษ์'
                  : 'Coordinate on-site ICU, IPD, and OPD shifts, execute Daymark attendance overrides for emergency surgical/resuscitation cases, and submit bi-weekly reviews.'
                : isTh
                ? 'สแกนใบหน้าพร้อมพิกัด GPS เพื่อเข้าเวร ตรวจสอบรายการที่โรงพยาบาลยืนยันเวลา Daymark ให้ และเปิดดูสลิปเงินเดือนอิเล็กทรอนิกส์ E-Payslip'
                : 'Perform GPS + Liveness Face-Scan clock-ins within 250m of the hospital, review verified Daymark hours, and download encrypted THB E-Payslips.'}
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-2.5">
              <Button
                variant="primary"
                size="md"
                onClick={() => onNavigateModule('attendance')}
              >
                {currentRole === 'client'
                  ? isTh
                    ? 'ยืนยันเวลาทำงาน Daymark'
                    : 'Execute Daymark Verification'
                  : isTh
                  ? 'เปิดระบบสแกนใบหน้า & พิกัด GPS'
                  : 'Open Biometric Clock-In & Daymark'}
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => onNavigateModule('payroll')}
              >
                {isTh ? 'ตรวจสอบค่าตอบแทน & E-Payslip' : 'Inspect THB Payroll & Receipt'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onInspectFacility}
              >
                {isTh ? 'ดูพิกัดโรงพยาบาลพันธมิตร' : 'Inspect Hospital Geofences'}
              </Button>
            </div>
          </div>

          {/* Interactive Hospital Facility Card (Clicking opens FacilityInspectorModal) */}
          <div className="lg:col-span-5">
            <div
              role="button"
              tabIndex={0}
              onClick={onInspectFacility}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onInspectFacility();
                }
              }}
              title={
                isTh
                  ? 'คลิกเพื่อตรวจสอบพิกัด GPS ของโรงพยาบาลพันธมิตร'
                  : 'Click to inspect partner hospital GPS geofence telemetry'
              }
              className="relative h-48 rounded-xl overflow-hidden border border-slate-200/90 shadow-sm group cursor-pointer"
            >
              <img
                src={heroFacilityImg}
                alt={
                  isTh
                    ? 'โรงพยาบาลพันธมิตรมาตรฐานสากลในประเทศไทย'
                    : 'Partner Hospital Facility in Bangkok'
                }
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent flex flex-col justify-end p-4 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-teal-300">
                    {isTh
                      ? 'คลิกเพื่อตรวจสอบรัศมี GPS 250 เมตร'
                      : 'CLICK TO INSPECT 250M GPS PERIMETER'}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-teal-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <p className="text-sm font-bold mt-0.5">
                  {isTh
                    ? 'บำรุงราษฎร์ · โรงพยาบาลกรุงเทพ (BDMS) · สมิติเวช · ศิริราช ปิยมหาราชการุณย์'
                    : 'Bumrungrad · Bangkok Hospital (BDMS) · Samitivej · Siriraj SiPH'}
                </p>
                <p className="text-xs text-slate-300 mt-0.5 font-mono">
                  100% 1:N Face Match &amp; 250m GPS Geofencing
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive 4-Column KPI Row — Clicking any card opens its target module */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => onNavigateModule('attendance')}
          className="text-left rounded-xl bg-white border border-slate-200/85 p-5 shadow-2xs hover:border-teal-700/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              {currentRole === 'admin'
                ? isTh
                  ? 'ชั่วโมงปฏิบัติงานรวมทั้งระบบ'
                  : 'Total Verified Clinical Hours'
                : currentRole === 'client'
                ? isTh
                  ? 'บุคลากรเข้าเวร ณ โรงพยาบาลบำรุงราษฎร์'
                  : 'Active Clinicians at Bumrungrad'
                : isTh
                ? 'ชั่วโมงปฏิบัติงานสะสมในงวดนี้'
                : 'My Verified Hours This Cycle'}
            </span>
            <Clock className="w-4 h-4 text-teal-700 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-950 mt-2 tabular-nums">
            {currentRole === 'admin' ? (
              <Roll value={totalSystemHours} suffix="h" />
            ) : currentRole === 'client' ? (
              isTh ? '4 ท่าน (32 ชม.)' : '4 On-Site (32h)'
            ) : (
              '160.0h'
            )}
          </div>
          <p className="text-[11px] text-teal-700 font-medium mt-1">
            {isTh ? 'คลิกเพื่อดูบันทึกสแกนใบหน้า & GPS →' : 'Click to inspect biometric logs →'}
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigateModule('attendance')}
          className="text-left rounded-xl bg-white border border-slate-200/85 p-5 shadow-2xs hover:border-teal-700/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              {isTh
                ? 'รายการยืนยันเวลาทำงาน Daymark'
                : 'Daymark Verified Exceptions'}
            </span>
            <ShieldCheck className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-950 mt-2 tabular-nums">
            {daymarkLogs.length} {isTh ? 'รายการ' : 'Logs'} (
            {daymarkLogs.reduce((acc, d) => acc + d.verifiedHours, 0)}h)
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">
            {isTh
              ? 'คลิกเพื่อตรวจสอบบันทึก Daymark SHA-256 →'
              : 'Click to inspect SHA-256 Daymark ledger →'}
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigateModule('shifts')}
          className="text-left rounded-xl bg-white border border-slate-200/85 p-5 shadow-2xs hover:border-teal-700/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              {isTh ? 'ตารางเวรและคำขอลาหยุด' : 'Active Shifts & Leave Queue'}
            </span>
            <CalendarCheck className="w-4 h-4 text-teal-700 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-950 mt-2 tabular-nums whitespace-nowrap">
            {shifts.length} {isTh ? 'เวร' : 'Shifts'} ({pendingLeavesCount}{' '}
            {isTh ? 'ใบลา' : 'Leave'})
          </div>
          <p className="text-[11px] text-teal-700 font-medium mt-1">
            {isTh ? 'คลิกเพื่อจัดการตารางเวรและอนุมัติใบลา →' : 'Click to manage roster & leave →'}
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigateModule('payroll')}
          className="text-left rounded-xl bg-white border border-slate-200/85 p-5 shadow-2xs hover:border-teal-700/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              {currentRole === 'admin'
                ? isTh
                  ? 'มูลค่าบริการทางการแพทย์รวม (THB)'
                  : 'Total Clinical Revenue (THB)'
                : currentRole === 'client'
                ? isTh
                  ? 'งบค่าตอบแทนบุคลากรประจำโรงพยาบาล'
                  : 'Facility Clinical Compensation'
                : isTh
                ? 'ยอดเงินเดือนสุทธิ (Net Pay THB)'
                : 'Estimated Net Compensation (THB)'}
            </span>
            <Wallet className="w-4 h-4 text-teal-700 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-950 mt-2 tabular-nums">
            <Roll
              value={
                currentRole === 'admin'
                  ? totalSystemRevenueThb
                  : currentRole === 'client'
                  ? totalPayrollNetThb
                  : 218559
              }
              prefix="฿"
            />
          </div>
          <p className="text-[11px] text-teal-700 font-medium mt-1">
            {isTh ? 'คลิกเพื่อเปิดสลิปเงินเดือน E-Payslip →' : 'Click to open THB E-Payslip receipt →'}
          </p>
        </button>
      </section>

      {/* Main Split Grid: Stageshow Window Roster (8 cols) + Chart Scrub & Audit Receipt (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 cols: Live Biometric & Daymark Roster built with Stageshow `Window` + `Row` + `Avatar` */}
        <div className="lg:col-span-8">
          <Window
            title={
              isTh
                ? 'สถานะการลงเวลาชีวมิติ & พิกัด GPS โรงพยาบาลพันธมิตร'
                : 'Live Biometric Attendance & Hospital Geofence Roster'
            }
            url="app.daymark.co.th/live-attendance"
            rightSlot={
              <Segmented
                size="xs"
                value={departmentFilter}
                onChange={setDepartmentFilter}
                options={[
                  { value: 'ALL', label: isTh ? 'ทุกแผนก' : 'All' },
                  { value: 'Critical Care', label: 'ICU' },
                  { value: 'IPD', label: 'IPD' },
                  { value: 'OPD', label: 'OPD' },
                ]}
              />
            }
          >
            <div className="divide-y divide-slate-100">
              {filteredAttendance.map((rec) => (
                <Row
                  key={rec.id}
                  onClick={() => onInspectClinician(rec.employeeId)}
                  lead={
                    <Avatar
                      initials={rec.employeeName.en
                        .replace('Dr. ', '')
                        .split(' ')
                        .map((s) => s[0])
                        .slice(0, 2)
                        .join('')}
                      status={rec.isDaymarkException ? 'busy' : 'verified'}
                      tone={
                        rec.department === 'Critical Care'
                          ? 'teal'
                          : rec.department === 'IPD'
                          ? 'sky'
                          : 'amber'
                      }
                      title={
                        isTh
                          ? 'คลิกเพื่อดูแฟ้มใบประกอบวิชาชีพ'
                          : 'Click to inspect clinician dossier'
                      }
                      onClick={() => onInspectClinician(rec.employeeId)}
                    />
                  }
                  subtitle={
                    <span>
                      {tText(rec.siteName, locale)} · {tText(rec.shiftLabel, locale)} ·{' '}
                      <span className="font-mono text-teal-800">{rec.employeeId}</span>
                    </span>
                  }
                  trail={
                    <div className="text-right space-y-0.5">
                      <Badge
                        tone={rec.isDaymarkException ? 'amber' : 'emerald'}
                      >
                        {tText(rec.status, locale)}
                      </Badge>
                      <div className="text-[11px] font-mono text-slate-400">
                        {rec.isDaymarkException
                          ? isTh
                            ? 'รพ. ยืนยันเวลา (+8.0h)'
                            : 'Hospital Override · +8.0h'
                          : `${rec.gpsDistanceMeters}m GPS · Face ${Math.round(
                              rec.faceMatchScore * 100
                            )}%`}
                      </div>
                    </div>
                  }
                >
                  {tText(rec.employeeName, locale)}{' '}
                  <span className="text-slate-400 font-normal">
                    · {tText(rec.employeeRoleTitle, locale)}
                  </span>
                </Row>
              ))}

              {/* Peripheral Filler Bar Row at the foot for Stageshow visual restraint */}
              <div className="px-4 py-2.5 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-slate-200/70 inline-block" />
                  <div className="space-y-1.5">
                    <Bar w={132} />
                    <Bar w={84} soft />
                  </div>
                </div>
                <Bar w={56} soft />
              </div>
            </div>

            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-500">
                {isTh
                  ? 'คลิกที่แถวหรือรูปโปรไฟล์ของแพทย์/พยาบาลเพื่อดูใบประกอบวิชาชีพและส่งข้อความประสานงาน'
                  : 'Click any clinician row or avatar to inspect Medical Council credentials & send paging notes'}
              </span>
              <Button
                variant="secondary"
                size="xs"
                onClick={() => onNavigateModule('attendance')}
              >
                {isTh ? 'เปิดหน้าลงเวลา & Daymark →' : 'Open Biometric & Daymark →'}
              </Button>
            </div>
          </Window>
        </div>

        {/* Right 4 cols: Interactive `chart-scrub` Card + Audit Receipt */}
        <div className="lg:col-span-4 space-y-5">
          {/* Interactive Chart Scrub (`chart-scrub` gold example pattern) */}
          <div className="bg-white rounded-xl border border-slate-200/85 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-teal-700 font-semibold">
                {isTh
                  ? 'กราฟวิเคราะห์ค่าตอบแทนรายวัน (คลิกเลือกวัน)'
                  : 'DAILY COMPENSATION SCRUB (CLICK BAR)'}
              </span>
              <span className="text-xs font-mono text-slate-500">
                {activeScrub.label}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold font-mono text-slate-950">
                <Roll value={activeScrub.value} prefix="฿" />
              </div>
              <div className="text-xs font-mono text-teal-700 font-semibold">
                <Roll value={activeScrub.hours} suffix="h verified" />
              </div>
            </div>

            <Chart
              points={weeklyScrubPoints}
              activeIndex={scrubDayIndex}
              onSelectIndex={setScrubDayIndex}
            />
          </div>

          {/* Security & Daymark Receipt */}
          <Receipt
            title={
              isTh
                ? 'บันทึกความปลอดภัยและการยืนยันเวลาล่าสุด'
                : 'RECENT SECURITY & DAYMARK LEDGER'
            }
            code="SHA-256 AUDIT"
            stamp="VERIFIED"
            footer={
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {isTh ? 'บันทึกแบบแก้ไขไม่ได้' : 'Immutable hospital log'}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigateModule('rbac')}
                  className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
                >
                  {isTh ? 'ดูทั้งหมด →' : 'View Full Ledger →'}
                </button>
              </div>
            }
          >
            <div className="space-y-3">
              {auditLogs.slice(0, 3).map((log) => (
                <div
                  key={log.id}
                  onClick={() => onInspectClinician(log.actorName.en)}
                  className="p-2.5 rounded-lg bg-white border border-slate-200/70 hover:border-teal-700/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-900">
                      {tText(log.actorName, locale)}
                    </span>
                    <span className="font-mono text-slate-400">
                      {log.timestamp.split('·')[1] || log.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    {tText(log.actionSummary, locale)}
                  </p>
                </div>
              ))}
            </div>
          </Receipt>
        </div>
      </div>
    </div>
  );
};
