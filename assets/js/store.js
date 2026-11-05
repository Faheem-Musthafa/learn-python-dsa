/* Store: the personal tracker. Everything lives on this device in localStorage.
 * No accounts, no server. Export and import are how a learner keeps it safe.
 */
(function (root) {
  'use strict';

  const KEY = 'stepwise.v1';
  const INTERVALS = [1, 1, 3, 7, 14, 30, 60]; // Days until the next review, by box.
  const MAX_BOX = INTERVALS.length - 1;
  const DAILY_CAP = 8;
  // Limits on what one question keeps, so saved data stays small.
  const MAX_TEXT = 1000, MAX_GAP = 200, MAX_ROWS = 30, MAX_ROW = 240, MAX_CODE = 50000;

  const blank = () => ({
    v: 1,
    name: '',
    created: dayKey(),
    days: {},       // 'YYYY-MM-DD': {mins, acts, lessons, qs}
    lessons: {},    // lessonId: {status:'open'|'done', openedAt, doneAt, last}
    answers: {},    // qid: {tries, ok, hints, saw, last, box, due, okDays:[]}
    notes: {},      // lessonId: text
    saved: [],      // bookmarked lesson ids
    code: {},       // blockKey: learner's code
    /* What the learner did in a question, so it can be shown again. Saves older than this have none.
       qid: {t: when, n: tries, h: hints open, a: answer open, s: solved, c: the verdict was showing,
             b: solved before and now being retried,
             o: options tried, x: typed text, l: lines placed, v: boxes filled, m: marks on those boxes,
             p: pairs made, r: last run's rows [[pass, words]], k: last run 1 right, 2 crashed, else wrong} */
    work: {},
    place: {},      // lessonId: {a: block, d: pixels below its top, t: when}. Where the learner stopped.
    goals: { weekDays: 3, topic: '', topicBy: '' },
    prefs: { theme: 'system', size: '100', spacing: 'normal', motion: 'auto', hideHints: false, vizSpeed: 1, vizCodeOpen: false },
    backup: { last: null, snoozed: null },
    pausedUntil: null,
    onboarded: false,
  });

  function dayKey(d) {
    d = d || new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }
  const parseDay = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (k, n) => { const d = parseDay(k); d.setDate(d.getDate() + n); return dayKey(d); };
  /* Monday of the week holding this day. */
  const weekStart = k => { const d = parseDay(k); const wd = (d.getDay() + 6) % 7; d.setDate(d.getDate() - wd); return dayKey(d); };

  let state = null, storageOk = true, storageIssue = '';
  let lastRaw = null;     // The saved text this tab last read or wrote. Lets it spot another tab's save.
  let overwrite = false;  // The next save replaces everything on purpose: delete, or load a copy.
  const listeners = [], leaving = [];

  function load() {
    let raw = null;
    try { raw = localStorage.getItem(KEY); }
    catch (e) {
      failed('blocked');
      state = blank();
      return state;
    }
    try {
      state = raw ? merge(blank(), JSON.parse(raw)) : blank();
      lastRaw = raw;
    } catch (e) {
      // Damaged text. The next save would replace it, so keep a copy somebody could rescue.
      state = blank();
      try { localStorage.setItem(KEY + '.damaged', raw); } catch (err) { /* Nothing more we can do. */ }
    }
    // Some browsers let us read but refuse to write. Find out now, not after the learner's work.
    try {
      localStorage.setItem(KEY + '.probe', '1');
      localStorage.removeItem(KEY + '.probe');
    } catch (e) { failed(isFull(e) ? 'full' : 'blocked'); }
    return state;
  }
  function failed(why) { storageOk = false; storageIssue = why; }
  const isFull = e => !!e && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22 || e.code === 1014);
  function merge(base, data) {
    for (const k in data) {
      if (k === '__proto__') continue;
      const isList = Array.isArray(base[k]);
      const isBox = base[k] && typeof base[k] === 'object' && !isList;
      // A damaged file must not replace a list or a group of settings with something else.
      if (isList && !Array.isArray(data[k])) continue;
      if (isBox && (!data[k] || typeof data[k] !== 'object' || Array.isArray(data[k]))) continue;
      base[k] = isBox ? merge(base[k], data[k]) : data[k];
    }
    return base;
  }
  function write(text) {
    localStorage.setItem(KEY, text);
    lastRaw = text;
    storageOk = true;
    storageIssue = '';
  }
  function save() {
    clearTimeout(soon);
    soon = 0;
    try {
      // Another tab may have saved since we last looked. Keep its work as well as ours.
      const now = localStorage.getItem(KEY);
      if (!overwrite && now && now !== lastRaw) adopt(now);
    } catch (e) { /* The write below will say what is wrong. */ }
    overwrite = false;
    try { write(JSON.stringify(state)); }
    catch (e) {
      failed(isFull(e) ? 'full' : 'blocked');
      if (isFull(e)) makeRoom();
    }
    listeners.forEach(fn => fn());
  }
  /* The browser's space is full. What is already saved stays safe, because a failed write changes
     nothing. To fit the newest answers, give up the oldest question details, never the results. */
  function makeRoom() {
    try { localStorage.removeItem(KEY + '.damaged'); } catch (e) { /* Carry on. */ }
    let ids = Object.keys(state.work).sort((a, b) => (state.work[a].t || 0) - (state.work[b].t || 0));
    while (true) {
      const work = {};
      ids.forEach(id => { work[id] = state.work[id]; });
      try {
        write(JSON.stringify(Object.assign({}, state, { work })));
        state.work = work;
        return;
      } catch (e) { /* Still too big. */ }
      if (!ids.length) return;
      ids = ids.slice(Math.ceil(ids.length / 4));
    }
  }
  /* For typing and scrolling: saves shortly after, and never waits longer than the first ask. */
  let soon = 0, soonAt = 0;
  function saveSoon(ms) {
    const at = Date.now() + (ms || 400);
    if (soon && soonAt <= at) return;
    clearTimeout(soon);
    soonAt = at;
    soon = setTimeout(() => { soon = 0; save(); }, ms || 400);
  }
  function flush() {
    if (soon) save();
  }

  // ------------------------------------------------------------- other tabs
  const isBox = x => !!x && typeof x === 'object' && !Array.isArray(x);
  const text = x => JSON.stringify(x);
  const newer = (a, b) => ((b.t || 0) > (a.t || 0) ? b : a);
  /* The same question changed in two places. Keep the latest schedule, and every right answer. */
  function joinAnswers(a, b) {
    const later = (b.last || '') > (a.last || '') || ((b.last || '') === (a.last || '') && (b.tries || 0) > (a.tries || 0));
    const days = Array.from(new Set([...(a.okDays || []), ...(b.okDays || [])])).sort();
    return Object.assign({}, later ? b : a, {
      tries: Math.max(a.tries || 0, b.tries || 0), ok: Math.max(a.ok || 0, b.ok || 0),
      hints: Math.max(a.hints || 0, b.hints || 0), okDays: days,
    });
  }
  const joinDays = (a, b) => {
    const out = Object.assign({}, a);
    for (const k in b) out[k] = Math.max(a[k] || 0, b[k] || 0);
    return out;
  };
  const JOIN = {
    days: joinDays, answers: joinAnswers, work: newer, place: newer,
    lessons: (a, b) => (a.status !== 'done' && b.status === 'done' ? b : a),
  };
  /* Only what this tab changed since it last looked beats the other tab's copy. */
  function threeWay(base, mine, theirs, join) {
    const out = {};
    for (const k of new Set([...Object.keys(mine), ...Object.keys(theirs)])) {
      const b = text(base[k]), m = text(mine[k]), t = text(theirs[k]);
      let v;
      if (m === b) v = theirs[k];
      else if (t === b || t === m) v = mine[k];
      else if (mine[k] === undefined) v = theirs[k];
      else if (theirs[k] === undefined || !join) v = mine[k];
      else v = join(mine[k], theirs[k]);
      if (v !== undefined) out[k] = v;
    }
    return out;
  }
  /* Takes another tab's save into this tab. Views hold on to the state object, so it stays the same one. */
  function adopt(raw) {
    const theirs = merge(blank(), JSON.parse(raw));
    const base = lastRaw ? merge(blank(), JSON.parse(lastRaw)) : blank();
    const next = {};
    for (const k of new Set([...Object.keys(state), ...Object.keys(theirs)])) {
      const b = base[k], m = state[k], t = theirs[k];
      if (isBox(m) && isBox(t)) next[k] = threeWay(isBox(b) ? b : {}, m, t, JOIN[k]);
      else if (Array.isArray(m) && Array.isArray(t)) {
        const was = Array.isArray(b) ? b : [];
        next[k] = Array.from(new Set([...t.filter(x => m.includes(x) || !was.includes(x)), ...m.filter(x => !was.includes(x))]));
      } else {
        const v = text(m) === text(b) ? t : m;
        if (v !== undefined) next[k] = v;
      }
    }
    replaceState(next);
    lastRaw = raw;
  }
  function replaceState(next) {
    for (const k of Object.keys(state)) delete state[k];
    Object.assign(state, next);
  }
  function today() {
    const k = dayKey();
    if (!state.days[k]) state.days[k] = { mins: 0, acts: 0, lessons: 0, qs: 0 };
    return state.days[k];
  }
  function act(kind) {
    const t = today();
    t.acts += 1;
    if (kind) t[kind] = (t[kind] || 0) + 1;
  }

  // ---------------------------------------------------------------- lessons
  function openLesson(id) {
    const l = state.lessons[id] || (state.lessons[id] = { status: 'open', openedAt: dayKey() });
    l.last = dayKey();
    state.lastLesson = id;
    today();
    save();
  }
  function finishLesson(id) {
    const l = state.lessons[id] || (state.lessons[id] = { openedAt: dayKey() });
    if (l.status !== 'done') {
      l.status = 'done';
      l.doneAt = dayKey();
      act('lessons');
    }
    delete l.undone;
    save();
  }
  function reopenLesson(id) {
    // undone: the learner said it is not finished. Do not finish it for them again.
    if (state.lessons[id]) { state.lessons[id].status = 'open'; state.lessons[id].undone = true; }
    save();
  }
  /* Every question right means the lesson is finished, unless the learner has said otherwise. */
  function autoFinish(id, qids) {
    const l = state.lessons[id];
    if (!qids.length || (l && (l.status === 'done' || l.undone))) return false;
    if (!qids.every(q => (state.answers[q] || {}).ok > 0)) return false;
    finishLesson(id);
    return true;
  }
  const lessonState = id => state.lessons[id] || null;

  // ---------------------------------------------------------------- answers
  function answerOf(qid) { return state.answers[qid] || null; }
  /* result: {ok, hinted, saw, reviewable, review} */
  function recordAnswer(qid, result) {
    const a = state.answers[qid] || (state.answers[qid] = { tries: 0, ok: 0, hints: 0, saw: false, box: 0, due: null, okDays: [] });
    const k = dayKey();
    a.tries += 1;
    a.last = k;
    if (!a.okDays) a.okDays = [];
    // Seeing the answer only counts against tries on that same day. Later, it is a real go.
    const clean = result.ok && !result.hinted && a.saw !== k && a.slip !== k;
    const firstOkToday = !a.okDays.includes(k);
    if (result.ok) {
      a.ok += 1;
      if (firstOkToday) a.okDays.push(k);
    }
    if (result.reviewable) {
      if (result.ok) {
        // Right again on the same day proves nothing new, so the gap only grows once a day.
        if (clean && result.firstTry !== false && firstOkToday) {
          a.box = Math.min(MAX_BOX, (a.box || 0) + 1);
          a.due = addDays(k, INTERVALS[a.box]);
        } else if (firstOkToday || !a.due || a.due <= k) {
          a.due = addDays(k, 1);
        }
      } else if (firstOkToday) {
        // Only the first slip of a day moves it back. Once it is right today, Try again changes nothing.
        if (result.firstTry !== false && a.slip !== k) a.box = Math.max(0, (a.box || 0) - 2);
        a.due = k;
      }
    }
    if (!result.ok) a.slip = k;
    act('qs');
    save();
    return a;
  }
  function markHint(qid) {
    const a = state.answers[qid] || (state.answers[qid] = { tries: 0, ok: 0, hints: 0, saw: false, box: 0, due: null, okDays: [] });
    a.hints += 1;
    save();
  }
  function markSaw(qid, reviewable) {
    const a = state.answers[qid] || (state.answers[qid] = { tries: 0, ok: 0, hints: 0, saw: false, box: 0, due: null, okDays: [] });
    a.saw = dayKey();
    // Seeing the answer is fine. It brings the question back soon for a real go.
    if (reviewable) a.due = addDays(dayKey(), 1);
    save();
  }

  // ------------------------------------------------------- work on a question
  function workOf(qid) { return isBox(state.work[qid]) ? state.work[qid] : null; }
  /* Trims a record to its limits. Returns null if there is nothing in it worth keeping. */
  function tidyWork(rec) {
    const out = {};
    for (const k in rec) {
      const v = rec[k];
      if (v == null || v === 0 || v === '' || v === false || k === 't') continue;
      if (Array.isArray(v) && !v.length) continue;
      out[k] = Array.isArray(v) ? v.slice() : v;
    }
    if (typeof out.x === 'string') out.x = out.x.slice(0, MAX_TEXT);
    if (out.v) {
      out.v = out.v.slice(0, 200).map(x => String(x == null ? '' : x).slice(0, MAX_GAP));
      if (!out.v.some(Boolean)) delete out.v;
    }
    if (out.r) out.r = out.r.slice(0, MAX_ROWS).map(row => [row[0] ? 1 : 0, String(row[1]).slice(0, MAX_ROW)]);
    return Object.keys(out).length ? out : null;
  }
  function setWork(qid, rec) {
    const clean = rec && tidyWork(rec);
    if (clean) { clean.t = Date.now(); state.work[qid] = clean; }
    else delete state.work[qid];
    save();
  }
  function placeOf(id) { return isBox(state.place[id]) ? state.place[id] : null; }
  function setPlace(id, rec) {
    const old = state.place[id];
    if (!rec) {
      if (!old) return;
      delete state.place[id];
    } else {
      if (old && old.a === rec.a && old.d === rec.d) return;
      state.place[id] = { a: rec.a, d: rec.d, t: Date.now() };
    }
    saveSoon(500);
  }

  /* Questions due now, oldest first, capped so review never becomes a chore. */
  function dueQuestions(all, cap) {
    const now = dayKey();
    const rows = [];
    for (const qid in state.answers) {
      const a = state.answers[qid];
      if (a.due && a.due <= now && all[qid]) rows.push({ qid, due: a.due, box: a.box || 0 });
    }
    rows.sort((x, y) => (x.due < y.due ? -1 : x.due > y.due ? 1 : x.box - y.box));
    return { total: rows.length, list: rows.slice(0, cap == null ? DAILY_CAP : cap).map(r => r.qid) };
  }

  /* How strong is a lesson? new, practising, solid or mastered. due is a separate flag. */
  function mastery(lesson, qids) {
    const ls = state.lessons[lesson];
    const rows = qids.map(q => state.answers[q]).filter(Boolean);
    const solved = rows.filter(a => a.ok > 0).length;
    const now = dayKey();
    const due = rows.some(a => a.due && a.due <= now);
    if (!ls && !rows.length) return { level: 'new', due: false, solved: 0, total: qids.length };
    const ratio = qids.length ? solved / qids.length : 1;
    let level = 'practising';
    if (ls && ls.status === 'done' && ratio >= 0.7) level = 'solid';
    const strong = rows.filter(a => (a.box || 0) >= 3 && a.okDays && a.okDays.length >= 2).length;
    if (level === 'solid' && strong >= Math.min(3, Math.ceil(qids.length / 2))) level = 'mastered';
    return { level, due, solved, total: qids.length };
  }

  // ------------------------------------------------------------------ stats
  function daysStudied() {
    return Object.keys(state.days).filter(k => {
      const d = state.days[k];
      return d.acts > 0 || d.mins > 0;
    }).sort();
  }
  function week(k) {
    const start = weekStart(k || dayKey());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const key = addDays(start, i);
      const d = state.days[key];
      days.push({ key, on: !!(d && (d.acts > 0 || d.mins > 0)), mins: d ? d.mins : 0, acts: d ? d.acts : 0 });
    }
    return days;
  }
  /* Weeks in a row that met the goal. This week only counts once it is met.
     A missed week never shows zero. The page shows the last run instead. */
  function rhythm() {
    const goal = state.goals.weekDays;
    const nowStart = weekStart(dayKey());
    const studied = daysStudied();
    const perWeek = {};
    studied.forEach(k => { const w = weekStart(k); perWeek[w] = (perWeek[w] || 0) + 1; });
    const met = w => (perWeek[w] || 0) >= goal;
    let run = 0, w = addDays(nowStart, -7);
    if (met(nowStart)) run = 1;
    while (met(w)) { run += 1; w = addDays(w, -7); }
    let best = 0, cur = 0, lastRun = 0;
    const weeks = Object.keys(perWeek).sort();
    if (weeks.length) {
      let at = weeks[0];
      while (at <= nowStart) {
        if (met(at)) { cur += 1; if (cur > best) best = cur; }
        else if (at !== nowStart) { if (cur) lastRun = cur; cur = 0; }
        at = addDays(at, 7);
      }
    }
    return { goal, thisWeek: perWeek[nowStart] || 0, run, best, lastRun };
  }
  function longestDayRun() {
    const days = daysStudied();
    let best = 0, cur = 0, prev = null;
    days.forEach(k => {
      cur = prev && addDays(prev, 1) === k ? cur + 1 : 1;
      if (cur > best) best = cur;
      prev = k;
    });
    return best;
  }
  /* Counts only time when the page is on screen and the learner did something lately. */
  let lastInput = Date.now();
  function trackTime() {
    ['pointerdown', 'keydown', 'scroll'].forEach(ev => root.addEventListener(ev, () => { lastInput = Date.now(); }, { passive: true, capture: true }));
    // Typing then closing the page must not lose the last few words.
    const leave = () => { leaving.forEach(fn => fn()); flush(); };
    root.addEventListener('pagehide', leave);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') leave(); });
    // Another tab saved something. Use its copy, but keep anything here that has not been saved yet.
    root.addEventListener('storage', e => {
      if (e.key !== KEY || !e.newValue || e.newValue === lastRaw) return;
      try { adopt(e.newValue); listeners.forEach(fn => fn()); } catch (err) { /* Keep what we have. */ }
    });
    let bank = 0;
    setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastInput > 60000) return;
      bank += 15;
      if (bank >= 60) {
        bank = 0;
        today().mins += 1;
        save();
      }
    }, 15000);
  }

  // ------------------------------------------------------------------- data
  function exportData() {
    state.backup.last = dayKey();
    save();
    return JSON.stringify(Object.assign({ app: 'stepwise', exportedAt: new Date().toISOString() }, state), null, 2);
  }
  function summarize(data) {
    return {
      days: Object.keys(data.days || {}).length,
      lessons: Object.values(data.lessons || {}).filter(l => l.status === 'done').length,
      questions: Object.keys(data.answers || {}).length,
      notes: Object.keys(data.notes || {}).length,
    };
  }
  function parseImport(text) {
    let data;
    try { data = JSON.parse(text); }
    catch (e) { throw new Error('This file is not a Stepwise backup. It could not be read.'); }
    if (!data || data.app !== 'stepwise' || !data.lessons || typeof data.lessons !== 'object') {
      throw new Error('This file is not a Stepwise backup. Look for a file that starts with stepwise-progress.');
    }
    return data;
  }
  /* Merge keeps the stronger or newer item from each side. Replace takes the file as it is. */
  function importData(data, mode) {
    if (mode === 'replace') {
      const clean = Object.assign({}, data);
      delete clean.app;
      delete clean.exportedAt;
      replaceState(merge(blank(), clean));
      overwrite = true;
    } else {
      for (const k in data.days || {}) {
        const a = state.days[k], b = data.days[k];
        state.days[k] = a ? { mins: Math.max(a.mins, b.mins), acts: Math.max(a.acts, b.acts), lessons: Math.max(a.lessons || 0, b.lessons || 0), qs: Math.max(a.qs || 0, b.qs || 0) } : b;
      }
      for (const k in data.lessons || {}) {
        const a = state.lessons[k], b = data.lessons[k];
        if (!a || (b.status === 'done' && a.status !== 'done')) state.lessons[k] = b;
      }
      for (const k in data.answers || {}) {
        const a = state.answers[k], b = data.answers[k];
        if (isBox(b)) state.answers[k] = a ? joinAnswers(a, b) : b;
      }
      // A backup from before question details existed simply has none of these.
      for (const k of ['work', 'place']) {
        const from = isBox(data[k]) ? data[k] : {};
        for (const id in from) {
          const a = state[k][id], b = from[id];
          if (isBox(b)) state[k][id] = a ? newer(a, b) : b;
        }
      }
      if (!state.lastLesson && data.lastLesson) state.lastLesson = data.lastLesson;
      for (const k in data.notes || {}) if (!state.notes[k]) state.notes[k] = data.notes[k];
      for (const k in data.code || {}) if (!state.code[k]) state.code[k] = data.code[k];
      state.saved = Array.from(new Set([...(state.saved || []), ...(data.saved || [])]));
      state.onboarded = true;
    }
    save();
  }
  function wipe() {
    replaceState(blank());
    overwrite = true;
    save();
  }
  /* Ask the browser to keep our data. Safari can clear it after 7 days away. */
  function askToPersist() {
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  }

  root.Store = {
    load, save, saveSoon, flush, get state() { return state; }, get storageOk() { return storageOk; }, get storageIssue() { return storageIssue; },
    onChange: fn => listeners.push(fn),
    beforeLeave: fn => leaving.push(fn),
    dayKey, parseDay, addDays, weekStart,
    openLesson, finishLesson, reopenLesson, autoFinish, lessonState,
    answerOf, recordAnswer, markHint, markSaw, dueQuestions, mastery,
    workOf, setWork, placeOf, setPlace,
    daysStudied, week, rhythm, longestDayRun, trackTime,
    exportData, parseImport, importData, summarize, wipe, askToPersist,
    DAILY_CAP, MAX_TEXT, MAX_GAP, MAX_CODE,
  };
})(typeof window !== 'undefined' ? window : globalThis);
