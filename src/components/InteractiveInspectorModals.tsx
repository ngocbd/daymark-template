import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  MapPin,
  Award,
  Building2,
  Clock,
  FileSignature,
  CreditCard,
  ScanFace,
  CheckCircle2,
  Send,
  Sparkles,
} from 'lucide-react';
import { AppLocale, UserRole, tText, formatCurrencyThb } from '../utils/workforceRules';
import { HOSPITAL_SITES, HospitalSite } from '../data/seedWorkforceData';
import { Avatar, Badge, Button, Receipt, Window } from '../kit/index';

import avatarAdminImg from '../assets/images/avatar_admin_director_1794049572242.jpg';
import avatarClientImg from '../assets/images/avatar_client_coordinator_1794049574109.jpg';
import heroFacilityImg from '../assets/images/hero_clinical_facility_1794049576284.jpg';

export interface InspectedClinician {
  id: string;
  nameEn: string;
  nameTh: string;
  titleEn: string;
  titleTh: string;
  department: 'Critical Care' | 'IPD' | 'OPD';
  hospitalEn: string;
  hospitalTh: string;
  licenseNo: string;
  email: string;
  hourlyRateThb: number;
  discCode: string;
  gpsStatusEn: string;
  gpsStatusTh: string;
  avatarUrl?: string;
  initials: string;
  tone?: 'teal' | 'sky' | 'amber' | 'slate';
}

