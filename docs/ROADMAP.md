# Roadmap / Re-entry

Written for a future maintainer returning after months away. Read this and run `make test` to re-orient. Last updated: 2026-07-07.

## Where everything is

| thing | location |
|----|----|
| Start here if you are new | `docs/HANDOFF.md` (orientation + Stage A definition of done) |
| Current task | Stage B ("The build arc" below); publication landed 2026-07-13 — see the publication record |
| The model (chain, hazards, intervals) | `src/persistence/` — README's code table maps it |
| Proof it works | `make test` (141 tests), `make backtest`, `make compare` |
| CI (guards on every push) | `.github/workflows/ci.yml` — `make test` + `make check-docs` |
| Fit-quality audit page | `make diagnostics` → `build/diagnostics.md` (report-only; does not fail the build) |
| Forecast register + its scoring | `data/forecast_ledger.csv` ← `make ledger` (append-only; scored at read time; report §9) |
| External reference inputs | `data/reference/` (WICHE 11th-ed graduate series, date-stamped) |
| Institution-native report | `make report` → `build/report.{qmd,html}` (`.pdf` with LaTeX) (`kpi.py` computes, `report.py` arranges) |
| Canonical data + its generator | `data/synthetic_enrollment.csv` ← `make data` (byte-exact, md5-tested) |
| What "enrolled" means upstream | `docs/STAGE1_CONTRACT.md` |
| How outputs map to IR standards | `docs/STANDARDS.md` (IPEDS / HEOA / NACUBO / Common Data Set) |
| Why every design choice was made | `docs/DESIGN_NOTES.md` (incl. audit record of fixed defects) |
| Aid-side schema (design by example) | `data/aid_schema/` + its README |
| Dropped/deferred ideas + their rationale | `docs/CUTTING_ROOM.md` (continuity register) |
| Private originals (NOT published) | `_private/` — original R scripts, a Tableau workbook and an old workbench, kept on the author's machine only. Gitignored; contains institutional paths and servers. |

## State of play

Done and verified: two-state Markov persistence model; Monte Carlo predictive intervals; beats chain-ladder on headcount, 2.4% vs 7.3% mean total error (the direction of the win is test-enforced, not the margin); NTR projection with survivor-drift mitigation; entering-class scenarios to 2030; season conditioning for real data; full provenance chain (generator reproduces the dataset exactly in the pinned environment); institution-native standing report (`make report`) with a fixed grammar — IPEDS+model KPIs (aid-band + entry-season cuts as display defaults), backward driver decomposition, churn ledger, aid-band exposure, vintage alpha, risk-cell catalog, cycle timing, scenarios with the retention-ceiling comparison, and a worked-example interpretation slot.

**Stage A shipped 2026-07-04.** All items of the HANDOFF definition of done landed: the three report sections (vintage alpha adopts `project_headcount`), retention ceiling, disaggregation defaults, the WICHE series as a versioned `data/reference/` input, and `make diagnostics` (adopts `persistence_curve` — both orphans now have consumers). Contact with reality amended the plan in three recorded ways: (1) the *published* WICHE 11th-edition series is milder through 2030 than the hand-set constants it replaced (annualized off the 2025 peak, national ≈ −1.1%/yr and Northeast ≈ −1.6%/yr vs the old −1.5/−3.5) — README scenario figures trued in the same commit; the ruling-5 ceiling comparison keeps the literal −1.5%/yr path; (2) vintage expectations beyond a cohort's entry-time data frontier price to zero (the projection layer's audited conservative missing-cell default), which inflates early vintages' positive rate alpha — exposed as a `priced_through` column and labeled in the report rather than smoothed over; (3) the generator's exit-is-permanent design means O→E rows never materialize on synthetic data, so the diagnostics hazard page is E→E only there (stated in the artifact; re-entry rows appear unasked on real data — and distinctly from the report §2 "reentrants" column, which is the fall-snapshot flow category, here exactly spring entrants reaching their first fall; the §2 prose now says so). A fourth amendment came out of the pre-commit adversarial review: ruling 3's stated rationale ("season varies across durations at a single as-of") is false — at one as-of every populated risk cell targets the as-of's successor term; the construction stands, the rationale was corrected in HANDOFF, and the report labels the column. The same review caught and fixed two latent crashes (vintage fit-window filtering on summer-entry cohorts; the stationarity table at early as-ofs with no testable cells) and made IRLS non-convergence under separation a visible status instead of a null-looking p — full record in DESIGN_NOTES "Stage A analytics".

