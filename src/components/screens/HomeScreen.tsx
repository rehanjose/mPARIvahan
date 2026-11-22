import React, { useState } from 'react';
import {
  Menu,
  Bell,
  ChevronDown,
  Search,
  Car,
  IdCard,
  TriangleAlert,
  BriefcaseMedical,
  BookOpen,
  ChevronRight,
  Check,
} from 'lucide-react';
import { BrandLogo } from '../BrandLogo';
import { ChallanRecord, SavedAccount, SearchCategory, ScreenRoute, VehicleRecord } from '../../types';
import { getPendingChallanSummary } from '../../utils/appLogic';
import { hapticTap, hapticWarning } from '../../utils/haptics';

interface HomeScreenProps {
  account: SavedAccount;
  vehicles: VehicleRecord[];
  searchQuota: number;
  unreadNotifications: number;
  challans: ChallanRecord[];
  savedVehiclesCount: number;
  onOpenDrawer: () => void;
  onOpenSos: () => void;
  onOpenNotifications: () => void;
  onSubmitSearch: (query: string, category: SearchCategory) => void;
  onQuickLookup: (regNo: string) => void;
  onOpenChallanAlert: (challanId: string) => void;
  onNavigate: (route: ScreenRoute) => void;
}

export function HomeScreen({
  account,
  vehicles,
  searchQuota,
  unreadNotifications,
  challans,
  savedVehiclesCount,
  onOpenDrawer,
  onOpenSos,
  onOpenNotifications,
  onSubmitSearch,
  onQuickLookup,
  onOpenChallanAlert,
  onNavigate,
}: HomeScreenProps) {
  const [searchCategory, setSearchCategory] = useState<SearchCategory>('Vehicle');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [query, setQuery] = useState('');

  const primaryVehicle = vehicles[0];
  const primaryRegNo = primaryVehicle?.regNo ?? 'KL 42 AB 5784';
  const quickLookupVehicles = vehicles.slice(0, 2);
  const pendingSummary = getPendingChallanSummary(challans, primaryRegNo);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    hapticTap();
    if (!query.trim()) {
      onSubmitSearch(primaryRegNo, searchCategory);
      return;
    }
    onSubmitSearch(query, searchCategory);
  };

  return (
    <div className="flex-1 bg-[#FFFFFF] overflow-y-auto no-scrollbar pb-5">
      {/* Top Bar — Exact match to Home___Core_Services */}
      <header className="px-4 pt-2 pb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onOpenDrawer}
            aria-label="Open menu drawer"
            className="w-10 h-10 -ml-1.5 rounded-full flex items-center justify-center text-[#111827] hover:bg-[#F2F4F7] transition-colors cursor-pointer shrink-0"
          >
            <Menu className="w-[22px] h-[22px]" strokeWidth={2.1} />
          </button>
          <BrandLogo size="md" showText />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              hapticWarning();
              onOpenSos();
            }}
            aria-label="SOS Emergency"
            className="h-[34px] px-3.5 rounded-full bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#E31E24] text-[13px] font-bold tracking-wide transition-colors cursor-pointer"
          >
            SOS
          </button>
          <button
            type="button"
            onClick={onOpenNotifications}
            aria-label={`Notifications${unreadNotifications > 0 ? `, ${unreadNotifications} unread` : ''}`}
            className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#111827] hover:bg-[#F2F4F7] transition-colors cursor-pointer"
          >
            <Bell className="w-[21px] h-[21px]" strokeWidth={2} />
            {unreadNotifications > 0 && (
              <span
                aria-hidden="true"
                className="absolute top-[8px] right-[8px] w-2 h-2 rounded-full bg-[#0095F6] ring-2 ring-white"
              />
            )}
          </button>
        </div>
      </header>

      <main className="px-4 pt-1.5 space-y-3.5">
        {/* Greeting */}
        <h1 className="text-[25px] font-extrabold tracking-[-0.025em] text-[#111827] leading-tight">
          Welcome, {account.name}
        </h1>

        {/* Universal Smart Search Bar */}
        <div className="relative">
          <form
            onSubmit={handleFormSubmit}
            className="flex items-center bg-[#F2F4F7] rounded-[16px] p-1.5 pr-2.5 gap-2"
          >
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setDropdownOpen((o) => !o)}
                aria-expanded={dropdownOpen}
                aria-label="Select search type"
                className="h-[38px] px-3 rounded-[12px] bg-[#0095F6] hover:bg-[#0082D6] text-white text-[13px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>{searchCategory}</span>
                <ChevronDown className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 top-[44px] z-30 w-32 rounded-xl bg-white border border-[#E2E8F0] shadow-lg py-1 overflow-hidden">
                  {(['Vehicle', 'DL', 'Challan'] as SearchCategory[]).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setSearchCategory(opt);
                        setDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-[13px] font-medium flex items-center justify-between cursor-pointer ${
                        searchCategory === opt
                          ? 'bg-[#EBF5FF] text-[#0095F6] font-semibold'
                          : 'text-[#111827] hover:bg-[#F2F4F7]'
                      }`}
                    >
                      <span>{opt}</span>
                      {searchCategory === opt && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Enter Vehicle, DL, or Challan number"
              placeholder="Enter Vehicle / DL / Challan no."
              className="flex-1 min-w-0 bg-transparent text-[13px] text-[#111827] placeholder:text-[#667085] focus:outline-none"
            />

            <button
              type="submit"
              aria-label="Submit search"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#667085] hover:text-[#111827] transition-colors cursor-pointer shrink-0"
            >
              <Search className="w-[18px] h-[18px]" strokeWidth={2.1} />
            </button>
          </form>

          {/* Recent Lookup Chips + Quota */}
          <div className="mt-2.5 flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              {quickLookupVehicles.map((v) => (
                <button
                  key={v.regNo}
                  type="button"
                  onClick={() => onQuickLookup(v.regNo)}
                  className="font-mono-code text-[10.5px] font-semibold text-[#475569] bg-[#F2F4F7] hover:bg-[#E2E8F0] px-2.5 py-1.5 rounded-full transition-colors cursor-pointer whitespace-nowrap"
                >
                  {v.regNo}
                </button>
              ))}
            </div>
            <span className="text-[11px] font-medium text-[#667085] whitespace-nowrap shrink-0">
              {searchQuota}/5 searches left
            </span>
          </div>
        </div>

        {/* Compact Proactive Alert Strip */}
        <div className="rounded-[16px] bg-white border border-[#E2E8F0] shadow-[0_2px_10px_rgba(15,23,42,0.03)] px-3 py-2 flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-mono-code text-[11px] font-bold text-[#111827] whitespace-nowrap">
              {primaryRegNo}
            </span>
            {primaryVehicle?.pucStatus === 'expiring' ? (
              <span className="text-[11px] font-semibold text-[#D97706] truncate">
                • PUC expires in 5d
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-[#16A34A] truncate">
                • {primaryVehicle?.pucLabel ?? 'PUC Valid'}
              </span>
            )}
          </div>

          {pendingSummary.count > 0 && pendingSummary.firstPending ? (
            <button
              type="button"
              onClick={() => {
                hapticTap();
                onOpenChallanAlert(pendingSummary.firstPending!.id);
              }}
              className="shrink-0 px-2.5 py-1.5 rounded-full bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#E31E24] text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              {pendingSummary.count} Challan ₹{pendingSummary.totalAmount} →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                hapticTap();
                onNavigate('transactions');
              }}
              className="shrink-0 px-2.5 py-1.5 rounded-full bg-[#ECFDF5] text-[#16A34A] text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              0 Challans ✓
            </button>
          )}
        </div>

        {/* HERO SECTION — Core Services Bento Grid */}
        <section aria-labelledby="core-services-heading" className="pt-1">
          <h2
            id="core-services-heading"
            className="text-[22px] font-extrabold tracking-[-0.02em] text-[#111827] mb-3"
          >
            Core Services
          </h2>

          {/* Top Row: 2 Large Featured Cards Side-by-Side */}
          <div className="grid grid-cols-2 gap-3">
            {/* 1. Transport Services */}
            <button
              type="button"
              onClick={() => {
                hapticTap();
                onNavigate('transport-services');
              }}
              className="text-left rounded-[20px] bg-[#EBF5FF] hover:bg-[#E0F0FF] p-4 min-h-[154px] flex flex-col justify-between shadow-[0_2px_12px_rgba(0,149,246,0.08)] active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <Car className="w-[26px] h-[26px] text-[#0095F6]" strokeWidth={2} />
                <ChevronRight className="w-4 h-4 text-[#667085]" />
              </div>
              <div className="mt-4">
                <p className="text-[16.5px] font-bold text-[#111827] leading-[1.2]">
                  Transport{' '}
                  <br />
                  Services
                </p>
                <p className="mt-1.5 text-[11.5px] text-[#667085] leading-snug">
                  RC, DL & Challan services
                </p>
              </div>
            </button>

            {/* 2. Virtual Documents */}
            <button
              type="button"
              onClick={() => {
                hapticTap();
                onNavigate('virtual-docs');
              }}
              className="text-left rounded-[20px] bg-white border-[1.5px] border-[#0095F6] hover:bg-[#F8FBFF] p-4 min-h-[154px] flex flex-col justify-between shadow-[0_2px_12px_rgba(0,149,246,0.08)] active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between w-full gap-1">
                <IdCard className="w-[26px] h-[26px] text-[#0095F6] shrink-0" strokeWidth={2} />
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#16A34A] text-[10.5px] font-bold whitespace-nowrap">
                  Verified ✓
                </span>
              </div>
              <div className="mt-4">
                <p className="text-[16.5px] font-bold text-[#111827] leading-[1.2]">
                  Virtual{' '}
                  <br />
                  Documents
                </p>
                <p className="mt-1.5 text-[11.5px] text-[#667085] leading-snug">
                  1 DL • {savedVehiclesCount >= 1 ? '1 RC' : '0 RC'} Saved
                </p>
              </div>
            </button>
          </div>

          {/* Bottom Rows: 3 Prominent Full-Width Cards */}
          <div className="mt-3 space-y-2.5">
            {/* 3. Citizen Sentinel */}
            <button
              type="button"
              onClick={() => {
                hapticTap();
                onNavigate('citizen-sentinel');
              }}
              className="w-full text-left rounded-[18px] bg-[#F2F4F7]/85 hover:bg-[#EBEEF3] px-3.5 py-3 flex items-center gap-3 active:scale-[0.99] transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-[12px] bg-white shadow-xs flex items-center justify-center text-[#0095F6] shrink-0">
                <TriangleAlert className="w-[20px] h-[20px]" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14.5px] font-bold text-[#111827] leading-tight">
                  Citizen Sentinel
                </p>
                <p className="mt-0.5 text-[11.5px] text-[#667085] truncate">
                  Report traffic violations with photo/video
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#667085] shrink-0" />
            </button>

            {/* 4. PM Rahat */}
            <button
              type="button"
              onClick={() => {
                hapticTap();
                onNavigate('pm-rahat');
              }}
              className="w-full text-left rounded-[18px] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] px-3.5 py-3 flex items-center gap-3 shadow-[0_1px_4px_rgba(15,23,42,0.03)] active:scale-[0.99] transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-[12px] bg-[#F2F4F7] flex items-center justify-center text-[#0095F6] shrink-0">
                <BriefcaseMedical className="w-[20px] h-[20px]" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14.5px] font-bold text-[#111827] leading-tight">
                  PM Rahat
                </p>
                <p className="mt-0.5 text-[11.5px] text-[#667085] truncate">
                  Road accident aid & empaneled hospitals
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#667085] shrink-0" />
            </button>

            {/* 5. Informational Services */}
            <button
              type="button"
              onClick={() => {
                hapticTap();
                onNavigate('info-services');
              }}
              className="w-full text-left rounded-[18px] bg-[#F2F4F7]/85 hover:bg-[#EBEEF3] px-3.5 py-3 flex items-center gap-3 active:scale-[0.99] transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-[12px] bg-white shadow-xs flex items-center justify-center text-[#0095F6] shrink-0">
                <BookOpen className="w-[20px] h-[20px]" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14.5px] font-bold text-[#111827] leading-tight">
                  Informational Services
                </p>
                <p className="mt-0.5 text-[11.5px] text-[#667085] truncate">
                  Required documents, fees & RTO guides
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#667085] shrink-0" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
