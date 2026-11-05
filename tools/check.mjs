#!/usr/bin/env node
/* The course's quality gate. Run it after every change to the content.
 *
 *   node tools/check.mjs                  check everything
 *   node tools/check.mjs --only m03       check one module (id contains m03)
 *   node tools/check.mjs --no-python      skip running Python (fast)
 *   node tools/check.mjs --verbose        all warnings and a table per lesson
 *   node tools/check.mjs --pyodide        run Python in Pyodide, the Python 3.13 learners really get
 *   node tools/check.mjs --compare        run both and list every program whose result differs
 *   node tools/check.mjs --dump-jobs f    write every program to a JSON file, for a browser test
 *
 * ERRORS must be fixed. WARNINGS should be fixed unless there is a good reason.
 * Every Python program in the course is really run, so outputs and answers are true.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawn } from 'node:child_process';
import { Worker } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const noPython = args.includes('--no-python');
const verbose = args.includes('--verbose');
const compare = args.includes('--compare');
const usePyodide = args.includes('--pyodide') || compare;
const dumpTo = args.includes('--dump-jobs') ? args[args.indexOf('--dump-jobs') + 1] : null;

const errors = [], warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

// ------------------------------------------------------------ load everything
function contentFiles() {
  const out = [];
  const walk = d => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.js') && e.name !== 'manifest.js') out.push(p);
    }
  };
  walk(path.join(ROOT, 'content'));
  const rank = f => (f.endsWith('glossary.js') ? 0 : f.includes(`${path.sep}viz${path.sep}`) ? 2 : 1);
  return out.sort((a, b) => rank(a) - rank(b) || (a < b ? -1 : 1));
}
const run = file => vm.runInThisContext(fs.readFileSync(file, 'utf8'), { filename: file });
run(path.join(ROOT, 'assets/js/course.js'));
run(path.join(ROOT, 'assets/js/viz.js'));
const { Course, Viz } = globalThis;

const files = contentFiles();
for (const f of files) {
  try { run(f); }
  catch (e) { err(path.relative(ROOT, f), `file failed to load: ${e.message}`); }
}
Course.finish();

const inScope = m => !only || m.id.includes(only);

// --------------------------------------------------------------- text checks
const BANNED = ['simply', 'just', 'easy', 'easily', 'obviously', 'trivial', 'clearly', 'basically', 'of course', 'merely'];
const stripMarks = s => String(s)
  .replace(/`[^`]*`/g, 'code')
  .replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, '$1')
  .replace(/\*\*/g, '');
const sentencesOf = s => stripMarks(s).split(/(?<=[.!?:])\s+/).map(x => x.trim()).filter(Boolean);
const wordsOf = s => s.split(/\s+/).filter(w => /[A-Za-z0-9]/.test(w));
function syllables(w) {
  w = w.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length <= 3) return 1;
  w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
  const m = w.match(/[aeiouy]{1,2}/g);
  return m ? m.length : 1;
}
function lintText(where, text, stats) {
  if (!text) return;
  const raw = String(text);
  const plain = stripMarks(raw);
  for (const b of BANNED) {
    if (new RegExp(`\\b${b}\\b`, 'i').test(plain)) warn(where, `avoid the word "${b}": "${plain.slice(0, 70)}"`);
  }
  if (/—/.test(raw)) warn(where, `no em dashes: "${plain.slice(0, 60)}"`);
  for (const sen of sentencesOf(raw)) {
    const ws = wordsOf(sen), n = ws.length;
    if (stats) {
      stats.sent += 1; stats.words += n;
      for (const w of ws) stats.syll += syllables(w);
    }
    if (n > 24) err(where, `sentence has ${n} words (hard limit 24): "${sen.slice(0, 90)}"`);
    else if (n > 16) warn(where, `sentence has ${n} words (limit 16): "${sen.slice(0, 90)}"`);
  }
  const re = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  let m;
  while ((m = re.exec(raw))) {
    const key = (m[2] || m[1]).toLowerCase();
    if (!Course.glossary[key]) err(where, `[[${m[2] || m[1]}]] is not in the word list. Add a words block first.`);
  }
}

