import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Award, Sparkles, Compass } from 'lucide-react';
import { ProductCard } from '../components/ProductCard.js';
import { Product, Category } from '../types/index.js';
import { api } from '../services/api.js';

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [officeEssentials, setOfficeEssentials] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products?limit=24'),
        ]);

        if (catsRes.data.success) {
          setCategories(catsRes.data.data);
        }

        if (prodsRes.data.success) {
          const all: Product[] = prodsRes.data.data;
          setBestSellers(all.filter((p) => p.isBestSeller).slice(0, 4));
          setNewArrivals(all.filter((p) => p.isNewArrival).slice(0, 4));
          setOfficeEssentials(all.filter((p) => p.isOfficeEssential).slice(0, 4));
        }
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <section className="relative bg-navy text-white overflow-hidden min-h-[620px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1920&q=85"
            alt="Tailored Navy Suit Collection"
            className="w-full h-full object-cover object-center opacity-35"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-champagne/20 border border-champagne text-champagne text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> Autumn / Winter Formal Edit
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl font-semibold tracking-tight leading-tight text-white">
              Dress With <br />
              <span className="italic font-normal text-champagne">Confidence.</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-300 font-light leading-relaxed">
              Uncompromising craftsmanship, Italian-inspired proportions, and breathable Giza cotton.
              Engineered for boardrooms, key milestones, and black-tie evenings across India.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link
                to="/shop"
                className="px-8 py-4 bg-champagne text-navy font-semibold text-xs uppercase tracking-widest hover:bg-champagne-light transition-all flex items-center justify-center gap-2 group shadow-lg"
              >
                Shop Collection
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/category/formal-shirts"
                className="px-8 py-4 bg-transparent border border-white/40 text-white font-semibold text-xs uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center justify-center"
              >
                Explore Office Essentials
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Shop by Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-borderGrey">
          <div>
            <span className="text-xs uppercase tracking-widest text-champagne font-semibold">
              The Wardrobe Architecture
            </span>
            <h2 className="font-serif text-3xl font-semibold text-navy mt-1">Shop by Category</h2>
          </div>
          <Link
            to="/shop"
            className="text-xs font-semibold uppercase tracking-wider text-navy hover:text-champagne-dark transition-colors flex items-center gap-1 mt-2 md:mt-0"
          >
            View All Categories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.slice(0, 4).map((cat) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="group relative aspect-[3/4] overflow-hidden bg-navy flex flex-col justify-end p-6 border border-borderGrey"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover object-top opacity-75 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy/40 to-transparent" />
              <div className="relative z-10 space-y-1">
                <h3 className="font-serif text-xl font-semibold text-white group-hover:text-champagne transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-300 line-clamp-1">{cat.description}</p>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-champagne pt-2">
                  Explore <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-borderGrey">
          <div>
            <span className="text-xs uppercase tracking-widest text-champagne font-semibold">
              Client Favorites
            </span>
            <h2 className="font-serif text-3xl font-semibold text-navy mt-1">Best Sellers</h2>
          </div>
          <Link
            to="/shop?sort=popularity"
            className="text-xs font-semibold uppercase tracking-wider text-navy hover:text-champagne-dark transition-colors flex items-center gap-1 mt-2 md:mt-0"
          >
            Explore Best Sellers <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-gray-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Complete the Look Curated Editorial Feature */}
      <section className="bg-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 relative aspect-[4/5] overflow-hidden border border-white/20">
              <img
                src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80"
                alt="Complete the Look Editorial"
                className="w-full h-full object-cover object-top"
                loading="lazy"
              />
              <div className="absolute top-4 left-4 bg-navy/90 border border-champagne px-3 py-1 text-champagne text-xs uppercase font-semibold tracking-wider">
                Curated Ensemble #04
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs uppercase tracking-widest text-champagne font-semibold">
                Sartorial Synergy
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-white leading-snug">
                Complete The Look: <br />
                <span className="text-champagne italic font-normal">The Mayfair Executive</span>
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed font-light">
                A seamless harmony of our Midnight Hopsack Blazer, Royal Oxford Spread Collar Shirt,
                and Flat-Front Charcoal Wool Trousers. Accented with handcrafted full-grain cap-toe brogues.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 text-xs">
                  <span className="w-2 h-2 rounded-full bg-champagne" />
                  <span className="font-medium text-white">Midnight Navy Hopsack Wool Blazer</span>
                  <span className="ml-auto text-champagne font-semibold">₹7,999</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 text-xs">
                  <span className="w-2 h-2 rounded-full bg-champagne" />
                  <span className="font-medium text-white">Royal Oxford Classic Dress Shirt</span>
                  <span className="ml-auto text-champagne font-semibold">₹2,499</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 text-xs">
                  <span className="w-2 h-2 rounded-full bg-champagne" />
                  <span className="font-medium text-white">Tailored Flat-Front Wool Trousers</span>
                  <span className="ml-auto text-champagne font-semibold">₹2,999</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/shop?category=blazers"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-champagne text-navy text-xs font-semibold uppercase tracking-widest hover:bg-champagne-light transition-colors"
                >
                  Shop This Outfit <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-borderGrey">
          <div>
            <span className="text-xs uppercase tracking-widest text-champagne font-semibold">
              Fresh Off The Loom
            </span>
            <h2 className="font-serif text-3xl font-semibold text-navy mt-1">New Arrivals</h2>
          </div>
          <Link
            to="/shop?sort=newest"
            className="text-xs font-semibold uppercase tracking-wider text-navy hover:text-champagne-dark transition-colors flex items-center gap-1 mt-2 md:mt-0"
          >
            View All New Arrivals <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map((prod) => (
            <ProductCard key={prod._id} product={prod} />
          ))}
        </div>
      </section>

      {/* 6. Office Essentials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-borderGrey">
          <div>
            <span className="text-xs uppercase tracking-widest text-champagne font-semibold">
              Monday To Friday
            </span>
            <h2 className="font-serif text-3xl font-semibold text-navy mt-1">Office Essentials</h2>
          </div>
          <Link
            to="/shop?category=formal-shirts"
            className="text-xs font-semibold uppercase tracking-wider text-navy hover:text-champagne-dark transition-colors flex items-center gap-1 mt-2 md:mt-0"
          >
            Explore Essentials <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {officeEssentials.map((prod) => (
            <ProductCard key={prod._id} product={prod} />
          ))}
        </div>
      </section>
    </div>
  );
};
