import {
  ChallanRecord,
  NotificationItem,
  SavedAccount,
  SentinelReport,
  TransactionRecord,
  VehicleRecord,
} from '../types';

/**
 * Normalizes a vehicle registration number or DL/Challan query by stripping extra spaces and uppercasing.
 */
export function normalizeLookupQuery(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').toUpperCase();
}

/**
 * Formats an Indian mobile number in the Figma privacy-masked style: "+91 XXXXXX6102".
 */
export function maskPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '').slice(-10);
  if (digits.length < 4) return '+91 XXXXXXXXXX';
  return `+91 XXXXXX${digits.slice(-4)}`;
}

/**
 * Masks sensitive ID strings (DL number, RC registration, or Chassis) while keeping prefix and suffix visible.
 */
export function maskDocumentId(id: string, masked: boolean): string {
  if (!masked) return id;
  const trimmed = id.trim();
  if (trimmed.length <= 6) return '••••••';
  const visibleStart = trimmed.slice(0, 4);
  const visibleEnd = trimmed.slice(-4);
  return `${visibleStart} ••••••• ${visibleEnd}`;
}

/**
 * Privacy-masks an owner name for public Vahan lookup (e.g. "Rehan Jose" -> "R***N J**E").
 */
export function maskOwnerName(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .map((word) => {
      const upper = word.toUpperCase();
      if (upper.length <= 2) return upper[0] + '*';
      return upper[0] + '*'.repeat(Math.max(2, upper.length - 2)) + upper[upper.length - 1];
    })
    .join(' ');
}

/**
 * Looks up a vehicle record from saved & demo Vahan records.
 */
export function findVehicleByQuery(
  query: string,
  vehicles: VehicleRecord[],
  fallbackVehicle: VehicleRecord
): VehicleRecord | null {
  const cleaned = normalizeLookupQuery(query).replace(/\s/g, '');
  if (!cleaned) return null;

  const existing = vehicles.find(
    (v) => v.regNo.replace(/\s/g, '').toUpperCase() === cleaned
  );
  if (existing) return existing;

  if (fallbackVehicle.regNo.replace(/\s/g, '').toUpperCase() === cleaned) {
    return fallbackVehicle;
  }

  if (/^[A-Z]{2}\d{1,2}[A-Z]{0,3}\d{3,4}$/.test(cleaned)) {
    const formatted = `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, -4)} ${cleaned.slice(-4)}`
      .replace(/\s+/g, ' ')
      .trim();
    return {
      ...fallbackVehicle,
      regNo: formatted,
      savedInGarage: false,
    };
  }

  return null;
}

/**
 * Decrements the daily search quota cleanly without dropping below zero.
 */
export function consumeSearchQuota(remaining: number): number {
  return Math.max(0, remaining - 1);
}

/**
 * Validates a 6-digit numeric MPIN.
 */
export function isValidMpin(mpin: string): boolean {
  return /^\d{6}$/.test(mpin);
}

/**
 * Validates MPIN and Confirm MPIN match during First-Time Sign Up (Flows 1 & 4).
 */
export function validateSignupMpin(mpin: string, confirmMpin: string): string | null {
  if (!isValidMpin(mpin)) return 'Security MPIN must be exactly 6 digits.';
  if (mpin !== confirmMpin) return 'MPIN and Confirm MPIN do not match.';
  return null;
}

/**
 * Validates a 10-digit Indian mobile number (with or without +91 prefix).
 */
export function isValidIndianMobile(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 || (digits.length === 12 && digits.startsWith('91'));
}

/**
 * Determines whether signing into a mobile number requires OTP verification on this device.
 * Per Figma Flows 2, 3, and 5:
 * - Already saved on device -> NO OTP needed (instant MPIN or Face ID).
 * - Not yet saved on device -> OTP verification required, after which account is saved to device.
 */
export function requiresDeviceOtp(
  mobileInput: string,
  savedAccountsOnDevice: SavedAccount[]
): boolean {
  const digits = mobileInput.replace(/\D/g, '').slice(-10);
  return !savedAccountsOnDevice.some((acc) => acc.mobileDigits === digits);
}

