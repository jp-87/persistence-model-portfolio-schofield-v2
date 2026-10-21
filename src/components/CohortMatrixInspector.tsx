import React, { useState } from 'react';

interface CohortMatrixInspectorProps {
  accent: string;
}

type InspectorMode = 'diagonal' | 'persistence' | 'sparsity';
type DataRegime = 'synthetic_panel' | 'seasonal_benchmark';
type CensusTargetTerm = '2025FA' | '2026SP' | '2026SU' | '2026FA';
type CalendarRegime = 'MCM_3TERM' | 'MCC_2TERM';

interface MatrixCell {
  calendarTerm: string;
  heads: number;
  rate: number;
  isSummer: boolean;
  isProjected: boolean;
}

interface CohortColumn {
  cohortTerm: string;
  cohortStartLabel: string;
  entrants: number;
  cells: Record<number, MatrixCell>;
}

const CENSUS_TARGETS: {
  term: CensusTargetTerm;
  monthLabel: string;
  stepLabel: string;
  descriptionSynthetic: string;
  descriptionSeasonal: string;
}[] = [
  {
    term: '2025FA',
    monthLabel: 'Fall 2025 (Starts Sept)',
    stepLabel: 'As-Of Census Cut',
    descriptionSynthetic:
      'Observed reference census term (2025FA) on the Seed 42 synthetic panel (MCM 3-term). Sums entering 2025FA freshmen (d=0) with surviving upper-duration cohorts from 2024FA (d=3) and 2023FA (d=6) under geometric decay.',
    descriptionSeasonal:
      'Observed reference census term (2025FA) on the seasonal warehouse benchmark. Sums entering 2025FA freshmen (d=0) with returning cohorts from 2024FA (d=3) and 2023FA (d=6).',
  },
  {
    term: '2026SP',
    monthLabel: 'Spring 2026 (Starts Jan)',
    stepLabel: '+1 Term Forecast',
    descriptionSynthetic:
      'First projected Spring census (2026SP) using MCM fitted continuation rates p_EE(0)=77.3%, p_EE(3)=68.0%, and p_EE(6)=57.4% from siteData.json.',
    descriptionSeasonal:
      'First projected Spring census (2026SP). Combines 2025FA freshmen persisting into Spring (d=1, offset=1) with returning 2024FA sophomores (d=4) and 2023FA juniors (d=7).',
  },
  {
    term: '2026SU',
    monthLabel: 'Summer 2026 (Starts June)',
    stepLabel: '+2 Term Summer Census',
    descriptionSynthetic:
      'Synthetic Summer census (2026SU). Because the Seed 42 generator has no behavioral summer dip, cohorts continue along the smooth Markov decay curve (p_EE(1)=74.1%, p_EE(4)=63.7%).',
    descriptionSeasonal:
      'Seasonal Summer census (2026SU). Captures minimal credit-recovery Summer enrollment (~14.8% of Spring) without distorting the subsequent Fall denominator.',
  },
  {
    term: '2026FA',
    monthLabel: 'Fall 2026 (Starts Sept)',
    stepLabel: '+3 Term Fall Forecast',
    descriptionSynthetic:
      'Next Fall census (2026FA) on the Seed 42 synthetic panel, chaining three consecutive Markov steps S(3) = p_EE(0)·p_EE(1)·p_EE(2) = 41.4% for 2025FA entrants plus incoming 2026FA freshmen.',
    descriptionSeasonal:
      'Next Fall census (2026FA) on the seasonal benchmark. Uses the offset=2 Spring-to-Fall bridge so 2025FA entrants step from 2026SP (d=1) to 2026FA (d=3) at 81.4% of Spring.',
  },
];

// Canonical Seed 42 Synthetic Panel Matrix (derived from siteData.json MCM rates:
// [0.7729, 0.7410, 0.7222, 0.6799, 0.6367, 0.6238, 0.5742, 0.5220, 0.5257])
const SYNTHETIC_PANEL_COLUMNS: CohortColumn[] = [
  {
    cohortTerm: '2023FA',
    cohortStartLabel: 'Fall 2023 (Sep)',
    entrants: 740,
    cells: {
      0: { calendarTerm: '2023FA', heads: 740, rate: 1.0, isSummer: false, isProjected: false },
      1: { calendarTerm: '2024SP', heads: 572, rate: 0.773, isSummer: false, isProjected: false },
      2: { calendarTerm: '2024SU', heads: 424, rate: 0.741, isSummer: true, isProjected: false },
      3: { calendarTerm: '2024FA', heads: 306, rate: 0.722, isSummer: false, isProjected: false },
      4: { calendarTerm: '2025SP', heads: 208, rate: 0.68, isSummer: false, isProjected: false },
      5: { calendarTerm: '2025SU', heads: 133, rate: 0.637, isSummer: true, isProjected: false },
      6: { calendarTerm: '2025FA', heads: 83, rate: 0.624, isSummer: false, isProjected: false },
      7: { calendarTerm: '2026SP', heads: 47, rate: 0.574, isSummer: false, isProjected: true },
      8: { calendarTerm: '2026SU', heads: 25, rate: 0.522, isSummer: true, isProjected: true },
      9: { calendarTerm: '2026FA', heads: 13, rate: 0.526, isSummer: false, isProjected: true },
    },
  },
  {
    cohortTerm: '2024FA',
    cohortStartLabel: 'Fall 2024 (Sep)',
    entrants: 758,
    cells: {
      0: { calendarTerm: '2024FA', heads: 758, rate: 1.0, isSummer: false, isProjected: false },
      1: { calendarTerm: '2025SP', heads: 586, rate: 0.773, isSummer: false, isProjected: false },
      2: { calendarTerm: '2025SU', heads: 434, rate: 0.741, isSummer: true, isProjected: false },
      3: { calendarTerm: '2025FA', heads: 314, rate: 0.722, isSummer: false, isProjected: false },
      4: { calendarTerm: '2026SP', heads: 213, rate: 0.68, isSummer: false, isProjected: true },
      5: { calendarTerm: '2026SU', heads: 136, rate: 0.637, isSummer: true, isProjected: true },
      6: { calendarTerm: '2026FA', heads: 85, rate: 0.624, isSummer: false, isProjected: true },
    },
  },
  {
    cohortTerm: '2025FA',
    cohortStartLabel: 'Fall 2025 (Sep)',
    entrants: 773,
    cells: {
      0: { calendarTerm: '2025FA', heads: 773, rate: 1.0, isSummer: false, isProjected: false },
      1: { calendarTerm: '2026SP', heads: 597, rate: 0.773, isSummer: false, isProjected: true },
      2: { calendarTerm: '2026SU', heads: 443, rate: 0.741, isSummer: true, isProjected: true },
      3: { calendarTerm: '2026FA', heads: 320, rate: 0.722, isSummer: false, isProjected: true },
    },
  },
  {
    cohortTerm: '2026FA',
    cohortStartLabel: 'Fall 2026 (Sep)',
    entrants: 765,
    cells: {
      0: { calendarTerm: '2026FA', heads: 765, rate: 1.0, isSummer: false, isProjected: true },
    },
  },
];

