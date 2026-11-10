import {
  PhotographyStyle,
  Product,
  ProductAttributes,
  ProductCategory,
  ProductImage,
  StudioBackground,
} from '../types';

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface ExtractionStepResult {
  name: string;
  sku: string;
  category: ProductCategory;
  supplierCost: number;
  descriptionEn: string;
  descriptionEs: string;
  attributes: ProductAttributes;
  colors: string[];
  sizes: string[];
  defaultStockPerVariant: number;
  confidence: {
    name: 'High confidence' | 'Needs review';
    sku: 'High confidence' | 'Needs review';
    cost: 'High confidence' | 'Needs review' | 'Missing information';
    variants: 'High confidence' | 'Needs review';
    attributes: 'High confidence' | 'Needs review';
  };
}

export async function extractProductAttributes(
  input: {
    fileName?: string;
    manualName?: string;
    manualSku?: string;
    manualCost?: number;
    category?: ProductCategory;
    colors?: string[];
    sizes?: string[];
  },
  onStep?: (stepIndex: number) => void
): Promise<ExtractionStepResult> {
  const totalSteps = 7;
  for (let i = 0; i < totalSteps; i++) {
    onStep?.(i);
    await delay(240);
  }

  const derivedName =
    input.manualName?.trim() ||
    (input.fileName?.toLowerCase().includes('linen')
      ? 'Relaxed Summer Linen Overshirt'
      : input.fileName?.toLowerCase().includes('sneaker') || input.fileName?.toLowerCase().includes('shoe')
      ? 'Minimalist Organic Canvas Trainer'
      : input.fileName?.toLowerCase().includes('tote') || input.fileName?.toLowerCase().includes('bag')
      ? 'Structured Pebbled Leather Tote'
      : 'Mediterranean Organic Poplin Shirt');

  const category: ProductCategory =
    input.category ||
    (derivedName.toLowerCase().includes('sneaker') || derivedName.toLowerCase().includes('shoe')
      ? 'Shoes'
      : derivedName.toLowerCase().includes('tote') || derivedName.toLowerCase().includes('belt')
      ? 'Accessories'
      : 'Apparel');

  const sku = input.manualSku?.trim() || `SF-${Math.floor(300 + Math.random() * 650)}`;
  const cost = input.manualCost && input.manualCost > 0 ? input.manualCost : 28;

  return {
    name: derivedName,
    sku,
    category,
    supplierCost: cost,
    descriptionEn: `${derivedName} crafted with carefully sourced breathable materials and refined everyday proportions. Finished with clean seams and versatile tonal styling suitable for warm-weather wardrobes.`,
    descriptionEs: `${derivedName} confeccionado con materiales transpirables de alta calidad y proporciones versátiles para el uso diario. Acabados cuidados y estética atemporal.`,
    attributes: {
      material: category === 'Shoes' ? 'Organic Cotton Canvas & Natural Rubber' : category === 'Accessories' ? 'Full-Grain Vegetable-Tanned Leather' : '100% European Linen',
      fabric: category === 'Apparel' ? '165 GSM Washed Plain Weave' : category === 'Shoes' ? '12oz Brushed Canvas' : 'Pebbled Calfskin',
      color: input.colors?.length ? input.colors.join(', ') : 'Ivory, Sand, Espresso',
      pattern: 'Solid',
      gender: 'Unisex',
      productType: category === 'Shoes' ? 'Low-Top Footwear' : category === 'Accessories' ? 'Carry Goods' : 'Woven Top',
      season: 'Spring / Summer',
      careInstructions: category === 'Apparel' ? 'Machine wash cold gentle cycle, line dry in shade.' : 'Spot clean with damp cloth and mild natural balm.',
      fitNotes: 'True to size with relaxed tailored ease.',
    },
    colors: input.colors?.length ? input.colors : ['Ivory', 'Sand'],
    sizes: input.sizes?.length ? input.sizes : category === 'Shoes' ? ['39', '40', '41', '42', '43'] : category === 'Accessories' ? ['One Size'] : ['S', 'M', 'L', 'XL'],
    defaultStockPerVariant: 12,
    confidence: {
      name: 'High confidence',
      sku: input.manualSku ? 'High confidence' : 'Needs review',
      cost: input.manualCost && input.manualCost > 0 ? 'High confidence' : 'Needs review',
      variants: 'High confidence',
      attributes: 'High confidence',
    },
  };
}

const EN_TEMPLATES: Record<ProductCategory, string[]> = {
  Apparel: [
    'Tailored for effortless daily wear, the {name} pairs {material} construction with clean architectural stitching and breathable comfort across seasons.',
    'Cut with a balanced silhouette in {material}, the {name} delivers refined texture, natural drape, and enduring studio-grade finish.',
  ],
  Shoes: [
    'Built on a supportive cushioned footbed, the {name} combines {material} uppers with durable everyday traction and understated Scandinavian lines.',
    'Hand-finished in {material}, the {name} offers breathable comfort, clean tonal paneling, and versatile styling from studio to street.',
  ],
  Accessories: [
    'Designed for quiet utility, the {name} showcases {material} craftsmanship, reinforced hardware, and organized interior proportions.',
    'Elevated everyday essential crafted from {material}, the {name} balances minimalist form with lasting structural durability.',
  ],
};

