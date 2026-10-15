import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api.js';
import { Address } from '../types/index.js';
import { useToast } from '../app/ToastContext.js';

export const AddressesPage: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false,
  });

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/addresses');
      if (res.data.success) {
        setAddresses(res.data.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/addresses', form);
      if (res.data.success) {
        showToast('Address added successfully', 'success');
        setAddresses((prev) => [res.data.data, ...prev]);
        setShowForm(false);
        setForm({
          fullName: '',
          phone: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'India',
          isDefault: false,
        });
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save address', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await api.delete(`/addresses/${id}`);
      if (res.data.success) {
        showToast('Address removed', 'info');
        setAddresses((prev) => prev.filter((a) => a._id !== id));
      }
    } catch {
      showToast('Could not delete address', 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-borderGrey gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-navy">Saved Delivery Addresses</h1>
          <p className="text-xs text-mutedGrey mt-1">Manage corporate and residential delivery destinations</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-navy text-white text-xs font-semibold uppercase tracking-wider hover:bg-navy-deep transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Address
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white border border-borderGrey p-6 sm:p-8 mb-8 space-y-4 shadow-sm">
          <h3 className="font-serif text-lg font-semibold text-navy pb-2 border-b border-borderGrey">
            Add New Address
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-navy font-semibold mb-1">Recipient Full Name</label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full bg-ivory border border-borderGrey p-2.5 text-navy focus:outline-none focus:border-navy"
              />
            </div>
            <div>
              <label className="block text-navy font-semibold mb-1">Mobile (10 digits)</label>
              <input
                type="text"
                required
                maxLength={10}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                className="w-full bg-ivory border border-borderGrey p-2.5 text-navy focus:outline-none focus:border-navy"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-navy font-semibold mb-1">Street Address</label>
              <input
                type="text"
                required
                value={form.addressLine1}
                onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                className="w-full bg-ivory border border-borderGrey p-2.5 text-navy focus:outline-none focus:border-navy"
              />
            </div>
            <div>
              <label className="block text-navy font-semibold mb-1">City</label>
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full bg-ivory border border-borderGrey p-2.5 text-navy focus:outline-none focus:border-navy"
              />
            </div>
            <div>
              <label className="block text-navy font-semibold mb-1">State</label>
              <input
                type="text"
                required
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full bg-ivory border border-borderGrey p-2.5 text-navy focus:outline-none focus:border-navy"
              />
            </div>
            <div>
              <label className="block text-navy font-semibold mb-1">PIN Code (6 digits)</label>
              <input
                type="text"
                required
                maxLength={6}
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value.replace(/\D/g, '') })}
                className="w-full bg-ivory border border-borderGrey p-2.5 text-navy focus:outline-none focus:border-navy"
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="defCheck"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                className="text-navy focus:ring-champagne"
              />
              <label htmlFor="defCheck" className="text-xs text-navy cursor-pointer">
                Set as my default shipping address
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-borderGrey">
            <button
              type="submit"
              className="px-6 py-2.5 bg-navy text-white text-xs font-semibold uppercase tracking-wider hover:bg-navy-deep"
            >
              Save Address
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2.5 border border-borderGrey text-navy text-xs font-semibold uppercase tracking-wider"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-20 text-center text-xs text-mutedGrey">Loading addresses...</div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-20 bg-ivory border border-borderGrey p-8">
          <MapPin className="w-10 h-10 text-mutedGrey mx-auto mb-3 stroke-1" />
          <p className="text-xs text-mutedGrey mb-4">No saved addresses found.</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2.5 bg-navy text-white text-xs font-semibold uppercase tracking-wider"
          >
            Add First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div key={addr._id} className="bg-white border border-borderGrey p-6 flex flex-col justify-between">
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-borderGrey">
                  <span className="font-bold text-navy text-sm">{addr.fullName}</span>
                  {addr.isDefault && (
                    <span className="text-[10px] bg-champagne/30 text-navy font-bold px-2 py-0.5 rounded">
                      DEFAULT
                    </span>
                  )}
                </div>
                <p className="text-gray-600">{addr.addressLine1}</p>
                {addr.addressLine2 && <p className="text-gray-600">{addr.addressLine2}</p>}
                <p className="text-gray-600">
                  {addr.city}, {addr.state} — {addr.postalCode}
                </p>
                <p className="text-gray-600">Phone: {addr.phone}</p>
              </div>

              <div className="pt-4 border-t border-borderGrey flex justify-end">
                <button
                  onClick={() => handleDelete(addr._id!)}
                  className="text-xs text-mutedGrey hover:text-errorRed flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