// Illustrative Seasonal Warehouse Benchmark (demonstrating why real 3-term calendars
// with ~15% Summer enrollment require the offset=2 Spring-to-Fall bridge)
const SEASONAL_BENCHMARK_COLUMNS: CohortColumn[] = [
  {
    cohortTerm: '2023FA',
    cohortStartLabel: 'Fall 2023 (Sep)',
    entrants: 740,
    cells: {
      0: { calendarTerm: '2023FA', heads: 740, rate: 1.0, isSummer: false, isProjected: false },
      1: { calendarTerm: '2024SP', heads: 660, rate: 0.892, isSummer: false, isProjected: false },
      2: { calendarTerm: '2024SU', heads: 98, rate: 0.148, isSummer: true, isProjected: false },
      3: { calendarTerm: '2024FA', heads: 537, rate: 0.814, isSummer: false, isProjected: false },
      4: { calendarTerm: '2025SP', heads: 496, rate: 0.924, isSummer: false, isProjected: false },
      5: { calendarTerm: '2025SU', heads: 71, rate: 0.143, isSummer: true, isProjected: false },
      6: { calendarTerm: '2025FA', heads: 438, rate: 0.883, isSummer: false, isProjected: false },
      7: { calendarTerm: '2026SP', heads: 412, rate: 0.941, isSummer: false, isProjected: true },
      8: { calendarTerm: '2026SU', heads: 58, rate: 0.141, isSummer: true, isProjected: true },
      9: { calendarTerm: '2026FA', heads: 376, rate: 0.913, isSummer: false, isProjected: true },
    },
  },
  {
    cohortTerm: '2024FA',
    cohortStartLabel: 'Fall 2024 (Sep)',
    entrants: 758,
    cells: {
      0: { calendarTerm: '2024FA', heads: 758, rate: 1.0, isSummer: false, isProjected: false },
      1: { calendarTerm: '2025SP', heads: 676, rate: 0.892, isSummer: false, isProjected: false },
      2: { calendarTerm: '2025SU', heads: 100, rate: 0.148, isSummer: true, isProjected: false },
      3: { calendarTerm: '2025FA', heads: 550, rate: 0.814, isSummer: false, isProjected: false },
      4: { calendarTerm: '2026SP', heads: 508, rate: 0.924, isSummer: false, isProjected: true },
      5: { calendarTerm: '2026SU', heads: 73, rate: 0.144, isSummer: true, isProjected: true },
      6: { calendarTerm: '2026FA', heads: 449, rate: 0.884, isSummer: false, isProjected: true },
    },
  },
  {
    cohortTerm: '2025FA',
    cohortStartLabel: 'Fall 2025 (Sep)',
    entrants: 773,
    cells: {
      0: { calendarTerm: '2025FA', heads: 773, rate: 1.0, isSummer: false, isProjected: false },
      1: { calendarTerm: '2026SP', heads: 690, rate: 0.893, isSummer: false, isProjected: true },
      2: { calendarTerm: '2026SU', heads: 102, rate: 0.148, isSummer: true, isProjected: true },
      3: { calendarTerm: '2026FA', heads: 562, rate: 0.814, isSummer: false, isProjected: true },
    },
  },
  {
    cohortTerm: '2026FA',
    cohortStartLabel: 'Fall 2026 (Sep)',
    entrants: 765,
    cells: {
      0: { calendarTerm: '2026FA', heads: 765, rate: 1.0, isSummer: false, isProjected: true },
    },
  },
];

interface PersistenceStep {
  termCode: string;
  seasonName: string;
  startMonth: string;
  duration: number;
  offsetUsed: number;
  denominatorTerm: string;
  cohortHeads: number;
  continuationRate: string;
  studentStoryTitle: string;
  studentStoryText: string;
  pipelineMechanicText: string;
}

