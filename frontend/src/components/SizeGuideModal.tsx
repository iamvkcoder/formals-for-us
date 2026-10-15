import React from 'react';
import { X, Ruler } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose, category = 'formal-shirts' }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white border border-borderGrey max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-borderGrey mb-6">
          <div className="flex items-center gap-3">
            <Ruler className="w-5 h-5 text-champagne" />
            <h3 className="font-serif text-xl font-semibold text-navy">
              Formal Tailoring & Size Standards
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close size guide"
            className="text-mutedGrey hover:text-navy p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 text-xs text-navy">
          <div>
            <h4 className="font-semibold uppercase tracking-wider text-mutedGrey mb-2">
              Formal Shirts Measurement (Inches)
            </h4>
            <div className="overflow-x-auto border border-borderGrey">
              <table className="w-full text-left border-collapse">
                <thead className="bg-ivory border-b border-borderGrey">
                  <tr>
                    <th className="p-2.5">Size</th>
                    <th className="p-2.5">Collar</th>
                    <th className="p-2.5">Chest</th>
                    <th className="p-2.5">Waist</th>
                    <th className="p-2.5">Sleeve</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderGrey">
                  <tr>
                    <td className="p-2.5 font-medium">38 (S)</td>
                    <td className="p-2.5">15.0"</td>
                    <td className="p-2.5">40.0"</td>
                    <td className="p-2.5">37.0"</td>
                    <td className="p-2.5">33.5"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">40 (M)</td>
                    <td className="p-2.5">15.7"</td>
                    <td className="p-2.5">42.0"</td>
                    <td className="p-2.5">39.0"</td>
                    <td className="p-2.5">34.0"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">42 (L)</td>
                    <td className="p-2.5">16.5"</td>
                    <td className="p-2.5">44.0"</td>
                    <td className="p-2.5">41.0"</td>
                    <td className="p-2.5">34.5"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">44 (XL)</td>
                    <td className="p-2.5">17.2"</td>
                    <td className="p-2.5">46.0"</td>
                    <td className="p-2.5">43.0"</td>
                    <td className="p-2.5">35.0"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="font-semibold uppercase tracking-wider text-mutedGrey mb-2">
              Formal Trousers & Suits Waist (Inches)
            </h4>
            <div className="overflow-x-auto border border-borderGrey">
              <table className="w-full text-left border-collapse">
                <thead className="bg-ivory border-b border-borderGrey">
                  <tr>
                    <th className="p-2.5">Waist Size</th>
                    <th className="p-2.5">Seat / Hip</th>
                    <th className="p-2.5">Thigh</th>
                    <th className="p-2.5">Finished Inseam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderGrey">
                  <tr>
                    <td className="p-2.5 font-medium">30</td>
                    <td className="p-2.5">38.0"</td>
                    <td className="p-2.5">24.0"</td>
                    <td className="p-2.5">32.0" (Unfinished hem option available)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">32</td>
                    <td className="p-2.5">40.0"</td>
                    <td className="p-2.5">25.0"</td>
                    <td className="p-2.5">32.5"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">34</td>
                    <td className="p-2.5">42.0"</td>
                    <td className="p-2.5">26.0"</td>
                    <td className="p-2.5">33.0"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">36</td>
                    <td className="p-2.5">44.0"</td>
                    <td className="p-2.5">27.0"</td>
                    <td className="p-2.5">33.5"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-ivory p-3.5 border border-borderGrey text-[11px] leading-relaxed text-mutedGrey">
            <span className="font-semibold text-navy">Fit Advice:</span> If you fall between sizes,
            we recommend sizing up for structured jackets and bespoke tailoring, or selecting your exact
            collar size for slim-fit pinpoint oxford shirts.
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-navy text-white text-xs font-semibold uppercase tracking-wider hover:bg-navy-deep transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
