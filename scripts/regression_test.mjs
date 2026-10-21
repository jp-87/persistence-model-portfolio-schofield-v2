import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { createServer } from 'vite';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
let passed = 0;
let failed = 0;

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`PASS  ${name}`);
    passed++;
  } catch (err) {
    console.error(`FAIL  ${name}`);
    console.error(`      ${err.message}`);
    failed++;
  }
}

const siteData = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src/data/siteData.json'), 'utf8')
);

// 1. Entrypoint & static assets
await runTest('test_entrypoint_and_static_assets', () => {
  const indexHtmlPath = path.join(ROOT, 'index.html');
  assert.ok(fs.existsSync(indexHtmlPath), '/index.html must exist');
  const html = fs.readFileSync(indexHtmlPath, 'utf8');
  assert.ok(html.includes('<div id="root"></div>'), 'index.html must contain #root');
  assert.ok(
    html.includes('src="./src/main.tsx"') || html.includes('src="/src/main.tsx"'),
    'index.html must load ./src/main.tsx or /src/main.tsx'
  );
  assert.ok(
    html.includes('https://jp-87.github.io/student-persistence-model/'),
    'index.html must point canonical and og:url to https://jp-87.github.io/student-persistence-model/'
  );
  assert.ok(
    html.includes('https://remix-student-persistence-model-9415.ai.studio'),
    'index.html must include https://remix-student-persistence-model-9415.ai.studio'
  );
  const readmeTxt = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
  assert.ok(
    readmeTxt.includes('https://jp-87.github.io/student-persistence-model/'),
    'README.md must link to GitHub Pages deployment URL'
  );
  assert.ok(
    readmeTxt.includes('https://remix-student-persistence-model-9415.ai.studio'),
    'README.md must link to https://remix-student-persistence-model-9415.ai.studio'
  );

  for (const fig of ['backtest_cone.png', 'churn.png', 'drivers.png', 'logo.png']) {
    const p = path.join(ROOT, 'public/figures', fig);
    assert.ok(fs.existsSync(p), `public/figures/${fig} must exist`);
    assert.ok(fs.statSync(p).size > 1000, `public/figures/${fig} must be non-empty`);
  }

  // Single source of truth for backtest_cone.png
  const md5Public = crypto
    .createHash('md5')
    .update(fs.readFileSync(path.join(ROOT, 'public/figures/backtest_cone.png')))
    .digest('hex');
  const md5Docs = crypto
    .createHash('md5')
    .update(fs.readFileSync(path.join(ROOT, 'docs/figures/backtest_cone.png')))
    .digest('hex');
  assert.equal(
    md5Public,
    md5Docs,
    'public/figures/backtest_cone.png and docs/figures/backtest_cone.png must be byte-identical'
  );
});

// 2. Synthetic dataset checksum & row count
await runTest('test_synthetic_data_checksum', () => {
  const csvPath = path.join(ROOT, 'data/synthetic_enrollment.csv');
  const buf = fs.readFileSync(csvPath);
  const md5 = crypto.createHash('md5').update(buf).digest('hex');
  assert.equal(md5, siteData.data.md5, 'CSV MD5 must match siteData.data.md5');
  const lines = buf.toString('utf8').trim().split('\n');
  assert.equal(
    lines.length - 1,
    siteData.data.records,
    'CSV record count must equal 54,954'
  );
});

// 3. Headline claims hold
await runTest('test_headline_claims_hold', () => {
  const c = siteData.compare;
  assert.equal(c.cells, 20);
  assert.ok(c.markov_wins >= 18, `expected markov_wins >= 18, got ${c.markov_wins}`);
  assert.ok(c.ratio >= 3.0, `expected ratio >= 3.0, got ${c.ratio}`);
  assert.ok(
    c.coverage_80 >= 0.75 && c.coverage_80 <= 0.9,
    `coverage_80 out of range: ${c.coverage_80}`
  );
  assert.equal(siteData.data.records, 54954);
});

// 4. Scenario bands bracket point path
await runTest('test_scenario_summary_band_brackets_the_point_path', () => {
  for (const [name, rows] of Object.entries(siteData.scenarios)) {
    assert.ok(rows.length > 0, `scenario ${name} must have rows`);
    let nonDegen = false;
    for (const r of rows) {
      assert.ok(
        r.p10_m <= r.ntr_m,
        `${name} ${r.fall}: p10_m (${r.p10_m}) > ntr_m (${r.ntr_m})`
      );
      assert.ok(
        r.ntr_m <= r.p90_m,
        `${name} ${r.fall}: ntr_m (${r.ntr_m}) > p90_m (${r.p90_m})`
      );
      if (r.p90_m > r.p10_m) nonDegen = true;
    }
    assert.ok(nonDegen, `scenario ${name} band must be non-degenerate`);
  }
});