function buildTrajectorySteps(
  calendarRegime: CalendarRegime,
  maskCovid: boolean
): PersistenceStep[] {
  const spHeads = maskCovid ? 690 : 675;
  const spRate = ((spHeads / 773) * 100).toFixed(1);
  const suHeads = maskCovid ? 102 : 94;
  const suRate = ((suHeads / spHeads) * 100).toFixed(1);
  const faRateNum = maskCovid ? 0.8145 : 0.7763;
  const faHeads = Math.round(spHeads * faRateNum);
  const faRate = (faRateNum * 100).toFixed(1);

  if (calendarRegime === 'MCC_2TERM') {
    return [
      {
        termCode: '2019FA',
        seasonName: 'Fall 2019',
        startMonth: 'Starts September',
        duration: 0,
        offsetUsed: 0,
        denominatorTerm: 'Entry baseline',
        cohortHeads: 773,
        continuationRate: '100.0% (d = 0)',
        studentStoryTitle: 'Freshman Matriculation on 2-Term Calendar (2019FA)',
        studentStoryText:
          'On MCC’s 2-term academic calendar (INCLUDE_SUMMER = False), only Fall (FA) and Spring (SP) terms exist on the duration clock.',
        pipelineMechanicText:
          'Initializes the cohort state vector at terms_since_start d = 0 with N₀ = 773 enrolled students (enrollment_status = "E").',
      },
      {
        termCode: '2020SP',
        seasonName: 'Spring 2020',
        startMonth: 'Starts January',
        duration: 1,
        offsetUsed: 1,
        denominatorTerm: '2019FA (d = 0)',
        cohortHeads: spHeads,
        continuationRate: `${spRate}% of 2019FA`,
        studentStoryTitle: 'First-Year Spring Continuation (2020SP)',
        studentStoryText:
          'Students persist from 2019FA (d = 0) into 2020SP (d = 1). Because MCC runs no Summer session, the next term on the school calendar is 2020FA.',
        pipelineMechanicText: `Adjacent-term transition (offset = 1): divides 2020SP headcount (${spHeads}) by 2019FA headcount (773), yielding p_EE(0) = ${(spHeads / 773).toFixed(4)}.`,
      },
      {
        termCode: '2020FA',
        seasonName: 'Fall 2020',
        startMonth: 'Starts September',
        duration: 2,
        offsetUsed: 1,
        denominatorTerm: '2020SP (d = 1, offset = 1)',
        cohortHeads: faHeads,
        continuationRate: `${faRate}% of 2020SP`,
        studentStoryTitle: 'Sophomore Fall Return on 2-Term Calendar (2020FA)',
        studentStoryText: maskCovid
          ? 'On a 2-term calendar, 2020FA sits immediately at duration d = 2. With COVID-19 shock masking ON (base_table_no_covid), historical Fall continuation averages 81.4% of Spring.'
          : 'With COVID-19 shock masking OFF, including the pandemic shock window (2020FA–2021SU) depresses historical Spring-to-Fall continuation by 3.8 percentage points to 77.6%.',
        pipelineMechanicText: `Because no Summer row exists in MCC, 2020FA is indexed at d = 2 and uses standard offset = 1 relative to 2020SP (${faHeads} / ${spHeads} = ${faRate}%).`,
      },
    ];
  }

  return [
    {
      termCode: '2019FA',
      seasonName: 'Fall 2019',
      startMonth: 'Starts September',
      duration: 0,
      offsetUsed: 0,
      denominatorTerm: 'Entry baseline',
      cohortHeads: 773,
      continuationRate: '100.0% (d = 0)',
      studentStoryTitle: 'Freshman Matriculation (2019FA)',
      studentStoryText:
        'A first-time freshman begins in the 2019 Fall term (2019FA, starts September). In the presentation layer, the first four digits denote the calendar year (2019) and FA denotes Fall.',
      pipelineMechanicText:
        'Initializes the cohort vector at terms_since_start d = 0 with N₀ = 773 enrolled students (enrollment_status = "E").',
    },
    {
      termCode: '2020SP',
      seasonName: 'Spring 2020',
      startMonth: 'Starts January',
      duration: 1,
      offsetUsed: 1,
      denominatorTerm: '2019FA (d = 0)',
      cohortHeads: spHeads,
      continuationRate: `${spRate}% of 2019FA`,
      studentStoryTitle: 'Sequential Persistence & Spring Grade Setback (2020SP)',
      studentStoryText:
        'The student persists into the 2020 Spring term (2020SP, starts January), earns a D in a Spring course, and uses the optional Summer session to recover credit before sophomore year.',
      pipelineMechanicText: `Standard adjacent-term transition (offset = 1): divides 2020SP headcount (${spHeads}, d = 1) by 2019FA headcount (773, d = 0), yielding p_EE(0) = ${(spHeads / 773).toFixed(4)}.`,
    },
    {
      termCode: '2020SU',
      seasonName: 'Summer 2020',
      startMonth: 'Starts June',
      duration: 2,
      offsetUsed: 1,
      denominatorTerm: '2020SP (d = 1)',
      cohortHeads: suHeads,
      continuationRate: `${suRate}% of 2020SP`,
      studentStoryTitle: 'Summer Credit-Recovery Enrollment (2020SU)',
      studentStoryText:
        'To replace the D earned in 2020SP, the student enrolls in a Summer 2020 course (2020SU, starts June). On a real seasonal campus, Summer enrollment is ~15% of Spring because most students take Summer off.',
      pipelineMechanicText: `Tracked at d = 2 with offset = 1 relative to 2020SP (${suHeads} / ${spHeads} = ${suRate}%) so Summer credit-recovery headcount is captured on the 2020SU diagonal without treating ${suHeads} as the base denominator for Fall.`,
    },
    {
      termCode: '2020FA',
      seasonName: 'Fall 2020',
      startMonth: 'Starts September',
      duration: 3,
      offsetUsed: 2,
      denominatorTerm: '2020SP (d = 1, offset = 2)',
      cohortHeads: faHeads,
      continuationRate: `${faRate}% of 2020SP`,
      studentStoryTitle: 'Sophomore Fall Return via Spring-to-Fall Bridge (2020FA)',
      studentStoryText: maskCovid
        ? 'Having completed credit recovery in 2020SU, the student returns alongside peers who took Summer off for 2020FA (d = 3). With COVID-19 masking ON (base_table_no_covid), Fall continuation averages 81.4% of Spring.'
        : 'With COVID-19 shock masking OFF, unmasked pandemic attrition in 2020FA–2021SU lowers historical Spring-to-Fall continuation from 81.4% to 77.6% (−3.8 pp).',
      pipelineMechanicText: `Because 2020SU enrollment is minimal (${suHeads} students), dividing 2020FA (${faHeads}) by 2020SU (${suHeads}) would yield an invalid ${Math.round((faHeads / suHeads) * 100)}% ratio. Setting offset = 2 on Fall terms bridges from 2020SP (d = 1) to 2020FA (d = 3): ${faHeads} / ${spHeads} = ${faRate}%.`,
    },
  ];
}

