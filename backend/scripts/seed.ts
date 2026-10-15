import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Category } from '../src/models/Category.js';
import { Product } from '../src/models/Product.js';
import { Coupon } from '../src/models/Coupon.js';

const categoriesData = [
  {
    name: 'Formal Shirts',
    slug: 'formal-shirts',
    description: 'Crisp, tailored pinpoint oxford and Egyptian cotton dress shirts for boardrooms and black-tie meetings.',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    displayOrder: 1,
  },
  {
    name: 'Formal Trousers',
    slug: 'formal-trousers',
    description: 'Precision-tailored flat front and pleated trousers engineered with comfort-stretch waistbands.',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
    displayOrder: 2,
  },
  {
    name: 'Blazers',
    slug: 'blazers',
    description: 'Unstructured and structured Italian wool blazers offering effortless sartorial authority.',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    displayOrder: 3,
  },
  {
    name: 'Business Suits',
    slug: 'business-suits',
    description: 'Two-piece and three-piece precision wool-blend suits handcrafted for key career milestones.',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    displayOrder: 4,
  },
  {
    name: 'Waistcoats',
    slug: 'waistcoats',
    description: 'Classic single and double-breasted formal waistcoats that refine three-piece ensembles.',
    image: 'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?auto=format&fit=crop&w=800&q=80',
    displayOrder: 5,
  },
  {
    name: 'Formal Shoes',
    slug: 'formal-shoes',
    description: 'Handcrafted Oxford brogues, Derby lace-ups, and single monk-straps in full-grain leather.',
    image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80',
    displayOrder: 6,
  },
  {
    name: 'Belts and Accessories',
    slug: 'belts-and-accessories',
    description: 'Reversible Italian leather belts, silk neckties, pocket squares, and minimalist cuff links.',
    image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80',
    displayOrder: 7,
  },
];