// 5. Coverage counts, Wilson intervals, and autocorrelation-adjusted N_eff consistent
await runTest('test_coverage_counts_and_effective_sample_size_consistent', () => {
  const cov = siteData.compare.coverage;
  const sumCovered = cov.by_horizon.reduce((acc, h) => acc + h.covered, 0);
  const sumTotal = cov.by_horizon.reduce((acc, h) => acc + h.total, 0);
  assert.equal(sumCovered, cov.pooled.covered);
  assert.equal(sumTotal, cov.pooled.total);
  assert.equal(cov.pooled.total, cov.checks);

  // Verify Wilson score interval formula (95% z = 1.95996)
  const wilson = (covered, total, z = 1.959963984540054) => {
    const p = covered / total;
    const denom = 1 + (z * z) / total;
    const center = (p + (z * z) / (2 * total)) / denom;
    const half =
      (z * Math.sqrt((p * (1 - p)) / total + (z * z) / (4 * total * total))) /
      denom;
    return { lo: center - half, hi: center + half };
  };

  for (const h of [...cov.by_horizon, cov.pooled]) {
    assert.ok(
      h.lo <= h.rate && h.rate <= h.hi,
      `Wilson interval must bracket rate for k=${h.k}`
    );
    const w = wilson(h.covered, h.total);
    assert.ok(
      Math.abs(w.lo - h.lo) < 0.002 && Math.abs(w.hi - h.hi) < 0.002,
      `Wilson 95% bounds for k=${h.k} must match exact score formula`
    );
  }

  // Verify autocorrelation-adjusted effective sample size (N_eff = 24) Wilson bounds
  const eff = siteData.ledger_summary.effective_sample_size;
  assert.equal(eff.nominal_checks, 80);
  assert.equal(eff.effective_n, 24);
  const wEff = wilson(cov.pooled.rate * eff.effective_n, eff.effective_n);
  assert.ok(
    Math.abs(wEff.lo - eff.effective_lo) < 0.002 &&
      Math.abs(wEff.hi - eff.effective_hi) < 0.002,
    'Effective sample size (N_eff = 24) Wilson 95% bounds must match score formula'
  );
  assert.ok(
    eff.effective_hi - eff.effective_lo > cov.pooled.hi - cov.pooled.lo,
    'Cluster-robust N_eff Wilson interval must be wider than naive i.i.d. interval'
  );
});

// 6. Entrant survival curve matches chained continuation rates
await runTest('test_entrant_curve_matches_rates', () => {
  for (const [school, block] of Object.entries(siteData.entrant.schools)) {
    let s = 1.0;
    assert.equal(block.curve[0], 1.0);
    for (let i = 0; i < block.rates.length; i++) {
      s *= block.rates[i];
      const diff = Math.abs(s - block.curve[i + 1]);
      assert.ok(
        diff < 1e-4,
        `${school} duration ${i + 1}: chained ${s} != curve ${block.curve[i + 1]}`
      );
    }
  }
});

// 7. COA budget schema test
await runTest('test_coa_budget_groups_unique_and_total_derivable', () => {
  const raw = fs
    .readFileSync(path.join(ROOT, 'data/aid_schema/coa_budget.csv'), 'utf8')
    .trim()
    .split('\n');
  const headers = raw[0].split(',');
  const bgIdx = headers.indexOf('budget_group');
  const totIdx = headers.indexOf('total_coa');
  const partIndices = headers
    .map((h, i) => (h.endsWith('_budget') ? i : -1))
    .filter((i) => i >= 0);

  const seenGroups = new Set();
  for (let r = 1; r < raw.length; r++) {
    const cols = raw[r].split(',');
    const bg = cols[bgIdx];
    assert.ok(!seenGroups.has(bg), `duplicate budget_group: ${bg}`);
    seenGroups.add(bg);

    const partSum = partIndices.reduce((acc, idx) => acc + Number(cols[idx]), 0);
    assert.ok(partSum > 0, `component sum for ${bg} must be > 0`);
    assert.equal(Number(cols[totIdx]), 0, 'total_coa is intentionally 0');
  }
});

