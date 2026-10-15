import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '../app/ToastContext.js';
import { AuthProvider } from '../app/AuthContext.js';
import { CartProvider } from '../app/CartContext.js';
import { WishlistProvider } from '../app/WishlistContext.js';
import { ProductCard } from '../components/ProductCard.js';
import { CartPage } from '../pages/CartPage.js';
import { NotFoundPage } from '../pages/NotFoundPage.js';
import { Product } from '../types/index.js';
import { api } from '../services/api.js';

vi.mock('../services/api.js', async () => {
  const actual: any = await vi.importActual('../services/api.js');
  return {
    ...actual,
    api: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    },
  };
});

const mockProduct: Product = {
  _id: 'prod_test_1',
  name: 'Royal Oxford Classic Dress Shirt',
  slug: 'royal-oxford-classic-dress-shirt',
  description: '100% two-ply Egyptian Giza cotton.',
  category: { _id: 'cat_1', name: 'Formal Shirts', slug: 'formal-shirts' },
  categorySlug: 'formal-shirts',
  brand: 'FORMALS FOR US Atelier',
  material: 'Egyptian Cotton',
  careInstructions: 'Machine wash warm',
  images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80'],
  basePrice: 2899,
  salePrice: 2499,
  discountPercent: 14,
  colors: ['Crisp White'],
  sizes: ['40 (M)', '42 (L)'],
  variants: [
    { sku: 'SHIRT-WHT-40', size: '40 (M)', color: 'Crisp White', stock: 15 },
  ],
  isFeatured: true,
  isNewArrival: false,
  isBestSeller: true,
  isOfficeEssential: true,
  tags: ['oxford', 'cotton'],
  salesCount: 25,
  viewCount: 100,
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              {ui}
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

describe('Frontend ProductCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockResolvedValue({ data: { success: true, data: [] } });
  });

  it('renders product name, brand, and calculated price in INR', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Royal Oxford Classic Dress Shirt')).toBeInTheDocument();
    expect(screen.getByText('FORMALS FOR US Atelier')).toBeInTheDocument();
    expect(screen.getByText('₹2,499')).toBeInTheDocument();
    expect(screen.getByText('14% OFF')).toBeInTheDocument();
  });
});

describe('Frontend CartPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockResolvedValue({
      data: {
        success: true,
        data: {
          items: [],
          pricing: { subtotal: 0, discount: 0, shippingFee: 0, tax: 0, total: 0 },
        },
      },
    });
  });

  it('renders empty cart state when no items in bag', async () => {
    renderWithProviders(<CartPage />);
    await waitFor(() => {
      expect(screen.getByText(/Your Wardrobe Bag is Empty/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Explore Formalwear Catalog/i)).toBeInTheDocument();
  });
});

describe('Frontend NotFoundPage', () => {
  it('renders 404 message and return home action', () => {
    renderWithProviders(<NotFoundPage />);
    expect(screen.getByText(/Error 404/i)).toBeInTheDocument();
    expect(screen.getByText(/The Garment You Seek Cannot Be Found/i)).toBeInTheDocument();
    expect(screen.getByText(/Return Home/i)).toBeInTheDocument();
  });
});
