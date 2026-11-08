import React, { useState } from 'react';
import {
  Lock,
  CheckCircle2,
  Printer,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  KeyRound,
} from 'lucide-react';
import {
  UserRole,
  AppLocale,
  calculatePayrollItem,
  formatCurrencyThb,
  canRolePerformAction,
  SPECIALTY_ALLOWANCE_PER_SHIFT_THB,
  tText,
} from '../utils/workforceRules';
import { interfacePayrollSeedItem } from '../data/seedWorkforceData';
import { Window, Receipt, Roll, Bar, Avatar } from '../kit';

interface PayrollPayslipProps {
  currentRole: UserRole;
  locale: AppLocale;
  payrollItems: interfacePayrollSeedItem[];
  onApprovePayroll: (payrollId: string) => void;
  onInspectClinician?: (idOrName: string) => void;
}

export const PayrollPayslipModule: React.FC<PayrollPayslipProps> = ({
  currentRole,
  locale,
  payrollItems,
  onApprovePayroll,
  onInspectClinician,
}) => {
  const [selectedPayrollId, setSelectedPayrollId] = useState<string>(
    payrollItems[0]?.id || 'pay-901'
  );
  const [pinInput, setPinInput] = useState<string>('2468');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(true);
  const [pinError, setPinError] = useState<string | null>(null);
  const [printToast, setPrintToast] = useState<string | null>(null);

  const canApprovePayroll = canRolePerformAction(
    currentRole,
    'payroll.manage_approve'
  );

  const visiblePayrollList =
    currentRole === 'employee'
      ? payrollItems.filter((item) => item.employeeId === 'DM-TH-0842')
      : payrollItems;

  const activeItem =
    visiblePayrollList.find((p) => p.id === selectedPayrollId) ||
    visiblePayrollList[0] ||
    payrollItems[0];

  const breakdown = calculatePayrollItem({
    hourlyRateThb: activeItem.hourlyRateThb,
    regularHours: activeItem.regularHours,
    overtimeHours: activeItem.overtimeHours,
    daymarkVerifiedHours: activeItem.daymarkVerifiedHours,
    department: activeItem.department,
    shiftsCompleted: activeItem.shiftsCompleted,
    kpiBonusThb: activeItem.kpiBonusThb,
  });

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === '2468') {
      setIsUnlocked(true);
      setPinError(null);
    } else {
      setPinError(
        locale === 'th'
          ? 'รหัส PIN ไม่ถูกต้อง (รหัสความปลอดภัยเริ่มต้นคือ 2468)'
          : 'Invalid security PIN (Assigned Vault PIN: 2468)'
      );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left: Payroll Ledger inside Stageshow Window (7 cols) */}
      <div className="lg:col-span-7 space-y-4">
        <Window
          title={
            locale === 'th'
              ? 'daymark.co.th/payroll — บัญชีคำนวณค่าตอบแทนบุคลากรทางการแพทย์ (THB)'
              : 'daymark.co.th/payroll — Thailand Clinical Compensation Ledger (THB)'
          }
          url="https://app.daymark.co.th/payroll"
        >
          <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-teal-700" />
                {locale === 'th'
                  ? 'ตารางคำนวณค่าตอบแทน (รวมชั่วโมง Biometric + Daymark + OT)'
                  : 'Automated Clinical Payroll Ledger (Biometric + Daymark + OT)'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {locale === 'th'
                  ? 'คำนวณอัตโนมัติตามอัตราบาทไทย (THB) หักประกันสังคมและภาษี ณ ที่จ่าย 10.5%'
                  : 'Calculated in Thai Baht (THB) with 1.5x OT, specialty allowances, and 10.5% WHT/SSO'}
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {locale === 'th' ? 'งวดเดือน:' : 'Cycle:'}{' '}
              <strong>{tText(activeItem.period, locale)}</strong>
            </span>
          </div>

          <div className="divide-y divide-slate-200/70">
            {visiblePayrollList.map((item) => {
              const calc = calculatePayrollItem({
                hourlyRateThb: item.hourlyRateThb,
                regularHours: item.regularHours,
                overtimeHours: item.overtimeHours,
                daymarkVerifiedHours: item.daymarkVerifiedHours,
                department: item.department,
                shiftsCompleted: item.shiftsCompleted,
                kpiBonusThb: item.kpiBonusThb,
              });
              const isSelected = item.id === activeItem.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedPayrollId(item.id)}
                  className={`p-5 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-teal-50/50 border-l-4 border-l-teal-700'
                      : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        initials={item.employeeName.en
                          .replace(/^Dr\.\s+|^RN\.\s+/i, '')
                          .slice(0, 2)
                          .toUpperCase()}
                        size="sm"
                        status={item.statusKey === 'approved' ? 'verified' : 'online'}
                        onClick={() => onInspectClinician && onInspectClinician(item.employeeId)}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            onClick={(e) => {
                              if (onInspectClinician) {
                                e.stopPropagation();
                                onInspectClinician(item.employeeId);
                              }
                            }}
                            className="text-sm font-bold text-slate-900 hover:text-teal-800"
                          >
                            {tText(item.employeeName, locale)}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            {item.employeeId}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {tText(item.roleTitle, locale)} · {tText(item.siteName, locale)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-bold font-mono text-slate-900 tabular-nums whitespace-nowrap">
                        <Roll value={calc.netSalaryThb} prefix="฿" />
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.statusKey === 'approved' ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        <span className="text-slate-700">{tText(item.status, locale)}</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-white p-3 rounded-lg border border-slate-200/70 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">
                        {locale === 'th' ? 'ชม. ปกติ + Daymark' : 'Regular + Daymark'}
                      </span>
                      <span className="font-mono font-semibold text-slate-800">
                        {item.regularHours}h +{' '}
                        <strong className="text-teal-700">
                          {item.daymarkVerifiedHours}h
                        </strong>
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">
                        {locale === 'th' ? 'ชม. ล่วงเวลา (1.5x)' : 'Overtime (1.5x)'}
                      </span>
                      <span className="font-mono font-semibold text-slate-800">
                        {item.overtimeHours}h
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">
                        {locale === 'th' ? 'อัตรา/ชม.' : 'Hourly Rate'}
                      </span>
                      <span className="font-mono font-semibold text-slate-800 whitespace-nowrap">
                        {formatCurrencyThb(item.hourlyRateThb)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">
                        {locale === 'th' ? 'ชั่วโมงเบิกจ่ายรวม' : 'Total Billable'}
                      </span>
                      <span className="font-mono font-bold text-teal-800">
                        {calc.totalBillableHours}h
                      </span>
                    </div>
                  </div>

                  {canApprovePayroll && item.statusKey === 'pending' && (
                    <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        {locale === 'th'
                          ? 'พร้อมโอนผ่านระบบ BAHTNET / PromptPay องค์กร'
                          : 'Ready for corporate BAHTNET / PromptPay disbursement'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onApprovePayroll(item.id);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {locale === 'th'
                          ? 'อนุมัติจ่ายเงินเดือน (Admin)'
                          : 'Approve Disbursement (Admin)'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Window>
      </div>

      {/* Right: Encrypted E-Payslip inside Stageshow Receipt (5 cols) */}
      <div className="lg:col-span-5 space-y-4">
        <Receipt
          title={
            locale === 'th'
              ? 'สลิปเงินเดือนอิเล็กทรอนิกส์ (E-PAYSLIP RECEIPT)'
              : 'ENCRYPTED E-PAYSLIP RECEIPT (THB)'
          }
          code={`${activeItem.id.toUpperCase()} · ${tText(activeItem.period, locale)}`}
        >
          {/* PIN Security Bar */}
          <div className="mb-4 pb-3 border-b border-slate-200/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <KeyRound className="w-3.5 h-3.5 text-teal-700" />
              <span>
                {locale === 'th' ? 'รหัสความปลอดภัย PIN:' : 'Security PIN:'}{' '}
                <code className="font-mono font-bold text-slate-900">2468</code>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsUnlocked((prev) => !prev)}
              className="text-[11px] font-semibold text-teal-700 hover:underline cursor-pointer"
            >
              {isUnlocked
                ? locale === 'th'
                  ? 'ล็อกสลิป'
                  : 'Lock E-Payslip'
                : locale === 'th'
                ? 'ปลดล็อกสลิป'
                : 'Unlock E-Payslip'}
            </button>
          </div>

          {!isUnlocked ? (
            <form onSubmit={handleVerifyPin} className="py-6 space-y-3 text-center">
              <Lock className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-800">
                {locale === 'th'
                  ? 'กรอกรหัส PIN 4 หลักเพื่อดูรายละเอียดสลิปเงินเดือน'
                  : 'Enter 4-digit PIN to decrypt clinical E-Payslip'}
              </p>
              <div className="flex justify-center gap-2">
                <input
                  type="password"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-28 text-center font-mono text-sm px-3 py-1.5 rounded-lg border border-slate-300"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-700 text-white text-xs font-semibold cursor-pointer"
                >
                  {locale === 'th' ? 'เปิดดู' : 'Decrypt'}
                </button>
              </div>
              {pinError && <p className="text-xs text-rose-600">{pinError}</p>}
            </form>
          ) : (
            <div className="space-y-4">
              {/* Clinician Info */}
              <div
                onClick={() => onInspectClinician && onInspectClinician(activeItem.employeeId)}
                className="bg-slate-50 hover:bg-teal-50/40 p-3 rounded-lg border border-slate-200/70 space-y-1 transition-colors cursor-pointer"
              >
                <div className="text-sm font-bold text-slate-900 hover:text-teal-800">
                  {tText(activeItem.employeeName, locale)}
                </div>
                <div className="text-xs text-slate-600">
                  {tText(activeItem.roleTitle, locale)}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {tText(activeItem.siteName, locale)}
                </div>
                <div className="text-[11px] font-mono text-teal-800 pt-0.5">
                  {activeItem.email} · PromptPay Verified
                </div>
              </div>

              {/* Itemized Breakdown with strict single-line whitespace-nowrap THB amounts */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-600">
                    {locale === 'th'
                      ? `ค่าตอบแทนเวรปกติ (${activeItem.regularHours} ชม.)`
                      : `Base Clinical Hours (${activeItem.regularHours}h)`}
                  </span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap shrink-0">
                    {formatCurrencyThb(breakdown.baseSalaryThb)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-teal-800 font-medium">
                    {locale === 'th'
                      ? `ชั่วโมงยืนยันโดย Daymark (${activeItem.daymarkVerifiedHours} ชม.)`
                      : `Daymark Verified Hours (${activeItem.daymarkVerifiedHours}h)`}
                  </span>
                  <span className="font-mono font-semibold text-teal-800 tabular-nums whitespace-nowrap shrink-0">
                    + {formatCurrencyThb(breakdown.daymarkSalaryThb)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-600">
                    {locale === 'th'
                      ? `ค่าล่วงเวลา OT 1.5x (${activeItem.overtimeHours} ชม.)`
                      : `Overtime 1.5x (${activeItem.overtimeHours}h)`}
                  </span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap shrink-0">
                    + {formatCurrencyThb(breakdown.overtimeSalaryThb)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-600">
                    {locale === 'th'
                      ? `เงินเพิ่มวิชาชีพ (${activeItem.shiftsCompleted} เวร × ${formatCurrencyThb(
                          SPECIALTY_ALLOWANCE_PER_SHIFT_THB[activeItem.department]
                        )})`
                      : `Specialty Allowance (${activeItem.shiftsCompleted} × ${formatCurrencyThb(
                          SPECIALTY_ALLOWANCE_PER_SHIFT_THB[activeItem.department]
                        )})`}
                  </span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap shrink-0">
                    + {formatCurrencyThb(breakdown.specialtyAllowanceThb)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-600">
                    {locale === 'th'
                      ? 'โบนัสผลประเมิน KPI รายปักษ์'
                      : 'Bi-Weekly Clinical KPI Bonus'}
                  </span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap shrink-0">
                    + {formatCurrencyThb(activeItem.kpiBonusThb)}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-2 flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-800">
                    {locale === 'th' ? 'รวมรายได้ก่อนหัก (Gross)' : 'Gross Remuneration'}
                  </span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap shrink-0">
                    {formatCurrencyThb(breakdown.grossSalaryThb)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 text-rose-700">
                  <span>
                    {locale === 'th'
                      ? 'หัก ภาษี ณ ที่จ่าย (ภ.ง.ด.1/3) & ประกันสังคม (10.5%)'
                      : 'Less: Thai WHT & Social Security (10.5%)'}
                  </span>
                  <span className="font-mono font-semibold tabular-nums whitespace-nowrap shrink-0">
                    - {formatCurrencyThb(breakdown.socialSecurityAndTaxThb)}
                  </span>
                </div>

                {/* Net Take-Home Pay */}
                <div className="mt-3 p-3.5 rounded-xl bg-slate-900 text-white flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-teal-300 block">
                      {locale === 'th'
                        ? 'ยอดเงินรับสุทธิ (NET TAKE-HOME PAY)'
                        : 'NET TAKE-HOME PAY (THB)'}
                    </span>
                    <span className="text-xs text-slate-300">
                      {breakdown.totalBillableHours}{' '}
                      {locale === 'th' ? 'ชั่วโมงเบิกจ่ายรวม' : 'billable clinical hours'}
                    </span>
                  </div>
                  <div className="text-xl font-bold font-mono text-teal-300 tabular-nums whitespace-nowrap shrink-0">
                    {formatCurrencyThb(breakdown.netSalaryThb)}
                  </div>
                </div>
              </div>

              {printToast && (
                <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-[11px] text-teal-900">
                  {printToast}
                </div>
              )}

              <div className="pt-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                  <span>SHA-256 Verified</span>
                  <Bar w={20} h={4} soft />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPrintToast(
                      locale === 'th'
                        ? `เตรียมไฟล์ PDF สลิปเงินเดือน ${activeItem.id} พร้อมลายน้ำดิจิทัลเรียบร้อยแล้ว`
                        : `Prepared digitally watermarked PDF E-Payslip for ${activeItem.id}.`
                    )
                  }
                  className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  {locale === 'th' ? 'ส่งออก PDF / พิมพ์' : 'Export PDF / Print'}
                </button>
              </div>
            </div>
          )}
        </Receipt>
      </div>
    </div>
  );
};