export const CohortMatrixInspector: React.FC<CohortMatrixInspectorProps> = ({
  accent,
}) => {
  const [mode, setMode] = useState<InspectorMode>('diagonal');
  const [dataRegime, setDataRegime] = useState<DataRegime>('synthetic_panel');
  const [selectedCensus, setSelectedCensus] =
    useState<CensusTargetTerm>('2026SP');
  const [selectedStepIdx, setSelectedStepIdx] = useState<number>(2);
  const [calendarRegime, setCalendarRegime] =
    useState<CalendarRegime>('MCM_3TERM');
  const [maskCovid, setMaskCovid] = useState<boolean>(true);
  const [sampleCellSize, setSampleCellSize] = useState<number>(8);
  const [kPrior, setKPrior] = useState<number>(50);

  const activeColumns =
    dataRegime === 'synthetic_panel'
      ? SYNTHETIC_PANEL_COLUMNS
      : SEASONAL_BENCHMARK_COLUMNS;

  const activeTargetMeta =
    CENSUS_TARGETS.find((t) => t.term === selectedCensus) || CENSUS_TARGETS[1];

  // Sum diagonal cells matching selectedCensus
  const diagonalContributors: {
    cohortTerm: string;
    duration: number;
    heads: number;
    rate: number;
    isProjected: boolean;
  }[] = [];

  for (const col of activeColumns) {
    for (const [dStr, cell] of Object.entries(col.cells)) {
      if (cell.calendarTerm === selectedCensus) {
        diagonalContributors.push({
          cohortTerm: col.cohortTerm,
          duration: Number(dStr),
          heads: cell.heads,
          rate: cell.rate,
          isProjected: cell.isProjected,
        });
      }
    }
  }

  const totalCensusHeads = diagonalContributors.reduce(
    (acc, item) => acc + item.heads,
    0
  );

  // Mode 2 dynamic trajectory
  const trajectorySteps = buildTrajectorySteps(calendarRegime, maskCovid);
  const safeStepIdx = Math.min(selectedStepIdx, trajectorySteps.length - 1);
  const activeStep = trajectorySteps[safeStepIdx];

  // Sparsity calculations for Mode 3
  const schoolPriorRate = 0.7729; // MCM p_bar at d=0 from siteData.json
  const observedSuccesses =
    sampleCellSize <= 6 ? sampleCellSize : Math.round(sampleCellSize * 0.95);
  const rawRate = observedSuccesses / sampleCellSize;
  const shrunkRate =
    (sampleCellSize * rawRate + kPrior * schoolPriorRate) /
    (sampleCellSize + kPrior);
  const cellWeight = sampleCellSize / (sampleCellSize + kPrior);
  const approxPosteriorSe = Math.sqrt(
    (shrunkRate * (1 - shrunkRate)) / (sampleCellSize + kPrior + 1)
  );
  const legacyRetained = sampleCellSize > 20;

  return (
    <div className="border border-[#e3e1d9] rounded-[10px] p-4.5 md:p-5.5 bg-white/85 mt-1">
      {/* Header & YYYYTT Term Code Legend */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-3.5 border-b border-[#e8e6dc]">
        <div>
          <div className="text-[14px] font-bold text-[#1b1c18]">
            Stage 2 Pipeline Mechanics &amp; Cohort-Matrix Inspector
          </div>
          <div className="text-[12px] text-[#5a5b50] mt-0.5 leading-[1.45]">
            Operationalization of{' '}
            <code className="font-mono text-[11.5px]">
              batched_cohort_projections_prep
            </code>{' '}
            comparing the canonical Seed 42 synthetic panel against seasonal{' '}
            <strong className="font-semibold text-[#1b1c18]">YYYYTT</strong>{' '}
            warehouse mechanics
          </div>
        </div>

        <div className="font-mono text-[11px] text-[#54564c]">
          <span className="font-semibold text-[#1b1c18]">YYYYTT</span>: 4-digit
          year · <span className="font-semibold text-[#1b1c18]">FA</span> (Sep)
          · <span className="font-semibold text-[#1b1c18]">SP</span> (Jan) ·{' '}
          <span className="font-semibold text-[#1b1c18]">SU</span> (Jun)
        </div>
      </div>

      {/* Mode Switcher (Interactive Segmented Buttons) */}
      <div
        role="tablist"
        aria-label="Stage 2 pipeline mechanics modes"
        className="flex flex-wrap items-center gap-1.5 p-1 bg-[#efede4] rounded-[8px] mt-3.5"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'diagonal'}
          onClick={() => setMode('diagonal')}
          className={`cursor-pointer px-3 py-1.5 text-[12px] font-semibold rounded-[6px] transition-colors whitespace-nowrap shrink-0 ${
            mode === 'diagonal'
              ? 'bg-white text-[#1b1c18] shadow-xs'
              : 'text-[#54564c] hover:text-[#1b1c18]'
          }`}
        >
          1. Diagonal Census Aggregation (proj_term)
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'persistence'}
          onClick={() => setMode('persistence')}
          className={`cursor-pointer px-3 py-1.5 text-[12px] font-semibold rounded-[6px] transition-colors whitespace-nowrap shrink-0 ${
            mode === 'persistence'
              ? 'bg-white text-[#1b1c18] shadow-xs'
              : 'text-[#54564c] hover:text-[#1b1c18]'
          }`}
        >
          2. 2019FA → 2020SP → 2020SU Credit Recovery &amp; offset = 2
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'sparsity'}
          onClick={() => setMode('sparsity')}
          className={`cursor-pointer px-3 py-1.5 text-[12px] font-semibold rounded-[6px] transition-colors whitespace-nowrap shrink-0 ${
            mode === 'sparsity'
              ? 'bg-white text-[#1b1c18] shadow-xs'
              : 'text-[#54564c] hover:text-[#1b1c18]'
          }`}
        >
          3. Small-Cell Sparsity &amp; Empirical Bayes (k = {kPrior})
        </button>
      </div>

      {/* MODE 1: DIAGONAL COHORT-TO-CENSUS MATRIX AGGREGATION */}
      {mode === 'diagonal' && (
        <div className="mt-4">
          {/* Data Regime Toggle resolving the Synthetic vs. Seasonal Summer discrepancy */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-[#efede6]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.7px] text-[#6f6d64]">
                Data Regime:
              </span>
              <button
                type="button"
                onClick={() => setDataRegime('synthetic_panel')}
                className="cursor-pointer text-[12px] font-semibold px-2.5 py-1 rounded-[5px] border transition-colors whitespace-nowrap shrink-0"
                style={{
                  backgroundColor:
                    dataRegime === 'synthetic_panel' ? accent : '#faf8f2',
                  color: dataRegime === 'synthetic_panel' ? '#fff' : '#1b1c18',
                  borderColor:
                    dataRegime === 'synthetic_panel' ? accent : '#d5d2c6',
                }}
              >
                Canonical Synthetic Panel (Seed 42 · siteData.json)
              </button>
              <button
                type="button"
                onClick={() => setDataRegime('seasonal_benchmark')}
                className="cursor-pointer text-[12px] font-semibold px-2.5 py-1 rounded-[5px] border transition-colors whitespace-nowrap shrink-0"
                style={{
                  backgroundColor:
                    dataRegime === 'seasonal_benchmark' ? accent : '#faf8f2',
                  color:
                    dataRegime === 'seasonal_benchmark' ? '#fff' : '#1b1c18',
                  borderColor:
                    dataRegime === 'seasonal_benchmark' ? accent : '#d5d2c6',
                }}
              >
                Seasonal Warehouse Benchmark (14.8% SU Dip · offset = 2)
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.7px] text-[#6f6d64] mr-1">
                Target Census (proj_term):
              </span>
              {CENSUS_TARGETS.map((t) => (
                <button
                  key={t.term}
                  type="button"
                  onClick={() => setSelectedCensus(t.term)}
                  className="cursor-pointer font-mono text-[12px] font-semibold px-2.5 py-1 rounded-[5px] border transition-colors whitespace-nowrap shrink-0"
                  style={{
                    backgroundColor:
                      selectedCensus === t.term ? accent : '#faf8f2',
                    color: selectedCensus === t.term ? '#fff' : '#1b1c18',
                    borderColor:
                      selectedCensus === t.term ? accent : '#d5d2c6',
                  }}
                >
                  {t.term}
                </button>
              ))}
            </div>
          </div>

          <div className="text-[12.5px] text-[#44453a] mb-3 leading-[1.55]">
            {dataRegime === 'synthetic_panel' ? (
              <span>
                <strong>Canonical Synthetic Panel (Seed 42):</strong> Uses the
                exact fitted MCM continuation rates from{' '}
                <code className="font-mono text-[11.5px]">siteData.json</code> (
                <code className="font-mono text-[11.5px]">
                  p_EE = [0.773, 0.741, 0.722, …]
                </code>
                ). Because the synthetic generator plants smooth geometric decay
                without a behavioral summer dip, Summer rows follow the same
                monotone survival curve as Fall and Spring.
              </span>
            ) : (
              <span>
                <strong>Illustrative Seasonal Benchmark:</strong> Demonstrates
                why real-world 3-term warehouse extracts (where optional Summer{' '}
                <code className="font-mono text-[11.5px]">SU</code> enrollment
                drops to ~14.8% of Spring) require{' '}
                <code className="font-mono text-[11.5px]">offset = 2</code>{' '}
                Spring-to-Fall bridging in{' '}
                <code className="font-mono text-[11.5px]">ret_rates_proj</code>{' '}
                and <code className="font-mono text-[11.5px]">--season</code>{' '}
                stratification in the Markov model.
              </span>
            )}
          </div>

          {/* Selected Census Summary Banner */}
          <div className="border border-[#e3e1d9] rounded-[8px] p-3.5 bg-[#faf8f2] mb-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="max-w-[62ch]">
              <div className="text-[11px] font-bold uppercase tracking-[0.7px] text-[#6f6d64]">
                {activeTargetMeta.stepLabel} · {activeTargetMeta.monthLabel}
              </div>
              <div className="text-[12.5px] text-[#44453a] mt-0.5">
                {dataRegime === 'synthetic_panel'
                  ? activeTargetMeta.descriptionSynthetic
                  : activeTargetMeta.descriptionSeasonal}
              </div>
            </div>
            <div className="text-right font-mono tabular-nums">
              <div className="text-[11px] text-[#6f6d64]">
                Diagonal Sum for {selectedCensus}
              </div>
              <div
                className="text-[22px] font-extrabold leading-tight"
                style={{ color: accent }}
              >
                {totalCensusHeads.toLocaleString('en-US')} heads
              </div>
              <div className="text-[11px] text-[#54564c]">
                {diagonalContributors
                  .map((c) => `${c.cohortTerm}@d=${c.duration} (${c.heads})`)
                  .join(' + ')}
              </div>
            </div>
          </div>

          {/* Cohort x Duration Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-mono tabular-nums text-[11.5px]">
              <thead>
                <tr className="border-b-2 border-[#1b1c18] text-left text-[#6f6d64] font-sans text-[11px]">
                  <th className="py-2 pr-3 font-bold">
                    Duration (terms_since_start)
                  </th>
                  {activeColumns.map((col) => (
                    <th key={col.cohortTerm} className="py-2 px-2.5 font-bold">
                      <div className="font-mono text-[12px] text-[#1b1c18]">
                        {col.cohortTerm}
                      </div>
                      <div className="font-normal text-[10.5px] text-[#6f6d64]">
                        {col.cohortStartLabel} · N₀={col.entrants}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efede6]">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((d) => {
                  const isSummerRow = d % 3 === 2;
                  const seasonAtRow =
                    d % 3 === 0
                      ? 'FA (Sep)'
                      : d % 3 === 1
                        ? 'SP (Jan)'
                        : dataRegime === 'synthetic_panel'
                          ? 'SU (Jun · continuous DGP)'
                          : 'SU (Jun · minimal)';
                  return (
                    <tr
                      key={d}
                      className={isSummerRow ? 'bg-[#faf8f2]/70' : ''}
                    >
                      <td className="py-2 pr-3 whitespace-nowrap">
                        <span className="font-bold text-[#1b1c18]">d = {d}</span>{' '}
                        <span className="font-sans text-[11px] text-[#6f6d64]">
                          · {seasonAtRow}
                        </span>
                      </td>
                      {activeColumns.map((col) => {
                        const cell = col.cells[d];
                        if (!cell) {
                          return (
                            <td
                              key={col.cohortTerm}
                              className="py-2 px-2.5 text-[#b5b3a8]"
                            >
                              — (future)
                            </td>
                          );
                        }
                        const isMatch = cell.calendarTerm === selectedCensus;
                        return (
                          <td
                            key={col.cohortTerm}
                            className="py-2 px-2.5 rounded-[4px] transition-colors"
                            style={{
                              backgroundColor: isMatch
                                ? `color-mix(in srgb, ${accent} 14%, #fff)`
                                : 'transparent',
                              outline: isMatch
                                ? `1.5px solid ${accent}`
                                : 'none',
                            }}
                          >
                            <div className="flex items-baseline justify-between gap-2">
                              <span
                                className="font-bold"
                                style={{
                                  color: isMatch ? accent : '#1b1c18',
                                }}
                              >
                                {cell.calendarTerm}
                              </span>
                              <span className="text-[10.5px] text-[#6f6d64]">
                                {cell.isProjected ? 'proj' : 'obs'}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#44453a] mt-0.5">
                              <strong>{cell.heads}</strong> heads ·{' '}
                              {(cell.rate * 100).toFixed(1)}%
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODE 2: SEQUENTIAL PERSISTENCE (2019FA -> 2020SP -> 2020SU -> 2020FA) & OFFSET=2 BRIDGE */}
      {mode === 'persistence' && (
        <div className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
            <div className="text-[12.5px] text-[#44453a] max-w-[64ch] leading-[1.55]">
              Illustrative seasonal trajectory showing how{' '}
              <strong className="font-semibold text-[#1b1c18]">
                YYYYTT
              </strong>{' '}
              presentation codes (<code className="font-mono text-[11.5px]">FA</code>,{' '}
              <code className="font-mono text-[11.5px]">SP</code>,{' '}
              <code className="font-mono text-[11.5px]">SU</code>) interact with{' '}
              <code className="font-mono text-[11.5px]">INCLUDE_SUMMER</code>,{' '}
              <code className="font-mono text-[11.5px]">offset = 2</code>{' '}
              bridging, and{' '}
              <code className="font-mono text-[11.5px]">base_table_no_covid</code>{' '}
              pandemic shock censoring. Toggle the calendar regime or COVID mask
              to observe live recalculation.
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const next =
                    calendarRegime === 'MCM_3TERM' ? 'MCC_2TERM' : 'MCM_3TERM';
                  setCalendarRegime(next);
                  if (next === 'MCC_2TERM' && selectedStepIdx > 2) {
                    setSelectedStepIdx(2);
                  }
                }}
                className="cursor-pointer font-mono text-[11.5px] font-semibold px-2.5 py-1 rounded-[5px] border border-[#d5d2c6] bg-[#faf8f2] text-[#1b1c18] hover:border-[#1b1c18] whitespace-nowrap shrink-0"
              >
                School Calendar:{' '}
                {calendarRegime === 'MCM_3TERM'
                  ? 'MCM (3 terms/yr · INCLUDE_SUMMER=True)'
                  : 'MCC (2 terms/yr · INCLUDE_SUMMER=False)'}
              </button>
              <button
                type="button"
                onClick={() => setMaskCovid(!maskCovid)}
                className="cursor-pointer font-mono text-[11.5px] font-semibold px-2.5 py-1 rounded-[5px] border transition-colors whitespace-nowrap shrink-0"
                style={{
                  backgroundColor: maskCovid ? accent : '#b06a3a',
                  color: '#fff',
                  borderColor: maskCovid ? accent : '#b06a3a',
                }}
              >
                COVID Mask (2020FA–2021SU): {maskCovid ? 'ON (Masked)' : 'OFF (Unmasked)'}
              </button>
            </div>
          </div>

          {/* Sequential Progression Selector */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 ${
              trajectorySteps.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
            } gap-2.5`}
          >
            {trajectorySteps.map((step, idx) => {
              const isSelected = safeStepIdx === idx;
              return (
                <button
                  key={step.termCode}
                  type="button"
                  onClick={() => setSelectedStepIdx(idx)}
                  className="cursor-pointer text-left border rounded-[8px] p-3 transition-all"
                  style={{
                    borderColor: isSelected ? accent : '#e3e1d9',
                    backgroundColor: isSelected
                      ? `color-mix(in srgb, ${accent} 8%, #fff)`
                      : '#fff',
                  }}
                >
                  <div className="flex items-baseline justify-between gap-1 font-mono tabular-nums">
                    <span
                      className="text-[14px] font-bold"
                      style={{ color: isSelected ? accent : '#1b1c18' }}
                    >
                      {step.termCode}
                    </span>
                    <span className="text-[11px] text-[#6f6d64]">
                      d = {step.duration} · offset = {step.offsetUsed}
                    </span>
                  </div>
                  <div className="text-[11.5px] font-semibold text-[#1b1c18] mt-1">
                    {step.seasonName} ({step.startMonth})
                  </div>
                  <div className="font-mono tabular-nums text-[11.5px] text-[#54564c] mt-1.5">
                    {step.cohortHeads} heads ({step.continuationRate})
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Narrative Card for Selected Step */}
          <div className="border border-[#e3e1d9] rounded-[8px] p-4 bg-[#faf8f2] mt-3.5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.7px] text-[#6f6d64]">
                Student Persistence &amp; Calendar Trajectory
              </div>
              <div className="text-[13.5px] font-bold text-[#1b1c18] mt-1">
                {activeStep.studentStoryTitle}
              </div>
              <p className="text-[12.5px] leading-[1.55] text-[#44453a] mt-1.5">
                {activeStep.studentStoryText}
              </p>
            </div>
            <div className="border-t md:border-t-0 md:border-l border-[#e3e1d9] pt-3 md:pt-0 md:pl-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.7px] text-[#6f6d64]">
                Pipeline Rate Estimator (base_table &amp; offset Bridge)
              </div>
              <div className="font-mono text-[12px] font-semibold text-[#1b1c18] mt-1">
                Denominator: {activeStep.denominatorTerm}
              </div>
              <p className="text-[12.5px] leading-[1.55] text-[#44453a] mt-1.5">
                {activeStep.pipelineMechanicText}
              </p>
            </div>
          </div>

          {/* COVID-19 Shock Window Callout */}
          <div className="mt-3 pt-3 border-t border-[#efede6] flex flex-wrap items-center justify-between gap-2 text-[12px] text-[#54564c]">
            <div>
              <strong className="font-semibold text-[#1b1c18]">
                COVID-19 Shock Window Censoring (<code className="font-mono text-[11.5px]">base_table_no_covid</code>):
              </strong>{' '}
              {maskCovid ? (
                <span>
                  Pandemic terms <code className="font-mono font-semibold text-[#1b1c18]">2020FA</code>,{' '}
                  <code className="font-mono font-semibold text-[#1b1c18]">2021SP</code>, and{' '}
                  <code className="font-mono font-semibold text-[#1b1c18]">2021SU</code> are masked before computing{' '}
                  <code className="font-mono">fall_means = 0.814</code>,{' '}
                  <code className="font-mono">spring_means = 0.893</code>, and{' '}
                  <code className="font-mono">summer_means = 0.148</code>.
                </span>
              ) : (
                <span className="text-[#b06a3a] font-medium">
                  Unmasked: Including <code className="font-mono">2020FA</code>,{' '}
                  <code className="font-mono">2021SP</code>, and{' '}
                  <code className="font-mono">2021SU</code> shifts{' '}
                  <code className="font-mono">fall_means</code> to{' '}
                  <code className="font-mono">0.776</code> (−3.8 pp) and reduces
                  projected 2020FA returners from 562 to 536 heads.
                </span>
              )}
            </div>
            <span className="font-mono text-[11px] text-[#6f6d64]">
              exclude_terms = [2020FA, 2021SP, 2021SU]
            </span>
          </div>
        </div>
      )}

      {/* MODE 3: SMALL-CELL SPARSITY PROOF & EMPIRICAL BAYES SHRINKAGE */}
      {mode === 'sparsity' && (
        <div className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="border border-[#e3e1d9] rounded-[8px] p-3.5 bg-[#faf8f2]">
              <div className="text-[11px] font-bold uppercase tracking-[0.7px] text-[#6f6d64]">
                Legacy 5-Way Segment Partition
              </div>
              <div className="font-mono tabular-nums text-[22px] font-extrabold text-[#1b1c18] mt-1">
                233 segments
              </div>
              <div className="text-[12px] text-[#54564c] mt-0.5">
                Across 40,118 warehouse records partitioned by{' '}
                <code className="font-mono text-[11px]">projection_code</code>
              </div>
            </div>

            <div className="border border-[#e3e1d9] rounded-[8px] p-3.5 bg-[#faf8f2]">
              <div className="text-[11px] font-bold uppercase tracking-[0.7px] text-[#6f6d64]">
                Legacy Cutoff (projection_counts &gt; 20)
              </div>
              <div className="font-mono tabular-nums text-[22px] font-extrabold text-[#b06a3a] mt-1">
                73 dropped (31.3%)
              </div>
              <div className="text-[12px] text-[#54564c] mt-0.5">
                160 segments retained; 73 low-volume cohorts discarded by hard
                thresholding
              </div>
            </div>

            <div className="border border-[#e3e1d9] rounded-[8px] p-3.5 bg-[#faf8f2]">
              <div className="text-[11px] font-bold uppercase tracking-[0.7px] text-[#6f6d64]">
                Empirical Bayes Pooling (k = {kPrior})
              </div>
              <div
                className="font-mono tabular-nums text-[22px] font-extrabold mt-1"
                style={{ color: accent }}
              >
                Zero dropped (100%)
              </div>
              <div className="text-[12px] text-[#54564c] mt-0.5">
                Shrinks noisy small cells toward MCM school baseline{' '}
                <span className="font-mono">p̄ = 77.3%</span> (d = 0)
              </div>
            </div>
          </div>

          {/* Interactive Small-Cell Regularization Explorer */}
          <div className="border border-[#e3e1d9] rounded-[8px] p-4 bg-[#faf8f2]">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <label
                  htmlFor="sparsity-cell-size"
                  className="text-[12.5px] font-bold text-[#1b1c18] block"
                >
                  Interactive Cell-Size (n = {sampleCellSize}) &amp; Prior
                  Strength (k = {kPrior}) Credibility Explorer
                </label>
                <div className="text-[11.5px] text-[#54564c]">
                  Observe how a segment with {observedSuccesses}/
                  {sampleCellSize} persisting students blends with the school
                  pool (<span className="font-mono">p̄ = 0.7729</span>):
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono text-[#6f6d64]">
                    Cell n:
                  </span>
                  {[4, 8, 15, 25, 60].map((presetN) => (
                    <button
                      key={presetN}
                      type="button"
                      onClick={() => setSampleCellSize(presetN)}
                      className="cursor-pointer font-mono text-[11.5px] font-semibold px-2 py-0.5 rounded border transition-colors"
                      style={{
                        backgroundColor:
                          sampleCellSize === presetN ? accent : '#fff',
                        color: sampleCellSize === presetN ? '#fff' : '#1b1c18',
                        borderColor:
                          sampleCellSize === presetN ? accent : '#d5d2c6',
                      }}
                    >
                      n={presetN}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono text-[#6f6d64]">
                    Prior k:
                  </span>
                  {[0, 20, 50, 100].map((presetK) => (
                    <button
                      key={presetK}
                      type="button"
                      onClick={() => setKPrior(presetK)}
                      className="cursor-pointer font-mono text-[11.5px] font-semibold px-2 py-0.5 rounded border transition-colors"
                      style={{
                        backgroundColor: kPrior === presetK ? accent : '#fff',
                        color: kPrior === presetK ? '#fff' : '#1b1c18',
                        borderColor: kPrior === presetK ? accent : '#d5d2c6',
                      }}
                    >
                      k={presetK}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <input
              id="sparsity-cell-size"
              type="range"
              min={2}
              max={80}
              value={sampleCellSize}
              onChange={(e) => setSampleCellSize(Number(e.target.value))}
              className="w-full accent-[#0d4f30] cursor-pointer mb-3"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono tabular-nums text-[12px]">
              <div className="border border-[#e3e1d9] rounded p-3 bg-white">
                <div className="font-sans text-[11px] font-bold uppercase text-[#6f6d64]">
                  1. Hard Filter (n &gt; 20)
                </div>
                <div
                  className="text-[16px] font-bold mt-1"
                  style={{ color: legacyRetained ? '#1b1c18' : '#b06a3a' }}
                >
                  {legacyRetained
                    ? `Retained (${(rawRate * 100).toFixed(1)}%)`
                    : 'DROPPED (Excluded)'}
                </div>
                <div className="font-sans text-[11.5px] text-[#54564c] mt-1">
                  {legacyRetained
                    ? 'Exceeds n > 20 threshold in batched_cohort_projections_prep.'
                    : 'Fails projection_counts > 20 check; students omitted from segment matrix.'}
                </div>
              </div>

              <div className="border border-[#e3e1d9] rounded p-3 bg-white">
                <div className="font-sans text-[11px] font-bold uppercase text-[#6f6d64]">
                  2. Unshrunk MLE (p̂ = x/n)
                </div>
                <div className="text-[16px] font-bold text-[#1b1c18] mt-1">
                  {(rawRate * 100).toFixed(1)}% ({observedSuccesses}/
                  {sampleCellSize})
                </div>
                <div className="font-sans text-[11.5px] text-[#54564c] mt-1">
                  {rawRate >= 0.999
                    ? 'Boundary spike (p̂ = 1.000): implies zero attrition forever when chained.'
                    : 'High sampling variance at small n compounds across multi-term horizons.'}
                </div>
              </div>

              <div className="border border-[#e3e1d9] rounded p-3 bg-white">
                <div className="font-sans text-[11px] font-bold uppercase text-[#6f6d64]">
                  3. Credibility Shrinkage (k = {kPrior})
                </div>
                <div
                  className="text-[16px] font-bold mt-1"
                  style={{ color: accent }}
                >
                  {(shrunkRate * 100).toFixed(1)}% (w ={' '}
                  {(cellWeight * 100).toFixed(0)}% cell · SE ±
                  {(approxPosteriorSe * 100).toFixed(1)}%)
                </div>
                <div className="font-sans text-[11.5px] text-[#54564c] mt-1">
                  p̃ = ({sampleCellSize}·{rawRate.toFixed(3)} + {kPrior}·
                  {schoolPriorRate.toFixed(3)}) / ({sampleCellSize} + {kPrior})
                  = {shrunkRate.toFixed(4)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
