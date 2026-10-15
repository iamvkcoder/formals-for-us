import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Ruler,
  CheckCircle2,
  Truck,
  RefreshCw,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { api, formatINR } from '../services/api.js';
import { Product, Recommendation } from '../types/index.js';
import { useCart } from '../app/CartContext.js';
import { useWishlist } from '../app/WishlistContext.js';
import { useToast } from '../app/ToastContext.js';
import { SizeGuideModal } from '../components/SizeGuideModal.js';
import { PincodeChecker } from '../components/PincodeChecker.js';
import { ProductCard } from '../components/ProductCard.js';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await api.get(`/products/${slug}`);
        if (res.data.success && res.data.data) {
          const prod: Product = res.data.data;
          setProduct(prod);
          setSelectedImage(prod.images[0] || '');

          // Preselect first color if available
          if (prod.colors && prod.colors.length > 0) {
            setSelectedColor(prod.colors[0]);
          }

          // Preselect first available size variant
          const availableVariant = prod.variants.find((v) => v.stock > 0);
          if (availableVariant) {
            setSelectedSize(availableVariant.size);
            setSelectedColor(availableVariant.color);
          }

          // Manage recently viewed products in localStorage
          try {
            const raw = localStorage.getItem('recently_viewed_products');
            let list: Product[] = raw ? JSON.parse(raw) : [];
            list = list.filter((p) => p._id !== prod._id);
            setRecentlyViewed(list.slice(0, 4));
            list.unshift(prod);
            localStorage.setItem('recently_viewed_products', JSON.stringify(list.slice(0, 8)));
          } catch {
            // ignore localStorage parsing errors
          }

          // Fetch intelligent recommendations (powered by Python FastAPI)
          try {
            const recRes = await api.get(`/products/${prod._id}/related`);
            if (recRes.data.success) {
              setRecommendations(recRes.data.data);
            }
          } catch {
            setRecommendations([]);
          }
        }
      } catch (err: any) {
        setErrorMsg(err.response?.data?.message || 'Product could not be loaded');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center items-center">
        <div className="animate-pulse space-y-4 text-center">
          <div className="w-12 h-12 border-2 border-champagne border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest text-mutedGrey">Loading Atelier Details...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl text-navy mb-4">Item Not Available</h2>
        <p className="text-xs text-mutedGrey mb-6">{errorMsg || 'This product does not exist.'}</p>
        <Link
          to="/shop"
          className="px-6 py-3 bg-navy text-white text-xs font-semibold uppercase tracking-wider"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  // Find variant matching selected size and color
  const matchedVariant = product.variants.find(
    (v) => v.size === selectedSize && v.color.toLowerCase() === selectedColor.toLowerCase()
  ) || product.variants.find((v) => v.size === selectedSize);

  const availableStock = matchedVariant ? matchedVariant.stock : 0;
  const isOutOfStock = availableStock === 0;

  const handleAddToCart = async () => {
    if (!selectedSize) {
      showToast('Please select a size to proceed', 'error');
      return;
    }

    if (!matchedVariant) {
      showToast('Selected variant is currently unavailable', 'error');
      return;
    }

    if (availableStock < quantity) {
      showToast(`Only ${availableStock} items available in stock`, 'error');
      return;
    }

    await addToCart(product._id, matchedVariant.sku, matchedVariant.size, matchedVariant.color, quantity);
  };

  const wishlisted = isInWishlist(product._id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-mutedGrey">
        <Link to="/" className="hover:text-navy">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-navy">Shop</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/category/${product.categorySlug}`} className="hover:text-navy capitalize">
          {product.categorySlug.replace('-', ' ')}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-navy font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Gallery (Thumbnails + Main View) */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:max-h-[600px] shrink-0">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-20 sm:w-20 sm:h-24 overflow-hidden border transition-all ${
                    selectedImage === img ? 'border-champagne ring-1 ring-champagne' : 'border-borderGrey opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover object-top" />
                </button>
              ))}
            </div>
          )}

          {/* Main Hero Image */}
          <div className="relative aspect-[3/4] flex-1 bg-ivory border border-borderGrey overflow-hidden">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover object-top"
              fetchPriority="high"
            />
            {product.discountPercent && product.discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-navy text-white text-xs uppercase font-bold tracking-wider px-3 py-1">
                {product.discountPercent}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Right: Product Purchase Actions & Specs */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-champagne font-semibold">
              {product.brand}
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-navy mt-1">
              {product.name}
            </h1>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 pb-4 border-b border-borderGrey">
            <span className="font-serif text-2xl sm:text-3xl font-semibold text-navy">
              {formatINR(product.salePrice || product.basePrice)}
            </span>
            {product.salePrice && product.salePrice < product.basePrice && (
              <>
                <span className="text-sm text-mutedGrey line-through">
                  {formatINR(product.basePrice)}
                </span>
                <span className="text-xs font-semibold text-successGreen">
                  Save {formatINR(product.basePrice - product.salePrice)}
                </span>
              </>
            )}
            <span className="text-[11px] text-mutedGrey block w-full mt-1">
              Price inclusive of all taxes & duties (GST 12%)
            </span>
          </div>

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-semibold text-navy uppercase tracking-wider">
                  Color: <span className="font-normal text-mutedGrey">{selectedColor}</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-3 py-1.5 text-xs border transition-colors ${
                      selectedColor.toLowerCase() === c.toLowerCase()
                        ? 'border-navy bg-navy text-white font-semibold'
                        : 'border-borderGrey bg-white text-navy hover:border-navy'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector & Guide */}
          <div>
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-semibold text-navy uppercase tracking-wider">
                Select Tailored Size:
              </span>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="flex items-center gap-1 text-champagne-dark font-medium hover:underline"
              >
                <Ruler className="w-3.5 h-3.5" /> Size Guide
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {product.sizes.map((sz) => {
                const variantForSize = product.variants.find((v) => v.size === sz);
                const hasStock = variantForSize && variantForSize.stock > 0;

                return (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`min-w-[48px] px-3.5 py-2 text-xs border transition-colors relative ${
                      selectedSize === sz
                        ? 'border-navy bg-navy text-white font-bold'
                        : hasStock
                        ? 'border-borderGrey bg-white text-navy hover:border-navy'
                        : 'border-gray-200 bg-gray-50 text-gray-400 line-through'
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>

            {/* Real Stock Status Notice */}
            <div className="mt-2 text-xs">
              {isOutOfStock ? (
                <span className="text-errorRed font-semibold">
                  This variant is currently out of stock.
                </span>
              ) : availableStock <= 5 ? (
                <span className="text-amber-600 font-medium">
                  Low Stock: Only {availableStock} items remaining in this size.
                </span>
              ) : (
                <span className="text-successGreen flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> In Stock & Ready to Dispatch
                </span>
              )}
            </div>
          </div>

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-navy">Quantity:</span>
              <div className="flex items-center border border-borderGrey bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-sm hover:bg-ivory"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-semibold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                  className="px-3 py-1.5 text-sm hover:bg-ivory"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* CTA Buttons: Add to Bag & Wishlist */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="flex-1 py-4 bg-navy text-white text-xs font-semibold uppercase tracking-widest hover:bg-navy-deep transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <ShoppingBag className="w-4 h-4" />
              {isOutOfStock ? 'Sold Out' : 'Add To Wardrobe Bag'}
            </button>
            <button
              onClick={() => toggleWishlist(product._id)}
              className={`p-4 border transition-colors ${
                wishlisted
                  ? 'border-errorRed text-errorRed bg-red-50'
                  : 'border-borderGrey text-navy hover:border-navy bg-white'
              }`}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Indian PIN Code Delivery Checker */}
          <PincodeChecker />

          {/* Fabric, Care & Description Accordions */}
          <div className="space-y-4 pt-4 border-t border-borderGrey text-xs">
            <div>
              <h4 className="font-semibold text-navy uppercase tracking-wider mb-1">Fabric & Origin</h4>
              <p className="text-mutedGrey leading-relaxed">{product.material}</p>
            </div>
            <div>
              <h4 className="font-semibold text-navy uppercase tracking-wider mb-1">Tailoring Details</h4>
              <p className="text-mutedGrey leading-relaxed">{product.description}</p>
            </div>
            <div>
              <h4 className="font-semibold text-navy uppercase tracking-wider mb-1">Garment Care</h4>
              <p className="text-mutedGrey leading-relaxed">{product.careInstructions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI / Content-based Recommendations from FastAPI */}
      {recommendations.length > 0 && (
        <section className="pt-12 border-t border-borderGrey">
          <div className="mb-8">
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-champagne font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Tailored Sartorial Recommendations
            </div>
            <h2 className="font-serif text-2xl font-semibold text-navy">
              Curated Formal Pairings
            </h2>
            <p className="text-xs text-mutedGrey mt-1">
              Harmonized ensembles computed by our formalwear coordination engine
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {recommendations.map((rec) => (
              <div key={rec.product._id} className="flex flex-col">
                <ProductCard product={rec.product} />
                <div className="mt-2 p-2 bg-ivory border border-borderGrey text-[11px] text-navy">
                  <span className="font-semibold text-champagne-dark">Why it pairs:</span>{' '}
                  <span className="text-mutedGrey">{rec.reason}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed Products */}
      {recentlyViewed.length > 0 && (
        <section className="pt-12 border-t border-borderGrey">
          <h2 className="font-serif text-2xl font-semibold text-navy mb-6">
            Recently Viewed
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {recentlyViewed.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        category={product.categorySlug}
      />
    </div>
  );
};
