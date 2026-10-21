import React from 'react';

interface ProblemSectionProps {
  accent: string;
  sectorText: string;
}

export const ProblemSection: React.FC<ProblemSectionProps> = ({
  accent,
  sectorText,
}) => {
  return (
    <section data-section="problem" className="scroll-mt-24">
      <div
        className="text-[11px] font-bold tracking-[1.6px] uppercase"
        style={{ color: accent }}
      >
        01, The problem
      </div>

      <h2 className="font-serif font-normal text-[28px] md:text-[33px] leading-[1.12] tracking-[-0.4px] mt-3.5 text-[#1b1c18]">
        Forecasting headcount and tuition revenue under uncertainty
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-8 md:gap-10 mt-5.5 items-start">
        <div>
          <p className="text-[15.5px] leading-[1.68] text-[#444538] m-0">
            Enrollment projections inform a university&apos;s budget, staffing, and
            discount strategy. The question underneath all of them:{' '}
            <em className="font-serif italic">
              how many of our current students will still be enrolled in h terms,
              by school and degree, and with what uncertainty?
            </em>
          </p>
          <p className="text-[15.5px] leading-[1.68] text-[#444538] mt-4">
            {sectorText}
          </p>
        </div>

        <div className="border border-[#e3e1d9] rounded-[10px] p-5 bg-white/70">
          <div className="font-serif italic text-[20px] md:text-[22px] leading-[1.35] text-[#1b1c18]">
            &ldquo;Persistence is estimated from the data; entering-class sizes
            are scenario assumptions, and the output labels the two
            separately.&rdquo;
          </div>
          <div className="text-[11.5px] text-[#6f6d64] mt-2.5 font-sans">
            Scope boundary · Existing cohorts vs. WICHE recruitment assumptions
          </div>
        </div>
      </div>
    </section>
  );
};
