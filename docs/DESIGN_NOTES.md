# Design Notes

This document records the reasoning behind the design choices the README summarizes. It covers the model, the estimation and uncertainty machinery, the backtest and baseline designs, seasonality, data provenance, and the full risk register. The companion [STAGE1_CONTRACT.md](STAGE1_CONTRACT.md) records what the data means upstream.

## The model

Each student occupies one of two observable states per academic term: **ENROLLED** (a record exists) or **OUT** (no record). OUT is not absorbing — students stop out and return, and the chain observes the return as an `O -> E` transition. "Exited" is a label applied after the fact (out at the end of the observation window), not a modeling assumption. Students still enrolled at the horizon are right-censored: no exit event is imputed for them.

Chain-ladder cohort retention — the standard spreadsheet method, and the method of this model's predecessor — is the special case of this chain with re-entry forced to zero. The relationship is exact: the old method's fall-from-spring "offset" ratio is the two-step Chapman-Kolmogorov transition marginalizing over the summer state.

Two pieces of domain knowledge are encoded as data: the academic calendar (SU -\> FA -\> SP, spring belonging to the prior academic year) in `terms.py`, and per-school calendar rules (MCC runs no summer terms) in `panel.DEFAULT_SCHOOL_CALENDAR`. A school without a declared rule raises an error rather than inheriting a default.

## Estimation

Transition probabilities are estimated per segment (school x degree) and duration since cohort entry, then shrunk toward school-level rates with an empirical-Bayes blend:

```         
p_hat = (n * p_segment + k * p_pooled) / (n + k)
```

— the posterior mean of a Beta-Binomial with prior strength `k` (default 50). Thin segments stay in the model instead of being discarded (the predecessor truncated to the five largest segments, `TOP_N = 5`). Cells with no segment estimate at all fall back explicitly to the school-pooled rate, and only then to a declared zero (an audit found the original implementation silently zeroing \~40% of deep-duration lookups).

## Uncertainty

Intervals are predictive, combining parameter risk and process risk. Parameter risk: each bootstrap draw samples one set of transition probabilities per duration from Beta posteriors (Jeffreys prior), shared by every cohort in a segment, since cohorts share the same estimates. Process risk: within a draw, counts evolve as binomial realizations — of `e` enrolled, `Binomial(e, p_EE)` persist — because actual headcount is a realization, not an expectation. Segment intervals are quantiles of the summed simulated totals.

Audit record: the first implementation had three defects. It summed per-cohort quantiles across cohorts (quantiles are not additive); it drew parameters independently per cohort (understating shared parameter risk); and it omitted process noise entirely. Fixing the first two alone dropped measured coverage of the nominal 80% interval to 0–50% — exposing the third defect, which the accidental width of the first implementation had masked. With all three fixed, coverage averages \~82% across the twenty backtest cells.

## Backtest design

Fit on data truncated at an as-of term, project forward, score against held-out terms. The comparison is like-for-like: only students already observed at the as-of date count on both sides, because future incoming cohorts are a planning assumption, not a model output. Total headcount error stays under \~7% through four terms ahead across five windows (2022FA–2024FA) and degrades beyond five terms, where actual counts are small and `seg_mape` is dominated by near-zero denominators.

## The chain-ladder baseline

`baseline.py` reconstructs the predecessor method faithfully: cohort x duration triangles per segment, within-cohort-column ratios (its censoring handling, which was correct and is preserved), the fall-from-spring offset rule, unweighted averaging of ratios across cohorts, no pooling, no re-entry, no uncertainty, and missing ratios silently killing a cohort — preserved so the comparison measures the method as it was. On identical windows the Markov model averages 2.4% total error vs 7.3% (18/20 cells); the gap is pure estimation discipline — exposure weighting and shrinkage versus unweighted thin-cell ratios — since this data contains no re-entry for the new structure to exploit. `tests/test_baseline.py` enforces the direction of the result.

## Revenue

The original notebooks attached each cohort's mean NTR to its projected headcount; `revenue.py` reimplements that layer against the chain, with the unit economics from Stage 1 (`ntr = tuition + comp_fee - institutional_grant`). Mean NTR enters the projection as a per-(segment, cohort) weight *inside* the bootstrap draws, so revenue intervals aggregate correctly rather than being scaled after the fact.

