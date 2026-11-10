import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Play,
  Video,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { useSupplyFlow } from '../context/SupplyFlowContext';

const DOC_GUIDES = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    summary: 'Overview of Jack’s centralized workspace and the 10-stage workflow.',
    body: 'SUPPLYFLOW connects supplier intake, AI product enrichment, transparent margin pricing, and variant inventory into one dashboard. Every automated update pauses at Approval Center so you retain 100% control before Shopify synchronization.',
    route: '/app',
  },
  {
    id: 'adding-suppliers',
    title: 'Adding Suppliers',
    summary: 'Configure currencies, shipping defaults, and preferred intake channels.',
    body: 'Open Suppliers to onboard partners across EUR, USD, GBP, TRY, or CNY. Each supplier profile stores freight, import duty, and category preferences that pre-populate whenever new products arrive.',
    route: '/app/suppliers',
  },
  {
    id: 'submitting-products',
    title: 'Submitting Products',
    summary: 'Handle messaging packets, Excel sheets, CSV uploads, and manual entry.',
    body: 'In Product Intake, select a supplier and upload photos, CSV/Excel sheets, or test the simulated messaging thread. Running Process Submission simulates 7-step extraction and checks for duplicate SKUs.',
    route: '/app/intake',
  },
  {
    id: 'ai-preparation',
    title: 'AI Product Preparation',
    summary: 'Prepare studio imagery and bilingual EN/ES product descriptions.',
    body: 'AI Studio pairs original supplier snapshots with prepared studio catalog presets (On-model, Clean white, Warm ivory, Detail). In Product Details, generate English descriptions, Spanish translations, and care attributes.',
    route: '/app/ai-studio',
  },
  {
    id: 'pricing-config',
    title: 'Pricing Configuration',
    summary: 'Gross margin calculations, FX conversion, and supplier price alerts.',
    body: 'SUPPLYFLOW converts wholesale cost using reference FX rates, adds freight and duty to derive Landed Cost, and computes Retail Price = Landed Cost / (1 - Target Gross Margin). Price alerts flag wholesale increases for review.',
    route: '/app/pricing',
  },
  {
    id: 'inventory-mgmt',
    title: 'Inventory Management',
    summary: 'Color × Size variant matrices, low-stock alerts, and replenishments.',
    body: 'Edit stock directly in the Color × Size matrix. Dropping below the reorder threshold updates Inventory Health KPIs and surfaces alerts where you can issue simulated replenishment requests.',
    route: '/app/inventory',
  },
  {
    id: 'product-approval',
    title: 'Product Approval',
    summary: 'Review every image, translation, and margin before store readiness.',
    body: 'Approval Center lets Jack inspect product completeness at a glance, edit copy inline, Request Changes with notes, Reject with a reason, or Approve into the Shopify Ready list.',
    route: '/app/approvals',
  },
  {
    id: 'shopify-integration',
    title: 'Shopify Integration',
    summary: 'Planned Phase 4 sync preview and payload verification.',
    body: 'Because live Shopify publishing is planned for Phase 4, the Integrations module provides a realistic field-by-field sync preview and sample payload inspector without touching any live store.',
    route: '/app/integrations',
  },
];

const TRAINING_MODULES = [
  {
    id: 'tr-1',
    title: 'Supplier Intake & Duplicate SKU Protection',
    duration: '02:40 • Demo Preview',
    thumb: '/images/products/linen-shirt-original.jpg',
    steps: [
      'Select supplier channel (Messaging, CSV, or Excel).',
      'Inspect confidence badges across extracted fields.',
      'Resolve duplicate SKU warnings before saving.',
    ],
  },
  {
    id: 'tr-2',
    title: 'Studio Photography & Before/After Review',
    duration: '03:15 • Demo Preview',
    thumb: '/images/products/suede-loafers-studio.jpg',
    steps: [
      'Choose category and warm-ivory catalog preset.',
      'Compare original snapshot against prepared image.',
      'Set primary catalog image in one click.',
    ],
  },
  {
    id: 'tr-3',
    title: 'Landed Cost Pricing & Margin Rules',
    duration: '03:05 • Demo Preview',
    thumb: '/images/products/cotton-shorts-studio.jpg',
    steps: [
      'Understand Gross Margin vs. Markup calculation.',
      'Review supplier wholesale price change alerts.',
      'Apply category margin rules across products.',
    ],
  },
];

const FAQS = [
  {
    q: 'Are external AI, messaging, or Shopify APIs connected in this demo?',
    a: 'No. This is a frontend-only demonstration using local demo datasets, realistic simulated processing delays, and browser localStorage persistence.',
  },
  {
    q: 'Does automation ever publish products to Shopify without approval?',
    a: 'No. Manual owner approval is enabled by default so products wait in Approval Center until Jack explicitly approves them.',
  },
  {
    q: 'How do I restore the workspace to its original seeded state?',
    a: 'Open Settings (or the top-right Jack profile menu) and click Reset Demo Data.',
  },
];

