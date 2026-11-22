import React, { useState } from 'react';
import { X, Flashlight, Image as ImageIcon, QrCode, CheckCircle2 } from 'lucide-react';
import { hapticSuccess, hapticTap } from '../../utils/haptics';

interface ScanQrScreenProps {
  onClose: () => void;
  onOpenMyQrCode: () => void;
  onScanSimulated: (regNo: string) => void;
  onShowToast: (text: string, tone?: 'success' | 'info' | 'warning') => void;
}

export function ScanQrScreen({
  onClose,
  onOpenMyQrCode,
  onScanSimulated,
  onShowToast,
}: ScanQrScreenProps) {
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleGalleryUpload = () => {
    hapticSuccess();
    setScanned(true);
    onShowToast('QR decoded from gallery: KL 42 AB 5784 (Verified RC)', 'success');
    setTimeout(() => {
      onScanSimulated('KL 42 AB 5784');
    }, 650);
  };

  return (
    <div className="flex-1 bg-[#0F172A] text-white flex flex-col justify-between relative overflow-hidden pb-9">
      {/* Subtle simulated camera bokeh backdrop */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${
          flashlightOn ? 'opacity-40' : 'opacity-15'
        }`}
        style={{
          background:
            'radial-gradient(circle at 50% 44%, rgba(0,149,246,0.38) 0%, rgba(15,23,42,0.9) 62%)',
        }}
      />

      {/* Top Frosted Controls */}
      <div className="relative z-10 px-5 pt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close QR scanner"
          className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md flex items-center justify-center text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[12px] font-semibold tracking-wide text-white/95">
          MoRTH QR Verifier
        </div>

        <button
          type="button"
          onClick={() => {
            setFlashlightOn((f) => !f);
            onShowToast(!flashlightOn ? 'Flashlight turned ON' : 'Flashlight turned OFF', 'info');
          }}
          aria-label="Toggle flashlight"
          aria-pressed={flashlightOn}
          className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer ${
            flashlightOn
              ? 'bg-[#0095F6] text-white shadow-[0_0_18px_rgba(0,149,246,0.7)]'
              : 'bg-white/15 hover:bg-white/25 text-white'
          }`}
        >
          <Flashlight className="w-5 h-5" />
        </button>
      </div>

      {/* Center 240x240 Viewfinder Square */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6">
        <button
          type="button"
          onClick={handleGalleryUpload}
          aria-label="Tap viewfinder to simulate scanning a Virtual RC QR code"
          className="relative w-[240px] h-[240px] rounded-[28px] bg-white/[0.04] backdrop-blur-[2px] flex items-center justify-center cursor-pointer group"
        >
          {/* 4 Sky-Blue Corner Brackets */}
          <span className="absolute top-0 left-0 w-9 h-9 border-t-[4px] border-l-[4px] border-[#0095F6] rounded-tl-[24px]" />
          <span className="absolute top-0 right-0 w-9 h-9 border-t-[4px] border-r-[4px] border-[#0095F6] rounded-tr-[24px]" />
          <span className="absolute bottom-0 left-0 w-9 h-9 border-b-[4px] border-l-[4px] border-[#0095F6] rounded-bl-[24px]" />
          <span className="absolute bottom-0 right-0 w-9 h-9 border-b-[4px] border-r-[4px] border-[#0095F6] rounded-br-[24px]" />

          {/* Animated Scan Line */}
          {!scanned ? (
            <div className="absolute inset-x-4 top-0 h-[2.5px] rounded-full bg-gradient-to-r from-transparent via-[#0095F6] to-transparent shadow-[0_0_14px_#0095F6] animate-qr-scan" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-[#16A34A]">
              <CheckCircle2 className="w-12 h-12" />
              <span className="text-[13px] font-bold text-white">Verified Record Found</span>
            </div>
          )}

          {!scanned && (
            <span className="px-3 py-1.5 rounded-full bg-black/40 text-[11px] font-medium text-white/80 group-hover:bg-[#0095F6]/30 transition-colors">
              Tap frame to simulate scan
            </span>
          )}
        </button>

        <p className="mt-5 text-[14px] font-semibold text-white text-center">
          Align Virtual RC / DL or e-Challan QR
        </p>
        <p className="mt-1 text-[12px] text-white/65 text-center max-w-[260px]">
          Instantly verify authenticity against Vahan 4.0 & Sarathi 4.0 databases
        </p>
      </div>

      {/* Bottom Frosted Bar */}
      <div className="relative z-10 px-5">
        <div className="rounded-2xl bg-white/12 backdrop-blur-lg border border-white/15 p-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleGalleryUpload}
            className="h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[12.5px] font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ImageIcon className="w-4 h-4 text-[#38BDF8]" />
            <span>Upload from Gallery</span>
          </button>
          <button
            type="button"
            onClick={() => {
              hapticTap();
              onOpenMyQrCode();
            }}
            className="h-12 rounded-xl bg-[#0095F6] hover:bg-[#0082D6] text-white text-[12.5px] font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>My QR Code</span>
          </button>
        </div>
      </div>
    </div>
  );
}
