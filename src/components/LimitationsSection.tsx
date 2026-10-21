import React from 'react';

interface LimitationsSectionProps {
  accent: string;
  limits: string[];
}

export const LimitationsSection: React.FC<LimitationsSectionProps> = ({
  accent,
  limits,
}) => {
  return (
    <section data-section="limits" className="scroll-mt-24">
      <div
        className="text-[11px] font-bold tracking-[1.6px] uppercase"
        style={{ color: accent }}
      >
        08, Limitations
      </div>

      <h2 className="font-serif font-normal text-[28px] md:text-[33px] leading-[1.12] tracking-[-0.4px] mt-3.5 text-[#1b1c18]">
        What this does not claim
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3.5 mt-5.5">
        {limits.map((limit, idx) => (
          <div key={idx} className="flex gap-3 items-baseline">
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0 -translate-y-0.5"
              style={{ backgroundColor: accent }}
            />
            <span className="text-[14px] leading-[1.6] text-[#44453a]">
              {limit}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
