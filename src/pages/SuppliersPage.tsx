import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Globe,
  MessageSquare,
  Plus,
  Search,
  Upload,
  PenLine,
} from 'lucide-react';
import { useSupplyFlow } from '../context/SupplyFlowContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { CurrencyCode, ProductCategory, SubmissionMethod } from '../types';

const METHOD_DEMOS: {
  id: SubmissionMethod;
  title: string;
  icon: React.ElementType;
  desc: string;
  sampleLines: string[];
}[] = [
  {
    id: 'Messaging',
    title: 'Messaging Submission',
    icon: MessageSquare,
    desc: 'Suppliers forward raw garment photos, showroom clips, SKU codes, and wholesale prices in chat.',
    sampleLines: [
      'Milano Fashion: "Ciao Jack — sending 3 photos for MF-204 Linen Shirt (€25.00 EUR, White/Beige/Black, S–XL)."',
      'SUPPLYFLOW Auto-Ack: "Submission received. Product information is being organized in Intake."',
    ],
  },
  {
    id: 'Excel',
    title: 'Excel Spreadsheet',
    icon: FileSpreadsheet,
    desc: 'Multi-row .xlsx line sheets mapped automatically to supplier currency and variant columns.',
    sampleLines: [
      'Sheet: BCN_Resort_2026.xlsx • Columns matched: SKU, Title, Wholesale_EUR, Color, Size_Grid, Stock',
      'Validated 4 products with zero missing prices.',
    ],
  },
  {
    id: 'CSV',
    title: 'CSV Upload',
    icon: FileText,
    desc: 'Standardized comma-separated stock & cost updates with automated price delta monitoring.',
    sampleLines: [
      'File: istanbul_fleece_nov.csv • Parsed 3 apparel SKUs in TRY',
      'Alert: Detected +13.0% wholesale change on IT-308 compared to baseline.',
    ],
  },
  {
    id: 'File Upload',
    title: 'Direct File Upload',
    icon: Upload,
    desc: 'Drag-and-drop lookbooks, studio images, and spec sheets directly into Product Intake.',
    sampleLines: [
      'Accepted: JPG, PNG, WEBP, CSV, XLSX, MP4 clips',
      'Unsupported file formats trigger clear validation guidance.',
    ],
  },
  {
    id: 'Manual Entry',
    title: 'Manual Entry',
    icon: PenLine,
    desc: 'Structured workspace form for rapid ad-hoc product onboarding or showroom samples.',
    sampleLines: [
      'Includes smart supplier defaults for currency, freight, and duty.',
      'Instant duplicate SKU protection against existing catalog.',
    ],
  },
];

