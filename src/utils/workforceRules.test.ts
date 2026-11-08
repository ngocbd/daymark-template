import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectDefaultLocale,
  resolveAccountRoleByEmail,
  canRolePerformAction,
  calculateHaversineDistanceMeters,
  verifyGeofence,
  verifyBiometricFaceMatch,
  calculatePayrollItem,
  evaluateAssessmentQuiz,
  calculateDiscProfile,
} from './workforceRules';

test('Browser locale detection defaults to English unless browser default is Thai', () => {
  assert.equal(detectDefaultLocale('en-US'), 'en');
  assert.equal(detectDefaultLocale('vi-VN'), 'en');
  assert.equal(detectDefaultLocale('ja-JP'), 'en');
  assert.equal(detectDefaultLocale('th'), 'th');
  assert.equal(detectDefaultLocale('th-TH'), 'th');
});

test('Role and permissions strictly depend on the authenticated login account', () => {
  const adminAcc = resolveAccountRoleByEmail('admin@daymark.co.th');
  const clientAcc = resolveAccountRoleByEmail('client@bumrungrad.co.th');
  const employeeAcc = resolveAccountRoleByEmail('clinician@daymark.co.th');

  assert.equal(adminAcc?.role, 'admin');
  assert.equal(clientAcc?.role, 'client');
  assert.equal(employeeAcc?.role, 'employee');

  // Daymark proxy attendance marking is strictly locked to Client (User2)
  assert.equal(canRolePerformAction(clientAcc!.role, 'daymark.execute_mark'), true);
  assert.equal(canRolePerformAction(adminAcc!.role, 'daymark.execute_mark'), false);
  assert.equal(canRolePerformAction(employeeAcc!.role, 'daymark.execute_mark'), false);

  // Clock-in belongs to Employee; Payroll approval belongs to Admin
  assert.equal(canRolePerformAction(employeeAcc!.role, 'attendance.execute_clock'), true);
  assert.equal(canRolePerformAction(adminAcc!.role, 'payroll.manage_approve'), true);
  assert.equal(canRolePerformAction(employeeAcc!.role, 'payroll.manage_approve'), false);
});

test('GPS Geofencing validates Bumrungrad International Hospital Bangkok coordinates within 250m', () => {
  const bumrungradCoords = { lat: 13.7462, lng: 100.5528 };
  const doctorInIcuTower = { lat: 13.7466, lng: 100.5531 }; // ~55m away
  const doctorAtAsokIntersection = { lat: 13.737, lng: 100.5605 }; // >1.2km away

  const insideResult = verifyGeofence(doctorInIcuTower, bumrungradCoords, 250);
  assert.equal(insideResult.isWithinGeofence, true);
  assert.ok(insideResult.distanceMeters < 150);

  const outsideResult = verifyGeofence(doctorAtAsokIntersection, bumrungradCoords, 250);
  assert.equal(outsideResult.isWithinGeofence, false);
  assert.ok(outsideResult.distanceMeters > 250);
  assert.equal(calculateHaversineDistanceMeters(bumrungradCoords, bumrungradCoords), 0);
});

test('Biometric Face-scan validates Liveness Detection and 1:N Face Matching', () => {
  const validScan = verifyBiometricFaceMatch(0.97, 0.99);
  assert.equal(validScan.overallVerified, true);

  const spoofPhotoAttempt = verifyBiometricFaceMatch(0.61, 0.95);
  assert.equal(spoofPhotoAttempt.overallVerified, false);
  assert.equal(spoofPhotoAttempt.livenessPassed, false);
});

test('THB Payroll calculation aggregates base, Daymark hours, 1.5x OT, specialty allowance, and 10.5% deduction', () => {
  const breakdown = calculatePayrollItem({
    hourlyRateThb: 1200,
    regularHours: 140,
    overtimeHours: 12,
    daymarkVerifiedHours: 8,
    department: 'Critical Care',
    shiftsCompleted: 20,
    kpiBonusThb: 15000,
  });

  // Base: 140 * 1200 = 168,000
  // Daymark: 8 * 1200 = 9,600
  // OT: 12 * 1200 * 1.5 = 21,600
  // Critical Care Allowance: 20 * 1,500 = 30,000
  // KPI Bonus: 15,000
  // Gross = 244,200 THB
  assert.equal(breakdown.baseSalaryThb, 168000);
  assert.equal(breakdown.daymarkSalaryThb, 9600);
  assert.equal(breakdown.overtimeSalaryThb, 21600);
  assert.equal(breakdown.specialtyAllowanceThb, 30000);
  assert.equal(breakdown.grossSalaryThb, 244200);
  assert.equal(breakdown.socialSecurityAndTaxThb, Math.round(244200 * 0.105));
  assert.equal(breakdown.netSalaryThb, 244200 - Math.round(244200 * 0.105));
  assert.equal(breakdown.totalBillableHours, 160);
});

test('Medical Assessment quiz grading and DISC profiling return bilingual recommendations', () => {
  const passResult = evaluateAssessmentQuiz([0, 1, 2], [0, 1, 2], 80);
  assert.equal(passResult.scorePercentage, 100);
  assert.equal(passResult.passed, true);

  const icuProfile = calculateDiscProfile({ D: 38, I: 14, S: 16, C: 32 });
  assert.equal(icuProfile.recommendedDepartment, 'Critical Care');
  assert.equal(icuProfile.profileCode, 'D-C');
});