export const CLINICIAN_DIRECTORY: Record<string, InspectedClinician> = {
  'DM-TH-0842': {
    id: 'DM-TH-0842',
    nameEn: 'Dr. Thanakorn Srisuwan, MD',
    nameTh: 'นพ. ธนกร ศรีสุวรรณ',
    titleEn: 'Attending Critical Care & ICU Physician',
    titleTh: 'แพทย์เฉพาะทางเวชบำบัดวิกฤต (ICU)',
    department: 'Critical Care',
    hospitalEn: 'Bumrungrad International Hospital · ICU Tower A',
    hospitalTh: 'โรงพยาบาลบำรุงราษฎร์ อินเตอร์เนชั่นแนล · อาคาร ICU',
    licenseNo: 'TMC-ว.48291 (แพทยสภา)',
    email: 'clinician@daymark.co.th',
    hourlyRateThb: 1200,
    discCode: 'D-C',
    gpsStatusEn: '42m from ICU Tower A · Liveness 98%',
    gpsStatusTh: 'ระยะ 42 ม. จากอาคาร ICU · Liveness 98%',
    initials: 'TS',
    tone: 'teal',
  },
  'DM-TH-1104': {
    id: 'DM-TH-1104',
    nameEn: 'Pimchanok Wattana, RN',
    nameTh: 'พว. พิมพ์ชนก วัฒนา',
    titleEn: 'Senior Inpatient Charge Nurse (IPD)',
    titleTh: 'หัวหน้าพยาบาลหอผู้ป่วยใน (IPD)',
    department: 'IPD',
    hospitalEn: 'Bumrungrad International Hospital · Ward 9B',
    hospitalTh: 'โรงพยาบาลบำรุงราษฎร์ อินเตอร์เนชั่นแนล · หอผู้ป่วยใน 9B',
    licenseNo: 'TNMC-พย.31882 (สภาการพยาบาล)',
    email: 'pimchanok.w@daymark.co.th',
    hourlyRateThb: 650,
    discCode: 'S-C',
    gpsStatusEn: '64m from Ward 9B · Liveness 96%',
    gpsStatusTh: 'ระยะ 64 ม. จากหอผู้ป่วยใน · Liveness 96%',
    initials: 'PW',
    tone: 'sky',
  },
  'DM-TH-0915': {
    id: 'DM-TH-0915',
    nameEn: 'Dr. Supachai Limpongsai, MD',
    nameTh: 'นพ. ศุภชัย ลิ้มพงษ์ไพศาล',
    titleEn: 'Outpatient Internal Medicine Specialist (OPD)',
    titleTh: 'อายุรแพทย์คลินิกผู้ป่วยนอก (OPD)',
    department: 'OPD',
    hospitalEn: 'Samitivej Sukhumvit Hospital · OPD Clinic 4',
    hospitalTh: 'โรงพยาบาลสมิติเวช สุขุมวิท · คลินิกผู้ป่วยนอก 4',
    licenseNo: 'TMC-ว.51904 (แพทยสภา)',
    email: 'supachai.l@daymark.co.th',
    hourlyRateThb: 1100,
    discCode: 'I-S',
    gpsStatusEn: '52m from Sukhumvit Clinic · Liveness 95%',
    gpsStatusTh: 'ระยะ 52 ม. จากคลินิกสุขุมวิท · Liveness 95%',
    initials: 'SL',
    tone: 'teal',
  },
  'DM-TH-0419': {
    id: 'DM-TH-0419',
    nameEn: 'Kittipong Suwan, Perfusionist',
    nameTh: 'กิตติพงศ์ สุวรรณ (นักเทคโนโลยีหัวใจและทรวงอก)',
    titleEn: 'ECMO & Cardiothoracic Perfusion Specialist',
    titleTh: 'ผู้เชี่ยวชาญเครื่องปอดและหัวใจเทียม ECMO',
    department: 'Critical Care',
    hospitalEn: 'Bumrungrad International Hospital · Cardiothoracic OR',
    hospitalTh: 'โรงพยาบาลบำรุงราษฎร์ อินเตอร์เนชั่นแนล · ห้องผ่าตัดหัวใจ',
    licenseNo: 'TMC-CPT.09412',
    email: 'kittipong.s@daymark.co.th',
    hourlyRateThb: 950,
    discCode: 'D-C',
    gpsStatusEn: 'Daymark Verified · Emergency OR #3',
    gpsStatusTh: 'ยืนยันผ่าน Daymark · ห้องผ่าตัดหัวใจ #3',
    initials: 'KS',
    tone: 'amber',
  },
  'ADM-TH-01': {
    id: 'ADM-TH-01',
    nameEn: 'Dr. Chakrit Charoensuk, MD',
    nameTh: 'นพ. จักรกฤษณ์ เจริญสุข',
    titleEn: 'Chief Executive Officer & Medical Staffing Director',
    titleTh: 'ประธานเจ้าหน้าที่บริหารและผู้อำนวยการฝ่ายการแพทย์',
    department: 'Critical Care',
    hospitalEn: 'Daymark Healthcare Staffing (Thailand) Co., Ltd.',
    hospitalTh: 'บริษัท เดย์มาร์ค เฮลท์แคร์ สตาฟฟิ่ง (ประเทศไทย) จำกัด',
    licenseNo: 'TMC-ว.29104 (แพทยสภา)',
    email: 'admin@daymark.co.th',
    hourlyRateThb: 1800,
    discCode: 'D-C',
    gpsStatusEn: 'Bangkok Executive Command · Verified 2FA',
    gpsStatusTh: 'ศูนย์บริหารงานกรุงเทพฯ · ยืนยันตัวตน 2FA',
    avatarUrl: avatarAdminImg,
    initials: 'CC',
    tone: 'teal',
  },
  'BHM-TH-01': {
    id: 'BHM-TH-01',
    nameEn: 'Nalinee Rattanakorn, RN, MSc',
    nameTh: 'พว. นลินี รัตนากร (พยาบาลวิชาชีพชำนาญการ)',
    titleEn: 'Head of On-site Clinical Workforce Coordination',
    titleTh: 'หัวหน้าฝ่ายประสานงานบุคลากรทางการแพทย์ประจำโรงพยาบาล',
    department: 'Critical Care',
    hospitalEn: 'Bumrungrad International Hospital (Sukhumvit, Bangkok)',
    hospitalTh: 'โรงพยาบาลบำรุงราษฎร์ อินเตอร์เนชั่นแนล (สุขุมวิท กรุงเทพฯ)',
    licenseNo: 'TNMC-พย.19402 (สภาการพยาบาล)',
    email: 'client@bumrungrad.co.th',
    hourlyRateThb: 980,
    discCode: 'S-C',
    gpsStatusEn: 'Bumrungrad Staffing Desk · Daymark Authority',
    gpsStatusTh: 'ศูนย์จัดสรรเวรบำรุงราษฎร์ · สิทธิ์อนุมัติ Daymark',
    avatarUrl: avatarClientImg,
    initials: 'NR',
    tone: 'sky',
  },
};

