import React from 'react';
import { Award, Compass, ShieldCheck, Sparkles } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-12">
      <div className="text-center space-y-3 pb-8 border-b border-borderGrey">
        <span className="text-xs uppercase tracking-widest text-champagne font-semibold">
          The Atelier Ethos
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-navy">
          Crafting Sartorial Authority
        </h1>
        <p className="text-sm text-mutedGrey max-w-xl mx-auto leading-relaxed">
          FORMALS FOR US was founded to redefine formalwear in India: precision tailored silhouettes,
          natural breathable fabrics, and effortless sophistication.
        </p>
      </div>

      <div className="space-y-8 text-sm text-gray-700 leading-relaxed font-light">
        <p>
          In high-stakes boardrooms, critical investor pitches, interviews, and celebratory galas,
          what you wear communicates clarity of mind and quiet confidence. Yet for too long, professionals in
          India faced a stark compromise: exorbitantly priced imported suiting or mass-produced polyester-heavy garments
          unsuited to our climate.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
          <div className="p-6 bg-white border border-borderGrey space-y-3">
            <div className="p-2.5 bg-ivory border border-champagne text-champagne w-fit">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-navy">Pure Natural Weaves</h3>
            <p className="text-xs text-mutedGrey leading-relaxed">
              We exclusively source two-ply 100% Egyptian Giza Cotton (120s and 140s yarn counts) and Super 110s–120s
              Australian Merino Wool woven in heritage mills.
            </p>
          </div>

          <div className="p-6 bg-white border border-borderGrey space-y-3">
            <div className="p-2.5 bg-ivory border border-champagne text-champagne w-fit">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-navy">Engineered Proportions</h3>
            <p className="text-xs text-mutedGrey leading-relaxed">
              Each collar spread, sleeve pitch, high armhole, and trouser taper is calibrated for modern movement.
              Structured chest canvas molds naturally to your posture over time.
            </p>
          </div>
        </div>

        <p>
          Our manufacturing partners adhere to rigorous ethical labor benchmarks, zero-waste fabric recycling,
          and sustainable packaging. We believe great formalwear shouldn't just look exceptional — it should
          empower you to perform at your absolute peak.
        </p>
      </div>
    </div>
  );
};