/**
 * Upserts a verified account into the device's saved accounts list without duplicates.
 */
export function upsertSavedAccount(
  savedAccounts: SavedAccount[],
  account: SavedAccount
): SavedAccount[] {
  const exists = savedAccounts.some((a) => a.mobileDigits === account.mobileDigits);
  if (exists) {
    return savedAccounts.map((a) =>
      a.mobileDigits === account.mobileDigits ? account : a
    );
  }
  return [...savedAccounts, account];
}

/**
 * Applies a completed challan payment: marks the challan as paid, generates an official receipt reference,
 * and prepends a matching Paid Challan entry into Transactions.
 */
export function completeChallanPayment(
  challans: ChallanRecord[],
  transactions: TransactionRecord[],
  challanId: string,
  paymentMethod: string,
  paymentRef = 'MPV202611239981',
  paidOn = '23 Nov 2026'
): {
  challans: ChallanRecord[];
  transactions: TransactionRecord[];
  paidChallan: ChallanRecord | null;
} {
  let paidChallan: ChallanRecord | null = null;
  const updatedChallans = challans.map((c) => {
    if (c.id === challanId) {
      paidChallan = {
        ...c,
        status: 'paid',
        paymentMethod,
        paymentRef,
        paidOn,
      };
      return paidChallan;
    }
    return c;
  });

  if (!paidChallan) {
    return { challans, transactions, paidChallan: null };
  }

  const paid = paidChallan as ChallanRecord;
  const newTx: TransactionRecord = {
    id: `tx-paid-${Date.now()}`,
    title: `Paid Challan ${paid.id}`,
    subtitle: `${paid.offence} • ${paid.location} • ${paymentMethod}`,
    category: 'Challans',
    status: 'Paid',
    statusTone: 'green',
    date: paidOn,
    amount: paid.amount,
    refNo: paymentRef,
    vehicleNo: paid.vehicleNo,
    actionLabel: 'Download Receipt',
    actionType: 'receipt',
  };

  return {
    challans: updatedChallans,
    transactions: [newTx, ...transactions],
    paidChallan: paid,
  };
}

/**
 * Creates a new Citizen Sentinel report with deterministic tracking ID sequence starting at #CS-KL-88421.
 */
export function createSentinelReport(
  existingReports: SentinelReport[],
  input: {
    violationType: string;
    vehicleNo: string;
    location: string;
    state: string;
    mediaName: string;
  }
): { report: SentinelReport; reports: SentinelReport[] } {
  const sequence = 88421 + Math.max(0, existingReports.length - 2);
  const report: SentinelReport = {
    id: `#CS-KL-${sequence}`,
    violationType: input.violationType,
    vehicleNo: normalizeLookupQuery(input.vehicleNo),
    location: input.location.trim(),
    state: input.state,
    submittedAt: '23 Nov 2026, 03:10 PM • GPS & Photo Verified',
    step: 1,
    statusLabel: 'Submitted',
    mediaName: input.mediaName || 'captured_evidence.jpg',
  };
  return {
    report,
    reports: [report, ...existingReports],
  };
}

/**
 * Counts unread notifications and provides a pure markAllRead transformer.
 */
export function countUnreadNotifications(items: NotificationItem[]): number {
  return items.filter((n) => n.unread).length;
}

export function markAllNotificationsRead(items: NotificationItem[]): NotificationItem[] {
  return items.map((n) => ({ ...n, unread: false }));
}

/**
 * Summarizes pending challan totals for a vehicle (or all vehicles).
 */
export function getPendingChallanSummary(
  challans: ChallanRecord[],
  vehicleNo?: string
): { count: number; totalAmount: number; firstPending: ChallanRecord | null } {
  const pending = challans.filter(
    (c) =>
      c.status === 'pending' &&
      (!vehicleNo || c.vehicleNo.replace(/\s/g, '') === vehicleNo.replace(/\s/g, ''))
  );
  return {
    count: pending.length,
    totalAmount: pending.reduce((sum, c) => sum + c.amount, 0),
    firstPending: pending[0] ?? null,
  };
}