// ------------------------------------------------------------- python runner
const jobs = [];
const addJob = (where, code, opts, check) => jobs.push({ where, code, opts: opts || {}, check });
function runPy(job) {
  return new Promise(resolve => {
    const child = spawn('python', ['-I', path.join(ROOT, 'tools/run_job.py')], { stdio: ['pipe', 'pipe', 'pipe'] });
    let out = '', errText = '', finished = false;
    const timer = setTimeout(() => {
      if (finished) return;
      finished = true;
      child.kill();
      resolve({ timedOut: true, out: '', error: null, tests: [] });
    }, job.opts.timeout || 8000);
    child.stdout.on('data', d => { out += d; });
    child.stderr.on('data', d => { errText += d; });
    child.on('close', () => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      try { resolve(JSON.parse(out)); }
      catch (e) { resolve({ crash: errText || out || 'no output', out: '', error: null, tests: [] }); }
    });
    child.stdin.end(JSON.stringify({ code: job.code, stdin: job.opts.stdin, tests: job.opts.tests }));
  });
}

/* Pyodide runs in worker threads, so a program that never ends can be stopped. */
let pyVersion = '';
function newPyodideWorker() {
  const w = new Worker(path.join(ROOT, 'tools/pyodide_worker.mjs'), { workerData: { root: ROOT } });
  w.ready = new Promise((resolve, reject) => {
    w.once('error', reject);
    w.once('message', m => { pyVersion = m.version; resolve(); });
  });
  return w;
}
function runPyodide(slot, job) {
  return new Promise(async resolve => {
    if (!slot.worker) slot.worker = newPyodideWorker();
    await slot.worker.ready;
    const w = slot.worker;
    const timer = setTimeout(() => {
      w.removeAllListeners('message');
      w.terminate();
      slot.worker = null;
      resolve({ timedOut: true, out: '', error: null, tests: [] });
    }, job.opts.timeout || 8000);
    w.once('message', m => { clearTimeout(timer); resolve(m.result); });
    w.postMessage({ code: job.code, stdin: job.opts.stdin, tests: job.opts.tests });
  });
}
const sameResult = (a, b) => {
  const shape = r => JSON.stringify({
    out: norm(r.out || ''), timedOut: !!r.timedOut,
    error: r.error ? [r.error.type, r.error.line, r.error.msg] : null,
    tests: (r.tests || []).map(t => [t.label, !!t.ok, !!t.skipped, t.got, t.want, t.crash || null]),
  });
  return shape(a) === shape(b);
};

const norm = s => String(s).replace(/\r/g, '').split('\n').map(l => l.replace(/\s+$/, '')).join('\n').replace(/\n+$/, '');
const describeErr = r => (r.timedOut ? 'ran too long' : r.crash ? `harness crash: ${String(r.crash).slice(0, 200)}` : r.error ? `${r.error.type} on line ${r.error.line}: ${r.error.msg}` : 'no error');
const passes = (r, q) => !r.error && !r.timedOut && !r.crash && (r.tests || []).every(t => t.ok) && (q.wantOutput == null || norm(r.out) === norm(q.wantOutput));