export const HelpPage: React.FC = () => {
  const { pushToast } = useSupplyFlow();
  const [openGuideId, setOpenGuideId] = useState<string | null>('getting-started');
  const [previewModule, setPreviewModule] = useState<typeof TRAINING_MODULES[number] | null>(null);
  const [supportSubmitted, setSupportSubmitted] = useState(false);
  const [supportTopic, setSupportTopic] = useState('');

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSupportSubmitted(true);
    setSupportTopic('');
    pushToast({
      title: 'Demo support request recorded',
      description: 'No external message sent in frontend prototype.',
      variant: 'success',
    });
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[#26352F]">
          Documentation, Training & Support
        </h1>
        <p className="mt-1 text-sm text-[#78837C]">
          Interactive guides, demonstration training previews, and support resources for SUPPLYFLOW.
        </p>
      </div>

      {/* Expandable Documentation Guides */}
      <section className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[#526D5B]" />
          <h2 className="font-display text-base font-semibold text-[#26352F]">Platform Guides</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DOC_GUIDES.map((g) => {
            const expanded = openGuideId === g.id;
            return (
              <div
                key={g.id}
                className="rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenGuideId(expanded ? null : g.id)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[#F0F2ED]"
                >
                  <div>
                    <p className="text-xs font-semibold text-[#26352F]">{g.title}</p>
                    <p className="text-[11px] text-[#78837C]">{g.summary}</p>
                  </div>
                  {expanded ? (
                    <ChevronUp className="h-4 w-4 text-[#78837C] shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[#78837C] shrink-0" />
                  )}
                </button>
                {expanded && (
                  <div className="border-t border-[#E6EAE4] bg-white px-4 py-3 text-xs space-y-2.5">
                    <p className="leading-relaxed text-[#78837C]">{g.body}</p>
                    <Link
                      to={g.route}
                      className="inline-block font-semibold text-[#344D3D] hover:underline"
                    >
                      Open module →
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Training Center (Clearly marked demonstration content) */}
      <section className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-[#526D5B]" />
            <h2 className="font-display text-base font-semibold text-[#26352F]">Training Center</h2>
          </div>
          <span className="rounded-md bg-[#EEF3F6] px-2.5 py-1 text-[11px] font-medium text-[#4C6878]">
            Simulated Training Previews (Placeholder Walkthroughs)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TRAINING_MODULES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setPreviewModule(m)}
              className="group text-left rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] overflow-hidden hover:border-[#526D5B] transition-all"
            >
              <div className="relative h-36 bg-[#F3EFE7] overflow-hidden">
                <img
                  src={m.thumb}
                  alt={m.title}
                  className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform"
                />
                <div className="absolute inset-0 bg-[#26352F]/25 flex items-center justify-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#344D3D] shadow-sf-md">
                    <Play className="h-4 w-4 ml-0.5" />
                  </span>
                </div>
                <span className="absolute bottom-2 left-2 rounded bg-[#26352F]/80 px-2 py-0.5 text-[10px] font-medium text-white">
                  {m.duration}
                </span>
              </div>
              <div className="p-3.5">
                <p className="text-xs font-semibold text-[#26352F]">{m.title}</p>
                <p className="mt-1 text-[11px] text-[#78837C]">Click to view interactive lesson outline</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Support & FAQ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-6 rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-[#526D5B]" />
            <h2 className="font-display text-base font-semibold text-[#26352F]">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-3 text-xs">
            {FAQS.map((f) => (
              <div key={f.q} className="rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] p-3.5">
                <p className="font-semibold text-[#26352F]">{f.q}</p>
                <p className="mt-1 text-[#78837C] leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-6 rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-4">
          <h2 className="font-display text-base font-semibold text-[#26352F]">
            Contact Support (Demo Panel)
          </h2>
          {supportSubmitted ? (
            <div className="rounded-xl border border-[#C9DBC9] bg-[#E9F0E9]/60 p-5 text-center space-y-2.5 text-xs">
              <CheckCircle2 className="h-6 w-6 text-[#344D3D] mx-auto" />
              <p className="font-semibold text-[#344D3D]">Demo support ticket logged locally</p>
              <p className="text-[#526D5B]">
                No external email or ticket was transmitted in this frontend-only prototype.
              </p>
              <button
                type="button"
                onClick={() => setSupportSubmitted(false)}
                className="rounded-lg bg-[#344D3D] px-4 py-1.5 font-medium text-white"
              >
                Send Another Demo Note
              </button>
            </div>
          ) : (
            <form onSubmit={handleSupportSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[#26352F] mb-1">Topic or Question</label>
                <textarea
                  required
                  rows={4}
                  value={supportTopic}
                  onChange={(e) => setSupportTopic(e.target.value)}
                  placeholder="Describe a supplier onboarding question, pricing rule adjustment, or n8n workflow request..."
                  className="w-full rounded-lg border border-[#E6EAE4] p-3 focus:border-[#526D5B] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-[#344D3D] px-4 py-2 font-medium text-white hover:bg-[#293E31]"
              >
                Submit Demo Support Request
              </button>
            </form>
          )}
        </section>
      </div>

      {/* Training Preview Modal */}
      <Modal
        open={previewModule !== null}
        onClose={() => setPreviewModule(null)}
        title={previewModule?.title ?? 'Training Preview'}
        subtitle="Demonstration training module outline (video playback simulated)"
      >
        {previewModule && (
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-[#E6EAE4] bg-[#F3EFE7] p-4 flex items-center gap-4">
              <img
                src={previewModule.thumb}
                alt={previewModule.title}
                className="h-20 w-20 rounded-lg object-cover border border-[#E6EAE4]"
              />
              <div>
                <span className="rounded bg-[#E9F0E9] px-2 py-0.5 text-[10px] font-semibold text-[#344D3D]">
                  Demo Curriculum Preview
                </span>
                <p className="mt-1.5 font-semibold text-[#26352F]">{previewModule.title}</p>
                <p className="text-[11px] text-[#78837C]">{previewModule.duration}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-[#26352F]">Key steps covered in production training:</p>
              {previewModule.steps.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-[#78837C]">
                  <span className="font-semibold text-[#344D3D]">{i + 1}.</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewModule(null)}
                className="rounded-lg bg-[#344D3D] px-4 py-2 font-medium text-white"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

