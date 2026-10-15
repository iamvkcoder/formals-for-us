import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProductVariant {
  sku: string;
  size: string;
  color: string;
  stock: number;
  additionalPrice?: number;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  category: Types.ObjectId;
  categorySlug: string;
  brand: string;
  material: string;
  careInstructions: string;
  images: string[];
  basePrice: number;
  salePrice?: number;
  discountPercent?: number;
  colors: string[];
  sizes: string[];
  variants: IProductVariant[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isOfficeEssential: boolean;
  tags: string[];
  salesCount: number;
  viewCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    sku: { type: String, required: true },
    size: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    additionalPrice: { type: Number, default: 0 },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    categorySlug: {
      type: String,
      required: true,
      index: true,
    },
    brand: {
      type: String,
      default: 'FORMALS FOR US',
      trim: true,
    },
    material: {
      type: String,
      default: '100% Egyptian Giza Cotton',
      trim: true,
    },
    careInstructions: {
      type: String,
      default: 'Machine wash cold with like colors. Dry clean recommended for blazers and suits.',
    },
    images: {
      type: [String],
      required: true,
      validate: [(val: string[]) => val.length > 0, 'At least one product image is required'],
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    salePrice: {
      type: Number,
      min: 0,
    },
    discountPercent: {
      type: Number,
      min: 0,
      max: 100,
    },
    colors: {
      type: [String],
      default: [],
    },
    sizes: {
      type: [String],
      default: [],
    },
    variants: {
      type: [ProductVariantSchema],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
      index: true,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
      index: true,
    },
    isOfficeEssential: {
      type: Boolean,
      default: false,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    salesCount: {
      type: Number,
      default: 0,
      index: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for performant search & filters
ProductSchema.index({ name: 'text', description: 'text', tags: 'text', brand: 'text' });
ProductSchema.index({ categorySlug: 1, basePrice: 1, isActive: 1 });
ProductSchema.index({ isBestSeller: 1, isNewArrival: 1 });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
