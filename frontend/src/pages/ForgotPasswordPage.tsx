import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../app/ToastContext.js';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      if (res.data.devResetToken) {
        setDevToken(res.data.devResetToken);
      }
      showToast(res.data.message || 'Reset link prepared', 'success');
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white border border-borderGrey p-8 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-champagne font-semibold">
            Security & Access
          </span>
          <h1 className="font-serif text-2xl font-semibold text-navy">Forgot Password</h1>
          <p className="text-xs text-mutedGrey">
            Enter your registered email and we'll dispatch password reset instructions.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 text-xs text-navy space-y-2">
              <div className="flex items-center gap-2 text-successGreen font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Instructions Dispatched</span>
              </div>
              <p className="text-mutedGrey leading-relaxed">
                If an account exists with <strong className="text-navy">{email}</strong>, you will receive instructions shortly.
              </p>
            </div>

            {devToken && (
              <div className="p-3 bg-ivory border border-champagne text-xs space-y-2">
                <p className="font-bold text-navy">Development Reset Link:</p>
                <Link
                  to={`/reset-password?token=${devToken}`}
                  className="block text-champagne-dark font-medium underline break-all text-[11px]"
                >
                  Proceed to Reset Password with Token
                </Link>
              </div>
            )}

            <Link
              to="/login"
              className="block w-full py-3 bg-navy text-white text-xs font-semibold uppercase tracking-wider text-center"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1">
                Registered Email
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-navy text-white text-xs font-semibold uppercase tracking-widest hover:bg-navy-deep transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow"
            >
              {loading ? 'Sending Instructions...' : 'Send Reset Instructions'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-borderGrey text-center text-xs">
          <Link to="/login" className="text-mutedGrey hover:text-navy">
            Remembered your password? <span className="font-semibold text-navy">Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
