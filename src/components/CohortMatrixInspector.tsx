import React, { useState } from 'react';
import { InteractiveSplitPanel } from './InteractiveSplitPanel';
import { buildCohortSurvivalCurve } from '../utils/calculator';

interface CohortMatrixInspectorProps {
  accent: string;
}

type SchoolCode = 'MCM' | 'MCC';
type CensusTargetTerm = '2025FA' | '2026SP' | '2026SU' | '2026FA';
type RightChartMode = 'rollup' | 'survival';

interface CohortHistoryDef {
  cohortTerm: string;
  entrants: number;
  color: string;
  observed: Record<number, { calendarTerm: string; heads: number }>;
}

/**
 * Authentic Stage 2 Positron IDE Cohort Registration Triangles
 * (`cohort_projections_prep.ipynb` & `batched_cohort_projections_prep.ipynb`):
 * - MCM (Millbury College of Music (MCM) 3-Term Calendar: Fall, Spring, Optional Summer):
 *   - 2021FA (1,345): t0=1345, t1=1287, t2=193, t3=1134, t4=1093, t5=307, t6=1044, t7=1009, t8=327, t9=860, t10=764, t11=178, t12=143
 *   - 2022FA (1,245): t0=1245, t1=1175, t2=102, t3=1071, t4=995, t5=283, t6=966, t7=924, t8=307, t9=783
 *   - 2023FA (1,111): t0=1111, t1=1085, t2=101, t3=990, t4=963, t5=247, t6=943
 *   - 2024FA (1,159): t0=1159, t1=1113, t2=114, t3=961
 *   - 2025FA (1,123): t0=1123
 */
const MCM_COHORTS: CohortHistoryDef[] = [
  {
    cohortTerm: '2021FA',
    entrants: 1345,
    color: '#9c998e',
    observed: {
      0: { calendarTerm: '2021FA', heads: 1345 },
      1: { calendarTerm: '2022SP', heads: 1287 },
      2: { calendarTerm: '2022SU', heads: 193 },
      3: { calendarTerm: '2022FA', heads: 1134 },
      4: { calendarTerm: '2023SP', heads: 1093 },
      5: { calendarTerm: '2023SU', heads: 307 },
      6: { calendarTerm: '2023FA', heads: 1044 },
      7: { calendarTerm: '2024SP', heads: 1009 },
      8: { calendarTerm: '2024SU', heads: 327 },
      9: { calendarTerm: '2024FA', heads: 860 },
      10: { calendarTerm: '2025SP', heads: 764 },
      11: { calendarTerm: '2025SU', heads: 178 },
      12: { calendarTerm: '2025FA', heads: 143 },
    },
  },
  {
    cohortTerm: '2022FA',
    entrants: 1245,
    color: '#7a786e',
    observed: {
      0: { calendarTerm: '2022FA', heads: 1245 },
      1: { calendarTerm: '2023SP', heads: 1175 },
      2: { calendarTerm: '2023SU', heads: 102 },
      3: { calendarTerm: '2023FA', heads: 1071 },
      4: { calendarTerm: '2024SP', heads: 995 },
      5: { calendarTerm: '2024SU', heads: 283 },
      6: { calendarTerm: '2024FA', heads: 966 },
      7: { calendarTerm: '2025SP', heads: 924 },
      8: { calendarTerm: '2025SU', heads: 307 },
      9: { calendarTerm: '2025FA', heads: 783 },
    },
  },
  {
    cohortTerm: '2023FA',
    entrants: 1111,
    color: '#b06a3a',
    observed: {
      0: { calendarTerm: '2023FA', heads: 1111 },
      1: { calendarTerm: '2024SP', heads: 1085 },
      2: { calendarTerm: '2024SU', heads: 101 },
      3: { calendarTerm: '2024FA', heads: 990 },
      4: { calendarTerm: '2025SP', heads: 963 },
      5: { calendarTerm: '2025SU', heads: 247 },
      6: { calendarTerm: '2025FA', heads: 943 },
    },
  },
  {
    cohortTerm: '2024FA',
    entrants: 1159,
    color: '#2e6f4e',
    observed: {
      0: { calendarTerm: '2024FA', heads: 1159 },
      1: { calendarTerm: '2025SP', heads: 1113 },
      2: { calendarTerm: '2025SU', heads: 114 },
      3: { calendarTerm: '2025FA', heads: 961 },
    },
  },
  {
    cohortTerm: '2025FA',
    entrants: 1123,
    color: '#0d4f30',
    observed: {
      0: { calendarTerm: '2025FA', heads: 1123 },
    },
  },
  {
    cohortTerm: '2026FA',
    entrants: 1120,
    color: '#4e8a69',
    observed: {},
  },
];

