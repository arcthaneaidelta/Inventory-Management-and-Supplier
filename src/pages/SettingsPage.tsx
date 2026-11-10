import React, { useState } from 'react';
import { CheckCircle2, Info, RefreshCw, ShieldCheck } from 'lucide-react';
import { useSupplyFlow } from '../context/SupplyFlowContext';
import { Modal } from '../components/common/Modal';
import { CurrencyCode, PhotographyStyle, SubmissionMethod } from '../types';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetDemoData, pushToast } = useSupplyFlow();
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const handleManualSaveToast = () => {
    pushToast({
      title: 'Workspace preferences saved locally',
      description: 'Settings are persisted in browser localStorage.',
      variant: 'success',
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#26352F]">Workspace Settings</h1>
          <p className="mt-1 text-sm text-[#78837C]">
            Configure workspace defaults, pricing rules, AI preferences, ownership model, and local demo persistence.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setConfirmResetOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#EBCAC7] bg-[#FBF0EF] px-4 py-2 text-xs font-medium text-[#9F514B] hover:bg-[#f6e3e1]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reset Demo Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* General */}
        <section className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-4">
          <h2 className="font-display text-base font-semibold text-[#26352F]">General</h2>
          <div className="space-y-3">
            <div>
              <label className="block font-medium text-[#26352F] mb-1">Workspace Name</label>
              <input
                value={settings.workspaceName}
                onChange={(e) => updateSettings({ workspaceName: e.target.value })}
                className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-[#26352F] mb-1">Default Language</label>
                <select
                  value={settings.defaultLanguage}
                  onChange={(e) => updateSettings({ defaultLanguage: e.target.value as any })}
                  className="w-full rounded-lg border border-[#E6EAE4] bg-white px-3 py-2"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-[#26352F] mb-1">Default Currency</label>
                <select
                  value={settings.baseCurrency}
                  onChange={(e) => updateSettings({ baseCurrency: e.target.value as CurrencyCode })}
                  className="w-full rounded-lg border border-[#E6EAE4] bg-white px-3 py-2"
                >
                  {['USD', 'EUR', 'GBP', 'TRY', 'CNY'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block font-medium text-[#26352F] mb-1">Time Zone</label>
              <input
                value={settings.timeZone}
                onChange={(e) => updateSettings({ timeZone: e.target.value })}
                className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2"
              />
            </div>
          </div>
        </section>

        {/* Supplier & Pricing Configuration */}
        <section className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-4">
          <h2 className="font-display text-base font-semibold text-[#26352F]">
            Supplier & Pricing Defaults
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block font-medium text-[#26352F] mb-1">Default Submission Method</label>
              <select
                value={settings.defaultSubmissionMethod}
                onChange={(e) =>
                  updateSettings({ defaultSubmissionMethod: e.target.value as SubmissionMethod })
                }
                className="w-full rounded-lg border border-[#E6EAE4] bg-white px-3 py-2"
              >
                {['Messaging', 'Excel', 'CSV', 'File Upload', 'Manual Entry', 'Supplier Portal'].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block font-medium text-[#26352F] mb-1">Freight ($)</label>
                <input
                  type="number"
                  step="0.5"
                  value={settings.defaultFreight}
                  onChange={(e) => updateSettings({ defaultFreight: Number(e.target.value) })}
                  className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 tabular-nums"
                />
              </div>
              <div>
                <label className="block font-medium text-[#26352F] mb-1">Duty ($)</label>
                <input
                  type="number"
                  step="0.5"
                  value={settings.defaultDuty}
                  onChange={(e) => updateSettings({ defaultDuty: Number(e.target.value) })}
                  className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 tabular-nums"
                />
              </div>
              <div>
                <label className="block font-medium text-[#26352F] mb-1">Margin (%)</label>
                <input
                  type="number"
                  value={Math.round(settings.defaultMargin * 100)}
                  onChange={(e) => updateSettings({ defaultMargin: Number(e.target.value) / 100 })}
                  className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 tabular-nums"
                />
              </div>
            </div>
            <div>
              <label className="block font-medium text-[#26352F] mb-1">Pricing Rounding Rule</label>
              <select
                value={settings.roundingRule}
                onChange={(e) => updateSettings({ roundingRule: e.target.value as any })}
                className="w-full rounded-lg border border-[#E6EAE4] bg-white px-3 py-2"
              >
                <option value="None">Exact 2 decimals</option>
                <option value=".99">End in .99</option>
                <option value=".95">End in .95</option>
              </select>
            </div>
          </div>
        </section>

        {/* Inventory & AI Preferences */}
        <section className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-4">
          <h2 className="font-display text-base font-semibold text-[#26352F]">
            Inventory & AI Studio Preferences
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#26352F] mb-1">Low-Stock Threshold</label>
              <input
                type="number"
                min={1}
                value={settings.lowStockThreshold}
                onChange={(e) => updateSettings({ lowStockThreshold: Number(e.target.value) })}
                className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 tabular-nums"
              />
            </div>
            <div>
              <label className="block font-medium text-[#26352F] mb-1">Image Freshness (days)</label>
              <input
                type="number"
                min={1}
                value={settings.imageFreshnessDays}
                onChange={(e) => updateSettings({ imageFreshnessDays: Number(e.target.value) })}
                className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 tabular-nums"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium text-[#26352F] mb-1">Default Photography Style</label>
            <select
              value={settings.defaultPhotographyStyle}
              onChange={(e) =>
                updateSettings({ defaultPhotographyStyle: e.target.value as PhotographyStyle })
              }
              className="w-full rounded-lg border border-[#E6EAE4] bg-white px-3 py-2"
            >
              {[
                'Premium catalog',
                'On-model studio',
                'Clean white background',
                'Lifestyle photography',
                'Detail photography',
              ].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium text-[#26352F] mb-1">Catalog Languages</label>
            <input
              value={settings.translationLanguages.join(', ')}
              onChange={(e) =>
                updateSettings({
                  translationLanguages: e.target.value.split(',').map((x) => x.trim()).filter(Boolean),
                })
              }
              className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2"
            />
          </div>
        </section>

        {/* Workflow Preferences */}
        <section className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-4">
          <h2 className="font-display text-base font-semibold text-[#26352F]">
            Workflow & Approval Controls
          </h2>
          <div className="space-y-2.5">
            <label className="flex items-center justify-between rounded-xl border border-[#C9DBC9] bg-[#E9F0E9]/60 px-3.5 py-2.5 cursor-pointer">
              <div>
                <span className="font-semibold text-[#344D3D] block">Require Manual Product Approval</span>
                <span className="text-[11px] text-[#526D5B]">Recommended: Jack signs off before Shopify readiness</span>
              </div>
              <input
                type="checkbox"
                checked={settings.requireManualApproval}
                onChange={(e) => updateSettings({ requireManualApproval: e.target.checked })}
                className="h-4 w-4 accent-[#344D3D]"
              />
            </label>

            <label className="flex items-center justify-between rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] px-3.5 py-2.5 cursor-pointer">
              <span className="font-medium text-[#26352F]">Automatic Product Extraction</span>
              <input
                type="checkbox"
                checked={settings.autoExtraction}
                onChange={(e) => updateSettings({ autoExtraction: e.target.checked })}
                className="h-4 w-4 accent-[#344D3D]"
              />
            </label>

            <label className="flex items-center justify-between rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] px-3.5 py-2.5 cursor-pointer">
              <span className="font-medium text-[#26352F]">Automatic Pricing Calculation</span>
              <input
                type="checkbox"
                checked={settings.autoPricingCalculation}
                onChange={(e) => updateSettings({ autoPricingCalculation: e.target.checked })}
                className="h-4 w-4 accent-[#344D3D]"
              />
            </label>

            <label className="flex items-center justify-between rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] px-3.5 py-2.5 cursor-pointer">
              <span className="font-medium text-[#26352F]">Notify on Supplier Price Changes</span>
              <input
                type="checkbox"
                checked={settings.notifyOnPriceChange}
                onChange={(e) => updateSettings({ notifyOnPriceChange: e.target.checked })}
                className="h-4 w-4 accent-[#344D3D]"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={handleManualSaveToast}
            className="rounded-lg bg-[#344D3D] px-4 py-2 font-medium text-white hover:bg-[#293E31]"
          >
            Save Preferences
          </button>
        </section>
      </div>

      {/* Security, Ownership & Transparency Section (Proposed Architecture) */}
      <section className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-4">
        <div className="flex items-start justify-between gap-4 border-b border-[#E6EAE4] pb-3.5">
          <div>
            <h2 className="font-display text-base font-semibold text-[#26352F]">
              Ownership & Proposed Architecture Transparency
            </h2>
            <p className="text-xs text-[#78837C]">
              Summary of proposed production architecture capabilities (this frontend demo runs locally in-browser without active cloud backend services).
            </p>
          </div>
          <span className="rounded-md bg-[#EEF3F6] px-2.5 py-1 text-[11px] font-medium text-[#4C6878]">
            Proposed Architecture
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {[
            ['Workspace Ownership', 'Client-controlled in the proposed architecture'],
            ['Workflow Ownership (n8n)', 'Client-controlled in the proposed architecture'],
            ['Supplier Data', 'Centralized within the proposed architecture'],
            ['Integration Credentials', 'Intended to be stored in secure backend infrastructure'],
            ['Data Export', 'Planned capability (CSV / JSON catalog export)'],
            ['Backup Strategy', 'Planned capability in production deployment'],
          ].map(([title, value]) => (
            <div key={title} className="rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] p-3.5">
              <p className="font-semibold text-[#26352F]">{title}</p>
              <p className="mt-1 text-[11px] text-[#78837C]">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reset Demo Confirmation Modal */}
      <Modal
        open={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        title="Reset Demonstration Workspace?"
        subtitle="Restores original seeded suppliers, 24 products, inventory levels, and pricing rules."
      >
        <div className="space-y-4 text-xs">
          <p className="text-[#78837C] leading-relaxed">
            Any new products, supplier edits, stock adjustments, or approvals saved in browser localStorage will be cleared and replaced with the original demonstration dataset.
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmResetOpen(false)}
              className="rounded-lg border border-[#E6EAE4] px-4 py-2 font-medium text-[#26352F]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                resetDemoData();
                setConfirmResetOpen(false);
              }}
              className="rounded-lg bg-[#C47770] px-4 py-2 font-medium text-white"
            >
              Confirm Reset
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

