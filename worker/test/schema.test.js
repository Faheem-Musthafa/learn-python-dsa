import { describe, expect, it } from 'vitest';
import { FIELDS, LIMITS, NEVER_SENT, isDate, isLessonId, isQuestionId, mergeData, toSyncData, validateData } from '../src/schema.js';
import { smallData } from './helpers/common.js';
import typicalState from './generated/typical-state.json';
import finishedState from './generated/finished-state.json';
import courseIds from './generated/course-ids.json';
import fieldsSeen from './generated/fields-seen.json';

const expectRefused = (data, path) => {
  const r = validateData(data);
  expect(r.ok, JSON.stringify(r)).toBe(false);
  if (path) expect(r.path).toBe(path);
};
const qid = '1-1-what-is-code/robot-steps';
const lid = '1-1-what-is-code';

describe('real data from assets/js/store.js', () => {
  it('fits every id in the real course', () => {
    expect(courseIds.lessons.length).toBeGreaterThan(100);
    expect(courseIds.questions.length).toBeGreaterThan(1000);
    expect(courseIds.lessons.filter(x => !isLessonId(x))).toEqual([]);
    expect(courseIds.questions.filter(x => !isQuestionId(x))).toEqual([]);
    expect(courseIds.lessons.length).toBeLessThan(LIMITS.lessons / 2);
    expect(courseIds.questions.length).toBeLessThan(LIMITS.answers / 2);
  });
  it('accepts a typical learner after projection', () => {
    const data = toSyncData(typicalState);
    expect(validateData(data)).toEqual({ ok: true });
    expect(Object.keys(data.answers).length).toBeGreaterThan(100);
    expect(Object.keys(data.work).length).toBeGreaterThan(100);
  });
  it('accepts a learner who finished the whole course over three years', () => {
    const data = toSyncData(finishedState);
    expect(validateData(data)).toEqual({ ok: true });
    expect(Object.keys(data.lessons).length).toBe(courseIds.lessons.length);
    expect(Object.keys(data.answers).length).toBe(courseIds.questions.length);
  });
  it('keeps the real progress: slip, undone, dates and okDays survive', () => {
    const data = toSyncData(finishedState);
    const answers = Object.values(data.answers), lessons = Object.values(data.lessons);
    expect(answers.some(a => isDate(a.slip))).toBe(true);
    expect(answers.some(a => isDate(a.saw))).toBe(true);
    expect(answers.some(a => a.okDays.length >= 2)).toBe(true);
    expect(lessons.some(l => l.undone === true)).toBe(true);
    expect(data.prefs.vizSpeed).toBe(0.5);
    expect(data.goals).toEqual({ weekDays: finishedState.goals.weekDays });
  });
  it('sends no free text: the planted text never survives projection', () => {
    for (const state of [typicalState, finishedState]) {
      expect(JSON.stringify(state)).toContain('CANARY');
      const text = JSON.stringify(toSyncData(state));
      expect(text).not.toContain('CANARY');
      expect(text).not.toContain('Asha');
    }
  });
  it('refuses the raw state: projection is required, not optional', () => {
    expectRefused(typicalState, 'data');
  });
  it('sorts every field the app really has into sent or never sent', () => {
    // If this fails, store.js gained a field. Decide: could it ever hold free text? If so, add it to
    // NEVER_SENT. If it is only numbers, yes/no or a fixed list, add it to the tables in schema.js.
    const top = ['v', 'lessons', 'answers', 'days', 'work', 'goals', 'prefs', ...NEVER_SENT.top];
    expect(fieldsSeen.top.filter(k => !top.includes(k))).toEqual([]);
    expect(fieldsSeen.lesson.filter(k => !FIELDS.lesson.includes(k))).toEqual([]);
    expect(fieldsSeen.answer.filter(k => !FIELDS.answer.includes(k))).toEqual([]);
    expect(fieldsSeen.day.filter(k => !FIELDS.day.includes(k))).toEqual([]);
    expect(fieldsSeen.work.filter(k => ![...FIELDS.work, ...NEVER_SENT.work].includes(k))).toEqual([]);
    expect(fieldsSeen.goals.filter(k => ![...FIELDS.goals, ...NEVER_SENT.goals].includes(k))).toEqual([]);
    expect(fieldsSeen.prefs.filter(k => !FIELDS.prefs.includes(k))).toEqual([]);
  });
  it('drops c and m where the words they describe are not sent', () => {
    const data = toSyncData({ v: 1, work: { [qid]: { x: 'typed', c: 1, n: 2 }, 'a-1/b': { v: ['x'], m: [1], c: 1 }, 'a-1/c': { l: [1, 0], c: 1 } } });
    expect(data.work[qid]).toEqual({ n: 2 });
    expect(data.work['a-1/b']).toBeUndefined();
    expect(data.work['a-1/c']).toEqual({ l: [1, 0], c: 1 });
  });
  it('turns a damaged save into something valid, without throwing', () => {
    const damaged = {
      v: 'one',
      lessons: { 'Bad Id': { status: 'done' }, [lid]: { status: 'finished', doneAt: 'soon', openedAt: '2026-11-01' }, constructor: { status: 'done' } },
      answers: { [qid]: { tries: -1, ok: 2, okDays: ['2026-11-02', 'nope', '2026-11-02'], note: 'hello' }, 'x/y': 'nonsense' },
      days: { today: { mins: 1 }, '2026-02-30': { mins: 1 }, '2026-11-01': { mins: 99999, acts: 2, extra: 'a' } },
      work: null,
      goals: { weekDays: 9, topic: 'mine' },
      prefs: { theme: 'neon', hideHints: 'yes', size: '115' },
      name: 'Asha',
    };
    const data = toSyncData(damaged);
    expect(validateData(data)).toEqual({ ok: true });
    expect(data.lessons).toEqual({ [lid]: { openedAt: '2026-11-01' } });
    expect(data.answers).toEqual({ [qid]: { ok: 2, okDays: ['2026-11-02'] } });
    expect(data.days).toEqual({ '2026-11-01': { acts: 2 } });
    expect(data.goals).toEqual({});
    expect(data.prefs).toEqual({ size: '115' });
  });
  it('keeps only the newest okDays when there are too many', () => {
    const days = [];
    for (let i = 1; i <= 28; i++) for (const m of ['01', '02', '03']) days.push(`2025-${m}-${String(i).padStart(2, '0')}`);
    const data = toSyncData({ v: 1, answers: { [qid]: { okDays: days } } });
    expect(data.answers[qid].okDays.length).toBe(LIMITS.okDays);
    expect(data.answers[qid].okDays.at(-1)).toBe('2025-03-28');
    expect(validateData(data)).toEqual({ ok: true });
  });
  it('makes no change to a missing or empty state', () => {
    expect(validateData(toSyncData(null))).toEqual({ ok: true });
    expect(validateData(toSyncData({}))).toEqual({ ok: true });
  });
});

