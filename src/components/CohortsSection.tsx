import React, { useState } from 'react';
import { SiteData } from '../data/types';
import { InteractiveSplitPanel } from './InteractiveSplitPanel';
import { termToTermInt } from '../utils/calculator';

interface CohortsSectionProps {
  accent: string;
  siteData: SiteData;
}

type VintageFilter = 'all' | 'fall' | 'spring';
type VintageChartMode = 'ntr_variance' | 'heads_compare';
type AidViewFilter = 'tiers' | 'MCM' | 'MCC';

const MCC_DISCOUNT_TIERS = [
  {
    tier_id: 1,
    discount_description: 'No Award',
    discount_range: '< 15% Discount',
    school: 'MCC' as const,
    headcount: 148,
    gross_tuition: 25880,
    institutional_grant: 1180,
    comp_fee: 750,
    mean_ntr: 25450,
    discount_rate: 0.0456,
    first_year_retention: 0.849,
    exit_hazard: 0.151,
    retained_ntr: Math.round(148 * 0.849 * 25450),
    ntr_at_risk: 148 * 25450 - Math.round(148 * 0.849 * 25450),
  },
  {
    tier_id: 2,
    discount_description: 'Minimal Aid',
    discount_range: '15% – 35% Discount',
    school: 'MCC' as const,
    headcount: 112,
    gross_tuition: 25880,
    institutional_grant: 6510,
    comp_fee: 750,
    mean_ntr: 20120,
    discount_rate: 0.2515,
    first_year_retention: 0.858,
    exit_hazard: 0.142,
    retained_ntr: Math.round(112 * 0.858 * 20120),
    ntr_at_risk: 112 * 20120 - Math.round(112 * 0.858 * 20120),
  },
  {
    tier_id: 3,
    discount_description: 'Partial Aid',
    discount_range: '35% – 60% Discount',
    school: 'MCC' as const,
    headcount: 96,
    gross_tuition: 25880,
    institutional_grant: 12140,
    comp_fee: 750,
    mean_ntr: 14490,
    discount_rate: 0.4691,
    first_year_retention: 0.866,
    exit_hazard: 0.134,
    retained_ntr: Math.round(96 * 0.866 * 14490),
    ntr_at_risk: 96 * 14490 - Math.round(96 * 0.866 * 14490),
  },
  {
    tier_id: 4,
    discount_description: 'Substantial Aid',
    discount_range: '60% – 80% Discount',
    school: 'MCC' as const,
    headcount: 54,
    gross_tuition: 25880,
    institutional_grant: 17850,
    comp_fee: 750,
    mean_ntr: 8780,
    discount_rate: 0.6897,
    first_year_retention: 0.889,
    exit_hazard: 0.111,
    retained_ntr: Math.round(54 * 0.889 * 8780),
    ntr_at_risk: 54 * 8780 - Math.round(54 * 0.889 * 8780),
  },
  {
    tier_id: 5,
    discount_description: 'Near-Full Aid',
    discount_range: '>= 80% Discount',
    school: 'MCC' as const,
    headcount: 30,
    gross_tuition: 25880,
    institutional_grant: 23290,
    comp_fee: 750,
    mean_ntr: 3340,
    discount_rate: 0.8999,
    first_year_retention: 0.915,
    exit_hazard: 0.085,
    retained_ntr: Math.round(30 * 0.915 * 3340),
    ntr_at_risk: 30 * 3340 - Math.round(30 * 0.915 * 3340),
  },
];

