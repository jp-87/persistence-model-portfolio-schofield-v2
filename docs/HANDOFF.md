# Handoff Brief — for a fresh instance

> Build history. This is a working document from development, kept because other docs and test comments reference it. It may lag the code; the README is authoritative.

You are picking up a finished platform with a committed build plan.
Nothing here should require prior conversation context; if something
does, that is a documentation defect — record it in
`docs/CUTTING_ROOM.md` and proceed on your best reading.

## Orient (first ten minutes)

```bash
npm ci           # deterministic install from package-lock.json
npm run lint     # TypeScript typecheck (tsc --noEmit)
npm test         # full regression, mathematical property & SSR DOM suite
npm run build    # production Vite bundle build
```

> Historical note: The repository was migrated from the original Python + Quarto build pipeline (`make test`, `make check-docs`, `make report`) to a self-contained Node 22 React & TypeScript SPA. All model outputs, synthetic datasets (`data/synthetic_enrollment.csv`), forecast ledgers (`data/forecast_ledger.csv`), and WICHE reference series (`data/reference/wiche_hsgrad.csv`) are preserved and verified by `scripts/regression_test.mjs`.

Then read, in order: `docs/ROADMAP.md` (state of play + the build
arc), `docs/CUTTING_ROOM.md` (what was dropped and why), and the README
(the public claim surface). Pull deeper context only when a task touches it:
`DESIGN_NOTES.md` (every design choice + audit records),
`STAGE1_CONTRACT.md` (what the data means upstream), `STANDARDS.md`
(IR-standard mappings), `data/aid_schema/README.md` (the aid-side
schema and its analytical intent).

## Your task

> **Status: Stage A SHIPPED 2026-07-04 · Stage D SHIPPED 2026-07-06 ·
> site + publication LANDED 2026-07-13** (single-commit public cut;
> see ROADMAP "Publication record"). Current task: Stage B (ROADMAP
> "The build arc"). ROADMAP "State of play" records each shipped
> stage's contact-with-reality amendments; design records are in
> DESIGN_NOTES. The Stage A definition of done and rulings below are
> retained as the record of what Stage A means.

Build **Stage A** of the arc exactly as specified in ROADMAP ("The
build arc"), then stop and report. Definition of done:

- [ ] Vintage-alpha report section: each cohort vs the expectation the
      model would have priced at its entry; alpha decomposed
      mix-vs-rate; adopts `project_headcount` (or deletes it)
- [ ] Risk-cell catalog section: hazard lift × prevalence ×
      NTR-at-risk per segment×duration×season, ranked
- [ ] Cycle-timing section: season-of-exit distribution + first-term
      melt, per segment
- [ ] Retention-ceiling output: persistence +1pp vs entering −1.5%/yr
      compared in heads and dollars (one kpi function, one report
      sentence)
- [ ] Aid-band + entry-season disaggregation as report defaults
- [ ] WICHE series as a versioned `data/reference/` input driving
      scenario paths (replaces hand-set constants; date-stamped)
- [ ] `make diagnostics`: hazard tables with CIs and cell sizes,
      shrinkage weights, cohort-stationarity test, coverage table;
      adopts `persistence_curve` (or deletes it)
- [ ] Fixed grammar preserved: new sections slot into the standing
      report; Observations stay mechanical; 6b stays a labeled example
- [ ] Tests for every new computation; `make test` and
      `make check-docs` green; README/ROADMAP counts trued in the
      same commit that changes them

## Stage A rulings (ambiguities pre-answered — do not re-litigate)

1. **Vintage-alpha expectation** = hazards fit on an *expanding window
   as of each cohort's entry*, priced at segment grain (school ×
   degree × aid band) from the cohort's own entry composition.
   Cohorts entering before six terms of prior history are excluded
   ("insufficient prior history"), not scored against noise. "Six
   terms" = six positions on each school's own calendar, literally
   (MCM cutoff 2020FA, MCC 2021FA) — do not wall-clock-scale here. Score at
   every observed duration; report cumulative-to-date alpha in heads
   and NTR.
2. **Mix-vs-rate** = rate alpha uses the cohort's own entry mix;
   recompute expectation under the prior-cohorts-average mix; the
   difference between the two expectations is the mix term, the
   remainder is rate. "Prior-cohorts-average mix" = headcount-pooled
   entry mix over all strictly-earlier cohorts; durations pool by
   index across the two calendars.
