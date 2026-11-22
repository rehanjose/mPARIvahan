import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronDown,
  Camera,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileCheck2,
  Check,
  Lock,
} from 'lucide-react';
import { INDIAN_STATES } from '../../data/mockData';
import { SentinelReport } from '../../types';
import { hapticTap, hapticWarning } from '../../utils/haptics';

const VIOLATION_TYPES = [
  'Overspeeding / Rash Driving',
  'Signal Jumping',
  'Wrong Side Driving',
  'Riding Without Helmet',
  'Triple Riding',
  'No Parking / Footpath Obstruction',
  'Using Mobile Phone While Driving',
];

interface CitizenSentinelScreenProps {
  selectedState: string;
  onChangeState: (st: string) => void;
  reports: SentinelReport[];
  onSubmitReport: (input: {
    violationType: string;
    vehicleNo: string;
    location: string;
    state: string;
    mediaName: string;
  }) => SentinelReport;
  onBack: () => void;
  onShowToast: (text: string, tone?: 'success' | 'info' | 'warning') => void;
}

export function CitizenSentinelScreen({
  selectedState,
  onChangeState,
  reports,
  onSubmitReport,
  onBack,
  onShowToast,
}: CitizenSentinelScreenProps) {
  const [tab, setTab] = useState<'report' | 'my-reports'>('report');
  const [stateOpen, setStateOpen] = useState(false);
  const [mediaAttached, setMediaAttached] = useState<string>('');
  const [violationType, setViolationType] = useState(VIOLATION_TYPES[0]);
  const [vehicleNo, setVehicleNo] = useState('');
  const [location, setLocation] = useState('NH 66, Edappally');
  const [error, setError] = useState('');
  const [submittedTracker, setSubmittedTracker] = useState<SentinelReport | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaAttached) {
      hapticWarning();
      setError('Please capture or attach a photo/video of the violation.');
      return;
    }
    if (vehicleNo.trim().replace(/\s/g, '').length < 6) {
      hapticWarning();
      setError('Enter the violator vehicle number (e.g. KL 07 CD 4412).');
      return;
    }
    setError('');
    const created = onSubmitReport({
      violationType,
      vehicleNo,
      location,
      state: selectedState,
      mediaName: mediaAttached,
    });
    setSubmittedTracker(created);
    setMediaAttached('');
    setVehicleNo('');
    onShowToast(`Anonymous report ${created.id} submitted to RTO`, 'success');
  };

  return (
    <div className="flex-1 bg-white overflow-y-auto no-scrollbar pb-6">
      {/* Header */}
      <header className="px-4 pt-2 pb-2.5 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-20">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (submittedTracker) {
                setSubmittedTracker(null);
              } else {
                onBack();
              }
            }}
            aria-label="Back"
            className="w-9 h-9 -ml-2 rounded-full flex items-center justify-center text-[#111827] hover:bg-[#F2F4F7] cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-[19px] font-extrabold tracking-tight text-[#111827]">
            Citizen Sentinel
          </h1>
        </div>

        {/* State Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setStateOpen((o) => !o)}
            className="h-8 px-3 rounded-full bg-[#F2F4F7] text-[12.5px] font-semibold text-[#111827] flex items-center gap-1 cursor-pointer"
          >
            <span>{selectedState}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#667085]" />
          </button>
          {stateOpen && (
            <div className="absolute right-0 top-9 z-30 w-40 rounded-xl bg-white border border-[#E2E8F0] shadow-xl py-1 max-h-48 overflow-y-auto">
              {INDIAN_STATES.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    onChangeState(st);
                    setStateOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 text-left text-[12.5px] flex items-center justify-between cursor-pointer ${
                    selectedState === st
                      ? 'bg-[#EBF5FF] text-[#0095F6] font-semibold'
                      : 'text-[#111827] hover:bg-[#F2F4F7]'
                  }`}
                >
                  <span>{st}</span>
                  {selectedState === st && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="px-4 space-y-4">
        {/* POST-SUBMISSION 3-STEP LIVE TRACKER */}
        {submittedTracker ? (
          <div className="pt-2 space-y-4">
            <div className="rounded-[20px] bg-white border border-[#E2E8F0] shadow-[0_4px_16px_rgba(15,23,42,0.05)] p-5 text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-[#ECFDF5] text-[#16A34A] flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="mt-3 text-[16px] font-extrabold text-[#111827] leading-snug">
                Thank You for Keeping Roads Safe!
              </p>
              <span className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] text-[#16A34A] text-[11.5px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Your identity is 100% anonymous
              </span>
              <h2 className="font-mono-code text-[20px] font-extrabold text-[#111827] mt-2.5">
                {submittedTracker.id}
              </h2>

              <div className="mt-4 pt-3.5 border-t border-[#F2F4F7] text-left space-y-1.5 text-[12.5px]">
                <div className="flex justify-between">
                  <span className="text-[#667085]">Vehicle</span>
                  <span className="font-mono-code font-bold text-[#111827]">
                    {submittedTracker.vehicleNo}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085]">Violation</span>
                  <span className="font-semibold text-[#111827]">
                    {submittedTracker.violationType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085]">Location</span>
                  <span className="font-semibold text-[#111827]">
                    {submittedTracker.location}
                  </span>
                </div>
              </div>
            </div>

            {/* 3-Step Live Tracker */}
            <div className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-4">
              <h3 className="text-[13.5px] font-bold text-[#111827] mb-3.5">
                Live Verification Progress
              </h3>
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#16A34A] text-white flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4" strokeWidth={2.8} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#111827]">1. Report Submitted ✓</p>
                    <p className="text-[11.5px] text-[#667085]">
                      {submittedTracker.submittedAt}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#EBF5FF] border-2 border-[#0095F6] text-[#0095F6] flex items-center justify-center shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#0095F6]">
                      2. RTO / Traffic Police Review
                    </p>
                    <p className="text-[11.5px] text-[#667085]">
                      Estimated time: 24–48 hours • {submittedTracker.state} Enforcement Desk
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3 opacity-60">
                  <div className="w-7 h-7 rounded-full bg-[#E2E8F0] text-[#667085] flex items-center justify-center shrink-0 text-[12px] font-bold">
                    3
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#111827]">3. Challan Issued to Violator</p>
                    <p className="text-[11.5px] text-[#667085]">
                      You&apos;ll be notified once action is taken.
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  hapticTap();
                  setSubmittedTracker(null);
                  setTab('my-reports');
                }}
                className="w-full h-12 rounded-2xl bg-[#0095F6] hover:bg-[#0082D6] text-white font-bold text-[14.5px] transition-colors cursor-pointer"
              >
                View All My Reports
              </button>
              <button
                type="button"
                onClick={onBack}
                className="w-full h-11 rounded-2xl bg-[#F2F4F7] hover:bg-[#E2E8F0] text-[#111827] font-semibold text-[13.5px] transition-colors cursor-pointer"
              >
                Back to Home
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Segmented Toggle: Report Violation | My Reports (N) */}
            <div className="grid grid-cols-2 p-1 rounded-[14px] bg-[#F2F4F7]">
              <button
                type="button"
                onClick={() => setTab('report')}
                className={`h-9 rounded-[10px] text-[13px] font-bold transition-all cursor-pointer ${
                  tab === 'report'
                    ? 'bg-[#0095F6] text-white shadow-xs'
                    : 'text-[#475569] hover:text-[#111827]'
                }`}
              >
                Report Violation
              </button>
              <button
                type="button"
                onClick={() => setTab('my-reports')}
                className={`h-9 rounded-[10px] text-[13px] font-bold transition-all cursor-pointer ${
                  tab === 'my-reports'
                    ? 'bg-[#0095F6] text-white shadow-xs'
                    : 'text-[#475569] hover:text-[#111827]'
                }`}
              >
                My Reports ({reports.length})
              </button>
            </div>

            {tab === 'report' ? (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Dashed Upload Box */}
                <button
                  type="button"
                  onClick={() => {
                    hapticTap();
                    setMediaAttached('NH66_violation_evidence.jpg');
                    setError('');
                    onShowToast('Geo-tagged photo attached from camera', 'info');
                  }}
                  className={`w-full rounded-2xl border-2 border-dashed p-5 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
                    mediaAttached
                      ? 'border-[#16A34A] bg-[#ECFDF5]'
                      : 'border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#F2F4F7]'
                  }`}
                >
                  {mediaAttached ? (
                    <>
                      <FileCheck2 className="w-8 h-8 text-[#16A34A] mb-1.5" />
                      <p className="font-mono-code text-[12.5px] font-bold text-[#166534]">
                        {mediaAttached}
                      </p>
                      <p className="text-[11px] text-[#16A34A] mt-0.5">
                        GPS & Timestamp embedded • Tap to replace
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-11 h-11 rounded-full bg-[#EBF5FF] text-[#0095F6] flex items-center justify-center mb-2">
                        <Camera className="w-5 h-5" />
                      </div>
                      <p className="text-[13.5px] font-bold text-[#111827]">
                        Capture or Upload Photo / Video
                      </p>
                      <p className="text-[11.5px] text-[#667085] mt-0.5">
                        Ensure vehicle number plate is clearly visible
                      </p>
                    </>
                  )}
                </button>

                {/* Violation Type Dropdown */}
                <div>
                  <label htmlFor="cs-violation" className="block text-[12px] font-semibold text-[#111827] mb-1">
                    Violation Type
                  </label>
                  <select
                    id="cs-violation"
                    value={violationType}
                    onChange={(e) => setViolationType(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#F2F4F7] text-[13.5px] font-medium text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0095F6]"
                  >
                    {VIOLATION_TYPES.map((vt) => (
                      <option key={vt} value={vt}>
                        {vt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vehicle Number Input */}
                <div>
                  <label htmlFor="cs-vehicle" className="block text-[12px] font-semibold text-[#111827] mb-1">
                    Offending Vehicle Number
                  </label>
                  <input
                    id="cs-vehicle"
                    type="text"
                    placeholder="e.g. KL 07 CD 4412"
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#F2F4F7] font-mono-code text-[14px] text-[#111827] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0095F6]"
                  />
                </div>

                {/* Auto-Detected GPS Location */}
                <div>
                  <label htmlFor="cs-location" className="block text-[12px] font-semibold text-[#111827] mb-1">
                    Auto-Detected GPS Location
                  </label>
                  <div className="flex items-center gap-2 h-11 px-3.5 rounded-xl bg-[#F2F4F7]">
                    <MapPin className="w-4 h-4 text-[#0095F6] shrink-0" />
                    <input
                      id="cs-location"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="flex-1 bg-transparent text-[13.5px] font-medium text-[#111827] focus:outline-none"
                    />
                  </div>
                </div>

                {error && <p className="text-[12px] font-medium text-[#E31E24]">{error}</p>}

                <button
                  type="submit"
                  className="w-full h-12 rounded-2xl bg-[#0095F6] hover:bg-[#0082D6] text-white font-bold text-[14.5px] shadow-[0_6px_16px_rgba(0,149,246,0.28)] transition-colors cursor-pointer"
                >
                  Submit Violation Report
                </button>

                <p className="flex items-center justify-center gap-1.5 text-[11.5px] text-[#667085] pt-0.5">
                  <Lock className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Your identity remains strictly confidential.</span>
                </p>
              </form>
            ) : (
              /* MY REPORTS TAB */
              <div className="space-y-3">
                {reports.map((rep) => {
                  const badgeCls =
                    rep.step === 3
                      ? 'bg-[#ECFDF5] text-[#16A34A]'
                      : rep.step === 2
                      ? 'bg-[#FFFBEB] text-[#D97706]'
                      : 'bg-[#EBF5FF] text-[#0095F6]';
                  return (
                    <button
                      key={rep.id}
                      type="button"
                      onClick={() => setSubmittedTracker(rep)}
                      className="w-full text-left rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_2px_10px_rgba(15,23,42,0.03)] p-4 hover:border-[#0095F6]/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono-code text-[14px] font-bold text-[#111827]">
                          {rep.id}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${badgeCls}`}
                        >
                          {rep.statusLabel}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[13.5px] font-bold text-[#111827]">
                        {rep.violationType}
                      </p>
                      <p className="mt-0.5 text-[12px] text-[#667085]">
                        <span className="font-mono-code font-semibold text-[#475569]">
                          {rep.vehicleNo}
                        </span>{' '}
                        • {rep.location}
                      </p>
                      <p className="mt-2 text-[11px] text-[#94A3B8]">{rep.submittedAt}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
