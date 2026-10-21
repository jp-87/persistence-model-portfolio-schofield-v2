import React, { useState, useEffect, useRef } from 'react';
import siteDataRaw from './data/siteData.json';
import { SiteData } from './data/types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SidebarNav, navItemsList } from './components/SidebarNav';
import { ProblemSection } from './components/ProblemSection';
import { MethodSection, MethodItem } from './components/MethodSection';
import {
  BacktestSection,
  HorizonBarItem,
  CovBarItem,
  TableRowItem,
} from './components/BacktestSection';
import { RevenueSection } from './components/RevenueSection';
import { ScenariosSection } from './components/ScenariosSection';
import { CalculatorSection } from './components/CalculatorSection';
import { CodeSection } from './components/CodeSection';
import { CohortsSection } from './components/CohortsSection';
import { LimitationsSection } from './components/LimitationsSection';
import { Footer } from './components/Footer';
import { StandingReportView } from './components/StandingReportView';

const D = siteDataRaw as unknown as SiteData;

export const App: React.FC = () => {
  const accent = '#0d4f30';
  const paper = '#f7f4ec'; // cream
  const annotate = true;

  const [viewMode, setViewMode] = useState<'portfolio' | 'report' | 'diagnostics'>('portfolio');
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [activeScenario, setActiveScenario] = useState<
    'flat' | 'cliff' | 'northeast'
  >('cliff');

  const rootRef = useRef<HTMLDivElement>(null);

  // Scroll spy
  useEffect(() => {
    if (viewMode !== 'portfolio') return;
    const handleScroll = () => {
      if (!rootRef.current) return;
      const ids = navItemsList.map((n) => n.id);
      let cur = ids[0];
      for (const id of ids) {
        const el = rootRef.current.querySelector(`[data-section="${id}"]`);
        if (el && el.getBoundingClientRect().top <= 160) {
          cur = id;
        }
      }
      setActiveSection(cur);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [viewMode]);

  const scrollToSection = (id: string) => {
    if (!rootRef.current) return;
    const el = rootRef.current.querySelector(`[data-section="${id}"]`);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  if (viewMode === 'report' || viewMode === 'diagnostics') {
    return (
      <StandingReportView
        accent={accent}
        paper={paper}
        siteData={D}
        initialTab={viewMode === 'diagnostics' ? 'diagnostics' : 'report'}
        onBackToPortfolio={() => {
          setViewMode('portfolio');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  // Calculations for charts and stat cards
  const hMax = Math.max(
    ...D.compare.horizons.map((h) => Math.max(h.markov.max, h.ladder.max))
  );
  const hy = (v: number) => 190 - (v / hMax) * 150;

  const horizonBars: HorizonBarItem[] = D.compare.horizons.map((h, i) => {
    const cx = 90 + i * 140;
    const bar = (m: { mean: number; min: number; max: number }) => ({
      y: hy(m.mean),
      h: 190 - hy(m.mean),
      lo: hy(m.min),
      hi: hy(m.max),
    });
    const a = bar(h.markov);
    const b = bar(h.ladder);
    return {
      cx,
      label: `+${h.k} term${h.k > 1 ? 's' : ''}`,
      mx: cx - 26,
      mBx: cx - 48,
      mY: a.y,
      mH: a.h,
      mLo: a.lo,
      mHi: a.hi,
      mTxt: a.hi - 5,
      mVal: (h.markov.mean * 100).toFixed(1) + '%',
      lx: cx + 26,
      lBx: cx + 4,
      lY: b.y,
      lH: b.h,
      lLo: b.lo,
      lHi: b.hi,
      lTxt: b.hi - 5,
      lVal: (h.ladder.mean * 100).toFixed(1) + '%',
    };
  });

  const apeColor = (v: number) => (v < 0.06 ? accent : '#b06a3a');

  const tableRows: TableRowItem[] = D.backtest.rows.map((r) => ({
    k: `+${r.k}`,
    exp: r.expected.toFixed(1),
    act: String(r.actual),
    mape: r.seg_mape.toFixed(3),
    cov: r.coverage.toFixed(2),
    ape: r.total_ape.toFixed(3),
    apeColor: apeColor(r.total_ape),
  }));

  const covBars: CovBarItem[] = D.backtest.rows.map((r, i) => {
    const h = 140 * r.coverage;
    return {
      lx: 59 + i * 42,
      lab: `+${r.k}`,
      x: 44 + i * 42,
      y: 158 - h,
      h,
      o: r.coverage >= 1 ? 0.85 : r.coverage >= 0.75 ? 0.6 : 0.42,
    };
  });

  const pct = (v: number, n = 1) => (v * 100).toFixed(n);
  const p1 = (v: number) => (v * 100).toFixed(1) + '%';
  const p0 = (v: number) => (Math.round(v * 100) || 0) + '%';
  const rng = (a: number[]) => p0(Math.min(...a)) + ' to ' + p0(Math.max(...a));
  const last3 = (a: number[]) => a.slice(-3);

  const M = D.meta;
  const cov = D.compare.coverage;
  const nW = D.compare.windows.length;
  const bt = D.backtest;
  const wi = D.drift.windows;
  const w = D.wiche;

  const T = {
    hero: `A two-state Markov model for student persistence, applied by segment (school × degree) and horizon h (terms ahead). All data are synthetic. Backtested on ${nW} windows (${wi.join(', ')}), it has a mean absolute percentage error of the total (MAPE-total) of ${pct(D.compare.markov_mean_ape)}%, against ${pct(D.compare.ladder_mean_ape)}% for a chain-ladder baseline rebuilt for this project. Caveats: the synthetic data contain no re-entry and are drawn from the same model family that is fitted, so this shows implementation correctness, not real-world fit.`,
    figTag: `BACKTEST · FIT AT ${bt.as_of}`,
    figSub: `${bt.segment} headcount, ${bt.steps} terms ahead`,
    figAlt: `Observed ${bt.segment} headcount through ${bt.as_of}, projection with ${p0(M.interval_level)} predictive interval, and held-out actuals`,
    sector: `Sector context: WICHE (${w.source}) projects the national count of high school graduates to change ${(w.national.change * 100).toFixed(1)}% from its ${w.national.peak_year} peak to ${w.end_year}, and the Northeast ${(w.northeast.change * 100).toFixed(1)}% over the same span. The scenarios below use these series as assumptions. The model does not estimate them.`,
    diagramNote: `Each column is one duration d, the number of terms since entry. A student is in E (enrolled) or O (out). Solid arrows are fitted; the dashed re-entry arrow is part of the model but has no observed events in this synthetic data.`,
    whiskerNote: `mean across ${nW} backtest windows; whiskers show min to max`,
    nWin: nW,
    metricLine: `MAPE-total, mean over ${D.compare.cells} window-horizon cells: this model ${pct(D.compare.markov_mean_ape)}%, chain-ladder ${pct(D.compare.ladder_mean_ape)}%`,
    covTitle: `${p0(M.interval_level)} interval coverage`,
    covSub: `per horizon, ${bt.as_of} window; pooled ${cov.pooled.covered}/${cov.pooled.total} = ${p1(cov.pooled.rate)} (95% Wilson ${p1(cov.pooled.lo)} to ${p1(cov.pooled.hi)})`,
    target: `${p0(M.interval_level)} target`,
    stat1: `baseline MAPE-total ÷ model MAPE-total (synthetic)`,
    stat3: `of ${cov.checks} segment checks inside the ${p0(M.interval_level)} interval (synthetic)`,
    stat4: `of ${D.compare.cells} window-horizon cells where the model had lower error (synthetic)`,
    errNote: `In the ${bt.as_of} window, MAPE-total is ${pct(bt.rows[bt.rows.length - 2].total_ape, 1)}% at ${bt.rows.length - 1} terms and ${pct(bt.rows[bt.rows.length - 1].total_ape, 1)}% at ${bt.rows.length}. Segment-level error is larger and grows with horizon as the surviving counts shrink. This figure is one window; the bars above average all ${nW}.`,
    drift: `Signed error of total NTR at ${D.drift.k} terms. With a coarse segmentation (no aid band) it ranges ${rng(D.drift.coarse)} across the windows (${wi.join(', ')}); the last three are ${rng(last3(D.drift.coarse))}. Conditioning on aid band gives ${rng(D.drift.aid)} (last three: ${rng(last3(D.drift.aid))}). In this synthetic data, aided students retain better by construction.`,
    scenarioNote: `Scenario lines are expected values from the median-draw path; bands are the 10th to 90th percentile of simulated draws. Revenue per entrant is taken from the latest entering cohorts.`,
    calcTag: `04b, Calculator & Counterfactual Sensitivity Simulator`,
    calcIntro: `Configure a Fall entering class (N₀), tuition charge per enrolled term, and institutional grant rate, or select a reference campus archetype. The baseline applies the chosen school's pooled continuation rates p_EE(d) (as of ${D.entrant.as_of}) to sum expected net tuition revenue over ${D.entrant.years} years, while sensitivity controls test unfunded-need hazard shifts (mix α), optional DGP aid-retention linkage, single-bridge Summer (2020SP → 2020SU) credit recovery, and program break-even thresholds.`,
    calcAssume: `Assumptions: baseline curves use school-level pooled hazards (as of ${D.entrant.as_of}) for a Fall entering cohort with constant tuition and grant rates and no post-stopout re-entry (a lower bound on revenue); unfunded-need shifts (mix α), Summer (SU) credit-recovery uptake, and intervention hazard reductions are explicit counterfactual sensitivity parameters rather than causal estimates from observational data.`,
    tableTitle: `Table 1; backtest at ${bt.as_of}, ${bt.steps} terms ahead`,
    tableCmd: `python -m persistence.backtest --as-of ${bt.as_of} --steps ${bt.steps}`,
    endYear: D.scenarios.flat[D.scenarios.flat.length - 1].fall.slice(0, 4),
    y1: D.scenarios.flat[D.scenarios.flat.length - 3].fall,
    y2: D.scenarios.flat[D.scenarios.flat.length - 1].fall,
  };

  const sp = D.entrant.schools;
  const tpy = Object.keys(sp)
    .map((k) => `${k} ${sp[k].terms_per_year}`)
    .join(', ');

  const methodItems: MethodItem[] = [
    {
      title: 'Model',
      subtitle: 'Markov Transition Kernel P(s, d) ↔ ret_rates_table & terms_since_start',
      hasEq: true,
      text: `States are E (enrolled) and O (out). Time is d, the number of terms since the cohort entered, not calendar time. A term is one academic term on the school calendar (terms per year: ${tpy}). For each segment s (school × degree) and duration d there is one transition matrix, the same for every cohort in s.`,
      irNote: `In the warehouse pipeline (batched_cohort_projections_prep), student-term records from retention_fact (enrollment_status = 'E') use YYYYTT presentation term codes—four digits for the calendar year plus FA (Fall, starts September), SP (Spring, starts January), or SU (Summer, starts June)—indexed by get_num_terms_between into terms_since_start (d). On a real seasonal 3-term campus (INCLUDE_SUMMER = True), a freshman starting in 2019FA (d=0) who persists to 2020SP (d=1), earns a D in a Spring class, and enrolls in 2020SU (d=2) for credit recovery before returning in 2020FA (d=3) motivates the offset = 2 Spring-to-Fall bridge so 2020FA continuation is measured against 2020SP rather than minimal 2020SU enrollment.`,
      eq: `           to E          to O
P(s,d) =  from E [ p_EE(s,d)   1 - p_EE(s,d) ]
          from O [ p_OE(s,d)   1 - p_OE(s,d) ]`,
    },
    {
      title: 'Estimation',
      subtitle: `Credibility Shrinkage (k = ${M.prior_strength}) ↔ base_table_no_covid & projection_code`,
      hasEq: true,
      text: `Observed rate p̂ = x / n, where x of n students at risk at duration d moved E to E. Sparse segments are shrunk toward the school-level rate p̄ at the same d, with prior strength k = ${M.prior_strength} set by hand (partial empirical Bayes / credibility weighting). Students still enrolled at the as-of term are right-censored: they count as at risk only for transitions observed before it, and no exit is imputed.`,
      irNote: `Whereas the legacy chain-ladder notebook partitioned an earlier 40,118-row extract into 233 5-way segments (projection_code), dropped 73 sparse segments failing projection_counts > 20 (retaining 160), and masked pandemic shock terms covid_terms = [2020FA, 2021SP, 2021SU] in base_table_no_covid, credibility pooling (k = ${M.prior_strength}) regularizes thin segment × duration cells toward the school mean p̄ without discarding low-volume cohorts or suffering small-cell p = 1.000 spikes.`,
      eq: `p~ = (n * p^ + k * p_bar) / (n + k)`,
    },
    {
      title: 'Projection',
      subtitle: 'Cohort State Propagation ↔ ret_rates_proj & Diagonal Census Aggregation',
      hasEq: true,
      text: `A cohort c in segment s with row vector [E, O] at duration d moves one term ahead by multiplying by P(s,d). Segment headcount h terms ahead is the sum of E over cohorts. With p_OE = 0 this reduces to a duration-indexed retention (chain-ladder-style) projection.`,
      irNote: `In batched_cohort_projections_prep (reference cut DATA_DATE = 2025FA; canonical repo panel scored at as_of = ${M.report_as_of}), ret_rates_proj steps unfinished cohorts forward to target census terms proj_term (2026SP, 2026SU, 2026FA) and sums along the cohort-duration anti-diagonal where cohort_term + d = proj_term.`,
      eq: `[E, O]_c(d+1) = [E, O]_c(d) · P(s,d)
headcount(s, h) = sum over c of E_c(d_c + h)`,
    },
    {
      title: 'Intervals (simulation, not bootstrap)',
      subtitle: 'Beta-Binomial Parametric Monte Carlo ↔ Deterministic Point Forecast',
      hasEq: false,
      text: `For each of ${M.n_draws} draws, p_EE and p_OE are sampled once per duration from a Beta distribution centered on the shrunk rate, and that draw is shared by every cohort in the segment. Counts then move by binomial draws (process noise). The band is the 10th to 90th percentile of the simulated totals. No students are resampled. The Beta width ignores the prior pseudo-count and durations are drawn independently, so the band is approximate, not a posterior.`,
      irNote: `Replaces single-point deterministic headcount_projections totals with empirical 80% predictive intervals (p10 to p90) that separate parameter uncertainty (Beta draw on transition rates) from finite-cohort demographic process noise (Binomial draw on surviving headcount).`,
    },
    {
      title: 'Regression equivalent',
      subtitle: 'Discrete-Time Hazard Logit ↔ discount_description & Entry-Season Conditioning',
      hasEq: false,
      text: `Without shrinkage, the rates equal the fitted values of a binomial logit for persistence with a full segment × duration interaction (a saturated model). A covariate version (for example aid band and entry season in place of cell indicators) is the planned extension; entry season is already an optional stratifier.`,
      irNote: `Incorporates institutional financial aid award tiers (discount_description: No Award <15%, Minimal Aid 15–35%, Partial Aid 35–60%, Substantial Aid 60–80%, Near-Full Aid ≥80%) and YYYYTT entry term season (FA, SP, SU) as discrete-time survival covariates.`,
    },
  ];

  const limits = [
    'Data are synthetic, generated from the same model family that is fitted. Accuracy figures show the implementation works, not real-world performance.',
    'The synthetic data contain no re-entry and no summer enrollment dip, so out-to-enrolled transitions and seasonal summer cliffs are untested in the synthetic panel.',
    'The chain-ladder baseline is a self-written rebuild, not an institutional production method.',
    `Only ${nW} backtest windows and ${cov.checks} nominal segment checks (effective sample size N_eff ≈ ${D.ledger_summary.effective_sample_size.effective_n} due to overlapping windows and cumulative horizons); the nominal 95% Wilson interval is ${p1(cov.pooled.lo)} to ${p1(cov.pooled.hi)} (${p1(D.ledger_summary.effective_sample_size.effective_lo)} to ${p1(D.ledger_summary.effective_sample_size.effective_hi)} at N_eff).`,
    `Predictive bands are approximate, not a posterior: prior strength k = ${M.prior_strength} is set by hand and draws are independent across durations.`,
    'Graduation and withdrawal are not separated: at deep durations (d ≥ 8 on MCC; d ≥ 12 on MCM), exit state O conflates degree completion with attrition.',
    'Entering-class sizes are scenario assumptions, not forecasts.',
    "Net tuition revenue uses the latest cohorts' mean per student, held constant; no price changes.",
  ];

  return (
    <div
      ref={rootRef}
      className="min-h-screen text-[#23241f] selection:bg-[#0d4f30]/20 font-sans"
      style={{
        backgroundColor: paper,
      }}
    >
      <Navbar
        accent={accent}
        paper={paper}
        repoUrl={D.repo_url}
        published={D.published}
        activeView={viewMode}
        onSelectView={(view) => {
          setViewMode(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <Hero
        accent={accent}
        paper={paper}
        heroText={T.hero}
        figTag={T.figTag}
        figSub={T.figSub}
        figAlt={T.figAlt}
        stat1={T.stat1}
        stat3={T.stat3}
        stat4={T.stat4}
        ratio={D.compare.ratio.toFixed(0)}
        markovPct={pct(D.compare.markov_mean_ape)}
        ladderPct={pct(D.compare.ladder_mean_ape)}
        cov={pct(D.compare.coverage_80, 0)}
        wins={D.compare.markov_wins}
        cells={D.compare.cells}
        onReadCaseStudy={() => scrollToSection('problem')}
        repoUrl={D.repo_url}
        published={D.published}
      />

      {/* Main Container with Sidebar + Content */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 pt-7 pb-24 grid grid-cols-1 lg:grid-cols-[228px_1fr] gap-12 lg:gap-16 items-start">
        <SidebarNav
          activeSection={activeSection}
          accent={accent}
          onNavigate={scrollToSection}
          lines={D.code.total_lines.toLocaleString('en-US')}
          tests={D.code.tests}
          published={D.published}
          repoUrl={D.repo_url}
          onOpenReport={(tab) => {
            setViewMode(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        <main className="min-w-0 flex flex-col gap-16 md:gap-[74px]">
          <ProblemSection accent={accent} sectorText={T.sector} />

          <MethodSection
            accent={accent}
            diagramNote={T.diagramNote}
            methodItems={methodItems}
          />

          <BacktestSection
            accent={accent}
            whiskerNote={T.whiskerNote}
            nWin={T.nWin}
            metricLine={T.metricLine}
            covTitle={T.covTitle}
            covSub={T.covSub}
            target={T.target}
            horizonBars={horizonBars}
            covBars={covBars}
            tableTitle={T.tableTitle}
            tableCmd={T.tableCmd}
            tableRows={tableRows}
            errNote={T.errNote}
            coverageByHorizon={cov.by_horizon}
            pooledCoverage={cov.pooled}
            effectiveSampleSize={D.ledger_summary.effective_sample_size}
            annotate={annotate}
          />

          <RevenueSection
            accent={accent}
            paper={paper}
            ntr1={pct(D.revenue.rows[0].total_ape)}
            ntr4={pct(D.revenue.rows[3].total_ape, 0)}
            driftText={T.drift}
          />

          <ScenariosSection
            accent={accent}
            paper={paper}
            endYear={T.endYear}
            scenarioNote={T.scenarioNote}
            y1Label={T.y1}
            y2Label={T.y2}
            siteData={D}
            activeScenario={activeScenario}
            onSelectScenario={setActiveScenario}
          />

          <CalculatorSection
            accent={accent}
            siteData={D}
            calcTag={T.calcTag}
            calcIntro={T.calcIntro}
            calcAssume={T.calcAssume}
          />

          <CodeSection accent={accent} siteData={D} />

          <CohortsSection accent={accent} siteData={D} />

          <LimitationsSection accent={accent} limits={limits} />

          <Footer
            accent={accent}
            repoUrl={D.repo_url}
            published={D.published}
            meta={M}
            dataMd5={D.data.md5}
            onOpenReport={() => {
              setViewMode('report');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default App;
