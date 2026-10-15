import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  Search,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../app/AuthContext.js';
import { useCart } from '../app/CartContext.js';
import { useWishlist } from '../app/WishlistContext.js';
import { api, formatINR } from '../services/api.js';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { user, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlist } = useWishlist();

  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Handle outside click for user dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.get('/search/suggestions', { params: { q: searchQuery } });
        if (res.data.success) {
          setSuggestions(res.data.data);
        }
      } catch {
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Shop All', path: '/shop' },
    { label: 'Shirts', path: '/category/formal-shirts' },
    { label: 'Trousers', path: '/category/formal-trousers' },
    { label: 'Blazers', path: '/category/blazers' },
    { label: 'Suits', path: '/category/business-suits' },
    { label: 'Accessories', path: '/category/belts-and-accessories' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-borderGrey">
      {/* Top Announcement Bar */}
      <div className="bg-navy-deep text-ivory text-xs tracking-wider uppercase py-2 px-4 text-center font-medium">
        <span>Complimentary Express Shipping in India Above ₹1,999 · 7-Day Tailored Exchange Guarantee</span>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-navy hover:text-champagne transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Wordmark */}
          <div className="flex-1 lg:flex-none text-center lg:text-left">
            <Link to="/" className="inline-block group">
              <span className="font-serif text-2xl sm:text-3xl tracking-widest font-semibold text-navy group-hover:text-champagne-dark transition-colors">
                FORMALS FOR US
              </span>
              <span className="block text-[10px] tracking-[0.25em] text-mutedGrey -mt-1 uppercase">
                Atelier · New Delhi
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium tracking-wide text-navy">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="hover:text-champagne-dark transition-colors py-2 relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-champagne transition-all duration-200 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-4 sm:space-x-5">
            {/* Search Icon */}
            <button
              onClick={() => {
                setSearchOpen(!searchOpen);
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }}
              className="p-2 text-navy hover:text-champagne-dark transition-colors"
              aria-label="Open search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="p-2 text-navy hover:text-champagne-dark transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-champagne text-navy text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Shopping Bag */}
            <Link
              to="/cart"
              className="p-2 text-navy hover:text-champagne-dark transition-colors relative"
              aria-label="Shopping bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-navy text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Account Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1 p-2 text-navy hover:text-champagne-dark transition-colors"
                aria-label="Account options"
                aria-expanded={userDropdownOpen}
              >
                <UserIcon className="w-5 h-5" />
                <ChevronDown className="w-3 h-3 text-mutedGrey hidden sm:block" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-borderGrey shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-borderGrey text-xs">
                        <p className="font-semibold text-navy truncate">{user.name}</p>
                        <p className="text-mutedGrey truncate">{user.email}</p>
                      </div>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-champagne-dark hover:bg-ivory transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Admin Console
                        </Link>
                      )}
                      <Link
                        to="/account/profile"
                        className="block px-4 py-2 text-sm text-navy hover:bg-ivory transition-colors"
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/account/orders"
                        className="block px-4 py-2 text-sm text-navy hover:bg-ivory transition-colors"
                      >
                        Order History
                      </Link>
                      <Link
                        to="/account/addresses"
                        className="block px-4 py-2 text-sm text-navy hover:bg-ivory transition-colors"
                      >
                        Saved Addresses
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-errorRed hover:bg-red-50 transition-colors border-t border-borderGrey mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-2 border-b border-borderGrey text-xs text-mutedGrey">
                        Sign in for exclusive member orders and saved measurements
                      </div>
                      <Link
                        to="/login"
                        className="block px-4 py-2.5 text-sm font-medium text-navy hover:bg-ivory transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        className="block px-4 py-2 text-sm text-navy hover:bg-ivory transition-colors"
                      >
                        Create Account
                      </Link>
                      <Link
                        to="/order-tracking"
                        className="block px-4 py-2 text-sm text-mutedGrey hover:bg-ivory transition-colors border-t border-borderGrey"
                      >
                        Track An Order
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Search Drawer */}
      {searchOpen && (
        <div className="bg-ivory border-t border-borderGrey px-4 py-4 animate-in fade-in duration-200">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search formal shirts, Italian wool suits, oxford shoes..."
                className="w-full bg-white border border-borderGrey pl-11 pr-24 py-3 text-sm text-navy focus:outline-none focus:border-navy transition-colors placeholder:text-mutedGrey"
              />
              <Search className="w-5 h-5 text-mutedGrey absolute left-3.5 pointer-events-none" />
              <button
                type="submit"
                className="absolute right-2 px-4 py-1.5 bg-navy text-white text-xs font-semibold uppercase tracking-wider hover:bg-navy-deep transition-colors"
              >
                Search
              </button>
            </form>

            {/* Suggestions list */}
            {suggestions.length > 0 && (
              <div className="bg-white border border-borderGrey mt-2 shadow-lg divide-y divide-borderGrey max-h-80 overflow-y-auto">
                {suggestions.map((item) => (
                  <Link
                    key={item.slug}
                    to={`/product/${item.slug}`}
                    className="flex items-center gap-3 p-3 hover:bg-ivory transition-colors"
                  >
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-12 h-14 object-cover object-top border border-borderGrey"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy truncate">{item.name}</p>
                      <p className="text-xs text-mutedGrey">
                        {item.categorySlug.replace('-', ' ').toUpperCase()} ·{' '}
                        {formatINR(item.salePrice || item.basePrice)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[113px] bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white w-4/5 max-w-sm h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-widest text-mutedGrey font-semibold">Collections</p>
              <div className="flex flex-col space-y-4 text-base font-medium text-navy">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="hover:text-champagne-dark transition-colors py-1"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="border-t border-borderGrey pt-6 space-y-3 text-sm">
                <Link to="/order-tracking" className="block text-mutedGrey hover:text-navy">
                  Track Existing Order
                </Link>
                <Link to="/about" className="block text-mutedGrey hover:text-navy">
                  About FORMALS FOR US
                </Link>
                <Link to="/contact" className="block text-mutedGrey hover:text-navy">
                  Customer Support
                </Link>
              </div>
            </div>

            <div className="border-t border-borderGrey pt-4">
              {user ? (
                <div className="space-y-2">
                  <p className="text-xs text-mutedGrey">Signed in as {user.name}</p>
                  <button
                    onClick={logout}
                    className="w-full py-2 bg-ivory text-errorRed text-sm font-medium text-center border border-borderGrey"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    className="py-2.5 bg-navy text-white text-xs font-semibold uppercase tracking-wider text-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="py-2.5 border border-navy text-navy text-xs font-semibold uppercase tracking-wider text-center"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
