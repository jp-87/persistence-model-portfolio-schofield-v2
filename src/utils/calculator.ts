export interface SchoolEntrantConfig {
  name?: string;
  calendar_label?: string;
  terms_per_year: number;
  include_summer?: boolean;
  spring_to_fall_offset?: 1 | 2;
  rates: number[];
  curve: number[];
  entering: number;
  charge_per_term: number;
  comp_fee_per_term?: number;
  aid_rate: number;
}

export interface YearProjectionRow {
  year: number;
  label: string;
  entryTermHeads: number;
  springTermHeads: number;
  summerTermHeads: number;
  enrolledStudentTerms: number;
  endOfYearSurvival: number;
  chargePerTerm: number;
  aidPerTerm: number;
  compFeePerTerm: number;
  netPerTerm: number;
  fallTermNtr: number;
  grossTuition: number;
  institutionalAid: number;
  ntr: number;
  lowNtr: number;
  highNtr: number;
}

export interface CalculatorResult {
  valid: boolean;
  error: string;
  clipped: boolean;
  survivalCurve: number[];
  rows: YearProjectionRow[];
  entering: number;
  chargePerTerm: number;
  aidPerTerm: number;
  compFeePerTerm: number;
  netPerTerm: number;
  aidPct: number;
  totalNtr: number;
  totalLowNtr: number;
  totalHighNtr: number;
  totalGrossTuition: number;
  totalInstitutionalAid: number;
  totalStudentTerms: number;
  impliedFallToFallRetention: number;
  ntrPerEntrant: number;
  year1Share: number;
  aidTierLabel: string;
  aidEfficiency: number;
  includeSummer: boolean;
  springToFallOffset: 1 | 2;
}

export const MULTIPLIER_MIN = 0.5;
export const MULTIPLIER_MAX = 1.15;

/**
 * Classifies an institutional grant discount percentage into the 5-tier
 * award schedule (`discount_description`) from Stage 1 RStudio:
 * - < 15%: No Award
 * - 15% to < 35%: Minimal Aid
 * - 35% to < 60%: Partial Aid
 * - 60% to < 80%: Substantial Aid
 * - >= 80%: Near-Full Aid
 */
export function classifyAidTier(aidPct: number): string {
  const r = aidPct / 100;
  if (r < 0.15) return 'No Award (<15%)';
  if (r < 0.35) return 'Minimal Aid (15–35%)';
  if (r < 0.6) return 'Partial Aid (35–60%)';
  if (r < 0.8) return 'Substantial Aid (60–80%)';
  return 'Near-Full Aid (≥80%)';
}

export function validateCalculatorInputs(
  entering: number,
  charge: number,
  aidPct: number,
  multiplier: number
): string {
  if (!Number.isFinite(entering) || entering < 0 || !Number.isInteger(entering)) {
    return 'Entering class must be a whole number, zero or more.';
  }
  if (!Number.isFinite(charge) || charge < 0) {
    return 'Gross tuition charge must be zero or more.';
  }
  if (!Number.isFinite(aidPct) || aidPct < 0 || aidPct > 100) {
    return 'Tuition discount rate must be between 0 and 100 percent.';
  }
  if (
    !Number.isFinite(multiplier) ||
    multiplier < MULTIPLIER_MIN ||
    multiplier > MULTIPLIER_MAX
  ) {
    return `Retention multiplier must be between ${MULTIPLIER_MIN} and ${MULTIPLIER_MAX}.`;
  }
  return '';
}

/**
 * Builds the cumulative cohort survival curve S(t) from term-to-term transition rates.
 *
 * In the Stage 2 Positron IDE model (`cohort_projections_prep.ipynb` / `batched_cohort_projections_prep.ipynb`):
 * - For 3-term calendars (`MCM`, `terms_per_year === 3`, `spring_to_fall_offset === 2`):
 *   - `t = 0` is Entry Fall (`S(0) = 1.0`)
 *   - `t = 1, 4, 7, 10` are Spring terms (`t % 3 === 1`), conditioned on the immediately preceding Fall (`t - 1`, offset = 1)
 *   - `t = 2, 5, 8, 11` are optional Summer terms (`t % 3 === 2`), conditioned on the immediately preceding Spring (`t - 1`, offset = 1)
 *   - `t = 3, 6, 9, 12` are returning Fall terms (`t % 3 === 0`), conditioned on the preceding Spring (`t - 2`, `offset = 2`) when `springToFallOffset === 2` so optional Summer attendance does not wipe out the returning Fall cohort!
 * - For 2-term calendars (`MCC`, `terms_per_year === 2`, `spring_to_fall_offset === 1`):
 *   - Every term `t` conditions on `t - 1` (`offset = 1`).
 */
