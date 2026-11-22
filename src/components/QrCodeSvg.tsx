import React from 'react';

interface QrCodeSvgProps {
  seed: string;
  size?: number;
  className?: string;
}

/**
 * Deterministic high-contrast QR-style matrix SVG for Virtual DL/RC Back & Signed Receipts.
 */
export function QrCodeSvg({ seed, size = 148, className = '' }: QrCodeSvgProps) {
  const grid = 21;
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const isFinderZone = (r: number, c: number) => {
    const inTopLeft = r < 7 && c < 7;
    const inTopRight = r < 7 && c >= grid - 7;
    const inBottomLeft = r >= grid - 7 && c < 7;
    return inTopLeft || inTopRight || inBottomLeft;
  };

  const modules: React.ReactElement[] = [];

  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      if (isFinderZone(r, c)) continue;
      // Quiet separator around finder patterns
      if (
        (r === 7 && c < 8) ||
        (c === 7 && r < 8) ||
        (r === 7 && c >= grid - 8) ||
        (c === grid - 8 && r < 8) ||
        (r === grid - 8 && c < 8) ||
        (c === 7 && r >= grid - 8)
      ) {
        continue;
      }
      // Timing patterns
      if (r === 6 || c === 6) {
        if ((r + c) % 2 === 0) {
          modules.push(<rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#111827" />);
        }
        continue;
      }
      // Deterministic pseudo-random module bit
      const val = Math.imul(hash ^ ((r + 3) * 37 + (c + 5) * 91), 2654435761) >>> 0;
      if (val % 10 < 5) {
        modules.push(
          <rect
            key={`${r}-${c}`}
            x={c}
            y={r}
            width={1}
            height={1}
            rx={0.14}
            fill="#111827"
          />
        );
      }
    }
  }

  const renderFinder = (ox: number, oy: number) => (
    <g key={`finder-${ox}-${oy}`}>
      <rect x={ox} y={oy} width={7} height={7} rx={1.1} fill="#111827" />
      <rect x={ox + 1} y={oy + 1} width={5} height={5} rx={0.6} fill="#FFFFFF" />
      <rect x={ox + 2} y={oy + 2} width={3} height={3} rx={0.4} fill="#111827" />
    </g>
  );

  return (
    <svg
      width={size}
      height={size}
      viewBox={`-1.5 -1.5 ${grid + 3} ${grid + 3}`}
      className={`bg-white rounded-xl ${className}`}
      role="img"
      aria-label={`Verification QR Code for ${seed}`}
    >
      <rect x={-1.5} y={-1.5} width={grid + 3} height={grid + 3} fill="#FFFFFF" rx={1.5} />
      {renderFinder(0, 0)}
      {renderFinder(grid - 7, 0)}
      {renderFinder(0, grid - 7)}
      {modules}
    </svg>
  );
}
