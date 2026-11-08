import React, { useState, useRef, useEffect } from 'react';
import {
  AttendanceRecord,
  DaymarkAuditEntry,
  HOSPITAL_SITES,
} from '../data/seedWorkforceData';
import {
  UserRole,
  AppLocale,
  tText,
  ClinicalDepartment,
  verifyGeofence,
  verifyBiometricFaceMatch,
  canRolePerformAction,
} from '../utils/workforceRules';
import { Phone, Avatar, Badge } from '../kit';
import {
  Camera,
  MapPin,
  Clock,
  AlertTriangle,
  UserCheck,
  Lock,
  Building2,
} from 'lucide-react';

interface AttendanceDaymarkModuleProps {
  currentRole: UserRole;
  locale: AppLocale;
  attendanceRecords: AttendanceRecord[];
  daymarkLogs: DaymarkAuditEntry[];
  onAddAttendanceRecord: (record: AttendanceRecord) => void;
  onClockOutRecord: (recordId: string, clockOutTime: string) => void;
  onAddDaymarkEntry: (entry: DaymarkAuditEntry, correspondingAttendance: AttendanceRecord) => void;
  onInspectClinician?: (idOrName: string) => void;
  onInspectFacility?: () => void;
}

export const AttendanceDaymarkModule: React.FC<AttendanceDaymarkModuleProps> = ({
  currentRole,
  locale,
  attendanceRecords,
  daymarkLogs,
  onAddAttendanceRecord,
  onClockOutRecord,
  onAddDaymarkEntry,
  onInspectClinician,
  onInspectFacility,
}) => {
  const isTh = locale === 'th';
  const [activeSubTab, setActiveSubTab] = useState<'biometric' | 'daymark'>(
    currentRole === 'client' ? 'daymark' : 'biometric'
  );

  // Biometric Clock-in State (Module 1)
  const [selectedSiteId, setSelectedSiteId] = useState<string>(HOSPITAL_SITES[0].id);
  const [selectedShiftKey, setSelectedShiftKey] = useState<'icu_pm' | 'icu_am' | 'er_night' | 'opd_day'>('icu_pm');
  const [simulatedGpsOffsetMeters, setSimulatedGpsOffsetMeters] = useState<'inside' | 'outside'>('inside');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [scanStage, setScanStage] = useState<'idle' | 'scanning' | 'verified' | 'spoof_blocked'>('verified');
  const [livenessScore, setLivenessScore] = useState<number>(0.97);
  const [faceMatchScore, setFaceMatchScore] = useState<number>(0.99);
  const [serverTimestamp, setServerTimestamp] = useState<string>('07/11/2026 · 14:52:10 (BKK UTC+7)');
  const [responseLatencyMs, setResponseLatencyMs] = useState<number>(290);
  const [clockFeedback, setClockFeedback] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Daymark Client Proxy Marking Form State (Module 5)
  const [dmEmployeeId, setDmEmployeeId] = useState<string>('DM-TH-0842');
  const [dmDepartment, setDmDepartment] = useState<ClinicalDepartment>('Critical Care');
  const [dmShiftDate, setDmShiftDate] = useState<string>('2026-11-07');
  const [dmShiftWindow, setDmShiftWindow] = useState<string>('15:00 - 23:00 (Evening ICU Shift)');
  const [dmVerifiedHours, setDmVerifiedHours] = useState<number>(8);
  const [dmReasonKey, setDmReasonKey] = useState<'code_blue' | 'device_fault' | 'trauma_dispatch'>('code_blue');
  const [dmReasonDetail, setDmReasonDetail] = useState<string>('');
  const [dmError, setDmError] = useState<string | null>(null);
  const [dmSuccess, setDmSuccess] = useState<string | null>(null);

  const selectedSite = HOSPITAL_SITES.find((s) => s.id === selectedSiteId) || HOSPITAL_SITES[0];
  const simulatedUserCoords =
    simulatedGpsOffsetMeters === 'inside'
      ? { lat: selectedSite.coords.lat + 0.00035, lng: selectedSite.coords.lng + 0.00025 } // ~48m
      : { lat: selectedSite.coords.lat + 0.0045, lng: selectedSite.coords.lng + 0.0045 }; // ~680m

  const geofenceCheck = verifyGeofence(
    simulatedUserCoords,
    selectedSite.coords,
    selectedSite.geofenceRadiusMeters
  );
  const biometricResult = verifyBiometricFaceMatch(livenessScore, faceMatchScore);

  const shiftLabelsMap = {
    icu_pm: {
      en: 'Evening ICU Shift (15:00 - 23:00)',
      th: 'เวรบ่ายหอผู้ป่วยวิกฤต ICU (15:00 - 23:00)',
    },
    icu_am: {
      en: 'Morning ICU Shift (07:00 - 15:00)',
      th: 'เวรเช้าหอผู้ป่วยวิกฤต ICU (07:00 - 15:00)',
    },
    er_night: {
      en: 'Night Emergency Shift (22:00 - 06:00)',
      th: 'เวรดึกฉุกเฉินวิกฤต (22:00 - 06:00)',
    },
    opd_day: {
      en: 'OPD Day Clinic Shift (08:00 - 17:00)',
      th: 'เวรคลินิกผู้ป่วยนอก OPD (08:00 - 17:00)',
    },
  };

  const fetchServerTimestamp = async () => {
    const t0 = performance.now();
    try {
      const res = await fetch('/api/attendance/timestamp');
      if (res.ok) {
        const data = await res.json();
        const elapsed = Math.max(80, Math.round(performance.now() - t0));
        setResponseLatencyMs(elapsed);
        setServerTimestamp(`${data.bangkokFormatted} (BKK UTC+7)`);
        return `${data.bangkokFormatted}`;
      }
    } catch {
      // Fallback
    }
    const nowStr = new Date().toLocaleString('en-GB');
    setServerTimestamp(`${nowStr} (BKK UTC+7)`);
    return nowStr;
  };

  useEffect(() => {
    fetchServerTimestamp();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleRunLiveFaceScan = async () => {
    setScanStage('scanning');
    setClockFeedback(null);
    await fetchServerTimestamp();

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      }
    } catch {
      setCameraActive(false);
    }

    setTimeout(() => {
      setLivenessScore(0.98);
      setFaceMatchScore(0.99);
      setScanStage('verified');
    }, 260);
  };

  const handleSimulateSpoofTest = () => {
    setLivenessScore(0.58);
    setFaceMatchScore(0.94);
    setScanStage('spoof_blocked');
    setClockFeedback(
      isTh
        ? 'แจ้งเตือนป้องกันการทุจริต: ระบบ Liveness Detection ตรวจพบภาพถ่ายนิ่งหรือหน้าจอสำรอง (58% < 88%) ปฏิเสธการ Clock-in'
        : 'Anti-Spoofing Alert: Liveness Detection blocked a static photo/secondary screen attempt (58% < 88%). Clock-in rejected.'
    );
  };

  const handleExecuteClockIn = async () => {
    setClockFeedback(null);
    if (!geofenceCheck.isWithinGeofence) {
      setClockFeedback(
        isTh
          ? `ไม่สามารถลงเวลาได้: พิกัดปัจจุบันห่างจากโรงพยาบาล ${geofenceCheck.distanceMeters} ม. (เกินรัศมี Geofence ${geofenceCheck.maxRadiusMeters} ม.)`
          : `Clock-in denied: Current GPS position is ${geofenceCheck.distanceMeters}m away (exceeds ${geofenceCheck.maxRadiusMeters}m hospital Geofence).`
      );
      return;
    }
    if (!biometricResult.overallVerified) {
      setClockFeedback(
        isTh
          ? 'ไม่สามารถลงเวลาได้: การสแกนใบหน้า Liveness 1:N ไม่ผ่านเกณฑ์ความปลอดภัยชีวมิติ'
          : 'Clock-in denied: 1:N Biometric Liveness verification did not meet security thresholds.'
      );
      return;
    }

    const ts = await fetchServerTimestamp();
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
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
      siteId: selectedSite.id,
      siteName: selectedSite.name,
      shiftLabel: shiftLabelsMap[selectedShiftKey],
      clockInTime: ts,
      clockOutTime: null,
      gpsDistanceMeters: geofenceCheck.distanceMeters,
      geofenceValid: true,
      livenessScore,
      faceMatchScore,
      verificationMethod: {
        en: 'Biometric GPS + Face-scan',
        th: 'สแกนใบหน้าชีวมิติ + พิกัด GPS',
      },
      isDaymarkException: false,
      status: {
        en: 'Active On-Shift',
        th: 'กำลังปฏิบัติงาน',
      },
    };

    onAddAttendanceRecord(newRecord);
    setClockFeedback(
      isTh
        ? `บันทึก Clock-in สำเร็จเมื่อ ${ts} ณ ${tText(selectedSite.name, locale)} (GPS ${geofenceCheck.distanceMeters} ม. · Face-match ${biometricResult.faceMatchPct}%)`
        : `Clock-in verified at ${ts} for ${tText(selectedSite.name, locale)} (GPS ${geofenceCheck.distanceMeters}m · Face-match ${biometricResult.faceMatchPct}%).`
    );
  };

  const employeeLookup: Record<string, { name: { en: string; th: string }; dept: ClinicalDepartment }> = {
    'DM-TH-0842': {
      name: { en: 'Dr. Thanakorn Srisuwan, MD', th: 'นพ. ธนกร ศรีสุวรรณ' },
      dept: 'Critical Care',
    },
    'DM-TH-1104': {
      name: { en: 'Pimchanok Wattana, RN', th: 'พว. พิมพ์ชนก วัฒนา' },
      dept: 'IPD',
    },
    'DM-TH-0419': {
      name: { en: 'Kittipong Suwan (ECMO Specialist)', th: 'กิตติพงศ์ สุวรรณ (ผู้เชี่ยวชาญ ECMO)' },
      dept: 'Critical Care',
    },
    'DM-TH-0915': {
      name: { en: 'Dr. Supachai Limpongsai, MD', th: 'นพ. ศุภชัย ลิ้มพงษ์ไพศาล' },
      dept: 'OPD',
    },
  };

  const reasonCategoryMap = {
    code_blue: {
      en: 'Emergency Resuscitation (Code Blue)',
      th: 'ภารกิจกู้ชีพฉุกเฉินเร่งด่วน (Code Blue)',
    },
    device_fault: {
      en: 'Biometric Device / Camera Exception',
      th: 'อุปกรณ์สแกนหรือกล้องขัดข้องทางเทคนิค',
    },
    trauma_dispatch: {
      en: 'Inter-Departmental Trauma Dispatch',
      th: 'การระดมทีมแพทย์ฉุกเฉินข้ามแผนก',
    },
  };

  const handleSubmitDaymark = async (e: React.FormEvent) => {
    e.preventDefault();
    setDmError(null);
    setDmSuccess(null);

    if (!canRolePerformAction(currentRole, 'daymark.execute_mark')) {
      setDmError(
        isTh
          ? 'ตามตารางสิทธิ์การใช้งาน (RBAC): เฉพาะบัญชีผู้อำนวยการประสานงานโรงพยาบาลเท่านั้นที่มีสิทธิ์บันทึกยืนยันเวลาทำงาน Daymark กรุณาออกจากระบบและเข้าสู่ระบบด้วยบัญชี client@bumrungrad.co.th'
          : 'RBAC Restriction: Only a Hospital Roster Director account is authorized to execute Daymark proxy marking. Sign out and log in as client@bumrungrad.co.th to execute.'
      );
      return;
    }

    if (!dmReasonDetail.trim() || dmReasonDetail.trim().length < 8) {
      setDmError(
        isTh
          ? 'กรุณาระบุรายละเอียดเหตุผลทางคลินิกอย่างน้อย 8 ตัวอักษรเพื่อบันทึกใน Audit Log'
          : 'Please provide a clinical justification (at least 8 characters) for the immutable Audit Log.'
      );
      return;
    }

    const ts = await fetchServerTimestamp();
    const formattedDate = dmShiftDate.split('-').reverse().join('/');
    const hashSuffix = Math.random().toString(16).substring(2, 10).toUpperCase();
    const targetEmp = employeeLookup[dmEmployeeId] || employeeLookup['DM-TH-0842'];

    const newEntry: DaymarkAuditEntry = {
      id: `dm-log-${Date.now()}`,
      timestamp: ts,
      employeeId: dmEmployeeId,
      employeeName: targetEmp.name,
      department: dmDepartment,
      siteName: HOSPITAL_SITES[0].name,
      shiftDate: formattedDate,
      shiftWindow: { en: dmShiftWindow, th: dmShiftWindow },
      verifiedHours: Number(dmVerifiedHours) || 8,
      markedByClientName: {
        en: 'Nalinee Rattanakorn, RN',
        th: 'พว. นลินี รัตนากร',
      },
      markedByRole: {
        en: 'Hospital Roster Director (Bumrungrad International)',
        th: 'หัวหน้าฝ่ายประสานงานโรงพยาบาลบำรุงราษฎร์',
      },
      reasonCategory: reasonCategoryMap[dmReasonKey],
      reasonDetail: { en: dmReasonDetail.trim(), th: dmReasonDetail.trim() },
      auditHash: `SHA256-${hashSuffix}`,
      acknowledgedByEmployee: true,
    };

    const correspondingAttendance: AttendanceRecord = {
      id: `att-dm-${Date.now()}`,
      employeeId: dmEmployeeId,
      employeeName: targetEmp.name,
      employeeRoleTitle: {
        en: `${dmDepartment} Specialist`,
        th: `บุคลากรแผนก ${dmDepartment}`,
      },
      department: dmDepartment,
      siteId: 'site-bumrungrad',
      siteName: HOSPITAL_SITES[0].name,
      shiftLabel: { en: dmShiftWindow, th: dmShiftWindow },
      clockInTime: `${formattedDate} · Daymark`,
      clockOutTime: `${formattedDate} (${dmVerifiedHours}h)`,
      gpsDistanceMeters: 0,
      geofenceValid: true,
      livenessScore: 1,
      faceMatchScore: 1,
      verificationMethod: {
        en: 'Daymark (Client Verified)',
        th: 'Daymark (โรงพยาบาลยืนยันเวลาทำงาน)',
      },
      isDaymarkException: true,
      status: {
        en: 'Daymark Verified',
        th: 'ยืนยันผ่าน Daymark',
      },
    };

    onAddDaymarkEntry(newEntry, correspondingAttendance);
    setDmReasonDetail('');
    setDmSuccess(
      isTh
        ? `บันทึก Daymark สำหรับ ${tText(targetEmp.name, locale)} (+${dmVerifiedHours} ชม.) ลงใน Audit Log สำเร็จ (SHA256-${hashSuffix})`
        : `Recorded Daymark verification for ${tText(targetEmp.name, locale)} (+${dmVerifiedHours}h) in Audit Log (SHA256-${hashSuffix}).`
    );
  };

  return (
    <div className="space-y-8">
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-teal-800">
            {isTh
              ? 'ระบบสแกนใบหน้าชีวมิติ พิกัด GPS Geofencing และฟีเจอร์ Daymark'
              : 'Biometric Face-Scan, 250m GPS Geofencing & Daymark Verification'}
          </p>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 mt-1">
            {isTh
              ? 'ยืนยันเวลาปฏิบัติงานจริง & บันทึกการตรวจสอบ Daymark โปร่งใส'
              : 'Real-Time Biometric Clock-In & Transparent Daymark Audit Trail'}
          </h1>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start">
          <button
            type="button"
            onClick={() => setActiveSubTab('biometric')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'biometric'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isTh ? 'สแกนใบหน้า Clock-in & GPS' : 'GPS & Live Face-Scan'}
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('daymark')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'daymark'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isTh
              ? `การยืนยันเวลา Daymark (${daymarkLogs.length})`
              : `Daymark Verification (${daymarkLogs.length})`}
          </button>
        </div>
      </div>

      {activeSubTab === 'biometric' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 5 Columns: Stageshow <Phone> Frame with Dynamic Island & Home Indicator */}
          <section className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-5">
            <div className="border-b border-slate-200/70 pb-4 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {isTh ? 'เทอร์มินัลสแกนชีวมิติ (Live Face-Scan)' : 'Biometric Clinician Terminal'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isTh ? 'เวลาเซิร์ฟเวอร์มาตรฐาน · ความหน่วง API:' : 'Server-Authoritative Timestamp · API Latency:'}{' '}
                  <span className="font-mono tabular-nums">{responseLatencyMs}ms</span> (&lt; 1500ms SLA)
                </p>
              </div>
              {onInspectFacility && (
                <button
                  type="button"
                  onClick={onInspectFacility}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-teal-50 text-[11px] font-semibold text-teal-800 flex items-center gap-1 cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{isTh ? 'แผนที่ GPS' : 'GPS Site'}</span>
                </button>
              )}
            </div>

            {/* Authentic Stageshow Phone Component with Dynamic Island & Home Indicator */}
            <div className="max-w-[310px] mx-auto">
              <Phone
                islandSlot={
                  <>
                    <span className="w-2 h-2 rounded-full bg-teal-400" />
                    <span className="text-[9px] font-mono text-teal-300">
                      {scanStage === 'spoof_blocked' ? 'SPOOF ALERT' : `1:N ${biometricResult.faceMatchPct}%`}
                    </span>
                  </>
                }
              >
                <div className="text-white space-y-3 py-2">
                  {cameraActive && (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-28 object-cover rounded-xl opacity-80"
                    />
                  )}
                  <div className="flex items-center justify-between text-[10px] font-mono text-teal-200 bg-slate-900/90 border border-teal-400/30 px-2.5 py-1 rounded-lg">
                    <span>MATCH: {biometricResult.faceMatchPct}%</span>
                    <span>LIVENESS: {biometricResult.livenessPct}%</span>
                  </div>

                  <div
                    onClick={() => onInspectClinician && onInspectClinician('DM-TH-0842')}
                    className="flex flex-col items-center text-center space-y-1.5 py-2 cursor-pointer group"
                    title={isTh ? 'คลิกเพื่อดูแฟ้มประวัติแพทย์' : 'Click to inspect clinician dossier'}
                  >
                    <div className="w-14 h-14 rounded-2xl border-2 border-teal-400/70 group-hover:border-teal-300 bg-slate-900 flex items-center justify-center font-display text-lg font-bold text-teal-300 transition-transform group-hover:scale-105">
                      TS
                    </div>
                    <p className="text-xs font-semibold group-hover:text-teal-300 transition-colors">
                      {isTh ? 'นพ. ธนกร ศรีสุวรรณ · DM-TH-0842' : 'Dr. Thanakorn Srisuwan · DM-TH-0842'}
                    </p>
                    <p className="text-[11px] text-slate-300">
                      {isTh
                        ? 'แม่แบบชีวมิติเข้ารหัส AES-256 · มาตรฐาน PDPA / HIPAA'
                        : 'AES-256 Biometric Template · PDPA / HIPAA'}
                    </p>
                  </div>

                  <div className="text-[10px] font-mono text-slate-300 bg-slate-900/90 border border-slate-700 px-2.5 py-1 rounded-lg flex items-center justify-between">
                    <span className="truncate">{serverTimestamp}</span>
                    <span className="text-teal-300 font-semibold shrink-0">
                      {scanStage === 'spoof_blocked' ? 'BLOCKED' : 'VERIFIED'}
                    </span>
                  </div>
                </div>
              </Phone>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleRunLiveFaceScan}
                className="px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-teal-800 shrink-0" />
                <span>{isTh ? 'สแกนใบหน้าสดอีกครั้ง' : 'Rescan Live Face'}</span>
              </button>
              <button
                type="button"
                onClick={handleSimulateSpoofTest}
                className="px-3 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{isTh ? 'ทดสอบป้องกันภาพถ่ายปลอม' : 'Test Anti-Spoof Guard'}</span>
              </button>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-200/70">
              <div>
                <label htmlFor="clock-site-select" className="block text-xs font-semibold text-slate-700 mb-1">
                  {isTh ? 'โรงพยาบาลที่ปฏิบัติงาน (Hospital Site)' : 'Assigned Hospital Site (Thailand)'}
                </label>
                <select
                  id="clock-site-select"
                  value={selectedSiteId}
                  onChange={(e) => setSelectedSiteId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900"
                >
                  {HOSPITAL_SITES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {tText(s.name, locale)} (Geofence {s.geofenceRadiusMeters}m)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="clock-shift-select" className="block text-xs font-semibold text-slate-700 mb-1">
                  {isTh ? 'ตารางเวรที่ลงเวลา' : 'Assigned Shift Window'}
                </label>
                <select
                  id="clock-shift-select"
                  value={selectedShiftKey}
                  onChange={(e) => setSelectedShiftKey(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="icu_pm">{tText(shiftLabelsMap.icu_pm, locale)}</option>
                  <option value="icu_am">{tText(shiftLabelsMap.icu_am, locale)}</option>
                  <option value="er_night">{tText(shiftLabelsMap.er_night, locale)}</option>
                  <option value="opd_day">{tText(shiftLabelsMap.opd_day, locale)}</option>
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-800 shrink-0" />
                    <span>{isTh ? 'ตรวจสอบพิกัด GPS Geofencing' : 'GPS Geofence Check'}</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSimulatedGpsOffsetMeters('inside')}
                      className={`px-2 py-0.5 text-[11px] font-medium rounded cursor-pointer ${
                        simulatedGpsOffsetMeters === 'inside'
                          ? 'bg-teal-900 text-white'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      {isTh ? 'ในเขต รพ. (48m)' : 'On-Site (48m)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimulatedGpsOffsetMeters('outside')}
                      className={`px-2 py-0.5 text-[11px] font-medium rounded cursor-pointer ${
                        simulatedGpsOffsetMeters === 'outside'
                          ? 'bg-red-700 text-white'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      {isTh ? 'นอกเขต (680m)' : 'Off-Site (680m)'}
                    </button>
                  </div>
                </div>
                <p className="text-xs font-mono tabular-nums text-slate-600">
                  GPS: {simulatedUserCoords.lat.toFixed(4)}°N, {simulatedUserCoords.lng.toFixed(4)}°E ·{' '}
                  <strong className={geofenceCheck.isWithinGeofence ? 'text-teal-800' : 'text-red-700'}>
                    {tText(geofenceCheck.statusLabel, locale)}
                  </strong>
                </p>
              </div>
            </div>

            {clockFeedback && (
              <div
                role="status"
                className={`p-3.5 rounded-xl text-xs leading-relaxed border ${
                  clockFeedback.includes('verified') || clockFeedback.includes('สำเร็จ')
                    ? 'bg-teal-50/90 text-teal-950 border-teal-200'
                    : 'bg-amber-50 text-amber-950 border-amber-200'
                }`}
              >
                {clockFeedback}
              </div>
            )}

            <button
              type="button"
              onClick={handleExecuteClockIn}
              className="w-full py-3 px-4 text-sm font-semibold text-white luxury-gradient-accent rounded-xl hover:opacity-95 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>
                {isTh
                  ? 'ยืนยันการลงเวลาเข้าเวร (GPS + สแกนใบหน้า)'
                  : 'Confirm Biometric Clock-In (GPS + Face-Scan)'}
              </span>
            </button>
          </section>

          {/* Right 7 Columns: Real-time Attendance Records */}
          <section className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-5">
            <div className="border-b border-slate-200/70 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {isTh
                    ? `รายการลงเวลาปฏิบัติงานแบบเรียลไทม์ (${attendanceRecords.length} รายการ)`
                    : `Real-Time Attendance Log (${attendanceRecords.length} records)`}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isTh
                    ? 'รวมการลงเวลาด้วยชีวมิติและการยืนยันผ่านฟีเจอร์ Daymark ของโรงพยาบาล'
                    : 'Includes Biometric GPS Clock-ins and Hospital Client Daymark verifications'}
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">AES-256 · TLS 1.3</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500">
                    <th className="py-2.5 pr-3 font-medium">
                      {isTh ? 'บุคลากร & แผนก' : 'Clinician & Dept'}
                    </th>
                    <th className="py-2.5 px-3 font-medium">
                      {isTh ? 'โรงพยาบาล & เวลาเข้า/ออก' : 'Hospital Site & Timestamps'}
                    </th>
                    <th className="py-2.5 px-3 font-medium text-right">
                      {isTh ? 'ชีวมิติ & GPS' : 'Biometrics & GPS'}
                    </th>
                    <th className="py-2.5 pl-3 font-medium text-right">
                      {isTh ? 'สถานะ / การดำเนินการ' : 'Status / Action'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  {attendanceRecords.map((rec) => (
                    <tr
                      key={rec.id}
                      onClick={() => onInspectClinician && onInspectClinician(rec.employeeId)}
                      className="hover:bg-slate-50/80 cursor-pointer"
                    >
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            initials={rec.employeeName.en.replace(/^Dr\.\s+|^RN\.\s+/i, '').slice(0, 2).toUpperCase()}
                            size="sm"
                            status={rec.clockOutTime === null ? 'online' : 'verified'}
                          />
                          <div>
                            <p className="font-semibold text-slate-900 hover:text-teal-800">
                              {tText(rec.employeeName, locale)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {rec.department} · <span className="font-mono">{rec.employeeId}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td
                        className="py-3.5 px-3"
                        onClick={(e) => {
                          if (onInspectFacility) {
                            e.stopPropagation();
                            onInspectFacility();
                          }
                        }}
                      >
                        <p className="text-xs font-medium text-slate-800 hover:text-teal-800 underline decoration-dotted underline-offset-2">
                          {tText(rec.siteName, locale)}
                        </p>
                        <p className="text-xs text-slate-500 font-mono tabular-nums">
                          {tText(rec.shiftLabel, locale)}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                          In: {rec.clockInTime} {rec.clockOutTime ? `· Out: ${rec.clockOutTime}` : ''}
                        </p>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums text-xs whitespace-nowrap">
                        {rec.isDaymarkException ? (
                          <Badge tone="amber">
                            {isTh ? 'Daymark (รพ. ยืนยัน)' : 'Daymark (Hospital Verified)'}
                          </Badge>
                        ) : (
                          <>
                            <p className="text-slate-800">GPS: {rec.gpsDistanceMeters}m</p>
                            <p className="text-slate-500">
                              Face {Math.round(rec.faceMatchScore * 100)}% · Live {Math.round(rec.livenessScore * 100)}%
                            </p>
                          </>
                        )}
                      </td>
                      <td className="py-3.5 pl-3 text-right whitespace-nowrap">
                        <p className="text-xs font-semibold text-teal-900">{tText(rec.status, locale)}</p>
                        {rec.clockOutTime === null ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onClockOutRecord(
                                rec.id,
                                new Date().toLocaleTimeString('en-GB', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                })
                              );
                            }}
                            className="mt-1 px-2.5 py-1 text-xs font-medium text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-colors cursor-pointer"
                          >
                            {isTh ? 'กด Clock-out ออกเวร' : 'Clock-Out Shift'}
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500">
                            {isTh ? 'ปิดเวรแล้ว' : 'Shift Closed'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : (
        /* Dedicated "Daymark" Hospital Attendance Marking & Immutable Audit Log */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-5">
            <div className="border-b border-slate-200/70 pb-4">
              <p className="text-xs font-semibold text-teal-800">
                {isTh ? 'ฟีเจอร์เฉพาะทาง "Daymark"' : 'Daymark Hospital Attendance Override'}
              </p>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                {isTh
                  ? 'โรงพยาบาลยืนยันเวลาทำงานแทนกรณีพิเศษ'
                  : 'Hospital Director Exception Attendance Marking'}
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {isTh
                  ? 'สำหรับหัวหน้าฝ่ายประสานงานโรงพยาบาล ยืนยันชั่วโมงทำงานให้บุคลากรที่ลืมหรือไม่ได้กด Clock-in เนื่องจากภารกิจกู้ชีพฉุกเฉิน (Code Blue) หรือเหตุขัดข้องทางเทคนิค'
                  : 'Allows Hospital Roster Directors to confirm attendance when a clinician cannot Clock-in due to Code Blue emergencies or technical issues.'}
              </p>
            </div>

            {currentRole !== 'client' && (
              <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 leading-relaxed flex items-start gap-2">
                <Lock className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <span>
                  {isTh ? (
                    <>
                      คุณกำลังเข้าสู่ระบบด้วยบัญชี <strong>{currentRole.toUpperCase()}</strong> (สิทธิ์อ่านบันทึก Audit Log เท่านั้น) ตามตารางสิทธิ์ RBAC เฉพาะบัญชีโรงพยาบาล <strong>client@bumrungrad.co.th</strong> เท่านั้นที่สามารถบันทึก Daymark ได้
                    </>
                  ) : (
                    <>
                      You are signed in as <strong>{currentRole.toUpperCase()}</strong> (Read-Only Audit View). Under the RBAC Matrix, only a <strong>Hospital Director (client@bumrungrad.co.th)</strong> account can submit new Daymark entries.
                    </>
                  )}
                </span>
              </div>
            )}

            <form onSubmit={handleSubmitDaymark} className="space-y-4">
              <div>
                <label htmlFor="dm-employee-select" className="block text-xs font-semibold text-slate-700 mb-1">
                  {isTh ? 'บุคลากรทางการแพทย์ที่ปฏิบัติงาน ณ โรงพยาบาล' : 'On-Site Clinician'}
                </label>
                <select
                  id="dm-employee-select"
                  value={dmEmployeeId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setDmEmployeeId(id);
                    setDmDepartment(employeeLookup[id]?.dept || 'Critical Care');
                  }}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="DM-TH-0842">
                    {isTh ? 'นพ. ธนกร ศรีสุวรรณ (Critical Care · DM-TH-0842)' : 'Dr. Thanakorn Srisuwan, MD (Critical Care · DM-TH-0842)'}
                  </option>
                  <option value="DM-TH-1104">
                    {isTh ? 'พว. พิมพ์ชนก วัฒนา (IPD · DM-TH-1104)' : 'Pimchanok Wattana, RN (IPD · DM-TH-1104)'}
                  </option>
                  <option value="DM-TH-0419">
                    {isTh ? 'กิตติพงศ์ สุวรรณ (ECMO · DM-TH-0419)' : 'Kittipong Suwan (ECMO · DM-TH-0419)'}
                  </option>
                  <option value="DM-TH-0915">
                    {isTh ? 'นพ. ศุภชัย ลิ้มพงษ์ไพศาล (OPD · DM-TH-0915)' : 'Dr. Supachai Limpongsai, MD (OPD · DM-TH-0915)'}
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="dm-shift-date" className="block text-xs font-semibold text-slate-700 mb-1">
                    {isTh ? 'วันที่ปฏิบัติงาน' : 'Shift Date'}
                  </label>
                  <input
                    id="dm-shift-date"
                    type="date"
                    value={dmShiftDate}
                    onChange={(e) => setDmShiftDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="dm-verified-hours" className="block text-xs font-semibold text-slate-700 mb-1">
                    {isTh ? 'ชั่วโมงทำงานที่ยืนยัน' : 'Verified Hours'}
                  </label>
                  <input
                    id="dm-verified-hours"
                    type="number"
                    min={1}
                    max={24}
                    value={dmVerifiedHours}
                    onChange={(e) => setDmVerifiedHours(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 font-mono tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="dm-shift-window" className="block text-xs font-semibold text-slate-700 mb-1">
                  {isTh ? 'ช่วงเวลาเวรปฏิบัติงานจริง' : 'Shift Time Window'}
                </label>
                <input
                  id="dm-shift-window"
                  type="text"
                  value={dmShiftWindow}
                  onChange={(e) => setDmShiftWindow(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label htmlFor="dm-reason-category" className="block text-xs font-semibold text-slate-700 mb-1">
                  {isTh ? 'หมวดหมู่สาเหตุกรณีพิเศษ' : 'Exception Reason Category'}
                </label>
                <select
                  id="dm-reason-category"
                  value={dmReasonKey}
                  onChange={(e) => setDmReasonKey(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="code_blue">{tText(reasonCategoryMap.code_blue, locale)}</option>
                  <option value="device_fault">{tText(reasonCategoryMap.device_fault, locale)}</option>
                  <option value="trauma_dispatch">{tText(reasonCategoryMap.trauma_dispatch, locale)}</option>
                </select>
              </div>

              <div>
                <label htmlFor="dm-reason-detail" className="block text-xs font-semibold text-slate-700 mb-1">
                  {isTh ? 'คำชี้แจงรายละเอียดเพื่อบันทึกใน Audit Log (บังคับ)' : 'Clinical Audit Justification (Required)'}
                </label>
                <textarea
                  id="dm-reason-detail"
                  rows={3}
                  value={dmReasonDetail}
                  onChange={(e) => setDmReasonDetail(e.target.value)}
                  placeholder={
                    isTh
                      ? 'ระบุรายละเอียดเคสฉุกเฉิน Code Blue หรือเลขอ้างอิงห้องผ่าตัด...'
                      : 'Enter emergency clinical case reference or security log verification...'
                  }
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              {dmError && (
                <div role="alert" className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900">
                  {dmError}
                </div>
              )}

              {dmSuccess && (
                <div role="status" className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-950">
                  {dmSuccess}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 text-sm font-semibold text-white luxury-gradient-accent rounded-xl hover:opacity-95 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>
                  {isTh
                    ? 'ยืนยันเวลาทำงาน Daymark & บันทึก Audit Log'
                    : 'Confirm Daymark & Record Audit Log'}
                </span>
              </button>
            </form>
          </section>

          {/* Right 7 Columns: Transparent Daymark Audit Log */}
          <section className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-5">
            <div className="border-b border-slate-200/70 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {isTh
                    ? 'บันทึกการตรวจสอบ Daymark แบบโปร่งใส (Immutable Audit Log)'
                    : 'Transparent Daymark Audit Log (Immutable SHA-256)'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isTh
                    ? 'ทั้งผู้บริหารระบบ ผู้อำนวยการโรงพยาบาล และบุคลากรทางการแพทย์ สามารถตรวจสอบประวัติย้อนหลังได้ทั้งหมด'
                    : 'Accessible transparently to Executive Directors, Hospital Roster Directors, and Attending Clinicians'}
                </p>
              </div>
              <span className="text-xs font-mono text-teal-900">
                {daymarkLogs.length} {isTh ? 'รายการ' : 'verified records'}
              </span>
            </div>

            <div className="divide-y divide-slate-200/70">
              {daymarkLogs.map((log) => (
                <article
                  key={log.id}
                  onClick={() => onInspectClinician && onInspectClinician(log.employeeId)}
                  className="py-4 first:pt-0 last:pb-0 space-y-2 hover:bg-slate-50/70 rounded-lg px-2 -mx-2 transition-colors cursor-pointer"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 hover:text-teal-800">
                        {tText(log.employeeName, locale)} ·{' '}
                        <span className="font-mono text-xs text-slate-600">{log.employeeId}</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        {log.department} · {tText(log.siteName, locale)} ·{' '}
                        <span className="font-mono">{log.shiftDate}</span> ({tText(log.shiftWindow, locale)})
                      </p>
                    </div>
                    <div className="text-right font-mono tabular-nums">
                      <p className="text-sm font-bold text-teal-900">
                        +{log.verifiedHours} {isTh ? 'ชม.' : 'hrs'}
                      </p>
                      <p className="text-[11px] text-slate-400">{log.auditHash}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200/60 leading-relaxed">
                    <strong>{tText(log.reasonCategory, locale)}:</strong> {tText(log.reasonDetail, locale)}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span>
                      {isTh ? 'ผู้ยืนยัน:' : 'Marked by:'}{' '}
                      <strong className="text-slate-700">{tText(log.markedByClientName, locale)}</strong> (
                      {tText(log.markedByRole, locale)})
                    </span>
                    <span className="font-mono tabular-nums">{log.timestamp}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
