# Changelog

## 0.2.1

- Grounded the Stage 2 Cohort-Matrix Inspector in both the canonical Seed 42 synthetic panel (`74.1%` Summer continuation) and the seasonal warehouse registration triangle (`14.8%` Summer continuation motivating `INCLUDE_SUMMER = True` and `offset = 2`), with live COVID-window, calendar, and Empirical Bayes prior-strength (`k`) recalculation.
- Fixed 3-term Summer bridge hazard reduction in `src/utils/calculator.ts` so Spring-to-Fall credit recovery applies once at the Year-2 Fall entry transition (`idx = tpy - 1`) without double-compounding, and added an optional toggle linking grant rates above `50%` to the synthetic generator's `1.10x` persistence lift.
- Added autocorrelation-adjusted effective sample size ($N_{\text{eff}} \approx 24$, 95% Wilson CI: `63.2%–92.8%`) alongside the nominal $N = 80$ Wilson coverage interval, and surfaced the 120-row append-only forecast ledger (`data/forecast_ledger.csv`) and `priced_through` frontier truncation audit in the Standing Report & Diagnostics views.
- Fixed data-bound SVG chart labels that did not render (interpolated values were wrapped in an HTML span inside SVG text); added a regression test.
- Fixed a "-0%" in the drift sentence and corrected runtime provenance metadata in `src/data/siteData.json`.
- Removed references to private paths that do not exist in this repo.

## 0.2.0

- Portfolio page is bound to generated data (`site/data.json`), with no hard-coded numbers in prose; a test enforces this.
- Added an entering-class to four-year net tuition revenue calculator driven by the fitted hazards.
- Reported coverage as 66/80 segment checks with Wilson intervals; added signed NTR drift by window.
- Reworded claims: overstated terms removed, interval approximations and limitations stated.
- Added `requirements.lock`, a CI matrix, ruff, pip-audit, Dependabot, `CITATION.cff`, and a method and related-work section.

## 0.1.0

- Initial public cut.
