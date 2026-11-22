import test from 'node:test';
import assert from 'node:assert/strict';
import {
  completeChallanPayment,
  consumeSearchQuota,
  countUnreadNotifications,
  createSentinelReport,
  findVehicleByQuery,
  getPendingChallanSummary,
  isValidIndianMobile,
  isValidMpin,
  markAllNotificationsRead,
  maskDocumentId,
  maskOwnerName,
  maskPhoneNumber,
  requiresDeviceOtp,
  upsertSavedAccount,
  validateSignupMpin,
} from './appLogic';
import {
  ACCOUNT_MALAVIKA,
  ACCOUNT_REHAN,
  EXTRA_LOOKUP_VEHICLE,
  INITIAL_CHALLANS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SENTINEL_REPORTS,
  INITIAL_TRANSACTIONS,
  INITIAL_VEHICLES,
} from '../data/mockData';

test('maskPhoneNumber formats mobile numbers as +91 XXXXXX6102', () => {
  assert.equal(maskPhoneNumber('8075286102'), '+91 XXXXXX6102');
  assert.equal(maskPhoneNumber('+91 9847014321'), '+91 XXXXXX4321');
});

test('requiresDeviceOtp requires OTP for unsaved accounts and skips OTP for saved accounts', () => {
  assert.equal(requiresDeviceOtp('8075286102', []), true);
  assert.equal(requiresDeviceOtp('8075286102', [ACCOUNT_MALAVIKA]), true);
  assert.equal(requiresDeviceOtp('8075286102', [ACCOUNT_MALAVIKA, ACCOUNT_REHAN]), false);
});

test('upsertSavedAccount adds new accounts and avoids duplicates', () => {
  const afterFirst = upsertSavedAccount([ACCOUNT_MALAVIKA], ACCOUNT_REHAN);
  assert.equal(afterFirst.length, 2);
  const afterDup = upsertSavedAccount(afterFirst, ACCOUNT_REHAN);
  assert.equal(afterDup.length, 2);
});

test('validateSignupMpin enforces 6-digit matching MPIN', () => {
  assert.equal(validateSignupMpin('123456', '123456'), null);
  assert.ok(validateSignupMpin('12345', '12345'));
  assert.ok(validateSignupMpin('123456', '654321'));
});

test('maskDocumentId masks middle characters when enabled and returns raw when disabled', () => {
  assert.equal(maskDocumentId('KL42 20220005784', false), 'KL42 20220005784');
  assert.equal(maskDocumentId('KL42 20220005784', true), 'KL42 ••••••• 5784');
});

test('maskOwnerName hides internal letters for Vahan privacy compliance', () => {
  assert.equal(maskOwnerName('Rehan Jose'), 'R***N J**E');
});

test('findVehicleByQuery matches saved vehicles regardless of whitespace/casing', () => {
  const swift = findVehicleByQuery('kl42ab5784', INITIAL_VEHICLES, EXTRA_LOOKUP_VEHICLE);
  assert.ok(swift);
  assert.equal(swift.regNo, 'KL 42 AB 5784');
  const synthetic = findVehicleByQuery('MH12DE1433', INITIAL_VEHICLES, EXTRA_LOOKUP_VEHICLE);
  assert.ok(synthetic);
  assert.equal(synthetic.regNo, 'MH 12 DE 1433');
  assert.equal(findVehicleByQuery('123', INITIAL_VEHICLES, EXTRA_LOOKUP_VEHICLE), null);
});

test('consumeSearchQuota decrements down to zero floor', () => {
  assert.equal(consumeSearchQuota(4), 3);
  assert.equal(consumeSearchQuota(0), 0);
});

test('MPIN and Indian mobile number validators work accurately', () => {
  assert.equal(isValidMpin('123456'), true);
  assert.equal(isValidMpin('12ab56'), false);
  assert.equal(isValidIndianMobile('8075286102'), true);
  assert.equal(isValidIndianMobile('12345'), false);
});

test('completeChallanPayment marks challan paid and inserts a receipt transaction', () => {
  const before = getPendingChallanSummary(INITIAL_CHALLANS, 'KL 42 AB 5784');
  assert.equal(before.count, 1);

  const result = completeChallanPayment(
    INITIAL_CHALLANS,
    INITIAL_TRANSACTIONS,
    '#KL429905',
    'UPI (Official Parivahan)'
  );
  assert.ok(result.paidChallan);
  assert.equal(result.paidChallan.status, 'paid');
  assert.equal(getPendingChallanSummary(result.challans, 'KL 42 AB 5784').count, 0);
  assert.equal(result.transactions[0].title, 'Paid Challan #KL429905');
});

test('createSentinelReport assigns #CS-KL-88421 and prepends report', () => {
  const { report, reports } = createSentinelReport(INITIAL_SENTINEL_REPORTS, {
    violationType: 'Signal Jumping',
    vehicleNo: 'kl 07 ab 1234',
    location: 'NH 66, Edappally',
    state: 'Kerala',
    mediaName: 'photo_signal.jpg',
  });
  assert.equal(report.id, '#CS-KL-88421');
  assert.equal(report.vehicleNo, 'KL 07 AB 1234');
  assert.equal(reports.length, INITIAL_SENTINEL_REPORTS.length + 1);
});

test('notifications unread count and markAllNotificationsRead work properly', () => {
  assert.equal(countUnreadNotifications(INITIAL_NOTIFICATIONS), 2);
  assert.equal(countUnreadNotifications(markAllNotificationsRead(INITIAL_NOTIFICATIONS)), 0);
});
