import React from 'react';
import { SiteData } from '../data/types';

interface CodeSectionProps {
  accent: string;
  siteData: SiteData;
}

const ACTIVE_TS_MODULES = [
  {
    name: 'calculator.ts',
    path: 'src/utils/calculator.ts',
    what: '4-year cohort survival S(d), single-bridge SU recovery, DGP aid-lift & NTR engine',
  },
  {
    name: 'CohortMatrixInspector.tsx',
    path: 'src/components/CohortMatrixInspector.tsx',
    what: 'Seed 42 synthetic panel vs. seasonal warehouse triangle & EB shrinkage inspector',
  },
  {
    name: 'StandingReportView.tsx',
    path: 'src/components/StandingReportView.tsx',
    what: 'Standing report, 120-row forecast ledger audit, and N_eff coverage diagnostics',
  },
  {
    name: 'regression_test.mjs',
    path: 'scripts/regression_test.mjs',
    what: '15-suite CI gate: MD5 checksums, Wilson CIs, algebraic invariants & SSR DOM checks',
  },
];

export const CodeSection: React.FC<CodeSectionProps> = ({
  accent,
  siteData,
}) => {
  const code = siteData.code;
  const meta = siteData.meta;
  const data = siteData.data;

  return (
    <section data-section="code" className="scroll-mt-24">
      <div
        className="text-[11px] font-bold tracking-[1.6px] uppercase"
        style={{ color: accent }}
      >
        06, The code
      </div>

      <h2 className="font-serif font-normal text-[28px] md:text-[33px] leading-[1.12] tracking-[-0.4px] mt-3.5 text-[#1b1c18]">
        Modules, flow-balance checks, and tests
      </h2>

      <p className="text-[14px] leading-[1.6] text-[#54564c] mt-2.5 max-w-[78ch]">
        The architecture spans two linked layers: the{' '}
        <strong className="font-semibold text-[#1b1c18]">
          upstream Python estimation pipeline
        </strong>{' '}
        (refactored from the Stage 2 notebook{' '}
        <code className="font-mono text-[12px]">
          batched_cohort_projections_prep.ipynb
        </code>{' '}
        into single-responsibility modules that generate{' '}
        <code className="font-mono text-[12px]">src/data/siteData.json</code>,{' '}
        <code className="font-mono text-[12px]">
          data/synthetic_enrollment.csv
        </code>
        , and <code className="font-mono text-[12px]">data/forecast_ledger.csv</code>
        ) and the{' '}
        <strong className="font-semibold text-[#1b1c18]">
          active TypeScript &amp; React runtime
        </strong>{' '}
        in this repository, verified on every push by GitHub Actions CI (
        <code className="font-mono text-[12px]">npm test</code>).
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4.5 mt-6 items-start">
        {/* Module listings: Upstream Python Generator + Active TypeScript Runtime */}
        <div className="flex flex-col gap-4">
          <div className="border border-[#e3e1d9] rounded-[10px] p-4.5 md:p-5.5 font-mono bg-white/70 overflow-x-auto">
            <div className="flex items-baseline justify-between gap-2 pb-2 mb-2 border-b border-[#e3e1d9] font-sans">
              <span className="text-[12px] font-bold uppercase tracking-[0.8px] text-[#1b1c18]">
                1. Upstream Python Estimation Pipeline (Stage 2 Artifact Generator)
              </span>
              <span className="font-mono text-[11px] text-[#6f6d64]">
                {code.total_lines.toLocaleString('en-US')} lines · {code.tests} unit tests
              </span>
            </div>
            <div className="min-w-[420px]">
              {code.modules.map((m, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[112px_36px_minmax(0,1fr)] gap-3.5 items-baseline py-1.5 border-b border-[#f1efe7] last:border-none text-[12.5px]"
                >
                  <span className="font-serif font-semibold text-[13.5px] text-[#1b1c18]">
                    {m.name}
                  </span>
                  <span className="text-[#a9a79d] text-right">{m.lines}</span>
                  <span className="text-[#5a5b50] font-sans text-[12.5px] truncate">
                    {m.what}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-[#e3e1d9] rounded-[10px] p-4.5 md:p-5.5 font-mono bg-white/70 overflow-x-auto">
            <div className="flex items-baseline justify-between gap-2 pb-2 mb-2 border-b border-[#e3e1d9] font-sans">
              <span className="text-[12px] font-bold uppercase tracking-[0.8px] text-[#1b1c18]">
                2. Active TypeScript &amp; React Repository Runtime (Node 22 SPA)
              </span>
              <span className="font-mono text-[11px] text-[#6f6d64]">
                15 CI regression suites (.github/workflows/ci.yml)
              </span>
            </div>
            <div className="min-w-[420px]">
              {ACTIVE_TS_MODULES.map((m) => (
                <div
                  key={m.name}
                  className="grid grid-cols-[185px_minmax(0,1fr)] gap-3.5 items-baseline py-1.5 border-b border-[#f1efe7] last:border-none text-[12.5px]"
                >
                  <span
                    className="font-mono font-semibold text-[12px] text-[#1b1c18] truncate"
                    title={m.path}
                  >
                    {m.name}
                  </span>
                  <span className="text-[#5a5b50] font-sans text-[12.5px] truncate">
                    {m.what}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Badges / Stats */}
        <div className="flex flex-col gap-3">
          <div className="border border-[#e3e1d9] rounded-[10px] p-4.5 md:p-5 bg-white/70">
            <div className="text-[30px] font-extrabold tracking-tight text-[#1b1c18] leading-none">
              15 CI suites · {code.tests} py
            </div>
            <div className="text-[12.5px] text-[#6f6d64] mt-1.5 leading-[1.45]">
              15 Node/SSR regression &amp; mathematical property suites in{' '}
              <code className="font-mono text-[11.5px]">
                scripts/regression_test.mjs
              </code>{' '}
              plus {code.tests} upstream Python tests against the chain-ladder
              baseline (<code className="font-mono text-[11.5px]">ret_rates_proj</code>).
            </div>
          </div>

          <div className="border border-[#e3e1d9] rounded-[10px] p-4.5 md:p-5 bg-white/70">
            <div className="text-[30px] font-extrabold tracking-tight text-[#1b1c18] leading-none">
              seed {meta.seed}
            </div>
            <div className="text-[12.5px] text-[#6f6d64] mt-1.5 leading-[1.45]">
              {data.records.toLocaleString('en-US')} synthetic student-term
              records (<code className="font-mono text-[11.5px]">retention_fact</code>{' '}
              schema) regenerate byte-identically in the pinned environment
              (MD5-tested: <code className="font-mono text-[11.5px]">{data.md5.slice(0, 12)}</code>).
              No real student data.
            </div>
          </div>

          <div className="border border-[#e3e1d9] rounded-[10px] p-4.5 md:p-5 bg-white/70">
            <div className="text-[30px] font-extrabold tracking-tight text-[#1b1c18] leading-none">
              flow-balanced
            </div>
            <div className="text-[12.5px] text-[#6f6d64] mt-1.5 leading-[1.45]">
              Transition counts satisfy conservation identities (
              <code className="font-mono text-[11.5px]">in = stay + exit</code>{' '}
              across every{' '}
              <code className="font-mono text-[11.5px]">terms_since_start</code>{' '}
              step), and the 120-row forecast ledger is reconciled against{' '}
              <code className="font-mono text-[11.5px]">siteData.json</code> on
              every test run.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
