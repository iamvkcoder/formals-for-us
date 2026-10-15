import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { ProductCard } from '../components/ProductCard.js';
import { Product, Category } from '../types/index.js';
import { api } from '../services/api.js';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState<boolean>(false);

  // Read current query state from URL params
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const sizeParam = searchParams.get('size') || '';
  const colorParam = searchParams.get('color') || '';
  const inStockParam = searchParams.get('inStock') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  // Available filter options
  const sizeOptions = ['30', '32', '34', '36', '38 (S)', '40 (M)', '42 (L)', '44 (XL)', '38R', '40R', '42R', 'UK 8', 'UK 9'];
  const colorOptions = ['Crisp White', 'Navy Blue', 'Deep Navy', 'Charcoal Grey', 'Jet Black', 'French Blue', 'Olive Tailored'];

  useEffect(() => {
    // Fetch active categories for sidebar
    api.get('/categories').then((res) => {
      if (res.data.success) {
        setCategories(res.data.data);
      }
    });
  }, []);

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        const params: any = {
          page: pageParam,
          limit: 12,
          sort: sortParam,
        };

        if (categoryParam) params.category = categoryParam;
        if (searchParam) params.search = searchParam;
        if (minPriceParam) params.minPrice = minPriceParam;
        if (maxPriceParam) params.maxPrice = maxPriceParam;
        if (sizeParam) params.size = sizeParam;
        if (colorParam) params.color = colorParam;
        if (inStockParam) params.inStock = inStockParam;

        const res = await api.get('/products', { params });
        if (res.data.success) {
          setProducts(res.data.data);
          setTotalPages(res.data.pagination.totalPages);
          setTotalCount(res.data.pagination.total);
        }
      } catch (err) {
        console.error('Products fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [categoryParam, searchParam, minPriceParam, maxPriceParam, sizeParam, colorParam, inStockParam, sortParam, pageParam]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1'); // Reset to page 1 on filter changes
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(
    categoryParam || searchParam || minPriceParam || maxPriceParam || sizeParam || colorParam || inStockParam
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header & Breadcrumb */}
      <div className="border-b border-borderGrey pb-6 mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-navy">
          {categoryParam
            ? categories.find((c) => c.slug === categoryParam)?.name || 'Formal Collection'
            : searchParam
            ? `Search Results for "${searchParam}"`
            : 'All Formalwear'}
        </h1>
        <p className="text-xs text-mutedGrey mt-2">
          Showing {totalCount} meticulously tailored pieces
        </p>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-borderGrey gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterDrawerOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 border border-borderGrey bg-white text-xs font-semibold uppercase tracking-wider text-navy"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1.5 text-xs text-mutedGrey hover:text-navy underline transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear All
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 text-xs text-navy ml-auto">
          <span className="text-mutedGrey font-medium">Sort by:</span>
          <select
            value={sortParam}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="bg-white border border-borderGrey px-3 py-2 text-xs font-medium focus:outline-none focus:border-navy cursor-pointer"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="popularity">Popularity / Client Choice</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-8 pr-6 border-r border-borderGrey">
          {/* Categories */}
          <div>
            <h3 className="font-serif text-base font-semibold text-navy mb-3">Categories</h3>
            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => updateParam('category', '')}
                className={`block w-full text-left py-1 hover:text-champagne-dark transition-colors ${
                  !categoryParam ? 'font-bold text-champagne-dark' : 'text-mutedGrey'
                }`}
              >
                All Formalwear
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => updateParam('category', cat.slug)}
                  className={`block w-full text-left py-1 hover:text-champagne-dark transition-colors ${
                    categoryParam === cat.slug ? 'font-bold text-champagne-dark' : 'text-mutedGrey'
                  }`}
                >
                  {cat.name} {cat.productCount !== undefined && `(${cat.productCount})`}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="font-serif text-base font-semibold text-navy mb-3">Price Range (₹)</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="number"
                placeholder="Min ₹"
                value={minPriceParam}
                onChange={(e) => updateParam('minPrice', e.target.value)}
                className="p-2 border border-borderGrey bg-white text-navy focus:outline-none focus:border-navy"
              />
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPriceParam}
                onChange={(e) => updateParam('maxPrice', e.target.value)}
                className="p-2 border border-borderGrey bg-white text-navy focus:outline-none focus:border-navy"
              />
            </div>
          </div>

          {/* Size Filter */}
          <div>
            <h3 className="font-serif text-base font-semibold text-navy mb-3">Tailored Size</h3>
            <div className="flex flex-wrap gap-1.5">
              {sizeOptions.map((sz) => (
                <button
                  key={sz}
                  onClick={() => updateParam('size', sizeParam === sz ? '' : sz)}
                  className={`px-2.5 py-1 text-xs border transition-colors ${
                    sizeParam === sz
                      ? 'bg-navy text-white border-navy font-semibold'
                      : 'bg-white text-navy border-borderGrey hover:border-navy'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div>
            <h3 className="font-serif text-base font-semibold text-navy mb-3">Color Palette</h3>
            <div className="space-y-1.5 text-xs">
              {colorOptions.map((clr) => (
                <button
                  key={clr}
                  onClick={() => updateParam('color', colorParam === clr ? '' : clr)}
                  className={`flex items-center gap-2 w-full text-left py-1 ${
                    colorParam === clr ? 'font-bold text-navy' : 'text-mutedGrey hover:text-navy'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full border border-gray-300 ${
                    clr === 'Crisp White' ? 'bg-white' :
                    clr === 'Navy Blue' || clr === 'Deep Navy' ? 'bg-[#17263C]' :
                    clr === 'Charcoal Grey' ? 'bg-[#4A4E57]' :
                    clr === 'Jet Black' ? 'bg-black' :
                    clr === 'French Blue' ? 'bg-[#3B82F6]' : 'bg-[#556B2F]'
                  }`} />
                  <span>{clr}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs text-navy cursor-pointer">
              <input
                type="checkbox"
                checked={inStockParam === 'true'}
                onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : '')}
                className="rounded border-borderGrey text-navy focus:ring-champagne"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid & Results */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[3/4] bg-gray-200" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-ivory border border-borderGrey p-8">
              <h3 className="font-serif text-xl font-semibold text-navy mb-2">
                No formalwear matches your filter criteria
              </h3>
              <p className="text-xs text-mutedGrey max-w-sm mx-auto mb-6">
                Try broadening your filters, resetting price thresholds, or clearing specific sizes.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2.5 bg-navy text-white text-xs font-semibold uppercase tracking-wider hover:bg-navy-deep transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {products.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2 border-t border-borderGrey pt-8">
              <button
                disabled={pageParam <= 1}
                onClick={() => updateParam('page', String(pageParam - 1))}
                className="p-2 border border-borderGrey text-navy disabled:opacity-30 hover:bg-ivory"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => updateParam('page', String(pg))}
                  className={`w-9 h-9 text-xs font-medium border transition-colors ${
                    pageParam === pg
                      ? 'bg-navy text-white border-navy font-bold'
                      : 'bg-white text-navy border-borderGrey hover:border-navy'
                  }`}
                >
                  {pg}
                </button>
              ))}

              <button
                disabled={pageParam >= totalPages}
                onClick={() => updateParam('page', String(pageParam + 1))}
                className="p-2 border border-borderGrey text-navy disabled:opacity-30 hover:bg-ivory"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/50 backdrop-blur-sm">
          <div className="ml-auto w-4/5 max-w-sm h-full bg-white p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-borderGrey">
                <h3 className="font-serif text-lg font-semibold text-navy">Filters</h3>
                <button
                  onClick={() => setFilterDrawerOpen(false)}
                  className="p-1 text-mutedGrey hover:text-navy"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category options in mobile drawer */}
              <div>
                <p className="text-xs uppercase tracking-wider text-champagne font-semibold mb-2">Category</p>
                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => { updateParam('category', ''); setFilterDrawerOpen(false); }}
                    className="block w-full text-left py-1"
                  >
                    All
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.slug}
                      onClick={() => { updateParam('category', c.slug); setFilterDrawerOpen(false); }}
                      className={`block w-full text-left py-1 ${categoryParam === c.slug ? 'font-bold text-champagne' : 'text-navy'}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-borderGrey">
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="w-full py-3 bg-navy text-white text-xs font-semibold uppercase tracking-wider"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
