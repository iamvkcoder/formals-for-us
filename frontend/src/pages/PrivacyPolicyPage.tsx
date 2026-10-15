import React from 'react';
import { ShieldCheck, Lock, Eye } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-10">
      <div className="pb-6 border-b border-borderGrey">
        <span className="text-xs uppercase tracking-widest text-champagne font-semibold">
          Data Governance
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-navy mt-1">
          Privacy Policy
        </h1>
        <p className="text-xs text-mutedGrey mt-2">Last updated: January 2026</p>
      </div>

      <div className="space-y-6 text-xs text-gray-700 leading-relaxed font-light">
        <div className="p-6 bg-white border border-borderGrey space-y-3">
          <h2 className="font-serif text-base font-semibold text-navy flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-champagne" /> 1. Commitment to Privacy
          </h2>
          <p>
            FORMALS FOR US respects the confidentiality of your personal, delivery, and measurement data.
            We do not sell, license, or disclose customer emails or phone numbers to third-party marketing brokers.
          </p>
        </div>

        <div className="p-6 bg-white border border-borderGrey space-y-3">
          <h2 className="font-serif text-base font-semibold text-navy flex items-center gap-2">
            <Lock className="w-4 h-4 text-champagne" /> 2. Security & Credentials
          </h2>
          <p>
            Customer passwords are cryptographically salted and hashed using industry-standard bcrypt algorithms.
            We never store plaintext card numbers, CVVs, or sensitive payment credentials on our database servers.
            All payment transactions are tokenized via PCI-DSS compliant payment gateways.
          </p>
        </div>

        <div className="p-6 bg-white border border-borderGrey space-y-3">
          <h2 className="font-serif text-base font-semibold text-navy flex items-center gap-2">
            <Eye className="w-4 h-4 text-champagne" /> 3. Data Retention & Customer Rights
          </h2>
          <p>
            Under the Information Technology Act of India and relevant privacy regulations, you have the right
            to inspect, update, or request permanent erasure of your account profile and saved addresses by
            contacting privacy@formalsforus.com.
          </p>
        </div>
      </div>
    </div>
  );
};
