import { ApprovalStatus, CurrencyCode, Product, ProductCategory, ProductImage, ProductVariant, SubmissionMethod } from '../types';
import { buildProductPricing } from '../services/mockPricing';

function makeVariants(
  prodPrefix: string,
  matrix: Record<string, Record<string, number>>,
  reservedMap: Record<string, number> = {},
  threshold = 5,
  lastUpdated = '2026-11-09'
): ProductVariant[] {
  const result: ProductVariant[] = [];
  for (const [color, sizes] of Object.entries(matrix)) {
    for (const [size, qty] of Object.entries(sizes)) {
      const key = `${color}-${size}`.toLowerCase();
      result.push({
        id: `var-${prodPrefix}-${key.replace(/[^a-z0-9]/g, '')}`,
        color,
        size,
        availableStock: qty,
        reservedStock: reservedMap[key] ?? (qty > 6 ? 2 : 0),
        reorderThreshold: threshold,
        lastUpdated,
      });
    }
  }
  return result;
}

export const SEED_PRODUCTS: Product[] = [
  // 1. Classic Linen Shirt (Exact PRD hero SKU MF-204, Milano Fashion)
  {
    id: 'prod-01',
    sku: 'MF-204',
    name: 'Classic Linen Shirt',
    brand: 'Milano Atelier',
    supplierId: 'sup-milano',
    category: 'Apparel',
    images: [
      {
        id: 'img-01-studio',
        url: '/images/products/linen-shirt-studio.jpg',
        label: 'Studio catalog • Balanced Ivory',
        category: 'Studio catalog',
        isPrimary: true,
        presetApplied: 'Premium catalog • Warm ivory',
      },
      {
        id: 'img-01-orig',
        url: '/images/products/linen-shirt-original.jpg',
        label: 'Original supplier hanger snapshot',
        category: 'Original',
        isPrimary: false,
      },
      {
        id: 'img-01-detail',
        url: '/images/products/linen-shirt-detail.jpg',
        label: 'Collar & Linen Weave Macro Detail',
        category: 'Product detail',
        isPrimary: false,
        presetApplied: 'Detail photography • Neutral studio',
      },
    ],
    descriptionEn:
      'Tailored from breathable 165 GSM European flax linen, the Classic Linen Shirt delivers effortless warm-weather structure with mother-of-pearl buttons, a clean chest pocket, and a relaxed curved hem.',
    descriptionEs:
      'Confeccionada en lino europeo transpirable de 165 g/m², la Camisa Clásica de Lino ofrece una estructura ligera de verano con botones de nácar, bolsillo frontal limpio y bajo redondeado.',
    attributes: {
      material: '100% European Flax Linen',
      fabric: '165 GSM Pre-Washed Plain Weave',
      color: 'White, Beige, Black',
      pattern: 'Solid Natural Slub',
      gender: 'Men',
      productType: 'Long-Sleeve Button-Down Shirt',
      season: 'Spring / Summer',
      careInstructions: 'Machine wash cold at 30°C gentle cycle. Steam lightly while damp.',
      fitNotes: 'Relaxed regular fit; true to European shirting size.',
    },
    variants: [
      { id: 'var-01-white-s', color: 'White', size: 'S', availableStock: 12, reservedStock: 2, reorderThreshold: 5, lastUpdated: '2026-11-10' },
      { id: 'var-01-white-m', color: 'White', size: 'M', availableStock: 18, reservedStock: 3, reorderThreshold: 5, lastUpdated: '2026-11-10' },
      { id: 'var-01-white-l', color: 'White', size: 'L', availableStock: 8, reservedStock: 1, reorderThreshold: 5, lastUpdated: '2026-11-10' },
      { id: 'var-01-white-xl', color: 'White', size: 'XL', availableStock: 4, reservedStock: 1, reorderThreshold: 5, lastUpdated: '2026-11-10' },
      { id: 'var-01-beige-s', color: 'Beige', size: 'S', availableStock: 9, reservedStock: 1, reorderThreshold: 5, lastUpdated: '2026-11-10' },
      { id: 'var-01-beige-m', color: 'Beige', size: 'M', availableStock: 14, reservedStock: 2, reorderThreshold: 5, lastUpdated: '2026-11-10' },
      { id: 'var-01-beige-l', color: 'Beige', size: 'L', availableStock: 6, reservedStock: 0, reorderThreshold: 5, lastUpdated: '2026-11-10' },
      { id: 'var-01-beige-xl', color: 'Beige', size: 'XL', availableStock: 0, reservedStock: 0, reorderThreshold: 5, lastUpdated: '2026-11-10' },
      { id: 'var-01-black-s', color: 'Black', size: 'S', availableStock: 20, reservedStock: 2, reorderThreshold: 5, lastUpdated: '2026-11-10' },
      { id: 'var-01-black-m', color: 'Black', size: 'M', availableStock: 15, reservedStock: 2, reorderThreshold: 5, lastUpdated: '2026-11-10' },
      { id: 'var-01-black-l', color: 'Black', size: 'L', availableStock: 10, reservedStock: 1, reorderThreshold: 5, lastUpdated: '2026-11-10' },
      { id: 'var-01-black-xl', color: 'Black', size: 'XL', availableStock: 7, reservedStock: 0, reorderThreshold: 5, lastUpdated: '2026-11-10' },
    ],
    pricing: buildProductPricing(25, 'EUR', 4, 3, 0.40, 'USD', 0, '2026-11-08'),
    approvalStatus: 'Ready for Approval',
    submissionMethod: 'Messaging',
    lastUpdated: '2026-11-10',
    imagesLastReviewed: '2026-11-08',
    activity: [
      { id: 'act-01-1', timestamp: '2026-11-10 09:12', actor: 'SUPPLYFLOW Intake', action: 'Extracted supplier messaging packet', details: '12 variants and €25.00 cost parsed from Milano Fashion.', type: 'intake' },
      { id: 'act-01-2', timestamp: '2026-11-10 09:14', actor: 'AI Catalog Engine', action: 'Prepared EN/ES copy & studio crop', details: 'Preserved linen weave and pearl button detail.', type: 'ai' },
      { id: 'act-01-3', timestamp: '2026-11-09 14:20', actor: 'Pricing Monitor', action: 'Cost update flagged (€25 → €29)', details: 'Pending Jack review in Pricing Engine.', type: 'pricing' },
    ],
  },

  // 2. Premium Cotton Hoodie
  {
    id: 'prod-02',
    sku: 'IT-301',
    name: 'Premium Cotton Hoodie',
    brand: 'Istanbul Basics',
    supplierId: 'sup-istanbul',
    category: 'Apparel',
    images: [
      { id: 'img-02-studio', url: '/images/plates/cotton-hoodie-studio.svg', label: 'Sage Organic Cotton Studio', category: 'Studio catalog', isPrimary: true, presetApplied: 'Premium catalog • Warm ivory' },
    ],
    descriptionEn:
      'Cut from 440 GSM combed Turkish organic cotton loopback fleece, this structured pullover hoodie features a double-lined hood, clean kangaroo pocket, and tonal cotton drawcords.',
    descriptionEs:
      'Confeccionada en felpa orgánica turca peinada de 440 g/m², esta sudadera estructurada incluye capucha de doble capa, bolsillo canguro limpio y cordones tonales.',
    attributes: {
      material: '100% Organic Turkish Cotton',
      fabric: '440 GSM Heavyweight French Terry',
      color: 'Sage, Charcoal',
      pattern: 'Solid Matte',
      gender: 'Unisex',
      productType: 'Pullover Hoodie',
      season: 'All-Season',
      careInstructions: 'Wash cold inside out, dry flat.',
    },
    variants: makeVariants('02', {
      Sage: { S: 14, M: 22, L: 18, XL: 9 },
      Charcoal: { S: 10, M: 16, L: 12, XL: 6 },
    }),
    pricing: buildProductPricing(820, 'TRY', 4.5, 3.5, 0.45, 'USD', 0, '2026-11-08'),
    approvalStatus: 'Approved',
    submissionMethod: 'CSV',
    lastUpdated: '2026-11-09',
    imagesLastReviewed: '2026-11-06',
    activity: [
      { id: 'act-02-1', timestamp: '2026-11-09 11:20', actor: 'Jack', action: 'Approved product', details: 'Verified sage colorway and margin.', type: 'approval' },
    ],
  },

  // 3. Women's Summer Dress
  {
    id: 'prod-03',
    sku: 'BA-118',
    name: "Women's Summer Dress",
    brand: 'Barcelona Studio',
    supplierId: 'sup-barcelona',
    category: 'Apparel',
    images: [
      { id: 'img-03-studio', url: '/images/plates/summer-dress-studio.svg', label: 'Sand Linen Midi Studio', category: 'Studio catalog', isPrimary: true, presetApplied: 'Clean white background' },
    ],
    descriptionEn:
      'An airy A-line midi dress crafted in Barcelona from a cool linen-viscose blend with wide tailored straps, softly cinched waist seam, and fluid drape for warm afternoons.',
    descriptionEs:
      'Vestido midi evasé confeccionado en Barcelona en mezcla fresca de lino y viscosa, con tirantes anchos estructurados, cintura suavemente marcada y caída fluida.',
    attributes: {
      material: '55% Linen, 45% EcoVero Viscose',
      fabric: '185 GSM Breathable Woven',
      color: 'Sand, Ivory',
      pattern: 'Solid',
      gender: 'Women',
      productType: 'Midi Dress',
      season: 'Spring / Summer',
      careInstructions: 'Gentle cold machine wash, hang to dry.',
    },
    variants: makeVariants('03', {
      Sand: { XS: 8, S: 15, M: 19, L: 11 },
      Ivory: { XS: 6, S: 11, M: 13, L: 7 },
    }),
    pricing: buildProductPricing(32, 'EUR', 3.5, 2.5, 0.45, 'USD', 0, '2026-11-09'),
    approvalStatus: 'Ready for Approval',
    submissionMethod: 'Excel',
    lastUpdated: '2026-11-10',
    imagesLastReviewed: '2026-11-09',
    activity: [
      { id: 'act-03-1', timestamp: '2026-11-10 08:46', actor: 'AI Catalog Engine', action: 'Generated EN/ES copy', details: 'Spanish translation synced.', type: 'ai' },
    ],
  },

  // 4. Minimal Leather Tote
  {
    id: 'prod-04',
    sku: 'NA-402',
    name: 'Minimal Leather Tote',
    brand: 'Nordic Carry',
    supplierId: 'sup-nordic',
    category: 'Accessories',
    images: [
      { id: 'img-04-studio', url: '/images/products/leather-tote-clean.jpg', label: 'Studio catalog • Warm Ivory', category: 'Studio catalog', isPrimary: true, presetApplied: 'Premium catalog • Warm ivory' },
      { id: 'img-04-orig', url: '/images/products/leather-tote-original.jpg', label: 'Original supplier shelf photo', category: 'Original', isPrimary: false },
    ],
    descriptionEn:
      'Structured everyday carryall crafted from full-grain vegetable-tanned cognac leather with contrast saddle-stitched shoulder straps, antique brass rivets, and room for a 15-inch laptop.',
    descriptionEs:
      'Bolso tote estructurado en piel plena flor curtida al vegetal en tono coñac, con asas contrastadas pespunteadas, remaches de latón envejecido y capacidad para portátil de 15 pulgadas.',
    attributes: {
      material: '100% Full-Grain Vegetable-Tanned Leather',
      fabric: '2.0mm Supple Grain Hide',
      color: 'Cognac, Espresso',
      pattern: 'Natural Pebble Grain',
      gender: 'Unisex',
      productType: 'Shoulder Tote Bag',
      season: 'All-Season',
      careInstructions: 'Wipe with dry cloth; treat annually with neutral leather balm.',
    },
    variants: [
      { id: 'var-04-cognac-os', color: 'Cognac', size: 'One Size', availableStock: 3, reservedStock: 2, reorderThreshold: 5, lastUpdated: '2026-11-09' },
      { id: 'var-04-espresso-os', color: 'Espresso', size: 'One Size', availableStock: 11, reservedStock: 1, reorderThreshold: 5, lastUpdated: '2026-11-09' },
    ],
    pricing: buildProductPricing(54, 'EUR', 4.0, 3.0, 0.50, 'USD', 0, '2026-11-08'),
    approvalStatus: 'Shopify Ready',
    submissionMethod: 'File Upload',
    lastUpdated: '2026-11-09',
    imagesLastReviewed: '2026-11-08',
    activity: [
      { id: 'act-04-1', timestamp: '2026-11-08 17:15', actor: 'AI Studio', action: 'Prepared warm-ivory catalog plate', details: 'Removed ambient background clutter.', type: 'ai' },
      { id: 'act-04-2', timestamp: '2026-11-09 10:00', actor: 'Jack', action: 'Approved for Shopify Readiness', details: 'Passed all catalog checks.', type: 'approval' },
    ],
  },

  // 5. Everyday Canvas Sneakers
  {
    id: 'prod-05',
    sku: 'PF-112',
    name: 'Everyday Canvas Sneakers',
    brand: 'Porto Guild',
    supplierId: 'sup-porto',
    category: 'Shoes',
    images: [
      { id: 'img-05-studio', url: '/images/plates/canvas-sneakers-studio.svg', label: 'Studio catalog • Cream/Gum', category: 'Studio catalog', isPrimary: true, presetApplied: 'Premium catalog • Warm ivory' },
      { id: 'img-05-orig', url: '/images/plates/canvas-sneakers-original.svg', label: 'Original workshop photo', category: 'Original', isPrimary: false },
    ],
    descriptionEn:
      'Low-profile vulcanized sneakers built in Porto with 12oz organic cotton canvas uppers, cork-lined orthotic footbeds, and natural honeycomb gum rubber outsoles.',
    descriptionEs:
      'Zapatillas bajas vulcanizadas fabricadas en Oporto con lona de algodón orgánico de 12 oz, plantilla anatómica de corcho y suela de caucho natural color caramelo.',
    attributes: {
      material: 'Organic Cotton Canvas & Natural Gum Rubber',
      fabric: '12oz Heavyweight Woven Canvas',
      color: 'Ivory / Gum',
      pattern: 'Solid Minimalist',
      gender: 'Unisex',
      productType: 'Low-Top Sneakers',
      season: 'All-Season',
      careInstructions: 'Spot clean canvas with cold water and mild soap; air dry.',
    },
    variants: [
      { id: 'var-05-ivory-40', color: 'Ivory', size: '40', availableStock: 9, reservedStock: 1, reorderThreshold: 5, lastUpdated: '2026-11-10' },
      { id: 'var-05-ivory-41', color: 'Ivory', size: '41', availableStock: 12, reservedStock: 2, reorderThreshold: 5, lastUpdated: '2026-11-10' },
      { id: 'var-05-ivory-42', color: 'Ivory', size: '42', availableStock: 2, reservedStock: 4, reorderThreshold: 5, lastUpdated: '2026-11-10' },
      { id: 'var-05-ivory-43', color: 'Ivory', size: '43', availableStock: 11, reservedStock: 1, reorderThreshold: 5, lastUpdated: '2026-11-10' },
    ],
    pricing: buildProductPricing(30, 'EUR', 6.0, 4.0, 0.40, 'USD', 0, '2026-11-08'),
    approvalStatus: 'Awaiting Review',
    submissionMethod: 'Excel',
    lastUpdated: '2026-11-10',
    imagesLastReviewed: '2026-11-05',
    activity: [
      { id: 'act-05-1', timestamp: '2026-11-08 09:45', actor: 'Pricing Monitor', action: 'Wholesale cost change flagged (€30 → €33)', details: 'Awaiting margin review.', type: 'pricing' },
    ],
  },

  // 6. Relaxed Fit Denim
  {
    id: 'prod-06',
    sku: 'UB-221',
    name: 'Relaxed Fit Denim',
    brand: 'Urban Basics',
    supplierId: 'sup-urban',
    category: 'Apparel',
    images: [
      { id: 'img-06-studio', url: '/images/plates/relaxed-denim-studio.svg', label: 'Washed Indigo Studio Flat-Lay', category: 'Studio catalog', isPrimary: true },
    ],
    descriptionEn:
      'Mid-rise straight-leg jeans milled from 13.5oz enzyme-washed Portuguese organic denim with subtle tobacco topstitching and brushed brass hardware.',
    descriptionEs:
      'Vaqueros de tiro medio y corte recto confeccionados en denim orgánico portugués de 13.5 oz lavado a la enzima, con pespunte tabaco y remaches en latón cepillado.',
    attributes: {
      material: '100% Organic Cotton Denim',
      fabric: '13.5oz Rope-Dyed Twill',
      color: 'Washed Indigo, Stone',
      pattern: 'Subtle Vintage Wash',
      gender: 'Unisex',
      productType: 'Straight Denim Trousers',
      season: 'All-Season',
      careInstructions: 'Wash cold infrequently, line dry away from direct heat.',
    },
    variants: makeVariants('06', {
      'Washed Indigo': { '30': 10, '32': 16, '34': 14, '36': 8 },
    }),
    pricing: buildProductPricing(34, 'EUR', 3.5, 2.0, 0.45, 'USD', 0, '2026-11-07'),
    approvalStatus: 'Shopify Ready',
    submissionMethod: 'Supplier Portal',
    lastUpdated: '2026-11-09',
    imagesLastReviewed: '2026-11-07',
    activity: [
      { id: 'act-06-1', timestamp: '2026-11-09 14:05', actor: 'Jack', action: 'Approved for Shopify', details: 'Stock and pricing confirmed.', type: 'approval' },
    ],
  },

  // 7. Premium Knit Sweater
  {
    id: 'prod-07',
    sku: 'AL-210',
    name: 'Premium Knit Sweater',
    brand: 'Atelier Lyon',
    supplierId: 'sup-lyon',
    category: 'Apparel',
    images: [
      { id: 'img-07-studio', url: '/images/plates/knit-sweater-studio.svg', label: 'Oatmeal Ribbed Merino Studio', category: 'Studio catalog', isPrimary: true },
    ],
    descriptionEn:
      'Mid-gauge fisherman ribbed crewneck spun from 100% extra-fine Italian merino wool in warm oatmeal with fully fashioned raglan sleeves.',
    descriptionEs:
      'Jersey de cuello redondo en punto inglés galga media hilado en 100% lana merina extrafina color avena con mangas raglán remalladas.',
    attributes: {
      material: '100% Extra-Fine Merino Wool',
      fabric: '7-Gauge Ribbed Knit',
      color: 'Oatmeal, Moss',
      pattern: 'Vertical Fisherman Rib',
      gender: 'Unisex',
      productType: 'Crewneck Knitwear',
      season: 'Autumn / Winter',
      careInstructions: 'Hand wash cold with wool detergent, dry flat on towel.',
    },
    variants: [
      { id: 'var-07-oatmeal-s', color: 'Oatmeal', size: 'S', availableStock: 8, reservedStock: 1, reorderThreshold: 5, lastUpdated: '2026-11-09' },
      { id: 'var-07-oatmeal-m', color: 'Oatmeal', size: 'M', availableStock: 11, reservedStock: 2, reorderThreshold: 5, lastUpdated: '2026-11-09' },
      { id: 'var-07-oatmeal-l', color: 'Oatmeal', size: 'L', availableStock: 0, reservedStock: 0, reorderThreshold: 5, lastUpdated: '2026-11-09' },
      { id: 'var-07-moss-m', color: 'Moss', size: 'M', availableStock: 7, reservedStock: 1, reorderThreshold: 5, lastUpdated: '2026-11-09' },
    ],
    pricing: buildProductPricing(42, 'EUR', 4.5, 3.0, 0.45, 'USD', 0, '2026-10-28'),
    approvalStatus: 'Approved',
    submissionMethod: 'Manual Entry',
    lastUpdated: '2026-11-08',
    imagesLastReviewed: '2026-10-28',
    activity: [
      { id: 'act-07-1', timestamp: '2026-11-09 11:15', actor: 'Inventory Monitor', action: 'Out-of-stock alert on Oatmeal L', details: 'Stock dropped to 0.', type: 'inventory' },
    ],
  },

  // 8. Classic Leather Belt
  {
    id: 'prod-08',
    sku: 'NA-415',
    name: 'Classic Leather Belt',
    brand: 'Nordic Carry',
    supplierId: 'sup-nordic',
    category: 'Accessories',
    images: [
      { id: 'img-08-studio', url: '/images/plates/leather-belt-studio.svg', label: 'Espresso Bridle Leather Studio', category: 'Studio catalog', isPrimary: true },
    ],
    descriptionEn:
      'Cut from 3.5mm Swedish bridle leather in dark espresso with burnished edges, five oval punch holes, and a solid sand-cast brushed brass buckle.',
    descriptionEs:
      'Cinturón cortado en cuero sueco bridle de 3.5 mm en tono espresso oscuro, cantos bruñidos, cinco ojales y hebilla maciza de latón cepillado.',
    attributes: {
      material: 'Bridle Leather & Solid Brass',
      fabric: '3.5mm Single-Strap Hide',
      color: 'Espresso',
      pattern: 'Smooth Satin Finish',
      gender: 'Unisex',
      productType: 'Dress & Casual Belt',
      season: 'All-Season',
      careInstructions: 'Condition lightly every 6 months.',
    },
    variants: makeVariants('08', {
      Espresso: { '85cm': 14, '95cm': 18, '105cm': 10 },
    }),
    pricing: buildProductPricing(19, 'EUR', 3.5, 2.5, 0.50, 'USD', 0, '2026-11-06'),
    approvalStatus: 'Shopify Ready',
    submissionMethod: 'File Upload',
    lastUpdated: '2026-11-08',
    imagesLastReviewed: '2026-11-06',
    activity: [],
  },

  // 9. Summer Cotton Shorts (Uses real generated studio + original pair!)
  {
    id: 'prod-09',
    sku: 'UB-230',
    name: 'Summer Cotton Shorts',
    brand: 'Urban Basics',
    supplierId: 'sup-urban',
    category: 'Apparel',
    images: [
      { id: 'img-09-studio', url: '/images/products/cotton-shorts-studio.jpg', label: 'Studio catalog • Warm Ivory', category: 'Studio catalog', isPrimary: true, presetApplied: 'Premium catalog • Warm ivory' },
      { id: 'img-09-orig', url: '/images/products/cotton-shorts-original.jpg', label: 'Original supplier warehouse photo', category: 'Original', isPrimary: false },
    ],
    descriptionEn:
      'Tailored pleated chino shorts in dry-hand Portuguese organic cotton twill featuring a 7-inch inseam, horn button closure, and crisp double front pleats.',
    descriptionEs:
      'Bermudas chino de pinzas confeccionadas en sarga de algodón orgánico portugués con tiro de 7 pulgadas, botón de asta y doble pinza frontal.',
    attributes: {
      material: '100% Organic Cotton Twill',
      fabric: '250 GSM Brushed Chino Twill',
      color: 'Sand Beige, Olive',
      pattern: 'Solid',
      gender: 'Men',
      productType: 'Tailored Shorts',
      season: 'Spring / Summer',
      careInstructions: 'Machine wash warm, press with medium iron.',
    },
    variants: makeVariants('09', {
      'Sand Beige': { S: 11, M: 16, L: 13, XL: 7 },
    }),
    pricing: buildProductPricing(22, 'EUR', 3.5, 2.0, 0.45, 'USD', 0, '2026-11-07'),
    approvalStatus: 'Ready for Approval',
    submissionMethod: 'Supplier Portal',
    lastUpdated: '2026-11-09',
    imagesLastReviewed: '2026-11-07',
    activity: [],
  },

  // 10. Essential Polo Shirt
  {
    id: 'prod-10',
    sku: 'UB-245',
    name: 'Essential Polo Shirt',
    brand: 'Urban Basics',
    supplierId: 'sup-urban',
    category: 'Apparel',
    images: [
      { id: 'img-10-studio', url: '/images/plates/polo-shirt-studio.svg', label: 'Forest Green Pique Studio', category: 'Studio catalog', isPrimary: true },
    ],
    descriptionEn:
      'Breathable long-staple cotton pique polo shirt dyed in deep forest green with a clean two-button placket, flat-knit collar, and reinforced side vents.',
    descriptionEs:
      'Polo de piqué en algodón de fibra larga teñido en verde bosque profundo, tapeta de dos botones de nácar, cuello de punto plano y aberturas laterales.',
    attributes: {
      material: '100% Combed Pique Cotton',
      fabric: '220 GSM Honeycomb Pique',
      color: 'Forest Green, Ivory',
      pattern: 'Solid Pique',
      gender: 'Men',
      productType: 'Short-Sleeve Polo',
      season: 'Spring / Summer',
      careInstructions: 'Wash cold with similar colors, reshape collar while damp.',
    },
    variants: makeVariants('10', {
      'Forest Green': { S: 9, M: 17, L: 14, XL: 6 },
    }),
    pricing: buildProductPricing(21, 'EUR', 3.5, 2.0, 0.45, 'USD', 0, '2026-11-07'),
    approvalStatus: 'Approved',
    submissionMethod: 'Supplier Portal',
    lastUpdated: '2026-11-08',
    imagesLastReviewed: '2026-11-07',
    activity: [],
  },

  // 11. Structured Fleece Zip Jacket
  {
    id: 'prod-11',
    sku: 'IT-308',
    name: 'Structured Fleece Zip Jacket',
    brand: 'Istanbul Basics',
    supplierId: 'sup-istanbul',
    category: 'Apparel',
    images: [
      { id: 'img-11-studio', url: '/images/plates/cotton-hoodie-studio.svg', label: 'Sage Heavyweight Fleece Studio', category: 'Studio catalog', isPrimary: true },
    ],
    descriptionEn:
      'Boxy brushed-fleece layering jacket featuring matte metal hardware, structured stand collar, and deep welt pockets for transitional weather.',
    descriptionEs:
      'Chaqueta boxy en felpa cepillada de alto gramaje con cremallera metálica mate, cuello alzado estructurado y bolsillos de vivo.',
    attributes: {
      material: '85% Organic Cotton, 15% Recycled Poly',
      fabric: '460 GSM Brushed Fleece',
      color: 'Sage, Stone',
      pattern: 'Solid',
      gender: 'Unisex',
      productType: 'Layering Jacket',
      season: 'Autumn / Winter',
      careInstructions: 'Machine wash cold gentle, hang dry.',
    },
    variants: makeVariants('11', {
      Sage: { S: 6, M: 10, L: 8, XL: 4 },
    }),
    pricing: buildProductPricing(920, 'TRY', 4.5, 3.5, 0.45, 'USD', 0, '2026-11-07'),
    approvalStatus: 'Needs Changes',
    approvalNotes: 'Verify updated TRY cost delta in Pricing Engine before final approval.',
    submissionMethod: 'CSV',
    lastUpdated: '2026-11-09',
    imagesLastReviewed: '2026-11-07',
    activity: [],
  },

  // 12. Artisan Suede Loafers (Real generated photo pair!)
  {
    id: 'prod-12',
    sku: 'PF-125',
    name: 'Artisan Suede Loafers',
    brand: 'Porto Guild',
    supplierId: 'sup-porto',
    category: 'Shoes',
    images: [
      { id: 'img-12-studio', url: '/images/products/suede-loafers-studio.jpg', label: 'Studio catalog • Warm Ivory', category: 'Studio catalog', isPrimary: true, presetApplied: 'Premium catalog • Warm ivory' },
      { id: 'img-12-orig', url: '/images/products/suede-loafers-original.jpg', label: 'Original workshop snapshot', category: 'Original', isPrimary: false },
    ],
    descriptionEn:
      'Blake-stitched Italian water-repellent suede penny loafers lined in vegetable-tanned calfskin with stacked leather heels and hand-burnished edges.',
    descriptionEs:
      'Mocasines penny en ante italiano hidrófugo cosidos Blake, forrados en piel vacuna curtida al vegetal con tacón apilado y cantos bruñidos a mano.',
    attributes: {
      material: 'Italian Calf Suede & Leather Sole',
      fabric: 'Water-Repellent Reverse Suede',
      color: 'Warm Taupe',
      pattern: 'Solid Velvety Suede',
      gender: 'Men',
      productType: 'Penny Loafers',
      season: 'All-Season',
      careInstructions: 'Brush gently with soft crepe suede brush; insert cedar shoe trees.',
    },
    variants: makeVariants('12', {
      'Warm Taupe': { '40': 7, '41': 11, '42': 9, '43': 6, '44': 4 },
    }),
    pricing: buildProductPricing(48, 'EUR', 6.0, 4.0, 0.40, 'USD', 0, '2026-11-06'),
    approvalStatus: 'Ready for Approval',
    submissionMethod: 'Excel',
    lastUpdated: '2026-11-09',
    imagesLastReviewed: '2026-11-06',
    activity: [],
  },

  // 13. Mediterranean Poplin Tunic
  {
    id: 'prod-13',
    sku: 'BA-142',
    name: 'Mediterranean Poplin Tunic',
    brand: 'Barcelona Studio',
    supplierId: 'sup-barcelona',
    category: 'Apparel',
    images: [
      { id: 'img-13-studio', url: '/images/plates/poplin-tunic-studio.svg', label: 'Crisp White Poplin Studio', category: 'Studio catalog', isPrimary: true },
    ],
    descriptionEn:
      'Crisp organic cotton poplin split-neck tunic shirt with relaxed dropped shoulders and breathable wide cuffs.',
    descriptionEs:
      'Túnica de popelín orgánico crujiente con escote en pico abierto, hombros caídos relajados y puños amplios.',
    attributes: {
      material: '100% Organic Cotton Poplin',
      fabric: '125 GSM High-Density Poplin',
      color: 'Chalk White',
      pattern: 'Solid',
      gender: 'Women',
      productType: 'Tunic Shirt',
      season: 'Spring / Summer',
      careInstructions: 'Machine wash cold, steam lightly.',
    },
    variants: makeVariants('13', {
      'Chalk White': { XS: 7, S: 14, M: 16, L: 9 },
    }),
    pricing: buildProductPricing(26, 'EUR', 3.5, 2.5, 0.45, 'USD', 0, '2026-11-10'),
    approvalStatus: 'Awaiting Review',
    submissionMethod: 'Excel',
    lastUpdated: '2026-11-10',
    imagesLastReviewed: '2026-11-10',
    activity: [],
  },

  // 14. Tailored Wool Blend Coat
  {
    id: 'prod-14',
    sku: 'AL-205',
    name: 'Tailored Wool Blend Coat',
    brand: 'Atelier Lyon',
    supplierId: 'sup-lyon',
    category: 'Apparel',
    images: [
      { id: 'img-14-studio', url: '/images/plates/wool-coat-studio.svg', label: 'Charcoal Double-Breasted Studio', category: 'Studio catalog', isPrimary: true },
    ],
    descriptionEn:
      'Double-breasted tailored overcoat in brushed Italian virgin wool blend with peak lapels, horn buttons, and Bemberg cupro half-lining.',
    descriptionEs:
      'Abrigo sastre de doble botonadura en mezcla de lana virgen italiana cepillada con solapas de pico, botones de cuerno y medio forro de cupro.',
    attributes: {
      material: '80% Virgin Wool, 20% Polyamide',
      fabric: '580 GSM Melton Wool',
      color: 'Charcoal Espresso',
      pattern: 'Brushed Melange',
      gender: 'Unisex',
      productType: 'Tailored Overcoat',
      season: 'Autumn / Winter',
      careInstructions: 'Dry clean only; brush lightly after wear.',
    },
    variants: makeVariants('14', {
      Charcoal: { S: 4, M: 8, L: 7, XL: 3 },
    }),
    pricing: buildProductPricing(98, 'EUR', 4.5, 3.0, 0.45, 'USD', 0, '2026-10-28'),
    approvalStatus: 'Approved',
    submissionMethod: 'Manual Entry',
    lastUpdated: '2026-11-05',
    imagesLastReviewed: '2026-10-28',
    activity: [],
  },

  // 15. Mulberry Silk Neck Scarf
  {
    id: 'prod-15',
    sku: 'HS-509',
    name: 'Mulberry Silk Neck Scarf',
    brand: 'Hangzhou Atelier',
    supplierId: 'sup-hangzhou',
    category: 'Accessories',
    images: [
      { id: 'img-15-studio', url: '/images/plates/silk-scarf-studio.svg', label: 'Sage Border Silk Square Studio', category: 'Studio catalog', isPrimary: true },
    ],
    descriptionEn:
      'Hand-rolled 16-momme mulberry silk twill square scarf framed in sage and warm ochre geometric borders.',
    descriptionEs:
      'Pañuelo cuadrado de sarga de seda morera de 16 momme con orillo cosido a mano y marco geométrico en verde salvia y ocre cálido.',
    attributes: {
      material: '100% Grade-6A Mulberry Silk',
      fabric: '16-Momme Silk Twill',
      color: 'Ivory / Sage',
      pattern: 'Architectural Border',
      gender: 'Women',
      productType: 'Silk Scarf',
      season: 'All-Season',
      careInstructions: 'Dry clean or cool hand wash.',
    },
    variants: makeVariants('15', {
      'Ivory / Sage': { '65x65cm': 19 },
    }),
    pricing: buildProductPricing(115, 'CNY', 5.0, 4.5, 0.50, 'USD', 0, '2026-10-18'),
    approvalStatus: 'Needs Changes',
    approvalNotes: 'Awaiting refreshed CNY wholesale confirmation sheet.',
    submissionMethod: 'CSV',
    lastUpdated: '2026-10-20',
    imagesLastReviewed: '2026-10-18',
    activity: [],
  },

  // 16. Waxed Canvas Commuter Pack
  {
    id: 'prod-16',
    sku: 'NA-428',
    name: 'Waxed Canvas Commuter Pack',
    brand: 'Nordic Carry',
    supplierId: 'sup-nordic',
    category: 'Accessories',
    images: [
      { id: 'img-16-studio', url: '/images/plates/canvas-backpack-studio.svg', label: 'Forest Olive Waxed Canvas', category: 'Studio catalog', isPrimary: true },
    ],
    descriptionEn:
      'Weather-resistant 18oz Scottish waxed cotton backpack finished with vegetable-tanned leather buckles and padded 16-inch laptop sleeve.',
    descriptionEs:
      'Mochila impermeable en lona encerada escocesa de 18 oz con correas en piel curtida al vegetal y funda acolchada para portátil de 16 pulgadas.',
    attributes: {
      material: 'Waxed Cotton Canvas & Bridle Leather',
      fabric: '18oz Dry-Waxed Twill',
      color: 'Forest Olive',
      pattern: 'Matte Wax Finish',
      gender: 'Unisex',
      productType: 'Everyday Backpack',
      season: 'All-Season',
      careInstructions: 'Brush off dry mud; sponge clean with cold water only.',
    },
    variants: makeVariants('16', {
      'Forest Olive': { 'One Size': 13 },
    }),
    pricing: buildProductPricing(46, 'EUR', 4.0, 3.0, 0.50, 'USD', 0, '2026-11-06'),
    approvalStatus: 'Shopify Ready',
    submissionMethod: 'File Upload',
    lastUpdated: '2026-11-08',
    imagesLastReviewed: '2026-11-06',
    activity: [],
  },

  // 17. Milano Linen Resort Trousers
  {
    id: 'prod-17',
    sku: 'MF-211',
    name: 'Milano Linen Resort Trousers',
    brand: 'Milano Atelier',
    supplierId: 'sup-milano',
    category: 'Apparel',
    images: [
      { id: 'img-17-studio', url: '/images/products/cotton-shorts-studio.jpg', label: 'Sand Tailored Linen Studio', category: 'Studio catalog', isPrimary: true },
    ],
    descriptionEn:
      'Relaxed pleated drawstring trousers tailored in crisp Italian linen for warm coastal evenings and travel comfort.',
    descriptionEs:
      'Pantalón relajado de pinzas con cintura ajustable confeccionado en lino italiano fresco para días cálidos y viajes.',
    attributes: {
      material: '100% Italian Flax Linen',
      fabric: '190 GSM Twill Linen',
      color: 'Sand, Charcoal',
      pattern: 'Solid',
      gender: 'Men',
      productType: 'Relaxed Trousers',
      season: 'Spring / Summer',
      careInstructions: 'Machine wash cold gentle, steam dry.',
    },
    variants: makeVariants('17', {
      Sand: { S: 9, M: 14, L: 11, XL: 5 },
    }),
    pricing: buildProductPricing(31, 'EUR', 4.0, 3.0, 0.45, 'USD', 0, '2026-11-09'),
    approvalStatus: 'Ready for Approval',
    submissionMethod: 'Messaging',
    lastUpdated: '2026-11-10',
    imagesLastReviewed: '2026-11-09',
    activity: [],
  },

  // 18. Barcelona Ribbed Midi Slip Dress
  {
    id: 'prod-18',
    sku: 'BA-126',
    name: 'Ribbed Knit Midi Dress',
    brand: 'Barcelona Studio',
    supplierId: 'sup-barcelona',
    category: 'Apparel',
    images: [
      { id: 'img-18-studio', url: '/images/plates/summer-dress-studio.svg', label: 'Warm Sand Studio', category: 'Studio catalog', isPrimary: true },
    ],
    descriptionEn:
      'Fine organic cotton-silk knit midi dress with clean scoop neckline and softly flared skirt.',
    descriptionEs:
      'Vestido midi en punto fino de algodón orgánico y seda con escote redondo limpio y falda ligeramente acampanada.',
    attributes: {
      material: '85% Organic Cotton, 15% Silk',
      fabric: 'Fine Ribbed Jersey',
      color: 'Sand, Ivory',
      pattern: 'Micro Rib',
      gender: 'Women',
      productType: 'Knit Dress',
      season: 'Spring / Summer',
      careInstructions: 'Wash cold on delicate, dry flat.',
    },
    variants: makeVariants('18', {
      Sand: { XS: 6, S: 12, M: 14, L: 8 },
    }),
    pricing: buildProductPricing(35, 'EUR', 3.5, 2.5, 0.45, 'USD', 0, '2026-11-09'),
    approvalStatus: 'Approved',
    submissionMethod: 'Excel',
    lastUpdated: '2026-11-09',
    imagesLastReviewed: '2026-11-09',
    activity: [],
  },

  // 19. Fine Merino Cardigan
  {
    id: 'prod-19',
    sku: 'AL-218',
    name: 'Fine Merino Cardigan',
    brand: 'Atelier Lyon',
    supplierId: 'sup-lyon',
    category: 'Apparel',
    images: [
      { id: 'img-19-studio', url: '/images/plates/knit-sweater-studio.svg', label: 'Oatmeal Merino Cardigan', category: 'Studio catalog', isPrimary: true },
    ],
    descriptionEn:
      'Lightweight V-neck layering cardigan in 12-gauge combed merino with corozo nut buttons and ribbed trims.',
    descriptionEs:
      'Cárdigan ligero de escote en V en merino peinado galga 12 con botones de corozo y remates acanalados.',
    attributes: {
      material: '100% Combed Merino Wool',
      fabric: '12-Gauge Jersey Knit',
      color: 'Oatmeal',
      pattern: 'Solid',
      gender: 'Women',
      productType: 'Cardigan',
      season: 'Autumn / Winter',
      careInstructions: 'Hand wash cool, dry flat.',
    },
    variants: makeVariants('19', { Oatmeal: { S: 5, M: 9, L: 6 } }, {}, 5, '2026-10-25'),
    pricing: buildProductPricing(44, 'EUR', 4.5, 3.0, 0.45, 'USD', 0, '2026-10-25'),
    approvalStatus: 'Processing',
    submissionMethod: 'Manual Entry',
    lastUpdated: '2026-10-25',
    imagesLastReviewed: '2026-10-12',
    activity: [],
  },

  // 20. Porto Minimalist Court Trainer
  {
    id: 'prod-20',
    sku: 'PF-131',
    name: 'Minimalist Court Trainer',
    brand: 'Porto Guild',
    supplierId: 'sup-porto',
    category: 'Shoes',
    images: [
      { id: 'img-20-studio', url: '/images/plates/canvas-sneakers-studio.svg', label: 'Cream Court Trainer Studio', category: 'Studio catalog', isPrimary: true },
    ],
    descriptionEn:
      'Clean low-top everyday court sneaker with unbleached organic canvas upper and Margom-style stitched sidewall cupsole.',
    descriptionEs:
      'Zapatilla de corte limpio en lona orgánica sin blanquear con suela cosida de perfil bajo.',
    attributes: {
      material: 'Unbleached Canvas & Rubber Cupsole',
      fabric: '14oz Organic Duck Canvas',
      color: 'Ecru / Gum',
      pattern: 'Solid',
      gender: 'Unisex',
      productType: 'Court Sneakers',
      season: 'All-Season',
      careInstructions: 'Brush gently with mild soapy water.',
    },
    variants: makeVariants('20', {
      Ecru: { '39': 7, '40': 10, '41': 12, '42': 8, '43': 6 },
    }),
    pricing: buildProductPricing(36, 'EUR', 6.0, 4.0, 0.40, 'USD', 0, '2026-11-05'),
    approvalStatus: 'Ready for Approval',
    submissionMethod: 'Excel',
    lastUpdated: '2026-11-08',
    imagesLastReviewed: '2026-11-05',
    activity: [],
  },

  // 21. Hangzhou Resort Silk Shirt
  {
    id: 'prod-21',
    sku: 'HS-514',
    name: 'Resort Silk Blend Shirt',
    brand: 'Hangzhou Atelier',
    supplierId: 'sup-hangzhou',
    category: 'Apparel',
    images: [
      { id: 'img-21-studio', url: '/images/plates/poplin-tunic-studio.svg', label: 'Chalk Silk-Cotton Studio', category: 'Studio catalog', isPrimary: true },
    ],
    descriptionEn:
      'Camp-collar short-sleeve resort shirt woven in silk-cotton habotai for fluid movement and luminous matte drape.',
    descriptionEs:
      'Camisa resort de cuello camp en mezcla de seda y algodón habotai de caída fluida y acabado mate luminoso.',
    attributes: {
      material: '70% Cotton, 30% Mulberry Silk',
      fabric: '115 GSM Habotai Weave',
      color: 'Ivory',
      pattern: 'Solid',
      gender: 'Men',
      productType: 'Camp Collar Shirt',
      season: 'Spring / Summer',
      careInstructions: 'Hand wash cool or dry clean.',
    },
    variants: makeVariants('21', { Ivory: { S: 6, M: 10, L: 8 } }, {}, 5, '2026-10-20'),
    pricing: buildProductPricing(185, 'CNY', 5.0, 4.5, 0.48, 'USD', 0, '2026-10-18'),
    approvalStatus: 'Rejected',
    rejectionReason: 'Sheer fabric weight below catalog standard for Ivory colorway; request 145 GSM revision.',
    submissionMethod: 'CSV',
    lastUpdated: '2026-11-02',
    imagesLastReviewed: '2026-10-18',
    activity: [],
  },

  // 22. Istanbul Heavyweight Crewneck
  {
    id: 'prod-22',
    sku: 'IT-314',
    name: 'Heavyweight Loopback Crewneck',
    brand: 'Istanbul Basics',
    supplierId: 'sup-istanbul',
    category: 'Apparel',
    images: [
      { id: 'img-22-studio', url: '/images/plates/polo-shirt-studio.svg', label: 'Forest Loopback Studio', category: 'Studio catalog', isPrimary: true },
    ],
    descriptionEn:
      'Garment-dyed organic cotton crewneck sweatshirt in muted forest green with set-in sleeves and thick 2x2 ribbed cuffs.',
    descriptionEs:
      'Sudadera de cuello redondo teñida en prenda en algodón orgánico verde bosque con puños acanalados gruesos 2x2.',
    attributes: {
      material: '100% Organic Cotton',
      fabric: '420 GSM Loopback Terry',
      color: 'Forest Green',
      pattern: 'Garment Dyed Solid',
      gender: 'Unisex',
      productType: 'Crewneck Sweatshirt',
      season: 'All-Season',
      careInstructions: 'Machine wash cold, dry flat.',
    },
    variants: makeVariants('22', {
      'Forest Green': { S: 10, M: 15, L: 13, XL: 7 },
    }),
    pricing: buildProductPricing(760, 'TRY', 4.5, 3.5, 0.45, 'USD', 0, '2026-11-08'),
    approvalStatus: 'Shopify Ready',
    submissionMethod: 'CSV',
    lastUpdated: '2026-11-09',
    imagesLastReviewed: '2026-11-08',
    activity: [],
  },

  // 23. Milano Tailored Linen Overshirt
  {
    id: 'prod-23',
    sku: 'MF-219',
    name: 'Tailored Linen Overshirt',
    brand: 'Milano Atelier',
    supplierId: 'sup-milano',
    category: 'Apparel',
    images: [
      { id: 'img-23-studio', url: '/images/products/linen-shirt-studio.jpg', label: 'Natural Flax Studio', category: 'Studio catalog', isPrimary: true },
    ],
    descriptionEn:
      'Structured heavyweight 260 GSM linen chore overshirt with twin utility patch pockets and corozo buttons.',
    descriptionEs:
      'Sobrecamisa estructurada en lino pesado de 260 g/m² con doble bolsillo de parche y botones de corozo.',
    attributes: {
      material: '100% Heavyweight Belgian-Italian Linen',
      fabric: '260 GSM Canvas Linen',
      color: 'Natural Flax',
      pattern: 'Textured Twill',
      gender: 'Men',
      productType: 'Overshirt / Chore Jacket',
      season: 'Spring / Autumn',
      careInstructions: 'Cold gentle wash or dry clean.',
    },
    variants: makeVariants('23', {
      'Natural Flax': { S: 7, M: 12, L: 10, XL: 5 },
    }),
    pricing: buildProductPricing(38, 'EUR', 4.0, 3.0, 0.45, 'USD', 0, '2026-11-10'),
    approvalStatus: 'Received',
    submissionMethod: 'Messaging',
    lastUpdated: '2026-11-10',
    imagesLastReviewed: '2026-11-10',
    activity: [],
  },

  // 24. Porto Driving Suede Moccasin
  {
    id: 'prod-24',
    sku: 'PF-140',
    name: 'Porto Suede Driving Moccasin',
    brand: 'Porto Guild',
    supplierId: 'sup-porto',
    category: 'Shoes',
    images: [
      { id: 'img-24-studio', url: '/images/products/suede-loafers-studio.jpg', label: 'Taupe Suede Studio', category: 'Studio catalog', isPrimary: true },
    ],
    descriptionEn:
      'Unlined flexible split-suede driving shoe hand-sewn in northern Portugal with cushioned leather footbed.',
    descriptionEs:
      'Mocasín driving flexible sin forro cosido a mano en el norte de Portugal en ante suave con plantilla acolchada.',
    attributes: {
      material: 'Split Suede & Pebbled Rubber Pods',
      fabric: 'Unlined Italian Suede',
      color: 'Warm Taupe',
      pattern: 'Hand-Sewn Apron Toe',
      gender: 'Unisex',
      productType: 'Driving Loafers',
      season: 'Spring / Summer',
      careInstructions: 'Brush with suede brush; avoid wet surfaces.',
    },
    variants: makeVariants('24', {
      'Warm Taupe': { '40': 6, '41': 9, '42': 11, '43': 7 },
    }),
    pricing: buildProductPricing(44, 'EUR', 6.0, 4.0, 0.40, 'USD', 0, '2026-11-05'),
    approvalStatus: 'Awaiting Review',
    submissionMethod: 'Excel',
    lastUpdated: '2026-11-08',
    imagesLastReviewed: '2026-11-05',
    activity: [],
  },
];

