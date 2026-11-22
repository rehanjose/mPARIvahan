import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronDown,
  Search,
  Landmark,
  Files,
  Home,
  FileOutput,
  ShieldCheck,
  Smartphone,
  RefreshCw,
  IdCard,
  Globe,
  CheckCircle2,
  Download,
  X,
  ArrowRight,
  FileCheck2,
  Upload,
  Check,
} from 'lucide-react';
import { INDIAN_STATES, TRANSPORT_SERVICES } from '../../data/mockData';
import {
  ChallanRecord,
  TransactionRecord,
  TransportServiceItem,
  TransportTab,
  VehicleRecord,
} from '../../types';
import { getPendingChallanSummary } from '../../utils/appLogic';
import { hapticSuccess, hapticTap } from '../../utils/haptics';

interface TransportServicesScreenProps {
  initialTab?: TransportTab;
  initialServiceId?: string | null;
  selectedState: string;
  onChangeState: (st: string) => void;
  vehicles: VehicleRecord[];
  challans: ChallanRecord[];
  onBack: () => void;
  onOpenTransactions: () => void;
  onPayChallan: (challanId: string) => void;
  onSubmitApplication: (tx: TransactionRecord) => void;
  onShowToast: (text: string, tone?: 'success' | 'info' | 'warning') => void;
}

