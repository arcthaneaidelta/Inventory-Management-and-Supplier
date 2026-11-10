import { IntakeSubmission } from '../types';

export const SEED_INTAKE_SUBMISSIONS: IntakeSubmission[] = [
  {
    id: 'int-1',
    reference: 'INT-2026-114',
    supplierId: 'sup-milano',
    method: 'Messaging',
    submittedAt: '2026-11-10 09:10',
    status: 'Successfully Extracted',
    fileName: 'milano_summer_linen_batch.zip',
    itemCount: 3,
    productName: 'Classic Linen Shirt',
    sku: 'MF-204',
    confidence: 'High confidence',
    linkedProductId: 'prod-01',
  },
  {
    id: 'int-2',
    reference: 'INT-2026-113',
    supplierId: 'sup-barcelona',
    method: 'Excel',
    submittedAt: '2026-11-10 08:25',
    status: 'Awaiting Extraction',
    fileName: 'BCN_Resort_Collection_2026.xlsx',
    itemCount: 4,
    productName: 'Mediterranean Poplin Tunic',
    sku: 'BA-142',
    confidence: 'High confidence',
  },
  {
    id: 'int-3',
    reference: 'INT-2026-112',
    supplierId: 'sup-istanbul',
    method: 'CSV',
    submittedAt: '2026-11-09 17:40',
    status: 'Needs Attention',
    fileName: 'istanbul_fleece_nov.csv',
    itemCount: 3,
    productName: 'Structured Fleece Zip Jacket',
    sku: 'IT-308',
    confidence: 'Needs review',
    errorMessage: 'Wholesale currency column parsed as TRY; verify updated landed freight.',
    linkedProductId: 'prod-11',
  },
  {
    id: 'int-4',
    reference: 'INT-2026-111',
    supplierId: 'sup-urban',
    method: 'Supplier Portal',
    submittedAt: '2026-11-09 14:05',
    status: 'Successfully Extracted',
    fileName: 'UB_Denim_LineSheet_Q4.csv',
    itemCount: 3,
    productName: 'Relaxed Fit Denim',
    sku: 'UB-221',
    confidence: 'High confidence',
    linkedProductId: 'prod-06',
  },
  {
    id: 'int-5',
    reference: 'INT-2026-110',
    supplierId: 'sup-hangzhou',
    method: 'File Upload',
    submittedAt: '2026-11-08 11:05',
    status: 'Failed',
    fileName: 'hangzhou_scarves_scan.pdf',
    itemCount: 2,
    productName: 'Mulberry Silk Neck Scarf',
    sku: 'HS-509',
    confidence: 'Missing information',
    errorMessage: 'Unsupported scanned PDF table layout without pricing column. Upload CSV/XLSX or enter manually.',
  },
  {
    id: 'int-6',
    reference: 'INT-2026-109',
    supplierId: 'sup-nordic',
    method: 'File Upload',
    submittedAt: '2026-11-08 09:30',
    status: 'Successfully Extracted',
    fileName: 'Nordic_Leather_AW26.xlsx',
    itemCount: 3,
    productName: 'Minimal Leather Tote',
    sku: 'NA-402',
    confidence: 'High confidence',
    linkedProductId: 'prod-04',
  },
];

export interface SimulatedChatTurn {
  id: string;
  sender: 'supplier' | 'system' | 'jack';
  time: string;
  text: string;
  attachment?: {
    type: 'image' | 'video' | 'spec';
    title: string;
    subtitle: string;
    imageUrl?: string;
  };
}

export const SIMULATED_SUPPLIER_CHAT: SimulatedChatTurn[] = [
  {
    id: 'msg-1',
    sender: 'supplier',
    time: '09:08',
    text: 'Hello Jack — here is our new Milano Summer Linen Shirt batch ready for your catalog review.',
  },
  {
    id: 'msg-2',
    sender: 'supplier',
    time: '09:08',
    text: 'Attached natural sample photo and showroom fit clip.',
    attachment: {
      type: 'image',
      title: 'linen_shirt_sample_milano.jpg',
      subtitle: 'Original supplier photo • 2.4 MB',
      imageUrl: '/images/products/linen-shirt-original.jpg',
    },
  },
  {
    id: 'msg-3',
    sender: 'supplier',
    time: '09:09',
    text: 'Short garment drape preview video included for texture verification.',
    attachment: {
      type: 'video',
      title: 'linen_drape_preview.mp4',
      subtitle: '0:08 showroom clip • 1080p',
    },
  },
  {
    id: 'msg-4',
    sender: 'supplier',
    time: '09:09',
    text: 'SKU: MF-215 (or MF-204 for restock). Wholesale: €25.00 EUR. Colors: White, Beige, Black. Sizes S:12, M:18, L:8, XL:4.',
    attachment: {
      type: 'spec',
      title: 'Parsed Packet Summary',
      subtitle: '€25.00 EUR • 3 Colors • S–XL',
    },
  },
  {
    id: 'msg-5',
    sender: 'system',
    time: '09:09',
    text: 'Submission received. Product information is being organized and staged in SUPPLYFLOW Intake.',
  },
];

