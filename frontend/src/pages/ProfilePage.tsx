import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, Calendar, Shield, Package, MapPin, Heart } from 'lucide-react';
import { useAuth } from '../app/AuthContext.js';
import { useToast } from '../app/ToastContext.js';
import { api } from '../services/api.js';

export const ProfilePage: React.FC = () => {
  const { user, updateUser, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-sm text-mutedGrey mb-4">Please log in to view your profile.</p>
        <Link to="/login" className="px-6 py-2.5 bg-navy text-white text-xs font-semibold uppercase tracking-wider">
          Sign In
        </Link>
      </div>
    );
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', { name, phone });
      if (res.data.success) {
        updateUser(res.data.user);
        showToast('Profile updated successfully', 'success');
        setEditing(false);
      }
    } catch {
      showToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="border-b border-borderGrey pb-6 mb-8">
        <h1 className="font-serif text-3xl font-semibold text-navy">Member Profile</h1>
        <p className="text-xs text-mutedGrey mt-1">Manage personal credentials and bespoke tailoring details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 space-y-2">
          <Link
            to="/account/profile"
            className="flex items-center gap-3 px-4 py-3 bg-navy text-white text-xs font-semibold uppercase tracking-wider"
          >
            <User className="w-4 h-4 text-champagne" /> Personal Details
          </Link>
          <Link
            to="/account/orders"
            className="flex items-center gap-3 px-4 py-3 bg-white border border-borderGrey text-navy hover:bg-ivory text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <Package className="w-4 h-4 text-champagne" /> Order History
          </Link>
          <Link
            to="/account/addresses"
            className="flex items-center gap-3 px-4 py-3 bg-white border border-borderGrey text-navy hover:bg-ivory text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <MapPin className="w-4 h-4 text-champagne" /> Saved Addresses
          </Link>
          <Link
            to="/wishlist"
            className="flex items-center gap-3 px-4 py-3 bg-white border border-borderGrey text-navy hover:bg-ivory text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <Heart className="w-4 h-4 text-champagne" /> Saved Wardrobe
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-3 px-4 py-3 bg-champagne text-navy text-xs font-bold uppercase tracking-wider mt-4"
            >
              <Shield className="w-4 h-4" /> Admin Console
            </Link>
          )}
        </aside>

        {/* Profile Card */}
        <div className="lg:col-span-9 bg-white border border-borderGrey p-6 sm:p-8 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-borderGrey gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-champagne font-semibold">
                Tier: {isAdmin ? 'Administrator' : 'Executive Member'}
              </span>
              <h2 className="font-serif text-2xl font-semibold text-navy">{user.name}</h2>
              <p className="text-xs text-mutedGrey">{user.email}</p>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-5 py-2 border border-navy text-navy text-xs font-semibold uppercase tracking-wider hover:bg-ivory transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleUpdate} className="max-w-md space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-ivory border border-borderGrey p-2.5 text-xs text-navy focus:outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit mobile"
                  className="w-full bg-ivory border border-borderGrey p-2.5 text-xs text-navy focus:outline-none focus:border-navy"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-navy text-white text-xs font-semibold uppercase tracking-wider hover:bg-navy-deep disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setName(user.name);
                    setPhone(user.phone || '');
                    setEditing(false);
                  }}
                  className="px-6 py-2.5 border border-borderGrey text-navy text-xs font-semibold uppercase tracking-wider"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="p-4 bg-ivory border border-borderGrey space-y-1">
                <span className="text-mutedGrey flex items-center gap-1.5 font-medium">
                  <Mail className="w-4 h-4 text-champagne" /> Primary Email
                </span>
                <p className="font-semibold text-navy">{user.email}</p>
              </div>

              <div className="p-4 bg-ivory border border-borderGrey space-y-1">
                <span className="text-mutedGrey flex items-center gap-1.5 font-medium">
                  <Phone className="w-4 h-4 text-champagne" /> Contact Phone
                </span>
                <p className="font-semibold text-navy">{user.phone || 'Not provided'}</p>
              </div>

              <div className="p-4 bg-ivory border border-borderGrey space-y-1">
                <span className="text-mutedGrey flex items-center gap-1.5 font-medium">
                  <Calendar className="w-4 h-4 text-champagne" /> Member Since
                </span>
                <p className="font-semibold text-navy">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '2026'}
                </p>
              </div>

              <div className="p-4 bg-ivory border border-borderGrey space-y-1">
                <span className="text-mutedGrey flex items-center gap-1.5 font-medium">
                  <Shield className="w-4 h-4 text-champagne" /> Account Privilege
                </span>
                <p className="font-semibold text-navy capitalize">{user.role}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
