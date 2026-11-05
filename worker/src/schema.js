/* The one and only list of what Stepwise may send to the sync server.
 *
 * Learners may be children, so the rule is a whitelist: a field is here only if it is a number,
 * a yes/no, a date or a word from a fixed list, and so cannot hold anything a person typed.
 * Anything else is refused. Never add a string field that is not an enum or a date.
 *
 * This file has no imports, so the browser can load it too:
 *     const Sync = await import('./worker/src/schema.js');
 *
 * Left out on purpose. Each of these could hold free text, or says nothing about progress:
 *   name, notes, code, saved, place, backup, pausedUntil, onboarded, created, lastLesson,
 *   goals.topic, goals.topicBy, work.x (typed answer), work.v (filled boxes), work.r (run output).
 */

export const SCHEMA_VERSION = 1;

export const LIMITS = Object.freeze({
  wireBytes: 64 * 1024,      // Bytes of request body, as sent. Gzip is allowed, see docs/SYNC.md.
  jsonBytes: 1024 * 1024,    // Bytes of JSON after gunzip. Stops a small file that unpacks to a huge one.
  lessons: 600,              // The course has 125 today.
  answers: 5000,             // The course has 1,327 today.
  work: 5000,
  days: 4000,                // Almost 11 years of daily study.
  okDays: 64,
  indexList: 200,
  lessonIdLength: 64,
  questionIdLength: 128,
  counter: 1000000,
  minutesPerDay: 1440,
  box: 32,
  version: 99,
  epochMs: 4102444800000,    // The year 2100.
});

const SLUG = '[a-z0-9]+(?:-[a-z0-9]+)*';
export const ID_PATTERN = /^[0-9a-f]{32,64}$/;        // The learner's random id, lower-case hex.
export const KEY_PATTERN = /^[0-9a-f]{32,128}$/;      // The learner's random secret, lower-case hex.
export const LESSON_ID_PATTERN = new RegExp(`^${SLUG}$`);
export const QUESTION_ID_PATTERN = new RegExp(`^${SLUG}/${SLUG}$`);
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// These fit the slug pattern but must never be used as object keys.
const RESERVED = new Set(['constructor', 'prototype']);

export function isDate(s) {
  if (typeof s !== 'string' || !DATE_PATTERN.test(s)) return false;
  const y = Number(s.slice(0, 4)), m = Number(s.slice(5, 7)), d = Number(s.slice(8, 10));
  if (y < 2000 || y > 2100) return false;
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
}
export const isLessonId = s => typeof s === 'string' && s.length <= LIMITS.lessonIdLength && LESSON_ID_PATTERN.test(s) && !RESERVED.has(s);
export const isQuestionId = s => typeof s === 'string' && s.length <= LIMITS.questionIdLength && QUESTION_ID_PATTERN.test(s);
const isBox = x => !!x && typeof x === 'object' && !Array.isArray(x);

// ---------------------------------------------------------------- field checks
const int = max => v => Number.isInteger(v) && v >= 0 && v <= max;
const counter = int(LIMITS.counter);
const bool = v => typeof v === 'boolean';
const oneOf = (...list) => v => list.includes(v);
const dateOrNull = v => v === null || isDate(v);
const flag = v => v === 0 || v === 1 || typeof v === 'boolean';
const listOf = (each, max) => v => Array.isArray(v) && v.length <= max && v.every(each);

