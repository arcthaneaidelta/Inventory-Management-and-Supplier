import React, { useEffect, useState } from 'react';
import { SupplyFlowLogo } from '../common/SupplyFlowLogo';

const BOOT_MESSAGES = [
  'Connecting your workspace',
  'Organizing supplier channels',
  'Preparing product intelligence',
  'Initializing inventory systems',
  'Everything is ready',
];

export const BootSplash: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(12);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      onComplete();
      return;
    }

    const timers = [
      setTimeout(() => { setStep(1); setProgress(34); }, 300),
      setTimeout(() => { setStep(2); setProgress(58); }, 620),
      setTimeout(() => { setStep(3); setProgress(82); }, 950),
      setTimeout(() => { setStep(4); setProgress(100); }, 1280),
      setTimeout(() => { setFadingOut(true); }, 1480),
      setTimeout(() => { onComplete(); }, 1720),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F7F8F5] px-6 transition-opacity duration-200 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="status"
      aria-label="Preparing your SUPPLYFLOW workspace"
    >
      {/* Subtle geometric supply-to-hub vector illustration */}
      <div className="mb-7">
        <svg
          width="116"
          height="52"
          viewBox="0 0 116 52"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Left supplier channel dots */}
          <circle cx="12" cy="10" r="3.5" fill={step >= 0 ? '#526D5B' : '#CBD4CB'} />
          <circle cx="12" cy="26" r="3.5" fill={step >= 1 ? '#526D5B' : '#CBD4CB'} />
          <circle cx="12" cy="42" r="3.5" fill={step >= 2 ? '#526D5B' : '#CBD4CB'} />

          {/* Connecting lines */}
          <path
            d="M16 10 H44 C50 10 53 14 53 20 V26 M16 26 H72 M16 42 H44 C50 42 53 38 53 32 V26"
            stroke="#D6DCD4"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M16 10 H44 C50 10 53 14 53 20 V26 M16 26 H72 M16 42 H44 C50 42 53 38 53 32 V26"
            stroke="#526D5B"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="160"
            strokeDashoffset={Math.max(0, 160 - progress * 1.6)}
            style={{ transition: 'stroke-dashoffset 280ms ease-out' }}
          />

          {/* Central organized system node */}
          <rect
            x="72"
            y="10"
            width="32"
            height="32"
            rx="8"
            fill="#FFFFFF"
            stroke={step >= 3 ? '#526D5B' : '#D6DCD4'}
            strokeWidth="1.5"
            style={{ transition: 'stroke 240ms ease' }}
          />
          <rect x="80" y="18" width="16" height="4" rx="1.5" fill="#344D3D" />
          <rect x="80" y="25" width="11" height="3" rx="1.5" fill="#78837C" />
          <rect x="80" y="31" width="13" height="3" rx="1.5" fill="#9AA39C" />
        </svg>
      </div>

      <SupplyFlowLogo size="lg" />

      <p className="mt-5 text-sm font-medium text-[#26352F]">Preparing your workspace</p>

      {/* Thin progress line */}
      <div className="mt-4 h-[2px] w-56 overflow-hidden rounded-full bg-[#E6EAE4]">
        <div
          className="h-full bg-[#526D5B] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-3 h-4 text-xs text-[#78837C] transition-opacity duration-150">
        {BOOT_MESSAGES[step]}
      </p>
    </div>
  );
};

