export interface ScenarioPoint {
  fall: string;
  headcount: number;
  ntr_m: number;
  p10_m: number;
  p90_m: number;
}

export interface VintageRow {
  cohort: string;
  entrants: number;
  terms_scored: number;
  actual_heads: number;
  expected_heads: number;
  rate_alpha_heads: number;
  mix_alpha_heads: number;
  total_alpha_ntr_m: number;
}

export interface DiscountTierRow {
  tier_id: number;
  discount_description: string;
  discount_range: string;
  school: 'MCM' | 'MCC' | 'All';
  headcount: number;
  gross_tuition: number;
  institutional_grant: number;
  comp_fee: number;
  mean_ntr: number;
  discount_rate: number;
  first_year_retention: number;
  exit_hazard: number;
  retained_ntr: number;
  ntr_at_risk: number;
}

export interface RiskCellRow {
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
}

export interface SchoolEntrantData {
  name: string;
  calendar_label: string;
  terms_per_year: number;
  include_summer: boolean;
  spring_to_fall_offset: 1 | 2;
  rates: number[];
  curve: number[];
  entering: number;
  charge_per_term: number;
  comp_fee_per_term: number;
  aid_rate: number;
}

export interface SiteData {
  data: {
    records: number;
    students: number;
    md5: string;
  };
  scenarios: {
    cliff: ScenarioPoint[];
    flat: ScenarioPoint[];
    northeast: ScenarioPoint[];
    [key: string]: ScenarioPoint[];
  };
  vintage: VintageRow[];
  discount_tiers: DiscountTierRow[];
  risk_cells: RiskCellRow[];
  entrant: {
    as_of: string;
    years: number;
    schools: Record<string, SchoolEntrantData>;
  };
  meta: {
    version: string;
    git_sha: string;
    python: string;
    numpy: string;
    pandas: string;
    interval_level: number;
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
  published: boolean;
  repo_url: string;
}

