import { ProductCategory } from '../types';

import attaImg from '../assets/images/whole_wheat_atta_1787827371649.jpg';
import basmatiImg from '../assets/images/basmati_rice_grains_1787827387741.jpg';
import sonaMasooriImg from '../assets/images/sona_masoori_rice_1787827645247.jpg';
import sunflowerOilImg from '../assets/images/sunflower_cooking_oil_1787827661530.jpg';
import tableSaltImg from '../assets/images/iodized_table_salt_1787827676677.jpg';
import refinedSugarImg from '../assets/images/refined_sugar_crystals_1787827691397.jpg';
import maidaImg from '../assets/images/maida_refined_flour_1787827705739.jpg';
import sujiImg from '../assets/images/suji_rava_semolina_1787827317448.jpg';
import besanImg from '../assets/images/besan_gram_flour_1787827284157.jpg';
import pohaImg from '../assets/images/poha_flattened_rice_1787827266611.jpg';
import sabudanaImg from '../assets/images/sabudana_sago_pearls_1787827302147.jpg';
import oatsImg from '../assets/images/rolled_oats_flakes_1787827348852.jpg';
import vermicelliImg from '../assets/images/vermicelli_sevai_1787827333239.jpg';
import notebookImg from '../assets/images/classmate_notebook_pen_1787827715624.jpg';
import pensImg from '../assets/images/pens_stationery_set_1787827729004.jpg';
import geometryBoxImg from '../assets/images/geometry_box_stationery_1787827742805.jpg';
import teaGoldImg from '../assets/images/premium_tea_blend_1787827759445.jpg';
import instantCoffeeImg from '../assets/images/instant_coffee_jar_1787827775031.jpg';
import mangoJuiceImg from '../assets/images/mango_juice_drink_1787827788301.jpg';
import bodyLotionImg from '../assets/images/body_lotion_bottle_1787827803259.jpg';
import soapBarImg from '../assets/images/antibacterial_soap_bar_1787827818563.jpg';
import coconutOilImg from '../assets/images/coconut_hair_oil_1787827834283.jpg';
import detergentImg from '../assets/images/washing_detergent_powder_1787827848722.jpg';
import dishwashGelImg from '../assets/images/lemon_dishwash_gel_1787827862023.jpg';
import toiletCleanerImg from '../assets/images/toilet_cleaner_bottle_1787827880051.jpg';
import toothpasteImg from '../assets/images/dental_toothpaste_brush_1787827900612.jpg';
import shampooImg from '../assets/images/hair_shampoo_bottle_1787827913806.jpg';
import typecCableImg from '../assets/images/braided_typec_cable_1787827926822.jpg';
import aaBatteriesImg from '../assets/images/alkaline_aa_batteries_1787827948635.jpg';

export {
  attaImg,
  basmatiImg,
  sonaMasooriImg,
  sunflowerOilImg,
  tableSaltImg,
  refinedSugarImg,
  maidaImg,
  pohaImg,
  besanImg,
  sabudanaImg,
  sujiImg,
  vermicelliImg,
  oatsImg,
  notebookImg,
  pensImg,
  geometryBoxImg,
  teaGoldImg,
  instantCoffeeImg,
  mangoJuiceImg,
  bodyLotionImg,
  soapBarImg,
  coconutOilImg,
  detergentImg,
  dishwashGelImg,
  toiletCleanerImg,
  toothpasteImg,
  shampooImg,
  typecCableImg,
  aaBatteriesImg,
};

export interface ProductPhotoPreset {
  id: string;
  name: string;
  category: ProductCategory;
  imageUrl: string;
  keywords: string[];
}

export const CATEGORY_FALLBACK_IMAGES: Record<ProductCategory, string> = {
  grocery: attaImg,
  stationery: notebookImg,
  cosmetic: bodyLotionImg,
  beverages: teaGoldImg,
  household: detergentImg,
  personalCare: toothpasteImg,
  electronics: typecCableImg,
  other: attaImg,
};

