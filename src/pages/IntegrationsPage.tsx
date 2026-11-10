import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Eye,
  Info,
  Layers,
  Store,
} from 'lucide-react';
import { useSupplyFlow } from '../context/SupplyFlowContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { ProductImage } from '../components/common/ProductImage';
import { formatCurrency } from '../services/mockPricing';
import { getProductTotalStock } from '../services/mockInventory';
import { Product } from '../types';

const SYNC_FIELDS = [
  'Product titles',
  'English & Spanish descriptions',
  'Prepared studio product images',
  'Color & size variants',
  'Margin-calculated selling prices',
  'Live inventory quantities',
  'SKU identifiers & supplier metadata',
];

const ROADMAP = [
  {
    phase: 'Phase 1',
    title: 'Centralized supplier intake',
    status: 'Demonstrated',
    desc: 'Capture supplier messaging packets, CSV/Excel sheets, and portal uploads in one place.',
  },
  {
    phase: 'Phase 2',
    title: 'AI product processing',
    status: 'Demonstrated',
    desc: 'Extract attributes, standardize studio product visuals, and produce EN/ES catalog descriptions.',
  },
  {
    phase: 'Phase 3',
    title: 'Pricing & inventory automation',
    status: 'Demonstrated',
    desc: 'Compute landed costs, monitor wholesale price shifts, and track variant-level stock.',
  },
  {
    phase: 'Phase 4',
    title: 'Shopify integration',
    status: 'Planned',
    desc: 'Push owner-approved records cleanly into Shopify Admin API once connected in production.',
  },
];

