import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  AppNotification,
  ApprovalStatus,
  AutomationLog,
  AutomationWorkflowCard,
  CurrencyCode,
  IntakeSubmission,
  PricingRule,
  Product,
  ProductActivityEntry,
  ProductImage,
  ProductPricing,
  ReplenishmentRequest,
  StockAlert,
  Supplier,
  SupplierPriceChangeAlert,
  WorkspaceSettings,
} from '../types';
import { SEED_SUPPLIERS } from '../data/suppliers';
import { SEED_PRODUCTS } from '../data/products';
import { SEED_PRICING_RULES, SEED_PRICE_ALERTS } from '../data/pricing';
import { SEED_REPLENISHMENTS, SEED_STOCK_ALERTS } from '../data/inventory';
import { SEED_INTAKE_SUBMISSIONS } from '../data/intake';
import { SEED_AUTOMATION_CARDS, SEED_AUTOMATION_LOGS } from '../data/automations';
import { SEED_NOTIFICATIONS } from '../data/notifications';
import { SEED_SETTINGS } from '../data/settings';
import { clearPersistedState, loadPersistedState, savePersistedState } from '../services/mockStorage';
import { calculateSellingPrice, getCrossRate } from '../services/mockPricing';
import { getProductStockStatus, getVariantStatus, updateInventoryVariant } from '../services/mockInventory';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: 'success' | 'info' | 'warning' | 'error';
}

interface PersistedData {
  suppliers: Supplier[];
  products: Product[];
  intakeSubmissions: IntakeSubmission[];
  pricingRules: PricingRule[];
  priceAlerts: SupplierPriceChangeAlert[];
  replenishments: ReplenishmentRequest[];
  stockAlerts: StockAlert[];
  automationCards: AutomationWorkflowCard[];
  automationLogs: AutomationLog[];
  notifications: AppNotification[];
  settings: WorkspaceSettings;
}

const getInitialPersisted = (): PersistedData => ({
  suppliers: SEED_SUPPLIERS,
  products: SEED_PRODUCTS,
  intakeSubmissions: SEED_INTAKE_SUBMISSIONS,
  pricingRules: SEED_PRICING_RULES,
  priceAlerts: SEED_PRICE_ALERTS,
  replenishments: SEED_REPLENISHMENTS,
  stockAlerts: SEED_STOCK_ALERTS,
  automationCards: SEED_AUTOMATION_CARDS,
  automationLogs: SEED_AUTOMATION_LOGS,
  notifications: SEED_NOTIFICATIONS,
  settings: SEED_SETTINGS,
});

interface SupplyFlowContextValue extends PersistedData {
  toasts: ToastMessage[];
  pushToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;

  // Derived operational metrics (live-computed from shared state)
  metrics: {
    totalProducts: number;
    activeSuppliers: number;
    pendingApprovals: number;
    inventoryAlertsCount: number;
    shopifyReadyCount: number;
    approvedCount: number;
    unreadNotificationsCount: number;
    totalUnits: number;
    lowStockVariants: number;
    outOfStockVariants: number;
    inStockProducts: number;
  };

  // Supplier actions
  addSupplier: (supplier: Omit<Supplier, 'id' | 'code' | 'productsReceived' | 'lastSubmission' | 'submissionHistory'>) => Supplier;
  updateSupplier: (id: string, patch: Partial<Supplier>) => void;

  // Product & Intake actions
  addProduct: (product: Product, submission?: IntakeSubmission) => void;
  updateProduct: (id: string, patch: Partial<Product>, activityNote?: Omit<ProductActivityEntry, 'id' | 'timestamp'>) => void;
  addImageToProduct: (productId: string, image: ProductImage, setPrimary?: boolean) => void;
  removeProductImage: (productId: string, imageId: string) => void;
  setPrimaryProductImage: (productId: string, imageId: string) => void;
  addIntakeSubmission: (submission: IntakeSubmission) => void;
  updateIntakeSubmission: (id: string, patch: Partial<IntakeSubmission>) => void;

