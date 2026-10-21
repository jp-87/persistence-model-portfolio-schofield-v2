export interface SiteData {
  data: {
    records: number;
    students: number;
    md5: string;
  };
  backtest: {
    as_of: string;
    steps: number;
    segment: string;
    rows: Array<{
      k: number;
      expected: number;
      actual: number;
      seg_mape: number;
      coverage: number;
      total_ape: number;
    }>;
  };
  compare: {
    windows: string[];
    cells: number;
    markov_mean_ape: number;
    ladder_mean_ape: number;
    markov_wins: number;
    ratio: number;
    coverage_80: number;
    coverage: {
      pooled: {
        k: number;
        covered: number;
        total: number;
        rate: number;
        lo: number;
        hi: number;
      };
      by_horizon: Array<{
        k: number;
        covered: number;
        total: number;
        rate: number;
        lo: number;
        hi: number;
      }>;
      checks: number;
      segments_per_cell: number;
    };
    horizons: Array<{
      k: number;
      markov: {
        mean: number;
        min: number;
        max: number;
      };
      ladder: {
        mean: number;
        min: number;
        max: number;
      };
    }>;
  };
  revenue: {
    as_of: string;
    rows: Array<{
      k: number;
      expected_m: number;
      actual_m: number;
      total_ape: number;
    }>;
  };
  scenarios: {
    cliff: ScenarioPoint[];
    flat: ScenarioPoint[];
    northeast: ScenarioPoint[];
    [key: string]: ScenarioPoint[];
  };
  vintage: Array<{
    cohort: string;
    entrants: number;
    terms_scored: number;
    actual_heads: number;
    expected_heads: number;
    rate_alpha_heads: number;
    mix_alpha_heads: number;
    total_alpha_ntr_m: number;
  }>;
  risk_cells: Array<{
    school: string;
    degree: string;
    aid_band: string;
    entry_season: string;
    duration: number;
    headcount: number;
    mean_ntr: number;
    prevalence: number;
    exit_hazard: number;
    lift: number;
    ntr_at_risk: number;
  }>;
  code: {
    modules: Array<{
      name: string;
      lines: number;
      what: string;
    }>;
    max_lines: number;
    total_lines: number;
    tests: number;
  };
  drift: {
    k: number;
    windows: string[];
    coarse: number[];
    aid: number[];
  };
  entrant: {
    as_of: string;
    years: number;
    schools: Record<
      string,
      {
        terms_per_year: number;
        rates: number[];
        curve: number[];
        entering: number;
        charge_per_term: number;
        aid_rate: number;
      }
    >;
  };
  meta: {
    version: string;
    git_sha: string;
    python: string;
    numpy: string;
    pandas: string;
    interval_level: number;
    prior_strength: number;
    n_draws: number;
    seed: number;
    report_as_of: string;
  };
  wiche: {
    source: string;
    end_year: number;
    national: {
      peak_year: number;
      change: number;
    };
    northeast: {
      peak_year: number;
      change: number;
    };
  };
  ledger_summary: {
    total_rows: number;
    as_of_cycles: string[];
    segments: number;
    steps_per_segment: number;
    mode: string;
    pooled_coverage_all_cycles: number;
    frontier_zero_rows: number;
    effective_sample_size: {
      nominal_checks: number;
      effective_n: number;
      effective_lo: number;
      effective_hi: number;
    };
    by_cycle: Array<{
      as_of: string;
      rows_logged: number;
      matured_rows: number;
      frontier_truncated_rows: number;
      mean_expected_step1: number;
      note: string;
    }>;
  };
  published: boolean;
  repo_url: string;
}

export interface ScenarioPoint {
  fall: string;
  headcount: number;
  ntr_m: number;
  p10_m: number;
  p90_m: number;
}
