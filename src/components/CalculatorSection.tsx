import React, { useState } from 'react';
import { SiteData } from '../data/types';
import { InteractiveSplitPanel } from './InteractiveSplitPanel';
import { computeEntrantProjection } from '../utils/calculator';

interface CalculatorSectionProps {
  accent: string;
  siteData: SiteData;
  calcTag: string;
  calcIntro: string;
  calcAssume: string;
}

export const CalculatorSection: React.FC<CalculatorSectionProps> = ({
  accent,
  siteData,
  calcTag,
  calcIntro,
  calcAssume,
}) => {
  const ent = siteData.entrant;
  const schoolKeys = Object.keys(ent.schools);
  const [school, setSchool] = useState<string>(schoolKeys[0] || 'MCM');

  const currentSchoolData = ent.schools[school];

  // 5 Core Inputs
  const [entering, setEntering] = useState<number>(currentSchoolData.entering);
  const [charge, setCharge] = useState<number>(
    currentSchoolData.charge_per_term
  );
  const [aidPct, setAidPct] = useState<number>(
    Number((currentSchoolData.aid_rate * 100).toFixed(2))
  );
  const [retentionDeltaPp, setRetentionDeltaPp] = useState<number>(0);

  // Interactive selected year (0..3) synced between left table and right SVG chart
  const [selectedYearIdx, setSelectedYearIdx] = useState<number>(0);

  const handleSchoolChange = (newSchool: string) => {
    const s = ent.schools[newSchool];
    setSchool(newSchool);
    setEntering(s.entering);
    setCharge(s.charge_per_term);
    setAidPct(Number((s.aid_rate * 100).toFixed(2)));
    setRetentionDeltaPp(0);
  };

  const handleReset = () => {
    const s = ent.schools[school];
    setEntering(s.entering);
    setCharge(s.charge_per_term);
    setAidPct(Number((s.aid_rate * 100).toFixed(2)));
    setRetentionDeltaPp(0);
  };

  const baseline = computeEntrantProjection(
    currentSchoolData,
    ent.years,
    currentSchoolData.entering,
    currentSchoolData.charge_per_term,
    Number((currentSchoolData.aid_rate * 100).toFixed(2)),
    1.0,
    0
  );

  const scenario = computeEntrantProjection(
    currentSchoolData,
    ent.years,
    Math.max(0, Math.round(Number(entering) || 0)),
    Math.max(0, Number(charge) || 0),
    Math.min(100, Math.max(0, Number(aidPct) || 0)),
    1.0,
    Number(retentionDeltaPp) || 0
  );

  const usd = (n: number) => '$' + Math.round(n).toLocaleString('en-US');
  const usdM = (n: number) => '$' + (n / 1e6).toFixed(2) + 'M';
  const signedUsdM = (n: number) =>
    (n >= 0 ? '+$' : '−$') + (Math.abs(n) / 1e6).toFixed(2) + 'M';

  const maxYearGrossM = Math.max(
    10,
    Math.ceil(
      Math.max(
        ...scenario.rows.map((r) => Math.max(r.grossTuition, r.highNtr) / 1e6),
        ...baseline.rows.map((r) => r.grossTuition / 1e6)
      ) * 1.12
    )
  );

  const activeYearRow = scenario.rows[selectedYearIdx] || scenario.rows[0];
  const baseYearRow = baseline.rows[selectedYearIdx] || baseline.rows[0];

  const totalDiffUsd = scenario.totalNtr - baseline.totalNtr;

  return (
    <section data-section="calc" className="scroll-mt-20">
      <div
        className="text-[10.5px] font-bold tracking-[1.6px] uppercase"
        style={{ color: accent }}
      >
        {calcTag}
      </div>

      <h2 className="font-serif font-normal text-[24px] md:text-[28px] leading-[1.15] tracking-[-0.3px] mt-1.5 text-[#1b1c18]">
        Entering class to four-year Net Tuition Revenue (NTR)
      </h2>

      <p className="text-[13.5px] leading-[1.55] text-[#54564c] mt-1.5 max-w-[68ch]">
        {calcIntro}
      </p>

      <InteractiveSplitPanel
        controls={
          <>
            {/* Input 1: School Selector + Reset */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex flex-wrap gap-1.5">
                {schoolKeys.map((sKey) => {
                  const on = school === sKey;
                  const sData = ent.schools[sKey];
                  return (
                    <button
                      key={sKey}
                      type="button"
                      onClick={() => handleSchoolChange(sKey)}
                      className="cursor-pointer text-[12px] font-bold px-3 py-1.5 rounded-[6px] border transition-all duration-150"
                      style={{
                        backgroundColor: on ? accent : '#faf8f2',
                        color: on ? '#fff' : '#44453a',
                        borderColor: on ? accent : '#d8d6cc',
                      }}
                    >
                      {sKey} · {sData.terms_per_year} Terms/Yr (offset ={' '}
                      {sData.spring_to_fall_offset})
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="cursor-pointer text-[11.5px] font-semibold px-2.5 py-1 rounded-[5px] border border-[#d5d2c6] bg-[#faf8f2] text-[#54564c] hover:text-[#1b1c18]"
              >
                Reset {school}
              </button>
            </div>

            {/* Inputs 2–5: 4 Numeric Controls */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label
                  htmlFor="calc-entering"
                  className="block text-[10px] font-bold uppercase tracking-[0.4px] text-[#6f6d64] mb-1"
                >
                  Entering Class
                </label>
                <input
                  id="calc-entering"
                  type="number"
                  min={0}
                  step={10}
                  value={entering}
                  onChange={(e) => setEntering(Number(e.target.value))}
                  className="w-full font-mono tabular-nums text-[12.5px] px-2 py-1.5 border border-[#d5d2c6] rounded-[5px] bg-[#faf8f2] text-[#1b1c18]"
                />
              </div>

              <div>
                <label
                  htmlFor="calc-charge"
                  className="block text-[10px] font-bold uppercase tracking-[0.4px] text-[#6f6d64] mb-1"
                >
                  Gross Tuition/Term ($)
                </label>
                <input
                  id="calc-charge"
                  type="number"
                  min={0}
                  step={250}
                  value={charge}
                  onChange={(e) => setCharge(Number(e.target.value))}
                  className="w-full font-mono tabular-nums text-[12.5px] px-2 py-1.5 border border-[#d5d2c6] rounded-[5px] bg-[#faf8f2] text-[#1b1c18]"
                />
              </div>

              <div>
                <label
                  htmlFor="calc-aid"
                  className="block text-[10px] font-bold uppercase tracking-[0.4px] text-[#6f6d64] mb-1"
                >
                  Tuition Discount (%)
                </label>
                <input
                  id="calc-aid"
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={aidPct}
                  onChange={(e) => setAidPct(Number(e.target.value))}
                  className="w-full font-mono tabular-nums text-[12.5px] px-2 py-1.5 border border-[#d5d2c6] rounded-[5px] bg-[#faf8f2] text-[#1b1c18]"
                />
              </div>

              <div>
                <label
                  htmlFor="calc-ret-pp"
                  className="block text-[10px] font-bold uppercase tracking-[0.4px] text-[#6f6d64] mb-1"
                >
                  Return Shift (pp)
                </label>
                <input
                  id="calc-ret-pp"
                  type="number"
                  min={-15}
                  max={15}
                  step={0.5}
                  value={retentionDeltaPp}
                  onChange={(e) => setRetentionDeltaPp(Number(e.target.value))}
                  className="w-full font-mono tabular-nums text-[12.5px] px-2 py-1.5 border border-[#d5d2c6] rounded-[5px] bg-[#faf8f2] text-[#1b1c18]"
                />
              </div>
            </div>

            {/* RStudio Stage 1 NTR Accounting Bar */}
            <div className="mt-2.5 px-2.5 py-1.5 rounded-[5px] bg-[#faf8f2] border border-[#eeece4] font-mono tabular-nums text-[11px] text-[#54564c] flex flex-wrap items-center justify-between gap-1">
              <span>
                {usd(scenario.chargePerTerm)} Gross −{' '}
                {usd(scenario.aidPerTerm)} Grant ({scenario.aidPct.toFixed(1)}% ·{' '}
                {scenario.aidTierLabel}) + {usd(scenario.compFeePerTerm)} Fee
              </span>
              <strong style={{ color: accent }}>
                = {usd(scenario.netPerTerm)} NTR / student-term
              </strong>
            </div>
          </>
        }
        kpiStrip={
          <>
            <div>
              <div className="text-[10.5px] text-[#6f6d64] font-bold uppercase tracking-[0.5px]">
                4-Year Billed Student-Terms
              </div>
              <div className="text-[22px] font-extrabold tracking-tight text-[#1b1c18] mt-0.5 leading-none font-mono tabular-nums">
                {Math.round(scenario.totalStudentTerms).toLocaleString('en-US')}
                <span className="text-[12px] font-normal text-[#8a887e] ml-1">
                  terms
                </span>
              </div>
              <div className="text-[11px] font-mono tabular-nums text-[#6f6d64] mt-1">
                Yr-2 Fall retention:{' '}
                {(scenario.impliedFallToFallRetention * 100).toFixed(1)}%
              </div>
            </div>

            <div>
              <div className="text-[10.5px] text-[#6f6d64] font-bold uppercase tracking-[0.5px]">
                4-Year Net Tuition Revenue
              </div>
              <div
                className="text-[22px] font-extrabold tracking-tight mt-0.5 leading-none font-mono tabular-nums"
                style={{ color: accent }}
              >
                {usdM(scenario.totalNtr)}
              </div>
              <div className="text-[11px] font-mono tabular-nums text-[#6f6d64] mt-1">
                {Math.abs(totalDiffUsd) < 500
                  ? `Range: ${usdM(scenario.totalLowNtr)}–${usdM(scenario.totalHighNtr)}`
                  : `${signedUsdM(totalDiffUsd)} vs. ${school} base`}
              </div>
            </div>
          </>
        }
        summaryTable={
          <>
            <div className="flex items-center justify-between text-[10.5px] font-sans text-[#6f6d64] mb-1.5">
              <span className="font-bold uppercase tracking-[0.5px]">
                4-Year Cohort Schedule (Click year to inspect)
              </span>
              <span>Student-Terms × NTR/Term</span>
            </div>
            <div className="grid grid-cols-[52px_0.8fr_0.85fr_0.95fr_0.95fr_0.9fr] gap-1 text-[#8a887e] font-sans font-bold text-[10.5px] pb-1 border-b border-[#e3e1d9]">
              <span>Year</span>
              <span className="text-right">Fall</span>
              <span className="text-right">Terms</span>
              <span className="text-right">NTR/Term</span>
              <span className="text-right">Yr NTR</span>
              <span className="text-right">vs. Base</span>
            </div>
            {scenario.rows.map((row, idx) => {
              const baseNtr = baseline.rows[idx]?.ntr ?? 0;
              const diff = row.ntr - baseNtr;
              const isSelected = idx === selectedYearIdx;
              return (
                <button
                  key={row.year}
                  type="button"
                  onClick={() => setSelectedYearIdx(idx)}
                  onMouseEnter={() => setSelectedYearIdx(idx)}
                  className="w-full text-left grid grid-cols-[52px_0.8fr_0.85fr_0.95fr_0.95fr_0.9fr] gap-1 py-1.5 px-1.5 rounded-[4px] border-b border-[#f4f2ea] transition-colors cursor-pointer"
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
                    {row.label}
                  </span>
                  <span className="text-right text-[#54564c]">
                    {row.entryTermHeads.toLocaleString('en-US')}
                  </span>
                  <span className="text-right font-semibold text-[#1b1c18]">
                    {Math.round(row.enrolledStudentTerms).toLocaleString(
                      'en-US'
                    )}
                  </span>
                  <span className="text-right text-[#6f6d64]">
                    {usd(scenario.netPerTerm)}
                  </span>
                  <span
                    className="text-right font-bold"
                    style={{ color: isSelected ? accent : '#1b1c18' }}
                  >
                    {usdM(row.ntr)}
                  </span>
                  <span
                    className="text-right font-semibold"
                    style={{
                      color:
                        diff > 500
                          ? accent
                          : diff < -500
                          ? '#b06a3a'
                          : '#8a887e',
                    }}
                  >
                    {Math.abs(diff) < 500 ? '—' : signedUsdM(diff)}
                  </span>
                </button>
              );
            })}

            {/* 4-Year Total Row */}
            <div className="grid grid-cols-[52px_0.8fr_0.85fr_0.95fr_0.95fr_0.9fr] gap-1 py-1.5 px-1.5 border-t border-[#d5d2c6] font-bold text-[#1b1c18] bg-[#faf8f2]/80">
              <span className="font-sans">Total</span>
              <span className="text-right text-[#6f6d64]">
                {scenario.entering.toLocaleString('en-US')}
              </span>
              <span className="text-right">
                {Math.round(scenario.totalStudentTerms).toLocaleString('en-US')}
              </span>
              <span className="text-right" style={{ color: accent }}>
                {usd(scenario.netPerTerm)}
              </span>
              <span className="text-right" style={{ color: accent }}>
                {usdM(scenario.totalNtr)}
              </span>
              <span
                className="text-right"
                style={{
                  color:
                    totalDiffUsd > 500
                      ? accent
                      : totalDiffUsd < -500
                      ? '#b06a3a'
                      : '#6f6d64',
                }}
              >
                {Math.abs(totalDiffUsd) < 500 ? '—' : signedUsdM(totalDiffUsd)}
              </span>
            </div>
          </>
        }
        chartTitle={`Year-by-Year Net Tuition Revenue & Institutional Grant Aid (${school})`}
        chartHeaderRight={
          activeYearRow ? (
            <>
              <strong className="text-[#1b1c18]">{activeYearRow.label}:</strong>{' '}
              {Math.round(activeYearRow.enrolledStudentTerms).toLocaleString(
                'en-US'
              )}{' '}
              terms × {usd(scenario.netPerTerm)} ={' '}
              <strong style={{ color: accent }}>
                {usdM(activeYearRow.ntr)}
              </strong>
            </>
          ) : undefined
        }
        svgChart={
          <svg
            viewBox="0 0 420 240"
            className="w-full h-auto select-none"
            role="img"
            aria-label="4-year Net Tuition Revenue and Institutional Aid stacked bar chart"
          >
            {/* Horizontal grid lines */}
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

            {/* Y-axis labels */}
            <g
              fill="#8a887e"
              fontFamily="Open Sans, sans-serif"
              fontSize="10.5"
              textAnchor="end"
            >
              <text x="42" y="38">
                ${maxYearGrossM}M
              </text>
              <text x="42" y="118">
                ${Math.round(maxYearGrossM / 2)}M
              </text>
              <text x="42" y="200">
                $0M
              </text>
            </g>

            {/* Bars for Year 1 to Year 4 */}
            {scenario.rows.map((row, idx) => {
              const slotW = 340 / 4;
              const barW = 48;
              const xCenter = 60 + idx * slotW + slotW / 2;
              const xLeft = xCenter - barW / 2;
              const isSel = idx === selectedYearIdx;

              const ntrM = row.ntr / 1e6;
              const aidM = row.institutionalAid / 1e6;
              const baseNtrM = (baseline.rows[idx]?.ntr ?? 0) / 1e6;
              const lowNtrM = row.lowNtr / 1e6;
              const highNtrM = row.highNtr / 1e6;

              const hNtr = (ntrM / maxYearGrossM) * 162;
              const hAid = (aidM / maxYearGrossM) * 162;
              const yNtr = 196 - hNtr;
              const yAid = yNtr - hAid;
              const yBaseNtr = 196 - (baseNtrM / maxYearGrossM) * 162;
              const yLowNtr = 196 - (lowNtrM / maxYearGrossM) * 162;
              const yHighNtr = 196 - (highNtrM / maxYearGrossM) * 162;

              return (
                <g
                  key={row.year}
                  className="cursor-pointer"
                  onClick={() => setSelectedYearIdx(idx)}
                  onMouseEnter={() => setSelectedYearIdx(idx)}
                >
                  {isSel && (
                    <rect
                      x={xLeft - 8}
                      y="24"
                      width={barW + 16}
                      height="172"
                      rx="4"
                      fill={accent}
                      opacity="0.07"
                    />
                  )}

                  {/* Institutional Grant Aid top segment */}
                  {hAid > 0.5 && (
                    <rect
                      x={xLeft}
                      y={yAid}
                      width={barW}
                      height={Math.max(1, hAid)}
                      fill="#d8c3a5"
                      opacity={isSel ? 0.95 : 0.7}
                      stroke="#b06a3a"
                      strokeWidth="0.8"
                    />
                  )}

                  {/* Net Tuition Revenue bottom segment */}
                  <rect
                    x={xLeft}
                    y={yNtr}
                    width={barW}
                    height={Math.max(1.5, hNtr)}
                    fill={accent}
                    opacity={isSel ? 1 : 0.8}
                  />

                  {/* +/- 2.5pp Retention Sensitivity Whiskers on NTR */}
                  <g stroke="#1b1c18" strokeWidth="1.3" opacity="0.75">
                    <line
                      x1={xCenter}
                      y1={yHighNtr}
                      x2={xCenter}
                      y2={yLowNtr}
                    />
                    <line
                      x1={xCenter - 4}
                      y1={yHighNtr}
                      x2={xCenter + 4}
                      y2={yHighNtr}
                    />
                    <line
                      x1={xCenter - 4}
                      y1={yLowNtr}
                      x2={xCenter + 4}
                      y2={yLowNtr}
                    />
                  </g>

                  {/* Baseline NTR reference tick */}
                  <line
                    x1={xLeft - 5}
                    y1={yBaseNtr}
                    x2={xLeft + barW + 5}
                    y2={yBaseNtr}
                    stroke="#1b1c18"
                    strokeWidth="1.6"
                    strokeDasharray="3 2"
                  />

                  {/* NTR value label */}
                  <text
                    x={xCenter}
                    y={Math.max(16, yAid - 6)}
                    textAnchor="middle"
                    fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                    fontSize="10"
                    fontWeight={isSel ? '700' : '600'}
                    fill={isSel ? accent : '#54564c'}
                  >
                    ${ntrM.toFixed(1)}M
                  </text>

                  {/* X-axis labels */}
                  <text
                    x={xCenter}
                    y="213"
                    textAnchor="middle"
                    fontFamily="Open Sans, sans-serif"
                    fontSize="10.5"
                    fontWeight={isSel ? '700' : '400'}
                    fill={isSel ? '#1b1c18' : '#8a887e'}
                  >
                    {row.label}
                  </text>
                  <text
                    x={xCenter}
                    y="226"
                    textAnchor="middle"
                    fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                    fontSize="9.5"
                    fill="#6f6d64"
                  >
                    {Math.round(row.enrolledStudentTerms)} terms
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
              Net Tuition Revenue ($M)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-[2px] bg-[#d8c3a5] border border-[#b06a3a] inline-block" />
              Institutional Grant Discount ($M)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-[2px] border-t-2 border-dashed border-[#1b1c18] inline-block" />
              {school} Baseline &amp; ±2.5pp Whiskers
            </span>
          </>
        }
        chartFooterRight={
          activeYearRow && baseYearRow ? (
            <>
              {activeYearRow.label} base: <strong>{usdM(baseYearRow.ntr)}</strong>
            </>
          ) : undefined
        }
      />

      <p className="text-[12px] leading-[1.55] text-[#8a887e] mt-2.5 max-w-[68ch]">
        {calcAssume}
      </p>
    </section>
  );
};

