import React, { useState } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  BrainCircuit,
  Star,
  Clock,
  Award,
  BookOpen,
} from 'lucide-react';
import {
  UserRole,
  AppLocale,
  evaluateAssessmentQuiz,
  calculateDiscProfile,
  formatCurrencyThb,
  tText,
} from '../utils/workforceRules';
import {
  TRAINING_COURSES,
  BiWeeklyReview,
  HOSPITAL_SITES,
} from '../data/seedWorkforceData';
import { Window, Avatar } from '../kit';

interface TrainingEvaluationProps {
  currentRole: UserRole;
  locale: AppLocale;
  reviews: BiWeeklyReview[];
  onAddReview: (review: BiWeeklyReview) => void;
  onInspectClinician?: (idOrName: string) => void;
}

export const TrainingEvaluationModule: React.FC<TrainingEvaluationProps> = ({
  currentRole,
  locale,
  reviews,
  onAddReview,
  onInspectClinician,
}) => {
  const [subTab, setSubTab] = useState<'lms' | 'disc' | 'biweekly'>('lms');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(TRAINING_COURSES[0].id);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([1, 1, 1]);
  const [quizResult, setQuizResult] = useState<ReturnType<typeof evaluateAssessmentQuiz> | null>(
    null
  );

  // DISC state
  const [discScores, setDiscScores] = useState({ D: 3, I: 2, S: 4, C: 5 });

  // New Bi-weekly Evaluation state (for Client / Admin)
  const [evalEmployeeEn, setEvalEmployeeEn] = useState('Dr. Thanakorn Srisuwan, MD');
  const [evalEmployeeTh, setEvalEmployeeTh] = useState('นพ. ธนกร ศรีสุวรรณ');
  const [evalPeriod, setEvalPeriod] = useState('01/11/2026 - 15/11/2026');
  const [evalSkills, setEvalSkills] = useState(4.9);
  const [evalPunctuality, setEvalPunctuality] = useState(4.8);
  const [evalSatisfaction, setEvalSatisfaction] = useState(5.0);
  const [evalRevenueThb, setEvalRevenueThb] = useState(420000);
  const [evalComment, setEvalComment] = useState('');
  const [evalSuccess, setEvalSuccess] = useState<string | null>(null);

  const activeCourse =
    TRAINING_COURSES.find((c) => c.id === selectedCourseId) || TRAINING_COURSES[0];

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setSelectedAnswers([0, 0, 0]);
    setQuizResult(null);
  };

  const handleGradeQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    const correctIndices = activeCourse.quizQuestions.map((q) => q.correctIndex);
    const res = evaluateAssessmentQuiz(selectedAnswers, correctIndices, 80);
    setQuizResult(res);
  };

  const discProfile = calculateDiscProfile(discScores);

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalComment.trim()) return;

    const avg = Number(
      ((evalSkills + evalPunctuality + evalSatisfaction) / 3).toFixed(2)
    );
    const created: BiWeeklyReview = {
      id: `REV-${Math.floor(400 + Math.random() * 500)}`,
      periodLabel: { en: evalPeriod, th: evalPeriod },
      employeeId: 'DM-TH-0842',
      employeeName: { en: evalEmployeeEn, th: evalEmployeeTh },
      department: 'Critical Care',
      siteName: HOSPITAL_SITES[0].name,
      reviewerName: {
        en:
          currentRole === 'client'
            ? 'Nalinee Rattanakorn, RN (Client Coordinator)'
            : 'Dr. Chakrit Charoensuk, MD (Medical Director)',
        th:
          currentRole === 'client'
            ? 'พว. นลินี รัตนากร (ผู้ประสานงาน รพ.)'
            : 'นพ. จักรกฤษณ์ เจริญสุข (ผู้อำนวยการฝ่ายการแพทย์)',
      },
      clinicalCompetencyScore: evalSkills,
      punctualityScore: evalPunctuality,
      patientSatisfactionScore: evalSatisfaction,
      discCode: discProfile.profileCode,
      revenueContributionThb: Number(evalRevenueThb) || 250000,
      notes: { en: evalComment.trim(), th: evalComment.trim() },
    };

    onAddReview(created);
    setEvalComment('');
    setEvalSuccess(
      locale === 'th'
        ? `บันทึกผลประเมินรายปักษ์ ${created.id} (คะแนนเฉลี่ย ${avg}/5.0) เรียบร้อยแล้ว`
        : `Recorded Bi-Weekly Evaluation ${created.id} (Overall ${avg}/5.0).`
    );
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 bg-slate-200/70 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setSubTab('lms')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'lms'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-teal-700" />
            {locale === 'th'
              ? 'หลักสูตรฝึกอบรมและสอบออนไลน์ (OPD / IPD / ICU)'
              : 'Clinical LMS & Online Assessment (OPD / IPD / ICU)'}
          </button>
          <button
            type="button"
            onClick={() => setSubTab('disc')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'disc'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5 text-teal-700" />
            {locale === 'th'
              ? 'แบบประเมินบุคลิกภาพทางการแพทย์ DISC'
              : 'Clinical DISC Behavioral Assessment'}
          </button>
          <button
            type="button"
            onClick={() => setSubTab('biweekly')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'biweekly'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-teal-700" />
            {locale === 'th'
              ? 'ประเมินผลงานรายปักษ์ (Bi-Weekly Evaluation)'
              : 'Bi-Weekly Clinical Performance Reviews'}
          </button>
        </div>
      </div>

      {subTab === 'lms' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Course Catalog (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {TRAINING_COURSES.map((course) => {
              const active = course.id === activeCourse.id;
              return (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => handleSelectCourse(course.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    active
                      ? 'bg-white border-teal-600 shadow-xs ring-2 ring-teal-600/10'
                      : 'bg-white border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-teal-700">
                      {course.department} · {course.id.toUpperCase()}
                    </span>
                    <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {course.durationMinutes} min ·{' '}
                      {course.modulesCount} modules
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">
                    {tText(course.title, locale)}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {tText(course.instructor, locale)}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {locale === 'th' ? 'เกณฑ์ผ่าน:' : 'Pass Threshold:'}{' '}
                      <strong className="text-slate-800">80%</strong>
                    </span>
                    <span className="font-mono text-teal-700 font-semibold">
                      {locale === 'th' ? 'ความคืบหน้า' : 'Progress'} {course.completionPct}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Assessment Quiz inside Stageshow Window (7 cols) */}
          <div className="lg:col-span-7">
            <Window
              title={`${activeCourse.id.toUpperCase()} — ${tText(activeCourse.title, locale)}`}
              url={`https://app.daymark.co.th/lms/${activeCourse.id}`}
            >
              <form onSubmit={handleGradeQuiz} className="p-6 space-y-5">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
                      {locale === 'th'
                        ? `แบบทดสอบมาตรฐานวิชาชีพ (${activeCourse.department})`
                        : `Clinical Competency Examination (${activeCourse.department})`}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {tText(activeCourse.title, locale)}
                    </h3>
                  </div>
                  <BookOpen className="w-5 h-5 text-slate-400" />
                </div>

                <div className="space-y-4">
                  {activeCourse.quizQuestions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2.5"
                    >
                      <p className="text-xs font-bold text-slate-900">
                        {qIdx + 1}. {tText(q.question, locale)}
                      </p>
                      <div className="space-y-1.5">
                        {q.options.map((opt, oIdx) => (
                          <label
                            key={oIdx}
                            className={`flex items-center gap-2.5 p-2 rounded-md text-xs cursor-pointer transition-colors ${
                              selectedAnswers[qIdx] === oIdx
                                ? 'bg-teal-50 border border-teal-300 text-teal-950 font-semibold'
                                : 'bg-white border border-slate-200/70 text-slate-700 hover:bg-slate-100/70'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${qIdx}`}
                              checked={selectedAnswers[qIdx] === oIdx}
                              onChange={() => {
                                const next = [...selectedAnswers];
                                next[qIdx] = oIdx;
                                setSelectedAnswers(next);
                              }}
                              className="accent-teal-700"
                            />
                            <span>{tText(opt, locale)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {quizResult && (
                  <div
                    className={`p-4 rounded-lg border flex items-center justify-between ${
                      quizResult.passed
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : 'bg-rose-50 border-rose-200 text-rose-950'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {quizResult.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                      <div>
                        <p className="text-xs font-bold">
                          {tText(quizResult.statusText, locale)}
                        </p>
                        <p className="text-[11px] opacity-80">
                          {locale === 'th'
                            ? `ตอบถูก ${quizResult.correctCount} จาก ${quizResult.totalQuestions} ข้อ`
                            : `Answered ${quizResult.correctCount} of ${quizResult.totalQuestions} clinical scenarios correctly`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  {locale === 'th'
                    ? 'ส่งกระดาษคำตอบและประมวลผลคะแนน CME'
                    : 'Submit Clinical Assessment & Calculate CME Score'}
                </button>
              </form>
            </Window>
          </div>
        </div>
      )}

      {subTab === 'disc' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {locale === 'th'
                ? 'แบบประเมินพฤติกรรมการทำงานทางการแพทย์ (DISC Profile)'
                : 'Clinical Behavioral & Team Allocation Matrix (DISC)'}
            </h3>
            <p className="text-xs text-slate-500">
              {locale === 'th'
                ? 'ปรับระดับคะแนนพฤติกรรม (1 - 5) เพื่อวิเคราะห์ความเหมาะสมในการจัดสรรลงแผนก ER/ICU, IPD หรือ OPD'
                : 'Adjust behavioral dimension weights (1 - 5) to evaluate optimal unit placement across ER/ICU, IPD, or OPD.'}
            </p>

            {(
              [
                {
                  key: 'D',
                  label:
                    locale === 'th'
                      ? 'D — Dominance (การตัดสินใจฉับไวในภาวะวิกฤต ER/ICU)'
                      : 'D — Dominance (Rapid Decision-Making in ER / Trauma)',
                },
                {
                  key: 'I',
                  label:
                    locale === 'th'
                      ? 'I — Influence (การสื่อสารและให้คำปรึกษาผู้ป่วยนอก OPD)'
                      : 'I — Influence (Patient Communication & OPD Counseling)',
                },
                {
                  key: 'S',
                  label:
                    locale === 'th'
                      ? 'S — Steadiness (ความละเอียดรอบคอบในการดูแลผู้ป่วยใน IPD)'
                      : 'S — Steadiness (Empathetic Long-Stay IPD Care)',
                },
                {
                  key: 'C',
                  label:
                    locale === 'th'
                      ? 'C — Conscientiousness (ความแม่นยำตามมาตรฐาน JCI / ICU)'
                      : 'C — Conscientiousness (Strict JCI Protocol & ICU Precision)',
                },
              ] as const
            ).map((dim) => (
              <div key={dim.key} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-800">
                  <span>{dim.label}</span>
                  <span className="font-mono text-teal-700">{discScores[dim.key]} / 5</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={discScores[dim.key]}
                  onChange={(e) =>
                    setDiscScores((prev) => ({
                      ...prev,
                      [dim.key]: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-teal-700 cursor-pointer"
                />
              </div>
            ))}
          </div>

          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono uppercase text-teal-700 font-semibold">
                  {locale === 'th' ? 'ผลวิเคราะห์บุคลิกภาพเด่น' : 'DOMINANT CLINICAL TRAIT'} (
                  {discProfile.profileCode})
                </span>
                <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                  {tText(discProfile.title, locale)}
                </h4>
              </div>
              <Award className="w-8 h-8 text-teal-700 shrink-0" />
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              {tText(discProfile.shiftSchedulingAdvice, locale)}
            </p>

            <div className="p-3 rounded-lg bg-teal-50/70 border border-teal-200 text-xs text-teal-900">
              {locale === 'th' ? 'แผนกที่แนะนำ:' : 'Recommended Clinical Unit:'}{' '}
              <strong>{discProfile.recommendedDepartment}</strong>
            </div>
          </div>
        </div>
      )}

      {subTab === 'biweekly' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Bi-Weekly Review List */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {locale === 'th'
                    ? 'รายงานประเมินผลปฏิบัติงานรายปักษ์ (Bi-Weekly Evaluation)'
                    : 'Bi-Weekly Clinical Competency & Revenue Contribution'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {locale === 'th'
                    ? 'ประเมินทุก 2 สัปดาห์โดยผู้อำนวยการประสานงานโรงพยาบาลและผู้อำนวยการฝ่ายการแพทย์'
                    : 'Evaluated every 2 weeks by Hospital Roster Directors and Executive Medical Directors'}
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-200/70">
              {reviews.map((rev) => {
                const overall = (
                  (rev.clinicalCompetencyScore +
                    rev.punctualityScore +
                    rev.patientSatisfactionScore) /
                  3
                ).toFixed(2);
                return (
                  <div
                    key={rev.id}
                    onClick={() => onInspectClinician && onInspectClinician(rev.employeeId)}
                    className="p-5 space-y-3 hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          initials={rev.employeeName.en
                            .replace(/^Dr\.\s+|^RN\.\s+/i, '')
                            .slice(0, 2)
                            .toUpperCase()}
                          size="sm"
                          status="online"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 hover:text-teal-800">
                              {tText(rev.employeeName, locale)}
                            </span>
                            <span className="text-xs font-mono text-slate-400">
                              {tText(rev.periodLabel, locale)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {rev.department} · {tText(rev.siteName, locale)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-sm font-bold font-mono text-teal-800">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          {overall} / 5.0
                        </span>
                        <div className="text-[11px] font-mono text-slate-500">
                          {locale === 'th'
                            ? 'มูลค่าบริการทางการแพทย์:'
                            : 'Clinical Revenue:'}{' '}
                          {formatCurrencyThb(rev.revenueContributionThb)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200/60 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">
                          {locale === 'th' ? 'ทักษะหัตถการคลินิก' : 'Clinical Competency'}
                        </span>
                        <span className="font-mono font-bold text-slate-800">
                          {rev.clinicalCompetencyScore} / 5.0
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">
                          {locale === 'th' ? 'ความตรงต่อเวลา' : 'Punctuality'}
                        </span>
                        <span className="font-mono font-bold text-slate-800">
                          {rev.punctualityScore} / 5.0
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">
                          {locale === 'th' ? 'ความพึงพอใจผู้ป่วย' : 'Patient Satisfaction'}
                        </span>
                        <span className="font-mono font-bold text-slate-800">
                          {rev.patientSatisfactionScore} / 5.0
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 italic">
                      “{tText(rev.notes, locale)}” —{' '}
                      <span className="not-italic font-semibold text-slate-700">
                        {tText(rev.reviewerName, locale)}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Add Bi-Weekly Review Form */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              {locale === 'th'
                ? 'บันทึกผลประเมินรายปักษ์ใหม่ (สำหรับโรงพยาบาล / Admin)'
                : 'Submit New Bi-Weekly Clinical Review'}
            </h3>

            {evalSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{evalSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateReview} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {locale === 'th' ? 'บุคลากรทางการแพทย์' : 'Clinician'}
                </label>
                <input
                  type="text"
                  value={locale === 'th' ? evalEmployeeTh : evalEmployeeEn}
                  onChange={(e) => {
                    if (locale === 'th') setEvalEmployeeTh(e.target.value);
                    else setEvalEmployeeEn(e.target.value);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {locale === 'th' ? 'รอบปักษ์ประเมิน' : 'Bi-Weekly Period'}
                  </label>
                  <input
                    type="text"
                    value={evalPeriod}
                    onChange={(e) => setEvalPeriod(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs font-mono rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {locale === 'th' ? 'มูลค่าบริการ (THB)' : 'Revenue Contribution (THB)'}
                  </label>
                  <input
                    type="number"
                    value={evalRevenueThb}
                    onChange={(e) => setEvalRevenueThb(Number(e.target.value))}
                    className="w-full px-2.5 py-2 text-xs font-mono rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    {locale === 'th' ? 'ทักษะคลินิก' : 'Clinical (1-5)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min={1}
                    max={5}
                    value={evalSkills}
                    onChange={(e) => setEvalSkills(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    {locale === 'th' ? 'ตรงต่อเวลา' : 'Punctuality (1-5)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min={1}
                    max={5}
                    value={evalPunctuality}
                    onChange={(e) => setEvalPunctuality(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    {locale === 'th' ? 'ความพึงพอใจ' : 'Patient (1-5)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min={1}
                    max={5}
                    value={evalSatisfaction}
                    onChange={(e) => setEvalSatisfaction(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {locale === 'th' ? 'ความเห็นผู้ประเมิน' : 'Clinical Evaluator Remarks'}
                </label>
                <textarea
                  rows={3}
                  value={evalComment}
                  onChange={(e) => setEvalComment(e.target.value)}
                  placeholder={
                    locale === 'th'
                      ? 'ระบุจุดเด่นด้านหัตถการ การดูแลผู้ป่วยวิกฤต และการปฏิบัติตามมาตรฐานโรงพยาบาล...'
                      : 'Document clinical proficiency, patient safety adherence, and team handover...'
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold transition-all cursor-pointer"
              >
                {locale === 'th'
                  ? 'บันทึกผลประเมินรายปักษ์'
                  : 'Submit Bi-Weekly Evaluation'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
