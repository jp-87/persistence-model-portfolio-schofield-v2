import React from 'react';
import { SiteData } from '../data/types';

export interface HorizonBarItem {
  cx: number;
  label: string;
  mx: number;
  mBx: number;
  mY: number;
  mH: number;
  mLo: number;
  mHi: number;
  mTxt: number;
  mVal: string;
  lx: number;
  lBx: number;
  lY: number;
  lH: number;
  lLo: number;
  lHi: number;
  lTxt: number;
  lVal: string;
}

export interface CovBarItem {
  lx: number;
  lab: string;
  x: number;
  y: number;
  h: number;
  o: number;
}

export interface TableRowItem {
  k: string;
  exp: string;
  act: string;
  mape: string;
  cov: string;
  ape: string;
  apeColor: string;
}

interface BacktestSectionProps {
  accent: string;
  whiskerNote: string;
  nWin: number;
  metricLine: string;
  covTitle: string;
  covSub: string;
  target: string;
  horizonBars: HorizonBarItem[];
  covBars: CovBarItem[];
  tableTitle: string;
  tableCmd: string;
  tableRows: TableRowItem[];
  errNote: string;
  coverageByHorizon: SiteData['compare']['coverage']['by_horizon'];
  pooledCoverage: SiteData['compare']['coverage']['pooled'];
  effectiveSampleSize?: SiteData['ledger_summary']['effective_sample_size'];
  annotate?: boolean;
}

