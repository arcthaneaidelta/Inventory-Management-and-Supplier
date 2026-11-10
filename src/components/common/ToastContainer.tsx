import React from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { useSupplyFlow } from '../../context/SupplyFlowContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useSupplyFlow();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const variant = toast.variant ?? 'info';
        const Icon =
          variant === 'success'
            ? CheckCircle2
            : variant === 'warning'
            ? AlertTriangle
            : variant === 'error'
            ? XCircle
            : Info;
        const iconColor =
          variant === 'success'
            ? 'text-[#526D5B]'
            : variant === 'warning'
            ? 'text-[#B58A4B]'
            : variant === 'error'
            ? 'text-[#C47770]'
            : 'text-[#7895A5]';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 rounded-xl border border-[#E6EAE4] bg-white px-4 py-3 shadow-sf-md"
          >
            <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#26352F]">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-xs text-[#78837C] leading-relaxed">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="rounded-md p-1 text-[#9AA39C] hover:bg-[#F0F2ED] hover:text-[#26352F]"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

