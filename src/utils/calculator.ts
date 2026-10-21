export interface SchoolEntrantConfig {
  terms_per_year: number;
  rates: number[];
  curve: number[];
  entering: number;
  charge_per_term: number;
  aid_rate: number;
}

export interface YearProjectionRow {
  year: number;
  label: string;
  entryTermHeads: number;
  enrolledStudentTerms: number;
  endOfYearSurvival: number;
  grossTuition: number;
  institutionalAid: number;
  ntr: number;
}

export interface CalculatorResult {
  valid: boolean;
  error: string;
  clipped: boolean;
  survivalCurve: number[];
  rows: YearProjectionRow[];
  totalNtr: number;
  totalGrossTuition: number;
  totalInstitutionalAid: number;
  totalStudentTerms: number;
  impliedFallToFallRetention: number;
  ntrPerEntrant: number;
  year1Share: number;
  aidTierLabel: string;
  aidEfficiency: number;
  includeSummer: boolean;
}

export type CampusArchetypeId =
  | 'school_default'
  | 'open_access'
  | 'regional_public'
  | 'selective_four_year';

export interface CampusArchetypePreset {
  id: CampusArchetypeId;
  label: string;
  shortLabel: string;
  description: string;
  entering: number;
  chargePerTerm: number;
  aidPct: number;
  aidMixShiftPct: number;
  summerRecoveryPct: number;
}

export const CAMPUS_ARCHETYPES: Record<CampusArchetypeId, CampusArchetypePreset> = {
  school_default: {
    id: 'school_default',
    label: 'Empirical School Baseline (as_of 2024FA)',
    shortLabel: 'School Baseline',
    description:
      'Uses the selected school’s fitted Markov continuation vector p_EE(d), empirical Fall entrant count, and baseline institutional discount rate.',
    entering: 0, // resolved dynamically from schoolConfig
    chargePerTerm: 0,
    aidPct: 0,
    aidMixShiftPct: 0,
    summerRecoveryPct: 0,
  },
  open_access: {
    id: 'open_access',
    label: 'Archetype A · Broad-Access Commuter / Transfer-Intensive',
    shortLabel: 'Broad-Access Commuter',
    description:
      'Larger entering cohort with moderate sticker tuition, higher Pell/need-aid share (+10 pp mix α), and active Summer (SU) credit-recovery uptake (20%).',
    entering: 950,
    chargePerTerm: 9800,
    aidPct: 38.0,
    aidMixShiftPct: 10,
    summerRecoveryPct: 20,
  },
  regional_public: {
    id: 'regional_public',
    label: 'Archetype B · Regional Comprehensive University',
    shortLabel: 'Regional Comprehensive',
    description:
      'Mid-sized residential/commuter blend in the Partial Aid tier (42% discount) with +5 pp high-need mix shift and 15% Summer credit-recovery bridge participation.',
    entering: 1150,
    chargePerTerm: 14200,
    aidPct: 42.0,
    aidMixShiftPct: 5,
    summerRecoveryPct: 15,
  },
  selective_four_year: {
    id: 'selective_four_year',
    label: 'Archetype C · Selective Residential Four-Year',
    shortLabel: 'Selective Residential',
    description:
      'High-tuition, high-aid residential cohort in the Substantial Aid tier (54% discount) with strong first-year academic momentum and targeted 25% Summer course recovery.',
    entering: 820,
    chargePerTerm: 24500,
    aidPct: 54.0,
    aidMixShiftPct: -4,
    summerRecoveryPct: 25,
  },
};

export type InterventionPresetId =
  | 'none'
  | 'summer_bridge'
  | 'first_year_advising'
  | 'need_microgrant'
  | 'comprehensive';

export interface InterventionPreset {
  id: InterventionPresetId;
  label: string;
  shortLabel: string;
  targetWindow: string;
  irMechanism: string;
  defaultCostPerStudent: number;
  firstYearHazardReduction: number;
  ongoingHazardReduction: number;
  summerRecoveryBoostPct: number;
  targetShareOfCohort: number;
}

export const INTERVENTION_PRESETS: Record<
  InterventionPresetId,
  InterventionPreset
