import React from 'react';
import { SiteData } from '../data/types';

interface CohortsSectionProps {
  accent: string;
  siteData: SiteData;
}

export const CohortsSection: React.FC<CohortsSectionProps> = ({
  accent,
  siteData,
}) => {
  const vintage = siteData.vintage;
  const riskCells = siteData.risk_cells;

  const money = (v: number) => '$' + (v / 1e6).toFixed(2) + 'M';
  const signedHeads = (v: number) =>
    (v >= 0 ? '+' : '−') + Math.abs(Math.round(v)).toString();
  const signedMoneyM = (v: number) =>
    (v >= 0 ? '+$' : '−$') + Math.abs(v).toFixed(2) + 'M';

  const vintageRows = vintage.map((v) => ({
    cohort: v.cohort,
    entrants: String(v.entrants),
    terms: String(v.terms_scored),
    actual: String(Math.round(v.actual_heads)),
    expected: String(Math.round(v.expected_heads)),
    rateAlpha: signedHeads(v.rate_alpha_heads),
    mixAlpha: signedHeads(v.mix_alpha_heads),
    alphaNtr: signedMoneyM(v.total_alpha_ntr_m),
    positive: v.total_alpha_ntr_m >= 0,
  }));

  const riskRows = riskCells.map((r) => ({
    label: `${r.school} ${r.degree} · ${r.aid_band} · ${r.entry_season} entry, t${r.duration}`,
    heads: String(r.headcount),
    hazard: (r.exit_hazard * 100).toFixed(1) + '%',
    lift: r.lift.toFixed(2) + '×',
    meanNtr: '$' + Math.round(r.mean_ntr).toLocaleString('en-US'),
    risk: money(r.ntr_at_risk),
  }));

  return (
    <section data-section="cohorts" className="scroll-mt-24">
      <div
        className="text-[11px] font-bold tracking-[1.6px] uppercase"
        style={{ color: accent }}
      >
        07, Cohorts and risk cells
      </div>

      <h2 className="font-serif font-normal text-[28px] md:text-[33px] leading-[1.12] tracking-[-0.4px] mt-3.5 text-[#1b1c18]">
        Net tuition revenue at risk, by cohort and segment
      </h2>

      <p className="text-[14px] leading-[1.6] text-[#54564c] mt-2.5 max-w-[78ch]">
        Institutional enrollment management tracks recent entering classes (<code className="font-mono text-[12px]">last_5_cohorts</code> in <code className="font-mono text-[12px]">ret_rates_proj</code>) and high-attrition program cells (<code className="font-mono text-[12px]">projection_code</code>). Statistically, these correspond to{' '}
        <strong className="font-semibold text-[#1b1c18]">
          Oaxaca-Blinder / Kitagawa cohort residual decomposition
        </strong>{' '}
        and{' '}
        <strong className="font-semibold text-[#1b1c18]">
          covariate-stratum relative hazard lift
        </strong>.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 mt-6 items-start">
        {/* Vintage alpha table */}
        <div className="border border-[#e3e1d9] rounded-[10px] p-4.5 md:p-5.5 font-mono bg-white/70 overflow-x-auto">
          <div className="text-[13.5px] font-bold text-[#1b1c18] font-sans mb-1">
            Vintage alpha (cohort_term): actual headcount vs. entry-priced expectation
          </div>
          <div className="text-[12px] text-[#6f6d64] font-sans mb-2.5 leading-[1.45]">
            <strong>rate α</strong> = actual − own-mix expected heads;{' '}
            <strong>mix α</strong> = own-mix expected − prior-cohorts-average mix expected heads.{' '}
            <strong>NTR α</strong> compares cumulative NTR against the prior-cohorts-average benchmark (so higher-discount cohorts can show +headcount α alongside −NTR α).
          </div>
          <div className="min-w-[460px]">
            <div className="grid grid-cols-[64px_1fr_1fr_1fr_1fr_1fr_1.1fr] gap-1.5 text-[11px] text-[#8a887e] pb-1.5 border-b border-[#e3e1d9] font-sans">
              <span>cohort</span>
              <span className="text-right">entrants</span>
              <span className="text-right">actual</span>
              <span className="text-right">expected</span>
              <span className="text-right">rate α</span>
              <span className="text-right">mix α</span>
              <span className="text-right">NTR α</span>
            </div>
            {vintageRows.map((v, i) => (
              <div
                key={i}
                className="grid grid-cols-[64px_1fr_1fr_1fr_1fr_1fr_1.1fr] gap-1.5 text-[12px] py-1.5 border-b border-[#f1efe7] last:border-none"
              >
                <span className="font-sans font-medium text-[#1b1c18]">
                  {v.cohort}
                </span>
                <span className="text-right text-[#54564c]">{v.entrants}</span>
                <span className="text-right text-[#54564c]">{v.actual}</span>
                <span className="text-right text-[#54564c]">{v.expected}</span>
                <span className="text-right text-[#54564c]">{v.rateAlpha}</span>
                <span className="text-right text-[#54564c]">{v.mixAlpha}</span>
                <span
                  className="text-right font-semibold"
                  style={{ color: v.positive ? accent : '#b06a3a' }}
                >
                  {v.alphaNtr}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top risk cells table */}
        <div className="border border-[#e3e1d9] rounded-[10px] p-4.5 md:p-5.5 font-mono bg-white/70 overflow-x-auto">
          <div className="text-[13.5px] font-bold text-[#1b1c18] font-sans mb-1">
            Top risk cells (projection_code × entry term × duration) by NTR at risk
          </div>
          <div className="text-[12px] text-[#6f6d64] font-sans mb-2.5 leading-[1.45]">
            Ranked by <code>headcount × exit_hazard × mean_ntr</code>;{' '}
            <strong>hazard lift λ</strong> compares cell exit rate to the school-wide baseline hazard.
          </div>
          <div className="min-w-[480px]">
            <div className="grid grid-cols-[1.7fr_0.7fr_0.8fr_0.7fr_0.9fr] gap-1.5 text-[11px] text-[#8a887e] pb-1.5 border-b border-[#e3e1d9] font-sans">
              <span>segment</span>
              <span className="text-right">heads</span>
              <span className="text-right">exit hazard</span>
              <span className="text-right">lift</span>
              <span className="text-right">NTR at risk</span>
            </div>
            {riskRows.map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-[1.7fr_0.7fr_0.8fr_0.7fr_0.9fr] gap-1.5 text-[12px] py-1.5 border-b border-[#f1efe7] last:border-none"
              >
                <span
                  className="font-sans text-[11.5px] text-[#1b1c18] truncate"
                  title={`${r.label} (mean NTR ${r.meanNtr})`}
                >
                  {r.label}
                </span>
                <span className="text-right text-[#54564c]">{r.heads}</span>
                <span className="text-right text-[#54564c]">{r.hazard}</span>
                <span className="text-right text-[#b06a3a] font-semibold">
                  {r.lift}
                </span>
                <span className="text-right font-semibold text-[#1b1c18]">
                  {r.risk}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Figures */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 mt-4.5">
        <div className="border border-[#e3e1d9] rounded-[10px] p-3.5 md:p-4 bg-white/70">
          <div className="text-[13.5px] font-bold text-[#1b1c18] mb-2">
            Revenue lost to exits, by term
          </div>
          <div className="overflow-hidden rounded-[4px] bg-[#f2eee3] border border-[#eae6db]">
            <img
              src="figures/churn.png"
              alt="Revenue lost to exits per term, with cumulative total"
              className="w-full h-auto block"
            />
          </div>
        </div>

        <div className="border border-[#e3e1d9] rounded-[10px] p-3.5 md:p-4 bg-white/70">
          <div className="text-[13.5px] font-bold text-[#1b1c18] mb-2">
            What drives the change
          </div>
          <div className="overflow-hidden rounded-[4px] bg-[#f2eee3] border border-[#eae6db]">
            <img
              src="figures/drivers.png"
              alt="Driver decomposition of the revenue change"
              className="w-full h-auto block"
            />
          </div>
        </div>
      </div>

      <div className="text-[12.5px] text-[#6f6d64] mt-3 leading-[1.55] max-w-[54em]">
        Both tables are computed on the 54,954-record synthetic panel. While the
        generator plants no true cohort trend, early scored cohorts (such as{' '}
        <code className="font-mono">2022SP</code>,{' '}
        <code className="font-mono">terms_scored = 8</code>,{' '}
        <code className="font-mono">rate α = +100</code>) exhibit positive rate
        alpha because deep durations beyond their entry-time observation
        frontier (<code className="font-mono">priced_through</code>) default
        conservatively to zero, whereas later cohorts (<code className="font-mono">2022FA–2024SP</code>) reflect small Binomial process noise.
      </div>

      <div className="border border-[#e3e1d9] rounded-[10px] p-4 md:p-5 mt-4.5 max-w-[46em] bg-white/70">
        <div className="text-[13.5px] font-bold text-[#1b1c18]">
          Production lineage
        </div>
        <div className="text-[13.5px] leading-[1.6] text-[#44453a] mt-1.5">
          This is a rebuild from scratch on synthetic data. It follows the R,
          Python, and SQL persistence and net-tuition-revenue forecasting work I
          did as Assistant Director of Enrollment Research &amp; Analytics at a
          two-school institution (2023–2025), run against that
          institution&apos;s records. That pipeline and its data are private and
          are not published here; no figure on this page comes from them.
        </div>
      </div>
    </section>
  );
};
