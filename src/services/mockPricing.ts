import { CurrencyCode, ProductPricing } from '../types';

/**
 * Seeded illustrative exchange rates relative to 1 USD.
 * Clearly labeled throughout the UI as demo reference rates, not live market data.
 */
export const DEMO_USD_RATES: Record<CurrencyCode, number> = {
  USD: 1.0,
  EUR: 1.08,
  GBP: 1.27,
  TRY: 0.029,
  CNY: 0.138,
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  TRY: '₺',
  CNY: '¥',
};

export const DEMO_RATE_UPDATED_LABEL = 'Demo reference rates • Seeded Nov 10, 2026';

export function getCrossRate(from: CurrencyCode, to: CurrencyCode): number {
  if (from === to) return 1;
  const raw = DEMO_USD_RATES[from] / DEMO_USD_RATES[to];
  return Number(raw.toFixed(4));
}

export function formatCurrency(amount: number, currency: CurrencyCode = 'USD'): string {
  const sym = CURRENCY_SYMBOLS[currency] ?? '$';
  const safe = Number.isFinite(amount) ? amount : 0;
  return `${sym}${safe.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export interface PricingCalculationInput {
  supplierCost: number;
  supplierCurrency: CurrencyCode;
  exchangeRate: number;
  freight: number;
  duty: number;
  additionalExpenses?: number;
  targetGrossMargin: number; // e.g., 0.40 for 40%
  roundingRule?: 'None' | '.99' | '.95' | 'Nearest 1';
}

export interface PricingCalculationResult {
  convertedCost: number;
  landedCost: number;
  sellingPrice: number;
  grossProfit: number;
  actualMarginPct: number;
  equivalentMarkupPct: number;
}

/**
 * Implements SUPPLYFLOW's standard gross-margin pricing formula:
 * Converted Cost = Supplier Cost * Exchange Rate
 * Landed Cost = Converted Cost + Freight + Duty + Additional Expenses
 * Selling Price = Landed Cost / (1 - Target Gross Margin)
 */
export function calculateSellingPrice(input: PricingCalculationInput): PricingCalculationResult {
  const safeCost = Math.max(0, Number(input.supplierCost) || 0);
  const safeRate = Math.max(0.0001, Number(input.exchangeRate) || 1);
  const safeFreight = Math.max(0, Number(input.freight) || 0);
  const safeDuty = Math.max(0, Number(input.duty) || 0);
  const safeExtra = Math.max(0, Number(input.additionalExpenses) || 0);
  // Clamp gross margin strictly below 0.95 to avoid division by zero
  const safeMargin = Math.min(0.95, Math.max(0.01, Number(input.targetGrossMargin) || 0.4));

  const convertedCost = Number((safeCost * safeRate).toFixed(2));
  const landedCost = Number((convertedCost + safeFreight + safeDuty + safeExtra).toFixed(2));
  let sellingPrice = landedCost / (1 - safeMargin);

  if (input.roundingRule === '.99') {
    sellingPrice = Math.floor(sellingPrice) + 0.99;
  } else if (input.roundingRule === '.95') {
    sellingPrice = Math.floor(sellingPrice) + 0.95;
  } else if (input.roundingRule === 'Nearest 1') {
    sellingPrice = Math.round(sellingPrice);
  } else {
    sellingPrice = Number(sellingPrice.toFixed(2));
  }

  const grossProfit = Number((sellingPrice - landedCost).toFixed(2));
  const actualMarginPct = sellingPrice > 0 ? Number(((grossProfit / sellingPrice) * 100).toFixed(1)) : 0;
  const equivalentMarkupPct = landedCost > 0 ? Number(((grossProfit / landedCost) * 100).toFixed(1)) : 0;

  return {
    convertedCost,
    landedCost,
    sellingPrice,
    grossProfit,
    actualMarginPct,
    equivalentMarkupPct,
  };
}

export function buildProductPricing(
  supplierCost: number,
  supplierCurrency: CurrencyCode,
  freight: number,
  duty: number,
  targetGrossMargin: number,
  baseCurrency: CurrencyCode = 'USD',
  additionalExpenses = 0,
  priceLastUpdated = '2026-11-08'
): ProductPricing {
  const exchangeRate = getCrossRate(supplierCurrency, baseCurrency);
  const calc = calculateSellingPrice({
    supplierCost,
    supplierCurrency,
    exchangeRate,
    freight,
    duty,
    additionalExpenses,
    targetGrossMargin,
  });

  return {
    supplierCost,
    supplierCurrency,
    exchangeRate,
    freight,
    duty,
    additionalExpenses,
    targetGrossMargin,
    convertedCost: calc.convertedCost,
    landedCost: calc.landedCost,
    sellingPrice: calc.sellingPrice,
    priceLastUpdated,
  };
}

