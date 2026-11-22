export type MainTab = 'home' | 'garage' | 'transactions' | 'nearby';

export type ScreenRoute =
  | 'auth'
  | 'home'
  | 'garage'
  | 'transactions'
  | 'nearby'
  | 'scan-qr'
  | 'transport-services'
  | 'challan-payment'
  | 'virtual-docs'
  | 'citizen-sentinel'
  | 'pm-rahat'
  | 'info-services'
  | 'profile'
  | 'settings'
  | 'help'
  | 'notifications'
  | 'sos'
  | 'vehicle-search';

export type TransportTab = 'vehicle' | 'dl' | 'challan';

export type SearchCategory = 'Vehicle' | 'DL' | 'Challan';

export type LanguageCode = 'English' | 'हिन्दी' | 'മലയാളം' | 'தமிழ்' | 'ಕನ್ನಡ';

export type OnboardingFlowId =
  | 'flow-1-signup'
  | 'flow-2-signin'
  | 'flow-3-switch'
  | 'flow-4-second-account'
  | 'flow-5-both-saved'
  | 'after-onboarding';

export type AuthScreenStep =
  | 'welcome'
  | 'saved-accounts'
  | 'signin-manual'
  | 'signin-saved-mpin'
  | 'signup'
  | 'otp-signup'
  | 'otp-signin'
  | 'forgot-mpin';

export interface SavedAccount {
  id: string;
  name: string;
  malayalamName?: string;
  phone: string; // e.g. '+91 8075286102'
  mobileDigits: string; // 10-digit e.g. '8075286102'
  email: string;
  state: string;
  initials: string;
  dlNumber: string;
  rto: string;
  dob: string;
  bloodGroup: string;
  address: string;
  mpin: string;
  verified: boolean;
}

export interface VehicleRecord {
  regNo: string;
  model: string;
  fuelType: string;
  ownerName: string;
  ownerAccountId?: string;
  maskedOwnerName: string;
  chassisMasked: string;
  engineMasked: string;
  rto: string;
  status: 'Active' | 'Suspended';
  insuranceValidTill: string;
  insuranceStatus: 'valid' | 'expiring';
  pucLabel: string;
  pucStatus: 'valid' | 'expiring';
  fitnessValidTill: string;
  rcValidTill: string;
  savedInGarage: boolean;
  financier?: string;
}

export interface DrivingLicenceRecord {
  dlNo: string;
  holderName: string;
  malayalamName?: string;
  dob: string;
  bloodGroup: string;
  vehicleClasses: string;
  address: string;
  issueDate: string;
  validTill: string;
  rto: string;
  verified: boolean;
}

export interface ChallanRecord {
  id: string;
  vehicleNo: string;
  amount: number;
  offence: string;
  section: string;
  location: string;
  issuedBy: string;
  date: string;
  timestamp: string;
  status: 'pending' | 'paid';
  paymentMethod?: string;
  paymentRef?: string;
  paidOn?: string;
}

export interface TransactionRecord {
  id: string;
  title: string;
  subtitle: string;
  category: 'Applications' | 'Challans' | 'Receipts';
  status: 'Under RTO Review' | 'Paid' | 'Pending Verification' | 'Submitted';
  statusTone: 'amber' | 'green' | 'blue';
  date: string;
  amount?: number;
  refNo: string;
  vehicleNo: string;
  actionLabel: string;
  actionType: 'appointment' | 'receipt' | 'verify';
}

export interface NearbyPlace {
  id: string;
  name: string;
  category: 'RTO Office' | 'PUC Center' | 'Hospitals (PM Rahat)' | 'Fuel & EV';
  distanceKm: string;
  address: string;
  phone: string;
  openStatus: string;
  badge?: string;
  pinColor: 'blue' | 'red' | 'green';
  mapX: number;
  mapY: number;
}

export interface TransportServiceItem {
  id: string;
  tab: 'vehicle' | 'dl';
  title: string;
  fullTitle: string;
  subtitle: string;
  iconName: string;
  types?: string[];
  requiredDocs: string[];
  feeRange: string;
  exactFee: number;
  formLabel?: string;
  fullWidth?: boolean;
}

export interface SentinelReport {
  id: string;
  violationType: string;
  vehicleNo: string;
  location: string;
  state: string;
  submittedAt: string;
  step: 1 | 2 | 3;
  statusLabel: string;
  mediaName: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  group: 'Today' | 'Earlier';
  category: 'Alerts' | 'Challans' | 'Updates';
  unread: boolean;
  actionRoute?: ScreenRoute;
  challanId?: string;
}

export interface InfoGuideItem {
  id: string;
  title: string;
  category: 'Vehicle & RC' | 'Driving Licence' | 'App Guide' | 'Notifications';
  summary: string;
  steps: string[];
  requiredDocs: string[];
  feeInfo: string;
  targetTransportTab?: TransportTab;
  targetServiceId?: string;
}
