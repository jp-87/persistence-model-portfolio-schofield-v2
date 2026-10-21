# Standards & Definitions

Every figure this model reports maps to a recognized institutional-research
standard. This document records the mapping so the numbers are legible to an
IR office, a provost's dashboard, or an accreditor. The
*definitions* here are the real federal/sector standards; the *values* in this
repo are synthetic and illustrative (see `STAGE1_CONTRACT.md`).

The standard KPI taxonomy a campus IR office publishes — e.g. Missouri State's
five areas: **Enrollment, Persistence, Retention, Graduation/Transfer, Degree
Completions**, used "for budgeting, setting priorities and developing policies"
— is the frame this report is built to fit. *Persistence* and
*Retention* are distinct standard categories, and the model reports them
separately.

## Model output → standard

| Model output (`kpi.py` / report) | Institution-native standard | Definition / source |
|---|---|---|
| Headcount, entering classes | **IPEDS** Fall & 12-month Enrollment; MSU "Enrollment" KPI | Federal enrollment counts; first-time / transfer / continuing categories |
| IPEDS fall-to-fall retention | **IPEDS** Fall Enrollment retention rate; MSU "Retention" KPI | First-time, full-time cohort enrolled the following fall |
| Model one-term persistence | MSU "Persistence" KPI | Term-to-term continued enrollment — distinct from annual retention |
| NTR per student, discount rate | **NACUBO** Tuition Discounting Study; **IPEDS** SFA; **Common Data Set** §H | Institutional grant aid ÷ gross tuition & fee revenue; avg institutional grant |
| Net tuition revenue (projection) | **IPEDS** Finance component | Tuition & fees revenue net of institutional grant aid |
| Churn ledger (revenue at risk) | Management / EAB practice (not a federal cut) | Complement of retention, NTR-weighted; standard budgeting view |
| Exposure by aid band | **HEOA** Grad/Retention by federal aid group (*see note*) | Federally-mandated disaggregation of outcomes by aid receipt; anchored to the reference fall |
| Backward driver decomposition | **IPEDS** enrollment flow categories | New + re-entrant − lost; first-time / continuing / returning |
| Scenarios to 2030 | **WICHE** *Knocking at the College Door*; NACUBO discount trend | HS-graduate projections as the entering-class assumption |
| Graduation, degree completions *(not yet emitted)* | **IPEDS** GRS / Outcome Measures; MSU "Graduation/Transfer", "Degree Completions" | Gated on graduation labels — see ROADMAP |
| Peer placement *(not yet emitted)* | **IPEDS** peers; AAUDE; sector benchmarking | Standard IR benchmarking layer — deferred; see docs/CUTTING_ROOM.md |

## Note on the aid-band cut

The report disaggregates retention and NTR by **institutional discount band**
(No Award → Near-Full Aid). This is the *spirit* of the HEOA standard —
"Graduation/Retention Rates by Federal Aid Group," which campuses report
federally and publish (e.g. University of Minnesota's compliance reporting) —
but not literally it: HEOA groups students by **federal aid receipt** (Pell
recipients, subsidized-loan-only, neither), whereas the synthetic data carries
only a discount-magnitude band. The exact HEOA cut is available on real data
via the aid schema's `pell_flag`, `sai_or_efc`, and loan fields
(`data/aid_schema/`); until then the report uses the discount band, labelled
as a proxy rather than as the federal group.

## Why definitions are public and NTR is forecastable

Tuition and required fees are published annually (IPEDS; institutions also post
historic tuition-rate *series*, e.g. UMN's "Historic Annual Tuition Rates").
Institutional grant aid and discount rate are disclosed (IPEDS SFA, Common Data
Set §H, and the annual NACUBO Tuition Discounting Study). So net-tuition-revenue
*per student* is a near-public, predictably-escalating price — which is why the
revenue layer treats it as an input/assumption, not a quantity to estimate
(headcount is the stochastic factor; price is the public one). Verify the
current discount figure against the NACUBO study directly rather than any number
cached here.

## Sources

- Missouri State University–West Plains, Institutional Research — Key
  Performance Indicators. <https://wp.missouristate.edu/InstResearch/key-performance-indicators.htm>
- University of Minnesota, Institutional Data & Research — Research KPIs,
  Compliance Reporting (HEOA by federal aid group; Common Data Set), Tuition &
  Fees series, Benchmarking Resources.
  <https://idr.umn.edu/reports-by-topic-research/research-key-performance-indicators>
- NACUBO Tuition Discounting Study (annual; discount-rate benchmark for private
  nonprofits). <https://www.nacubo.org/Research/2025/NACUBO-Tuition-Discounting-Study>
- Federal standards referenced by definition: IPEDS (Enrollment, SFA, Finance,
  Graduation Rates), HEOA aid-group disaggregation, Common Data Set, WICHE
  *Knocking at the College Door*.
