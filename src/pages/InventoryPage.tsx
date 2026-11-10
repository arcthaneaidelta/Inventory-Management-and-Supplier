import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Package,
  Plus,
  Search,
  Truck,
} from 'lucide-react';
import { useSupplyFlow } from '../context/SupplyFlowContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { daysSince, getVariantStatus } from '../services/mockInventory';

export const InventoryPage: React.FC = () => {
  const {
    products,
    suppliers,
    metrics,
    stockAlerts,
    replenishments,
    settings,
    updateVariantStock,
    resolveStockAlert,
    dismissStockAlert,
    createReplenishment,
    updateReplenishmentStatus,
    updateSettings,
    pushToast,
  } = useSupplyFlow();

  const [activeSection, setActiveSection] = useState<'matrix' | 'alerts' | 'replenishment' | 'freshness'>('matrix');
  const [matrixProductId, setMatrixProductId] = useState(products[0]?.id);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Replenishment Modal
  const [repModalOpen, setRepModalOpen] = useState(false);
  const [repForm, setRepForm] = useState({
    productId: products[0]?.id ?? '',
    variantId: products[0]?.variants[0]?.id ?? '',
    requestedQty: 20,
    expectedDate: '2026-11-22',
  });

  const matrixProduct = products.find((p) => p.id === matrixProductId) ?? products[0];

  // Build Color x Size matrix for selected product
  const matrixData = useMemo(() => {
    const colors = Array.from(new Set(matrixProduct.variants.map((v) => v.color)));
    const sizes = Array.from(new Set(matrixProduct.variants.map((v) => v.size)));
    return { colors, sizes };
  }, [matrixProduct]);

  const allVariantRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = [];
    for (const p of products) {
      for (const v of p.variants) {
        const st = getVariantStatus(v, settings.lowStockThreshold);
        if (statusFilter !== 'All' && st !== statusFilter) continue;
        if (
          q &&
          !p.name.toLowerCase().includes(q) &&
          !p.sku.toLowerCase().includes(q) &&
          !v.color.toLowerCase().includes(q)
        ) {
          continue;
        }
        rows.push({ product: p, variant: v, status: st });
      }
    }
    return rows;
  }, [products, search, statusFilter, settings.lowStockThreshold]);

  const pendingReplenishmentsCount = replenishments.filter(
    (r) => r.status !== 'Received' && r.status !== 'Cancelled'
  ).length;

  const openReplenishmentModal = (prefill?: { productId: string; variantId?: string }) => {
    const prod = products.find((p) => p.id === prefill?.productId) ?? products[0];
    setRepForm({
      productId: prod.id,
      variantId: prefill?.variantId ?? prod.variants[0]?.id ?? '',
      requestedQty: 20,
      expectedDate: '2026-11-22',
    });
    setRepModalOpen(true);
  };

  const handleCreateReplenishment = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === repForm.productId);
    if (!prod) return;
    const variant = prod.variants.find((v) => v.id === repForm.variantId) ?? prod.variants[0];
    const sup = suppliers.find((s) => s.id === prod.supplierId);
    createReplenishment({
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      supplierId: prod.supplierId,
      supplierName: sup?.name ?? 'Supplier',
      variantId: variant.id,
      variantLabel: `${variant.color} / ${variant.size}`,
      currentStock: variant.availableStock,
      requestedQty: Number(repForm.requestedQty) || 10,
      expectedDate: repForm.expectedDate,
    });
    setRepModalOpen(false);
    pushToast({
      title: 'Replenishment request created',
      description: `Requested ${repForm.requestedQty} units for ${prod.sku} (${variant.color}/${variant.size}).`,
      variant: 'success',
    });
  };

  const repModalProduct = products.find((p) => p.id === repForm.productId) ?? products[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#26352F]">Inventory Management</h1>
          <p className="mt-1 text-sm text-[#78837C]">
            Variant-level Color × Size stock control, reorder alerts, replenishment requests, and freshness checks.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openReplenishmentModal()}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#344D3D] px-4 py-2 text-xs font-medium text-white hover:bg-[#293E31]"
        >
          <Plus className="h-3.5 w-3.5" />
          New Replenishment Request
        </button>
      </div>

      {/* Inventory KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Units', val: metrics.totalUnits.toLocaleString(), tone: 'text-[#26352F]' },
          { label: 'In-Stock Products', val: metrics.inStockProducts, tone: 'text-[#344D3D]' },
          { label: 'Low-Stock Variants', val: metrics.lowStockVariants, tone: 'text-[#8E6932]' },
          { label: 'Out-of-Stock Variants', val: metrics.outOfStockVariants, tone: 'text-[#9F514B]' },
          { label: 'Pending Replenishments', val: pendingReplenishmentsCount, tone: 'text-[#4C6878]' },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-[#E6EAE4] bg-white p-4 shadow-sf-xs">
            <p className="text-[11px] font-medium text-[#78837C]">{k.label}</p>
            <p className={`mt-1.5 font-display text-2xl font-semibold tabular-nums ${k.tone}`}>{k.val}</p>
          </div>
        ))}
      </div>

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-[#E6EAE4] bg-white p-1 shadow-sf-xs">
        {[
          { id: 'matrix', label: 'Variant Matrix & Stock Table' },
          { id: 'alerts', label: `Stock Alerts (${stockAlerts.filter((a) => !a.resolved).length})` },
          { id: 'replenishment', label: `Replenishments (${replenishments.length})` },
          { id: 'freshness', label: 'Information Freshness' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveSection(t.id as any)}
            className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors ${
              activeSection === t.id
                ? 'bg-[#E9F0E9] text-[#344D3D]'
                : 'text-[#78837C] hover:bg-[#F7F8F5]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeSection === 'matrix' && (
        <div className="space-y-6">
          {/* Interactive Color x Size Matrix */}
          <section className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-semibold text-[#26352F]">
                  Interactive Variant Stock Matrix — {matrixProduct.name} ({matrixProduct.sku})
                </h2>
                <p className="text-xs text-[#78837C]">
                  Edit any cell directly to update available stock, alerts, and dashboard KPIs in real time.
                </p>
              </div>
              <select
                value={matrixProduct.id}
                onChange={(e) => setMatrixProductId(e.target.value)}
                className="rounded-lg border border-[#E6EAE4] bg-[#F7F8F5] px-3 py-1.5 text-xs font-medium text-[#26352F]"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#E6EAE4] rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-[#F7F8F5] border-b border-[#E6EAE4] text-[11px] font-semibold text-[#78837C]">
                    <th className="py-2.5 px-4">Color</th>
                    {matrixData.sizes.map((size) => (
                      <th key={size} className="py-2.5 px-3 text-center">
                        {size}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6EAE4]">
                  {matrixData.colors.map((color) => (
                    <tr key={color}>
                      <td className="py-3 px-4 font-semibold text-[#26352F] bg-[#F7F8F5]/50">
                        {color}
                      </td>
                      {matrixData.sizes.map((size) => {
                        const variant = matrixProduct.variants.find(
                          (v) => v.color === color && v.size === size
                        );
                        if (!variant) {
                          return (
                            <td key={size} className="py-3 px-3 text-center text-[#9AA39C]">
                              —
                            </td>
                          );
                        }
                        const st = getVariantStatus(variant, settings.lowStockThreshold);
                        const cellColor =
                          st === 'Out of Stock'
                            ? 'border-[#EBCAC7] bg-[#FBF0EF] text-[#9F514B]'
                            : st === 'Low Stock'
                            ? 'border-[#E8D5B5] bg-[#FAF3E6] text-[#8E6932]'
                            : 'border-[#E6EAE4] bg-white text-[#26352F]';

                        return (
                          <td key={size} className="py-2.5 px-3 text-center">
                            <input
                              type="number"
                              min={0}
                              aria-label={`${color} ${size} stock`}
                              value={variant.availableStock}
                              onChange={(e) =>
                                updateVariantStock(
                                  matrixProduct.id,
                                  variant.id,
                                  Number(e.target.value)
                                )
                              }
                              className={`w-20 rounded-lg border px-2 py-1.5 text-center font-semibold tabular-nums focus:border-[#526D5B] focus:outline-none ${cellColor}`}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* All Variants Inventory Table */}
          <section className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="font-display text-base font-semibold text-[#26352F]">
                All Variant Stock Levels ({allVariantRows.length})
              </h2>
              <div className="flex flex-wrap gap-2 text-xs">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9AA39C]" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filter SKU, product, color..."
                    className="rounded-lg border border-[#E6EAE4] bg-[#F7F8F5] pl-8 pr-3 py-1.5"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-[#E6EAE4] bg-[#F7F8F5] px-2.5 py-1.5"
                >
                  <option value="All">All Stock States</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E6EAE4] text-[11px] font-semibold text-[#78837C]">
                    <th className="pb-2.5 pr-3">Product</th>
                    <th className="pb-2.5 px-3">SKU</th>
                    <th className="pb-2.5 px-3">Color</th>
                    <th className="pb-2.5 px-3">Size</th>
                    <th className="pb-2.5 px-3">Available</th>
                    <th className="pb-2.5 px-3 text-right">Reserved</th>
                    <th className="pb-2.5 px-3 text-right">Threshold</th>
                    <th className="pb-2.5 px-3">Status</th>
                    <th className="pb-2.5 pl-3 text-right">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6EAE4]">
                  {allVariantRows.slice(0, 30).map(({ product, variant, status }) => (
                    <tr
                      key={variant.id}
                      onClick={() => setMatrixProductId(product.id)}
                      className="cursor-pointer hover:bg-[#F7F8F5]"
                    >
                      <td className="py-2.5 pr-3 font-medium text-[#26352F]">{product.name}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#78837C]">{product.sku}</td>
                      <td className="py-2.5 px-3 text-[#26352F]">{variant.color}</td>
                      <td className="py-2.5 px-3 text-[#26352F]">{variant.size}</td>
                      <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="number"
                          min={0}
                          value={variant.availableStock}
                          onChange={(e) =>
                            updateVariantStock(product.id, variant.id, Number(e.target.value))
                          }
                          className="w-16 rounded border border-[#E6EAE4] px-2 py-1 tabular-nums text-xs focus:border-[#526D5B] focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-[#78837C]">
                        {variant.reservedStock}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-[#78837C]">
                        {settings.lowStockThreshold}
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusBadge label={status} />
                      </td>
                      <td className="py-2.5 pl-3 text-right tabular-nums text-[#78837C]">
                        {variant.lastUpdated}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {activeSection === 'alerts' && (
        <section className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-4">
          <h2 className="font-display text-base font-semibold text-[#26352F]">Stock & Freshness Alerts</h2>
          <div className="space-y-3">
            {stockAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl border p-4 text-xs ${
                  alert.resolved ? 'border-[#E6EAE4] bg-[#F7F8F5] opacity-65' : 'border-[#E6EAE4] bg-[#F7F8F5]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge label={alert.resolved ? 'Resolved' : alert.type} />
                    <span className="font-semibold text-[#26352F]">
                      {alert.productName} ({alert.sku})
                    </span>
                    {alert.variantLabel && (
                      <span className="text-[#78837C]">• {alert.variantLabel}</span>
                    )}
                  </div>
                  <p className="text-[#78837C]">{alert.message}</p>
                  <p className="text-[10px] text-[#9AA39C]">{alert.createdAt}</p>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  <Link
                    to={`/app/catalog/${alert.productId}`}
                    className="rounded-lg border border-[#E6EAE4] bg-white px-3 py-1.5 font-medium text-[#26352F]"
                  >
                    Open Product
                  </Link>
                  {!alert.resolved && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          openReplenishmentModal({
                            productId: alert.productId,
                            variantId: alert.variantId,
                          })
                        }
                        className="rounded-lg bg-[#344D3D] px-3 py-1.5 font-medium text-white"
                      >
                        Create Replenishment
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          resolveStockAlert(alert.id);
                          pushToast({ title: 'Alert marked as resolved', variant: 'success' });
                        }}
                        className="rounded-lg border border-[#C9DBC9] bg-[#E9F0E9] px-3 py-1.5 font-medium text-[#344D3D]"
                      >
                        Mark Resolved
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => dismissStockAlert(alert.id)}
                    className="rounded-lg px-2.5 py-1.5 text-[#78837C] hover:text-[#26352F]"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeSection === 'replenishment' && (
        <section className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-[#26352F]">
              Replenishment Requests
            </h2>
            <button
              type="button"
              onClick={() => openReplenishmentModal()}
              className="rounded-lg bg-[#344D3D] px-3.5 py-1.5 text-xs font-medium text-white"
            >
              + Request Stock
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E6EAE4] text-[11px] text-[#78837C]">
                  <th className="pb-2.5">Product</th>
                  <th className="pb-2.5">Supplier</th>
                  <th className="pb-2.5">Variant</th>
                  <th className="pb-2.5 text-right">Current</th>
                  <th className="pb-2.5 text-right">Requested</th>
                  <th className="pb-2.5">Expected</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6EAE4]">
                {replenishments.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 font-medium text-[#26352F]">
                      {r.productName} <span className="font-mono text-[#78837C]">({r.sku})</span>
                    </td>
                    <td className="py-3 text-[#78837C]">{r.supplierName}</td>
                    <td className="py-3 text-[#26352F]">{r.variantLabel}</td>
                    <td className="py-3 text-right tabular-nums">{r.currentStock}</td>
                    <td className="py-3 text-right tabular-nums font-semibold text-[#344D3D]">+{r.requestedQty}</td>
                    <td className="py-3 tabular-nums text-[#78837C]">{r.expectedDate}</td>
                    <td className="py-3">
                      <StatusBadge label={r.status} />
                    </td>
                    <td className="py-3 text-right space-x-2">
                      {r.status !== 'Received' && r.status !== 'Cancelled' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              updateReplenishmentStatus(r.id, 'Received');
                              pushToast({
                                title: `Marked ${r.sku} replenishment received`,
                                description: `Added +${r.requestedQty} units to ${r.variantLabel}.`,
                                variant: 'success',
                              });
                            }}
                            className="font-medium text-[#344D3D] hover:underline"
                          >
                            Mark Received
                          </button>
                          <button
                            type="button"
                            onClick={() => updateReplenishmentStatus(r.id, 'Cancelled')}
                            className="text-[#9F514B] hover:underline"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeSection === 'freshness' && (
        <section className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6EAE4] pb-4">
            <div>
              <h2 className="font-display text-base font-semibold text-[#26352F]">
                Outdated Information Detection
              </h2>
              <p className="text-xs text-[#78837C]">
                Monitor how recently supplier costs, variant stock, and photography were verified.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              <label className="flex items-center gap-1.5">
                <span className="text-[#78837C]">Price threshold (days):</span>
                <input
                  type="number"
                  min={1}
                  value={settings.priceFreshnessDays}
                  onChange={(e) => updateSettings({ priceFreshnessDays: Number(e.target.value) })}
                  className="w-14 rounded border border-[#E6EAE4] px-2 py-1 tabular-nums"
                />
              </label>
              <label className="flex items-center gap-1.5">
                <span className="text-[#78837C]">Stock threshold (days):</span>
                <input
                  type="number"
                  min={1}
                  value={settings.stockFreshnessDays}
                  onChange={(e) => updateSettings({ stockFreshnessDays: Number(e.target.value) })}
                  className="w-14 rounded border border-[#E6EAE4] px-2 py-1 tabular-nums"
                />
              </label>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E6EAE4] text-[11px] text-[#78837C]">
                  <th className="pb-2.5">Product</th>
                  <th className="pb-2.5">Supplier Price Age</th>
                  <th className="pb-2.5">Stock Count Age</th>
                  <th className="pb-2.5">Images Reviewed</th>
                  <th className="pb-2.5 text-right">Freshness Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6EAE4]">
                {products.slice(0, 12).map((p) => {
                  const pAge = daysSince(p.pricing.priceLastUpdated);
                  const sAge = daysSince(p.lastUpdated);
                  const iAge = daysSince(p.imagesLastReviewed);
                  const stale =
                    pAge > settings.priceFreshnessDays ||
                    sAge > settings.stockFreshnessDays ||
                    iAge > settings.imageFreshnessDays;

                  return (
                    <tr key={p.id}>
                      <td className="py-2.5 font-medium text-[#26352F]">
                        {p.name} <span className="font-mono text-[#78837C]">({p.sku})</span>
                      </td>
                      <td className="py-2.5 tabular-nums text-[#78837C]">{pAge} days ago</td>
                      <td className="py-2.5 tabular-nums text-[#78837C]">{sAge} days ago</td>
                      <td className="py-2.5 tabular-nums text-[#78837C]">{iAge} days ago</td>
                      <td className="py-2.5 text-right">
                        <StatusBadge label={stale ? 'Update Needed' : 'Fresh'} tone={stale ? 'amber' : 'green'} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* New Replenishment Modal */}
      <Modal
        open={repModalOpen}
        onClose={() => setRepModalOpen(false)}
        title="Create Replenishment Request"
      >
        <form onSubmit={handleCreateReplenishment} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-[#26352F] mb-1">Product</label>
            <select
              value={repForm.productId}
              onChange={(e) => {
                const nextP = products.find((p) => p.id === e.target.value) ?? products[0];
                setRepForm((f) => ({
                  ...f,
                  productId: nextP.id,
                  variantId: nextP.variants[0]?.id ?? '',
                }));
              }}
              className="w-full rounded-lg border border-[#E6EAE4] bg-white px-3 py-2"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium text-[#26352F] mb-1">Variant</label>
            <select
              value={repForm.variantId}
              onChange={(e) => setRepForm((f) => ({ ...f, variantId: e.target.value }))}
              className="w-full rounded-lg border border-[#E6EAE4] bg-white px-3 py-2"
            >
              {repModalProduct.variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.color} / {v.size} (Current: {v.availableStock})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#26352F] mb-1">Requested Quantity</label>
              <input
                type="number"
                min={1}
                value={repForm.requestedQty}
                onChange={(e) => setRepForm((f) => ({ ...f, requestedQty: Number(e.target.value) }))}
                className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 tabular-nums"
              />
            </div>
            <div>
              <label className="block font-medium text-[#26352F] mb-1">Expected Arrival</label>
              <input
                type="date"
                value={repForm.expectedDate}
                onChange={(e) => setRepForm((f) => ({ ...f, expectedDate: e.target.value }))}
                className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setRepModalOpen(false)}
              className="rounded-lg border border-[#E6EAE4] px-3.5 py-2 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#344D3D] px-4 py-2 font-medium text-white"
            >
              Submit Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

