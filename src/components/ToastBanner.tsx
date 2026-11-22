import React from 'react';
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export interface ToastMessage {
  id: number;
  text: string;
  tone?: 'success' | 'info' | 'warning';
}

interface ToastBannerProps {
  toast: ToastMessage | null;
}

export function ToastBanner({ toast }: ToastBannerProps) {
  if (!toast) return null;

  const toneStyles =
    toast.tone === 'warning'
      ? 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]'
      : toast.tone === 'info'
      ? 'bg-[#111827] text-white border-[#1F2937]'
      : 'bg-[#ECFDF5] text-[#166534] border-[#BBF7D0]';

  const Icon =
    toast.tone === 'warning'
      ? AlertTriangle
      : toast.tone === 'info'
      ? Info
      : CheckCircle2;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute top-[56px] left-4 right-4 z-50 flex justify-center"
    >
      <div
        className={`pointer-events-auto flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border shadow-lg text-[12.5px] font-medium max-w-full ${toneStyles}`}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="leading-snug">{toast.text}</span>
      </div>
    </div>
  );
}