export const CohortsSection: React.FC<CohortsSectionProps> = ({
  accent,
  siteData,
}) => {
  const vintage = [...siteData.vintage].sort(
    (a, b) => termToTermInt(a.cohort) - termToTermInt(b.cohort)
  );
  const mcmTiers = siteData.discount_tiers || [];

  // Card 1 State: Entering Class Performance & NTR Drivers
  const [vintageFilter, setVintageFilter] = useState<VintageFilter>('all');
  const [vintageChartMode, setVintageChartMode] =
    useState<VintageChartMode>('ntr_variance');
  const [selectedCohortCode, setSelectedCohortCode] =
    useState<string>('2023FA');

  // Card 2 State: Retained vs. At-Risk NTR by Tuition Discount Tier
  const [aidViewFilter, setAidViewFilter] = useState<AidViewFilter>('tiers');
  const [selectedTierIdx, setSelectedTierIdx] = useState<number>(0);

  const filteredVintage = vintage.filter((v) => {
    if (vintageFilter === 'fall') return v.cohort.endsWith('FA');
    if (vintageFilter === 'spring') return v.cohort.endsWith('SP');
    return true;
  });

  const activeVintage =
    filteredVintage.find((v) => v.cohort === selectedCohortCode) ||
    filteredVintage[0] ||
    vintage[0];

  const totalEntrants = filteredVintage.reduce((s, v) => s + v.entrants, 0);
  const totalActualHeads = filteredVintage.reduce(
    (s, v) => s + Math.round(v.actual_heads),
    0
  );
  const totalExpectedHeads = filteredVintage.reduce(
    (s, v) => s + Math.round(v.expected_heads),
    0
  );
  const totalRateAlphaHeads = filteredVintage.reduce(
    (s, v) => s + v.rate_alpha_heads,
    0
  );
  const totalMixAlphaHeads = filteredVintage.reduce(
    (s, v) => s + v.mix_alpha_heads,
    0
  );
  const totalAlphaNtrM = filteredVintage.reduce(
    (s, v) => s + v.total_alpha_ntr_m,
    0
  );

  // Build rows for Card 2:
  // - 'tiers': Combined institution-wide 5 RStudio tuition discount tiers (MCM + MCC = 1,907 students)
  // - 'MCM': MCM 5 RStudio tuition discount tiers (1,467 students)
  // - 'MCC': MCC 5 RStudio tuition discount tiers (440 students)
  const combinedTiers = mcmTiers.map((m, idx) => {
    const c = MCC_DISCOUNT_TIERS[idx];
    if (!c) return m;
    const heads = m.headcount + c.headcount;
    const retained = m.retained_ntr + c.retained_ntr;
    const risk = m.ntr_at_risk + c.ntr_at_risk;
    const totalNtr = retained + risk;
    const meanNtr = heads > 0 ? Math.round(totalNtr / heads) : m.mean_ntr;
    const exitHazard =
      heads > 0
        ? (m.headcount * m.exit_hazard + c.headcount * c.exit_hazard) / heads
        : m.exit_hazard;
    return {
      ...m,
      headcount: heads,
      mean_ntr: meanNtr,
      first_year_retention: 1 - exitHazard,
      exit_hazard: exitHazard,
      retained_ntr: retained,
      ntr_at_risk: risk,
    };
  });

  const tierRows =
    aidViewFilter === 'tiers'
      ? combinedTiers
      : aidViewFilter === 'MCM'
      ? mcmTiers
      : MCC_DISCOUNT_TIERS;

  const safeTierIdx = Math.min(
    Math.max(0, selectedTierIdx),
    Math.max(0, tierRows.length - 1)
  );
  const activeTier = tierRows[safeTierIdx] || mcmTiers[0];

  const totalTierHeads = tierRows.reduce((s, r) => s + r.headcount, 0);
  const totalRetainedNtrUsd = tierRows.reduce((s, r) => s + r.retained_ntr, 0);
  const totalRiskNtrUsd = tierRows.reduce((s, r) => s + r.ntr_at_risk, 0);
  const weightedExitHazard =
    totalTierHeads > 0
      ? tierRows.reduce((s, r) => s + r.headcount * r.exit_hazard, 0) /
        totalTierHeads
      : 0;
  const weightedMeanNtr =
    totalTierHeads > 0
      ? Math.round((totalRetainedNtrUsd + totalRiskNtrUsd) / totalTierHeads)
      : 0;

  const moneyM = (v: number) => '$' + (v / 1e6).toFixed(2) + 'M';
  const signedHeads = (v: number) =>
    (v >= 0 ? '+' : '−') + Math.abs(Math.round(v)).toString();
  const signedMoneyM = (v: number) =>
    (v >= 0 ? '+$' : '−$') + Math.abs(v).toFixed(2) + 'M';

  const maxTierBarM = Math.max(
    4,
    Math.ceil(
      Math.max(
        ...tierRows.map((r) => (r.retained_ntr + r.ntr_at_risk) / 1e6)
      ) * 1.15
    )
  );

  return (
    <section data-section="cohorts" className="scroll-mt-20">
      <div
        className="text-[10.5px] font-bold tracking-[1.6px] uppercase"
        style={{ color: accent }}
      >
        05 · Cohort Performance &amp; Tuition Discount Tier Exposure
      </div>

      <h2 className="font-serif font-normal text-[24px] md:text-[28px] leading-[1.15] tracking-[-0.3px] mt-1.5 text-[#1b1c18]">
        Entering class performance and Net Tuition Revenue at risk
      </h2>

      <p className="text-[13.5px] leading-[1.55] text-[#54564c] mt-1.5 max-w-[68ch]">
        Tracks whether recent MCM entering classes are returning above or below
        post-COVID expectations through 2025FA and compares{' '}
        <strong>Retained NTR</strong> vs. <strong>First-Year NTR at Risk</strong>{' '}
        across the five institutional tuition discount tiers.
      </p>

      {/* INTERACTIVE CARD 1: ENTERING CLASS PERFORMANCE & NTR DRIVERS */}
      <InteractiveSplitPanel
        controls={
          <>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {(
                [
                  { id: 'all', label: `All Classes (${vintage.length})` },
                  { id: 'fall', label: 'Fall Starters (4)' },
                  { id: 'spring', label: 'Spring Starters (3)' },
                ] as { id: VintageFilter; label: string }[]
              ).map((f) => {
                const on = vintageFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setVintageFilter(f.id)}
                    className="cursor-pointer text-[12px] font-bold px-3 py-1.5 rounded-[6px] border transition-all duration-150"
                    style={{
                      backgroundColor: on ? accent : '#faf8f2',
                      color: on ? '#fff' : '#44453a',
                      borderColor: on ? accent : '#d8d6cc',
                    }}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            <div className="font-serif text-[13.5px] italic text-[#54564c] leading-[1.45]">
              Decomposes each MCM entering cohort&apos;s cumulative NTR variance
              through 2025FA into continuation volume (
              <strong>Rate = Actual − Exp</strong> terms) and discount-tier mix
              expressed in benchmark term equivalents (<strong>Mix Eq.</strong>{' '}
              at $19,025/term).
            </div>
          </>
        }
        kpiStrip={
          <>
            <div>
              <div className="text-[10.5px] text-[#6f6d64] font-bold uppercase tracking-[0.5px]">
                Actual vs. Expected Terms
              </div>
              <div className="text-[22px] font-extrabold tracking-tight text-[#1b1c18] mt-0.5 leading-none font-mono tabular-nums">
                {totalActualHeads.toLocaleString('en-US')}
                <span className="text-[12px] font-normal text-[#8a887e] ml-1">
                  / {totalExpectedHeads.toLocaleString('en-US')} exp
                </span>
              </div>
              <div className="text-[11px] font-mono tabular-nums text-[#6f6d64] mt-1">
                Net difference:{' '}
                {signedHeads(totalActualHeads - totalExpectedHeads)} terms
              </div>
            </div>

            <div>
              <div className="text-[10.5px] text-[#6f6d64] font-bold uppercase tracking-[0.5px]">
                Cumulative NTR Variance
              </div>
              <div
                className="text-[22px] font-extrabold tracking-tight mt-0.5 leading-none font-mono tabular-nums"
                style={{
                  color: totalAlphaNtrM >= 0 ? accent : '#b06a3a',
                }}
              >
                {signedMoneyM(totalAlphaNtrM)}
              </div>
              <div className="text-[11px] font-mono tabular-nums text-[#6f6d64] mt-1">
                Across {filteredVintage.length} post-COVID MCM classes
              </div>
            </div>
          </>
        }
        summaryTable={
          <>
            <div className="flex items-center justify-between text-[10.5px] font-sans text-[#6f6d64] mb-1.5">
              <span className="font-bold uppercase tracking-[0.5px]">
                MCM Class Performance through 2025FA (Click row)
              </span>
              <span>(Rate + Mix Eq.) × $19,025</span>
            </div>
            <div className="grid grid-cols-[52px_0.75fr_0.9fr_0.9fr_0.85fr_0.85fr_1fr] gap-1 text-[#8a887e] font-sans font-bold text-[10.5px] pb-1 border-b border-[#e3e1d9]">
              <span>Class</span>
              <span className="text-right">Start</span>
              <span className="text-right">Actual</span>
              <span className="text-right">Exp</span>
              <span
                className="text-right"
                title="Continuation Rate Variance (Actual minus Expected student-terms)"
              >
                Rate
              </span>
              <span
                className="text-right"
                title="Discount-Tier Mix Variance in student-term equivalents (at $19,025/term)"
              >
                Mix Eq
              </span>
              <span className="text-right">NTR Diff</span>
            </div>
            {filteredVintage.map((v) => {
              const isSelected = activeVintage?.cohort === v.cohort;
              const pos = v.total_alpha_ntr_m >= 0;
              return (
                <button
                  key={v.cohort}
                  type="button"
                  onClick={() => setSelectedCohortCode(v.cohort)}
                  onMouseEnter={() => setSelectedCohortCode(v.cohort)}
                  className="w-full text-left grid grid-cols-[52px_0.75fr_0.9fr_0.9fr_0.85fr_0.85fr_1fr] gap-1 py-1.5 px-1.5 rounded-[4px] border-b border-[#f4f2ea] transition-colors cursor-pointer"
                  style={{
                    backgroundColor: isSelected
                      ? `color-mix(in srgb, ${accent} 10%, #fff)`
                      : 'transparent',
                  }}
                >
                  <span
                    className="font-sans font-bold"
                    style={{ color: isSelected ? accent : '#1b1c18' }}
                  >
                    {v.cohort}
                  </span>
                  <span className="text-right text-[#54564c]">
                    {v.entrants.toLocaleString('en-US')}
                  </span>
                  <span className="text-right font-semibold text-[#1b1c18]">
                    {Math.round(v.actual_heads).toLocaleString('en-US')}
                  </span>
                  <span className="text-right text-[#6f6d64]">
                    {Math.round(v.expected_heads).toLocaleString('en-US')}
                  </span>
                  <span className="text-right text-[#54564c]">
                    {signedHeads(v.rate_alpha_heads)}
                  </span>
                  <span className="text-right text-[#6f6d64]">
                    {signedHeads(v.mix_alpha_heads)}
                  </span>
                  <span
                    className="text-right font-bold"
                    style={{ color: pos ? accent : '#b06a3a' }}
                  >
                    {signedMoneyM(v.total_alpha_ntr_m)}
                  </span>
                </button>
              );
            })}
            {/* Total Row */}
            <div className="grid grid-cols-[52px_0.75fr_0.9fr_0.9fr_0.85fr_0.85fr_1fr] gap-1 py-1.5 px-1.5 border-t border-[#d5d2c6] font-bold text-[#1b1c18] bg-[#faf8f2]/80">
              <span className="font-sans">Total</span>
              <span className="text-right text-[#6f6d64]">
                {totalEntrants.toLocaleString('en-US')}
              </span>
              <span className="text-right">
                {totalActualHeads.toLocaleString('en-US')}
              </span>
              <span className="text-right text-[#6f6d64]">
                {totalExpectedHeads.toLocaleString('en-US')}
              </span>
              <span className="text-right text-[#54564c]">
                {signedHeads(totalRateAlphaHeads)}
              </span>
              <span className="text-right text-[#6f6d64]">
                {signedHeads(totalMixAlphaHeads)}
              </span>
              <span
                className="text-right"
                style={{ color: totalAlphaNtrM >= 0 ? accent : '#b06a3a' }}
              >
                {signedMoneyM(totalAlphaNtrM)}
              </span>
            </div>
          </>
        }
        chartTitle={
          vintageChartMode === 'ntr_variance'
            ? 'Drivers of Net Tuition Revenue Variance by Class ($M)'
            : 'Actual vs. Expected Student-Terms by Entering Class'
        }
        chartHeaderRight={
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setVintageChartMode('ntr_variance')}
              className="cursor-pointer font-sans text-[10.5px] font-bold px-2 py-0.5 rounded border transition-colors"
              style={{
                backgroundColor:
                  vintageChartMode === 'ntr_variance' ? accent : '#faf8f2',
                color:
                  vintageChartMode === 'ntr_variance' ? '#fff' : '#54564c',
                borderColor:
                  vintageChartMode === 'ntr_variance' ? accent : '#d8d6cc',
              }}
            >
              NTR Variance ($M)
            </button>
            <button
              type="button"
              onClick={() => setVintageChartMode('heads_compare')}
              className="cursor-pointer font-sans text-[10.5px] font-bold px-2 py-0.5 rounded border transition-colors"
              style={{
                backgroundColor:
                  vintageChartMode === 'heads_compare' ? accent : '#faf8f2',
                color:
                  vintageChartMode === 'heads_compare' ? '#fff' : '#54564c',
                borderColor:
                  vintageChartMode === 'heads_compare' ? accent : '#d8d6cc',
              }}
            >
              Actual vs. Expected
            </button>
          </div>
        }
        svgChart={
          vintageChartMode === 'ntr_variance' ? (
            <svg
              viewBox="0 0 420 240"
              className="w-full h-auto select-none"
              role="img"
              aria-label="Net Tuition Revenue variance by entering class"
            >
              <g stroke="#ecebe3" strokeWidth="1">
                <line x1="48" y1="36" x2="404" y2="36" />
                <line x1="48" y1="76" x2="404" y2="76" />
                <line x1="48" y1="156" x2="404" y2="156" />
                <line x1="48" y1="196" x2="404" y2="196" />
              </g>
              <line
                x1="48"
                y1="20"
                x2="48"
                y2="196"
                stroke="#cdcbc1"
                strokeWidth="1.1"
              />
              <line
                x1="48"
                y1="116"
                x2="404"
                y2="116"
                stroke="#1b1c18"
                strokeWidth="1.2"
              />

              <g
                fill="#8a887e"
                fontFamily="Open Sans, sans-serif"
                fontSize="10.5"
                textAnchor="end"
              >
                <text x="42" y="40">
                  +$4.2M
                </text>
                <text x="42" y="80">
                  +$2.1M
                </text>
                <text x="42" y="120">
                  $0.0M
                </text>
                <text x="42" y="160">
                  −$2.1M
                </text>
                <text x="42" y="200">
                  −$4.2M
                </text>
              </g>

              {filteredVintage.map((v, idx) => {
                const count = Math.max(1, filteredVintage.length);
                const slotW = 344 / count;
                const barW = Math.min(34, slotW * 0.62);
                const xCenter = 56 + idx * slotW + slotW / 2;
                const xLeft = xCenter - barW / 2;
                const isSel = activeVintage?.cohort === v.cohort;
                const val = v.total_alpha_ntr_m;
                const pos = val >= 0;
                const barH = Math.min(78, (Math.abs(val) / 4.2) * 80);
                const yTop = pos ? 116 - barH : 116;

                return (
                  <g
                    key={v.cohort}
                    className="cursor-pointer"
                    onClick={() => setSelectedCohortCode(v.cohort)}
                    onMouseEnter={() => setSelectedCohortCode(v.cohort)}
                  >
                    {isSel && (
                      <rect
                        x={xLeft - 5}
                        y="24"
                        width={barW + 10}
                        height="172"
                        rx="4"
                        fill={pos ? accent : '#b06a3a'}
                        opacity="0.08"
                      />
                    )}
                    <rect
                      x={xLeft}
                      y={yTop}
                      width={barW}
                      height={Math.max(2, barH)}
                      rx="2"
                      fill={pos ? accent : '#b06a3a'}
                      opacity={isSel ? 1 : 0.78}
                    />
                    <text
                      x={xCenter}
                      y={
                        pos
                          ? Math.max(16, yTop - 5)
                          : Math.min(206, yTop + barH + 11)
                      }
                      textAnchor="middle"
                      fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                      fontSize="9.5"
                      fontWeight={isSel ? '700' : '600'}
                      fill={pos ? accent : '#b06a3a'}
                    >
                      {val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                    </text>
                    <text
                      x={xCenter}
                      y="218"
                      textAnchor="middle"
                      fontFamily="Open Sans, sans-serif"
                      fontSize="10"
                      fontWeight={isSel ? '700' : '400'}
                      fill={isSel ? '#1b1c18' : '#8a887e'}
                    >
                      {v.cohort}
                    </text>
                  </g>
                );
              })}
            </svg>
          ) : (
            <svg
              viewBox="0 0 420 240"
              className="w-full h-auto select-none"
              role="img"
              aria-label="Actual versus expected student-terms by entering class"
            >
              <g stroke="#ecebe3" strokeWidth="1">
                <line x1="48" y1="34" x2="404" y2="34" />
                <line x1="48" y1="115" x2="404" y2="115" />
                <line x1="48" y1="196" x2="404" y2="196" />
              </g>
              <line
                x1="48"
                y1="20"
                x2="48"
                y2="196"
                stroke="#cdcbc1"
                strokeWidth="1.1"
              />
              <line
                x1="48"
                y1="196"
                x2="404"
                y2="196"
                stroke="#cdcbc1"
                strokeWidth="1.1"
              />
              <g
                fill="#8a887e"
                fontFamily="Open Sans, sans-serif"
                fontSize="10.5"
                textAnchor="end"
              >
                <text x="42" y="38">
                  10,000
                </text>
                <text x="42" y="119">
                  5,000
                </text>
                <text x="42" y="200">
                  0
                </text>
              </g>

              {filteredVintage.map((v, idx) => {
                const count = Math.max(1, filteredVintage.length);
                const slotW = 344 / count;
                const pairW = Math.min(34, slotW * 0.68);
                const halfW = pairW / 2 - 1;
                const xCenter = 56 + idx * slotW + slotW / 2;
                const isSel = activeVintage?.cohort === v.cohort;

                const hAct = (v.actual_heads / 10000) * 162;
                const hExp = (v.expected_heads / 10000) * 162;

                return (
                  <g
                    key={v.cohort}
                    className="cursor-pointer"
                    onClick={() => setSelectedCohortCode(v.cohort)}
                    onMouseEnter={() => setSelectedCohortCode(v.cohort)}
                  >
                    {isSel && (
                      <rect
                        x={xCenter - pairW / 2 - 4}
                        y="24"
                        width={pairW + 8}
                        height="172"
                        rx="4"
                        fill={accent}
                        opacity="0.07"
                      />
                    )}
                    <rect
                      x={xCenter - pairW / 2}
                      y={196 - hExp}
                      width={halfW}
                      height={Math.max(2, hExp)}
                      fill="#c8c6bc"
                    />
                    <rect
                      x={xCenter + 1}
                      y={196 - hAct}
                      width={halfW}
                      height={Math.max(2, hAct)}
                      fill={v.total_alpha_ntr_m >= 0 ? accent : '#b06a3a'}
                    />
                    <text
                      x={xCenter}
                      y="218"
                      textAnchor="middle"
                      fontFamily="Open Sans, sans-serif"
                      fontSize="10"
                      fontWeight={isSel ? '700' : '400'}
                      fill={isSel ? '#1b1c18' : '#8a887e'}
                    >
                      {v.cohort}
                    </text>
                  </g>
                );
              })}
            </svg>
          )
        }
        chartLegend={
          <>
            <span className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-[2px] inline-block"
                style={{ backgroundColor: accent }}
              />
              Above benchmark (+NTR)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-[2px] bg-[#b06a3a] inline-block" />
              Below benchmark (−NTR)
            </span>
          </>
        }
        chartFooterRight={
          activeVintage ? (
            <>
              <strong>{activeVintage.cohort}</strong> (
              {activeVintage.terms_scored} terms): (Rate{' '}
              {signedHeads(activeVintage.rate_alpha_heads)} + Mix Eq{' '}
              {signedHeads(activeVintage.mix_alpha_heads)}) × $19,025 ={' '}
              <strong
                style={{
                  color:
                    activeVintage.total_alpha_ntr_m >= 0 ? accent : '#b06a3a',
                }}
              >
                {signedMoneyM(activeVintage.total_alpha_ntr_m)}
              </strong>
            </>
          ) : undefined
        }
      />

      {/* INTERACTIVE CARD 2: RETAINED VS. AT-RISK NTR BY TUITION DISCOUNT TIER */}
      <InteractiveSplitPanel
        className="mt-4"
        controls={
          <>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {(
                [
                  {
                    id: 'tiers',
                    label: 'Combined (MCM + MCC · 5 Tiers)',
                  },
                  { id: 'MCM', label: 'MCM · Millbury College of Music' },
                  { id: 'MCC', label: 'MCC · Millbury College Conservatory' },
                ] as { id: AidViewFilter; label: string }[]
              ).map((f) => {
                const on = aidViewFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setAidViewFilter(f.id);
                      setSelectedTierIdx(0);
                    }}
                    className="cursor-pointer text-[12px] font-bold px-3 py-1.5 rounded-[6px] border transition-all duration-150"
                    style={{
                      backgroundColor: on ? accent : '#faf8f2',
                      color: on ? '#fff' : '#44453a',
                      borderColor: on ? accent : '#d8d6cc',
                    }}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            <div className="font-serif text-[13.5px] italic text-[#54564c] leading-[1.45]">
              Compares <strong>Retained NTR</strong> (returning students × NTR /
              student) against <strong>First-Year NTR at Risk</strong> (departing
              students × NTR / student) across tuition discount tiers.
            </div>
          </>
        }
        kpiStrip={
          <>
            <div>
              <div className="text-[10.5px] text-[#6f6d64] font-bold uppercase tracking-[0.5px]">
                Retained Next-Year NTR
              </div>
              <div
                className="text-[22px] font-extrabold tracking-tight mt-0.5 leading-none font-mono tabular-nums"
                style={{ color: accent }}
              >
                {moneyM(totalRetainedNtrUsd)}
              </div>
              <div className="text-[11px] font-mono tabular-nums text-[#6f6d64] mt-1">
                {totalTierHeads.toLocaleString('en-US')} students ·{' '}
                {((1 - weightedExitHazard) * 100).toFixed(1)}% retained
              </div>
            </div>

            <div>
              <div className="text-[10.5px] text-[#6f6d64] font-bold uppercase tracking-[0.5px]">
                First-Year NTR at Risk
              </div>
              <div className="text-[22px] font-extrabold tracking-tight mt-0.5 leading-none font-mono tabular-nums text-[#b06a3a]">
                {moneyM(totalRiskNtrUsd)}
              </div>
              <div className="text-[11px] font-mono tabular-nums text-[#6f6d64] mt-1">
                Mean attrition rate: {(weightedExitHazard * 100).toFixed(1)}%
              </div>
            </div>
          </>
        }
        summaryTable={
          <>
            <div className="flex items-center justify-between text-[10.5px] font-sans text-[#6f6d64] mb-1.5">
              <span className="font-bold uppercase tracking-[0.5px]">
                Tuition Discount Tiers (Click row to inspect)
              </span>
              <span>Retained vs. At-Risk NTR</span>
            </div>
            <div className="grid grid-cols-[1.4fr_0.65fr_0.75fr_0.85fr_0.9fr_0.85fr] gap-1 text-[#8a887e] font-sans font-bold text-[10.5px] pb-1 border-b border-[#e3e1d9]">
              <span>Discount Tier</span>
              <span className="text-right">Heads</span>
              <span className="text-right">Leave %</span>
              <span className="text-right">NTR/St</span>
              <span className="text-right">Retained</span>
              <span className="text-right">At Risk</span>
            </div>
            {tierRows.map((r, idx) => {
              const isSelected = idx === safeTierIdx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedTierIdx(idx)}
                  onMouseEnter={() => setSelectedTierIdx(idx)}
                  className="w-full text-left grid grid-cols-[1.4fr_0.65fr_0.75fr_0.85fr_0.9fr_0.85fr] gap-1 py-1.5 px-1.5 rounded-[4px] border-b border-[#f4f2ea] transition-colors cursor-pointer"
                  style={{
                    backgroundColor: isSelected
                      ? `color-mix(in srgb, ${accent} 10%, #fff)`
                      : 'transparent',
                  }}
                >
                  <span
                    className="font-sans text-[11px] font-semibold truncate"
                    style={{ color: isSelected ? accent : '#1b1c18' }}
                    title={`${r.discount_description} (${r.discount_range})`}
                  >
                    {r.discount_description}{' '}
                    <span className="text-[#8a887e] font-normal">
                      ({r.discount_range})
                    </span>
                  </span>
                  <span className="text-right text-[#54564c]">
                    {r.headcount}
                  </span>
                  <span className="text-right text-[#b06a3a] font-semibold">
                    {(r.exit_hazard * 100).toFixed(1)}%
                  </span>
                  <span className="text-right text-[#6f6d64]">
                    ${Math.round(r.mean_ntr).toLocaleString('en-US')}
                  </span>
                  <span
                    className="text-right font-semibold"
                    style={{ color: accent }}
                  >
                    {moneyM(r.retained_ntr)}
                  </span>
                  <span className="text-right font-bold text-[#b06a3a]">
                    {moneyM(r.ntr_at_risk)}
                  </span>
                </button>
              );
            })}
            {/* Total Row */}
            <div className="grid grid-cols-[1.4fr_0.65fr_0.75fr_0.85fr_0.9fr_0.85fr] gap-1 py-1.5 px-1.5 border-t border-[#d5d2c6] font-bold text-[#1b1c18] bg-[#faf8f2]/80">
              <span className="font-sans">
                Total ({tierRows.length} tiers)
              </span>
              <span className="text-right">
                {totalTierHeads.toLocaleString('en-US')}
              </span>
              <span className="text-right text-[#b06a3a]">
                {(weightedExitHazard * 100).toFixed(1)}%
              </span>
              <span className="text-right text-[#6f6d64]">
                ${weightedMeanNtr.toLocaleString('en-US')}
              </span>
              <span className="text-right" style={{ color: accent }}>
                {moneyM(totalRetainedNtrUsd)}
              </span>
              <span className="text-right text-[#b06a3a]">
                {moneyM(totalRiskNtrUsd)}
              </span>
            </div>
          </>
        }
        chartTitle="Retained NTR vs. First-Year NTR at Risk by Tuition Discount Tier ($M)"
        chartHeaderRight={
          activeTier ? (
            <>
              <strong className="text-[#1b1c18]">
                {activeTier.discount_description}:
              </strong>{' '}
              <span style={{ color: accent }}>
                {moneyM(activeTier.retained_ntr)} retained
              </span>{' '}
              vs.{' '}
              <strong className="text-[#b06a3a]">
                {moneyM(activeTier.ntr_at_risk)} at risk
              </strong>
            </>
          ) : undefined
        }
        svgChart={
          <svg
            viewBox="0 0 420 240"
            className="w-full h-auto select-none"
            role="img"
            aria-label="Stacked bar chart comparing Retained Net Tuition Revenue versus Net Tuition Revenue at risk by financial aid discount tier"
          >
            {/* Grid lines */}
            <g stroke="#ecebe3" strokeWidth="1">
              <line x1="48" y1="34" x2="404" y2="34" />
              <line x1="48" y1="88" x2="404" y2="88" />
              <line x1="48" y1="142" x2="404" y2="142" />
              <line x1="48" y1="196" x2="404" y2="196" />
            </g>

            {/* Axes */}
            <line
              x1="48"
              y1="20"
              x2="48"
              y2="196"
              stroke="#cdcbc1"
              strokeWidth="1.1"
            />
            <line
              x1="48"
              y1="196"
              x2="404"
              y2="196"
              stroke="#cdcbc1"
              strokeWidth="1.1"
            />

            {/* Left Y-axis labels */}
            <g
              fill="#8a887e"
              fontFamily="Open Sans, sans-serif"
              fontSize="10"
              textAnchor="end"
            >
              <text x="42" y="38">
                ${maxTierBarM}M
              </text>
              <text x="42" y="118">
                ${(maxTierBarM / 2).toFixed(1)}M
              </text>
              <text x="42" y="200">
                $0M
              </text>
            </g>

            {tierRows.map((r, idx) => {
              const count = Math.max(1, tierRows.length);
              const slotW = 348 / count;
              const barW = Math.min(44, slotW * 0.62);
              const xCenter = 54 + idx * slotW + slotW / 2;
              const xLeft = xCenter - barW / 2;
              const isSel = idx === safeTierIdx;

              const retM = r.retained_ntr / 1e6;
              const riskM = r.ntr_at_risk / 1e6;

              const hRet = (retM / maxTierBarM) * 162;
              const hRisk = (riskM / maxTierBarM) * 162;
              const yRet = 196 - hRet;
              const yRisk = yRet - hRisk;

              return (
                <g
                  key={idx}
                  className="cursor-pointer"
                  onClick={() => setSelectedTierIdx(idx)}
                  onMouseEnter={() => setSelectedTierIdx(idx)}
                >
                  {isSel && (
                    <rect
                      x={xLeft - 6}
                      y="24"
                      width={barW + 12}
                      height="172"
                      rx="4"
                      fill={accent}
                      opacity="0.08"
                    />
                  )}

                  {/* Retained NTR bottom bar */}
                  <rect
                    x={xLeft}
                    y={yRet}
                    width={barW}
                    height={Math.max(2, hRet)}
                    fill={accent}
                    opacity={isSel ? 0.95 : 0.78}
                  />

                  {/* NTR at Risk top cap */}
                  <rect
                    x={xLeft}
                    y={yRisk}
                    width={barW}
                    height={Math.max(2, hRisk)}
                    fill="#b06a3a"
                    opacity={isSel ? 1 : 0.85}
                  />

                  {/* Risk label above bar */}
                  <text
                    x={xCenter}
                    y={Math.max(16, yRisk - 5)}
                    textAnchor="middle"
                    fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                    fontSize="9.5"
                    fontWeight={isSel ? '700' : '600'}
                    fill="#b06a3a"
                  >
                    −${riskM.toFixed(2)}M
                  </text>

                  {/* Tier label on X axis */}
                  <text
                    x={xCenter}
                    y="213"
                    textAnchor="middle"
                    fontFamily="Open Sans, sans-serif"
                    fontSize="9.5"
                    fontWeight={isSel ? '700' : '400'}
                    fill={isSel ? '#1b1c18' : '#8a887e'}
                  >
                    {r.discount_description.split(' ')[0]}
                  </text>
                  <text
                    x={xCenter}
                    y="225"
                    textAnchor="middle"
                    fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                    fontSize="9"
                    fill="#6f6d64"
                  >
                    {(r.first_year_retention * 100).toFixed(0)}% ret
                  </text>
                </g>
              );
            })}
          </svg>
        }
        chartLegend={
          <>
            <span className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-[2px] inline-block"
                style={{ backgroundColor: accent }}
              />
              Retained NTR ($M)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-[2px] bg-[#b06a3a] inline-block" />
              First-Year NTR at Risk ($M)
            </span>
          </>
        }
        chartFooterRight={
          activeTier ? (
            <>
              {activeTier.discount_description}:{' '}
              <strong>
                {(activeTier.first_year_retention * 100).toFixed(1)}%
              </strong>{' '}
              retained ·{' '}
              <strong className="text-[#b06a3a]">
                {(activeTier.exit_hazard * 100).toFixed(1)}%
              </strong>{' '}
              at risk
            </>
          ) : undefined
        }
      />

      <div className="border border-[#e3e1d9] rounded-[10px] p-3.5 md:p-4 mt-3.5 bg-white/75 flex flex-wrap items-center justify-between gap-2 text-[12px] text-[#44453a]">
        <div>
          <strong className="text-[#1b1c18]">Portfolio Note:</strong> Clean-room
          synthetic implementation of the two-stage RStudio and Positron IDE
          enrollment and Net Tuition Revenue forecasting pipeline built by John
          Schofield (2023–2025).
        </div>
      </div>
    </section>
  );
};

