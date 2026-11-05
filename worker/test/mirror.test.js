import { beforeEach, describe, expect, it, vi } from 'vitest';
import { env } from 'cloudflare:workers';
import worker from '../src/index.js';
import { mirrorConfig, mirrorText, pathFor, runMirror } from '../src/mirror.js';
import { toSyncData } from '../src/schema.js';
import { stableStringify } from '../src/util.js';
import { createFakeGitHub } from './helpers/fake-github.js';
import { clearKv, del, gzip, keysWith, newLearner, post, req, send, smallData, testEnv } from './helpers/common.js';
import finishedState from './generated/finished-state.json';

const TOKEN = 'test-token-not-real';
const e = testEnv();
const NOW = Date.parse('2026-11-05T10:00:00Z');

let gh, sleeps;
beforeEach(async () => {
  await clearKv();
  gh = await createFakeGitHub().init();
  sleeps = [];
});
const config = over => ({ ...mirrorConfig(env), ...over });
/* One batch run, against the real KV and the fake GitHub. Time is an hour after the writes, so no
   marker is still inside its waiting period unless a test asks for that. */
const run = (over = {}, { kv = env.PROGRESS, fetchFn = gh.fetch, now = Date.now() + 3600 * 1000 } = {}) => runMirror({
  kv, fetchFn, token: TOKEN, config: config(over), now: () => now, sleep: async ms => { sleeps.push(ms); },
});
async function learnerAt(rev = 1, data = smallData()) {
  const who = newLearner();
  for (let r = 0; r < rev; r++) await post(e, who, r, data);
  return who;
}
const mirrored = who => JSON.parse(gh.files()[pathFor(who.id)]);

describe('one commit', () => {
  it('does nothing when nothing changed: no requests at all', async () => {
    const r = await run();
    expect(r.status).toBe('idle');
    expect(gh.log).toEqual([]);
    expect(gh.commitCount()).toBe(1);
  });
  it('writes everyone to one commit, in the right folders', async () => {
    const a = await learnerAt(), b = await learnerAt(2), c = await learnerAt();
    const r = await run();
    expect(r).toMatchObject({ status: 'committed', updated: 3, removed: 0, carried: 0 });
    expect(gh.commitCount()).toBe(2);
    for (const who of [a, b, c]) expect(Object.keys(gh.files())).toContain(`progress/${who.id.slice(0, 2)}/${who.id}.json`);
    expect(mirrored(b).rev).toBe(2);
    expect(await keysWith('dirty:')).toEqual([]);
  });
  it('writes pretty, stable JSON with sorted keys', async () => {
    const who = await learnerAt();
    await run();
    const text = gh.files()[pathFor(who.id)];
    expect(text).toContain('\n  "data": {\n');
    expect(text.endsWith('}\n')).toBe(true);
    const doc = JSON.parse(text);
    expect(Object.keys(doc)).toEqual(['data', 'id', 'rev', 'updatedAt']);
    expect(Object.keys(doc.data)).toEqual([...Object.keys(doc.data)].sort());
    expect(text).toBe(`${stableStringify(JSON.parse(text))}\n`);
    const shuffled = { rev: doc.rev, updatedAt: doc.updatedAt, data: { prefs: doc.data.prefs, v: 1, answers: doc.data.answers, days: doc.data.days, goals: doc.data.goals, lessons: doc.data.lessons } };
    expect(mirrorText(who.id, shuffled)).toBe(text);
  });
  it('puts no key, key hash or learner data in a commit message, and no key in any file', async () => {
    const who = await learnerAt();
    const stored = await env.PROGRESS.get(`p:${who.id}`, 'json');
    const other = await learnerAt();
    await del(e, other);
    await run();
    const [message] = gh.messages();
    expect(message).toBe('Mirror progress: 1 updated, 0 removed');
    const all = JSON.stringify(gh.files());
    expect(all).not.toContain(who.key);
    expect(all).not.toContain(stored.hash);
    expect(all).not.toContain('"hash"');
    for (const m of gh.messages()) {
      expect(m).not.toContain(who.id);
      expect(m).not.toContain(other.id);
    }
  });
  it('makes about 5 requests however many files, with no blob request per file', async () => {
    const who = [];
    for (let i = 0; i < 40; i++) who.push(await learnerAt());
    const r = await run();
    expect(r.updated).toBe(40);
    expect(gh.log.map(c => `${c.method} ${c.path.split('/').slice(0, 3).join('/')}`)).toEqual([
      'GET /git/ref', 'GET /git/commits', 'POST /git/trees', 'POST /git/commits', 'PATCH /git/refs',
    ]);
    expect(gh.log.some(c => c.path.includes('blobs'))).toBe(false);
    expect(new Set(gh.log.map(c => c.version)).size).toBe(1);
  });
  it('uses the token and sends a User-Agent, as GitHub requires', async () => {
    await learnerAt();
    const r = await runMirror({ kv: env.PROGRESS, fetchFn: gh.fetch, token: 'wrong', config: config(), now: () => NOW, sleep: async () => {} });
    expect(r).toMatchObject({ status: 'failed', stage: 'ref', httpStatus: 401 });
    expect(await keysWith('dirty:')).toHaveLength(1);
  });
  it('mirrors a whole finished course', async () => {
    const data = toSyncData(finishedState);
    const who = newLearner();
    const zipped = await gzip(JSON.stringify({ id: who.id, key: who.key, baseRev: 0, data }));
    expect((await send(e, req('POST', { raw: zipped, headers: { 'Content-Type': 'application/json', 'Content-Encoding': 'gzip' } }))).status).toBe(200);
    const r = await run();
    expect(r.status).toBe('committed');
    expect(mirrored(who).data.answers).toEqual(JSON.parse(stableStringify(data.answers)));
    const size = gh.files()[pathFor(who.id)].length;
    console.log(`finished course in the repo: ${Math.round(size / 1024)} KB as pretty JSON`);
  });
});

