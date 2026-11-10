import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  DollarSign,
  Info,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from 'lucide-react';
import { useSupplyFlow } from '../context/SupplyFlowContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import {
  calculateSellingPrice,
  DEMO_RATE_UPDATED_LABEL,
  DEMO_USD_RATES,
  formatCurrency,
  getCrossRate,
} from '../services/mockPricing';
import { daysSince } from '../services/mockInventory';
import { CurrencyCode, PricingRule, ProductCategory } from '../types';

export const PricingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const {
    products,
    suppliers,
    settings,
    pricingRules,
    priceAlerts,
    changeBaseCurrency,
    updateProductPricing,
    addPricingRule,
    updatePricingRule,
    deletePricingRule,
    applyPricingRuleToCategory,
    resolvePriceAlert,
    pushToast,
  } = useSupplyFlow();

  const initialProductId = searchParams.get('product') || products[0]?.id;
  const [selectedProductId, setSelectedProductId] = useState(initialProductId);
  const selectedProduct = products.find((p) => p.id === selectedProductId) ?? products[0];

  // Calculator state synced when selecting a product or base currency
  const [cost, setCost] = useState(selectedProduct.pricing.supplierCost);
  const [supCurrency, setSupCurrency] = useState<CurrencyCode>(selectedProduct.pricing.supplierCurrency);
  const [fxRate, setFxRate] = useState(selectedProduct.pricing.exchangeRate);
  const [freight, setFreight] = useState(selectedProduct.pricing.freight);
  const [duty, setDuty] = useState(selectedProduct.pricing.duty);
  const [extra, setExtra] = useState(selectedProduct.pricing.additionalExpenses);
  const [marginPct, setMarginPct] = useState(Math.round(selectedProduct.pricing.targetGrossMargin * 100));

  useEffect(() => {
    if (!selectedProduct) return;
    setCost(selectedProduct.pricing.supplierCost);
    setSupCurrency(selectedProduct.pricing.supplierCurrency);
    setFxRate(selectedProduct.pricing.exchangeRate);
    setFreight(selectedProduct.pricing.freight);
    setDuty(selectedProduct.pricing.duty);
    setExtra(selectedProduct.pricing.additionalExpenses);
    setMarginPct(Math.round(selectedProduct.pricing.targetGrossMargin * 100));
  }, [selectedProduct]);

  const calc = useMemo(
    () =>
      calculateSellingPrice({
        supplierCost: cost,
        supplierCurrency: supCurrency,
        exchangeRate: fxRate,
        freight,
        duty,
        additionalExpenses: extra,
        targetGrossMargin: marginPct / 100,
      }),
    [cost, supCurrency, fxRate, freight, duty, extra, marginPct]
  );

  // Rule modal state
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [ruleForm, setRuleForm] = useState({
    name: '',
    category: 'Apparel' as ProductCategory | 'All',
    targetMarginPct: 45,
    defaultFreight: 4,
    defaultDuty: 3,
    roundingRule: 'None' as PricingRule['roundingRule'],
  });

  const pricingStats = useMemo(() => {
    const pendingAlerts = priceAlerts.filter((a) => a.status === 'Pending').length;
    const avgMargin =
      products.reduce((sum, p) => sum + p.pricing.targetGrossMargin, 0) /
      Math.max(1, products.length);
    const outdatedFx = products.filter(
      (p) => daysSince(p.pricing.priceLastUpdated) > settings.priceFreshnessDays
    ).length;
    const needsReview = products.filter(
      (p) => p.approvalStatus === 'Needs Changes' || p.approvalStatus === 'Awaiting Review'
    ).length;
    return {
      configured: products.length,
      needsReview,
      pendingAlerts,
      avgMarginPct: (avgMargin * 100).toFixed(1),
      outdatedFx,
    };
  }, [products, priceAlerts, settings.priceFreshnessDays]);

  const handleSaveToProduct = () => {
    updateProductPricing(selectedProduct.id, {
      supplierCost: cost,
      supplierCurrency: supCurrency,
      exchangeRate: fxRate,
      freight,
      duty,
      additionalExpenses: extra,
      targetGrossMargin: marginPct / 100,
      convertedCost: calc.convertedCost,
      landedCost: calc.landedCost,
      sellingPrice: calc.sellingPrice,
      priceLastUpdated: '2026-11-10',
    });
    pushToast({
      title: `Updated pricing for ${selectedProduct.sku}`,
      description: `Selling price set to ${formatCurrency(calc.sellingPrice, settings.baseCurrency)} (${marginPct}% gross margin).`,
      variant: 'success',
    });
  };

  const openRuleModal = (rule?: PricingRule) => {
    if (rule) {
      setEditingRule(rule);
      setRuleForm({
        name: rule.name,
        category: rule.category,
        targetMarginPct: Math.round(rule.targetMargin * 100),
        defaultFreight: rule.defaultFreight,
        defaultDuty: rule.defaultDuty,
        roundingRule: rule.roundingRule,
      });
    } else {
      setEditingRule(null);
      setRuleForm({
        name: '',
        category: 'Apparel',
        targetMarginPct: 45,
        defaultFreight: 4,
        defaultDuty: 3,
        roundingRule: 'None',
      });
    }
    setRuleModalOpen(true);
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: ruleForm.name.trim() || `${ruleForm.category} Margin Rule`,
      category: ruleForm.category,
      targetMargin: Math.min(0.9, Math.max(0.05, ruleForm.targetMarginPct / 100)),
      defaultFreight: Number(ruleForm.defaultFreight) || 0,
      defaultDuty: Number(ruleForm.defaultDuty) || 0,
      roundingRule: ruleForm.roundingRule,
      active: true,
    };
    if (editingRule) {
      updatePricingRule(editingRule.id, payload);
      pushToast({ title: 'Pricing rule updated', variant: 'success' });
    } else {
      addPricingRule(payload);
      pushToast({ title: 'Pricing rule added', variant: 'success' });
    }
    setRuleModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#26352F]">Pricing Engine</h1>
          <p className="mt-1 text-sm text-[#78837C]">
            Transparent currency conversion, landed cost breakdown, gross-margin pricing, and supplier cost alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="rounded-lg border border-[#CDDCE4] bg-[#EEF3F6] px-2.5 py-1.5 text-[11px] font-medium text-[#4C6878]">
            {DEMO_RATE_UPDATED_LABEL}
          </span>
          <div className="flex items-center gap-1.5 rounded-lg border border-[#E6EAE4] bg-white px-2.5 py-1.5 text-xs">
            <span className="text-[#78837C]">Base Currency:</span>
            <select
              value={settings.baseCurrency}
              onChange={(e) => {
                const nextCurr = e.target.value as CurrencyCode;
                changeBaseCurrency(nextCurr);
                pushToast({
                  title: `Base currency switched to ${nextCurr}`,
                  description: 'Recalculated catalog prices using demo FX rates.',
                  variant: 'info',
                });
              }}
              className="font-semibold text-[#26352F] bg-transparent focus:outline-none"
            >
              {(['USD', 'EUR', 'GBP', 'TRY', 'CNY'] as CurrencyCode[]).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Pricing KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Configured Products', val: pricingStats.configured, tone: 'text-[#26352F]' },
          { label: 'Requiring Review', val: pricingStats.needsReview, tone: 'text-[#8E6932]' },
          { label: 'Supplier Cost Alerts', val: pricingStats.pendingAlerts, tone: 'text-[#9F514B]' },
          { label: 'Avg Gross Margin', val: `${pricingStats.avgMarginPct}%`, tone: 'text-[#344D3D]' },
          { label: 'Outdated Rate Checks', val: pricingStats.outdatedFx, tone: 'text-[#4C6878]' },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-[#E6EAE4] bg-white p-4 shadow-sf-xs">
            <p className="text-[11px] font-medium text-[#78837C]">{k.label}</p>
            <p className={`mt-1.5 font-display text-2xl font-semibold tabular-nums ${k.tone}`}>{k.val}</p>
          </div>
        ))}
      </div>

      {/* Interactive Calculator + Formula Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls */}
        <section className="lg:col-span-6 rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6EAE4] pb-3">
            <h2 className="font-display text-base font-semibold text-[#26352F]">
              Interactive Pricing Calculator
            </h2>
            <select
              value={selectedProduct.id}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="rounded-lg border border-[#E6EAE4] bg-[#F7F8F5] px-3 py-1.5 text-xs font-medium text-[#26352F] max-w-[230px]"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} — {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <label className="block font-medium text-[#26352F] mb-1">Supplier Wholesale Cost</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 tabular-nums focus:border-[#526D5B] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-[#26352F] mb-1">Supplier Currency</label>
              <select
                value={supCurrency}
                onChange={(e) => {
                  const curr = e.target.value as CurrencyCode;
                  setSupCurrency(curr);
                  setFxRate(getCrossRate(curr, settings.baseCurrency));
                }}
                className="w-full rounded-lg border border-[#E6EAE4] bg-white px-3 py-2"
              >
                {(['EUR', 'USD', 'GBP', 'TRY', 'CNY'] as CurrencyCode[]).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-[#26352F] mb-1">
                Demo FX Rate ({supCurrency} → {settings.baseCurrency})
              </label>
              <input
                type="number"
                step="0.01"
                min="0.001"
                value={fxRate}
                onChange={(e) => setFxRate(Number(e.target.value))}
                className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 tabular-nums focus:border-[#526D5B] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-[#26352F] mb-1">
                Freight ({settings.baseCurrency})
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={freight}
                onChange={(e) => setFreight(Number(e.target.value))}
                className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 tabular-nums focus:border-[#526D5B] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-[#26352F] mb-1">
                Import Duty ({settings.baseCurrency})
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={duty}
                onChange={(e) => setDuty(Number(e.target.value))}
                className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 tabular-nums focus:border-[#526D5B] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-[#26352F] mb-1">
                Additional Expenses ({settings.baseCurrency})
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={extra}
                onChange={(e) => setExtra(Number(e.target.value))}
                className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 tabular-nums focus:border-[#526D5B] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-1 text-xs">
            <div className="flex items-center justify-between mb-1">
              <label className="font-medium text-[#26352F]">Target Gross Margin</label>
              <span className="font-semibold text-[#344D3D] tabular-nums">{marginPct}%</span>
            </div>
            <input
              type="range"
              min={15}
              max={75}
              step={1}
              value={marginPct}
              onChange={(e) => setMarginPct(Number(e.target.value))}
              className="w-full accent-[#344D3D]"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#E6EAE4]">
            <span className="text-[11px] text-[#78837C]">
              Formula: Landed Cost ÷ (1 − Margin)
            </span>
            <button
              type="button"
              onClick={handleSaveToProduct}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#344D3D] px-4 py-2 text-xs font-medium text-white hover:bg-[#293E31]"
            >
              <Save className="h-3.5 w-3.5" />
              Save Pricing to {selectedProduct.sku}
            </button>
          </div>
        </section>

        {/* Transparent Breakdown */}
        <section className="lg:col-span-6 rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E6EAE4] pb-3">
            <h2 className="font-display text-base font-semibold text-[#26352F]">
              Calculation Breakdown
            </h2>
            <span className="rounded-md bg-[#F0F2ED] px-2 py-0.5 text-[11px] font-medium text-[#26352F]">
              Demo FX Reference
            </span>
          </div>

          <div className="divide-y divide-[#E6EAE4] text-xs tabular-nums">
            <div className="flex justify-between py-2.5">
              <span className="text-[#78837C]">Supplier Cost</span>
              <span className="font-medium text-[#26352F]">{formatCurrency(cost, supCurrency)}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-[#78837C]">Currency Conversion Rate</span>
              <span className="text-[#26352F]">× {fxRate}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-[#78837C]">Converted Supplier Cost</span>
              <span className="font-medium text-[#26352F]">{formatCurrency(calc.convertedCost, settings.baseCurrency)}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-[#78837C]">Freight</span>
              <span className="text-[#26352F]">+ {formatCurrency(freight, settings.baseCurrency)}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-[#78837C]">Import Duty</span>
              <span className="text-[#26352F]">+ {formatCurrency(duty, settings.baseCurrency)}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-[#78837C]">Additional Expenses</span>
              <span className="text-[#26352F]">+ {formatCurrency(extra, settings.baseCurrency)}</span>
            </div>
            <div className="flex justify-between py-3 font-semibold text-[#26352F] bg-[#F7F8F5] px-2.5 rounded-lg my-1">
              <span>Total Landed Cost</span>
              <span>{formatCurrency(calc.landedCost, settings.baseCurrency)}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-[#78837C]">Target Gross Margin ({marginPct}%)</span>
              <span className="text-[#344D3D] font-medium">
                ÷ {(1 - marginPct / 100).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-[#C9DBC9] bg-[#E9F0E9]/70 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#344D3D]">Recommended Selling Price</p>
              <p className="text-[11px] text-[#526D5B] tabular-nums">
                Gross profit: {formatCurrency(calc.grossProfit, settings.baseCurrency)} / unit
              </p>
            </div>
            <p className="font-display text-2xl font-semibold text-[#344D3D] tabular-nums">
              {formatCurrency(calc.sellingPrice, settings.baseCurrency)}
            </p>
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-[#CDDCE4] bg-[#EEF3F6] p-3 text-[11px] text-[#4C6878]">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
              <strong>Margin vs. Markup:</strong> A {calc.actualMarginPct}% gross margin equals a{' '}
              {calc.equivalentMarkupPct}% markup on landed cost. SUPPLYFLOW always prices from gross margin so profit share stays predictable.
            </p>
          </div>
        </section>
      </div>

      {/* Supplier Price Change Alerts */}
      <section className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-4">
        <div>
          <h2 className="font-display text-base font-semibold text-[#26352F]">
            Supplier Price Change Alerts
          </h2>
          <p className="text-xs text-[#78837C]">
            Review wholesale cost shifts detected from supplier line sheets and accept or keep baseline pricing.
          </p>
        </div>

        <div className="space-y-3">
          {priceAlerts.map((alert) => {
            const product = products.find((p) => p.id === alert.productId);
            const pctChange = (((alert.newCost - alert.previousCost) / alert.previousCost) * 100).toFixed(1);
            const currentRetail = product?.pricing.sellingPrice ?? 0;
            const recCalc = product
              ? calculateSellingPrice({
                  supplierCost: alert.newCost,
                  supplierCurrency: product.pricing.supplierCurrency,
                  exchangeRate: product.pricing.exchangeRate,
                  freight: product.pricing.freight,
                  duty: product.pricing.duty,
                  additionalExpenses: product.pricing.additionalExpenses,
                  targetGrossMargin: product.pricing.targetGrossMargin,
                })
              : null;

            return (
              <div
                key={alert.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] p-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-[#26352F]">
                      {alert.supplierName} updated the wholesale price of SKU {alert.sku} from{' '}
                      {formatCurrency(alert.previousCost, alert.currency)} to{' '}
                      {formatCurrency(alert.newCost, alert.currency)}
                    </span>
                    <span className="rounded bg-[#FAF3E6] px-1.5 py-0.5 font-semibold text-[#8E6932] tabular-nums">
                      +{pctChange}%
                    </span>
                    <StatusBadge label={alert.status} />
                  </div>
                  <p className="text-[11px] text-[#78837C] tabular-nums">
                    {alert.productName} • Previous retail: {formatCurrency(currentRetail, settings.baseCurrency)} → New recommended:{' '}
                    <strong className="text-[#26352F]">
                      {formatCurrency(recCalc?.sellingPrice ?? currentRetail, settings.baseCurrency)}
                    </strong>
                  </p>
                </div>

                {alert.status === 'Pending' && (
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProductId(alert.productId);
                        setCost(alert.newCost);
                        pushToast({
                          title: `Loaded ${alert.sku} new cost into calculator`,
                          variant: 'info',
                        });
                      }}
                      className="rounded-lg border border-[#E6EAE4] bg-white px-3 py-1.5 font-medium text-[#26352F] hover:bg-[#F0F2ED]"
                    >
                      Review change
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resolvePriceAlert(alert.id, 'Accepted');
                        pushToast({
                          title: `Accepted new pricing for ${alert.sku}`,
                          description: 'Catalog selling price recalculated.',
                          variant: 'success',
                        });
                      }}
                      className="rounded-lg bg-[#344D3D] px-3 py-1.5 font-medium text-white hover:bg-[#293E31]"
                    >
                      Accept new pricing
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resolvePriceAlert(alert.id, 'Kept Existing');
                        pushToast({
                          title: `Kept existing price for ${alert.sku}`,
                          variant: 'info',
                        });
                      }}
                      className="rounded-lg border border-[#E6EAE4] bg-white px-3 py-1.5 font-medium text-[#78837C]"
                    >
                      Keep existing price
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Configurable Pricing Rules */}
      <section className="rounded-2xl border border-[#E6EAE4] bg-white p-5 shadow-sf-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-semibold text-[#26352F]">
              Category Pricing Rules
            </h2>
            <p className="text-xs text-[#78837C]">
              Configure target gross margin, freight, and duty defaults per category.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openRuleModal()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6EAE4] bg-[#F7F8F5] px-3.5 py-2 text-xs font-medium text-[#26352F] hover:bg-[#E9F0E9]"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Rule
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pricingRules.map((rule) => {
            const affectedCount =
              rule.category === 'All'
                ? products.length
                : products.filter((p) => p.category === rule.category).length;

            return (
              <div
                key={rule.id}
                className="flex flex-col justify-between rounded-xl border border-[#E6EAE4] bg-[#F7F8F5] p-4 text-xs space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-[#26352F]">{rule.name}</p>
                      <p className="text-[11px] text-[#78837C]">
                        Category: {rule.category} ({affectedCount} products)
                      </p>
                    </div>
                    <span className="rounded-md bg-[#E9F0E9] px-2 py-0.5 font-semibold text-[#344D3D] tabular-nums">
                      {Math.round(rule.targetMargin * 100)}%
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-[#78837C] tabular-nums">
                    <span>Freight: {formatCurrency(rule.defaultFreight, settings.baseCurrency)}</span>
                    <span>Duty: {formatCurrency(rule.defaultDuty, settings.baseCurrency)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E6EAE4]">
                  <button
                    type="button"
                    onClick={() => {
                      const count = applyPricingRuleToCategory(rule);
                      pushToast({
                        title: `Applied "${rule.name}"`,
                        description: `Recalculated ${count} products in ${rule.category}.`,
                        variant: 'success',
                      });
                    }}
                    className="font-medium text-[#344D3D] hover:underline"
                  >
                    Apply to {affectedCount} products
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openRuleModal(rule)}
                      className="text-[#78837C] hover:text-[#26352F]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePricingRule(rule.id)}
                      className="text-[#9F514B]"
                      aria-label={`Delete ${rule.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Add/Edit Rule Modal */}
      <Modal
        open={ruleModalOpen}
        onClose={() => setRuleModalOpen(false)}
        title={editingRule ? 'Edit Pricing Rule' : 'Add Pricing Rule'}
      >
        <form onSubmit={handleSaveRule} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-[#26352F] mb-1">Rule Name</label>
            <input
              required
              value={ruleForm.name}
              onChange={(e) => setRuleForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g., Seasonal Accessories Rule"
              className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#26352F] mb-1">Category</label>
              <select
                value={ruleForm.category}
                onChange={(e) => setRuleForm((f) => ({ ...f, category: e.target.value as any }))}
                className="w-full rounded-lg border border-[#E6EAE4] bg-white px-3 py-2"
              >
                <option value="Apparel">Apparel</option>
                <option value="Shoes">Shoes</option>
                <option value="Accessories">Accessories</option>
                <option value="All">All Categories</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-[#26352F] mb-1">Target Margin (%)</label>
              <input
                type="number"
                min={5}
                max={90}
                value={ruleForm.targetMarginPct}
                onChange={(e) => setRuleForm((f) => ({ ...f, targetMarginPct: Number(e.target.value) }))}
                className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 tabular-nums"
              />
            </div>
            <div>
              <label className="block font-medium text-[#26352F] mb-1">Freight ({settings.baseCurrency})</label>
              <input
                type="number"
                step="0.5"
                value={ruleForm.defaultFreight}
                onChange={(e) => setRuleForm((f) => ({ ...f, defaultFreight: Number(e.target.value) }))}
                className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 tabular-nums"
              />
            </div>
            <div>
              <label className="block font-medium text-[#26352F] mb-1">Duty ({settings.baseCurrency})</label>
              <input
                type="number"
                step="0.5"
                value={ruleForm.defaultDuty}
                onChange={(e) => setRuleForm((f) => ({ ...f, defaultDuty: Number(e.target.value) }))}
                className="w-full rounded-lg border border-[#E6EAE4] px-3 py-2 tabular-nums"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium text-[#26352F] mb-1">Rounding Rule</label>
            <select
              value={ruleForm.roundingRule}
              onChange={(e) => setRuleForm((f) => ({ ...f, roundingRule: e.target.value as any }))}
              className="w-full rounded-lg border border-[#E6EAE4] bg-white px-3 py-2"
            >
              <option value="None">Exact 2 decimals</option>
              <option value=".99">End in .99</option>
              <option value=".95">End in .95</option>
              <option value="Nearest 1">Nearest whole unit</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setRuleModalOpen(false)}
              className="rounded-lg border border-[#E6EAE4] px-3.5 py-2 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#344D3D] px-4 py-2 font-medium text-white"
            >
              Save Rule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

