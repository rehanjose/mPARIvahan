import React from 'react';
import { OnboardingFlowId } from '../types';

interface IPhoneFrameProps {
  children: React.ReactNode;
  darkStatusBar?: boolean;
  activeFlow: OnboardingFlowId;
  onSelectFlow: (flow: OnboardingFlowId) => void;
}

const FLOW_OPTIONS: { id: OnboardingFlowId; label: string; desc: string }[] = [
  { id: 'flow-1-signup', label: 'Flow 1 · First-Time Sign Up', desc: 'Welcome → Sign Up → OTP → Sign In' },
  { id: 'flow-2-signin', label: 'Flow 2 · First-Time Sign In', desc: 'Welcome → MPIN → Device OTP → Home' },
  { id: 'flow-3-switch', label: 'Flow 3 · Switch Account', desc: 'Malavika → Log Out → Different Acct' },
  { id: 'flow-4-second-account', label: 'Flow 4 · Register 2nd Account', desc: 'Malavika → Log Out → Sign Up 2nd' },
  { id: 'flow-5-both-saved', label: 'Flow 5 · Both Accounts Saved', desc: 'Saved List → Instant MPIN / Face ID' },
  { id: 'after-onboarding', label: 'After Onboarding · Home', desc: 'Complete Core Services & All Hubs' },
];

export function IPhoneFrame({
  children,
  darkStatusBar = false,
  activeFlow,
  onSelectFlow,
}: IPhoneFrameProps) {
  const statusColor = darkStatusBar ? 'text-white' : 'text-[#111827]';
  const indicatorBg = darkStatusBar ? 'bg-white/90' : 'bg-[#111827]';

  return (
    <div className="min-h-screen w-full bg-[#E5E7EB] flex items-center justify-center gap-7 p-2 sm:p-4 overflow-x-hidden">
      {/* Subtle Figma Prototype Scenario Launcher (Desktop side rail outside iPhone bezel) */}
      <aside
        aria-label="Figma Onboarding Scenarios"
        className="hidden xl:flex flex-col w-[248px] shrink-0 bg-white/85 backdrop-blur-xs border border-[#D1D5DB] rounded-[24px] p-4 shadow-sm"
      >
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">
          Figma Scenarios
        </p>
        <h2 className="mt-1 text-[16px] font-extrabold text-[#111827] leading-snug">
          Onboarding & App Flows
        </h2>
        <p className="mt-1 text-[11.5px] text-[#667085] leading-relaxed">
          Launch any Figma flow state directly or walk through naturally inside the phone.
        </p>

        <div className="mt-3.5 space-y-1.5">
          {FLOW_OPTIONS.map((item) => {
            const active = activeFlow === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectFlow(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all cursor-pointer ${
                  active
                    ? 'bg-[#EBF5FF] border-[#0095F6] text-[#0369A1]'
                    : 'bg-white border-transparent hover:bg-[#F3F4F6] text-[#111827]'
                }`}
              >
                <p className="text-[12.5px] font-bold leading-snug">{item.label}</p>
                <p className="text-[10.5px] text-[#667085] mt-0.5 leading-snug">{item.desc}</p>
              </button>
            );
          })}
        </div>
      </aside>

      {/* iPhone 17 Outer Hardware Bezel — transform creates containing block for fixed sheets/modals */}
      <div
        className="relative [transform:translateZ(0)] w-[402px] h-[874px] shrink-0 rounded-[44px] bg-[#FFFFFF] shadow-[0_24px_60px_-12px_rgba(15,23,42,0.28),0_0_0_1px_rgba(15,23,42,0.08)] ring-[6px] ring-[#1F2937] overflow-hidden flex flex-col"
        data-testid="iphone-17-frame"
      >
        {/* Top iOS Status Bar + Dynamic Island */}
        <div
          className={`relative z-30 h-[50px] w-full shrink-0 flex items-center justify-between px-7 pt-2 select-none transition-colors duration-200 ${
            darkStatusBar ? 'bg-[#0F172A]' : 'bg-transparent'
          }`}
        >
          {/* Time */}
          <span
            className={`text-[15px] font-semibold tracking-[-0.02em] leading-none ${statusColor}`}
          >
            9:41
          </span>

          {/* Dynamic Island */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 -translate-x-1/2 top-[11px] w-[124px] h-[34px] rounded-full bg-[#09090B] flex items-center justify-end pr-3 shadow-inner"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#1E293B] ring-1 ring-[#334155]/60" />
          </div>

          {/* Signal, Wi-Fi, Battery */}
          <div className={`flex items-center gap-1.5 ${statusColor}`} aria-hidden="true">
            <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
              <rect x="0.5" y="7.5" width="3" height="4" rx="0.8" />
              <rect x="4.8" y="5.2" width="3" height="6.3" rx="0.8" />
              <rect x="9.1" y="2.8" width="3" height="8.7" rx="0.8" />
              <rect x="13.4" y="0.5" width="3" height="11" rx="0.8" />
            </svg>
            <svg
              width="15"
              height="12"
              viewBox="0 0 16 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            >
              <path d="M1.5 4.3C5.1 1 10.9 1 14.5 4.3" />
              <path d="M4.1 7C6.3 5 9.7 5 11.9 7" />
              <circle cx="8" cy="10" r="1.2" fill="currentColor" stroke="none" />
            </svg>
            <div className="flex items-center gap-[1.5px]">
              <div className="w-[23px] h-[12px] rounded-[3.5px] border-[1.5px] border-current p-[1.5px] flex items-center">
                <div className="w-[17px] h-full rounded-[1.5px] bg-current" />
              </div>
              <div className="w-[1.5px] h-[4.5px] rounded-r-full bg-current opacity-70" />
            </div>
          </div>
        </div>

        {/* App Viewport Content Area */}
        <div className="relative flex-1 w-full overflow-hidden flex flex-col">
          {children}
        </div>

        {/* Bottom iOS Home Indicator */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[7px] left-1/2 -translate-x-1/2 z-50"
        >
          <div className={`w-[134px] h-[5px] rounded-full transition-colors ${indicatorBg}`} />
        </div>
      </div>
    </div>
  );
}