describe('failure leaves nothing lost', () => {
  it.each([
    ['reading the branch', 'GET /git/ref'],
    ['reading the commit', 'GET /git/commits'],
    ['creating the tree', 'POST /git/trees'],
    ['creating the commit', 'POST /git/commits'],
    ['moving the branch', 'PATCH /git/refs'],
  ])('a lasting failure at %s keeps every marker, and the next run finishes the job', async (_, match) => {
    const a = await learnerAt(), b = await learnerAt();
    gh.fail(match, 500, 99);
    const r = await run();
    expect(r.status).toBe('failed');
    expect(r.httpStatus).toBe(500);
    expect(r.commit).toBeNull();
    expect(await keysWith('dirty:')).toHaveLength(2);
    expect(gh.commitCount()).toBe(1);
    expect(Object.keys(gh.files())).toEqual(['README.md']);
    gh.clearFaults();
    const again = await run();
    expect(again).toMatchObject({ status: 'committed', updated: 2 });
    expect(mirrored(a).rev).toBe(1);
    expect(mirrored(b).rev).toBe(1);
    expect(await keysWith('dirty:')).toEqual([]);
  });
  it('retries a short failure with growing waits, and does not give up', async () => {
    const who = await learnerAt();
    gh.fail('POST /git/trees', 502, 2);
    gh.failNetwork('POST /git/commits', 1);
    gh.fail('PATCH /git/refs', 429, 1, { 'retry-after': '7' });
    const r = await run();
    expect(r.status).toBe('committed');
    expect(sleeps).toEqual([500, 1000, 500, 7000]);
    expect(mirrored(who).rev).toBe(1);
  });
  it('treats a rate-limit 403 as passing, but a plain 403 as final', async () => {
    await learnerAt();
    gh.fail('GET /git/ref', 403, 1, { 'x-ratelimit-remaining': '0' });
    expect((await run()).status).toBe('committed');
    await learnerAt();
    gh.fail('GET /git/ref', 403, 99);
    const r = await run();
    expect(r).toMatchObject({ status: 'failed', stage: 'ref', httpStatus: 403 });
    // Two for the rate-limited run (one retry), and one for the plain 403, which is not retried.
    expect(gh.log.filter(c => c.path.startsWith('/git/ref/')).length).toBe(3);
  });
  it('gives up after a few tries, and stays inside the request budget', async () => {
    await learnerAt();
    gh.fail('GET /git/ref', 503, 99);
    const r = await run();
    expect(r.status).toBe('failed');
    expect(r.githubCalls).toBe(4);
    await learnerAt();
    const small = await run({ maxGithubCalls: 2 });
    expect(small).toMatchObject({ status: 'failed', httpStatus: 'request_budget', githubCalls: 2 });
    expect(await keysWith('dirty:')).toHaveLength(2);
  });
  it('an empty repo fails clearly and keeps markers', async () => {
    await learnerAt();
    gh.makeEmpty();
    const r = await run();
    expect(r).toMatchObject({ status: 'failed', stage: 'ref', httpStatus: 409 });
    expect(await keysWith('dirty:')).toHaveLength(1);
  });
  it('no token: keeps markers and makes no requests', async () => {
    await learnerAt();
    const r = await runMirror({ kv: env.PROGRESS, fetchFn: gh.fetch, token: '', config: config(), now: () => NOW });
    expect(r).toMatchObject({ status: 'failed', stage: 'config' });
    expect(gh.log).toEqual([]);
    expect(await keysWith('dirty:')).toHaveLength(1);
  });
  it('tries again from the new head if the owner pushed during the run', async () => {
    const who = await learnerAt();
    gh.before('PATCH /git/refs/heads/main', () => gh.pushFromElsewhere('NOTES.md', 'mine\n'));
    const r = await run();
    expect(r.status).toBe('committed');
    expect(gh.files()['NOTES.md']).toBe('mine\n');
    expect(mirrored(who).rev).toBe(1);
    expect(await keysWith('dirty:')).toEqual([]);
  });
});

