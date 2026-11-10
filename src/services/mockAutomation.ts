import { delay } from './mockAI';

export interface WorkflowNodeSpec {
  id: string;
  stepNumber: string;
  title: string;
  shortDesc: string;
  role: string;
  receives: string;
  produces: string;
  failureHandling: string;
  sampleDurationMs: number;
}

export const WORKFLOW_NODES: WorkflowNodeSpec[] = [
  {
    id: 'node-upload',
    stepNumber: '01',
    title: 'Supplier Upload',
    shortDesc: 'Centralized intake from chat, CSV, Excel, or portal.',
    role: 'Captures incoming product packets from any configured supplier channel into one standardized payload.',
    receives: 'Raw WhatsApp/messaging media, XLSX/CSV rows, or supplier portal forms.',
    produces: 'Normalized intake bundle ID with supplier metadata and timestamp.',
    failureHandling: 'Rejects corrupted attachments and flags supplier with formatted retry guidance.',
    sampleDurationMs: 280,
  },
  {
    id: 'node-detect',
    stepNumber: '02',
    title: 'File / Message Detection',
    shortDesc: 'Classifies attachments and splits multi-SKU sheets.',
    role: 'Inspects file MIME types, separates product photography from spreadsheets, and queues individual SKUs.',
    receives: 'Intake bundle ID and raw file pointers.',
    produces: 'Typed queue items (image assets, tabular rows, raw text blocks).',
    failureHandling: 'Routes unsupported file formats to Needs Attention queue with clear alert.',
    sampleDurationMs: 240,
  },
  {
    id: 'node-n8n',
    stepNumber: '03',
    title: 'n8n Processing',
    shortDesc: 'Orchestrates enrichment sequence and retries.',
    role: 'Coordinates supplier rules, deduplication checks, and sequential processing nodes in the proposed automation bus.',
    receives: 'Structured queue items and supplier configuration.',
    produces: 'Orchestration execution context and trace log ID.',
    failureHandling: 'Applies exponential backoff retry (up to 3x) before notifying operations.',
    sampleDurationMs: 260,
  },
  {
    id: 'node-extract',
    stepNumber: '04',
    title: 'AI Product Extraction',
    shortDesc: 'Parses fabric, color, sizes, and wholesale cost.',
    role: 'Extracts structured product attributes, variant matrices, and supplier cost tokens from unstructured text or sheets.',
    receives: 'Unstructured supplier messages, row values, and image visual cues.',
    produces: 'JSON schema draft with field-level confidence scores.',
    failureHandling: 'Flags low-confidence fields as Needs Review for Jack prior to approval.',
    sampleDurationMs: 360,
  },
  {
    id: 'node-validate',
    stepNumber: '05',
    title: 'Product Data Validation',
    shortDesc: 'Checks duplicate SKUs and required attributes.',
    role: 'Validates SKU uniqueness across catalog, verifies positive cost figures, and checks required variant dimensions.',
    receives: 'JSON schema draft and current catalog index.',
    produces: 'Validated product candidate or duplicate-SKU warning flag.',
    failureHandling: 'Halts auto-publish on duplicate SKU and prompts Jack to merge or branch.',
    sampleDurationMs: 240,
  },
  {
    id: 'node-images',
    stepNumber: '06',
    title: 'Image Preparation',
    shortDesc: 'Generates clean studio & on-model visual presets.',
    role: 'Applies consistent lighting, warm-ivory studio backdrop, and framing presets while preserving product integrity.',
    receives: 'Original supplier snapshot and category studio preset.',
    produces: 'Ordered studio, detail, and lifestyle product imagery set.',
    failureHandling: 'Falls back to original supplier image and flags AI Studio review required.',
    sampleDurationMs: 380,
  },
  {
    id: 'node-catalog',
    stepNumber: '07',
    title: 'Catalog Generation',
    shortDesc: 'Writes bilingual EN/ES copy and care specs.',
    role: 'Composes clean English and Spanish storefront descriptions, SEO titles, and care instructions.',
    receives: 'Validated product attributes and brand tone rules.',
    produces: 'Bilingual product record ready for commercial review.',
    failureHandling: 'Marks missing language variant and preserves manual editing controls.',
    sampleDurationMs: 320,
  },
  {
    id: 'node-pricing',
    stepNumber: '08',
    title: 'Pricing Calculation',
    shortDesc: 'Computes FX, freight, duty, and gross margin.',
    role: 'Applies supplier currency rates, freight, import duty, and category gross-margin rules to compute selling price.',
    receives: 'Wholesale supplier cost, supplier FX rate, freight/duty table, margin target.',
    produces: 'Transparent landed-cost breakdown and recommended retail price.',
    failureHandling: 'Flags outdated FX rates or anomalous >20% cost shifts for manual pricing review.',
    sampleDurationMs: 250,
  },
  {
    id: 'node-inventory',
    stepNumber: '09',
    title: 'Inventory Organization',
    shortDesc: 'Maps color × size matrix and reorder thresholds.',
    role: 'Builds variant-level inventory records and evaluates low-stock or out-of-stock reorder thresholds.',
    receives: 'Color and size stock arrays plus workspace low-stock rules.',
    produces: 'Live variant matrix and initial stock health alerts.',
    failureHandling: 'Defaults missing counts to 0 (Out of Stock) rather than guessing stock.',
    sampleDurationMs: 240,
  },
  {
    id: 'node-approval',
    stepNumber: '10',
    title: 'Approval Queue',
    shortDesc: 'Stages completed product for Jack’s final sign-off.',
    role: 'Places the enriched product in the Approval Center so the owner retains 100% control before Shopify readiness.',
    receives: 'Complete enriched product package.',
    produces: 'Approval queue task + owner notification.',
    failureHandling: 'Never auto-publishes when manual approval enforcement is enabled.',
    sampleDurationMs: 220,
  },
];

export async function executeAutomationWorkflow(
  onNodeStart: (index: number, node: WorkflowNodeSpec) => void,
  onNodeComplete: (index: number, node: WorkflowNodeSpec) => void
): Promise<void> {
  for (let i = 0; i < WORKFLOW_NODES.length; i++) {
    const node = WORKFLOW_NODES[i];
    onNodeStart(i, node);
    await delay(node.sampleDurationMs);
    onNodeComplete(i, node);
  }
}