// ----------------------------------------------------------------- questions
const TYPES = new Set(['mcq', 'predict', 'order', 'fill', 'fix', 'write', 'trace', 'match']);
function checkQuestion(where, q, stats) {
  const w = `${where} q:${q.id || '?'}`;
  if (!q.id) err(w, 'question needs an id');
  if (!TYPES.has(q.type)) return err(w, `unknown type "${q.type}"`);
  lintText(w, q.q, stats);
  lintText(w, q.explain, stats);
  (q.hints || []).forEach(h => lintText(w, h, stats));
  if (!q.explain) err(w, 'needs explain (why the answer is right)');
  if (!q.hints || !q.hints.length) warn(w, 'add at least one hint');
  if (q.level && ![1, 2, 3].includes(q.level)) err(w, 'level must be 1, 2 or 3');
  if (q.hint) err(w, 'use hints: [...], not hint');

  switch (q.type) {
    case 'mcq':
    case 'predict': {
      if (q.type === 'mcq' && !q.q) err(w, 'mcq needs q');
      if (q.type === 'predict' && !q.code) err(w, 'predict needs code');
      if (q.options) {
        if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) err(w, 'answer must be the index of the right option');
        if (q.options.length < 2 || q.options.length > 4) warn(w, 'use 3 or 4 options');
        const texts = new Set();
        q.options.forEach((o, i) => {
          const text = typeof o === 'string' ? o : o.text;
          if (texts.has(text)) err(w, `two options say the same: "${text}"`);
          texts.add(text);
          if (q.type === 'mcq') lintText(w, text, stats);
          const why = typeof o === 'object' && o.why ? o.why : (q.why && q.why[i]);
          if (i !== q.answer) {
            if (!why) err(w, `wrong option "${String(text).slice(0, 30)}" needs a why (the mistake behind it)`);
            else lintText(w, why, stats);
          }
        });
      } else if (q.type === 'mcq') err(w, 'mcq needs options');
      else if (q.answer == null) err(w, 'predict needs options or an answer');
      if (q.type === 'predict' && q.code) {
        const want = q.options ? (typeof q.options[q.answer] === 'string' ? q.options[q.answer] : (q.options[q.answer] || {}).text) : q.answer;
        addJob(w, q.code, { stdin: q.stdin }, r => {
          if (q.expectError) {
            if (!r.error) return err(w, 'expectError is set but the code ran fine');
            if (!String(want).includes(r.error.type)) err(w, `answer should name ${r.error.type}`);
            return;
          }
          if (r.error || r.timedOut || r.crash) return err(w, `code fails: ${describeErr(r)}`);
          if (norm(r.out) !== norm(want)) err(w, `the real output is ${JSON.stringify(norm(r.out))} but the answer says ${JSON.stringify(norm(want))}`);
        });
      }
      break;
    }
    case 'order': {
      if (!q.lines || q.lines.length < 2) return err(w, 'order needs lines');
      if (q.lines.length > 9) warn(w, 'order works best with 3 to 8 lines');
      if (q.run !== false) {
        addJob(w, q.lines.join('\n'), { stdin: q.stdin }, r => {
          if (r.error || r.timedOut || r.crash) return err(w, `the lines in order fail: ${describeErr(r)}`);
          if (q.output != null && norm(r.out) !== norm(q.output)) err(w, `real output is ${JSON.stringify(norm(r.out))} but output says ${JSON.stringify(norm(q.output))}`);
        });
      }
      break;
    }
    case 'fill': {
      const gaps = (String(q.code || '').match(/____/g) || []).length;
      if (!gaps) return err(w, 'fill needs ____ in code');
      if (!q.blanks || q.blanks.length !== gaps) return err(w, `fill has ${gaps} gaps but ${q.blanks ? q.blanks.length : 0} blanks`);
      let i = 0;
      const code = q.code.replace(/____/g, () => [].concat(q.blanks[i++])[0]);
      addJob(w, code, { stdin: q.stdin }, r => {
        if (r.error || r.timedOut || r.crash) return err(w, `filled code fails: ${describeErr(r)}`);
        if (q.output != null && norm(r.out) !== norm(q.output)) err(w, `real output is ${JSON.stringify(norm(r.out))} but output says ${JSON.stringify(norm(q.output))}`);
      });
      break;
    }
    case 'fix':
    case 'write': {
      if (!q.answer) return err(w, `${q.type} needs answer`);
      const hasChecks = (q.tests && q.tests.length) || q.wantOutput != null;
      if (!hasChecks) err(w, `${q.type} needs tests or wantOutput so it can be marked`);
      addJob(w, q.answer, { stdin: q.stdin, tests: q.tests }, r => {
        if (!passes(r, q)) {
          const bad = (r.tests || []).filter(t => !t.ok).map(t => `${t.label}: got ${t.got}, want ${t.want}${t.crash ? ' ' + t.crash : ''}`).join('; ');
          err(w, `the ANSWER does not pass: ${describeErr(r)} ${bad}`);
        }
      });
      const start = q.type === 'fix' ? q.code : q.starter;
      if (q.type === 'fix' && !q.code) err(w, 'fix needs code (the buggy program)');
      if (start != null && hasChecks) {
        addJob(w, start, { stdin: q.stdin, tests: q.tests }, r => {
          if (passes(r, q)) err(w, `the ${q.type === 'fix' ? 'buggy code' : 'starter code'} already passes, so the checks prove nothing`);
        });
      }
      break;
    }
    case 'trace': {
      if (!q.code || !q.head || !q.rows) return err(w, 'trace needs code, head and rows');
      if (!q.verify) err(w, 'trace needs verify: Python that prints each row');
      q.rows.forEach((r, i) => { if (r.length !== q.head.length) err(w, `row ${i} has ${r.length} cells, head has ${q.head.length}`); });
      if (q.verify) {
        addJob(w, q.verify, {}, r => {
          if (r.error || r.timedOut || r.crash) return err(w, `verify fails: ${describeErr(r)}`);
          const want = q.rows.map(row => row.join(' ')).join('\n');
          if (norm(r.out) !== norm(want)) err(w, `verify printed ${JSON.stringify(norm(r.out))} but rows say ${JSON.stringify(want)}`);
        });
      }
      break;
    }
    case 'match':
      if (!q.pairs || q.pairs.length < 2) return err(w, 'match needs pairs');
      q.pairs.forEach(p => { lintText(w, p[0], stats); lintText(w, p[1], stats); });
      if (new Set(q.pairs.map(p => p[1])).size !== q.pairs.length) err(w, 'each right-hand item must be different');
      break;
  }
}

