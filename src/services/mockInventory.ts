import { Product, ProductVariant, StockStatus } from '../types';

export function getVariantStatus(variant: ProductVariant, lowThresholdOverride?: number): StockStatus {
  const threshold = lowThresholdOverride ?? variant.reorderThreshold;
  if (variant.availableStock <= 0) return 'Out of Stock';
  if (variant.availableStock <= threshold) return 'Low Stock';
  return 'In Stock';
}

export function getProductTotalStock(product: Product): number {
  return product.variants.reduce((acc, v) => acc + v.availableStock, 0);
}

export function getProductStockStatus(product: Product, lowThresholdOverride?: number): StockStatus {
  if (product.variants.length === 0) return 'Out of Stock';
  const total = getProductTotalStock(product);
  if (total === 0) return 'Out of Stock';
  const hasOutOrLow = product.variants.some(
    (v) => getVariantStatus(v, lowThresholdOverride) !== 'In Stock'
  );
  return hasOutOrLow ? 'Low Stock' : 'In Stock';
}

export function daysSince(dateStr: string, referenceDate = '2026-11-10'): number {
  const d1 = new Date(dateStr);
  const d2 = new Date(referenceDate);
  if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) return 0;
  return Math.max(0, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
}

export function updateInventoryVariant(
  variants: ProductVariant[],
  variantId: string,
  newAvailableStock: number,
  today = '2026-11-10'
): ProductVariant[] {
  const sanitized = Math.max(0, Math.floor(Number.isFinite(newAvailableStock) ? newAvailableStock : 0));
  return variants.map((v) =>
    v.id === variantId
      ? {
          ...v,
          availableStock: sanitized,
          lastUpdated: today,
        }
      : v
  );
}

