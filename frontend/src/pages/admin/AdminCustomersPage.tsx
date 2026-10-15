import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Mail, Phone, ShoppingBag, ShieldAlert } from 'lucide-react';
import { api, formatINR } from '../../services/api.js';
import { useAuth } from '../../app/AuthContext.js';

export const AdminCustomersPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      api.get('/admin/customers')
        .then((res) => {
          if (res.data.success) {
            setCustomers(res.data.data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return <div className="p-20 text-center text-xs text-errorRed">Admin privilege required.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-borderGrey gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-champagne font-bold">
            Executive CRM
          </span>
          <h1 className="font-serif text-3xl font-semibold text-navy">Member Directory</h1>
          <p className="text-xs text-mutedGrey mt-1">Customer profiles, order frequency, and cumulative expenditure</p>
        </div>
        <Link to="/admin" className="text-xs font-semibold uppercase tracking-wider text-navy hover:text-champagne-dark">
          ← Back to Analytics
        </Link>
      </div>

      <div className="bg-white border border-borderGrey overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-ivory border-b border-borderGrey text-navy font-semibold">
              <tr>
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Email Address</th>
                <th className="p-3.5">Contact</th>
                <th className="p-3.5">Member Since</th>
                <th className="p-3.5">Orders Placed</th>
                <th className="p-3.5 text-right">Lifetime Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderGrey text-navy">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-mutedGrey">
                    Loading customer directory...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-mutedGrey">
                    No registered customers yet.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id} className="hover:bg-ivory/40">
                    <td className="p-3.5 font-bold">{c.name}</td>
                    <td className="p-3.5 text-mutedGrey">{c.email}</td>
                    <td className="p-3.5 text-mutedGrey">{c.phone || '—'}</td>
                    <td className="p-3.5 text-mutedGrey">
                      {new Date(c.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="p-3.5 font-semibold">{c.orderCount || 0} order(s)</td>
                    <td className="p-3.5 text-right font-bold text-navy">
                      {formatINR(c.totalSpent || 0)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
