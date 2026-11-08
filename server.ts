import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const DAYMARK_THAILAND_RAG_KNOWLEDGE_BASE = `
DAYMARK HEALTHCARE WORKFORCE MANAGEMENT (THAILAND) — INTERNAL RAG KNOWLEDGE BASE (EN & TH):
1. Biometric Attendance & GPS Geofencing:
   - Clinicians (Physicians, Registered Nurses, ECMO/ICU Specialists) assigned to partner hospitals in Thailand (Bumrungrad International Hospital, Bangkok Hospital Headquarters BDMS, Samitivej Sukhumvit Hospital, Siriraj Piyamaharajkarun Hospital SiPH) must Clock-in within <= 250m GPS Geofence of the hospital facility.
   - Live Face-scan requires Liveness Detection >= 88% and 1:N Biometric Face Matching >= 92% with Server-Authoritative Timestamp (UTC+7 Bangkok Time).

2. "Daymark" Exception Attendance Verification:
   - Exclusively executed by the Hospital Operations Director (e.g., Nalinee Rattanakorn, RN at Bumrungrad) when a clinician cannot perform mobile Clock-in due to an immediate Code Blue resuscitation, emergency OR cannulation, or indoor sub-basement GPS shielding.
   - Every Daymark action logs an immutable SHA-256 audit record (who marked it, hospital site, verified hours, clinical reason) visible transparently to Executive Governance, Hospital Operations, and Clinicians.

3. Shift Scheduling & 2-Tier Leave Approval:
   - Departments covered: Critical Care (ICU/ER), IPD (Inpatient Ward), and OPD (Outpatient Clinic).
   - Leave requests follow a 2-tier workflow: Hospital Operations Director approves on-site shift replacement coverage -> Executive Director approves final leave balance deduction.

4. Clinical Academy, Online Quiz, DISC & Bi-Weekly Evaluation:
   - Clinicians complete orientation for Critical Care (ACLS / ARDS Ventilation), IPD (JCI 6 Patient Safety Goals & SBAR), and OPD (Triage Red Flags & Thailand PDPA compliance) with >= 80% quiz pass threshold.
   - DISC behavioral profiling recommends optimal shift placement (D-C for Critical Care ICU, S-C for IPD Inpatient, I-S for OPD Outpatient).
   - Bi-weekly evaluation tracks clinical competency, punctuality, patient satisfaction, and THB revenue contribution.

5. Automated THB Payroll & Encrypted E-Payslip:
   - Gross Pay (THB ฿) = Regular Hours + Daymark Verified Hours + Overtime Hours (1.5x hourly rate) + Specialty Shift Allowance (Critical Care: ฿1,500/shift, IPD: ฿900/shift, OPD: ฿600/shift) + Bi-weekly KPI Bonus.
   - Thai Social Security & Withholding Tax estimate: 10.5%.
   - Encrypted AES-256 PDF E-Payslips are dispatched via verified email on the 5th and 20th of each month.
`;

