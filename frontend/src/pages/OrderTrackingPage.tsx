import React, { useState } from 'react';
import { Search, Package, MapPin, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { api, formatINR } from '../services/api.js';
import { Order } from '../types/index.js';

export const OrderTrackingPage: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setOrder(null);
    try {
      const res = await api.get(`/orders/${orderNumber.trim().toUpperCase()}`);
      if (res.data.success && res.data.data) {
        setOrder(res.data.data);
      } else {
        setErrorMsg('Order not found with the provided reference.');
      }
    } catch {
      setErrorMsg('No active order matched this reference number. Please check your confirmation email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-10">
      <div className="text-center space-y-2">
        <span className="text-xs uppercase tracking-widest text-champagne font-semibold">
          Real-Time Consignment Tracking
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-navy">
          Track Your Formalwear Order
        </h1>
        <p className="text-xs text-mutedGrey max-w-md mx-auto">
          Enter your unique order identifier (e.g. FFU-2026-XXXX) to inspect fulfillment progress.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="bg-white border border-borderGrey p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              placeholder="e.g. FFU-2026-A1B2C3"
              className="w-full bg-ivory border border-borderGrey pl-9 pr-3 py-3 text-xs uppercase tracking-wider text-navy focus:outline-none focus:border-navy"
            />
            <Search className="w-4 h-4 text-mutedGrey absolute left-3 top-3.5 pointer-events-none" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-navy text-white text-xs font-semibold uppercase tracking-wider hover:bg-navy-deep transition-colors disabled:opacity-50"
          >
            {loading ? 'Locating...' : 'Track Order'}
          </button>
        </form>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-xs text-errorRed flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Tracking Result View */}
      {order && (
        <div className="bg-white border border-borderGrey p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-borderGrey gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-mutedGrey">Tracking ID</span>
              <p className="font-serif text-xl font-bold text-navy">{order.orderNumber}</p>
            </div>
            <span className="px-3 py-1 bg-navy text-white text-xs font-bold uppercase tracking-wider rounded-sm">
              Status: {order.orderStatus}
            </span>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="font-serif text-base font-semibold text-navy mb-4">Milestone History</h3>
            <div className="space-y-4 text-xs">
              {order.statusHistory.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-champagne/20 border border-champagne flex items-center justify-center text-champagne shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-navy uppercase tracking-wider">{step.status}</p>
                    <p className="text-mutedGrey text-[11px]">
                      {new Date(step.timestamp).toLocaleString('en-IN')} {step.comment && `— ${step.comment}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="pt-6 border-t border-borderGrey grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-navy">
            <div>
              <span className="text-mutedGrey block mb-1">Destination:</span>
              <p className="font-semibold">{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.postalCode}</p>
            </div>
            <div>
              <span className="text-mutedGrey block mb-1">Garments:</span>
              <p className="font-semibold">{order.items.length} Tailored piece(s) · {formatINR(order.pricing.total)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
