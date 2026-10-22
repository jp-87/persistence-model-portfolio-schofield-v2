# Student Persistence Model

**Live Application (GitHub Pages):** [https://jp-87.github.io/persistence-model-portfolio-schofield-v2/](https://jp-87.github.io/persistence-model-portfolio-schofield-v2/) · **GitHub Repository:** [jp-87/persistence-model-portfolio-schofield-v2](https://github.com/jp-87/persistence-model-portfolio-schofield-v2) · **LinkedIn:** [John Schofield](https://www.linkedin.com/in/john-schofield)

## Overview

Enrollment projections inform a university's budget, staffing, and tuition discount strategy. This application implements a two-stage Higher Education enrollment and Net Tuition Revenue (NTR) cohort survival model across two academic calendars: **Millbury College of Music** (`MCM`, 3 terms/year including optional Summer) and **Millbury College Conservatory** (`MCC`, 2 terms/year, Fall and Spring only).

All figures and tables on the site are computed on a 54,954-record synthetic enrollment dataset (`data/synthetic_enrollment.csv`, MD5 `a8ba9a1f20e608b22eb90a622c0b6d05`) across 15,932 unique aliased student trajectories.

### Key Methodology & Features

- **01 · WICHE Demographic Scenarios to 2030**: Compares Steady recruitment against WICHE 11th-edition (*Knocking at the College Door*) National ("Cliff", −5.5% from 2025 peak to 2030) and Northeast (−7.6%) high school graduate projections starting from a unified `2026FA` baseline (`5,464` four-year undergraduate headcount · `$104.1M` Fall NTR), with 10th–90th percentile empirical continuation-rate bands.
- **02 · Longitudinal Cohort Matrix & Diagonal Census Highlight**: Interactive Stage 2 Cohort Registration Triangle indexed by chronological integer term code (`cohort_int` × elapsed duration `d`) on each school's calendar: `MCM` (3 terms/year with Spring-to-Fall `offset = 2` bypassing optional `13.3%` Summer attendance) and `MCC` (2 terms/year with `offset = 1`).
- **03 · Interactive 4-Year NTR Calculator**: Projects cohort headcount and Net Tuition Revenue (`Gross Tuition − Institutional Grant Aid + Comprehensive Fee`) across `MCM` and `MCC`, reporting IPEDS-analog Year-2 Fall retention, cumulative billed student-terms, 4-year NTR per entering student, and `±2.5pp` retention sensitivity bounds.
- **04 · Two-Stage Pipeline Architecture & Terminology Guide**: Documents the Stage 1 RStudio ETL and 5-tier tuition discount segmentation alongside Stage 2 Positron IDE integer term arithmetic (`YYYYSU = YYYY1`, `YYYYFA = YYYY2`, `YYYYSP = (YYYY−1)3`).
- **05 · Standing Report (Entering Classes & NTR by Discount Tier)**: Decomposes cohort Net Tuition Revenue variance into continuation rate and discount-tier mix effects, and compares Retained First-Year NTR against First-Year NTR at Risk across five NACUBO-style institutional grant discount tiers.

## Development & Verification

```bash
npm ci                  # Install deterministic dependencies from package-lock.json
npm run dev             # Start local Vite development server on port 3000
npm run lint            # Run strict TypeScript typecheck (tsc --noEmit)
npm test                # Run automated data, math, and SSR DOM regression suite
npm run build           # Build production static bundle in dist/
npm run build:posit     # Build static bundle + Posit Connect dist/manifest.json
npm run build:standalone # Build single-file dist/student-persistence-model-standalone.html
```
