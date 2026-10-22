# Changelog

## 0.2.1

- Restored the authentic two-stage **RStudio + Positron IDE** cohort persistence and Net Tuition Revenue (NTR) pipeline across all interactive sections.
- Fixed the 3-term **MCM** (`INCLUDE_SUMMER = True`) cohort survival calculation so Fall-to-Spring-to-Fall persistence uses `offset = 2` (`t = 3 / t = 1`), preventing optional Summer terms (`t = 2, 5, 8`) from artificially depressing Year 2–4 academic-year retention.
- Unified the `2026FA` starting baseline (`3,082` students, `$104.1M` Fall NTR) across all three 2030 demographic scenarios (`flat`, `cliff`, `northeast`) with an 80% range band (`p10_m` to `p90_m`).
- Wired `CalculatorSection.tsx` directly to `computeEntrantProjection` in `src/utils/calculator.ts` using the RStudio NTR identity (`Gross Tuition - Institutional Grant Aid + Comprehensive Fee`) and `±2.5pp` retention sensitivity bounds.
- Replaced the synthetic cumulative Pareto line in Section 05 with a **Retained First-Year NTR vs. First-Year NTR at Risk** comparison chart across the 5 RStudio Tuition Discount Rate tiers.
- Removed deprecated documentation, static figure artifacts, and unsubstantiated holdout backtest claims.

## 0.2.0

- Portfolio page is bound to generated data (`src/data/siteData.json`) with an entering-class to four-year Net Tuition Revenue calculator.

## 0.1.0

- Initial public release.