The revenue backtest exposed a real modeling fact: with school x degree segments, projected NTR ran systematically high — +1.5% one term out, growing to +11–12% at four terms (by window). That is survivor-mix drift: aided (low-NTR) students retain better, so the surviving revenue base erodes faster than headcount, and a horizon-mix mean over-weights high-NTR students who are more likely to leave. Conditioning the segmentation on aid band (`discount_description`, the default in `revenue.py`) lets each band carry its own retention and its own weight; four-term total error drops to \~6% and interval coverage returns to \~80%. The bias follows from the aid-retention correlation documented in STAGE1_CONTRACT.md; the backtest measured it, and aid-band segmentation mitigates it. Disaggregating outcomes by aid is itself the federally-standard view (HEOA grad/retention by federal aid group); the report uses institutional discount bands as the available proxy, with the exact HEOA cut reachable on real data via the aid schema. See `STANDARDS.md`.

## Scenarios and the 2026–2030 demographic cliff

The model's scope ends at existing students; future entering classes enter as scenario assumptions. WICHE's *Knocking at the College Door* (11th ed., Dec 2024) projects U.S. high school graduates peaking in 2025 at \~3.9M and declining \~5.5% through 2030 and \~13% by 2041, with the Northeast among the steepest regional declines (\~7.6% through 2030) — figures per the series now pinned in `data/reference/wiche_hsgrad.csv`. NACUBO's tuition discounting study puts the 2025–26 first-time discount rate at a record \~57%, with real net tuition revenue per student declining year over year. Fewer entrants at lower net revenue per entrant is the compounding risk.

`scenario.py` injects future entering cohorts as labeled assumptions: a size path, and an NTR drift on entering classes (default −1%/yr real, modeling discount creep). Since Stage A (2026-07-04) the cliff and northeast paths are driven by the *published* WICHE 11th-edition graduate series — national and Northeast respectively — pinned with provenance in `data/reference/wiche_hsgrad.csv`; each future entering class is scaled by its graduating class's size relative to the mean of the recent classes the entering baseline was averaged over (same lookback, so anchor and baseline mean the same thing). The published series is milder through 2030 than the −1.5/−3.5%/yr constants it replaced (annualized off the 2025 peak: national ≈ −1.1%/yr, Northeast ≈ −1.6%/yr), and briefly *above* the anchor for the classes of 2025–26 — so the printed tables show the cliff path starting above flat. A plain float `entering_change` (annual rate, compounding) remains supported for hand-set paths. Entrants start at duration 0 and evolve through the same fitted hazards, shrinkage, and binomial process noise as observed students (`project_segment_headcount(entrants=...)`). Persistence is estimated; recruitment is assumed; the output labels the two separately. By 2028 most projected headcount is assumption-driven, and the table reports the split.

## Seasonality

Real enrollment is a saw-tooth: fall-to-spring attrition (including mid-year graduates), a spring-to-summer cliff, a summer-to-fall return. Duration-only hazards mis-specify this because cohorts enter in different seasons — duration 2 from a fall cohort lands on summer; duration 2 from a spring cohort lands on fall — so pooling mixes the summer cliff into ordinary fall transitions. `--season` (`season_conditioned=True`) adds entry season to the segmentation; within school x entry season, duration determines every term's calendar season, recovering season-specific rates with no change to the machinery. On the synthetic data both configurations produce near-identical total error (within ~2pp at four terms; season-conditioned cells are thinner and slightly noisier), because the generator carries almost no behavioral seasonality — synthetic students enroll every consecutive term including summers. On real data, season-conditioned is the correct configuration.

## Data provenance

The canonical dataset was created on 2025-10-07 by a seeded generator originally embedded as a fallback branch in the source analysis notebook; it ran once when the file it expected was absent, and everything since descends from that execution. The generator is preserved in `generate.py` — its RNG call sequence must not be reordered — and regenerating with seed 42 reproduces `data/synthetic_enrollment.csv` byte-for-byte (md5 `a8ba9a1f20e608b22eb90a622c0b6d05`, enforced by a test).

