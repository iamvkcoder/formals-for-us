import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Package, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../app/AuthContext.js';

export const AdminInventoryPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      api.get('/admin/inventory/low-stock')
        .then((res) => {
          if (res.data.success) {
            setAlerts(res.data.data);
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
          <span className="text-[10px] uppercase tracking-widest text-amber-600 font-bold">
            Inventory Health Monitoring
          </span>
          <h1 className="font-serif text-3xl font-semibold text-navy">Low Stock Warnings (≤ 5 Units)</h1>
          <p className="text-xs text-mutedGrey mt-1">Real-time alerts for replenishment to prevent fulfillment delays</p>
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
                <th className="p-3.5">Garment Name</th>
                <th className="p-3.5">SKU Code</th>
                <th className="p-3.5">Size</th>
                <th className="p-3.5">Color</th>
                <th className="p-3.5">Current Stock</th>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderGrey text-navy">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-mutedGrey">
                    Scanning variant inventory...
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-successGreen font-medium">
                    All formalwear variants have healthy stock levels above 5 units.
                  </td>
                </tr>
              ) : (
                alerts.map((al, idx) => (
                  <tr key={idx} className="hover:bg-ivory/40">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={al.image}
                          alt={al.productName}
                          className="w-10 h-12 object-cover object-top border border-borderGrey shrink-0"
                        />
                        <span className="font-bold text-navy">{al.productName}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-mutedGrey">{al.sku}</td>
                    <td className="p-3.5 font-semibold">{al.size}</td>
                    <td className="p-3.5">{al.color}</td>
                    <td className="p-3.5 font-bold text-sm">
                      <span className={al.stock === 0 ? 'text-errorRed' : 'text-amber-700'}>
                        {al.stock} unit(s)
                      </span>
                    </td>
                    <td className="p-3.5">
                      {al.stock === 0 ? (
                        <span className="px-2 py-0.5 bg-red-100 text-errorRed font-bold rounded text-[10px] uppercase">
                          Depleted / Out of Stock
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded text-[10px] uppercase">
                          Low Stock
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <Link
                        to={`/product/${al.productSlug}`}
                        className="text-xs text-champagne-dark font-medium hover:underline"
                      >
                        Inspect Product
                      </Link>
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