describe('a sync during a run', () => {
  const during = async fn => {
    gh.before('POST /git/trees', fn);
  };
  it('is not lost: its marker survives, and the next run commits it', async () => {
    const who = await learnerAt();
    let rev2;
    await during(async () => { rev2 = await post(e, who, 1, smallData({ goals: { weekDays: 7 } })); });
    const r = await run();
    expect(rev2.status).toBe(200);
    expect(r.status).toBe('committed');
    expect(mirrored(who).rev).toBe(1); // This run read the older copy.
    expect(await keysWith('dirty:')).toEqual([`dirty:${who.id}:2`]);
    const next = await run();
    expect(next).toMatchObject({ status: 'committed', updated: 1 });
    expect(mirrored(who).rev).toBe(2);
    expect(mirrored(who).data.goals.weekDays).toBe(7);
    expect(await keysWith('dirty:')).toEqual([]);
  });
  it('is still kept if the sync lands between reading KV and clearing markers', async () => {
    const who = await learnerAt();
    await during(async () => {});
    gh.before('PATCH /git/refs/heads/main', async () => { await post(e, who, 1, smallData({ goals: { weekDays: 2 } })); });
    await run();
    expect(await keysWith('dirty:')).toEqual([`dirty:${who.id}:2`]);
    await run();
    expect(mirrored(who).data.goals.weekDays).toBe(2);
  });
  it('survives KV giving a stale read while clearing: only keys seen are ever deleted', async () => {
    const who = await learnerAt();
    gh.before('PATCH /git/refs/heads/main', async () => { await post(e, who, 1, smallData()); });
    const deleted = [];
    const kv = {
      list: (...a) => env.PROGRESS.list(...a),
      get: (...a) => env.PROGRESS.get(...a),
      put: (...a) => env.PROGRESS.put(...a),
      delete: k => { deleted.push(k); return env.PROGRESS.delete(k); },
    };
    await run({}, { kv });
    expect(deleted).toEqual([`dirty:${who.id}:1`]);
  });
  it('a deletion during a run wins on the next run', async () => {
    const who = await learnerAt();
    await during(async () => { await del(e, who); });
    await run();
    expect(gh.files()[pathFor(who.id)]).toBeDefined(); // This run had already read the data.
    const r = await run();
    expect(r).toMatchObject({ status: 'committed', removed: 1, updated: 0 });
    expect(gh.files()[pathFor(who.id)]).toBeUndefined();
    expect(await keysWith('dirty:')).toEqual([]);
  });
});

