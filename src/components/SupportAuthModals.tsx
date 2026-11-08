import React, { useState } from 'react';
import {
  Send,
  Headphones,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  Mail,
  X,
  UserCheck,
  AlertTriangle,
  LogOut,
} from 'lucide-react';
import { UserRole, AppLocale, tText } from '../utils/workforceRules';
import { ROLE_PROFILES, SystemAuditLog } from '../data/seedWorkforceData';
import { Window } from '../stageshow/kit';

interface SupportChatbotProps {
  currentRole: UserRole;
  locale: AppLocale;
  onAddAuditLog: (log: SystemAuditLog) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'human_admin';
  text: string;
  timestamp: string;
  sourceMode?: string;
}

export const SupportChatbotModule: React.FC<SupportChatbotProps> = ({
  currentRole,
  locale,
  onAddAuditLog,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'MSG-INIT',
      sender: 'assistant',
      text:
        locale === 'th'
          ? 'สวัสดีครับ ศูนย์ช่วยเหลือบุคลากรทางการแพทย์ Daymark (ประเทศไทย) พร้อมให้บริการ คุณสามารถสอบถามเรื่องการสแกนใบหน้า + พิกัด GPS, การยืนยันเวลา Daymark โดยโรงพยาบาล, โควต้าการลา หรือการคำนวณสลิปเงินเดือน THB ได้ทันทีครับ'
          : 'Welcome to Daymark Thailand Clinical Concierge Desk (RAG). Ask about GPS + Liveness Face-Scan attendance, Hospital Director Daymark verification, shift handover rules, or THB E-Payslip calculations.',
      timestamp: '08:00',
      sourceMode: 'rag_knowledge_base',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [escalatedTicketId, setEscalatedTicketId] = useState<string | null>(null);

  const quickPrompts =
    locale === 'th'
      ? [
          'ลืมสแกนใบหน้าเข้าเวรที่ รพ.บำรุงราษฎร์ ต้องขอ Daymark อย่างไร?',
          'สูตรคำนวณเงินเดือน THB ค่าเวรดึก 1.35x และ OT 1.5x คิดอย่างไร?',
          'ขั้นตอนการยื่นใบลาและให้แพทย์ท่านอื่นรับเวรแทน (Handover)',
          'รหัส PIN สำหรับเปิดดูสลิปเงินเดือนอิเล็กทรอนิกส์ (E-Payslip)',
        ]
      : [
          'How does Hospital Director Daymark override work at Bumrungrad Hospital?',
          'How are THB Night On-Call (1.35x) and Overtime (1.5x) calculated?',
          'What is the 2-step clinical leave and shift handover approval process?',
          'How do I unlock my encrypted E-Payslip and view Thai WHT/SSO?',
        ];

  const handleSendQuestion = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `MSG-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          role: currentRole,
          locale,
        }),
      });
      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `MSG-${Date.now() + 1}`,
        sender: 'assistant',
        text:
          data.reply ||
          (locale === 'th'
            ? 'ระบบฐานความรู้ Daymark ได้รับคำถามของคุณแล้ว'
            : 'Daymark RAG processed your clinical policy inquiry.'),
        timestamp: new Date().toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        sourceMode: data.source || 'rag_fallback',
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `MSG-${Date.now() + 2}`,
          sender: 'assistant',
          text:
            locale === 'th'
              ? 'คำแนะนำมาตรฐาน Daymark: กรณีสแกนใบหน้าไม่สำเร็จ ผู้อำนวยการประสานงานโรงพยาบาลสามารถกดยืนยันเวลาทำงานผ่านฟีเจอร์ Daymark ได้ทันที'
              : 'Daymark Standard Policy: If biometric clock-in fails, the Hospital Roster Director can verify your hours via the Daymark module.',
          timestamp: new Date().toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          sourceMode: 'offline_rag',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEscalateToHumanAdmin = () => {
    const ticketId = `TKT-TH-${Math.floor(1000 + Math.random() * 8999)}`;
    setEscalatedTicketId(ticketId);

    const profile = ROLE_PROFILES[currentRole];
    onAddAuditLog({
      id: `aud-${Math.floor(100 + Math.random() * 899)}`,
      timestamp: '07/11/2026 · 11:20:00',
      actorName: profile.fullName,
      actorRole: currentRole,
      moduleName: {
        en: 'Clinical Concierge & Escalation',
        th: 'ศูนย์ช่วยเหลือและส่งต่อเจ้าหน้าที่บริหารระบบ',
      },
      actionSummary: {
        en: `Escalated clinical support thread to Executive Operations Officer (${ticketId}).`,
        th: `ส่งต่อคำร้องไปยังเจ้าหน้าที่บริหารระบบ (Executive Escalation: ${ticketId})`,
      },
      securityHash: 'SHA256-ESC901',
    });

    setMessages((prev) => [
      ...prev,
      {
        id: `MSG-ESC-${Date.now()}`,
        sender: 'human_admin',
        text:
          locale === 'th'
            ? `[รับเรื่องโดยเจ้าหน้าที่ Admin — หมายเลขคำร้อง #${ticketId}] นพ. จักรกฤษณ์ เจริญสุข (ผู้อำนวยการฝ่ายการแพทย์) ได้รับข้อมูลของคุณแล้ว และกำลังตรวจสอบบันทึกเวลา Daymark / ตารางเวรให้ทันทีครับ`
            : `[Assigned to Human Admin Officer — Ticket #${ticketId}] Dr. Chakrit Charoensuk's Operations Desk has joined the thread and is reviewing your hospital shift & Daymark records.`,
        timestamp: new Date().toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left: Chat Window (8 cols) */}
      <div className="lg:col-span-8">
        <Window
          title={
            locale === 'th'
              ? 'daymark.co.th/support — ระบบช่วยเหลือนโยบายการแพทย์อัจฉริยะ (RAG + Human Escalation)'
              : 'daymark.co.th/support — Clinical Policy RAG Assistant & Human Admin Escalation'
          }
          url="https://app.daymark.co.th/support"
        >
          <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {locale === 'th'
                  ? 'ศูนย์ช่วยเหลือบุคลากรทางการแพทย์ Daymark (RAG Knowledge Base)'
                  : 'Daymark Healthcare Policy Assistant & Live Escalation'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {locale === 'th'
                  ? 'ตอบคำถามจากคู่มือปฏิบัติงาน รพ.บำรุงราษฎร์ / BDMS / สมิติเวช / ศิริราช ปิยมหาราชการุณย์'
                  : 'Grounded in Thailand Hospital SOPs (Bumrungrad, BDMS, Samitivej, SiPH)'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleEscalateToHumanAdmin}
              className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Headphones className="w-3.5 h-3.5" />
              {locale === 'th'
                ? 'ติดต่อเจ้าหน้าที่ Admin (Human Escalation)'
                : 'Escalate to Human Admin'}
            </button>
          </div>

          {/* Messages */}
          <div className="p-5 space-y-4 max-h-96 overflow-y-auto bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${
                  m.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xl rounded-xl p-4 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-teal-700 text-white'
                      : m.sender === 'human_admin'
                      ? 'bg-amber-50 border border-amber-300 text-amber-950'
                      : 'bg-white border border-slate-200/90 text-slate-800 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1 text-[10px] opacity-75 font-mono">
                    <span>
                      {m.sender === 'user'
                        ? locale === 'th'
                          ? 'คุณ (ผู้ใช้งาน)'
                          : 'You'
                        : m.sender === 'human_admin'
                        ? 'HUMAN ADMIN OFFICER'
                        : 'DAYMARK RAG DESK'}
                    </span>
                    <span>{m.timestamp}</span>
                  </div>
                  <div className="whitespace-pre-line">{m.text}</div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-xs text-slate-500 font-mono animate-pulse">
                {locale === 'th'
                  ? 'กำลังค้นหาคำตอบจากฐานข้อมูลระเบียบการแพทย์ Daymark...'
                  : 'Querying Daymark Thailand Healthcare RAG knowledge base...'}
              </div>
            )}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuestion(inputQuery);
            }}
            className="p-4 bg-white border-t border-slate-200 flex items-center gap-2.5"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                locale === 'th'
                  ? 'พิมพ์คำถามเกี่ยวกับการสแกนใบหน้า, Daymark, วันลา หรือเงินเดือน THB...'
                  : 'Ask about biometric clock-in, Daymark verification, shift handover, or THB payroll...'
              }
              className="flex-1 px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              {locale === 'th' ? 'ส่งข้อความ' : 'Send'}
            </button>
          </form>
        </Window>
      </div>

      {/* Right: Quick FAQ Prompts & Ticket Status (4 cols) */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {locale === 'th'
              ? 'คำถามที่พบบ่อยในโรงพยาบาลพันธมิตร'
              : 'Frequent Hospital Policy Questions'}
          </h4>
          <div className="space-y-2">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendQuestion(q)}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-teal-600 hover:bg-teal-50/40 text-xs text-slate-700 font-medium transition-all cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {escalatedTicketId && (
          <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                {locale === 'th'
                  ? `เปิดคำร้องด่วน #${escalatedTicketId} แล้ว`
                  : `Priority Ticket #${escalatedTicketId} Active`}
              </span>
            </div>
            <p className="text-xs text-emerald-800">
              {locale === 'th'
                ? 'เจ้าหน้าที่บริหารระบบได้รับประวัติการสนทนาและบันทึกใน Audit Trail เรียบร้อยแล้ว'
                : 'Human Admin Officer has received the transcript and logged the escalation in the Audit Trail.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface AccountSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  locale: AppLocale;
  onSignOut: () => void;
}

export const AccountSecurityModal: React.FC<AccountSecurityModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  locale,
  onSignOut,
}) => {
  const [totpCode, setTotpCode] = useState('482910');
  const [totpVerified, setTotpVerified] = useState(true);

  if (!isOpen) return null;

  const activeProfile = ROLE_PROFILES[currentRole];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="text-sm font-bold">
                {locale === 'th'
                  ? 'ข้อมูลบัญชีที่เข้าสู่ระบบ & ความปลอดภัย 2FA'
                  : 'Authenticated Account Session & 2FA Security'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {locale === 'th'
                  ? 'สิทธิ์การเข้าถึง (RBAC) ผูกกับบัญชีอีเมลที่ล็อกอินอย่างเคร่งครัด'
                  : 'Role permissions (RBAC) are strictly bound to your authenticated account'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Active Account Summary */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-teal-700">
                {tText(activeProfile.shortRoleLabel, locale)}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                <UserCheck className="w-3.5 h-3.5" />
                {locale === 'th' ? 'ยืนยันตัวตนแล้ว' : 'Verified Session'}
              </span>
            </div>
            <div className="text-base font-bold text-slate-900">
              {tText(activeProfile.fullName, locale)}
            </div>
            <div className="text-xs text-slate-600">
              {tText(activeProfile.title, locale)} · {tText(activeProfile.organization, locale)}
            </div>
            <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-600">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {activeProfile.email}
              </span>
              <span>{activeProfile.code}</span>
            </div>
          </div>

          {/* TOTP 2FA Verification Status */}
          <div className="p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-teal-700" />
                <span className="text-xs font-bold text-slate-900">
                  {locale === 'th'
                    ? 'การยืนยันตัวตนสองชั้น (TOTP 2FA Authenticator)'
                    : 'Two-Factor Authentication (TOTP 2FA)'}
                </span>
              </div>
              <span className="text-xs font-mono text-emerald-700 font-semibold">
                {totpVerified
                  ? locale === 'th'
                    ? 'เปิดใช้งาน (Active)'
                    : 'Active (SHA-1 TOTP)'
                  : 'Pending'}
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-slate-300"
              />
              <button
                type="button"
                onClick={() => setTotpVerified(true)}
                className="px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
              >
                {locale === 'th' ? 'ตรวจสอบรหัส 2FA' : 'Verify 2FA Token'}
              </button>
            </div>
          </div>

          {/* Strict RBAC Notice + Sign Out to Switch Account */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                {locale === 'th'
                  ? 'ไม่อนุญาตให้สลับบทบาท (Role) ระหว่างเซสชัน'
                  : 'In-Session Role Switching is Disabled by Security Policy'}
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                {locale === 'th'
                  ? 'หากต้องการทดสอบสิทธิ์ของบทบาทอื่น (ผู้บริหารระบบ / ผู้อำนวยการประสานงานโรงพยาบาล / แพทย์และพยาบาล) กรุณาออกจากระบบและเข้าสู่ระบบด้วยบัญชีของบทบาทนั้น'
                  : 'To access another role (Executive Director, Hospital Roster Director, or Attending Clinician), please sign out and authenticate with the corresponding account.'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              {locale === 'th' ? 'ปิดหน้าต่าง' : 'Close'}
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSignOut();
              }}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              {locale === 'th'
                ? 'ออกจากระบบเพื่อเปลี่ยนบัญชี'
                : 'Sign Out to Switch Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
