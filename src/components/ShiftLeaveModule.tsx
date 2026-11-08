import React, { useState } from 'react';
import {
  Calendar,
  Building2,
  CheckCircle2,
  XCircle,
  Plus,
  FileText,
  ArrowRight,
  Stethoscope,
} from 'lucide-react';
import {
  UserRole,
  AppLocale,
  ClinicalDepartment,
  formatCurrencyThb,
  canRolePerformAction,
  tText,
} from '../utils/workforceRules';
import { ShiftItem, LeaveRequest, HOSPITAL_SITES } from '../data/seedWorkforceData';
import { Window, Bar, Avatar } from '../kit';

interface ShiftLeaveProps {
  currentRole: UserRole;
  locale: AppLocale;
  shifts: ShiftItem[];
  onCreateShift: (shift: ShiftItem) => void;
  leaveRequests: LeaveRequest[];
  onUpdateLeaveStatus: (
    leaveId: string,
    newStatusKey: LeaveRequest['statusKey'],
    approverComment: string
  ) => void;
  onSubmitLeaveRequest: (leave: LeaveRequest) => void;
  onInspectClinician?: (idOrName: string) => void;
  onInspectFacility?: () => void;
}

export const ShiftLeaveModule: React.FC<ShiftLeaveProps> = ({
  currentRole,
  locale,
  shifts,
  onCreateShift,
  leaveRequests,
  onUpdateLeaveStatus,
  onSubmitLeaveRequest,
  onInspectClinician,
  onInspectFacility,
}) => {
  const [subTab, setSubTab] = useState<'shifts' | 'leave'>('shifts');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [showNewShiftModal, setShowNewShiftModal] = useState(false);

  // New shift state
  const [newShiftEmployeeEn, setNewShiftEmployeeEn] = useState('RN. Ariya Wattanapong');
  const [newShiftEmployeeTh, setNewShiftEmployeeTh] = useState('พว. อารียา วัฒนพงศ์');
  const [newShiftSiteId, setNewShiftSiteId] = useState(HOSPITAL_SITES[0].id);
  const [newShiftDept, setNewShiftDept] = useState<ClinicalDepartment>('Critical Care');
  const [newShiftDate, setNewShiftDate] = useState('13/11/2026');
  const [newShiftCode, setNewShiftCode] = useState<'MORNING' | 'AFTERNOON' | 'NIGHT_ONCALL'>('MORNING');
  const [newShiftRateThb, setNewShiftRateThb] = useState(950);

  // New Leave form state
  const [leaveTypeEn, setLeaveTypeEn] = useState('Annual Leave (Paid)');
  const [leaveTypeTh, setLeaveTypeTh] = useState('ลาพักร้อนประจำปี (ได้รับค่าจ้าง)');
  const [leaveStartDate, setLeaveStartDate] = useState('2026-11-18');
  const [leaveEndDate, setLeaveEndDate] = useState('2026-11-19');
  const [leaveDays, setLeaveDays] = useState(2);
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveSuccessMsg, setLeaveSuccessMsg] = useState<string | null>(null);

  const canManageShifts =
    canRolePerformAction(currentRole, 'shift.manage_all') ||
    canRolePerformAction(currentRole, 'shift.assign_site');

  const filteredShifts = shifts.filter((sh) => {
    const roleMatch =
      currentRole === 'employee'
        ? sh.assignedEmployeeId === 'DM-TH-0842' ||
          sh.assignedEmployeeName.en.includes('Thanakorn')
        : true;
    const deptMatch = departmentFilter === 'ALL' ? true : sh.department === departmentFilter;
    return roleMatch && deptMatch;
  });

  const handleAddShift = (e: React.FormEvent) => {
    e.preventDefault();
    const site = HOSPITAL_SITES.find((s) => s.id === newShiftSiteId) || HOSPITAL_SITES[0];
    const windowStr =
      newShiftCode === 'MORNING'
        ? '07:00 - 15:00'
        : newShiftCode === 'AFTERNOON'
        ? '15:00 - 23:00'
        : '19:00 - 07:00 (+1)';

    const shiftTypeObj =
      newShiftCode === 'MORNING'
        ? { en: 'Morning Shift', th: 'เวรเช้าปกติ' }
        : newShiftCode === 'AFTERNOON'
        ? { en: 'Afternoon Shift', th: 'เวรบ่าย' }
        : { en: 'Night On-Call (1.35x)', th: 'เวรดึก On-Call (1.35x)' };

    const created: ShiftItem = {
      id: `SH-${Math.floor(700 + Math.random() * 290)}`,
      date: newShiftDate,
      window: windowStr,
      shiftType: shiftTypeObj,
      department: newShiftDept,
      siteId: site.id,
      siteName: site.name,
      assignedEmployeeId: `DM-TH-0${Math.floor(850 + Math.random() * 140)}`,
      assignedEmployeeName: { en: newShiftEmployeeEn, th: newShiftEmployeeTh },
      hourlyRateThb: Number(newShiftRateThb) || 850,
      status: { en: 'Scheduled', th: 'ตามตารางเวร' },
    };

    onCreateShift(created);
    setShowNewShiftModal(false);
  };

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim()) return;

    const created: LeaveRequest = {
      id: `LV-2026-${Math.floor(10 + Math.random() * 89)}`,
      employeeId: 'DM-TH-0842',
      employeeName: {
        en: 'Dr. Thanakorn Srisuwan, MD',
        th: 'นพ. ธนกร ศรีสุวรรณ',
      },
      department: 'Critical Care',
      siteName: HOSPITAL_SITES[0].name,
      leaveType: { en: leaveTypeEn, th: leaveTypeTh },
      startDate: leaveStartDate,
      endDate: leaveEndDate,
      daysCount: Number(leaveDays) || 1,
      reason: { en: leaveReason.trim(), th: leaveReason.trim() },
      statusKey: 'pending',
      status: { en: 'Pending Approval', th: 'รออนุมัติ' },
      createdAt: '07/11/2026 10:15',
    };

    onSubmitLeaveRequest(created);
    setLeaveReason('');
    setLeaveSuccessMsg(
      locale === 'th'
        ? `ส่งใบลา ${created.id} ไปยังผู้ประสานงานโรงพยาบาลและผู้บริหารระบบเรียบร้อยแล้ว`
        : `Leave request ${created.id} submitted to Hospital Coordinator and System Admin.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation & Action header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 bg-slate-200/70 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setSubTab('shifts')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'shifts'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-teal-700" />
            {locale === 'th'
              ? 'ตารางเวรทางการแพทย์ (OPD / IPD / Critical Care)'
              : 'Clinical Shift Roster (OPD / IPD / Critical Care)'}
          </button>
          <button
            type="button"
            onClick={() => setSubTab('leave')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'leave'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-teal-700" />
            {locale === 'th' ? 'จัดการการลาและส่งมอบเวร' : 'Leave Requests & Handover'} (
            {leaveRequests.filter((l) => l.statusKey === 'pending').length}{' '}
            {locale === 'th' ? 'รออนุมัติ' : 'Pending'})
          </button>
        </div>

        {subTab === 'shifts' && canManageShifts && (
          <button
            type="button"
            onClick={() => setShowNewShiftModal((prev) => !prev)}
            className="px-3.5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            {locale === 'th' ? 'จัดสรรเวรทางการแพทย์ใหม่' : 'Assign New Clinical Shift'}
          </button>
        )}
      </div>

      {subTab === 'shifts' ? (
        <div className="space-y-5">
          {/* Optional New Shift Drawer */}
          {showNewShiftModal && canManageShifts && (
            <form
              onSubmit={handleAddShift}
              className="bg-white rounded-xl border border-teal-200 p-5 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {locale === 'th'
                      ? 'จัดสรรเวรบุคลากรทางการแพทย์ (Admin / Client)'
                      : 'Assign Clinical Shift Roster (Admin / Client)'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {locale === 'th'
                      ? 'กำหนดเวรเช้า บ่าย หรือเวรดึก On-Call พร้อมอัตราค่าตอบแทนรายชั่วโมง (THB)'
                      : 'Configure Morning, Afternoon, or Night On-Call clinical shifts with THB hourly billing'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewShiftModal(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  {locale === 'th' ? 'ปิดหน้าต่าง' : 'Close'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {locale === 'th' ? 'บุคลากรทางการแพทย์' : 'Clinician Name'}
                  </label>
                  <input
                    type="text"
                    value={locale === 'th' ? newShiftEmployeeTh : newShiftEmployeeEn}
                    onChange={(e) => {
                      if (locale === 'th') setNewShiftEmployeeTh(e.target.value);
                      else setNewShiftEmployeeEn(e.target.value);
                    }}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {locale === 'th' ? 'โรงพยาบาล / สถานพยาบาล' : 'Hospital Facility'}
                  </label>
                  <select
                    value={newShiftSiteId}
                    onChange={(e) => setNewShiftSiteId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    {HOSPITAL_SITES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {tText(s.name, locale)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {locale === 'th' ? 'แผนกคลินิก (Specialty)' : 'Clinical Department'}
                  </label>
                  <select
                    value={newShiftDept}
                    onChange={(e) => setNewShiftDept(e.target.value as ClinicalDepartment)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Critical Care">Critical Care (ICU / ER)</option>
                    <option value="IPD">IPD (Inpatient Ward)</option>
                    <option value="OPD">OPD (Outpatient Clinic)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {locale === 'th' ? 'วันที่ขึ้นเวร' : 'Shift Date'}
                  </label>
                  <input
                    type="text"
                    value={newShiftDate}
                    onChange={(e) => setNewShiftDate(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {locale === 'th' ? 'รหัสกะเวลา' : 'Shift Window'}
                  </label>
                  <select
                    value={newShiftCode}
                    onChange={(e) =>
                      setNewShiftCode(
                        e.target.value as 'MORNING' | 'AFTERNOON' | 'NIGHT_ONCALL'
                      )
                    }
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="MORNING">
                      {locale === 'th' ? 'เวรเช้า (07:00-15:00)' : 'Morning (07:00-15:00)'}
                    </option>
                    <option value="AFTERNOON">
                      {locale === 'th' ? 'เวรบ่าย (15:00-23:00)' : 'Afternoon (15:00-23:00)'}
                    </option>
                    <option value="NIGHT_ONCALL">
                      {locale === 'th'
                        ? 'เวรดึก On-call (19:00-07:00)'
                        : 'Night On-Call (19:00-07:00)'}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {locale === 'th' ? 'อัตราค่าตอบแทน (THB/ชม.)' : 'Hourly Rate (THB/hr)'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newShiftRateThb}
                      onChange={(e) => setNewShiftRateThb(Number(e.target.value))}
                      className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-slate-300"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 cursor-pointer"
                    >
                      {locale === 'th' ? 'บันทึกเวร' : 'Save Shift'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Department filter */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {(['ALL', 'Critical Care', 'IPD', 'OPD'] as const).map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setDepartmentFilter(dept)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    departmentFilter === dept
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {dept === 'ALL'
                    ? locale === 'th'
                      ? 'ทุกแผนกการแพทย์'
                      : 'All Clinical Units'
                    : dept}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-500">
              {locale === 'th'
                ? `แสดง ${filteredShifts.length} ตารางเวรในระบบ`
                : `Showing ${filteredShifts.length} scheduled shifts`}
            </span>
          </div>

          {/* Shift Matrix Table inside Stageshow Window */}
          <Window
            title={
              locale === 'th'
                ? 'daymark.co.th — ตารางเวรทางการแพทย์ (Clinical Roster Matrix)'
                : 'daymark.co.th — Thailand Hospital Shift Roster Matrix'
            }
            url="https://app.daymark.co.th/shifts"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/70">
                    <th className="py-3.5 px-5">
                      {locale === 'th' ? 'บุคลากรทางการแพทย์' : 'Clinician'}
                    </th>
                    <th className="py-3.5 px-4">
                      {locale === 'th' ? 'โรงพยาบาล & แผนก' : 'Hospital Facility & Unit'}
                    </th>
                    <th className="py-3.5 px-4">
                      {locale === 'th' ? 'วันที่ & ช่วงเวลาเวร' : 'Date & Shift Window'}
                    </th>
                    <th className="py-3.5 px-4 text-right">
                      {locale === 'th' ? 'อัตรา/ชม. (THB)' : 'Hourly Rate (THB)'}
                    </th>
                    <th className="py-3.5 px-5 text-right">
                      {locale === 'th' ? 'สถานะเวร' : 'Status'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 text-sm">
                  {filteredShifts.map((sh) => (
                    <tr
                      key={sh.id}
                      onClick={() => onInspectClinician && onInspectClinician(sh.assignedEmployeeId)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            initials={sh.assignedEmployeeName.en.replace(/^Dr\.\s+|^RN\.\s+/i, '').slice(0, 2).toUpperCase()}
                            size="sm"
                            status="online"
                          />
                          <div>
                            <div className="font-semibold text-slate-900 hover:text-teal-800">
                              {tText(sh.assignedEmployeeName, locale)}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5 font-mono">
                              {sh.assignedEmployeeId} · {sh.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td
                        className="py-3.5 px-4"
                        onClick={(e) => {
                          if (onInspectFacility) {
                            e.stopPropagation();
                            onInspectFacility();
                          }
                        }}
                      >
                        <div className="text-xs font-medium text-slate-800 hover:text-teal-800 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {tText(sh.siteName, locale)}
                        </div>
                        <div className="text-[11px] text-teal-700 font-semibold mt-0.5 flex items-center gap-2">
                          <Stethoscope className="w-3 h-3" />
                          {sh.department}
                          <Bar w={24} h={4} soft />
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs font-mono font-semibold text-slate-900">
                          {sh.date} · {sh.window}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {tText(sh.shiftType, locale)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-xs font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                        {formatCurrencyThb(sh.hourlyRateThb)}/hr
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          {tText(sh.status, locale)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Window>
        </div>
      ) : (
        /* Leave Management View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Leave Requests & Multi-Role Approval */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {locale === 'th'
                    ? 'รายการคำขอลาและการส่งมอบเวรทางการแพทย์'
                    : 'Clinical Leave Requests & Shift Handover Queue'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {locale === 'th'
                    ? 'ขั้นตอนการอนุมัติ 2 ระดับ: ผู้อำนวยการประสานงานโรงพยาบาลยืนยันผู้รับเวรแทน → ผู้บริหารระบบอนุมัติวันลา'
                    : '2-Step Clinical Workflow: Hospital Director confirms shift handover → Executive Director finalizes leave quota'}
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">
                {locale === 'th' ? 'สิทธิ์บัญชี:' : 'Account Role:'}{' '}
                <strong className="text-slate-900 uppercase">{currentRole}</strong>
              </span>
            </div>

            <div className="divide-y divide-slate-200/70">
              {leaveRequests.map((lv) => (
                <div key={lv.id} className="p-5 hover:bg-slate-50/60 transition-colors">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div
                      onClick={() => onInspectClinician && onInspectClinician(lv.employeeId)}
                      className="cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-teal-800">
                          {tText(lv.employeeName, locale)}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{lv.id}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {lv.department} · {tText(lv.siteName, locale)}
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          lv.statusKey === 'admin_approved'
                            ? 'bg-emerald-500'
                            : lv.statusKey === 'client_approved'
                            ? 'bg-sky-500'
                            : lv.statusKey === 'pending'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                      />
                      <span className="text-slate-800">{tText(lv.status, locale)}</span>
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 rounded-lg p-3 border border-slate-200/60 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">
                        {locale === 'th' ? 'ประเภทการลา & จำนวนวัน' : 'Leave Type & Duration'}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {tText(lv.leaveType, locale)} ({lv.daysCount}{' '}
                        {locale === 'th' ? 'วัน' : 'days'})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">
                        {locale === 'th' ? 'ช่วงวันที่ลา' : 'Leave Dates'}
                      </span>
                      <span className="font-mono font-semibold text-slate-800">
                        {lv.startDate} <ArrowRight className="w-3 h-3 inline" /> {lv.endDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">
                        {locale === 'th' ? 'ผู้อนุมัติ / ผู้รับเวรแทน' : 'Coverage / Approved By'}
                      </span>
                      <span className="font-semibold text-teal-800">
                        {lv.approvedBy
                          ? tText(lv.approvedBy, locale)
                          : locale === 'th'
                          ? 'อยู่ระหว่างจัดสรรแพทย์เวรสำรอง'
                          : 'ICU Backup Roster Assigned'}
                      </span>
                    </div>
                  </div>

                  <p className="mt-2.5 text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">
                      {locale === 'th' ? 'เหตุผลการลา:' : 'Reason:'}
                    </span>{' '}
                    {tText(lv.reason, locale)}
                  </p>

                  {/* Role-gated Approval Buttons based on Authenticated Account */}
                  {(currentRole === 'client' || currentRole === 'admin') &&
                    lv.statusKey !== 'admin_approved' &&
                    lv.statusKey !== 'rejected' && (
                      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500">
                          {currentRole === 'client'
                            ? locale === 'th'
                              ? 'ผู้อำนวยการประสานงานโรงพยาบาล: ยืนยันว่ามีผู้รับเวรแทนครบถ้วน'
                              : 'Hospital Roster Director: Confirm clinical shift coverage at facility'
                            : locale === 'th'
                            ? 'ผู้บริหารระบบ: อนุมัติขั้นสุดท้ายและอัปเดตโควต้าวันลา'
                            : 'Executive Director: Finalize approval and deduct paid leave quota'}
                        </span>
                        <div className="flex items-center gap-2">
                          {currentRole === 'client' && lv.statusKey === 'pending' && (
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateLeaveStatus(
                                  lv.id,
                                  'client_approved',
                                  'Hospital Director confirmed shift handover.'
                                )
                              }
                              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {locale === 'th'
                                ? 'ยืนยันผู้รับเวรแทน (รพ.)'
                                : 'Confirm Handover (Hospital)'}
                            </button>
                          )}
                          {currentRole === 'admin' && (
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateLeaveStatus(
                                  lv.id,
                                  'admin_approved',
                                  'Admin approved leave request.'
                                )
                              }
                              className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {locale === 'th'
                                ? 'อนุมัติขั้นสุดท้าย (Admin)'
                                : 'Final Approve (Admin)'}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateLeaveStatus(
                                lv.id,
                                'rejected',
                                'Declined due to critical ICU staffing shortage.'
                              )
                            }
                            className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            {locale === 'th' ? 'ปฏิเสธคำขอ' : 'Decline'}
                          </button>
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Submit New Leave Form */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {locale === 'th'
                  ? 'ยื่นใบลาออนไลน์ & ส่งมอบเวร'
                  : 'Submit Clinical Leave & Handover'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {locale === 'th'
                  ? 'โควต้าวันลาพักร้อนคงเหลือ: 9 / 12 วันในปี 2026'
                  : 'Remaining Paid Annual Leave Quota: 9 / 12 Days (2026)'}
              </p>
            </div>

            {leaveSuccessMsg && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{leaveSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateLeave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {locale === 'th' ? 'ประเภทการลา' : 'Leave Category'}
                </label>
                <select
                  value={leaveTypeEn}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLeaveTypeEn(val);
                    if (val.includes('Annual')) {
                      setLeaveTypeTh('ลาพักร้อนประจำปี (ได้รับค่าจ้าง)');
                    } else if (val.includes('CME')) {
                      setLeaveTypeTh('ลาประชุมวิชาการแพทยสภา (CME)');
                    } else {
                      setLeaveTypeTh('ลาป่วยมีใบรับรองแพทย์');
                    }
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Annual Leave (Paid)">
                    {locale === 'th'
                      ? 'ลาพักร้อนประจำปี (ได้รับค่าจ้าง)'
                      : 'Annual Leave (Paid)'}
                  </option>
                  <option value="CME Medical Conference Leave">
                    {locale === 'th'
                      ? 'ลาประชุมวิชาการแพทยสภา (CME)'
                      : 'CME Medical Conference Leave'}
                  </option>
                  <option value="Medical Sick Leave">
                    {locale === 'th' ? 'ลาป่วยมีใบรับรองแพทย์' : 'Medical Sick Leave'}
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {locale === 'th' ? 'ตั้งแต่วันที่' : 'From Date'}
                  </label>
                  <input
                    type="date"
                    value={leaveStartDate}
                    onChange={(e) => setLeaveStartDate(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {locale === 'th' ? 'ถึงวันที่' : 'To Date'}
                  </label>
                  <input
                    type="date"
                    value={leaveEndDate}
                    onChange={(e) => setLeaveEndDate(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {locale === 'th' ? 'จำนวนวันลา' : 'Total Leave Days'}
                </label>
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={leaveDays}
                  onChange={(e) => setLeaveDays(Number(e.target.value))}
                  className="w-full px-2.5 py-2 text-xs font-mono rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {locale === 'th'
                    ? 'เหตุผลการลา & รายละเอียดการส่งต่อผู้ป่วย'
                    : 'Leave Reason & Clinical Handover Notes'}
                </label>
                <textarea
                  rows={3}
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder={
                    locale === 'th'
                      ? 'ระบุเหตุผลการลาและชื่อแพทย์/พยาบาลที่รับช่วงดูแลผู้ป่วย...'
                      : 'Specify reason for leave and patient handover details...'
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                {locale === 'th' ? 'ส่งคำขออนุมัติวันลา' : 'Submit Leave Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
