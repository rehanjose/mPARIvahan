import React, { useState } from 'react';
import {
  ChevronLeft,
  ShieldCheck,
  AlertTriangle,
  Camera,
  CheckCircle2,
  CreditCard,
  Landmark,
  Smartphone,
  Download,
  Lock,
  X,
  ArrowRight,
  Flag,
} from 'lucide-react';
import { ChallanRecord } from '../../types';
import { QrCodeSvg } from '../QrCodeSvg';
import { hapticSuccess, hapticTap, hapticWarning } from '../../utils/haptics';

interface ChallanPaymentFlowProps {
  challan: ChallanRecord;
  onBack: () => void;
  onPaymentSuccess: (challanId: string, method: string) => void;
  onViewTransactions: () => void;
  onBackToHome: () => void;
  onShowToast: (text: string, tone?: 'success' | 'info' | 'warning') => void;
}

type PaymentMethod = 'UPI (GPay / PhonePe / Paytm)' | 'Debit / Credit Card' | 'Net Banking';

export function ChallanPaymentFlow({
  challan,
  onBack,
  onPaymentSuccess,
  onViewTransactions,
  onBackToHome,
  onShowToast,
}: ChallanPaymentFlowProps) {
  const [pledged, setPledged] = useState(false);
  const [gatewayOpen, setGatewayOpen] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>('UPI (GPay / PhonePe / Paytm)');
  const [processing, setProcessing] = useState(false);
  const [paidReceiptRef, setPaidReceiptRef] = useState<string | null>(
    challan.status === 'paid' ? challan.paymentRef ?? '#MPV202611239981' : null
  );
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  const handlePaySecurely = () => {
    hapticTap();
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setGatewayOpen(false);
      const shortMethod = method.startsWith('UPI')
        ? 'UPI'
        : method.startsWith('Debit')
        ? 'Card'
        : 'Net Banking';
      onPaymentSuccess(challan.id, shortMethod);
      setPaidReceiptRef('#MPV202611239981');
    }, 550);
  };

  // SCREEN C: PAYMENT SUCCESS & SIGNED RECEIPT
  if (paidReceiptRef) {
    return (
      <div className="flex-1 bg-white overflow-y-auto no-scrollbar px-5 pt-6 pb-8 flex flex-col">
        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-16 h-16 rounded-full bg-[#ECFDF5] text-[#16A34A] flex items-center justify-center ring-8 ring-[#ECFDF5]/60">
            <CheckCircle2 className="w-9 h-9" strokeWidth={2.3} />
          </div>
          <h1 className="mt-4 text-[21px] font-extrabold text-[#111827]">
            Challan Paid Successfully!
          </h1>
          <p className="mt-1 text-[13px] text-[#667085]">
            Thank you for pledging to drive safely.
          </p>
        </div>

        {/* Signed Receipt Card */}
        <div className="mt-5 rounded-[20px] bg-white border border-[#E2E8F0] shadow-[0_4px_18px_rgba(15,23,42,0.06)] p-4">
          <div className="flex items-center justify-between pb-3 border-b border-dashed border-[#E2E8F0]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#16A34A]">
                Digitally Signed Receipt
              </p>
              <p className="font-mono-code text-[22px] font-extrabold text-[#111827] mt-0.5">
                ₹{challan.amount}
              </p>
            </div>
            <QrCodeSvg seed={paidReceiptRef} size={62} />
          </div>

          <div className="mt-3 space-y-2.5 text-[12.5px]">
            <div className="flex justify-between">
              <span className="text-[#667085]">Challan ID</span>
              <span className="font-mono-code font-bold text-[#111827]">{challan.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Vehicle No.</span>
              <span className="font-mono-code font-bold text-[#111827]">{challan.vehicleNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Payment Mode</span>
              <span className="font-semibold text-[#111827]">
                {method.startsWith('UPI') ? 'UPI' : method}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Convenience Fee</span>
              <span className="font-semibold text-[#16A34A]">₹0 (Official Gateway)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Transaction Ref</span>
              <span className="font-mono-code font-bold text-[#0095F6]">{paidReceiptRef}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-2.5">
          <button
            type="button"
            onClick={() => {
              hapticSuccess();
              onShowToast(`Saved Official_Receipt_${challan.id.replace('#', '')}.pdf`, 'success');
            }}
            className="w-full h-12 rounded-2xl bg-[#0095F6] hover:bg-[#0082D6] text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Official PDF Receipt</span>
          </button>

          <button
            type="button"
            onClick={onViewTransactions}
            className="w-full h-11 rounded-2xl bg-[#EBF5FF] hover:bg-[#DBEAFE] text-[#0095F6] font-bold text-[13.5px] transition-colors cursor-pointer"
          >
            View in Transactions
          </button>

          <button
            type="button"
            onClick={onBackToHome}
            className="w-full h-11 rounded-2xl bg-[#F2F4F7] hover:bg-[#E2E8F0] text-[#111827] font-semibold text-[13.5px] transition-colors cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // SCREEN A: CHALLAN DETAIL & SAFETY NUDGE
  return (
    <div className="flex-1 bg-white flex flex-col overflow-hidden relative">
      {/* Header */}
      <header className="px-4 pt-2 pb-2.5 border-b border-[#F2F4F7] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="w-9 h-9 -ml-2 rounded-full flex items-center justify-center text-[#111827] hover:bg-[#F2F4F7] cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-[17px] font-extrabold text-[#111827]">
              Challan Details
            </h1>
            <p className="font-mono-code text-[11.5px] text-[#667085]">{challan.id}</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-[#FEF2F2] text-[#E31E24] font-mono-code text-[12px] font-bold">
          ₹{challan.amount}
        </span>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-3 pb-6 space-y-3.5">
        {/* Green Official Trust Banner */}
        <div className="rounded-2xl bg-[#ECFDF5] border border-[#BBF7D0] px-3.5 py-2.5 flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-[#16A34A] shrink-0" />
          <p className="text-[12px] font-bold text-[#166534] leading-snug">
            Official MoRTH / Parivahan Gateway • ₹0 Convenience Fee
          </p>
        </div>

        {/* Violation Evidence Card */}
        <div className="rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_2px_10px_rgba(15,23,42,0.04)] overflow-hidden">
          {/* Simulated CCTV Highway Photo */}
          <div className="relative h-[148px] bg-[#0F172A] overflow-hidden">
            <svg viewBox="0 0 360 150" className="w-full h-full" aria-hidden="true">
              {/* Dusk highway sky & road */}
              <defs>
                <linearGradient id="cctvSky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E293B" />
                  <stop offset="100%" stopColor="#334155" />
                </linearGradient>
              </defs>
              <rect width="360" height="72" fill="url(#cctvSky)" />
              <rect y="72" width="360" height="78" fill="#1F2937" />
              {/* Perspective Highway Lanes */}
              <polygon points="145,72 215,72 325,150 35,150" fill="#374151" />
              <line
                x1="180"
                y1="72"
                x2="180"
                y2="150"
                stroke="#FDE047"
                strokeWidth="2"
                strokeDasharray="8 6"
              />
              {/* Car silhouette with red ANPR detection box */}
              <g transform="translate(132, 86)">
                <rect x="6" y="14" width="84" height="22" rx="6" fill="#E2E8F0" />
                <path d="M18 14 L28 2 L68 2 L78 14 Z" fill="#CBD5E1" />
                <rect x="26" y="23" width="44" height="10" rx="2" fill="#FFFFFF" />
                <text
                  x="48"
                  y="30.5"
                  textAnchor="middle"
                  fontSize="6.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                  fill="#111827"
                >
                  KL42AB5784
                </text>
                {/* ANPR Bounding Box */}
                <rect
                  x="-3"
                  y="-4"
                  width="102"
                  height="46"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
              </g>
            </svg>

            {/* CCTV HUD Overlay */}
            <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between text-[10px] font-mono-code text-white/90">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black/60">
                <Camera className="w-3 h-3 text-[#EF4444]" />
                AI-CAM NH66-EDP-04
              </span>
              <span className="px-2 py-0.5 rounded bg-[#E31E24] font-bold">
                82 km/h (Limit 60)
              </span>
            </div>
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono-code text-white/85">
              <span className="px-2 py-0.5 rounded bg-black/60">{challan.timestamp}</span>
              <span className="px-2 py-0.5 rounded bg-black/60">{challan.vehicleNo}</span>
            </div>
          </div>

          <div className="p-3.5 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-[15px] font-bold text-[#111827]">{challan.offence}</h2>
                <p className="text-[12px] text-[#667085]">{challan.location}</p>
              </div>
              <span className="font-mono-code text-[15px] font-extrabold text-[#E31E24]">
                ₹{challan.amount}
              </span>
            </div>

            <div className="pt-2 border-t border-[#F2F4F7] flex items-center justify-between text-[12px]">
              <span className="font-medium text-[#475569]">{challan.section}</span>
              <button
                type="button"
                onClick={() => setDisputeOpen(true)}
                className="inline-flex items-center gap-1 font-semibold text-[#0095F6] hover:underline cursor-pointer"
              >
                <Flag className="w-3 h-3" />
                <span>Dispute Challan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Interactive 3-Second Safety Check Card */}
        <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-4">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-extrabold text-[#92400E]">
                3-Second Safety Check
              </p>
              <p className="mt-1 text-[12px] text-[#78350F] leading-relaxed">
                Driving 20 km/h over the limit increases fatal crash risk by{' '}
                <strong>40%</strong>. Reaching 5 minutes late is always better than not reaching at all.
              </p>
            </div>
          </div>

          {/* Mandatory Interactive Toggle */}
          <label className="mt-3.5 pt-3 border-t border-[#FDE68A] flex items-center justify-between gap-3 cursor-pointer select-none">
            <span className="text-[12.5px] font-bold text-[#111827]">
              I acknowledge & pledge to drive safely
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={pledged}
              aria-label="I acknowledge and pledge to drive safely"
              onClick={() => {
                hapticTap();
                setPledged((p) => !p);
              }}
              className={`relative w-12 h-7 rounded-full transition-colors shrink-0 cursor-pointer ${
                pledged ? 'bg-[#16A34A]' : 'bg-[#CBD5E1]'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                  pledged ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </label>
        </div>
      </div>

      {/* Sticky Bottom CTA */}
      <div className="shrink-0 bg-white border-t border-[#E2E8F0] px-4 pt-3 pb-7">
        <button
          type="button"
          disabled={!pledged}
          onClick={() => {
            hapticTap();
            setGatewayOpen(true);
          }}
          className={`w-full h-12 rounded-2xl font-bold text-[14.5px] flex items-center justify-center gap-1.5 transition-all ${
            pledged
              ? 'bg-[#0095F6] hover:bg-[#0082D6] text-white shadow-[0_6px_16px_rgba(0,149,246,0.3)] cursor-pointer'
              : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
          }`}
        >
          <span>Proceed to Pay ₹{challan.amount}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        {!pledged && (
          <p className="mt-2 text-center text-[11px] text-[#667085]">
            Toggle the safety pledge above to unlock secure payment
          </p>
        )}
      </div>

      {/* SCREEN B: OFFICIAL PAYMENT GATEWAY BOTTOM SHEET */}
      {gatewayOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-[#0F172A]/50"
            onClick={() => !processing && setGatewayOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Official Parivahan Pay Gateway"
            className="relative z-10 w-full max-w-[402px] bg-white rounded-t-[28px] px-5 pt-3 pb-8 shadow-2xl"
          >
            <div className="w-11 h-1 rounded-full bg-[#CBD5E1] mx-auto mb-3.5" />

            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#16A34A] text-[11px] font-bold">
                  <Lock className="w-3 h-3" />
                  <span>Official Parivahan Pay • 100% Secure</span>
                </div>
                <h2 className="mt-2 text-[19px] font-extrabold text-[#111827]">
                  Select Payment Method
                </h2>
              </div>
              <button
                type="button"
                onClick={() => !processing && setGatewayOpen(false)}
                aria-label="Close payment gateway"
                className="w-9 h-9 rounded-full bg-[#F2F4F7] flex items-center justify-center text-[#111827] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Fee Breakdown */}
            <div className="mt-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 space-y-1.5 text-[12.5px]">
              <div className="flex justify-between">
                <span className="text-[#667085]">Challan Amount ({challan.id})</span>
                <span className="font-mono-code font-semibold text-[#111827]">
                  ₹{challan.amount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Platform / Convenience Fee</span>
                <span className="font-mono-code font-bold text-[#16A34A]">₹0</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E2E8F0] text-[14px]">
                <span className="font-bold text-[#111827]">Total Payable</span>
                <span className="font-mono-code font-extrabold text-[#111827]">
                  ₹{challan.amount}
                </span>
              </div>
            </div>

            {/* Payment Method Radio Options */}
            <div className="mt-4 space-y-2.5" role="radiogroup" aria-label="Payment method">
              {(
                [
                  {
                    id: 'UPI (GPay / PhonePe / Paytm)' as PaymentMethod,
                    sub: 'Instant settlement • Recommended',
                    Icon: Smartphone,
                  },
                  {
                    id: 'Debit / Credit Card' as PaymentMethod,
                    sub: 'RuPay, Visa, Mastercard',
                    Icon: CreditCard,
                  },
                  {
                    id: 'Net Banking' as PaymentMethod,
                    sub: 'SBI, HDFC, Federal Bank & 45+ banks',
                    Icon: Landmark,
                  },
                ]
              ).map(({ id, sub, Icon }) => {
                const selected = method === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setMethod(id)}
                    className={`w-full text-left rounded-2xl border p-3 flex items-center gap-3 transition-all cursor-pointer ${
                      selected
                        ? 'border-[#0095F6] bg-[#EBF5FF]/60'
                        : 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[#0095F6] shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-bold text-[#111827]">{id}</p>
                      <p className="text-[11.5px] text-[#667085]">{sub}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selected ? 'border-[#0095F6]' : 'border-[#CBD5E1]'
                      }`}
                    >
                      {selected && <div className="w-2.5 h-2.5 rounded-full bg-[#0095F6]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={processing}
              onClick={handlePaySecurely}
              className="mt-5 w-full h-12 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>
                {processing
                  ? 'Verifying with Parivahan...'
                  : `Pay ₹${challan.amount} Securely`}
              </span>
            </button>
            <p className="mt-2.5 text-center text-[11px] text-[#667085]">
              No platform charges. Pay only the official fine.
            </p>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {disputeOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/45" onClick={() => setDisputeOpen(false)} />
          <div className="relative z-10 w-full max-w-[402px] bg-white rounded-t-[28px] p-5 pb-9 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[17px] font-bold text-[#111827]">
                Dispute Challan {challan.id}
              </h2>
              <button
                type="button"
                onClick={() => setDisputeOpen(false)}
                aria-label="Close dispute dialog"
                className="w-8 h-8 rounded-full bg-[#F2F4F7] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              rows={3}
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Explain why this challan was issued in error (e.g. incorrect plate read)..."
              className="w-full rounded-xl bg-[#F2F4F7] p-3 text-[13px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0095F6]"
            />
            <button
              type="button"
              onClick={() => {
                if (!disputeReason.trim()) {
                  hapticWarning();
                  onShowToast('Please describe your dispute reason first.', 'warning');
                  return;
                }
                hapticSuccess();
                setDisputeOpen(false);
                setDisputeReason('');
                onShowToast(`Grievance registered for ${challan.id} with RTO Ernakulam`, 'success');
              }}
              className="mt-3 w-full h-11 rounded-xl bg-[#0095F6] text-white font-semibold text-[13.5px] cursor-pointer"
            >
              Submit Dispute to RTO
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
