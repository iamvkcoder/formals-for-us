import React, { useState } from 'react';
import { MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

export const PincodeChecker: React.FC = () => {
  const [pincode, setPincode] = useState('');
  const [result, setResult] = useState<{ serviceable: boolean; message: string; date?: string } | null>(null);

  const checkPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[1-9][0-9]{5}$/.test(pincode.trim())) {
      setResult({
        serviceable: false,
        message: 'Please enter a valid 6-digit Indian PIN code',
      });
      return;
    }

    // In India, delivery typically takes 2 to 5 business days
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + 4);
    const dateFormatted = estimatedDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    setResult({
      serviceable: true,
      message: `Delivery available by ${dateFormatted}. Express dispatch available.`,
      date: dateFormatted,
    });
  };

  return (
    <div className="border border-borderGrey p-4 bg-ivory">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-navy mb-2">
        <MapPin className="w-4 h-4 text-champagne" />
        <span>Check Delivery & Serviceability</span>
      </div>

      <form onSubmit={checkPincode} className="flex gap-2">
        <input
          type="text"
          maxLength={6}
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
          placeholder="Enter 6-digit PIN code (e.g. 110001)"
          className="flex-1 bg-white border border-borderGrey px-3 py-2 text-xs text-navy focus:outline-none focus:border-navy"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-navy text-white text-xs font-semibold uppercase tracking-wider hover:bg-navy-deep transition-colors"
        >
          Check
        </button>
      </form>

      {result && (
        <div className={`mt-3 flex items-start gap-2 text-xs ${result.serviceable ? 'text-successGreen' : 'text-errorRed'}`}>
          {result.serviceable ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{result.message}</span>
        </div>
      )}
    </div>
  );
};
