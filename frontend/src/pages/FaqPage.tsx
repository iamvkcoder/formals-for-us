import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FaqItem[] = [
  {
    category: 'Sizing & Fit',
    question: 'How do I determine my correct shirt collar and sleeve size?',
    answer: 'Measure around the base of your neck where the collar sits, inserting one finger for breathing room (e.g. 15.5 inches corresponds to Size 39–40). For sleeves, measure from the center-back of the neck across the shoulder down to the wrist bone. Refer to our interactive Size Guide on any product detail page.',
  },
  {
    category: 'Sizing & Fit',
    question: 'Are your trousers delivered with finished or unfinished hems?',
    answer: 'Our trousers come with standard tailored finished hems (32–33 inches inseam) with a generous 1.5-inch blind stitch hem allowance inside, allowing your local tailor to easily let down or take up length if desired.',
  },
  {
    category: 'Shipping & Delivery',
    question: 'What are the delivery charges and timelines across India?',
    answer: 'We provide complimentary Express Shipping on all orders over ₹1,999. For orders below ₹1,999, a flat shipping fee of ₹150 applies. Metro cities (Delhi NCR, Mumbai, Bengaluru) typically receive orders within 2–3 business days; all other pin codes receive delivery within 4–5 business days.',
  },
  {
    category: 'Returns & Exchanges',
    question: 'What is your 7-Day Doorstep Exchange & Return Policy?',
    answer: 'If the fit is not completely impeccable, initiate a return or exchange request directly from your My Orders page within 7 calendar days of delivery. Our logistics partner will collect the unworn garment with tags intact at no additional return shipping fee.',
  },
  {
    category: 'Payments',
    question: 'Is Cash on Delivery (COD) supported?',
    answer: 'Yes, Cash on Delivery is supported for over 18,000 Indian PIN codes. You may inspect the tamper-proof security seal and complete payment via cash or UPI to the delivery executive upon package handover.',
  },
  {
    category: 'Fabric & Care',
    question: 'How should I care for Italian Wool Blazers and Business Suits?',
    answer: 'We strongly recommend professional dry cleaning at specialized garment cleaners no more than 2–3 times per season. For everyday maintenance, hang garments on wide wooden wishbone hangers and use a natural bristle clothes brush or handheld steam iron.',
  },
];

export const FaqPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-10">
      <div className="text-center space-y-3 pb-8 border-b border-borderGrey">
        <span className="text-xs uppercase tracking-widest text-champagne font-semibold">
          Customer Clarity
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-navy">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-mutedGrey max-w-md mx-auto leading-relaxed">
          Everything you need to know about our tailoring standards, deliveries, exchanges, and fabric care.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white border border-borderGrey overflow-hidden">
            <button
              onClick={() => toggle(idx)}
              className="w-full p-5 text-left flex justify-between items-center gap-4 hover:bg-ivory transition-colors"
            >
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase tracking-wider text-champagne font-bold block">
                  {faq.category}
                </span>
                <span className="font-medium text-sm text-navy">{faq.question}</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-mutedGrey transition-transform duration-200 shrink-0 ${
                  openIndex === idx ? 'rotate-180 text-navy' : ''
                }`}
              />
            </button>
            {openIndex === idx && (
              <div className="px-5 pb-5 text-xs text-mutedGrey leading-relaxed border-t border-borderGrey/50 pt-3">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