/* Each table is one record's whole shape. A field that is not listed is refused. */
const LESSON_FIELDS = {
  status: oneOf('open', 'done'),
  openedAt: dateOrNull,
  doneAt: dateOrNull,
  last: dateOrNull,
  undone: bool,
};
const ANSWER_FIELDS = {
  tries: counter,
  ok: counter,
  hints: counter,
  saw: v => typeof v === 'boolean' || dateOrNull(v), // false until seen, then the date.
  box: int(LIMITS.box),
  due: dateOrNull,
  last: dateOrNull,
  slip: dateOrNull,
  okDays: listOf(isDate, LIMITS.okDays),
};
const DAY_FIELDS = {
  mins: int(LIMITS.minutesPerDay),
  acts: counter,
  lessons: counter,
  qs: counter,
};
/* The learner's place in a question. Only the parts that are numbers: never x, v or r. */
const WORK_FIELDS = {
  t: int(LIMITS.epochMs),
  n: counter,
  h: counter,
  a: flag,
  s: flag,
  c: flag,
  b: flag,
  k: oneOf(0, 1, 2),
  o: listOf(int(LIMITS.indexList), LIMITS.indexList),
  l: listOf(int(LIMITS.indexList), LIMITS.indexList),
  p: listOf(int(LIMITS.indexList), LIMITS.indexList),
  m: listOf(v => v === null || v === 0 || v === 1, LIMITS.indexList),
};
const GOAL_FIELDS = {
  weekDays: v => Number.isInteger(v) && v >= 1 && v <= 7,
};
const PREF_FIELDS = {
  theme: oneOf('system', 'light', 'dark'),
  size: oneOf('100', '115', '130', '150'),
  spacing: oneOf('normal', 'roomy'),
  motion: oneOf('auto', 'on', 'off'),
  hideHints: bool,
  vizSpeed: oneOf(0.5, 1, 2, 3),
  vizCodeOpen: bool,
};

export const FIELDS = Object.freeze({
  lesson: Object.keys(LESSON_FIELDS),
  answer: Object.keys(ANSWER_FIELDS),
  day: Object.keys(DAY_FIELDS),
  work: Object.keys(WORK_FIELDS),
  goals: Object.keys(GOAL_FIELDS),
  prefs: Object.keys(PREF_FIELDS),
});

/* Fields the app has that must never leave the device. Kept here so that a new field in the app
   has to be sorted into one list or the other. worker/test/schema.test.js fails until it is. */
export const NEVER_SENT = Object.freeze({
  top: ['name', 'created', 'notes', 'saved', 'code', 'place', 'backup', 'pausedUntil', 'onboarded', 'lastLesson', 'app', 'exportedAt'],
  work: ['x', 'v', 'r'],
  goals: ['topic', 'topicBy'],
});

// ------------------------------------------------------------------ validation
const refuse = (path, reason) => ({ ok: false, path, reason });
const ACCEPTED = Object.freeze({ ok: true });

function checkRecord(rec, table, path) {
  if (!isBox(rec)) return refuse(path, 'must be an object');
  for (const k of Object.keys(rec)) {
    if (!Object.hasOwn(table, k)) return refuse(path, 'has a field that is not allowed');
    if (!table[k](rec[k])) return refuse(`${path}.${k}`, 'has a value that is not allowed');
  }
  return ACCEPTED;
}
function checkMap(map, name, max, keyOk, table) {
  if (!isBox(map)) return refuse(name, 'must be an object');
  const keys = Object.keys(map);
  if (keys.length > max) return refuse(name, 'has too many entries');
  for (const k of keys) {
    if (!keyOk(k)) return refuse(name, 'has an id or date that is not allowed');
    const r = checkRecord(map[k], table, `${name}.*`);
    if (!r.ok) return r;
  }
  return ACCEPTED;
}

/* Says yes or no, and where the problem is. It never repeats what was sent, because what was sent
   could be something a child typed, and this reply can end up in logs. */
export function validateData(data) {
  if (!isBox(data)) return refuse('data', 'must be an object');
  for (const k of Object.keys(data)) {
    if (!['v', 'lessons', 'answers', 'days', 'work', 'goals', 'prefs'].includes(k)) return refuse('data', 'has a field that is not allowed');
  }
  if (!int(LIMITS.version)(data.v) || data.v < 1) return refuse('data.v', 'must be the format version, a small whole number');
  const checks = [
    ['lessons', LIMITS.lessons, isLessonId, LESSON_FIELDS],
    ['answers', LIMITS.answers, isQuestionId, ANSWER_FIELDS],
    ['days', LIMITS.days, isDate, DAY_FIELDS],
    ['work', LIMITS.work, isQuestionId, WORK_FIELDS],
  ];
  for (const [name, max, keyOk, table] of checks) {
    if (data[name] === undefined) continue;
    const r = checkMap(data[name], name, max, keyOk, table);
    if (!r.ok) return r;
  }
  if (data.goals !== undefined) {
    const r = checkRecord(data.goals, GOAL_FIELDS, 'goals');
    if (!r.ok) return r;
  }
  if (data.prefs !== undefined) {
    const r = checkRecord(data.prefs, PREF_FIELDS, 'prefs');
    if (!r.ok) return r;
  }
  return ACCEPTED;
}