export function resolveClinicianDossier(idOrName: string): InspectedClinician {
  if (CLINICIAN_DIRECTORY[idOrName]) return CLINICIAN_DIRECTORY[idOrName];
  const lower = idOrName.toLowerCase();
  if (lower.includes('chakrit') || lower.includes('จักรกฤษณ์') || lower.includes('admin')) {
    return CLINICIAN_DIRECTORY['ADM-TH-01'];
  }
  if (lower.includes('nalinee') || lower.includes('นลินี') || lower.includes('client')) {
    return CLINICIAN_DIRECTORY['BHM-TH-01'];
  }
  if (lower.includes('pimchanok') || lower.includes('พิมพ์ชนก')) {
    return CLINICIAN_DIRECTORY['DM-TH-1104'];
  }
  if (lower.includes('supachai') || lower.includes('ศุภชัย')) {
    return CLINICIAN_DIRECTORY['DM-TH-0915'];
  }
  if (lower.includes('kittipong') || lower.includes('กิตติพงศ์')) {
    return CLINICIAN_DIRECTORY['DM-TH-0419'];
  }
  return CLINICIAN_DIRECTORY['DM-TH-0842'];
}

interface ClinicianDossierModalProps {
  clinician: InspectedClinician | null;
  locale: AppLocale;
  currentRole?: UserRole;
  onClose: () => void;
  onNavigateModule?: (mod: string) => void;
  onActionFeedback?: (msg: string) => void;
}

