# Cutting-Room Register

> Build history. A working register of ideas considered and dropped, kept because other docs reference it. The README is authoritative.

Ideas proposed with rationale during working sessions that are NOT in
the committed build arc — recorded so that dropping a feature never
silently drops its reasoning. Recovered 2026-07-03 by a continuity
audit after parts of the session record became unrecoverable; several
rationales below survived only in working memory. Status codes:
DROPPED (no plan slot), DEFERRED (gated, slot exists), ORPHAN (code
exists, no consumer).

## The 18-finding diagnostic (reconstructed index)

From the best-practices cross-examination (AIR aspirational practice,
EAB pattern, Kaplan/Norton balanced scorecard, Porter, Sharp —
framework names recovered from working memory; their full citations
were lost with the session record, and only the IR-standard sources
(IPEDS/HEOA/NACUBO/CDS, MSU, UMN) are formally cited, in
STANDARDS.md): 1 sector-native KPI vocabulary (shipped: kpi.py);
2 equity disaggregation by default (see below); 3 closed loop
metric→intervention→re-measure (arc B/real-data track); 4 concession —
definition governance and lineage exceed field practice; 5 BSC
discipline — metrics lack causal-arrow placement and named owners
(unaddressed, by design for a model library); 6 peer benchmarks (see
below); 7 backward driver decomposition (shipped: report §2); 8 threat
quantification half-built — PLUS/international (see below); 9 demand
absent — state the retention ceiling (see below); 10 environment enters
as prose not data (see below); 11 funding-channel decomposition (see
below); 12 distribution outputs (see below); 13 cumulative time-axis
views (see below); 14 churn ledger (shipped: report §3); 15
policy/intervention-conditional scenarios (partially: arc B rehearses
PLUS); 16 diagnostics artifact (see below); 17 runtime input gate (see
below); 18 fixed report grammar (shipped: make report).

## Dropped or adopted, with their reasons (status in the last column)

