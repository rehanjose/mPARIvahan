import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Siren,
  Hospital,
  ClipboardCheck,
  UserCheck,
  ShieldCheck,
  MapPin,
  X,
} from 'lucide-react';
import { PM_RAHAT_ACCORDIONS } from '../../data/mockData';
import { hapticSuccess, hapticTap, hapticWarning } from '../../utils/haptics';

interface PmRahatScreenProps {
  onBack: () => void;
  onOpenHospitalsNearby: () => void;
  onShowToast: (text: string, tone?: 'success' | 'info' | 'warning') => void;
}

export function PmRahatScreen({
  onBack,
  onOpenHospitalsNearby,
  onShowToast,
}: PmRahatScreenProps) {
  const [openAccordion, setOpenAccordion] = useState<string>('eligibility');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [accidentLoc, setAccidentLoc] = useState('NH 66 Bypass, Near Edappally Flyover');
  const [victimsCount, setVictimsCount] = useState('1');
  const [activeReportsCount, setActiveReportsCount] = useState(1);

  const handleSubmitAccident = (e: React.FormEvent) => {
    e.preventDefault();
    hapticSuccess();
    setActiveReportsCount((c) => c + 1);
    setReportModalOpen(false);
    onShowToast('Emergency eDAR alert dispatched to 112 Police & nearest PM Rahat Hospital', 'success');
  };

  return (
    <div className="flex-1 bg-white overflow-y-auto no-scrollbar pb-6 relative">
      {/* Header */}
      <header className="px-4 pt-2 pb-2.5 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-20 border-b border-[#F2F4F7]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to Home"
            className="w-9 h-9 -ml-2 rounded-full flex items-center justify-center text-[#111827] hover:bg-[#F2F4F7] cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-[19px] font-extrabold tracking-tight text-[#111827]">
              PM Rahat
            </h1>
            <p className="text-[11px] text-[#667085]">
              Cashless Road Accident Treatment Scheme
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#16A34A] text-[11px] font-bold">
          ₹1.5L Cover
        </span>
      </header>

      <div className="px-4 pt-3.5 space-y-4">
        {/* Top Urgent Actions (2 Cards) */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              hapticWarning();
              setReportModalOpen(true);
            }}
            className="text-left rounded-[20px] bg-[#FEF2F2] border border-[#FECACA] hover:bg-[#FEE2E2] p-4 flex flex-col justify-between min-h-[132px] transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E31E24] text-white flex items-center justify-center shadow-xs">
              <Siren className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <p className="text-[14.5px] font-extrabold text-[#991B1B] leading-tight">
                Report Road Accident
              </p>
              <p className="mt-1 text-[11px] text-[#B91C1C]">
                Instant Police & Ambulance alert
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              hapticTap();
              onOpenHospitalsNearby();
            }}
            className="text-left rounded-[20px] bg-[#EBF5FF] border border-[#BFDBFE] hover:bg-[#DBEAFE] p-4 flex flex-col justify-between min-h-[132px] transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#0095F6] text-white flex items-center justify-center shadow-xs">
              <Hospital className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <p className="text-[14.5px] font-extrabold text-[#0369A1] leading-tight">
                Hospitals Nearby
              </p>
              <p className="mt-1 text-[11px] text-[#0284C7]">
                PM Rahat empaneled trauma care
              </p>
            </div>
          </button>
        </div>

        {/* Track & Support Card */}
        <section className="rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_2px_10px_rgba(15,23,42,0.03)] overflow-hidden">
          <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E2E8F0]">
            <h2 className="text-[12.5px] font-bold uppercase tracking-wider text-[#667085]">
              Track & Support
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setStatusModalOpen(true)}
            className="w-full px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-[#F8FAFC] transition-colors border-b border-[#F2F4F7] cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center shrink-0">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-[13.5px] font-bold text-[#111827] leading-snug">
                  My Reports & Police Response Status
                </p>
                <p className="text-[11.5px] font-semibold text-[#D97706]">
                  {activeReportsCount} Active • eDAR Verification In Progress
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#94A3B8] shrink-0" />
          </button>

          <button
            type="button"
            onClick={() =>
              onShowToast('District Grievance Officer (Ernakulam): 0484-2422108', 'info')
            }
            className="w-full px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#EBF5FF] text-[#0095F6] flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-[13.5px] font-bold text-[#111827]">
                  Grievance Redressal Officer
                </p>
                <p className="text-[11.5px] text-[#667085]">
                  Escalate hospital denial or claim delay
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#94A3B8] shrink-0" />
          </button>
        </section>

        {/* Scheme Guidelines & Info Interactive Accordion */}
        <section>
          <h2 className="text-[15.5px] font-extrabold text-[#111827] mb-2.5">
            Scheme Guidelines & Info
          </h2>
          <div className="space-y-2">
            {PM_RAHAT_ACCORDIONS.map((item) => {
              const expanded = openAccordion === item.id;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-white border border-[#E2E8F0] overflow-hidden"
                >
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setOpenAccordion(expanded ? '' : item.id)}
                    className="w-full px-4 py-3.5 flex items-center justify-between gap-2 text-left hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                  >
                    <span className="text-[13.5px] font-bold text-[#111827]">{item.title}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#667085] transition-transform shrink-0 ${
                        expanded ? 'rotate-180 text-[#0095F6]' : ''
                      }`}
                    />
                  </button>
                  {expanded && (
                    <div className="px-4 pb-4 pt-0.5 text-[12.5px] text-[#475569] leading-relaxed border-t border-[#F2F4F7]">
                      {item.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Report Road Accident Sheet */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setReportModalOpen(false)} />
          <div className="relative z-10 w-full max-w-[402px] bg-white rounded-t-[28px] p-5 pb-9 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[11px] font-bold uppercase text-[#E31E24]">
                  GOOD SAMARITAN PROTECTED • SEC 134A
                </p>
                <h2 className="text-[18px] font-extrabold text-[#111827]">
                  Report Road Accident
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                aria-label="Close accident report modal"
                className="w-8 h-8 rounded-full bg-[#F2F4F7] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmitAccident} className="space-y-3.5">
              <div>
                <label className="block text-[12px] font-semibold text-[#111827] mb-1">
                  Accident Location (GPS Locked)
                </label>
                <div className="flex items-center gap-2 h-11 px-3 rounded-xl bg-[#F2F4F7]">
                  <MapPin className="w-4 h-4 text-[#E31E24] shrink-0" />
                  <input
                    type="text"
                    value={accidentLoc}
                    onChange={(e) => setAccidentLoc(e.target.value)}
                    className="flex-1 bg-transparent text-[13px] font-medium text-[#111827] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#111827] mb-1">
                  Estimated Injured Persons
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['1', '2', '3+'].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setVictimsCount(cnt)}
                      className={`h-10 rounded-xl text-[13px] font-bold cursor-pointer ${
                        victimsCount === cnt
                          ? 'bg-[#E31E24] text-white'
                          : 'bg-[#F2F4F7] text-[#111827]'
                      }`}
                    >
                      {cnt} Victim{cnt !== '1' ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="w-full h-12 rounded-2xl bg-[#E31E24] hover:bg-[#C8191E] text-white font-bold text-[14.5px] cursor-pointer"
              >
                Dispatch Ambulance (108) & Police (112)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Active Report Status Sheet */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setStatusModalOpen(false)} />
          <div className="relative z-10 w-full max-w-[402px] bg-white rounded-t-[28px] p-5 pb-9 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[17px] font-extrabold text-[#111827]">
                Active PM Rahat Case
              </h2>
              <button
                type="button"
                onClick={() => setStatusModalOpen(false)}
                aria-label="Close active case modal"
                className="w-8 h-8 rounded-full bg-[#F2F4F7] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-4 space-y-2 text-[12.5px]">
              <div className="flex justify-between">
                <span className="text-[#667085]">Case ID</span>
                <span className="font-mono-code font-bold text-[#111827]">#PMR-KL-20491</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Empaneled Hospital</span>
                <span className="font-semibold text-[#111827]">Sunrise Hospital, Kakkanad</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Cashless Cover Approved</span>
                <span className="font-bold text-[#16A34A] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> ₹1,50,000 (7 Days)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Police eDAR Status</span>
                <span className="font-bold text-[#D97706]">Verified by SHO Edappally</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
