import React, { useState } from 'react';
import siteDataRaw from '../data/siteData.json';
import { SiteData } from '../data/types';
import {
  buildCohortSurvivalCurve,
  termIntToTerm,
  termToTermInt,
} from '../utils/calculator';

const SITE_DATA = siteDataRaw as unknown as SiteData;

interface CohortMatrixInspectorProps {
  accent: string;
}

type SchoolCode = 'MCM' | 'MCC';
type CensusTargetTerm = '2025SU' | '2025FA' | '2026SP' | '2026SU' | '2026FA';

export type IntakeType = 'fall' | 'spring' | 'summer';

interface CohortHistoryDef {
  cohortTerm: string;
  entrants: number;
  color: string;
  intakeType: IntakeType;
  standingLabel: string;
  observed: Record<number, { calendarTerm: string; heads: number }>;
}

/**
 * Stage 2 Positron IDE Cohort Registration Triangles
 * (`cohort_projections_prep.ipynb` & `batched_cohort_projections_prep.ipynb`):
 * Multi-intake architecture sorted in chronological integer `term_int` order:
 * Summer (YYYYSU = YYYY1) -> Fall (YYYYFA = YYYY2) -> Spring (YYYYSP = (YYYY-1)3)
 */
const MCM_COHORTS: CohortHistoryDef[] = [
  {
    cohortTerm: '2021FA', // cohort_int: 20212
    entrants: 1345,
    color: '#9c998e',
    intakeType: 'fall',
    standingLabel: '5th-Year Fall Starters',
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
    cohortTerm: '2022SP', // cohort_int: 20213
    entrants: 244,
    color: '#83c5be',
    intakeType: 'spring',
    standingLabel: '4th-Year Spring Starters',
    observed: {
      0: { calendarTerm: '2022SP', heads: 244 },
      1: { calendarTerm: '2022SU', heads: 45 },
      2: { calendarTerm: '2022FA', heads: 218 },
      3: { calendarTerm: '2023SP', heads: 208 },
      4: { calendarTerm: '2023SU', heads: 58 },
      5: { calendarTerm: '2023FA', heads: 194 },
      6: { calendarTerm: '2024SP', heads: 185 },
      7: { calendarTerm: '2024SU', heads: 62 },
      8: { calendarTerm: '2024FA', heads: 168 },
      9: { calendarTerm: '2025SP', heads: 156 },
      10: { calendarTerm: '2025SU', heads: 36 },
      11: { calendarTerm: '2025FA', heads: 134 },
    },
  },
  {
    cohortTerm: '2022FA', // cohort_int: 20222
    entrants: 1245,
    color: '#7a786e',
    intakeType: 'fall',
    standingLabel: 'Seniors (Year 4 Fall)',
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
    cohortTerm: '2023SP', // cohort_int: 20223
    entrants: 182,
    color: '#5bc0be',
    intakeType: 'spring',
    standingLabel: '3rd-Year Spring Starters',
    observed: {
      0: { calendarTerm: '2023SP', heads: 182 },
      1: { calendarTerm: '2023SU', heads: 38 },
      2: { calendarTerm: '2023FA', heads: 165 },
      3: { calendarTerm: '2024SP', heads: 158 },
      4: { calendarTerm: '2024SU', heads: 48 },
      5: { calendarTerm: '2024FA', heads: 146 },
      6: { calendarTerm: '2025SP', heads: 139 },
      7: { calendarTerm: '2025SU', heads: 42 },
      8: { calendarTerm: '2025FA', heads: 128 },
    },
  },
  {
    cohortTerm: '2023FA', // cohort_int: 20232
    entrants: 1111,
    color: '#b06a3a',
    intakeType: 'fall',
    standingLabel: 'Juniors (Year 3 Fall)',
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
    cohortTerm: '2024SP', // cohort_int: 20233
    entrants: 186,
    color: '#2596be',
    intakeType: 'spring',
    standingLabel: '2nd-Year Spring Starters',
    observed: {
      0: { calendarTerm: '2024SP', heads: 186 },
      1: { calendarTerm: '2024SU', heads: 42 },
      2: { calendarTerm: '2024FA', heads: 168 },
      3: { calendarTerm: '2025SP', heads: 159 },
      4: { calendarTerm: '2025SU', heads: 46 },
      5: { calendarTerm: '2025FA', heads: 148 },
    },
  },
  {
    cohortTerm: '2024FA', // cohort_int: 20242
    entrants: 1159,
    color: '#2e6f4e',
    intakeType: 'fall',
    standingLabel: 'Sophomores (Year 2 Fall)',
    observed: {
      0: { calendarTerm: '2024FA', heads: 1159 },
      1: { calendarTerm: '2025SP', heads: 1113 },
      2: { calendarTerm: '2025SU', heads: 114 },
      3: { calendarTerm: '2025FA', heads: 961 },
    },
  },
  {
    cohortTerm: '2025SP', // cohort_int: 20243
    entrants: 185,
    color: '#1e7e9a',
    intakeType: 'spring',
    standingLabel: '1st-Year Spring Starters',
    observed: {
      0: { calendarTerm: '2025SP', heads: 185 },
      1: { calendarTerm: '2025SU', heads: 44 },
      2: { calendarTerm: '2025FA', heads: 166 },
    },
  },
  {
    cohortTerm: '2025SU', // cohort_int: 20251
    entrants: 120,
    color: '#d97706',
    intakeType: 'summer',
    standingLabel: '1st-Year Summer Starters',
    observed: {
      0: { calendarTerm: '2025SU', heads: 120 },
      1: { calendarTerm: '2025FA', heads: 112 },
    },
  },
  {
    cohortTerm: '2025FA', // cohort_int: 20252
    entrants: 1123,
    color: '#0d4f30',
    intakeType: 'fall',
    standingLabel: 'Freshmen (Entering Fall)',
    observed: {
      0: { calendarTerm: '2025FA', heads: 1123 },
    },
  },
  {
    cohortTerm: '2026SP', // cohort_int: 20253
    entrants: 185,
    color: '#0e7490',
    intakeType: 'spring',
    standingLabel: 'Projected Spring Entrants',
    observed: {},
  },
  {
    cohortTerm: '2026SU', // cohort_int: 20261
    entrants: 120,
    color: '#b45309',
    intakeType: 'summer',
    standingLabel: 'Projected Summer Entrants',
    observed: {},
  },
  {
    cohortTerm: '2026FA', // cohort_int: 20262
    entrants: 1120,
    color: '#4e8a69',
    intakeType: 'fall',
    standingLabel: 'Projected Fall Freshmen',
    observed: {},
  },
];

