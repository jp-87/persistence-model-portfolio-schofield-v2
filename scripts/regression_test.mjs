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
    html.includes('https://jp-87.github.io/persistence-model-portfolio-schofield-v2/'),
    'index.html must point canonical and og:url to https://jp-87.github.io/persistence-model-portfolio-schofield-v2/'
  );
  assert.ok(
    html.includes('https://github.com/jp-87/persistence-model-portfolio-schofield-v2'),
    'index.html must include canonical repository URL https://github.com/jp-87/persistence-model-portfolio-schofield-v2'
  );
  assert.ok(
    !html.includes('ai.studio') &&
      !html.includes('jp-87/student-persistence-model') &&
      !html.includes('Markov'),
    'index.html must not contain AI Studio remix URLs, mismatched repo URLs, or stale Markov metadata'
  );
  const readmeTxt = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
  assert.ok(
    readmeTxt.includes('https://jp-87.github.io/persistence-model-portfolio-schofield-v2/'),
    'README.md must link to GitHub Pages deployment URL'
  );
  assert.ok(
    readmeTxt.includes('https://github.com/jp-87/persistence-model-portfolio-schofield-v2'),
    'README.md must link to canonical GitHub repository https://github.com/jp-87/persistence-model-portfolio-schofield-v2'
  );
  assert.ok(
    !readmeTxt.includes('ai.studio') &&
      !readmeTxt.includes('jp-87/student-persistence-model'),
    'README.md must not link to AI Studio remix URLs or mismatched repository URLs'
  );

  const logoPath = path.join(ROOT, 'public/figures/logo.png');
  assert.ok(fs.existsSync(logoPath), 'public/figures/logo.png must exist');
  assert.ok(fs.statSync(logoPath).size > 1000, 'public/figures/logo.png must be non-empty');

  // Verify deprecated docs, empty asset folders, and figures are removed
  assert.ok(!fs.existsSync(path.join(ROOT, 'docs')), 'Deprecated /docs directory must not exist');
  assert.ok(
    !fs.existsSync(path.join(ROOT, 'public/assets')),
    'Orphaned /public/assets directory must not exist'
  );
  assert.ok(
    !fs.existsSync(path.join(ROOT, 'data/forecast_ledger.csv')),
    'Deprecated data/forecast_ledger.csv must not exist'
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
  assert.equal(siteData.data.students, 15932, 'Unique aliased student IDs must equal 15,932');
});