describe('KV is eventually consistent', () => {
  const staleFor = (who, staleRecord) => ({
    list: (...a) => env.PROGRESS.list(...a),
    put: (...a) => env.PROGRESS.put(...a),
    delete: (...a) => env.PROGRESS.delete(...a),
    get: async (keys, opt) => {
      const got = await env.PROGRESS.get(keys, opt);
      got.set(`p:${who.id}`, staleRecord && JSON.stringify(staleRecord));
      return got;
    },
  });
  it('waits if KV here is behind a new marker, rather than write old data and lose the change', async () => {
    const who = await learnerAt(2);
    const old = { ...(await env.PROGRESS.get(`p:${who.id}`, 'json')), rev: 1 };
    const r = await run({}, { kv: staleFor(who, old), now: Date.now() + 60000 });
    expect(r).toMatchObject({ status: 'no_change', carried: 1, updated: 0 });
    expect(await keysWith('dirty:')).toHaveLength(2);
    expect(gh.files()[pathFor(who.id)]).toBeUndefined();
    await run();
    expect(mirrored(who).rev).toBe(2);
  });
  it('waits if the record has not reached here yet', async () => {
    const who = await learnerAt();
    const r = await run({}, { kv: staleFor(who, null), now: Date.now() + 60000 });
    expect(r).toMatchObject({ status: 'no_change', carried: 1 });
    expect(await keysWith('dirty:')).toHaveLength(1);
  });
  it('does not wait for ever: an old marker with no record is cleared', async () => {
    const who = await learnerAt();
    await env.PROGRESS.delete(`p:${who.id}`);
    const r = await run();
    expect(r).toMatchObject({ status: 'no_change', carried: 0, cleared: 1 });
    expect(await keysWith('dirty:')).toEqual([]);
  });
  it('does not wait for ever: a rev that went backwards still gets mirrored and cleared', async () => {
    const who = await learnerAt(2);
    const stored = await env.PROGRESS.get(`p:${who.id}`, 'json');
    await env.PROGRESS.put(`p:${who.id}`, JSON.stringify({ ...stored, rev: 1 }));
    await run();
    expect(mirrored(who).rev).toBe(1);
    expect(await keysWith('dirty:')).toEqual([]);
  });
  it('a stale write after a delete is erased again: the tombstone wins', async () => {
    const who = await learnerAt();
    await run();
    await del(e, who);
    await run();
    expect(gh.files()[pathFor(who.id)]).toBeUndefined();
    // Another Cloudflare location had not seen the delete, and let an old device save.
    await env.PROGRESS.put(`p:${who.id}`, JSON.stringify({ hash: 'x', rev: 9, data: smallData(), updatedAt: new Date().toISOString() }));
    await env.PROGRESS.put(`dirty:${who.id}:9`, '1', { metadata: { at: Date.now(), size: 100 } });
    const r = await run();
    expect(r.updated).toBe(0);
    expect(await env.PROGRESS.get(`p:${who.id}`)).toBeNull();
    expect(gh.files()[pathFor(who.id)]).toBeUndefined();
    expect(await keysWith('dirty:')).toEqual([]);
  });
});