const MCC_COHORTS: CohortHistoryDef[] = [
  {
    cohortTerm: '2022FA',
    entrants: 336,
    color: '#7a786e',
    observed: {
      0: { calendarTerm: '2022FA', heads: 336 },
      1: { calendarTerm: '2023SP', heads: 320 },
      2: { calendarTerm: '2023FA', heads: 287 },
      3: { calendarTerm: '2024SP', heads: 276 },
      4: { calendarTerm: '2024FA', heads: 257 },
      5: { calendarTerm: '2025SP', heads: 249 },
      6: { calendarTerm: '2025FA', heads: 235 },
    },
  },
  {
    cohortTerm: '2023FA',
    entrants: 332,
    color: '#b06a3a',
    observed: {
      0: { calendarTerm: '2023FA', heads: 332 },
      1: { calendarTerm: '2024SP', heads: 317 },
      2: { calendarTerm: '2024FA', heads: 285 },
      3: { calendarTerm: '2025SP', heads: 274 },
      4: { calendarTerm: '2025FA', heads: 255 },
    },
  },
  {
    cohortTerm: '2024FA',
    entrants: 338,
    color: '#2e6f4e',
    observed: {
      0: { calendarTerm: '2024FA', heads: 338 },
      1: { calendarTerm: '2025SP', heads: 322 },
      2: { calendarTerm: '2025FA', heads: 290 },
    },
  },
  {
    cohortTerm: '2025FA',
    entrants: 344,
    color: '#0d4f30',
    observed: {
      0: { calendarTerm: '2025FA', heads: 344 },
    },
  },
  {
    cohortTerm: '2026FA',
    entrants: 340,
    color: '#4e8a69',
    observed: {},
  },
];

// Post-COVID vs. Unmasked (including 2020FA, 2021SP, 2021SU) transition vectors (`fall_means`)
const TRANSITION_RATES = {
  MCM: {
    noCovid: [
      0.959, 0.133, 0.898, 0.955, 0.324, 0.977, 0.958, 0.373, 0.859, 0.887,
      0.271, 0.263,
    ],
    withCovid: [
      0.941, 0.146, 0.871, 0.938, 0.312, 0.954, 0.944, 0.358, 0.842, 0.874,
      0.262, 0.251,
    ],
    minCurve: [
      1.0, 0.944, 0.082, 0.829, 0.799, 0.143, 0.776, 0.742, 0.243, 0.629, 0.568,
      0.132, 0.106,
    ],
    maxCurve: [
      1.0, 0.977, 0.181, 0.891, 0.867, 0.312, 0.849, 0.812, 0.335, 0.701, 0.624,
      0.194, 0.189,
    ],
  },
  MCC: {
    noCovid: [0.953, 0.899, 0.962, 0.931, 0.968, 0.942, 0.959, 0.312],
    withCovid: [0.936, 0.874, 0.948, 0.912, 0.951, 0.928, 0.944, 0.298],
    minCurve: [1.0, 0.938, 0.834, 0.798, 0.735, 0.711, 0.668, 0.639, 0.182],
    maxCurve: [1.0, 0.968, 0.881, 0.852, 0.799, 0.774, 0.731, 0.704, 0.241],
  },
};

function stepTerm(termCode: string, steps: number, termsPerYear: number): string {
  const year = Number(termCode.slice(0, 4));
  const season = termCode.slice(4);
  if (termsPerYear === 3) {
    const seasons = ['FA', 'SP', 'SU'];
    const sIdx = seasons.indexOf(season);
    const total = sIdx + steps;
    const newSeason = seasons[total % 3];
    // FA -> SP increments calendar year by 1
    let curYear = year;
    let curSeasonIdx = sIdx;
    for (let i = 0; i < steps; i++) {
      if (curSeasonIdx === 0) curYear += 1;
      curSeasonIdx = (curSeasonIdx + 1) % 3;
    }
    return `${curYear}${newSeason}`;
  } else {
    const seasons = ['FA', 'SP'];
    let curYear = year;
    let curSeasonIdx = seasons.indexOf(season);
    for (let i = 0; i < steps; i++) {
      if (curSeasonIdx === 0) curYear += 1;
      curSeasonIdx = (curSeasonIdx + 1) % 2;
    }
    return `${curYear}${seasons[curSeasonIdx]}`;
  }
}