| item | rationale worth keeping | cheapest future form |
|---|---|---|
| Equity disaggregation as default | AIR/accreditor norm: disaggregate by default (Pell, first-gen, residency, visa). Never fabricate race/ethnicity onto synthetic data. `student_dim` already carries the columns, unused | auto-activate cuts when aid schema populates; **aid band + entry season SHIPPED 2026-07-04 (arc A)** as report display defaults |
| Retention ceiling as emitted output | "You cannot retain your way out of a recruitment cliff" — the model proves it (existing cohorts deplete to steady state ~6 terms); one printed comparison: persistence +1pp vs entering −1.5%/yr, in heads and $ | **SHIPPED 2026-07-04 (arc A):** `kpi.retention_ceiling` + one sentence in report §8 |
| `make diagnostics` | Fit quality lives inside tests, invisible to consumers: hazard tables w/ CIs + cell n, shrinkage weights, cohort-stationarity test (risk-register #3), coverage table | **SHIPPED 2026-07-04 (arc A):** `diagnostics.py` → `build/diagnostics.md` |
| Runtime input gate | `retention_fact_schema.csv` is already machine-readable; nothing enforces it at the read boundary for arbitrary client CSVs | **SHIPPED 2026-07-06 (arc D):** `panel.validate_enrollment`, run by every `build_panel` call; loud contract diff |
| WICHE series as versioned input | Scenario paths hand-set (−1.5/−3.5); external facts age silently unless pinned as versioned data | **SHIPPED 2026-07-04 (arc A):** `data/reference/wiche_hsgrad.csv` (published 11th-ed series, provenance header) drives cliff/northeast |
| Funding-channel NTR decomposition | Aid schema specifies family/federal/PLUS/private/institutional; exposure above the July-2026 caps is the sector's most time-sensitive number | **ADOPTED 2026-07-03 into arc B**: channel column in exposure once extract lands |
| Policy-shock scenario paths | PLUS-cap and international-shock as labeled paths beside cliff/northeast (international currently appears nowhere in the plan) | **ADOPTED 2026-07-03 into arc B**: two labeled entering paths + hazard/entering adjustments |
| Distribution outputs | Totals hide the student-level story: terms-completed, debt-at-exit, cost-per-graduate distributions — the "20% of borrowers ≥$50k" genre | **ADOPTED 2026-07-03 into arc C**: simulate paths in twin v1 (its natural home) |
| GitHub Actions CI | make test + make check-docs on push, so the checks run without manual invocation | **SHIPPED 2026-07-06 (arc D):** `.github/workflows/ci.yml` (arms when a GitHub remote exists — none is configured today; recorded in ROADMAP) |
| NTR rate-as-input refactor | User's own reframe: NTR/student is a near-public, predictably-escalating price — estimate less, parameterize more (anchor + escalator knob) vs estimating avg_ntr from panel | knob in revenue.py; principle recorded in STANDARDS.md |
| Calendar-walk + fit-path adoption sweep | Stage D's simplification pass gave the per-school calendar walk and the certified fit path single owners (`panel.school_frames`, `hazard.fit_at`) and adopted them in panel/backtest/ledger — but ~10 hand-rolled copies remain (kpi, scenario, revenue, vintage, baseline), and eight CLI `main()`s still call bare `pd.read_csv` (a `panel.load_enrollment` = read + gate would also cover library paths like `ledger.score` that never hit `build_panel`) | **DEFERRED to arc B** (its `build_panel`-at-scale work is the natural slot): adopt module-by-module as touched |

## Presentation & audience decisions

Primary audience: GitHub-native reviewers (README is the artifact).
Secondary: committee-style readers who never open GitHub — the
proposal was a *derived* `index.qmd` in this repo rendering the README
plus the cone figure (one source of truth, optional rendering; the old
foundation site stays retired because a second narrative surface is a
provenance liability — the `_site/` drift lesson). No slide-deck
output was ever proposed; the report PDF is the cabinet-facing form.
Equity-cuts-as-default was the one audience-research finding that
shaped no artifact (see above).

## Orphans (RESOLVED 2026-07-04 — both adopted, none deleted)

`hazard.persistence_curve` — adopted by `make diagnostics` (survival
view, §5 of the artifact), with tests. `project.project_headcount` —
adopted by `vintage.py` as the entry-priced expectation engine, with
tests. The adopt-or-delete rule was satisfied by adoption in both
cases; nothing was deleted.

## Known-unqualified claims

"Beats chain-ladder 3x" is a **headcount** result; no revenue
head-to-head exists (the original's revenue method — headcount ×
cohort avg-NTR post-hoc — would eat the survivor-mix drift, so the
revenue gap is plausibly wider, but this is argued, not measured).
Superseded rather than built: see STANDARDS.md on NTR as a
near-public rate.

## Stage3 notebook harvest (2026-07-09)

The archived source notebooks (kept privately, not in this repo; the pre-rebuild
originals) were repaired, executed end-to-end, and reviewed on
2026-07-09; the full plain-text review lives beside them in
`_private/`. Six candidates surfaced; their dispositions:

| item | rationale | disposition |
|----|----|----|
| Anomaly-term censoring | the originals excluded the COVID terms from ratio averaging; the repo had no way to say "ignore these terms when fitting", and real data will demand one | **SHIPPED 2026-07-09** (decided at the same-day review): `exclude_terms` on `count_transitions`/`fit_at` (conservation always checked on unfiltered counts), `--exclude-terms` on the backtest CLI |
| Hidden-knob exposure | `persistence_bump` and `prior_strength` existed as function arguments only — customization the CLI never offered | **SHIPPED 2026-07-09** (decided at the same-day review): `--persistence-bump` (scenario), `--prior-strength` (backtest) |
| Region/program display cuts | the originals segment roughly 5x finer (region x program x enrollment type); estimation `BY`s are ruling-protected, so any adoption is display-level | **DEFERRED** — a report-grammar change; needs its own decision |
| School-effect planted lift | the source generator variant carries a x0.92 school retention multiplier and 0.94 decay the repo's generator lacks | **ADOPTED 2026-07-09 into arc B** as planted-lift candidates for generator v2 |
| Scenario what-if control | a precomputed `run_scenario` grid could drive a client-side slider on the existing scenario page — an enhancement of the one surface, not a second one | **DEFERRED post-publish** — design decision |
| Business-impact claims | the originals assert 70%→90%+ planning accuracy and 40→2 hrs/month reporting; unverifiable past-employment claims | **DROPPED for tracked docs** (no claim without a test); available off-repo |