export function buildCohortSurvivalCurve(
  rates: number[],
  termsPerYear: number,
  springToFallOffset: 1 | 2,
  multiplier = 1.0,
  additiveDeltaFrac = 0.0
): { survivalCurve: number[]; clipped: boolean } {
  const survivalCurve: number[] = [1.0];
  let clipped = false;

  for (let i = 0; i < rates.length; i++) {
    const t = i + 1; // terms since start (1..12 for MCM, 1..8 for MCC)
    const rawRate = rates[i];

    // Apply user multiplier or additive shift primarily to academic-year transitions
    // (or proportionally across terms) while clamping to [0, 1].
    const isSummerStep = termsPerYear === 3 && t % 3 === 2;
    let adjusted = isSummerStep
      ? rawRate * multiplier + additiveDeltaFrac * 0.25
      : rawRate * multiplier + additiveDeltaFrac;

    if (adjusted > 1.0) {
      adjusted = 1.0;
      clipped = true;
    } else if (adjusted < 0.0) {
      adjusted = 0.0;
    }

    const isFallReturnStep = termsPerYear === 3 && t % 3 === 0;
    const refIdx =
      isFallReturnStep && springToFallOffset === 2 ? Math.max(0, t - 2) : t - 1;

    const prevSurvival = survivalCurve[refIdx] ?? 0;
    survivalCurve.push(prevSurvival * adjusted);
  }

  return { survivalCurve, clipped };
}

