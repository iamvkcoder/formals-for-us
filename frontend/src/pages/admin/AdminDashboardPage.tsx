import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  Download,
  TrendingUp,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { api, formatINR } from '../../services/api.js';
import { AdminAnalytics } from '../../types/index.js';
import { useAuth } from '../../app/AuthContext.js';

const STATUS_COLORS: Record<string, string> = {
  Confirmed: '#26734D',
  Delivered: '#17263C',
  Processing: '#2563EB',
  Shipped: '#7C3AED',
  Pending: '#D97706',
  Cancelled: '#B42318',
  'Return Requested': '#DC2626',
};

export const AdminDashboardPage: React.FC = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      api.get('/admin/analytics')
        .then((res) => {
          if (res.data.success) {
            setAnalytics(res.data.data);
          }
        })
        .catch((err) => console.error('Admin analytics fetch failed:', err))
        .finally(() => setLoading(false));
    }
  }, [isAdmin]);

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/admin/reports/sales', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `formal_sales_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Could not download sales report');
    }
  };

  if (authLoading || loading) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-mutedGrey">Loading analytics dashboard...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <ShieldAlert className="w-12 h-12 text-errorRed mx-auto mb-3" />
        <h2 className="font-serif text-2xl font-semibold text-navy mb-2">Access Restricted</h2>
        <p className="text-xs text-mutedGrey mb-6">
          This portal requires executive administrator privileges.
        </p>
        <Link to="/login" className="px-6 py-2.5 bg-navy text-white text-xs font-semibold uppercase tracking-wider">
          Sign In as Administrator
        </Link>
      </div>
    );
  }

  const summary = analytics?.summary || {
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
    lowStockCount: 0,
  };

  const chartData = analytics?.salesByDate?.map((d) => ({
    date: d._id.substring(5),
    revenue: d.revenue,
    orders: d.orders,
  })) || [];

  const pieData = analytics?.statusDistribution?.map((d) => ({
    name: d._id,
    value: d.count,
  })) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-borderGrey gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-champagne font-bold">
            Executive Command Console
          </span>
          <h1 className="font-serif text-3xl font-semibold text-navy">Atelier Performance Analytics</h1>
          <p className="text-xs text-mutedGrey mt-1">Live order fulfillment, revenue metrics, and inventory alerts</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-navy text-navy text-xs font-semibold uppercase tracking-wider hover:bg-ivory transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export Sales CSV
          </button>
          <Link
            to="/admin/products"
            className="px-4 py-2 bg-navy text-white text-xs font-semibold uppercase tracking-wider hover:bg-navy-deep transition-colors"
          >
            Manage Catalog
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Revenue */}
        <div className="bg-white border border-borderGrey p-5 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-mutedGrey">
            <span className="text-[10px] uppercase tracking-wider font-bold">Total Sales</span>
            <DollarSign className="w-4 h-4 text-champagne" />
          </div>
          <p className="font-serif text-2xl font-bold text-navy">{formatINR(summary.totalRevenue)}</p>
          <p className="text-[11px] text-mutedGrey">Excluding cancelled/refunds</p>
        </div>

        {/* Orders */}
        <div className="bg-white border border-borderGrey p-5 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-mutedGrey">
            <span className="text-[10px] uppercase tracking-wider font-bold">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-champagne" />
          </div>
          <p className="font-serif text-2xl font-bold text-navy">{summary.totalOrders}</p>
          <Link to="/admin/orders" className="text-[11px] text-champagne-dark font-medium hover:underline block">
            Inspect Orders →
          </Link>
        </div>

        {/* Customers */}
        <div className="bg-white border border-borderGrey p-5 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-mutedGrey">
            <span className="text-[10px] uppercase tracking-wider font-bold">Customers</span>
            <Users className="w-4 h-4 text-champagne" />
          </div>
          <p className="font-serif text-2xl font-bold text-navy">{summary.totalCustomers}</p>
          <Link to="/admin/customers" className="text-[11px] text-champagne-dark font-medium hover:underline block">
            View Member Roster →
          </Link>
        </div>

        {/* Products */}
        <div className="bg-white border border-borderGrey p-5 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-mutedGrey">
            <span className="text-[10px] uppercase tracking-wider font-bold">Catalog Items</span>
            <Package className="w-4 h-4 text-champagne" />
          </div>
          <p className="font-serif text-2xl font-bold text-navy">{summary.totalProducts}</p>
          <Link to="/admin/products" className="text-[11px] text-champagne-dark font-medium hover:underline block">
            Update Catalog →
          </Link>
        </div>

        {/* Low Stock Alerts */}
        <div className={`p-5 border shadow-sm space-y-1 ${summary.lowStockCount > 0 ? 'bg-amber-50/60 border-amber-300' : 'bg-white border-borderGrey'}`}>
          <div className="flex justify-between items-center text-amber-800">
            <span className="text-[10px] uppercase tracking-wider font-bold">Low Stock Warning</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="font-serif text-2xl font-bold text-amber-900">{summary.lowStockCount}</p>
          <Link to="/admin/inventory" className="text-[11px] text-amber-800 font-bold hover:underline block">
            Review Depleted SKUs →
          </Link>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Revenue Over Time Chart */}
        <div className="lg:col-span-8 bg-white border border-borderGrey p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-borderGrey">
            <h3 className="font-serif text-base font-semibold text-navy flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-champagne" /> Revenue & Order Trend
            </h3>
            <span className="text-[11px] text-mutedGrey">Past 14 Days</span>
          </div>

          <div className="h-72 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C5A46D" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#C5A46D" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#747B85' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#747B85' }} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip
                    formatter={(value: any) => [formatINR(Number(value)), 'Revenue']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#C5A46D" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-mutedGrey">
                No recent completed sales recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="lg:col-span-4 bg-white border border-borderGrey p-6 space-y-4">
          <h3 className="font-serif text-base font-semibold text-navy pb-3 border-b border-borderGrey">
            Order Status Breakdown
          </h3>

          <div className="h-52 w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#17263C'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-mutedGrey">No order data</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-borderGrey">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[item.name] || '#17263C' }} />
                <span className="text-mutedGrey truncate">{item.name}:</span>
                <span className="font-bold text-navy">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border border-borderGrey p-6 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-borderGrey">
          <h3 className="font-serif text-base font-semibold text-navy">Recent Order Placements</h3>
          <Link to="/admin/orders" className="text-xs font-semibold uppercase tracking-wider text-champagne-dark hover:underline flex items-center gap-1">
            All Orders <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-ivory border-b border-borderGrey text-navy font-semibold">
              <tr>
                <th className="p-3">Order Number</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Date</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderGrey text-navy">
              {analytics?.recentOrders?.map((ord: any) => (
                <tr key={ord._id} className="hover:bg-ivory/50">
                  <td className="p-3 font-bold">{ord.orderNumber}</td>
                  <td className="p-3">{ord.customerName}</td>
                  <td className="p-3 text-mutedGrey">
                    {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="p-3 font-semibold">{formatINR(ord.pricing?.total)}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded" style={{
                      backgroundColor: `${STATUS_COLORS[ord.orderStatus] || '#17263C'}20`,
                      color: STATUS_COLORS[ord.orderStatus] || '#17263C',
                    }}>
                      {ord.orderStatus}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      to={`/account/orders/${ord.orderNumber}`}
                      className="text-xs text-champagne-dark font-medium hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