// ----------------------------------------------------------- from the app's state
function pick(rec, table) {
  const out = {};
  if (!isBox(rec)) return out;
  for (const k of Object.keys(table)) {
    if (Object.hasOwn(rec, k) && rec[k] !== undefined && table[k](rec[k])) out[k] = rec[k];
  }
  return out;
}
function pickOkDays(list) {
  if (!Array.isArray(list)) return undefined;
  const days = Array.from(new Set(list.filter(isDate))).sort();
  return days.slice(-LIMITS.okDays); // The app only asks "is today in it" and "are there two".
}
function pickWork(rec) {
  const out = pick(rec, WORK_FIELDS);
  // c and m describe typed words we do not send. Without the words they would mark an empty box wrong.
  if (isBox(rec) && (Object.hasOwn(rec, 'x') || Object.hasOwn(rec, 'v'))) { delete out.c; delete out.m; }
  return out;
}
function pickMap(map, keyOk, max, each) {
  const out = {};
  if (!isBox(map)) return out;
  for (const k of Object.keys(map).filter(keyOk).sort().slice(0, max)) {
    const rec = each(map[k]);
    if (Object.keys(rec).length) out[k] = rec;
  }
  return out;
}

/* Turns the app's whole state into exactly what may be sent. Whatever is not on the whitelist, or
   does not fit it, is dropped, so a damaged save or a new field in the app can never stop sync or
   leak out. The result always passes validateData. */
export function toSyncData(state) {
  const s = isBox(state) ? state : {};
  return {
    v: int(LIMITS.version)(s.v) && s.v >= 1 ? s.v : SCHEMA_VERSION,
    lessons: pickMap(s.lessons, isLessonId, LIMITS.lessons, r => pick(r, LESSON_FIELDS)),
    answers: pickMap(s.answers, isQuestionId, LIMITS.answers, r => {
      const days = isBox(r) ? pickOkDays(r.okDays) : undefined;
      const a = pick(isBox(r) ? Object.assign({}, r, { okDays: days }) : r, ANSWER_FIELDS);
      return a;
    }),
    days: pickMap(s.days, isDate, LIMITS.days, r => pick(r, DAY_FIELDS)),
    work: pickMap(s.work, isQuestionId, LIMITS.work, pickWork),
    goals: pick(s.goals, GOAL_FIELDS),
    prefs: pick(s.prefs, PREF_FIELDS),
  };
}

// ------------------------------------------------------------------------ merge
const laterOf = (a, b) => {
  const x = typeof a === 'string' ? a : '', y = typeof b === 'string' ? b : '';
  return x >= y ? x : y;
};
const earlierOf = (a, b) => {
  if (typeof a !== 'string') return typeof b === 'string' ? b : '';
  if (typeof b !== 'string') return a;
  return a <= b ? a : b;
};
function setIf(out, key, value) { if (value !== '' && value !== undefined && value !== null) out[key] = value; }

