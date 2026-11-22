import React, { useState } from 'react';
import {
  ChevronRight,
  Globe,
  Settings,
  HelpCircle,
  Info,
  Users,
  LogOut,
  X,
  Check,
  Share2,
} from 'lucide-react';
import { LanguageCode, SavedAccount, ScreenRoute } from '../../types';

const LANGUAGES: { code: LanguageCode; sub: string }[] = [
  { code: 'English', sub: 'Default' },
  { code: 'हिन्दी', sub: 'Hindi' },
  { code: 'മലയാളം', sub: 'Malayalam' },
  { code: 'தமிழ்', sub: 'Tamil' },
  { code: 'ಕನ್ನಡ', sub: 'Kannada' },
];

interface HamburgerDrawerProps {
  open: boolean;
  account: SavedAccount;
  language: LanguageCode;
  onChangeLanguage: (lang: LanguageCode) => void;
  onClose: () => void;
  onNavigate: (route: ScreenRoute) => void;
  onSwitchAccount: () => void;
  onLogout: () => void;
  onShowToast: (text: string, tone?: 'success' | 'info' | 'warning') => void;
}

export function HamburgerDrawer({
  open,
  account,
  language,
  onChangeLanguage,
  onClose,
  onNavigate,
  onSwitchAccount,
  onLogout,
  onShowToast,
}: HamburgerDrawerProps) {
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0F172A]/45 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* 78% Width Slide-Over Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Account and Settings Drawer"
        className="relative z-10 w-[78%] max-w-[314px] h-full bg-white shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Sky-Blue Gradient Header */}
        <div className="bg-gradient-to-br from-[#0095F6] via-[#0284C7] to-[#0369A1] text-white px-5 pt-14 pb-5">
          <div className="flex items-start justify-between">
            <div className="w-13 h-13 rounded-full bg-white/20 ring-2 ring-white/50 flex items-center justify-center font-extrabold text-[18px]">
              {account.initials}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h2 className="mt-3 text-[18px] font-extrabold leading-tight">{account.name}</h2>
          <div className="mt-0.5 flex items-center gap-2">
            <p className="font-mono-code text-[12.5px] text-white/90">{account.phone}</p>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold text-white">
              Verified ✓
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigate('profile');
            }}
            className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-[12px] font-semibold transition-colors cursor-pointer"
          >
            <span>View Profile</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <button
            type="button"
            onClick={() => setLangModalOpen(true)}
            className="w-full px-3 py-3 rounded-xl hover:bg-[#F2F4F7] flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-[#0095F6]" />
              <div className="text-left">
                <p className="text-[14px] font-semibold text-[#111827]">Language</p>
                <p className="text-[11.5px] text-[#667085]">{language}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigate('settings');
            }}
            className="w-full px-3 py-3 rounded-xl hover:bg-[#F2F4F7] flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-[#0095F6]" />
              <div className="text-left">
                <p className="text-[14px] font-semibold text-[#111827]">Settings & Security</p>
                <p className="text-[11.5px] text-[#667085]">MPIN, Face ID, Notifications</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigate('help');
            }}
            className="w-full px-3 py-3 rounded-xl hover:bg-[#F2F4F7] flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-[#0095F6]" />
              <div className="text-left">
                <p className="text-[14px] font-semibold text-[#111827]">Help & Support</p>
                <p className="text-[11.5px] text-[#667085]">FAQs, 24/7 Helpline, Raise Issue</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
          </button>

          <button
            type="button"
            onClick={() => setAboutModalOpen(true)}
            className="w-full px-3 py-3 rounded-xl hover:bg-[#F2F4F7] flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-[#0095F6]" />
              <div className="text-left">
                <p className="text-[14px] font-semibold text-[#111827]">About & Share App</p>
                <p className="text-[11.5px] text-[#667085]">IT Act 2000 & App Link</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
          </button>
        </div>

        {/* Pinned Bottom Auth Actions + Version */}
        <div className="border-t border-[#E2E8F0] p-4 pb-7 space-y-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onSwitchAccount();
            }}
            className="w-full h-11 rounded-xl bg-[#EBF5FF] hover:bg-[#DBEAFE] text-[#0095F6] text-[13.5px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Switch Account</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full h-11 rounded-xl bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#E31E24] text-[13.5px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>

          <p className="pt-1 text-center font-mono-code text-[11px] text-[#94A3B8]">
            NextGen mParivahan • v5.0.63
          </p>
        </div>
      </aside>

      {/* Live Language Switcher Modal */}
      {langModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-5">
          <div
            className="absolute inset-0 bg-black/45"
            onClick={() => setLangModalOpen(false)}
          />
          <div className="relative z-10 w-full rounded-3xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[17px] font-extrabold text-[#111827]">App Language</h3>
              <button
                type="button"
                onClick={() => setLangModalOpen(false)}
                aria-label="Close language picker"
                className="w-8 h-8 rounded-full bg-[#F2F4F7] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1.5">
              {LANGUAGES.map((l) => {
                const active = language === l.code;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      onChangeLanguage(l.code);
                      setLangModalOpen(false);
                      onShowToast(`Language switched to ${l.code}`, 'success');
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between cursor-pointer ${
                      active
                        ? 'bg-[#EBF5FF] text-[#0095F6] font-bold'
                        : 'hover:bg-[#F2F4F7] text-[#111827]'
                    }`}
                  >
                    <div className="text-left">
                      <p className="text-[14px]">{l.code}</p>
                      <p className="text-[11px] text-[#667085]">{l.sub}</p>
                    </div>
                    {active && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* About & Share Modal */}
      {aboutModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-5">
          <div
            className="absolute inset-0 bg-black/45"
            onClick={() => setAboutModalOpen(false)}
          />
          <div className="relative z-10 w-full rounded-3xl bg-white p-5 shadow-2xl text-center">
            <h3 className="text-[18px] font-extrabold text-[#111827]">
              NextGen mParivahan
            </h3>
            <p className="font-mono-code text-[12px] text-[#0095F6] font-semibold mt-0.5">
              Version v5.0.63
            </p>
            <p className="mt-3 text-[12.5px] text-[#475569] leading-relaxed">
              Official citizen transport services application developed by National Informatics Centre (NIC) for the Ministry of Road Transport & Highways, Government of India.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setAboutModalOpen(false);
                  onShowToast('App download link copied to clipboard', 'success');
                }}
                className="flex-1 h-10 rounded-xl bg-[#0095F6] text-white text-[13px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share App</span>
              </button>
              <button
                type="button"
                onClick={() => setAboutModalOpen(false)}
                className="px-4 h-10 rounded-xl bg-[#F2F4F7] text-[#111827] text-[13px] font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