// -------------------------------------------------------------------- lessons
const lessonIds = new Set();
const vizUsed = new Set();
const BLOCKS = new Set(['h', 'p', 'list', 'words', 'analogy', 'big', 'tip', 'trap', 'steps', 'table', 'cost', 'code', 'viz', 'q']);
const lessonStats = [];
const vizOwner = {};
for (const f of files) {
  const re = /Viz\.register\(\s*['"]([^'"]+)['"]/g;
  const text = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = re.exec(text))) vizOwner[m[1]] = path.relative(ROOT, f);
}

for (const m of Course.modules) {
  if (!m.id || !m.num || !m.title || !m.part) err(`module ${m.id}`, 'needs id, num, part and title');
  if (!m.blurb) warn(`module ${m.id}`, 'needs a blurb');
  if (!m.lessons.length && inScope(m)) warn(`module ${m.id}`, 'has no lessons yet');
}
for (const m of Course.modules) {
  for (const l of m.lessons) {
    const where = `${m.id}/${l.id}`;
    if (lessonIds.has(l.id)) err(where, 'lesson id is used twice');
    lessonIds.add(l.id);
    if (!/^[a-z0-9-]+$/.test(l.id)) err(where, 'lesson id must be lower-case letters, digits and hyphens');
    if (!inScope(m)) { (l.steps || []).forEach(b => { if (b.t === 'viz') vizUsed.add(b.name); }); continue; }

    const stats = { sent: 0, words: 0, syll: 0 };
    if (!l.num || !l.title || !l.goal) err(where, 'needs num, title and goal');
    lintText(where, l.title, null);
    lintText(where, l.goal, stats);
    if (!l.steps || !l.steps.length) { err(where, 'needs steps'); continue; }
    if (!l.recap || l.recap.length < 2) warn(where, 'recap needs about 3 points');
    (l.recap || []).forEach(r => lintText(where + ' recap', r, stats));

    const qids = new Set();
    const addQ = q => { if (qids.has(q.id)) err(where, `question id ${q.id} is used twice`); qids.add(q.id); };
    let vizCount = 0, inlineQ = 0, runCode = 0, interacted = false, wordsBefore = 0;
    const kinds = {};
    const seenWords = new Set();

    l.steps.forEach((b, n) => {
      const w = `${where} step ${n}`;
      if (!BLOCKS.has(b.t)) return err(w, `unknown block type "${b.t}"`);
      if (['viz', 'q', 'code'].includes(b.t)) interacted = true;
      if (!interacted && b.text) wordsBefore += wordsOf(stripMarks(b.text)).length;
      switch (b.t) {
        case 'h': lintText(w, b.text, null); break;
        case 'p': case 'big': case 'tip': case 'analogy':
          lintText(w, b.text, stats);
          if (wordsOf(stripMarks(b.text)).length > 60) warn(w, 'paragraph is over 60 words. Split it.');
          break;
        case 'list': (b.items || []).forEach(i => lintText(w, i, stats)); break;
        case 'trap':
          if (!b.think || !b.real) err(w, 'trap needs think and real');
          lintText(w, b.think, stats); lintText(w, b.real, stats);
          break;
        case 'words':
          (b.items || []).forEach(i => {
            if (!i.word || !i.means) err(w, 'words items need word and means');
            seenWords.add(String(i.word).toLowerCase());
            lintText(w, i.means, stats);
          });
          if ((b.items || []).length > 3) warn(w, 'more than 3 new words in one lesson');
          break;
        case 'table':
          if (!b.head || !b.rows) err(w, 'table needs head and rows');
          (b.rows || []).forEach(r => { if (r.length !== b.head.length) err(w, 'a table row has the wrong number of cells'); });
          break;
        case 'steps':
          (b.items || []).forEach(s => {
            if (!s.label) err(w, 'steps items need label');
            else if (/^\s*[a-z]+\s*\d+\s*[:.)-]/i.test(s.label)) err(w, `label "${s.label}" starts with its own number. The page adds "Step 1:" itself. Write only the words, and use noun for another word.`);
            lintText(w, s.text, stats);
          });
          break;
        case 'cost': (b.items || []).forEach(s => { if (!s.op || !s.cost || !s.why) err(w, 'cost items need op, cost and why'); }); break;
        case 'code':
          if (!b.code) { err(w, 'code needs code'); break; }
          for (const line of b.code.split('\n')) if (line.length > 56) warn(w, `line over 56 characters is hard on a phone: ${line.slice(0, 40)}...`);
          if (b.run !== false) {
            runCode += 1;
            addJob(w, b.code, { stdin: b.stdin, timeout: b.timeout }, r => {
              if (b.error) { if (!r.error) err(w, 'error: true but the code ran fine'); return; }
              if (r.error || r.timedOut || r.crash) return err(w, `code fails: ${describeErr(r)}`);
              if (b.output != null && norm(r.out) !== norm(b.output)) err(w, `real output is ${JSON.stringify(norm(r.out))} but output says ${JSON.stringify(norm(b.output))}`);
            });
            if (b.output == null && !b.error) warn(w, 'add output, so the lesson still works if Python cannot load');
          }
          break;
        case 'viz':
          vizCount += 1;
          vizUsed.add(b.name);
          if (!Viz.registry[b.name]) err(w, `no visual called "${b.name}"`);
          break;
        case 'q':
          inlineQ += 1;
          kinds[b.type] = (kinds[b.type] || 0) + 1;
          addQ(b);
          checkQuestion(where, b, stats);
          break;
      }
    });
    (l.practice || []).forEach(q => {
      addQ(q);
      kinds[q.type] = (kinds[q.type] || 0) + 1;
      checkQuestion(where, q, stats);
    });

    if (wordsBefore > 170) warn(where, `${wordsBefore} words before the first picture, code or question (aim for 150)`);
    if (!vizCount) warn(where, 'has no moving picture');
    if (inlineQ < 2) warn(where, `only ${inlineQ} questions inside the lesson (aim for 3)`);
    if ((l.practice || []).length < 5) warn(where, `only ${(l.practice || []).length} practice questions (aim for 5 to 7)`);
    if (!runCode) warn(where, 'has no runnable code');
    if (!kinds.write && !kinds.fix) warn(where, 'practice should include a write or fix question');
    const levels = new Set((l.practice || []).map(q => q.level));
    if ((l.practice || []).length && !levels.has(3)) warn(where, 'practice should include a Stretch question (level 3)');
    const avg = stats.sent ? stats.words / stats.sent : 0;
    const grade = stats.sent ? 0.39 * avg + 11.8 * (stats.syll / stats.words) - 15.59 : 0;
    if (grade > 6.5) warn(where, `reading grade is about ${grade.toFixed(1)} (aim for 5)`);
    if (avg > 12) warn(where, `average sentence is ${avg.toFixed(1)} words (aim for 10)`);
    lessonStats.push({ lesson: l.id, grade: +grade.toFixed(1), avg: +avg.toFixed(1), viz: vizCount, inline_q: inlineQ, practice: (l.practice || []).length, run: runCode });
  }
}