export const ClinicianDossierModal: React.FC<ClinicianDossierModalProps> = ({
  clinician,
  locale,
  onClose,
  onNavigateModule,
  onActionFeedback,
}) => {
  const [quickMessage, setQuickMessage] = useState('');
  const [sentNotice, setSentNotice] = useState<string | null>(null);

  if (!clinician) return null;
  const isTh = locale === 'th';

  const handleSendNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMessage.trim()) return;
    const msg = isTh
      ? `ส่งข้อความด่วนถึง ${clinician.nameTh} เรียบร้อยแล้ว`
      : `Dispatched clinical paging note to ${clinician.nameEn}`;
    setSentNotice(msg);
    setQuickMessage('');
    onActionFeedback?.(msg);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <Window
          title={
            isTh
              ? `แฟ้มข้อมูลบุคลากรทางการแพทย์ · ${clinician.id}`
              : `Clinician Credential & Roster Dossier · ${clinician.id}`
          }
          url={`daymark.co.th/clinicians/${clinician.id.toLowerCase()}`}
          rightSlot={
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-800 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          }
        >
          <div className="p-6 space-y-5">
            {/* Clinician Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <Avatar
                  src={clinician.avatarUrl}
                  initials={clinician.initials}
                  size="lg"
                  status="verified"
                  tone={clinician.tone}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {isTh ? clinician.nameTh : clinician.nameEn}
                    </h3>
                    <Badge tone="emerald">
                      {isTh ? 'ยืนยันใบประกอบวิชาชีพ' : 'Verified'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {isTh ? clinician.titleTh : clinician.titleEn}
                  </p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                    <Building2 className="w-3.5 h-3.5 text-teal-700" />
                    {isTh ? clinician.hospitalTh : clinician.hospitalEn}
                  </p>
                </div>
              </div>
            </div>

            {/* Receipt-style Credential & Telemetry Card */}
            <Receipt
              title={
                isTh
                  ? 'ข้อมูลใบอนุญาตประกอบวิชาชีพและสถานะเวรปัจจุบัน'
                  : 'MEDICAL COUNCIL CREDENTIAL & LIVE TELEMETRY'
              }
              code={clinician.licenseNo}
              stamp={`DISC ${clinician.discCode}`}
            >
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">
                    {isTh ? 'แผนกความเชี่ยวชาญ' : 'Clinical Specialty'}
                  </span>
                  <span className="font-semibold text-slate-900">
                    {clinician.department}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">
                    {isTh ? 'อัตราค่าตอบแทนวิชาชีพ' : 'Standard Clinical Rate'}
                  </span>
                  <span className="font-mono font-bold text-teal-800">
                    {formatCurrencyThb(clinician.hourlyRateThb)} / {isTh ? 'ชม.' : 'hr'}
                  </span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-200/70">
                  <span className="text-slate-400 text-[11px] block">
                    {isTh ? 'สถานะพิกัด GPS และชีวมิติล่าสุด' : 'Live GPS & Biometric Status'}
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-700" />
                    {isTh ? clinician.gpsStatusTh : clinician.gpsStatusEn}
                  </span>
                </div>
              </div>
            </Receipt>

            {/* Quick Clinical Paging Form */}
            <form onSubmit={handleSendNote} className="space-y-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {isTh
                  ? 'ส่งข้อความประสานงานเวร / แจ้งเตือนด่วน'
                  : 'Direct Clinical Paging / Shift Coordination Note'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={quickMessage}
                  onChange={(e) => setQuickMessage(e.target.value)}
                  placeholder={
                    isTh
                      ? 'เช่น ยืนยันการรับเวร ICU อาคาร A เวลา 07:00 น....'
                      : 'e.g., Confirming ICU Tower A shift handover at 07:00...'
                  }
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-teal-700"
                />
                <Button type="submit" variant="dark" size="sm" icon={<Send className="w-3.5 h-3.5" />}>
                  {isTh ? 'ส่งข้อความ' : 'Page'}
                </Button>
              </div>
              {sentNotice && (
                <p className="text-xs text-emerald-700 font-medium flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {sentNotice}
                </p>
              )}
            </form>

            {/* Action Bar */}
            {onNavigateModule && (
              <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="secondary"
                    size="xs"
                    icon={<ScanFace className="w-3.5 h-3.5 text-teal-700" />}
                    onClick={() => {
                      onNavigateModule('attendance');
                      onClose();
                    }}
                  >
                    {isTh ? 'ดูบันทึกเวลา & Daymark' : 'Attendance & Daymark'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="xs"
                    icon={<FileSignature className="w-3.5 h-3.5 text-teal-700" />}
                    onClick={() => {
                      onNavigateModule('contracts');
                      onClose();
                    }}
                  >
                    {isTh ? 'ตรวจสอบสัญญา E-Sign' : 'Inspect E-Contract'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="xs"
                    icon={<CreditCard className="w-3.5 h-3.5 text-teal-700" />}
                    onClick={() => {
                      onNavigateModule('payroll');
                      onClose();
                    }}
                  >
                    {isTh ? 'สลิปเงินเดือน THB' : 'THB E-Payslip'}
                  </Button>
                </div>
                <Button variant="ghost" size="xs" onClick={onClose}>
                  {isTh ? 'ปิดหน้าต่าง' : 'Close'}
                </Button>
              </div>
            )}
          </div>
        </Window>
      </div>
    </div>
  );
};

interface FacilityInspectorModalProps {
  isOpen: boolean;
  locale: AppLocale;
  selectedSiteId?: string;
  onSelectSite?: (site: HospitalSite) => void;
  onClose: () => void;
}

