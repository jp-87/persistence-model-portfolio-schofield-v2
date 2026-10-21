#!/usr/bin/env node
/**
 * Bundles the compiled Vite output (`dist/index.html` + `dist/assets/*` + `dist/figures/*`)
 * into a single, zero-dependency, self-contained HTML file:
 *   `dist/student-persistence-model-standalone.html`
 *
 * This file can be opened directly from a local disk (`file://`), shared via
 * email/SharePoint/Canvas, or hosted on any static file server with zero setup.
 */
import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve(process.cwd(), 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexHtmlPath)) {
  console.error('Error: dist/index.html not found. Run `npm run build` first.');
  process.exit(1);
}

// Build a lookup table of base64 Data URIs for all PNG figures in dist/figures/
const figuresDir = path.join(distDir, 'figures');
const figureDataUris = {};
if (fs.existsSync(figuresDir)) {
  for (const file of fs.readdirSync(figuresDir)) {
    if (file.endsWith('.png')) {
      const b64 = fs.readFileSync(path.join(figuresDir, file)).toString('base64');
      figureDataUris[`figures/${file}`] = `data:image/png;base64,${b64}`;
      figureDataUris[`./figures/${file}`] = `data:image/png;base64,${b64}`;
      figureDataUris[`/figures/${file}`] = `data:image/png;base64,${b64}`;
    }
  }
}

function inlineFigurePaths(str) {
  let out = str;
  for (const [figPath, dataUri] of Object.entries(figureDataUris)) {
    out = out.split(`"${figPath}"`).join(`"${dataUri}"`);
    out = out.split(`'${figPath}'`).join(`'${dataUri}'`);
  }
  return out;
}

let html = fs.readFileSync(indexHtmlPath, 'utf8');

// Inline <link rel="stylesheet" ... href="./assets/...">
html = html.replace(
  /<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi,
  (fullMatch, href) => {
    const cleanRel = href.replace(/^\.?\//, '');
    const cssPath = path.join(distDir, cleanRel);
    if (!fs.existsSync(cssPath)) return fullMatch;
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    return `<style>\n${cssContent}\n</style>`;
  }
);

// Inline <script type="module" crossorigin src="./assets/..."></script>
html = html.replace(
  /<script\s+[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi,
  (fullMatch, src) => {
    const cleanRel = src.replace(/^\.?\//, '');
    const jsPath = path.join(distDir, cleanRel);
    if (!fs.existsSync(jsPath)) return fullMatch;
    const jsContent = inlineFigurePaths(
      fs.readFileSync(jsPath, 'utf8').replace(/<\/script>/gi, '<\\/script>')
    );
    return `<script type="module">\n${jsContent}\n</script>`;
  }
);

html = inlineFigurePaths(html);

const outPath = path.join(distDir, 'student-persistence-model-standalone.html');
fs.writeFileSync(outPath, html, 'utf8');

const sizeKb = (fs.statSync(outPath).size / 1024).toFixed(1);
console.log(
  `Wrote standalone single-file visual model: dist/student-persistence-model-standalone.html (${sizeKb} KB, ${Object.keys(figureDataUris).length / 2} PNG figures inlined)`
);
