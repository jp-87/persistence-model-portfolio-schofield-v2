import React from 'react';

interface MethodSectionProps {
  accent: string;
}

interface TerminologyEntry {
  meaning: string;
  description: string;
}

const PIPELINE_STAGES = [
  {
    stage: 'Stage 1 · RStudio ETL & Tuition Discount Segmentation',
    summary:
      'Links longitudinal student enrollment records across terms using a two-pass ID reconciliation (direct Student ID match followed by Colleague-to-Workday cross-reference lookup) and constructs a unique student-term key (student_id * term_code).',
    bullets: [
      'Preserves distinct aliased student_id trajectories so each student’s exact term attendance sequence and total enrolled terms are tracked.',
      'Computes student-term Net Tuition Revenue: NTR = Gross Tuition Charge − Institutional Grant Aid + Comprehensive Fee.',
      'Classifies each record into 25-basis-point discount bins and 5 reporting tiers: No Award (<15%), Minimal Aid (15–35%), Partial Aid (35–60%), Substantial Aid (60–80%), and Near-Full Aid (≥80%).',
    ],
  },
  {
    stage: 'Stage 2 · Positron IDE Integer Term Arithmetic & Cohort Projection',
    summary:
      'Maps academic term strings (YYYYSU, YYYYFA, YYYYSP) to sortable integer codes (e.g., 2023SU → 20231, 2023FA → 20232, 2024SP → 20233) to compute elapsed terms since cohort entry.',
    bullets: [
      'Pivots distinct enrolled student counts by (cohort_int, terms_since_start) into a cohort registration triangle.',
      'Conditioning Rule (offset = 2 vs. offset = 1): On the 3-term Millbury College of Music (MCM) calendar, optional Summer sessions average 13.3% attendance; returning Fall headcount is conditioned directly on the preceding Spring term (offset = 2) rather than Summer (offset = 1).',
      'Masks anomalous COVID-19 shock terms (2020FA, 2021SP, 2021SU) before computing historical mean continuation rates (fall_means, spring_means, summer_means).',
    ],
  },
];

const TERMINOLOGY_GUIDE: TerminologyEntry[] = [
  {
    meaning: 'MCM vs. MCC School Calendars',
    description:
      'MCM (Millbury College of Music) operates on a 3-term academic year (Fall, Spring, and optional Summer with Spring-to-Fall offset = 2). MCC (Millbury College Conservatory) operates on a 2-term academic year (Fall and Spring only, offset = 1).',
  },
  {
    meaning: 'Net Tuition Revenue (NTR)',
    description:
      'Tuition and fees remaining after deducting institutional scholarships and grants (Gross Tuition minus Institutional Grant Aid plus Comprehensive Fee).',
  },
  {
    meaning: 'Gross Tuition Revenue (GTR)',
    description:
      'Total published tuition and fee charges before subtracting any institutional financial aid.',
  },
  {
    meaning: 'Institutional Aid (Scholarship Spend)',
    description:
      'School-funded scholarships, merit awards, and need-based grants that reduce what a student pays.',
  },
  {
    meaning: 'Tuition Discount Rate',
    description:
      'Share of Gross Tuition covered by institutional grant aid (Institutional Grant Aid divided by Gross Tuition), grouped into five tiers from No Award (<15%) to Near-Full Aid (≥80%).',
  },
  {
    meaning: 'Net-to-Gross Ratio (Tuition Efficiency)',
    description:
      'Share of Gross Tuition collected as cash revenue after institutional aid (100% minus the Tuition Discount Rate).',
  },
  {
    meaning: 'Unmet Financial Need',
    description:
      'Remaining cost gap after subtracting a student’s financial aid package and Student Aid Index (SAI) from total Cost of Attendance.',
  },
  {
    meaning: 'Total Headcount Enrollment',
    description:
      'Total number of active distinct students (aliased student_id) registered at the term census date.',
  },
  {
    meaning: 'Retention vs. Persistence',
    description:
      'Retention tracks an entering Fall cohort returning in subsequent Fall terms (conditioned on prior Spring via offset = 2 on 3-term calendars); persistence tracks term-to-term continuation.',
  },
  {
    meaning: 'Time-Invariant Cohort Definition',
    description:
      'Cohorts must be segmented by entry-fixed attributes (entry term, school, degree level) rather than time-varying term credit loads (Full-Time vs. Part-Time) or temporary Study Abroad semesters to prevent cross-segment migration artifacts.',
  },
];

export const MethodSection: React.FC<MethodSectionProps> = ({ accent }) => {
  return (
    <section data-section="method" className="scroll-mt-20">
      <div
        className="text-[10.5px] font-bold tracking-[1.4px] uppercase"
        style={{ color: accent }}
      >
        04 · Two-Stage Pipeline Architecture &amp; Definitions
      </div>

      <h2 className="font-serif font-normal text-[24px] md:text-[28px] leading-[1.14] tracking-[-0.3px] mt-1.5 text-[#1b1c18]">
        Higher Education Enrollment &amp; Financial Aid Terminology Guide
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

      {/* 2-COLUMN HIGHER ED TERMINOLOGY TABLE */}
      <div className="border border-[#e3e1d9] rounded-[10px] p-4 md:p-5 bg-white/75 mt-3.5">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12.5px]">
            <thead>
              <tr className="border-b-2 border-[#1b1c18] text-left text-[11px] uppercase tracking-[0.7px] text-[#54564c]">
                <th className="py-2 pr-4 font-bold w-[34%]">
                  PLAIN-LANGUAGE HIGHER ED MEANING
                </th>
                <th className="py-2 pl-4 font-bold">DESCRIPTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efede6] align-top">
              {TERMINOLOGY_GUIDE.map((row) => (
                <tr key={row.meaning}>
                  <td
                    className="py-2 pr-4 font-bold text-[12.5px]"
                    style={{ color: accent }}
                  >
                    {row.meaning}
                  </td>
                  <td className="py-2 pl-4 text-[#3a3b34] leading-[1.45]">
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