  // Pricing actions
  updateProductPricing: (productId: string, pricing: ProductPricing) => void;
  changeBaseCurrency: (currency: CurrencyCode) => void;
  addPricingRule: (rule: Omit<PricingRule, 'id'>) => void;
  updatePricingRule: (id: string, patch: Partial<PricingRule>) => void;
  deletePricingRule: (id: string) => void;
  applyPricingRuleToCategory: (rule: PricingRule) => number;
  resolvePriceAlert: (alertId: string, decision: 'Accepted' | 'Kept Existing') => void;

  // Inventory actions
  updateVariantStock: (productId: string, variantId: string, newAvailableStock: number) => void;
  resolveStockAlert: (alertId: string) => void;
  dismissStockAlert: (alertId: string) => void;
  createReplenishment: (req: Omit<ReplenishmentRequest, 'id' | 'createdAt' | 'status'>) => void;
  updateReplenishmentStatus: (id: string, status: ReplenishmentRequest['status']) => void;

  // Approval actions
  approveProduct: (productId: string, targetStatus?: 'Approved' | 'Shopify Ready') => void;
  requestProductChanges: (productId: string, notes: string) => void;
  rejectProduct: (productId: string, reason: string) => void;

  // Automation actions
  toggleAutomationCard: (id: string) => void;
  recordAutomationRun: (log: Omit<AutomationLog, 'id'>) => void;

  // Notification actions
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  dismissNotification: (id: string) => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'read'>) => void;

  // Settings & Demo Reset
  updateSettings: (patch: Partial<WorkspaceSettings>) => void;
  resetDemoData: () => void;
}

const SupplyFlowContext = createContext<SupplyFlowContextValue | null>(null);

const TODAY = '2026-11-10';

