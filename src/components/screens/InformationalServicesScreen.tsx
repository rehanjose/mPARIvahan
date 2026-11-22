import React, { useState } from 'react';
import {
  ChevronLeft,
  Search,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  X,
} from 'lucide-react';
import { INFO_GUIDES } from '../../data/mockData';
import { InfoGuideItem, TransportTab } from '../../types';

type InfoFilter = 'All' | InfoGuideItem['category'];

interface InformationalServicesScreenProps {
  onBack: () => void;
  onApplyInTransport: (tab: TransportTab, serviceId?: string) => void;
}

export function InformationalServicesScreen({
  onBack,
  onApplyInTransport,
}: InformationalServicesScreenProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<InfoFilter>('Vehicle & RC');
  const [expandedId, setExpandedId] = useState<string>('guide-hypo');

  const filtered = INFO_GUIDES.filter((item) => {
    const matchesCat = filter === 'All' || item.category === filter;
    const matchesQuery =
      !search.trim() ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.summary.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="flex-1 bg-white overflow-y-auto no-scrollbar pb-6">
      {/* Header */}
      <header className="px-4 pt-2 pb-3 sticky top-0 bg-white/95 backdrop-blur-xs z-20 border-b border-[#F2F4F7]">
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
            Informational Services
          </h1>
        </div>

        {/* Search Bar */}
        <div className="mt-2.5 flex items-center gap-2 h-11 px-3.5 rounded-[14px] bg-[#F2F4F7]">
          <Search className="w-4 h-4 text-[#667085] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value.trim()) setFilter('All');
            }}
            placeholder="Search RTO guides, fees, documents..."
            className="flex-1 bg-transparent text-[13.5px] text-[#111827] placeholder:text-[#667085] focus:outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="text-[#667085] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {(
            ['Vehicle & RC', 'Driving Licence', 'App Guide', 'Notifications', 'All'] as InfoFilter[]
          ).map((pill) => {
            const active = filter === pill;
            return (
              <button
                key={pill}
                type="button"
                onClick={() => setFilter(pill)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#0095F6] text-white'
                    : 'bg-[#F2F4F7] text-[#475569] hover:bg-[#E2E8F0]'
                }`}
              >
                {pill}
              </button>
            );
          })}
        </div>
      </header>

      <div className="px-4 pt-3.5 space-y-2.5">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-[#E2E8F0] p-6 text-center">
            <p className="text-[14px] font-bold text-[#111827]">No guides matched</p>
            <p className="text-[12px] text-[#667085] mt-1">
              Try searching for Hypothecation, NOC, Duplicate RC, or Virtual DL.
            </p>
          </div>
        ) : (
          filtered.map((guide) => {
            const expanded = expandedId === guide.id;
            return (
              <div
                key={guide.id}
                className="rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_1px_6px_rgba(15,23,42,0.03)] overflow-hidden"
              >
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setExpandedId(expanded ? '' : guide.id)}
                  className="w-full px-4 py-3.5 flex items-center justify-between gap-2 text-left hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-[#111827] leading-snug">
                      {guide.title}
                    </p>
                    <p className="text-[11.5px] text-[#667085] mt-0.5">
                      {guide.category} • Standard Fee: {guide.feeInfo}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#667085] transition-transform shrink-0 ${
                      expanded ? 'rotate-180 text-[#0095F6]' : ''
                    }`}
                  />
                </button>

                {expanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-[#F2F4F7] space-y-3">
                    <p className="text-[12.5px] text-[#475569] leading-relaxed">
                      {guide.summary}
                    </p>

                    {/* Required Documents Tags */}
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#667085] mb-1.5">
                        Required Documents
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {guide.requiredDocs.map((doc) => (
                          <span
                            key={doc}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#166534] text-[11px] font-semibold"
                          >
                            <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Steps */}
                    <ol className="space-y-1.5 text-[12px] text-[#475569] list-decimal pl-4">
                      {guide.steps.map((st, idx) => (
                        <li key={idx} className="leading-snug">
                          {st}
                        </li>
                      ))}
                    </ol>

                    {/* Working CTA into Transport Services */}
                    <button
                      type="button"
                      onClick={() =>
                        onApplyInTransport(
                          guide.targetTransportTab ?? 'vehicle',
                          guide.targetServiceId
                        )
                      }
                      className="w-full h-10 rounded-xl bg-[#EBF5FF] hover:bg-[#DBEAFE] text-[#0095F6] font-bold text-[13px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Apply in Transport Services</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
