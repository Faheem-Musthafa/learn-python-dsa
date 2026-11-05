/* Store: the personal tracker. Everything lives on this device in localStorage.
 * No accounts, no server. Export and import are how a learner keeps it safe.
 */
(function (root) {
  'use strict';

  const KEY = 'stepwise.v1';
  const INTERVALS = [1, 1, 3, 7, 14, 30, 60]; // Days until the next review, by box.
  const MAX_BOX = INTERVALS.length - 1;
  const DAILY_CAP = 8;

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

  let state = null, storageOk = true;
  const listeners = [];

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      state = raw ? merge(blank(), JSON.parse(raw)) : blank();
    } catch (e) {
      storageOk = false;
      state = blank();
    }
    return state;
  }
  function merge(base, data) {
    for (const k in data) {
      const isList = Array.isArray(base[k]);
      const isBox = base[k] && typeof base[k] === 'object' && !isList;
      // A damaged file must not replace a list or a group of settings with something else.
      if (isList && !Array.isArray(data[k])) continue;
      if (isBox && (!data[k] || typeof data[k] !== 'object' || Array.isArray(data[k]))) continue;
      base[k] = isBox ? merge(base[k], data[k]) : data[k];
    }
    return base;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { storageOk = false; }
    listeners.forEach(fn => fn());
  }
  /* For typing: saves shortly after the last key press. */
  let soon = 0;
  function saveSoon(ms) {
    clearTimeout(soon);
    soon = setTimeout(() => { soon = 0; save(); }, ms || 400);
  }
  function flush() {
    if (!soon) return;
    clearTimeout(soon);
    soon = 0;
    save();
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
    save();
  }
  function reopenLesson(id) {
    if (state.lessons[id]) state.lessons[id].status = 'open';
    save();
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
    // Seeing the answer only counts against tries on that same day. Later, it is a real go.
    const clean = result.ok && !result.hinted && a.saw !== k;
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
      } else {
        if (result.firstTry !== false) a.box = Math.max(0, (a.box || 0) - 2);
        a.due = k;
      }
    }
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
    root.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
    // Another tab saved something. Use its copy, or the next save here would wipe it out.
    root.addEventListener('storage', e => {
      if (e.key !== KEY || !e.newValue) return;
      try { state = merge(blank(), JSON.parse(e.newValue)); listeners.forEach(fn => fn()); } catch (err) { /* Keep what we have. */ }
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
      state = merge(blank(), data);
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
        if (!a || (b.last || '') > (a.last || '')) state.answers[k] = b;
      }
      for (const k in data.notes || {}) if (!state.notes[k]) state.notes[k] = data.notes[k];
      for (const k in data.code || {}) if (!state.code[k]) state.code[k] = data.code[k];
      state.saved = Array.from(new Set([...(state.saved || []), ...(data.saved || [])]));
      state.onboarded = true;
    }
    save();
  }
  function wipe() {
    state = blank();
    save();
  }
  /* Ask the browser to keep our data. Safari can clear it after 7 days away. */
  function askToPersist() {
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  }

  root.Store = {
    load, save, saveSoon, get state() { return state; }, get storageOk() { return storageOk; },
    onChange: fn => listeners.push(fn),
    dayKey, parseDay, addDays, weekStart,
    openLesson, finishLesson, reopenLesson, lessonState,
    answerOf, recordAnswer, markHint, markSaw, dueQuestions, mastery,
    daysStudied, week, rhythm, longestDayRun, trackTime,
    exportData, parseImport, importData, summarize, wipe, askToPersist,
    DAILY_CAP,
  };
})(typeof window !== 'undefined' ? window : globalThis);
