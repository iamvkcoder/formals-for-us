import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api, formatINR } from '../../services/api.js';
import { Order, OrderStatus } from '../../types/index.js';
import { useAuth } from '../../app/AuthContext.js';
import { useToast } from '../../app/ToastContext.js';

export const AdminOrdersPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/orders', {
        params: {
          page,
          limit: 15,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: search.trim() || undefined,
        },
      });
      if (res.data.success) {
        setOrders(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchOrders();
    }
  }, [isAdmin, statusFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await api.patch(`/admin/orders/${orderId}/status`, {
        status: newStatus,
        comment: `Order status advanced to ${newStatus} via Admin Console`,
      });
      if (res.data.success) {
        showToast(`Order status updated to ${newStatus}`, 'success');
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update order status', 'error');
    }
  };

  if (!isAdmin) {
    return <div className="p-20 text-center text-xs text-errorRed">Admin privilege required.</div>;
  }

  const statusOptions: OrderStatus[] = [
    'Pending',
    'Confirmed',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
    'Return Requested',
    'Returned',
    'Refunded',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-borderGrey gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-champagne font-bold">
            Fulfillment Logistics
          </span>
          <h1 className="font-serif text-3xl font-semibold text-navy">Order Management</h1>
        </div>
        <Link
          to="/admin"
          className="text-xs font-semibold uppercase tracking-wider text-navy hover:text-champagne-dark"
        >
          ← Back to Analytics
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-borderGrey p-4 text-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number, customer name, email..."
            className="w-full bg-ivory border border-borderGrey pl-9 pr-3 py-2 text-navy focus:outline-none focus:border-navy"
          />
          <Search className="w-4 h-4 text-mutedGrey absolute left-3 top-2.5 pointer-events-none" />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-mutedGrey font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-ivory border border-borderGrey p-2 text-navy focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            {statusOptions.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-borderGrey overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-ivory border-b border-borderGrey text-navy font-semibold">
              <tr>
                <th className="p-3.5">Order #</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Items</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Current Status</th>
                <th className="p-3.5">Advance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderGrey text-navy">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-mutedGrey">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-mutedGrey">
                    No orders matching criteria.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-ivory/40">
                    <td className="p-3.5 font-bold font-mono">
                      <Link to={`/account/orders/${ord.orderNumber}`} className="text-navy hover:underline">
                        {ord.orderNumber}
                      </Link>
                    </td>
                    <td className="p-3.5 text-mutedGrey">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-3.5">
                      <p className="font-medium text-navy">{ord.customerName}</p>
                      <p className="text-[11px] text-mutedGrey">{ord.customerEmail}</p>
                    </td>
                    <td className="p-3.5 text-mutedGrey">{ord.items.length} garments</td>
                    <td className="p-3.5 font-semibold">{formatINR(ord.pricing?.total)}</td>
                    <td className="p-3.5">
                      <span className="capitalize text-mutedGrey">
                        {ord.payment.method} ({ord.payment.status})
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-navy/10 text-navy">
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleStatusChange(ord._id, e.target.value as OrderStatus)}
                        className="bg-ivory border border-borderGrey px-2 py-1 text-xs focus:outline-none focus:border-navy cursor-pointer font-medium"
                      >
                        {statusOptions.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-borderGrey flex justify-between items-center text-xs">
            <span className="text-mutedGrey">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 border border-borderGrey disabled:opacity-30"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 border border-borderGrey disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
