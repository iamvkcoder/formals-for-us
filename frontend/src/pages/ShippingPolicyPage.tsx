import React from 'react';
import { Truck, Clock, ShieldCheck, MapPin } from 'lucide-react';

export const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-10">
      <div className="pb-6 border-b border-borderGrey">
        <span className="text-xs uppercase tracking-widest text-champagne font-semibold">
          Logistics Standards
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-navy mt-1">
          Shipping & Delivery Policy
        </h1>
        <p className="text-xs text-mutedGrey mt-2">Effective date: January 2026 · Operations in India</p>
      </div>

      <div className="space-y-6 text-xs text-gray-700 leading-relaxed font-light">
        <div className="p-6 bg-white border border-borderGrey space-y-3">
          <h2 className="font-serif text-base font-semibold text-navy flex items-center gap-2">
            <Truck className="w-4 h-4 text-champagne" /> 1. Shipping Rates & Thresholds
          </h2>
          <p>
            We take pride in transparent delivery policies. All domestic orders exceeding <strong>₹1,999</strong> qualify
            for <strong>Complimentary Express Shipping</strong> across India. For orders below this threshold, a flat delivery
            fee of <strong>₹150</strong> is calculated automatically during checkout.
          </p>
        </div>

        <div className="p-6 bg-white border border-borderGrey space-y-3">
          <h2 className="font-serif text-base font-semibold text-navy flex items-center gap-2">
            <Clock className="w-4 h-4 text-champagne" /> 2. Processing & Dispatch Timelines
          </h2>
          <p>
            All in-stock garments undergo a secondary steam inspection and are packaged within 24 business hours from
            our New Delhi central fulfillment center. Consignments are handed to verified express courier partners
            including BlueDart, Delhivery, and DTDC.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-mutedGrey">
            <li><strong>Tier 1 Metros (Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata):</strong> 2–3 business days.</li>
            <li><strong>Tier 2 & Tier 3 Cities:</strong> 3–5 business days.</li>
            <li><strong>Remote & Hill Districts:</strong> 5–7 business days.</li>
          </ul>
        </div>

        <div className="p-6 bg-white border border-borderGrey space-y-3">
          <h2 className="font-serif text-base font-semibold text-navy flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-champagne" /> 3. Tamper-Proof Luxury Packaging
          </h2>
          <p>
            Suits, blazers, and crisp dress shirts are encased in breathable moisture-wicking garment bags inside
            reinforced crush-resistant corrugated exterior cartons to ensure garments arrive crease-free and ready to wear.
          </p>
        </div>
      </div>
    </div>
  );
};
