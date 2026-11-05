/* Builds the test fixtures by running the app's REAL assets/js/store.js with the REAL course ids, so
 * the schema is tested against what the app actually saves today. It runs before every `npm test`.
 * If store.js gains a field, schema.test.js fails until that field is sorted into a list.
 *
 * The learner here is made up, and the same every time. The output folder is not committed.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const OUT = path.join(HERE, 'generated');

// Free text planted everywhere the app keeps free text. None of it may ever reach the server.
export const CANARY = 'CANARY-a-child-typed-this';

function loadCourse() {
  const walk = (dir, out = []) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p, out);
      else if (e.name.endsWith('.js') && e.name !== 'manifest.js') out.push(p);
    }
    return out;
  };
  const run = f => vm.runInThisContext(fs.readFileSync(f, 'utf8'), { filename: f });
  run(path.join(ROOT, 'assets/js/course.js'));
  run(path.join(ROOT, 'assets/js/viz.js'));
  const rank = f => (f.endsWith('glossary.js') ? 0 : f.includes(`${path.sep}viz${path.sep}`) ? 2 : 1);
  for (const f of walk(path.join(ROOT, 'content')).sort((a, b) => rank(a) - rank(b) || (a < b ? -1 : 1))) run(f);
  const { Course } = globalThis;
  Course.finish();
  return { lessons: Object.keys(Course.lessons), questions: Object.keys(Course.questions), qidsOf: id => Course.lessons[id].qids };
}

function makeStore(startIso) {
  let now = new Date(startIso).getTime();
  const Real = Date;
  class FakeDate extends Real {
    constructor(...a) { if (a.length) super(...a); else super(now); }
    static now() { return now; }
  }
  const saved = {};
  const ctx = {
    Date: FakeDate,
    console,
    setTimeout: () => 0,
    clearTimeout: () => {},
    setInterval: () => 0,
    navigator: {},
    localStorage: {
      getItem: k => (k in saved ? saved[k] : null),
      setItem: (k, v) => { saved[k] = v; },
      removeItem: k => { delete saved[k]; },
    },
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets/js/store.js'), 'utf8'), ctx);
  ctx.Store.load();
  return { Store: ctx.Store, nextDay: () => { now += 86400000; }, plain: () => JSON.parse(JSON.stringify(ctx.Store.state)) };
}

function random(seed) {
  let x = seed >>> 0 || 1;
  return () => {
    x ^= x << 13; x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5; x >>>= 0;
    return x / 4294967296;
  };
}

/* Runs a learner through the app's own Store calls, day by day. */
function simulate({ seed, lessonsToFinish, studyDays, course }) {
  const rand = random(seed);
  const { Store, nextDay, plain } = makeStore('2024-01-01T09:00:00Z');
  const all = Object.fromEntries(course.questions.map(q => [q, 1]));
  let next = 0, day = 0;
  // Each question type keeps its own kind of record. These are the shapes questions.js makes.
  const works = [
    () => ({ o: [1, 0], n: 2, h: 1 }),
    () => ({ x: `${CANARY} my name is Asha`, n: 1 }),
    () => ({ l: [2, 0, 1], n: 1 }),
    () => ({ v: [`${CANARY} box`, ''], m: [1, 0], n: 2 }),
    () => ({ p: [0, 1, 2], n: 1 }),
    () => ({ r: [[1, `${CANARY} print output`], [0, 'expected 3']], k: 0, n: 3 }),
    () => ({ n: 1, h: 2, a: 1 }),
  ];
  while (day < studyDays) {
    if (day % 7 < 5) {
      if (next < lessonsToFinish && day % 2 === 0) {
        const id = course.lessons[next++];
        Store.openLesson(id);
        course.qidsOf(id).forEach((q, i) => {
          if (rand() < 0.1) Store.markHint(q);
          if (rand() < 0.05) Store.markSaw(q, true);
          const ok = rand() > 0.1;
          Store.recordAnswer(q, { ok, reviewable: true, firstTry: true, hinted: rand() < 0.1 });
          const rec = works[i % works.length]();
          if (ok) rec.s = 1;
          else if (rand() < 0.5) rec.c = 1;
          Store.setWork(q, rec);
        });
        if (next % 11 === 0) Store.reopenLesson(id);
        else Store.finishLesson(id);
      }
      Store.dueQuestions(all, 8).list.forEach(q => Store.recordAnswer(q, { ok: rand() > 0.15, reviewable: true, firstTry: true }));
      const today = Store.state.days[Store.dayKey()];
      if (today) today.mins += 15 + Math.floor(rand() * 30);
    }
    nextDay();
    day += 1;
  }
  // Free text everywhere the app can hold it.
  const s = Store.state;
  const first = course.lessons[0], q = course.qidsOf(first)[0];
  s.name = `${CANARY} Asha`;
  s.notes[first] = `${CANARY} my note`;
  s.code[`q:${q}`] = `print("${CANARY}")`;
  s.saved.push(first);
  s.goals.topic = `${CANARY} topic`;
  s.goals.topicBy = '2026-12-01';
  s.lastLesson = first;
  s.prefs.theme = 'dark';
  s.prefs.vizSpeed = 0.5;
  Store.setPlace(first, { a: 'top-block', d: 120 });
  s.onboarded = true;
  Store.save();
  return plain();
}

/* Records which fields really appear, for the drift check in schema.test.js. */
function fieldsOf(state) {
  const keysIn = map => Array.from(new Set(Object.values(map || {}).flatMap(r => Object.keys(r || {})))).sort();
  return {
    top: Object.keys(state).sort(),
    lesson: keysIn(state.lessons),
    answer: keysIn(state.answers),
    day: keysIn(state.days),
    work: keysIn(state.work),
    goals: Object.keys(state.goals).sort(),
    prefs: Object.keys(state.prefs).sort(),
  };
}

const course = loadCourse();
const typical = simulate({ seed: 7, lessonsToFinish: 30, studyDays: 90, course });
const finished = simulate({ seed: 11, lessonsToFinish: course.lessons.length, studyDays: 3 * 365, course });

fs.mkdirSync(OUT, { recursive: true });
const write = (name, value) => fs.writeFileSync(path.join(OUT, name), JSON.stringify(value));
write('typical-state.json', typical);
write('finished-state.json', finished);
write('course-ids.json', { lessons: course.lessons, questions: course.questions });
// Fields can come from either learner, so check both.
const seen = [fieldsOf(typical), fieldsOf(finished)].reduce((a, b) => Object.fromEntries(Object.keys(a).map(k => [k, Array.from(new Set([...a[k], ...b[k]])).sort()])));
write('fields-seen.json', seen);
console.log(`fixtures: ${course.lessons.length} lessons, ${course.questions.length} questions from the real course`);
process.exit(0);