export function computeEntrantProjection(
  schoolConfig: SchoolEntrantConfig,
  years: number,
  entering: number,
  charge: number,
  aidPct: number,
  multiplier = 1.0,
  retentionDeltaPp = 0.0
): CalculatorResult {
  const error = validateCalculatorInputs(entering, charge, aidPct, multiplier);
  const tpy = schoolConfig.terms_per_year;
  const includeSummer =
    schoolConfig.include_summer !== undefined
      ? schoolConfig.include_summer
      : tpy === 3;
  const springToFallOffset: 1 | 2 =
    schoolConfig.spring_to_fall_offset ?? (tpy === 3 ? 2 : 1);
  const compFeePerTerm = schoolConfig.comp_fee_per_term ?? 0;

  if (error) {
    return {
      valid: false,
      error,
      clipped: false,
      survivalCurve: [],
      rows: [],
      entering: 0,
      chargePerTerm: 0,
      aidPerTerm: 0,
      compFeePerTerm: 0,
      netPerTerm: 0,
      aidPct: 0,
      totalNtr: 0,
      totalLowNtr: 0,
      totalHighNtr: 0,
      totalGrossTuition: 0,
      totalInstitutionalAid: 0,
      totalStudentTerms: 0,
      impliedFallToFallRetention: 0,
      ntrPerEntrant: 0,
      year1Share: 0,
      aidTierLabel: classifyAidTier(0),
      aidEfficiency: 1,
      includeSummer,
      springToFallOffset,
    };
  }

  const deltaFrac = retentionDeltaPp / 100.0;
  const { survivalCurve, clipped } = buildCohortSurvivalCurve(
    schoolConfig.rates,
    tpy,
    springToFallOffset,
    multiplier,
    deltaFrac
  );

  // Also compute +/- 2.5pp sensitivity curves for the 80% planning spread band
  const { survivalCurve: lowCurve } = buildCohortSurvivalCurve(
    schoolConfig.rates,
    tpy,
    springToFallOffset,
    multiplier,
    deltaFrac - 0.025
  );
  const { survivalCurve: highCurve } = buildCohortSurvivalCurve(
    schoolConfig.rates,
    tpy,
    springToFallOffset,
    multiplier,
    deltaFrac + 0.025
  );

  const aidFraction = aidPct / 100.0;
  const chargePerTerm = charge;
  const aidPerTerm = charge * aidFraction;
  // RStudio Stage 1 NTR identity: Net Tuition Revenue = Gross Tuition - Institutional Grant + Comprehensive Fee
  const netPerTerm = chargePerTerm - aidPerTerm + compFeePerTerm;

  const rows: YearProjectionRow[] = [];

  for (let y = 0; y < years; y++) {
    let enrolledStudentTerms = 0;
    let lowTerms = 0;
    let highTerms = 0;

    for (let i = 0; i < tpy; i++) {
      const termIdx = y * tpy + i;
      enrolledStudentTerms += entering * (survivalCurve[termIdx] ?? 0);
      lowTerms += entering * (lowCurve[termIdx] ?? 0);
      highTerms += entering * (highCurve[termIdx] ?? 0);
    }

    const entrySurv = survivalCurve[y * tpy] ?? 0;
    const springSurv = survivalCurve[y * tpy + 1] ?? 0;
    const summerSurv = tpy === 3 ? survivalCurve[y * tpy + 2] ?? 0 : 0;
    const endOfYearSurvival = survivalCurve[(y + 1) * tpy] ?? 0;

    const entryTermHeads = Math.round(entering * entrySurv);
    const springTermHeads = Math.round(entering * springSurv);
    const summerTermHeads = tpy === 3 ? Math.round(entering * summerSurv) : 0;

    const fallTermNtr = entryTermHeads * netPerTerm;
    const grossTuition = enrolledStudentTerms * (chargePerTerm + compFeePerTerm);
    const institutionalAid = enrolledStudentTerms * aidPerTerm;
    const ntr = enrolledStudentTerms * netPerTerm;
    const lowNtr = lowTerms * netPerTerm;
    const highNtr = highTerms * netPerTerm;

    rows.push({
      year: y + 1,
      label: `Year ${y + 1}`,
      entryTermHeads,
      springTermHeads,
      summerTermHeads,
      enrolledStudentTerms,
      endOfYearSurvival,
      chargePerTerm,
      aidPerTerm,
      compFeePerTerm,
      netPerTerm,
      fallTermNtr,
      grossTuition,
      institutionalAid,
      ntr,
      lowNtr,
      highNtr,
    });
  }

  const totalNtr = rows.reduce((acc, r) => acc + r.ntr, 0);
  const totalLowNtr = rows.reduce((acc, r) => acc + r.lowNtr, 0);
  const totalHighNtr = rows.reduce((acc, r) => acc + r.highNtr, 0);
  const totalGrossTuition = rows.reduce((acc, r) => acc + r.grossTuition, 0);
  const totalInstitutionalAid = rows.reduce(
    (acc, r) => acc + r.institutionalAid,
    0
  );
  const totalStudentTerms = rows.reduce(
    (acc, r) => acc + r.enrolledStudentTerms,
    0
  );
  const impliedFallToFallRetention = survivalCurve[tpy] ?? 0;
  const ntrPerEntrant = entering > 0 ? totalNtr / entering : 0;
  const year1Share =
    totalNtr > 0 && rows.length > 0 ? rows[0].ntr / totalNtr : 0;

  return {
    valid: true,
    error: '',
    clipped,
    survivalCurve,
    rows,
    entering,
    chargePerTerm,
    aidPerTerm,
    compFeePerTerm,
    netPerTerm,
    aidPct,
    totalNtr,
    totalLowNtr,
    totalHighNtr,
    totalGrossTuition,
    totalInstitutionalAid,
    totalStudentTerms,
    impliedFallToFallRetention,
    ntrPerEntrant,
    year1Share,
    aidTierLabel: classifyAidTier(aidPct),
    aidEfficiency:
      chargePerTerm + compFeePerTerm > 0
        ? netPerTerm / (chargePerTerm + compFeePerTerm)
        : 1.0 - aidFraction,
    includeSummer,
    springToFallOffset,
  };
}

