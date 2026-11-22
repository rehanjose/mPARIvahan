import React, { useState } from 'react';
import {
  ChevronLeft,
  Camera,
  ShieldCheck,
  Car,
  IdCard,
  KeyRound,
  Users,
  Trash2,
  ChevronRight,
  Search,
  Phone,
  MessageSquarePlus,
  ChevronDown,
  X,
} from 'lucide-react';
import { HELP_FAQS } from '../../data/mockData';
import { SavedAccount } from '../../types';
import {
  hapticSuccess,
  hapticTap,
  hapticWarning,
  isHapticsEnabled,
  setHapticsEnabled,
} from '../../utils/haptics';

/* ================= MY PROFILE SCREEN ================= */
interface ProfileScreenProps {
  account: SavedAccount;
  vehiclesCount: number;
  onBack: () => void;
  onOpenVirtualDocs: () => void;
  onShowToast: (text: string, tone?: 'success' | 'info' | 'warning') => void;
}

export function ProfileScreen({
  account,
  vehiclesCount,
  onBack,
  onOpenVirtualDocs,
  onShowToast,
}: ProfileScreenProps) {
  return (
    <div className="flex-1 bg-white overflow-y-auto no-scrollbar pb-6">
      <header className="px-4 pt-2 pb-2.5 flex items-center gap-2 border-b border-[#F2F4F7] sticky top-0 bg-white z-10">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to Home"
          className="w-9 h-9 -ml-2 rounded-full flex items-center justify-center text-[#111827] hover:bg-[#F2F4F7] cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[19px] font-extrabold text-[#111827]">My Profile</h1>
      </header>

      <div className="px-4 pt-5 space-y-5">
        {/* Avatar with Camera Badge + Verified Pill */}
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0095F6] to-[#0369A1] text-white font-extrabold text-[26px] flex items-center justify-center shadow-md">
              {account.initials}
            </div>
            <button
              type="button"
              onClick={() => onShowToast('Profile photo synced from Aadhaar e-KYC', 'info')}
              aria-label="Update profile picture"
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white border border-[#E2E8F0] shadow flex items-center justify-center text-[#0095F6] cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <h2 className="mt-3 text-[19px] font-extrabold text-[#111827]">{account.name}</h2>
          <span className="mt-1.5 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#ECFDF5] text-[#16A34A] text-[11.5px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Aadhaar / MoRTH Verified ✓
          </span>
        </div>

        {/* Read-only Fields */}
        <div className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] divide-y divide-[#E2E8F0]">
          <div className="px-4 py-3">
            <p className="text-[11px] font-semibold text-[#667085]">Full Name</p>
            <p className="text-[14px] font-bold text-[#111827] mt-0.5">{account.name}</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-[11px] font-semibold text-[#667085]">Registered Mobile</p>
            <p className="font-mono-code text-[14px] font-bold text-[#111827] mt-0.5">
              {account.phone}
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="text-[11px] font-semibold text-[#667085]">Email Address</p>
            <p className="text-[14px] font-bold text-[#111827] mt-0.5">{account.email}</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-[11px] font-semibold text-[#667085]">State / UT</p>
            <p className="text-[14px] font-bold text-[#111827] mt-0.5">{account.state}</p>
          </div>
        </div>

        {/* Linked Documents Summary */}
        <div>
          <h3 className="text-[14px] font-bold text-[#111827] mb-2">Linked Documents</h3>
          <button
            type="button"
            onClick={onOpenVirtualDocs}
            className="w-full rounded-2xl bg-white border border-[#E2E8F0] p-4 flex items-center justify-between hover:border-[#0095F6] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <IdCard className="w-5 h-5 text-[#0095F6]" />
                <div className="text-left">
                  <p className="text-[13px] font-bold text-[#111827]">1 Virtual DL</p>
                  <p className="font-mono-code text-[11px] text-[#667085]">{account.dlNumber}</p>
                </div>
              </div>
              <div className="h-8 w-px bg-[#E2E8F0]" />
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-[#16A34A]" />
                <div className="text-left">
                  <p className="text-[13px] font-bold text-[#111827]">
                    {vehiclesCount} Vehicles
                  </p>
                  <p className="text-[11px] text-[#667085]">Vahan Synced</p>
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= SETTINGS & SECURITY SCREEN ================= */
interface SettingsScreenProps {
  onBack: () => void;
  onManageAccounts: () => void;
  onDeleteAccount: () => void;
  onShowToast: (text: string, tone?: 'success' | 'info' | 'warning') => void;
}

export function SettingsScreen({
  onBack,
  onManageAccounts,
  onDeleteAccount,
  onShowToast,
}: SettingsScreenProps) {
  const [faceId, setFaceId] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [challanAlerts, setChallanAlerts] = useState(true);
  const [hapticsOn, setHapticsOn] = useState(() => isHapticsEnabled());
  const [mpinModal, setMpinModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [newMpin, setNewMpin] = useState('');

  const renderToggle = (
    label: string,
    sub: string,
    checked: boolean,
    onChange: () => void
  ) => (
    <div className="px-4 py-3.5 flex items-center justify-between gap-3">
      <div>
        <p className="text-[13.5px] font-bold text-[#111827]">{label}</p>
        <p className="text-[11.5px] text-[#667085]">{sub}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 cursor-pointer ${
          checked ? 'bg-[#0095F6]' : 'bg-[#CBD5E1]'
        }`}
      >
        <span
          className={`block w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-[22px]' : 'translate-x-[3px]'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="flex-1 bg-white overflow-y-auto no-scrollbar pb-6 relative">
      <header className="px-4 pt-2 pb-2.5 flex items-center gap-2 border-b border-[#F2F4F7] sticky top-0 bg-white z-10">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to Home"
          className="w-9 h-9 -ml-2 rounded-full flex items-center justify-center text-[#111827] hover:bg-[#F2F4F7] cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[19px] font-extrabold text-[#111827]">Settings & Security</h1>
      </header>

      <div className="px-4 pt-4 space-y-4">
        <div className="rounded-2xl border border-[#E2E8F0] divide-y divide-[#F2F4F7] bg-white">
          {renderToggle(
            'Face ID / Biometric Login',
            'Unlock Virtual DL & RC instantaneously',
            faceId,
            () => {
              setFaceId((v) => !v);
              onShowToast(!faceId ? 'Face ID enabled' : 'Face ID disabled', 'info');
            }
          )}
          {renderToggle(
            'Insurance & PUC Reminders',
            'Proactive alerts 15 & 5 days before expiry',
            reminders,
            () => {
              setReminders((v) => !v);
              onShowToast('Reminder preferences saved', 'info');
            }
          )}
          {renderToggle(
            'Instant e-Challan Alerts',
            'Real-time push alerts from MoRTH',
            challanAlerts,
            () => {
              hapticTap();
              setChallanAlerts((v) => !v);
              onShowToast('e-Challan alert preference updated', 'info');
            }
          )}
          {renderToggle(
            'Haptic Feedback',
            'Subtle vibration on primary taps & transactions (mobile)',
            hapticsOn,
            () => {
              const next = !hapticsOn;
              setHapticsEnabled(next);
              setHapticsOn(next);
              if (next) hapticTap();
              onShowToast(next ? 'Haptic feedback enabled' : 'Haptic feedback disabled', 'info');
            }
          )}
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] divide-y divide-[#F2F4F7] bg-white overflow-hidden">
          <button
            type="button"
            onClick={() => setMpinModal(true)}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F8FAFC] cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <KeyRound className="w-4 h-4 text-[#0095F6]" />
              <span className="text-[13.5px] font-bold text-[#111827]">Change MPIN</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
          </button>

          <button
            type="button"
            onClick={onManageAccounts}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F8FAFC] cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-[#0095F6]" />
              <span className="text-[13.5px] font-bold text-[#111827]">
                Manage Saved Accounts
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setDeleteConfirm(true)}
          className="w-full h-12 rounded-2xl bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] text-[#E31E24] font-bold text-[13.5px] flex items-center justify-center gap-2 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete mParivahan Account</span>
        </button>
      </div>

      {/* Change MPIN Modal */}
      {mpinModal && (
        <div className="fixed inset-0 z-40 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/45" onClick={() => setMpinModal(false)} />
          <div className="relative z-10 w-full max-w-[402px] bg-white rounded-t-[28px] p-5 pb-9 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[17px] font-bold text-[#111827]">Set New 6-Digit MPIN</h2>
              <button
                type="button"
                onClick={() => setMpinModal(false)}
                aria-label="Close MPIN dialog"
                className="w-8 h-8 rounded-full bg-[#F2F4F7] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="password"
              maxLength={6}
              inputMode="numeric"
              placeholder="Enter 6-digit numeric MPIN"
              value={newMpin}
              onChange={(e) => setNewMpin(e.target.value.replace(/\D/g, ''))}
              className="w-full h-11 px-3.5 rounded-xl bg-[#F2F4F7] font-mono-code text-[15px] tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-[#0095F6]"
            />
            <button
              type="button"
              onClick={() => {
                if (newMpin.length !== 6) {
                  hapticWarning();
                  onShowToast('MPIN must be exactly 6 digits', 'warning');
                  return;
                }
                hapticSuccess();
                setMpinModal(false);
                setNewMpin('');
                onShowToast('6-digit MPIN updated successfully', 'success');
              }}
              className="mt-3 w-full h-11 rounded-xl bg-[#0095F6] text-white font-bold text-[14px] cursor-pointer"
            >
              Save New MPIN
            </button>
          </div>
        </div>
      )}

      {/* Delete Account Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-5">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(false)} />
          <div className="relative z-10 w-full max-w-[350px] bg-white rounded-3xl p-5 shadow-2xl">
            <h2 className="text-[17px] font-extrabold text-[#111827]">
              Delete mParivahan Account?
            </h2>
            <p className="mt-2 text-[12.5px] text-[#667085] leading-relaxed">
              This will remove your saved Virtual RC/DL cache from this device. Your Vahan & Sarathi government records remain untouched.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(false)}
                className="flex-1 h-10 rounded-xl bg-[#F2F4F7] text-[#111827] font-semibold text-[13px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirm(false);
                  onDeleteAccount();
                }}
                className="flex-1 h-10 rounded-xl bg-[#E31E24] text-white font-bold text-[13px] cursor-pointer"
              >
                Delete & Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= HELP & SUPPORT SCREEN ================= */
interface HelpScreenProps {
  onBack: () => void;
  onShowToast: (text: string, tone?: 'success' | 'info' | 'warning') => void;
}

export function HelpScreen({ onBack, onShowToast }: HelpScreenProps) {
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState<string>('faq-1');
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueText, setIssueText] = useState('');

  const filteredFaqs = HELP_FAQS.filter(
    (f) =>
      !search.trim() ||
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 bg-white overflow-y-auto no-scrollbar pb-6 relative">
      <header className="px-4 pt-2 pb-2.5 flex items-center gap-2 border-b border-[#F2F4F7] sticky top-0 bg-white z-10">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to Home"
          className="w-9 h-9 -ml-2 rounded-full flex items-center justify-center text-[#111827] hover:bg-[#F2F4F7] cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[19px] font-extrabold text-[#111827]">Help & Support</h1>
      </header>

      <div className="px-4 pt-3.5 space-y-4">
        <div className="flex items-center gap-2 h-11 px-3.5 rounded-[14px] bg-[#F2F4F7]">
          <Search className="w-4 h-4 text-[#667085]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search help articles & FAQs..."
            className="flex-1 bg-transparent text-[13.5px] text-[#111827] placeholder:text-[#667085] focus:outline-none"
          />
        </div>

        {/* 2 Action Cards */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onShowToast('Dialing 24/7 MoRTH Helpline: 1800-110-321', 'info')}
            className="text-left rounded-2xl bg-[#EBF5FF] border border-[#BFDBFE] p-3.5 space-y-2 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-[#0095F6] text-white flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[13px] font-extrabold text-[#111827]">24/7 Helpline</p>
              <p className="font-mono-code text-[11.5px] font-bold text-[#0095F6]">
                1800-110-321
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setIssueOpen(true)}
            className="text-left rounded-2xl bg-white border border-[#E2E8F0] p-3.5 space-y-2 hover:border-[#0095F6] transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-[#F2F4F7] text-[#0095F6] flex items-center justify-center">
              <MessageSquarePlus className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[13px] font-extrabold text-[#111827]">Raise an Issue</p>
              <p className="text-[11.5px] text-[#667085]">Track NIC support ticket</p>
            </div>
          </button>
        </div>

        {/* FAQ Accordion */}
        <div>
          <h2 className="text-[15px] font-extrabold text-[#111827] mb-2">
            Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {filteredFaqs.map((faq) => {
              const expanded = openFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden"
                >
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setOpenFaq(expanded ? '' : faq.id)}
                    className="w-full px-4 py-3.5 flex items-center justify-between gap-2 text-left cursor-pointer"
                  >
                    <span className="text-[13px] font-bold text-[#111827] leading-snug">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#667085] transition-transform shrink-0 ${
                        expanded ? 'rotate-180 text-[#0095F6]' : ''
                      }`}
                    />
                  </button>
                  {expanded && (
                    <div className="px-4 pb-3.5 pt-1 text-[12.5px] text-[#475569] leading-relaxed border-t border-[#F2F4F7]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Raise an Issue Sheet */}
      {issueOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/45" onClick={() => setIssueOpen(false)} />
          <div className="relative z-10 w-full max-w-[402px] bg-white rounded-t-[28px] p-5 pb-9 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[17px] font-bold text-[#111827]">Raise a Support Ticket</h2>
              <button
                type="button"
                onClick={() => setIssueOpen(false)}
                aria-label="Close raise issue sheet"
                className="w-8 h-8 rounded-full bg-[#F2F4F7] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              rows={3}
              value={issueText}
              onChange={(e) => setIssueText(e.target.value)}
              placeholder="Describe your RC, DL, or payment query..."
              className="w-full rounded-xl bg-[#F2F4F7] p-3 text-[13px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0095F6]"
            />
            <button
              type="button"
              onClick={() => {
                if (!issueText.trim()) {
                  hapticWarning();
                  onShowToast('Please enter issue details first.', 'warning');
                  return;
                }
                hapticSuccess();
                setIssueOpen(false);
                setIssueText('');
                onShowToast('Support Ticket #NIC-90412 raised successfully', 'success');
              }}
              className="mt-3 w-full h-11 rounded-xl bg-[#0095F6] text-white font-bold text-[13.5px] cursor-pointer"
            >
              Submit Ticket
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
