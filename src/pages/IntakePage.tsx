import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Film,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import { useSupplyFlow } from '../context/SupplyFlowContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { SIMULATED_SUPPLIER_CHAT } from '../data/intake';
import { extractProductAttributes, ExtractionStepResult } from '../services/mockAI';
import { buildProductPricing } from '../services/mockPricing';
import { CurrencyCode, Product, ProductCategory, SubmissionMethod } from '../types';

const EXTRACTION_STEPS = [
  'Reading uploaded files',
  'Identifying product images',
  'Extracting product information',
  'Matching product attributes',
  'Organizing sizes and colors',
  'Validating price information',
  'Creating product records',
];

export const IntakePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    suppliers,
    products,
    intakeSubmissions,
    addProduct,
    updateProduct,
    recordAutomationRun,
    pushToast,
    settings,
  } = useSupplyFlow();

  const initialTab = searchParams.get('mode') === 'messaging' ? 'messaging' : 'submit';
  const [activeTab, setActiveTab] = useState<'submit' | 'messaging'>(initialTab);

  // Filters for Intake Log Table
  const [supplierFilter, setSupplierFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // New submission form state
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? 'sup-milano');
  const [submissionMethod, setSubmissionMethod] = useState<SubmissionMethod>('File Upload');
  const [manualName, setManualName] = useState('');
  const [manualSku, setManualSku] = useState('');
  const [manualCost, setManualCost] = useState<string>('28');
  const [category, setCategory] = useState<ProductCategory>('Apparel');
  const [colorsInput, setColorsInput] = useState('Ivory, Sand');
  const [sizesInput, setSizesInput] = useState('S, M, L, XL');
  const [stockPerVariant, setStockPerVariant] = useState('12');

  // Browser local file previews & validation
  const [photoPreviews, setPhotoPreviews] = useState<string[]>(['/images/products/linen-shirt-original.jpg']);
  const [uploadedSheetName, setUploadedSheetName] = useState<string>('');
  const [csvPreviewRows, setCsvPreviewRows] = useState<string[][]>([]);
  const [videoFileName, setVideoFileName] = useState<string>('');
  const [intakeError, setIntakeError] = useState<string | null>(null);

  // Simulated Messaging chat progress
  const [chatStep, setChatStep] = useState(3);

  // Extraction state
  const [extracting, setExtracting] = useState(false);
  const [extractStepIdx, setExtractStepIdx] = useState(-1);
  const [extracted, setExtracted] = useState<ExtractionStepResult | null>(null);
  const [duplicateProduct, setDuplicateProduct] = useState<Product | null>(null);

  const selectedSupplier = suppliers.find((s) => s.id === supplierId) ?? suppliers[0];

  const intakeStats = useMemo(() => {
    return {
      total: intakeSubmissions.length,
      awaiting: intakeSubmissions.filter((s) => s.status === 'Awaiting Extraction').length,
      extracted: intakeSubmissions.filter((s) => s.status === 'Successfully Extracted').length,
      attention: intakeSubmissions.filter((s) => s.status === 'Needs Attention').length,
      failed: intakeSubmissions.filter((s) => s.status === 'Failed').length,
    };
  }, [intakeSubmissions]);

  const filteredSubmissions = useMemo(() => {
    return intakeSubmissions.filter((s) => {
      if (supplierFilter !== 'All' && s.supplierId !== supplierFilter) return false;
      if (methodFilter !== 'All' && s.method !== methodFilter) return false;
      if (statusFilter !== 'All' && s.status !== statusFilter) return false;
      return true;
    });
  }, [intakeSubmissions, supplierFilter, methodFilter, statusFilter]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIntakeError(null);
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const valid: string[] = [];
    for (const f of files) {
      if (!f.type.startsWith('image/')) {
        setIntakeError(`Unsupported image format "${f.name}". Please upload JPG, PNG, or WEBP.`);
        return;
      }
      valid.push(URL.createObjectURL(f));
    }
    setPhotoPreviews(valid);
  };

  const handleSheetSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIntakeError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['csv', 'xlsx', 'xls'].includes(ext)) {
      setIntakeError(
        `Unsupported spreadsheet file ".${ext}". Please select a CSV or Excel (.xlsx/.xls) line sheet.`
      );
      setUploadedSheetName('');
      setCsvPreviewRows([]);
      return;
    }
    setUploadedSheetName(file.name);
    if (ext === 'csv') {
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result || '');
        const rows = text
          .split(/\r?\n/)
          .filter(Boolean)
          .slice(0, 5)
          .map((line) => line.split(',').map((c) => c.trim()));
        setCsvPreviewRows(rows);
        // Auto-populate fields if CSV has row 2
        if (rows[1]) {
          if (rows[1][0]) setManualSku(rows[1][0]);
          if (rows[1][1]) setManualName(rows[1][1]);
          if (rows[1][2] && !Number.isNaN(Number(rows[1][2]))) setManualCost(rows[1][2]);
        }
      };
      reader.readAsText(file);
    } else {
      setCsvPreviewRows([
        ['SKU', 'Product_Name', 'Cost', 'Colors', 'Sizes'],
        [manualSku || 'BA-148', manualName || 'Linen Summer Tunic', manualCost || '31', 'Ivory, Sand', 'S,M,L'],
      ]);
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setVideoFileName(`${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)`);
  };

  const runExtraction = async (override?: {
    name?: string;
    sku?: string;
    cost?: number;
    method?: SubmissionMethod;
    colors?: string[];
    sizes?: string[];
  }) => {
    setIntakeError(null);
    const costVal = Number(override?.cost ?? manualCost);
    if (Number.isNaN(costVal) || costVal <= 0) {
      setIntakeError('Missing or invalid product wholesale price. Enter a positive cost before extraction.');
      return;
    }

    setExtracting(true);
    setExtracted(null);
    setDuplicateProduct(null);
    setExtractStepIdx(0);

    const parsedColors =
      override?.colors ??
      colorsInput
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
    const parsedSizes =
      override?.sizes ??
      sizesInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

    const res = await extractProductAttributes(
      {
        fileName: uploadedSheetName || photoPreviews[0],
        manualName: override?.name ?? manualName,
        manualSku: override?.sku ?? manualSku,
        manualCost: costVal,
        category,
        colors: parsedColors,
        sizes: parsedSizes,
      },
      (idx) => setExtractStepIdx(idx)
    );

    setExtracting(false);
    setExtractStepIdx(EXTRACTION_STEPS.length);
    setExtracted(res);

    // Check duplicate SKU
    const match = products.find((p) => p.sku.toLowerCase() === res.sku.toLowerCase());
    if (match) {
      setDuplicateProduct(match);
    }

    pushToast({
      title: 'Extraction sequence complete',
      description: `Prepared editable draft for "${res.name}" (${res.sku}).`,
      variant: match ? 'warning' : 'success',
    });
  };

  const handleSaveExtracted = (mode: 'create' | 'update' | 'branch' = 'create') => {
    if (!extracted) return;

    if (mode === 'update' && duplicateProduct) {
      const updatedPricing = buildProductPricing(
        extracted.supplierCost,
        selectedSupplier.currency,
        selectedSupplier.defaultFreight,
        selectedSupplier.defaultDuty,
        selectedSupplier.targetMarginOverride ?? 0.45,
        settings.baseCurrency
      );
      updateProduct(
        duplicateProduct.id,
        {
          name: extracted.name,
          descriptionEn: extracted.descriptionEn,
          descriptionEs: extracted.descriptionEs,
          attributes: extracted.attributes,
          pricing: updatedPricing,
          approvalStatus: 'Ready for Approval',
        },
        {
          actor: 'Product Intake',
          action: 'Updated existing product from intake submission',
          details: `Merged extracted cost (${extracted.supplierCost} ${selectedSupplier.currency}) and attributes.`,
          type: 'intake',
        }
      );
      pushToast({
        title: `Updated existing product ${duplicateProduct.sku}`,
        description: 'Changes merged and staged for Approval Center.',
        variant: 'success',
      });
      navigate(`/app/catalog/${duplicateProduct.id}`);
      return;
    }

    const finalSku =
      mode === 'branch' && duplicateProduct
        ? `${extracted.sku}-${Math.floor(10 + Math.random() * 89)}`
        : extracted.sku;

    const qty = Math.max(0, Number(stockPerVariant) || 12);
    const variants = [];
    for (const color of extracted.colors) {
      for (const size of extracted.sizes) {
        variants.push({
          id: `var-${Date.now()}-${color}-${size}`.replace(/\s+/g, ''),
          color,
          size,
          availableStock: qty,
          reservedStock: 0,
          reorderThreshold: settings.lowStockThreshold,
          lastUpdated: '2026-11-10',
        });
      }
    }

    const newProductId = `prod-${Date.now()}`;
    const newProd: Product = {
      id: newProductId,
      sku: finalSku,
      name: extracted.name,
      brand: selectedSupplier.name,
      supplierId: selectedSupplier.id,
      category: extracted.category,
      images: (photoPreviews.length ? photoPreviews : ['/images/products/linen-shirt-original.jpg']).map(
        (url, i) => ({
          id: `img-${Date.now()}-${i}`,
          url,
          label: i === 0 ? 'Supplier submission image' : `Attachment ${i + 1}`,
          category: 'Original',
          isPrimary: i === 0,
        })
      ),
      descriptionEn: extracted.descriptionEn,
      descriptionEs: extracted.descriptionEs,
      attributes: extracted.attributes,
      variants,
      pricing: buildProductPricing(
        extracted.supplierCost,
        selectedSupplier.currency as CurrencyCode,
        selectedSupplier.defaultFreight,
        selectedSupplier.defaultDuty,
        selectedSupplier.targetMarginOverride ?? 0.45,
        settings.baseCurrency
      ),
      approvalStatus: 'Ready for Approval',
      submissionMethod,
      lastUpdated: '2026-11-10',
      imagesLastReviewed: '2026-11-10',
      activity: [
        {
          id: `act-${Date.now()}`,
          timestamp: '2026-11-10 09:30',
          actor: 'Product Intake AI',
          action: 'Extracted and staged product',
          details: `Ingested via ${submissionMethod} from ${selectedSupplier.name}.`,
          type: 'intake',
        },
      ],
    };

    addProduct(newProd, {
      id: `int-${Date.now()}`,
      reference: `INT-2026-${Math.floor(115 + Math.random() * 80)}`,
      supplierId: selectedSupplier.id,
      method: submissionMethod,
      submittedAt: '2026-11-10 09:30',
      status: 'Successfully Extracted',
      fileName: uploadedSheetName || `${finalSku.toLowerCase()}_packet.jpg`,
      itemCount: 1,
      productName: newProd.name,
      sku: newProd.sku,
      confidence: 'High confidence',
      linkedProductId: newProductId,
    });

    recordAutomationRun({
      workflowName: 'Product Data Extraction',
      trigger: `${submissionMethod} • ${selectedSupplier.name}`,
      executionTime: '2026-11-10 09:30',
      status: 'Success',
      durationMs: 1680,
      processedProduct: `${newProd.name} (${newProd.sku})`,
      productId: newProductId,
      summary: `Created product with ${variants.length} variants and staged in Approval Center.`,
    });

    pushToast({
      title: `${newProd.name} created`,
      description: `SKU ${newProd.sku} is now in Product Catalog and Approval Center.`,
      variant: 'success',
    });

    setExtracted(null);
    setDuplicateProduct(null);
    navigate(`/app/catalog/${newProductId}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#26352F]">Product Intake Center</h1>
          <p className="mt-1 text-sm text-[#78837C]">
            Receive supplier packets across messaging, spreadsheets, and uploads—then extract into structured products.
          </p>
        </div>
        <div className="flex rounded-lg border border-[#E6EAE4] bg-white p-1">
          <button
            type="button"
            onClick={() => setActiveTab('submit')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'submit' ? 'bg-[#344D3D] text-white' : 'text-[#78837C] hover:text-[#26352F]'
            }`}
          >
            New Submission & Extraction
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('messaging')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'messaging' ? 'bg-[#344D3D] text-white' : 'text-[#78837C] hover:text-[#26352F]'
            }`}
          >
            Simulated Messaging Chat
          </button>
        </div>
      </div>

      {/* Intake KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Submissions', val: intakeStats.total, tone: 'text-[#26352F]' },
          { label: 'Awaiting Extraction', val: intakeStats.awaiting, tone: 'text-[#7895A5]' },
          { label: 'Successfully Extracted', val: intakeStats.extracted, tone: 'text-[#344D3D]' },
          { label: 'Needs Attention', val: intakeStats.attention, tone: 'text-[#B58A4B]' },
          { label: 'Failed Submissions', val: intakeStats.failed, tone: 'text-[#C47770]' },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-[#E6EAE4] bg-white p-4 shadow-sf-xs">
            <p className="text-[11px] font-medium text-[#78837C]">{k.label}</p>
            <p className={`mt-1.5 font-display text-2xl font-semibold tabular-nums ${k.tone}`}>
              {k.val}
            </p>
          </div>
        ))}
      </div>

      {/* Main Interactive Workspace */}
      {activeTab === 'messaging' ? (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs">
          <div className="lg:col-span-7 flex flex-col justify-between rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] p-4">
            <div>
              <div className="flex items-center justify-between border-b border-[#E6EAE4] pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#344D3D] text-xs font-semibold text-white">
                    MF
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#26352F]">Milano Fashion • Supplier Channel</p>
                    <p className="text-[11px] text-[#78837C]">Simulated messaging intake (no external chat connected)</p>
                  </div>
                </div>
                <span className="rounded-md bg-[#E9F0E9] px-2 py-0.5 text-[10px] font-medium text-[#344D3D]">
                  Demo Thread
                </span>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {SIMULATED_SUPPLIER_CHAT.slice(0, chatStep + 1).map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'system' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs ${
                        msg.sender === 'system'
                          ? 'bg-[#E9F0E9] text-[#344D3D] border border-[#C9DBC9]'
                          : 'bg-white text-[#26352F] border border-[#E6EAE4]'
                      }`}
                    >
                      <p className="leading-relaxed">{msg.text}</p>
                      {msg.attachment && (
                        <div className="mt-2 rounded-lg border border-[#E6EAE4] bg-[#F7F8F5] p-2">
                          {msg.attachment.imageUrl && (
                            <img
                              src={msg.attachment.imageUrl}
                              alt={msg.attachment.title}
                              className="mb-2 h-32 w-full rounded-md object-cover"
                            />
                          )}
                          {msg.attachment.type === 'video' && (
                            <div className="mb-1.5 flex items-center gap-2 text-[#526D5B] font-medium">
                              <Film className="h-4 w-4" />
                              <span>Showroom Clip Preview Ready</span>
                            </div>
                          )}
                          <p className="font-medium text-[#26352F]">{msg.attachment.title}</p>
                          <p className="text-[10px] text-[#78837C]">{msg.attachment.subtitle}</p>
                        </div>
                      )}
                      <p className="mt-1 text-[10px] text-[#9AA39C] text-right">{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E6EAE4] flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={chatStep >= SIMULATED_SUPPLIER_CHAT.length - 1}
                  onClick={() => setChatStep((s) => Math.min(SIMULATED_SUPPLIER_CHAT.length - 1, s + 1))}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6EAE4] bg-white px-3 py-1.5 text-xs font-medium text-[#26352F] disabled:opacity-40"
                >
                  <Send className="h-3.5 w-3.5" />
                  Next Supplier Message
                </button>
                <button
                  type="button"
                  onClick={() => setChatStep(0)}
                  className="rounded-lg border border-[#E6EAE4] bg-white px-3 py-1.5 text-xs text-[#78837C] hover:text-[#26352F]"
                >
                  Replay Chat
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSubmissionMethod('Messaging');
                  setSupplierId('sup-milano');
                  setManualName('Milano Resort Linen Shirt');
                  setManualSku('MF-204');
                  setManualCost('25');
                  setColorsInput('White, Beige, Black');
                  setSizesInput('S, M, L, XL');
                  setActiveTab('submit');
                  runExtraction({
                    name: 'Milano Resort Linen Shirt',
                    sku: 'MF-204',
                    cost: 25,
                    method: 'Messaging',
                    colors: ['White', 'Beige', 'Black'],
                    sizes: ['S', 'M', 'L', 'XL'],
                  });
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#344D3D] px-4 py-2 text-xs font-medium text-white hover:bg-[#293E31]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Extract This Chat Packet
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-display text-base font-semibold text-[#26352F]">
              How Messaging Intake Works
            </h3>
            <p className="text-xs leading-relaxed text-[#78837C]">
              Instead of manually copying WhatsApp photos, voice text, and wholesale prices into spreadsheets, SUPPLYFLOW captures every attachment and runs AI attribute parsing automatically.
            </p>
            <div className="rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] p-4 space-y-2.5 text-xs">
              <p className="font-semibold text-[#26352F]">Extracted from this sample thread:</p>
              <div className="flex justify-between">
                <span className="text-[#78837C]">Supplier</span>
                <span className="font-medium">Milano Fashion (EUR)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#78837C]">Detected SKU</span>
                <span className="font-mono font-medium">MF-204 (Duplicate test!)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#78837C]">Wholesale Cost</span>
                <span className="font-medium tabular-nums">€25.00 EUR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#78837C]">Variants</span>
                <span className="font-medium">3 Colors × 4 Sizes</span>
              </div>
            </div>
            <p className="text-[11px] text-[#9AA39C]">
              Tip: Clicking “Extract This Chat Packet” uses SKU MF-204 to also demonstrate duplicate SKU detection!
            </p>
          </div>
        </section>
      ) : (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Submission Form */}
          <div className="lg:col-span-6 rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-[#26352F]">
                New Product Submission
              </h2>
              <button
                type="button"
                onClick={() => {
                  setSupplierId('sup-milano');
                  setManualName('Mediterranean Linen Overshirt');
                  setManualSku(`MF-${Math.floor(250 + Math.random() * 90)}`);
                  setManualCost('29');
                  setColorsInput('Ivory, Sage');
                  setSizesInput('S, M, L, XL');
                  setPhotoPreviews(['/images/products/linen-shirt-original.jpg']);
                }}
                className="text-[11px] font-medium text-[#526D5B] hover:underline"
              >
                Fill Sample Data
              </button>
            </div>

            {intakeError && (
              <div className="flex items-start gap-2 rounded-xl border border-[#EBCAC7] bg-[#FBF0EF] p-3 text-xs text-[#9F514B]">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{intakeError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-medium text-[#26352F] mb-1">Supplier</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full rounded-lg border border-[#E6EAE4] bg-white px-3 py-2 focus:border-[#526D5B] focus:outline-none"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.currency})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-[#26352F] mb-1">Channel</label>
                <select
                  value={submissionMethod}
                  onChange={(e) => setSubmissionMethod(e.target.value as SubmissionMethod)}
                  className="w-full rounded-lg border border-[#E6EAE4] bg-white px-3 py-2 focus:border-[#526D5B] focus:outline-none"
                >
                  {['File Upload', 'CSV', 'Excel', 'Messaging', 'Manual Entry', 'Supplier Portal'].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-[#26352F] mb-1">Product Name</label>
                <input
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="e.g., Relaxed Summer Linen Overshirt"
                  className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 focus:border-[#526D5B] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-[#26352F] mb-1">
                  SKU <span className="text-[#9AA39C] font-normal">(try MF-204 for duplicate check)</span>
                </label>
                <input
                  value={manualSku}
                  onChange={(e) => setManualSku(e.target.value)}
                  placeholder="e.g., MF-280"
                  className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 font-mono focus:border-[#526D5B] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-[#26352F] mb-1">
                  Wholesale Cost ({selectedSupplier?.currency})
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={manualCost}
                  onChange={(e) => setManualCost(e.target.value)}
                  className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 tabular-nums focus:border-[#526D5B] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-[#26352F] mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full rounded-lg border border-[#E6EAE4] bg-white px-3 py-2 focus:border-[#526D5B] focus:outline-none"
                >
                  <option value="Apparel">Apparel</option>
                  <option value="Shoes">Shoes</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-[#26352F] mb-1">Colors (comma separated)</label>
                <input
                  value={colorsInput}
                  onChange={(e) => setColorsInput(e.target.value)}
                  className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 focus:border-[#526D5B] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-[#26352F] mb-1">Sizes & Initial Stock/Variant</label>
                <div className="flex gap-2">
                  <input
                    value={sizesInput}
                    onChange={(e) => setSizesInput(e.target.value)}
                    className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 focus:border-[#526D5B] focus:outline-none"
                  />
                  <input
                    type="number"
                    min="0"
                    value={stockPerVariant}
                    onChange={(e) => setStockPerVariant(e.target.value)}
                    className="w-20 rounded-lg border border-[#E6EAE4] px-2.5 py-2 tabular-nums focus:border-[#526D5B] focus:outline-none"
                    title="Initial stock per variant"
                  />
                </div>
              </div>
            </div>

            {/* File Uploaders (Local browser previews) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <label className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#CBD4CB] bg-[#F7F8F5] p-3 cursor-pointer hover:border-[#526D5B] text-center">
                <ImageIcon className="h-4 w-4 text-[#526D5B]" />
                <span className="font-medium text-[#26352F]">Upload Photos</span>
                <span className="text-[10px] text-[#78837C]">JPG, PNG, WEBP</span>
                <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
              </label>

              <label className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#CBD4CB] bg-[#F7F8F5] p-3 cursor-pointer hover:border-[#526D5B] text-center">
                <FileSpreadsheet className="h-4 w-4 text-[#526D5B]" />
                <span className="font-medium text-[#26352F]">CSV / Excel Sheet</span>
                <span className="text-[10px] text-[#78837C]">{uploadedSheetName || '.csv or .xlsx'}</span>
                <input type="file" onChange={handleSheetSelect} className="hidden" />
              </label>

              <label className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#CBD4CB] bg-[#F7F8F5] p-3 cursor-pointer hover:border-[#526D5B] text-center">
                <Film className="h-4 w-4 text-[#526D5B]" />
                <span className="font-medium text-[#26352F]">Product Video</span>
                <span className="text-[10px] text-[#78837C] truncate max-w-full">
                  {videoFileName || 'Optional MP4 clip'}
                </span>
                <input type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" />
              </label>
            </div>

            {photoPreviews.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {photoPreviews.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Submission preview ${idx + 1}`}
                    className="h-14 w-14 rounded-lg border border-[#E6EAE4] object-cover"
                  />
                ))}
              </div>
            )}

            {csvPreviewRows.length > 0 && (
              <div className="rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] p-2.5 overflow-x-auto text-[11px]">
                <p className="font-semibold text-[#26352F] mb-1">Parsed Sheet Preview:</p>
                <table className="w-full text-left">
                  <tbody>
                    {csvPreviewRows.map((row, ri) => (
                      <tr key={ri} className={ri === 0 ? 'font-semibold text-[#26352F]' : 'text-[#78837C]'}>
                        {row.map((cell, ci) => (
                          <td key={ci} className="pr-3 py-0.5 whitespace-nowrap">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <button
              type="button"
              disabled={extracting}
              onClick={() => runExtraction()}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#344D3D] px-4 py-2.5 text-xs font-medium text-white shadow-sf-xs hover:bg-[#293E31] disabled:opacity-60 transition-colors"
            >
              {extracting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running AI Extraction...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Process Submission
                </>
              )}
            </button>
          </div>

          {/* Right Extraction Sequence & Editable Form */}
          <div className="lg:col-span-6 rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-4">
            <h2 className="font-display text-base font-semibold text-[#26352F]">
              AI Extraction & Validation Output
            </h2>

            {/* 7-Step Progress List */}
            {(extracting || extracted) && (
              <div className="space-y-1.5 rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] p-3.5 text-xs">
                {EXTRACTION_STEPS.map((stepLabel, idx) => {
                  const done = extractStepIdx > idx;
                  const active = extracting && extractStepIdx === idx;
                  return (
                    <div key={stepLabel} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {done ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#526D5B]" />
                        ) : active ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-[#B58A4B]" />
                        ) : (
                          <span className="h-3.5 w-3.5 rounded-full border border-[#CBD4CB]" />
                        )}
                        <span className={done ? 'text-[#26352F] font-medium' : 'text-[#78837C]'}>
                          {idx + 1}. {stepLabel}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#9AA39C]">
                        {done ? 'Done' : active ? 'Processing...' : 'Queued'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Duplicate SKU Warning */}
            {duplicateProduct && (
              <div className="rounded-xl border border-[#E8D5B5] bg-[#FAF3E6] p-4 space-y-2.5 text-xs">
                <div className="flex items-start gap-2 text-[#8E6932]">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Potential duplicate product detected.</p>
                    <p className="mt-0.5">
                      SKU <span className="font-mono font-semibold">{duplicateProduct.sku}</span> already exists as “{duplicateProduct.name}”.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/app/catalog/${duplicateProduct.id}`)}
                    className="rounded-lg border border-[#D8C29D] bg-white px-3 py-1.5 font-medium text-[#26352F] hover:bg-[#F7F8F5]"
                  >
                    View existing product
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveExtracted('update')}
                    className="rounded-lg bg-[#344D3D] px-3 py-1.5 font-medium text-white hover:bg-[#293E31]"
                  >
                    Update existing product
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveExtracted('branch')}
                    className="rounded-lg border border-[#D8C29D] bg-white px-3 py-1.5 font-medium text-[#26352F] hover:bg-[#F7F8F5]"
                  >
                    Create separate product
                  </button>
                </div>
              </div>
            )}

            {/* Editable Extracted Form */}
            {extracted ? (
              <div className="space-y-3 text-xs pt-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#26352F]">Extracted Product Record (Editable)</span>
                  <StatusBadge label={extracted.confidence.name} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="font-medium text-[#26352F]">Product Title</label>
                      <span className="text-[10px] text-[#526D5B]">{extracted.confidence.name}</span>
                    </div>
                    <input
                      value={extracted.name}
                      onChange={(e) => setExtracted({ ...extracted, name: e.target.value })}
                      className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 focus:border-[#526D5B] focus:outline-none"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="font-medium text-[#26352F]">SKU</label>
                      <span className="text-[10px] text-[#8E6932]">{extracted.confidence.sku}</span>
                    </div>
                    <input
                      value={extracted.sku}
                      onChange={(e) => setExtracted({ ...extracted, sku: e.target.value })}
                      className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 font-mono focus:border-[#526D5B] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-[#26352F] mb-1">Material</label>
                    <input
                      value={extracted.attributes.material}
                      onChange={(e) =>
                        setExtracted({
                          ...extracted,
                          attributes: { ...extracted.attributes, material: e.target.value },
                        })
                      }
                      className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 focus:border-[#526D5B] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-[#26352F] mb-1">
                      Wholesale Cost ({selectedSupplier.currency})
                    </label>
                    <input
                      type="number"
                      value={extracted.supplierCost}
                      onChange={(e) =>
                        setExtracted({ ...extracted, supplierCost: Number(e.target.value) })
                      }
                      className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 tabular-nums focus:border-[#526D5B] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-[#26352F] mb-1">English Description</label>
                  <textarea
                    rows={2}
                    value={extracted.descriptionEn}
                    onChange={(e) => setExtracted({ ...extracted, descriptionEn: e.target.value })}
                    className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 focus:border-[#526D5B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#26352F] mb-1">Spanish Translation</label>
                  <textarea
                    rows={2}
                    value={extracted.descriptionEs}
                    onChange={(e) => setExtracted({ ...extracted, descriptionEs: e.target.value })}
                    className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 focus:border-[#526D5B] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleSaveExtracted('create')}
                    className="rounded-lg bg-[#344D3D] px-4 py-2 font-medium text-white hover:bg-[#293E31]"
                  >
                    Save & Stage for Approval →
                  </button>
                </div>
              </div>
            ) : !extracting ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E6EAE4] bg-[#F7F8F5] py-12 px-6 text-center">
                <Sparkles className="h-7 w-7 text-[#526D5B]" />
                <p className="mt-3 text-sm font-medium text-[#26352F]">Ready for Extraction</p>
                <p className="mt-1 max-w-xs text-xs text-[#78837C]">
                  Select a supplier, upload photos or a CSV/Excel sheet, and click “Process Submission” to simulate AI attribute extraction.
                </p>
              </div>
            ) : null}
          </div>
        </section>
      )}

      {/* Recent Intake Queue Table */}
      <section className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="font-display text-base font-semibold text-[#26352F]">
            Recent Intake Submissions
          </h2>
          <div className="flex flex-wrap gap-2 text-xs">
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="rounded-lg border border-[#E6EAE4] bg-[#F7F8F5] px-2.5 py-1.5"
            >
              <option value="All">All Suppliers</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="rounded-lg border border-[#E6EAE4] bg-[#F7F8F5] px-2.5 py-1.5"
            >
              <option value="All">All Channels</option>
              {['Messaging', 'Excel', 'CSV', 'File Upload', 'Supplier Portal'].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-[#E6EAE4] bg-[#F7F8F5] px-2.5 py-1.5"
            >
              <option value="All">All Statuses</option>
              {['Awaiting Extraction', 'Successfully Extracted', 'Needs Attention', 'Failed'].map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E6EAE4] text-[11px] text-[#78837C]">
                <th className="pb-2.5 pr-3">Reference</th>
                <th className="pb-2.5 px-3">Product / File</th>
                <th className="pb-2.5 px-3">Supplier</th>
                <th className="pb-2.5 px-3">Channel</th>
                <th className="pb-2.5 px-3">Confidence</th>
                <th className="pb-2.5 px-3">Status</th>
                <th className="pb-2.5 pl-3 text-right">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6EAE4]">
              {filteredSubmissions.map((sub) => {
                const sup = suppliers.find((s) => s.id === sub.supplierId);
                return (
                  <tr
                    key={sub.id}
                    onClick={() => {
                      if (sub.linkedProductId) navigate(`/app/catalog/${sub.linkedProductId}`);
                    }}
                    className={sub.linkedProductId ? 'cursor-pointer hover:bg-[#F7F8F5]' : ''}
                  >
                    <td className="py-3 pr-3 font-mono text-[11px] font-medium text-[#26352F]">
                      {sub.reference}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-[#26352F]">{sub.productName} ({sub.sku})</p>
                      <p className="text-[11px] text-[#78837C]">
                        {sub.errorMessage ? (
                          <span className="text-[#9F514B]">{sub.errorMessage}</span>
                        ) : (
                          sub.fileName
                        )}
                      </p>
                    </td>
                    <td className="py-3 px-3 text-[#26352F]">{sup?.name ?? 'Supplier'}</td>
                    <td className="py-3 px-3 text-[#78837C]">{sub.method}</td>
                    <td className="py-3 px-3">
                      <StatusBadge label={sub.confidence} />
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge label={sub.status} />
                    </td>
                    <td className="py-3 pl-3 text-right tabular-nums text-[#78837C]">
                      {sub.submittedAt}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