// 3. Unified 2026FA scenario baseline & non-degenerate 80% bands
await runTest('test_unified_2026fa_baseline_and_scenario_bands', () => {
  const { flat, cliff, northeast } = siteData.scenarios;
  assert.equal(flat[0].fall, '2026FA');
  assert.equal(cliff[0].fall, '2026FA');
  assert.equal(northeast[0].fall, '2026FA');

  // All 3 scenarios must start from the exact same 2026FA baseline
  assert.equal(flat[0].headcount, cliff[0].headcount, '2026FA headcount must match between flat and cliff');
  assert.equal(flat[0].headcount, northeast[0].headcount, '2026FA headcount must match between flat and northeast');
  assert.equal(flat[0].ntr_m, cliff[0].ntr_m, '2026FA NTR must match between flat and cliff');
  assert.equal(flat[0].ntr_m, northeast[0].ntr_m, '2026FA NTR must match between flat and northeast');

  // By 2030, flat >= cliff >= northeast
  const lastIdx = flat.length - 1;
  assert.ok(
    flat[lastIdx].ntr_m > cliff[lastIdx].ntr_m &&
      cliff[lastIdx].ntr_m > northeast[lastIdx].ntr_m,
    '2030 NTR must follow flat > cliff > northeast'
  );

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

// 4. Entrant survival curve matches calendar-aware offset=2 (MCM) and offset=1 (MCC)
await runTest('test_entrant_curve_matches_calendar_offset_rates', () => {
  const mcm = siteData.entrant.schools.MCM;
  assert.equal(mcm.terms_per_year, 3);
  assert.equal(mcm.curve[0], 1.0);
  // Fall-to-Spring (t=1): curve[0] * rates[0]
  assert.ok(Math.abs(mcm.curve[1] - mcm.rates[0]) < 1e-4);
  // Year 2 Fall (t=3): curve[1] * rates[2] (offset=2 skips optional Summer dip at t=2)
  assert.ok(
    Math.abs(mcm.curve[3] - mcm.curve[1] * mcm.rates[2]) < 1e-4,
    `MCM Year 2 Fall survival (${mcm.curve[3]}) must equal Spring t=1 (${mcm.curve[1]}) * offset=2 rate (${mcm.rates[2]})`
  );

  const mcc = siteData.entrant.schools.MCC;
  assert.equal(mcc.terms_per_year, 2);
  let s = 1.0;
  assert.equal(mcc.curve[0], 1.0);
  for (let i = 0; i < mcc.rates.length; i++) {
    s *= mcc.rates[i];
    const diff = Math.abs(s - mcc.curve[i + 1]);
    assert.ok(
      diff < 1e-3,
      `MCC duration ${i + 1}: chained ${s} != curve ${mcc.curve[i + 1]}`
    );
  }
});

// 5. Version and runtime provenance consistency across metadata
await runTest('test_version_consistent_across_metadata', () => {
  const pkgVer = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
  const cff = fs.readFileSync(path.join(ROOT, 'CITATION.cff'), 'utf8');
  const changelog = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8');
  assert.equal(pkgVer, siteData.meta.version, 'package.json version must match siteData.meta.version');
  assert.ok(cff.includes(`version: ${pkgVer}`), `CITATION.cff must contain version: ${pkgVer}`);
  assert.ok(changelog.includes(`## ${pkgVer}`), `CHANGELOG.md must contain ## ${pkgVer}`);

  assert.equal(siteData.meta.python, '3.12.9', 'Python provenance version must be valid 3.12.9');
  assert.equal(siteData.meta.numpy, '2.2.3', 'NumPy provenance version must be valid 2.2.3');
  assert.equal(siteData.meta.pandas, '2.2.3', 'pandas provenance version must be valid 2.2.3');
});

// 6. No overstated words in UI components or README
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

// 7. No institutional identifiers in published files
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

// 8. SVG text elements are never wrapped in HTML <span>
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

// 9. Published flag and repo_url updated
await runTest('test_published_state_enabled', () => {
  assert.equal(siteData.published, true, 'siteData.published must be true');
  assert.equal(
    siteData.repo_url,
    'https://github.com/jp-87/persistence-model-portfolio-schofield-v2',
    'siteData.repo_url must point to https://github.com/jp-87/persistence-model-portfolio-schofield-v2'
  );
});

// 10. Vintage performance, 5-tier discount breakdown, risk cells & WICHE identities
await runTest('test_vintage_discount_tiers_risk_and_wiche_identities', () => {
  for (const v of siteData.vintage) {
    assert.equal(
      Math.round(v.actual_heads - v.expected_heads),
      Math.round(v.rate_alpha_heads),
      `Vintage ${v.cohort}: actual - expected must equal rate_alpha_heads`
    );
    assert.ok(v.terms_scored >= 2, `Vintage ${v.cohort} must have >= 2 scored terms`);
  }

  // Verify 5 RStudio discount tiers exist and satisfy Retained + At Risk == Headcount * MeanNTR
  assert.equal(siteData.discount_tiers.length, 5, 'Must have 5 RStudio tuition discount tiers');
  for (const tier of siteData.discount_tiers) {
    const totalFirstYearNtr = tier.retained_ntr + tier.ntr_at_risk;
    const expectedTotal = tier.headcount * tier.mean_ntr;
    assert.ok(
      Math.abs(totalFirstYearNtr - expectedTotal) / expectedTotal < 0.01,
      `Discount tier ${tier.discount_description}: retained + at_risk (${totalFirstYearNtr}) must match headcount * mean_ntr (${expectedTotal})`
    );
  }

  // Risk cells sorted descending
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
});

// 11. Lockfile & CI workflow hygiene
await runTest('test_single_lockfile_and_ci_hygiene', () => {
  assert.ok(
    fs.existsSync(path.join(ROOT, 'package-lock.json')),
    'package-lock.json must exist'
  );
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

// 12. Calculator Module Invariants & SSR DOM Validation
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
    const { navItemsList } = await vite.ssrLoadModule(
      '/src/components/SidebarNav.tsx'
    );
    const {
      computeEntrantProjection,
      buildCohortSurvivalCurve,
      classifyAidTier,
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

    // Verify offset=2 vs naive offset=1 on 3-term MCM
    const { survivalCurve: curveOffset2 } = buildCohortSurvivalCurve(mcm.rates, mcm.terms_per_year, 2);
    const { survivalCurve: curveNaive } = buildCohortSurvivalCurve(mcm.rates, mcm.terms_per_year, 1);
    assert.ok(
      curveOffset2[3] > curveNaive[3] + 0.35,
      `MCM offset=2 Year 2 Fall retention (${curveOffset2[3]}) must avoid the naive Summer drop (${curveNaive[3]})`
    );

    // Verify computeEntrantProjection algebraic properties
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
    assert.equal(mcmRes.includeSummer, true);
    assert.ok(
      Math.abs(
        mcmRes.netPerTerm -
          (mcmRes.chargePerTerm - mcmRes.aidPerTerm + mcmRes.compFeePerTerm)
      ) < 1e-6,
      'RStudio NTR identity: netPerTerm must equal chargePerTerm - aidPerTerm + compFeePerTerm'
    );
    assert.ok(
      mcmRes.totalLowNtr < mcmRes.totalNtr && mcmRes.totalNtr < mcmRes.totalHighNtr,
      'Sensitivity bounds must bracket baseline 4-year NTR'
    );

    // MCC default
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

    // Linearity in entering headcount
    const c500 = computeEntrantProjection(mcm, years, 500, 26000, 30, 1.0);
    const c1000 = computeEntrantProjection(mcm, years, 1000, 26000, 30, 1.0);
    assert.ok(
      Math.abs(c1000.totalNtr - 2 * c500.totalNtr) < 1e-6,
      'NTR must scale linearly with entering class'
    );

    // Validation rejects invalid inputs
    assert.equal(computeEntrantProjection(mcm, years, -5, 26000, 30, 1.0).valid, false);
    assert.equal(computeEntrantProjection(mcm, years, 10.5, 26000, 30, 1.0).valid, false);
    assert.equal(computeEntrantProjection(mcm, years, 500, -100, 30, 1.0).valid, false);
    assert.equal(computeEntrantProjection(mcm, years, 500, 26000, 105, 1.0).valid, false);
    assert.equal(computeEntrantProjection(mcm, years, 500, 26000, 30, 1.5).valid, false);

    const dom = ReactDOMServer.renderToStaticMarkup(React.createElement(App));

    // Must not contain any unresolved {{ }} template markers
    assert.ok(
      !dom.includes('{{') && !dom.includes('}}'),
      'Rendered DOM contains unresolved {{ }}'
    );

    // Every sidebar navigation target must correspond to a rendered data-section
    for (const item of navItemsList) {
      assert.ok(
        dom.includes(`data-section="${item.id}"`),
        `Sidebar nav target data-section="${item.id}" missing in rendered DOM`
      );
    }

    // Must render the 5 core sections in exact sequence
    const expectedHeadingsInOrder = [
      'Fall Net Tuition Revenue through 2030',
      'Longitudinal Cohort Matrix &amp; Diagonal Census Highlight',
      'Entering class to four-year Net Tuition Revenue (NTR)',
      'Two-Stage Pipeline Architecture &amp; Higher-Ed Terminology Guide',
      'Entering class performance and Net Tuition Revenue at risk',
    ];
    let lastIdx = -1;
    for (const h of expectedHeadingsInOrder) {
      const idx = dom.indexOf(h);
      assert.ok(idx !== -1, `Rendered DOM missing heading: "${h}"`);
      assert.ok(
        idx > lastIdx,
        `Heading "${h}" must appear after previous heading in DOM order`
      );
      lastIdx = idx;
    }

    assert.ok(
      dom.includes('Longitudinal Cohort Matrix &amp; Diagonal Census Highlight'),
      'Rendered DOM must include the Stage 2 Longitudinal Cohort Matrix & Diagonal Census Highlight table'
    );

    // Must render SVG chart labels without <span> wrappers
    const svgTexts = dom.match(/<text[^>]*>[\s\S]*?<\/text>/g) || [];
    assert.ok(
      svgTexts.length >= 6,
      `Expected >= 6 rendered SVG <text> nodes, got ${svgTexts.length}`
    );
    for (const st of svgTexts) {
      assert.ok(!st.includes('<span'), `Rendered SVG <text> contains <span>: ${st}`);
    }
  } finally {
    await vite.close();
  }
});

console.log(`\nRegression Suite Summary: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);

