import React, { useRef, useState, useEffect } from 'react';
import {
  FileSignature,
  CheckCircle2,
  ShieldCheck,
  Award,
  Building2,
  Eraser,
  PenTool,
  Lock,
} from 'lucide-react';
import {
  UserRole,
  AppLocale,
  formatCurrencyThb,
  canRolePerformAction,
  tText,
} from '../utils/workforceRules';
import { CandidateContract } from '../data/seedWorkforceData';
import { Window, Bar, Avatar } from '../kit';

interface RecruitmentContractProps {
  currentRole: UserRole;
  locale: AppLocale;
  contracts: CandidateContract[];
  onSignContract: (contractId: string, signatureDataUrl: string) => void;
  onAdminApproveContract: (contractId: string) => void;
  onInspectClinician?: (idOrName: string) => void;
  onInspectFacility?: () => void;
}

export const RecruitmentContractModule: React.FC<RecruitmentContractProps> = ({
  currentRole,
  locale,
  contracts,
  onSignContract,
  onAdminApproveContract,
  onInspectClinician,
  onInspectFacility,
}) => {
  const [selectedContractId, setSelectedContractId] = useState<string>(
    contracts[0]?.id || 'cnt-801'
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const selectedContract =
    contracts.find((c) => c.id === selectedContractId) || contracts[0];

  const canApproveContract = canRolePerformAction(
    currentRole,
    'recruitment.manage_approve'
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#0F766E';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
  }, [selectedContractId]);

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
    setHasDrawnSignature(true);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
  };

  const handleApplyESignature = () => {
    if (!selectedContract) return;
    const canvas = canvasRef.current;
    const dataUrl = canvas ? canvas.toDataURL('image/png') : 'esigned_verified';
    onSignContract(selectedContract.id, dataUrl);
    setStatusBanner(
      locale === 'th'
        ? `ลงนามสัญญาอิเล็กทรอนิกส์ (E-Sign) สำหรับ ${selectedContract.contractCode} เรียบร้อยแล้ว`
        : `Electronic signature (E-Sign) recorded for contract ${selectedContract.contractCode}.`
    );
  };

  const handleAdminCountersign = () => {
    if (!selectedContract) return;
    onAdminApproveContract(selectedContract.id);
    setStatusBanner(
      locale === 'th'
        ? `ผู้บริหารระบบ (Admin) อนุมัติและประทับตราสัญญา ${selectedContract.contractCode} เรียบร้อยแล้ว`
        : `System Admin countersigned and activated contract ${selectedContract.contractCode}.`
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left: Candidate & Contract Directory (5 cols) */}
      <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {locale === 'th'
                ? 'ทะเบียนใบประกอบวิชาชีพและสัญญาจ้าง (TMC / TNMC)'
                : 'Thailand Medical Council Credentialing & E-Contracts'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {locale === 'th'
                ? 'ตรวจสอบใบอนุญาตแพทยสภา (ว.) และสภาการพยาบาล (พย.)'
                : 'Verified Medical Council of Thailand (TMC) & TNMC Licenses'}
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {contracts.length} {locale === 'th' ? 'ฉบับ' : 'files'}
          </span>
        </div>

        <div className="divide-y divide-slate-200/70">
          {contracts.map((ct) => {
            const active = ct.id === selectedContract?.id;
            return (
              <button
                key={ct.id}
                type="button"
                onClick={() => {
                  setSelectedContractId(ct.id);
                  setStatusBanner(null);
                }}
                className={`w-full text-left p-4 transition-colors flex items-start justify-between gap-3 cursor-pointer ${
                  active ? 'bg-teal-50/60 border-l-4 border-l-teal-700' : 'hover:bg-slate-50'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {tText(ct.candidateName, locale)}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {ct.contractCode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{tText(ct.specialtyTitle, locale)}</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    <span>{tText(ct.appliedSite, locale)}</span>
                  </div>
                  <div className="text-[11px] font-mono text-teal-800 pt-0.5 flex items-center gap-2">
                    <span>
                      {ct.medicalLicenseNo} · {formatCurrencyThb(ct.hourlyRateThb)}/hr
                    </span>
                    <Bar w={24} h={4} soft />
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        ct.statusKey === 'admin_approved'
                          ? 'bg-emerald-500'
                          : ct.statusKey === 'esigned'
                          ? 'bg-sky-500'
                          : 'bg-amber-500'
                      }`}
                    />
                    <span className="text-slate-700">{tText(ct.status, locale)}</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: E-Contract Document & Signature Pad inside Stageshow Window (7 cols) */}
      {selectedContract && (
        <div className="lg:col-span-7">
          <Window
            title={
              locale === 'th'
                ? `daymark.co.th/contracts/${selectedContract.contractCode} — สัญญาจ้างอิเล็กทรอนิกส์ (E-Contract)`
                : `daymark.co.th/contracts/${selectedContract.contractCode} — Clinical E-Contract Document`
            }
            url={`https://app.daymark.co.th/contracts/${selectedContract.contractCode}`}
          >
            <div className="p-6 space-y-5">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <FileSignature className="w-4 h-4 text-teal-700" />
                    <span className="text-xs font-mono uppercase tracking-wider font-semibold text-teal-700">
                      {locale === 'th'
                        ? `สัญญาจ้างบุคลากรทางการแพทย์ #${selectedContract.contractCode}`
                        : `CLINICAL EMPLOYMENT & CREDENTIAL AGREEMENT #${selectedContract.contractCode}`}
                    </span>
                  </div>
                  <div
                    onClick={() =>
                      onInspectClinician &&
                      onInspectClinician(selectedContract.candidateName.en)
                    }
                    className="flex items-center gap-2.5 mt-1.5 cursor-pointer group"
                  >
                    <Avatar
                      initials={selectedContract.candidateName.en
                        .replace(/^Dr\.\s+|^RN\.\s+/i, '')
                        .slice(0, 2)
                        .toUpperCase()}
                      size="sm"
                      status="verified"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-800">
                        {tText(selectedContract.candidateName, locale)}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {tText(selectedContract.specialtyTitle, locale)} ·{' '}
                        {tText(selectedContract.contractType, locale)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 block">
                    {locale === 'th' ? 'อัตราค่าตอบแทนวิชาชีพ' : 'Agreed Clinical Rate'}
                  </span>
                  <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                    {formatCurrencyThb(selectedContract.hourlyRateThb)} /{' '}
                    {locale === 'th' ? 'ชม.' : 'hr'}
                  </span>
                </div>
              </div>

              {statusBanner && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{statusBanner}</span>
                </div>
              )}

              {/* Legal Terms Preview Box */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/80 space-y-2.5 text-xs text-slate-700 leading-relaxed max-h-56 overflow-y-auto">
                <p className="font-bold text-slate-900">
                  {locale === 'th'
                    ? 'ข้อ 1. การรับรองใบอนุญาตประกอบวิชาชีพเวชกรรม / การพยาบาล (แพทยสภา & สภาการพยาบาล)'
                    : 'ARTICLE 1. MEDICAL COUNCIL OF THAILAND (TMC / TNMC) CREDENTIALING'}
                </p>
                <p>
                  {locale === 'th' ? (
                    <>
                      คู่สัญญาฝ่ายบุคลากรทางการแพทย์ (
                      <strong>{tText(selectedContract.candidateName, locale)}</strong>)
                      ขอรับรองว่าใบอนุญาตเลขที่{' '}
                      <strong className="font-mono">
                        {selectedContract.medicalLicenseNo}
                      </strong>{' '}
                      มีผลบังคับใช้ถูกต้องตามกฎหมายวิชาชีพเวชกรรมและสภาการพยาบาลแห่งประเทศไทย
                      สำหรับการปฏิบัติงาน ณ{' '}
                      <strong>{tText(selectedContract.appliedSite, locale)}</strong>
                    </>
                  ) : (
                    <>
                      The Clinician (
                      <strong>{tText(selectedContract.candidateName, locale)}</strong>) certifies
                      that license number{' '}
                      <strong className="font-mono">
                        {selectedContract.medicalLicenseNo}
                      </strong>{' '}
                      is valid and in good standing with the Medical Council of Thailand / TNMC for
                      clinical shifts at{' '}
                      <strong>{tText(selectedContract.appliedSite, locale)}</strong>.
                    </>
                  )}
                </p>

                <p className="font-bold text-slate-900 pt-1">
                  {locale === 'th'
                    ? 'ข้อ 2. การลงเวลาด้วยระบบชีวมิติ (Biometric Attendance) และการอนุมัติ Daymark'
                    : 'ARTICLE 2. BIOMETRIC CLOCK-IN, GPS GEOFENCING & DAYMARK VERIFICATION'}
                </p>
                <p>
                  {locale === 'th' ? (
                    <>
                      ชั่วโมงการทำงานคำนวณจากเวลาจริงที่สแกนใบหน้า (Live Face-Scan + Liveness)
                      ภายในรัศมีพิกัด GPS ของโรงพยาบาล หรือจากการยืนยัน{' '}
                      <strong>Daymark</strong> โดยผู้อำนวยการประสานงานโรงพยาบาล
                      พร้อมบันทึกเหตุผลตรวจสอบย้อนหลังได้
                    </>
                  ) : (
                    <>
                      Billable hours are calculated from verified real-time GPS + Liveness Face-Scan
                      attendance within the hospital geofence, or via an audited{' '}
                      <strong>Daymark</strong> override executed by the Hospital Roster Director.
                    </>
                  )}
                </p>

                <p className="font-bold text-slate-900 pt-1">
                  {locale === 'th'
                    ? 'ข้อ 3. อัตราค่าตอบแทน เงินเพิ่มเวรดึก และ พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)'
                    : 'ARTICLE 3. THB REMUNERATION, NIGHT DIFFERENTIAL & THAILAND PDPA'}
                </p>
                <p>
                  {locale === 'th' ? (
                    <>
                      อัตราค่าตอบแทนพื้นฐานอยู่ที่{' '}
                      <strong className="font-mono">
                        {formatCurrencyThb(selectedContract.hourlyRateThb)}/ชั่วโมง
                      </strong>{' '}
                      (เวรดึก On-call คิดตัวคูณ 1.35 เท่า และค่าล่วงเวลา OT คิด 1.5 เท่า)
                      ภายใต้พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
                    </>
                  ) : (
                    <>
                      Base clinical remuneration is{' '}
                      <strong className="font-mono">
                        {formatCurrencyThb(selectedContract.hourlyRateThb)}/hour
                      </strong>{' '}
                      (Night On-Call shifts receive a 1.35x differential; Overtime receives 1.5x),
                      processed in strict compliance with Thailand PDPA B.E. 2562.
                    </>
                  )}
                </p>
              </div>

              {/* Credential & Verification Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-slate-200/80 bg-white">
                  <span className="text-slate-400 text-[11px] block">
                    {locale === 'th' ? 'เลขใบประกอบวิชาชีพ' : 'License Number'}
                  </span>
                  <span className="font-mono font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-teal-700" />
                    {selectedContract.medicalLicenseNo}
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200/80 bg-white">
                  <span className="text-slate-400 text-[11px] block">
                    {locale === 'th' ? 'ประสบการณ์วิชาชีพ' : 'Clinical Experience'}
                  </span>
                  <span className="font-mono font-semibold text-slate-800 mt-0.5 block">
                    {selectedContract.experienceYears}{' '}
                    {locale === 'th' ? 'ปี (โรงพยาบาล JCI)' : 'Years (JCI Hospital)'}
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200/80 bg-white">
                  <span className="text-slate-400 text-[11px] block">
                    {locale === 'th' ? 'เวลาที่ลงนาม E-Sign' : 'E-Sign Timestamp'}
                  </span>
                  <span className="font-mono font-semibold text-slate-800 mt-0.5 block">
                    {selectedContract.signedAt ||
                      (locale === 'th' ? 'รอการลงนาม' : 'Awaiting Signature')}
                  </span>
                </div>
              </div>

              {/* Interactive HTML5 Signature Pad */}
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PenTool className="w-3.5 h-3.5 text-teal-700" />
                    <span className="text-xs font-bold text-slate-900">
                      {locale === 'th'
                        ? 'กระดานลงลายมือชื่ออิเล็กทรอนิกส์ (HTML5 E-Signature Pad)'
                        : 'Electronic Signature Pad (Clinician / Candidate E-Sign)'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    {locale === 'th' ? 'ล้างลายเซ็น' : 'Clear Pad'}
                  </button>
                </div>

                <div className="relative rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/70 overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={560}
                    height={110}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-28 cursor-crosshair"
                  />
                  {!hasDrawnSignature && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                      {locale === 'th'
                        ? 'วาดลายมือชื่อที่นี่เพื่อลงนามสัญญาอิเล็กทรอนิกส์'
                        : 'Draw your signature here to electronically sign this clinical agreement'}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleApplyESignature}
                    className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <FileSignature className="w-3.5 h-3.5" />
                    {locale === 'th'
                      ? 'ยืนยันการลงนาม E-Sign (บุคลากรทางการแพทย์)'
                      : 'Sign Contract Electronically (E-Sign)'}
                  </button>

                  {canApproveContract ? (
                    <button
                      type="button"
                      onClick={handleAdminCountersign}
                      disabled={selectedContract.statusKey === 'admin_approved'}
                      className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {selectedContract.statusKey === 'admin_approved'
                        ? locale === 'th'
                          ? 'ผู้บริหารอนุมัติสัญญาแล้ว'
                          : 'Countersigned by Admin'
                        : locale === 'th'
                        ? 'อนุมัติและเปิดใช้งานสัญญา (Admin)'
                        : 'Countersign & Activate Contract (Admin)'}
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" />
                      {locale === 'th'
                        ? 'การอนุมัติขั้นสุดท้ายสงวนสิทธิ์เฉพาะบัญชี Admin'
                        : 'Final contract activation requires System Admin login'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Window>
        </div>
      )}
    </div>
  );
};
