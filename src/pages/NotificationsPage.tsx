import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, ExternalLink, Trash2 } from 'lucide-react';
import { useSupplyFlow } from '../context/SupplyFlowContext';
import { StatusBadge } from '../components/common/StatusBadge';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications,
    metrics,
    markNotificationRead,
    markAllNotificationsRead,
    dismissNotification,
  } = useSupplyFlow();

  const [filter, setFilter] = useState<'all' | 'unread' | 'intake' | 'pricing' | 'inventory' | 'approval'>('all');

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === 'all') return true;
      if (filter === 'unread') return !n.read;
      return n.category === filter;
    });
  }, [notifications, filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#26352F]">Notifications Center</h1>
          <p className="mt-1 text-sm text-[#78837C]">
            Operational alerts across supplier intake, price changes, low stock, and approval readiness ({metrics.unreadNotificationsCount} unread).
          </p>
        </div>
        <button
          type="button"
          onClick={markAllNotificationsRead}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6EAE4] bg-white px-4 py-2 text-xs font-medium text-[#26352F] hover:bg-[#F0F2ED]"
        >
          <CheckCheck className="h-4 w-4 text-[#526D5B]" />
          Mark all as read
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 rounded-xl border border-[#E6EAE4] bg-white p-1.5 shadow-sf-xs">
        {(
          [
            ['all', 'All'],
            ['unread', `Unread (${metrics.unreadNotificationsCount})`],
            ['intake', 'Intake'],
            ['pricing', 'Pricing'],
            ['inventory', 'Inventory'],
            ['approval', 'Approvals'],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setFilter(k)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === k
                ? 'bg-[#344D3D] text-white'
                : 'text-[#78837C] hover:bg-[#F7F8F5]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-[#E6EAE4] bg-white shadow-sf-xs divide-y divide-[#E6EAE4] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#78837C]">
            No notifications in this category.
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 transition-colors ${
                n.read ? 'bg-white' : 'bg-[#F7F8F5]'
              }`}
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  {!n.read && <span className="h-2 w-2 rounded-full bg-[#526D5B]" />}
                  <p className="text-xs font-semibold text-[#26352F]">{n.title}</p>
                  <StatusBadge label={n.category} showIcon={false} />
                  <span className="text-[10px] text-[#9AA39C]">{n.timestamp}</span>
                </div>
                <p className="text-xs text-[#78837C]">{n.message}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0 text-xs">
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => markNotificationRead(n.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#E6EAE4] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#26352F]"
                  >
                    <Check className="h-3 w-3" />
                    Mark read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    markNotificationRead(n.id);
                    navigate(n.targetRoute);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#344D3D] px-3 py-1.5 text-[11px] font-medium text-white"
                >
                  Open record
                  <ExternalLink className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => dismissNotification(n.id)}
                  className="rounded-lg p-1.5 text-[#9AA39C] hover:bg-[#FBF0EF] hover:text-[#9F514B]"
                  aria-label="Dismiss notification"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

