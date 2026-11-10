import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Sparkles, Info } from 'lucide-react';

export type BadgeTone = 'green' | 'amber' | 'red' | 'blue' | 'neutral';

export function toneForStatus(status: string): BadgeTone {
  const s = status.toLowerCase();
  if (
    s.includes('approved') ||
    s.includes('shopify ready') ||
    s.includes('connected') ||
    s.includes('active') ||
    s.includes('in stock') ||
    s.includes('success') ||
    s.includes('high confidence') ||
    s.includes('received') && s.includes('replenish') ||
    s.includes('accepted') ||
    s.includes('resolved')
  ) {
    return 'green';
  }
  if (
    s.includes('ready for approval') ||
    s.includes('awaiting') ||
    s.includes('pending') ||
    s.includes('processing') ||
    s.includes('low stock') ||
    s.includes('needs') ||
    s.includes('warning') ||
    s.includes('in transit') ||
    s.includes('requested')
  ) {
    return 'amber';
  }
  if (
    s.includes('rejected') ||
    s.includes('out of stock') ||
    s.includes('failed') ||
    s.includes('error') ||
    s.includes('missing') ||
    s.includes('cancelled')
  ) {
    return 'red';
  }
  if (
    s.includes('received') ||
    s.includes('confirmed') ||
    s.includes('outdated') ||
    s.includes('update needed') ||
    s.includes('kept')
  ) {
    return 'blue';
  }
  return 'neutral';
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  green: 'bg-[#E9F0E9] text-[#344D3D] border-[#C9DBC9]',
  amber: 'bg-[#FAF3E6] text-[#8E6932] border-[#E8D5B5]',
  red: 'bg-[#FBF0EF] text-[#9F514B] border-[#EBCAC7]',
  blue: 'bg-[#EEF3F6] text-[#4C6878] border-[#CDDCE4]',
  neutral: 'bg-[#F0F2ED] text-[#5C6660] border-[#E6EAE4]',
};

export const StatusBadge: React.FC<{
  label: string;
  tone?: BadgeTone;
  showIcon?: boolean;
  className?: string;
}> = ({ label, tone, showIcon = true, className = '' }) => {
  const resolved = tone ?? toneForStatus(label);

  const Icon =
    resolved === 'green'
      ? CheckCircle2
      : resolved === 'amber'
      ? Clock
      : resolved === 'red'
      ? XCircle
      : resolved === 'blue'
      ? Info
      : Sparkles;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium leading-4 whitespace-nowrap ${TONE_CLASSES[resolved]} ${className}`}
    >
      {showIcon && <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />}
      <span>{label}</span>
    </span>
  );
};