export const SuppliersPage: React.FC = () => {
  const navigate = useNavigate();
  const { suppliers, products, addSupplier } = useSupplyFlow();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [addOpen, setAddOpen] = useState(false);
  const [activeMethodDemo, setActiveMethodDemo] = useState<typeof METHOD_DEMOS[number] | null>(null);

  const [form, setForm] = useState({
    name: '',
    country: 'Italy',
    currency: 'EUR' as CurrencyCode,
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    preferredMethod: 'Messaging' as SubmissionMethod,
    categories: ['Apparel'] as ProductCategory[],
    defaultFreight: 4.0,
    defaultDuty: 3.0,
    notes: '',
  });

  const filteredSuppliers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return suppliers.filter((s) => {
      const matchQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || s.connectionStatus === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [suppliers, search, statusFilter]);

  const toggleCategory = (cat: ProductCategory) => {
    setForm((prev) => {
      const exists = prev.categories.includes(cat);
      const next = exists
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat];
      return { ...prev, categories: next.length ? next : ['Apparel'] };
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    addSupplier({
      name: form.name.trim(),
      country: form.country.trim() || 'Portugal',
      currency: form.currency,
      contactName: form.contactName.trim() || 'Operations Contact',
      contactEmail: form.contactEmail.trim() || 'supply@demo-partner.example',
      contactPhone: form.contactPhone.trim() || '+00 000 555 0100',
      preferredMethod: form.preferredMethod,
      categories: form.categories,
      defaultFreight: Number(form.defaultFreight) || 4,
      defaultDuty: Number(form.defaultDuty) || 3,
      connectionStatus: 'Connected',
      autoExtract: true,
      autoPricing: true,
      notes: form.notes.trim() || 'Onboarded via centralized supplier workspace.',
    });
    setAddOpen(false);
    setForm({
      name: '',
      country: 'Italy',
      currency: 'EUR',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      preferredMethod: 'Messaging',
      categories: ['Apparel'],
      defaultFreight: 4.0,
      defaultDuty: 3.0,
      notes: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#26352F]">Suppliers</h1>
          <p className="mt-1 text-sm text-[#78837C]">
            Centralized multi-supplier directory, submission channels, and landed cost defaults.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#344D3D] px-4 py-2 text-xs font-medium text-white shadow-sf-xs hover:bg-[#293E31] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Supplier
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-[#E6EAE4] bg-white p-4 shadow-sf-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9AA39C]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search suppliers by name, ID, or country..."
            className="w-full rounded-lg border border-[#E6EAE4] bg-[#F7F8F5] pl-8 pr-3 py-2 text-xs focus:border-[#526D5B] focus:bg-white focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['All', 'Connected', 'Active', 'Attention Needed'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
                statusFilter === st
                  ? 'border-[#344D3D] bg-[#E9F0E9] text-[#344D3D]'
                  : 'border-[#E6EAE4] bg-white text-[#78837C] hover:bg-[#F7F8F5]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Supplier Table */}
      <div className="rounded-2xl border border-[#E6EAE4] bg-white shadow-sf-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E6EAE4] bg-[#F7F8F5] text-[11px] font-semibold text-[#78837C]">
                <th className="py-3 pl-5 pr-3">Supplier Name</th>
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3">Country</th>
                <th className="py-3 px-3">Submission Method</th>
                <th className="py-3 px-3 text-right">Received</th>
                <th className="py-3 px-3 text-right">Active</th>
                <th className="py-3 px-3">Last Submission</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 pl-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6EAE4]">
              {filteredSuppliers.map((sup) => {
                const supProducts = products.filter((p) => p.supplierId === sup.id);
                const activeCount = supProducts.filter(
                  (p) => p.approvalStatus === 'Approved' || p.approvalStatus === 'Shopify Ready'
                ).length;

                return (
                  <tr
                    key={sup.id}
                    onClick={() => navigate(`/app/suppliers/${sup.id}`)}
                    className="cursor-pointer hover:bg-[#F7F8F5] transition-colors"
                  >
                    <td className="py-3.5 pl-5 pr-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E9F0E9] text-[11px] font-semibold text-[#344D3D]">
                          {sup.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[#26352F]">{sup.name}</p>
                          <p className="text-[11px] text-[#78837C]">{sup.currency} • {sup.categories.join(', ')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[11px] text-[#78837C]">{sup.code}</td>
                    <td className="py-3.5 px-3 text-[#26352F]">{sup.country}</td>
                    <td className="py-3.5 px-3 text-[#78837C]">{sup.preferredMethod}</td>
                    <td className="py-3.5 px-3 text-right tabular-nums font-medium text-[#26352F]">
                      {Math.max(sup.productsReceived, supProducts.length)}
                    </td>
                    <td className="py-3.5 px-3 text-right tabular-nums text-[#344D3D] font-medium">
                      {activeCount}
                    </td>
                    <td className="py-3.5 px-3 tabular-nums text-[#78837C]">{sup.lastSubmission}</td>
                    <td className="py-3.5 px-3">
                      <StatusBadge label={sup.connectionStatus} />
                    </td>
                    <td className="py-3.5 pl-3 pr-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <Link
                        to={`/app/suppliers/${sup.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#E6EAE4] bg-white px-2.5 py-1 text-[11px] font-medium text-[#26352F] hover:bg-[#F0F2ED]"
                      >
                        Profile
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Submission Methods Configuration Panel */}
      <section className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h2 className="font-display text-base font-semibold text-[#26352F]">
              Supplier Submission Channels
            </h2>
            <p className="text-xs text-[#78837C]">
              Click any supported intake method to preview how supplier submissions enter SUPPLYFLOW
            </p>
          </div>
          <Link
            to="/app/intake"
            className="text-xs font-medium text-[#344D3D] hover:underline"
          >
            Go to Product Intake →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {METHOD_DEMOS.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveMethodDemo(m)}
                className="flex flex-col justify-between rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] p-4 text-left hover:border-[#526D5B] hover:bg-white transition-all"
              >
                <div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E9F0E9] text-[#344D3D]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="mt-3 text-xs font-semibold text-[#26352F]">{m.title}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#78837C]">{m.desc}</p>
                </div>
                <span className="mt-3 text-[11px] font-medium text-[#526D5B]">Preview channel →</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Add Supplier Modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add New Supplier"
        subtitle="Creates a supplier channel in local demo storage"
        maxWidthClass="max-w-xl"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-medium text-[#26352F] mb-1">Supplier Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Lisbon Linen Atelier"
                className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 focus:border-[#526D5B] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-[#26352F] mb-1">Country *</label>
              <input
                required
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                placeholder="Portugal"
                className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 focus:border-[#526D5B] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-[#26352F] mb-1">Wholesale Currency</label>
              <select
                value={form.currency}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value as CurrencyCode }))}
                className="w-full rounded-lg border border-[#E6EAE4] bg-white px-3 py-2 focus:border-[#526D5B] focus:outline-none"
              >
                {['EUR', 'USD', 'GBP', 'TRY', 'CNY'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-[#26352F] mb-1">Preferred Submission Method</label>
              <select
                value={form.preferredMethod}
                onChange={(e) =>
                  setForm((f) => ({ ...f, preferredMethod: e.target.value as SubmissionMethod }))
                }
                className="w-full rounded-lg border border-[#E6EAE4] bg-white px-3 py-2 focus:border-[#526D5B] focus:outline-none"
              >
                {['Messaging', 'Excel', 'CSV', 'File Upload', 'Manual Entry', 'Supplier Portal'].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-[#26352F] mb-1">Contact Name</label>
              <input
                value={form.contactName}
                onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
                placeholder="Demo contact name"
                className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 focus:border-[#526D5B] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-[#26352F] mb-1">Contact Email (Demo)</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
                placeholder="orders@supplier-demo.example"
                className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 focus:border-[#526D5B] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-[#26352F] mb-1">Default Freight (USD/unit)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={form.defaultFreight}
                onChange={(e) => setForm((f) => ({ ...f, defaultFreight: Number(e.target.value) }))}
                className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 focus:border-[#526D5B] focus:outline-none tabular-nums"
              />
            </div>
            <div>
              <label className="block font-medium text-[#26352F] mb-1">Default Import Duty (USD/unit)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={form.defaultDuty}
                onChange={(e) => setForm((f) => ({ ...f, defaultDuty: Number(e.target.value) }))}
                className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 focus:border-[#526D5B] focus:outline-none tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#26352F] mb-1.5">Product Categories</label>
            <div className="flex flex-wrap gap-2">
              {(['Apparel', 'Shoes', 'Accessories'] as ProductCategory[]).map((cat) => {
                const active = form.categories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`rounded-lg border px-3 py-1.5 font-medium transition-colors ${
                      active
                        ? 'border-[#344D3D] bg-[#E9F0E9] text-[#344D3D]'
                        : 'border-[#E6EAE4] bg-white text-[#78837C]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E6EAE4]">
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              className="rounded-lg border border-[#E6EAE4] px-4 py-2 font-medium text-[#26352F]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#344D3D] px-4 py-2 font-medium text-white hover:bg-[#293E31]"
            >
              Save Supplier
            </button>
          </div>
        </form>
      </Modal>

      {/* Channel Demonstration Modal */}
      <Modal
        open={activeMethodDemo !== null}
        onClose={() => setActiveMethodDemo(null)}
        title={activeMethodDemo?.title ?? 'Submission Channel'}
        subtitle="Simulated intake demonstration — no external platform connection active"
      >
        {activeMethodDemo && (
          <div className="space-y-4 text-xs">
            <p className="text-[#78837C] leading-relaxed">{activeMethodDemo.desc}</p>
            <div className="space-y-2 rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] p-4">
              {activeMethodDemo.sampleLines.map((line, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[#26352F]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#526D5B] shrink-0 mt-0.5" />
                  <span>{line}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveMethodDemo(null)}
                className="rounded-lg border border-[#E6EAE4] px-3.5 py-2 font-medium text-[#26352F]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const mode = activeMethodDemo.id === 'Messaging' ? 'messaging' : 'upload';
                  setActiveMethodDemo(null);
                  navigate(`/app/intake?mode=${mode}`);
                }}
                className="rounded-lg bg-[#344D3D] px-3.5 py-2 font-medium text-white"
              >
                Try in Product Intake →
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

