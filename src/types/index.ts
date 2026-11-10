export type CurrencyCode = 'EUR' | 'USD' | 'GBP' | 'TRY' | 'CNY';

export type ProductCategory = 'Apparel' | 'Shoes' | 'Accessories';

export type SubmissionMethod =
  | 'Messaging'
  | 'Excel'
  | 'CSV'
  | 'File Upload'
  | 'Manual Entry'
  | 'Supplier Portal';

export type ApprovalStatus =
  | 'Received'
  | 'Processing'
  | 'Awaiting Review'
  | 'Ready for Approval'
  | 'Needs Changes'
  | 'Approved'
  | 'Shopify Ready'
  | 'Rejected';

export type ImageCategory =
  | 'Original'
  | 'On-model'
  | 'Studio catalog'
  | 'Lifestyle'
  | 'Product detail';

export type PhotographyStyle =
  | 'On-model studio'
  | 'Clean white background'
  | 'Lifestyle photography'
  | 'Premium catalog'
  | 'Detail photography';

export type StudioBackground =
  | 'Pure white'
  | 'Warm ivory'
  | 'Neutral studio'
  | 'Lifestyle environment';

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface ProductImage {
  id: string;
  url: string;
  label: string;
  category: ImageCategory;
  isPrimary: boolean;
  presetApplied?: string;
}

export interface ProductAttributes {
  material: string;
  fabric: string;
  color: string;
  pattern: string;
  gender: 'Men' | 'Women' | 'Unisex';
  productType: string;
  season: string;
  careInstructions: string;
  fitNotes?: string;
}

export interface ProductVariant {
  id: string;
  color: string;
  size: string;
  availableStock: number;
  reservedStock: number;
  reorderThreshold: number;
  lastUpdated: string;
}

export interface ProductPricing {
  supplierCost: number;
  supplierCurrency: CurrencyCode;
  exchangeRate: number;
  freight: number;
  duty: number;
  additionalExpenses: number;
  targetGrossMargin: number; // 0.40 = 40%
  convertedCost: number;
  landedCost: number;
  sellingPrice: number;
  priceLastUpdated: string;
}

export interface ProductActivityEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  type: 'intake' | 'ai' | 'pricing' | 'inventory' | 'approval' | 'edit';
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  supplierId: string;
  category: ProductCategory;
  images: ProductImage[];
  descriptionEn: string;
  descriptionEs: string;
  attributes: ProductAttributes;
  variants: ProductVariant[];
  pricing: ProductPricing;
  approvalStatus: ApprovalStatus;
  approvalNotes?: string;
  rejectionReason?: string;
  submissionMethod: SubmissionMethod;
  lastUpdated: string;
  imagesLastReviewed: string;
  activity: ProductActivityEntry[];
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  country: string;
  currency: CurrencyCode;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  preferredMethod: SubmissionMethod;
  categories: ProductCategory[];
  defaultFreight: number;
  defaultDuty: number;
  targetMarginOverride?: number;
  connectionStatus: 'Connected' | 'Active' | 'Attention Needed';
  productsReceived: number;
  lastSubmission: string;
  autoExtract: boolean;
  autoPricing: boolean;
  notes: string;
  submissionHistory: {
    id: string;
    date: string;
    method: SubmissionMethod;
    itemCount: number;
    status: 'Processed' | 'Needs Review' | 'Queued';
    reference: string;
  }[];
}

export interface IntakeSubmission {
  id: string;
  reference: string;
  supplierId: string;
  method: SubmissionMethod;
  submittedAt: string;
  status: 'Awaiting Extraction' | 'Successfully Extracted' | 'Needs Attention' | 'Failed';
  fileName?: string;
  itemCount: number;
  productName: string;
  sku: string;
  confidence: 'High confidence' | 'Needs review' | 'Missing information';
  errorMessage?: string;
  linkedProductId?: string;
}

export interface PricingRule {
  id: string;
  name: string;
  category: ProductCategory | 'All';
  targetMargin: number;
  defaultFreight: number;
  defaultDuty: number;
  roundingRule: 'None' | '.99' | '.95' | 'Nearest 1';
  active: boolean;
}

export interface SupplierPriceChangeAlert {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  supplierId: string;
  supplierName: string;
  currency: CurrencyCode;
  previousCost: number;
  newCost: number;
  detectedAt: string;
  status: 'Pending' | 'Accepted' | 'Kept Existing';
}

export interface ReplenishmentRequest {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  supplierId: string;
  supplierName: string;
  variantId: string;
  variantLabel: string;
  currentStock: number;
  requestedQty: number;
  expectedDate: string;
  status: 'Requested' | 'Confirmed' | 'In Transit' | 'Received' | 'Cancelled';
  createdAt: string;
}

export interface StockAlert {
  id: string;
  type: 'Low stock' | 'Out of stock' | 'Replenishment required' | 'Supplier stock update needed' | 'Product information outdated';
  severity: 'red' | 'amber' | 'blue';
  productId: string;
  productName: string;
  sku: string;
  variantId?: string;
  variantLabel?: string;
  message: string;
  createdAt: string;
  resolved: boolean;
}

export interface AutomationWorkflowCard {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Paused';
  lastExecution: string;
  executionCount: number;
  successRate: number;
  trigger: string;
}

export interface AutomationLog {
  id: string;
  workflowName: string;
  trigger: string;
  executionTime: string;
  status: 'Success' | 'Warning' | 'Failed';
  durationMs: number;
  processedProduct: string;
  productId?: string;
  summary: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: 'intake' | 'pricing' | 'inventory' | 'approval' | 'ai';
  timestamp: string;
  read: boolean;
  targetRoute: string;
}

export interface WorkspaceSettings {
  workspaceName: string;
  ownerName: string;
  defaultLanguage: 'English' | 'Spanish';
  baseCurrency: CurrencyCode;
  timeZone: string;
  supportedCurrencies: CurrencyCode[];
  defaultSubmissionMethod: SubmissionMethod;
  defaultFreight: number;
  defaultDuty: number;
  defaultMargin: number;
  roundingRule: 'None' | '.99' | '.95';
  lowStockThreshold: number;
  priceFreshnessDays: number;
  stockFreshnessDays: number;
  imageFreshnessDays: number;
  defaultPhotographyStyle: PhotographyStyle;
  defaultDescriptionLanguage: 'English' | 'Bilingual (EN + ES)';
  translationLanguages: string[];
  autoExtraction: boolean;
  autoPricingCalculation: boolean;
  requireManualApproval: boolean;
  notifyOnIntake: boolean;
  notifyOnPriceChange: boolean;
  notifyOnLowStock: boolean;
  notifyOnApprovalReady: boolean;
}

