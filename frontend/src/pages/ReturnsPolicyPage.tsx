import React from 'react';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export const ReturnsPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-10">
      <div className="pb-6 border-b border-borderGrey">
        <span className="text-xs uppercase tracking-widest text-champagne font-semibold">
          Tailored Fit Confidence
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-navy mt-1">
          7-Day Returns & Exchange Policy
        </h1>
        <p className="text-xs text-mutedGrey mt-2">Guaranteed fit or complimentary exchange</p>
      </div>

      <div className="space-y-6 text-xs text-gray-700 leading-relaxed font-light">
        <div className="p-6 bg-white border border-borderGrey space-y-3">
          <h2 className="font-serif text-base font-semibold text-navy flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-champagne" /> 1. Overview
          </h2>
          <p>
            We recognize that formalwear requires precision fitting. If any garment does not meet your expectations,
            you can initiate an exchange or return request directly through the <strong>My Orders</strong> section within
            <strong> 7 calendar days</strong> from delivery.
          </p>
        </div>

        <div className="p-6 bg-white border border-borderGrey space-y-3">
          <h2 className="font-serif text-base font-semibold text-navy flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-champagne" /> 2. Eligibility Criteria
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-mutedGrey">
            <li>Garments must be unworn, unwashed, and free of stains, scents, or alterations.</li>
            <li>Original garment tags, spare button envelopes, and branded hanger/packaging must remain attached.</li>
            <li>Innerwear, customized monogrammed pieces, or altered garments are non-returnable.</li>
          </ul>
        </div>

        <div className="p-6 bg-white border border-borderGrey space-y-3">
          <h2 className="font-serif text-base font-semibold text-navy flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-champagne" /> 3. Doorstep Pickup & Refunds
          </h2>
          <p>
            Upon submitting a return request, our courier partner will arrive for pickup within 48–72 hours.
            Once inspected at our Delhi facility, approved refunds are credited back to your original payment method
            or bank account within 3–5 working days.
          </p>
        </div>
      </div>
    </div>
  );
};
