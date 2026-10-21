import React from 'react';
import { CohortMatrixInspector } from './CohortMatrixInspector';

export interface MethodItem {
  title: string;
  subtitle?: string;
  hasEq: boolean;
  text: string;
  irNote?: string;
  eq?: string;
}

interface MethodSectionProps {
  accent: string;
  diagramNote: string;
  methodItems: MethodItem[];
}

interface TerminologyPair {
  domainConcept: string;
  institutionalTerm: string;
  institutionalDetail: string;
  statisticalTerm: string;
  statisticalDetail: string;
}

const TERMINOLOGY_CROSSWALK: TerminologyPair[] = [
  {
    domainConcept: 'Enrollment Grain & Fact Table',
    institutionalTerm: 'retention_fact (df_cl1)',
    institutionalDetail:
      '16-column census warehouse extract (student_id, term_code, cohort_term, school, program, region, enrollment_status = "E").',
    statisticalTerm: 'Person-Period Survival Panel (i, d)',
    statisticalDetail:
      'Longitudinal discrete-time observation matrix (54,954 records across 15,932 students) with right-censoring at the as-of reference term (2024FA in report; DATA_DATE = 2025FA in legacy notebook).',
  },
  {
    domainConcept: 'Time Index & YYYYTT Term Standard',
    institutionalTerm: 'term_code_to_num & terms_since_start',
    institutionalDetail:
      'Presentation-layer YYYYTT codes use 4-digit year + FA (Fall, starts Sept), SP (Spring, starts Jan), or SU (Summer, starts June; minimal enrollment); get_num_terms_between computes elapsed terms (0 ≤ d < 21).',
    statisticalTerm: 'Duration Clock d ∈ {0, …, D}',
    statisticalDetail:
      'Semi-Markov / duration-indexed state clock decoupled from calendar time t; sums anti-diagonals (cohort_term + d = proj_term) to form census totals.',
  },
  {
    domainConcept: 'Academic Calendar & Summer Bridge',
    institutionalTerm: 'INCLUDE_SUMMER, OTHER_ENTERING & offset = 2',
    institutionalDetail:
      'A 2019FA freshman persists to 2020SP, earns a D, and takes 2020SU for credit recovery. Because SU enrollment is minimal, MCM (3 terms/yr) uses offset=2 on 2020FA to bridge directly from 2020SP; MCC (2 terms/yr) uses offset=1.',
    statisticalTerm: 'Seasonal Lag Operator & Entry Stratum',
    statisticalDetail:
      'Step-size transition operator P(s, d → d + Δd) conditioned on entry season (fall_means, spring_means, summer_means).',
  },
  {
    domainConcept: 'Cohort Segmentation & Sparsity',
    institutionalTerm: 'projection_code (n > 20 filter)',
    institutionalDetail:
      '5-way key in the legacy notebook (233 segments across 40,118 records) requiring projection_counts > 20 (retaining 160 and dropping 73 sparse segments).',
    statisticalTerm: 'Empirical Bayes Partial Pooling (k = 50)',
    statisticalDetail:
      'Saturated cell rate p̂ = x/n shrunk toward school-level baseline p̄_d via p̃ = (n·p̂ + k·p̄)/(n + k) with k = 50, retaining thin cells without hard cutoffs or small-cell p = 1.000 spikes.',
  },
  {
    domainConcept: 'Persistence Matrix & Shock Masking',
    institutionalTerm: 'ret_rates_table → base_table_no_covid → ret_rates_proj',
    institutionalDetail:
      'Pivots headcount by (terms_since_start × cohort_term), divides by lagged count, and masks pandemic shock terms covid_terms = [2020FA, 2021SP, 2021SU].',
    statisticalTerm: 'Two-State Markov Transition Matrix P(s, d)',
    statisticalDetail:
      'Transition kernel between E (enrolled) and O (out) with continuation probability p_EE(s,d) = 1 − h(s,d) and structural-break regime censoring.',
  },
  {
    domainConcept: 'Financial Aid & Tuition Yield',
    institutionalTerm: 'ntr, institutional_grant & discount_description',
    institutionalDetail:
      '5-tier award schedule (No Award <15%, Minimal 15–35%, Partial 35–60%, Substantial 60–80%, Near-Full ≥80%), aid_efficiency, and revenue_potential.',
    statisticalTerm: 'Covariate Conditioning & Draw-Weighted E[NTR]',
    statisticalDetail:
      'Aid-band stratified survival S(d | aid_band) eliminating Simpson’s paradox drift, paired with Oaxaca-Blinder / Kitagawa vintage α decomposition.',
  },
];

