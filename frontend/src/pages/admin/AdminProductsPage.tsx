import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit, Search, CheckCircle2, X } from 'lucide-react';
import { api, formatINR } from '../../services/api.js';
import { Product, Category } from '../../types/index.js';
import { useAuth } from '../../app/AuthContext.js';
import { useToast } from '../../app/ToastContext.js';

export const AdminProductsPage: React.FC = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New product form
  const [form, setForm] = useState({
    name: '',
    categorySlug: 'formal-shirts',
    brand: 'FORMALS FOR US Atelier',
    material: '100% Giza Egyptian Cotton',
    description: '',
    careInstructions: 'Machine wash warm, dry clean recommended.',
    basePrice: 2999,
    salePrice: 2499,
    discountPercent: 16,
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    color: 'Crisp White',
    size: '40 (M)',
    stock: 25,
    sku: `SKU-${Date.now().toString().slice(-6)}`,
  });

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/admin/products', { params: { search: search.trim() || undefined, limit: 30 } }),
        api.get('/categories'),
      ]);
      if (prodRes.data.success) setProducts(prodRes.data.data);
      if (catRes.data.success) setCategories(catRes.data.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchCatalog();
    }
  }, [isAdmin]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        categorySlug: form.categorySlug,
        brand: form.brand,
        material: form.material,
        description: form.description,
        careInstructions: form.careInstructions,
        basePrice: Number(form.basePrice),
        salePrice: form.salePrice ? Number(form.salePrice) : undefined,
        discountPercent: form.discountPercent ? Number(form.discountPercent) : undefined,
        images: [form.imageUrl],
        colors: [form.color],
        sizes: [form.size],
        variants: [
          {
            sku: form.sku,
            size: form.size,
            color: form.color,
            stock: Number(form.stock),
          },
        ],
        isFeatured: true,
      };

      const res = await api.post('/admin/products', payload);
      if (res.data.success) {
        showToast('Product created successfully', 'success');
        setProducts([res.data.data, ...products]);
        setShowCreateModal(false);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Could not create product', 'error');
    }
  };

  const handleArchive = async (id: string) => {
    if (!window.confirm('Are you sure you want to archive this product?')) return;
    try {
      const res = await api.delete(`/admin/products/${id}`);
      if (res.data.success) {
        showToast('Product archived', 'info');
        setProducts(products.filter((p) => p._id !== id));
      }
    } catch {
      showToast('Action failed', 'error');
    }
  };

  if (authLoading || loading) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-mutedGrey">Loading catalog...</div>;
  }

  if (!isAdmin) {
    return <div className="p-20 text-center text-xs text-errorRed">Admin privilege required.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-borderGrey gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-champagne font-bold">
            Catalog Governance
          </span>
          <h1 className="font-serif text-3xl font-semibold text-navy">Formalwear Inventory & Products</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="text-xs font-semibold uppercase tracking-wider text-navy hover:text-champagne-dark"
          >
            ← Analytics
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-navy text-white text-xs font-semibold uppercase tracking-wider hover:bg-navy-deep transition-colors"
          >
            <Plus className="w-4 h-4" /> New Garment
          </button>
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-white border border-borderGrey overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-ivory border-b border-borderGrey text-navy font-semibold">
              <tr>
                <th className="p-3.5">Product</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Price</th>
                <th className="p-3.5">Variants</th>
                <th className="p-3.5">Total Stock</th>
                <th className="p-3.5">Sales</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderGrey text-navy">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-mutedGrey">
                    Loading catalog...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-mutedGrey">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((prod) => {
                  const totalStock = prod.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;

                  return (
                    <tr key={prod._id} className="hover:bg-ivory/40">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            className="w-10 h-12 object-cover object-top border border-borderGrey shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-navy truncate max-w-xs">{prod.name}</p>
                            <span className="text-[10px] text-mutedGrey uppercase">{prod.brand}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 capitalize text-mutedGrey">{prod.categorySlug?.replace('-', ' ')}</td>
                      <td className="p-3.5">
                        <span className="font-semibold">{formatINR(prod.salePrice || prod.basePrice)}</span>
                        {prod.salePrice && (
                          <span className="block text-[10px] text-mutedGrey line-through">
                            {formatINR(prod.basePrice)}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-mutedGrey">{prod.variants?.length || 0} variant(s)</td>
                      <td className="p-3.5">
                        <span className={`font-semibold ${totalStock <= 5 ? 'text-amber-700 font-bold' : 'text-navy'}`}>
                          {totalStock} units
                        </span>
                      </td>
                      <td className="p-3.5 text-mutedGrey">{prod.salesCount || 0} sold</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleArchive(prod._id)}
                          className="text-xs text-mutedGrey hover:text-errorRed p-1 transition-colors"
                          title="Archive Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Product Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-borderGrey max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-borderGrey mb-4">
              <h3 className="font-serif text-xl font-semibold text-navy">Add New Formal Garment</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-mutedGrey hover:text-navy">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-navy font-semibold uppercase tracking-wider mb-1">Garment Title</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Italian Super 130s Double-Breasted Blazer"
                    className="w-full bg-ivory border border-borderGrey p-2.5 text-navy focus:outline-none focus:border-navy"
                  />
                </div>

                <div>
                  <label className="block text-navy font-semibold uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={form.categorySlug}
                    onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
                    className="w-full bg-ivory border border-borderGrey p-2.5 text-navy focus:outline-none focus:border-navy"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-navy font-semibold uppercase tracking-wider mb-1">Brand Line</label>
                  <input
                    type="text"
                    required
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="w-full bg-ivory border border-borderGrey p-2.5 text-navy focus:outline-none focus:border-navy"
                  />
                </div>

                <div>
                  <label className="block text-navy font-semibold uppercase tracking-wider mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={form.basePrice}
                    onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
                    className="w-full bg-ivory border border-borderGrey p-2.5 text-navy focus:outline-none focus:border-navy"
                  />
                </div>

                <div>
                  <label className="block text-navy font-semibold uppercase tracking-wider mb-1">Sale Price (Optional ₹)</label>
                  <input
                    type="number"
                    value={form.salePrice}
                    onChange={(e) => setForm({ ...form, salePrice: Number(e.target.value) })}
                    className="w-full bg-ivory border border-borderGrey p-2.5 text-navy focus:outline-none focus:border-navy"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-navy font-semibold uppercase tracking-wider mb-1">Image URL</label>
                  <input
                    type="url"
                    required
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    className="w-full bg-ivory border border-borderGrey p-2.5 text-navy focus:outline-none focus:border-navy"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-navy font-semibold uppercase tracking-wider mb-1">Fabric & Material</label>
                  <input
                    type="text"
                    required
                    value={form.material}
                    onChange={(e) => setForm({ ...form, material: e.target.value })}
                    className="w-full bg-ivory border border-borderGrey p-2.5 text-navy focus:outline-none focus:border-navy"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-navy font-semibold uppercase tracking-wider mb-1">Tailoring Description</label>
                  <textarea
                    required
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe lapel cut, weave, canvas construction..."
                    className="w-full bg-ivory border border-borderGrey p-2.5 text-navy focus:outline-none focus:border-navy"
                  />
                </div>

                {/* Initial Variant Settings */}
                <div className="sm:col-span-2 pt-2 border-t border-borderGrey">
                  <p className="font-semibold text-navy uppercase tracking-wider mb-2">Initial Stock Variant</p>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[10px] text-mutedGrey">Size</label>
                      <input
                        type="text"
                        required
                        value={form.size}
                        onChange={(e) => setForm({ ...form, size: e.target.value })}
                        className="w-full p-2 bg-ivory border border-borderGrey"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-mutedGrey">Color</label>
                      <input
                        type="text"
                        required
                        value={form.color}
                        onChange={(e) => setForm({ ...form, color: e.target.value })}
                        className="w-full p-2 bg-ivory border border-borderGrey"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-mutedGrey">Stock Units</label>
                      <input
                        type="number"
                        required
                        value={form.stock}
                        onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                        className="w-full p-2 bg-ivory border border-borderGrey"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-mutedGrey">SKU Code</label>
                      <input
                        type="text"
                        required
                        value={form.sku}
                        onChange={(e) => setForm({ ...form, sku: e.target.value })}
                        className="w-full p-2 bg-ivory border border-borderGrey"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-borderGrey">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-borderGrey text-navy uppercase font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-navy text-white uppercase font-semibold text-xs hover:bg-navy-deep"
                >
                  Publish Garment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