// --------------------------------------------------------------------- visuals
for (const [name, def] of Object.entries(Viz.registry)) {
  const owner = vizOwner[name] || '';
  if (only && !owner.includes(only) && !(vizUsed.has(name) && name !== 'hero-sort' && owner === '')) continue;
  const w = `viz ${name}`;
  if (!def.title) warn(w, 'add a title');
  if (typeof def.build !== 'function') { err(w, 'needs build(s, p)'); continue; }
  let scene;
  try { scene = Viz.build(name); }
  catch (e) { err(w, `build crashed: ${e.message}`); continue; }
  const [W, H] = def.size || [560, 260];
  const frames = scene.frames;
  // The stage fits itself to the content of all frames, so only the content's real width matters.
  const fitted = Viz.fitScene(frames, [W, H]);
  if (fitted.w > 620) warn(w, `the content spans ${fitted.w} units. Keep it to 620 or less so text stays readable on phones.`);
  const codeLines = def.code ? def.code.split('\n').length : 0;
  if (frames.length > 35) warn(w, `${frames.length} frames is long. Use a smaller example (aim for 35 or fewer).`);
  let asks = 0;
  frames.forEach((f, i) => {
    const fw = `${w} frame ${i}`;
    const ids = new Set(f.items.map(x => x.id));
    for (const it of f.items) {
      if (it.kind === 'edge') {
        if (!ids.has(it.from) || !ids.has(it.to)) err(fw, `edge ${it.id} joins a missing item (${it.from} to ${it.to})`);
        continue;
      }
      if (!Number.isFinite(it.x) || !Number.isFinite(it.y)) err(fw, `${it.id} has a bad position`);
      // Box and circle values use a code font: each letter is 0.6 of the font size wide.
      if ((it.kind === 'box' || it.kind === 'circle') && it.text) {
        const need = it.text.length * 0.6 * (it.size || 19);
        const room = it.kind === 'box' ? (it.w || 52) - 4 : 2 * (it.r || 24) * 0.92;
        if (need > room) err(fw, `"${it.text}" needs ${Math.round(need)} wide but ${it.id} has room for ${Math.round(room)}. Make the shape wider or set a smaller size.`);
      }
    }
    for (const c of f.cues || []) {
      const kinds = { compare: 2, carry: 2, discard: 1, found: 1, wave: 1, quiet: 0 };
      if (!(c[0] in kinds)) { err(fw, `cue "${c[0]}" is not one of ${Object.keys(kinds).join(', ')}`); continue; }
      for (const arg of c.slice(1, 1 + kinds[c[0]])) for (const id of [].concat(arg)) if (!ids.has(String(id))) err(fw, `cue ${c[0]} names ${id}, which is not in this frame`);
    }
    lintText(fw, f.say, null);
    if (f.say && wordsOf(stripMarks(f.say)).length > 20) warn(fw, 'narration over 20 words. Keep each step short.');
    if (f.line && (f.line < 1 || f.line > codeLines)) err(fw, `line ${f.line} is outside the code (${codeLines} lines)`);
    if (f.ask) {
      asks += 1;
      if (!f.ask.q || !Array.isArray(f.ask.options) || f.ask.answer == null || f.ask.answer >= f.ask.options.length) err(fw, 'ask needs q, options and a valid answer index');
      if (!f.ask.why) err(fw, 'ask needs why');
    }
  });
  // A picture with fixed code must show what that code really prints.
  const lastOut = [...frames].reverse().find(f => f.out != null);
  if (lastOut && def.code && !(def.inputs || []).length && !/\binput\s*\(/.test(def.code)) {
    addJob(w, def.code, {}, r => {
      const real = r.error ? `${norm(r.out)}\n${r.error.type}` : norm(r.out);
      const shown = norm(lastOut.out);
      if (r.error ? !shown.includes(r.error.type) : shown !== real) warn(w, `the last frame shows ${JSON.stringify(shown)} but the code prints ${JSON.stringify(real)}`);
    });
  }
  if (frames.length > 3 && !asks) warn(w, 'has no guess-what-happens-next question. Add ask to a frame.');
  if (frames.length > 12 && asks < 2) warn(w, 'long picture needs a guess every 3 to 5 steps');
  (def.inputs || []).forEach(inp => {
    if (!inp.key || !inp.label) err(w, 'each input needs key and label');
    if (inp.type === 'number' && (inp.min == null || inp.max == null)) err(w, `number input ${inp.key} needs min and max. The page holds typed values inside them.`);
  });
  (def.tryInputs || []).forEach((params, n) => {
    try { Viz.build(name, params); }
    catch (e) { err(w, `crashed on tryInputs[${n}]: ${e.message}`); }
  });
  if (!vizUsed.has(name) && name !== 'hero-sort') warn(w, 'no lesson uses this visual');
}

// ----------------------------------------------------------------- run python
if (dumpTo) {
  fs.writeFileSync(dumpTo, JSON.stringify(jobs.map(j => ({ where: j.where, code: j.code, stdin: j.opts.stdin, tests: j.opts.tests, timeout: j.opts.timeout }))));
  console.log(`Wrote ${jobs.length} programs to ${dumpTo}.`);
}
if (!noPython && jobs.length) {
  const started = Date.now();
  let at = 0;
  const diffs = [];
  await Promise.all(Array.from({ length: usePyodide ? 4 : 8 }, async () => {
    const slot = { worker: null };
    while (at < jobs.length) {
      const j = jobs[at++];
      const r = usePyodide ? await runPyodide(slot, j) : await runPy(j);
      j.check(r);
      if (compare) {
        const other = await runPy(j);
        if (!sameResult(r, other)) diffs.push({ where: j.where, code: j.code, pyodide: r, python: other });
      }
    }
    if (slot.worker) await slot.worker.terminate();
  }));
  console.log(`Ran ${jobs.length} Python programs ${usePyodide ? `in Pyodide (Python ${pyVersion}) ` : ''}in ${((Date.now() - started) / 1000).toFixed(1)} s.`);
  if (compare) {
    console.log(`\nProgram results that differ from the local python: ${diffs.length}`);
    for (const d of diffs) {
      console.log(`  ${d.where}`);
      console.log(`    Pyodide: ${JSON.stringify({ out: d.pyodide.out, error: d.pyodide.error, timedOut: d.pyodide.timedOut, tests: d.pyodide.tests }).slice(0, 400)}`);
      console.log(`    python:  ${JSON.stringify({ out: d.python.out, error: d.python.error, timedOut: d.python.timedOut, tests: d.python.tests }).slice(0, 400)}`);
    }
  }
}

// ------------------------------------------------------------------------ report
const total = Course.modules.reduce((a, m) => a + m.lessons.length, 0);
console.log(`Course: ${Course.modules.length} modules, ${total} lessons, ${Object.keys(Course.questions).length} questions, ${Object.keys(Viz.registry).length} visuals, ${Object.keys(Course.glossary).length} words.`);
if (verbose || only) console.table(lessonStats.filter(r => !only || r.lesson.startsWith(only.replace(/^m0?/, '')) || true));
if (warnings.length) {
  console.log(`\nWARNINGS (${warnings.length}):`);
  warnings.slice(0, verbose ? 500 : 40).forEach(x => console.log('  ' + x));
  if (!verbose && warnings.length > 40) console.log(`  ...and ${warnings.length - 40} more. Use --verbose to see them.`);
}
if (errors.length) {
  console.log(`\nERRORS (${errors.length}):`);
  errors.slice(0, 200).forEach(x => console.log('  ' + x));
  process.exitCode = 1;
} else {
  console.log('\nNo errors.');
}