describe('deletions', () => {
  it('removes the file in the same commit as other changes, with no learner data in the message', async () => {
    const gone = await learnerAt(), kept = await learnerAt();
    await run();
    await del(e, gone);
    await post(e, kept, 1, smallData({ goals: { weekDays: 7 } }));
    const r = await run();
    expect(r).toMatchObject({ status: 'committed', updated: 1, removed: 1 });
    expect(gh.commitCount()).toBe(3);
    expect(gh.messages()[0]).toBe('Mirror progress: 1 updated, 1 removed');
    expect(gh.files()[pathFor(gone.id)]).toBeUndefined();
    expect(mirrored(kept).rev).toBe(2);
    expect(await keysWith('dirty:')).toEqual([]);
  });
  it('a learner who deletes before their first batch does not break the run', async () => {
    const never = await learnerAt(), other = await learnerAt();
    await del(e, never);
    const r = await run();
    expect(r).toMatchObject({ status: 'committed', updated: 1, removed: 0 });
    expect(mirrored(other).rev).toBe(1);
    expect(gh.files()[pathFor(never.id)]).toBeUndefined();
    expect(await keysWith(`dirty:${never.id}`)).toEqual([]);
  });
  it('only that deletion, with no file anywhere: no commit, and markers clear', async () => {
    const never = await learnerAt();
    await del(e, never);
    const r = await run();
    expect(r).toMatchObject({ status: 'no_change', removed: 0 });
    expect(gh.commitCount()).toBe(1);
    expect(await keysWith('dirty:')).toEqual([]);
  });
  it('a learner sharing a folder with another is removed alone', async () => {
    const stay = newLearner();
    const go = { id: `${stay.id.slice(0, 2)}${'f'.repeat(30)}`, key: stay.key };
    await post(e, stay, 0, smallData());
    await post(e, go, 0, smallData());
    await run();
    await del(e, go);
    await run();
    expect(gh.files()[pathFor(go.id)]).toBeUndefined();
    expect(mirrored(stay).rev).toBe(1);
  });
  it('a failed commit keeps the deletion marker, and the file goes next time', async () => {
    const who = await learnerAt();
    await run();
    await del(e, who);
    gh.fail('POST /git/commits', 500, 99);
    expect((await run()).status).toBe('failed');
    expect(await keysWith('dirty:')).toEqual([`dirty:${who.id}:del`]);
    expect(gh.files()[pathFor(who.id)]).toBeDefined();
    gh.clearFaults();
    expect((await run()).removed).toBe(1);
    expect(gh.files()[pathFor(who.id)]).toBeUndefined();
  });
  it('finishes a DELETE that stopped part way', async () => {
    const who = await learnerAt();
    await run();
    // The request died after the marker: no tombstone, record still there.
    await env.PROGRESS.put(`dirty:${who.id}:del`, '1', { metadata: { at: Date.now(), size: 0 } });
    const r = await run();
    expect(r.removed).toBe(1);
    expect(await env.PROGRESS.get(`p:${who.id}`)).toBeNull();
    expect(await env.PROGRESS.get(`gone:${who.id}`)).not.toBeNull();
    expect((await post(e, who, 0, smallData())).status).toBe(410);
  });
  it('after a deletion, a stale client cannot put the file back', async () => {
    const who = await learnerAt();
    await run();
    await del(e, who);
    await run();
    const commits = gh.commitCount();
    expect((await post(e, who, 0, smallData())).status).toBe(410);
    expect((await post(e, who, 1, smallData())).status).toBe(410);
    expect((await run()).status).toBe('idle');
    expect(gh.commitCount()).toBe(commits);
    expect(gh.files()[pathFor(who.id)]).toBeUndefined();
  });
  it('deletions go first, and limit the folders looked up per run', async () => {
    const people = ['aa', 'bb', 'cc', 'dd'].map(p => ({ id: p.repeat(16), key: 'e'.repeat(32) }));
    for (const who of people) await post(e, who, 0, smallData());
    await run();
    for (const who of people) await del(e, who);
    const waiting = await learnerAt();
    const first = await run({ maxPrefixes: 1 });
    expect(first).toMatchObject({ status: 'committed', removed: 1, updated: 1, carried: 3 });
    expect(gh.files()[pathFor(waiting.id)]).toBeDefined();
    expect(gh.files()[pathFor(people[3].id)]).toBeDefined();
    await run({ maxPrefixes: 1 });
    await run({ maxPrefixes: 1 });
    await run({ maxPrefixes: 1 });
    for (const who of people) expect(gh.files()[pathFor(who.id)]).toBeUndefined();
    expect(await keysWith('dirty:')).toEqual([]);
  });
  it('the owner can delete by hand with two simple keys, when a learner has lost their key', async () => {
    const who = await learnerAt();
    await run();
    await env.PROGRESS.put(`gone:${who.id}`, '1');
    await env.PROGRESS.put(`dirty:${who.id}:del`, '1');
    expect((await post(e, who, 1, smallData())).status).toBe(410);
    const r = await run();
    expect(r.removed).toBe(1);
    expect(gh.files()[pathFor(who.id)]).toBeUndefined();
    expect(await env.PROGRESS.get(`p:${who.id}`)).toBeNull();
  });
  it('one damaged stored value does not stop everybody else', async () => {
    const good = await learnerAt(), bad = await learnerAt();
    await env.PROGRESS.put(`p:${bad.id}`, 'not json');
    const r = await run();
    expect(r).toMatchObject({ status: 'committed', updated: 1 });
    expect(mirrored(good).rev).toBe(1);
    expect(gh.files()[pathFor(bad.id)]).toBeUndefined();
  });
  it('a deletion is taken before updates when the file cap is tight', async () => {
    const a = await learnerAt();
    await run();
    await learnerAt();
    await learnerAt();
    await del(e, a);
    const r = await run({ maxFiles: 1 });
    expect(r).toMatchObject({ updated: 0, removed: 1, carried: 2 });
  });
});

