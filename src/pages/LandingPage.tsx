import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Database,
  DollarSign,
  FileSpreadsheet,
  FileText,
  Globe,
  Layers,
  Menu,
  MessageSquare,
  Package,
  ShieldCheck,
  Sparkles,
  Store,
  Upload,
  X,
} from 'lucide-react';
import { SupplyFlowLogo } from '../components/common/SupplyFlowLogo';
import { BeforeAfterSlider } from '../components/animations/BeforeAfterSlider';
import { ScrollReveal } from '../components/animations/ScrollReveal';
import { Modal } from '../components/common/Modal';
import { useSupplyFlow } from '../context/SupplyFlowContext';

const HERO_PANELS = [
  {
    id: 'upload',
    step: '01',
    title: 'Supplier Upload',
    status: 'Received',
    badgeColor: 'bg-[#EEF3F6] text-[#4C6878]',
    summary: 'Milano Fashion submitted Classic Linen Shirt (MF-204) via Messaging packet.',
    meta: '3 photos • 1 showroom clip • €25.00 EUR',
  },
  {
    id: 'ai',
    step: '02',
    title: 'AI Processing',
    status: 'Extracted',
    badgeColor: 'bg-[#E9F0E9] text-[#344D3D]',
    summary: 'Attributes structured: 100% European Flax Linen, 165 GSM, EN + ES copy generated.',
    meta: 'Studio crop & macro detail prepared',
  },
  {
    id: 'pricing',
    step: '03',
    title: 'Pricing Engine',
    status: 'Calculated',
    badgeColor: 'bg-[#E9F0E9] text-[#344D3D]',
    summary: '€25.00 → $27.00 FX + $4.00 freight + $3.00 duty = $34.00 landed → $56.67 retail.',
    meta: '40.0% target gross margin preserved',
  },
  {
    id: 'inventory',
    step: '04',
    title: 'Inventory Matrix',
    status: 'Organized',
    badgeColor: 'bg-[#FAF3E6] text-[#8E6932]',
    summary: '12 variants mapped across White, Beige, Black (S–XL). Beige XL flagged (0 units).',
    meta: '123 available units • 1 low-stock alert',
  },
  {
    id: 'approval',
    step: '05',
    title: 'Owner Approval',
    status: 'Ready for Jack',
    badgeColor: 'bg-[#E9F0E9] text-[#344D3D]',
    summary: 'Staged in Approval Center. Nothing reaches Shopify without Jack’s final sign-off.',
    meta: '100% manual review control',
  },
];

const WORKFLOW_STAGES = [
  {
    num: '01',
    title: 'Supplier Submission',
    short: 'Collect from any supplier format',
    detail: 'Suppliers send products through messaging packets, Excel line sheets, CSV files, direct uploads, or structured portal forms.',
    input: 'WhatsApp/chat photos, XLSX/CSV rows',
    output: 'Unified intake packet ID',
    route: '/app/intake',
  },
  {
    num: '02',
    title: 'Data Extraction',
    short: 'Normalize SKUs, colors & costs',
    detail: 'Automated extraction parses wholesale cost, currency, materials, sizes, and checks for duplicate SKUs against existing records.',
    input: 'Unstructured text & line sheets',
    output: 'Structured attributes + confidence scores',
    route: '/app/intake',
  },
  {
    num: '03',
    title: 'AI Product Preparation',
    short: 'Studio imagery & bilingual copy',
    detail: 'Original supplier photos are prepared into warm-ivory catalog assets while generating English and Spanish product descriptions.',
    input: 'Supplier photo + extracted specs',
    output: 'Studio gallery + EN/ES catalog copy',
    route: '/app/ai-studio',
  },
  {
    num: '04',
    title: 'Pricing & Inventory',
    short: 'Landed cost margin & variant grid',
    detail: 'Applies FX conversion, freight, duty, and gross margin formulas while mapping color × size stock matrices and reorder thresholds.',
    input: 'Wholesale cost + stock counts',
    output: 'Recommended retail price + variant alerts',
    route: '/app/pricing',
  },
  {
    num: '05',
    title: 'Owner Approval',
    short: 'Full review before publishing',
    detail: 'Every product waits in Jack’s Approval Center for editing, change requests, rejection, or one-click approval.',
    input: 'Enriched product candidate',
    output: 'Approved or Needs Changes decision',
    route: '/app/approvals',
  },
  {
    num: '06',
    title: 'Shopify Ready',
    short: 'Verified payload for storefront',
    detail: 'Approved titles, bilingual copy, studio imagery, variants, prices, and inventory levels stage cleanly for planned Shopify sync.',
    input: 'Owner-approved catalog record',
    output: 'Storefront synchronization preview',
    route: '/app/integrations',
  },
];