export const REAL_PRODUCT_PRESETS: ProductPhotoPreset[] = [
  // --- GROCERY ---
  {
    id: 'preset-atta',
    name: 'Whole Wheat Atta (Chakki Ground)',
    category: 'grocery',
    imageUrl: attaImg,
    keywords: ['atta', 'wheat', 'flour', 'roti', 'chakki', 'aashirvaad'],
  },
  {
    id: 'preset-basmati-rice',
    name: 'Basmati Rice (Long Grain)',
    category: 'grocery',
    imageUrl: basmatiImg,
    keywords: ['basmati', 'daawat', 'india gate', 'biryani', 'long grain'],
  },
  {
    id: 'preset-sona-masoori',
    name: 'Sona Masoori Rice (Raw White Rice)',
    category: 'grocery',
    imageUrl: sonaMasooriImg,
    keywords: ['sona', 'masoori', 'chawal', 'boiled rice', 'white rice', 'rice'],
  },
  {
    id: 'preset-suji',
    name: 'Suji / Rava (Granulated Semolina)',
    category: 'grocery',
    imageUrl: sujiImg,
    keywords: ['suji', 'rava', 'semolina', 'halwa', 'upma'],
  },
  {
    id: 'preset-besan',
    name: 'Besan (Pure Gram Flour)',
    category: 'grocery',
    imageUrl: besanImg,
    keywords: ['besan', 'gram flour', 'chana', 'pakoda', 'yellow flour', 'chickpea'],
  },
  {
    id: 'preset-poha',
    name: 'Poha (Flattened Rice Flakes)',
    category: 'grocery',
    imageUrl: pohaImg,
    keywords: ['poha', 'chivda', 'flattened rice', 'aval', 'breakfast', 'beaten rice'],
  },
  {
    id: 'preset-sabudana',
    name: 'Sabudana (Tapioca Sago Pearls)',
    category: 'grocery',
    imageUrl: sabudanaImg,
    keywords: ['sabudana', 'sago', 'tapioca', 'khichdi', 'pearls'],
  },
  {
    id: 'preset-oats',
    name: 'Rolled Oats (100% Whole Grain)',
    category: 'grocery',
    imageUrl: oatsImg,
    keywords: ['oats', 'quaker', 'kelloggs', 'porridge', 'cereal', 'rolled oats'],
  },
  {
    id: 'preset-vermicelli',
    name: 'Vermicelli / Sevai (Golden Roasted)',
    category: 'grocery',
    imageUrl: vermicelliImg,
    keywords: ['vermicelli', 'sevai', 'noodles', 'kheer', 'seviyan', 'bambino'],
  },
  {
    id: 'preset-maida',
    name: 'Maida (Refined White Flour)',
    category: 'grocery',
    imageUrl: maidaImg,
    keywords: ['maida', 'all-purpose', 'flour', 'refined', 'baking', 'white flour'],
  },
  {
    id: 'preset-oil',
    name: 'Fortune Sunflower Cooking Oil',
    category: 'grocery',
    imageUrl: sunflowerOilImg,
    keywords: ['oil', 'sunflower', 'mustard', 'fortune', 'refined oil', 'cooking oil', 'sunlite'],
  },
  {
    id: 'preset-salt',
    name: 'Tata Salt Vacuum Evaporated Iodized Salt',
    category: 'grocery',
    imageUrl: tableSaltImg,
    keywords: ['salt', 'tata salt', 'namak', 'iodized', 'vacuum'],
  },
  {
    id: 'preset-sugar',
    name: 'Madhur Refined Pure Cane Sugar',
    category: 'grocery',
    imageUrl: refinedSugarImg,
    keywords: ['sugar', 'cheeni', 'sweetener', 'cane sugar', 'madhur'],
  },
  {
    id: 'preset-turmeric',
    name: 'Turmeric Powder (Haldi)',
    category: 'grocery',
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
    keywords: ['turmeric', 'haldi', 'spice', 'everest', 'masala'],
  },
  {
    id: 'preset-ghee',
    name: 'Pure Desi Ghee / Butter',
    category: 'grocery',
    imageUrl: 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&w=600&q=80',
    keywords: ['ghee', 'amul', 'butter', 'dairy', 'clarified'],
  },

  // --- STATIONERY ---
  {
    id: 'preset-notebook-a4',
    name: 'Classmate A4 Ruled Long Notebook',
    category: 'stationery',
    imageUrl: notebookImg,
    keywords: ['notebook', 'classmate', 'a4', 'copy', 'book', 'ruled', 'single line', 'pages', 'spiral', 'pulse', 'diary', 'journal'],
  },
  {
    id: 'preset-ball-pen',
    name: 'Ballpoint & Liquid Gel Pens',
    category: 'stationery',
    imageUrl: pensImg,
    keywords: ['pen', 'ballpen', 'pentonic', 'linc', 'cello', 'ink', 'gel pen', 'trimax', 'reynolds', 'rollerball', 'pilot'],
  },
  {
    id: 'preset-pencils',
    name: 'DOMS X1 Extra Dark Pencils',
    category: 'stationery',
    imageUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80',
    keywords: ['pencil', 'doms', 'apsara', 'natraj', 'graphite', 'eraser'],
  },
  {
    id: 'preset-glue-stick',
    name: 'Fevistik Adhesive Glue Stick',
    category: 'stationery',
    imageUrl: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=600&q=80',
    keywords: ['glue', 'fevistik', 'fevicol', 'gum', 'craft', 'stick'],
  },
  {
    id: 'preset-stapler',
    name: 'Kangaro Pocket Desk Stapler',
    category: 'stationery',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    keywords: ['stapler', 'kangaro', 'pins', 'desk', 'office'],
  },
  {
    id: 'preset-geometry-box',
    name: 'Camlin Scholar Geometry Box Set',
    category: 'stationery',
    imageUrl: geometryBoxImg,
    keywords: ['geometry', 'camlin', 'compass', 'scale', 'math', 'instruments'],
  },

  // --- COSMETICS & SKINCARE ---
  {
    id: 'preset-body-lotion',
    name: 'Vaseline Deep Moisture Body Lotion',
    category: 'cosmetic',
    imageUrl: bodyLotionImg,
    keywords: ['vaseline', 'lotion', 'cream', 'moisturizer', 'nivea', 'skin'],
  },
  {
    id: 'preset-bath-soap',
    name: 'Dettol Antibacterial Bathing Soap Bar',
    category: 'cosmetic',
    imageUrl: soapBarImg,
    keywords: ['soap', 'dettol', 'lux', 'dove', 'lifebuoy', 'bathing', 'bar'],
  },
  {
    id: 'preset-coconut-oil',
    name: 'Parachute 100% Pure Coconut Hair Oil',
    category: 'cosmetic',
    imageUrl: coconutOilImg,
    keywords: ['hair oil', 'coconut oil', 'parachute', 'almond oil', 'coconut'],
  },

  // --- BEVERAGES ---
  {
    id: 'preset-tea-leaves',
    name: 'Tata Tea Gold Leaf Premium Blend',
    category: 'beverages',
    imageUrl: teaGoldImg,
    keywords: ['tea', 'tata tea', 'chai', 'red label', 'taj mahal', 'assam', 'leaf'],
  },
  {
    id: 'preset-coffee',
    name: 'BRU Instant Roasted Coffee Glass Jar',
    category: 'beverages',
    imageUrl: instantCoffeeImg,
    keywords: ['coffee', 'bru', 'nescafe', 'espresso', 'cappuccino', 'roasted'],
  },
  {
    id: 'preset-fruit-juice',
    name: 'Frooti Real Mango Juice Drink',
    category: 'beverages',
    imageUrl: mangoJuiceImg,
    keywords: ['juice', 'mango', 'frooti', 'maaza', 'real juice', 'drink', 'beverage'],
  },

  // --- HOUSEHOLD & CLEANING ---
  {
    id: 'preset-detergent-powder',
    name: 'Surf Excel Quick Wash Detergent Powder',
    category: 'household',
    imageUrl: detergentImg,
    keywords: ['detergent', 'surf excel', 'ariel', 'washing powder', 'tide', 'surf', 'wash'],
  },
  {
    id: 'preset-toilet-cleaner',
    name: 'Harpic Power Plus Disinfectant Toilet Cleaner',
    category: 'household',
    imageUrl: toiletCleanerImg,
    keywords: ['cleaner', 'harpic', 'lysol', 'disinfectant', 'toilet cleaner', 'toilet'],
  },
  {
    id: 'preset-dishwash-gel',
    name: 'Vim Dishwash Gel Lemon Concentrated',
    category: 'household',
    imageUrl: dishwashGelImg,
    keywords: ['dishwash', 'vim', 'pril', 'utensil', 'lemon gel', 'dish', 'gel'],
  },

  // --- PERSONAL CARE ---
  {
    id: 'preset-toothpaste',
    name: 'Colgate Total Antibacterial Toothpaste',
    category: 'personalCare',
    imageUrl: toothpasteImg,
    keywords: ['toothpaste', 'colgate', 'pepsodent', 'close up', 'sensodyne', 'brush', 'dental'],
  },
  {
    id: 'preset-shampoo',
    name: 'Head & Shoulders Anti-Dandruff Shampoo',
    category: 'personalCare',
    imageUrl: shampooImg,
    keywords: ['shampoo', 'head & shoulders', 'head shoulders', 'clinic plus', 'pantene', 'sunsilk', 'hair'],
  },

  // --- ELECTRONICS & ACCESSORIES ---
  {
    id: 'preset-typec-cable',
    name: 'boAt Fast Charging Type-C USB Cable',
    category: 'electronics',
    imageUrl: typecCableImg,
    keywords: ['cable', 'type c', 'type-c', 'charger', 'usb', 'boat', 'wire', 'fast charging'],
  },
  {
    id: 'preset-batteries',
    name: 'Duracell Ultra Alkaline AA Batteries (Pack of 4)',
    category: 'electronics',
    imageUrl: aaBatteriesImg,
    keywords: ['battery', 'duracell', 'eveready', 'cells', 'aa battery', 'alkaline', 'batteries'],
  },
];

/**
 * Intelligent helper to find the most accurate real photo preset for any given product name & category
 */
export function getMatchingProductImage(name: string, category: ProductCategory): string {
  const query = name.toLowerCase().trim();
  
  // 1. Direct match by keywords
  for (const preset of REAL_PRODUCT_PRESETS) {
    if (preset.keywords.some((kw) => query.includes(kw))) {
      return preset.imageUrl;
    }
  }

  // 2. Preset in same category
  const catPresets = REAL_PRODUCT_PRESETS.filter((p) => p.category === category);
  if (catPresets.length > 0) {
    return catPresets[0].imageUrl;
  }

  // 3. Fallback for category
  return CATEGORY_FALLBACK_IMAGES[category] || CATEGORY_FALLBACK_IMAGES.grocery;
}