**De-identification relabel (2026-07-07).** The categorical labels were fictionalized: school codes became `MCM`/`MCC` (Millbury College of Music, the larger school on the FA/SU/SP calendar; Millbury Conservatory on FA/SP — fictional institutions), three region names became `In-State`/`International`/`Out-of-State` (`Online` kept byte-identical: it carries a retention multiplier in the generator), and two program names became `Songwriting`/`Composition`. The institutional structure is modeled on a real institution the author previously worked for; all names, codes, and student data are fictional or synthetic. Every relabel swaps the string an index-based draw maps to, so no random call and no arithmetic changed; the new codes preserve the old alphabetical order, so every sort-dependent output is unchanged too. Proof, run at the relabel: the relabeled dataset maps back to the pre-relabel md5 (`4015ad90660652f77ba5afe5b9b3ac5b`) byte-for-byte under reverse substitution. The forecast ledger was migrated in place (school labels and `data_md5` restamped; values, dates, and `git_sha` untouched — recorded in the file's header) and the regeneration test re-proves value-identity on every run. The relabel was applied retroactively throughout the working tree, including dated design and audit records in this file and HANDOFF — records dated before 2026-07-07 therefore speak the fictional codes anachronistically. The development history predates this public cut and is retired to a private archive; it carries the original labels.

**Style pass (2026-07-08).** Reader-facing prose repo-wide was moved to a reserved register; dated records in this file were trimmed for style only — every finding, figure, and date is unchanged.

The generator also documents the data's structure: geometric retention decay (`0.95 ** t`), permanent exit, duration-only hazards, no behavioral seasonality. The data is therefore *inside* the model family of both the old and new methods (risk register item 1).

## Report layer (QA record, 2026-07-01)

Three defects found when the standing report was first exercised
end-to-end, all fixed and regression-guarded:

1. **`make report` was a silent no-op.** `report.py` had no
   `__main__` guard, so `python -m persistence.report` imported the
   module, did nothing, and exited 0 — the artifact had not actually
   regenerated since it was first built. A test now asserts the guard
   exists and sits after the template definition (the naive fix placed
   it before, which raises NameError).
2. **`ntr_exposure` accepted `as_of` and ignored it**, reporting
   all-history revenue shares that read like annual figures. Now
   anchored to the reference term, consistent with the KPI page.
3. **The churn ledger had no ledger** — prose and figure, no table.
   The most recent eight terms now print.

The interpretation subsection (6b at the time of this record; 10b
since the Stage A and D renumberings) ships with a clearly-labeled worked EXAMPLE
interpretation for the synthetic cycle; two anchors ({as_of},
cumulative churn) are format-injected; the remaining figures are
hand-written against this cycle and are illustrative by label, not
self-updating. The engine still never writes it.

## Stage A analytics (design record, 2026-07-04)

Choices a reviewer would otherwise have to reverse-engineer:

1. **Vintage frontier labeling.** A vintage's expectation beyond the
   deepest duration any prior cohort had reached at its entry prices to
   zero — the projection layer's audited conservative missing-cell
   default (the model would have declined to quote
   there). Exposed as `priced_through` and labeled in the report; not
   smoothed, not carried forward.
2. **Vintage engines.** The entry-priced expectation comes from
   `project_headcount` (orphan adopted); the average-mix counterfactual
   chains unit survival through the same `_resolve` fallback rules, so
   the two agree by linearity — the toy-fixture test pins the arithmetic
   end to end with `prior_strength=0`.
3. **Risk-cell frontier cells** (deepest observed duration, no fitted
   rate at either segment or pool level) are excluded from the ranking
   and counted in a footnote, never priced by guess.
4. **Melt and censoring.** First-term melt conditions on entrants whose
   second term was observable (`entry < horizon` on the school's own
   calendar); horizon entrants are censored, not melted.
5. **Ceiling bump semantics.** `persistence_bump` adds to post-shrinkage
   E→E *and* the pooled fallback rates (clipped at 1), so deep durations
   that resolve through the pool cannot dodge the ceiling; O→E untouched;
   cells absent at both levels keep the conservative zero. The comparison
   keeps the literal −1.5%/yr entering path from the ruling even though
   the named cliff path is now WICHE-driven.
6. **Undefined rates display as dashes.** IPEDS retention on a cut with
   no first-time fall entrants (the spring entry-season marginal) is NaN
   → "–", never 0.0 — a zero rate is a claim, a dash is an absence.
7. **Stationarity nulls.** The cohort-trend diagnostic (numpy IRLS +
   Wald z + BH) finds zero significant cells on the generator's data —
   pinned by test, because the generator has no cohort drift by
   construction and a diagnostic that "finds" drift there is broken.

Adversarial review record (2026-07-04, pre-commit, five independent
lenses + per-finding refutation; 8 raised, 2 refuted, 6 fixed):

- **Vintage fit-window crash on summer-entry cohorts** — the
  expanding-window filter evaluated the cohort code on *every*
  school's calendar; a MCM `…SU` cohort past the cutoff crashed
  `position()` on MCC's no-summer calendar. Unreachable on the pinned
  data (FA/SP cohorts only), fatal on real MCM data. Fixed by
  filtering to hosting schools (whose cells are the only ones read);
  regression test with a planted SU cohort.
- **Stationarity crash when no cell is testable** — an early `--as-of`
  (e.g. 2019FA) skipped every cell, and the BH indexing then raised
  KeyError instead of writing a table of skipped rows, violating the
  "flags, never fails" contract. Fixed with column reindexing + an
  any-tested guard; regression test at 2019FA.
- **IRLS separation reported as a null** — a perfect monotone cohort
  collapse (100%→50%→0%) does not converge; the Wald SE outruns the
  slope (Hauck-Donner) and the old code printed p≈0.9997, hiding
  exactly the drift the diagnostic exists to catch. Non-convergence is
  now its own visible status, excluded from the BH pool; tested.
- Two stale "~7% through 2030" WICHE claims (scenario.py docstring,
  this file) trued to the pinned series; ruling 3's "non-degenerate at
  a single as-of" rationale corrected in HANDOFF; the report §2
  re-entrants column disambiguated from the chain's O→E in prose.

Second, fresh-context review record (2026-07-06, post-commit, six
lenses with no session context + per-finding refutation; 16 raised, 4
refuted, 12 fixed). The three reproduction lenses — independent
numerical recomputation (including a from-scratch reimplementation of
the vintage expectation), commit-message claim verification, and repo
hygiene — found nothing. The confirmed findings:

- **Report §2's first row was fabricated** (pre-Stage-A defect): the
  drivers window was hard-coded to start 2019FA and printed that fall
  as genesis (0 opening / 2,517 new) when the data starts 2018FA — the
  true flows are 902 opening / 1,337 new / 721 re-entrants / 443 lost.
  The window now derives from the data and the seed fall emits no row
  (unknowable flows are omitted, not invented); the 9b EXAMPLE's
  hand-written claims were re-checked and survive.
- **Diagnostics §3 promised a per-cell status the table dropped** —
  the status column now renders, and the artifact test pins it.
- A mutation-testing sweep found six coverage gaps where plausible
  bugs survived all tests: the target-season test was tautological
  (now pinned to hand-computed literals); risk-cell lift had no oracle
  (now pinned against an independent refit, pool-fallback cells pinned
  at lift 1.0); the ceiling bump's magnitude and pooled-column clause
  were behaviorally invisible (extracted to `_bump_ee`, unit-pinned —
  the pooled clause is inert at the scenario grain BY=school and kept
  for finer grains, now stated in its docstring); the WICHE anchor
  fixture's equal values couldn't distinguish lookbacks (now 90/100/
  110); the vintage toy's single prior cohort made headcount pooling
  indistinguishable from cohort averaging (second history cohort with
  different total/mix/NTR added, all rates still hand-computable);
  nothing pinned that default vintage pricing actually shrinks, nor
  that stationarity orders cohorts chronologically (both now tested —
  the latter with season-interleaved cohorts that string-sorting
  scrambles, known trap #1).
- Register hygiene: the 18-finding index cited sources STANDARDS.md
  does not contain (now an honest provenance note), and five items
  ROADMAP adopted into arcs D/B/C still sat under "Dropped" (now
  annotated ADOPTED); the §6 "prev %" column got its missing
  definition.

## Stage D: forecast ledger, input gate, CI (design record, 2026-07-06)

Choices a reviewer would otherwise have to reverse-engineer:

1.  **Append-only means append-only.** New ledger rows are appended to
    `data/forecast_ledger.csv`; bytes already written are never touched
    (the writer opens in append mode — it cannot rewrite). The natural
    key is (as_of, school, degree, steps_ahead) and *first write wins*:
    re-running `make ledger` appends nothing for keys already logged,
    which makes the command idempotent and keeps the tracked file
    stable across machines whose git SHA / date stamps differ.
2.  **Mode is stamped per row at logging time.** `retrospective` = the
    row's target term had already arrived in the data when logged;
    `live` = logged before its outcome existed. On the complete
    synthetic history every seeded row is retrospective, and the report
    section says so — a seeded backtest is machinery certification and
    must never read as a live track record.
3.  **Scoring is derived, never stored.** A row matures when its target
    term is at or before the school's data frontier (the last term with
    any enrollment row on that school's own calendar — from the fact
    table alone, a genuinely-zero term beyond the frontier cannot be
    told apart from data that has not landed, so it stays pending).
    Matured rows score against actual headcount among students already
    observed at the as-of — the backtest's like-for-like rule, pinned
    equal to `run_backtest`'s actuals by test.
4.  **Explicit target terms.** `steps_ahead` counts positions on each
    school's own calendar (MCM 3/year, MCC 2/year), so the same step
    lands on different wall-clock terms; every row carries
    `target_term` so no consumer ever re-derives it wrong.
5.  **The seed is five fall cycles, early ones included.** 2020FA–2024FA
    × 6 steps at school × degree grain. The early as-ofs project beyond
    the durations their fits had seen, where missing cells price to
    zero (the audited conservative default; Stage A's `priced_through`
    phenomenon) — pooled coverage lands at 66% vs nominal 80% and deep
    horizons under-predict. Kept and labeled in report §9: trimming the
    uncomfortable vintages out of the seed would be curating the track
    record it exists to prevent.
6.  **Gate severity split.** Fatal = what corrupts silently downstream:
    missing/null required columns (`REQUIRED` + requested segment
    columns), unparseable term codes, duplicate (student, term) rows,
    enrollment before the cohort term, more than one cohort per
    student. Informational = the schema contract diff
    (declared-but-absent, present-but-undeclared), printed with every
    failure and exposed as `contract_diff`. Segment-attribute stability
    is *not* gated: `build_panel` attributes by first row
    (entry attribution), and real aid bands legitimately vary
    across terms.
7.  **The gate runs on every `build_panel` call** and is kept cheap for
    it (unique-value term parsing, vectorized checks — milliseconds on
    the 55k-row canonical file), so no caller is tempted to bypass it.

Adversarial review record (2026-07-06, pre-commit, three fresh-context
lenses — independent numerical recomputation of the ledger, gate
contract attack, docs-claims verification — each with per-finding
refutation; ~55 attacks run, 20 findings survived the reviewers' own
refutation passes, 17 fixed in the same change set, 3 converted to
documented limitations). The numerics lens verified every seeded
actual, target term, and §9 figure against fully independent
recomputation (0 of 152 mismatches) and could not break the
append-only byte discipline. The confirmed findings:

- **Entry attribution depended on CSV row order** — `build_panel` took
  segment attributes from the first *file* row and `kpi._first_row_attrs`
  did the same, so on real data (where aid band varies across terms) the
  panel would silently change with sort order. Both now attribute by the
  earliest term; regression test shuffles the rows.
- **Write-path integrity holes in the ledger**: duplicate keys inside
  one predictions frame slid past first-write-wins and double-counted
  forever (now refused on write, and a corrupted register is refused on
  read); an as-of beyond a school's data frontier logged phantom
  zero forecasts stamped `live` (now refused: past the frontier,
  not-yet-arrived terms would read as exits); a summer as-of crashed
  three layers down on MCC's calendar (now a loud, early, explained
  refusal); `score()` crashed on the day-one empty register (now
  returns the empty scored frame the CLI/report already expected).