const SHOWCASE_CATEGORIES = [
  {
    id: 'apparel',
    label: 'Apparel',
    productName: 'Tailored Cotton Shorts • UB-230',
    supplier: 'Urban Basics (Portugal)',
    beforeSrc: '/images/products/cotton-shorts-original.jpg',
    afterSrc: '/images/products/cotton-shorts-studio.jpg',
    beforeDesc: 'Original supplier stockroom lighting with uneven warm cast',
    afterDesc: 'Prepared warm-ivory catalog plate preserving twill weave & horn button',
  },
  {
    id: 'shoes',
    label: 'Shoes',
    productName: 'Artisan Suede Loafers • PF-125',
    supplier: 'Porto Footwear Guild (Portugal)',
    beforeSrc: '/images/products/suede-loafers-original.jpg',
    afterSrc: '/images/products/suede-loafers-studio.jpg',
    beforeDesc: 'Unedited workshop snapshot under ambient indoor light',
    afterDesc: 'Prepared Scandinavian studio presentation preserving nap & hand stitching',
  },
  {
    id: 'accessories',
    label: 'Accessories',
    productName: 'Minimal Leather Tote • NA-402',
    supplier: 'Nordic Accessories (Sweden)',
    beforeSrc: '/images/products/leather-tote-original.jpg',
    afterSrc: '/images/products/leather-tote-clean.jpg',
    beforeDesc: 'Warehouse shelf photo with dim ambient exposure',
    afterDesc: 'Prepared warm-ivory studio catalog shot preserving full-grain texture',
  },
];