const MCC_COHORTS: CohortHistoryDef[] = [
  {
    cohortTerm: '2021FA', // cohort_int: 20212
    entrants: 350,
    color: '#9c998e',
    intakeType: 'fall',
    standingLabel: '5th-Year Fall Starters',
    observed: {
      0: { calendarTerm: '2021FA', heads: 350 },
      1: { calendarTerm: '2022SP', heads: 334 },
      2: { calendarTerm: '2022FA', heads: 300 },
      3: { calendarTerm: '2023SP', heads: 288 },
      4: { calendarTerm: '2023FA', heads: 268 },
      5: { calendarTerm: '2024SP', heads: 260 },
      6: { calendarTerm: '2024FA', heads: 245 },
      7: { calendarTerm: '2025SP', heads: 235 },
      8: { calendarTerm: '2025FA', heads: 46 },
    },
  },
  {
    cohortTerm: '2022SP', // cohort_int: 20213
    entrants: 44,
    color: '#83c5be',
    intakeType: 'spring',
    standingLabel: '4th-Year Spring Starters',
    observed: {
      0: { calendarTerm: '2022SP', heads: 44 },
      1: { calendarTerm: '2022FA', heads: 39 },
      2: { calendarTerm: '2023SP', heads: 37 },
      3: { calendarTerm: '2023FA', heads: 35 },
      4: { calendarTerm: '2024SP', heads: 34 },
      5: { calendarTerm: '2024FA', heads: 32 },
      6: { calendarTerm: '2025SP', heads: 31 },
      7: { calendarTerm: '2025FA', heads: 30 },
    },
  },
  {
    cohortTerm: '2022FA', // cohort_int: 20222
    entrants: 336,
    color: '#7a786e',
    intakeType: 'fall',
    standingLabel: 'Seniors (Year 4 Fall)',
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
    cohortTerm: '2023SP', // cohort_int: 20223
    entrants: 46,
    color: '#5bc0be',
    intakeType: 'spring',
    standingLabel: '3rd-Year Spring Starters',
    observed: {
      0: { calendarTerm: '2023SP', heads: 46 },
      1: { calendarTerm: '2023FA', heads: 41 },
      2: { calendarTerm: '2024SP', heads: 39 },
      3: { calendarTerm: '2024FA', heads: 37 },
      4: { calendarTerm: '2025SP', heads: 35 },
      5: { calendarTerm: '2025FA', heads: 34 },
    },
  },
  {
    cohortTerm: '2023FA', // cohort_int: 20232
    entrants: 332,
    color: '#b06a3a',
    intakeType: 'fall',
    standingLabel: 'Juniors (Year 3 Fall)',
    observed: {
      0: { calendarTerm: '2023FA', heads: 332 },
      1: { calendarTerm: '2024SP', heads: 317 },
      2: { calendarTerm: '2024FA', heads: 285 },
      3: { calendarTerm: '2025SP', heads: 274 },
      4: { calendarTerm: '2025FA', heads: 255 },
    },
  },
  {
    cohortTerm: '2024SP', // cohort_int: 20233
    entrants: 50,
    color: '#2596be',
    intakeType: 'spring',
    standingLabel: '2nd-Year Spring Starters',
    observed: {
      0: { calendarTerm: '2024SP', heads: 50 },
      1: { calendarTerm: '2024FA', heads: 45 },
      2: { calendarTerm: '2025SP', heads: 43 },
      3: { calendarTerm: '2025FA', heads: 40 },
    },
  },
  {
    cohortTerm: '2024FA', // cohort_int: 20242
    entrants: 338,
    color: '#2e6f4e',
    intakeType: 'fall',
    standingLabel: 'Sophomores (Year 2 Fall)',
    observed: {
      0: { calendarTerm: '2024FA', heads: 338 },
      1: { calendarTerm: '2025SP', heads: 322 },
      2: { calendarTerm: '2025FA', heads: 290 },
    },
  },
  {
    cohortTerm: '2025SP', // cohort_int: 20243
    entrants: 48,
    color: '#1e7e9a',
    intakeType: 'spring',
    standingLabel: '1st-Year Spring Starters',
    observed: {
      0: { calendarTerm: '2025SP', heads: 48 },
      1: { calendarTerm: '2025FA', heads: 44 },
    },
  },
  {
    cohortTerm: '2025FA', // cohort_int: 20252
    entrants: 344,
    color: '#0d4f30',
    intakeType: 'fall',
    standingLabel: 'Freshmen (Entering Fall)',
    observed: {
      0: { calendarTerm: '2025FA', heads: 344 },
    },
  },
  {
    cohortTerm: '2026SP', // cohort_int: 20253
    entrants: 48,
    color: '#0e7490',
    intakeType: 'spring',
    standingLabel: 'Projected Spring Entrants',
    observed: {},
  },
  {
    cohortTerm: '2026FA', // cohort_int: 20262
    entrants: 340,
    color: '#4e8a69',
    intakeType: 'fall',
    standingLabel: 'Projected Fall Freshmen',
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

/**
 * Advances a term code forward by `steps` calendar terms using the exact
 * Positron IDE integer `term_int` encoding:
 * - 3-term MCM: YYYY1 (SU) -> YYYY2 (FA) -> YYYY3 (SP) -> (YYYY+1)1 (SU)
 * - 2-term MCC: YYYY2 (FA) -> YYYY3 (SP) -> (YYYY+1)2 (FA)
 */
function stepTermByInt(
  termCode: string,
  steps: number,
  termsPerYear: number
): string {
  const startInt = termToTermInt(termCode);
  let academicYear = Math.floor(startInt / 10);
  let suffix = startInt % 10;

  for (let i = 0; i < steps; i++) {
    if (termsPerYear === 3) {
      if (suffix === 1) {
        suffix = 2;
      } else if (suffix === 2) {
        suffix = 3;
      } else {
        academicYear += 1;
        suffix = 1;
      }
    } else {
      if (suffix === 2) {
        suffix = 3;
      } else {
        academicYear += 1;
        suffix = 2;
      }
    }
  }
  return termIntToTerm(academicYear * 10 + suffix);
}

/**
 * Returns the model benchmark transition rate for a cohort of `intakeType`
 * arriving at `calTerm` at duration `d` (`terms_since_start`).
 */
function getStepModelRate(
  intakeType: IntakeType,
  calTerm: string,
  d: number,
  termsPerYear: number,
  ratesVec: number[],
  excludeCovid: boolean
): number {
  if (d <= 0) return 1.0;
  if (termsPerYear === 2) {
    return ratesVec[Math.min(ratesVec.length - 1, d - 1)] ?? 0.312;
  }

  // On 3-term MCM, d === 12 is post-graduation 5th year (after 8 Fall/Spring semesters)
  if (d >= 12) {
    return ratesVec[11] ?? 0.263;
  }

  if (calTerm.endsWith('SU')) {
    const yrIdx = Math.min(3, Math.floor((d - 1) / 3));
    return ratesVec[yrIdx * 3 + 1] ?? 0.271;
  }

  if (calTerm.endsWith('FA')) {
    if (intakeType === 'summer' && d === 1) {
      // Summer starter's very first Fall transition (SU -> FA, d=0 -> d=1)
      return excludeCovid ? 112 / 120 : 0.91;
    }
    const fallIdx = Math.min(2, Math.floor((d - 2) / 3));
    return ratesVec[fallIdx * 3 + 2] ?? 0.859;
  }

  // Spring term (FA -> SP)
  const spIdx = Math.min(3, Math.floor((d - 1) / 3));
  return ratesVec[spIdx * 3] ?? 0.887;
}

export interface ProjectedCohortCell {
  calendarTerm: string;
  termInt: number;
  heads: number;
  refDuration: number;
  refTerm: string;
  refHeads: number;
  stepRate: number;
  cumRate: number;
  isProjected: boolean;
}

export const CohortMatrixInspector: React.FC<CohortMatrixInspectorProps> = ({
  accent,
}) => {
  const [school, setSchool] = useState<SchoolCode>('MCM');
  const [springOffset, setSpringOffset] = useState<1 | 2>(2);
  const [excludeCovid, setExcludeCovid] = useState<boolean>(true);
  const [selectedCensus, setSelectedCensus] =
    useState<CensusTargetTerm>('2025FA');
  const [selectedCohort, setSelectedCohort] = useState<string>('2024FA');
  const [intakeFilter, setIntakeFilter] =
    useState<'all' | 'fall' | 'spring' | 'summer'>('all');

  const schoolConfig = SITE_DATA.entrant.schools[school];
  const termsPerYear = schoolConfig.terms_per_year;
  const effectiveOffset: 1 | 2 = school === 'MCM' ? springOffset : 1;

  // Derive net tuition revenue per student-term directly from siteData.json school config
  // so Section 2 and Section 3 use the exact same NTR/student-term ($19,025 MCM / $19,138 MCC)
  const ntrPerStudent = Math.round(
    schoolConfig.charge_per_term * (1 - schoolConfig.aid_rate) +
      (schoolConfig.comp_fee_per_term ?? 0)
  );

  // Target Census Terms sorted chronologically by R/Positron integer `term_int`
  // Academic year starts in Summer: 2025SU (20251) -> 2025FA (20252) -> 2026SP (20253) -> 2026SU (20261) -> 2026FA (20262)
  const availableTerms: CensusTargetTerm[] =
    school === 'MCM'
      ? ['2025SU', '2025FA', '2026SP', '2026SU', '2026FA']
      : ['2025FA', '2026SP', '2026FA'];

  const activeCensus: CensusTargetTerm = availableTerms.includes(selectedCensus)
    ? selectedCensus
    : '2025FA';

  const baselineRates = TRANSITION_RATES[school].noCovid;
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

  const { survivalCurve: naiveOffset1Curve } = buildCohortSurvivalCurve(
    activeRates,
    termsPerYear,
    1,
    1.0,
    0.0
  );

  // Sort cohorts strictly by chronological `cohort_int` ascending
  const rawCohorts = [...(school === 'MCM' ? MCM_COHORTS : MCC_COHORTS)].sort(
    (a, b) => termToTermInt(a.cohortTerm) - termToTermInt(b.cohortTerm)
  );

  const projectCohortWithRule = (
    cohort: CohortHistoryDef,
    offsetRule: 1 | 2,
    covidMasked: boolean
  ): Record<number, ProjectedCohortCell> => {
    const maxTerms = termsPerYear * 4;
    const ratesForRun = covidMasked
      ? TRANSITION_RATES[school].noCovid
      : TRANSITION_RATES[school].withCovid;
    const isBaselineRun =
      covidMasked && offsetRule === (school === 'MCM' ? 2 : 1);

    const cells: Record<number, ProjectedCohortCell> = {};

    for (let d = 0; d <= maxTerms; d++) {
      const calTerm = stepTermByInt(cohort.cohortTerm, d, termsPerYear);
      const termInt = termToTermInt(calTerm);
      const obs = cohort.observed[d];

      if (d === 0) {
        cells[0] = {
          calendarTerm: calTerm,
          termInt,
          heads: cohort.entrants,
          refDuration: 0,
          refTerm: calTerm,
          refHeads: cohort.entrants,
          stepRate: 1.0,
          cumRate: 1.0,
          isProjected: Object.keys(cohort.observed).length === 0,
        };
        continue;
      }

      const isFallReturnWithPriorSummer =
        termsPerYear === 3 && calTerm.endsWith('FA') && d >= 2;
      const baseRefIdx = isFallReturnWithPriorSummer ? d - 2 : d - 1;
      const activeRefIdx =
        isFallReturnWithPriorSummer && offsetRule === 2 ? d - 2 : d - 1;

      const refCell = cells[activeRefIdx] ?? cells[0];
      const refHeads = refCell.heads;

      const baseModelStepRate = getStepModelRate(
        cohort.intakeType,
        calTerm,
        d,
        termsPerYear,
        baselineRates,
        true
      );
      const activeModelStepRate = getStepModelRate(
        cohort.intakeType,
        calTerm,
        d,
        termsPerYear,
        ratesForRun,
        covidMasked
      );

      if (obs) {
        const obsBaseRefHeads =
          baseRefIdx === 0
            ? cohort.entrants
            : cohort.observed[baseRefIdx]?.heads ?? cohort.entrants;
        const obsStepRate = obs.heads / Math.max(1, obsBaseRefHeads);

        const covidScale =
          baseModelStepRate > 0 ? activeModelStepRate / baseModelStepRate : 1.0;
        const targetStepRate = Math.min(
          1.0,
          Math.max(0, obsStepRate * covidScale)
        );

        const heads = isBaselineRun
          ? obs.heads
          : Math.round(refHeads * targetStepRate);

        cells[d] = {
          calendarTerm: obs.calendarTerm,
          termInt,
          heads,
          refDuration: activeRefIdx,
          refTerm: refCell.calendarTerm,
          refHeads,
          stepRate: refHeads > 0 ? heads / refHeads : targetStepRate,
          cumRate: heads / cohort.entrants,
          isProjected: false,
        };
      } else {
        const heads = Math.round(refHeads * activeModelStepRate);
        cells[d] = {
          calendarTerm: calTerm,
          termInt,
          heads,
          refDuration: activeRefIdx,
          refTerm: refCell.calendarTerm,
          refHeads,
          stepRate: refHeads > 0 ? heads / refHeads : activeModelStepRate,
          cumRate: heads / cohort.entrants,
          isProjected: true,
        };
      }
    }

    return cells;
  };

  const cohortColumns = rawCohorts.map((c) => ({
    ...c,
    cohortInt: termToTermInt(c.cohortTerm),
    cells: projectCohortWithRule(c, effectiveOffset, excludeCovid),
    offset2Cells: projectCohortWithRule(
      c,
      school === 'MCM' ? 2 : 1,
      excludeCovid
    ),
    offset1Cells: projectCohortWithRule(c, 1, excludeCovid),
  }));

  const extractContributors = (
    term: CensusTargetTerm,
    cellSelector: (
      col: (typeof cohortColumns)[number]
    ) => Record<number, ProjectedCohortCell>
  ) => {
    const list: {
      cohortTerm: string;
      cohortInt: number;
      entrants: number;
      duration: number;
      heads: number;
      refDuration: number;
      refTerm: string;
      refHeads: number;
      stepRate: number;
      cumRate: number;
      ntrM: number;
      color: string;
      intakeType: IntakeType;
      standingLabel: string;
      isProjected: boolean;
    }[] = [];

    for (const col of cohortColumns) {
      const cellMap = cellSelector(col);
      for (const [dStr, cell] of Object.entries(cellMap)) {
        if (cell.calendarTerm === term && cell.heads > 0) {
          list.push({
            cohortTerm: col.cohortTerm,
            cohortInt: col.cohortInt,
            entrants: col.entrants,
            duration: Number(dStr),
            heads: cell.heads,
            refDuration: cell.refDuration,
            refTerm: cell.refTerm,
            refHeads: cell.refHeads,
            stepRate: cell.stepRate,
            cumRate: cell.cumRate,
            ntrM: (cell.heads * ntrPerStudent) / 1e6,
            color: col.color,
            intakeType: col.intakeType,
            standingLabel: col.standingLabel,
            isProjected: cell.isProjected,
          });
        }
      }
    }
    return list.sort((a, b) => a.cohortInt - b.cohortInt);
  };

  const allActiveCensusContributors = extractContributors(
    activeCensus,
    (col) => col.cells
  );

  const activeContributors =
    intakeFilter === 'all'
      ? allActiveCensusContributors
      : allActiveCensusContributors.filter(
          (c) => c.intakeType === intakeFilter
        );

  const totalCensusHeads = activeContributors.reduce(
    (sum, c) => sum + c.heads,
    0
  );
  const totalCensusNtrM = (totalCensusHeads * ntrPerStudent) / 1e6;

  // Also compute offset=2 vs offset=1 totals on activeCensus for direct comparison
  const offset2Contributors = extractContributors(
    activeCensus,
    (col) => col.offset2Cells
  ).filter((c) => intakeFilter === 'all' || c.intakeType === intakeFilter);
  const offset1Contributors = extractContributors(
    activeCensus,
    (col) => col.offset1Cells
  ).filter((c) => intakeFilter === 'all' || c.intakeType === intakeFilter);

  const offset2TotalHeads = offset2Contributors.reduce(
    (s, c) => s + c.heads,
    0
  );
  const offset1TotalHeads = offset1Contributors.reduce(
    (s, c) => s + c.heads,
    0
  );
  const offsetHeadDiff = offset1TotalHeads - offset2TotalHeads;
  const offsetNtrDiffM = (offsetHeadDiff * ntrPerStudent) / 1e6;

  const focusedContributor =
    activeContributors.find((c) => c.cohortTerm === selectedCohort) ||
    activeContributors[activeContributors.length - 1] ||
    activeContributors[0];

  const year2FallRate = (survivalCurve[termsPerYear] ?? 0) * 100;
  const naiveYear2FallRate = (naiveOffset1Curve[termsPerYear] ?? 0) * 100;

  // Filtered cohorts for the Stage 2 Registration Triangle table
  const triangleCohorts =
    intakeFilter === 'all'
      ? cohortColumns
      : cohortColumns.filter((c) => c.intakeType === intakeFilter);

  const maxDurationSteps = termsPerYear * 4;
  const durationIndices = Array.from(
    { length: maxDurationSteps + 1 },
    (_, i) => i
  );

  const handleSelectCohortAndSyncTerm = (cohortTerm: string) => {
    setSelectedCohort(cohortTerm);
    const inCurrent = activeContributors.some(
      (c) => c.cohortTerm === cohortTerm
    );
    if (!inCurrent) {
      const col = cohortColumns.find((c) => c.cohortTerm === cohortTerm);
      if (col) {
        const matchingTerm = availableTerms.find((t) =>
          Object.values(col.cells).some(
            (cell) => cell.calendarTerm === t && cell.heads > 0
          )
        );
        if (matchingTerm) {
          setSelectedCensus(matchingTerm);
        }
      }
    }
  };

  return (
    <section data-section="inspector" className="scroll-mt-20">
      <div
        className="text-[10.5px] font-bold tracking-[1.6px] uppercase"
        style={{ color: accent }}
      >
        02 · Stage 2 Cohort Registration Triangle &amp; Spring-to-Fall Offset
      </div>

      <h2 className="font-serif font-normal text-[24px] md:text-[28px] leading-[1.15] tracking-[-0.3px] mt-1.5 text-[#1b1c18]">
        Longitudinal Cohort Matrix &amp; Diagonal Census Highlight ({activeCensus}{' '}
        · term_int {termToTermInt(activeCensus)})
      </h2>

      <p className="text-[13.5px] leading-[1.55] text-[#54564c] mt-1.5 max-w-[68ch]">
        Inspect how longitudinal student cohorts (sorted chronologically by
        integer <code className="font-mono text-[12px]">cohort_int</code>:
        Summer <code className="font-mono text-[12px]">YYYY1</code>, Fall{' '}
        <code className="font-mono text-[12px]">YYYY2</code>, Spring{' '}
        <code className="font-mono text-[12px]">(YYYY−1)3</code>) progress
        across elapsed terms <code className="font-mono text-[12px]">d</code>.
        Toggle <strong>Spring-to-Fall Offset = 2</strong> vs.{' '}
        <strong>Naive Offset = 1</strong> on MCM to see why optional Summer
        sessions (<code className="font-mono text-[12px]">13.3%</code> uptake)
        must not be chained into returning Fall headcount.
      </p>

      {/* STAGE 2 COHORT REGISTRATION TRIANGLE (cohort_int x terms_since_start d) */}
      <div className="border border-[#e3e1d9] rounded-[10px] p-4 md:p-5 bg-white/85 mt-3.5">
        {/* Interactive Controls Bar */}
        <div className="pb-3 mb-3 border-b border-[#e6e4dc] space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {(['MCM', 'MCC'] as SchoolCode[]).map((sKey) => {
                const on = school === sKey;
                const sTooltip =
                  sKey === 'MCM'
                    ? 'MCM · Millbury College of Music: 3-term academic calendar (Fall, Spring, Optional Summer · INCLUDE_SUMMER = True · Spring-to-Fall offset = 2). Net Tuition Revenue = $19,025 / student-term ($26,380 Gross − $8,555 Grant + $1,200 Fee).'
                    : 'MCC · Millbury College Conservatory: 2-term academic calendar (Fall & Spring only · INCLUDE_SUMMER = False · Spring-to-Fall offset = 1). Net Tuition Revenue = $19,138 / student-term ($25,880 Gross − $7,492 Grant + $750 Fee).';
                return (
                  <button
                    key={sKey}
                    type="button"
                    onClick={() => {
                      setSchool(sKey);
                      if (
                        sKey === 'MCC' &&
                        (selectedCensus === '2025SU' ||
                          selectedCensus === '2026SU')
                      ) {
                        setSelectedCensus('2025FA');
                      }
                      if (sKey === 'MCC' && intakeFilter === 'summer') {
                        setIntakeFilter('all');
                      }
                    }}
                    title={sTooltip}
                    aria-label={sTooltip}
                    className="cursor-pointer text-[12px] font-bold px-3 py-1.5 rounded-[6px] border transition-all duration-150"
                    style={{
                      backgroundColor: on ? accent : '#faf8f2',
                      color: on ? '#fff' : '#44453a',
                      borderColor: on ? accent : '#d8d6cc',
                    }}
                  >
                    {sKey === 'MCM'
                      ? 'MCM · 3 Terms/Yr'
                      : 'MCC · 2 Terms/Yr'}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {school === 'MCM' && (
                <div className="flex items-center gap-1 bg-[#faf8f2] px-2 py-1 rounded-[5px] border border-[#e6e4dc]">
                  <span
                    className="text-[10.5px] font-bold text-[#44453a] mr-1 border-b border-dotted border-[#8a887e] cursor-help"
                    title="Determines which prior term serves as the conditioning denominator for returning Fall enrollment on a 3-term academic calendar (Spring d−2 vs. Summer d−1)."
                  >
                    Fall Return:
                  </span>
                  <button
                    type="button"
                    onClick={() => setSpringOffset(2)}
                    title={`Spring-to-Fall Conditioning (offset = 2): Returning Fall headcount at elapsed step d is conditioned on prior Spring enrollment (d−2), bypassing optional Summer (13.3% uptake). Yields ${year2FallRate.toFixed(1)}% Year-2 Fall retention.`}
                    className="cursor-pointer text-[10.5px] font-mono font-bold px-2 py-0.5 rounded border transition-colors"
                    style={{
                      backgroundColor: springOffset === 2 ? accent : '#fff',
                      color: springOffset === 2 ? '#fff' : '#44453a',
                      borderColor: springOffset === 2 ? accent : '#d5d2c6',
                    }}
                  >
                    offset = 2 ({year2FallRate.toFixed(1)}% Yr 2)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpringOffset(1)}
                    title={`Naive 1-Step Chain (offset = 1): Conditions returning Fall headcount on optional Summer enrollment (d−1 = 13.3%), treating Summer non-attendance as permanent drop-out and collapsing Year-2 Fall retention to ${naiveYear2FallRate.toFixed(1)}%.`}
                    className="cursor-pointer text-[10.5px] font-mono font-bold px-2 py-0.5 rounded border transition-colors"
                    style={{
                      backgroundColor:
                        springOffset === 1 ? '#b06a3a' : '#fff',
                      color: springOffset === 1 ? '#fff' : '#6f6d64',
                      borderColor:
                        springOffset === 1 ? '#b06a3a' : '#d5d2c6',
                    }}
                  >
                    offset = 1 Naive ({naiveYear2FallRate.toFixed(1)}% Yr 2)
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setExcludeCovid(!excludeCovid)}
                title={
                  excludeCovid
                    ? 'Post-COVID Baseline: Excludes 2020FA, 2021SP, and 2021SU remote-instruction transition rates when estimating baseline term-to-term continuation.'
                    : 'All Historical Terms: Includes 2020FA–2021SU pandemic-era enrollment transitions in the empirical survival vector.'
                }
                className="cursor-pointer text-[11px] font-mono font-bold px-2.5 py-1 rounded-[5px] border transition-colors"
                style={{
                  backgroundColor: excludeCovid ? '#faf8f2' : '#fff3eb',
                  color: excludeCovid ? accent : '#b06a3a',
                  borderColor: excludeCovid ? accent : '#b06a3a',
                }}
              >
                {excludeCovid ? 'COVID Masked' : 'Incl. COVID Terms'}
              </button>
            </div>
          </div>

          {/* Census Term Selector & Intake Filter + Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#efede6]">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className="text-[10.5px] font-bold uppercase tracking-[0.5px] text-[#6f6d64] border-b border-dotted border-[#8a887e] cursor-help"
                  title="Select the target census term to highlight along the diagonal of the cohort registration triangle (where cohort_int + d maps to term_int)."
                >
                  Census Diagonal:
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  {availableTerms.map((t) => {
                    const on = activeCensus === t;
                    const tInt = termToTermInt(t);
                    const isObs = t === '2025SU' || t === '2025FA';
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedCensus(t)}
                        className="cursor-pointer font-mono text-[11px] font-bold px-2 py-0.5 rounded-[4px] border transition-colors"
                        style={{
                          backgroundColor: on ? accent : '#faf8f2',
                          color: on ? '#fff' : '#1b1c18',
                          borderColor: on ? accent : '#d5d2c6',
                        }}
                        title={`Census Term ${t} | Integer term_int = ${tInt} (YYYY1=Summer, YYYY2=Fall, (YYYY−1)3=Spring) | ${isObs ? 'Observed historical census' : `Projected census (offset = ${effectiveOffset})`}`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1">
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.4px] text-[#6f6d64] mr-0.5 border-b border-dotted border-[#8a887e] cursor-help"
                  title="Filter cohorts by entry term season (Fall, Spring, or Summer matriculants) to inspect each intake stream's contribution to census headcount and NTR."
                >
                  Intake:
                </span>
                {(
                  [
                    {
                      id: 'all',
                      label: 'All Starts',
                      tip: 'Include all Fall, Spring, and Summer entering cohorts active in the selected census term.',
                    },
                    {
                      id: 'fall',
                      label: 'Fall',
                      tip: 'Filter to Fall entering cohorts (term_int ending in 2, e.g., 2022FA = 20222).',
                    },
                    {
                      id: 'spring',
                      label: 'Spring',
                      tip: 'Filter to Spring entering cohorts (term_int ending in 3, e.g., 2023SP = 20223).',
                    },
                    ...(school === 'MCM'
                      ? [
                          {
                            id: 'summer' as const,
                            label: 'Summer',
                            tip: 'Filter to Summer entering cohorts on the 3-term MCM calendar (term_int ending in 1, e.g., 2025SU = 20251).',
                          },
                        ]
                      : []),
                  ] as const
                ).map((tab) => {
                  const on = intakeFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setIntakeFilter(tab.id)}
                      title={tab.tip}
                      className="cursor-pointer text-[10.5px] font-sans font-bold px-2 py-0.5 rounded-[4px] border transition-colors"
                      style={{
                        backgroundColor: on ? accent : '#faf8f2',
                        color: on ? '#fff' : '#44453a',
                        borderColor: on ? accent : '#d5d2c6',
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Compact Matrix Legend with Tooltips */}
            <div className="flex flex-wrap items-center gap-2.5 text-[10.5px] font-mono text-[#54564c]">
              <span
                className="inline-flex items-center gap-1.5 cursor-help border-b border-dotted border-[#c8c6bc]"
                title={`Cells highlighted in green belong to the active ${activeCensus} census diagonal (term_int = ${termToTermInt(activeCensus)}). Summing these cells produces the ${totalCensusHeads.toLocaleString('en-US')} census headcount ($${totalCensusNtrM.toFixed(2)}M NTR).`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-[2px] inline-block border"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${accent} 16%, #fff)`,
                    borderColor: accent,
                  }}
                />
                Diagonal ({activeCensus})
              </span>
              <span
                className="inline-flex items-center gap-1.5 cursor-help border-b border-dotted border-[#c8c6bc]"
                title="Historical census enrollments observed through 2025FA."
              >
                <span className="w-2.5 h-2.5 rounded-[2px] inline-block bg-white border border-[#d5d2c6]" />
                Observed
              </span>
              <span
                className="inline-flex items-center gap-1.5 cursor-help border-b border-dotted border-[#c8c6bc]"
                title={`Future terms projected beyond 2025FA using conditional step rates with Spring-to-Fall offset = ${effectiveOffset}.`}
              >
                <span className="w-2.5 h-2.5 rounded-[2px] inline-block bg-[#faf8f2] border border-dashed border-[#c8c6bc]" />
                Projected (off={effectiveOffset})
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[11px] font-mono tabular-nums">
            <thead>
              <tr className="border-b-2 border-[#1b1c18] text-[#54564c] text-[10px] uppercase">
                <th
                  className="py-1.5 px-2 text-left font-sans font-bold sticky left-0 bg-white z-10 cursor-help"
                  title="Entering cohort term code sorted chronologically by integer cohort_int (hover any cohort cell to view its integer cohort_int code)"
                >
                  Cohort
                </th>
                <th
                  className="py-1.5 px-1.5 text-left font-sans font-bold cursor-help"
                  title="Matriculation season (fall, spring, or summer intake)"
                >
                  Intake
                </th>
                {durationIndices.map((d) => (
                  <th
                    key={d}
                    className="py-1.5 px-1.5 text-right font-bold cursor-help"
                    title={`Elapsed duration d = ${d} terms since initial cohort entry (Academic Year ${Math.floor(d / termsPerYear) + 1}, Term ${(d % termsPerYear) + 1} of ${termsPerYear})`}
                  >
                    d={d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efede6]">
              {triangleCohorts.map((col) => {
                const isSelectedRow =
                  focusedContributor?.cohortTerm === col.cohortTerm ||
                  selectedCohort === col.cohortTerm;
                return (
                  <tr
                    key={col.cohortTerm}
                    onClick={() => handleSelectCohortAndSyncTerm(col.cohortTerm)}
                    className="cursor-pointer hover:bg-[#faf8f2]/90 transition-colors"
                    style={{
                      backgroundColor: isSelectedRow
                        ? `color-mix(in srgb, ${accent} 5%, #fff)`
                        : undefined,
                    }}
                  >
                    <td
                      className="py-1.5 px-2 font-bold text-[#1b1c18] whitespace-nowrap sticky left-0 bg-white z-10"
                      title={`Cohort ${col.cohortTerm} | Integer cohort_int = ${col.cohortInt} | ${col.standingLabel} | Initial entering size (d=0) = ${col.entrants.toLocaleString('en-US')} students`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full inline-block shrink-0"
                          style={{ backgroundColor: col.color }}
                        />
                        {col.cohortTerm}
                      </span>
                    </td>
                    <td
                      className="py-1.5 px-1.5 font-sans text-[10px] text-[#6f6d64] whitespace-nowrap"
                      title={`${col.intakeType.toUpperCase()} matriculation stream (${col.standingLabel})`}
                    >
                      {col.intakeType}
                    </td>
                    {durationIndices.map((d) => {
                      const cell = col.cells[d];
                      if (!cell || cell.heads <= 0) {
                        return (
                          <td
                            key={d}
                            className="py-1.5 px-1.5 text-right text-[#c8c6bc]"
                          >
                            —
                          </td>
                        );
                      }
                      const isCensusCell = cell.calendarTerm === activeCensus;
                      const isSelectableTerm = (
                        availableTerms as string[]
                      ).includes(cell.calendarTerm);

                      return (
                        <td
                          key={d}
                          onClick={(e) => {
                            if (isSelectableTerm) {
                              e.stopPropagation();
                              setSelectedCensus(
                                cell.calendarTerm as CensusTargetTerm
                              );
                              setSelectedCohort(col.cohortTerm);
                            }
                          }}
                          className={`py-1 px-1.5 text-right transition-colors ${
                            isCensusCell
                              ? 'font-extrabold rounded-[4px]'
                              : cell.isProjected
                              ? 'text-[#6f6d64] italic bg-[#faf8f2]/60'
                              : 'text-[#1b1c18]'
                          }`}
                          style={
                            isCensusCell
                              ? {
                                  backgroundColor: `color-mix(in srgb, ${accent} 15%, #fff)`,
                                  color:
                                    school === 'MCM' && springOffset === 1
                                      ? '#b06a3a'
                                      : accent,
                                  boxShadow: `inset 0 0 0 1.5px ${
                                    school === 'MCM' && springOffset === 1
                                      ? '#b06a3a'
                                      : accent
                                  }`,
                                }
                              : undefined
                          }
                          title={`${col.cohortTerm} [cohort_int: ${col.cohortInt}] at d=${d} -> ${cell.calendarTerm} [term_int: ${cell.termInt}]: ${cell.heads.toLocaleString('en-US')} students (${(cell.stepRate * 100).toFixed(1)}% of ${cell.refTerm} d=${cell.refDuration}; ${(cell.cumRate * 100).toFixed(1)}% of entry)`}
                        >
                          <div className="leading-tight">
                            {cell.heads.toLocaleString('en-US')}
                          </div>
                          <div className="text-[8.5px] text-[#8a887e] font-normal leading-none mt-0.5">
                            {cell.calendarTerm}
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

        {/* Bottom Matrix Audit Bar: Focused Cohort Step Formula & Offset=2 vs Offset=1 Diagonal Sum */}
        <div className="mt-3 pt-3 border-t border-[#e6e4dc] grid grid-cols-1 lg:grid-cols-2 gap-3 text-[11px] font-sans">
          {focusedContributor && (
            <div className="p-2.5 rounded-[6px] bg-[#faf8f2] border border-[#e2e0d6]">
              <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] font-bold uppercase tracking-[0.4px] text-[#6f6d64]">
                <span
                  className="cursor-help border-b border-dotted border-[#c8c6bc]"
                  title={`Integer cohort_int = ${focusedContributor.cohortInt} | Initial entering size = ${focusedContributor.entrants.toLocaleString('en-US')} students`}
                >
                  Focused Cohort Step Formula ·{' '}
                  <strong className="text-[#1b1c18]">
                    {focusedContributor.cohortTerm}
                  </strong>{' '}
                  ({focusedContributor.standingLabel})
                </span>
                <span
                  className="font-mono text-[#0d4f30] cursor-help"
                  title={
                    focusedContributor.duration === 0
                      ? 'Initial matriculation term (d = 0); 100% of entering cohort is present.'
                      : `Headcount in ${activeCensus} (d=${focusedContributor.duration}) is multiplied from reference term ${focusedContributor.refTerm} (d=${focusedContributor.refDuration}).`
                  }
                >
                  {focusedContributor.duration === 0
                    ? 'Entry Cohort (d=0)'
                    : `Conditioned on ${focusedContributor.refTerm} (d=${focusedContributor.refDuration})`}
                </span>
              </div>
              <div className="font-mono text-[11px] text-[#1b1c18] mt-1 leading-[1.4]">
                {focusedContributor.duration === 0 ? (
                  <>
                    Entry <strong>{focusedContributor.cohortTerm}</strong>{' '}
                    (d=0):{' '}
                    <strong>
                      {focusedContributor.heads.toLocaleString('en-US')}
                    </strong>{' '}
                    entrants × ${ntrPerStudent.toLocaleString('en-US')} ={' '}
                    <strong style={{ color: accent }}>
                      ${focusedContributor.ntrM.toFixed(2)}M
                    </strong>
                  </>
                ) : (
                  <>
                    Ref <strong>{focusedContributor.refTerm}</strong> (d=
                    {focusedContributor.refDuration}:{' '}
                    <strong>
                      {focusedContributor.refHeads.toLocaleString('en-US')}
                    </strong>{' '}
                    st) ×{' '}
                    <strong>
                      {(focusedContributor.stepRate * 100).toFixed(1)}%
                    </strong>{' '}
                    ={' '}
                    <strong>
                      {focusedContributor.heads.toLocaleString('en-US')}
                    </strong>{' '}
                    st ({(focusedContributor.cumRate * 100).toFixed(1)}% of{' '}
                    {focusedContributor.entrants.toLocaleString('en-US')}{' '}
                    start) × ${ntrPerStudent.toLocaleString('en-US')} ={' '}
                    <strong style={{ color: accent }}>
                      ${focusedContributor.ntrM.toFixed(2)}M
                    </strong>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="p-2.5 rounded-[6px] bg-[#faf8f2] border border-[#e2e0d6] flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] font-bold uppercase tracking-[0.5px] text-[#0d4f30]">
              <span
                className="cursor-help border-b border-dotted border-[#0d4f30]/50"
                title={`Sums all highlighted diagonal cells where calendarTerm == ${activeCensus} (integer term_int = ${termToTermInt(activeCensus)}) across ${activeContributors.length} active cohorts.`}
              >
                Diagonal Census Sum · {activeCensus} ({activeContributors.length}{' '}
                Cohorts)
              </span>
              <span
                className="font-mono text-[#6f6d64] bg-white px-1.5 py-0.5 rounded border border-[#e2e0d6] cursor-help"
                title={`Stage 2 projection rule: Fall return lag offset = ${effectiveOffset} (${school})`}
              >
                proj_term · offset={effectiveOffset}
              </span>
            </div>
            <div className="font-mono text-[11px] text-[#54564c] mt-1 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <strong className="text-[#1b1c18] text-[13px]">
                  {totalCensusHeads.toLocaleString('en-US')} students
                </strong>{' '}
                × ${ntrPerStudent.toLocaleString('en-US')}/term ={' '}
                <strong
                  className="text-[13px]"
                  style={{
                    color:
                      school === 'MCM' && springOffset === 1
                        ? '#b06a3a'
                        : accent,
                  }}
                >
                  ${totalCensusNtrM.toFixed(2)}M
                </strong>
              </div>
              {school === 'MCM' && (
                <div
                  className="text-[10px] cursor-help"
                  title="Direct comparison between Spring-to-Fall conditioning (offset = 2) and naive Summer-to-Fall chaining (offset = 1) on the selected census diagonal"
                >
                  offset=2:{' '}
                  <strong>{offset2TotalHeads.toLocaleString('en-US')}</strong>{' '}
                  vs. offset=1:{' '}
                  <strong className="text-[#b06a3a]">
                    {offset1TotalHeads.toLocaleString('en-US')} st (Δ{' '}
                    {offsetHeadDiff.toLocaleString('en-US')} / −$
                    {Math.abs(offsetNtrDiffM).toFixed(2)}M)
                  </strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