export const SupplyFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PersistedData>(() => loadPersistedState(getInitialPersisted()));
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    savePersistedState(state);
  }, [state]);

  const pushToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addNotification = useCallback((notif: Omit<AppNotification, 'id' | 'read'>) => {
    setState((prev) => ({
      ...prev,
      notifications: [
        { ...notif, id: `notif-${Date.now()}`, read: false },
        ...prev.notifications,
      ],
    }));
  }, []);

  const addSupplier = useCallback(
    (input: Omit<Supplier, 'id' | 'code' | 'productsReceived' | 'lastSubmission' | 'submissionHistory'>) => {
      const nextNum = state.suppliers.length + 1;
      const newSupplier: Supplier = {
        ...input,
        id: `sup-${Date.now()}`,
        code: `SUP-${String(nextNum).padStart(3, '0')}`,
        productsReceived: 0,
        lastSubmission: TODAY,
        submissionHistory: [],
      };
      setState((prev) => ({
        ...prev,
        suppliers: [newSupplier, ...prev.suppliers],
      }));
      pushToast({
        title: `Supplier "${newSupplier.name}" added`,
        description: `Configured for ${newSupplier.preferredMethod} submissions in ${newSupplier.currency}.`,
        variant: 'success',
      });
      return newSupplier;
    },
    [state.suppliers.length, pushToast]
  );

  const updateSupplier = useCallback((id: string, patch: Partial<Supplier>) => {
    setState((prev) => ({
      ...prev,
      suppliers: prev.suppliers.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }, []);

  const addProduct = useCallback(
    (product: Product, submission?: IntakeSubmission) => {
      setState((prev) => ({
        ...prev,
        products: [product, ...prev.products],
        suppliers: prev.suppliers.map((s) =>
          s.id === product.supplierId
            ? { ...s, productsReceived: s.productsReceived + 1, lastSubmission: TODAY }
            : s
        ),
        intakeSubmissions: submission ? [submission, ...prev.intakeSubmissions] : prev.intakeSubmissions,
        notifications: [
          {
            id: `notif-${Date.now()}`,
            title: `New product staged: ${product.name}`,
            message: `SKU ${product.sku} extracted and queued for review in Approval Center.`,
            category: 'intake',
            timestamp: 'Just now',
            read: false,
            targetRoute: `/app/catalog/${product.id}`,
          },
          ...prev.notifications,
        ],
      }));
    },
    []
  );

  const updateProduct = useCallback(
    (
      id: string,
      patch: Partial<Product>,
      activityNote?: Omit<ProductActivityEntry, 'id' | 'timestamp'>
    ) => {
      const nowLabel = `${TODAY} ${new Date().toTimeString().slice(0, 5)}`;
      setState((prev) => ({
        ...prev,
        products: prev.products.map((p) => {
          if (p.id !== id) return p;
          const nextActivity = activityNote
            ? [
                {
                  ...activityNote,
                  id: `act-${Date.now()}`,
                  timestamp: nowLabel,
                },
                ...p.activity,
              ]
            : p.activity;
          return {
            ...p,
            ...patch,
            lastUpdated: TODAY,
            activity: nextActivity,
          };
        }),
      }));
    },
    []
  );

  const addImageToProduct = useCallback(
    (productId: string, image: ProductImage, setPrimary = false) => {
      setState((prev) => ({
        ...prev,
        products: prev.products.map((p) => {
          if (p.id !== productId) return p;
          const updatedImages = setPrimary
            ? [...p.images.map((i) => ({ ...i, isPrimary: false })), { ...image, isPrimary: true }]
            : [...p.images, image];
          return {
            ...p,
            images: updatedImages,
            imagesLastReviewed: TODAY,
            lastUpdated: TODAY,
            activity: [
              {
                id: `act-${Date.now()}`,
                timestamp: `${TODAY} ${new Date().toTimeString().slice(0, 5)}`,
                actor: 'AI Product Studio',
                action: `Added ${image.category} image`,
                details: image.presetApplied || image.label,
                type: 'ai',
              },
              ...p.activity,
            ],
          };
        }),
      }));
    },
    []
  );

  const removeProductImage = useCallback((productId: string, imageId: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) => {
        if (p.id !== productId) return p;
        const remaining = p.images.filter((i) => i.id !== imageId);
        if (remaining.length > 0 && !remaining.some((i) => i.isPrimary)) {
          remaining[0] = { ...remaining[0], isPrimary: true };
        }
        return { ...p, images: remaining, lastUpdated: TODAY };
      }),
    }));
  }, []);

  const setPrimaryProductImage = useCallback((productId: string, imageId: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          images: p.images.map((i) => ({ ...i, isPrimary: i.id === imageId })),
          lastUpdated: TODAY,
        };
      }),
    }));
  }, []);

  const addIntakeSubmission = useCallback((submission: IntakeSubmission) => {
    setState((prev) => ({
      ...prev,
      intakeSubmissions: [submission, ...prev.intakeSubmissions],
    }));
  }, []);

  const updateIntakeSubmission = useCallback((id: string, patch: Partial<IntakeSubmission>) => {
    setState((prev) => ({
      ...prev,
      intakeSubmissions: prev.intakeSubmissions.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }, []);

  const updateProductPricing = useCallback((productId: string, pricing: ProductPricing) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId
          ? {
              ...p,
              pricing: { ...pricing, priceLastUpdated: TODAY },
              lastUpdated: TODAY,
              activity: [
                {
                  id: `act-${Date.now()}`,
                  timestamp: `${TODAY} ${new Date().toTimeString().slice(0, 5)}`,
                  actor: 'Pricing Engine',
                  action: 'Updated retail pricing formula',
                  details: `Selling price set to ${pricing.sellingPrice.toFixed(2)} (${Math.round(
                    pricing.targetGrossMargin * 100
                  )}% gross margin).`,
                  type: 'pricing',
                },
                ...p.activity,
              ],
            }
          : p
      ),
    }));
  }, []);

  const changeBaseCurrency = useCallback((currency: CurrencyCode) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, baseCurrency: currency },
      products: prev.products.map((p) => {
        const rate = getCrossRate(p.pricing.supplierCurrency, currency);
        const calc = calculateSellingPrice({
          supplierCost: p.pricing.supplierCost,
          supplierCurrency: p.pricing.supplierCurrency,
          exchangeRate: rate,
          freight: p.pricing.freight,
          duty: p.pricing.duty,
          additionalExpenses: p.pricing.additionalExpenses,
          targetGrossMargin: p.pricing.targetGrossMargin,
        });
        return {
          ...p,
          pricing: {
            ...p.pricing,
            exchangeRate: rate,
            convertedCost: calc.convertedCost,
            landedCost: calc.landedCost,
            sellingPrice: calc.sellingPrice,
          },
        };
      }),
    }));
  }, []);

  const addPricingRule = useCallback((rule: Omit<PricingRule, 'id'>) => {
    setState((prev) => ({
      ...prev,
      pricingRules: [...prev.pricingRules, { ...rule, id: `rule-${Date.now()}` }],
    }));
  }, []);

  const updatePricingRule = useCallback((id: string, patch: Partial<PricingRule>) => {
    setState((prev) => ({
      ...prev,
      pricingRules: prev.pricingRules.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
  }, []);

  const deletePricingRule = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      pricingRules: prev.pricingRules.filter((r) => r.id !== id),
    }));
  }, []);

  const applyPricingRuleToCategory = useCallback(
    (rule: PricingRule) => {
      let updatedCount = 0;
      setState((prev) => {
        const nextProducts = prev.products.map((p) => {
          if (rule.category !== 'All' && p.category !== rule.category) return p;
          updatedCount += 1;
          const calc = calculateSellingPrice({
            supplierCost: p.pricing.supplierCost,
            supplierCurrency: p.pricing.supplierCurrency,
            exchangeRate: p.pricing.exchangeRate,
            freight: rule.defaultFreight,
            duty: rule.defaultDuty,
            additionalExpenses: p.pricing.additionalExpenses,
            targetGrossMargin: rule.targetMargin,
            roundingRule: rule.roundingRule,
          });
          return {
            ...p,
            pricing: {
              ...p.pricing,
              freight: rule.defaultFreight,
              duty: rule.defaultDuty,
              targetGrossMargin: rule.targetMargin,
              convertedCost: calc.convertedCost,
              landedCost: calc.landedCost,
              sellingPrice: calc.sellingPrice,
              priceLastUpdated: TODAY,
            },
          };
        });
        return { ...prev, products: nextProducts };
      });
      return updatedCount;
    },
    []
  );

  const resolvePriceAlert = useCallback(
    (alertId: string, decision: 'Accepted' | 'Kept Existing') => {
      setState((prev) => {
        const alert = prev.priceAlerts.find((a) => a.id === alertId);
        if (!alert) return prev;
        const nextProducts = prev.products.map((p) => {
          if (p.id !== alert.productId) return p;
          if (decision === 'Kept Existing') {
            return {
              ...p,
              activity: [
                {
                  id: `act-${Date.now()}`,
                  timestamp: `${TODAY} ${new Date().toTimeString().slice(0, 5)}`,
                  actor: 'Jack',
                  action: 'Kept existing selling price',
                  details: `Retained baseline price despite supplier cost change on ${alert.sku}.`,
                  type: 'pricing' as const,
                },
                ...p.activity,
              ],
            };
          }
          const calc = calculateSellingPrice({
            supplierCost: alert.newCost,
            supplierCurrency: p.pricing.supplierCurrency,
            exchangeRate: p.pricing.exchangeRate,
            freight: p.pricing.freight,
            duty: p.pricing.duty,
            additionalExpenses: p.pricing.additionalExpenses,
            targetGrossMargin: p.pricing.targetGrossMargin,
          });
          return {
            ...p,
            pricing: {
              ...p.pricing,
              supplierCost: alert.newCost,
              convertedCost: calc.convertedCost,
              landedCost: calc.landedCost,
              sellingPrice: calc.sellingPrice,
              priceLastUpdated: TODAY,
            },
            lastUpdated: TODAY,
            activity: [
              {
                id: `act-${Date.now()}`,
                timestamp: `${TODAY} ${new Date().toTimeString().slice(0, 5)}`,
                actor: 'Jack',
                action: 'Accepted supplier cost update',
                details: `Updated cost ${alert.previousCost} → ${alert.newCost} ${alert.currency}; recalculated retail price.`,
                type: 'pricing' as const,
              },
              ...p.activity,
            ],
          };
        });
        return {
          ...prev,
          products: nextProducts,
          priceAlerts: prev.priceAlerts.map((a) =>
            a.id === alertId ? { ...a, status: decision } : a
          ),
        };
      });
    },
    []
  );

  const updateVariantStock = useCallback(
    (productId: string, variantId: string, newAvailableStock: number) => {
      setState((prev) => {
        const threshold = prev.settings.lowStockThreshold;
        let updatedProductName = '';
        let updatedSku = '';
        let updatedVariantLabel = '';

        const nextProducts = prev.products.map((p) => {
          if (p.id !== productId) return p;
          updatedProductName = p.name;
          updatedSku = p.sku;
          const nextVariants = updateInventoryVariant(p.variants, variantId, newAvailableStock, TODAY);
          const v = nextVariants.find((item) => item.id === variantId);
          if (v) updatedVariantLabel = `${v.color} / ${v.size}`;
          return {
            ...p,
            variants: nextVariants,
            lastUpdated: TODAY,
          };
        });

        // Synchronize stockAlerts automatically for this variant
        let nextAlerts = prev.stockAlerts.map((a) => {
          if (a.productId === productId && a.variantId === variantId) {
            if (newAvailableStock > threshold) {
              return { ...a, resolved: true };
            }
            return {
              ...a,
              resolved: false,
              type: newAvailableStock <= 0 ? ('Out of stock' as const) : ('Low stock' as const),
              severity: newAvailableStock <= 0 ? ('red' as const) : ('amber' as const),
              message:
                newAvailableStock <= 0
                  ? `${updatedVariantLabel} has 0 available units.`
                  : `${updatedVariantLabel} has ${newAvailableStock} units remaining (threshold: ${threshold}).`,
            };
          }
          return a;
        });

        const hasExistingVariantAlert = nextAlerts.some(
          (a) => a.productId === productId && a.variantId === variantId
        );
        if (!hasExistingVariantAlert && newAvailableStock <= threshold && updatedProductName) {
          nextAlerts = [
            {
              id: `sa-${Date.now()}`,
              type: newAvailableStock <= 0 ? 'Out of stock' : 'Low stock',
              severity: newAvailableStock <= 0 ? 'red' : 'amber',
              productId,
              productName: updatedProductName,
              sku: updatedSku,
              variantId,
              variantLabel: updatedVariantLabel,
              message:
                newAvailableStock <= 0
                  ? `${updatedVariantLabel} dropped to 0 units.`
                  : `${updatedVariantLabel} fell to ${newAvailableStock} units (reorder threshold: ${threshold}).`,
              createdAt: `${TODAY} ${new Date().toTimeString().slice(0, 5)}`,
              resolved: false,
            },
            ...nextAlerts,
          ];
        }

        return {
          ...prev,
          products: nextProducts,
          stockAlerts: nextAlerts,
        };
      });
    },
    []
  );

  const resolveStockAlert = useCallback((alertId: string) => {
    setState((prev) => ({
      ...prev,
      stockAlerts: prev.stockAlerts.map((a) => (a.id === alertId ? { ...a, resolved: true } : a)),
    }));
  }, []);

  const dismissStockAlert = useCallback((alertId: string) => {
    setState((prev) => ({
      ...prev,
      stockAlerts: prev.stockAlerts.filter((a) => a.id !== alertId),
    }));
  }, []);

  const createReplenishment = useCallback(
    (req: Omit<ReplenishmentRequest, 'id' | 'createdAt' | 'status'>) => {
      const next: ReplenishmentRequest = {
        ...req,
        id: `rep-${Date.now()}`,
        createdAt: TODAY,
        status: 'Requested',
      };
      setState((prev) => ({
        ...prev,
        replenishments: [next, ...prev.replenishments],
      }));
    },
    []
  );

  const updateReplenishmentStatus = useCallback(
    (id: string, status: ReplenishmentRequest['status']) => {
      setState((prev) => {
        const target = prev.replenishments.find((r) => r.id === id);
        let nextProducts = prev.products;
        if (target && status === 'Received' && target.status !== 'Received') {
          nextProducts = prev.products.map((p) => {
            if (p.id !== target.productId) return p;
            return {
              ...p,
              variants: p.variants.map((v) =>
                v.id === target.variantId
                  ? { ...v, availableStock: v.availableStock + target.requestedQty, lastUpdated: TODAY }
                  : v
              ),
              lastUpdated: TODAY,
            };
          });
        }
        return {
          ...prev,
          products: nextProducts,
          replenishments: prev.replenishments.map((r) => (r.id === id ? { ...r, status } : r)),
        };
      });
    },
    []
  );

  const approveProduct = useCallback(
    (productId: string, targetStatus: 'Approved' | 'Shopify Ready' = 'Shopify Ready') => {
      setState((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p.id === productId
            ? {
                ...p,
                approvalStatus: targetStatus,
                approvalNotes: undefined,
                rejectionReason: undefined,
                lastUpdated: TODAY,
                activity: [
                  {
                    id: `act-${Date.now()}`,
                    timestamp: `${TODAY} ${new Date().toTimeString().slice(0, 5)}`,
                    actor: 'Jack',
                    action: `Approved product (${targetStatus})`,
                    details: 'All catalog, pricing, imagery, and inventory checks verified by owner.',
                    type: 'approval',
                  },
                  ...p.activity,
                ],
              }
            : p
        ),
      }));
    },
    []
  );

  const requestProductChanges = useCallback((productId: string, notes: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId
          ? {
              ...p,
              approvalStatus: 'Needs Changes',
              approvalNotes: notes,
              lastUpdated: TODAY,
              activity: [
                {
                  id: `act-${Date.now()}`,
                  timestamp: `${TODAY} ${new Date().toTimeString().slice(0, 5)}`,
                  actor: 'Jack',
                  action: 'Requested product changes',
                  details: notes,
                  type: 'approval',
                },
                ...p.activity,
              ],
            }
          : p
      ),
    }));
  }, []);

  const rejectProduct = useCallback((productId: string, reason: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId
          ? {
              ...p,
              approvalStatus: 'Rejected',
              rejectionReason: reason,
              lastUpdated: TODAY,
              activity: [
                {
                  id: `act-${Date.now()}`,
                  timestamp: `${TODAY} ${new Date().toTimeString().slice(0, 5)}`,
                  actor: 'Jack',
                  action: 'Rejected product',
                  details: reason,
                  type: 'approval',
                },
                ...p.activity,
              ],
            }
          : p
      ),
    }));
  }, []);

  const toggleAutomationCard = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      automationCards: prev.automationCards.map((c) =>
        c.id === id ? { ...c, status: c.status === 'Active' ? 'Paused' : 'Active' } : c
      ),
    }));
  }, []);

  const recordAutomationRun = useCallback((log: Omit<AutomationLog, 'id'>) => {
    setState((prev) => ({
      ...prev,
      automationLogs: [{ ...log, id: `log-${Date.now()}` }, ...prev.automationLogs],
      automationCards: prev.automationCards.map((c) =>
        c.id === 'auto-1' || c.id === 'auto-2'
          ? { ...c, executionCount: c.executionCount + 1, lastExecution: log.executionTime }
          : c
      ),
    }));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.filter((n) => n.id !== id),
    }));
  }, []);

  const updateSettings = useCallback((patch: Partial<WorkspaceSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...patch },
    }));
  }, []);

  const resetDemoData = useCallback(() => {
    clearPersistedState();
    setState(getInitialPersisted());
    pushToast({
      title: 'Demo workspace restored',
      description: 'All seeded suppliers, products, pricing rules, and inventory levels have been reset.',
      variant: 'info',
    });
  }, [pushToast]);

  const metrics = useMemo(() => {
    const pendingStatuses: ApprovalStatus[] = [
      'Received',
      'Processing',
      'Awaiting Review',
      'Ready for Approval',
      'Needs Changes',
    ];
    const pendingApprovals = state.products.filter((p) =>
      pendingStatuses.includes(p.approvalStatus)
    ).length;
    const shopifyReadyCount = state.products.filter((p) => p.approvalStatus === 'Shopify Ready').length;
    const approvedCount = state.products.filter(
      (p) => p.approvalStatus === 'Approved' || p.approvalStatus === 'Shopify Ready'
    ).length;

    let totalUnits = 0;
    let lowStockVariants = 0;
    let outOfStockVariants = 0;
    let inStockProducts = 0;

    for (const p of state.products) {
      if (getProductStockStatus(p, state.settings.lowStockThreshold) === 'In Stock') {
        inStockProducts += 1;
      }
      for (const v of p.variants) {
        totalUnits += v.availableStock;
        const status = getVariantStatus(v, state.settings.lowStockThreshold);
        if (status === 'Low Stock') lowStockVariants += 1;
        if (status === 'Out of Stock') outOfStockVariants += 1;
      }
    }

    return {
      totalProducts: state.products.length,
      activeSuppliers: state.suppliers.length,
      pendingApprovals,
      inventoryAlertsCount: state.stockAlerts.filter((a) => !a.resolved).length,
      shopifyReadyCount,
      approvedCount,
      unreadNotificationsCount: state.notifications.filter((n) => !n.read).length,
      totalUnits,
      lowStockVariants,
      outOfStockVariants,
      inStockProducts,
    };
  }, [state]);

  const value: SupplyFlowContextValue = {
    ...state,
    toasts,
    pushToast,
    dismissToast,
    metrics,
    addSupplier,
    updateSupplier,
    addProduct,
    updateProduct,
    addImageToProduct,
    removeProductImage,
    setPrimaryProductImage,
    addIntakeSubmission,
    updateIntakeSubmission,
    updateProductPricing,
    changeBaseCurrency,
    addPricingRule,
    updatePricingRule,
    deletePricingRule,
    applyPricingRuleToCategory,
    resolvePriceAlert,
    updateVariantStock,
    resolveStockAlert,
    dismissStockAlert,
    createReplenishment,
    updateReplenishmentStatus,
    approveProduct,
    requestProductChanges,
    rejectProduct,
    toggleAutomationCard,
    recordAutomationRun,
    markNotificationRead,
    markAllNotificationsRead,
    dismissNotification,
    addNotification,
    updateSettings,
    resetDemoData,
  };

  return <SupplyFlowContext.Provider value={value}>{children}</SupplyFlowContext.Provider>;
};

export function useSupplyFlow(): SupplyFlowContextValue {
  const ctx = useContext(SupplyFlowContext);
  if (!ctx) throw new Error('useSupplyFlow must be used inside SupplyFlowProvider');
  return ctx;
}