describe('the caps and carry-over', () => {
  it('takes only the file cap, carries the rest, and gets to everyone in the end', async () => {
    const people = [];
    for (let i = 0; i < 7; i++) people.push(await learnerAt());
    const first = await run({ maxFiles: 3 });
    expect(first).toMatchObject({ status: 'committed', updated: 3, carried: 4 });
    expect(await keysWith('dirty:')).toHaveLength(4);
    const second = await run({ maxFiles: 3 });
    expect(second).toMatchObject({ updated: 3, carried: 1 });
    const third = await run({ maxFiles: 3 });
    expect(third).toMatchObject({ updated: 1, carried: 0 });
    expect((await run({ maxFiles: 3 })).status).toBe('idle');
    for (const who of people) expect(mirrored(who).rev).toBe(1);
    expect(gh.commitCount()).toBe(4);
  });
  it('holds 300 files in one commit', async () => {
    for (let i = 0; i < 305; i++) {
      const id = `${i.toString(16).padStart(32, '0')}`;
      await env.PROGRESS.put(`p:${id}`, JSON.stringify({ hash: 'x', rev: 1, data: { v: 1 }, updatedAt: '2026-11-05T00:00:00.000Z' }));
      await env.PROGRESS.put(`dirty:${id}:1`, '1', { metadata: { at: i, size: 100 } });
    }
    const r = await run();
    expect(r).toMatchObject({ status: 'committed', updated: 300, carried: 5 });
    expect(r.githubCalls).toBe(5);
    expect(gh.commitCount()).toBe(2);
    expect(await keysWith('dirty:')).toHaveLength(5);
  });
  it('whoever has waited longest goes first, so nobody can be pushed out for ever', async () => {
    const make = async (id, at) => {
      await env.PROGRESS.put(`p:${id}`, JSON.stringify({ hash: 'x', rev: 1, data: { v: 1 }, updatedAt: '2026-11-05T00:00:00.000Z' }));
      await env.PROGRESS.put(`dirty:${id}:1`, '1', { metadata: { at, size: 10 } });
    };
    const late = 'f'.repeat(32), early = '0'.repeat(32);
    await make(late, 1000);
    await make(early, 2000);
    await run({ maxFiles: 1 });
    expect(gh.files()[pathFor(late)]).toBeDefined();
    expect(gh.files()[pathFor(early)]).toBeUndefined();
  });
  it('the byte budget carries the rest, but always takes at least one', async () => {
    const who = [];
    for (let i = 0; i < 3; i++) who.push(await learnerAt());
    const one = await run({ maxBytes: 10 });
    expect(one).toMatchObject({ updated: 1, carried: 2 });
    const rest = await run();
    expect(rest).toMatchObject({ updated: 2, carried: 0 });
  });
  it('stops at the KV budget, and the next run finishes clearing', async () => {
    const a = await learnerAt(), b = await learnerAt();
    const r = await run({ maxKvOps: 3 });
    expect(r.status).toBe('committed');
    expect(r.clearFailed).toBeGreaterThan(0);
    expect((await keysWith('dirty:')).length).toBeGreaterThan(0);
    const commits = gh.commitCount();
    const next = await run();
    expect(next.status).toBe('no_change');
    expect(gh.commitCount()).toBe(commits);
    expect(await keysWith('dirty:')).toEqual([]);
    expect(mirrored(a).rev).toBe(1);
    expect(mirrored(b).rev).toBe(1);
  });
});