const productsData = [
  // 1. Formal Shirts
  {
    name: 'Royal Oxford Classic Dress Shirt',
    slug: 'royal-oxford-classic-dress-shirt',
    categorySlug: 'formal-shirts',
    brand: 'FORMALS FOR US Atelier',
    description: 'Crafted from 100% two-ply Egyptian Giza cotton with a distinguished spread collar and French cuffs. Naturally breathable, wrinkle-resistant, and finished with mother-of-pearl buttons.',
    material: '100% Egyptian Giza Cotton (140s two-ply)',
    careInstructions: 'Machine wash warm (40°C). Medium hot iron while slightly damp. Do not bleach.',
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80',
    ],
    basePrice: 2899,
    salePrice: 2499,
    discountPercent: 14,
    colors: ['Crisp White', 'Sky Blue', 'Soft Pink'],
    sizes: ['38 (S)', '40 (M)', '42 (L)', '44 (XL)', '46 (XXL)'],
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isOfficeEssential: true,
    tags: ['cotton', 'dress-shirt', 'oxford', 'executive', 'breathable'],
    variants: [
      { sku: 'SHIRT-OXF-WHT-38', size: '38 (S)', color: 'Crisp White', stock: 15 },
      { sku: 'SHIRT-OXF-WHT-40', size: '40 (M)', color: 'Crisp White', stock: 25 },
      { sku: 'SHIRT-OXF-WHT-42', size: '42 (L)', color: 'Crisp White', stock: 18 },
      { sku: 'SHIRT-OXF-WHT-44', size: '44 (XL)', color: 'Crisp White', stock: 8 },
      { sku: 'SHIRT-OXF-BLU-40', size: '40 (M)', color: 'Sky Blue', stock: 20 },
      { sku: 'SHIRT-OXF-BLU-42', size: '42 (L)', color: 'Sky Blue', stock: 14 },
      { sku: 'SHIRT-OXF-PNK-40', size: '40 (M)', color: 'Soft Pink', stock: 3 }, // low stock test
    ],
  },
  {
    name: 'Executive Twill French Cuff Shirt',
    slug: 'executive-twill-french-cuff-shirt',
    categorySlug: 'formal-shirts',
    brand: 'FORMALS FOR US Atelier',
    description: 'A structured diagonal twill weave giving a subtle luster, ideal for executive meetings and boardroom negotiations. Cut in a tailored modern fit.',
    material: '100% Superfine Compact Cotton',
    careInstructions: 'Machine wash 30°C. Warm iron. Stiff collar inserts included.',
    images: [
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    ],
    basePrice: 3299,
    salePrice: 2899,
    discountPercent: 12,
    colors: ['French Blue', 'Crisp White'],
    sizes: ['38 (S)', '40 (M)', '42 (L)', '44 (XL)'],
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: true,
    isOfficeEssential: true,
    tags: ['twill', 'french-cuff', 'blue', 'boardroom'],
    variants: [
      { sku: 'SHIRT-TWL-BLU-38', size: '38 (S)', color: 'French Blue', stock: 12 },
      { sku: 'SHIRT-TWL-BLU-40', size: '40 (M)', color: 'French Blue', stock: 18 },
      { sku: 'SHIRT-TWL-BLU-42', size: '42 (L)', color: 'French Blue', stock: 9 },
      { sku: 'SHIRT-TWL-WHT-40', size: '40 (M)', color: 'Crisp White', stock: 15 },
    ],
  },
  {
    name: 'Sartorial Dobby Weave Evening Shirt',
    slug: 'sartorial-dobby-weave-evening-shirt',
    categorySlug: 'formal-shirts',
    brand: 'Executive Line',
    description: 'Micro-geometric dobby texture with an English spread collar. Creates an understated textured look under blazers and dinner jackets.',
    material: '100% Mercerized Cotton',
    careInstructions: 'Dry clean or gentle hand wash.',
    images: [
      'https://images.unsplash.com/photo-1620012253295-c15c429f6048?auto=format&fit=crop&w=800&q=80',
    ],
    basePrice: 2699,
    colors: ['Jet Black', 'Crisp White'],
    sizes: ['38 (S)', '40 (M)', '42 (L)', '44 (XL)'],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isOfficeEssential: false,
    tags: ['dobby', 'black-shirt', 'evening', 'reception'],
    variants: [
      { sku: 'SHIRT-DOB-BLK-40', size: '40 (M)', color: 'Jet Black', stock: 14 },
      { sku: 'SHIRT-DOB-BLK-42', size: '42 (L)', color: 'Jet Black', stock: 10 },
      { sku: 'SHIRT-DOB-WHT-40', size: '40 (M)', color: 'Crisp White', stock: 12 },
    ],
  },

  // 2. Formal Trousers
  {
    name: 'Tailored Flat-Front Wool-Blend Trousers',
    slug: 'tailored-flat-front-wool-blend-trousers',
    categorySlug: 'formal-trousers',
    brand: 'FORMALS FOR US Atelier',
    description: 'A tailored silhouette featuring an extended tab waistband, internal curtain waistband for shirt grip, and natural crease retention.',
    material: '70% Wool, 28% Poly, 2% Elastane',
    careInstructions: 'Dry clean only. Press with cloth.',
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80',
    ],
    basePrice: 3499,
    salePrice: 2999,
    discountPercent: 14,
    colors: ['Charcoal Grey', 'Navy Blue', 'Jet Black'],
    sizes: ['30', '32', '34', '36', '38'],
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isOfficeEssential: true,
    tags: ['trousers', 'charcoal', 'wool-blend', 'flat-front'],
    variants: [
      { sku: 'TR-FLAT-GRY-30', size: '30', color: 'Charcoal Grey', stock: 10 },
      { sku: 'TR-FLAT-GRY-32', size: '32', color: 'Charcoal Grey', stock: 22 },
      { sku: 'TR-FLAT-GRY-34', size: '34', color: 'Charcoal Grey', stock: 19 },
      { sku: 'TR-FLAT-GRY-36', size: '36', color: 'Charcoal Grey', stock: 14 },
      { sku: 'TR-FLAT-NAV-32', size: '32', color: 'Navy Blue', stock: 18 },
      { sku: 'TR-FLAT-NAV-34', size: '34', color: 'Navy Blue', stock: 16 },
      { sku: 'TR-FLAT-BLK-32', size: '32', color: 'Jet Black', stock: 2 }, // low stock
    ],
  },
  {
    name: 'Milanese Single Pleat Formal Trousers',
    slug: 'milanese-single-pleat-formal-trousers',
    categorySlug: 'formal-trousers',
    brand: 'Executive Line',
    description: 'Inspired by classic Italian tailoring with single forward pleats, side adjusters in place of belt loops, and an elegant 1.5-inch turn-up hem.',
    material: 'Poly-Viscose Comfort Stretch Weave',
    careInstructions: 'Gentle cycle machine wash 30°C or dry clean.',
    images: [
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80',
    ],
    basePrice: 2799,
    salePrice: 2399,
    discountPercent: 14,
    colors: ['Olive Tailored', 'Navy Blue'],
    sizes: ['30', '32', '34', '36', '38'],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isOfficeEssential: true,
    tags: ['pleated', 'side-adjusters', 'olive', 'comfort-stretch'],
    variants: [
      { sku: 'TR-PLT-OLV-32', size: '32', color: 'Olive Tailored', stock: 15 },
      { sku: 'TR-PLT-OLV-34', size: '34', color: 'Olive Tailored', stock: 12 },
      { sku: 'TR-PLT-NAV-32', size: '32', color: 'Navy Blue', stock: 14 },
      { sku: 'TR-PLT-NAV-34', size: '34', color: 'Navy Blue', stock: 11 },
    ],
  },

  // 3. Blazers
  {
    name: 'Midnight Navy Hopsack Wool Blazer',
    slug: 'midnight-navy-hopsack-wool-blazer',
    categorySlug: 'blazers',
    brand: 'FORMALS FOR US Atelier',
    description: 'The definitive cornerstone of the professional wardrobe. Woven in open-weave hopsack wool that breathes effortlessly in Indian weather while retaining sharp drape.',
    material: '100% Super 110s Australian Wool',
    careInstructions: 'Specialist dry clean only. Steam refresh recommended.',
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    ],
    basePrice: 8999,
    salePrice: 7999,
    discountPercent: 11,
    colors: ['Navy Blue'],
    sizes: ['38R', '40R', '42R', '44R'],
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isOfficeEssential: true,
    tags: ['blazer', 'navy', 'hopsack', 'italian-cut', 'wool'],
    variants: [
      { sku: 'BLZ-HOP-NAV-38', size: '38R', color: 'Navy Blue', stock: 8 },
      { sku: 'BLZ-HOP-NAV-40', size: '40R', color: 'Navy Blue', stock: 14 },
      { sku: 'BLZ-HOP-NAV-42', size: '42R', color: 'Navy Blue', stock: 11 },
      { sku: 'BLZ-HOP-NAV-44', size: '44R', color: 'Navy Blue', stock: 4 }, // low stock
    ],
  },
  {
    name: 'English Herringbone Charcoal Blazer',
    slug: 'english-herringbone-charcoal-blazer',
    categorySlug: 'blazers',
    brand: 'FORMALS FOR US Atelier',
    description: 'Subtle micro-herringbone motif woven in soft wool-blend flannel. Features notch lapels, flap pockets, and double rear vents for natural movement.',
    material: 'Wool Flannel & Viscose Blend',
    careInstructions: 'Dry clean only.',
    images: [
      'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=800&q=80',
    ],
    basePrice: 9499,
    salePrice: 8499,
    discountPercent: 10,
    colors: ['Charcoal Grey'],
    sizes: ['38R', '40R', '42R', '44R'],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isOfficeEssential: false,
    tags: ['herringbone', 'charcoal', 'blazer', 'winter-formal'],
    variants: [
      { sku: 'BLZ-HRB-GRY-38', size: '38R', color: 'Charcoal Grey', stock: 6 },
      { sku: 'BLZ-HRB-GRY-40', size: '40R', color: 'Charcoal Grey', stock: 10 },
      { sku: 'BLZ-HRB-GRY-42', size: '42R', color: 'Charcoal Grey', stock: 7 },
    ],
  },

  // 4. Business Suits
  {
    name: 'Savile Peak Lapel Two-Piece Suit',
    slug: 'savile-peak-lapel-two-piece-suit',
    categorySlug: 'business-suits',
    brand: 'FORMALS FOR US Atelier',
    description: 'Full canvas construction with commanding peak lapels, horn buttons, and matching slim-tailored trousers. Engineered for keynote presentations and partner meetings.',
    material: 'Italian Super 120s Worsted Wool',
    careInstructions: 'Professional dry clean only. Store on wooden wishbone hanger.',
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    ],
    basePrice: 16999,
    salePrice: 14999,
    discountPercent: 12,
    colors: ['Deep Navy', 'Charcoal Grey'],
    sizes: ['38R', '40R', '42R', '44R'],
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isOfficeEssential: true,
    tags: ['suit', 'two-piece', 'peak-lapel', 'super-120s', 'investment-piece'],
    variants: [
      { sku: 'SUIT-SVL-NAV-38', size: '38R', color: 'Deep Navy', stock: 5 },
      { sku: 'SUIT-SVL-NAV-40', size: '40R', color: 'Deep Navy', stock: 8 },
      { sku: 'SUIT-SVL-NAV-42', size: '42R', color: 'Deep Navy', stock: 6 },
      { sku: 'SUIT-SVL-GRY-40', size: '40R', color: 'Charcoal Grey', stock: 7 },
      { sku: 'SUIT-SVL-GRY-42', size: '42R', color: 'Charcoal Grey', stock: 5 },
    ],
  },
  {
    name: 'Atelier Three-Piece Black Tie Suit',
    slug: 'atelier-three-piece-black-tie-suit',
    categorySlug: 'business-suits',
    brand: 'FORMALS FOR US Atelier',
    description: 'The pinnacle of black-tie sophistication. Includes single-breasted jacket with satin-faced peak lapels, tailored waistcoat, and side-band trousers.',
    material: 'Pure Wool & Silk-Faced Lapels',
    careInstructions: 'Specialist dry clean only.',
    images: [
      'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?auto=format&fit=crop&w=800&q=80',
    ],
    basePrice: 21999,
    salePrice: 18999,
    discountPercent: 14,
    colors: ['Jet Black'],
    sizes: ['38R', '40R', '42R', '44R'],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isOfficeEssential: false,
    tags: ['tuxedo', 'three-piece', 'black-tie', 'evening'],
    variants: [
      { sku: 'SUIT-3PC-BLK-38', size: '38R', color: 'Jet Black', stock: 4 },
      { sku: 'SUIT-3PC-BLK-40', size: '40R', color: 'Jet Black', stock: 6 },
      { sku: 'SUIT-3PC-BLK-42', size: '42R', color: 'Jet Black', stock: 5 },
    ],
  },

  // 5. Waistcoats
  {
    name: 'Sartorial Single-Breasted Wool Waistcoat',
    slug: 'sartorial-single-breasted-wool-waistcoat',
    categorySlug: 'waistcoats',
    brand: 'Executive Line',
    description: 'Designed with five bespoke covered buttons, dual jetted watch pockets, and an adjustable cinch buckle on the satin back lining.',
    material: 'Worsted Wool Blend with Viscose Satin Back',
    careInstructions: 'Dry clean only.',
    images: [
      'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?auto=format&fit=crop&w=800&q=80',
    ],
    basePrice: 3499,
    salePrice: 2999,
    discountPercent: 14,
    colors: ['Deep Navy', 'Charcoal Grey'],
    sizes: ['38 (S)', '40 (M)', '42 (L)', '44 (XL)'],
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    isOfficeEssential: true,
    tags: ['waistcoat', 'vest', 'three-piece', 'tailored'],
    variants: [
      { sku: 'WST-SGL-NAV-38', size: '38 (S)', color: 'Deep Navy', stock: 7 },
      { sku: 'WST-SGL-NAV-40', size: '40 (M)', color: 'Deep Navy', stock: 12 },
      { sku: 'WST-SGL-NAV-42', size: '42 (L)', color: 'Deep Navy', stock: 9 },
      { sku: 'WST-SGL-GRY-40', size: '40 (M)', color: 'Charcoal Grey', stock: 8 },
    ],
  },

  // 6. Formal Shoes
  {
    name: 'Handcrafted Cap-Toe Oxford Brogues',
    slug: 'handcrafted-cap-toe-oxford-brogues',
    categorySlug: 'formal-shoes',
    brand: 'FORMALS FOR US Footwear',
    description: 'Constructed from full-grain calfskin leather with a Goodyear welted leather sole, high-density foam insoles, and hand-burnished finishing at the toe.',
    material: '100% Full-Grain Calfskin Leather',
    careInstructions: 'Condition with beeswax polish and use cedar shoe trees.',
    images: [
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80',
    ],
    basePrice: 5999,
    salePrice: 4999,
    discountPercent: 16,
    colors: ['Jet Black', 'Rich Tan'],
    sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'],
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isOfficeEssential: true,
    tags: ['shoes', 'oxford', 'leather', 'goodyear-welt', 'brogue'],
    variants: [
      { sku: 'SHOE-OXF-BLK-7', size: 'UK 7', color: 'Jet Black', stock: 5 },
      { sku: 'SHOE-OXF-BLK-8', size: 'UK 8', color: 'Jet Black', stock: 12 },
      { sku: 'SHOE-OXF-BLK-9', size: 'UK 9', color: 'Jet Black', stock: 14 },
      { sku: 'SHOE-OXF-BLK-10', size: 'UK 10', color: 'Jet Black', stock: 8 },
      { sku: 'SHOE-OXF-TAN-8', size: 'UK 8', color: 'Rich Tan', stock: 9 },
      { sku: 'SHOE-OXF-TAN-9', size: 'UK 9', color: 'Rich Tan', stock: 10 },
    ],
  },
  {
    name: 'Single Monk-Strap Dress Shoes',
    slug: 'single-monk-strap-dress-shoes',
    categorySlug: 'formal-shoes',
    brand: 'FORMALS FOR US Footwear',
    description: 'Clean vamp fastened with a brushed silver buckle. Seamlessly bridges contemporary boardroom polish and smart evening attire.',
    material: 'Polished Box Calf Leather',
    careInstructions: 'Wipe clean with a soft dry cloth. Apply neutral cream.',
    images: [
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80',
    ],
    basePrice: 5499,
    colors: ['Deep Burgundy', 'Jet Black'],
    sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10'],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isOfficeEssential: false,
    tags: ['monk-strap', 'leather', 'shoes', 'burgundy'],
    variants: [
      { sku: 'SHOE-MNK-BUR-8', size: 'UK 8', color: 'Deep Burgundy', stock: 6 },
      { sku: 'SHOE-MNK-BUR-9', size: 'UK 9', color: 'Deep Burgundy', stock: 7 },
      { sku: 'SHOE-MNK-BLK-8', size: 'UK 8', color: 'Jet Black', stock: 8 },
    ],
  },

  // 7. Belts & Accessories
  {
    name: 'Reversible Italian Full-Grain Leather Belt',
    slug: 'reversible-italian-full-grain-leather-belt',
    categorySlug: 'belts-and-accessories',
    brand: 'FORMALS FOR US Accessories',
    description: 'Twist-mechanism reversible buckle in brushed gunmetal. Reversible between classic Jet Black and Warm Cognac Tan, eliminating the need for two separate belts.',
    material: '100% Genuine Italian Leather',
    careInstructions: 'Avoid prolonged moisture. Treat with leather conditioner.',
    images: [
      'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80',
    ],
    basePrice: 1899,
    salePrice: 1599,
    discountPercent: 15,
    colors: ['Jet Black / Cognac'],
    sizes: ['32-34 (M)', '36-38 (L)', '40-42 (XL)'],
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isOfficeEssential: true,
    tags: ['belt', 'leather', 'reversible', 'accessories'],
    variants: [
      { sku: 'BLT-REV-32', size: '32-34 (M)', color: 'Jet Black / Cognac', stock: 20 },
      { sku: 'BLT-REV-36', size: '36-38 (L)', color: 'Jet Black / Cognac', stock: 25 },
      { sku: 'BLT-REV-40', size: '40-42 (XL)', color: 'Jet Black / Cognac', stock: 12 },
    ],
  },
  {
    name: 'Woven Mulberry Silk Tie & Pocket Square Set',
    slug: 'woven-mulberry-silk-tie-and-pocket-square-set',
    categorySlug: 'belts-and-accessories',
    brand: 'FORMALS FOR US Accessories',
    description: 'High-density jacquard woven silk in a classic champagne micro-dot design with matching hand-rolled pocket square.',
    material: '100% Mulberry Silk',
    careInstructions: 'Dry clean only. Do not iron directly.',
    images: [
      'https://images.unsplash.com/photo-1589756823695-278bc923f962?auto=format&fit=crop&w=800&q=80',
    ],
    basePrice: 1699,
    colors: ['Champagne Gold', 'Royal Navy'],
    sizes: ['One Size'],
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    isOfficeEssential: true,
    tags: ['silk-tie', 'accessories', 'pocket-square', 'champagne'],
    variants: [
      { sku: 'ACC-TIE-CHM-OS', size: 'One Size', color: 'Champagne Gold', stock: 18 },
      { sku: 'ACC-TIE-NAV-OS', size: 'One Size', color: 'Royal Navy', stock: 22 },
    ],
  },
];

