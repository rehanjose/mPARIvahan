import React, { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  Clock,
  RefreshCw,
  X,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { TransactionRecord } from '../../types';
import { QrCodeSvg } from '../QrCodeSvg';
import { hapticSuccess, hapticTap } from '../../utils/haptics';

type TxFilter = 'All' | 'Applications' | 'Challans' | 'Receipts';

interface TransactionsScreenProps {
  transactions: TransactionRecord[];
  onVerifyTransaction: (txId: string) => void;
  onShowToast: (text: string, tone?: 'success' | 'info' | 'warning') => void;
}

export function TransactionsScreen({
  transactions,
  onVerifyTransaction,
  onShowToast,
}: TransactionsScreenProps) {
  const [filter, setFilter] = useState<TxFilter>('All');
  const [activeModalTx, setActiveModalTx] = useState<TransactionRecord | null>(null);

  const filtered =
    filter === 'All'
      ? transactions
      : transactions.filter((t) => t.category === filter);

  const handleCardAction = (tx: TransactionRecord) => {
    if (tx.actionType === 'verify') {
      onVerifyTransaction(tx.id);
      return;
    }
    hapticTap();
    setActiveModalTx(tx);
  };

  return (
    <div className="flex-1 bg-white overflow-y-auto no-scrollbar pb-6 relative">
      {/* Header */}
      <header className="px-4 pt-2 pb-3 sticky top-0 bg-white/95 backdrop-blur-xs z-10 border-b border-[#F2F4F7]">
        <h1 className="text-[22px] font-extrabold tracking-tight text-[#111827]">
          Transactions & Status
        </h1>
        <p className="text-[12px] text-[#667085] mt-0.5">
          Track RTO applications, paid challans & signed receipts
        </p>

        {/* Filter Pills */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {(['All', 'Applications', 'Challans', 'Receipts'] as TxFilter[]).map((pill) => {
            const active = filter === pill;
            return (
              <button
                key={pill}
                type="button"
                onClick={() => setFilter(pill)}
                className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
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

      <div className="px-4 pt-3.5 space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-[#E2E8F0] p-8 text-center">
            <FileText className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
            <p className="text-[14px] font-semibold text-[#111827]">No records in {filter}</p>
            <p className="text-[12px] text-[#667085] mt-1">
              Your submitted applications and receipts will appear here.
            </p>
          </div>
        ) : (
          filtered.map((tx) => {
            const badgeStyle =
              tx.statusTone === 'green'
                ? 'bg-[#ECFDF5] text-[#16A34A]'
                : tx.statusTone === 'amber'
                ? 'bg-[#FFFBEB] text-[#D97706]'
                : 'bg-[#EBF5FF] text-[#0095F6]';

            return (
              <div
                key={tx.id}
                className="rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_2px_10px_rgba(15,23,42,0.03)] p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="text-[14.5px] font-bold text-[#111827] leading-snug">
                      {tx.title}
                    </h2>
                    <p className="text-[12px] text-[#667085] mt-0.5">{tx.subtitle}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap shrink-0 ${badgeStyle}`}
                  >
                    {tx.status === 'Paid' ? 'Paid ✓' : tx.status}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11.5px] text-[#667085]">
                  <span className="font-mono-code">Ref: {tx.refNo}</span>
                  <span>
                    {tx.date}
                    {tx.amount !== undefined ? ` • ₹${tx.amount}` : ''}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-[#F2F4F7] flex items-center justify-between gap-2">
                  <span className="font-mono-code text-[11.5px] font-semibold text-[#475569]">
                    {tx.vehicleNo}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCardAction(tx)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12.5px] font-semibold transition-colors cursor-pointer ${
                      tx.actionType === 'receipt'
                        ? 'bg-[#EBF5FF] text-[#0095F6] hover:bg-[#DBEAFE]'
                        : tx.actionType === 'verify'
                        ? 'bg-[#0095F6] text-white hover:bg-[#0082D6]'
                        : 'bg-[#F2F4F7] text-[#111827] hover:bg-[#E2E8F0]'
                    }`}
                  >
                    {tx.actionType === 'receipt' && <Download className="w-3.5 h-3.5" />}
                    {tx.actionType === 'appointment' && <Calendar className="w-3.5 h-3.5" />}
                    {tx.actionType === 'verify' && <RefreshCw className="w-3.5 h-3.5" />}
                    <span>{tx.actionLabel}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Receipt / Appointment Slip Modal */}
      {activeModalTx && (
        <div className="fixed inset-0 z-40 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/45"
            onClick={() => setActiveModalTx(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={activeModalTx.actionLabel}
            className="relative z-10 w-full max-w-[402px] bg-white rounded-t-[28px] p-5 pb-9 shadow-2xl"
          >
            <div className="w-10 h-1 rounded-full bg-[#CBD5E1] mx-auto mb-4" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16A34A] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Official MoRTH Document
                </span>
                <h2 className="mt-2 text-[18px] font-bold text-[#111827]">
                  {activeModalTx.actionType === 'appointment'
                    ? 'RTO Appointment Slip'
                    : 'Digitally Signed Receipt'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalTx(null)}
                aria-label="Close document modal"
                className="w-9 h-9 rounded-full bg-[#F2F4F7] flex items-center justify-center text-[#111827] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-4 space-y-2.5 text-[12.5px]">
              <div className="flex justify-between">
                <span className="text-[#667085]">Service</span>
                <span className="font-semibold text-[#111827] text-right">{activeModalTx.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Vehicle No.</span>
                <span className="font-mono-code font-bold text-[#111827]">{activeModalTx.vehicleNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Reference ID</span>
                <span className="font-mono-code font-semibold text-[#111827]">{activeModalTx.refNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Date</span>
                <span className="font-semibold text-[#111827]">{activeModalTx.date}</span>
              </div>
              {activeModalTx.amount !== undefined && (
                <div className="flex justify-between pt-2 border-t border-[#E2E8F0]">
                  <span className="font-semibold text-[#111827]">Total Paid (₹0 Fee)</span>
                  <span className="font-mono-code font-bold text-[#16A34A]">₹{activeModalTx.amount}</span>
                </div>
              )}
              {activeModalTx.actionType === 'appointment' && (
                <div className="flex justify-between pt-2 border-t border-[#E2E8F0]">
                  <span className="text-[#667085]">Slot & Counter</span>
                  <span className="font-semibold text-[#0095F6]">26 Nov • 11:00 AM • Counter 3</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#E2E8F0] p-3">
              <QrCodeSvg seed={activeModalTx.refNo} size={68} />
              <div className="text-[11.5px] text-[#667085] leading-relaxed">
                <p className="font-semibold text-[#111827] flex items-center gap-1">
                  {activeModalTx.statusTone === 'green' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                  )}
                  NIC Digital Verification QR
                </p>
                Scan at RTO counter or traffic checkpoint for instant authenticity check.
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                hapticSuccess();
                onShowToast(`Saved ${activeModalTx.refNo}.pdf to Downloads`, 'success');
                setActiveModalTx(null);
              }}
              className="mt-4 w-full h-12 rounded-2xl bg-[#0095F6] hover:bg-[#0082D6] text-white font-semibold text-[14.5px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Official PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
