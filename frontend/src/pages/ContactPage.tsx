import React, { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { useToast } from '../app/ToastContext.js';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('Your message has been received by our concierge', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-12">
      <div className="text-center space-y-3 pb-8 border-b border-borderGrey">
        <span className="text-xs uppercase tracking-widest text-champagne font-semibold">
          Customer Concierge
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-navy">
          Contact FORMALS FOR US
        </h1>
        <p className="text-sm text-mutedGrey max-w-md mx-auto leading-relaxed">
          Questions regarding custom alterations, bulk executive orders, or delivery timing? We are here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Contact Info */}
        <div className="md:col-span-5 space-y-6">
          <div className="p-6 bg-white border border-borderGrey space-y-4 text-xs">
            <h3 className="font-serif text-base font-semibold text-navy pb-2 border-b border-borderGrey">
              Headquarters & Atelier
            </h3>
            <div className="flex items-start gap-3 text-mutedGrey">
              <MapPin className="w-4 h-4 text-champagne shrink-0 mt-0.5" />
              <span>
                FORMALS FOR US Atelier<br />
                Connaught Place, Barakhamba Road<br />
                New Delhi 110001, India
              </span>
            </div>
            <div className="flex items-center gap-3 text-mutedGrey">
              <Mail className="w-4 h-4 text-champagne shrink-0" />
              <span>concierge@formalsforus.com</span>
            </div>
            <div className="flex items-center gap-3 text-mutedGrey">
              <Phone className="w-4 h-4 text-champagne shrink-0" />
              <span>+91 11 4050 7890</span>
            </div>
          </div>

          <div className="p-6 bg-ivory border border-borderGrey space-y-2 text-xs">
            <h4 className="font-semibold text-navy uppercase tracking-wider">Concierge Hours</h4>
            <p className="text-mutedGrey">Monday to Saturday: 9:30 AM – 7:00 PM IST</p>
            <p className="text-mutedGrey">Sundays: 11:00 AM – 4:00 PM IST</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7 bg-white border border-borderGrey p-6 sm:p-8">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-successGreen mx-auto" />
              <h3 className="font-serif text-xl font-semibold text-navy">Message Received</h3>
              <p className="text-xs text-mutedGrey max-w-sm mx-auto leading-relaxed">
                Thank you, {name}. Our client experience team will respond to {email} within 4 business hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-navy font-semibold uppercase tracking-wider mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-ivory border border-borderGrey p-2.5 text-navy focus:outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="block text-navy font-semibold uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-ivory border border-borderGrey p-2.5 text-navy focus:outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="block text-navy font-semibold uppercase tracking-wider mb-1">
                  Subject / Inquiry
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Bulk Corporate Order / Size Inquiries"
                  className="w-full bg-ivory border border-borderGrey p-2.5 text-navy focus:outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="block text-navy font-semibold uppercase tracking-wider mb-1">
                  Detailed Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-ivory border border-borderGrey p-2.5 text-navy focus:outline-none focus:border-navy"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-navy text-white font-semibold uppercase tracking-widest text-xs hover:bg-navy-deep transition-colors shadow"
              >
                Send Inquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
