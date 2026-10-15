import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlist } from '../app/WishlistContext.js';
import { useCart } from '../app/CartContext.js';
import { formatINR } from '../services/api.js';

export const WishlistPage: React.FC = () => {
  const { wishlist, toggleWishlist, loading } = useWishlist();
  const { addToCart } = useCart();

  const handleQuickAdd = async (product: any) => {
    // Pick first available variant
    const variant = product.variants?.find((v: any) => v.stock > 0);
    if (variant) {
      await addToCart(product._id, variant.sku, variant.size, variant.color, 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="border-b border-borderGrey pb-6 mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-navy">My Saved Wardrobe</h1>
          <p className="text-xs text-mutedGrey mt-1">{wishlist.length} tailored pieces saved</p>
        </div>
        <Link
          to="/shop"
          className="text-xs font-semibold uppercase tracking-wider text-navy hover:text-champagne-dark transition-colors flex items-center gap-1"
        >
          Continue Browsing <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-mutedGrey">Loading saved pieces...</div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-24 bg-ivory border border-borderGrey p-8 max-w-lg mx-auto">
          <Heart className="w-12 h-12 text-mutedGrey mx-auto mb-4 stroke-1" />
          <h2 className="font-serif text-2xl font-semibold text-navy mb-2">Your wishlist is empty</h2>
          <p className="text-xs text-mutedGrey mb-6 leading-relaxed">
            Save your favorite suits, blazers, and pinpoint oxford shirts to review or purchase later.
          </p>
          <Link
            to="/shop"
            className="px-8 py-3 bg-navy text-white text-xs font-semibold uppercase tracking-widest hover:bg-navy-deep transition-colors inline-block"
          >
            Explore Formalwear Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {wishlist.map((prod) => {
            const hasStock = prod.variants?.some((v) => v.stock > 0);

            return (
              <div key={prod._id} className="bg-white border border-borderGrey flex flex-col justify-between">
                <div className="relative aspect-[3/4] bg-ivory overflow-hidden">
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    className="w-full h-full object-cover object-top"
                  />
                  <button
                    onClick={() => toggleWishlist(prod._id)}
                    className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full text-errorRed hover:bg-white transition-colors"
                    aria-label="Remove item"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-mutedGrey block">
                      {prod.brand}
                    </span>
                    <Link
                      to={`/product/${prod.slug}`}
                      className="text-sm font-medium text-navy hover:text-champagne-dark line-clamp-1"
                    >
                      {prod.name}
                    </Link>
                  </div>

                  <div className="font-semibold text-sm text-navy">
                    {formatINR(prod.salePrice || prod.basePrice)}
                  </div>

                  <div className="pt-2 border-t border-borderGrey flex gap-2">
                    {hasStock ? (
                      <Link
                        to={`/product/${prod.slug}`}
                        className="flex-1 py-2 bg-navy text-white text-xs font-semibold uppercase tracking-wider text-center hover:bg-navy-deep transition-colors"
                      >
                        Select Size
                      </Link>
                    ) : (
                      <span className="flex-1 py-2 bg-gray-100 text-mutedGrey text-xs font-semibold uppercase tracking-wider text-center">
                        Sold Out
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
