import React from 'react';

interface MethodSectionProps {
  accent: string;
}

interface TerminologyEntry {
  variable: string;
  meaning: string;
  description: string;
}

const PIPELINE_STAGES = [
  {
    stage: 'Stage 1 · RStudio ETL & Tuition Discount Segmentation (enrollment_database.R)',
    summary:
      'Links longitudinal student enrollment records across terms using a two-pass ID reconciliation (direct Student ID match followed by Colleague-to-Workday cross-reference lookup) and constructs a composite student-term key (student_id * term_code).',
    bullets: [
      'Preserves distinct aliased student_id trajectories so each student’s exact term attendance sequence and total enrolled terms are tracked.',
      'Computes student-term Net Tuition Revenue: NTR = Gross Tuition Charge − Institutional Grant Aid + Comprehensive Fee.',
      'Classifies each record into 25-basis-point discount bins and 5 reporting tiers (discount_description): No Award (<15%), Minimal Aid (15–35%), Partial Aid (35–60%), Substantial Aid (60–80%), and Near-Full Aid (≥80%).',
    ],
  },
  {
    stage: 'Stage 2 · Positron IDE Integer Term Arithmetic & Cohort Triangle (batched_cohort_projections_prep.ipynb)',
    summary:
      'Because the institutional academic year begins in Summer, academic term codes (YYYYSU, YYYYFA, YYYYSP) are translated into chronological integer codes (term_int and cohort_int) before sorting and computing elapsed terms since entry (terms_since_start).',
    bullets: [
      'Integer Term Encoding Schema: Summer (YYYYSU) → YYYY1 (e.g., 2025SU = 20251), Fall (YYYYFA) → YYYY2 (e.g., 2025FA = 20252), and Spring (YYYYSP) → (YYYY−1)3 (e.g., 2025SP = 20243, 2026SP = 20253).',
      'Pivots distinct enrolled student counts by (cohort_int, terms_since_start) into the Stage 2 Cohort Registration Triangle across Fall, Spring, and Summer entry cohorts.',
      'Conditioning Rule (offset = 2 vs. offset = 1): On the 3-term Millbury College of Music (MCM) calendar (INCLUDE_SUMMER = True), optional Summer sessions average 13.3% attendance; returning Fall headcount is conditioned directly on the preceding Spring term (offset = 2) rather than Summer (offset = 1).',
      'Masks anomalous COVID-19 shock terms (2020FA, 2021SP, 2021SU) before computing historical mean continuation rates (fall_means, spring_means, summer_means).',
    ],
  },
];

const TERMINOLOGY_GUIDE: TerminologyEntry[] = [
  {
    variable: 'term_int / cohort_int',
    meaning: 'Chronological Integer Term Code',
    description:
      'Five-digit academic-year integer (YYYY1 = Summer, YYYY2 = Fall, (YYYY−1)3 = Spring) that sorts multi-term enrollment records in true chronological order (e.g., 2024FA [20242] → 2025SP [20243] → 2025SU [20251] → 2025FA [20252] → 2026SP [20253]).',
  },
  {
    variable: 'INCLUDE_SUMMER & offset',
    meaning: 'MCM (3-Term) vs. MCC (2-Term) Calendar Rules',
    description:
      'MCM (Millbury College of Music) operates on a 3-term academic year (Fall, Spring, and optional Summer with Spring-to-Fall offset = 2). MCC (Millbury College Conservatory) operates on a 2-term academic year (Fall and Spring only, INCLUDE_SUMMER = False, offset = 1).',
  },
  {
    variable: 'terms_since_start (d)',
    meaning: 'Elapsed Terms Since Cohort Entry',
    description:
      'Zero-indexed duration counter (d = 0 at entry term) measuring how many calendar terms have elapsed since a student’s initial matriculation cohort (cohort_term).',
  },
  {
    variable: 'proj_term (Diagonal Sum)',
    meaning: 'Target Census Term Roll-Up',
    description:
      'Total census headcount in any target term T equals the diagonal sum across all active entering cohorts at their respective elapsed durations d (combining Fall starters, 1st–4th year returning Spring starters, and Summer entrants).',
  },
  {
    variable: 'ntr',
    meaning: 'Net Tuition Revenue (NTR)',
    description:
      'Net cash tuition and fee revenue retained by the institution per student-term after deducting institutional scholarships and grants: Gross Tuition − Institutional Grant Aid + Comprehensive Fee.',
  },
  {
    variable: 'charge_per_term',
    meaning: 'Gross Tuition Revenue (GTR)',
    description:
      'Published sticker tuition charge per student-term before deducting institutional grant aid ($25,660/term on MCM; $25,880/term on MCC, plus $750 comprehensive fee).',
  },
  {
    variable: 'institutional_grant',
    meaning: 'Institutional Aid (Scholarship Spend)',
    description:
      'Unfunded institutional merit and need-based scholarship discounts applied against gross tuition charges.',
  },
  {
    variable: 'discount_description',
    meaning: '5-Tier Tuition Discount Schedule',
    description:
      'Ratio of Institutional Grant Aid to Gross Tuition classified into five Stage 1 RStudio tiers: No Award (<15%), Minimal Aid (15–35%), Partial Aid (35–60%), Substantial Aid (60–80%), and Near-Full Aid (≥80%).',
  },
  {
    variable: '1 - discount_rate',
    meaning: 'Net-to-Gross Ratio (Tuition Efficiency)',
    description:
      'Share of Gross Tuition collected as net revenue after institutional scholarship discounting.',
  },
  {
    variable: 'cohort_term * school * degree',
    meaning: 'Time-Invariant Cohort Key',
    description:
      'Cohorts are anchored by entry-fixed attributes (entry term, school, degree level) rather than time-varying term credit loads (Full-Time vs. Part-Time) or Study Abroad status to avoid cross-segment migration distortion.',
  },
];

