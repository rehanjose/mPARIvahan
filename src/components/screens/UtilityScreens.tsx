import React, { useState } from 'react';
import {
  ChevronLeft,
  Bell,
  CheckCheck,
  AlertTriangle,
  FileWarning,
  RefreshCw,
  MapPin,
  Phone,
  Siren,
  Ambulance,
  ShieldAlert,
  Share2,
  Hospital,
  Car,
  Plus,
  CheckCircle2,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { NotificationItem, ScreenRoute, VehicleRecord } from '../../types';
import { hapticSuccess, hapticTap, hapticWarning } from '../../utils/haptics';

/* ================= NOTIFICATIONS CENTER ================= */
type NotifFilter = 'All' | 'Alerts' | 'Challans' | 'Updates';

interface NotificationsScreenProps {
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onSelectNotification: (item: NotificationItem) => void;
  onBack: () => void;
}

export function NotificationsScreen({
  notifications,
  onMarkAllRead,
  onSelectNotification,
  onBack,
}: NotificationsScreenProps) {
  const [filter, setFilter] = useState<NotifFilter>('All');

  const filtered =
    filter === 'All'
      ? notifications
      : notifications.filter((n) => n.category === filter);

  const today = filtered.filter((n) => n.group === 'Today');
  const earlier = filtered.filter((n) => n.group === 'Earlier');
  const hasUnread = notifications.some((n) => n.unread);

  const renderIcon = (cat: NotificationItem['category']) => {
    if (cat === 'Alerts') return <AlertTriangle className="w-4 h-4 text-[#D97706]" />;
    if (cat === 'Challans') return <FileWarning className="w-4 h-4 text-[#E31E24]" />;
    return <RefreshCw className="w-4 h-4 text-[#0095F6]" />;
  };

  const renderGroup = (title: string, items: NotificationItem[]) => {
    if (items.length === 0) return null;
    return (
      <section>
        <h2 className="text-[12px] font-bold uppercase tracking-wider text-[#667085] mb-2">
          {title}
        </h2>
        <div className="space-y-2.5">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectNotification(item)}
              className={`w-full text-left rounded-2xl border p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                item.unread
                  ? 'bg-[#F8FBFF] border-[#BFDBFE]'
                  : 'bg-white border-[#E2E8F0] hover:bg-[#F8FAFC]'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center shrink-0 mt-0.5">
                {renderIcon(item.category)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13.5px] font-bold text-[#111827] leading-snug">
                    {item.title}
                  </p>
                  <span className="text-[11px] text-[#667085] whitespace-nowrap shrink-0">
                    {item.time}
                  </span>
                </div>
                <p className="mt-1 text-[12px] text-[#475569] leading-relaxed">
                  {item.body}
                </p>
              </div>
              {item.unread && (
                <span className="w-2 h-2 rounded-full bg-[#0095F6] mt-2 shrink-0" />
              )}
            </button>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="flex-1 bg-white overflow-y-auto no-scrollbar pb-6">
      <header className="px-4 pt-2 pb-3 sticky top-0 bg-white/95 backdrop-blur-xs z-20 border-b border-[#F2F4F7]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to Home"
              className="w-9 h-9 -ml-2 rounded-full flex items-center justify-center text-[#111827] hover:bg-[#F2F4F7] cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-[19px] font-extrabold text-[#111827]">Notifications</h1>
          </div>
          <button
            type="button"
            disabled={!hasUnread}
            onClick={onMarkAllRead}
            className={`inline-flex items-center gap-1 text-[12.5px] font-bold cursor-pointer ${
              hasUnread ? 'text-[#0095F6] hover:underline' : 'text-[#94A3B8] cursor-default'
            }`}
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all read</span>
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          {(['All', 'Alerts', 'Challans', 'Updates'] as NotifFilter[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setFilter(p)}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold cursor-pointer ${
                filter === p
                  ? 'bg-[#0095F6] text-white'
                  : 'bg-[#F2F4F7] text-[#475569] hover:bg-[#E2E8F0]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 pt-3.5 space-y-5">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-[#E2E8F0] p-8 text-center">
            <Bell className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
            <p className="text-[14px] font-bold text-[#111827]">All Caught Up</p>
          </div>
        ) : (
          <>
            {renderGroup('Today', today)}
            {renderGroup('Earlier', earlier)}
          </>
        )}
      </div>
    </div>
  );
}

/* ================= SOS EMERGENCY SCREEN ================= */
interface SosScreenProps {
  onBack: () => void;
  onOpenHospitals: () => void;
  onShowToast: (text: string, tone?: 'success' | 'info' | 'warning') => void;
}

export function SosScreen({
  onBack,
  onOpenHospitals,
  onShowToast,
}: SosScreenProps) {
  const [liveShared, setLiveShared] = useState(false);

  return (
    <div className="flex-1 bg-white overflow-y-auto no-scrollbar pb-6">
      <header className="px-4 pt-2 pb-2.5 flex items-center justify-between border-b border-[#FECACA] bg-[#FEF2F2] sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to Home"
            className="w-9 h-9 -ml-2 rounded-full flex items-center justify-center text-[#991B1B] hover:bg-[#FEE2E2] cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-[19px] font-extrabold text-[#991B1B]">SOS Emergency</h1>
            <p className="text-[11px] font-semibold text-[#B91C1C]">
              Direct MoRTH & Emergency Response Desk
            </p>
          </div>
        </div>
        <Siren className="w-5 h-5 text-[#E31E24]" />
      </header>

      <div className="px-4 pt-4 space-y-4">
        {/* Auto-detected Location Card */}
        <div className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FEF2F2] text-[#E31E24] flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">
              Auto-Detected Location
            </p>
            <p className="text-[13.5px] font-bold text-[#111827] mt-0.5">
              NH 66 Bypass, Edappally, Ernakulam, Kerala
            </p>
            <p className="font-mono-code text-[11px] text-[#667085] mt-0.5">
              GPS: 10.0261° N, 76.3125° E • Accuracy ±8m
            </p>
          </div>
        </div>

        {/* 2x2 Emergency Dialer */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              hapticWarning();
              onShowToast('Dialing National Emergency 112...', 'warning');
            }}
            className="rounded-2xl bg-[#E31E24] hover:bg-[#C8191E] text-white p-4 text-left shadow-[0_8px_20px_rgba(227,30,36,0.28)] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Phone className="w-5 h-5 mb-2.5" />
            <p className="text-[13px] font-bold opacity-90">National Emergency</p>
            <p className="font-mono-code text-[24px] font-extrabold leading-tight">112</p>
          </button>

          <button
            type="button"
            onClick={() => {
              hapticWarning();
              onShowToast('Dialing Ambulance 108...', 'info');
            }}
            className="rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#E31E24] p-4 text-left active:scale-[0.98] transition-all cursor-pointer"
          >
            <Ambulance className="w-5 h-5 text-[#E31E24] mb-2.5" />
            <p className="text-[13px] font-bold text-[#667085]">Ambulance</p>
            <p className="font-mono-code text-[24px] font-extrabold text-[#111827] leading-tight">
              108
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              hapticTap();
              onShowToast('Dialing NHAI Highway Patrol 1033...', 'info');
            }}
            className="rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0095F6] p-4 text-left active:scale-[0.98] transition-all cursor-pointer"
          >
            <ShieldAlert className="w-5 h-5 text-[#0095F6] mb-2.5" />
            <p className="text-[13px] font-bold text-[#667085]">Highway Patrol</p>
            <p className="font-mono-code text-[24px] font-extrabold text-[#111827] leading-tight">
              1033
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              hapticTap();
              onShowToast('Dialing Police Control Room 100...', 'info');
            }}
            className="rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#0095F6] p-4 text-left active:scale-[0.98] transition-all cursor-pointer"
          >
            <Phone className="w-5 h-5 text-[#111827] mb-2.5" />
            <p className="text-[13px] font-bold text-[#667085]">Police</p>
            <p className="font-mono-code text-[24px] font-extrabold text-[#111827] leading-tight">
              100
            </p>
          </button>
        </div>

        {/* Share Live Location */}
        <button
          type="button"
          onClick={() => {
            hapticSuccess();
            setLiveShared(true);
            onShowToast('Live GPS link shared with emergency contacts & 112', 'success');
          }}
          className={`w-full h-12 rounded-2xl font-bold text-[14px] flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            liveShared
              ? 'bg-[#ECFDF5] text-[#16A34A] border border-[#BBF7D0]'
              : 'bg-[#0095F6] hover:bg-[#0082D6] text-white'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>{liveShared ? 'Live Location Shared ✓' : 'Share Live Location'}</span>
        </button>

        {/* Nearest PM Rahat Hospital */}
        <button
          type="button"
          onClick={onOpenHospitals}
          className="w-full text-left rounded-2xl bg-[#FEF2F2]/60 border border-[#FECACA] p-4 flex items-center justify-between gap-3 cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#FECACA] text-[#E31E24] flex items-center justify-center shrink-0">
              <Hospital className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase text-[#E31E24]">
                Nearest PM Rahat Hospital (1.8 km)
              </p>
              <p className="text-[14px] font-extrabold text-[#111827] truncate">
                Sunrise Hospital • Cashless Trauma Care
              </p>
            </div>
          </div>
          <span className="text-[12px] font-bold text-[#0095F6] shrink-0">Map →</span>
        </button>
      </div>
    </div>
  );
}

/* ================= VEHICLE SEARCH RESULT SCREEN ================= */
interface VehicleSearchResultScreenProps {
  vehicle: VehicleRecord;
  isSavedInGarage: boolean;
  onAddToGarage: (v: VehicleRecord) => void;
  onCheckChallans: (regNo: string) => void;
  onBack: () => void;
}

export function VehicleSearchResultScreen({
  vehicle,
  isSavedInGarage,
  onAddToGarage,
  onCheckChallans,
  onBack,
}: VehicleSearchResultScreenProps) {
  return (
    <div className="flex-1 bg-white overflow-y-auto no-scrollbar pb-6">
      <header className="px-4 pt-2 pb-2.5 flex items-center gap-2 border-b border-[#F2F4F7] sticky top-0 bg-white z-10">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="w-9 h-9 -ml-2 rounded-full flex items-center justify-center text-[#111827] hover:bg-[#F2F4F7] cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[18px] font-extrabold text-[#111827]">Vehicle Search Result</h1>
      </header>

      <div className="px-4 pt-4 space-y-4">
        {/* Hero Plate Card */}
        <div className="rounded-[20px] bg-white border border-[#E2E8F0] shadow-[0_4px_16px_rgba(15,23,42,0.05)] p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#EBF5FF] text-[#0095F6] flex items-center justify-center shrink-0">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <p className="font-mono-code text-[19px] font-extrabold text-[#111827]">
                  {vehicle.regNo}
                </p>
                <p className="text-[13px] font-semibold text-[#667085]">{vehicle.model}</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#16A34A] text-[11px] font-extrabold">
              ACTIVE ✓
            </span>
          </div>

          <div className="mt-4 pt-3.5 border-t border-[#F2F4F7] grid grid-cols-2 gap-3 text-[12.5px]">
            <div>
              <p className="text-[11px] text-[#667085]">Owner Name (Privacy Masked)</p>
              <p className="font-mono-code font-bold text-[#111827] mt-0.5">
                {vehicle.maskedOwnerName}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-[#667085]">Fuel / Class</p>
              <p className="font-bold text-[#111827] mt-0.5">{vehicle.fuelType} • LMV</p>
            </div>
            <div className="col-span-2">
              <p className="text-[11px] text-[#667085]">Registering Authority</p>
              <p className="font-semibold text-[#111827] mt-0.5">{vehicle.rto}</p>
            </div>
          </div>
        </div>

        {/* 2x2 Compliance Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#ECFDF5] border border-[#BBF7D0] p-3.5">
            <p className="text-[11px] font-semibold text-[#166534]">Motor Insurance</p>
            <p className="text-[13.5px] font-extrabold text-[#16A34A] mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Valid
            </p>
            <p className="font-mono-code text-[11px] text-[#166534] mt-0.5">
              Till {vehicle.insuranceValidTill}
            </p>
          </div>

          <div
            className={`rounded-2xl border p-3.5 ${
              vehicle.pucStatus === 'expiring'
                ? 'bg-[#FFFBEB] border-[#FDE68A]'
                : 'bg-[#ECFDF5] border-[#BBF7D0]'
            }`}
          >
            <p
              className={`text-[11px] font-semibold ${
                vehicle.pucStatus === 'expiring' ? 'text-[#92400E]' : 'text-[#166534]'
              }`}
            >
              PUC Certificate
            </p>
            <p
              className={`text-[13.5px] font-extrabold mt-1 flex items-center gap-1 ${
                vehicle.pucStatus === 'expiring' ? 'text-[#D97706]' : 'text-[#16A34A]'
              }`}
            >
              {vehicle.pucStatus === 'expiring' ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {vehicle.pucStatus === 'expiring' ? 'Expiring Soon' : 'Valid'}
            </p>
            <p
              className={`text-[11px] font-semibold mt-0.5 ${
                vehicle.pucStatus === 'expiring' ? 'text-[#92400E]' : 'text-[#166534]'
              }`}
            >
              {vehicle.pucLabel}
            </p>
          </div>

          <div className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-3.5">
            <p className="text-[11px] font-semibold text-[#667085]">Fitness / RC Valid</p>
            <p className="text-[13.5px] font-extrabold text-[#111827] mt-1 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-[#0095F6]" /> Active
            </p>
            <p className="font-mono-code text-[11px] text-[#667085] mt-0.5">
              Till {vehicle.fitnessValidTill}
            </p>
          </div>

          <div className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-3.5">
            <p className="text-[11px] font-semibold text-[#667085]">MV Tax Status</p>
            <p className="text-[13.5px] font-extrabold text-[#16A34A] mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Paid (LTT)
            </p>
            <p className="text-[11px] text-[#667085] mt-0.5">Lifetime Tax</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          <button
            type="button"
            disabled={isSavedInGarage}
            onClick={() => onAddToGarage(vehicle)}
            className={`w-full h-12 rounded-2xl font-bold text-[14px] flex items-center justify-center gap-1.5 transition-colors ${
              isSavedInGarage
                ? 'bg-[#ECFDF5] text-[#16A34A] border border-[#BBF7D0] cursor-default'
                : 'bg-[#0095F6] hover:bg-[#0082D6] text-white cursor-pointer'
            }`}
          >
            {isSavedInGarage ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved in My Garage</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add to My Garage</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              hapticTap();
              onCheckChallans(vehicle.regNo);
            }}
            className="w-full h-11 rounded-2xl bg-[#F2F4F7] hover:bg-[#E2E8F0] text-[#111827] font-bold text-[13.5px] transition-colors cursor-pointer"
          >
            Check Pending Challans
          </button>
        </div>

        {/* Vahan 4.0 Disclaimer */}
        <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-3 flex items-start gap-2 text-[11px] text-[#667085] leading-relaxed">
          <Info className="w-4 h-4 text-[#0095F6] shrink-0 mt-0.5" />
          <p>
            Data fetched in real-time from National Register Vahan 4.0 (MoRTH). Owner identity is masked per citizen privacy guidelines.
          </p>
        </div>
      </div>
    </div>
  );
}