- **Silent drops in the panel**: summer rows at a no-summer school
  were filtered, not rejected (a MCC SU-only student vanished; the
  calendar comment even claimed rejection — now it raises, truly);
  enrollment beyond the `max_duration` cap was discarded, leaving
  all-OUT trajectories (a `1900FA` sentinel cohort produced pure
  exit mass with no error — now it raises). *Watch item for the
  real-data track*: legitimately old cohorts of continuing students
  will trip this raise on a windowed extract — recode their cohorts
  or raise the cap; the raise converts a silent corruption into that
  decision.
- **Gate error-path defects**: whitespace-padded term codes parsed
  (parse_term strips) but broke every exact-match comparison
  downstream — one padded row double-counted in §1 and vanished from
  §4 simultaneously (now fatal); a missing schema file threw
  FileNotFoundError *instead of* the violation list (informational
  preempting fatal — now caught); one unrelated problem masked the
  cohort checks (masking now scoped to the columns a check depends
  on); the bad-code list truncated at five with no indicator.
- **Messaging and claims**: the nothing-matured CLI printed a literal
  `<NA>` coverage and a retrospective disclaimer on an all-live
  register (both surfaces now enumerate the three mode states); a
  stale "9b" cross-reference survived the renumbering; the docs'
  present-tense "committed register" claim was enforced by nothing —
  the regeneration test's existence guard becomes unconditional in
  the seed commit, turning the claim into a fail-claim.