**Stage D shipped 2026-07-06.** The forecast ledger landed as `persistence/ledger.py` + `data/forecast_ledger.csv` (`make ledger`): an append-only register, one row per (as-of, segment, horizon) carrying point, 80% interval, git SHA, and data md5. First write wins — a logged key is never rewritten, so re-runs are idempotent and scoring always faces the originally logged prediction; each row is stamped `retrospective` (target term had already arrived when logged) or `live` (logged first); scoring is derived at read time against students known at the as-of (the backtest's like-for-like rule) and never written back. Seeded retrospectively from five fall as-ofs (2020FA–2024FA, six steps, school × degree grain — 120 rows, all retrospective on this complete synthetic history). The report gained §9 "Forecast track record" (Observations/Interpretation renumbered to §10; pinned headers and cross-references trued per ruling 9). The two hardening items shipped with it: the runtime input gate (`panel.validate_enrollment`, run by every `build_panel` call) enforcing the machine-readable Stage 1 contract with a loud diff — fatal on missing/null required columns, unparseable term codes, duplicate student-terms, enrollment before cohort, unstable cohorts; informational on schema drift — and the CI workflow (`.github/workflows/ci.yml`: `make test` + `make check-docs` on every push). Contact with reality amended the record twice: (1) the seeded register's pooled interval coverage is 66% vs the README's 82% backtest claim — the seed deliberately includes 2020FA/2021FA as-ofs whose fits project beyond the durations they had seen, where missing cells price to zero (the audited conservative default, the same phenomenon Stage A exposed as `priced_through`), pulling deep-horizon expectations under actuals; §9 states the mechanism instead of trimming the early vintages out of the seed; (2) at ship time the repo had no git remote, so the CI workflow file was committed unarmed; it armed at the 2026-07-13 publication.

Standing limitation: all validation is in-family synthetic. The aid→retention relationship currently exists only as the generator's own assumption (`0.95**t`, aid multiplier 1.1) — estimating it for real requires real data.

## The build arc (committed 2026-07-03; reconciled with CUTTING_ROOM.md same day)

Chosen sequence: **A → D → B → C**. Every stage runs on current data,
ships independently, and labels in-family results as machinery
certification.

**A. Report analytics (~1 session) — SHIPPED 2026-07-04; see state of
play for the plan amendments.** Three sections into the standing
report from shipped data: *vintage alpha* — each cohort tracked against
the expectation the model would have priced at its entry, decomposed
mix-vs-rate; *risk-cell catalog* — hazard lift × prevalence ×
NTR-at-risk per segment×duration×season cell, ranked (trigger-catalog
format, behavioral columns swap in later); *cycle timing* — season
position of exits under the first-missed-term convention
(SP 36% / FA 36% / SU 28%; convention ruling in HANDOFF) and
first-term melt (22.9% never enroll a second term) as the
intervention calendar.
Adopted from the register: the *retention-ceiling* output (persistence
+1pp vs entering −1.5%/yr, in heads and $ — one kpi function, one
report sentence); disaggregation by the cuts available now (aid band,
entry season) as report defaults; the WICHE series pinned as a
versioned reference input driving scenario paths; and `make
diagnostics` (hazard tables w/ CIs + cell n, shrinkage weights,
cohort-stationarity test, coverage) — which adopts the orphan
`persistence_curve`; vintage alpha adopts `project_headcount`.
Orphans not adopted here get deleted, per the register's rule.

**D. Forecast ledger (~1 session) — SHIPPED 2026-07-06; see state of
play for the plan amendments.** Append-only prediction register
(as-of, horizon, point, interval, git SHA, data md5); each run scores
matured predictions against arrived actuals; report gains a standing
"Forecast track record" section with calibration. Seed retroactively
from historical as-ofs so it demos populated. Placed early so every
later stage's forecasts are on the record from day one. This session
also lands the two hardening items: a CI workflow (make test +
check-docs on every push) and the
runtime input gate validating any CSV against
`retention_fact_schema.csv` at the read boundary — a prerequisite for
B, which feeds generated data through `build_panel` at scale, and
C, which claims to fit from *any* panel.

**B. Generator v2 + behavioral layer (~2 sessions).** Populate the
twelve aid-schema tables at full scale, consistent with enrollment,
with *planted* behavioral lifts (late registration, credit-load drop,
balance growth, PLUS denial, packaged-late) and graduation labels.
Then: trigger catalog with lead times; the discrete-time logit
(persist ~ duration + aid-per-term via the bridge + population — turns
the 1.1 assumption into a recovered coefficient); multi-state
rehearsal (graduation vs withdrawal via `grad_flag`); PLUS-denial
natural-experiment rehearsal. Adopted from the register:
equity-cut auto-activation (`first_gen_flag`, `visa_status`,
`residency` become default disaggregations the moment the schema
populates — never fabricated onto enrollment-only data); policy-shock
scenario paths (PLUS-cap and international) beside cliff/northeast;
funding-channel NTR decomposition in schema-form, fixture-tested,
awaiting the extract for real numbers.

**C. Twin v1 (~2–3 sessions).** Join the repo's two halves: fit the
generator's parameters from any panel (`twin.py`), acceptance = the
indistinguishability suite (twin-generated data must reproduce the
standing report within tolerance; fitting to the canonical dataset
must recover the recovered generator). Then the intervention API
(parameter change → rerun → report diff) and one twin-experiment
section in the report. The old "adversarial generator" item is a twin
with hostile parameters. Ledger becomes the twin's scoring organ.
Adopted from the register: distribution outputs (terms-completed,
debt-at-exit, cost-per-graduate) fall out of the twin's simulated
paths — the natural home the tier plan predicted.

**Real-data track (parallel, gates findings only).** (1) Real extract
into the aid schema from PowerFAIDS/SIS; point `build_panel` at
pre-filter status codes (see STAGE1_CONTRACT). (2) Causal design on
arrival: PLUS denials as credit-based aid loss — and after 2026-07-01,
cap-binding as the universal treatment. Everything in A–C reruns on
real data unchanged.

Register items NOT in the arc (rationale preserved in
CUTTING_ROOM.md): revenue head-to-head baseline and the rate-as-input
refactor (superseded by the NTR-as-public-rate principle), the
committee-facing derived `index.qmd` page (post-arc polish), and
`GAP_ANALYSIS.md` persistence (subsumed by the register itself).

## Publication record (2026-07-13)

This repository is the single-commit public cut of a longer private
development history, cut 2026-07-13 for publication at
github.com/jp-87/student-persistence-model. The deliverable plan
(README pitch, log repair, language revision, Quarto site, the
squash) completed 2026-07-08 and was retired with this record; its
doc-condensing step was cut by decision; a harvest from the archived
source notebooks landed 2026-07-09. Verified at the cut: 123
tests and check-docs green, single-commit history, de-identification
token sweep clean. On push, CI reruns both guards and the publish
workflow deploys the four wrapper pages (overview, report,
diagnostics, design notes).

## Next

- Generator with planted re-entry, plus a test that the model recovers the planted rate.
- Replace the Beta(n·p + 0.5, n·(1−p) + 0.5) draw with Beta(n·p + k·p_pooled, …) so interval width reflects the prior.
- Estimate the prior strength k rather than fixing it at 50.
- Fit a multinomial logit or probit comparator on the same segments and compare backtest error.

## Rules that keep this repo honest

No output without a command that regenerates it. No claim without a test or a label saying "assumption." Anything with institutional identifiers goes to `_private/`, never tracked. `make check-docs` enforces the README's line counts, headline totals, and test count (its own and ROADMAP's); stale figures make it exit non-zero, so the manual log-repair passes don't have to recur.
