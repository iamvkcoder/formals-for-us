import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShieldCheck, Tag, ShoppingBag, Truck } from 'lucide-react';
import { useCart } from '../app/CartContext.js';
import { formatINR } from '../services/api.js';

export const CartPage: React.FC = () => {
  const { cart, loading, updateQuantity, removeFromCart, applyCoupon } = useCart();
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const navigate = useNavigate();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setCouponLoading(true);
    await applyCoupon(couponCodeInput.trim());
    setCouponLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-mutedGrey">
        Loading your formal wardrobe bag...
      </div>
    );
  }

  const items = cart?.items || [];
  const pricing = cart?.pricing || { subtotal: 0, discount: 0, shippingFee: 0, tax: 0, total: 0 };
  const freeShippingThreshold = 1999;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - pricing.subtotal);

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 bg-ivory border border-borderGrey mx-auto flex items-center justify-center text-navy mb-4">
          <ShoppingBag className="w-8 h-8 stroke-1" />
        </div>
        <h1 className="font-serif text-3xl font-semibold text-navy mb-2">Your Wardrobe Bag is Empty</h1>
        <p className="text-xs text-mutedGrey mb-8 leading-relaxed">
          You haven't selected any formal pieces yet. Explore our bespoke shirts, trousers, and Italian wool blazers.
        </p>
        <Link
          to="/shop"
          className="px-8 py-3.5 bg-navy text-white text-xs font-semibold uppercase tracking-widest hover:bg-navy-deep transition-colors inline-block shadow-md"
        >
          Explore Formalwear Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-3xl font-semibold text-navy mb-8 pb-4 border-b border-borderGrey">
        Shopping Bag ({items.reduce((acc, i) => acc + i.quantity, 0)} Items)
      </h1>

      {/* Free Shipping Progress Indicator */}
      <div className="mb-8 p-4 bg-ivory border border-borderGrey flex items-center gap-3 text-xs">
        <Truck className="w-5 h-5 text-champagne shrink-0" />
        <div className="flex-1">
          {amountNeededForFreeShipping > 0 ? (
            <p className="text-navy">
              Add <span className="font-bold text-champagne-dark">{formatINR(amountNeededForFreeShipping)}</span> more to your bag to enjoy <span className="font-semibold">Complimentary Express Shipping</span> across India.
            </p>
          ) : (
            <p className="text-successGreen font-medium">
              Congratulations! Your order qualifies for <span className="font-bold">Complimentary Express Shipping</span>.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Cart Items List */}
        <div className="lg:col-span-8 divide-y divide-borderGrey border-t border-b border-borderGrey">
          {items.map((item) => {
            const prod = item.product;
            if (!prod) return null;

            const unitPrice = prod.salePrice || prod.basePrice;
            const lineTotal = unitPrice * item.quantity;

            return (
              <div key={item._id} className="py-6 flex gap-4 sm:gap-6">
                <Link to={`/product/${prod.slug}`} className="w-24 h-32 bg-ivory shrink-0 border border-borderGrey overflow-hidden">
                  <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover object-top" />
                </Link>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-mutedGrey block">
                          {prod.brand}
                        </span>
                        <Link to={`/product/${prod.slug}`} className="font-medium text-sm text-navy hover:text-champagne-dark transition-colors">
                          {prod.name}
                        </Link>
                      </div>
                      <span className="font-semibold text-sm text-navy">
                        {formatINR(lineTotal)}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-mutedGrey">
                      <span>Size: <strong className="text-navy">{item.size}</strong></span>
                      <span>Color: <strong className="text-navy">{item.color}</strong></span>
                      <span>SKU: {item.sku}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-borderGrey bg-white text-xs">
                      <button
                        onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1}
                        className="px-2.5 py-1 hover:bg-ivory disabled:opacity-30"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="px-2.5 py-1 hover:bg-ivory"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-xs text-mutedGrey hover:text-errorRed flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary & Coupon */}
        <div className="lg:col-span-4 space-y-6">
          {/* Coupon Input */}
          <div className="p-6 bg-white border border-borderGrey space-y-4">
            <h3 className="font-serif text-base font-semibold text-navy flex items-center gap-2">
              <Tag className="w-4 h-4 text-champagne" /> Apply Atelier Privilege Code
            </h3>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. WELCOME10"
                value={couponCodeInput}
                onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                className="flex-1 bg-ivory border border-borderGrey px-3 py-2 text-xs uppercase tracking-wider text-navy focus:outline-none focus:border-navy"
              />
              <button
                type="submit"
                disabled={couponLoading}
                className="px-4 py-2 bg-navy text-white text-xs font-semibold uppercase tracking-wider hover:bg-navy-deep transition-colors disabled:opacity-50"
              >
                {couponLoading ? '...' : 'Apply'}
              </button>
            </form>
            <p className="text-[11px] text-mutedGrey">
              Try <span className="font-semibold text-navy">WELCOME10</span> (10% off) or <span className="font-semibold text-navy">ELEVATE500</span> (₹500 off)
            </p>
          </div>

          {/* Pricing Breakdown */}
          <div className="p-6 bg-white border border-borderGrey space-y-4">
            <h3 className="font-serif text-lg font-semibold text-navy pb-3 border-b border-borderGrey">
              Order Breakdown
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-mutedGrey">
                <span>Items Subtotal</span>
                <span className="text-navy font-medium">{formatINR(pricing.subtotal)}</span>
              </div>

              {pricing.discount > 0 && (
                <div className="flex justify-between text-successGreen font-medium">
                  <span>Privilege Discount {pricing.couponCode && `(${pricing.couponCode})`}</span>
                  <span>-{formatINR(pricing.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-mutedGrey">
                <span>Shipping Fee</span>
                <span className="text-navy font-medium">
                  {pricing.shippingFee === 0 ? (
                    <strong className="text-successGreen">Complimentary</strong>
                  ) : (
                    formatINR(pricing.shippingFee)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-mutedGrey">
                <span>Estimated Apparel GST (12%)</span>
                <span className="text-navy font-medium">{formatINR(pricing.tax)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-borderGrey flex justify-between items-baseline">
              <span className="font-serif text-base font-semibold text-navy">Final Total</span>
              <span className="font-serif text-2xl font-bold text-navy">
                {formatINR(pricing.total)}
              </span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 bg-navy text-white text-xs font-semibold uppercase tracking-widest hover:bg-navy-deep transition-colors flex items-center justify-center gap-2 shadow-lg mt-4"
            >
              Proceed to Secure Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-mutedGrey pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-champagne" />
              <span>Safe SSL 256-bit Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
