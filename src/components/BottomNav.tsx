import React from 'react';
import { Home, Warehouse, FileText, MapPin, ScanQrCode } from 'lucide-react';
import { MainTab, ScreenRoute } from '../types';
import { hapticTap } from '../utils/haptics';

interface BottomNavProps {
  currentRoute: ScreenRoute;
  activeMainTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  onOpenScanQr: () => void;
}

export function BottomNav({
  currentRoute,
  activeMainTab,
  onSelectTab,
  onOpenScanQr,
}: BottomNavProps) {
  const isTabActive = (tab: MainTab) => {
    if (currentRoute === tab) return true;
    // Highlight Home when inside one of the Core Services sub-screens
    if (
      tab === 'home' &&
      [
        'transport-services',
        'challan-payment',
        'virtual-docs',
        'citizen-sentinel',
        'pm-rahat',
        'info-services',
        'vehicle-search',
      ].includes(currentRoute)
    ) {
      return activeMainTab === 'home';
    }
    return false;
  };

  const renderTabButton = (
    tab: MainTab,
    label: string,
    Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  ) => {
    const active = isTabActive(tab);
    return (
      <button
        key={tab}
        type="button"
        onClick={() => {
          hapticTap();
          onSelectTab(tab);
        }}
        aria-label={label}
        aria-current={active ? 'page' : undefined}
        className={`flex flex-col items-center justify-center gap-1 min-h-[48px] flex-1 transition-colors cursor-pointer ${
          active ? 'text-[#0095F6]' : 'text-[#667085] hover:text-[#111827]'
        }`}
      >
        <Icon className="w-[21px] h-[21px]" strokeWidth={active ? 2.2 : 1.8} />
        <span
          className={`text-[10.5px] leading-none whitespace-nowrap ${
            active ? 'font-semibold text-[#0095F6]' : 'font-medium text-[#667085]'
          }`}
        >
          {label}
        </span>
      </button>
    );
  };

  return (
    <nav
      aria-label="Primary Bottom Navigation"
      className="relative z-30 shrink-0 bg-[#FFFFFF] border-t border-[#E2E8F0]/80 shadow-[0_-6px_24px_rgba(15,23,42,0.06)] px-2 pt-1.5 pb-[22px] flex items-end justify-between"
    >
      {renderTabButton('home', 'Home', Home)}
      {renderTabButton('garage', 'My Garage', Warehouse)}

      {/* Center Floating Circular Scan QR Button */}
      <div className="flex flex-col items-center justify-end flex-1 relative">
        <button
          type="button"
          onClick={() => {
            hapticTap();
            onOpenScanQr();
          }}
          aria-label="Scan QR"
          className="absolute -top-[34px] w-[54px] h-[54px] rounded-full bg-[#0095F6] text-white flex items-center justify-center ring-4 ring-white shadow-[0_8px_20px_rgba(0,149,246,0.42)] hover:bg-[#0082D6] active:scale-95 transition-all cursor-pointer"
        >
          <ScanQrCode className="w-[25px] h-[25px]" strokeWidth={2.1} />
        </button>
        <span className="mt-[26px] text-[10.5px] leading-none font-semibold text-[#0095F6] whitespace-nowrap">
          Scan QR
        </span>
      </div>

      {renderTabButton('transactions', 'Transactions', FileText)}
      {renderTabButton('nearby', 'Nearby', MapPin)}
    </nav>
  );
}
