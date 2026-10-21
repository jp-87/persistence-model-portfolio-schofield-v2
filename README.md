# Student Persistence Model

**Live Application (GitHub Pages):** [https://jp-87.github.io/student-persistence-model/](https://jp-87.github.io/student-persistence-model/) · **Google AI Studio:** [https://remix-student-persistence-model-9415.ai.studio](https://remix-student-persistence-model-9415.ai.studio)

A React & TypeScript application presenting a discrete-time, two-state Markov model of student enrollment persistence, with Monte Carlo predictive intervals, rolling-origin backtest metrics, an interactive Cohort-Matrix Inspector contrasting the Seed 42 synthetic panel against seasonal warehouse triangles, WICHE demographic scenario projections to 2030, a counterfactual retention & net tuition break-even sensitivity simulator, and a generated Standing Report & Diagnostics view.

## Overview

Enrollment projections inform a university's budget, staffing, and discount strategy. The core question: *how many of our current students will still be enrolled in h terms, by school and degree, and with what uncertainty?*

All figures and tables on the site are computed on a 54,954-record synthetic enrollment panel (`data/synthetic_enrollment.csv`, seed 42, MD5-verified) derived from the schema contract in `docs/STAGE1_CONTRACT.md` and aligned with the institutional research definitions in `docs/STANDARDS.md`.

### Key Methodology & Features

- **Duration-Indexed Two-State Markov Chain & Cohort-Matrix Inspector**: Models transitions between Enrolled ($E$) and Out ($O$) indexed by duration $d$ (terms since entry on each school's calendar: MCM 3 terms/year, MCC 2 terms/year) with partial empirical-Bayes shrinkage ($w_{s,d} = n_{s,d} / (n_{s,d} + k)$, $k = 50$) toward the school pool at duration $d$. Interactive toggles contrast the smooth Seed 42 synthetic panel (`74.1%` Summer continuation) against seasonal warehouse registration triangles (`14.8%` Summer continuation motivating `INCLUDE_SUMMER = True` and `offset = 2` on Fall terms).
- **Rolling-Origin Backtest, Wilson Coverage & Effective Sample Size ($N_{\text{eff}}$)**: Fitted on truncated history across 5 windows (`2022FA`–`2024FA`) and scored against held-out terms (existing students only). Achieves 2.4% mean absolute percentage error of total headcount (MAPE-total) vs. 7.3% for the chain-ladder comparator across 20 window-horizon cells, with 82.5% empirical coverage (66/80 nominal segment checks; i.i.d. 95% Wilson CI: 72.7%–89.3%; autocorrelation-adjusted $N_{\text{eff}} \approx 24$ 95% Wilson CI: 63.2%–92.8%) on nominal 80% Beta-binomial predictive intervals.
- **Append-Only Forecast Ledger & Frontier Truncation Audit**: Tracks 120 logged predictions (`data/forecast_ledger.csv`) across `2020FA`–`2024FA` (4 segments $\times$ 6 steps ahead), documenting `priced_through` duration-frontier censoring on early `2020FA` MCC horizons.
- **Aid-Band Conditioning & Revenue Backtest**: Conditions persistence and NTR weights on the 5-tier institutional discount schedule (`discount_description`, proxy for HEOA aid groups), reducing 4-term signed NTR drift across rolling windows.
- **WICHE Demographic Scenarios to 2030**: Compares Flat recruitment against WICHE 11th-edition (*Knocking at the College Door*) National ("Cliff", −5.5% from 2025 peak to 2030) and Northeast (−7.6%) high school graduate projections with 10th–90th percentile simulation bands.
- **Interactive 4-Year NTR Calculator & Counterfactual Sensitivity Simulator**: Real-time cohort simulation across schools (`MCM`, `MCC`) reporting IPEDS-analog Year-2 retention $S(t_{\text{yr2}})$, single-bridge `2019FA → 2020SP → 2020SU → 2020FA` Summer credit-recovery sensitivity (`idx = tpy - 1`), optional synthetic DGP aid-retention linkage (`1.10×` continuation lift when institutional grant exceeds `50%`), and program cost break-even headcount thresholds.
- **Vintage Alpha & Exposure Risk Cells**: Decomposes cumulative cohort performance into within-segment persistence rate alpha ($\text{rate }\alpha$) and entry-composition mix shift ($\text{mix }\alpha$), and ranks segment $\times$ entry-season $\times$ duration cells by expected next-term NTR at risk.

### Scope & Standing Limitations

- **In-Family Synthetic Panel**: The synthetic dataset (`data/synthetic_enrollment.csv`) is generated inside the Markov model family (seed 42); backtest results validate implementation mechanics rather than empirical campus findings.
- **Undifferentiated Exit State ($O$)**: The two-state specification pools stop-out, transfer-out, and degree completion into a single absorbing/re-enterable exit state $O$. At deep durations ($d \ge 8$ on 2-term MCC; $d \ge 12$ on 3-term MCM), exit hazard includes graduation.
- **Serial Correlation & Frontier Censoring**: Overlapping rolling-origin windows and multi-step horizons induce positive dependence across the 80 nominal backtest checks ($N_{\text{eff}} \approx 24$), and projections beyond `priced_through` in early cohorts (`2020FA`) default to zero rather than extrapolating unobserved durations.
- **Observational Conditioning vs. Counterfactual Sensitivity**: Aid-band conditioning adjusts for compositional mix shifts in historical cohorts; counterfactual hazard reductions and break-even thresholds in the calculator are user-specified sensitivity assumptions, not causal treatment effects.

## Quick Start (Node 22+)

```bash
npm ci
npm run dev
```

The development server runs at `http://localhost:3000`.

### Verification & CI Checks

GitHub Actions CI (`.github/workflows/ci.yml`) runs the following deterministic checks on every push and pull request:

```bash
npm run lint    # TypeScript static typecheck (tsc --noEmit)
npm test        # 15-check regression, mathematical property & SSR DOM suite
npm run build   # Production bundle verification (tsc && vite build)
```

## Repository Structure

- `src/components/` — Modular React components for the portfolio case study, Cohort-Matrix Inspector, Counterfactual Sensitivity Simulator, and Standing Report / Diagnostics views
- `src/utils/calculator.ts` — Pure cohort survival curve, single-bridge Summer recovery, and 4-year NTR projection engine with input validation
- `src/data/siteData.json` — Exported model outputs, backtest matrices, Wilson intervals ($N = 80$ and $N_{\text{eff}} \approx 24$), forecast ledger summary, vintage alpha, and risk-cell catalog
- `data/` — Synthetic enrollment panel (`synthetic_enrollment.csv`), append-only forecast ledger (`forecast_ledger.csv`), WICHE reference series (`reference/wiche_hsgrad.csv`), and COA aid schema (`aid_schema/`)
- `docs/` — Institutional research standards (`STANDARDS.md`), upstream fact contract (`STAGE1_CONTRACT.md`), and design records
- `scripts/regression_test.mjs` — Automated verification suite checking data checksums, mathematical invariants, single-bridge Summer hazard math, Wilson intervals, WICHE/ledger schemas, and live React SSR DOM rendering
