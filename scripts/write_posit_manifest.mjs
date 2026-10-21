#!/usr/bin/env node
/**
 * Generates a Posit Connect / RStudio Connect static deployment manifest
 * (`dist/manifest.json`) with MD5 file checksums so `dist/` can be deployed
 * directly to Posit Connect (Option 4) without requiring R's `rsconnect`.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '..', 'dist');

if (!fs.existsSync(distDir)) {
  console.error('Error: dist/ directory does not exist. Run `npm run build` first.');
  process.exit(1);
}

function collectFiles(dir, baseDir = dir, map = {}) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(fullPath, baseDir, map);
    } else if (entry.isFile() && entry.name !== 'manifest.json') {
      const relPath = path.relative(baseDir, fullPath).split(path.sep).join('/');
      const buf = fs.readFileSync(fullPath);
      const checksum = crypto.createHash('md5').update(buf).digest('hex');
      map[relPath] = { checksum };
    }
  }
  return map;
}

const files = collectFiles(distDir);
const manifest = {
  version: 1,
  locale: 'en_US.UTF-8',
  metadata: {
    appmode: 'static',
    primary_rmd: null,
    primary_html: 'index.html',
    content_category: 'site',
    has_parameters: false,
  },
  packages: null,
  files,
  users: null,
};

const manifestPath = path.join(distDir, 'manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(
  `✓ Wrote Posit Connect static manifest to ${manifestPath} (${Object.keys(files).length} files indexed)`
);