export const BacktestSection: React.FC<BacktestSectionProps> = ({
  accent,
  whiskerNote,
  nWin,
  metricLine,
  covTitle,
  covSub,
  target,
  horizonBars,
  covBars,
  tableTitle,
  tableCmd,
  tableRows,
  errNote,
  coverageByHorizon,
  pooledCoverage,
  effectiveSampleSize,
  annotate = true,
}) => {
  const p1 = (v: number) => (v * 100).toFixed(1) + '%';

  return (
    <section data-section="backtest" className="scroll-mt-24">
      <div
        className="text-[11px] font-bold tracking-[1.6px] uppercase"
        style={{ color: accent }}
      >
        03, Backtest
      </div>

      <h2 className="font-serif font-normal text-[28px] md:text-[33px] leading-[1.12] tracking-[-0.4px] mt-3.5 text-[#1b1c18]">
        Fit on truncated data, scored against held-out terms
      </h2>

      <p className="text-[15px] leading-[1.65] text-[#54564c] mt-3.5 max-w-[46em]">
        Truncate the synthetic data at an as-of term, project forward, and score
        against the held-out terms, existing students only, on both sides. The
        direction of the result against the baseline is asserted in{' '}
        <span className="font-serif italic">tests/test_baseline.py</span>.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 mt-6">
        {/* Error by Horizon */}
        <div className="md:col-span-2 border border-[#e3e1d9] rounded-[10px] p-4.5 md:p-5 bg-white/70">
          <div className="text-[13.5px] font-bold text-[#1b1c18]">
            Total error by horizon (synthetic data)
          </div>
          {annotate && (
            <div className="text-[11.5px] text-[#8a887e] mt-0.5">
              {whiskerNote}
            </div>
          )}

          <div className="overflow-x-auto">
            <svg
              viewBox="0 0 640 230"
              className="w-full min-w-[500px] h-auto mt-2.5"
              role="img"
              aria-label="Mean total error by horizon, this model versus chain-ladder, with min to max range"
            >
              <line
                x1="50"
                y1="190"
                x2="620"
                y2="190"
                stroke="#cdcbc1"
                strokeWidth="1.1"
              />

              {horizonBars.map((h, i) => (
                <g key={i}>
                  <line
                    x1={h.mx}
                    y1={h.mLo}
                    x2={h.mx}
                    y2={h.mHi}
                    stroke="#1b1c18"
                    strokeWidth="1.4"
                  />
                  <rect
                    x={h.mBx}
                    y={h.mY}
                    width="44"
                    height={h.mH}
                    rx="2"
                    fill={accent}
                  />

                  <line
                    x1={h.lx}
                    y1={h.lLo}
                    x2={h.lx}
                    y2={h.lHi}
                    stroke="#1b1c18"
                    strokeWidth="1.4"
                  />
                  <rect
                    x={h.lBx}
                    y={h.lY}
                    width="44"
                    height={h.lH}
                    rx="2"
                    fill="#b06a3a"
                  />

                  <text
                    x={h.cx}
                    y="210"
                    textAnchor="middle"
                    fontFamily="Open Sans, sans-serif"
                    fontSize="11"
                    fill="#6f6d64"
                  >
                    {h.label}
                  </text>
                  <text
                    x={h.mx}
                    y={h.mTxt}
                    textAnchor="middle"
                    fontFamily="Open Sans, sans-serif"
                    fontSize="10"
                    fill="#1b1c18"
                  >
                    {h.mVal}
                  </text>
                  <text
                    x={h.lx}
                    y={h.lTxt}
                    textAnchor="middle"
                    fontFamily="Open Sans, sans-serif"
                    fontSize="10"
                    fill="#1b1c18"
                  >
                    {h.lVal}
                  </text>
                </g>
              ))}

              <text
                x="620"
                y="16"
                textAnchor="end"
                fontFamily="Open Sans, sans-serif"
                fontSize="11"
                fill="#6f6d64"
              >
                <tspan fill={accent}>■</tspan> this model &nbsp;&nbsp;
                <tspan fill="#b06a3a">■</tspan> chain-ladder &nbsp;&nbsp;
                (whisker = min to max over {nWin} windows)
              </text>
            </svg>
          </div>

          <div className="text-[11px] text-[#6f6d64] pt-1.5">
            {metricLine} · synthetic rolling-origin backtest
          </div>
        </div>

        {/* Coverage Bars & Per-Horizon Wilson Table */}
        <div className="md:col-span-2 border border-[#e3e1d9] rounded-[10px] p-4.5 md:p-5 bg-white/70 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            <div className="text-[13.5px] font-bold text-[#1b1c18]">
              {covTitle} (synthetic)
            </div>
            {annotate && (
              <div className="text-[11.5px] text-[#8a887e] mt-0.5">
                {covSub}
              </div>
            )}

            <svg viewBox="0 0 320 180" className="w-full h-auto mt-2.5">
              <line
                x1="34"
                y1="158"
                x2="306"
                y2="158"
                stroke="#cdcbc1"
                strokeWidth="1.1"
              />
              <line
                x1="34"
                y1="46"
                x2="306"
                y2="46"
                stroke={accent}
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.55"
              />
              <text
                x="306"
                y="42"
                textAnchor="end"
                fontFamily="Open Sans, sans-serif"
                fontSize="10"
                fill={accent}
              >
                {target}
              </text>

              <g>
                {covBars.map((c, i) => (
                  <rect
                    key={i}
                    x={c.x}
                    y={c.y}
                    width="30"
                    height={c.h}
                    rx="2"
                    fill={accent}
                    opacity={c.o}
                  />
                ))}
              </g>

              <g
                fill="#9a988e"
                fontFamily="Open Sans, sans-serif"
                fontSize="10"
                textAnchor="middle"
              >
                {covBars.map((c, i) => (
                  <text key={i} x={c.lx} y="172">
                    {c.lab}
                  </text>
                ))}
              </g>
            </svg>
          </div>

          {/* Per-Horizon Wilson 95% Interval Table */}
          <div className="font-mono tabular-nums text-[12px]">
            <div className="text-[12.5px] font-bold text-[#1b1c18] font-sans mb-2">
              Empirical coverage across {nWin} windows (95% Wilson CI)
            </div>
            <div className="grid grid-cols-4 py-1.5 border-b border-[#1b1c18] text-[#6f6d64] font-bold text-[11px] font-sans">
              <span>horizon</span>
              <span className="text-right">covered/total</span>
              <span className="text-right">rate</span>
              <span className="text-right">95% Wilson CI</span>
            </div>
            {coverageByHorizon.map((row) => (
              <div
                key={row.k}
                className="grid grid-cols-4 py-1.5 border-b border-[#eeece4] items-center"
              >
                <span className="font-sans font-semibold text-[#1b1c18]">
                  +{row.k} term{row.k > 1 ? 's' : ''}
                </span>
                <span className="text-right text-[#54564c]">
                  {row.covered}/{row.total}
                </span>
                <span className="text-right font-semibold text-[#1b1c18]">
                  {p1(row.rate)}
                </span>
                <span className="text-right text-[#6f6d64]">
                  {p1(row.lo)}–{p1(row.hi)}
                </span>
              </div>
            ))}
            <div className="grid grid-cols-4 py-2 font-bold text-[#1b1c18] bg-[#f4f2ea]/60 px-1 rounded-b">
              <span className="font-sans">Pooled (N=80)</span>
              <span className="text-right">
                {pooledCoverage.covered}/{pooledCoverage.total}
              </span>
              <span className="text-right" style={{ color: accent }}>
                {p1(pooledCoverage.rate)}
              </span>
              <span className="text-right text-[#54564c]">
                {p1(pooledCoverage.lo)}–{p1(pooledCoverage.hi)}
              </span>
            </div>
            {effectiveSampleSize && (
              <div className="mt-2 pt-2 border-t border-[#e8e6dc] font-sans text-[11px] text-[#6f6d64] leading-[1.45]">
                <strong className="text-[#1b1c18]">
                  Autocorrelation &amp; Effective Sample Size (N_eff ≈{' '}
                  {effectiveSampleSize.effective_n}):
                </strong>{' '}
                Because rolling windows share overlapping cohorts and horizons
                +1..+4 are cumulative steps, effective independent checks are
                N_eff ≈ {effectiveSampleSize.effective_n} (adjusted 95% Wilson
                CI:{' '}
                <span className="font-mono font-semibold text-[#1b1c18]">
                  {p1(effectiveSampleSize.effective_lo)}–
                  {p1(effectiveSampleSize.effective_hi)}
                </span>
                ).
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABLE 1 */}
      <div className="mt-4.5 border border-[#e3e1d9] rounded-[10px] p-5 md:p-5.5 bg-white/70">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="text-[11px] font-bold tracking-[1.2px] text-[#8a887e] uppercase">
            {tableTitle} (synthetic)
          </div>
          <div className="text-[11px] text-[#a9a79d] font-mono bg-[#f4f2ea] px-2 py-0.5 rounded">
            {tableCmd}
          </div>
        </div>

        <div className="mt-3.5 font-mono text-[13px] md:text-[13.5px] overflow-x-auto">
          <div className="min-w-[540px]">
            <div className="grid grid-cols-6 py-2 border-b-2 border-[#1b1c18] text-[#6f6d64] font-bold text-[12px] font-sans">
              <span>steps ahead</span>
              <span className="text-right">expected</span>
              <span className="text-right">actual</span>
              <span className="text-right">seg MAPE</span>
              <span className="text-right">coverage</span>
              <span className="text-right">total APE</span>
            </div>

            {tableRows.map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-6 py-2.5 border-b border-[#eeece4] items-center"
              >
                <span className="font-bold text-[#1b1c18] font-sans">{r.k}</span>
                <span className="text-right text-[#54564c]">{r.exp}</span>
                <span className="text-right text-[#54564c]">{r.act}</span>
                <span className="text-right text-[#54564c]">{r.mape}</span>
                <span className="text-right text-[#54564c]">{r.cov}</span>
                <span
                  className="text-right font-bold"
                  style={{ color: r.apeColor }}
                >
                  {r.ape}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-[12px] italic font-serif text-[#8a887e] mt-3 leading-[1.5]">
          {errNote}
        </div>
      </div>
    </section>
  );
};
