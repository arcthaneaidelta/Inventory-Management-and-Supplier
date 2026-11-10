import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  Edit3,
  MessageSquareWarning,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { useSupplyFlow } from '../context/SupplyFlowContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { ProductImage } from '../components/common/ProductImage';
import { Modal } from '../components/common/Modal';
import { formatCurrency } from '../services/mockPricing';
import { getProductStockStatus, getProductTotalStock } from '../services/mockInventory';
import { Product } from '../types';

const QUEUE_FILTERS = [
  'Pending All',
  'Ready for Approval',
  'Awaiting Review',
  'Needs Changes',
  'Approved',
  'Rejected',
  'All',
] as const;

export const ApprovalsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const {
    products,
    suppliers,
    settings,
    priceAlerts,
    updateProduct,
    approveProduct,
    requestProductChanges,
    rejectProduct,
    pushToast,
  } = useSupplyFlow();

  const initialProductId = searchParams.get('product');
  const [filter, setFilter] = useState<typeof QUEUE_FILTERS[number]>('Pending All');
  const [reviewProductId, setReviewProductId] = useState<string | null>(initialProductId);
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);

  // Action drawers inside review workspace
  const [actionMode, setActionMode] = useState<'none' | 'changes' | 'reject'>('none');
  const [noteInput, setNoteInput] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredQueue = useMemo(() => {
    return products.filter((p) => {
      if (filter === 'All') return true;
      if (filter === 'Pending All') {
        return ['Received', 'Processing', 'Awaiting Review', 'Ready for Approval', 'Needs Changes'].includes(
          p.approvalStatus
        );
      }
      if (filter === 'Approved') {
        return p.approvalStatus === 'Approved' || p.approvalStatus === 'Shopify Ready';
      }
      return p.approvalStatus === filter;
    });
  }, [products, filter]);

  const reviewProduct: Product | undefined = products.find((p) => p.id === reviewProductId);

  const openReview = (p: Product) => {
    setReviewProductId(p.id);
    setSelectedImgIdx(0);
    setActionMode('none');
    setNoteInput('');
    setActionError(null);
  };

  const handleApprove = () => {
    if (!reviewProduct) return;
    approveProduct(reviewProduct.id, 'Shopify Ready');
    pushToast({
      title: `Approved "${reviewProduct.name}"`,
      description: 'Moved out of pending queue and marked Shopify Ready.',
      variant: 'success',
    });
    setReviewProductId(null);
  };

  const handleRequestChanges = () => {
    if (!reviewProduct) return;
    if (!noteInput.trim()) {
      setActionError('Please enter specific correction instructions before requesting changes.');
      return;
    }
    requestProductChanges(reviewProduct.id, noteInput.trim());
    pushToast({
      title: `Requested changes on ${reviewProduct.sku}`,
      description: noteInput.trim(),
      variant: 'warning',
    });
    setReviewProductId(null);
  };

  const handleReject = () => {
    if (!reviewProduct) return;
    if (!noteInput.trim()) {
      setActionError('A rejection reason is required.');
      return;
    }
    rejectProduct(reviewProduct.id, noteInput.trim());
    pushToast({
      title: `Rejected ${reviewProduct.sku}`,
      description: 'Product moved to Rejected archive.',
      variant: 'error',
    });
    setReviewProductId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#26352F]">Approval Center</h1>
          <p className="mt-1 text-sm text-[#78837C]">
            Automation prepares every detail—Jack holds final control to edit, approve, or reject before Shopify readiness.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-[#C9DBC9] bg-[#E9F0E9] px-3 py-1.5 text-xs font-medium text-[#344D3D]">
          <ShieldCheck className="h-4 w-4" />
          <span>Manual Owner Approval Enforced</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-[#E6EAE4] bg-white p-1.5 shadow-sf-xs">
        {QUEUE_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-[#344D3D] text-white'
                : 'text-[#78837C] hover:bg-[#F7F8F5] hover:text-[#26352F]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Approval Queue Table */}
      <div className="rounded-2xl border border-[#E6EAE4] bg-white shadow-sf-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E6EAE4] bg-[#F7F8F5] text-[11px] font-semibold text-[#78837C]">
                <th className="py-3 pl-5 pr-3">Product</th>
                <th className="py-3 px-3">Supplier</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3">Images</th>
                <th className="py-3 px-3">Pricing</th>
                <th className="py-3 px-3">Inventory</th>
                <th className="py-3 px-3">Approval Status</th>
                <th className="py-3 pl-3 pr-5 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6EAE4]">
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#78837C]">
                    No products currently in “{filter}”.
                  </td>
                </tr>
              ) : (
                filteredQueue.map((p) => {
                  const sup = suppliers.find((s) => s.id === p.supplierId);
                  const primaryImg = p.images.find((i) => i.isPrimary) ?? p.images[0];
                  const copyReady = Boolean(p.descriptionEn.trim() && p.descriptionEs.trim());
                  const hasStudioImg = p.images.some((i) => i.category !== 'Original');
                  const hasPendingPriceAlert = priceAlerts.some(
                    (a) => a.productId === p.id && a.status === 'Pending'
                  );
                  const stockSt = getProductStockStatus(p, settings.lowStockThreshold);

                  return (
                    <tr
                      key={p.id}
                      onClick={() => openReview(p)}
                      className="cursor-pointer hover:bg-[#F7F8F5] transition-colors"
                    >
                      <td className="py-3 pl-5 pr-3">
                        <div className="flex items-center gap-3 min-w-[180px]">
                          <ProductImage
                            src={primaryImg?.url}
                            alt={p.name}
                            className="h-10 w-10 rounded-lg border border-[#E6EAE4] shrink-0"
                          />
                          <div>
                            <p className="font-semibold text-[#26352F]">{p.name}</p>
                            <p className="font-mono text-[11px] text-[#78837C]">{p.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[#26352F] whitespace-nowrap">{sup?.name}</td>
                      <td className="py-3 px-3">
                        <StatusBadge label={copyReady ? 'EN + ES Ready' : 'Missing Copy'} tone={copyReady ? 'green' : 'amber'} />
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge
                          label={hasStudioImg ? `${p.images.length} Studio` : 'Original Only'}
                          tone={hasStudioImg ? 'green' : 'amber'}
                        />
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge
                          label={
                            hasPendingPriceAlert
                              ? 'Price Alert'
                              : formatCurrency(p.pricing.sellingPrice, settings.baseCurrency)
                          }
                          tone={hasPendingPriceAlert ? 'amber' : 'green'}
                        />
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge label={`${stockSt} (${getProductTotalStock(p)})`} tone={stockSt === 'In Stock' ? 'green' : 'amber'} />
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge label={p.approvalStatus} />
                      </td>
                      <td className="py-3 pl-3 pr-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => openReview(p)}
                          className="rounded-lg bg-[#344D3D] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[#293E31]"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Product Review Workspace Modal */}
      <Modal
        open={reviewProduct !== undefined}
        onClose={() => setReviewProductId(null)}
        title={reviewProduct ? `Review: ${reviewProduct.name} (${reviewProduct.sku})` : 'Product Review'}
        subtitle={
          reviewProduct
            ? `${suppliers.find((s) => s.id === reviewProduct.supplierId)?.name} • Edit any field before approving`
            : undefined
        }
        maxWidthClass="max-w-4xl"
      >
        {reviewProduct && (
          <div className="space-y-5 text-xs">
            {(reviewProduct.approvalNotes || reviewProduct.rejectionReason) && (
              <div className="rounded-xl border border-[#E8D5B5] bg-[#FAF3E6] p-3 text-[#8E6932]">
                <strong>Note:</strong> {reviewProduct.approvalNotes || reviewProduct.rejectionReason}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Gallery */}
              <div className="lg:col-span-5 space-y-3">
                <div className="aspect-square overflow-hidden rounded-xl border border-[#E6EAE4] bg-[#F3EFE7]">
                  <ProductImage
                    src={reviewProduct.images[selectedImgIdx]?.url ?? reviewProduct.images[0]?.url}
                    alt={reviewProduct.name}
                    className="h-full w-full"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {reviewProduct.images.map((img, idx) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setSelectedImgIdx(idx)}
                      className={`aspect-square overflow-hidden rounded-lg border ${
                        idx === selectedImgIdx ? 'border-[#344D3D] ring-1 ring-[#344D3D]' : 'border-[#E6EAE4]'
                      }`}
                    >
                      <ProductImage src={img.url} alt={img.label} className="h-full w-full" />
                    </button>
                  ))}
                </div>
                <div className="rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] p-3 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#78837C]">Supplier Cost</span>
                    <span className="font-medium tabular-nums">
                      {formatCurrency(reviewProduct.pricing.supplierCost, reviewProduct.pricing.supplierCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#78837C]">Selling Price ({Math.round(reviewProduct.pricing.targetGrossMargin * 100)}% Margin)</span>
                    <span className="font-semibold text-[#344D3D] tabular-nums">
                      {formatCurrency(reviewProduct.pricing.sellingPrice, settings.baseCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#78837C]">Total Variant Stock</span>
                    <span className="font-medium tabular-nums">
                      {getProductTotalStock(reviewProduct)} units ({reviewProduct.variants.length} variants)
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Editable Info */}
              <div className="lg:col-span-7 space-y-3.5">
                <div>
                  <label className="block font-semibold text-[#26352F] mb-1">Product Title</label>
                  <input
                    value={reviewProduct.name}
                    onChange={(e) => updateProduct(reviewProduct.id, { name: e.target.value })}
                    className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 font-medium focus:border-[#526D5B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#26352F] mb-1">English Description</label>
                  <textarea
                    rows={3}
                    value={reviewProduct.descriptionEn}
                    onChange={(e) => updateProduct(reviewProduct.id, { descriptionEn: e.target.value })}
                    className="w-full rounded-lg border border-[#E6EAE4] p-2.5 leading-relaxed focus:border-[#526D5B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#26352F] mb-1">Spanish Translation</label>
                  <textarea
                    rows={3}
                    value={reviewProduct.descriptionEs}
                    onChange={(e) => updateProduct(reviewProduct.id, { descriptionEs: e.target.value })}
                    className="w-full rounded-lg border border-[#E6EAE4] p-2.5 leading-relaxed focus:border-[#526D5B] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[#78837C] mb-1">Material</label>
                    <input
                      value={reviewProduct.attributes.material}
                      onChange={(e) =>
                        updateProduct(reviewProduct.id, {
                          attributes: { ...reviewProduct.attributes, material: e.target.value },
                        })
                      }
                      className="w-full rounded-lg border border-[#E6EAE4] px-2.5 py-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[#78837C] mb-1">Colors</label>
                    <input
                      value={reviewProduct.attributes.color}
                      onChange={(e) =>
                        updateProduct(reviewProduct.id, {
                          attributes: { ...reviewProduct.attributes, color: e.target.value },
                        })
                      }
                      className="w-full rounded-lg border border-[#E6EAE4] px-2.5 py-1.5"
                    />
                  </div>
                </div>

                {/* Action Note Field for Request Changes or Reject */}
                {actionMode !== 'none' && (
                  <div className="rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] p-3.5 space-y-2.5">
                    <p className="font-semibold text-[#26352F]">
                      {actionMode === 'changes'
                        ? 'Specify Requested Changes'
                        : 'Required Rejection Reason'}
                    </p>
                    {actionError && <p className="text-[#9F514B]">{actionError}</p>}
                    <textarea
                      rows={2}
                      value={noteInput}
                      onChange={(e) => {
                        setNoteInput(e.target.value);
                        setActionError(null);
                      }}
                      placeholder={
                        actionMode === 'changes'
                          ? 'e.g., Refresh Beige XL inventory count and regenerate Spanish fit note...'
                          : 'e.g., Fabric GSM below storefront quality benchmark...'
                      }
                      className="w-full rounded-lg border border-[#E6EAE4] bg-white p-2.5 focus:border-[#526D5B] focus:outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setActionMode('none')}
                        className="rounded-lg border border-[#E6EAE4] bg-white px-3 py-1.5"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={actionMode === 'changes' ? handleRequestChanges : handleReject}
                        className={`rounded-lg px-3.5 py-1.5 font-medium text-white ${
                          actionMode === 'changes' ? 'bg-[#B58A4B]' : 'bg-[#C47770]'
                        }`}
                      >
                        {actionMode === 'changes' ? 'Submit Change Request' : 'Confirm Rejection'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Primary 3 Approval Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-[#E6EAE4]">
                  <button
                    type="button"
                    onClick={() => {
                      setActionMode('reject');
                      setActionError(null);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#EBCAC7] bg-[#FBF0EF] px-3.5 py-2 font-medium text-[#9F514B] hover:bg-[#f6e3e1]"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Reject Product
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActionMode('changes');
                      setActionError(null);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8D5B5] bg-[#FAF3E6] px-3.5 py-2 font-medium text-[#8E6932] hover:bg-[#f3e7d1]"
                  >
                    <MessageSquareWarning className="h-3.5 w-3.5" />
                    Request Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleApprove}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#344D3D] px-4 py-2 font-medium text-white hover:bg-[#293E31]"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approve Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

