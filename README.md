# Student Persistence Model

**Live Application (GitHub Pages):** [https://jp-87.github.io/student-persistence-model/](https://jp-87.github.io/student-persistence-model/) · **Google AI Studio:** [https://remix-student-persistence-model-9415.ai.studio](https://remix-student-persistence-model-9415.ai.studio)

## Overview

Enrollment projections inform a university's budget, staffing, and discount strategy. 

All figures and tables on the site are computed on a 54,954-record synthetic enrollment data.

### Key Methodology & Features

- **Term-based Two-State Markov Chain**: Models transitions between Enrolled and Out indexed by terms since entry on each school's calendar: Millbury College of Music (MCM) 3 terms/year, and Millbury College Conservatory MCC 2 terms/year.
- **Aid-Band Conditioning & Revenue Backtest**: Conditions persistence and NTR weights on institutional discount bands (proxy for HEOA aid groups), reducing 4-term signed NTR drift across rolling windows.
- **WICHE Demographic Scenarios to 2030**: Compares Flat recruitment against WICHE 11th-edition (*Knocking at the College Door*) National ("Cliff", −5.5% from 2025 peak to 2030) and Northeast (−7.6%) high school graduate projections with 10th–90th percentile simulation bands.
- **Interactive 4-Year NTR Calculator**: cohort projection across schools (`MCM`, `MCC`) reporting IPEDS-analog Year-2 retention, cumulative student-terms, 4-year NTR per entering student, and variance against baseline.
