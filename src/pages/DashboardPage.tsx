import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Inbox,
  Package,
  Plus,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useSupplyFlow } from '../context/SupplyFlowContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { ApprovalStatus, AutomationLog } from '../types';
import { getProductStockStatus } from '../services/mockInventory';

const SPARK_PRODUCTS = [
  { d: '1', v: 14 }, { d: '2', v: 16 }, { d: '3', v: 18 }, { d: '4', v: 20 }, { d: '5', v: 22 }, { d: '6', v: 24 },
];
const SPARK_SUPPLIERS = [
  { d: '1', v: 5 }, { d: '2', v: 5 }, { d: '3', v: 6 }, { d: '4', v: 7 }, { d: '5', v: 8 }, { d: '6', v: 8 },
];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    metrics,
    products,
    suppliers,
    automationLogs,
    replenishments,
    priceAlerts,
    settings,
  } = useSupplyFlow();

  const [selectedLog, setSelectedLog] = useState<AutomationLog | null>(null);

  const pipelineStages: { label: string; statuses: ApprovalStatus[]; filterParam: string; tone: string }[] = [
    { label: 'Received', statuses: ['Received'], filterParam: 'Received', tone: 'bg-[#EEF3F6] text-[#4C6878]' },
    { label: 'Processing', statuses: ['Processing'], filterParam: 'Processing', tone: 'bg-[#FAF3E6] text-[#8E6932]' },
    {
      label: 'Ready for Review',
      statuses: ['Awaiting Review', 'Ready for Approval', 'Needs Changes'],
      filterParam: 'Review',
      tone: 'bg-[#FAF3E6] text-[#8E6932]',
    },
    { label: 'Approved', statuses: ['Approved'], filterParam: 'Approved', tone: 'bg-[#E9F0E9] text-[#344D3D]' },
    { label: 'Shopify Ready', statuses: ['Shopify Ready'], filterParam: 'Shopify Ready', tone: 'bg-[#E9F0E9] text-[#344D3D]' },
  ];

  const inventoryChartData = useMemo(() => {
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    for (const p of products) {
      const s = getProductStockStatus(p, settings.lowStockThreshold);
      if (s === 'In Stock') inStock += 1;
      else if (s === 'Low Stock') lowStock += 1;
      else outOfStock += 1;
    }
    const awaitingRep = replenishments.filter(
      (r) => r.status !== 'Received' && r.status !== 'Cancelled'
    ).length;

    return [
      { name: 'In Stock', count: inStock, fill: '#526D5B' },
      { name: 'Low Stock', count: lowStock, fill: '#B58A4B' },
      { name: 'Out of Stock', count: outOfStock, fill: '#C47770' },
      { name: 'Replenishing', count: awaitingRep, fill: '#7895A5' },
    ];
  }, [products, replenishments, settings.lowStockThreshold]);

  const recentFeed = useMemo(() => {
    const items: { id: string; title: string; meta: string; route: string; tone: 'green' | 'amber' | 'blue' }[] = [
      {
        id: 'rf-1',
        title: 'New products received from Milano Fashion',
        meta: 'Classic Linen Shirt (MF-204) & Tailored Linen Overshirt (MF-219)',
        route: '/app/intake',
        tone: 'blue',
      },
      {
        id: 'rf-2',
        title: 'AI descriptions generated for 8 products',
        meta: 'Synchronized English & Spanish storefront copy',
        route: '/app/catalog',
        tone: 'green',
      },
      {
        id: 'rf-3',
        title: `${metrics.approvedCount} products approved by Jack`,
        meta: `${metrics.shopifyReadyCount} ready for Shopify synchronization`,
        route: '/app/approvals',
        tone: 'green',
      },
      {
        id: 'rf-4',
        title: 'Inventory updated for Summer Collection',
        meta: `${metrics.totalUnits.toLocaleString()} live units tracked across variants`,
        route: '/app/inventory',
        tone: 'blue',
      },
      {
        id: 'rf-5',
        title: `Supplier price alerts (${priceAlerts.filter((a) => a.status === 'Pending').length} pending)`,
        meta: 'SKU MF-204 wholesale update €25.00 → €29.00 awaiting review',
        route: '/app/pricing',
        tone: 'amber',
      },
    ];
    return items;
  }, [metrics, priceAlerts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#26352F]">Good morning, Jack</h1>
          <p className="mt-1 text-sm text-[#78837C]">
            Here’s what’s happening across your supplier operations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="rounded-lg border border-[#E6EAE4] bg-white px-3 py-2 text-xs font-medium text-[#78837C]">
            Tuesday, Nov 10, 2026
          </span>
          <Link
            to="/app/intake"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#344D3D] px-4 py-2 text-xs font-medium text-white shadow-sf-xs hover:bg-[#293E31] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Quick Add Product
          </Link>
        </div>
      </div>

      {/* 4 Major KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Products */}
        <button
          type="button"
          onClick={() => navigate('/app/catalog')}
          className="text-left rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs hover:border-[#526D5B]/50 hover:shadow-sf-sm transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#78837C]">Total Products</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E9F0E9] text-[#344D3D]">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-end justify-between gap-2">
            <div>
              <p className="font-display text-3xl font-semibold text-[#26352F] tabular-nums">
                {metrics.totalProducts}
              </p>
              <p className="mt-1 text-[11px] text-[#526D5B] font-medium">
                {metrics.shopifyReadyCount} Shopify Ready
              </p>
            </div>
            <div className="h-10 w-20">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SPARK_PRODUCTS}>
                  <Area type="monotone" dataKey="v" stroke="#526D5B" fill="#E9F0E9" strokeWidth={1.75} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </button>

        {/* Active Suppliers */}
        <button
          type="button"
          onClick={() => navigate('/app/suppliers')}
          className="text-left rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs hover:border-[#526D5B]/50 hover:shadow-sf-sm transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#78837C]">Active Suppliers</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF3F6] text-[#4C6878]">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-end justify-between gap-2">
            <div>
              <p className="font-display text-3xl font-semibold text-[#26352F] tabular-nums">
                {metrics.activeSuppliers}
              </p>
              <p className="mt-1 text-[11px] text-[#78837C]">5 currencies configured</p>
            </div>
            <div className="h-10 w-20">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SPARK_SUPPLIERS}>
                  <Area type="monotone" dataKey="v" stroke="#7895A5" fill="#EEF3F6" strokeWidth={1.75} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </button>

        {/* Pending Approvals */}
        <button
          type="button"
          onClick={() => navigate('/app/approvals')}
          className="text-left rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs hover:border-[#526D5B]/50 hover:shadow-sf-sm transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#78837C]">Pending Approvals</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FAF3E6] text-[#B58A4B]">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-display text-3xl font-semibold text-[#26352F] tabular-nums">
              {metrics.pendingApprovals}
            </p>
            <p className="mt-1 text-[11px] text-[#8E6932] font-medium">
              Awaiting Jack’s sign-off
            </p>
          </div>
        </button>

        {/* Inventory Alerts */}
        <button
          type="button"
          onClick={() => navigate('/app/inventory')}
          className="text-left rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs hover:border-[#526D5B]/50 hover:shadow-sf-sm transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#78837C]">Inventory Alerts</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FBF0EF] text-[#C47770]">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-display text-3xl font-semibold text-[#26352F] tabular-nums">
              {metrics.inventoryAlertsCount}
            </p>
            <p className="mt-1 text-[11px] text-[#9F514B] font-medium">
              {metrics.outOfStockVariants} out-of-stock • {metrics.lowStockVariants} low
            </p>
          </div>
        </button>
      </div>

      {/* Product Processing Pipeline */}
      <section className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h2 className="font-display text-base font-semibold text-[#26352F]">
              Product Processing Pipeline
            </h2>
            <p className="text-xs text-[#78837C]">
              Click any operational stage to open its filtered product catalog
            </p>
          </div>
          <Link
            to="/app/approvals"
            className="inline-flex items-center gap-1 text-xs font-medium text-[#344D3D] hover:underline"
          >
            Review Pending Queue
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {pipelineStages.map((stage) => {
            const count = products.filter((p) => stage.statuses.includes(p.approvalStatus)).length;
            return (
              <button
                key={stage.label}
                type="button"
                onClick={() => navigate(`/app/catalog?stage=${encodeURIComponent(stage.filterParam)}`)}
                className="group rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] p-3.5 text-left hover:border-[#526D5B] hover:bg-white transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${stage.tone}`}>
                    {stage.label}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#9AA39C] group-hover:text-[#344D3D]" />
                </div>
                <p className="mt-3 font-display text-2xl font-semibold text-[#26352F] tabular-nums">
                  {count}
                </p>
                <p className="text-[11px] text-[#78837C]">products in stage</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main 2-Column Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Activity */}
        <section className="lg:col-span-6 rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base font-semibold text-[#26352F]">Recent Activity</h2>
            <span className="text-[11px] text-[#9AA39C]">Live Workspace Feed</span>
          </div>
          <div className="divide-y divide-[#E6EAE4]">
            {recentFeed.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.route)}
                className="w-full flex items-start justify-between gap-3 py-3 text-left hover:bg-[#F7F8F5] -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                      item.tone === 'green'
                        ? 'bg-[#526D5B]'
                        : item.tone === 'amber'
                        ? 'bg-[#B58A4B]'
                        : 'bg-[#7895A5]'
                    }`}
                  />
                  <div>
                    <p className="text-xs font-medium text-[#26352F]">{item.title}</p>
                    <p className="mt-0.5 text-[11px] text-[#78837C]">{item.meta}</p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[#9AA39C] shrink-0 mt-1" />
              </button>
            ))}
          </div>
        </section>

        {/* Inventory Health */}
        <section className="lg:col-span-6 rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-base font-semibold text-[#26352F]">Inventory Health</h2>
              <p className="text-xs text-[#78837C]">
                {metrics.totalUnits.toLocaleString()} total units across {products.length} products
              </p>
            </div>
            <Link to="/app/inventory" className="text-xs font-medium text-[#344D3D] hover:underline">
              Manage Stock →
            </Link>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryChartData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#78837C' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9AA39C' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: '#F0F2ED' }}
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid #E6EAE4',
                    fontSize: 12,
                    background: '#FFFFFF',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={36}>
                  {inventoryChartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Bottom 2-Column Operational Grid: Supplier Performance + Automation Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Supplier Performance */}
        <section className="lg:col-span-7 rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base font-semibold text-[#26352F]">
              Supplier Performance
            </h2>
            <Link to="/app/suppliers" className="text-xs font-medium text-[#344D3D] hover:underline">
              All Suppliers →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E6EAE4] text-[11px] font-medium text-[#78837C]">
                  <th className="pb-2.5 pr-3">Supplier</th>
                  <th className="pb-2.5 px-3 text-right">Submissions</th>
                  <th className="pb-2.5 px-3 text-right">Pending</th>
                  <th className="pb-2.5 px-3">Last Update</th>
                  <th className="pb-2.5 pl-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6EAE4]">
                {suppliers.slice(0, 6).map((sup) => {
                  const supProducts = products.filter((p) => p.supplierId === sup.id);
                  const pending = supProducts.filter(
                    (p) => p.approvalStatus !== 'Approved' && p.approvalStatus !== 'Shopify Ready' && p.approvalStatus !== 'Rejected'
                  ).length;
                  return (
                    <tr
                      key={sup.id}
                      onClick={() => navigate(`/app/suppliers/${sup.id}`)}
                      className="cursor-pointer hover:bg-[#F7F8F5] transition-colors"
                    >
                      <td className="py-2.5 pr-3 font-medium text-[#26352F]">
                        {sup.name}
                        <span className="ml-1.5 text-[11px] font-normal text-[#9AA39C]">
                          {sup.country}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-[#26352F]">
                        {supProducts.length}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-[#78837C]">{pending}</td>
                      <td className="py-2.5 px-3 tabular-nums text-[#78837C]">{sup.lastSubmission}</td>
                      <td className="py-2.5 pl-3 text-right">
                        <StatusBadge label={sup.connectionStatus} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Automation Activity */}
        <section className="lg:col-span-5 rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base font-semibold text-[#26352F]">
              Automation Activity
            </h2>
            <Link to="/app/automations" className="text-xs font-medium text-[#344D3D] hover:underline">
              Workflow Builder →
            </Link>
          </div>
          <div className="space-y-2.5">
            {automationLogs.slice(0, 5).map((log) => (
              <button
                key={log.id}
                type="button"
                onClick={() => setSelectedLog(log)}
                className="w-full rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] px-3.5 py-2.5 text-left hover:border-[#526D5B] hover:bg-white transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#26352F] truncate">
                    {log.workflowName}
                  </span>
                  <StatusBadge label={log.status} />
                </div>
                <p className="mt-1 text-[11px] text-[#78837C] truncate">{log.processedProduct}</p>
                <div className="mt-1 flex items-center justify-between text-[10px] text-[#9AA39C]">
                  <span>{log.executionTime}</span>
                  <span className="tabular-nums">{log.durationMs}ms</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Automation Detail Drawer / Modal */}
      <Modal
        open={selectedLog !== null}
        onClose={() => setSelectedLog(null)}
        title={selectedLog?.workflowName ?? 'Automation Run'}
        subtitle={selectedLog?.trigger}
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] p-3.5">
              <div>
                <p className="text-[11px] text-[#78837C]">Processed Item</p>
                <p className="font-semibold text-[#26352F]">{selectedLog.processedProduct}</p>
              </div>
              <StatusBadge label={selectedLog.status} />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-[#26352F]">Execution Summary</p>
              <p className="leading-relaxed text-[#78837C]">{selectedLog.summary}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-[#E6EAE4] p-3 text-[11px]">
              <div>
                <span className="text-[#9AA39C]">Timestamp</span>
                <p className="font-medium text-[#26352F] tabular-nums">{selectedLog.executionTime}</p>
              </div>
              <div>
                <span className="text-[#9AA39C]">Duration</span>
                <p className="font-medium text-[#26352F] tabular-nums">{selectedLog.durationMs} ms</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              {selectedLog.productId && (
                <button
                  type="button"
                  onClick={() => {
                    const pid = selectedLog.productId;
                    setSelectedLog(null);
                    navigate(`/app/catalog/${pid}`);
                  }}
                  className="rounded-lg border border-[#E6EAE4] px-3.5 py-2 font-medium text-[#26352F] hover:bg-[#F0F2ED]"
                >
                  Open Product Record
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setSelectedLog(null);
                  navigate('/app/automations');
                }}
                className="rounded-lg bg-[#344D3D] px-3.5 py-2 font-medium text-white"
              >
                Open Automation Center
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

