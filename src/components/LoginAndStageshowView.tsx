import React, { useState, useEffect, useRef } from 'react';
import {
  AppLocale,
  UserRole,
  tText,
  resolveAccountRoleByEmail,
} from '../utils/workforceRules';
import { ROLE_PROFILES } from '../data/seedWorkforceData';
import {
  Bar,
  Row,
  Roll,
  Window,
  Phone,
  Avatar,
  Button,
  Badge,
  Segmented,
  Stamp,
  StageshowCursor,
} from '../kit/index';
import {
  ClinicianDossierModal,
  FacilityInspectorModal,
  InspectedClinician,
  resolveClinicianDossier,
} from './InteractiveInspectorModals';
import {
  Lock,
  ArrowRight,
  Globe,
  Play,
  Pause,
  MapPin,
  ShieldCheck,
  Building2,
} from 'lucide-react';

import avatarAdminImg from '../assets/images/avatar_admin_director_1794049572242.jpg';
import avatarClientImg from '../assets/images/avatar_client_coordinator_1794049574109.jpg';
import heroFacilityImg from '../assets/images/hero_clinical_facility_1794049576284.jpg';

interface LoginAndStageshowViewProps {
  locale: AppLocale;
  onToggleLocale: (next: AppLocale) => void;
  onLoginSuccess: (role: UserRole, email: string, initialModule?: string) => void;
}

type BeatIndex = 0 | 1 | 2 | 3;

