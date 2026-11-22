import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Share2,
  Download,
  RefreshCw,
  Trash2,
  FileWarning,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RotateCw,
  X,
} from 'lucide-react';
import { DrivingLicenceRecord, VehicleRecord } from '../../types';
import { QrCodeSvg } from '../QrCodeSvg';
import { maskDocumentId } from '../../utils/appLogic';

type DocMode = 'dl' | 'rc';
type RcSubTab = 'owned' | 'shared' | 'received';

interface VirtualDocumentsScreenProps {
  initialMode?: DocMode;
  initialFlipped?: boolean;
  dl: DrivingLicenceRecord;
  vehicles: VehicleRecord[];
  onBack: () => void;
  onOpenChallanTab: () => void;
  onShowToast: (text: string, tone?: 'success' | 'info' | 'warning') => void;
}

export function VirtualDocumentsScreen({
  initialMode = 'dl',
  initialFlipped = false,
  dl,
  vehicles,
  onBack,
  onOpenChallanTab,
  onShowToast,
}: VirtualDocumentsScreenProps) {
  const [mode, setMode] = useState<DocMode>(initialMode);
  const [rcSubTab, setRcSubTab] = useState<RcSubTab>('owned');
  const [isFlipped, setIsFlipped] = useState<boolean>(initialFlipped);
  const [isMasked, setIsMasked] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [shareOpen, setShareOpen] = useState<boolean>(false);
  const [sharePhone, setSharePhone] = useState<string>('');
  const [sharedRecipients, setSharedRecipients] = useState<string[]>([
    'Ananya Jose • +91 98470 55412',
  ]);

  const primaryVehicle = vehicles[0];

  useEffect(() => {
    setMode(initialMode);
    setIsFlipped(initialFlipped);
  }, [initialMode, initialFlipped]);

  const handleToggleFlip = () => setIsFlipped((prev) => !prev);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      onShowToast(
        mode === 'dl'
          ? 'Virtual DL synced with Sarathi 4.0'
          : 'Virtual RC synced with Vahan 4.0',
        'success'
      );
    }, 500);
  };

  const handleShareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sharePhone.replace(/\D/g, '').length < 10) {
      onShowToast('Enter a valid 10-digit mobile number to share.', 'warning');
      return;
    }
    const clean = sharePhone.replace(/\D/g, '').slice(-10);
    setSharedRecipients((prev) => [`Shared Contact • +91 ${clean}`, ...prev]);
    setSharePhone('');
    setShareOpen(false);
    onShowToast(`Virtual ${mode.toUpperCase()} shared securely with +91 ${clean}`, 'success');
  };

  return (
    <div className="flex-1 bg-white overflow-y-auto no-scrollbar pb-6 relative">
      {/* Header */}
      <header className="px-4 pt-2 pb-2.5 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-20">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to Home"
            className="w-9 h-9 -ml-2 rounded-full flex items-center justify-center text-[#111827] hover:bg-[#F2F4F7] cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-[19px] font-extrabold tracking-tight text-[#111827]">
            Virtual Documents
          </h1>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#16A34A] text-[11px] font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          IT Act 2000
        </span>
      </header>

      <div className="px-4 space-y-3.5">
        {/* Segmented Toggle: My Virtual DL | My Virtual RC */}
        <div
          role="tablist"
          aria-label="Virtual Document Type"
          className="grid grid-cols-2 p-1 rounded-[14px] bg-[#F2F4F7]"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'dl'}
            onClick={() => {
              setMode('dl');
              setIsFlipped(false);
            }}
            className={`h-9 rounded-[10px] text-[13px] font-bold transition-all cursor-pointer ${
              mode === 'dl'
                ? 'bg-[#0095F6] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#111827]'
            }`}
          >
            My Virtual DL
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'rc'}
            onClick={() => {
              setMode('rc');
              setIsFlipped(false);
            }}
            className={`h-9 rounded-[10px] text-[13px] font-bold transition-all cursor-pointer ${
              mode === 'rc'
                ? 'bg-[#0095F6] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#111827]'
            }`}
          >
            My Virtual RC
          </button>
        </div>

        {/* Sub-pills for My Virtual RC */}
        {mode === 'rc' && (
          <div className="flex items-center gap-2">
            {(
              [
                { id: 'owned', label: `Owned (${vehicles.length >= 1 ? 1 : 0})` },
                { id: 'shared', label: `Shared RC (${sharedRecipients.length})` },
                { id: 'received', label: 'Received RC' },
              ] as { id: RcSubTab; label: string }[]
            ).map((sub) => {
              const active = rcSubTab === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setRcSubTab(sub.id)}
                  className={`px-3 py-1.5 rounded-full text-[11.5px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#111827] text-white'
                      : 'bg-[#F2F4F7] text-[#475569] hover:bg-[#E2E8F0]'
                  }`}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Shared / Received Sub-Views for RC */}
        {mode === 'rc' && rcSubTab !== 'owned' ? (
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-3">
            {rcSubTab === 'shared' ? (
              <>
                <h2 className="text-[14px] font-bold text-[#111827]">
                  Active Shared RC Access
                </h2>
                {sharedRecipients.map((person, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl bg-white border border-[#E2E8F0] p-3 flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-[13px] font-semibold text-[#111827]">{person}</p>
                      <p className="font-mono-code text-[11.5px] text-[#667085]">
                        KL 42 AB 5784 • Valid 30 days
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSharedRecipients((prev) => prev.filter((_, i) => i !== idx));
                        onShowToast('Shared RC access revoked', 'info');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#FEF2F2] text-[#E31E24] text-[11.5px] font-bold cursor-pointer"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setShareOpen(true)}
                  className="w-full h-10 rounded-xl bg-[#0095F6] text-white text-[13px] font-bold cursor-pointer"
                >
                  + Share RC with Family Member
                </button>
              </>
            ) : (
              <div className="py-6 text-center">
                <p className="text-[14px] font-bold text-[#111827]">No Received RCs Yet</p>
                <p className="mt-1 text-[12px] text-[#667085]">
                  When someone shares their Virtual RC with your mobile number, it will appear here.
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* INTERACTIVE 3D FLIPPABLE CARD */}
            <div className="relative">
              {/* Flip Controls & Mask Bar */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-semibold text-[#667085] flex items-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5 text-[#0095F6]" />
                  {isFlipped ? 'Back Side (QR Verification)' : 'Front Side • Tap card to flip'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsMasked((m) => !m)}
                    aria-label={isMasked ? 'Unmask document ID' : 'Mask document ID'}
                    className="w-8 h-8 rounded-full bg-[#F2F4F7] hover:bg-[#E2E8F0] flex items-center justify-center text-[#111827] cursor-pointer"
                  >
                    {isMasked ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleFlip}
                    aria-label="Flip card left"
                    className="w-8 h-8 rounded-full bg-[#F2F4F7] hover:bg-[#E2E8F0] flex items-center justify-center text-[#111827] cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleFlip}
                    aria-label="Flip card right"
                    className="w-8 h-8 rounded-full bg-[#F2F4F7] hover:bg-[#E2E8F0] flex items-center justify-center text-[#111827] cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 3D Perspective Stage */}
              <div
                className="perspective-1200 w-full h-[318px]"
                data-testid="virtual-card-3d"
                data-flipped={isFlipped ? 'true' : 'false'}
              >
                <div
                  onClick={handleToggleFlip}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleToggleFlip();
                    }
                  }}
                  aria-label={`Flip Virtual ${mode.toUpperCase()} card`}
                  className={`relative w-full h-full preserve-3d transition-transform duration-500 ease-out cursor-pointer ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* ================= FRONT FACE ================= */}
                  <div className="absolute inset-0 backface-hidden rounded-[20px] bg-white border border-[#E2E8F0] shadow-[0_10px_28px_rgba(15,23,42,0.09)] overflow-hidden flex flex-col">
                    {/* Holographic MoRTH Strip */}
                    <div className="holo-strip px-4 py-2 border-b border-[#E2E8F0] flex items-center justify-between">
                      <span className="text-[10px] font-extrabold tracking-[0.12em] text-[#0369A1]">
                        APPROVED BY MoRTH • NIC
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#16A34A] text-[10.5px] font-bold">
                        {mode === 'dl' ? 'Verified ✓' : 'Active ✓'}
                      </span>
                    </div>

                    {mode === 'dl' ? (
                      /* VIRTUAL DL FRONT */
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-[#667085]">
                            Virtual Driving Licence
                          </p>
                          <p className="font-mono-code text-[18px] font-extrabold text-[#111827] mt-0.5 tracking-tight">
                            {maskDocumentId(dl.dlNo, isMasked)}
                          </p>
                        </div>

                        <div className="flex items-center gap-3.5 my-2">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0095F6] to-[#0284C7] text-white font-extrabold text-[22px] flex items-center justify-center shadow-sm shrink-0">
                            {dl.holderName
                              .split(/\s+/)
                              .map((w) => w[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[17px] font-extrabold text-[#111827] truncate">
                              {dl.holderName}
                            </p>
                            {dl.malayalamName && (
                              <p className="text-[11.5px] font-medium text-[#475569] leading-tight">
                                {dl.malayalamName}
                              </p>
                            )}
                            <p className="text-[11.5px] text-[#667085] mt-0.5">
                              RTO {dl.rto}
                            </p>
                            <span className="mt-1 inline-block px-2 py-0.5 rounded-md bg-[#EBF5FF] text-[#0095F6] text-[10.5px] font-bold">
                              {dl.vehicleClasses}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#F2F4F7]">
                          <div>
                            <p className="text-[10px] text-[#667085] font-medium">DOB</p>
                            <p className="font-mono-code text-[11.5px] font-bold text-[#111827]">
                              {dl.dob}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-[#667085] font-medium">Blood Group</p>
                            <p className="font-mono-code text-[12px] font-bold text-[#E31E24]">
                              {dl.bloodGroup}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-[#667085] font-medium">Valid Till</p>
                            <p className="font-mono-code text-[11.5px] font-bold text-[#16A34A]">
                              {dl.validTill}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* VIRTUAL RC FRONT */
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-[#667085]">
                            Virtual Registration Certificate
                          </p>
                          <p className="font-mono-code text-[20px] font-extrabold text-[#111827] mt-0.5 tracking-tight">
                            {maskDocumentId(primaryVehicle.regNo, isMasked)}
                          </p>
                        </div>

                        <div className="space-y-1.5 my-1">
                          <p className="text-[16px] font-extrabold text-[#111827]">
                            {primaryVehicle.ownerName}
                          </p>
                          <p className="text-[13px] font-semibold text-[#0095F6]">
                            {primaryVehicle.model} • {primaryVehicle.fuelType}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#F2F4F7]">
                          <div>
                            <p className="text-[10px] text-[#667085] font-medium">Chassis No.</p>
                            <p className="font-mono-code text-[12px] font-bold text-[#111827]">
                              {primaryVehicle.chassisMasked}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-[#667085] font-medium">RC Valid Till</p>
                            <p className="font-mono-code text-[12px] font-bold text-[#16A34A]">
                              {primaryVehicle.rcValidTill}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ================= BACK FACE ================= */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-[20px] bg-white border border-[#E2E8F0] shadow-[0_10px_28px_rgba(15,23,42,0.09)] overflow-hidden flex flex-col">
                    <div className="holo-strip px-4 py-2 border-b border-[#E2E8F0] flex items-center justify-between">
                      <span className="text-[10px] font-extrabold tracking-[0.12em] text-[#0369A1]">
                        ENCRYPTED QR • MoRTH VERIFIED
                      </span>
                      <span className="font-mono-code text-[10.5px] font-bold text-[#111827]">
                        {mode === 'dl' ? dl.rto : primaryVehicle.regNo}
                      </span>
                    </div>

                    {mode === 'dl' ? (
                      /* VIRTUAL DL BACK */
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div className="flex items-center gap-3.5">
                          <div className="p-1.5 rounded-2xl border border-[#E2E8F0] bg-white shrink-0">
                            <QrCodeSvg seed={dl.dlNo} size={126} />
                          </div>
                          <div className="space-y-2 text-[11.5px] min-w-0">
                            <div>
                              <p className="text-[10px] text-[#667085]">Issue Date</p>
                              <p className="font-mono-code font-bold text-[#111827]">
                                {dl.issueDate}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-[#667085]">Valid Till</p>
                              <p className="font-mono-code font-bold text-[#16A34A]">
                                {dl.validTill}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-[#667085]">Issuing Authority</p>
                              <p className="font-bold text-[#111827]">{dl.rto}</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2.5 border-t border-[#F2F4F7]">
                          <p className="text-[10px] font-semibold text-[#667085]">Address</p>
                          <p className="text-[11.5px] font-medium text-[#111827] leading-snug">
                            {dl.address}
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* VIRTUAL RC BACK */
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div className="flex items-center gap-3.5">
                          <div className="p-1.5 rounded-2xl border border-[#E2E8F0] bg-white shrink-0">
                            <QrCodeSvg seed={primaryVehicle.regNo} size={118} />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="px-2.5 py-1.5 rounded-xl bg-[#ECFDF5] text-[#16A34A] text-[11px] font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              <span>Insurance Valid</span>
                            </div>
                            <div className="px-2.5 py-1.5 rounded-xl bg-[#FFFBEB] text-[#D97706] text-[11px] font-bold flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              <span>PUC 5d left</span>
                            </div>
                            <div className="px-2.5 py-1.5 rounded-xl bg-[#ECFDF5] text-[#16A34A] text-[11px] font-bold flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                              <span>Fitness Valid 2037</span>
                            </div>
                          </div>
                        </div>

                        <p className="pt-2 border-t border-[#F2F4F7] text-[10px] text-[#667085] leading-snug">
                          Legally valid across India under IT Act 2000 & MoRTH Advisory RT-11036/64/2017-MVL.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Inline Action Tiles Below Card */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShareOpen(true)}
                className="rounded-2xl bg-[#F2F4F7] hover:bg-[#E2E8F0] py-3 flex flex-col items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-[#0095F6]" />
                <span className="text-[11px] font-semibold text-[#111827]">Share</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onShowToast(
                    `Downloaded Virtual_${mode.toUpperCase()}_Signed.pdf`,
                    'success'
                  )
                }
                className="rounded-2xl bg-[#F2F4F7] hover:bg-[#E2E8F0] py-3 flex flex-col items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#0095F6]" />
                <span className="text-[11px] font-semibold text-[#111827]">Download</span>
              </button>

              <button
                type="button"
                onClick={handleRefresh}
                className="rounded-2xl bg-[#F2F4F7] hover:bg-[#E2E8F0] py-3 flex flex-col items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw
                  className={`w-4 h-4 text-[#0095F6] ${refreshing ? 'animate-spin' : ''}`}
                />
                <span className="text-[11px] font-semibold text-[#111827]">Refresh</span>
              </button>

              {mode === 'rc' ? (
                <button
                  type="button"
                  onClick={onOpenChallanTab}
                  className="rounded-2xl bg-[#FEF2F2] hover:bg-[#FEE2E2] py-3 flex flex-col items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileWarning className="w-4 h-4 text-[#E31E24]" />
                  <span className="text-[11px] font-semibold text-[#E31E24]">Challan</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    onShowToast('Virtual DL protected — re-sync anytime from Sarathi', 'warning')
                  }
                  className="rounded-2xl bg-[#FEF2F2] hover:bg-[#FEE2E2] py-3 flex flex-col items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-[#E31E24]" />
                  <span className="text-[11px] font-semibold text-[#E31E24]">Delete</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Share Virtual Document Sheet */}
      {shareOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/45" onClick={() => setShareOpen(false)} />
          <div className="relative z-10 w-full max-w-[402px] bg-white rounded-t-[28px] p-5 pb-9 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[17px] font-bold text-[#111827]">
                Share Virtual {mode.toUpperCase()}
              </h2>
              <button
                type="button"
                onClick={() => setShareOpen(false)}
                aria-label="Close share sheet"
                className="w-8 h-8 rounded-full bg-[#F2F4F7] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[12.5px] text-[#667085] mb-3">
              Share temporary verified access with a family member or authorized driver.
            </p>
            <form onSubmit={handleShareSubmit} className="space-y-3">
              <input
                type="tel"
                maxLength={10}
                placeholder="Recipient 10-digit Mobile No."
                value={sharePhone}
                onChange={(e) => setSharePhone(e.target.value.replace(/\D/g, ''))}
                className="w-full h-11 px-3.5 rounded-xl bg-[#F2F4F7] font-mono-code text-[14px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0095F6]"
              />
              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-[#0095F6] hover:bg-[#0082D6] text-white font-bold text-[13.5px] cursor-pointer"
              >
                Share Secure Copy
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