const ECOSYSTEM_CHANNELS = [
  {
    id: 'messaging',
    label: 'Messaging Submissions',
    icon: MessageSquare,
    headline: 'Turn casual supplier chat photos & voice specs into structured drafts.',
    previewTitle: 'Milano Fashion • Chat Intake',
    lines: [
      'Supplier: "New linen batch MF-204 — €25 EUR wholesale, White/Beige/Black, S–XL."',
      'SUPPLYFLOW: "Submission received. 12 variants & 3 photos staged for review."',
    ],
  },
  {
    id: 'excel',
    label: 'Excel Spreadsheets',
    icon: FileSpreadsheet,
    headline: 'Ingest multi-tab supplier line sheets without manual copy-paste.',
    previewTitle: 'BCN_Resort_Collection_2026.xlsx',
    lines: [
      'Row 14 • BA-118 • Women’s Summer Dress • €32.00 • XS–L (74 units)',
      'Mapped automatically: Currency (EUR) → Freight (€3.50) → Duty (€2.50)',
    ],
  },
  {
    id: 'csv',
    label: 'CSV Uploads',
    icon: FileText,
    headline: 'Validate seasonal stock feeds and detect supplier cost deltas.',
    previewTitle: 'istanbul_fleece_nov.csv',
    lines: [
      'Parsed 3 SKUs in TRY • Confidence: High (2) / Needs Review (1)',
      'Auto-detected +13.0% wholesale price increase on IT-308',
    ],
  },
  {
    id: 'manual',
    label: 'Manual File Uploads',
    icon: Upload,
    headline: 'Drop product lookbooks, photos, and showroom clips in one place.',
    previewTitle: 'Direct Asset Dropzone',
    lines: [
      'Supports JPG, PNG, CSV, XLSX, and MP4 product reference clips',
      'Instant validation alerts for unsupported files or missing prices',
    ],
  },
  {
    id: 'portal',
    label: 'Supplier Portal',
    icon: Globe,
    headline: 'Give repeat suppliers one consistent product submission form.',
    previewTitle: 'Urban Basics • Portugal Portal',
    lines: [
      'Pre-filled supplier currency (EUR), freight (€3.50), and categories',
      'Enforces required SKU, size grid, and wholesale cost before submit',
    ],
  },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { pushToast, metrics } = useSupplyFlow();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeHeroIdx, setActiveHeroIdx] = useState(0);
  const [activeWorkflowIdx, setActiveWorkflowIdx] = useState(0);
  const [activeShowcaseId, setActiveShowcaseId] = useState('apparel');
  const [activeChannelId, setActiveChannelId] = useState('messaging');

  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', company: '', message: '' });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const activeShowcase =
    SHOWCASE_CATEGORIES.find((c) => c.id === activeShowcaseId) ?? SHOWCASE_CATEGORIES[0];
  const activeChannel =
    ECOSYSTEM_CHANNELS.find((c) => c.id === activeChannelId) ?? ECOSYSTEM_CHANNELS[0];
  const activeWorkflow = WORKFLOW_STAGES[activeWorkflowIdx];
  const activeHeroPanel = HERO_PANELS[activeHeroIdx];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    pushToast({
      title: 'Demo inquiry recorded locally',
      description: 'No external message was sent in this frontend-only prototype.',
      variant: 'success',
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-[#26352F]">
      {/* Sticky Floating Navigation */}
      <header
        className={`sticky top-0 z-40 transition-all duration-200 ${
          scrolled
            ? 'border-b border-[#E6EAE4] bg-[#F7F8F5]/95 backdrop-blur-sm shadow-sf-xs'
            : 'border-b border-transparent bg-[#F7F8F5]'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="SUPPLYFLOW Home">
            <SupplyFlowLogo />
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium text-[#78837C]">
            <a href="#platform" className="hover:text-[#26352F] transition-colors">
              Platform
            </a>
            <a href="#capabilities" className="hover:text-[#26352F] transition-colors">
              Capabilities
            </a>
            <a href="#workflow" className="hover:text-[#26352F] transition-colors">
              Workflow
            </a>
            <a href="#integrations" className="hover:text-[#26352F] transition-colors">
              Integrations
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSignInModalOpen(true)}
              className="rounded-lg px-3.5 py-2 text-[13px] font-medium text-[#26352F] hover:bg-[#F0F2ED] transition-colors"
            >
              Sign in
            </button>
            <Link
              to="/app"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#344D3D] px-4 py-2 text-[13px] font-medium text-white shadow-sf-xs hover:bg-[#293E31] transition-colors"
            >
              Open Workspace
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden rounded-lg p-2 text-[#26352F] hover:bg-[#F0F2ED]"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E6EAE4] bg-white px-4 py-4 space-y-3">
            <div className="flex flex-col gap-2 text-sm font-medium text-[#26352F]">
              <a href="#platform" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-[#F0F2ED]">
                Platform
              </a>
              <a href="#capabilities" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-[#F0F2ED]">
                Capabilities
              </a>
              <a href="#workflow" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-[#F0F2ED]">
                Workflow
              </a>
              <a href="#integrations" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-[#F0F2ED]">
                Integrations
              </a>
            </div>
            <div className="flex flex-col gap-2 pt-2 border-t border-[#E6EAE4]">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSignInModalOpen(true);
                }}
                className="w-full rounded-lg border border-[#E6EAE4] px-4 py-2.5 text-sm font-medium text-[#26352F]"
              >
                Sign in
              </button>
              <Link
                to="/app"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center rounded-lg bg-[#344D3D] px-4 py-2.5 text-sm font-medium text-white"
              >
                Open Workspace
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="platform" className="relative overflow-hidden border-b border-[#E6EAE4] bg-[#F7F8F5]">
        {/* Subtle Editorial Studio Background Composition (desktop only, lightweight CSS transform) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden opacity-35 hidden lg:block"
        >
          <div className="sf-animate-drift absolute -right-12 top-10 grid grid-cols-2 gap-4 w-[520px] rotate-[-3deg] opacity-30">
            <img
              src="/images/products/linen-shirt-studio.jpg"
              alt=""
              className="h-44 w-full rounded-2xl object-cover border border-[#E6EAE4]"
            />
            <img
              src="/images/products/cotton-shorts-studio.jpg"
              alt=""
              className="h-44 w-full rounded-2xl object-cover border border-[#E6EAE4] translate-y-6"
            />
            <img
              src="/images/products/suede-loafers-studio.jpg"
              alt=""
              className="h-44 w-full rounded-2xl object-cover border border-[#E6EAE4]"
            />
            <img
              src="/images/products/leather-tote-clean.jpg"
              alt=""
              className="h-44 w-full rounded-2xl object-cover border border-[#E6EAE4] translate-y-6"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#F7F8F5] via-[#F7F8F5]/95 to-[#F7F8F5]/80" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Left Copy */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D8E2D8] bg-[#E9F0E9] px-3 py-1 text-xs font-medium text-[#344D3D]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#526D5B]" />
                <span>Supplier, Catalog & Inventory Automation</span>
              </div>

              <h1 className="font-display text-3xl font-semibold tracking-tight text-[#26352F] sm:text-5xl lg:text-[52px] lg:leading-[1.08]">
                From supplier chaos to complete product control.
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-[#78837C] sm:text-[17px]">
                One intelligent workspace to collect supplier products, prepare professional catalogs, automate pricing, and manage inventory without jumping between disconnected tools.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <Link
                  to="/app"
                  className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#344D3D] px-6 py-3 text-sm font-medium text-white shadow-sf-sm hover:bg-[#293E31] transition-colors"
                >
                  Explore the Platform
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#workflow"
                  className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[#E6EAE4] bg-white px-6 py-3 text-sm font-medium text-[#26352F] hover:bg-[#F0F2ED] transition-colors"
                >
                  See How It Works
                </a>
              </div>

              <p className="text-xs font-medium text-[#78837C] pt-1">
                One centralized workflow. Multiple suppliers. Complete control.
              </p>
            </div>

            {/* Right Interactive Miniature Dashboard Composition */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-[#E6EAE4] bg-white p-4 sm:p-5 shadow-sf-lg">
                {/* Mini Workspace Header */}
                <div className="flex items-center justify-between border-b border-[#E6EAE4] pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E9F0E9] text-[#344D3D]">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#26352F]">Live Pipeline Preview • SKU MF-204</p>
                      <p className="text-[11px] text-[#78837C]">Click any stage below to inspect the flow</p>
                    </div>
                  </div>
                  <Link
                    to="/app/catalog/prod-01"
                    className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 text-[11px] font-medium text-[#526D5B] hover:text-[#344D3D]"
                  >
                    Open Record
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* 5 Connected Stage Selector Pills */}
                <div className="mt-4 grid grid-cols-5 gap-1.5">
                  {HERO_PANELS.map((panel, idx) => {
                    const selected = idx === activeHeroIdx;
                    return (
                      <button
                        key={panel.id}
                        type="button"
                        onClick={() => setActiveHeroIdx(idx)}
                        className={`rounded-lg border px-2 py-2 text-left transition-all ${
                          selected
                            ? 'border-[#526D5B] bg-[#E9F0E9]/70 shadow-sf-xs'
                            : 'border-[#E6EAE4] bg-[#F7F8F5] hover:bg-[#F0F2ED]'
                        }`}
                      >
                        <span className="block text-[10px] font-semibold text-[#78837C]">
                          {panel.step}
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] font-medium text-[#26352F]">
                          {panel.title.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Active Stage Detailed Mini-Panel + Product Snapshot */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-4 rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] p-3.5">
                  <div className="sm:col-span-4">
                    <div className="aspect-square overflow-hidden rounded-lg border border-[#E6EAE4] bg-[#F3EFE7]">
                      <img
                        src={
                          activeHeroIdx === 0
                            ? '/images/products/linen-shirt-original.jpg'
                            : activeHeroIdx === 1
                            ? '/images/products/linen-shirt-detail.jpg'
                            : '/images/products/linen-shirt-studio.jpg'
                        }
                        alt="Classic Linen Shirt preview"
                        className="h-full w-full object-cover transition-transform duration-300"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[#26352F]">
                          Panel {activeHeroPanel.step}: {activeHeroPanel.title}
                        </span>
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${activeHeroPanel.badgeColor}`}>
                          {activeHeroPanel.status}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-[#26352F]">
                        {activeHeroPanel.summary}
                      </p>
                      <p className="mt-2 text-[11px] text-[#78837C]">{activeHeroPanel.meta}</p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#E6EAE4] flex items-center justify-between text-[11px]">
                      <span className="text-[#78837C] tabular-nums">
                        Classic Linen Shirt • $56.67 Retail
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveHeroIdx((prev) => (prev + 1) % HERO_PANELS.length)}
                        className="font-medium text-[#344D3D] hover:underline"
                      >
                        Next stage →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mini 5-stage progress strip */}
                <div className="mt-3.5 flex items-center justify-between text-[11px] text-[#78837C]">
                  <span>Milano Fashion → SUPPLYFLOW → Jack’s Approval</span>
                  <span className="font-medium text-[#526D5B] tabular-nums">
                    {activeHeroIdx + 1} / 5 Stages
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Metrics Strip */}
      <section className="border-b border-[#E6EAE4] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#78837C]">
              Demonstration Workspace Figures
            </p>
            <p className="text-xs text-[#9AA39C]">
              Seeded interactive prototype metrics (updates dynamically as you test)
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] p-4">
              <p className="font-display text-2xl font-semibold text-[#26352F] tabular-nums">
                {metrics.totalProducts}
              </p>
              <p className="mt-1 text-xs font-medium text-[#26352F]">Products processed</p>
              <p className="text-[11px] text-[#78837C]">Multiple supplier channels</p>
            </div>
            <div className="rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] p-4">
              <p className="font-display text-2xl font-semibold text-[#26352F] tabular-nums">
                {metrics.activeSuppliers}
              </p>
              <p className="mt-1 text-xs font-medium text-[#26352F]">Supplier sources</p>
              <p className="text-[11px] text-[#78837C]">Unified intake rules</p>
            </div>
            <div className="rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] p-4">
              <p className="font-display text-2xl font-semibold text-[#26352F] tabular-nums">2</p>
              <p className="mt-1 text-xs font-medium text-[#26352F]">Supported languages</p>
              <p className="text-[11px] text-[#78837C]">Bilingual EN & ES catalog copy</p>
            </div>
            <div className="rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] p-4">
              <p className="font-display text-2xl font-semibold text-[#344D3D] tabular-nums">100%</p>
              <p className="mt-1 text-xs font-medium text-[#26352F]">Approval control</p>
              <p className="text-[11px] text-[#78837C]">Manual owner sign-off enforced</p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Capabilities (6 cards with visual mini-previews) */}
      <section id="capabilities" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <ScrollReveal>
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#526D5B]">
              Core Capabilities
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-[#26352F] sm:text-3xl">
              Six connected operations modules designed around one catalog truth.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#78837C]">
              Click any capability preview to launch that module directly inside the interactive workspace.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              title: 'Supplier Intelligence',
              desc: 'Centralize Italian, Spanish, Portuguese, Turkish, and Asian suppliers with currency and freight rules.',
              route: '/app/suppliers',
              icon: Building2,
              preview: (
                <div className="mt-4 rounded-lg border border-[#E6EAE4] bg-[#F7F8F5] p-3 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#26352F]">Milano Fashion</span>
                    <span className="rounded bg-[#E9F0E9] px-1.5 py-0.5 text-[#344D3D]">EUR • Connected</span>
                  </div>
                  <div className="flex items-center justify-between text-[#78837C]">
                    <span>Barcelona Apparel</span>
                    <span>Excel Sheet • EUR</span>
                  </div>
                </div>
              ),
            },
            {
              title: 'AI Product Photography',
              desc: 'Transform casual supplier photos into consistent warm-ivory catalog visuals without altering the product.',
              route: '/app/ai-studio',
              icon: Camera,
              preview: (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="overflow-hidden rounded-lg border border-[#E6EAE4] bg-[#F3EFE7] aspect-[4/3]">
                    <img src="/images/products/suede-loafers-original.jpg" alt="Original supplier shot" className="h-full w-full object-cover" />
                  </div>
                  <div className="overflow-hidden rounded-lg border border-[#526D5B]/40 bg-[#F3EFE7] aspect-[4/3]">
                    <img src="/images/products/suede-loafers-studio.jpg" alt="Prepared catalog shot" className="h-full w-full object-cover" />
                  </div>
                </div>
              ),
            },
            {
              title: 'Intelligent Catalog Generation',
              desc: 'Extract fabric, fit, and care attributes alongside synchronized English and Spanish storefront copy.',
              route: '/app/catalog',
              icon: Sparkles,
              preview: (
                <div className="mt-4 rounded-lg border border-[#E6EAE4] bg-[#F7F8F5] p-3 text-[11px] space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-white border border-[#E6EAE4] px-1.5 py-0.5 font-medium text-[#26352F]">EN</span>
                    <span className="truncate text-[#78837C]">100% European flax linen, 165 GSM...</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-white border border-[#E6EAE4] px-1.5 py-0.5 font-medium text-[#26352F]">ES</span>
                    <span className="truncate text-[#78837C]">Confeccionada en lino europeo...</span>
                  </div>
                </div>
              ),
            },
            {
              title: 'Automated Pricing',
              desc: 'Convert supplier currencies, factor freight and duty, and price transparently off true gross margin.',
              route: '/app/pricing',
              icon: DollarSign,
              preview: (
                <div className="mt-4 rounded-lg border border-[#E6EAE4] bg-[#F7F8F5] p-3 text-[11px] tabular-nums">
                  <div className="flex justify-between text-[#78837C]">
                    <span>Landed Cost (FX + Duty)</span>
                    <span>$34.00</span>
                  </div>
                  <div className="mt-1 flex justify-between font-semibold text-[#26352F]">
                    <span>Selling Price (40% Margin)</span>
                    <span className="text-[#344D3D]">$56.67</span>
                  </div>
                </div>
              ),
            },
            {
              title: 'Inventory Intelligence',
              desc: 'Manage stock across color × size matrices, flag reorder alerts, and track supplier freshness.',
              route: '/app/inventory',
              icon: Package,
              preview: (
                <div className="mt-4 rounded-lg border border-[#E6EAE4] bg-[#F7F8F5] p-3 text-[11px] tabular-nums">
                  <div className="grid grid-cols-4 gap-1 text-center">
                    <div className="rounded bg-white py-1 border border-[#E6EAE4]">S: 12</div>
                    <div className="rounded bg-white py-1 border border-[#E6EAE4]">M: 18</div>
                    <div className="rounded bg-[#FAF3E6] py-1 border border-[#E8D5B5] text-[#8E6932]">XL: 4</div>
                    <div className="rounded bg-[#FBF0EF] py-1 border border-[#EBCAC7] text-[#9F514B]">XL: 0</div>
                  </div>
                </div>
              ),
            },
            {
              title: 'Approval & Shopify Readiness',
              desc: 'Review every image, translation, and margin inside Approval Center before staging for Shopify sync.',
              route: '/app/approvals',
              icon: ShieldCheck,
              preview: (
                <div className="mt-4 rounded-lg border border-[#E6EAE4] bg-[#F7F8F5] p-3 flex items-center justify-between text-[11px]">
                  <span className="font-medium text-[#26352F]">Owner Gate Active</span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#E9F0E9] px-2 py-0.5 font-medium text-[#344D3D]">
                    <CheckCircle2 className="h-3 w-3" />
                    {metrics.shopifyReadyCount} Shopify Ready
                  </span>
                </div>
              ),
            },
          ].map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <ScrollReveal key={cap.title} delayMs={idx * 45}>
                <button
                  type="button"
                  onClick={() => navigate(cap.route)}
                  className="group h-full w-full text-left flex flex-col justify-between rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs hover:border-[#526D5B]/60 hover:shadow-sf-md transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E9F0E9] text-[#344D3D]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-[#9AA39C] group-hover:text-[#344D3D] group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <h3 className="mt-4 font-display text-base font-semibold text-[#26352F]">
                      {cap.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#78837C]">{cap.desc}</p>
                  </div>
                  {cap.preview}
                </button>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* Connected Workflow Section */}
      <section id="workflow" className="border-y border-[#E6EAE4] bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#526D5B]">
                End-to-End Architecture
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[#26352F] sm:text-3xl">
                One connected workflow. From supplier upload to store-ready product.
              </h2>
            </div>
          </ScrollReveal>

          {/* Desktop Horizontal Connected Steps / Mobile Vertical Timeline */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-6 gap-3">
            {WORKFLOW_STAGES.map((stage, idx) => {
              const active = idx === activeWorkflowIdx;
              return (
                <button
                  key={stage.num}
                  type="button"
                  onMouseEnter={() => setActiveWorkflowIdx(idx)}
                  onClick={() => setActiveWorkflowIdx(idx)}
                  className={`relative text-left rounded-xl border p-4 transition-all ${
                    active
                      ? 'border-[#526D5B] bg-[#E9F0E9]/60 shadow-sf-sm'
                      : 'border-[#E6EAE4] bg-[#F7F8F5] hover:bg-[#F0F2ED]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#526D5B] tabular-nums">
                      {stage.num}
                    </span>
                    {idx < WORKFLOW_STAGES.length - 1 && (
                      <ChevronRight className="hidden lg:block h-3.5 w-3.5 text-[#9AA39C]" />
                    )}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-[#26352F]">{stage.title}</p>
                  <p className="mt-1 text-xs text-[#78837C]">{stage.short}</p>
                </button>
              );
            })}
          </div>

          {/* Active Stage Inspector Card */}
          <div className="mt-6 rounded-2xl border border-[#E6EAE4] bg-[#F7F8F5] p-5 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#344D3D]">
                  <span>Stage {activeWorkflow.num}</span>
                  <span>•</span>
                  <span>{activeWorkflow.title}</span>
                </div>
                <p className="text-sm leading-relaxed text-[#26352F]">{activeWorkflow.detail}</p>
                <div className="flex flex-wrap gap-4 pt-1 text-xs text-[#78837C]">
                  <span>
                    <strong className="font-medium text-[#26352F]">Input:</strong> {activeWorkflow.input}
                  </span>
                  <span>
                    <strong className="font-medium text-[#26352F]">Output:</strong> {activeWorkflow.output}
                  </span>
                </div>
              </div>
              <Link
                to={activeWorkflow.route}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#344D3D] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#293E31] transition-colors"
              >
                Try Stage {activeWorkflow.num} in Workspace
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Product Photography Showcase (Interactive Before/After Slider) */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#526D5B]">
              Product Photography Studio
            </p>
            <h2 className="font-display text-2xl font-semibold text-[#26352F] sm:text-3xl">
              From casual supplier snapshots to consistent catalog photography.
            </h2>
            <p className="text-sm leading-relaxed text-[#78837C]">
              Drag the slider across any category to compare raw supplier submission photos with prepared studio catalog visuals—preserving exact fabric texture, color, stitching, and product silhouette.
            </p>

            {/* Category Switcher */}
            <div className="flex flex-wrap gap-2 pt-1">
              {SHOWCASE_CATEGORIES.map((cat) => {
                const active = cat.id === activeShowcaseId;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveShowcaseId(cat.id)}
                    className={`rounded-lg px-4 py-2 text-xs font-medium border transition-colors ${
                      active
                        ? 'border-[#344D3D] bg-[#344D3D] text-white'
                        : 'border-[#E6EAE4] bg-white text-[#26352F] hover:bg-[#F0F2ED]'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            <div className="rounded-xl border border-[#E6EAE4] bg-white p-4 space-y-2">
              <p className="text-xs font-semibold text-[#26352F]">{activeShowcase.productName}</p>
              <p className="text-[11px] text-[#78837C]">Supplier: {activeShowcase.supplier}</p>
              <div className="pt-2 border-t border-[#E6EAE4] space-y-1 text-xs">
                <p className="text-[#78837C]">
                  <span className="font-medium text-[#26352F]">Original:</span> {activeShowcase.beforeDesc}
                </p>
                <p className="text-[#344D3D]">
                  <span className="font-medium">Prepared:</span> {activeShowcase.afterDesc}
                </p>
              </div>
            </div>

            <Link
              to="/app/ai-studio"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#344D3D] hover:underline"
            >
              Open AI Product Studio
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="lg:col-span-7">
            <div className="mx-auto max-w-lg">
              <BeforeAfterSlider
                beforeSrc={activeShowcase.beforeSrc}
                afterSrc={activeShowcase.afterSrc}
                alt={activeShowcase.productName}
                beforeLabel="Original Supplier"
                afterLabel="Prepared Studio"
              />
              <p className="mt-2.5 text-center text-[11px] text-[#78837C]">
                Drag or use arrow keys to compare original vs. prepared studio image
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supplier Ecosystem Section */}
      <section id="integrations" className="border-t border-[#E6EAE4] bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#526D5B]">
              Supplier Ecosystem
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-[#26352F] sm:text-3xl">
              Every supplier submission channel unified in one intake pipeline.
            </h2>
            <p className="mt-2.5 text-sm text-[#78837C]">
              Select an input source to inspect how SUPPLYFLOW captures and normalizes supplier information.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 space-y-2.5">
              {ECOSYSTEM_CHANNELS.map((ch) => {
                const Icon = ch.icon;
                const active = ch.id === activeChannelId;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setActiveChannelId(ch.id)}
                    className={`w-full flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-all ${
                      active
                        ? 'border-[#526D5B] bg-[#E9F0E9]/60 shadow-sf-xs'
                        : 'border-[#E6EAE4] bg-[#F7F8F5] hover:bg-[#F0F2ED]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-[#E6EAE4] text-[#344D3D]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-[#26352F]">{ch.label}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#78837C]" />
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-7 rounded-2xl border border-[#E6EAE4] bg-[#F7F8F5] p-6">
              <div className="flex items-center justify-between border-b border-[#E6EAE4] pb-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#526D5B]">
                    Connected Channel Preview
                  </span>
                  <h3 className="mt-1 font-display text-lg font-semibold text-[#26352F]">
                    {activeChannel.previewTitle}
                  </h3>
                </div>
                <span className="rounded-md bg-[#E9F0E9] px-2.5 py-1 text-[11px] font-medium text-[#344D3D]">
                  Demo Simulation
                </span>
              </div>
              <p className="mt-4 text-sm text-[#26352F]">{activeChannel.headline}</p>
              <div className="mt-4 space-y-2.5">
                {activeChannel.lines.map((line, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 rounded-xl border border-[#E6EAE4] bg-white px-4 py-3 text-xs text-[#26352F]"
                  >
                    <Check className="h-4 w-4 shrink-0 text-[#526D5B] mt-0.5" />
                    <span>{line}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between pt-3 border-t border-[#E6EAE4]">
                <span className="text-xs text-[#78837C]">Feeds directly into Central Product Intake</span>
                <Link
                  to="/app/intake"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#344D3D] px-4 py-2 text-xs font-medium text-white hover:bg-[#293E31]"
                >
                  Open Product Intake
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-[#E6EAE4] bg-[#F3EFE7] py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="font-display text-2xl font-semibold text-[#26352F] sm:text-4xl">
            Your entire product operation. Finally in one place.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#78837C] sm:text-base">
            From the first supplier upload to the final product approval, see how one connected system can simplify your entire workflow.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/app"
              className="inline-flex items-center gap-2 rounded-[10px] bg-[#344D3D] px-7 py-3.5 text-sm font-medium text-white shadow-sf-sm hover:bg-[#293E31] transition-colors"
            >
              Explore Your Workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/app/help"
              className="inline-flex items-center gap-2 rounded-[10px] border border-[#D8D3C8] bg-white px-6 py-3.5 text-sm font-medium text-[#26352F] hover:bg-[#F7F8F5] transition-colors"
            >
              View Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* Structured Footer */}
      <footer className="border-t border-[#E6EAE4] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            <div className="md:col-span-5 space-y-3">
              <SupplyFlowLogo />
              <p className="max-w-xs text-xs leading-relaxed text-[#78837C]">
                Designed to bring every part of product operations together.
              </p>
              <p className="text-[11px] text-[#9AA39C]">
                Interactive frontend demonstration built for Jack.
              </p>
            </div>

            <div className="md:col-span-2 space-y-2.5 text-xs">
              <p className="font-semibold text-[#26352F]">Platform</p>
              <ul className="space-y-2 text-[#78837C]">
                <li><Link to="/app" className="hover:text-[#26352F]">Overview</Link></li>
                <li><Link to="/app/suppliers" className="hover:text-[#26352F]">Suppliers</Link></li>
                <li><Link to="/app/catalog" className="hover:text-[#26352F]">Product Catalog</Link></li>
                <li><Link to="/app/pricing" className="hover:text-[#26352F]">Pricing Engine</Link></li>
              </ul>
            </div>

            <div className="md:col-span-2 space-y-2.5 text-xs">
              <p className="font-semibold text-[#26352F]">Workflow</p>
              <ul className="space-y-2 text-[#78837C]">
                <li><Link to="/app/intake" className="hover:text-[#26352F]">Product Intake</Link></li>
                <li><Link to="/app/ai-studio" className="hover:text-[#26352F]">AI Studio</Link></li>
                <li><Link to="/app/approvals" className="hover:text-[#26352F]">Approval Center</Link></li>
                <li><Link to="/app/automations" className="hover:text-[#26352F]">Automation Center</Link></li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-2.5 text-xs">
              <p className="font-semibold text-[#26352F]">Resources</p>
              <ul className="space-y-2 text-[#78837C]">
                <li><Link to="/app/help" className="hover:text-[#26352F]">Documentation & Training</Link></li>
                <li>
                  <button type="button" onClick={() => setContactModalOpen(true)} className="hover:text-[#26352F]">
                    Contact Us
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setLegalModal('privacy')} className="hover:text-[#26352F]">
                    Privacy
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setLegalModal('terms')} className="hover:text-[#26352F]">
                    Terms
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-[#E6EAE4] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#9AA39C]">
            <span>© 2026 SUPPLYFLOW Interactive Prototype</span>
            <span>Frontend-only demonstration • Local browser state persistence</span>
          </div>
        </div>
      </footer>

      {/* Sign In Demo Modal */}
      <Modal
        open={signInModalOpen}
        onClose={() => setSignInModalOpen(false)}
        title="Enter SUPPLYFLOW Workspace"
        subtitle="Frontend prototype workspace pre-configured for Jack"
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#344D3D] text-sm font-semibold text-white">
              JK
            </div>
            <div>
              <p className="text-sm font-semibold text-[#26352F]">Jack • Operations Owner</p>
              <p className="text-xs text-[#78837C]">Demo Session • No external authentication active</p>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-[#78837C]">
            Because this is a frontend-only demonstration, you can enter Jack’s full workspace immediately without creating an account. All edits save locally in your browser.
          </p>
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setSignInModalOpen(false)}
              className="rounded-lg border border-[#E6EAE4] px-4 py-2 text-xs font-medium text-[#26352F] hover:bg-[#F0F2ED]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setSignInModalOpen(false);
                navigate('/app');
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#344D3D] px-4 py-2 text-xs font-medium text-white hover:bg-[#293E31]"
            >
              Continue as Jack
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </Modal>

      {/* Demo Contact Modal */}
      <Modal
        open={contactModalOpen}
        onClose={() => {
          setContactModalOpen(false);
          setContactSubmitted(false);
        }}
        title="Contact SUPPLYFLOW Team"
        subtitle="Demo inquiry panel — no external messages are transmitted"
      >
        {contactSubmitted ? (
          <div className="py-4 text-center space-y-3">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#E9F0E9] text-[#344D3D]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h4 className="font-display text-base font-semibold text-[#26352F]">
              Demo inquiry captured
            </h4>
            <p className="text-xs text-[#78837C]">
              Thank you. In the proposed production workspace, inquiries route to your dedicated onboarding coordinator.
            </p>
            <button
              type="button"
              onClick={() => {
                setContactModalOpen(false);
                setContactSubmitted(false);
              }}
              className="rounded-lg bg-[#344D3D] px-4 py-2 text-xs font-medium text-white"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleContactSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-[#26352F] mb-1">Your Name</label>
              <input
                required
                value={contactForm.name}
                onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Jack"
                className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 text-xs focus:border-[#526D5B] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#26352F] mb-1">Workspace / Store</label>
              <input
                value={contactForm.company}
                onChange={(e) => setContactForm((f) => ({ ...f, company: e.target.value }))}
                placeholder="Catalog Operations"
                className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 text-xs focus:border-[#526D5B] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#26352F] mb-1">How can we help?</label>
              <textarea
                required
                rows={3}
                value={contactForm.message}
                onChange={(e) => setContactForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Questions about supplier onboarding, n8n workflow architecture, or Shopify integration..."
                className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 text-xs focus:border-[#526D5B] focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setContactModalOpen(false)}
                className="rounded-lg border border-[#E6EAE4] px-4 py-2 text-xs font-medium text-[#26352F]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#344D3D] px-4 py-2 text-xs font-medium text-white hover:bg-[#293E31]"
              >
                Send Demo Message
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Privacy & Terms Demo Modal */}
      <Modal
        open={legalModal !== null}
        onClose={() => setLegalModal(null)}
        title={legalModal === 'privacy' ? 'Demonstration Privacy Notice' : 'Prototype Terms Overview'}
      >
        <div className="space-y-3 text-xs leading-relaxed text-[#78837C]">
          <p>
            This SUPPLYFLOW application is an interactive frontend-only product demonstration. All product catalogs, supplier profiles, uploaded test files, and settings remain strictly inside your local browser memory and <code className="rounded bg-[#F0F2ED] px-1">localStorage</code>.
          </p>
          <p>
            No external APIs, cloud databases, AI generation servers, or live Shopify connections are invoked during this demonstration.
          </p>
        </div>
      </Modal>
    </div>
  );
};