export const LoginAndStageshowView: React.FC<LoginAndStageshowViewProps> = ({
  locale,
  onToggleLocale,
  onLoginSuccess,
}) => {
  const isTh = locale === 'th';

  // Authentication Form State
  const [emailInput, setEmailInput] = useState<string>('admin@daymark.co.th');
  const [passwordInput, setPasswordInput] = useState<string>('Daymark@2026');
  const [totpInput, setTotpInput] = useState<string>('849201');
  const [authError, setAuthError] = useState<string | null>(null);

  // Interactive Modals for Avatars & Facility Images
  const [inspectedClinician, setInspectedClinician] =
    useState<InspectedClinician | null>(null);
  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);

  // Stageshow 4-Beat Choreography State (`poster` = beat 3)
  const [beat, setBeat] = useState<BeatIndex>(3);
  const [playing, setPlaying] = useState<boolean>(true);
  const [cursorPressed, setCursorPressed] = useState<boolean>(false);
  const [cursorPos, setCursorPos] = useState<{
    x: number;
    y: number;
    label: string;
  }>({
    x: 420,
    y: 120,
    label: '',
  });

  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setCursorPressed(true);
      window.setTimeout(() => setCursorPressed(false), 240);
      setBeat((prev) => ((prev + 1) % 4) as BeatIndex);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [playing]);

  // Measure target elements dynamically with getBoundingClientRect() (`rect()`)
  useEffect(() => {
    const stageEl = stageRef.current;
    if (!stageEl) return;

    const targetName =
      beat === 0
        ? 'row-thanakorn'
        : beat === 1
        ? 'phone-clockin-btn'
        : beat === 2
        ? 'btn-daymark-confirm'
        : 'payroll-roll-counter';

    const targetEl = stageEl.querySelector(
      `[data-target="${targetName}"]`
    ) as HTMLElement | null;
    if (!targetEl) return;

    const stageRect = stageEl.getBoundingClientRect();
    const rect = targetEl.getBoundingClientRect();
    const x = Math.round(rect.left - stageRect.left + rect.width * 0.58);
    const y = Math.round(rect.top - stageRect.top + rect.height * 0.58);

    const labels: Record<BeatIndex, { en: string; th: string }> = {
      0: { en: 'Select ICU Shift', th: 'เลือกเวร ICU' },
      1: { en: 'Face ID + 42m GPS', th: 'สแกนใบหน้า + GPS' },
      2: { en: 'Confirm Daymark (+8h)', th: 'ยืนยัน Daymark (+8 ชม.)' },
      3: { en: 'THB Ledger Updated', th: 'อัปเดตยอด THB' },
    };

    setCursorPos({
      x: Math.max(24, Math.min(x, stageRect.width - 90)),
      y: Math.max(24, Math.min(y, stageRect.height - 40)),
      label: tText(labels[beat], locale),
    });
  }, [beat, locale]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const resolved = resolveAccountRoleByEmail(emailInput);
    if (!resolved) {
      setAuthError(
        isTh
          ? 'กรุณากรอกอีเมลที่ลงทะเบียนกับ Daymark Thailand'
          : 'Please enter a valid work email registered with Daymark Thailand.'
      );
      return;
    }
    if (passwordInput.trim().length < 4) {
      setAuthError(
        isTh ? 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร' : 'Password must be at least 4 characters.'
      );
      return;
    }
    onLoginSuccess(resolved.role, resolved.email);
  };

  const handleQuickAccountSignIn = (roleKey: UserRole) => {
    const profile = ROLE_PROFILES[roleKey];
    setEmailInput(profile.email);
    setPasswordInput(profile.demoPassword);
    onLoginSuccess(profile.role, profile.email);
  };

  // Derived scene values driven by `beat`
  const isClockedIn = beat >= 1;
  const isDaymarkApproved = beat >= 2;
  const rollingPayrollThb = isDaymarkApproved ? 254300 : 242700;
  const rollingHours = isDaymarkApproved ? 176 : 168;

  const getAvatarSrc = (role: UserRole) => {
    if (role === 'admin') return avatarAdminImg;
    if (role === 'client') return avatarClientImg;
    return undefined;
  };

  return (
    <div className="min-h-screen bg-[#F6F5F2] text-slate-900 flex flex-col justify-between">
      {/* Top Bar — Every item is interactive */}
      <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              setBeat(3);
              setPlaying(true);
            }}
            className="flex items-center gap-3 text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-700 text-white font-bold text-sm flex items-center justify-center shadow-2xs group-hover:bg-teal-800 transition-colors">
              D
            </div>
            <div>
              <span className="font-bold tracking-tight text-slate-950 text-sm block leading-none">
                Daymark Health
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                THAILAND CLINICAL WORKFORCE OS
              </span>
            </div>
          </button>

          {/* Interactive Stage Beat / Feature Jumpers */}
          <nav className="hidden lg:flex items-center gap-1">
            {[
              {
                beatIdx: 1 as BeatIndex,
                labelEn: 'Biometric GPS & Face ID',
                labelTh: 'สแกนใบหน้า & พิกัด GPS',
              },
              {
                beatIdx: 2 as BeatIndex,
                labelEn: 'Hospital Daymark Override',
                labelTh: 'ยืนยันเวลาทำงาน Daymark',
              },
              {
                beatIdx: 0 as BeatIndex,
                labelEn: 'ICU / IPD / OPD Rosters',
                labelTh: 'ตารางเวร ICU · IPD · OPD',
              },
              {
                beatIdx: 3 as BeatIndex,
                labelEn: 'Automated THB Compensation',
                labelTh: 'คำนวณค่าตอบแทน THB',
              },
            ].map((nav) => (
              <button
                key={nav.labelEn}
                type="button"
                onClick={() => {
                  setPlaying(false);
                  setBeat(nav.beatIdx);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  beat === nav.beatIdx
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                }`}
              >
                {isTh ? nav.labelTh : nav.labelEn}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsFacilityModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-teal-700" />
              <span>{isTh ? '4 โรงพยาบาลพันธมิตร' : '4 Bangkok Hospitals'}</span>
            </button>

            <div className="inline-flex items-center gap-1 bg-slate-200/75 p-1 rounded-lg">
              <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-0.5" />
              <button
                type="button"
                onClick={() => onToggleLocale('en')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  locale === 'en'
                    ? 'bg-white text-slate-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onToggleLocale('th')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  locale === 'th'
                    ? 'bg-white text-slate-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ไทย (TH)
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Split Layout: Sign-In Column (5 cols) + Unboxed Stageshow Hero (7 cols) */}
      <main className="max-w-[1440px] mx-auto w-full px-6 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* LEFT COLUMN: Enterprise Clinical Sign-In */}
        <section className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-teal-700 font-semibold">
                {isTh
                  ? 'ระบบยืนยันตัวตนบุคลากรทางการแพทย์'
                  : 'CLINICAL WORKFORCE AUTHENTICATION'}
              </span>
              <Stamp>{isTh ? 'JCI · PDPA' : 'JCI · PDPA'}</Stamp>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 mt-1.5">
              {isTh
                ? 'เข้าสู่ระบบ Daymark Thailand'
                : 'Sign In to Daymark Workspace'}
            </h1>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {isTh
                ? 'สิทธิ์การเข้าถึงและหน้าจอการทำงานถูกกำหนดตามบทบาทวิชาชีพของบัญชีที่เข้าสู่ระบบโดยอัตโนมัติ'
                : 'Workspace capabilities and hospital permissions are strictly bound to your authenticated clinical account.'}
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isTh ? 'อีเมลหน่วยงาน / โรงพยาบาล' : 'Verified Clinical Email'}
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-slate-50/60 focus:bg-white focus:outline-none focus:border-teal-700 font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isTh ? 'รหัสผ่าน' : 'Password'}
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-slate-50/60 focus:bg-white focus:outline-none focus:border-teal-700 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isTh ? 'รหัส 2FA (TOTP)' : '2FA Authenticator'}
                </label>
                <input
                  type="text"
                  value={totpInput}
                  onChange={(e) => setTotpInput(e.target.value)}
                  maxLength={6}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-slate-50/60 focus:bg-white focus:outline-none focus:border-teal-700 font-mono tracking-widest"
                  required
                />
              </div>
            </div>

            {authError && (
              <p className="text-xs text-rose-600 font-medium">{authError}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={<Lock className="w-3.5 h-3.5" />}
              className="w-full py-2.5"
            >
              {isTh ? 'เข้าสู่ระบบด้วยบัญชีนี้' : 'Sign In to Clinical Workspace'}
            </Button>
          </form>

          {/* Direct Account Cards — Avatar click inspects dossier; Card click signs in */}
          <div className="pt-4 border-t border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-slate-500">
                {isTh
                  ? 'เลือกบัญชีบุคลากรเพื่อเข้าสู่ระบบ (คลิกที่รูปโปรไฟล์เพื่อดูใบประกอบวิชาชีพ):'
                  : 'Quick Account Sign-In (Click any avatar to inspect license dossier):'}
              </p>
            </div>

            <div className="space-y-2">
              {(['admin', 'client', 'employee'] as UserRole[]).map((rKey) => {
                const prof = ROLE_PROFILES[rKey];
                return (
                  <div
                    key={rKey}
                    onClick={() => handleQuickAccountSignIn(rKey)}
                    className="w-full text-left p-3 rounded-xl border border-slate-200/90 hover:border-teal-700/60 hover:bg-teal-50/30 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        src={getAvatarSrc(rKey)}
                        initials={prof.initials}
                        alt={tText(prof.fullName, locale)}
                        status="verified"
                        tone={
                          rKey === 'admin'
                            ? 'teal'
                            : rKey === 'client'
                            ? 'sky'
                            : 'amber'
                        }
                        title={
                          isTh
                            ? 'คลิกเพื่อดูแฟ้มใบประกอบวิชาชีพ'
                            : 'Click to inspect clinical credential dossier'
                        }
                        onClick={() =>
                          setInspectedClinician(resolveClinicianDossier(prof.code))
                        }
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-teal-800">
                            {tText(prof.shortRoleLabel, locale)}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500 truncate">
                            {prof.email}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
                          {tText(prof.fullName, locale)}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {tText(prof.organization, locale)}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 group-hover:translate-x-0.5 transition-transform">
                      {isTh ? 'เข้าใช้งาน' : 'Sign In'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: STAGESHOW UNBOXED HERO (`device-pair` + `hero-demo`) */}
        <section className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-teal-700 font-semibold">
                {isTh
                  ? 'โรงพยาบาลบำรุงราษฎร์ · เครือ BDMS · สมิติเวช · ศิริราช ปิยมหาราชการุณย์'
                  : 'BUMRUNGRAD · BDMS · SAMITIVEJ · SIRIRAJ PIYAMAHARAJKARUN'}
              </p>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 mt-0.5">
                {isTh
                  ? 'ระบบลงเวลาชีวมิติ ยืนยันเวลา Daymark และคำนวณค่าตอบแทนอัตโนมัติ'
                  : 'Biometric Clock-In, Daymark Verification & Rolling THB Payroll'}
              </h2>
            </div>

            {/* Stage Playback & Beat Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="xs"
                icon={
                  playing ? (
                    <Pause className="w-3 h-3 text-teal-700" />
                  ) : (
                    <Play className="w-3 h-3 text-teal-700" />
                  )
                }
                onClick={() => setPlaying((p) => !p)}
              >
                {playing
                  ? isTh
                    ? 'หยุดชั่วคราว'
                    : 'Pause'
                  : isTh
                  ? 'เล่นต่อ'
                  : 'Play'}
              </Button>
              <Segmented
                size="xs"
                value={String(beat)}
                onChange={(v) => {
                  setPlaying(false);
                  setBeat(Number(v) as BeatIndex);
                }}
                options={[
                  { value: '0', label: isTh ? 'ตารางเวร ICU' : 'ICU Roster' },
                  { value: '1', label: isTh ? 'สแกนชีวมิติ' : 'Face ID' },
                  { value: '2', label: isTh ? 'ยืนยัน Daymark' : 'Daymark' },
                  { value: '3', label: isTh ? 'สรุปยอด THB' : 'THB Payoff' },
                ]}
              />
            </div>
          </div>

          {/*
            STAGESHOW STAGE:
            - Sits directly on the page ground (no bordered plate box around it!).
            - Window fills >75% of the stage and bleeds off the right edge (`bleedRight`).
            - Phone satellite sits over the bottom-left sidebar margin, NEVER covering the focal clinician text or numbers!
            - Real strings strictly budgeted to the focal ICU story; peripheral rows use `<Bar />` restraint.
          */}
          <div
            ref={stageRef}
            id="example"
            className="ss-stage pt-2 pb-10 pl-0 sm:pl-6 pr-0 min-h-[410px]"
          >
            {/* Primary Focal Object: Unboxed Window bleeding right */}
            <div className="ml-0 sm:ml-24">
              <Window
                title={
                  isTh
                    ? 'Daymark — โรงพยาบาลบำรุงราษฎร์ อินเตอร์เนชั่นแนล (ICU)'
                    : 'Daymark — Bumrungrad International Hospital (ICU)'
                }
                url="app.daymark.co.th/bumrungrad-icu"
                bleedRight
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setIsFacilityModalOpen(true)}
                    className="text-[11px] font-mono text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Building2 className="w-3 h-3" />
                    <span>250m GPS</span>
                  </button>
                }
              >
                <div className="grid grid-cols-12 min-h-[320px]">
                  {/* Left Sidebar inside Window (Restrained with <Bar /> so the Phone satellite can straddle over it without covering focal text) */}
                  <div className="hidden sm:flex sm:col-span-3 bg-[#FAF9F6] border-r border-slate-200/80 p-3.5 flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded bg-teal-700 inline-block" />
                        <Bar w={56} />
                      </div>
                      <div className="px-2.5 py-1.5 rounded-md bg-teal-900/10 text-[11px] font-semibold text-teal-950">
                        {isTh ? 'หอผู้ป่วยวิกฤต ICU' : 'ICU Roster'}
                      </div>
                      <div className="space-y-2 pl-2 pt-1">
                        <Bar w={68} soft />
                        <Bar w={52} soft />
                        <Bar w={60} soft />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Bar w={48} soft />
                      <Bar w={64} soft />
                    </div>
                  </div>

                  {/* Main Focal Story Pane (9 cols) */}
                  <div className="col-span-12 sm:col-span-9 p-5 space-y-4">
                    {/* Top Metric Row + Daymark Action Button */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
                      <div
                        data-target="payroll-roll-counter"
                        onClick={() => handleQuickAccountSignIn('admin')}
                        className="cursor-pointer group"
                        title={
                          isTh
                            ? 'คลิกเพื่อเปิดดูบัญชีเงินเดือน THB'
                            : 'Click to inspect THB payroll ledger'
                        }
                      >
                        <p className="text-[11px] font-medium text-slate-500">
                          {isTh
                            ? 'งบค่าตอบแทนเวรวิกฤต ICU ที่ยืนยันแล้ว (THB)'
                            : 'Verified ICU Compensation Cycle (THB)'}
                        </p>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-2xl font-bold tracking-tight text-slate-950 group-hover:text-teal-800 transition-colors">
                            <Roll value={rollingPayrollThb} prefix="฿" />
                          </span>
                          <span className="text-xs font-mono text-teal-700 font-semibold">
                            (<Roll value={rollingHours} suffix="h" />)
                          </span>
                        </div>
                      </div>

                      <Button
                        variant={isDaymarkApproved ? 'primary' : 'amber'}
                        size="xs"
                        target="btn-daymark-confirm"
                        onClick={() => {
                          setPlaying(false);
                          setBeat((prev) => (prev >= 2 ? 0 : 2));
                        }}
                      >
                        {isDaymarkApproved
                          ? isTh
                            ? '✓ ยืนยัน Daymark +8 ชม. แล้ว'
                            : '✓ Daymark +8h Verified'
                          : isTh
                          ? 'ยืนยันเวลา Daymark (+8 ชม.)'
                          : 'Confirm Daymark (+8h)'}
                      </Button>
                    </div>

                    {/* Focal Clinician Rows (built with Kit `Row` + `Avatar`) */}
                    <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden bg-white">
                      {/* Row 1: Dr. Thanakorn Srisuwan */}
                      <Row
                        target="row-thanakorn"
                        active={beat === 0 || beat === 1}
                        onClick={() =>
                          setInspectedClinician(
                            resolveClinicianDossier('DM-TH-0842')
                          )
                        }
                        lead={
                          <Avatar
                            initials="TS"
                            size="sm"
                            status="verified"
                            tone="teal"
                            onClick={() =>
                              setInspectedClinician(
                                resolveClinicianDossier('DM-TH-0842')
                              )
                            }
                          />
                        }
                        subtitle={
                          isTh
                            ? 'โรงพยาบาลบำรุงราษฎร์ · อาคาร ICU A · TMC-ว.48291'
                            : 'Bumrungrad International · ICU Tower A · TMC-ว.48291'
                        }
                        trail={
                          <Badge tone={isClockedIn ? 'emerald' : 'amber'}>
                            {isClockedIn
                              ? isTh
                                ? '06:54 · 42m GPS'
                                : '06:54 · 42m GPS'
                              : isTh
                              ? 'รอสแกนใบหน้า'
                              : 'Awaiting Scan'}
                          </Badge>
                        }
                      >
                        {isTh
                          ? 'นพ. ธนกร ศรีสุวรรณ (เวชบำบัดวิกฤต ICU)'
                          : 'Dr. Thanakorn Srisuwan, MD (Critical Care ICU)'}
                      </Row>

                      {/* Row 2: Kittipong Suwan (Daymark Exception Story) */}
                      <Row
                        active={beat >= 2}
                        onClick={() =>
                          setInspectedClinician(
                            resolveClinicianDossier('DM-TH-0419')
                          )
                        }
                        lead={
                          <Avatar
                            initials="KS"
                            size="sm"
                            status={isDaymarkApproved ? 'verified' : 'busy'}
                            tone="amber"
                            onClick={() =>
                              setInspectedClinician(
                                resolveClinicianDossier('DM-TH-0419')
                              )
                            }
                          />
                        }
                        subtitle={
                          isTh
                            ? 'กู้ชีพฉุกเฉิน ECMO Code Blue · ยืนยันโดย พว. นลินี'
                            : 'Emergency ECMO Code Blue · Marked by Nalinee R., RN'
                        }
                        trail={
                          <Badge tone={isDaymarkApproved ? 'teal' : 'amber'}>
                            {isDaymarkApproved
                              ? isTh
                                ? 'Daymark +8.0 ชม.'
                                : 'Daymark +8.0h'
                              : isTh
                              ? 'รออนุมัติ Daymark'
                              : 'Pending Daymark'}
                          </Badge>
                        }
                      >
                        {isTh
                          ? 'กิตติพงศ์ สุวรรณ (ผู้เชี่ยวชาญ ECMO)'
                          : 'Kittipong Suwan (ECMO Perfusionist)'}
                      </Row>

                      {/* Peripheral Filler Rows (`Bar` restraint at the bottom edge) */}
                      <div className="px-4 py-2.5 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-slate-200/80 inline-block" />
                          <div className="space-y-1.5">
                            <Bar w={120} />
                            <Bar w={76} soft />
                          </div>
                        </div>
                        <Bar w={52} soft />
                      </div>
                      <div className="px-4 py-2.5 flex items-center justify-between bg-slate-50/30">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-slate-200/60 inline-block" />
                          <div className="space-y-1.5">
                            <Bar w={98} />
                            <Bar w={64} soft />
                          </div>
                        </div>
                        <Bar w={44} soft />
                      </div>
                    </div>
                  </div>
                </div>
              </Window>
            </div>

            {/* Satellite Object: iPhone `Phone` frame straddling the bottom-left sidebar margin (NEVER covering focal text) */}
            <div className="mt-4 sm:mt-0 sm:absolute sm:left-0 sm:bottom-1 w-[216px] mx-auto sm:mx-0 z-20">
              <Phone
                islandExpanded={true}
                islandSlot={
                  <div className="flex items-center justify-between w-full text-[9px] font-mono text-emerald-400">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>FACE ID</span>
                    </span>
                    <span className="text-teal-300">99%</span>
                  </div>
                }
              >
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-300">
                    <span>BUMRUNGRAD</span>
                    <span className="text-teal-300">42m GPS</span>
                  </div>

                  <div
                    onClick={() =>
                      setInspectedClinician(resolveClinicianDossier('DM-TH-0842'))
                    }
                    className="rounded-xl bg-slate-900/90 border border-teal-500/30 p-2.5 text-center space-y-1 cursor-pointer hover:border-teal-400 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full mx-auto bg-teal-500/20 border border-teal-400 flex items-center justify-center text-teal-300 font-bold text-xs">
                      TS
                    </div>
                    <p className="text-[11px] font-semibold text-white truncate">
                      {isTh ? 'นพ. ธนกร ศรีสุวรรณ' : 'Dr. Thanakorn S.'}
                    </p>
                    <p className="text-[9px] font-mono text-teal-300">
                      LIVENESS 98% · 1:N MATCH
                    </p>
                  </div>

                  <button
                    type="button"
                    data-target="phone-clockin-btn"
                    onClick={() => {
                      setPlaying(false);
                      setBeat((prev) => (prev >= 1 ? 0 : 1));
                    }}
                    className={`w-full py-1.5 px-2.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      isClockedIn
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-teal-600 text-white hover:bg-teal-500'
                    }`}
                  >
                    {isClockedIn
                      ? isTh
                        ? '✓ เข้าเวรแล้ว 06:54'
                        : '✓ Clocked In 06:54'
                      : isTh
                      ? 'แตะเพื่อสแกนเข้าเวร'
                      : 'Tap to Clock-In'}
                  </button>
                </div>
              </Phone>
            </div>

            {/* Animated Stageshow Cursor */}
            <StageshowCursor
              x={cursorPos.x}
              y={cursorPos.y}
              pressed={cursorPressed}
              label={cursorPos.label}
            />
          </div>

          {/* Interactive Partner Hospital Strip — Clicking opens Facility & Geofence Inspector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setIsFacilityModalOpen(true)}
              className="p-3 rounded-xl bg-white border border-slate-200/90 hover:border-teal-700/60 transition-all flex items-center gap-3 text-left cursor-pointer group shadow-2xs"
            >
              <img
                src={heroFacilityImg}
                alt="Partner Hospital Network"
                className="w-14 h-11 rounded-lg object-cover border border-slate-200 shrink-0 group-hover:scale-105 transition-transform"
              />
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-900 block truncate">
                  {isTh
                    ? 'ตรวจสอบพิกัด GPS 4 โรงพยาบาลพันธมิตร'
                    : 'Inspect 4 Partner Hospitals & 250m Geofence'}
                </span>
                <span className="text-[11px] text-slate-500 block truncate">
                  {isTh
                    ? 'คลิกเพื่อดูพิกัดละติจูด/ลองจิจูด และแผนกที่เปิดรับเวร'
                    : 'Click to inspect live Bangkok coordinates & active units'}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                setInspectedClinician(resolveClinicianDossier('DM-TH-0842'))
              }
              className="p-3 rounded-xl bg-white border border-slate-200/90 hover:border-teal-700/60 transition-all flex items-center gap-3 text-left cursor-pointer group shadow-2xs"
            >
              <div className="w-11 h-11 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-900 block truncate">
                  {isTh
                    ? 'ตรวจสอบใบอนุญาตแพทยสภา & สภาการพยาบาล'
                    : 'Medical Council of Thailand (TMC / TNMC)'}
                </span>
                <span className="text-[11px] text-slate-500 block truncate">
                  {isTh
                    ? 'คลิกเพื่อดูตัวอย่างแฟ้มข้อมูลใบประกอบวิชาชีพแพทย์'
                    : 'Click to inspect verified clinician credential dossier'}
                </span>
              </div>
            </button>
          </div>
        </section>
      </main>

      {/* Modals for Avatar & Hospital Facility Image Clicks */}
      <ClinicianDossierModal
        clinician={inspectedClinician}
        locale={locale}
        onClose={() => setInspectedClinician(null)}
      />

      <FacilityInspectorModal
        isOpen={isFacilityModalOpen}
        locale={locale}
        onClose={() => setIsFacilityModalOpen(false)}
      />
    </div>
  );
};
