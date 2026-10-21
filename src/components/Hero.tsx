import React from 'react';

interface HeroProps {
  accent: string;
  paper: string;
  heroText: string;
  figTag: string;
  figSub: string;
  figAlt: string;
  stat1: string;
  stat3: string;
  stat4: string;
  ratio: string;
  markovPct: string;
  ladderPct: string;
  cov: string;
  wins: number;
  cells: number;
  onReadCaseStudy: () => void;
  repoUrl?: string;
  published?: boolean;
}

export const Hero: React.FC<HeroProps> = ({
  accent,
  paper,
  heroText,
  figTag,
  figSub,
  figAlt,
  stat1,
  stat3,
  stat4,
  ratio,
  markovPct,
  ladderPct,
  cov,
  wins,
  cells,
  onReadCaseStudy,
  repoUrl = 'https://github.com/jp-87/student-persistence-model',
  published = true,
}) => {
  return (
    <div
      data-section="overview"
      className="max-w-[1200px] mx-auto px-6 md:px-10 pt-16 pb-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1.04fr_0.96fr] gap-12 lg:gap-14 items-center">
        <div>
          <div
            className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[1.8px] uppercase"
            style={{ color: accent }}
          >
            <span
              className="w-4.5 h-[1.5px]"
              style={{ backgroundColor: accent }}
            />
            Enrollment Forecasting
          </div>

          <h1 className="font-serif font-normal text-[38px] md:text-[50px] leading-[1.06] tracking-[-0.6px] mt-4.5 text-[#1b1c18]">
            How many current students will still be enrolled in&nbsp;h&nbsp;terms?
          </h1>

          <p className="text-[16.5px] leading-[1.6] text-[#54564c] mt-5 max-w-[30em]">
            {heroText}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-7">
            <button
              onClick={onReadCaseStudy}
              className="cursor-pointer text-[13.5px] font-bold text-white px-5 py-3 rounded-[7px] shadow-xs hover:opacity-95 transition-opacity"
              style={{ backgroundColor: accent }}
            >
              Read the case study
            </button>

            {(published || repoUrl) && (
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13.5px] font-semibold text-[#3a3b34] bg-transparent hover:bg-black/5 px-5 py-3 rounded-[7px] border border-[#d8d6cc] transition-colors"
              >
                View on GitHub ↗
              </a>
            )}
          </div>
        </div>

        {/* HERO FIGURE: backtest cone */}
        <div
          className="border border-[#e3e1d9] rounded-[10px] p-4.5 pb-3 shadow-[0_14px_40px_-22px_rgba(20,30,20,0.4)]"
          style={{
            backgroundColor: `color-mix(in srgb, ${paper} 100%, #faf9f5)`,
          }}
        >
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-[11px] font-bold tracking-[0.6px] text-[#6f6d64]">
              {figTag}
            </span>
            <span className="text-[11px] text-[#9a988e]">{figSub}</span>
          </div>

          <div className="overflow-hidden rounded-[4px] bg-[#f2eee3] border border-[#eae6db]">
            <img
              src="figures/backtest_cone.png"
              alt={figAlt}
              className="w-full h-auto block"
            />
          </div>

          <div className="pt-2 px-1 pb-0.5 text-[11px] text-[#6f6d64] leading-[1.45]">
            Synthetic data (seed 42). Open circles are held-out actuals exported
            to <span className="font-mono">src/data/siteData.json</span>.
          </div>
        </div>
      </div>

      {/* STAT STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 mt-12 border-t border-b border-[#e6e4dc]">
        <div className="py-5 pr-6 border-b md:border-b-0 border-r border-[#e6e4dc]">
          <div
            className="text-[38px] font-extrabold tracking-tight leading-none"
            style={{ color: accent }}
          >
            {ratio}×
          </div>
          <div className="text-[12.5px] text-[#6f6d64] mt-2 leading-[1.4]">
            {stat1}
          </div>
        </div>

        <div className="py-5 px-6 border-b md:border-b-0 border-r-0 md:border-r border-[#e6e4dc]">
          <div className="text-[38px] font-extrabold tracking-tight text-[#1b1c18] leading-none">
            {markovPct}
            <span className="text-[21px]">%</span>
          </div>
          <div className="text-[12.5px] text-[#6f6d64] mt-2 leading-[1.4]">
            MAPE-total{' '}
            <span className="text-[#a9a79d]">· vs {ladderPct}% baseline</span>
          </div>
        </div>

        <div className="py-5 pr-6 md:px-6 border-r border-[#e6e4dc]">
          <div className="text-[38px] font-extrabold tracking-tight text-[#1b1c18] leading-none">
            {cov}
            <span className="text-[21px]">%</span>
          </div>
          <div className="text-[12.5px] text-[#6f6d64] mt-2 leading-[1.4]">
            {stat3}
          </div>
        </div>

        <div className="py-5 pl-6">
          <div className="text-[38px] font-extrabold tracking-tight text-[#1b1c18] leading-none">
            {wins}
            <span className="text-[21px] text-[#a9a79d]">/{cells}</span>
          </div>
          <div className="text-[12.5px] text-[#6f6d64] mt-2 leading-[1.4]">
            {stat4}
          </div>
        </div>
      </div>
    </div>
  );
};