export const MethodSection: React.FC<MethodSectionProps> = ({
  accent,
  diagramNote,
  methodItems,
}) => {
  return (
    <section data-section="method" className="scroll-mt-24">
      <div
        className="text-[11px] font-bold tracking-[1.6px] uppercase"
        style={{ color: accent }}
      >
        02, The method
      </div>

      <h2 className="font-serif font-normal text-[28px] md:text-[33px] leading-[1.12] tracking-[-0.4px] mt-3.5 text-[#1b1c18]">
        A two-state chain indexed by time since entry
      </h2>

      <p className="text-[14px] leading-[1.6] text-[#54564c] mt-2.5 max-w-[78ch]">
        This project bridges two complementary vocabularies: the{' '}
        <strong className="font-semibold text-[#1b1c18]">
          Institutional Higher Education pipeline
        </strong>{' '}
        (originating in <code className="font-mono text-[12.5px] bg-[#f4f2ea] px-1.5 py-0.5 rounded border border-[#e3e1d9]">batched_cohort_projections_prep</code>{' '}
        over warehouse extract <code className="font-mono text-[12.5px] bg-[#f4f2ea] px-1.5 py-0.5 rounded border border-[#e3e1d9]">retention_fact</code>) and the{' '}
        <strong className="font-semibold text-[#1b1c18]">
          Statistical Survival &amp; Markov formulation
        </strong>{' '}
        used for empirical Bayes shrinkage, interval estimation, and rolling-origin backtests.
      </p>

      <div className="grid grid-cols-1 gap-3.5 mt-6">
        {/* SVG DIAGRAM */}
        <div className="border border-[#e3e1d9] rounded-[10px] p-4.5 md:p-5 bg-white/70">
          <svg
            viewBox="0 0 640 210"
            role="img"
            aria-label="Students move from duration d to d+1 to d+2 between enrolled and out states"
            className="w-full h-auto"
          >
            <defs>
              <marker
                id="ah"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto"
              >
                <path d="M0,0 L10,5 L0,10 z" fill="#3a3b34" />
              </marker>
              <marker
                id="ag"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto"
              >
                <path d="M0,0 L10,5 L0,10 z" fill={accent} />
              </marker>
            </defs>

            {/* Duration d */}
            <text x="90" y="14" textAnchor="middle" fontFamily="Open Sans, sans-serif" fontSize="12" fill="#6f6d64">
              duration d
            </text>
            <circle cx="90" cy="60" r="22" fill="#fff" stroke="#3a3b34" strokeWidth="1.4" />
            <text x="90" y="64" textAnchor="middle" fontFamily="Open Sans, sans-serif" fontSize="13" fontWeight="700" fill="#1b1c18">
              E
            </text>
            <circle cx="90" cy="160" r="22" fill="color-mix(in srgb, #0d4f30 8%, #fff)" stroke="#3a3b34" strokeWidth="1.4" />
            <text x="90" y="164" textAnchor="middle" fontFamily="Open Sans, sans-serif" fontSize="13" fontWeight="700" fill="#1b1c18">
              O
            </text>

            {/* Duration d+1 */}
            <text x="300" y="14" textAnchor="middle" fontFamily="Open Sans, sans-serif" fontSize="12" fill="#6f6d64">
              duration d+1
            </text>
            <circle cx="300" cy="60" r="22" fill="#fff" stroke="#3a3b34" strokeWidth="1.4" />
            <text x="300" y="64" textAnchor="middle" fontFamily="Open Sans, sans-serif" fontSize="13" fontWeight="700" fill="#1b1c18">
              E
            </text>
            <circle cx="300" cy="160" r="22" fill="color-mix(in srgb, #0d4f30 8%, #fff)" stroke="#3a3b34" strokeWidth="1.4" />
            <text x="300" y="164" textAnchor="middle" fontFamily="Open Sans, sans-serif" fontSize="13" fontWeight="700" fill="#1b1c18">
              O
            </text>

            {/* Duration d+2 */}
            <text x="510" y="14" textAnchor="middle" fontFamily="Open Sans, sans-serif" fontSize="12" fill="#6f6d64">
              duration d+2
            </text>
            <circle cx="510" cy="60" r="22" fill="#fff" stroke="#3a3b34" strokeWidth="1.4" />
            <text x="510" y="64" textAnchor="middle" fontFamily="Open Sans, sans-serif" fontSize="13" fontWeight="700" fill="#1b1c18">
              E
            </text>
            <circle cx="510" cy="160" r="22" fill="color-mix(in srgb, #0d4f30 8%, #fff)" stroke="#3a3b34" strokeWidth="1.4" />
            <text x="510" y="164" textAnchor="middle" fontFamily="Open Sans, sans-serif" fontSize="13" fontWeight="700" fill="#1b1c18">
              O
            </text>

            {/* Transitions d -> d+1 */}
            <line x1="114" y1="60" x2="274" y2="60" stroke="#3a3b34" strokeWidth="1.4" markerEnd="url(#ah)" />
            <text x="195" y="50" textAnchor="middle" fontFamily="Open Sans, sans-serif" fontSize="11" fill="#3a3b34">
              persist p_EE(d)
            </text>

            <line x1="112" y1="78" x2="276" y2="144" stroke="#3a3b34" strokeWidth="1.4" markerEnd="url(#ah)" />
            <text x="152" y="96" fontFamily="Open Sans, sans-serif" fontSize="11" fill="#3a3b34">
              exit 1−p_EE(d)
            </text>

            <line x1="112" y1="144" x2="276" y2="78" stroke={accent} strokeWidth="1.4" strokeDasharray="5 4" markerEnd="url(#ag)" />
            <text x="202" y="128" fontFamily="Open Sans, sans-serif" fontSize="11" fill={accent}>
              re-entry p_OE(d)
            </text>

            <line x1="114" y1="160" x2="274" y2="160" stroke="#3a3b34" strokeWidth="1.4" markerEnd="url(#ah)" />
            <text x="195" y="180" textAnchor="middle" fontFamily="Open Sans, sans-serif" fontSize="11" fill="#3a3b34">
              stay out 1−p_OE(d)
            </text>

            {/* Transitions d+1 -> d+2 */}
            <line x1="324" y1="60" x2="484" y2="60" stroke="#3a3b34" strokeWidth="1.4" markerEnd="url(#ah)" />
            <text x="405" y="50" textAnchor="middle" fontFamily="Open Sans, sans-serif" fontSize="11" fill="#3a3b34">
              persist p_EE(d+1)
            </text>

            <line x1="322" y1="78" x2="486" y2="144" stroke="#3a3b34" strokeWidth="1.4" markerEnd="url(#ah)" />
            <text x="362" y="96" fontFamily="Open Sans, sans-serif" fontSize="11" fill="#3a3b34">
              exit 1−p_EE(d+1)
            </text>

            <line x1="322" y1="144" x2="486" y2="78" stroke={accent} strokeWidth="1.4" strokeDasharray="5 4" markerEnd="url(#ag)" />
            <text x="412" y="128" fontFamily="Open Sans, sans-serif" fontSize="11" fill={accent}>
              re-entry p_OE(d+1)
            </text>

            <line x1="324" y1="160" x2="484" y2="160" stroke="#3a3b34" strokeWidth="1.4" markerEnd="url(#ah)" />
            <text x="405" y="180" textAnchor="middle" fontFamily="Open Sans, sans-serif" fontSize="11" fill="#3a3b34">
              stay out 1−p_OE(d+1)
            </text>

            <text x="600" y="64" fontFamily="Open Sans, sans-serif" fontSize="16" fill="#6f6d64">
              …
            </text>
            <text x="600" y="164" fontFamily="Open Sans, sans-serif" fontSize="16" fill="#6f6d64">
              …
            </text>
          </svg>

          <p className="text-[12px] text-[#6f6d64] mt-1.5 leading-[1.4]">
            {diagramNote}
          </p>
        </div>

        {/* METHOD CARDS */}
        {methodItems.map((item, idx) => (
          <div
            key={idx}
            className="border border-[#e3e1d9] rounded-[10px] p-4.5 md:p-5 bg-white/70"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="text-[14px] font-bold text-[#1b1c18]">
                {item.title}
              </div>
              {item.subtitle && (
                <div className="font-mono text-[11.5px] text-[#6f6d64]">
                  {item.subtitle}
                </div>
              )}
            </div>
            <p className="text-[13.5px] leading-[1.6] text-[#44453a] mt-2">
              {item.text}
            </p>
            {item.irNote && (
              <p className="text-[12.5px] leading-[1.55] text-[#5a5b50] mt-2 pt-2 border-t border-[#efede6]">
                <strong className="font-semibold text-[#1b1c18]">
                  Institutional pipeline equivalent:
                </strong>{' '}
                {item.irNote}
              </p>
            )}
            {item.hasEq && item.eq && (
              <pre className="font-mono text-[12.5px] leading-[1.55] bg-[#f4f2ea] rounded-[6px] p-2.5 md:p-3.5 mt-2.5 overflow-x-auto text-[#1b1c18] border border-[#e8e6dc]">
                {item.eq}
              </pre>
            )}
          </div>
        ))}

        {/* INTERACTIVE STAGE 2 COHORT-MATRIX INSPECTOR */}
        <CohortMatrixInspector accent={accent} />

        {/* DUAL TERMINOLOGY CROSS-WALK TABLE */}
        <div className="border border-[#e3e1d9] rounded-[10px] p-4.5 md:p-5.5 bg-white/70 mt-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
            <div>
              <div className="text-[14px] font-bold text-[#1b1c18]">
                Institutional Higher Education ↔ Statistical Terminology Cross-Walk
              </div>
              <div className="text-[12px] text-[#6f6d64] mt-0.5">
                Mapping original Stage 1/2 enrollment warehouse constructs (<code className="font-mono text-[11.5px]">batched_cohort_projections_prep</code>) to the statistical survival model
              </div>
            </div>
            <span className="font-mono text-[11px] text-[#6f6d64]">
              retention_fact → Markov / Empirical Bayes
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr className="border-b border-[#e3e1d9] text-left text-[10.5px] uppercase tracking-[0.7px] text-[#6f6d64]">
                  <th className="py-2 pr-3 font-semibold">Domain Concept</th>
                  <th className="py-2 px-3 font-semibold">
                    Institutional Higher Ed Term (Original Model)
                  </th>
                  <th className="py-2 pl-3 font-semibold">
                    Statistical / Survival Term (Current Model)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efede6] align-top">
                {TERMINOLOGY_CROSSWALK.map((row) => (
                  <tr key={row.domainConcept}>
                    <td className="py-2.5 pr-3 font-semibold text-[#1b1c18] whitespace-nowrap">
                      {row.domainConcept}
                    </td>
                    <td className="py-2.5 px-3 text-[#44453a]">
                      <div className="font-mono text-[12px] font-semibold text-[#1b1c18]">
                        {row.institutionalTerm}
                      </div>
                      <div className="text-[12px] text-[#5a5b50] mt-0.5 leading-[1.45]">
                        {row.institutionalDetail}
                      </div>
                    </td>
                    <td className="py-2.5 pl-3 text-[#44453a]">
                      <div
                        className="font-mono text-[12px] font-semibold"
                        style={{ color: accent }}
                      >
                        {row.statisticalTerm}
                      </div>
                      <div className="text-[12px] text-[#5a5b50] mt-0.5 leading-[1.45]">
                        {row.statisticalDetail}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