> = {
  none: {
    id: 'none',
    label: 'No Prescriptive Intervention (Baseline Policy)',
    shortLabel: 'Baseline Policy',
    targetWindow: 'All durations d = 0..11',
    irMechanism:
      'Propagates cohort survival S(d) under status-quo institutional advising and current seasonal continuation rates.',
    defaultCostPerStudent: 0,
    firstYearHazardReduction: 0,
    ongoingHazardReduction: 0,
    summerRecoveryBoostPct: 0,
    targetShareOfCohort: 0,
  },
  summer_bridge: {
    id: 'summer_bridge',
    label: 'Summer (YYYY+1 SU) Credit-Recovery Micro-Grant',
    shortLabel: 'Summer SU Credit Bridge',
    targetWindow: '2019FA → 2020SP (D/F deficit) → 2020SU → 2020FA (offset=2)',
    irMechanism:
      'Funds 3–6 Summer (SU) make-up credits for students earning a D/W in Spring (SP), restoring academic standing before Fall census.',
    defaultCostPerStudent: 1200,
    firstYearHazardReduction: 0.14,
    ongoingHazardReduction: 0.04,
    summerRecoveryBoostPct: 25,
    targetShareOfCohort: 0.22,
  },
  first_year_advising: {
    id: 'first_year_advising',
    label: 'First-Year (d=0 → d=1) Intrusive Advising & Early Alert',
    shortLabel: '1st-Yr Intrusive Advising',
    targetWindow: 'Entry Fall (YYYYFA) to First Spring (YYYY+1 SP)',
    irMechanism:
      'Reduces early-term exit hazard h(0) and h(1) via mid-semester grade alerts and mandatory degree-audit coaching.',
    defaultCostPerStudent: 450,
    firstYearHazardReduction: 0.18,
    ongoingHazardReduction: 0.05,
    summerRecoveryBoostPct: 5,
    targetShareOfCohort: 1.0,
  },
  need_microgrant: {
    id: 'need_microgrant',
    label: 'Unmet-Need Persistence Micro-Grant (Partial/Substantial Aid)',
    shortLabel: 'Retention Micro-Grant',
    targetWindow: 'Registration hold clearance across Year 1 & Year 2',
    irMechanism:
      'Clears bursar balances (<$1,500) for Partial & Substantial Aid tiers (discount_description 35–80%) prior to Fall/Spring census.',
    defaultCostPerStudent: 950,
    firstYearHazardReduction: 0.15,
    ongoingHazardReduction: 0.1,
    summerRecoveryBoostPct: 10,
    targetShareOfCohort: 0.38,
  },
  comprehensive: {
    id: 'comprehensive',
    label: 'Integrated Retention Surge (Advising + SU Bridge + Micro-Grant)',
    shortLabel: 'Integrated Surge Package',
    targetWindow: 'Full first-to-second year lifecycle (FA → SP → SU → FA)',
    irMechanism:
      'Combines early-alert advising, bursar hold micro-grants, and Summer (SU) credit recovery for students with Spring course deficits.',
    defaultCostPerStudent: 1450,
    firstYearHazardReduction: 0.26,
    ongoingHazardReduction: 0.12,
    summerRecoveryBoostPct: 30,
    targetShareOfCohort: 0.45,
  },
};

export interface PrescriptiveSimulationResult {
  valid: boolean;
  error: string;
  syntheticBase: CalculatorResult;
  simulated: CalculatorResult;
  effectiveSummerRecoveryPct: number;
  springAtRiskHeads: number;
  summerBridgeParticipants: number;
  summerRecoveredHeads: number;
  summerInstructionalNtr: number;
  targetedStudents: number;
  totalInterventionCost: number;
  grossNtrLift: number;
  netInstitutionalRoi: number;
  roiMultiplier: number;
  headsSavedYear2: number;
  totalStudentTermsSaved: number;
  breakEvenHeads: number;
  dgpAidLiftActive: boolean;
}

export const MULTIPLIER_MIN = 0.5;
export const MULTIPLIER_MAX = 1.1;