export function TransportServicesScreen({
  initialTab = 'vehicle',
  initialServiceId = null,
  selectedState,
  onChangeState,
  vehicles,
  challans,
  onBack,
  onOpenTransactions,
  onPayChallan,
  onSubmitApplication,
  onShowToast,
}: TransportServicesScreenProps) {
  const [activeTab, setActiveTab] = useState<TransportTab>(initialTab);
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [serviceSearch, setServiceSearch] = useState('');

  // Before You Start Bottom Sheet
  const [sheetService, setSheetService] = useState<TransportServiceItem | null>(null);
  const [selectedSubtype, setSelectedSubtype] = useState<string>('');

  // Pre-Filled Application Form state
  const [applyingService, setApplyingService] = useState<TransportServiceItem | null>(null);
  const [applicationStep, setApplicationStep] = useState<1 | 2>(1);
  const [financierName, setFinancierName] = useState('HDFC Bank Ltd.');
  const [nocDate, setNocDate] = useState('2026-11-10');
  const [termDate, setTermDate] = useState('2026-11-22');
  const [form35Uploaded, setForm35Uploaded] = useState(false);

  // Challan Tab state
  const [challanQuery, setChallanQuery] = useState('');
  const [selectedChallanVehicle, setSelectedChallanVehicle] = useState('KL 42 AB 5784');

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (initialServiceId) {
      const match = TRANSPORT_SERVICES.find((s) => s.id === initialServiceId);
      if (match) {
        setActiveTab(match.tab);
        setSheetService(match);
        setSelectedSubtype(match.types?.[0] ?? '');
      }
    }
  }, [initialServiceId]);

  const openBeforeYouStart = (item: TransportServiceItem) => {
    setSheetService(item);
    setSelectedSubtype(item.types?.[0] ?? '');
  };

  const handleProceedToApply = () => {
    if (!sheetService) return;
    hapticTap();
    setApplyingService(sheetService);
    setApplicationStep(1);
    setForm35Uploaded(false);
    setSheetService(null);
  };

  const handleCompleteApplication = () => {
    if (!applyingService) return;
    const refNo = `KL261122${Math.floor(100000 + Math.random() * 900000)}`;
    const newTx: TransactionRecord = {
      id: `tx-app-${Date.now()}`,
      title:
        applyingService.id === 'hypothecation'
          ? 'Hypothecation Termination'
          : applyingService.title,
      subtitle: `KL 42 AB 5784 • ${
        applyingService.id === 'hypothecation' ? financierName : 'Sub-RTO North Paravur'
      }`,
      category: 'Applications',
      status: 'Submitted',
      statusTone: 'blue',
      date: '22 Nov 2026',
      amount: applyingService.exactFee,
      refNo,
      vehicleNo: 'KL 42 AB 5784',
      actionLabel: 'Appointment Slip',
      actionType: 'appointment',
    };
    onSubmitApplication(newTx);
    setApplyingService(null);
    onShowToast(`Application ${refNo} submitted! Track in Transactions.`, 'success');
    onOpenTransactions();
  };

  const renderIcon = (name: string) => {
    const cls = 'w-[20px] h-[20px] text-[#0095F6]';
    switch (name) {
      case 'Landmark':
        return <Landmark className={cls} strokeWidth={1.9} />;
      case 'Files':
        return <Files className={cls} strokeWidth={1.9} />;
      case 'Home':
        return <Home className={cls} strokeWidth={1.9} />;
      case 'FileOutput':
        return <FileOutput className={cls} strokeWidth={1.9} />;
      case 'ShieldCheck':
        return <ShieldCheck className={cls} strokeWidth={1.9} />;
      case 'Smartphone':
        return <Smartphone className={cls} strokeWidth={1.9} />;
      case 'RefreshCw':
        return <RefreshCw className={cls} strokeWidth={1.9} />;
      case 'IdCard':
        return <IdCard className={cls} strokeWidth={1.9} />;
      case 'Globe':
        return <Globe className={cls} strokeWidth={1.9} />;
      default:
        return <Files className={cls} strokeWidth={1.9} />;
    }
  };

  // PRE-FILLED APPLICATION FORM VIEW (Step 1 of 2 / Step 2 of 2)
  if (applyingService) {
    const isHypo = applyingService.id === 'hypothecation';
    const formTitle = isHypo
      ? 'Hypothecation Termination'
      : applyingService.title;

    return (
      <div className="flex-1 bg-white flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-4 pt-2 pb-3 border-b border-[#F2F4F7] flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() =>
              applicationStep === 2 ? setApplicationStep(1) : setApplyingService(null)
            }
            aria-label="Back to Transport Services"
            className="w-9 h-9 -ml-1.5 rounded-full flex items-center justify-center text-[#111827] hover:bg-[#F2F4F7] cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-[16.5px] font-bold text-[#111827] truncate">{formTitle}</h1>
            <p className="text-[11.5px] font-semibold text-[#0095F6]">
              Step {applicationStep} of 2
            </p>
          </div>
        </header>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-3.5 pb-6 space-y-4">
          {/* Auto-filled from My Garage Banner */}
          <div className="rounded-2xl bg-[#EBF5FF] border border-[#0095F6]/25 px-3.5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#0095F6] shrink-0" />
              <div>
                <p className="text-[12.5px] font-bold text-[#0369A1]">
                  Auto-filled from My Garage ✓
                </p>
                <p className="font-mono-code text-[12px] font-semibold text-[#111827]">
                  KL 42 AB 5784 • Maruti Suzuki Swift VXI
                </p>
              </div>
            </div>
          </div>

          {applicationStep === 1 ? (
            <>
              <div className="space-y-3.5">
                <div>
                  <label htmlFor="app-financier" className="block text-[12px] font-semibold text-[#111827] mb-1">
                    {isHypo ? 'Financier Name' : 'Applicant / RTO Office'}
                  </label>
                  <input
                    id="app-financier"
                    type="text"
                    value={financierName}
                    onChange={(e) => setFinancierName(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#F2F4F7] text-[14px] font-medium text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0095F6]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="app-noc-date" className="block text-[12px] font-semibold text-[#111827] mb-1">
                      {isHypo ? 'NOC Issue Date' : 'Document Date'}
                    </label>
                    <input
                      id="app-noc-date"
                      type="date"
                      value={nocDate}
                      onChange={(e) => setNocDate(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-[#F2F4F7] text-[13px] font-mono-code text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0095F6]"
                    />
                  </div>
                  <div>
                    <label htmlFor="app-term-date" className="block text-[12px] font-semibold text-[#111827] mb-1">
                      {isHypo ? 'Termination Date' : 'Effective Date'}
                    </label>
                    <input
                      id="app-term-date"
                      type="date"
                      value={termDate}
                      onChange={(e) => setTermDate(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-[#F2F4F7] text-[13px] font-mono-code text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0095F6]"
                    />
                  </div>
                </div>
              </div>

              {/* Document Uploads */}
              <div>
                <h2 className="text-[13px] font-bold text-[#111827] mb-2">
                  Supporting Documents
                </h2>
                <div className="space-y-2.5">
                  <div className="rounded-xl border border-[#BBF7D0] bg-[#ECFDF5] px-3.5 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileCheck2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                      <div className="min-w-0">
                        <p className="font-mono-code text-[12px] font-semibold text-[#111827] truncate">
                          Bank_NOC_KL42.pdf
                        </p>
                        <p className="text-[10.5px] text-[#16A34A] font-medium">
                          Uploaded • 412 KB • Verified
                        </p>
                      </div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      hapticSuccess();
                      setForm35Uploaded(true);
                      onShowToast('Signed_Form35_KL42.pdf attached', 'success');
                    }}
                    className={`w-full rounded-xl border border-dashed px-3.5 py-3 flex items-center justify-between transition-colors cursor-pointer ${
                      form35Uploaded
                        ? 'border-[#BBF7D0] bg-[#ECFDF5]'
                        : 'border-[#0095F6]/50 bg-[#F8FBFF] hover:bg-[#EBF5FF]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {form35Uploaded ? (
                        <FileCheck2 className="w-4 h-4 text-[#16A34A]" />
                      ) : (
                        <Upload className="w-4 h-4 text-[#0095F6]" />
                      )}
                      <span
                        className={`text-[13px] font-semibold ${
                          form35Uploaded ? 'text-[#166534]' : 'text-[#0095F6]'
                        }`}
                      >
                        {form35Uploaded
                          ? 'Signed_Form35_KL42.pdf (Attached ✓)'
                          : '+ Upload Signed Form 35'}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Step 2: Review & Confirm */
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-2.5 text-[13px]">
              <h2 className="text-[14.5px] font-bold text-[#111827] pb-2 border-b border-[#E2E8F0]">
                Review Application Summary
              </h2>
              <div className="flex justify-between">
                <span className="text-[#667085]">Service Type</span>
                <span className="font-semibold text-[#111827]">
                  {selectedSubtype || applyingService.title}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Vehicle No.</span>
                <span className="font-mono-code font-bold text-[#111827]">KL 42 AB 5784</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Financier</span>
                <span className="font-semibold text-[#111827]">{financierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">NOC / Termination</span>
                <span className="font-mono-code text-[12px] font-semibold text-[#111827]">
                  {nocDate} → {termDate}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E2E8F0]">
                <span className="text-[#667085]">Official Govt. Fee</span>
                <span className="font-mono-code font-bold text-[#16A34A]">
                  ₹{applyingService.exactFee} (₹0 Convenience Fee)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="shrink-0 bg-white border-t border-[#E2E8F0] px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] text-[#667085] font-medium">Govt. Fee</p>
            <p className="font-mono-code text-[17px] font-extrabold text-[#111827]">
              ₹{applyingService.exactFee}
            </p>
          </div>
          {applicationStep === 1 ? (
            <button
              type="button"
              onClick={() => {
                hapticTap();
                setApplicationStep(2);
              }}
              className="flex-1 h-12 rounded-2xl bg-[#0095F6] hover:bg-[#0082D6] text-white font-semibold text-[14.5px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Review & Pay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCompleteApplication}
              className="flex-1 h-12 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold text-[14.5px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Pay ₹{applyingService.exactFee} & Submit</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Filter grid cards by search text
  const gridServices = TRANSPORT_SERVICES.filter(
    (item) =>
      item.tab === activeTab &&
      (!serviceSearch.trim() ||
        item.title.toLowerCase().includes(serviceSearch.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(serviceSearch.toLowerCase()))
  );

  // Challan tab filtered list
  const vehicleChallans = challans.filter((c) => {
    if (challanQuery.trim()) {
      const q = challanQuery.trim().toLowerCase().replace(/\s/g, '');
      return (
        c.id.toLowerCase().includes(q) ||
        c.vehicleNo.toLowerCase().replace(/\s/g, '').includes(q)
      );
    }
    return c.vehicleNo === selectedChallanVehicle;
  });

  const pendingCount = vehicleChallans.filter((c) => c.status === 'pending').length;
  const paidCount = vehicleChallans.filter((c) => c.status === 'paid').length;

  return (
    <div className="flex-1 bg-white overflow-y-auto no-scrollbar pb-6 relative">
      {/* Top Bar — Exact match to screenshots */}
      <header className="px-4 pt-2 pb-2.5 flex items-center justify-between gap-2 sticky top-0 bg-white/95 backdrop-blur-xs z-20">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to Home"
            className="w-9 h-9 -ml-2 rounded-full flex items-center justify-center text-[#111827] hover:bg-[#F2F4F7] cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2.2} />
          </button>
          <h1 className="text-[19px] font-extrabold tracking-tight text-[#111827] truncate">
            Transport Services
          </h1>
        </div>

        {/* State Pill */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setStateDropdownOpen((o) => !o)}
            className="h-9 px-3.5 rounded-full bg-[#F2F4F7] hover:bg-[#E2E8F0] text-[13px] font-semibold text-[#111827] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>{selectedState}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#475569]" />
          </button>
          {stateDropdownOpen && (
            <div className="absolute right-0 top-10 z-30 w-44 rounded-2xl bg-white border border-[#E2E8F0] shadow-xl py-1 max-h-56 overflow-y-auto">
              {INDIAN_STATES.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    onChangeState(st);
                    setStateDropdownOpen(false);
                    onShowToast(`State services switched to ${st}`, 'info');
                  }}
                  className={`w-full px-3.5 py-2 text-left text-[13px] flex items-center justify-between cursor-pointer ${
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

      <div className="px-4 space-y-3.5">
        {/* Quick Search Bar (on Vehicle & DL tabs) */}
        {activeTab !== 'challan' && (
          <div className="flex items-center gap-2.5 h-11 px-3.5 rounded-[14px] bg-[#F2F4F7]">
            <Search className="w-[18px] h-[18px] text-[#667085] shrink-0" />
            <input
              type="text"
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
              aria-label="Search RC, DL, or Challan service"
              placeholder="Search RC, DL, or Challan service..."
              className="flex-1 bg-transparent text-[13.5px] text-[#111827] placeholder:text-[#667085] focus:outline-none"
            />
            {serviceSearch && (
              <button
                type="button"
                onClick={() => setServiceSearch('')}
                aria-label="Clear service search"
                className="text-[#667085] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Segmented Tabs: Vehicle (RC) | Driving Licence | Challan */}
        <div
          role="tablist"
          aria-label="Transport Service Categories"
          className="grid grid-cols-3 p-1 rounded-[14px] bg-[#F2F4F7]"
        >
          {(
            [
              { id: 'vehicle', label: 'Vehicle (RC)' },
              { id: 'dl', label: 'Driving Licence' },
              { id: 'challan', label: 'Challan' },
            ] as { id: TransportTab; label: string }[]
          ).map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setActiveTab(t.id)}
                className={`h-9 rounded-[10px] text-[12.5px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#0095F6] text-white shadow-xs'
                    : 'text-[#475569] hover:text-[#111827]'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* VEHICLE (RC) & DRIVING LICENCE GRIDS */}
        {activeTab !== 'challan' && (
          <>
            <div className="grid grid-cols-2 gap-3 pt-0.5">
              {gridServices.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => openBeforeYouStart(service)}
                  className={`text-left rounded-[18px] bg-white border border-[#E2E8F0] hover:border-[#0095F6]/60 shadow-[0_2px_10px_rgba(15,23,42,0.03)] p-4 flex flex-col justify-between active:scale-[0.98] transition-all cursor-pointer ${
                    service.fullWidth ? 'col-span-2 flex-row items-center gap-3.5 min-h-[76px]' : 'min-h-[148px]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#EBF5FF] flex items-center justify-center shrink-0">
                    {renderIcon(service.iconName)}
                  </div>
                  <div className={service.fullWidth ? 'flex-1' : 'mt-3'}>
                    <p className="text-[14.5px] font-bold text-[#111827] leading-[1.25]">
                      {service.title}
                    </p>
                    <p className="mt-1 text-[11.5px] text-[#667085] leading-snug">
                      {service.subtitle}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Footer Link */}
            <div className="rounded-2xl bg-[#F8FAFC] border border-[#F1F5F9] px-4 py-3">
              <p className="text-[12px] text-[#667085]">
                Looking for a past application or receipt?
              </p>
              <button
                type="button"
                onClick={onOpenTransactions}
                className="mt-0.5 inline-flex items-center gap-1 text-[13.5px] font-bold text-[#0095F6] hover:underline cursor-pointer"
              >
                <span>View in Transactions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}

        {/* CHALLAN TAB — Exact match to Transport_Services___Challan */}
        {activeTab === 'challan' && (
          <div className="space-y-4">
            {/* Quick Lookup Input */}
            <div className="flex items-center bg-[#F2F4F7] rounded-[16px] p-1.5 pl-3.5 gap-2">
              <input
                type="text"
                value={challanQuery}
                onChange={(e) => setChallanQuery(e.target.value)}
                aria-label="Check any Vehicle or Challan number"
                placeholder="Check any Vehicle or Challan No."
                className="flex-1 min-w-0 bg-transparent text-[13px] text-[#111827] placeholder:text-[#667085] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  hapticTap();
                  onShowToast(
                    challanQuery.trim()
                      ? `Checked e-Challan records for ${challanQuery.toUpperCase()}`
                      : `Showing challans for ${selectedChallanVehicle}`,
                    'info'
                  );
                }}
                className="h-9 px-4 rounded-[12px] bg-[#0095F6] hover:bg-[#0082D6] text-white text-[13px] font-semibold transition-colors cursor-pointer shrink-0"
              >
                Check
              </button>
            </div>

            {/* Saved Vehicle Pills */}
            <div>
              <h2 className="text-[15.5px] font-extrabold text-[#111827] mb-2.5">
                Your Saved Vehicles
              </h2>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {vehicles.slice(0, 2).map((veh) => {
                  const summary = getPendingChallanSummary(challans, veh.regNo);
                  const active = selectedChallanVehicle === veh.regNo && !challanQuery.trim();
                  return (
                    <button
                      key={veh.regNo}
                      type="button"
                      onClick={() => {
                        setChallanQuery('');
                        setSelectedChallanVehicle(veh.regNo);
                      }}
                      className={`px-3.5 py-2.5 rounded-full text-[12px] font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-[#0095F6] text-white shadow-xs'
                          : 'bg-[#F2F4F7] text-[#475569] hover:bg-[#E2E8F0]'
                      }`}
                    >
                      {veh.regNo} ({summary.count > 0 ? `${summary.count} Pending` : '0'})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Challans List */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-[15.5px] font-extrabold text-[#111827]">Challans</h2>
                <span className="text-[12px] font-medium text-[#667085]">
                  {pendingCount} pending • {paidCount} paid
                </span>
              </div>

              {vehicleChallans.length === 0 ? (
                <div className="rounded-2xl border border-[#E2E8F0] p-6 text-center">
                  <CheckCircle2 className="w-8 h-8 text-[#16A34A] mx-auto mb-2" />
                  <p className="text-[14px] font-bold text-[#111827]">No Challans Found</p>
                  <p className="text-[12px] text-[#667085] mt-0.5">
                    {selectedChallanVehicle} has a clean driving record!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {vehicleChallans.map((ch) => {
                    const isPending = ch.status === 'pending';
                    return (
                      <div
                        key={ch.id}
                        className={`relative rounded-[18px] bg-white border border-[#E2E8F0] shadow-[0_2px_12px_rgba(15,23,42,0.04)] p-4 overflow-hidden`}
                      >
                        {isPending && (
                          <div
                            aria-hidden="true"
                            className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-[#E31E24]"
                          />
                        )}
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono-code text-[15.5px] font-bold text-[#111827]">
                            {ch.id}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-[11.5px] font-bold whitespace-nowrap ${
                              isPending
                                ? 'bg-[#FEF2F2] text-[#E31E24]'
                                : 'bg-[#ECFDF5] text-[#16A34A]'
                            }`}
                          >
                            {isPending
                              ? `Pending • ₹${ch.amount}`
                              : `Paid ✓ • ₹${ch.amount}`}
                          </span>
                        </div>

                        <p className="mt-2.5 text-[12.5px] text-[#667085]">
                          {ch.offence} • {ch.location} • {ch.date}
                        </p>

                        <div className="mt-4 flex items-center gap-2.5">
                          {isPending ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  hapticTap();
                                  onPayChallan(ch.id);
                                }}
                                className="flex-1 h-10 rounded-xl bg-[#0095F6] hover:bg-[#0082D6] text-white text-[13px] font-bold transition-colors cursor-pointer"
                              >
                                Pay Now
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  onShowToast(`Downloaded e-Challan Notice ${ch.id}.pdf`, 'info')
                                }
                                className="flex-1 h-10 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#475569] text-[13px] font-semibold transition-colors cursor-pointer"
                              >
                                Download Notice
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onOpenTransactions()}
                              className="px-6 h-10 rounded-xl bg-white border border-[#0095F6] hover:bg-[#EBF5FF] text-[#0095F6] text-[13px] font-bold transition-colors cursor-pointer"
                            >
                              View Receipt
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* BEFORE YOU START BOTTOM SHEET — Exact match to Before_You_Start___Hypothecation */}
      {sheetService && (
        <div className="fixed inset-0 z-40 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-[#0F172A]/45 backdrop-blur-[1px]"
            onClick={() => setSheetService(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Before you start ${sheetService.fullTitle}`}
            className="relative z-10 w-full max-w-[402px] bg-white rounded-t-[28px] px-5 pt-3 pb-8 shadow-2xl"
          >
            {/* Grab Handle */}
            <div className="w-11 h-1 rounded-full bg-[#CBD5E1] mx-auto mb-4" />

            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold tracking-wider uppercase text-[#667085]">
                  BEFORE YOU START
                </p>
                <h2 className="mt-1 text-[20px] font-extrabold text-[#111827] leading-tight whitespace-pre-line">
                  {sheetService.fullTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSheetService(null)}
                aria-label="Close Before You Start sheet"
                className="w-9 h-9 rounded-full bg-[#F2F4F7] hover:bg-[#E2E8F0] flex items-center justify-center text-[#111827] shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" strokeWidth={2.2} />
              </button>
            </div>

            {/* Type Pills */}
            {sheetService.types && sheetService.types.length > 0 && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                {sheetService.types.map((tp) => {
                  const active = selectedSubtype === tp;
                  return (
                    <button
                      key={tp}
                      type="button"
                      onClick={() => setSelectedSubtype(tp)}
                      className={`px-3.5 py-2 rounded-full text-[12.5px] font-bold transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#0095F6] text-white'
                          : 'bg-[#F2F4F7] text-[#475569] hover:bg-[#E2E8F0]'
                      }`}
                    >
                      {tp}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Required Documents Checklist */}
            <div className="mt-5">
              <h3 className="text-[15.5px] font-extrabold text-[#111827] mb-2.5">
                Required Documents
              </h3>
              <div className="rounded-2xl bg-[#F8FAFC] p-3.5 space-y-3">
                {sheetService.requiredDocs.map((doc) => (
                  <div key={doc} className="flex items-start gap-2.5">
                    <CheckCircle2
                      className="w-[18px] h-[18px] text-[#16A34A] shrink-0 mt-0.5"
                      strokeWidth={2.2}
                    />
                    <span className="text-[13px] font-medium text-[#111827] leading-snug">
                      {doc}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Govt Fee + Download Form Row */}
            <div className="mt-5 flex items-end justify-between gap-2">
              <div>
                <p className="text-[12px] text-[#667085]">Standard Govt. Fee:</p>
                <p className="text-[16px] font-extrabold text-[#111827] mt-0.5">
                  {sheetService.feeRange}
                </p>
              </div>
              {sheetService.formLabel && (
                <button
                  type="button"
                  onClick={() =>
                    onShowToast(
                      `${(sheetService.formLabel ?? 'Form').replace('Download ', '')} PDF downloaded`,
                      'info'
                    )
                  }
                  className="inline-flex items-center gap-1 text-[13px] font-bold text-[#0095F6] hover:underline cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" strokeWidth={2.4} />
                  <span>{sheetService.formLabel}</span>
                </button>
              )}
            </div>

            {/* Primary CTA */}
            <button
              type="button"
              onClick={handleProceedToApply}
              className="mt-5 w-full h-[50px] rounded-[16px] bg-[#0095F6] hover:bg-[#0082D6] text-white font-bold text-[15px] flex items-center justify-center gap-1.5 shadow-[0_6px_18px_rgba(0,149,246,0.3)] transition-all active:scale-[0.99] cursor-pointer"
            >
              <span>Proceed to Apply</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