function buildBilingualRagFallback(
  query: string,
  locale: 'en' | 'th'
): {
  reply: string;
  citations: string[];
  suggestEscalation: boolean;
} {
  const q = query.toLowerCase();
  const isTh = locale === 'th';

  if (
    q.includes('daymark') ||
    q.includes('code blue') ||
    q.includes('proxy') ||
    q.includes('ยืนยันเวลา') ||
    q.includes('ฉุกเฉิน')
  ) {
    return {
      reply: isTh
        ? 'ตามระเบียบการยืนยันเวลา Daymark: เมื่อแพทย์หรือพยาบาลไม่สามารถสแกนใบหน้าเข้าเวรได้ทันเนื่องจากภารกิจกู้ชีพฉุกเฉิน (Code Blue) หรือเหตุขัดข้องทางเทคนิค หัวหน้าฝ่ายประสานงานโรงพยาบาลพันธมิตร (เช่น โรงพยาบาลบำรุงราษฎร์) เป็นผู้มีสิทธิ์เดียวในการบันทึกยืนยันเวลาทำงานแทน พร้อมระบุเหตุผลลงในบันทึก Audit Log ที่ตรวจสอบได้โปร่งใส'
        : 'Under Daymark Protocol: When a clinician misses mobile Clock-in due to an emergency resuscitation (Code Blue) or technical exception, only the Partner Hospital Roster Director (e.g., Bumrungrad Operations) can execute a Daymark attendance entry. Every entry is hashed with SHA-256 into the immutable Audit Log.',
      citations: isTh
        ? ['ระเบียบปฏิบัติการยืนยันเวลา Daymark และ Audit Log', 'ตารางสิทธิ์การใช้งานตามบทบาทวิชาชีพ']
        : ['Daymark Clinical Exception Protocol & Audit Log', 'Enterprise Role Permission Matrix'],
      suggestEscalation: false,
    };
  }

  if (
    q.includes('payroll') ||
    q.includes('payslip') ||
    q.includes('overtime') ||
    q.includes('thb') ||
    q.includes('salary') ||
    q.includes('เงินเดือน') ||
    q.includes('สลิป') ||
    q.includes('ค่าเวร')
  ) {
    return {
      reply: isTh
        ? 'ตามนโยบายการคำนวณค่าตอบแทนอัตโนมัติ: รายได้รวม (บาท THB) คำนวณจาก ชั่วโมงทำงานปกติ + ชั่วโมงที่ยืนยันผ่าน Daymark + ชั่วโมงล่วงเวลา Overtime (1.5 เท่า) + ค่าตอบแทนเฉพาะทางต่อเวร (Critical Care ฿1,500, IPD ฿900, OPD ฿600) + โบนัส KPI รายปักษ์ หักประกันสังคมและภาษี ณ ที่จ่าย 10.5% และจัดส่ง E-Payslip เข้ารหัส PDF ทางอีเมล'
        : 'Under Automated THB Compensation Policy: Gross pay (฿ THB) combines Regular Hours + Daymark Verified Hours + Overtime (1.5x rate) + Specialty Shift Allowance (Critical Care: ฿1,500/shift, IPD: ฿900/shift, OPD: ฿600/shift) + Bi-weekly KPI Bonus, minus 10.5% Thai Social Security & Withholding Tax. AES-256 PDF E-Payslips are emailed automatically.',
      citations: isTh
        ? ['ระเบียบการคำนวณค่าตอบแทนอัตโนมัติและสลิปอิเล็กทรอนิกส์ E-Payslip']
        : ['Automated THB Compensation & Encrypted E-Payslip Policy'],
      suggestEscalation: false,
    };
  }

  if (
    q.includes('gps') ||
    q.includes('geofence') ||
    q.includes('face') ||
    q.includes('liveness') ||
    q.includes('สแกนใบหน้า') ||
    q.includes('พิกัด')
  ) {
    return {
      reply: isTh
        ? 'ตามมาตรฐานการลงเวลาชีวมิติ: บุคลากรต้องกด Clock-in ภายในรัศมี GPS Geofence ไม่เกิน 250 เมตรจากพิกัดโรงพยาบาล (เช่น โรงพยาบาลบำรุงราษฎร์ หรือ BDMS) พร้อมสแกนใบหน้าสด (Live Face-scan) ที่ผ่านเกณฑ์ Liveness >= 88% และ 1:N Face Match >= 92% โดยอ้างอิงเวลาจริงจากเซิร์ฟเวอร์ (UTC+7)'
        : 'Under Biometric Attendance Standards: Clinicians must Clock-in within a 250m GPS Geofence of the assigned Thai hospital site (e.g., Bumrungrad International or Bangkok Hospital BDMS) and complete a Live Face-scan passing Liveness >= 88% and 1:N Face Match >= 92% using server-authoritative UTC+7 timestamps.',
      citations: isTh
        ? ['มาตรฐานพิกัด GPS Geofencing และ Live Face-scan']
        : ['Real-time GPS Geofencing & Live Face-scan Standard'],
      suggestEscalation: false,
    };
  }

  return {
    reply: isTh
      ? 'ศูนย์ช่วยเหลือทางการแพทย์ Daymark พร้อมดูแลท่าน: ระบบรองรับการสแกนใบหน้าพร้อมพิกัด GPS ณ โรงพยาบาลพันธมิตรในไทย, ฟีเจอร์ Daymark สำหรับโรงพยาบาลยืนยันเวลาทำงานแทน, การจัดเวรและอนุมัติใบลา 2 ระดับ, สัญญาอิเล็กทรอนิกส์ E-Signature, การอบรม OPD/IPD/ICU & DISC และการคำนวณเงินเดือน THB พร้อม E-Payslip'
      : 'Daymark Clinical Concierge checked the Thailand Healthcare Knowledge Base: Each login account is strictly bound to its clinical role. We support 250m GPS + Live Face-scan, Hospital Daymark verification, 2-tier leave approvals, E-Signature contracts, OPD/IPD/ICU training + DISC, and automated THB E-Payslips.',
    citations: isTh
      ? ['คู่มือปฏิบัติงานบุคลากรทางการแพทย์ Daymark Thailand']
      : ['Daymark Thailand — Clinical Workforce Operations Manual'],
    suggestEscalation: false,
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get('/api/attendance/timestamp', (_req, res) => {
    const now = new Date();
    res.json({
      isoTimestamp: now.toISOString(),
      epochMs: now.getTime(),
      bangkokFormatted: now.toLocaleString('en-GB', { timeZone: 'Asia/Bangkok' }),
      serverVerified: true,
      maxLatencySlaMs: 1500,
    });
  });

  app.post('/api/support/chat', async (req, res) => {
    const { message, role, userName, locale = 'en' } = req.body || {};
    const safeLocale: 'en' | 'th' = locale === 'th' ? 'th' : 'en';
    if (!message || typeof message !== 'string') {
      res.status(400).json({
        error: safeLocale === 'th' ? 'กรุณาระบุคำถามของท่าน' : 'Please enter a question.',
      });
      return;
    }

    const fallback = buildBilingualRagFallback(message, safeLocale);
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.json({
        reply: fallback.reply,
        citations: fallback.citations,
        suggestEscalation: fallback.suggestEscalation,
        source: 'rag-knowledge-engine',
      });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const langInstruction =
        safeLocale === 'th'
          ? 'Respond in polite, natural Thai (ภาษาไทย) in 3-4 concise sentences.'
          : 'Respond in clear, professional English in 3-4 concise sentences.';

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Authenticated User: ${userName || 'Clinician'} (Role: ${role || 'employee'}).\nQuestion: ${message}`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction: `You are the Daymark Thailand Healthcare Workforce RAG Assistant.
${langInstruction}
Base your answer strictly on the internal knowledge base below:
${DAYMARK_THAILAND_RAG_KNOWLEDGE_BASE}`,
        },
      });

      const replyText = response.text?.trim() || fallback.reply;
      res.json({
        reply: replyText,
        citations: fallback.citations,
        suggestEscalation: fallback.suggestEscalation,
        source: 'gemini-rag',
      });
    } catch {
      res.json({
        reply: fallback.reply,
        citations: fallback.citations,
        suggestEscalation: fallback.suggestEscalation,
        source: 'rag-knowledge-engine',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Daymark server running on http://localhost:${PORT}`);
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://0.0.0.0:${PORT}/`);
  });
}

startServer();
