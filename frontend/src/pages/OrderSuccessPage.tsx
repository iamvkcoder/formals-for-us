import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Printer, MapPin, Calendar } from 'lucide-react';
import { api, formatINR } from '../services/api.js';
import { Order } from '../types/index.js';

export const OrderSuccessPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (orderNumber) {
      api.get(`/orders/${orderNumber}`)
        .then((res) => {
          if (res.data.success) {
            setOrder(res.data.data);
          }
        })
        .catch((err) => console.error('Order fetch error:', err))
        .finally(() => setLoading(false));
    }
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-xs text-mutedGrey">
        Retrieving your confirmed order details...
      </div>
    );
  }

  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + 4);
  const deliveryFormatted = estimatedDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-8">
      {/* Top Banner */}
      <div className="text-center space-y-3 bg-white border border-borderGrey p-8 shadow-sm">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-successGreen mx-auto mb-2">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="text-xs uppercase tracking-widest text-champagne-dark font-semibold">
          Order Confirmed & Allocated
        </span>
        <h1 className="font-serif text-3xl font-semibold text-navy">
          Thank You For Choosing FORMALS FOR US
        </h1>
        <p className="text-xs text-mutedGrey max-w-md mx-auto leading-relaxed">
          Your order <strong className="text-navy">{orderNumber}</strong> has been received by our Atelier and is being prepared for dispatch.
        </p>

        <div className="pt-4 flex items-center justify-center gap-6 text-xs text-navy border-t border-borderGrey mt-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-champagne" />
            <span>Estimated Delivery: <strong>{deliveryFormatted}</strong></span>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-mutedGrey hover:text-navy transition-colors"
          >
            <Printer className="w-4 h-4" /> Print Invoice
          </button>
        </div>
      </div>

      {order && (
        <div className="bg-white border border-borderGrey p-6 sm:p-8 space-y-6">
          <h2 className="font-serif text-lg font-semibold text-navy pb-3 border-b border-borderGrey">
            Order Items & Tailored Specs
          </h2>

          <div className="divide-y divide-borderGrey">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-4 flex gap-4">
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-16 h-20 object-cover object-top border border-borderGrey shrink-0"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-navy">{item.productName}</p>
                      <p className="text-xs text-mutedGrey mt-0.5">
                        Size: {item.size} · Color: {item.color} · SKU: {item.sku}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-navy">
                      {formatINR(item.totalPrice)}
                    </span>
                  </div>
                  <p className="text-[11px] text-mutedGrey">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery & Pricing Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-borderGrey text-xs">
            <div>
              <h3 className="font-semibold uppercase tracking-wider text-mutedGrey mb-2 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-champagne" /> Shipping Address
              </h3>
              <div className="text-navy space-y-0.5 leading-relaxed">
                <p className="font-semibold">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.postalCode}
                </p>
                <p>Phone: {order.shippingAddress.phone}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold uppercase tracking-wider text-mutedGrey mb-2 flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-champagne" /> Payment Summary
              </h3>
              <div className="space-y-1.5 text-navy">
                <div className="flex justify-between">
                  <span>Method</span>
                  <span className="font-semibold uppercase">{order.payment.method}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status</span>
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
                  <span>Shipping</span>
                  <span>{order.pricing.shippingFee === 0 ? 'Free' : formatINR(order.pricing.shippingFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (12%)</span>
                  <span>{formatINR(order.pricing.tax)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-borderGrey font-bold text-sm">
                  <span>Total Paid / Payable</span>
                  <span>{formatINR(order.pricing.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <Link
          to="/account/orders"
          className="px-6 py-3 bg-navy text-white text-xs font-semibold uppercase tracking-wider text-center hover:bg-navy-deep transition-colors"
        >
          View In My Orders
        </Link>
        <Link
          to="/shop"
          className="px-6 py-3 border border-navy text-navy text-xs font-semibold uppercase tracking-wider text-center hover:bg-ivory transition-colors flex items-center justify-center gap-2"
        >
          Continue Shopping <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