describe('running again', () => {
  it('a rerun with nothing new is idle', async () => {
    await learnerAt();
    await run();
    const head = gh.head;
    expect((await run()).status).toBe('idle');
    expect(gh.head).toBe(head);
  });
  it('commit done but clearing failed: the rerun makes no second commit, and clears', async () => {
    const who = await learnerAt();
    const broken = {
      list: (...a) => env.PROGRESS.list(...a),
      get: (...a) => env.PROGRESS.get(...a),
      put: (...a) => env.PROGRESS.put(...a),
      delete: async () => { throw new Error('KV delete failed'); },
    };
    const first = await run({}, { kv: broken });
    expect(first).toMatchObject({ status: 'committed', cleared: 0, clearFailed: 1 });
    expect(await keysWith('dirty:')).toHaveLength(1);
    const head = gh.head;
    const again = await run();
    expect(again).toMatchObject({ status: 'no_change', cleared: 1 });
    expect(gh.head).toBe(head);
    expect(gh.commitCount()).toBe(2);
    expect(mirrored(who).rev).toBe(1);
    expect(await keysWith('dirty:')).toEqual([]);
  });
  it('commit made, then the worker died before clearing, then a deletion arrives: still correct', async () => {
    const who = await learnerAt();
    const noClear = {
      list: (...a) => env.PROGRESS.list(...a),
      get: (...a) => env.PROGRESS.get(...a),
      put: (...a) => env.PROGRESS.put(...a),
      delete: async () => { throw new Error('KV delete failed'); },
    };
    await run({}, { kv: noClear });
    await del(e, who);
    const r = await run();
    expect(r.removed).toBe(1);
    expect(gh.files()[pathFor(who.id)]).toBeUndefined();
    expect(await keysWith('dirty:')).toEqual([]);
  });
});

describe('the scheduled entry point', () => {
  const realFetch = globalThis.fetch;
  const scheduled = (extra = {}) => worker.scheduled({ cron: '0 * * * *' }, { ...e, GITHUB_TOKEN: TOKEN, ...extra }, { waitUntil() {} });
  const useFake = () => { globalThis.fetch = (url, init) => gh.fetch(url, init); };
  const restore = () => { globalThis.fetch = realFetch; };

  it('commits and logs only counts', async () => {
    const who = await learnerAt();
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    useFake();
    try { await scheduled(); } finally { restore(); }
    expect(spy).toHaveBeenCalledTimes(1);
    const line = spy.mock.calls[0][0];
    expect(JSON.parse(line)).toMatchObject({ mirror: 'committed', updated: 1 });
    expect(line).not.toContain(who.id);
    expect(line).not.toContain(TOKEN);
    spy.mockRestore();
    expect(mirrored(who).rev).toBe(1);
  });
  it('throws on failure, so the dashboard shows it, with no id or token in the message', async () => {
    const who = await learnerAt();
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    gh.fail('GET /git/ref', 500, 99);
    useFake();
    let err;
    try { await scheduled(); } catch (x) { err = x; } finally { restore(); }
    spy.mockRestore();
    expect(err.message).toBe('Mirror failed at ref (500)');
    expect(err.message).not.toContain(who.id);
    expect(await keysWith('dirty:')).toHaveLength(1);
  });
  it('reads the repo name and limits from env vars, with the right defaults', () => {
    const d = mirrorConfig({});
    expect(d).toMatchObject({ owner: 'Faheem-Musthafa', repo: 'learn-python-dsa-progress', branch: 'main', maxFiles: 300 });
    expect(mirrorConfig({ GITHUB_REPO: 'other', MIRROR_MAX_FILES: '5' })).toMatchObject({ repo: 'other', maxFiles: 5 });
    expect(mirrorConfig(env)).toMatchObject({ repo: 'learn-python-dsa-progress', maxBytes: 393216 });
  });
});
