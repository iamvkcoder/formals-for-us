import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, Calendar, MapPin, Printer, AlertTriangle, ArrowLeft, RotateCcw } from 'lucide-react';
import { api, formatINR } from '../services/api.js';
import { Order } from '../types/index.js';
import { useToast } from '../app/ToastContext.js';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const { showToast } = useToast();

  const fetchOrder = () => {
    if (id) {
      api.get(`/orders/${id}`)
        .then((res) => {
          if (res.data.success) {
            setOrder(res.data.data);
          }
        })
        .catch((err) => console.error('Order detail load error:', err))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/orders/${order._id}/cancel`, { reason: cancelReason });
      if (res.data.success) {
        showToast('Order cancelled and inventory restored', 'info');
        setOrder(res.data.data);
        setCancelModalOpen(false);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to cancel order', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/orders/${order._id}/return-request`, { reason: returnReason });
      if (res.data.success) {
        showToast('Return request submitted successfully', 'success');
        setOrder(res.data.data);
        setReturnModalOpen(false);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to request return', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs text-mutedGrey">Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl text-navy mb-2">Order Not Found</h2>
        <p className="text-xs text-mutedGrey mb-6">We couldn't locate this order reference.</p>
        <Link to="/account/orders" className="px-6 py-2.5 bg-navy text-white text-xs font-semibold uppercase tracking-wider">
          Return to Orders
        </Link>
      </div>
    );
  }

  const isCancellable = ['Pending', 'Confirmed', 'Processing'].includes(order.orderStatus);
  const isReturnable = order.orderStatus === 'Delivered';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-borderGrey gap-4">
        <div>
          <Link to="/account/orders" className="text-xs text-mutedGrey hover:text-navy flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-navy">
              {order.orderNumber}
            </h1>
            <span className="px-3 py-1 bg-navy text-white text-[11px] font-bold uppercase tracking-wider rounded-sm">
              {order.orderStatus}
            </span>
          </div>
          <p className="text-xs text-mutedGrey mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'full' })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 border border-borderGrey text-navy text-xs font-semibold uppercase tracking-wider hover:bg-ivory transition-colors"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          {isCancellable && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="px-4 py-2 border border-errorRed text-errorRed text-xs font-semibold uppercase tracking-wider hover:bg-red-50 transition-colors"
            >
              Cancel Order
            </button>
          )}
          {isReturnable && (
            <button
              onClick={() => setReturnModalOpen(true)}
              className="px-4 py-2 bg-navy text-white text-xs font-semibold uppercase tracking-wider hover:bg-navy-deep transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Request Return
            </button>
          )}
        </div>
      </div>

      {/* Status History Timeline */}
      <div className="bg-white border border-borderGrey p-6 space-y-4">
        <h3 className="font-serif text-base font-semibold text-navy">Tracking & Status Progression</h3>
        <div className="space-y-3">
          {order.statusHistory.map((h, i) => (
            <div key={i} className="flex items-start gap-3 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-champagne mt-1 shrink-0" />
              <div>
                <p className="font-bold text-navy uppercase tracking-wider">{h.status}</p>
                <p className="text-mutedGrey text-[11px]">
                  {new Date(h.timestamp).toLocaleString('en-IN')} {h.comment && `— ${h.comment}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white border border-borderGrey p-6 space-y-4">
        <h3 className="font-serif text-base font-semibold text-navy pb-3 border-b border-borderGrey">
          Ordered Garments ({order.items.length})
        </h3>
        <div className="divide-y divide-borderGrey">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-4 flex gap-4">
              <img
                src={item.productImage}
                alt={item.productName}
                className="w-16 h-20 object-cover object-top border border-borderGrey shrink-0"
              />
              <div className="flex-1 flex flex-col justify-between text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-navy text-sm">{item.productName}</p>
                    <p className="text-mutedGrey mt-0.5">
                      Size: {item.size} · Color: {item.color} · SKU: {item.sku}
                    </p>
                  </div>
                  <span className="font-bold text-navy text-sm">{formatINR(item.totalPrice)}</span>
                </div>
                <div className="flex justify-between text-mutedGrey text-[11px]">
                  <span>Unit Price: {formatINR(item.unitPrice)}</span>
                  <span>Quantity: {item.quantity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Address & Payment Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
        <div className="bg-white border border-borderGrey p-6 space-y-2">
          <h3 className="font-semibold uppercase tracking-wider text-mutedGrey flex items-center gap-1.5 pb-2 border-b border-borderGrey">
            <MapPin className="w-4 h-4 text-champagne" /> Delivery Destination
          </h3>
          <p className="font-bold text-navy text-sm">{order.shippingAddress.fullName}</p>
          <p className="text-gray-600">{order.shippingAddress.addressLine1}</p>
          {order.shippingAddress.addressLine2 && <p className="text-gray-600">{order.shippingAddress.addressLine2}</p>}
          <p className="text-gray-600">
            {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.postalCode}
          </p>
          <p className="text-gray-600">Contact: {order.shippingAddress.phone}</p>
        </div>

        <div className="bg-white border border-borderGrey p-6 space-y-2">
          <h3 className="font-semibold uppercase tracking-wider text-mutedGrey flex items-center gap-1.5 pb-2 border-b border-borderGrey">
            <Package className="w-4 h-4 text-champagne" /> Financial Summary
          </h3>
          <div className="space-y-1.5 text-navy">
            <div className="flex justify-between">
              <span>Payment Method</span>
              <span className="font-semibold uppercase">{order.payment.method}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment State</span>
              <span className="font-semibold capitalize text-successGreen">{order.payment.status}</span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatINR(order.pricing.subtotal)}</span>
            </div>
            {order.pricing.discount > 0 && (
              <div className="flex justify-between text-successGreen">
                <span>Discount</span>
                <span>-{formatINR(order.pricing.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping Charge</span>
              <span>{order.pricing.shippingFee === 0 ? 'Complimentary' : formatINR(order.pricing.shippingFee)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (12%)</span>
              <span>{formatINR(order.pricing.tax)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-borderGrey font-bold text-sm">
              <span>Authoritative Total</span>
              <span>{formatINR(order.pricing.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-borderGrey max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-errorRed font-semibold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Confirm Order Cancellation</span>
            </div>
            <p className="text-xs text-mutedGrey leading-relaxed">
              Are you sure you wish to cancel this order? Reserved stock will immediately be released back to our inventory.
            </p>
            <form onSubmit={handleCancelOrder} className="space-y-3">
              <label className="block text-xs font-semibold text-navy uppercase tracking-wider">
                Reason for Cancellation
              </label>
              <textarea
                required
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Changed size preference, ordered by mistake"
                className="w-full bg-ivory border border-borderGrey p-2.5 text-xs text-navy focus:outline-none focus:border-navy"
              />
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="px-4 py-2 border border-borderGrey text-navy text-xs font-semibold uppercase tracking-wider"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-errorRed text-white text-xs font-semibold uppercase tracking-wider hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Request Modal */}
      {returnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-borderGrey max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-semibold text-navy">Request 7-Day Doorstep Return</h3>
            <p className="text-xs text-mutedGrey leading-relaxed">
              Our courier executive will verify the unworn garment with original tags before collecting.
            </p>
            <form onSubmit={handleRequestReturn} className="space-y-3">
              <label className="block text-xs font-semibold text-navy uppercase tracking-wider">
                Reason for Return
              </label>
              <textarea
                required
                rows={3}
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="e.g. Sleeve length slightly long, exchanging for size 40"
                className="w-full bg-ivory border border-borderGrey p-2.5 text-xs text-navy focus:outline-none focus:border-navy"
              />
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReturnModalOpen(false)}
                  className="px-4 py-2 border border-borderGrey text-navy text-xs font-semibold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-navy text-white text-xs font-semibold uppercase tracking-wider hover:bg-navy-deep disabled:opacity-50"
                >
                  {actionLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
