import { AppNotification } from '../types';

export const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: '3 new supplier products received',
    message: 'Milano Fashion and Barcelona Apparel submitted new seasonal catalog batches via Intake.',
    category: 'intake',
    timestamp: '12 mins ago',
    read: false,
    targetRoute: '/app/intake',
  },
  {
    id: 'notif-2',
    title: 'Supplier price changed on MF-204',
    message: 'Milano Fashion updated Classic Linen Shirt wholesale cost from €25.00 to €29.00.',
    category: 'pricing',
    timestamp: '1 hour ago',
    read: false,
    targetRoute: '/app/pricing',
  },
  {
    id: 'notif-3',
    title: 'Inventory below reorder threshold',
    message: 'Classic Linen Shirt (Beige / XL) is out of stock and White / XL has 4 units left.',
    category: 'inventory',
    timestamp: '2 hours ago',
    read: false,
    targetRoute: '/app/inventory',
  },
  {
    id: 'notif-4',
    title: 'Products ready for approval',
    message: '6 enriched products have completed AI copy, photography, and pricing checks.',
    category: 'approval',
    timestamp: '3 hours ago',
    read: false,
    targetRoute: '/app/approvals',
  },
  {
    id: 'notif-5',
    title: 'Product information freshness warning',
    message: '2 products from Atelier Lyon and Hangzhou have stock counts older than 14 days.',
    category: 'inventory',
    timestamp: 'Yesterday',
    read: true,
    targetRoute: '/app/inventory',
  },
  {
    id: 'notif-6',
    title: 'AI processing completed',
    message: 'Bilingual EN/ES descriptions and studio presets prepared for Summer Collection batch.',
    category: 'ai',
    timestamp: 'Yesterday',
    read: true,
    targetRoute: '/app/ai-studio',
  },
];

