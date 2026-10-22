import React, { useState } from 'react';
import { SiteData } from '../data/types';
import { InteractiveSplitPanel } from './InteractiveSplitPanel';

interface ScenariosSectionProps {
  accent: string;
  endYear: string;
  scenarioNote: string;
  siteData: SiteData;
  activeScenario: 'flat' | 'cliff' | 'northeast';
  onSelectScenario: (scenario: 'flat' | 'cliff' | 'northeast') => void;
}

export const ScenariosSection: React.FC<ScenariosSectionProps> = ({
  accent,
  endYear,
  scenarioNote,
  siteData,
  activeScenario,
  onSelectScenario,
}) => {
  const [selectedFallIdx, setSelectedFallIdx] = useState<number>(4); // default 2030FA


  const scenarioDescs = {
    flat: 'Future Fall incoming classes stay at the recent historical average headcount.',
    cliff:
      'Future Fall incoming classes follow the WICHE national high school graduate trend (−5.5% from 2025 to 2030).',
    northeast:
      'Future Fall incoming classes follow the steeper WICHE Northeast high school graduate decline (−7.6% from 2025 to 2030).',
  };

  const scenarioLabels = {
    flat: 'Steady Incoming Class',
    cliff: 'National High School Cliff',
    northeast: 'Northeast Demographic Decline',
  };

  const names: Array<'flat' | 'cliff' | 'northeast'> = [
    'flat',
    'cliff',
    'northeast',
  ];
  const allPoints = names.flatMap((n) => siteData.scenarios[n] || []);
  const lo = Math.floor(Math.min(...allPoints.map((r) => r.p10_m)) - 1);
  const hi = Math.ceil(Math.max(...allPoints.map((r) => r.p90_m)) + 1);

  const falls = (siteData.scenarios.flat || []).map((r) => r.fall);
  const safeIdx = Math.min(
    Math.max(0, selectedFallIdx),
    Math.max(0, falls.length - 1)
  );

  const X = (i: number) => 64 + i * (330 / Math.max(1, falls.length - 1));
  const Y = (v: number) => 34 + (hi - v) * (162 / Math.max(1, hi - lo));

  const line = (n: 'flat' | 'cliff' | 'northeast') => {
    const pts = siteData.scenarios[n] || [];
    return (
      'M' +
      pts.map((r, i) => `${X(i).toFixed(1)},${Y(r.ntr_m).toFixed(1)}`).join(' L')
    );
  };

  const bandOf = (n: 'flat' | 'cliff' | 'northeast') => {
    const rs = siteData.scenarios[n] || [];
    if (!rs.length) return '';
    const top = rs
      .map((r, i) => `${X(i).toFixed(1)},${Y(r.p90_m).toFixed(1)}`)
      .join(' L');
    const bottom = rs
      .map((r, i) => [X(i), Y(r.p10_m)])
      .reverse()
      .map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`)
      .join(' L');
    return `M${top} L${bottom} Z`;
  };

  const activePoints = siteData.scenarios[activeScenario] || [];
  const startPt = activePoints[0];
  const selectedPt =
    activePoints[safeIdx] || activePoints[activePoints.length - 1];
  const flatSelectedPt = siteData.scenarios.flat[safeIdx];

  const perStudentUsd = (pt?: { headcount: number; ntr_m: number }) =>
    pt && pt.headcount > 0
      ? '$' +
        Math.round((pt.ntr_m * 1e6) / pt.headcount).toLocaleString('en-US')
      : '—';

  const selX = X(safeIdx);
  const selY = selectedPt ? Y(selectedPt.ntr_m) : 0;

  const bandFill =
    activeScenario === 'northeast'
      ? '#b06a3a'
      : activeScenario === 'flat'
      ? '#8a887e'
      : accent;

  const activeStroke =
    activeScenario === 'northeast'
      ? '#b06a3a'
      : activeScenario === 'flat'
      ? '#54564c'
      : accent;

  const diffVsFlatM =
    selectedPt && flatSelectedPt ? selectedPt.ntr_m - flatSelectedPt.ntr_m : 0;

  const fiveYrTotalHeads = activePoints.reduce((s, p) => s + p.headcount, 0);
  const fiveYrTotalNtrM = activePoints.reduce((s, p) => s + p.ntr_m, 0);
  const fiveYrMeanPerStudent =
    fiveYrTotalHeads > 0
      ? '$' +
        Math.round((fiveYrTotalNtrM * 1e6) / fiveYrTotalHeads).toLocaleString(
          'en-US'
        )
      : '—';

  return (
    <section data-section="scenarios" className="scroll-mt-20">
      <div
        className="text-[10.5px] font-bold tracking-[1.6px] uppercase"
        style={{ color: accent }}
      >
        01 · 4-Year Multi-Cohort Outlook
      </div>

      <h2 className="font-serif font-normal text-[24px] md:text-[28px] leading-[1.15] tracking-[-0.3px] mt-1.5 text-[#1b1c18]">
        Fall Net Tuition Revenue through {endYear}
      </h2>

      <p className="text-[13.5px] leading-[1.55] text-[#54564c] mt-1.5 max-w-[68ch]">
        Projected Fall cohort headcount multiplied by Net Tuition Revenue per
        student ($M) under three incoming-class assumptions. {scenarioNote}
      </p>

      <InteractiveSplitPanel
        controls={
          <>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {names.map((k) => {
                const on = k === activeScenario;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => onSelectScenario(k)}
                    className="cursor-pointer text-[12px] font-bold px-3 py-1.5 rounded-[6px] border transition-all duration-150"
                    style={{
                      backgroundColor: on ? accent : '#faf8f2',
                      color: on ? '#fff' : '#44453a',
                      borderColor: on ? accent : '#d8d6cc',
                    }}
                  >
                    {scenarioLabels[k]}
                  </button>
                );
              })}
            </div>

            <div className="font-serif text-[13.5px] italic text-[#54564c] leading-[1.45]">
              {scenarioDescs[activeScenario]}
            </div>
          </>
        }
        kpiStrip={
          <>
            <div>
              <div className="text-[10.5px] text-[#6f6d64] font-bold uppercase tracking-[0.5px]">
                {startPt?.fall || '2026FA'} Baseline Start
              </div>
              <div className="text-[22px] font-extrabold tracking-tight text-[#1b1c18] mt-0.5 leading-none font-mono tabular-nums">
                ${startPt ? startPt.ntr_m.toFixed(1) : '—'}
                <span className="text-[13px] text-[#8a887e] ml-0.5">M</span>
              </div>
              {startPt && (
                <div className="text-[11px] font-mono tabular-nums text-[#6f6d64] mt-1">
                  {startPt.headcount.toLocaleString('en-US')} ×{' '}
                  {perStudentUsd(startPt)}
                </div>
              )}
            </div>

            <div>
              <div className="text-[10.5px] text-[#6f6d64] font-bold uppercase tracking-[0.5px]">
                Selected Term · {selectedPt?.fall || '2030FA'}
              </div>
              <div
                className="text-[22px] font-extrabold tracking-tight mt-0.5 leading-none font-mono tabular-nums"
                style={{ color: activeStroke }}
              >
                ${selectedPt ? selectedPt.ntr_m.toFixed(1) : '—'}
                <span className="text-[13px] text-[#8a887e] ml-0.5">M</span>
              </div>
              {selectedPt && (
                <div className="text-[11px] font-mono tabular-nums text-[#6f6d64] mt-1">
                  {selectedPt.headcount.toLocaleString('en-US')} ×{' '}
                  {perStudentUsd(selectedPt)}
                </div>
              )}
            </div>
          </>
        }
        summaryTable={
          <>
            <div className="flex items-center justify-between text-[10.5px] font-sans text-[#6f6d64] mb-1.5">
              <span className="font-bold uppercase tracking-[0.5px]">
                5-Year Fall Schedule (Click row to inspect)
              </span>
              <span>Headcount × NTR/Student</span>
            </div>
            <div className="grid grid-cols-[58px_0.9fr_1fr_0.9fr_1.15fr] gap-1 text-[#8a887e] font-sans font-bold text-[10.5px] pb-1 border-b border-[#e3e1d9]">
              <span>Fall</span>
              <span className="text-right">Heads</span>
              <span className="text-right">NTR/St</span>
              <span className="text-right">Fall NTR</span>
              <span className="text-right">80% Range</span>
            </div>
            {activePoints.map((pt, idx) => {
              const isSelected = idx === safeIdx;
              return (
                <button
                  key={pt.fall}
                  type="button"
                  onClick={() => setSelectedFallIdx(idx)}
                  onMouseEnter={() => setSelectedFallIdx(idx)}
                  className="w-full text-left grid grid-cols-[58px_0.9fr_1fr_0.9fr_1.15fr] gap-1 py-1.5 px-1.5 rounded-[4px] border-b border-[#f4f2ea] transition-colors cursor-pointer"
                  style={{
                    backgroundColor: isSelected
                      ? `color-mix(in srgb, ${accent} 10%, #fff)`
                      : 'transparent',
                  }}
                >
                  <span
                    className="font-bold"
                    style={{ color: isSelected ? accent : '#1b1c18' }}
                  >
                    {pt.fall}
                  </span>
                  <span className="text-right text-[#44453a]">
                    {pt.headcount.toLocaleString('en-US')}
                  </span>
                  <span className="text-right text-[#6f6d64]">
                    {perStudentUsd(pt)}
                  </span>
                  <span
                    className="text-right font-bold"
                    style={{ color: isSelected ? activeStroke : '#1b1c18' }}
                  >
                    ${pt.ntr_m.toFixed(1)}M
                  </span>
                  <span className="text-right text-[#6f6d64] text-[10.5px]">
                    ${pt.p10_m.toFixed(1)}–{pt.p90_m.toFixed(1)}M
                  </span>
                </button>
              );
            })}
            {/* 5-Fall Summary Footer Row */}
            <div className="grid grid-cols-[58px_0.9fr_1fr_0.9fr_1.15fr] gap-1 py-1.5 px-1.5 border-t border-[#d5d2c6] font-bold text-[#1b1c18] bg-[#faf8f2]/80">
              <span className="font-sans">5-Fall</span>
              <span className="text-right">
                {fiveYrTotalHeads.toLocaleString('en-US')}
              </span>
              <span className="text-right text-[#6f6d64]">
                {fiveYrMeanPerStudent}
              </span>
              <span className="text-right" style={{ color: activeStroke }}>
                ${fiveYrTotalNtrM.toFixed(1)}M
              </span>
              <span className="text-right text-[#6f6d64] text-[10.5px]">
                cum. 5 falls
              </span>
            </div>
          </>
        }
        chartTitle={`Fall NTR Trajectory & 80% Budget Range (${falls[0]}–${falls[falls.length - 1]})`}
        chartHeaderRight={
          selectedPt ? (
            <>
              <strong className="text-[#1b1c18]">{selectedPt.fall}:</strong> $
              {selectedPt.ntr_m.toFixed(1)}M (
              {Math.abs(diffVsFlatM) < 0.05
                ? 'match vs. steady'
                : `${diffVsFlatM >= 0 ? '+' : '−'}$${Math.abs(diffVsFlatM).toFixed(1)}M vs. steady`}
              )
            </>
          ) : undefined
        }
        svgChart={
          <svg
            viewBox="0 0 420 240"
            className="w-full h-auto select-none"
            role="img"
            aria-label="Interactive Fall Net Tuition Revenue chart through 2030"
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
              <text x="42" y={Y(hi) + 4}>
                ${hi}M
              </text>
              <text x="42" y={Y((hi + lo) / 2) + 4}>
                ${Math.round((hi + lo) / 2)}M
              </text>
              <text x="42" y={Y(lo) + 4}>
                ${lo}M
              </text>
            </g>

            {/* Confidence Band for active scenario */}
            <path
              d={bandOf(activeScenario)}
              fill={bandFill}
              opacity="0.15"
              stroke="none"
            />

            {/* Selected Fall vertical guide line */}
            <line
              x1={selX}
              y1="24"
              x2={selX}
              y2="196"
              stroke={activeStroke}
              strokeWidth="1.2"
              strokeDasharray="3 3"
              opacity="0.65"
            />

            {/* Scenario trajectory lines */}
            <path
              d={line('flat')}
              fill="none"
              stroke={activeScenario === 'flat' ? '#3a3b34' : '#bbb9af'}
              strokeWidth={activeScenario === 'flat' ? 3.2 : 1.7}
              strokeDasharray="5 4"
            />
            <path
              d={line('cliff')}
              fill="none"
              stroke={activeScenario === 'cliff' ? accent : '#b0aea4'}
              strokeWidth={activeScenario === 'cliff' ? 3.2 : 1.7}
            />
            <path
              d={line('northeast')}
              fill="none"
              stroke={activeScenario === 'northeast' ? '#b06a3a' : '#c8c6bc'}
              strokeWidth={activeScenario === 'northeast' ? 3.2 : 1.7}
            />

            {/* Interactive nodes at each Fall term */}
            {falls.map((f, i) => {
              const pt = activePoints[i];
              if (!pt) return null;
              const cx = X(i);
              const cy = Y(pt.ntr_m);
              const isSel = i === safeIdx;
              return (
                <g
                  key={f}
                  className="cursor-pointer"
                  onClick={() => setSelectedFallIdx(i)}
                  onMouseEnter={() => setSelectedFallIdx(i)}
                >
                  <rect
                    x={cx - 24}
                    y="20"
                    width="48"
                    height="195"
                    fill="transparent"
                  />
                  {/* Range whiskers on selected term */}
                  {isSel && (
                    <g stroke={activeStroke} strokeWidth="1.5">
                      <line
                        x1={cx}
                        y1={Y(pt.p90_m)}
                        x2={cx}
                        y2={Y(pt.p10_m)}
                      />
                      <line
                        x1={cx - 4}
                        y1={Y(pt.p90_m)}
                        x2={cx + 4}
                        y2={Y(pt.p90_m)}
                      />
                      <line
                        x1={cx - 4}
                        y1={Y(pt.p10_m)}
                        x2={cx + 4}
                        y2={Y(pt.p10_m)}
                      />
                    </g>
                  )}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSel ? 5.2 : 3.2}
                    fill={isSel ? '#fff' : activeStroke}
                    stroke={activeStroke}
                    strokeWidth={isSel ? 2.4 : 1.2}
                  />
                  <text
                    x={cx}
                    y="215"
                    textAnchor="middle"
                    fontFamily="Open Sans, sans-serif"
                    fontSize="10.5"
                    fontWeight={isSel ? '700' : '400'}
                    fill={isSel ? '#1b1c18' : '#8a887e'}
                  >
                    {f}
                  </text>
                </g>
              );
            })}

            {/* Value badge near selected point */}
            {selectedPt && (
              <g
                transform={`translate(${Math.min(315, Math.max(54, selX - 48))}, ${Math.max(18, selY - 30)})`}
              >
                <rect
                  x="0"
                  y="0"
                  width="96"
                  height="20"
                  rx="4"
                  fill="#1b1c18"
                  opacity="0.92"
                />
                <text
                  x="48"
                  y="13.5"
                  textAnchor="middle"
                  fill="#fff"
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                  fontSize="10"
                  fontWeight="700"
                >
                  {selectedPt.fall}: ${selectedPt.ntr_m.toFixed(1)}M
                </text>
              </g>
            )}
          </svg>
        }
        chartLegend={
          <>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-[2px] bg-[#6f6d64] inline-block" />
              Steady class
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="w-3.5 h-[3px] inline-block"
                style={{ backgroundColor: accent }}
              />
              WICHE National (−5.5%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-[2.5px] bg-[#b06a3a] inline-block" />
              WICHE Northeast (−7.6%)
            </span>
          </>
        }
        chartFooterRight={
          selectedPt ? (
            <>
              {selectedPt.fall}: <strong>{selectedPt.headcount.toLocaleString('en-US')}</strong> ×{' '}
              {perStudentUsd(selectedPt)} ={' '}
              <strong style={{ color: activeStroke }}>
                ${selectedPt.ntr_m.toFixed(1)}M
              </strong>
            </>
          ) : undefined
        }
      />
    </section>
  );
};
