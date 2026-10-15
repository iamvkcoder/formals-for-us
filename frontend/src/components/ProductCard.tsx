import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Product } from '../types/index.js';
import { formatINR } from '../services/api.js';
import { useWishlist } from '../app/WishlistContext.js';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const wishlisted = isInWishlist(product._id);

  // Calculate total stock across variants
  const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;
  const isOutOfStock = totalStock === 0;
  const isLowStock = totalStock > 0 && totalStock <= 5;

  const primaryImage = product.images[0] || 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80';
  const secondaryImage = product.images[1] || primaryImage;

  return (
    <div className="group relative flex flex-col bg-white border border-borderGrey overflow-hidden hover:shadow-md transition-all duration-300">
      {/* Image Container */}
      <Link to={`/product/${product.slug}`} className="relative aspect-[3/4] w-full overflow-hidden bg-ivory block">
        <img
          src={primaryImage}
          alt={product.name}
          className={`h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105 ${
            product.images.length > 1 ? 'group-hover:opacity-0 transition-opacity' : ''
          }`}
          loading="lazy"
        />
        {product.images.length > 1 && (
          <img
            src={secondaryImage}
            alt={`${product.name} alternate view`}
            className="h-full w-full object-cover object-top absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
            loading="lazy"
          />
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.discountPercent && product.discountPercent > 0 && (
            <span className="bg-navy text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
              {product.discountPercent}% OFF
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-champagne text-navy text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
              NEW
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-errorRed text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
              SOLD OUT
            </span>
          )}
          {isLowStock && (
            <span className="bg-amber-600 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
              ONLY {totalStock} LEFT
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product._id);
          }}
          className={`absolute top-2 right-2 p-2 rounded-full transition-colors z-20 ${
            wishlisted
              ? 'bg-red-50 text-errorRed'
              : 'bg-white/80 hover:bg-white text-navy hover:text-champagne-dark backdrop-blur-sm'
          }`}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
        </button>
      </Link>

      {/* Info Container */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          <div className="flex items-center justify-between text-[11px] text-mutedGrey uppercase tracking-wider mb-1">
            <span>{product.brand || 'FORMALS FOR US'}</span>
            {product.colors && product.colors.length > 0 && (
              <span>{product.colors.length} {product.colors.length === 1 ? 'Color' : 'Colors'}</span>
            )}
          </div>
          <Link
            to={`/product/${product.slug}`}
            className="font-medium text-sm text-navy hover:text-champagne-dark line-clamp-2 transition-colors"
          >
            {product.name}
          </Link>
        </div>

        {/* Pricing & Stock Status */}
        <div className="mt-3 pt-3 border-t border-borderGrey flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-base text-navy">
              {formatINR(product.salePrice || product.basePrice)}
            </span>
            {product.salePrice && product.salePrice < product.basePrice && (
              <span className="text-xs text-mutedGrey line-through">
                {formatINR(product.basePrice)}
              </span>
            )}
          </div>

          <Link
            to={`/product/${product.slug}`}
            className="text-xs font-semibold uppercase tracking-wider text-navy hover:text-champagne-dark transition-colors"
          >
            {isOutOfStock ? 'Notify Me' : 'Select Size'}
          </Link>
        </div>
      </div>
    </div>
  );
};