/**
 * Classifies an institutional grant discount percentage into the 5-tier
 * award schedule (`discount_description`) from the original model:
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
    return 'Tuition charge must be zero or more.';
  }
  if (!Number.isFinite(aidPct) || aidPct < 0 || aidPct > 100) {
    return 'Aid must be between 0 and 100 percent.';
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

export function computeEntrantProjection(
  schoolConfig: SchoolEntrantConfig,
  years: number,
  entering: number,
  charge: number,
  aidPct: number,
  multiplier: number
): CalculatorResult {
  const error = validateCalculatorInputs(entering, charge, aidPct, multiplier);
  const tpy = schoolConfig.terms_per_year;
  if (error) {
    return {
      valid: false,
      error,
      clipped: false,
      survivalCurve: [],
      rows: [],
      totalNtr: 0,
      totalGrossTuition: 0,
      totalInstitutionalAid: 0,
      totalStudentTerms: 0,
      impliedFallToFallRetention: 0,
      ntrPerEntrant: 0,
      year1Share: 0,
      aidTierLabel: classifyAidTier(0),
      aidEfficiency: 1,
      includeSummer: tpy === 3,
    };
  }

  let s = 1.0;
  let clipped = false;
  const survivalCurve: number[] = [1.0];

  for (const rate of schoolConfig.rates) {
    let scaled = multiplier * rate;
    if (scaled > 1.0) {
      scaled = 1.0;
      clipped = true;
    }
    s *= scaled;
    survivalCurve.push(s);
  }

  const aidFraction = aidPct / 100.0;
  const aidPerTerm = charge * aidFraction;
  const netPerTerm = charge * (1.0 - aidFraction);
  const rows: YearProjectionRow[] = [];

  for (let y = 0; y < years; y++) {
    let enrolledStudentTerms = 0;
    for (let i = 0; i < tpy; i++) {
      const termIdx = y * tpy + i;
      const surv = survivalCurve[termIdx] ?? 0;
      enrolledStudentTerms += entering * surv;
    }
    const entrySurv = survivalCurve[y * tpy] ?? 0;
    const endOfYearSurvival = survivalCurve[(y + 1) * tpy] ?? 0;
    const entryTermHeads = Math.round(entering * entrySurv);
    const grossTuition = enrolledStudentTerms * charge;
    const institutionalAid = enrolledStudentTerms * aidPerTerm;
    const ntr = enrolledStudentTerms * netPerTerm;

    rows.push({
      year: y + 1,
      label: `Year ${y + 1}`,
      entryTermHeads,
      enrolledStudentTerms,
      endOfYearSurvival,
      grossTuition,
      institutionalAid,
      ntr,
    });
  }

  const totalNtr = rows.reduce((acc, r) => acc + r.ntr, 0);
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
    totalNtr,
    totalGrossTuition,
    totalInstitutionalAid,
    totalStudentTerms,
    impliedFallToFallRetention,
    ntrPerEntrant,
    year1Share,
    aidTierLabel: classifyAidTier(aidPct),
    aidEfficiency: 1.0 - aidFraction,
    includeSummer: tpy === 3,
  };
}

/**
 * Evaluates counterfactual cohort sensitivity parameters (unfunded-need hazard shift `mix α`,
 * optional synthetic DGP aid-retention lift for `discount > 50%`, and single-bridge
 * `2019FA -> 2020SP -> 2020SU -> 2020FA` Summer credit-recovery uptake) alongside
 * retention program cost break-even thresholds.
 */
