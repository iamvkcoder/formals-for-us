import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../app/AuthContext.js';
import { useToast } from '../app/ToastContext.js';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account/profile';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      showToast('Welcome back to FORMALS FOR US', 'success');
      navigate(redirect);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Invalid email or password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <div className="bg-white border border-borderGrey p-8 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-champagne font-semibold">
            Member Access
          </span>
          <h1 className="font-serif text-2xl font-semibold text-navy">Sign In to Your Account</h1>
          <p className="text-xs text-mutedGrey">
            Access your orders, saved measurements, and wishlist
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-ivory border border-borderGrey pl-9 pr-3 py-2.5 text-xs text-navy focus:outline-none focus:border-navy"
              />
              <Mail className="w-4 h-4 text-mutedGrey absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-navy uppercase tracking-wider">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-champagne-dark hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-ivory border border-borderGrey pl-9 pr-3 py-2.5 text-xs text-navy focus:outline-none focus:border-navy"
              />
              <Lock className="w-4 h-4 text-mutedGrey absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-navy text-white text-xs font-semibold uppercase tracking-widest hover:bg-navy-deep transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="pt-4 border-t border-borderGrey text-center text-xs text-mutedGrey space-y-2">
          <p>
            New to FORMALS FOR US?{' '}
            <Link to="/register" className="font-semibold text-navy hover:underline">
              Create an account
            </Link>
          </p>
          <div className="p-2.5 bg-ivory border border-borderGrey text-[11px] text-left leading-relaxed">
            <span className="font-semibold text-navy">Demo Credentials:</span><br />
            Customer: <code className="text-navy">arjun.mehta@example.com</code> / <code className="text-navy">Customer@12345</code><br />
            Admin: <code className="text-navy">admin@formalsforus.com</code> / <code className="text-navy">Admin@12345</code>
          </div>
        </div>
      </div>
    </div>
  );
};