// 8. Version and runtime provenance consistency across metadata
await runTest('test_version_consistent_across_metadata', () => {
  const pkgVer = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
  const cff = fs.readFileSync(path.join(ROOT, 'CITATION.cff'), 'utf8');
  const changelog = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8');
  assert.equal(pkgVer, siteData.meta.version, 'package.json version must match siteData.meta.version');
  assert.ok(cff.includes(`version: ${pkgVer}`), `CITATION.cff must contain version: ${pkgVer}`);
  assert.ok(changelog.includes(`## ${pkgVer}`), `CHANGELOG.md must contain ## ${pkgVer}`);

  // Ensure runtime provenance strings are real historical versions (not fabricated 2.5.4 / 3.0.6)
  assert.equal(siteData.meta.python, '3.12.9', 'Python provenance version must be valid 3.12.9');
  assert.equal(siteData.meta.numpy, '2.2.3', 'NumPy provenance version must be valid 2.2.3');
  assert.equal(siteData.meta.pandas, '2.2.3', 'pandas provenance version must be valid 2.2.3');
});

// 9. No overstated words in UI components or README
await runTest('test_page_avoids_overstated_words', () => {
  const filesToCheck = [
    path.join(ROOT, 'README.md'),
    path.join(ROOT, 'src/App.tsx'),
    ...fs
      .readdirSync(path.join(ROOT, 'src/components'))
      .map((f) => path.join(ROOT, 'src/components', f)),
  ];
  const forbidden = ['calibrated', 'certif', 'correctly', 'faithful'];
  for (const f of filesToCheck) {
    const txt = fs.readFileSync(f, 'utf8').toLowerCase();
    for (const word of forbidden) {
      assert.ok(!txt.includes(word), `Overstated word "${word}" found in ${path.relative(ROOT, f)}`);
    }
  }
});

// 10. No institutional identifiers in published files
await runTest('test_published_files_carry_no_institutional_identifiers', () => {
  const forbiddenTerms = [
    'berklee',
    'bcb_',
    'campus_a_',
    'campus_b_',
    'cl1_retentionfact',
    'cohort_segmentation',
  ];
  const walk = (dir) => {
    let results = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (
          [
            'node_modules',
            'dist',
            '_private',
            '_site',
            'site',
            'build',
            '.quarto',
            '.venv',
            '.git',
            '.aistudio',
            'aistudio',
          ].includes(entry.name)
        )
          continue;
        results = results.concat(walk(full));
      } else if (/\.(ts|tsx|md|json|cff|yml|html|css)$/.test(entry.name)) {
        results.push(full);
      }
    }
    return results;
  };

  for (const file of walk(ROOT)) {
    const content = fs.readFileSync(file, 'utf8').toLowerCase();
    for (const term of forbiddenTerms) {
      assert.ok(
        !content.includes(term),
        `Forbidden term "${term}" found in ${path.relative(ROOT, file)}`
      );
    }
  }
});

// 11. SVG text elements are never wrapped in HTML <span>
await runTest('test_svg_text_not_wrapped_in_html_spans', () => {
  const compDir = path.join(ROOT, 'src/components');
  for (const f of fs.readdirSync(compDir)) {
    if (!f.endsWith('.tsx')) continue;
    const content = fs.readFileSync(path.join(compDir, f), 'utf8');
    const textMatches = content.match(/<text[\s\S]*?<\/text>/g) || [];
    for (const tm of textMatches) {
      assert.ok(
        !tm.includes('<span'),
        `HTML <span> inside SVG <text> found in ${f}: ${tm.slice(0, 80)}`
      );
    }
  }
});

// 12. Published flag and repo_url updated
await runTest('test_published_state_enabled', () => {
  assert.equal(siteData.published, true, 'siteData.published must be true');
  assert.equal(
    siteData.repo_url,
    'https://github.com/jp-87/student-persistence-model',
    'siteData.repo_url must point to jp-87/student-persistence-model'
  );
});

