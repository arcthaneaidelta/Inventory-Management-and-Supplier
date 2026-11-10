import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Loader2,
  Save,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react';
import { useSupplyFlow } from '../context/SupplyFlowContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { ProductImage } from '../components/common/ProductImage';
import { formatCurrency } from '../services/mockPricing';
import { getProductTotalStock, getVariantStatus } from '../services/mockInventory';
import { generateAttributesAndSizing, generateProductDescription } from '../services/mockAI';

type TabKey =
  | 'Overview'
  | 'Images'
  | 'Description'
  | 'Attributes'
  | 'Variants'
  | 'Pricing'
  | 'Inventory'
  | 'Activity';

const TABS: TabKey[] = [
  'Overview',
  'Images',
  'Description',
  'Attributes',
  'Variants',
  'Pricing',
  'Inventory',
  'Activity',
];

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    products,
    suppliers,
    settings,
    updateProduct,
    setPrimaryProductImage,
    removeProductImage,
    updateVariantStock,
    pushToast,
  } = useSupplyFlow();

  const product = products.find((p) => p.id === id);
  const [activeTab, setActiveTab] = useState<TabKey>('Overview');
  const [aiBusy, setAiBusy] = useState<string | null>(null);
  const [aiGenCount, setAiGenCount] = useState(0);

  if (!product) {
    return (
      <div className="rounded-2xl border border-[#E6EAE4] bg-white p-10 text-center space-y-3">
        <p className="font-display text-lg font-semibold text-[#26352F]">Product not found</p>
        <Link to="/app/catalog" className="inline-block text-xs font-medium text-[#344D3D] hover:underline">
          ← Back to Product Catalog
        </Link>
      </div>
    );
  }

  const supplier = suppliers.find((s) => s.id === product.supplierId);
  const primaryImg = product.images.find((i) => i.isPrimary) ?? product.images[0];
  const totalStock = getProductTotalStock(product);

  const handleGenerateCopy = async (lang: 'en' | 'es') => {
    setAiBusy(lang);
    const nextText = await generateProductDescription(product, lang, aiGenCount);
    setAiGenCount((c) => c + 1);
    updateProduct(
      product.id,
      lang === 'en' ? { descriptionEn: nextText } : { descriptionEs: nextText },
      {
        actor: 'AI Catalog Engine',
        action: lang === 'en' ? 'Regenerated English description' : 'Regenerated Spanish translation',
        details: 'Generated structured storefront copy matching material attributes.',
        type: 'ai',
      }
    );
    setAiBusy(null);
    pushToast({
      title: lang === 'en' ? 'English description generated' : 'Spanish translation generated',
      variant: 'success',
    });
  };

  const handleGenerateAttrs = async (target: 'attrs' | 'size') => {
    setAiBusy(target);
    const patch = await generateAttributesAndSizing(product);
    updateProduct(
      product.id,
      { attributes: { ...product.attributes, ...patch } },
      {
        actor: 'AI Catalog Engine',
        action: target === 'attrs' ? 'Enriched product attributes' : 'Generated sizing & fit guidance',
        details: 'Updated fabric care, season, and fit notes.',
        type: 'ai',
      }
    );
    setAiBusy(null);
    pushToast({
      title: target === 'attrs' ? 'Product attributes enriched' : 'Size & fit notes generated',
      variant: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate('/app/catalog')}
            className="mt-0.5 rounded-lg border border-[#E6EAE4] bg-white p-2 text-[#78837C] hover:text-[#26352F]"
            aria-label="Back to catalog"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display text-2xl font-semibold text-[#26352F]">{product.name}</h1>
              <StatusBadge label={product.approvalStatus} />
            </div>
            <p className="mt-1 text-xs text-[#78837C]">
              SKU <span className="font-mono font-medium text-[#26352F]">{product.sku}</span> •{' '}
              {supplier?.name} • {product.category}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to={`/app/ai-studio?product=${product.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6EAE4] bg-white px-3.5 py-2 text-xs font-medium text-[#26352F] hover:bg-[#F0F2ED]"
          >
            <Camera className="h-3.5 w-3.5" />
            AI Studio
          </Link>
          <Link
            to={`/app/approvals?product=${product.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#344D3D] px-4 py-2 text-xs font-medium text-white hover:bg-[#293E31]"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Review in Approval Center
          </Link>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex overflow-x-auto gap-1 rounded-xl border border-[#E6EAE4] bg-white p-1 shadow-sf-xs">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTab(t)}
            className={`shrink-0 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors ${
              activeTab === t
                ? 'bg-[#E9F0E9] text-[#344D3D]'
                : 'text-[#78837C] hover:bg-[#F7F8F5] hover:text-[#26352F]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 rounded-2xl border border-[#E6EAE4] bg-white p-4 shadow-sf-xs">
            <div className="aspect-square overflow-hidden rounded-xl border border-[#E6EAE4] bg-[#F3EFE7]">
              <ProductImage src={primaryImg?.url} alt={product.name} className="h-full w-full" />
            </div>
            <p className="mt-2.5 text-center text-[11px] text-[#78837C]">{primaryImg?.label}</p>
          </div>

          <div className="lg:col-span-8 rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-[#E6EAE4] pb-4 text-xs">
              <div>
                <p className="text-[#78837C]">Brand</p>
                <p className="mt-1 font-semibold text-[#26352F]">{product.brand}</p>
              </div>
              <div>
                <p className="text-[#78837C]">Supplier</p>
                <Link to={`/app/suppliers/${product.supplierId}`} className="mt-1 block font-semibold text-[#344D3D] hover:underline">
                  {supplier?.name}
                </Link>
              </div>
              <div>
                <p className="text-[#78837C]">Supplier Cost</p>
                <p className="mt-1 font-semibold text-[#26352F] tabular-nums">
                  {formatCurrency(product.pricing.supplierCost, product.pricing.supplierCurrency)}
                </p>
              </div>
              <div>
                <p className="text-[#78837C]">Selling Price</p>
                <p className="mt-1 font-semibold text-[#344D3D] tabular-nums">
                  {formatCurrency(product.pricing.sellingPrice, settings.baseCurrency)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-semibold text-[#26352F]">English Summary</p>
                <p className="mt-1 leading-relaxed text-[#78837C]">{product.descriptionEn}</p>
              </div>
              <div>
                <p className="font-semibold text-[#26352F]">Spanish Summary</p>
                <p className="mt-1 leading-relaxed text-[#78837C]">{product.descriptionEs}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] p-3.5 text-xs">
              <div>
                <p className="text-[#78837C]">Total Stock</p>
                <p className="mt-0.5 font-semibold text-[#26352F] tabular-nums">{totalStock} units</p>
              </div>
              <div>
                <p className="text-[#78837C]">Variants</p>
                <p className="mt-0.5 font-semibold text-[#26352F] tabular-nums">{product.variants.length}</p>
              </div>
              <div>
                <p className="text-[#78837C]">Gross Margin</p>
                <p className="mt-0.5 font-semibold text-[#344D3D] tabular-nums">
                  {Math.round(product.pricing.targetGrossMargin * 100)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Images' && (
        <div className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-[#26352F]">Product Gallery</h2>
            <Link
              to={`/app/ai-studio?product=${product.id}`}
              className="rounded-lg bg-[#344D3D] px-3.5 py-1.5 text-xs font-medium text-white"
            >
              Generate New Preset in AI Studio
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {product.images.map((img) => (
              <div key={img.id} className="rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] p-2.5 space-y-2">
                <div className="aspect-square overflow-hidden rounded-lg bg-[#F3EFE7]">
                  <ProductImage src={img.url} alt={img.label} className="h-full w-full" />
                </div>
                <p className="text-[11px] font-medium text-[#26352F] truncate">{img.label}</p>
                <div className="flex items-center justify-between text-[10px]">
                  {img.isPrimary ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-[#344D3D]">
                      <Star className="h-3 w-3 fill-[#526D5B] text-[#526D5B]" /> Primary
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPrimaryProductImage(product.id, img.id)}
                      className="text-[#526D5B] font-medium hover:underline"
                    >
                      Set Primary
                    </button>
                  )}
                  {product.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProductImage(product.id, img.id)}
                      className="text-[#9F514B]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Description' && (
        <div className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-5 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-base font-semibold text-[#26352F]">
              Bilingual Descriptions (EN / ES)
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={aiBusy !== null}
                onClick={() => handleGenerateCopy('en')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6EAE4] bg-[#F7F8F5] px-3 py-1.5 font-medium text-[#26352F] hover:bg-[#E9F0E9]"
              >
                {aiBusy === 'en' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-[#526D5B]" />}
                Generate Description
              </button>
              <button
                type="button"
                disabled={aiBusy !== null}
                onClick={() => handleGenerateCopy('es')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6EAE4] bg-[#F7F8F5] px-3 py-1.5 font-medium text-[#26352F] hover:bg-[#E9F0E9]"
              >
                {aiBusy === 'es' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-[#526D5B]" />}
                Generate Spanish Translation
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <label className="block font-semibold text-[#26352F] mb-1.5">English Description</label>
              <textarea
                rows={5}
                value={product.descriptionEn}
                onChange={(e) => updateProduct(product.id, { descriptionEn: e.target.value })}
                className="w-full rounded-xl border border-[#E6EAE4] p-3 leading-relaxed focus:border-[#526D5B] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#26352F] mb-1.5">Spanish Translation</label>
              <textarea
                rows={5}
                value={product.descriptionEs}
                onChange={(e) => updateProduct(product.id, { descriptionEs: e.target.value })}
                className="w-full rounded-xl border border-[#E6EAE4] p-3 leading-relaxed focus:border-[#526D5B] focus:outline-none"
              />
            </div>
          </div>
          <p className="text-[11px] text-[#78837C]">
            Changes save automatically to local demo state and synchronize with Approval Center and Shopify Preview.
          </p>
        </div>
      )}

      {activeTab === 'Attributes' && (
        <div className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-5 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-base font-semibold text-[#26352F]">Product Attributes</h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={aiBusy !== null}
                onClick={() => handleGenerateAttrs('attrs')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6EAE4] bg-[#F7F8F5] px-3 py-1.5 font-medium text-[#26352F] hover:bg-[#E9F0E9]"
              >
                {aiBusy === 'attrs' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-[#526D5B]" />}
                Generate Product Attributes
              </button>
              <button
                type="button"
                disabled={aiBusy !== null}
                onClick={() => handleGenerateAttrs('size')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6EAE4] bg-[#F7F8F5] px-3 py-1.5 font-medium text-[#26352F] hover:bg-[#E9F0E9]"
              >
                {aiBusy === 'size' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-[#526D5B]" />}
                Generate Size Information
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(
              [
                ['material', 'Material'],
                ['fabric', 'Fabric'],
                ['color', 'Color'],
                ['pattern', 'Pattern'],
                ['gender', 'Gender'],
                ['productType', 'Product Type'],
                ['season', 'Season'],
                ['careInstructions', 'Care Instructions'],
                ['fitNotes', 'Size & Fit Notes'],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <label className="block font-medium text-[#78837C] mb-1">{label}</label>
                <input
                  value={product.attributes[key] ?? ''}
                  onChange={(e) =>
                    updateProduct(product.id, {
                      attributes: { ...product.attributes, [key]: e.target.value },
                    })
                  }
                  className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 text-[#26352F] focus:border-[#526D5B] focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Variants' && (
        <div className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-4">
          <h2 className="font-display text-base font-semibold text-[#26352F]">
            Configured Variants ({product.variants.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E6EAE4] text-[11px] text-[#78837C]">
                  <th className="pb-2.5">Variant ID</th>
                  <th className="pb-2.5">Color</th>
                  <th className="pb-2.5">Size</th>
                  <th className="pb-2.5 text-right">Available</th>
                  <th className="pb-2.5 text-right">Reserved</th>
                  <th className="pb-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6EAE4]">
                {product.variants.map((v) => (
                  <tr key={v.id}>
                    <td className="py-2.5 font-mono text-[11px] text-[#78837C]">{v.id}</td>
                    <td className="py-2.5 font-medium text-[#26352F]">{v.color}</td>
                    <td className="py-2.5 text-[#26352F]">{v.size}</td>
                    <td className="py-2.5 text-right tabular-nums font-medium">{v.availableStock}</td>
                    <td className="py-2.5 text-right tabular-nums text-[#78837C]">{v.reservedStock}</td>
                    <td className="py-2.5 text-right">
                      <StatusBadge label={getVariantStatus(v, settings.lowStockThreshold)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Pricing' && (
        <div className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-[#26352F]">Pricing Breakdown</h2>
            <Link to={`/app/pricing?product=${product.id}`} className="font-medium text-[#344D3D] hover:underline">
              Edit in Pricing Engine →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] p-3.5">
              <p className="text-[#78837C]">Supplier Cost</p>
              <p className="mt-1 font-semibold text-[#26352F] tabular-nums">
                {formatCurrency(product.pricing.supplierCost, product.pricing.supplierCurrency)}
              </p>
            </div>
            <div className="rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] p-3.5">
              <p className="text-[#78837C]">Converted ({settings.baseCurrency})</p>
              <p className="mt-1 font-semibold text-[#26352F] tabular-nums">
                {formatCurrency(product.pricing.convertedCost, settings.baseCurrency)}
              </p>
            </div>
            <div className="rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] p-3.5">
              <p className="text-[#78837C]">Landed Cost (+Freight & Duty)</p>
              <p className="mt-1 font-semibold text-[#26352F] tabular-nums">
                {formatCurrency(product.pricing.landedCost, settings.baseCurrency)}
              </p>
            </div>
            <div className="rounded-xl border border-[#C9DBC9] bg-[#E9F0E9]/60 p-3.5">
              <p className="text-[#344D3D]">Selling Price ({Math.round(product.pricing.targetGrossMargin * 100)}% Margin)</p>
              <p className="mt-1 font-display text-lg font-semibold text-[#344D3D] tabular-nums">
                {formatCurrency(product.pricing.sellingPrice, settings.baseCurrency)}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Inventory' && (
        <div className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-[#26352F]">
                Live Variant Stock Editor
              </h2>
              <p className="text-xs text-[#78837C]">
                Edits sync immediately with Inventory Alerts and Dashboard KPIs.
              </p>
            </div>
            <Link to="/app/inventory" className="text-xs font-medium text-[#344D3D] hover:underline">
              Full Inventory Matrix →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E6EAE4] text-[11px] text-[#78837C]">
                  <th className="pb-2.5">Color</th>
                  <th className="pb-2.5">Size</th>
                  <th className="pb-2.5">Available Stock</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6EAE4]">
                {product.variants.map((v) => (
                  <tr key={v.id}>
                    <td className="py-2.5 font-medium text-[#26352F]">{v.color}</td>
                    <td className="py-2.5 text-[#26352F]">{v.size}</td>
                    <td className="py-2.5">
                      <input
                        type="number"
                        min={0}
                        value={v.availableStock}
                        onChange={(e) =>
                          updateVariantStock(product.id, v.id, Number(e.target.value))
                        }
                        className="w-24 rounded-lg border border-[#E6EAE4] px-2.5 py-1 tabular-nums focus:border-[#526D5B] focus:outline-none"
                      />
                    </td>
                    <td className="py-2.5">
                      <StatusBadge label={getVariantStatus(v, settings.lowStockThreshold)} />
                    </td>
                    <td className="py-2.5 text-right tabular-nums text-[#78837C]">{v.lastUpdated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Activity' && (
        <div className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-3">
          <h2 className="font-display text-base font-semibold text-[#26352F]">Processing & Edit History</h2>
          {product.activity.length === 0 ? (
            <p className="py-6 text-center text-xs text-[#78837C]">No recent edits logged yet.</p>
          ) : (
            <div className="divide-y divide-[#E6EAE4]">
              {product.activity.map((act) => (
                <div key={act.id} className="py-3 text-xs flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[#26352F]">{act.action}</p>
                    <p className="mt-0.5 text-[#78837C]">{act.details}</p>
                    <p className="mt-1 text-[10px] text-[#9AA39C]">Actor: {act.actor}</p>
                  </div>
                  <span className="text-[11px] text-[#78837C] tabular-nums shrink-0">{act.timestamp}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

