import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../app/ToastContext.js';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (password.length < 8) {
      showToast('Password must be at least 8 characters with upper, lower, and numbers', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        token,
        password,
      });

      if (res.data.success) {
        showToast('Password reset successfully. You are now logged in.', 'success');
        localStorage.setItem('token', res.data.token);
        navigate('/account/profile');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Password reset failed or token expired', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white border border-borderGrey p-8 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-champagne font-semibold">
            Security Reset
          </span>
          <h1 className="font-serif text-2xl font-semibold text-navy">Set New Password</h1>
          <p className="text-xs text-mutedGrey">
            Create a robust password to safeguard your formalwear account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1">
              Reset Token
            </label>
            <input
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste token from email"
              className="w-full bg-ivory border border-borderGrey p-2.5 text-xs text-navy focus:outline-none focus:border-navy"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters (A-Z, a-z, 0-9)"
                className="w-full bg-ivory border border-borderGrey pl-9 pr-3 py-2.5 text-xs text-navy focus:outline-none focus:border-navy"
              />
              <Lock className="w-4 h-4 text-mutedGrey absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
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
            {loading ? 'Updating Password...' : 'Reset Password & Sign In'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="pt-4 border-t border-borderGrey text-center text-xs">
          <Link to="/login" className="text-mutedGrey hover:text-navy">
            Back to <span className="font-semibold text-navy">Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