- Recorded, not fixed: whitespace-only or dtype-mixed `student_id`
  values pass the gate (unreachable via `read_csv`; programmatic
  callers only); the p10/p90 digits are 200-draw MC estimates that
  vary with the `steps` of the producing call (documented — points
  are deterministic); `git_sha`'s `+dirty` reflects tracked
  modifications only (documented).

Simplification pass (2026-07-07, four lenses — reuse, simplification,
efficiency, altitude — on the Stage D diff; measured before fixed):
the per-school calendar walk got its single owner,
`panel.school_frames` (unique-code position maps, and the loud
summer-row policy lives there instead of being answered differently at
two depths); the certified fit path got `hazard.fit_at`, so "the
backtest's fit path exactly" in the ledger is structural, not prose;
scoring has one definition (`backtest.add_scores`, and `track_record`
is `summarize` plus a count); the arrived/matured predicate is one
function (`ledger._arrived`). Measured wins: `build_panel`'s
order-independence via one stable sort instead of per-student `idxmin`
(the idxmin form had added ~20% to every panel build), a no-op
`make ledger` skips fully-logged cycles (4.7s → 0.4s, byte-identical
register), per-row regex term parsing replaced by unique-code dict
maps on the ledger and kpi entry-attribution paths, and the CI
workflow gained a concurrency group (stacked pushes cancel; push-only
triggers so PR branches don't run the suite twice). The remaining
hand-rolled calendar-walk copies and a `panel.load_enrollment` reader
are recorded in CUTTING_ROOM, deferred to arc B.

## Risk register

Open, in rough priority order:

1.  **Synthetic circularity.** All validation is against data the model family generated. The decisive test is real pre-filter data or an adversarial generator (stop-outs, cohort drift, period shocks).
2.  **Exit conflates graduation and withdrawal.** The upstream source carries \~six status codes, dropped by a Stage 1 filter before the fact table is written (see STAGE1_CONTRACT.md). The multi-state extension needs one relaxed upstream line, not new data.
3.  **Cross-cohort stationarity** is assumed when pooling hazards across cohorts. Since Stage A it is falsifiable: `make diagnostics` runs a per-(segment, duration) logistic cohort trend with BH adjustment (report-only; it does not fail the build). The assumption remains a risk on real data; the diagnostic is how it gets caught.
4.  **Horizon decay.** Point accuracy degrades past five terms; treat long-horizon output as scenario input, not forecast.
5.  **Interval approximations.** Parameter draws are independent across durations; the duration-20 cap mis-indexes very old cohorts (zero students affected in tested windows).
6.  **Scope.** Existing students only; incoming cohorts belong in scenario inputs.