describe('the whitelist refuses', () => {
  it.each([
    ['nickname', { name: 'Asha' }],
    ['notes', { notes: { [lid]: 'my note' } }],
    ['code', { code: { [`q:${qid}`]: 'print(1)' } }],
    ['saved', { saved: [lid] }],
    ['place', { place: { [lid]: { a: 'top', d: 1, t: 1 } } }],
    ['backup', { backup: { last: null } }],
    ['any unknown field', { hello: 1 }],
  ])('%s at the top level', (_, extra) => {
    expectRefused(smallData(extra), 'data');
  });
  it.each([
    ['typed text', { x: 'my name is Asha' }],
    ['filled boxes', { v: ['Asha'] }],
    ['run output', { r: [[1, 'Asha']] }],
    ['an unknown field', { why: 'x' }],
  ])('%s inside work', (_, rec) => {
    expectRefused(smallData({ work: { [qid]: rec } }), 'work.*');
  });
  it.each([
    ['text in a number', { answers: { [qid]: { tries: 'lots' } } }, 'answers.*.tries'],
    ['a negative number', { answers: { [qid]: { ok: -1 } } }, 'answers.*.ok'],
    ['a fraction', { answers: { [qid]: { ok: 1.5 } } }, 'answers.*.ok'],
    ['a huge number', { answers: { [qid]: { ok: 1e12 } } }, 'answers.*.ok'],
    ['a note in saw', { answers: { [qid]: { saw: 'I saw it' } } }, 'answers.*.saw'],
    ['an unknown answer field', { answers: { [qid]: { note: 'hi' } } }, 'answers.*'],
    ['text in okDays', { answers: { [qid]: { okDays: ['hello'] } } }, 'answers.*.okDays'],
    ['a free text status', { lessons: { [lid]: { status: 'I am Asha' } } }, 'lessons.*.status'],
    ['an unknown lesson field', { lessons: { [lid]: { note: 'hi' } } }, 'lessons.*'],
    ['a bad date', { lessons: { [lid]: { doneAt: '2026-13-01' } } }, 'lessons.*.doneAt'],
    ['a date that does not exist', { lessons: { [lid]: { doneAt: '2026-02-30' } } }, 'lessons.*.doneAt'],
    ['a date with a time', { lessons: { [lid]: { doneAt: '2026-02-01T10:00:00Z' } } }, 'lessons.*.doneAt'],
    ['too many minutes', { days: { '2026-11-01': { mins: 1441 } } }, 'days.*.mins'],
    ['a word in a day', { days: { '2026-11-01': { mood: 'sad' } } }, 'days.*'],
    ['a pref not in the list', { prefs: { theme: 'Asha' } }, 'prefs.theme'],
    ['an unknown pref', { prefs: { nickname: 'Asha' } }, 'prefs'],
    ['a goal topic', { goals: { weekDays: 3, topic: 'mine' } }, 'goals'],
    ['too many week days', { goals: { weekDays: 8 } }, 'goals.weekDays'],
    ['text in a work list', { work: { [qid]: { o: ['Asha'] } } }, 'work.*.o'],
  ])('%s', (_, over, path) => {
    expectRefused(smallData(over), path);
  });
  it.each([
    ['upper case', 'Lesson-One'],
    ['a space', 'lesson one'],
    ['a dot', 'lesson.one'],
    ['an underscore', 'lesson_one'],
    ['a slash', 'a/b'],
    ['a double hyphen', 'a--b'],
    ['a leading hyphen', '-a'],
    ['too long', 'a'.repeat(65)],
    ['__proto__', '__proto__'],
    ['constructor', 'constructor'],
  ])('a lesson id with %s', (_, id) => {
    const lessons = JSON.parse(`{"${id}":{"status":"open"}}`);
    expectRefused(smallData({ lessons }), 'lessons');
  });
  it.each([
    ['no slash', 'just-a-lesson'],
    ['two slashes', 'a/b/c'],
    ['upper case', 'a/B'],
    ['a space', 'a/b c'],
    ['free text', 'my name is Asha/b'],
  ])('a question id with %s', (_, id) => {
    expectRefused(smallData({ answers: { [id]: { ok: 1 } } }), 'answers');
    expectRefused(smallData({ work: { [id]: { n: 1 } } }), 'work');
  });
  it.each([['2026-1-1'], ['20261101'], ['today'], ['1999-12-31'], ['2101-01-01']])('a day key %s', key => {
    expectRefused(smallData({ days: { [key]: { mins: 1 } } }), 'days');
  });
  it('too many entries', () => {
    const lessons = {};
    for (let i = 0; i <= LIMITS.lessons; i++) lessons[`l${i}`] = { status: 'open' };
    expectRefused(smallData({ lessons }), 'lessons');
    const days = [];
    for (let i = 0; i <= LIMITS.okDays; i++) days.push('2026-01-01');
    expectRefused(smallData({ answers: { [qid]: { okDays: days } } }), 'answers.*.okDays');
    const list = new Array(LIMITS.indexList + 1).fill(0);
    expectRefused(smallData({ work: { [qid]: { o: list } } }), 'work.*.o');
  });
  it('a wrong type or version', () => {
    expectRefused([], 'data');
    expectRefused('text', 'data');
    expectRefused(null, 'data');
    expectRefused({}, 'data.v');
    expectRefused({ v: '1' }, 'data.v');
    expectRefused({ v: 0 }, 'data.v');
    expectRefused({ v: 1000 }, 'data.v');
    expectRefused(smallData({ lessons: [] }), 'lessons');
    expectRefused(smallData({ lessons: { [lid]: [] } }), 'lessons.*');
  });
  it('says where, and never repeats what was sent', () => {
    const r = validateData(smallData({ answers: { [qid]: { note: 'my secret words' } } }));
    expect(JSON.stringify(r)).not.toContain('my secret');
    const bad = validateData(smallData({ lessons: { 'my secret words': {} } }));
    expect(JSON.stringify(bad)).not.toContain('secret');
  });
});