export const CohortMatrixInspector: React.FC<CohortMatrixInspectorProps> = ({
  accent,
}) => {
  const [school, setSchool] = useState<SchoolCode>('MCM');
  const [springOffset, setSpringOffset] = useState<1 | 2>(2);
  const [excludeCovid, setExcludeCovid] = useState<boolean>(true);
  const [selectedCensus, setSelectedCensus] =
    useState<CensusTargetTerm>('2026SP');
  const [selectedCohort, setSelectedCohort] = useState<string>('2025FA');
  const [chartMode, setChartMode] = useState<RightChartMode>('rollup');

  const termsPerYear = school === 'MCM' ? 3 : 2;
  const effectiveOffset: 1 | 2 = school === 'MCM' ? springOffset : 1;
  const ntrPerStudent = school === 'MCM' ? 19026 : 19138; // Gross - Grant + Comp Fee per term
  const availableTerms: CensusTargetTerm[] =
    school === 'MCM'
      ? ['2025FA', '2026SP', '2026SU', '2026FA']
      : ['2025FA', '2026SP', '2026FA'];

  const activeCensus: CensusTargetTerm = availableTerms.includes(selectedCensus)
    ? selectedCensus
    : '2026SP';

  const activeRates = excludeCovid
    ? TRANSITION_RATES[school].noCovid
    : TRANSITION_RATES[school].withCovid;

  const { survivalCurve } = buildCohortSurvivalCurve(
    activeRates,
    termsPerYear,
    effectiveOffset,
    1.0,
    0.0
  );

  // Also build the naive offset=1 curve for MCM so users can see the exact comparison on the survival chart
  const { survivalCurve: naiveOffset1Curve } = buildCohortSurvivalCurve(
    activeRates,
    termsPerYear,
    1,
    1.0,
    0.0
  );

  const rawCohorts = school === 'MCM' ? MCM_COHORTS : MCC_COHORTS;

  // Project each cohort forward from its last observed term using the notebook's exact offset rule
  const getProjectedCohortCells = (cohort: CohortHistoryDef) => {
    const maxTerms = termsPerYear * 4;
    const cells: Record<
      number,
      {
        calendarTerm: string;
        heads: number;
        stepRate: number;
        cumRate: number;
        isProjected: boolean;
      }
    > = {};

    for (let d = 0; d <= maxTerms; d++) {
      const calTerm = stepTerm(cohort.cohortTerm, d, termsPerYear);
      const obs = cohort.observed[d];
      if (obs) {
        const refIdx =
          d === 0
            ? 0
            : termsPerYear === 3 && d % 3 === 0 && effectiveOffset === 2
            ? Math.max(0, d - 2)
            : d - 1;
        const refHeads = cells[refIdx]?.heads ?? cohort.entrants;
        cells[d] = {
          calendarTerm: obs.calendarTerm,
          heads: obs.heads,
          stepRate: d === 0 ? 1.0 : obs.heads / Math.max(1, refHeads),
          cumRate: obs.heads / cohort.entrants,
          isProjected: false,
        };
      } else if (d === 0) {
        cells[0] = {
          calendarTerm: cohort.cohortTerm,
          heads: cohort.entrants,
          stepRate: 1.0,
          cumRate: 1.0,
          isProjected: true,
        };
      } else {
        const rate = activeRates[d - 1] ?? 0;
        const isFallReturn = termsPerYear === 3 && d % 3 === 0;
        const refIdx =
          isFallReturn && effectiveOffset === 2 ? Math.max(0, d - 2) : d - 1;
        const refHeads = cells[refIdx]?.heads ?? 0;
        const projHeads = Math.round(refHeads * rate);
        cells[d] = {
          calendarTerm: calTerm,
          heads: projHeads,
          stepRate: rate,
          cumRate: projHeads / cohort.entrants,
          isProjected: true,
        };
      }
    }
    return cells;
  };

  const cohortColumns = rawCohorts.map((c) => ({
    ...c,
    cells: getProjectedCohortCells(c),
  }));

  const getContributorsForTerm = (term: CensusTargetTerm) => {
    const list: {
      cohortTerm: string;
      entrants: number;
      duration: number;
      heads: number;
      stepRate: number;
      cumRate: number;
      ntrM: number;
      color: string;
      isProjected: boolean;
    }[] = [];

    for (const col of cohortColumns) {
      for (const [dStr, cell] of Object.entries(col.cells)) {
        if (cell.calendarTerm === term && cell.heads > 0) {
          list.push({
            cohortTerm: col.cohortTerm,
            entrants: col.entrants,
            duration: Number(dStr),
            heads: cell.heads,
            stepRate: cell.stepRate,
            cumRate: cell.cumRate,
            ntrM: (cell.heads * ntrPerStudent) / 1e6,
            color: col.color,
            isProjected: cell.isProjected,
          });
        }
      }
    }
    return list;
  };

  const activeContributors = getContributorsForTerm(activeCensus);
  const totalCensusHeads = activeContributors.reduce(
    (sum, c) => sum + c.heads,
    0
  );
  const totalCensusNtrM = (totalCensusHeads * ntrPerStudent) / 1e6;

  const termSummaries = availableTerms.map((t) => {
    const items = getContributorsForTerm(t);
    const totalHeads = items.reduce((s, x) => s + x.heads, 0);
    const totalNtrM = (totalHeads * ntrPerStudent) / 1e6;
    return { term: t, items, totalHeads, totalNtrM };
  });

  const maxTermNtrM = Math.max(
    15,
    Math.ceil(Math.max(...termSummaries.map((t) => t.totalNtrM)) * 1.15)
  );

  const focusedContributor =
    activeContributors.find((c) => c.cohortTerm === selectedCohort) ||
    activeContributors[activeContributors.length - 1];

  const year2FallRate = (survivalCurve[termsPerYear] ?? 0) * 100;
  const naiveYear2FallRate = (naiveOffset1Curve[termsPerYear] ?? 0) * 100;

  return (
    <section data-section="inspector" className="scroll-mt-20">
      <div
        className="text-[10.5px] font-bold tracking-[1.6px] uppercase"
        style={{ color: accent }}
      >
        02 · Stage 2 Cohort Registration Triangle &amp; Spring-to-Fall Offset
      </div>

      <h2 className="font-serif font-normal text-[24px] md:text-[28px] leading-[1.15] tracking-[-0.3px] mt-1.5 text-[#1b1c18]">
        Interactive Cohort Roll-Up &amp; Return-Rate Inspector
      </h2>

      <p className="text-[13.5px] leading-[1.55] text-[#54564c] mt-1.5 max-w-[68ch]">
        Inspect how longitudinal student cohorts (tracked by unique aliased{' '}
        <code className="font-mono text-[12px]">student_id</code> across integer
        term indices) progress across terms. Toggle{' '}
        <strong>Spring-to-Fall Offset = 2</strong> vs.{' '}
        <strong>Naive Offset = 1</strong> on MCM to see why optional Summer
        sessions (<code className="font-mono text-[12px]">13.3%</code> uptake)
        must not be chained into returning Fall headcount.
      </p>

      <InteractiveSplitPanel
        controls={
          <>
            {/* School Calendar Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <div className="flex flex-wrap gap-1.5">
                {(['MCM', 'MCC'] as SchoolCode[]).map((sKey) => {
                  const on = school === sKey;
                  return (
                    <button
                      key={sKey}
                      type="button"
                      onClick={() => {
                        setSchool(sKey);
                        if (sKey === 'MCC' && selectedCensus === '2026SU') {
                          setSelectedCensus('2026FA');
                        }
                      }}
                      className="cursor-pointer text-[12px] font-bold px-3 py-1.5 rounded-[6px] border transition-all duration-150"
                      style={{
                        backgroundColor: on ? accent : '#faf8f2',
                        color: on ? '#fff' : '#44453a',
                        borderColor: on ? accent : '#d8d6cc',
                      }}
                    >
                      {sKey === 'MCM'
                        ? 'MCM · Millbury College of Music (3 Terms/Yr)'
                        : 'MCC · Millbury College Conservatory (2 Terms/Yr)'}
                    </button>
                  );
                })}
              </div>

              {/* COVID Masking Toggle */}
              <button
                type="button"
                onClick={() => setExcludeCovid(!excludeCovid)}
                className="cursor-pointer text-[11px] font-mono font-bold px-2.5 py-1 rounded-[5px] border transition-colors"
                style={{
                  backgroundColor: excludeCovid ? '#faf8f2' : '#fff3eb',
                  color: excludeCovid ? accent : '#b06a3a',
                  borderColor: excludeCovid ? accent : '#b06a3a',
                }}
              >
                {excludeCovid
                  ? 'COVID Masked (Excl. 2020FA–2021SU)'
                  : 'All Historical Terms (Incl. COVID)'}
              </button>
            </div>

            {/* Spring-to-Fall Offset Rule Selector (for MCM 3-term calendar) */}
            {school === 'MCM' && (
              <div className="flex flex-wrap items-center justify-between gap-2 py-2 px-2.5 mb-2 rounded-[6px] bg-[#faf8f2] border border-[#e6e4dc]">
                <span className="text-[11px] font-bold text-[#44453a]">
                  Fall Return Conditioning Rule:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSpringOffset(2)}
                    className="cursor-pointer text-[11px] font-mono font-bold px-2.5 py-1 rounded border transition-colors"
                    style={{
                      backgroundColor: springOffset === 2 ? accent : '#fff',
                      color: springOffset === 2 ? '#fff' : '#44453a',
                      borderColor: springOffset === 2 ? accent : '#d5d2c6',
                    }}
                  >
                    offset = 2 (Spring → Fall: {year2FallRate.toFixed(1)}% Yr 2)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpringOffset(1)}
                    className="cursor-pointer text-[11px] font-mono font-bold px-2.5 py-1 rounded border transition-colors"
                    style={{
                      backgroundColor:
                        springOffset === 1 ? '#b06a3a' : '#fff',
                      color: springOffset === 1 ? '#fff' : '#6f6d64',
                      borderColor:
                        springOffset === 1 ? '#b06a3a' : '#d5d2c6',
                    }}
                  >
                    offset = 1 Naive (Summer → Fall:{' '}
                    {naiveYear2FallRate.toFixed(1)}% Yr 2)
                  </button>
                </div>
              </div>
            )}

            <div className="font-serif text-[13px] italic text-[#54564c] leading-[1.45]">
              {school === 'MCM'
                ? springOffset === 2
                  ? 'Authentic Positron IDE offset = 2 rule: 95.9% of Fall starters enroll in Spring, 13.3% take optional Summer courses, and 89.8% of Spring students return in Fall (86.1% Year-2 Fall retention).'
                  : 'Naive offset = 1 chain bug: multiplying Fall → Spring (95.9%) × Spring → Summer (13.3%) × Summer → Fall (89.8%) falsely treats optional Summer non-attendance as permanent dropout, collapsing Year-2 Fall retention to 11.5%!'
                : 'MCC · Millbury College Conservatory 2-term calendar (Fall & Spring only, INCLUDE_SUMMER = False, offset = 1): 95.3% return in Spring and 89.9% of Spring students return in Year-2 Fall (85.7% Year-2 Fall retention).'}
            </div>

            {/* Census Term Selector */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5 pt-2.5 border-t border-[#eeece4]">
              <span className="text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#6f6d64]">
                Target Census Term:
              </span>
              <div className="flex items-center gap-1.5">
                {availableTerms.map((t) => {
                  const on = activeCensus === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedCensus(t)}
                      className="cursor-pointer font-mono text-[11.5px] font-bold px-2.5 py-1 rounded-[5px] border transition-colors"
                      style={{
                        backgroundColor: on ? accent : '#faf8f2',
                        color: on ? '#fff' : '#1b1c18',
                        borderColor: on ? accent : '#d5d2c6',
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        }
        kpiStrip={
          <>
            <div>
              <div className="text-[10.5px] text-[#6f6d64] font-bold uppercase tracking-[0.5px]">
                Fall Cohort Headcount ({activeCensus})
              </div>
              <div className="text-[22px] font-extrabold tracking-tight text-[#1b1c18] mt-0.5 leading-none font-mono tabular-nums">
                {totalCensusHeads.toLocaleString('en-US')}
                <span className="text-[12px] font-normal text-[#8a887e] ml-1">
                  students
                </span>
              </div>
              <div className="text-[11px] font-mono tabular-nums text-[#6f6d64] mt-1">
                {activeContributors.length} Fall entry cohorts enrolled
              </div>
            </div>

            <div>
              <div className="text-[10.5px] text-[#6f6d64] font-bold uppercase tracking-[0.5px]">
                Term Net Tuition Revenue
              </div>
              <div
                className="text-[22px] font-extrabold tracking-tight mt-0.5 leading-none font-mono tabular-nums"
                style={{
                  color:
                    school === 'MCM' && springOffset === 1 ? '#b06a3a' : accent,
                }}
              >
                ${totalCensusNtrM.toFixed(2)}
                <span className="text-[13px] text-[#8a887e] ml-0.5">M</span>
              </div>
              <div className="text-[11px] font-mono tabular-nums text-[#6f6d64] mt-1">
                {totalCensusHeads.toLocaleString('en-US')} × $
                {ntrPerStudent.toLocaleString('en-US')}/term
              </div>
            </div>
          </>
        }
        summaryTable={
          <>
            <div className="flex items-center justify-between text-[10.5px] font-sans text-[#6f6d64] mb-1.5">
              <span className="font-bold uppercase tracking-[0.5px]">
                Cohort Roll-Up in {activeCensus} (Click class to inspect)
              </span>
              <span>
                Term NTR/St = ${ntrPerStudent.toLocaleString('en-US')}
              </span>
            </div>
            <div className="grid grid-cols-[62px_54px_1fr_1fr_1fr] gap-1 text-[#8a887e] font-sans font-bold text-[10.5px] pb-1 border-b border-[#e3e1d9]">
              <span>Cohort</span>
              <span>Step</span>
              <span className="text-right">Step Rate</span>
              <span className="text-right">Heads</span>
              <span className="text-right">Term NTR</span>
            </div>
            {activeContributors.map((c) => {
              const isSelected = focusedContributor?.cohortTerm === c.cohortTerm;
              return (
                <button
                  key={c.cohortTerm}
                  type="button"
                  onClick={() => setSelectedCohort(c.cohortTerm)}
                  onMouseEnter={() => setSelectedCohort(c.cohortTerm)}
                  className="w-full text-left grid grid-cols-[62px_54px_1fr_1fr_1fr] gap-1 py-1.5 px-1.5 rounded-[4px] border-b border-[#f4f2ea] transition-colors cursor-pointer"
                  style={{
                    backgroundColor: isSelected
                      ? `color-mix(in srgb, ${accent} 10%, #fff)`
                      : 'transparent',
                  }}
                >
                  <span className="font-bold text-[#1b1c18] flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full inline-block shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    {c.cohortTerm}
                  </span>
                  <span className="text-[#6f6d64]">
                    t+{c.duration} {c.isProjected ? '(proj)' : ''}
                  </span>
                  <span className="text-right text-[#54564c]">
                    {c.duration === 0
                      ? '100.0%'
                      : `${(c.stepRate * 100).toFixed(1)}%`}
                  </span>
                  <span className="text-right font-semibold text-[#1b1c18]">
                    {c.heads.toLocaleString('en-US')}
                  </span>
                  <span
                    className="text-right font-bold"
                    style={{ color: isSelected ? accent : '#1b1c18' }}
                  >
                    ${c.ntrM.toFixed(2)}M
                  </span>
                </button>
              );
            })}
            {/* Total Census Row */}
            <div className="grid grid-cols-[62px_54px_1fr_1fr_1fr] gap-1 py-1.5 px-1.5 border-t border-[#d5d2c6] font-bold text-[#1b1c18] bg-[#faf8f2]/80">
              <span className="font-sans">Total</span>
              <span className="text-[#6f6d64]">{activeCensus}</span>
              <span className="text-right text-[#6f6d64]">
                offset={effectiveOffset}
              </span>
              <span className="text-right">
                {totalCensusHeads.toLocaleString('en-US')}
              </span>
              <span className="text-right" style={{ color: accent }}>
                ${totalCensusNtrM.toFixed(2)}M
              </span>
            </div>
          </>
        }
        chartTitle={
          chartMode === 'rollup'
            ? `Census Cohort Roll-Up (${school} · $M Term NTR)`
            : `4-Year Cohort Persistence & Historical Spread (${school})`
        }
        chartHeaderRight={
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setChartMode('rollup')}
              className="cursor-pointer font-sans text-[10.5px] font-bold px-2 py-0.5 rounded border transition-colors"
              style={{
                backgroundColor: chartMode === 'rollup' ? accent : '#faf8f2',
                color: chartMode === 'rollup' ? '#fff' : '#54564c',
                borderColor: chartMode === 'rollup' ? accent : '#d8d6cc',
              }}
            >
              Census Roll-Up
            </button>
            <button
              type="button"
              onClick={() => setChartMode('survival')}
              className="cursor-pointer font-sans text-[10.5px] font-bold px-2 py-0.5 rounded border transition-colors"
              style={{
                backgroundColor: chartMode === 'survival' ? accent : '#faf8f2',
                color: chartMode === 'survival' ? '#fff' : '#54564c',
                borderColor: chartMode === 'survival' ? accent : '#d8d6cc',
              }}
            >
              4-Yr Retention &amp; Spread
            </button>
          </div>
        }
        svgChart={
          chartMode === 'rollup' ? (
            <svg
              viewBox="0 0 420 240"
              className="w-full h-auto select-none"
              role="img"
              aria-label="Stacked cohort roll-up bar chart by census term"
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

              {/* Y-axis labels */}
              <g
                fill="#8a887e"
                fontFamily="Open Sans, sans-serif"
                fontSize="10.5"
                textAnchor="end"
              >
                <text x="42" y="38">
                  ${maxTermNtrM}M
                </text>
                <text x="42" y="118">
                  ${Math.round(maxTermNtrM / 2)}M
                </text>
                <text x="42" y="200">
                  $0M
                </text>
              </g>

              {/* Stacked bars for each census term */}
              {termSummaries.map((ts, tIdx) => {
                const count = termSummaries.length;
                const slotW = 340 / count;
                const barW = Math.min(54, slotW * 0.58);
                const xCenter = 64 + tIdx * slotW + slotW / 2;
                const xLeft = xCenter - barW / 2;
                const isSelectedTerm = ts.term === activeCensus;

                let yCursor = 196;

                return (
                  <g
                    key={ts.term}
                    className="cursor-pointer"
                    onClick={() => setSelectedCensus(ts.term)}
                  >
                    {isSelectedTerm && (
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

                    {ts.items.map((item) => {
                      const h = (item.ntrM / maxTermNtrM) * 162;
                      yCursor -= h;
                      const isFocusedCohort =
                        focusedContributor?.cohortTerm === item.cohortTerm;
                      return (
                        <rect
                          key={item.cohortTerm}
                          x={xLeft}
                          y={yCursor}
                          width={barW}
                          height={Math.max(1.5, h)}
                          fill={item.color}
                          opacity={
                            isSelectedTerm
                              ? isFocusedCohort
                                ? 1
                                : 0.82
                              : 0.55
                          }
                          stroke="#fff"
                          strokeWidth="1"
                          onMouseEnter={() =>
                            setSelectedCohort(item.cohortTerm)
                          }
                        />
                      );
                    })}

                    <text
                      x={xCenter}
                      y={Math.max(16, yCursor - 6)}
                      textAnchor="middle"
                      fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                      fontSize="10"
                      fontWeight={isSelectedTerm ? '700' : '600'}
                      fill={isSelectedTerm ? accent : '#54564c'}
                    >
                      ${ts.totalNtrM.toFixed(1)}M
                    </text>

                    <text
                      x={xCenter}
                      y="213"
                      textAnchor="middle"
                      fontFamily="Open Sans, sans-serif"
                      fontSize="10.5"
                      fontWeight={isSelectedTerm ? '700' : '400'}
                      fill={isSelectedTerm ? '#1b1c18' : '#8a887e'}
                    >
                      {ts.term}
                    </text>
                    <text
                      x={xCenter}
                      y="226"
                      textAnchor="middle"
                      fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                      fontSize="9.5"
                      fill="#6f6d64"
                    >
                      {ts.totalHeads} st
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
              aria-label="4-year cohort persistence curve with historical min-max spread band"
            >
              {/* Grid lines */}
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

              {/* Y labels */}
              <g
                fill="#8a887e"
                fontFamily="Open Sans, sans-serif"
                fontSize="10.5"
                textAnchor="end"
              >
                <text x="42" y="38">
                  100%
                </text>
                <text x="42" y="119">
                  50%
                </text>
                <text x="42" y="200">
                  0%
                </text>
              </g>

              {(() => {
                const maxD = survivalCurve.length - 1;
                const X = (d: number) => 60 + (d / Math.max(1, maxD)) * 334;
                const Y = (s: number) => 196 - s * 162;

                const minC = TRANSITION_RATES[school].minCurve;
                const maxC = TRANSITION_RATES[school].maxCurve;

                const spreadTop = maxC
                  .map((s, d) => `${X(d).toFixed(1)},${Y(s).toFixed(1)}`)
                  .join(' L');
                const spreadBot = [...minC]
                  .map((s, d) => [X(d), Y(s)])
                  .reverse()
                  .map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`)
                  .join(' L');
                const spreadBandD = `M${spreadTop} L${spreadBot} Z`;

                const pathD =
                  'M' +
                  survivalCurve
                    .map((s, d) => `${X(d).toFixed(1)},${Y(s).toFixed(1)}`)
                    .join(' L');

                const naivePathD =
                  'M' +
                  naiveOffset1Curve
                    .map((s, d) => `${X(d).toFixed(1)},${Y(s).toFixed(1)}`)
                    .join(' L');

                return (
                  <>
                    {/* Historical Min-Max Cohort Spread Band */}
                    <path d={spreadBandD} fill={accent} opacity="0.14" />

                    {/* Naive offset=1 reference curve on MCM */}
                    {school === 'MCM' && (
                      <path
                        d={naivePathD}
                        fill="none"
                        stroke="#b06a3a"
                        strokeWidth={springOffset === 1 ? 2.8 : 1.5}
                        strokeDasharray="4 3"
                        opacity={springOffset === 1 ? 1 : 0.75}
                      />
                    )}

                    {/* Active survival curve */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={
                        school === 'MCM' && springOffset === 1
                          ? '#b06a3a'
                          : accent
                      }
                      strokeWidth="2.8"
                    />

                    {survivalCurve.map((s, d) => {
                      const cx = X(d);
                      const cy = Y(s);
                      const isSummer = termsPerYear === 3 && d % 3 === 2;
                      return (
                        <g key={d}>
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isSummer ? 3.2 : 4.2}
                            fill={isSummer ? '#faf8f2' : '#fff'}
                            stroke={
                              school === 'MCM' && springOffset === 1
                                ? '#b06a3a'
                                : accent
                            }
                            strokeWidth="2"
                          />
                          {d % termsPerYear === 0 && (
                            <text
                              x={cx}
                              y="215"
                              textAnchor="middle"
                              fontFamily="Open Sans, sans-serif"
                              fontSize="10"
                              fill="#6f6d64"
                            >
                              Yr {d / termsPerYear + 1} (t+{d})
                            </text>
                          )}
                          {(d === 1 || d === termsPerYear || d === termsPerYear * 2) && (
                            <text
                              x={cx}
                              y={Math.max(16, cy - 8)}
                              textAnchor="middle"
                              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                              fontSize="9.5"
                              fontWeight="700"
                              fill="#1b1c18"
                            >
                              {(s * 100).toFixed(1)}%
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          )
        }
        chartLegend={
          chartMode === 'rollup' ? (
            <>
              {cohortColumns.map((col) => (
                <button
                  key={col.cohortTerm}
                  type="button"
                  onClick={() => setSelectedCohort(col.cohortTerm)}
                  className="cursor-pointer flex items-center gap-1.5 hover:text-[#1b1c18]"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: col.color }}
                  />
                  <span
                    className={
                      focusedContributor?.cohortTerm === col.cohortTerm
                        ? 'font-bold text-[#1b1c18]'
                        : ''
                    }
                  >
                    {col.cohortTerm} ({col.entrants.toLocaleString('en-US')})
                  </span>
                </button>
              ))}
            </>
          ) : (
            <>
              <span className="flex items-center gap-1.5">
                <span
                  className="w-3.5 h-[2.5px] inline-block"
                  style={{ backgroundColor: accent }}
                />
                offset = 2 Spring→Fall Curve
              </span>
              {school === 'MCM' && (
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-[2px] border-t-2 border-dashed border-[#b06a3a] inline-block" />
                  offset = 1 Naive Summer Chain
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <span
                  className="w-3 h-2.5 rounded-[2px] inline-block opacity-25"
                  style={{ backgroundColor: accent }}
                />
                2021FA–2024FA Historical Spread
              </span>
            </>
          )
        }
        chartFooterRight={
          focusedContributor ? (
            <>
              {focusedContributor.cohortTerm} (t+{focusedContributor.duration}):{' '}
              <strong>{focusedContributor.heads.toLocaleString('en-US')}</strong>{' '}
              × ${ntrPerStudent.toLocaleString('en-US')} ={' '}
              <strong style={{ color: accent }}>
                ${focusedContributor.ntrM.toFixed(2)}M
              </strong>
            </>
          ) : undefined
        }
      />
    </section>
  );
};

