import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Check, Globe, Mail, Phone, Save } from 'lucide-react';
import { useSupplyFlow } from '../context/SupplyFlowContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatCurrency } from '../services/mockPricing';
import { ProductImage } from '../components/common/ProductImage';

export const SupplierDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { suppliers, products, updateSupplier, pushToast, settings } = useSupplyFlow();

  const supplier = suppliers.find((s) => s.id === id);

  const [freight, setFreight] = useState(supplier?.defaultFreight ?? 4);
  const [duty, setDuty] = useState(supplier?.defaultDuty ?? 3);
  const [autoExtract, setAutoExtract] = useState(supplier?.autoExtract ?? true);
  const [autoPricing, setAutoPricing] = useState(supplier?.autoPricing ?? true);

  if (!supplier) {
    return (
      <div className="rounded-2xl border border-[#E6EAE4] bg-white p-10 text-center space-y-3">
        <p className="font-display text-lg font-semibold text-[#26352F]">Supplier not found</p>
        <Link to="/app/suppliers" className="inline-block text-xs font-medium text-[#344D3D] hover:underline">
          ← Return to Suppliers
        </Link>
      </div>
    );
  }

  const supplierProducts = products.filter((p) => p.supplierId === supplier.id);

  const handleSaveConfig = () => {
    updateSupplier(supplier.id, {
      defaultFreight: Number(freight),
      defaultDuty: Number(duty),
      autoExtract,
      autoPricing,
    });
    pushToast({
      title: 'Supplier configuration saved',
      description: `Updated freight, duty, and automation preferences for ${supplier.name}.`,
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
            onClick={() => navigate('/app/suppliers')}
            className="mt-0.5 rounded-lg border border-[#E6EAE4] bg-white p-2 text-[#78837C] hover:text-[#26352F]"
            aria-label="Back to suppliers"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display text-2xl font-semibold text-[#26352F]">{supplier.name}</h1>
              <StatusBadge label={supplier.connectionStatus} />
            </div>
            <p className="mt-1 text-xs text-[#78837C]">
              {supplier.code} • {supplier.country} • Preferred Method: {supplier.preferredMethod}
            </p>
          </div>
        </div>
        <Link
          to="/app/intake"
          className="inline-flex items-center justify-center rounded-lg bg-[#344D3D] px-4 py-2 text-xs font-medium text-white hover:bg-[#293E31]"
        >
          Submit Product From {supplier.name}
        </Link>
      </div>

      {/* Overview & Config Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Contact & Overview */}
        <div className="lg:col-span-5 space-y-6">
          <section className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-4">
            <h2 className="font-display text-base font-semibold text-[#26352F]">Supplier Overview</h2>
            <p className="text-xs leading-relaxed text-[#78837C]">{supplier.notes}</p>
            <div className="space-y-2.5 border-t border-[#E6EAE4] pt-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#78837C] flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" /> Primary Contact
                </span>
                <span className="font-medium text-[#26352F]">{supplier.contactName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#78837C] flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Demo Email
                </span>
                <span className="text-[#26352F]">{supplier.contactEmail}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#78837C] flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> Demo Phone
                </span>
                <span className="text-[#26352F] tabular-nums">{supplier.contactPhone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#78837C] flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" /> Country & Currency
                </span>
                <span className="font-medium text-[#26352F]">
                  {supplier.country} ({supplier.currency})
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-[#E6EAE4] flex flex-wrap gap-1.5">
              {supplier.categories.map((cat) => (
                <span
                  key={cat}
                  className="rounded-md bg-[#F0F2ED] px-2.5 py-1 text-[11px] font-medium text-[#26352F]"
                >
                  {cat}
                </span>
              ))}
            </div>
          </section>

          {/* Shipping, Duty & Automation Config */}
          <section className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-4">
            <h2 className="font-display text-base font-semibold text-[#26352F]">
              Pricing & Automation Settings
            </h2>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#78837C] mb-1">Default Freight ({settings.baseCurrency})</label>
                <input
                  type="number"
                  step="0.5"
                  value={freight}
                  onChange={(e) => setFreight(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 tabular-nums focus:border-[#526D5B] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[#78837C] mb-1">Default Duty ({settings.baseCurrency})</label>
                <input
                  type="number"
                  step="0.5"
                  value={duty}
                  onChange={(e) => setDuty(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 tabular-nums focus:border-[#526D5B] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2.5 pt-2 text-xs">
              <label className="flex items-center justify-between rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] px-3.5 py-2.5 cursor-pointer">
                <span className="font-medium text-[#26352F]">Auto-extract incoming submissions</span>
                <input
                  type="checkbox"
                  checked={autoExtract}
                  onChange={(e) => setAutoExtract(e.target.checked)}
                  className="h-4 w-4 accent-[#344D3D]"
                />
              </label>
              <label className="flex items-center justify-between rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] px-3.5 py-2.5 cursor-pointer">
                <span className="font-medium text-[#26352F]">Auto-calculate landed margin pricing</span>
                <input
                  type="checkbox"
                  checked={autoPricing}
                  onChange={(e) => setAutoPricing(e.target.checked)}
                  className="h-4 w-4 accent-[#344D3D]"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={handleSaveConfig}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#344D3D] px-4 py-2 text-xs font-medium text-white hover:bg-[#293E31]"
            >
              <Save className="h-3.5 w-3.5" />
              Save Supplier Preferences
            </button>
          </section>
        </div>

        {/* Supplier Products & Submission History */}
        <div className="lg:col-span-7 space-y-6">
          <section className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs">
            <h2 className="font-display text-base font-semibold text-[#26352F] mb-3">
              Products From {supplier.name} ({supplierProducts.length})
            </h2>
            {supplierProducts.length === 0 ? (
              <p className="py-6 text-center text-xs text-[#78837C]">
                No products submitted yet. Use Product Intake to add one.
              </p>
            ) : (
              <div className="divide-y divide-[#E6EAE4]">
                {supplierProducts.map((p) => (
                  <Link
                    key={p.id}
                    to={`/app/catalog/${p.id}`}
                    className="flex items-center justify-between gap-3 py-3 hover:bg-[#F7F8F5] -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ProductImage
                        src={p.images[0]?.url}
                        alt={p.name}
                        className="h-11 w-11 rounded-lg border border-[#E6EAE4] shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#26352F] truncate">{p.name}</p>
                        <p className="text-[11px] text-[#78837C] tabular-nums">
                          {p.sku} • Cost {formatCurrency(p.pricing.supplierCost, p.pricing.supplierCurrency)} • Retail {formatCurrency(p.pricing.sellingPrice, settings.baseCurrency)}
                        </p>
                      </div>
                    </div>
                    <StatusBadge label={p.approvalStatus} />
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs">
            <h2 className="font-display text-base font-semibold text-[#26352F] mb-3">
              Submission History
            </h2>
            {supplier.submissionHistory.length === 0 ? (
              <p className="text-xs text-[#78837C]">No historical batches recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E6EAE4] text-[11px] text-[#78837C]">
                      <th className="pb-2">Reference</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Channel</th>
                      <th className="pb-2 text-right">Items</th>
                      <th className="pb-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6EAE4]">
                    {supplier.submissionHistory.map((h) => (
                      <tr key={h.id}>
                        <td className="py-2.5 font-mono text-[11px] font-medium text-[#26352F]">{h.reference}</td>
                        <td className="py-2.5 tabular-nums text-[#78837C]">{h.date}</td>
                        <td className="py-2.5 text-[#26352F]">{h.method}</td>
                        <td className="py-2.5 text-right tabular-nums text-[#26352F]">{h.itemCount}</td>
                        <td className="py-2.5 text-right">
                          <StatusBadge label={h.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

