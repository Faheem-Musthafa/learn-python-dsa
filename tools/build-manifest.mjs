#!/usr/bin/env node
/* Run this after any change to the app or the content, before you commit.
 *
 * 1. Writes content/manifest.js: the list of content files the app loads, in order.
 * 2. Stamps every script and style the page loads with ?v=<hash of its contents>.
 *    GitHub Pages lets browsers keep files for 10 minutes. Without a stamp, a visitor can
 *    get a new page with old scripts after an update. With one, a changed file has a new
 *    address, so the browser must fetch it. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');
/* Line endings are ignored, so Windows and Linux give the same stamp. */
const stamp = rel => crypto.createHash('sha1').update(read(rel).replace(/\r/g, '')).digest('hex').slice(0, 8);

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
const stamped = out.map(f => `${f}?v=${stamp(f)}`);
fs.writeFileSync(path.join(ROOT, 'content/manifest.js'), `window.CONTENT_FILES = ${JSON.stringify(stamped, null, 2)};\n`);

// Stamp what index.html loads. The manifest is stamped last, because its contents just changed.
let html = read('index.html');
let changed = 0;
html = html.replace(/((?:src|href)=")((?:assets|content)\/[^"?]+\.(?:js|css))(?:\?v=[0-9a-f]+)?(")/g, (m, a, file, z) => {
  if (!fs.existsSync(path.join(ROOT, file))) return m;
  changed += 1;
  return `${a}${file}?v=${stamp(file)}${z}`;
});
fs.writeFileSync(path.join(ROOT, 'index.html'), html);
console.log(`manifest: ${out.length} files. index.html: ${changed} files stamped.`);
