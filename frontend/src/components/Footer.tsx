import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2, ShieldCheck, RefreshCw, Truck } from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../app/ToastContext.js';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await api.post('/newsletter/subscribe', { email });
      if (res.data.success) {
        setSubscribed(true);
        showToast('Subscribed to FORMALS FOR US editorial releases', 'success');
      }
    } catch {
      showToast('Failed to subscribe. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-navy-deep text-white border-t border-navy-light pt-16 pb-12">
      {/* Brand Benefits Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/5 border border-champagne/30 text-champagne shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm tracking-wide text-white">All-India Express Delivery</h4>
              <p className="text-xs text-mutedGrey mt-1 leading-relaxed">
                Complimentary shipping on orders above ₹1,999. Dispatched within 24 hours from our Delhi hub.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/5 border border-champagne/30 text-champagne shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm tracking-wide text-white">7-Day Fit Guarantee</h4>
              <p className="text-xs text-mutedGrey mt-1 leading-relaxed">
                Seamless size exchange or doorstep return pickup for unworn formalwear with original tags.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/5 border border-champagne/30 text-champagne shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm tracking-wide text-white">Ethical Italian & Giza Weaves</h4>
              <p className="text-xs text-mutedGrey mt-1 leading-relaxed">
                100% two-ply long-staple cotton and worsted wool fabrics tailored for Indian climatic comfort.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <span className="font-serif text-2xl tracking-widest font-semibold text-white">
                FORMALS FOR US
              </span>
              <span className="block text-[10px] tracking-[0.25em] text-champagne uppercase -mt-0.5">
                Modern Sartorial Excellence
              </span>
            </Link>
            <p className="text-xs text-mutedGrey leading-relaxed max-w-sm">
              Empowering Indian executives, graduates, and professionals with impeccably tailored formalwear.
              From boardroom presentations to black-tie galas, dress with uncompromised confidence.
            </p>
            <div className="pt-2 text-xs text-mutedGrey">
              <p>Customer Concierge: support@formalsforus.com</p>
              <p>Mon – Sat, 9:30 AM – 7:00 PM IST</p>
            </div>
          </div>

          {/* Catalog Categories */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-champagne font-semibold mb-4">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li>
                <Link to="/category/formal-shirts" className="hover:text-champagne transition-colors">
                  Formal Shirts
                </Link>
              </li>
              <li>
                <Link to="/category/formal-trousers" className="hover:text-champagne transition-colors">
                  Formal Trousers
                </Link>
              </li>
              <li>
                <Link to="/category/blazers" className="hover:text-champagne transition-colors">
                  Italian Cut Blazers
                </Link>
              </li>
              <li>
                <Link to="/category/business-suits" className="hover:text-champagne transition-colors">
                  Business Suits
                </Link>
              </li>
              <li>
                <Link to="/category/waistcoats" className="hover:text-champagne transition-colors">
                  Formal Waistcoats
                </Link>
              </li>
              <li>
                <Link to="/category/formal-shoes" className="hover:text-champagne transition-colors">
                  Handcrafted Shoes
                </Link>
              </li>
              <li>
                <Link to="/category/belts-and-accessories" className="hover:text-champagne transition-colors">
                  Belts & Silk Ties
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service & Policies */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-champagne font-semibold mb-4">
              Assistance
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li>
                <Link to="/order-tracking" className="hover:text-champagne transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-champagne transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/returns-policy" className="hover:text-champagne transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-champagne transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-champagne transition-colors">
                  The FORMALS Story
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-champagne transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Editorial Newsletter */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-champagne font-semibold mb-4">
              The Gentleman's Gazette
            </h4>
            <p className="text-xs text-mutedGrey mb-3 leading-relaxed">
              Subscribe for sartorial guides, fabric releases, and private seasonal previews.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 p-3 bg-white/5 border border-champagne/40 text-champagne text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>You're on the invite list.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your corporate email"
                    className="w-full bg-navy border border-white/20 px-3 py-2.5 text-xs text-white placeholder:text-mutedGrey focus:outline-none focus:border-champagne"
                  />
                  <Mail className="w-4 h-4 text-mutedGrey absolute right-3 top-3 pointer-events-none" />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-champagne text-navy text-xs font-semibold uppercase tracking-wider hover:bg-champagne-light transition-colors disabled:opacity-50"
                >
                  {loading ? 'Subscribing...' : 'Join Atelier'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar: Legal & Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-mutedGrey gap-4">
        <p>© {new Date().getFullYear()} FORMALS FOR US. All rights reserved. Indian Rupee (₹) Pricing.</p>
        <div className="flex items-center space-x-6 text-[11px]">
          <Link to="/privacy-policy" className="hover:text-champagne transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms-conditions" className="hover:text-champagne transition-colors">
            Terms & Conditions
          </Link>
          <span className="text-champagne/80">Secured Payments · COD Available</span>
        </div>
      </div>
    </footer>
  );
};
