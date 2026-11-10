import React, { useCallback, useRef, useState } from 'react';
import { MoveHorizontal } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  alt: string;
  aspectClass?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeSrc,
  afterSrc,
  beforeLabel = 'Original Supplier',
  afterLabel = 'Prepared Catalog',
  alt,
  aspectClass = 'aspect-square',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(52);
  const [dragging, setDragging] = useState(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(96, Math.max(4, Math.round(pct * 10) / 10)));
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    updateFromClientX(e.clientX);
  };

  const handlePointerUp = () => {
    setDragging(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setPosition((p) => Math.max(4, p - 4));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setPosition((p) => Math.min(96, p + 4));
    }
  };

  return (
    <div
      ref={containerRef}
      role="slider"
      tabIndex={0}
      aria-label={`Before and after comparison for ${alt}`}
      aria-valuemin={4}
      aria-valuemax={96}
      aria-valuenow={Math.round(position)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      className={`relative w-full ${aspectClass} select-none overflow-hidden rounded-2xl border border-[#E6EAE4] bg-[#F3EFE7] cursor-ew-resize touch-none focus:outline-none focus:ring-2 focus:ring-[#526D5B]`}
    >
      {/* After image (full width underneath) */}
      <img
        src={afterSrc}
        alt={`${alt} - ${afterLabel}`}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Before image (clipped left side) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <img
          src={beforeSrc}
          alt={`${alt} - ${beforeLabel}`}
          draggable={false}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Labels */}
      <div className="pointer-events-none absolute top-3 left-3 rounded-md bg-[#26352F]/75 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-[2px]">
        {beforeLabel}
      </div>
      <div className="pointer-events-none absolute top-3 right-3 rounded-md bg-[#344D3D]/85 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-[2px]">
        {afterLabel}
      </div>

      {/* Divider line & circular handle */}
      <div
        className="pointer-events-none absolute inset-y-0 w-[2px] bg-white shadow-sm"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-[#E6EAE4] bg-white text-[#26352F] shadow-sf-md">
          <MoveHorizontal className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