export function computePrescriptiveSimulation(
  schoolConfig: SchoolEntrantConfig,
  years: number,
  entering: number,
  charge: number,
  aidPct: number,
  multiplier: number,
  aidMixShiftPct: number,
  summerRecoveryPct: number,
  interventionId: InterventionPresetId,
  costPerTargetedStudent: number,
  applyDgpAidLift = false
): PrescriptiveSimulationResult {
  const baseValidation = computeEntrantProjection(
    schoolConfig,
    years,
    entering,
    charge,
    aidPct,
    multiplier
  );

  if (!baseValidation.valid) {
    return {
      valid: false,
      error: baseValidation.error,
      syntheticBase: baseValidation,
      simulated: baseValidation,
      effectiveSummerRecoveryPct: 0,
      springAtRiskHeads: 0,
      summerBridgeParticipants: 0,
      summerRecoveredHeads: 0,
      summerInstructionalNtr: 0,
      targetedStudents: 0,
      totalInterventionCost: 0,
      grossNtrLift: 0,
      netInstitutionalRoi: 0,
      roiMultiplier: 0,
      headsSavedYear2: 0,
      totalStudentTermsSaved: 0,
      breakEvenHeads: 0,
      dgpAidLiftActive: false,
    };
  }

  const tpy = schoolConfig.terms_per_year;
  const clampedMixShift = Math.max(-20, Math.min(20, aidMixShiftPct));
  const preset = INTERVENTION_PRESETS[interventionId] || INTERVENTION_PRESETS.none;
  const effectiveSummerRecoveryPct = Math.max(
    0,
    Math.min(60, summerRecoveryPct + preset.summerRecoveryBoostPct)
  );

  // 1. Construct the Synthetic Cohort Baseline:
  //    - Unfunded-need composition shift (`clampedMixShift` > 0) increases exit hazard by +0.35% per +1 pp.
  //    - If `applyDgpAidLift` is enabled and `aidPct > 50`, applies the synthetic generator's
  //      1.10x continuation lift for Substantial/Near-Full Aid strata (reconciling Section 04 DGP).
  const mixHazardElasticity = 0.0035 * clampedMixShift;
  const dgpAidLiftActive = Boolean(applyDgpAidLift && aidPct > 50);
  const dgpAidMultiplier = dgpAidLiftActive ? 1.1 : 1.0;

  const syntheticBaseRates = schoolConfig.rates.map((r) => {
    const baseScaled = Math.min(1.0, Math.max(0.0, multiplier * dgpAidMultiplier * r));
    const exitHazard = 1.0 - baseScaled;
    const adjustedHazard = Math.min(
      0.95,
      Math.max(0.0, exitHazard * (1.0 + mixHazardElasticity))
    );
    return 1.0 - adjustedHazard;
  });

  const syntheticBaseConfig: SchoolEntrantConfig = {
    ...schoolConfig,
    rates: syntheticBaseRates,
  };

  const syntheticBase = computeEntrantProjection(
    syntheticBaseConfig,
    years,
    entering,
    charge,
    aidPct,
    1.0
  );

  // 2. Apply single-bridge Summer (SU) Credit-Recovery (`2019FA -> 2020SP -> 2020SU -> 2020FA`)
  //    and counterfactual intervention hazard reductions.
  //    IMPORTANT FIX: Apply the Spring-to-Fall bridge hazard reduction ONCE per Year-1 bridge
  //    at index `tpy - 1` (idx = 2 for 3-term calendars, idx = 1 for 2-term calendars) so 3-term
  //    schools do not double-compound the summer recovery reduction across two transitions.
  const summerRecoveryFraction = (effectiveSummerRecoveryPct / 100.0) * 0.75;
  const bridgeTransitionIdx = tpy - 1;

  const simulatedRates = syntheticBaseRates.map((r, idx) => {
    let exitHazard = 1.0 - r;
    const isFirstYear = idx < tpy;

    const hazardReduction = isFirstYear
      ? preset.firstYearHazardReduction
      : preset.ongoingHazardReduction;
    exitHazard *= Math.max(0.0, 1.0 - hazardReduction);

    if (idx === bridgeTransitionIdx && summerRecoveryFraction > 0) {
      exitHazard *= Math.max(0.0, 1.0 - summerRecoveryFraction);
    }

    return Math.min(1.0, Math.max(0.0, 1.0 - exitHazard));
  });

  const simulatedConfig: SchoolEntrantConfig = {
    ...schoolConfig,
    rates: simulatedRates,
  };

  const rawSimulated = computeEntrantProjection(
    simulatedConfig,
    years,
    entering,
    charge,
    aidPct,
    1.0
  );

  // 3. Quantify the sequential Summer (YYYYTT SU) credit-recovery bridge volume:
  //    Students enrolled in first Spring (2020SP, d=1) who are at risk of not returning for Year-2 Fall (2020FA)
  const springEnrolledHeads = entering * (syntheticBase.survivalCurve[1] ?? 0);
  const year2FallBaseHeads = entering * (syntheticBase.survivalCurve[tpy] ?? 0);
  const springAtRiskHeads = Math.max(0, springEnrolledHeads - year2FallBaseHeads);
  const summerBridgeParticipants = Math.round(
    springAtRiskHeads * (effectiveSummerRecoveryPct / 100.0)
  );
  const summerRecoveredHeads = Math.round(summerBridgeParticipants * 0.75);

  // Incremental Summer make-up course revenue (1 course = 0.25 FTE term tuition net of grant aid)
  const netPerTerm = charge * (1.0 - aidPct / 100.0);
  const summerInstructionalNtr =
    summerBridgeParticipants * (0.25 * netPerTerm);

  const updatedRows = rawSimulated.rows.map((row, idx) => {
    if (idx === 0 && summerInstructionalNtr > 0) {
      const summerGross = summerBridgeParticipants * 0.25 * charge;
      const summerAid = summerGross * (aidPct / 100.0);
      return {
        ...row,
        enrolledStudentTerms:
          row.enrolledStudentTerms + summerBridgeParticipants * 0.25,
        grossTuition: row.grossTuition + summerGross,
        institutionalAid: row.institutionalAid + summerAid,
        ntr: row.ntr + summerInstructionalNtr,
      };
    }
    return row;
  });

  const simulated: CalculatorResult = {
    ...rawSimulated,
    rows: updatedRows,
    totalNtr: rawSimulated.totalNtr + summerInstructionalNtr,
    totalGrossTuition:
      rawSimulated.totalGrossTuition +
      summerBridgeParticipants * 0.25 * charge,
    totalInstitutionalAid:
      rawSimulated.totalInstitutionalAid +
      summerBridgeParticipants * 0.25 * charge * (aidPct / 100.0),
    totalStudentTerms:
      rawSimulated.totalStudentTerms + summerBridgeParticipants * 0.25,
    ntrPerEntrant:
      entering > 0
        ? (rawSimulated.totalNtr + summerInstructionalNtr) / entering
        : 0,
  };

  // 4. Compute Counterfactual Program Cost & Break-Even Thresholds
  const sanitizedCostPerStudent = Math.max(0, Number(costPerTargetedStudent) || 0);
  let targetedStudents = 0;
  if (interventionId === 'summer_bridge') {
    targetedStudents = Math.max(
      summerBridgeParticipants,
      Math.round(entering * preset.targetShareOfCohort)
    );
  } else if (interventionId !== 'none') {
    targetedStudents = Math.round(entering * preset.targetShareOfCohort);
  } else if (summerBridgeParticipants > 0) {
    targetedStudents = summerBridgeParticipants;
  }

  const totalInterventionCost = targetedStudents * sanitizedCostPerStudent;
  const grossNtrLift = simulated.totalNtr - syntheticBase.totalNtr;
  const netInstitutionalRoi = grossNtrLift - totalInterventionCost;
  const roiMultiplier =
    totalInterventionCost > 0 ? grossNtrLift / totalInterventionCost : 0;

  const headsSavedYear2 =
    (simulated.rows[1]?.entryTermHeads ?? 0) -
    (syntheticBase.rows[1]?.entryTermHeads ?? 0);
  const totalStudentTermsSaved =
    simulated.totalStudentTerms - syntheticBase.totalStudentTerms;

  const netPerYear = netPerTerm * tpy;
  const breakEvenHeads =
    netPerYear > 0 ? totalInterventionCost / netPerYear : 0;

  return {
    valid: true,
    error: '',
    syntheticBase,
    simulated,
    effectiveSummerRecoveryPct,
    springAtRiskHeads: Math.round(springAtRiskHeads),
    summerBridgeParticipants,
    summerRecoveredHeads,
    summerInstructionalNtr,
    targetedStudents,
    totalInterventionCost,
    grossNtrLift,
    netInstitutionalRoi,
    roiMultiplier,
    headsSavedYear2,
    totalStudentTermsSaved,
    breakEvenHeads,
    dgpAidLiftActive,
  };
}
