import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto px-4 py-28 text-center space-y-6">
      <div className="w-16 h-16 bg-ivory border border-borderGrey rounded-full flex items-center justify-center text-champagne mx-auto">
        <Compass className="w-8 h-8 stroke-1" />
      </div>
      <span className="text-xs uppercase tracking-widest text-champagne font-bold">
        Error 404 · Uncharted Route
      </span>
      <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-navy">
        The Garment You Seek Cannot Be Found
      </h1>
      <p className="text-xs text-mutedGrey max-w-sm mx-auto leading-relaxed">
        The page or tailored piece you requested may have moved to another collection or been archived.
      </p>
      <div className="pt-2 flex justify-center gap-4">
        <Link
          to="/"
          className="px-6 py-3 bg-navy text-white text-xs font-semibold uppercase tracking-wider hover:bg-navy-deep transition-colors"
        >
          Return Home
        </Link>
        <Link
          to="/shop"
          className="px-6 py-3 border border-navy text-navy text-xs font-semibold uppercase tracking-wider hover:bg-ivory transition-colors flex items-center gap-1.5"
        >
          Explore Catalog <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
