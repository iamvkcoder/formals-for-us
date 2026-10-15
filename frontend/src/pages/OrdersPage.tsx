import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Calendar, ArrowRight } from 'lucide-react';
import { api, formatINR } from '../services/api.js';
import { Order } from '../types/index.js';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then((res) => {
        if (res.data.success) {
          setOrders(res.data.data);
        }
      })
      .catch((err) => console.error('Orders fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
      case 'Delivered':
        return 'bg-green-100 text-successGreen border-green-300';
      case 'Shipped':
      case 'Processing':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Cancelled':
      case 'Refunded':
        return 'bg-red-100 text-errorRed border-red-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="border-b border-borderGrey pb-6 mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-navy">My Orders</h1>
          <p className="text-xs text-mutedGrey mt-1">Track current shipments and view historical invoices</p>
        </div>
        <Link
          to="/shop"
          className="text-xs font-semibold uppercase tracking-wider text-navy hover:text-champagne-dark transition-colors flex items-center gap-1"
        >
          Shop More <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-mutedGrey">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-ivory border border-borderGrey p-8 max-w-lg mx-auto">
          <Package className="w-12 h-12 text-mutedGrey mx-auto mb-4 stroke-1" />
          <h2 className="font-serif text-2xl font-semibold text-navy mb-2">No Orders Yet</h2>
          <p className="text-xs text-mutedGrey mb-6 leading-relaxed">
            When you purchase formal shirts, trousers, or blazers, your order status and tracking will appear here.
          </p>
          <Link
            to="/shop"
            className="px-6 py-3 bg-navy text-white text-xs font-semibold uppercase tracking-wider inline-block"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((ord) => (
            <div key={ord._id} className="bg-white border border-borderGrey p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-borderGrey gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-mutedGrey">Order Reference</span>
                  <p className="font-bold text-navy text-sm">{ord.orderNumber}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1 text-mutedGrey">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(ord.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  <span className={`px-2.5 py-0.5 border text-[11px] font-bold uppercase tracking-wider rounded-sm ${getStatusColor(ord.orderStatus)}`}>
                    {ord.orderStatus}
                  </span>

                  <span className="font-bold text-sm text-navy">{formatINR(ord.pricing.total)}</span>
                </div>
              </div>

              {/* Items Preview */}
              <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ord.items.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-12 h-16 object-cover object-top border border-borderGrey shrink-0"
                    />
                    <div className="min-w-0 text-xs">
                      <p className="font-medium text-navy truncate">{item.productName}</p>
                      <p className="text-mutedGrey text-[11px]">
                        Size: {item.size} · Color: {item.color} · Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
                {ord.items.length > 2 && (
                  <div className="flex items-center text-xs text-mutedGrey">
                    +{ord.items.length - 2} more tailored garment(s)
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-borderGrey flex justify-between items-center text-xs">
                <span className="text-mutedGrey capitalize">
                  Payment: {ord.payment.method.replace('_', ' ')} ({ord.payment.status})
                </span>
                <Link
                  to={`/account/orders/${ord.orderNumber}`}
                  className="font-semibold text-champagne-dark hover:text-champagne flex items-center gap-1 uppercase tracking-wider text-[11px]"
                >
                  View Details & Tracking <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