const ES_TEMPLATES: Record<ProductCategory, string[]> = {
  Apparel: [
    'Diseñado para el uso diario con corte equilibrado, {name} combina {material} con costuras limpias, caída natural y gran comodidad térmica.',
    'Confeccionado en {material} de tacto suave, {name} ofrece una silueta atemporal, acabados cuidados y máxima versatilidad de armario.',
  ],
  Shoes: [
    'Elaborado sobre plantilla ergonómica acolchada, {name} une exterior en {material} con suela flexible de gran durabilidad y líneas minimalistas.',
    'Acabado artesanalmente en {material}, {name} proporciona ligereza, transpirabilidad y un diseño sobrio ideal para cualquier ocasión.',
  ],
  Accessories: [
    'Pensado para una funcionalidad serena, {name} destaca por su confección en {material}, herrajes cepillados y proporciones perfectamente estructuradas.',
    'Pieza esencial de diseño depurado en {material}, {name} equilibra resistencia estructural y estética minimalista.',
  ],
};

export async function generateProductDescription(
  product: Product,
  lang: 'en' | 'es',
  variantIdx = 0
): Promise<string> {
  await delay(650);
  const templates = lang === 'en' ? EN_TEMPLATES[product.category] : ES_TEMPLATES[product.category];
  const tpl = templates[variantIdx % templates.length];
  return tpl
    .replace(/\{name\}/g, product.name)
    .replace(/\{material\}/g, product.attributes.material.toLowerCase());
}

export async function generateAttributesAndSizing(
  product: Product
): Promise<Partial<ProductAttributes>> {
  await delay(600);
  return {
    fitNotes:
      product.category === 'Shoes'
        ? 'European standard sizing; half sizes recommended to size up for wider feet.'
        : product.category === 'Accessories'
        ? 'Structured silhouette sized for daily essentials and 14-inch laptops.'
        : 'Relaxed modern block with 2cm ease across chest and shoulder.',
    careInstructions:
      product.category === 'Apparel'
        ? 'Wash cold at 30°C with mild detergent. Steam on low heat while slightly damp.'
        : 'Wipe with dry soft brush; apply neutral conditioner seasonally.',
    season: 'All-Season Core Collection',
  };
}

/**
 * Selects realistic prepared studio sample image URLs from our local assets
 * matching the selected product & photography preset.
 */
export function resolveStudioPresetImage(
  product: Product,
  style: PhotographyStyle,
  background: StudioBackground,
  modelChoice: string
): ProductImage {
  const existingStudio = product.images.find((i) => i.category === 'Studio catalog') ?? product.images[0];
  let url = existingStudio?.url || '/images/products/linen-shirt-studio.jpg';
  let imageCategory: ProductImage['category'] = 'Studio catalog';

  if (product.sku === 'MF-204' || product.name.toLowerCase().includes('linen shirt')) {
    if (style === 'Detail photography') {
      url = '/images/products/linen-shirt-detail.jpg';
      imageCategory = 'Product detail';
    } else if (style === 'On-model studio') {
      url = '/images/products/linen-shirt-studio.jpg';
      imageCategory = 'On-model';
    } else {
      url = '/images/products/linen-shirt-studio.jpg';
      imageCategory = style === 'Lifestyle photography' ? 'Lifestyle' : 'Studio catalog';
    }
  } else if (product.category === 'Shoes') {
    if (product.sku === 'PF-125' || product.sku === 'PF-140' || product.name.toLowerCase().includes('loafer') || product.name.toLowerCase().includes('moccasin')) {
      url = '/images/products/suede-loafers-studio.jpg';
    } else {
      url = '/images/plates/canvas-sneakers-studio.svg';
    }
    imageCategory =
      style === 'Detail photography'
        ? 'Product detail'
        : style === 'Lifestyle photography'
        ? 'Lifestyle'
        : 'Studio catalog';
  } else if (product.category === 'Accessories') {
    url = existingStudio?.url || '/images/products/leather-tote-clean.jpg';
    imageCategory =
      style === 'Detail photography'
        ? 'Product detail'
        : style === 'Lifestyle photography'
        ? 'Lifestyle'
        : 'Studio catalog';
  } else if (style === 'On-model studio') {
    url =
      product.images.find((i) => i.category === 'On-model')?.url ||
      existingStudio?.url ||
      '/images/products/linen-shirt-studio.jpg';
    imageCategory = 'On-model';
  } else if (style === 'Detail photography') {
    url =
      product.images.find((i) => i.category === 'Product detail')?.url ||
      '/images/products/linen-shirt-detail.jpg';
    imageCategory = 'Product detail';
  } else if (style === 'Lifestyle photography') {
    url =
      product.images.find((i) => i.category === 'Lifestyle')?.url ||
      existingStudio?.url ||
      '/images/products/cotton-shorts-studio.jpg';
    imageCategory = 'Lifestyle';
  }

  const presetLabel =
    style === 'On-model studio' && product.category === 'Apparel'
      ? `${style} • ${background} • ${modelChoice}`
      : `${style} • ${background}`;

  return {
    id: `img-gen-${Date.now()}`,
    url,
    label: presetLabel,
    category: imageCategory,
    isPrimary: false,
    presetApplied: presetLabel,
  };
}

