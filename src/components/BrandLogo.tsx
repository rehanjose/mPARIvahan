import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  lightText?: boolean;
}

export function BrandLogo({
  size = 'md',
  showText = true,
  lightText = false,
}: BrandLogoProps) {
  const circleDim =
    size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-9 h-9';
  const iconDim = size === 'sm' ? 18 : size === 'lg' ? 30 : 21;

  return (
    <div className="flex items-center gap-2 shrink-0 select-none">
      <div
        className={`${circleDim} rounded-full bg-[#E31E24] flex items-center justify-center shadow-sm shrink-0`}
        aria-hidden="true"
      >
        <svg
          width={iconDim}
          height={iconDim}
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Smartphone outline */}
          <rect
            x="5.5"
            y="3.5"
            width="12.5"
            height="21"
            rx="2.3"
            stroke="white"
            strokeWidth="1.7"
          />
          <circle cx="11.75" cy="21.4" r="0.9" fill="white" />
          {/* Car silhouette overlapping right side */}
          <path
            d="M11.5 15.2L13 12.1C13.3 11.5 13.9 11.1 14.6 11.1H20.4C21.1 11.1 21.7 11.5 22 12.1L23.5 15.2H11.5Z"
            fill="white"
          />
          <rect x="10.2" y="14.7" width="14.6" height="4.4" rx="1.6" fill="white" />
          <circle cx="13.2" cy="19.4" r="1.5" fill="#E31E24" stroke="white" strokeWidth="1.2" />
          <circle cx="21.8" cy="19.4" r="1.5" fill="#E31E24" stroke="white" strokeWidth="1.2" />
          {/* Tiny windshield cutout */}
          <path
            d="M13.6 14.4L14.5 12.4H20.5L21.4 14.4H13.6Z"
            fill="#E31E24"
          />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`text-[10.5px] font-semibold tracking-tight ${
              lightText ? 'text-white/90' : 'text-[#111827]'
            }`}
          >
            NextGen
          </span>
          <span
            className={`text-[15.5px] font-extrabold tracking-[-0.025em] -mt-[1px] ${
              lightText ? 'text-white' : 'text-[#111827]'
            }`}
          >
            mParivahan
          </span>
        </div>
      )}
    </div>
  );
}
