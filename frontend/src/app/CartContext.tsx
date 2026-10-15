import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';
import { Cart } from '../types/index.js';
import { useAuth } from './AuthContext.js';
import { useToast } from './ToastContext.js';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  itemCount: number;
  addToCart: (productId: string, sku: string, size: string, color: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  removeFromCart: (itemId: string) => Promise<boolean>;
  applyCoupon: (couponCode: string) => Promise<boolean>;
  refreshCart: (coupon?: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [appliedCoupon, setAppliedCoupon] = useState<string>('');
  const { user } = useAuth();
  const { showToast } = useToast();

  const fetchCart = useCallback(async (coupon?: string) => {
    try {
      const activeCoupon = coupon !== undefined ? coupon : appliedCoupon;
      const res = await api.get('/cart', {
        params: activeCoupon ? { coupon: activeCoupon } : {},
      });
      if (res.data.success) {
        setCart(res.data.data);
      }
    } catch (error) {
      console.warn('Cart load error:', error);
    } finally {
      setLoading(false);
    }
  }, [appliedCoupon]);

  useEffect(() => {
    fetchCart();
  }, [user, fetchCart]);

  const addToCart = async (
    productId: string,
    sku: string,
    size: string,
    color: string,
    quantity: number = 1
  ): Promise<boolean> => {
    try {
      const res = await api.post('/cart/items', {
        productId,
        sku,
        size,
        color,
        quantity,
      });

      if (res.data.success) {
        showToast('Added to your formal wardrobe bag', 'success');
        await fetchCart();
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Could not add product to bag';
      showToast(msg, 'error');
      return false;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number): Promise<boolean> => {
    try {
      const res = await api.patch(`/cart/items/${itemId}`, { quantity });
      if (res.data.success) {
        await fetchCart();
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Could not update quantity';
      showToast(msg, 'error');
      return false;
    }
  };

  const removeFromCart = async (itemId: string): Promise<boolean> => {
    try {
      const res = await api.delete(`/cart/items/${itemId}`);
      if (res.data.success) {
        showToast('Item removed from bag', 'info');
        await fetchCart();
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to remove item';
      showToast(msg, 'error');
      return false;
    }
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    try {
      setAppliedCoupon(code);
      await fetchCart(code);
      showToast(`Coupon "${code.toUpperCase()}" applied`, 'success');
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid coupon code';
      showToast(msg, 'error');
      return false;
    }
  };

  const itemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        itemCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        applyCoupon,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
