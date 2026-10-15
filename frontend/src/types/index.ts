export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  createdAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount?: number;
}

export interface ProductVariant {
  sku: string;
  size: string;
  color: string;
  stock: number;
  additionalPrice?: number;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: { _id: string; name: string; slug: string } | string;
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
  variants: ProductVariant[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isOfficeEssential: boolean;
  tags: string[];
  salesCount: number;
  viewCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface CartItem {
  _id: string;
  product: Product;
  sku: string;
  size: string;
  color: string;
  quantity: number;
}

export interface CartPricing {
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  tax: number;
  total: number;
}

export interface Cart {
  _id?: string;
  items: CartItem[];
  pricing: CartPricing;
}

export interface Address {
  _id?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Return Requested'
  | 'Returned'
  | 'Refunded';

export interface OrderItem {
  product: string;
  productName: string;
  productImage: string;
  sku: string;
  size: string;
  color: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  shippingAddress: Address;
  pricing: CartPricing;
  payment: {
    method: 'cod' | 'online_simulated' | 'razorpay';
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    transactionId?: string;
    paymentDate?: string;
    simulated?: boolean;
  };
  orderStatus: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    comment?: string;
  }[];
  cancellationReason?: string;
  returnReason?: string;
  createdAt: string;
}

export interface Recommendation {
  product: Product;
  score: number;
  reason: string;
}

export interface AdminAnalytics {
  summary: {
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    totalProducts: number;
    lowStockCount: number;
  };
  statusDistribution: { _id: string; count: number }[];
  salesByDate: { _id: string; revenue: number; orders: number }[];
  recentOrders: any[];
}