const couponsData = [
  {
    code: 'WELCOME10',
    description: '10% off on your first formalwear purchase',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 1499,
    maxDiscount: 500,
    validUntil: new Date('2028-12-31'),
    usageLimit: 5000,
  },
  {
    code: 'ELEVATE500',
    description: 'Flat ₹500 discount on orders above ₹3,999',
    discountType: 'fixed',
    discountValue: 500,
    minOrderValue: 3999,
    validUntil: new Date('2028-12-31'),
    usageLimit: 2000,
  },
  {
    code: 'FORMAL20',
    description: '20% off on premium suit and blazer ensembles',
    discountType: 'percentage',
    discountValue: 20,
    minOrderValue: 5000,
    maxDiscount: 1500,
    validUntil: new Date('2028-12-31'),
    usageLimit: 1000,
  },
];

export async function seedDatabase() {
  try {
    await connectDB();
    console.log('[Seed] Connected to database. Seeding formal catalog...');

    // 1. Seed Categories
    const categoryMap = new Map();
    for (const cat of categoriesData) {
      const savedCat = await Category.findOneAndUpdate(
        { slug: cat.slug },
        cat,
        { upsert: true, new: true }
      );
      categoryMap.set(cat.slug, savedCat);
    }
    console.log(`[Seed] Seeded ${categoryMap.size} categories.`);

    // 2. Seed Products
    let productCount = 0;
    for (const prod of productsData) {
      const cat = categoryMap.get(prod.categorySlug);
      if (!cat) continue;

      await Product.findOneAndUpdate(
        { slug: prod.slug },
        {
          ...prod,
          category: cat._id,
        },
        { upsert: true, new: true }
      );
      productCount++;
    }
    console.log(`[Seed] Seeded ${productCount} formalwear products.`);

    // 3. Seed Coupons
    for (const coup of couponsData) {
      await Coupon.findOneAndUpdate(
        { code: coup.code },
        coup,
        { upsert: true, new: true }
      );
    }
    console.log(`[Seed] Seeded ${couponsData.length} coupons.`);

    // 4. Seed Accounts
    // Admin user
    const adminEmail = 'admin@formalsforus.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = new User({
        name: 'Executive Admin',
        email: adminEmail,
        password: 'Admin@12345',
        role: 'admin',
        phone: '9876543210',
      });
      await admin.save();
      console.log(`[Seed] Created admin account: ${adminEmail} (password: Admin@12345)`);
    } else {
      admin.role = 'admin';
      await admin.save();
      console.log(`[Seed] Admin account ${adminEmail} verified.`);
    }

    // Demo Customer user
    const customerEmail = 'arjun.mehta@example.com';
    let customer = await User.findOne({ email: customerEmail });
    if (!customer) {
      customer = new User({
        name: 'Arjun Mehta',
        email: customerEmail,
        password: 'Customer@12345',
        role: 'customer',
        phone: '9123456789',
      });
      await customer.save();
      console.log(`[Seed] Created customer account: ${customerEmail} (password: Customer@12345)`);
    }

    console.log('[Seed] Database seeding completed successfully!');
  } catch (error) {
    console.error('[Seed] Seeding failed:', error);
  } finally {
    await disconnectDB();
  }
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedDatabase();
}