describe('the merge', () => {
  const A = {
    v: 1,
    lessons: { a: { status: 'open', openedAt: '2026-01-05', last: '2026-01-05', undone: true }, b: { status: 'done', openedAt: '2026-01-02', doneAt: '2026-01-03', last: '2026-01-03' }, only: { status: 'open' } },
    answers: {
      'a/q': { tries: 3, ok: 1, hints: 2, saw: false, box: 1, due: '2026-02-01', last: '2026-01-10', okDays: ['2026-01-01', '2026-01-10'], slip: '2026-01-02' },
      'a/r': { tries: 1, ok: 0, last: '2026-03-01', box: 0, due: '2026-03-01' },
    },
    days: { '2026-01-01': { mins: 5, acts: 9, lessons: 1, qs: 0 }, '2026-01-02': { mins: 1, acts: 1 } },
    work: { 'a/q': { t: 100, n: 1 } },
    goals: { weekDays: 5 },
    prefs: { theme: 'dark' },
  };
  const B = {
    v: 1,
    lessons: { a: { status: 'done', openedAt: '2026-01-01', doneAt: '2026-01-09', last: '2026-01-09' }, b: { status: 'done', openedAt: '2026-01-02', doneAt: '2026-01-07', last: '2026-01-07' } },
    answers: {
      'a/q': { tries: 2, ok: 4, hints: 0, saw: '2026-01-05', box: 3, due: '2026-03-01', last: '2026-01-20', okDays: ['2026-01-01', '2026-01-20'] },
      'a/r': { tries: 4, ok: 2, last: '2026-02-01', box: 2, due: '2026-02-20', okDays: ['2026-02-01'] },
    },
    days: { '2026-01-01': { mins: 8, acts: 2, lessons: 0, qs: 7 }, '2026-01-03': { mins: 4 } },
    work: { 'a/q': { t: 200, n: 3, s: 1 } },
    goals: { weekDays: 2 },
    prefs: { theme: 'light', size: '130' },
  };
  it('takes the finished lesson and the later doneAt', () => {
    const m = mergeData(A, B);
    expect(m.lessons.a).toEqual({ status: 'done', openedAt: '2026-01-01', doneAt: '2026-01-09', last: '2026-01-09' });
    expect(m.lessons.b.doneAt).toBe('2026-01-07');
    expect(m.lessons.only).toEqual({ status: 'open' });
  });
  it('keeps every right answer and the latest schedule', () => {
    const q = mergeData(A, B).answers['a/q'];
    expect(q).toEqual({ tries: 3, ok: 4, hints: 2, saw: '2026-01-05', box: 3, due: '2026-03-01', last: '2026-01-20', slip: '2026-01-02', okDays: ['2026-01-01', '2026-01-10', '2026-01-20'] });
    const r = mergeData(A, B).answers['a/r'];
    expect(r.ok).toBe(2);
    expect(r.tries).toBe(4);
    expect(r.last).toBe('2026-03-01');
    expect(r.box).toBe(0);
    expect(r.due).toBe('2026-03-01');
    expect(r.okDays).toEqual(['2026-02-01']);
  });
  it('unions days with the max of each counter', () => {
    const d = mergeData(A, B).days;
    expect(d['2026-01-01']).toEqual({ mins: 8, acts: 9, lessons: 1, qs: 7 });
    expect(d['2026-01-02']).toEqual({ mins: 1, acts: 1 });
    expect(d['2026-01-03']).toEqual({ mins: 4 });
  });
  it('takes the newest work, and goals and prefs follow this device', () => {
    const m = mergeData(A, B);
    expect(m.work['a/q']).toEqual({ t: 200, n: 3, s: 1 });
    expect(m.goals).toEqual({ weekDays: 5 });
    expect(m.prefs).toEqual({ theme: 'dark', size: '130' });
  });
  it('gives the same progress either way round, and merging twice changes nothing', () => {
    const progress = m => JSON.stringify([m.lessons, m.answers, m.days, m.work].map(x => Object.entries(x).sort()));
    const ab = mergeData(A, B), ba = mergeData(B, A);
    expect(progress(ab)).toBe(progress(ba));
    expect(progress(mergeData(ab, B))).toBe(progress(ab));
    expect(progress(mergeData(ab, ab))).toBe(progress(ab));
  });
  it('gives data that passes the schema, for real learners', () => {
    const a = toSyncData(typicalState), b = toSyncData(finishedState);
    const m = mergeData(a, b);
    expect(validateData(m)).toEqual({ ok: true });
    for (const [q, rec] of Object.entries(a.answers)) expect(m.answers[q].ok).toBeGreaterThanOrEqual(rec.ok);
    for (const [d, rec] of Object.entries(b.days)) expect(m.days[d].acts).toBeGreaterThanOrEqual(rec.acts);
    expect(mergeData(a, null).answers).toEqual(a.answers);
    expect(validateData(mergeData(null, null))).toEqual({ ok: true });
  });
});