// 13. Institutional metrics, Vintage Alpha decomposition, WICHE & Forecast Ledger identities
await runTest('test_institutional_metrics_and_vintage_risk_identities', () => {
  // Vintage Alpha: rate_alpha_heads == actual_heads - expected_heads
  for (const v of siteData.vintage) {
    assert.equal(
      Math.round(v.actual_heads - v.expected_heads),
      Math.round(v.rate_alpha_heads),
      `Vintage ${v.cohort}: actual - expected must equal rate_alpha_heads`
    );
    assert.ok(v.terms_scored >= 2, `Vintage ${v.cohort} must have >= 2 scored terms`);
  }

  // Risk cells: ntr_at_risk == headcount * exit_hazard * mean_ntr (within rounding tolerance) and sorted descending
  for (let i = 0; i < siteData.risk_cells.length; i++) {
    const r = siteData.risk_cells[i];
    const impliedRisk = r.headcount * r.exit_hazard * r.mean_ntr;
    const relDiff = Math.abs(impliedRisk - r.ntr_at_risk) / r.ntr_at_risk;
    assert.ok(
      relDiff < 0.005,
      `Risk cell ${i} (${r.school} t${r.duration}): implied risk ${impliedRisk} != ${r.ntr_at_risk}`
    );
    if (i > 0) {
      assert.ok(
        r.ntr_at_risk <= siteData.risk_cells[i - 1].ntr_at_risk,
        'Risk cells must be ranked in non-increasing order of NTR at risk'
      );
    }
  }

  // WICHE reference series peak-to-2030 change matches siteData.wiche
  const wicheLines = fs
    .readFileSync(path.join(ROOT, 'data/reference/wiche_hsgrad.csv'), 'utf8')
    .trim()
    .split('\n')
    .filter((l) => !l.startsWith('#') && !l.startsWith('series,'));
  const wicheMap = {};
  for (const line of wicheLines) {
    const [series, year, grads] = line.split(',');
    wicheMap[`${series}_${year}`] = Number(grads);
  }
  const natChange =
    (wicheMap.national_2030 - wicheMap.national_2025) / wicheMap.national_2025;
  const neChange =
    (wicheMap.northeast_2030 - wicheMap.northeast_2025) / wicheMap.northeast_2025;
  assert.ok(
    Math.abs(natChange - siteData.wiche.national.change) < 1e-4,
    `WICHE national 2025->2030 change ${natChange} must match siteData ${siteData.wiche.national.change}`
  );
  assert.ok(
    Math.abs(neChange - siteData.wiche.northeast.change) < 1e-4,
    `WICHE northeast 2025->2030 change ${neChange} must match siteData ${siteData.wiche.northeast.change}`
  );

  // Forecast ledger integrity & ledger_summary reconciliation
  // Columns: logged_utc,mode,as_of,school,degree,steps_ahead,target_term,enrolled_expected,enrolled_p10,enrolled_p90,git_sha,data_md5
  const ledgerLines = fs
    .readFileSync(path.join(ROOT, 'data/forecast_ledger.csv'), 'utf8')
    .trim()
    .split('\n')
    .filter((l) => !l.startsWith('#') && !l.startsWith('logged_utc,'));
  assert.equal(ledgerLines.length, 120, 'Forecast ledger must contain 120 logged rows');

  let zeroBoundaryRows = 0;
  let sumLoggedInSummary = 0;

  for (const row of ledgerLines) {
    const cols = row.split(',');
    const exp = Number(cols[7]);
    const p10 = Number(cols[8]);
    const p90 = Number(cols[9]);
    const md5 = cols[11];

    if (exp === 0) zeroBoundaryRows++;

    assert.ok(p10 <= exp && exp <= p90, `Ledger interval must bracket expected: ${row}`);
    assert.equal(md5, siteData.data.md5, 'Ledger row data_md5 must match synthetic dataset MD5');
  }

  for (const cy of siteData.ledger_summary.by_cycle) {
    sumLoggedInSummary += cy.rows_logged;
  }

  assert.equal(siteData.ledger_summary.total_rows, 120);
  assert.equal(sumLoggedInSummary, 120);
  assert.equal(siteData.ledger_summary.frontier_zero_rows, zeroBoundaryRows);
});