export const IntegrationsPage: React.FC = () => {
  const { products, suppliers, settings } = useSupplyFlow();
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  const syncSummary = useMemo(() => {
    const approved = products.filter(
      (p) => p.approvalStatus === 'Approved' || p.approvalStatus === 'Shopify Ready'
    );
    const readyForSync = products.filter((p) => p.approvalStatus === 'Shopify Ready');
    const missingInfo = products.filter(
      (p) => !p.descriptionEn.trim() || !p.descriptionEs.trim() || p.images.length === 0
    );
    const conflicts = products.filter(
      (p) => p.approvalStatus === 'Needs Changes' || getProductTotalStock(p) === 0
    );

    return {
      approvedCount: approved.length,
      readyCount: readyForSync.length,
      missingCount: missingInfo.length,
      conflictsCount: conflicts.length,
      syncCandidates: approved.length ? approved : products.slice(0, 6),
    };
  }, [products]);

  const checkReadiness = (p: Product) => {
    const hasTitle = Boolean(p.name.trim());
    const hasImages = p.images.length > 0;
    const hasEn = Boolean(p.descriptionEn.trim());
    const hasEs = Boolean(p.descriptionEs.trim());
    const hasVariants = p.variants.length > 0;
    const isApproved = p.approvalStatus === 'Approved' || p.approvalStatus === 'Shopify Ready';
    const hasStock = getProductTotalStock(p) > 0;

    return {
      hasTitle,
      hasImages,
      hasEn,
      hasEs,
      hasVariants,
      isApproved,
      hasStock,
      allGood: hasTitle && hasImages && hasEn && hasEs && hasVariants && isApproved,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-[#26352F]">
          Integrations & Shopify Readiness
        </h1>
        <p className="mt-1 text-sm text-[#78837C]">
          Planned storefront synchronization architecture—preview how approved products prepare for Shopify without triggering live pushes.
        </p>
      </div>

      {/* Shopify Integration Card */}
      <section className="rounded-2xl border border-[#E6EAE4] bg-white p-6 shadow-sf-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E9F0E9] text-[#344D3D]">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="font-display text-lg font-semibold text-[#26352F]">
                    Shopify Storefront Connector
                  </h2>
                  <StatusBadge label="Ready to Connect" tone="blue" />
                </div>
                <p className="text-xs text-[#78837C]">
                  Planned Phase 4 integration • Zero live store connection active in this demo
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs">
              {SYNC_FIELDS.map((field) => (
                <div key={field} className="flex items-center gap-2 text-[#26352F]">
                  <Check className="h-3.5 w-3.5 text-[#526D5B] shrink-0" />
                  <span>{field}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#CDDCE4] bg-[#EEF3F6] p-4 max-w-sm text-xs space-y-2 text-[#4C6878]">
            <div className="flex items-center gap-1.5 font-semibold">
              <Info className="h-4 w-4" />
              <span>Demo Preview Mode</span>
            </div>
            <p className="leading-relaxed">
              Approving any product in Approval Center moves it straight into the Shopify-ready list below. Click “Preview Shopify Sync” to inspect the payload.
            </p>
          </div>
        </div>
      </section>

      {/* Synchronization Overview Counts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#E6EAE4] bg-white p-4 shadow-sf-xs">
          <p className="text-xs text-[#78837C]">Approved Products</p>
          <p className="mt-1.5 font-display text-2xl font-semibold text-[#26352F] tabular-nums">
            {syncSummary.approvedCount}
          </p>
        </div>
        <div className="rounded-xl border border-[#E6EAE4] bg-white p-4 shadow-sf-xs">
          <p className="text-xs text-[#78837C]">Ready for Sync</p>
          <p className="mt-1.5 font-display text-2xl font-semibold text-[#344D3D] tabular-nums">
            {syncSummary.readyCount}
          </p>
        </div>
        <div className="rounded-xl border border-[#E6EAE4] bg-white p-4 shadow-sf-xs">
          <p className="text-xs text-[#78837C]">Missing Information</p>
          <p className="mt-1.5 font-display text-2xl font-semibold text-[#8E6932] tabular-nums">
            {syncSummary.missingCount}
          </p>
        </div>
        <div className="rounded-xl border border-[#E6EAE4] bg-white p-4 shadow-sf-xs">
          <p className="text-xs text-[#78837C]">Potential Conflicts</p>
          <p className="mt-1.5 font-display text-2xl font-semibold text-[#9F514B] tabular-nums">
            {syncSummary.conflictsCount}
          </p>
        </div>
      </div>

      {/* Product Synchronization Preview Table */}
      <section className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-semibold text-[#26352F]">
              Product Synchronization Preview
            </h2>
            <p className="text-xs text-[#78837C]">
              Inspect field readiness for approved catalog products before Shopify synchronization.
            </p>
          </div>
          <Link to="/app/approvals" className="text-xs font-medium text-[#344D3D] hover:underline">
            Approve more products →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E6EAE4] text-[11px] text-[#78837C]">
                <th className="pb-2.5 pr-3">Product</th>
                <th className="pb-2.5 px-3">SKU</th>
                <th className="pb-2.5 px-3">Supplier</th>
                <th className="pb-2.5 px-3 text-right">Retail Price</th>
                <th className="pb-2.5 px-3 text-right">Variants</th>
                <th className="pb-2.5 px-3">Status</th>
                <th className="pb-2.5 pl-3 text-right">Sync Simulation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6EAE4]">
              {syncSummary.syncCandidates.map((p) => {
                const sup = suppliers.find((s) => s.id === p.supplierId);
                const img = p.images.find((i) => i.isPrimary) ?? p.images[0];
                return (
                  <tr key={p.id} className="hover:bg-[#F7F8F5]">
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-3">
                        <ProductImage
                          src={img?.url}
                          alt={p.name}
                          className="h-9 w-9 rounded-lg border border-[#E6EAE4] shrink-0"
                        />
                        <span className="font-semibold text-[#26352F]">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-[#78837C]">{p.sku}</td>
                    <td className="py-3 px-3 text-[#78837C]">{sup?.name}</td>
                    <td className="py-3 px-3 text-right tabular-nums font-medium">
                      {formatCurrency(p.pricing.sellingPrice, settings.baseCurrency)}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums">{p.variants.length}</td>
                    <td className="py-3 px-3">
                      <StatusBadge label={p.approvalStatus} />
                    </td>
                    <td className="py-3 pl-3 text-right">
                      <button
                        type="button"
                        onClick={() => setPreviewProduct(p)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#344D3D] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[#293E31]"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Preview Shopify Sync
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4-Phase Integration Roadmap */}
      <section className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-4">
        <h2 className="font-display text-base font-semibold text-[#26352F]">
          Implementation & Integration Roadmap
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ROADMAP.map((r) => (
            <div key={r.phase} className="rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#526D5B]">{r.phase}</span>
                <StatusBadge
                  label={r.status}
                  tone={r.status === 'Planned' ? 'blue' : 'green'}
                />
              </div>
              <p className="font-semibold text-[#26352F] text-sm">{r.title}</p>
              <p className="text-[11px] leading-relaxed text-[#78837C]">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Preview Shopify Sync Modal */}
      <Modal
        open={previewProduct !== null}
        onClose={() => setPreviewProduct(null)}
        title={previewProduct ? `Shopify Sync Preview: ${previewProduct.name}` : 'Sync Preview'}
        subtitle="Simulated storefront payload inspection — no live push executed"
        maxWidthClass="max-w-xl"
      >
        {previewProduct && (() => {
          const r = checkReadiness(previewProduct);
          return (
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3 rounded-xl border border-[#C9DBC9] bg-[#E9F0E9]/70 p-3.5 text-[#344D3D]">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold">
                    {r.allGood
                      ? 'Product is ready for Shopify synchronization.'
                      : 'Review pending checks before future Shopify sync.'}
                  </p>
                  <p className="text-[11px] text-[#526D5B]">
                    SKU {previewProduct.sku} • Selling Price{' '}
                    {formatCurrency(previewProduct.pricing.sellingPrice, settings.baseCurrency)}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-[#E6EAE4] rounded-xl border border-[#E6EAE4] px-4">
                {[
                  { label: 'Title', state: r.hasTitle ? 'Ready' : 'Missing' },
                  { label: 'Images', state: `${previewProduct.images.length} selected` },
                  { label: 'Description', state: r.hasEn ? 'English ready' : 'Missing' },
                  { label: 'Translation', state: r.hasEs ? 'Spanish ready' : 'Missing' },
                  { label: 'Variants', state: `${previewProduct.variants.length} configured` },
                  { label: 'Pricing', state: r.isApproved ? 'Approved' : 'Pending review' },
                  { label: 'Inventory', state: `${getProductTotalStock(previewProduct)} units ready` },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-2.5">
                    <span className="font-medium text-[#26352F]">{row.label}</span>
                    <span className="inline-flex items-center gap-1.5 text-[#344D3D] font-medium">
                      <Check className="h-3.5 w-3.5 text-[#526D5B]" />
                      {row.state}
                    </span>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] p-3 font-mono text-[10px] text-[#5C6660] overflow-x-auto">
                {JSON.stringify(
                  {
                    sku: previewProduct.sku,
                    title: previewProduct.name,
                    price: previewProduct.pricing.sellingPrice,
                    currency: settings.baseCurrency,
                    variantsCount: previewProduct.variants.length,
                    totalInventory: getProductTotalStock(previewProduct),
                    locales: ['en', 'es'],
                    demoNote: 'Simulated Shopify payload only',
                  },
                  null,
                  2
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setPreviewProduct(null)}
                  className="rounded-lg bg-[#344D3D] px-4 py-2 font-medium text-white"
                >
                  Close Preview
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

