# Stage 1 Contract: What "Enrolled" Means in the Real Data

The model in this repository runs on synthetic data, but its state definitions descend from a real upstream pipeline — Stage 1, an R script (recovered 2026-06-09, preserved privately) that builds a per-student, per-term retention fact table from institutional sources. This document records that pipeline's semantic decisions, because they define what every downstream number means. Private paths, systems, and identifiers are omitted.

## The E state is the output of a filter

The fact table keeps only rows where the source system's current-term status code equals `"E"`:

``` r
filter(enrollment_status == "E")
```

Everything this model calls "presence" is downstream of that single line. Two consequences matter:

1.  **Other status codes exist and are discarded.** The source field carries roughly six distinct codes (per the recovered field-mapping audits). The information needed to distinguish graduation from withdrawal — this model's #1 stated limitation — exists upstream and is dropped at this filter. The multi-state extension does not require new data collection; it requires relaxing one Stage 1 line.
2.  **The synthetic data's constant `enrollment_status = 'E'` column is the fossil of this filter.** The column looks vestigial; it records that the filter was applied.

## Re-entry is real and the source system codes it

Stage 1 maps matriculation source as: `ENT` (entering; also imputed when term == cohort), and `CON`/`RET` collapsed to `"CON/RET"` — continuing and **returning**. `RET` is the institution's own label for stop-out-and-return. The recovered script then drops the column from the final fact. So:

- Re-entry exists in the real process (the synthetic generator's zero re-entry is an artifact).
- The two-state chain's `O -> E` transition will be live on real data.
- The signal distinguishing CON from RET is one dropped column away.

## Population definition

Degree-seeking students only. Stage 1 excludes non-degree and miscellaneous program codes and inactive enrollment sources before any counting. A persistence rate from this fact is conditional on degree-seeking status — segments are not comparable to all-student headcounts.

## Financial definitions

```         
ntr      = (tuition_charge + comp_fee) - institutional_grant
discount = institutional_grant / tuition_charge
```

Missing financial values are coerced to 0 before these formulas (an NA grant is treated as no aid, not unknown aid). Missing cohort for an Entering student is imputed as the current term.

## Canonical schema (24 columns)

From `retention_fact_expected_cols.R`, the full fact contract:

`student_id, academic_year, enrollment_status, student_program, degree, type, credits, cohort_session, cohort_year, tuition_charge, comp_fee, institutional_grant, region, enrollment_type, attendance_type, stu_enroll_type, program_type, term_code, cohort_term, cohort_int, term_int, term_key, term_session, school`

The synthetic dataset is a 16-column projection of this contract (`ntr` and `discount_description` are derived; `program` stands in for `program_type`). The machine-readable mapping lives in `data/reference/retention_fact_schema.csv` and is bound to the data by a test.

## Calendar lineage

The integer term encoding (2023SU -\> 20231, 2023FA -\> 20232, 2024SP -\> 20233) originates in Stage 1's R helpers, was ported verbatim into the Stage 2 Python notebooks, is preserved in `generate.py`, and is replaced by the explicit calendar in `terms.py`. A test asserts the legacy and current calendars agree.

## Implications for running this model on real data

Point `build_panel` at the fact *before* the E-filter, not after: pass the raw status codes through, declare the state space from them (enrolled / stopped-out / graduated / withdrawn), and keep `RET` to validate observed re-entry against the chain's `O -> E` estimates. Stage 1's value is its segment mapping and financial logic; its single-status filter is the one decision this model is built to improve on.
