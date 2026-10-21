# Financial Aid Schema (design by example)

Twelve hand-built tables from August 2025, recovered 2026-06-10. The student-level
tables carry two synthetic students (S0001 in the MCM tables, S0002
in the MCC tables); the dimension tables carry reference rows — they are a
**schema specification by example**, not data. They define the aid-side
star schema needed to turn "aid improves retention by X" from an
assumption into an estimate. Status: awaiting a real extract; the
mock rows make every join testable today (`tests/test_aid_schema.py`).

## The tables and why they exist

| table | grain | the analytical point |
|---|---|---|
| `student_dim` | student | population covariates: first-gen, visa/residency, program — the "certain population" axis |
| `id_xwalk` | student | SIS ↔ PowerFAIDS ↔ Salesforce identity resolution |
| `term_dim` | term | dates + award-year membership |
| `award_year_term_bridge` | award_year × term | **the per-term linchpin**: aid is packaged by award year, enrollment happens by term; these weights (FA .5 / SP .5 / SU 0) allocate annual aid to terms |
| `fa_award_year` | student × award_year | the package: SAI/EFC, Pell, SEOG, **need vs merit institutional aid separated**, loans by type, work study |
| `fund_dim` | fund | taxonomy: source × need/merit × grant/loan — the "which dollars" axis |
| `coa_budget` | award_year × budget group | cost of attendance → **unmet need = COA − resources** (note: `total_coa` column intentionally 0; compute from components) |
| `loan_detail` | student × loan application | includes **PLUS denials** — credit-based aid loss uncorrelated with academic standing: the natural experiment for causal aid effects |
| `term_enroll_mcm/mcc` | student × term | charges and aid **applied per term**, balance due |
| `retention_mcm/mcc` | student × term | outcomes: retained flag, **`grad_flag`, `withdrawal_date`** — the success/attrition distinction the synthetic enrollment data lacks |

## How it connects to the model

`panel.py`'s student-term panel is the spine; these tables hang
covariates and outcomes on it. The intended estimation is a
discrete-time logit on the panel: persist ~ duration + aid(term,
via bridge) + population + interactions. The need/merit split, SAI
controls, and PLUS denials exist specifically to address aid
endogeneity — see docs/DESIGN_NOTES.md and the roadmap.