export const FacilityInspectorModal: React.FC<FacilityInspectorModalProps> = ({
  isOpen,
  locale,
  selectedSiteId,
  onSelectSite,
  onClose,
}) => {
  const [activeSiteId, setActiveSiteId] = useState<string>(
    selectedSiteId || HOSPITAL_SITES[0].id
  );
  const [pingSuccess, setPingSuccess] = useState<string | null>(null);

  if (!isOpen) return null;
  const isTh = locale === 'th';
  const activeSite =
    HOSPITAL_SITES.find((s) => s.id === activeSiteId) || HOSPITAL_SITES[0];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <Window
          title={
            isTh
              ? 'เครือข่ายโรงพยาบาลพันธมิตรและรัศมีพิกัด GPS Geofencing'
              : 'Partner Hospital Network & 250m GPS Geofence Telemetry'
          }
          url="daymark.co.th/facilities/geofence"
          rightSlot={
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-800 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          }
        >
          <div className="p-6 space-y-5">
            {/* Hero Image Banner */}
            <div className="relative h-44 rounded-xl overflow-hidden border border-slate-200">
              <img
                src={heroFacilityImg}
                alt={tText(activeSite.name, locale)}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-[10px] font-mono uppercase tracking-widest text-teal-300">
                  JCI ACCREDITED PARTNER FACILITY · 250M GPS GEOFENCE
                </span>
                <h3 className="text-base font-bold mt-0.5">
                  {tText(activeSite.name, locale)}
                </h3>
                <p className="text-xs text-slate-200">
                  {tText(activeSite.address, locale)}
                </p>
              </div>
            </div>

            {/* Hospital Switcher Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {HOSPITAL_SITES.map((site) => {
                const isSelected = site.id === activeSite.id;
                return (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => {
                      setActiveSiteId(site.id);
                      setPingSuccess(null);
                      onSelectSite?.(site);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50/70 border-teal-700 ring-2 ring-teal-600/10'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {tText(site.name, locale)}
                      </span>
                      <span className="text-[10px] font-mono text-teal-700 shrink-0">
                        {site.geofenceRadiusMeters}m
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 truncate">
                      {tText(site.contactCoordinator, locale)}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Telemetry Details */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">
                  {isTh ? 'พิกัด GPS ละติจูด / ลองจิจูด' : 'GPS Coordinates'}
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {activeSite.coords.lat.toFixed(4)}°N, {activeSite.coords.lng.toFixed(4)}°E
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">
                  {isTh ? 'แผนกที่เปิดรับเวร' : 'Active Clinical Units'}
                </span>
                <span className="font-semibold text-teal-800">
                  {activeSite.departmentFocus.join(' · ')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">
                  {isTh ? 'หัวหน้าประสานงานโรงพยาบาล' : 'Facility Director'}
                </span>
                <span className="font-semibold text-slate-800">
                  {tText(activeSite.contactCoordinator, locale)}
                </span>
              </div>
            </div>

            {pingSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{pingSuccess}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
              <Button
                variant="primary"
                size="sm"
                icon={<MapPin className="w-3.5 h-3.5" />}
                onClick={() =>
                  setPingSuccess(
                    isTh
                      ? `ทดสอบสัญญาณพิกัด GPS ณ ${tText(activeSite.name, locale)} สำเร็จ (ความแม่นยำ ±4 เมตร ภายในรัศมี 250 เมตร)`
                      : `Verified live GPS beacon at ${tText(activeSite.name, locale)} (±4m accuracy within 250m perimeter).`
                  )
                }
              >
                {isTh ? 'ทดสอบสัญญาณพิกัด GPS โรงพยาบาล' : 'Verify Live GPS Geofence Beacon'}
              </Button>
              <Button variant="secondary" size="sm" onClick={onClose}>
                {isTh ? 'เสร็จสิ้น' : 'Done'}
              </Button>
            </div>
          </div>
        </Window>
      </div>
    </div>
  );
};
