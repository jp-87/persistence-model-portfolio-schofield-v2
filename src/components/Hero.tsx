import React from 'react';

interface HeroProps {
  heroText: string;
}

export const Hero: React.FC<HeroProps> = ({ heroText }) => {
  return (
    <div
      data-section="overview"
      className="max-w-[1200px] mx-auto px-6 md:px-10 pt-4 pb-3.5 border-b border-[#e6e4dc]"
    >
      <p className="text-[13.5px] leading-[1.55] text-[#54564c] max-w-[92ch]">
        {heroText}
      </p>
      <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[12px] text-[#44453a]">
        <span className="px-2.5 py-1 rounded-[5px] bg-white/80 border border-[#dcdacf]">
          <strong className="text-[#0d4f30] font-bold">MCM</strong> ·{' '}
          <strong className="text-[#1b1c18] font-bold">
            Millbury College of Music
          </strong>
        </span>
        <span className="px-2.5 py-1 rounded-[5px] bg-white/80 border border-[#dcdacf]">
          <strong className="text-[#0d4f30] font-bold">MCC</strong> ·{' '}
          <strong className="text-[#1b1c18] font-bold">
            Millbury College Conservatory
          </strong>
        </span>
      </div>
    </div>
  );
};

