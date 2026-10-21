import React, { useEffect, useId, useRef, useState } from 'react';
import { SiteData } from '../data/types';
import {
  CAMPUS_ARCHETYPES,
  CampusArchetypeId,
  computeEntrantProjection,
  computePrescriptiveSimulation,
  INTERVENTION_PRESETS,
  InterventionPresetId,
  MULTIPLIER_MAX,
  MULTIPLIER_MIN,
} from '../utils/calculator';

interface MarkovTooltipProps {
  title: string;
  formula: string;
  mechanism: string;
  liveReadout?: string;
  accent: string;
  align?: 'left' | 'right' | 'center';
}

const MarkovTooltip: React.FC<MarkovTooltipProps> = ({
  title,
  formula,
  mechanism,
  liveReadout,
  accent,
  align = 'left',
}) => {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const tooltipId = useId();
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setPinned(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setPinned(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const alignClass =
    align === 'right'
      ? 'right-0'
      : align === 'center'
      ? 'left-1/2 -translate-x-1/2'
      : 'left-0';

  return (
    <span
      ref={containerRef}
      className="relative inline-flex items-center align-middle ml-1.5"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        if (!pinned) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-label={`Markov transition mechanism: ${title}`}
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (pinned) {
            setPinned(false);
            setOpen(false);
          } else {
            setPinned(true);
            setOpen(true);
          }
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          if (!pinned) setOpen(false);
        }}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-mono font-bold border transition-colors cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0d4f30]"
        style={{
          backgroundColor: open ? accent : '#f4f2ea',
          color: open ? '#ffffff' : '#444538',
          borderColor: open ? accent : '#c8c4b6',
        }}
        title="Click to pin or hover to inspect Markov transition probability mechanism"
      >
        ?
      </button>

      {open && (
        <span
          id={tooltipId}
          role="tooltip"
          className={`absolute z-30 bottom-full mb-2 ${alignClass} w-[290px] sm:w-[330px] p-3 rounded-[8px] border border-[#2c2d26] bg-[#1b1c18] text-[#f7f5ee] shadow-lg text-left font-normal normal-case tracking-normal leading-[1.45]`}
        >
          <span className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-[#35372f]">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.8px] text-[#a5d6b8] font-bold">
              {title}
            </span>
            <span className="font-mono text-[9.5px] text-[#9e9c92]">
              {pinned ? 'Pinned (Esc)' : 'Markov P(d)'}
            </span>
          </span>
          <span className="block font-mono text-[11px] bg-[#262822] text-[#e8e6dc] px-2 py-1 rounded border border-[#3a3c33] mb-1.5">
            {formula}
          </span>
          <span className="block text-[11.5px] text-[#d8d6ce]">
            {mechanism}
          </span>
          {liveReadout && (
            <span className="block mt-2 pt-1.5 border-t border-[#35372f] font-mono text-[10.5px] text-[#eab676]">
              {liveReadout}
            </span>
          )}
        </span>
      )}
    </span>
  );
};

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

  // Cohort & Sensitivity Parameters State
  const [archetype, setArchetype] =
    useState<CampusArchetypeId>('school_default');
  const [entering, setEntering] = useState<number>(currentSchoolData.entering);
  const [charge, setCharge] = useState<number>(
    currentSchoolData.charge_per_term
  );
  const [aidPct, setAidPct] = useState<number>(
    Number((currentSchoolData.aid_rate * 100).toFixed(1))
  );
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [aidMixShiftPct, setAidMixShiftPct] = useState<number>(0);
  const [summerRecoveryPct, setSummerRecoveryPct] = useState<number>(0);
  const [applyDgpAidLift, setApplyDgpAidLift] = useState<boolean>(false);

  // Counterfactual Intervention & Break-Even State
  const [interventionId, setInterventionId] =
    useState<InterventionPresetId>('none');
  const [costPerStudent, setCostPerStudent] = useState<number>(0);

  const handleSchoolChange = (newSchool: string) => {
    const s = ent.schools[newSchool];
    setSchool(newSchool);
    if (archetype === 'school_default') {
      setEntering(s.entering);
      setCharge(s.charge_per_term);
      setAidPct(Number((s.aid_rate * 100).toFixed(1)));
      setAidMixShiftPct(0);
      setSummerRecoveryPct(0);
    }
    setMultiplier(1.0);
  };

  const handleArchetypeChange = (newArchetype: CampusArchetypeId) => {
    setArchetype(newArchetype);
    if (newArchetype === 'school_default') {
      const s = ent.schools[school];
      setEntering(s.entering);
      setCharge(s.charge_per_term);
      setAidPct(Number((s.aid_rate * 100).toFixed(1)));
      setAidMixShiftPct(0);
      setSummerRecoveryPct(0);
    } else {
      const preset = CAMPUS_ARCHETYPES[newArchetype];
      setEntering(preset.entering);
      setCharge(preset.chargePerTerm);
      setAidPct(preset.aidPct);
      setAidMixShiftPct(preset.aidMixShiftPct);
      setSummerRecoveryPct(preset.summerRecoveryPct);
    }
  };

  const handleInterventionChange = (newIntervention: InterventionPresetId) => {
    setInterventionId(newIntervention);
    setCostPerStudent(
      INTERVENTION_PRESETS[newIntervention].defaultCostPerStudent
    );
  };

  const handleReset = () => {
    const s = ent.schools[school];
    setArchetype('school_default');
    setEntering(s.entering);
    setCharge(s.charge_per_term);
    setAidPct(Number((s.aid_rate * 100).toFixed(1)));
    setMultiplier(1.0);
    setAidMixShiftPct(0);
    setSummerRecoveryPct(0);
    setApplyDgpAidLift(false);
    setInterventionId('none');
    setCostPerStudent(0);
  };

  // School empirical baseline (unmodified as_of parameters)
  const baseline = computeEntrantProjection(
    currentSchoolData,
    ent.years,
    currentSchoolData.entering,
    currentSchoolData.charge_per_term,
    currentSchoolData.aid_rate * 100,
    1.0
  );

  // Full counterfactual sensitivity simulation
  const sim = computePrescriptiveSimulation(
    currentSchoolData,
    ent.years,
    entering,
    charge,
    aidPct,
    multiplier,
    aidMixShiftPct,
    summerRecoveryPct,
    interventionId,
    costPerStudent,
    applyDgpAidLift
  );

  const result = sim.simulated;
  const activeIntervention = INTERVENTION_PRESETS[interventionId];

  const usd = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

  const signedUsd = (n: number) =>
    (n >= 0 ? '+$' : '−$') + Math.round(Math.abs(n)).toLocaleString('en-US');

  const p1 = (v: number) => (v * 100).toFixed(1) + '%';

  const isPrescriptiveActive =
    interventionId !== 'none' || summerRecoveryPct > 0;

  // Live transition probability diagnostics for interactive tooltips
  const tpy = currentSchoolData.terms_per_year;
  const bridgeIdx = tpy - 1;
  const baseP0 = currentSchoolData.rates[0] ?? 0;
  const baseBridgeP = currentSchoolData.rates[bridgeIdx] ?? 0;
  const synthP0 = sim.syntheticBase.survivalCurve[1] ?? baseP0;
  const synthBridgeP =
    (sim.syntheticBase.survivalCurve[bridgeIdx] ?? 0) > 0
      ? (sim.syntheticBase.survivalCurve[tpy] ?? 0) /
        (sim.syntheticBase.survivalCurve[bridgeIdx] ?? 1)
      : baseBridgeP;
  const simP0 = result.survivalCurve[1] ?? synthP0;
  const simBridgeP =
    (result.survivalCurve[bridgeIdx] ?? 0) > 0
      ? (result.survivalCurve[tpy] ?? 0) /
        (result.survivalCurve[bridgeIdx] ?? 1)
      : synthBridgeP;
  const mixElasticityPct = (0.35 * aidMixShiftPct).toFixed(2);
  const suHazardReductionPct = (sim.effectiveSummerRecoveryPct * 0.75).toFixed(
    1
  );

  return (
    <section data-section="calc" className="scroll-mt-24">
      <div
        className="text-[11px] font-bold tracking-[1.6px] uppercase"
        style={{ color: accent }}
      >
        {calcTag}
      </div>

      <h2 className="font-serif font-normal text-[28px] md:text-[33px] leading-[1.12] tracking-[-0.4px] mt-3.5 text-[#1b1c18]">
        Entering class to four-year net tuition revenue
      </h2>

      <p className="text-[15.5px] leading-[1.68] text-[#444538] mt-3.5 max-w-[46em]">
        {calcIntro}
      </p>

      <div className="border border-[#e3e1d9] rounded-[10px] p-5 md:p-6 mt-5 bg-white/70">
        {/* Synthetic Campus Archetype Preset Bar */}
        <div className="pb-4 mb-4 border-b border-[#efede6]">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold tracking-[0.9px] uppercase text-[#1b1c18]">
              1. Synthetic Campus Archetype &amp; Cohort Parameter Generator
            </span>
            <span className="text-[11.5px] text-[#6f6d64]">
              Select a reference campus profile or customize parameters below
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CAMPUS_ARCHETYPES) as CampusArchetypeId[]).map(
              (archKey) => {
                const arch = CAMPUS_ARCHETYPES[archKey];
                const active = archetype === archKey;
                return (
                  <button
                    key={archKey}
                    type="button"
                    title={`${arch.label}: N₀=${arch.entering || currentSchoolData.entering}, unmet-need α=${arch.aidMixShiftPct >= 0 ? '+' : ''}${arch.aidMixShiftPct}pp, SU bridge=${arch.summerRecoveryPct}%`}
                    onClick={() => handleArchetypeChange(archKey)}
                    className="text-[12px] font-semibold px-3 py-1.5 rounded-[5px] border transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    style={{
                      backgroundColor: active ? accent : '#faf8f2',
                      color: active ? '#ffffff' : '#3a3b32',
                      borderColor: active ? accent : '#d5d2c6',
                    }}
                  >
                    {arch.shortLabel}
                  </button>
                );
              }
            )}
          </div>
          <div className="text-[12px] text-[#5a5b50] mt-2">
            <strong className="text-[#1b1c18]">
              {CAMPUS_ARCHETYPES[archetype].label}:
            </strong>{' '}
            {CAMPUS_ARCHETYPES[archetype].description}
          </div>
        </div>

        {/* Core Numeric Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 items-end">
          <div>
            <label
              htmlFor="calc-school"
              className="block text-[11px] font-bold tracking-[0.8px] uppercase text-[#6f6d64] mb-1.5"
            >
              School (calendar)
              <MarkovTooltip
                accent={accent}
                title="School Transition Vector"
                formula="p_EE(d) = P(S_{d+1}=E | S_d=E)"
                mechanism="Selects the school's empirical 4-year continuation vector p_EE(d) and calendar periodicity (2 terms/yr for Fall/Spring; 3 terms/yr when Summer is modeled)."
                liveReadout={`${school}: ${currentSchoolData.terms_per_year} terms/yr · Base p_EE(0)=${p1(baseP0)}, p_EE(${bridgeIdx})=${p1(baseBridgeP)}`}
              />
            </label>
            <select
              id="calc-school"
              value={school}
              onChange={(e) => handleSchoolChange(e.target.value)}
              className="w-full font-mono tabular-nums text-[13.5px] px-2.5 py-2 border border-[#d5d2c6] rounded-[6px] bg-[#faf8f2] text-[#1b1c18]"
            >
              {schoolKeys.map((s) => (
                <option key={s} value={s}>
                  {s} ({ent.schools[s].terms_per_year} terms/yr)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="calc-entering"
              className="block text-[11px] font-bold tracking-[0.8px] uppercase text-[#6f6d64] mb-1.5"
            >
              Fall entrants (N₀ / cohort_term)
            </label>
            <input
              id="calc-entering"
              type="number"
              min={0}
              step={10}
              value={entering}
              onChange={(e) => {
                setEntering(Number(e.target.value));
                setArchetype('school_default');
              }}
              className="w-full font-mono tabular-nums text-[13.5px] px-2.5 py-2 border border-[#d5d2c6] rounded-[6px] bg-[#faf8f2] text-[#1b1c18]"
            />
          </div>

          <div>
            <label
              htmlFor="calc-charge"
              className="block text-[11px] font-bold tracking-[0.8px] uppercase text-[#6f6d64] mb-1.5"
            >
              Charge / term ($)
            </label>
            <input
              id="calc-charge"
              type="number"
              min={0}
              step={100}
              value={charge}
              onChange={(e) => {
                setCharge(Number(e.target.value));
                setArchetype('school_default');
              }}
              className="w-full font-mono tabular-nums text-[13.5px] px-2.5 py-2 border border-[#d5d2c6] rounded-[6px] bg-[#faf8f2] text-[#1b1c18]"
            />
          </div>

          <div>
            <label
              htmlFor="calc-aid"
              className="block text-[11px] font-bold tracking-[0.8px] uppercase text-[#6f6d64] mb-1.5"
            >
              Institutional grant (%)
            </label>
            <input
              id="calc-aid"
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={aidPct}
              onChange={(e) => {
                setAidPct(Number(e.target.value));
                setArchetype('school_default');
              }}
              className="w-full font-mono tabular-nums text-[13.5px] px-2.5 py-2 border border-[#d5d2c6] rounded-[6px] bg-[#faf8f2] text-[#1b1c18]"
            />
          </div>

          <div>
            <label
              htmlFor="calc-mult"
              className="block text-[11px] font-bold tracking-[0.8px] uppercase text-[#6f6d64] mb-1.5"
            >
              Retention mult. (θ · p_EE)
              <MarkovTooltip
                accent={accent}
                align="right"
                title="Uniform Continuation Scalar θ"
                formula="p̃_EE(d) = min(1.0, θ · p_EE(d))"
                mechanism="Scales every term-to-term Markov continuation probability p_EE(d) by θ ∈ [0.50, 1.10] (clipped at 100% ceiling). Because S(d) = ∏ p̃_EE(k), θ compounds across all 4 years."
                liveReadout={`θ=${multiplier.toFixed(2)} → Scaled p̃_EE(0)=${p1(Math.min(1, multiplier * baseP0))}`}
              />
            </label>
            <input
              id="calc-mult"
              type="number"
              min={MULTIPLIER_MIN}
              max={MULTIPLIER_MAX}
              step={0.01}
              value={multiplier}
              onChange={(e) => setMultiplier(Number(e.target.value))}
              className="w-full font-mono tabular-nums text-[13.5px] px-2.5 py-2 border border-[#d5d2c6] rounded-[6px] bg-[#faf8f2] text-[#1b1c18]"
            />
          </div>
        </div>

        {/* Synthetic Demographic Mix & Summer (SU) Credit-Recovery Sliders */}
        <div className="mt-4 pt-4 border-t border-[#efede6] grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Slider 1: Unfunded-Need Composition Shift & DGP Aid-Tier Linkage */}
          <div className="border border-[#e8e6dc] rounded-[8px] p-3.5 bg-[#faf8f2]">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="calc-mix-shift"
                className="text-[11px] font-bold tracking-[0.8px] uppercase text-[#1b1c18]"
              >
                Unfunded-Need Stratum Shift (mix α · High-Need Share)
                <MarkovTooltip
                  accent={accent}
                  title="Unfunded-Need Exit-Hazard Elasticity"
                  formula="h_synth(d) = (1 − p̃_EE(d)) · (1 + 0.0035 · α)"
                  mechanism="Sensitivity parameter modeling an increase in unfunded financial need (+α pp) when grant aid is held fixed, raising per-term exit hazard h(d) by +0.35% per +1 pp. Conversely, enabling the DGP Aid-Lift toggle below links Grant > 50% to the generator's 1.10× continuation lift."
                  liveReadout={`α=${aidMixShiftPct >= 0 ? '+' : ''}${aidMixShiftPct}pp → Exit hazard ${Number(mixElasticityPct) >= 0 ? '+' : ''}${mixElasticityPct}% · p_synth(0): ${p1(baseP0)} → ${p1(synthP0)}`}
                />
              </label>
              <span className="font-mono tabular-nums text-[13px] font-bold text-[#1b1c18]">
                {aidMixShiftPct > 0
                  ? `+${aidMixShiftPct} pp`
                  : `${aidMixShiftPct} pp`}
              </span>
            </div>
            <input
              id="calc-mix-shift"
              type="range"
              min={-20}
              max={20}
              step={1}
              value={aidMixShiftPct}
              onChange={(e) => setAidMixShiftPct(Number(e.target.value))}
              className="w-full mt-2 accent-[#0d4f30] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-mono text-[#6f6d64] mt-1">
              <span>−20 pp (Lower Unfunded Need)</span>
              <span>0 pp (Baseline Mix)</span>
              <span>+20 pp (Higher Unfunded Need)</span>
            </div>
            <div className="mt-2.5 pt-2 border-t border-[#e8e6dc] flex flex-wrap items-center justify-between gap-2">
              <label className="inline-flex items-center gap-2 text-[11.5px] font-medium text-[#1b1c18] cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyDgpAidLift}
                  onChange={(e) => setApplyDgpAidLift(e.target.checked)}
                  className="accent-[#0d4f30] cursor-pointer"
                />
                <span>
                  Link Institutional Grant &gt; 50% to DGP 1.10× Persistence Lift
                </span>
              </label>
              <span className="font-mono text-[11px] text-[#6f6d64]">
                {sim.dgpAidLiftActive
                  ? 'Active (1.10× p_EE lift)'
                  : aidPct > 50
                  ? 'Off (Price-only)'
                  : 'Requires Grant > 50%'}
              </span>
            </div>
          </div>

          {/* Slider 2: Summer (SU) Credit-Recovery & Single-Bridge Uptake */}
          <div className="border border-[#e8e6dc] rounded-[8px] p-3.5 bg-[#faf8f2]">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="calc-summer-recovery"
                className="text-[11px] font-bold tracking-[0.8px] uppercase text-[#1b1c18]"
              >
                Summer (SU) Credit-Recovery Uptake (2020SP → 2020SU)
                <MarkovTooltip
                  accent={accent}
                  align="right"
                  title="Single-Bridge Spring-to-Fall Hazard Reduction"
                  formula="h_bridge(tpy−1) = h_synth(tpy−1) · (1 − 0.75 · u_SU)"
                  mechanism="Models the Year-1 Spring-to-Fall credit-recovery bridge. Applied once at the Year-2 Fall entry transition (d = tpy − 1) so 3-term and 2-term calendars receive an identical single-bridge hazard reduction without double-compounding."
                  liveReadout={`Eff. u_SU=${sim.effectiveSummerRecoveryPct}% → Bridge hazard −${suHazardReductionPct}% · p_EE(${bridgeIdx}): ${p1(synthBridgeP)} → ${p1(simBridgeP)}`}
                />
              </label>
              <span
                className="font-mono tabular-nums text-[13px] font-bold"
                style={{ color: accent }}
              >
                {summerRecoveryPct}% (Eff. {sim.effectiveSummerRecoveryPct}%)
              </span>
            </div>
            <input
              id="calc-summer-recovery"
              type="range"
              min={0}
              max={50}
              step={5}
              value={summerRecoveryPct}
              onChange={(e) => setSummerRecoveryPct(Number(e.target.value))}
              className="w-full mt-2 accent-[#0d4f30] cursor-pointer"
            />
            <div className="flex flex-wrap items-center justify-between gap-1.5 mt-1.5">
              <div className="flex gap-1.5">
                {[
                  {
                    label: '0% Off',
                    val: 0,
                    tip: 'No discretionary Summer bridge uptake (0% slider); only baseline transitions apply.',
                  },
                  {
                    label: '15% Moderate SU',
                    val: 15,
                    tip: '15% of at-risk Spring students take Summer credit recovery, cutting Year-2 Fall entry hazard by 11.25%.',
                  },
                  {
                    label: '30% Active SU Bridge',
                    val: 30,
                    tip: '30% of at-risk Spring students enroll in Summer make-up credits, cutting Year-2 Fall entry hazard by 22.5%.',
                  },
                ].map((btn) => (
                  <button
                    key={btn.val}
                    type="button"
                    title={btn.tip}
                    onClick={() => setSummerRecoveryPct(btn.val)}
                    className="text-[10.5px] font-mono px-2 py-0.5 rounded border border-[#d5d2c6] bg-white text-[#444538] hover:text-[#1b1c18] cursor-pointer whitespace-nowrap shrink-0"
                    style={{
                      borderColor:
                        summerRecoveryPct === btn.val ? accent : '#d5d2c6',
                      fontWeight: summerRecoveryPct === btn.val ? 700 : 400,
                    }}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
              <span className="text-[11px] font-mono tabular-nums text-[#6f6d64]">
                At-risk SP pool: {sim.springAtRiskHeads} students
              </span>
            </div>
            <p className="text-[11.5px] text-[#5a5b50] leading-[1.45] mt-2">
              Counterfactual sensitivity for{' '}
              <code className="font-mono">2019FA → 2020SP → 2020SU → 2020FA</code>{' '}
              make-up courses (0.25 FTE tuition weight, 75% assumed recovery):{' '}
              {sim.summerBridgeParticipants > 0 ? (
                <strong className="text-[#1b1c18]">
                  {sim.summerBridgeParticipants} students take SU credit
                  recovery, restoring +{sim.summerRecoveredHeads} Fall (
                  <code className="font-mono">2020FA</code>) re-enrollments (
                  {usd(sim.summerInstructionalNtr)} SU tuition).
                </strong>
              ) : (
                <span>
                  Move slider above 0% to test single-bridge Summer credit
                  recovery into <code className="font-mono">2020FA</code>.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Counterfactual Intervention & Net Tuition Break-Even Simulator */}
        <div className="mt-4 pt-4 border-t border-[#efede6]">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <div>
              <span className="text-[11px] font-bold tracking-[0.9px] uppercase text-[#1b1c18]">
                2. Counterfactual Intervention &amp; Net Tuition Break-Even
                Simulator
                <MarkovTooltip
                  accent={accent}
                  title="Counterfactual Hazard Dampening"
                  formula="p_sim(d) = 1 − h_synth(d)·(1 − δ_yr1/ongoing)"
                  mechanism="Applies user-specified counterfactual hazard reductions δ_yr1 to Year-1 transitions (d < terms_per_year) and δ_ongoing to Years 2–4 (d ≥ terms_per_year) to solve for break-even retained headcount against program expenditure."
                  liveReadout={`Active: ${activeIntervention.shortLabel} · Yr-1 δ=−${Math.round(activeIntervention.firstYearHazardReduction * 100)}%, Ongoing δ=−${Math.round(activeIntervention.ongoingHazardReduction * 100)}%`}
                />
              </span>
              <span className="ml-2 text-[11.5px] text-[#6f6d64]">
                (Sensitivity assumptions — not causal estimates from observational data)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="calc-intervention-cost"
                className="text-[11px] font-bold uppercase tracking-[0.6px] text-[#6f6d64]"
              >
                Cost / Targeted Student ($):
              </label>
              <input
                id="calc-intervention-cost"
                type="number"
                min={0}
                max={10000}
                step={50}
                value={costPerStudent}
                onChange={(e) => setCostPerStudent(Number(e.target.value))}
                className="w-24 font-mono tabular-nums text-[12.5px] px-2 py-1 border border-[#d5d2c6] rounded-[5px] bg-[#faf8f2] text-[#1b1c18]"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              Object.keys(INTERVENTION_PRESETS) as InterventionPresetId[]
            ).map((intKey) => {
              const item = INTERVENTION_PRESETS[intKey];
              const active = interventionId === intKey;
              return (
                <button
                  key={intKey}
                  type="button"
                  title={`${item.label}: Yr-1 exit hazard −${Math.round(item.firstYearHazardReduction * 100)}%, Years 2–4 exit hazard −${Math.round(item.ongoingHazardReduction * 100)}%, SU bridge boost +${item.summerRecoveryBoostPct}%`}
                  onClick={() => handleInterventionChange(intKey)}
                  className="text-[12px] font-semibold px-3 py-1.5 rounded-[5px] border transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  style={{
                    backgroundColor: active ? accent : '#faf8f2',
                    color: active ? '#ffffff' : '#3a3b32',
                    borderColor: active ? accent : '#d5d2c6',
                  }}
                >
                  {item.shortLabel}
                </button>
              );
            })}
          </div>

          <div className="mt-2.5 p-3 rounded-[6px] border border-[#e8e6dc] bg-[#faf8f2] text-[12px] text-[#444538] flex flex-wrap items-center justify-between gap-3">
            <div className="max-w-[54em]">
              <strong className="text-[#1b1c18]">
                {activeIntervention.label} ({activeIntervention.targetWindow}):
              </strong>{' '}
              {activeIntervention.irMechanism}
              <span className="block font-mono tabular-nums text-[11px] text-[#0d4f30] mt-1">
                Assumed sensitivity: Yr-1 exit hazard −
                {Math.round(activeIntervention.firstYearHazardReduction * 100)}%
                · Ongoing exit hazard −
                {Math.round(activeIntervention.ongoingHazardReduction * 100)}% ·
                SU recovery boost +{activeIntervention.summerRecoveryBoostPct}%
                · p_EE(0): {p1(synthP0)} → {p1(simP0)} · p_EE({bridgeIdx}):{' '}
                {p1(synthBridgeP)} → {p1(simBridgeP)}
              </span>
            </div>
            <div className="font-mono tabular-nums text-[11.5px] text-[#1b1c18] whitespace-nowrap">
              Targeted cohort:{' '}
              <strong>{sim.targetedStudents.toLocaleString('en-US')}</strong>{' '}
              students · Program cost:{' '}
              <strong>{usd(sim.totalInterventionCost)}</strong>
            </div>
          </div>
        </div>

        {/* Dual-Terminology Parameter Context Bar */}
        {result.valid && (
          <div className="mt-3.5 pt-3 border-t border-[#efede6] flex flex-wrap items-center justify-between gap-2 text-[12px] text-[#5a5b50]">
            <div>
              <span className="font-semibold text-[#1b1c18]">
                Award Tier (discount_description):
              </span>{' '}
              <span className="font-mono text-[#1b1c18]">
                {result.aidTierLabel}
              </span>{' '}
              <span aria-hidden="true">·</span>{' '}
              <span>
                aid_efficiency:{' '}
                <strong className="font-mono tabular-nums text-[#1b1c18]">
                  {(result.aidEfficiency * 100).toFixed(1)}%
                </strong>
              </span>
            </div>
            <div className="font-mono text-[11.5px] text-[#6f6d64]">
              Calendar rule:{' '}
              {result.includeSummer
                ? 'INCLUDE_SUMMER=True · 3 terms/yr (FA, SP, SU)'
                : 'INCLUDE_SUMMER=False · 2 terms/yr (FA, SP)'}
            </div>
          </div>
        )}

        {!result.valid ? (
          <div className="mt-4 text-[13px] font-semibold text-[#b06a3a]">
            {result.error}
          </div>
        ) : (
          <div className="mt-5 pt-4 border-t border-[#e3e1d9]">
            {/* Institutional Research KPI Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-stretch">
              <div className="border border-[#e8e6dc] rounded-[8px] p-3.5 bg-[#faf8f2]">
                <div className="text-[11px] font-bold tracking-[0.8px] uppercase text-[#6f6d64]">
                  4-yr Net Tuition Revenue (E[NTR₁:₄])
                </div>
                <div
                  className="text-[26px] font-extrabold tracking-tight leading-none font-mono tabular-nums mt-1.5"
                  style={{ color: accent }}
                >
                  {usd(result.totalNtr)}
                </div>
                <div className="text-[12px] font-mono tabular-nums text-[#54564c] mt-1.5">
                  Δ vs {school} baseline:{' '}
                  <span
                    className="font-bold"
                    style={{
                      color:
                        result.totalNtr - baseline.totalNtr >= 0
                          ? accent
                          : '#b06a3a',
                    }}
                  >
                    {signedUsd(result.totalNtr - baseline.totalNtr)}
                  </span>
                </div>
              </div>

              <div className="border border-[#e8e6dc] rounded-[8px] p-3.5 bg-[#faf8f2]">
                <div className="text-[11px] font-bold tracking-[0.8px] uppercase text-[#6f6d64]">
                  Year-2 Survival · S(d={currentSchoolData.terms_per_year})
                </div>
                <div className="text-[26px] font-extrabold tracking-tight leading-none font-mono tabular-nums mt-1.5 text-[#1b1c18]">
                  {p1(result.impliedFallToFallRetention)}
                </div>
                <div className="text-[12px] font-mono tabular-nums text-[#6f6d64] mt-1.5">
                  Baseline S(t_{currentSchoolData.terms_per_year}):{' '}
                  {p1(baseline.impliedFallToFallRetention)} ·{' '}
                  {sim.headsSavedYear2 >= 0
                    ? `+${sim.headsSavedYear2}`
                    : sim.headsSavedYear2}{' '}
                  Yr-2 heads
                </div>
              </div>

              <div className="border border-[#e8e6dc] rounded-[8px] p-3.5 bg-[#faf8f2]">
                <div className="text-[11px] font-bold tracking-[0.8px] uppercase text-[#6f6d64]">
                  Cumulative Student-Terms (Σ N₀·S(d))
                </div>
                <div className="text-[26px] font-extrabold tracking-tight leading-none font-mono tabular-nums mt-1.5 text-[#1b1c18]">
                  {Math.round(result.totalStudentTerms).toLocaleString('en-US')}
                </div>
                <div className="text-[12px] font-mono tabular-nums text-[#6f6d64] mt-1.5">
                  NTR / entrant: {usd(result.ntrPerEntrant)} · Yr-1 share{' '}
                  {p1(result.year1Share)}
                </div>
              </div>

              <div className="border border-[#e8e6dc] rounded-[8px] p-3.5 bg-[#faf8f2]">
                <div className="text-[11px] font-bold tracking-[0.8px] uppercase text-[#6f6d64]">
                  Counterfactual Net Return (Δ NTR − Cost)
                </div>
                <div
                  className="text-[22px] font-extrabold tracking-tight leading-none font-mono tabular-nums mt-1.5"
                  style={{
                    color:
                      sim.netInstitutionalRoi >= 0 ? accent : '#b06a3a',
                  }}
                >
                  {isPrescriptiveActive
                    ? signedUsd(sim.netInstitutionalRoi)
                    : '$0 (Baseline)'}
                </div>
                <div className="text-[12px] font-mono tabular-nums text-[#6f6d64] mt-1.5">
                  {isPrescriptiveActive ? (
                    <>
                      Gross lift: {signedUsd(sim.grossNtrLift)} ·{' '}
                      {sim.totalInterventionCost > 0
                        ? `${sim.roiMultiplier.toFixed(1)}× ratio`
                        : 'No cost'}
                    </>
                  ) : (
                    <>
                      Gross: {usd(result.totalGrossTuition)} · Aid: −
                      {usd(result.totalInstitutionalAid)}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Counterfactual Ledger Banner when an intervention or SU bridge is active */}
            {isPrescriptiveActive && (
              <div className="mt-3.5 p-3 rounded-[8px] border border-[#d5d2c6] bg-[#f4f2ea] text-[12px] font-mono tabular-nums text-[#1b1c18] flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-sans font-bold uppercase tracking-[0.6px] text-[#0d4f30]">
                    Counterfactual Break-Even Audit:
                  </span>{' '}
                  Unintervened NTR:{' '}
                  <strong>{usd(sim.syntheticBase.totalNtr)}</strong> →
                  Simulated NTR: <strong>{usd(result.totalNtr)}</strong> (Gross
                  Lift: <strong>{signedUsd(sim.grossNtrLift)}</strong>)
                </div>
                <div>
                  Program Cost: <strong>−{usd(sim.totalInterventionCost)}</strong>{' '}
                  · Break-even threshold:{' '}
                  <strong>{sim.breakEvenHeads.toFixed(1)}</strong> retained
                  students
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 mt-3.5 text-[12px] text-[#6f6d64]">
              <div>
                {school} baseline ({ent.as_of}): {currentSchoolData.entering}{' '}
                entrants, {usd(currentSchoolData.charge_per_term)} per term,
                institutional discount {p1(currentSchoolData.aid_rate)};
                baseline 4-yr NTR {usd(baseline.totalNtr)}.
                {result.clipped && (
                  <span className="ml-2 text-[#b06a3a] font-semibold">
                    (Note: one or more scaled term rates reached the 100% ceiling
                    and were clipped.)
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-[12px] font-semibold px-2.5 py-1 border border-[#d5d2c6] rounded-[5px] bg-[#faf8f2] text-[#444538] hover:text-[#1b1c18] cursor-pointer whitespace-nowrap shrink-0"
              >
                Reset to {school} baseline
              </button>
            </div>

            <div className="overflow-x-auto mt-3.5">
              <div className="min-w-[680px]">
                <div className="grid grid-cols-7 gap-2.5 py-1.5 border-b border-[#eeece4] text-[12px] font-bold text-[#1b1c18]">
                  <span>Year</span>
                  <span className="text-right">Entry-term heads</span>
                  <span className="text-right">
                    Student-terms (ret_rates_proj)
                  </span>
                  <span className="text-right">End-of-yr S(d)</span>
                  <span className="text-right">Simulated NTR</span>
                  <span className="text-right">Baseline NTR</span>
                  <span className="text-right">Counterfactual Lift</span>
                </div>
                {result.rows.map((row, i) => {
                  const synthRowNtr = sim.syntheticBase.rows[i]?.ntr || 0;
                  const liftNtr = row.ntr - synthRowNtr;
                  return (
                    <div
                      key={i}
                      className="grid grid-cols-7 gap-2.5 py-2 border-b border-[#f4f2ea] text-[12.5px] text-[#444538] font-mono tabular-nums"
                    >
                      <span className="font-sans font-semibold text-[#1b1c18]">
                        {row.label}
                      </span>
                      <span className="text-right">
                        {row.entryTermHeads.toLocaleString('en-US')}
                      </span>
                      <span className="text-right">
                        {Math.round(row.enrolledStudentTerms).toLocaleString(
                          'en-US'
                        )}
                      </span>
                      <span className="text-right text-[#6f6d64]">
                        {p1(row.endOfYearSurvival)}
                      </span>
                      <span className="text-right font-medium text-[#1b1c18]">
                        {usd(row.ntr)}
                      </span>
                      <span className="text-right text-[#6f6d64]">
                        {usd(baseline.rows[i]?.ntr || 0)}
                      </span>
                      <span
                        className="text-right font-semibold"
                        style={{
                          color:
                            liftNtr > 0
                              ? accent
                              : liftNtr < 0
                              ? '#b06a3a'
                              : '#6f6d64',
                        }}
                      >
                        {Math.abs(liftNtr) < 1 ? '—' : signedUsd(liftNtr)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-[12px] leading-[1.55] text-[#8a887e] mt-2.5 max-w-[46em]">
        {calcAssume}
      </p>
    </section>
  );
};