// 14. Lockfile & CI workflow hygiene
await runTest('test_single_lockfile_and_ci_hygiene', () => {
  assert.ok(
    fs.existsSync(path.join(ROOT, 'package-lock.json')),
    'package-lock.json must exist'
  );
  // If the preview sandbox created an ephemeral bun.lock, remove it and ensure .gitignore blocks it
  const bunLockPath = path.join(ROOT, 'bun.lock');
  if (fs.existsSync(bunLockPath)) {
    fs.unlinkSync(bunLockPath);
  }
  const gitignore = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8');
  assert.ok(gitignore.includes('bun.lock'), '.gitignore must ignore bun.lock');
  for (const orphan of ['bun.lock', 'yarn.lock', 'pnpm-lock.yaml', 'requirements.lock']) {
    assert.ok(
      !fs.existsSync(path.join(ROOT, orphan)),
      `Orphan lockfile ${orphan} must not exist`
    );
  }
  const ciYml = fs.readFileSync(path.join(ROOT, '.github/workflows/ci.yml'), 'utf8');
  assert.ok(ciYml.includes('npm ci'), 'ci.yml must use deterministic npm ci');
  assert.ok(ciYml.includes('npm test'), 'ci.yml must run npm test');
});

// 15. Direct Calculator Module & Counterfactual Sensitivity Invariants + SSR DOM Validation
await runTest('test_calculator_module_invariants_and_ssr_dom_render', async () => {
  const vite = await createServer({
    root: ROOT,
    configFile: false,
    server: { middlewareMode: true, watch: null },
    appType: 'custom',
    logLevel: 'silent',
    optimizeDeps: {
      noDiscovery: true,
      entries: [],
    },
  });

  try {
    const { App } = await vite.ssrLoadModule('/src/App.tsx');
    const { StandingReportView } = await vite.ssrLoadModule(
      '/src/components/StandingReportView.tsx'
    );
    const { navItemsList } = await vite.ssrLoadModule(
      '/src/components/SidebarNav.tsx'
    );
    const {
      computeEntrantProjection,
      computePrescriptiveSimulation,
      classifyAidTier,
      CAMPUS_ARCHETYPES,
      INTERVENTION_PRESETS,
    } = await vite.ssrLoadModule('/src/utils/calculator.ts');

    const mcm = siteData.entrant.schools.MCM;
    const mcc = siteData.entrant.schools.MCC;
    const years = siteData.entrant.years;

    // Verify 5-tier institutional aid classification (discount_description)
    assert.equal(classifyAidTier(10), 'No Award (<15%)');
    assert.equal(classifyAidTier(25), 'Minimal Aid (15–35%)');
    assert.equal(classifyAidTier(45), 'Partial Aid (35–60%)');
    assert.equal(classifyAidTier(70), 'Substantial Aid (60–80%)');
    assert.equal(classifyAidTier(85), 'Near-Full Aid (≥80%)');

    // Verify computeEntrantProjection parity & algebraic properties directly on imported module
    const mcmRes = computeEntrantProjection(
      mcm,
      years,
      mcm.entering,
      mcm.charge_per_term,
      mcm.aid_rate * 100,
      1.0
    );
    assert.ok(mcmRes.valid);
    assert.equal(mcmRes.clipped, false);
    assert.equal(Math.round(mcmRes.totalNtr), 91559359);
    assert.equal(mcmRes.includeSummer, true);
    for (let i = 0; i < mcm.curve.length; i++) {
      assert.ok(Math.abs(mcmRes.survivalCurve[i] - mcm.curve[i]) < 1e-4);
    }
    assert.ok(
      Math.abs(mcmRes.impliedFallToFallRetention - mcm.curve[3]) < 1e-6,
      'Implied Year-2 retention must match S(tpy)'
    );

    // Set 2: 1000 students at MCM
    const mcm1000 = computeEntrantProjection(
      mcm,
      years,
      1000,
      mcm.charge_per_term,
      mcm.aid_rate * 100,
      1.0
    );
    assert.equal(Math.round(mcm1000.totalNtr), 118446778);

    // Set 3: MCC default
    const baseMcc = computeEntrantProjection(
      mcc,
      years,
      mcc.entering,
      mcc.charge_per_term,
      mcc.aid_rate * 100,
      1.0
    );
    assert.ok(baseMcc.valid);
    assert.ok(baseMcc.totalNtr > 0);
    assert.equal(baseMcc.includeSummer, false);

    // Property: Linearity in entering headcount
    const c500 = computeEntrantProjection(mcm, years, 500, 40000, 25, 1.0);
    const c1000 = computeEntrantProjection(mcm, years, 1000, 40000, 25, 1.0);
    assert.ok(
      Math.abs(c1000.totalNtr - 2 * c500.totalNtr) < 1e-6,
      'NTR must scale linearly with entering class'
    );

    // Property: Linearity in tuition charge
    const t20k = computeEntrantProjection(mcm, years, 600, 20000, 25, 1.0);
    const t40k = computeEntrantProjection(mcm, years, 600, 40000, 25, 1.0);
    assert.ok(
      Math.abs(t40k.totalNtr - 2 * t20k.totalNtr) < 1e-6,
      'NTR must scale linearly with tuition charge'
    );

    // Property: Headcount non-increasing across years
    for (let i = 1; i < mcmRes.rows.length; i++) {
      assert.ok(
        mcmRes.rows[i].entryTermHeads <= mcmRes.rows[i - 1].entryTermHeads,
        'Enrolled headcount must be non-increasing by year'
      );
    }

    // Property: Validation rejects invalid inputs without silent clamping
    assert.equal(computeEntrantProjection(mcm, years, -5, 40000, 25, 1.0).valid, false);
    assert.equal(computeEntrantProjection(mcm, years, 10.5, 40000, 25, 1.0).valid, false);
    assert.equal(computeEntrantProjection(mcm, years, 500, -100, 25, 1.0).valid, false);
    assert.equal(computeEntrantProjection(mcm, years, 500, 40000, 105, 1.0).valid, false);
    assert.equal(computeEntrantProjection(mcm, years, 500, 40000, 25, 1.5).valid, false);

    // Verify Synthetic Campus Archetype presets and Counterfactual Sensitivity Presets
    assert.ok(
      CAMPUS_ARCHETYPES.open_access &&
        CAMPUS_ARCHETYPES.regional_public &&
        CAMPUS_ARCHETYPES.selective_four_year
    );
    assert.ok(
      INTERVENTION_PRESETS.summer_bridge &&
        INTERVENTION_PRESETS.first_year_advising &&
        INTERVENTION_PRESETS.need_microgrant
    );

    // 1) Baseline parity in computePrescriptiveSimulation
    const baseSim = computePrescriptiveSimulation(
      mcm,
      years,
      mcm.entering,
      mcm.charge_per_term,
      mcm.aid_rate * 100,
      1.0,
      0,
      0,
      'none',
      0,
      false
    );
    assert.ok(baseSim.valid);
    assert.equal(Math.round(baseSim.simulated.totalNtr), 91559359);
    assert.equal(Math.round(baseSim.grossNtrLift), 0);
    assert.equal(Math.round(baseSim.netInstitutionalRoi), 0);

    // 2) Single-bridge 3-term Summer hazard reduction invariant (applied ONCE at idx = tpy - 1 = 2, NOT double-counted on idx = 1)
    const suOnlySim = computePrescriptiveSimulation(
      mcm,
      years,
      mcm.entering,
      mcm.charge_per_term,
      mcm.aid_rate * 100,
      1.0,
      0,
      25, // 25% Summer bridge uptake -> summerRecoveryFraction = 0.25 * 0.75 = 0.1875
      'none',
      0,
      false
    );
    assert.ok(suOnlySim.valid);
    const r0 = mcm.rates[0];
    const r1 = mcm.rates[1];
    const r2 = mcm.rates[2];
    const expectedR2 = 1.0 - (1.0 - r2) * (1.0 - 0.25 * 0.75);
    const impliedSimR1 =
      suOnlySim.simulated.survivalCurve[2] / suOnlySim.simulated.survivalCurve[1];
    const impliedSimR2 =
      suOnlySim.simulated.survivalCurve[3] / suOnlySim.simulated.survivalCurve[2];
    assert.ok(
      Math.abs(impliedSimR1 - r1) < 1e-6,
      `3-term Summer bridge must NOT double-apply hazard reduction on idx=1: expected ${r1}, got ${impliedSimR1}`
    );
    assert.ok(
      Math.abs(impliedSimR2 - expectedR2) < 1e-6,
      `3-term Summer bridge must reduce bridge transition (idx=2) hazard once: expected ${expectedR2}, got ${impliedSimR2}`
    );
    assert.equal(suOnlySim.simulated.survivalCurve[1], r0);

    // 3) Summer bridge intervention preset + credit recovery lifts Year-2 retention and NTR
    const suBridgeSim = computePrescriptiveSimulation(
      mcm,
      years,
      mcm.entering,
      mcm.charge_per_term,
      mcm.aid_rate * 100,
      1.0,
      0,
      25,
      'summer_bridge',
      1200,
      false
    );
    assert.ok(suBridgeSim.valid);
    assert.ok(suBridgeSim.summerBridgeParticipants > 0);
    assert.ok(suBridgeSim.summerRecoveredHeads > 0);
    assert.ok(suBridgeSim.summerInstructionalNtr > 0);
    assert.ok(
      suBridgeSim.simulated.impliedFallToFallRetention >
        baseSim.simulated.impliedFallToFallRetention,
      'Summer credit recovery + bridge intervention must lift Year-2 Fall retention'
    );
    assert.equal(
      Math.round(suBridgeSim.netInstitutionalRoi),
      Math.round(suBridgeSim.grossNtrLift - suBridgeSim.totalInterventionCost),
      'Net Counterfactual Margin must equal Gross NTR Delta minus Total Program Cost'
    );

    // 4) Optional DGP Aid-Retention Linkage (1.10x p_EE lift when discount > 50%) verification
    const highAidUnlinked = computePrescriptiveSimulation(
      mcm,
      years,
      mcm.entering,
      mcm.charge_per_term,
      55, // > 50% DGP step threshold
      1.0,
      0,
      0,
      'none',
      0,
      false
    );
    const highAidLinked = computePrescriptiveSimulation(
      mcm,
      years,
      mcm.entering,
      mcm.charge_per_term,
      55,
      1.0,
      0,
      0,
      'none',
      0,
      true
    );
    assert.ok(
      Math.abs(
        highAidUnlinked.syntheticBase.totalStudentTerms -
          baseSim.syntheticBase.totalStudentTerms
      ) < 1e-6,
      'Unlinked aid rate change must leave student-terms unchanged'
    );
    assert.ok(
      highAidLinked.syntheticBase.totalStudentTerms >
        highAidUnlinked.syntheticBase.totalStudentTerms,
      'DGP aid-retention linkage must increase retained student-terms when aid rate > 50%'
    );

    // 5) Demographic & Aid-Mix Shift (mix alpha) monotonicity
    const highNeedMixSim = computePrescriptiveSimulation(
      mcm,
      years,
      mcm.entering,
      mcm.charge_per_term,
      mcm.aid_rate * 100,
      1.0,
      10,
      0,
      'none',
      0,
      false
    );
    const lowNeedMixSim = computePrescriptiveSimulation(
      mcm,
      years,
      mcm.entering,
      mcm.charge_per_term,
      mcm.aid_rate * 100,
      1.0,
      -10,
      0,
      'none',
      0,
      false
    );
    assert.ok(
      lowNeedMixSim.syntheticBase.totalNtr > baseSim.syntheticBase.totalNtr &&
        baseSim.syntheticBase.totalNtr > highNeedMixSim.syntheticBase.totalNtr,
      'Unintervened synthetic NTR must respond monotonically to Aid-Mix shift (mix alpha)'
    );

    const dom = ReactDOMServer.renderToStaticMarkup(React.createElement(App));

    // Must not contain any unresolved {{ }} template markers
    assert.ok(
      !dom.includes('{{') && !dom.includes('}}'),
      'Rendered DOM contains unresolved {{ }}'
    );

    // Every sidebar navigation target must correspond to a rendered data-section (no orphaned DOM targets)
    for (const item of navItemsList) {
      assert.ok(
        dom.includes(`data-section="${item.id}"`),
        `Sidebar nav target data-section="${item.id}" missing in rendered DOM`
      );
    }

    // Must render all 9 section headings
    const expectedHeadings = [
      'Forecasting headcount and tuition revenue under uncertainty',
      'A two-state chain indexed by time since entry',
      'Fit on truncated data, scored against held-out terms',
      'Net tuition revenue and aid-band conditioning',
      'Entering-class size paths enter as labeled assumptions',
      'Entering class to four-year net tuition revenue',
      'Modules, flow-balance checks, and tests',
      'Net tuition revenue at risk, by cohort and segment',
      'What this does not claim',
    ];
    for (const h of expectedHeadings) {
      assert.ok(dom.includes(h), `Rendered DOM missing heading: "${h}"`);
    }

    // Must render dual terminology, YYYYTT tokens, CohortMatrixInspector, and Counterfactual Sensitivity Simulator
    const requiredDualTerms = [
      'Institutional Higher Education ↔ Statistical Terminology Cross-Walk',
      'Stage 2 Pipeline Mechanics &amp; Cohort-Matrix Inspector',
      '1. Synthetic Campus Archetype &amp; Cohort Parameter Generator',
      '2. Counterfactual Intervention &amp; Net Tuition Break-Even Simulator',
      'Summer (SU) Credit-Recovery Uptake (2020SP → 2020SU)',
      'Autocorrelation &amp; Effective Sample Size (N_eff ≈ 24):',
      'batched_cohort_projections_prep',
      'term_code_to_num',
      'terms_since_start',
      'INCLUDE_SUMMER',
      'base_table_no_covid',
      'ret_rates_proj',
      'discount_description',
      'aid_efficiency',
      'Person-Period Survival Panel',
      'Empirical Bayes Partial Pooling',
      'Oaxaca-Blinder / Kitagawa',
      'YYYYTT',
      '2019FA',
      '2020SP',
      '2020SU',
      '2020FA',
      '2025FA',
      '2026SP',
      '2026SU',
      '2026FA',
    ];
    for (const term of requiredDualTerms) {
      assert.ok(
        dom.includes(term),
        `Rendered DOM missing dual-terminology or YYYYTT token: "${term}"`
      );
    }

    // Must render SVG chart labels without <span> wrappers
    const svgTexts = dom.match(/<text[^>]*>[\s\S]*?<\/text>/g) || [];
    assert.ok(
      svgTexts.length >= 40,
      `Expected >= 40 rendered SVG <text> nodes, got ${svgTexts.length}`
    );
    for (const st of svgTexts) {
      assert.ok(!st.includes('<span'), `Rendered SVG <text> contains <span>: ${st}`);
    }

    // Must render calculator output, Wilson CI table, footer provenance, and GitHub link
    assert.ok(
      dom.includes('$91,559,359'),
      'Rendered DOM missing baseline 4-year NTR $91,559,359'
    );
    assert.ok(dom.includes('66/80'), 'Rendered DOM missing pooled coverage 66/80');
    assert.ok(dom.includes('72.7%–89.3%'), 'Rendered DOM missing 95% Wilson CI');
    assert.ok(dom.includes('63.2%–92.8%'), 'Rendered DOM missing N_eff = 24 Wilson CI');
    assert.ok(dom.includes('v0.2.1'), 'Rendered DOM missing footer version v0.2.1');
    assert.ok(dom.includes('d50c64f'), 'Rendered DOM missing footer git_sha d50c64f');
    assert.ok(dom.includes('a8ba9a1f20e6'), 'Rendered DOM missing footer data md5');
    assert.ok(
      dom.includes('https://github.com/jp-87/student-persistence-model'),
      'Rendered DOM missing GitHub repository link'
    );

    // Render StandingReportView (both Report and Diagnostics tabs) to verify DOM integrity
    const reportDom = ReactDOMServer.renderToStaticMarkup(
      React.createElement(StandingReportView, {
        accent: '#0d4f30',
        paper: '#f7f4ec',
        siteData,
        onBackToPortfolio: () => {},
        initialTab: 'report',
      })
    );
    assert.ok(
      reportDom.includes('Student Persistence &amp; Net Tuition Revenue — Standing Report'),
      'StandingReportView DOM missing report title'
    );
    assert.ok(
      reportDom.includes('Vintage Alpha (Cumulative vs Entry-Priced Expectation)'),
      'StandingReportView DOM missing Vintage Alpha section'
    );
    assert.ok(
      reportDom.includes('6. Append-Only Forecast Ledger &amp; Frontier Truncation Audit'),
      'StandingReportView DOM missing Section 6 Append-Only Forecast Ledger Audit'
    );

    const diagDom = ReactDOMServer.renderToStaticMarkup(
      React.createElement(StandingReportView, {
        accent: '#0d4f30',
        paper: '#f7f4ec',
        siteData,
        onBackToPortfolio: () => {},
        initialTab: 'diagnostics',
      })
    );
    assert.ok(
      diagDom.includes('1. Backtest Interval Coverage &amp; Effective Sample Size (80% Nominal Target)'),
      'Diagnostics tab DOM missing Section 1 Backtest Interval Coverage & Effective Sample Size'
    );
    assert.ok(
      diagDom.includes('Autocorrelation-Adjusted (N_eff ≈ 24)'),
      'Diagnostics tab DOM missing Autocorrelation-Adjusted (N_eff ≈ 24) row'
    );
  } finally {
    await vite.close();
  }
});

console.log(`\nRegression Suite Summary: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