export const MethodSection: React.FC<MethodSectionProps> = ({ accent }) => {
  return (
    <section
      id="method"
      data-section="method"
      aria-labelledby="method-heading"
      className="scroll-mt-20"
    >
      <div
        className="text-[10.5px] font-bold tracking-[1.4px] uppercase"
        style={{ color: accent }}
      >
        04 · Two-Stage Pipeline Architecture &amp; Definitions
      </div>

      <h2
        id="method-heading"
        className="font-serif font-normal text-[24px] md:text-[28px] leading-[1.14] tracking-[-0.3px] mt-1.5 text-[#1b1c18]"
      >
        {'Two-Stage Pipeline Architecture & Higher-Ed Terminology Guide'}
      </h2>

      {/* TWO-STAGE PIPELINE ARCHITECTURE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-3">
        {PIPELINE_STAGES.map((st) => (
          <div
            key={st.stage}
            className="border border-[#e3e1d9] rounded-[10px] p-4 bg-white/80"
          >
            <div
              className="text-[12px] font-bold uppercase tracking-[0.5px]"
              style={{ color: accent }}
            >
              {st.stage}
            </div>
            <p className="text-[12.5px] text-[#3a3b34] leading-[1.45] mt-1.5">
              {st.summary}
            </p>
            <ul className="mt-2 space-y-1 text-[12px] text-[#54564c] list-disc pl-4 leading-[1.45]">
              {st.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* 3-COLUMN PIPELINE VARIABLE & HIGHER ED TERMINOLOGY TABLE */}
      <div className="border border-[#e3e1d9] rounded-[10px] p-4 md:p-5 bg-white/75 mt-3.5">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12.5px]">
            <thead>
              <tr className="border-b-2 border-[#1b1c18] text-left text-[11px] uppercase tracking-[0.7px] text-[#54564c]">
                <th className="py-2 pr-3 font-bold w-[22%]">
                  PIPELINE VARIABLE
                </th>
                <th className="py-2 px-3 font-bold w-[26%]">
                  HIGHER ED MEANING
                </th>
                <th className="py-2 pl-3 font-bold">
                  DESCRIPTION &amp; ACCOUNTING RULE
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efede6] align-top">
              {TERMINOLOGY_GUIDE.map((row) => (
                <tr key={row.meaning}>
                  <td className="py-2 pr-3 font-mono text-[11.5px] font-bold text-[#1b1c18]">
                    {row.variable}
                  </td>
                  <td
                    className="py-2 px-3 font-bold text-[12.5px]"
                    style={{ color: accent }}
                  >
                    {row.meaning}
                  </td>
                  <td className="py-2 pl-3 text-[#3a3b34] leading-[1.45]">
                    {row.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
