import React, { useState, useEffect } from 'react';
import { SiteData } from '../data/types';

interface StandingReportViewProps {
  accent: string;
  paper: string;
  siteData: SiteData;
  onBackToPortfolio: () => void;
  initialTab?: 'report' | 'diagnostics';
}

export const StandingReportView: React.FC<StandingReportViewProps> = ({
  accent,
  paper,
  siteData,
  onBackToPortfolio,
  initialTab = 'report',
}) => {
  const [activeTab, setActiveTab] = useState<'report' | 'diagnostics'>(
    initialTab
  );

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const {
    meta,
    data,
    compare,
    vintage,
    risk_cells,
    scenarios,
    entrant,
    revenue,
    drift,
    wiche,
    ledger_summary,
  } = siteData;

  const p1 = (v: number) => (v * 100).toFixed(1) + '%';
  const signedPct = (v: number) => {
    const pct = (v * 100).toFixed(2) + '%';
    return v > 0 ? `+${pct}` : pct;
  };
  const signedHeads = (v: number) => {
    const r = Math.round(v);
    return r > 0 ? `+${r}` : String(r);
  };
  const money = (v: number) => '$' + (v / 1e6).toFixed(2) + 'M';
  const usd = (v: number) => '$' + Math.round(v).toLocaleString('en-US');

  return (
    <div
      className="min-h-screen text-[#23241f] font-sans pb-20"
      style={{ backgroundColor: paper }}
    >
      {/* Report Top Navbar (3-Zone Top Bar Contract) */}
      <header className="sticky top-0 z-40 border-b border-[#e6e4dc] bg-white/90 backdrop-blur-md">
        <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-3.5 flex items-center justify-between gap-8">
          <span className="inline-flex items-center gap-2.5 font-serif font-medium text-[17px] text-[#1b1c18] whitespace-nowrap shrink-0">
            <img
              src="figures/logo.png"
              alt="John Schofield logo"
              className="w-7 h-7 rounded-[6px] object-cover border border-[#1b1c18]/15 shrink-0"
            />
            <span>
              John Schofield <span className="text-[#8c8a7e] font-sans font-normal mx-1.5">|</span> Student Persistence Model
            </span>
          </span>

          <nav className="flex items-center gap-6 text-[13px] font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('report')}
              className="cursor-pointer py-1 bg-transparent border-b-2 transition-colors whitespace-nowrap shrink-0"
              style={{
                borderColor: activeTab === 'report' ? accent : 'transparent',
                color: activeTab === 'report' ? accent : '#54564c',
              }}
            >
              Standing Report
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('diagnostics')}
              className="cursor-pointer py-1 bg-transparent border-b-2 transition-colors whitespace-nowrap shrink-0"
              style={{
                borderColor:
                  activeTab === 'diagnostics' ? accent : 'transparent',
                color: activeTab === 'diagnostics' ? accent : '#54564c',
              }}
            >
              Model Diagnostics
            </button>
          </nav>

          <button
            type="button"
            onClick={onBackToPortfolio}
            className="cursor-pointer text-[13px] font-bold px-3.5 py-1.5 rounded-[6px] border transition-colors whitespace-nowrap shrink-0"
            style={{
              color: accent,
              borderColor: `color-mix(in srgb, ${accent} 35%, #d8d6cc)`,
            }}
          >
            ← Portfolio Case Study
          </button>
        </div>
      </header>

      <div className="max-w-[1100px] mx-auto px-6 md:px-10 pt-10">
        {/* Provenance Banner (clean 1px hairline border, no thick left bar) */}
        <div className="p-4 rounded-[8px] bg-[#faf8f2] border border-[#e3e1d9] mb-8 text-[13px] text-[#44453a] leading-[1.6]">
          <strong className="text-[#1b1c18]">Scope &amp; provenance.</strong>{' '}
          Figures below are computed from the model&apos;s fitted hazards and the
          synthetic enrollment panel ({data.records.toLocaleString('en-US')} records,{' '}
          {data.students.toLocaleString('en-US')} students). Every result tests model
          machinery rather than describing a real institution. Definitions follow{' '}
          <code>docs/STAGE1_CONTRACT.md</code> and <code>docs/STANDARDS.md</code>.
          Upstream build environment: version <code>v{meta.version}</code>, code{' '}
          <code>{meta.git_sha}</code>, data md5 <code>{data.md5}</code>, Python{' '}
          <code>{meta.python}</code>, NumPy <code>{meta.numpy}</code>, pandas{' '}
          <code>{meta.pandas}</code>.
        </div>

        {activeTab === 'report' ? (
          <div className="flex flex-col gap-10">
            <div>
              <div
                className="text-[11px] font-bold uppercase tracking-[1.5px]"
                style={{ color: accent }}
              >
                Reference term {meta.report_as_of} · Synthetic Data
              </div>
              <h1 className="font-serif text-[34px] text-[#1b1c18] mt-1">
                Student Persistence &amp; Net Tuition Revenue — Standing Report
              </h1>
            </div>

            {/* 1. Key Indicators & Revenue Backtest */}
            <section className="border border-[#e3e1d9] rounded-[10px] p-6 bg-white/80">
              <h2 className="font-serif text-[22px] text-[#1b1c18] mb-3">
                1. Revenue Backtest &amp; Key Indicators ({revenue.as_of})
              </h2>
              <p className="text-[13.5px] text-[#54564c] mb-4">
                Held-out net tuition revenue backtest ($M) conditioning on aid band (synthetic data). Revenue intervals are formed by weighting simulated cohort headcount draws by segment mean NTR per student.
              </p>
              <div className="overflow-x-auto font-mono tabular-nums text-[13px]">
                <div className="grid grid-cols-4 py-2 border-b-2 border-[#1b1c18] font-sans font-bold text-[12px] text-[#6f6d64]">
                  <span>steps ahead</span>
                  <span className="text-right">expected ($M)</span>
                  <span className="text-right">actual ($M)</span>
                  <span className="text-right">total APE</span>
                </div>
                {revenue.rows.map((r) => (
                  <div
                    key={r.k}
                    className="grid grid-cols-4 py-2 border-b border-[#eeece4]"
                  >
                    <span className="font-sans font-bold">+{r.k}</span>
                    <span className="text-right">${r.expected_m.toFixed(1)}M</span>
                    <span className="text-right">${r.actual_m.toFixed(1)}M</span>
                    <span className="text-right font-bold" style={{ color: accent }}>
                      {p1(r.total_ape)}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. Churn & Driver Figures */}
            <section className="border border-[#e3e1d9] rounded-[10px] p-6 bg-white/80">
              <h2 className="font-serif text-[22px] text-[#1b1c18] mb-3">
                2. Headcount Drivers &amp; Churn Ledger (Synthetic)
              </h2>
              <p className="text-[13.5px] text-[#54564c] mb-3">
                An exit is attributed to the first missed academic term on the school&apos;s own calendar (MCM: 3 terms/year including summer; MCC: 2 terms/year without summer).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <div className="text-[13px] font-bold mb-2">
                    Revenue lost to exits, by term
                  </div>
                  <img
                    src="figures/churn.png"
                    alt="Revenue lost to exits per term"
                    className="w-full h-auto rounded border border-[#e3e1d9]"
                  />
                </div>
                <div>
                  <div className="text-[13px] font-bold mb-2">
                    Backward driver decomposition
                  </div>
                  <img
                    src="figures/drivers.png"
                    alt="Driver decomposition"
                    className="w-full h-auto rounded border border-[#e3e1d9]"
                  />
                </div>
              </div>
            </section>

            {/* 3. Vintage Alpha */}
            <section className="border border-[#e3e1d9] rounded-[10px] p-6 bg-white/80">
              <h2 className="font-serif text-[22px] text-[#1b1c18] mb-3">
                3. Vintage Alpha (Cumulative vs Entry-Priced Expectation)
              </h2>
              <p className="text-[13.5px] text-[#54564c] mb-4">
                Each cohort is scored against hazards fitted on an expanding window as of its entry term (requiring ≥6 prior school-calendar terms; MCM cutoff 2020FA, MCC 2021FA). Rate α uses the cohort&apos;s own entry mix (school × degree × aid band); mix α is the Kitagawa difference between own-mix expectation and the prior-cohorts-average mix expectation.
              </p>
              <div className="overflow-x-auto font-mono tabular-nums text-[12.5px]">
                <div className="min-w-[620px]">
                  <div className="grid grid-cols-8 py-2 border-b-2 border-[#1b1c18] font-sans font-bold text-[11.5px] text-[#6f6d64]">
                    <span>cohort</span>
                    <span className="text-right">entrants</span>
                    <span className="text-right">terms</span>
                    <span className="text-right">actual</span>
                    <span className="text-right">expected</span>
                    <span className="text-right">rate α</span>
                    <span className="text-right">mix α</span>
                    <span className="text-right">total α ($M)</span>
                  </div>
                  {vintage.map((v) => (
                    <div
                      key={v.cohort}
                      className="grid grid-cols-8 py-2 border-b border-[#eeece4]"
                    >
                      <span className="font-sans font-semibold">{v.cohort}</span>
                      <span className="text-right">{v.entrants}</span>
                      <span className="text-right">{v.terms_scored}</span>
                      <span className="text-right">{Math.round(v.actual_heads)}</span>
                      <span className="text-right">{Math.round(v.expected_heads)}</span>
                      <span className="text-right">{signedHeads(v.rate_alpha_heads)}</span>
                      <span className="text-right text-[#6f6d64]">
                        {signedHeads(v.mix_alpha_heads)}
                      </span>
                      <span className="text-right font-bold">
                        {v.total_alpha_ntr_m.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 4. Risk Cells */}
            <section className="border border-[#e3e1d9] rounded-[10px] p-6 bg-white/80">
              <h2 className="font-serif text-[22px] text-[#1b1c18] mb-3">
                4. Risk-Cell Catalog (Top Exposure Cells at {meta.report_as_of})
              </h2>
              <p className="text-[13.5px] text-[#54564c] mb-4">
                Ranked by expected next-term NTR at risk (<code>heads × exit_hazard × mean_ntr</code>). Lift compares the cell&apos;s season-conditioned exit hazard against the school pool at the same duration <code>d</code>.
              </p>
              <div className="overflow-x-auto font-mono tabular-nums text-[12.5px]">
                <div className="min-w-[660px]">
                  <div className="grid grid-cols-8 py-2 border-b-2 border-[#1b1c18] font-sans font-bold text-[11.5px] text-[#6f6d64]">
                    <span className="col-span-2">segment × season × duration</span>
                    <span className="text-right">heads</span>
                    <span className="text-right">prevalence</span>
                    <span className="text-right">mean NTR</span>
                    <span className="text-right">exit hazard</span>
                    <span className="text-right">lift</span>
                    <span className="text-right">NTR at risk</span>
                  </div>
                  {risk_cells.map((r, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-8 py-2 border-b border-[#eeece4]"
                    >
                      <span className="col-span-2 font-sans font-medium">
                        {r.school} {r.degree} · {r.aid_band} · {r.entry_season} t
                        {r.duration}
                      </span>
                      <span className="text-right">{r.headcount}</span>
                      <span className="text-right text-[#6f6d64]">
                        {p1(r.prevalence)}
                      </span>
                      <span className="text-right text-[#6f6d64]">
                        {usd(r.mean_ntr)}
                      </span>
                      <span className="text-right">{p1(r.exit_hazard)}</span>
                      <span className="text-right">{r.lift.toFixed(2)}×</span>
                      <span className="text-right font-bold">
                        {money(r.ntr_at_risk)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 5. Scenarios Table */}
            <section className="border border-[#e3e1d9] rounded-[10px] p-6 bg-white/80">
              <h2 className="font-serif text-[22px] text-[#1b1c18] mb-3">
                5. Scenarios to 2030 (Headcount &amp; NTR 80% Predictive Bands)
              </h2>
              <p className="text-[13.5px] text-[#54564c] mb-4">
                Entering-class paths are driven by {wiche.source}: national peak-to-2030 change is {p1(wiche.national.change)} (from {wiche.national.peak_year}), and Northeast change is {p1(wiche.northeast.change)} (from {wiche.northeast.peak_year}).
              </p>
              <div className="overflow-x-auto font-mono tabular-nums text-[12.5px]">
                <div className="min-w-[640px]">
                  <div className="grid grid-cols-7 py-2 border-b-2 border-[#1b1c18] font-sans font-bold text-[11.5px] text-[#6f6d64]">
                    <span>fall</span>
                    <span className="text-right">flat heads</span>
                    <span className="text-right">flat NTR ($M)</span>
                    <span className="text-right">cliff heads</span>
                    <span className="text-right">cliff NTR ($M)</span>
                    <span className="text-right">NE heads</span>
                    <span className="text-right">NE NTR ($M)</span>
                  </div>
                  {scenarios.flat.map((fl, idx) => {
                    const cl = scenarios.cliff[idx];
                    const ne = scenarios.northeast[idx];
                    return (
                      <div
                        key={fl.fall}
                        className="grid grid-cols-7 py-2 border-b border-[#eeece4]"
                      >
                        <span className="font-sans font-bold">{fl.fall}</span>
                        <span className="text-right">
                          {fl.headcount.toLocaleString()}
                        </span>
                        <span className="text-right">
                          ${fl.ntr_m.toFixed(1)} ({fl.p10_m.toFixed(1)}–
                          {fl.p90_m.toFixed(1)})
                        </span>
                        <span className="text-right">
                          {cl.headcount.toLocaleString()}
                        </span>
                        <span
                          className="text-right font-semibold"
                          style={{ color: accent }}
                        >
                          ${cl.ntr_m.toFixed(1)} ({cl.p10_m.toFixed(1)}–
                          {cl.p90_m.toFixed(1)})
                        </span>
                        <span className="text-right">
                          {ne.headcount.toLocaleString()}
                        </span>
                        <span className="text-right">
                          ${ne.ntr_m.toFixed(1)} ({ne.p10_m.toFixed(1)}–
                          {ne.p90_m.toFixed(1)})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* 6. Append-Only Forecast Ledger Summary */}
            <section className="border border-[#e3e1d9] rounded-[10px] p-6 bg-white/80">
              <h2 className="font-serif text-[22px] text-[#1b1c18] mb-3">
                6. Append-Only Forecast Ledger &amp; Frontier Truncation Audit (<code>data/forecast_ledger.csv</code>)
              </h2>
              <p className="text-[13.5px] text-[#54564c] mb-4">
                The repository tracks {ledger_summary.total_rows} append-only prediction rows across {ledger_summary.as_of_cycles.length} Fall cycles (<code>{ledger_summary.as_of_cycles.join(', ')}</code> × {ledger_summary.segments} school-degree segments × {ledger_summary.steps_per_segment} steps ahead), all stamped <code>mode = {ledger_summary.mode}</code>. Across the full 5-cycle seed, pooled coverage is {p1(ledger_summary.pooled_coverage_all_cycles)} because early vintages (<code>2020FA</code>) project beyond the deepest duration observed at that point (<code>priced_through</code> frontier censoring, where {ledger_summary.frontier_zero_rows} deep MCC cells default conservatively to <code>0.00</code>).
              </p>
              <div className="overflow-x-auto font-mono tabular-nums text-[12.5px]">
                <div className="min-w-[640px]">
                  <div className="grid grid-cols-[80px_80px_90px_110px_1fr] gap-3 py-2 border-b-2 border-[#1b1c18] font-sans font-bold text-[11.5px] text-[#6f6d64]">
                    <span>as_of</span>
                    <span className="text-right">logged</span>
                    <span className="text-right">matured</span>
                    <span className="text-right">frontier 0s</span>
                    <span className="pl-2">statistical &amp; frontier status</span>
                  </div>
                  {ledger_summary.by_cycle.map((cy) => (
                    <div
                      key={cy.as_of}
                      className="grid grid-cols-[80px_80px_90px_110px_1fr] gap-3 py-2 border-b border-[#eeece4] items-baseline"
                    >
                      <span className="font-sans font-semibold text-[#1b1c18]">
                        {cy.as_of}
                      </span>
                      <span className="text-right">{cy.rows_logged}</span>
                      <span className="text-right">{cy.matured_rows}</span>
                      <span
                        className="text-right font-semibold"
                        style={{
                          color:
                            cy.frontier_truncated_rows > 0
                              ? '#b06a3a'
                              : '#54564c',
                        }}
                      >
                        {cy.frontier_truncated_rows}
                      </span>
                      <span className="pl-2 font-sans text-[12px] text-[#54564c]">
                        {cy.note}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            <div>
              <div
                className="text-[11px] font-bold uppercase tracking-[1.5px]"
                style={{ color: accent }}
              >
                Fit-Quality Audit · As of {meta.report_as_of}
              </div>
              <h1 className="font-serif text-[34px] text-[#1b1c18] mt-1">
                Model Diagnostics
              </h1>
            </div>

            {/* 1. Backtest Interval Coverage */}
            <section className="border border-[#e3e1d9] rounded-[10px] p-6 bg-white/80">
              <h2 className="font-serif text-[22px] text-[#1b1c18] mb-3">
                1. Backtest Interval Coverage &amp; Effective Sample Size (80% Nominal Target)
              </h2>
              <p className="text-[13.5px] text-[#54564c] mb-4">
                Evaluated over {compare.windows.length} rolling windows (
                {compare.windows.join(', ')}), {compare.coverage.segments_per_cell}{' '}
                segments per cell ({compare.coverage.checks} nominal checks). Intervals are generated via {meta.n_draws} hierarchical Beta-binomial draws (seed {meta.seed}). Because rolling windows overlap and horizons +1..+4 are cumulative trajectory steps, the effective sample size is <code>N_eff ≈ {ledger_summary.effective_sample_size.effective_n}</code>.
              </p>
              <div className="overflow-x-auto font-mono tabular-nums text-[13px]">
                <div className="grid grid-cols-4 py-2 border-b-2 border-[#1b1c18] font-sans font-bold text-[12px] text-[#6f6d64]">
                  <span>horizon</span>
                  <span className="text-right">covered / total</span>
                  <span className="text-right">empirical rate</span>
                  <span className="text-right">95% Wilson CI</span>
                </div>
                {compare.coverage.by_horizon.map((h) => (
                  <div
                    key={h.k}
                    className="grid grid-cols-4 py-2 border-b border-[#eeece4]"
                  >
                    <span className="font-sans font-semibold">
                      +{h.k} term{h.k > 1 ? 's' : ''}
                    </span>
                    <span className="text-right">
                      {h.covered} / {h.total}
                    </span>
                    <span className="text-right font-bold">{p1(h.rate)}</span>
                    <span className="text-right">
                      {p1(h.lo)} – {p1(h.hi)}
                    </span>
                  </div>
                ))}
                <div className="grid grid-cols-4 py-2.5 font-bold bg-[#f4f2ea] px-2">
                  <span className="font-sans">Pooled (Nominal N=80)</span>
                  <span className="text-right">
                    {compare.coverage.pooled.covered} /{' '}
                    {compare.coverage.pooled.total}
                  </span>
                  <span className="text-right" style={{ color: accent }}>
                    {p1(compare.coverage.pooled.rate)}
                  </span>
                  <span className="text-right">
                    {p1(compare.coverage.pooled.lo)} –{' '}
                    {p1(compare.coverage.pooled.hi)}
                  </span>
                </div>
                <div className="grid grid-cols-4 py-2 font-semibold bg-[#faf8f2] px-2 border-t border-[#e3e1d9] rounded-b text-[12px] text-[#54564c]">
                  <span className="font-sans">
                    Autocorrelation-Adjusted (N_eff ≈{' '}
                    {ledger_summary.effective_sample_size.effective_n})
                  </span>
                  <span className="text-right">20 / 24 equiv.</span>
                  <span className="text-right">
                    {p1(compare.coverage.pooled.rate)}
                  </span>
                  <span className="text-right font-bold text-[#1b1c18]">
                    {p1(ledger_summary.effective_sample_size.effective_lo)} –{' '}
                    {p1(ledger_summary.effective_sample_size.effective_hi)}
                  </span>
                </div>
              </div>
            </section>

            {/* 2. Survival View S(d) */}
            <section className="border border-[#e3e1d9] rounded-[10px] p-6 bg-white/80">
              <h2 className="font-serif text-[22px] text-[#1b1c18] mb-3">
                2. Survival View S(d) — Chain-Ladder Equivalent Lower Bound
              </h2>
              <p className="text-[13.5px] text-[#54564c] mb-4">
                Shrunken E → E continuation probabilities chained from duration 0 with re-entry ignored (prior strength k = {meta.prior_strength}). Note that at deep durations (d ≥ 8 on MCC; d ≥ 12 on MCM), undifferentiated exit O conflates graduation with stop-out.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(entrant.schools).map(([school, cfg]) => (
                  <div
                    key={school}
                    className="border border-[#e3e1d9] rounded-lg p-4"
                  >
                    <div className="font-bold text-[14px] mb-2">
                      {school} ({cfg.terms_per_year} terms/year)
                    </div>
                    <div className="grid grid-cols-3 text-[11.5px] font-bold text-[#6f6d64] border-b border-[#1b1c18] pb-1">
                      <span>duration d</span>
                      <span className="text-right">rate p_EE(d-1)</span>
                      <span className="text-right">survival S(d)</span>
                    </div>
                    {cfg.curve.map((sVal, dIdx) => (
                      <div
                        key={dIdx}
                        className="grid grid-cols-3 text-[12px] font-mono tabular-nums py-1 border-b border-[#f1efe7]"
                      >
                        <span>d = {dIdx}</span>
                        <span className="text-right">
                          {dIdx === 0 ? '—' : cfg.rates[dIdx - 1]?.toFixed(4)}
                        </span>
                        <span className="text-right font-semibold">
                          {sVal.toFixed(4)}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Aid-Band Conditioning & NTR Drift Audit */}
            <section className="border border-[#e3e1d9] rounded-[10px] p-6 bg-white/80">
              <h2 className="font-serif text-[22px] text-[#1b1c18] mb-3">
                3. Aid-Band Conditioning vs. Coarse Segmentation NTR Error (k = {drift.k} Terms)
              </h2>
              <p className="text-[13.5px] text-[#54564c] mb-4">
                Signed error of total projected net tuition revenue at {drift.k} terms ahead across rolling-origin windows. Because institutional grant aid correlates with persistence in the synthetic panel, omitting aid band from the conditioning set produces upward drift in later windows when discount mix shifts.
              </p>
              <div className="overflow-x-auto font-mono tabular-nums text-[13px]">
                <div className="grid grid-cols-4 py-2 border-b-2 border-[#1b1c18] font-sans font-bold text-[12px] text-[#6f6d64]">
                  <span>as-of window</span>
                  <span className="text-right">coarse (school × degree)</span>
                  <span className="text-right">aid-conditioned (+ aid band)</span>
                  <span className="text-right">abs error reduction</span>
                </div>
                {drift.windows.map((wName, i) => {
                  const cErr = drift.coarse[i] ?? 0;
                  const aErr = drift.aid[i] ?? 0;
                  const reduction = Math.abs(cErr) - Math.abs(aErr);
                  return (
                    <div
                      key={wName}
                      className="grid grid-cols-4 py-2 border-b border-[#eeece4]"
                    >
                      <span className="font-sans font-semibold">{wName}</span>
                      <span className="text-right text-[#54564c]">
                        {signedPct(cErr)}
                      </span>
                      <span
                        className="text-right font-bold"
                        style={{ color: accent }}
                      >
                        {signedPct(aErr)}
                      </span>
                      <span className="text-right text-[#54564c]">
                        {(reduction * 100).toFixed(2)} pp
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 4. Institutional Standards & Contract Summary */}
            <section className="border border-[#e3e1d9] rounded-[10px] p-6 bg-white/80">
              <h2 className="font-serif text-[22px] text-[#1b1c18] mb-3">
                4. Institutional Higher Education Pipeline ↔ Statistical Survival Specification
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[13.5px] leading-[1.6] text-[#44453a]">
                <div>
                  <div className="font-bold text-[#1b1c18] mb-1">
                    Stage 1/2 Warehouse Contract (retention_fact &amp; batched_cohort_projections_prep)
                  </div>
                  <p>
                    Per <code>docs/STAGE1_CONTRACT.md</code>, source records from <code>retention_fact</code> use <code>YYYYTT</code> presentation term codes: four digits for the calendar year plus <code>FA</code> (Fall, starts September), <code>SP</code> (Spring, starts January), or <code>SU</code> (Summer, starts June). A freshman entering in <code>2019FA</code> (<code>d=0</code>) who persists to <code>2020SP</code> (<code>d=1</code>), earns a D in a Spring course, and enrolls in <code>2020SU</code> (<code>d=2</code>) for credit recovery illustrates why seasonal 3-term calendars (<code>INCLUDE_SUMMER = True</code>) set <code>offset = 2</code> on Fall terms (<code>2020FA</code>, <code>d=3</code>) when computing ratio triangles, whereas the Seed 42 synthetic panel models smooth geometric decay across all terms.
                  </p>
                </div>
                <div>
                  <div className="font-bold text-[#1b1c18] mb-1">
                    Statistical Markov &amp; Credibility Shrinkage Formulation (IPEDS / NACUBO / HEOA)
                  </div>
                  <p>
                    Where the legacy chain-ladder prototype (<code>ret_rates_proj</code>) partitioned a 40,118-row extract into 233 5-way <code>projection_code</code> segments and dropped 73 sparse segments failing <code>projection_counts &gt; 20</code>, the rebuilt model over the 54,954-record panel estimates a duration-indexed Markov transition matrix <code>P(s, d)</code> and regularizes thin segment × duration cells toward the school-level continuation rate <code>p̄_d</code> via linear credibility shrinkage (<code>k = {meta.prior_strength}</code>). Conditioning on the 5-tier <code>discount_description</code> schedule eliminates compositional NTR drift across rolling-origin windows.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