3. **Risk cells**: lift baseline = school pool at same duration;
   prevalence = share of currently-enrolled (as-of) students in the
   cell; NTR-at-risk = cell headcount × exit hazard × that-term mean
   NTR (expected next-term loss, total not excess); season = calendar
   season of the transition target; rank by NTR-at-risk. Construction:
   cells are entry-season × duration, which fixes each cell's target
   season deterministically per school calendar. *(Rationale corrected
   in the Stage A adversarial review: at a single as-of every populated
   cell necessarily targets the as-of's successor term, so the target
   season is constant there — entry season is the dimension that stays
   non-degenerate, and season effects are identified by the
   season-conditioned fit over the full history, not by the as-of
   catalog. The construction stands as ruled.)* Hazards
   from the season-conditioned fit; segment grain = school × degree ×
   aid band, same as ruling 1.
4. **Exit-term convention, repo-wide**: an exit is attributed to the
   first *missed* term (matches `churn_ledger`). ROADMAP's
   cycle-timing figures are stated under this convention.
5. **Ceiling**: add +1pp to post-shrinkage E→E at all durations
   (clip ≤1), O→E untouched; compare against flat baseline at 2030FA
   and cumulative 2026–2030 (fall terms), both heads and $, beside the
   entering −1.5%/yr path. The +1pp applies to pooled fallback rates
   too, else deep durations dodge the ceiling.
6. **Disaggregation** is display-level only (report tables cut by aid
   band and entry season as marginals); the estimation segmentation
   constants (kpi/scenario/revenue `BY`s) stay untouched — they
   protect test-enforced results. Scope: KPI §1 gains the two marginal
   tables; the new Stage A sections carry both cuts.
7. **WICHE**: fetch the published 11th-edition series if network
   allows (national → cliff; Northeast → northeast). If not, derive
   from the documented summary and label the file "derived from WICHE
   summary — replace with published series"; the assumption-label rule
   makes this acceptable. `run_scenario` may grow a per-year factor
   series; keep annualization matching −1.5/−3.5 so the printed
   scenario tables stay true, or true README + the 6b example in the
   same commit.
8. **Stationarity diagnostic**: per (segment, duration) logistic trend
   of persistence on cohort index; report z, p, and the BH-adjusted
   share of significant cells in `build/diagnostics.md`. Report-only —
   it flags, it does not fail the build. Hand-roll the logistic trend
   in numpy (IRLS + Wald z, BH adjustment); add no dependencies.
9. **Layout**: new sections insert after exposure, before scenarios;
   renumbering is allowed but prose cross-references to section
   numbers (docs + 6b example) must be trued in the same commit —
   check-docs does NOT catch those, and `make test` pins the report's
   section headers (tests/test_kpi.py) — true them with any renumber;
   read "6b" as "the interpretation subsection" wherever numbers
   shift.

## House rules (non-negotiable)

No output without a command that regenerates it. No claim without a
test or an explicit "assumption" label. In-family synthetic results
are machinery certification, never findings — say so where they
appear. Institutional identifiers go to `_private/` (gitignored),
never tracked. Run `make check-docs` after any code change — stale line
counts, headline totals, and test counts fail the build.
Reader-facing prose keeps a reserved register: each fact and caveat
stated once, in its canonical place (README limitations; the report
scope note), without rhetorical antithesis; error messages are
exempt. Before declaring a stage done, have a fresh-clone subagent
adversarially review it (the standard is set by the audit records in
DESIGN_NOTES). Commits: imperative summary, what-and-why, guards
green first.

## Known traps (each one cost a real defect)

- Term codes sort wrong as strings (`"2023FA" < "2023SP"`); always
  compare via `terms.position()` on the right calendar.
- A module without a `__main__` guard makes `python -m` a silent
  no-op with exit 0 — and the guard must sit after module-level
  template definitions.
- Piping a make target into `tail`/`grep` masks its exit code.
- MCC has no summer terms (`panel.DEFAULT_SCHOOL_CALENDAR`); positions
  advance 3/year with summer, 2/year without — scale lookbacks
  accordingly.
- The 10b EXAMPLE block (the interpretation subsection) is
  illustrative: only `{as_of}` and the churn
  total inject; its other figures are hand-written and labeled.
- The synthetic data is generated inside the model family (see
  ROADMAP's standing limitation) — backtests certify implementations.

## After Stage A

The arc continues D → B → C (ROADMAP); D shipped 2026-07-06. Do not
start the next stage without checking whether the prior stage's
contact with reality amended the plan; if it did, update ROADMAP and
the register in the same commit.
