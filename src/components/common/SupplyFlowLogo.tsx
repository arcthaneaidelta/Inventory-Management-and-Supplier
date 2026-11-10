import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const SupplyFlowLogo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
}) => {
  const iconDim = size === 'sm' ? 24 : size === 'lg' ? 38 : 28;
  const textClass =
    size === 'sm'
      ? 'text-[14px] tracking-[0.12em]'
      : size === 'lg'
      ? 'text-[22px] tracking-[0.14em]'
      : 'text-[16px] tracking-[0.12em]';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg
        width={iconDim}
        height={iconDim}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* Outer subtle container */}
        <rect
          x="1.5"
          y="1.5"
          width="29"
          height="29"
          rx="7"
          fill="#E9F0E9"
          stroke="#526D5B"
          strokeWidth="1.5"
        />
        {/* Connected supplier channel nodes feeding central organized hub */}
        <circle cx="8.5" cy="9.5" r="2.2" fill="#526D5B" />
        <circle cx="8.5" cy="16" r="2.2" fill="#526D5B" />
        <circle cx="8.5" cy="22.5" r="2.2" fill="#526D5B" />
        <path
          d="M10.7 9.5H15.5C16.6 9.5 17.5 10.4 17.5 11.5V16M10.7 16H19M10.7 22.5H15.5C16.6 22.5 17.5 21.6 17.5 20.5V16"
          stroke="#344D3D"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {/* Central unified catalog node */}
        <rect
          x="19"
          y="10.5"
          width="6.5"
          height="11"
          rx="2"
          fill="#344D3D"
        />
        <line x1="21" y1="14" x2="23.5" y2="14" stroke="#E9F0E9" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="21" y1="17.5" x2="23.5" y2="17.5" stroke="#E9F0E9" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <div className="flex flex-col leading-none">
        <span className={`font-display font-semibold text-[#26352F] ${textClass}`}>
          SUPPLYFLOW
        </span>
        {showTagline && (
          <span className="mt-1 text-[11px] font-medium tracking-normal text-[#78837C]">
            Operations & Catalog Hub
          </span>
        )}
      </div>
    </div>
  );
};

