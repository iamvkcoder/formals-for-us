import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard.js';
import { Product, Category } from '../types/index.js';
import { api } from '../services/api.js';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true);
      try {
        const [catsRes, prodsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products', { params: { category: slug, limit: 20 } }),
        ]);

        if (catsRes.data.success) {
          const match = catsRes.data.data.find((c: Category) => c.slug === slug);
          setCategory(match || null);
        }

        if (prodsRes.data.success) {
          setProducts(prodsRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching category products:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCategoryData();
    }
  }, [slug]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Category Banner */}
      <div className="relative bg-navy text-white p-8 sm:p-12 overflow-hidden border border-borderGrey">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="text-xs uppercase tracking-widest text-champagne font-semibold">
            Atelier Collection
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-semibold">
            {category?.name || slug?.replace('-', ' ').toUpperCase()}
          </h1>
          <p className="text-sm text-gray-300 font-light leading-relaxed">
            {category?.description || 'Tailored to perfection with precision craft and luxurious natural fabrics.'}
          </p>
        </div>
        {category?.image && (
          <img
            src={category.image}
            alt={category.name}
            className="absolute right-0 top-0 w-1/2 h-full object-cover object-top opacity-30 pointer-events-none hidden md:block"
          />
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[3/4] bg-gray-200" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-ivory border border-borderGrey p-8">
          <p className="text-sm text-mutedGrey mb-4">No products found in this category.</p>
          <Link
            to="/shop"
            className="px-6 py-2.5 bg-navy text-white text-xs font-semibold uppercase tracking-wider"
          >
            Browse All Items
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {products.map((prod) => (
            <ProductCard key={prod._id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
};
