#!/usr/bin/env node
/* Writes content/manifest.js: the list of content files the app loads, in order.
 * Run it after adding or renaming a content file. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = [];
const walk = d => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.js') && e.name !== 'manifest.js') out.push(path.relative(ROOT, p).split(path.sep).join('/'));
  }
};
walk(path.join(ROOT, 'content'));
// The word list loads first. Visuals load last, so lessons can use them.
const rank = f => (f.endsWith('glossary.js') ? 0 : f.includes('/viz/') ? 2 : 1);
out.sort((a, b) => rank(a) - rank(b) || (a < b ? -1 : a > b ? 1 : 0));
fs.writeFileSync(path.join(ROOT, 'content/manifest.js'), `window.CONTENT_FILES = ${JSON.stringify(out, null, 2)};\n`);
console.log(`manifest: ${out.length} files`);
