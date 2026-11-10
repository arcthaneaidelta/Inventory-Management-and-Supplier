import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Camera,
  Check,
  CheckCircle2,
  Eye,
  Loader2,
  Maximize2,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trash2,
  XCircle,
  ZoomIn,
} from 'lucide-react';
import { useSupplyFlow } from '../context/SupplyFlowContext';
import { BeforeAfterSlider } from '../components/animations/BeforeAfterSlider';
import { Modal } from '../components/common/Modal';
import { ProductImage } from '../components/common/ProductImage';
import { delay, resolveStudioPresetImage } from '../services/mockAI';
import { PhotographyStyle, ProductCategory, ProductImage as ProductImageType, StudioBackground } from '../types';

const STUDIO_STAGES = [
  'Analyzing original product',
  'Preparing photography style',
  'Applying selected presentation',
  'Reviewing product consistency',
  'Preparing final images',
];

const STYLES: PhotographyStyle[] = [
  'On-model studio',
  'Clean white background',
  'Lifestyle photography',
  'Premium catalog',
  'Detail photography',
];

const BACKGROUNDS: StudioBackground[] = [
  'Pure white',
  'Warm ivory',
  'Neutral studio',
  'Lifestyle environment',
];

export const AIStudioPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const {
    products,
    suppliers,
    addImageToProduct,
    removeProductImage,
    setPrimaryProductImage,
    recordAutomationRun,
    pushToast,
  } = useSupplyFlow();

  const initialProductId = searchParams.get('product') || products[0]?.id;
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProductCategory>('All');
  const [selectedProductId, setSelectedProductId] = useState(initialProductId);

  const filteredProducts = useMemo(
    () =>
      selectedCategory === 'All'
        ? products
        : products.filter((p) => p.category === selectedCategory),
    [products, selectedCategory]
  );

  const activeProduct =
    products.find((p) => p.id === selectedProductId) ?? filteredProducts[0] ?? products[0];

  const [photoStyle, setPhotoStyle] = useState<PhotographyStyle>('Premium catalog');
  const [background, setBackground] = useState<StudioBackground>('Warm ivory');
  const [modelChoice, setModelChoice] = useState('Model A');
  const [viewMode, setViewMode] = useState<'split' | 'slider'>('split');

  // Processing modal state
  const [generating, setGenerating] = useState(false);
  const [genStepIdx, setGenStepIdx] = useState(0);
  const [candidateImage, setCandidateImage] = useState<ProductImageType | null>(null);
  const [rejectedFlag, setRejectedFlag] = useState(false);

  // Fullscreen gallery viewer
  const [lightboxImg, setLightboxImg] = useState<ProductImageType | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const originalImage =
    activeProduct.images.find((i) => i.category === 'Original') ?? activeProduct.images[0];
  const preparedImage =
    candidateImage ??
    activeProduct.images.find((i) => i.category !== 'Original') ??
    activeProduct.images[0];

  const modelAdapted = activeProduct.category !== 'Apparel';

  const handleGenerate = async () => {
    setGenerating(true);
    setRejectedFlag(false);
    setGenStepIdx(0);

    for (let i = 0; i < STUDIO_STAGES.length; i++) {
      setGenStepIdx(i);
      await delay(320);
    }

    const generated = resolveStudioPresetImage(
      activeProduct,
      photoStyle,
      background,
      modelChoice
    );
    setCandidateImage(generated);
    setGenerating(false);

    recordAutomationRun({
      workflowName: 'AI Photography Preparation',
      trigger: `${photoStyle} • ${background}`,
      executionTime: '2026-11-10 09:42',
      status: 'Success',
      durationMs: 1620,
      processedProduct: `${activeProduct.name} (${activeProduct.sku})`,
      productId: activeProduct.id,
      summary: `Prepared ${generated.category} preset preserving product fabric and silhouette.`,
    });
  };

  const handleAddCandidateToCatalog = (asPrimary: boolean) => {
    if (!candidateImage) return;
    addImageToProduct(activeProduct.id, candidateImage, asPrimary);
    pushToast({
      title: 'Studio image added to product catalog',
      description: `${activeProduct.name} (${activeProduct.sku}) gallery updated.`,
      variant: 'success',
    });
    setCandidateImage(null);
  };

  const supplier = suppliers.find((s) => s.id === activeProduct.supplierId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#26352F]">AI Product Studio</h1>
          <p className="mt-1 text-sm text-[#78837C]">
            Prepare cohesive studio catalog imagery from supplier photos while preserving color, weave, and silhouette.
          </p>
        </div>
        <Link
          to={`/app/catalog/${activeProduct.id}`}
          className="inline-flex items-center justify-center rounded-lg border border-[#E6EAE4] bg-white px-4 py-2 text-xs font-medium text-[#26352F] hover:bg-[#F0F2ED]"
        >
          Open Product Record →
        </Link>
      </div>

      {/* Product Selector Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-2xl border border-[#E6EAE4] bg-white p-4 shadow-sf-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-[#78837C] mr-1">Category:</span>
          {(['All', 'Apparel', 'Shoes', 'Accessories'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                setCandidateImage(null);
                const first = cat === 'All' ? products[0] : products.find((p) => p.category === cat);
                if (first) setSelectedProductId(first.id);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
                selectedCategory === cat
                  ? 'border-[#344D3D] bg-[#E9F0E9] text-[#344D3D]'
                  : 'border-[#E6EAE4] bg-[#F7F8F5] text-[#78837C]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <label className="font-medium text-[#78837C]">Active Product:</label>
          <select
            value={activeProduct.id}
            onChange={(e) => {
              setSelectedProductId(e.target.value);
              setCandidateImage(null);
              setRejectedFlag(false);
            }}
            className="rounded-lg border border-[#E6EAE4] bg-[#F7F8F5] px-3 py-1.5 font-medium text-[#26352F] focus:border-[#526D5B] focus:outline-none"
          >
            {filteredProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <aside className="lg:col-span-4 rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E6EAE4] pb-3">
            <SlidersHorizontal className="h-4 w-4 text-[#526D5B]" />
            <h2 className="font-display text-base font-semibold text-[#26352F]">
              Photography Controls
            </h2>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-medium text-[#26352F] mb-1.5">Photography Style</label>
              <div className="space-y-1.5">
                {STYLES.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setPhotoStyle(style)}
                    className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors ${
                      photoStyle === style
                        ? 'border-[#526D5B] bg-[#E9F0E9]/60 font-medium text-[#344D3D]'
                        : 'border-[#E6EAE4] bg-[#F7F8F5] text-[#26352F] hover:bg-[#F0F2ED]'
                    }`}
                  >
                    <span>{style}</span>
                    {photoStyle === style && <Check className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-medium text-[#26352F] mb-1.5">Backdrop Environment</label>
              <select
                value={background}
                onChange={(e) => setBackground(e.target.value as StudioBackground)}
                className="w-full rounded-lg border border-[#E6EAE4] bg-white px-3 py-2 focus:border-[#526D5B] focus:outline-none"
              >
                {BACKGROUNDS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-medium text-[#26352F]">Model Selection</label>
                {modelAdapted && (
                  <span className="text-[10px] text-[#78837C]">Adapted for {activeProduct.category}</span>
                )}
              </div>
              {modelAdapted ? (
                <div className="rounded-lg border border-[#E6EAE4] bg-[#F7F8F5] p-2.5 text-[11px] text-[#78837C]">
                  On-model framing is automatically disabled for {activeProduct.category.toLowerCase()} in favor of surface/pedestal studio angles.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {['Model A', 'Model B', 'Model C'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setModelChoice(m)}
                      className={`rounded-lg border py-2 font-medium transition-colors ${
                        modelChoice === m
                          ? 'border-[#344D3D] bg-[#344D3D] text-white'
                          : 'border-[#E6EAE4] bg-white text-[#26352F]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] p-3 text-[11px] text-[#78837C] space-y-1">
              <p className="font-semibold text-[#26352F]">Consistency Guardrails Active</p>
              <p>Preserves original fabric grain, color tone, hardware, and garment silhouette.</p>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#344D3D] px-4 py-2.5 text-xs font-medium text-white shadow-sf-xs hover:bg-[#293E31] disabled:opacity-60 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              Generate Images
            </button>
          </div>
        </aside>

        {/* Preview Stage Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-semibold text-[#26352F]">
                  {activeProduct.name} <span className="font-mono text-xs text-[#78837C]">({activeProduct.sku})</span>
                </h2>
                <p className="text-[11px] text-[#78837C]">
                  {supplier?.name} • Demo preview using prepared local studio presets
                </p>
              </div>
              <div className="flex rounded-lg border border-[#E6EAE4] bg-[#F7F8F5] p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('split')}
                  className={`rounded-md px-3 py-1 font-medium ${
                    viewMode === 'split' ? 'bg-white text-[#26352F] shadow-sf-xs' : 'text-[#78837C]'
                  }`}
                >
                  Side-by-Side
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('slider')}
                  className={`rounded-md px-3 py-1 font-medium ${
                    viewMode === 'slider' ? 'bg-white text-[#26352F] shadow-sf-xs' : 'text-[#78837C]'
                  }`}
                >
                  Before / After Slider
                </button>
              </div>
            </div>

            {viewMode === 'slider' ? (
              <div className="mx-auto max-w-md">
                <BeforeAfterSlider
                  beforeSrc={originalImage?.url || ''}
                  afterSrc={preparedImage?.url || ''}
                  alt={activeProduct.name}
                  beforeLabel="Original Supplier"
                  afterLabel={candidateImage ? 'New Prepared Output' : 'Studio Catalog'}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#78837C]">Original Supplier Image</span>
                    <span className="rounded bg-[#F0F2ED] px-2 py-0.5 text-[#5C6660]">Reference</span>
                  </div>
                  <div className="aspect-square overflow-hidden rounded-xl border border-[#E6EAE4] bg-[#F3EFE7]">
                    <ProductImage
                      src={originalImage?.url}
                      alt={`${activeProduct.name} original`}
                      className="h-full w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#344D3D]">
                      {candidateImage ? 'Prepared Sample Output' : 'Prepared Catalog Image'}
                    </span>
                    <span className="rounded bg-[#E9F0E9] px-2 py-0.5 text-[#344D3D]">
                      {preparedImage?.presetApplied || preparedImage?.category}
                    </span>
                  </div>
                  <div className="relative aspect-square overflow-hidden rounded-xl border border-[#526D5B]/40 bg-[#F3EFE7]">
                    <ProductImage
                      src={preparedImage?.url}
                      alt={`${activeProduct.name} prepared`}
                      className="h-full w-full"
                    />
                    {rejectedFlag && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#26352F]/60 text-xs font-medium text-white">
                        Output rejected — adjust preset & regenerate
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Post-Generation Action Bar */}
            {candidateImage && !rejectedFlag && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#C9DBC9] bg-[#E9F0E9]/60 p-3.5 text-xs">
                <div>
                  <p className="font-semibold text-[#344D3D]">Prepared image ready for review</p>
                  <p className="text-[11px] text-[#526D5B]">{candidateImage.label}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRejectedFlag(true);
                      setCandidateImage(null);
                      pushToast({ title: 'Candidate output discarded', variant: 'info' });
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#EBCAC7] bg-white px-3 py-1.5 font-medium text-[#9F514B]"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#E6EAE4] bg-white px-3 py-1.5 font-medium text-[#26352F]"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Regenerate
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddCandidateToCatalog(false)}
                    className="rounded-lg border border-[#344D3D] bg-white px-3 py-1.5 font-medium text-[#344D3D]"
                  >
                    Add to Gallery
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddCandidateToCatalog(true)}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#344D3D] px-3.5 py-1.5 font-medium text-white"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Add & Set Primary
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Product Image Gallery */}
          <div className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-semibold text-[#26352F]">
                Product Image Gallery ({activeProduct.images.length})
              </h3>
              <span className="text-[11px] text-[#78837C]">Click image to zoom & inspect</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {activeProduct.images.map((img) => (
                <div
                  key={img.id}
                  className={`group rounded-xl border p-2 transition-all ${
                    img.isPrimary ? 'border-[#526D5B] bg-[#E9F0E9]/30' : 'border-[#E6EAE4] bg-[#F7F8F5]'
                  }`}
                >
                  <div
                    onClick={() => {
                      setLightboxImg(img);
                      setZoomLevel(1);
                    }}
                    className="relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-[#F3EFE7]"
                  >
                    <ProductImage src={img.url} alt={img.label} className="h-full w-full group-hover:scale-[1.03] transition-transform" />
                    <button
                      type="button"
                      aria-label="Zoom image"
                      className="absolute bottom-1.5 right-1.5 rounded-md bg-white/90 p-1 text-[#26352F] shadow-sf-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-2 space-y-1">
                    <span className="inline-block rounded bg-white border border-[#E6EAE4] px-1.5 py-0.5 text-[10px] font-medium text-[#26352F]">
                      {img.category}
                    </span>
                    <p className="truncate text-[11px] text-[#78837C]">{img.label}</p>
                    <div className="flex items-center justify-between pt-1">
                      {img.isPrimary ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#344D3D]">
                          <Star className="h-3 w-3 fill-[#526D5B] text-[#526D5B]" />
                          Primary
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setPrimaryProductImage(activeProduct.id, img.id);
                            pushToast({ title: 'Primary catalog image updated', variant: 'success' });
                          }}
                          className="text-[10px] font-medium text-[#526D5B] hover:underline"
                        >
                          Set Primary
                        </button>
                      )}
                      {activeProduct.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            removeProductImage(activeProduct.id, img.id);
                            pushToast({ title: 'Image removed from gallery', variant: 'info' });
                          }}
                          className="rounded p-1 text-[#9AA39C] hover:text-[#9F514B]"
                          aria-label="Remove image"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Studio Processing Modal */}
      <Modal
        open={generating}
        onClose={() => {}}
        title="Preparing Studio Photography"
        subtitle={`${activeProduct.name} • ${photoStyle}`}
      >
        <div className="space-y-3 py-2">
          {STUDIO_STAGES.map((stage, idx) => {
            const done = genStepIdx > idx;
            const active = genStepIdx === idx;
            return (
              <div key={stage} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 text-[#526D5B]" />
                  ) : active ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#B58A4B]" />
                  ) : (
                    <span className="h-4 w-4 rounded-full border border-[#CBD4CB]" />
                  )}
                  <span className={done || active ? 'font-medium text-[#26352F]' : 'text-[#9AA39C]'}>
                    {stage}
                  </span>
                </div>
                <span className="text-[11px] text-[#78837C]">
                  {done ? 'Complete' : active ? 'Running...' : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>
      </Modal>

      {/* Fullscreen Lightbox Modal with Zoom */}
      <Modal
        open={lightboxImg !== null}
        onClose={() => setLightboxImg(null)}
        title={lightboxImg?.label ?? 'Image Inspector'}
        subtitle={lightboxImg?.category}
        maxWidthClass="max-w-3xl"
      >
        {lightboxImg && (
          <div className="space-y-3">
            <div className="overflow-auto rounded-xl border border-[#E6EAE4] bg-[#F3EFE7] max-h-[60vh] flex items-center justify-center p-4">
              <img
                src={lightboxImg.url}
                alt={lightboxImg.label}
                style={{ transform: `scale(${zoomLevel})` }}
                className="max-h-[52vh] rounded-lg object-contain transition-transform duration-150"
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ZoomIn className="h-4 w-4 text-[#78837C]" />
                <span className="text-[#78837C]">Zoom:</span>
                <input
                  type="range"
                  min={1}
                  max={2.4}
                  step={0.2}
                  value={zoomLevel}
                  onChange={(e) => setZoomLevel(Number(e.target.value))}
                  className="accent-[#344D3D]"
                />
                <span className="tabular-nums font-medium">{zoomLevel.toFixed(1)}x</span>
              </div>
              <button
                type="button"
                onClick={() => setLightboxImg(null)}
                className="rounded-lg border border-[#E6EAE4] px-3 py-1.5 font-medium text-[#26352F]"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

