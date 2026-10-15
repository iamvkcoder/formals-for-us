import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../app/AuthContext.js';
import { useToast } from '../app/ToastContext.js';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      showToast('Password must be at least 8 characters with upper, lower, and numbers', 'error');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, phone);
      showToast('Account created successfully. Welcome to FORMALS FOR US!', 'success');
      navigate('/account/profile');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-20">
      <div className="bg-white border border-borderGrey p-8 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-champagne font-semibold">
            Join The Atelier
          </span>
          <h1 className="font-serif text-2xl font-semibold text-navy">Create Your Account</h1>
          <p className="text-xs text-mutedGrey">
            Enjoy priority order fulfillment, tailored size profiles & express checkout
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Arjun Mehta"
                className="w-full bg-ivory border border-borderGrey pl-9 pr-3 py-2.5 text-xs text-navy focus:outline-none focus:border-navy"
              />
              <User className="w-4 h-4 text-mutedGrey absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1">
              Corporate / Personal Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="arjun@example.com"
                className="w-full bg-ivory border border-borderGrey pl-9 pr-3 py-2.5 text-xs text-navy focus:outline-none focus:border-navy"
              />
              <Mail className="w-4 h-4 text-mutedGrey absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1">
              Mobile Number (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit mobile number"
                className="w-full bg-ivory border border-borderGrey pl-9 pr-3 py-2.5 text-xs text-navy focus:outline-none focus:border-navy"
              />
              <Phone className="w-4 h-4 text-mutedGrey absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1">
              Password
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-navy text-white text-xs font-semibold uppercase tracking-widest hover:bg-navy-deep transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow mt-2"
          >
            {loading ? 'Creating Member Profile...' : 'Complete Registration'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="pt-4 border-t border-borderGrey text-center text-xs text-mutedGrey">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-navy hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