function mergeLesson(a, b) {
  const out = {};
  const done = a.status === 'done' || b.status === 'done';
  setIf(out, 'status', done ? 'done' : a.status || b.status);
  setIf(out, 'openedAt', earlierOf(a.openedAt, b.openedAt));
  setIf(out, 'doneAt', laterOf(a.doneAt, b.doneAt));
  setIf(out, 'last', laterOf(a.last, b.last));
  if (!done && (a.undone || b.undone)) out.undone = true;
  return out;
}
function mergeAnswer(a, b) {
  const la = typeof a.last === 'string' ? a.last : '', lb = typeof b.last === 'string' ? b.last : '';
  // The schedule (box, due) comes as one piece from whichever side practised last.
  const score = r => [typeof r.last === 'string' ? r.last : '', r.ok || 0, r.box || 0, typeof r.due === 'string' ? r.due : ''];
  const sa = score(a), sb = score(b);
  let newer = a;
  for (let i = 0; i < sa.length; i++) {
    if (sa[i] !== sb[i]) { newer = sa[i] > sb[i] ? a : b; break; }
  }
  const out = {};
  for (const k of ['tries', 'ok', 'hints']) if (a[k] !== undefined || b[k] !== undefined) out[k] = Math.max(a[k] || 0, b[k] || 0);
  const sawA = isDate(a.saw) ? a.saw : '', sawB = isDate(b.saw) ? b.saw : '';
  if (sawA || sawB) out.saw = laterOf(sawA, sawB);
  else if (a.saw !== undefined || b.saw !== undefined) out.saw = !!(a.saw || b.saw);
  if (newer.box !== undefined) out.box = newer.box;
  if (newer.due !== undefined) out.due = newer.due;
  setIf(out, 'last', laterOf(la, lb));
  setIf(out, 'slip', laterOf(a.slip, b.slip));
  if (a.okDays || b.okDays) out.okDays = pickOkDays([...(a.okDays || []), ...(b.okDays || [])]);
  return out;
}
function mergeDay(a, b) {
  const out = {};
  for (const k of Object.keys(DAY_FIELDS)) if (a[k] !== undefined || b[k] !== undefined) out[k] = Math.max(a[k] || 0, b[k] || 0);
  return out;
}
function mergeWork(a, b) {
  const ta = a.t || 0, tb = b.t || 0;
  if (ta !== tb) return ta > tb ? a : b;
  return JSON.stringify(a) >= JSON.stringify(b) ? a : b;
}
function mergeMap(a, b, join) {
  const out = {};
  const x = isBox(a) ? a : {}, y = isBox(b) ? b : {};
  for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) {
    if (x[k] && y[k]) out[k] = join(x[k], y[k]);
    else out[k] = x[k] || y[k];
  }
  return out;
}

/* The merge to use after a 409. Nothing learned is ever lost, whichever way round it is called.
   Progress fields give the same answer either way. goals and prefs follow this device: `local`. */
export function mergeData(local, remote) {
  const l = isBox(local) ? local : {}, r = isBox(remote) ? remote : {};
  return {
    v: Math.max(l.v || 0, r.v || 0, SCHEMA_VERSION),
    lessons: mergeMap(l.lessons, r.lessons, mergeLesson),
    answers: mergeMap(l.answers, r.answers, mergeAnswer),
    days: mergeMap(l.days, r.days, mergeDay),
    work: mergeMap(l.work, r.work, mergeWork),
    goals: Object.assign({}, isBox(r.goals) ? r.goals : {}, isBox(l.goals) ? l.goals : {}),
    prefs: Object.assign({}, isBox(r.prefs) ? r.prefs : {}, isBox(l.prefs) ? l.prefs : {}),
  };
}

// ------------------------------------------------------------- packing a request
async function gzipBytes(text) {
  const stream = new Response(text).body.pipeThrough(new CompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
/* Builds the body of POST /v1/sync so that it fits the limit. A short one goes as plain JSON and a
   long one as gzip. If a very long one still does not fit, `work` goes first, as it matters least:
   it only restores a half-done question on another device. Returns null if nothing fits. */
export async function packForSync({ id, key, baseRev, data }) {
  const rest = Object.assign({}, data);
  delete rest.work;
  const forms = data.work ? [data, rest] : [data];
  for (const form of forms) {
    const text = JSON.stringify({ id, key, baseRev, data: form });
    const withoutWork = form !== data;
    if (text.length <= LIMITS.wireBytes) return { body: text, headers: { 'Content-Type': 'application/json' }, withoutWork };
    if (typeof CompressionStream !== 'function' || text.length > LIMITS.jsonBytes) continue;
    const bytes = await gzipBytes(text);
    if (bytes.byteLength <= LIMITS.wireBytes) return { body: bytes, headers: { 'Content-Type': 'application/json', 'Content-Encoding': 'gzip' }, withoutWork };
  }
  return null;
}
