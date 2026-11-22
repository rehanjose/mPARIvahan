import React, { useState } from 'react';
import {
  MapPin,
  ChevronDown,
  Navigation,
  Phone,
  Building2,
  ShieldCheck,
  Hospital,
  Fuel,
  Check,
} from 'lucide-react';
import { NEARBY_PLACES } from '../../data/mockData';
import { NearbyPlace } from '../../types';

type NearbyFilter = 'All' | 'RTO Office' | 'PUC Center' | 'Hospitals (PM Rahat)' | 'Fuel & EV';

const CITIES = ['Ernakulam, Kerala', 'Kochi, Kerala', 'Thrissur, Kerala', 'Thiruvananthapuram, Kerala'];

interface NearbyScreenProps {
  initialFilter?: NearbyFilter;
  onShowToast: (text: string, tone?: 'success' | 'info' | 'warning') => void;
}

export function NearbyScreen({
  initialFilter = 'All',
  onShowToast,
}: NearbyScreenProps) {
  const [city, setCity] = useState('Ernakulam, Kerala');
  const [cityMenuOpen, setCityMenuOpen] = useState(false);
  const [filter, setFilter] = useState<NearbyFilter>(initialFilter);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>(NEARBY_PLACES[0].id);

  const visiblePlaces =
    filter === 'All'
      ? NEARBY_PLACES
      : NEARBY_PLACES.filter((p) => p.category === filter);

  const renderCategoryIcon = (category: NearbyPlace['category']) => {
    switch (category) {
      case 'RTO Office':
        return <Building2 className="w-4 h-4 text-[#0095F6]" />;
      case 'PUC Center':
        return <ShieldCheck className="w-4 h-4 text-[#16A34A]" />;
      case 'Hospitals (PM Rahat)':
        return <Hospital className="w-4 h-4 text-[#E31E24]" />;
      case 'Fuel & EV':
        return <Fuel className="w-4 h-4 text-[#0095F6]" />;
    }
  };

  return (
    <div className="flex-1 bg-white overflow-y-auto no-scrollbar pb-6">
      {/* Header + Location Selector */}
      <header className="px-4 pt-2 pb-3 sticky top-0 bg-white/95 backdrop-blur-xs z-20 border-b border-[#F2F4F7]">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-[22px] font-extrabold tracking-tight text-[#111827]">
            Nearby
          </h1>
          <div className="relative">
            <button
              type="button"
              onClick={() => setCityMenuOpen((o) => !o)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F2F4F7] hover:bg-[#E2E8F0] text-[12.5px] font-semibold text-[#111827] transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-[#0095F6]" />
              <span>{city}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#667085]" />
            </button>
            {cityMenuOpen && (
              <div className="absolute right-0 top-10 z-30 w-52 rounded-2xl bg-white border border-[#E2E8F0] shadow-xl py-1">
                {CITIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCity(c);
                      setCityMenuOpen(false);
                      onShowToast(`Location updated to ${c}`, 'info');
                    }}
                    className={`w-full px-3.5 py-2 text-left text-[12.5px] flex items-center justify-between cursor-pointer ${
                      city === c
                        ? 'bg-[#EBF5FF] text-[#0095F6] font-semibold'
                        : 'text-[#111827] hover:bg-[#F2F4F7]'
                    }`}
                  >
                    <span>{c}</span>
                    {city === c && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filter Chips */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {(
            ['All', 'RTO Office', 'PUC Center', 'Hospitals (PM Rahat)', 'Fuel & EV'] as NearbyFilter[]
          ).map((chip) => {
            const active = filter === chip;
            return (
              <button
                key={chip}
                type="button"
                onClick={() => setFilter(chip)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#0095F6] text-white'
                    : 'bg-[#F2F4F7] text-[#475569] hover:bg-[#E2E8F0]'
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      </header>

      <div className="px-4 pt-3.5 space-y-3.5">
        {/* Stylized Interactive Map Preview */}
        <div
          className="relative h-[182px] w-full rounded-2xl overflow-hidden border border-[#E2E8F0] bg-[#EEF4FA] shadow-inner"
          aria-label="Stylized Ernakulam Map Preview"
        >
          {/* SVG Street & Highway Grid */}
          <svg
            viewBox="0 0 360 180"
            className="absolute inset-0 w-full h-full"
            aria-hidden="true"
          >
            {/* Park / water patches */}
            <path d="M0 130 Q 60 115 110 155 L 0 180 Z" fill="#D5E9FA" />
            <rect x="240" y="18" width="84" height="52" rx="14" fill="#DCFCE7" opacity="0.65" />
            {/* Secondary roads */}
            <path d="M0 60 L360 72" stroke="#FFFFFF" strokeWidth="6" />
            <path d="M95 0 L125 180" stroke="#FFFFFF" strokeWidth="6" />
            <path d="M235 0 L215 180" stroke="#FFFFFF" strokeWidth="5" />
            {/* NH 66 Highway */}
            <path
              d="M-10 148 C 85 112, 195 95, 370 36"
              stroke="#CBD5E1"
              strokeWidth="12"
              fill="none"
            />
            <path
              d="M-10 148 C 85 112, 195 95, 370 36"
              stroke="#FFFFFF"
              strokeWidth="8"
              fill="none"
            />
            <path
              d="M-10 148 C 85 112, 195 95, 370 36"
              stroke="#93C5FD"
              strokeWidth="1.5"
              strokeDasharray="6 6"
              fill="none"
            />
          </svg>

          {/* Road Label */}
          <span className="absolute bottom-2.5 left-3 px-2 py-0.5 rounded-md bg-white/90 text-[10px] font-bold text-[#475569] shadow-xs">
            NH 66 • Edappally – Kakkanad
          </span>

          {/* User Current Blue Dot */}
          <div
            className="absolute left-[48%] top-[48%] -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#0095F6] ring-4 ring-[#0095F6]/25 shadow-sm"
            title="Your Location"
          />

          {/* Interactive Map Pins */}
          {visiblePlaces.map((place) => {
            const selected = selectedPlaceId === place.id;
            const pinBg =
              place.pinColor === 'red'
                ? 'bg-[#E31E24]'
                : place.pinColor === 'green'
                ? 'bg-[#16A34A]'
                : 'bg-[#0095F6]';
            return (
              <button
                key={place.id}
                type="button"
                onClick={() => setSelectedPlaceId(place.id)}
                aria-label={`Select ${place.name} on map`}
                style={{ left: `${place.mapX}%`, top: `${place.mapY}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-transform ${
                  selected ? 'scale-110 z-10' : 'hover:scale-105'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full ${pinBg} text-white flex items-center justify-center ring-2 ring-white shadow-md`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                {selected && (
                  <span className="mt-1 px-2 py-0.5 rounded-md bg-[#111827] text-white text-[9.5px] font-semibold whitespace-nowrap shadow">
                    {place.distanceKm}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Facility Cards */}
        <div className="space-y-3">
          {visiblePlaces.map((place) => {
            const isSelected = selectedPlaceId === place.id;
            return (
              <div
                key={place.id}
                className={`rounded-2xl bg-white border p-3.5 transition-all ${
                  isSelected
                    ? 'border-[#0095F6] shadow-[0_4px_14px_rgba(0,149,246,0.12)]'
                    : 'border-[#E2E8F0] shadow-[0_1px_6px_rgba(15,23,42,0.03)]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#F2F4F7] flex items-center justify-center shrink-0 mt-0.5">
                      {renderCategoryIcon(place.category)}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-[14px] font-bold text-[#111827] leading-snug">
                        {place.name}
                      </h2>
                      <p className="text-[11.5px] text-[#667085] mt-0.5 leading-snug">
                        {place.address}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-semibold text-[#16A34A]">
                          {place.openStatus}
                        </span>
                        {place.badge && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              place.pinColor === 'red'
                                ? 'bg-[#FEF2F2] text-[#E31E24]'
                                : 'bg-[#EBF5FF] text-[#0095F6]'
                            }`}
                          >
                            {place.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono-code text-[12px] font-bold text-[#111827] bg-[#F2F4F7] px-2 py-1 rounded-lg shrink-0">
                    {place.distanceKm}
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#F2F4F7] grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onShowToast(`Starting turn-by-turn route to ${place.name} (${place.distanceKm})`, 'info')
                    }
                    className="h-9 rounded-xl bg-[#0095F6] hover:bg-[#0082D6] text-white text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Directions</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onShowToast(`Calling ${place.name} (${place.phone})`, 'info')}
                    className="h-9 rounded-xl bg-[#F2F4F7] hover:bg-[#E2E8F0] text-[#111827] text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#0095F6]" />
                    <span>Call</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
