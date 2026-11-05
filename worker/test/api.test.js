import { beforeEach, describe, expect, it, vi } from 'vitest';
import { env, exports as workerExports } from 'cloudflare:workers';
import { LIMITS, packForSync, toSyncData } from '../src/schema.js';
import { constantTimeEqual, sha256Hex, stableStringify } from '../src/util.js';
import { ORIGIN, URL_SYNC, clearKv, del, getSync, gzip, keysWith, newLearner, post, req, send, smallData, testEnv } from './helpers/common.js';
import typicalState from './generated/typical-state.json';
import finishedState from './generated/finished-state.json';

beforeEach(clearKv);

const expectError = (r, status, code) => {
  expect(r.status).toBe(status);
  expect(r.body.error.code).toBe(code);
  expect(typeof r.body.error.message).toBe('string');
};

describe('claim and sync', () => {
  const e = testEnv();

  it('claims on the first write, and stores only a hash of the key', async () => {
    const who = newLearner();
    const r = await post(e, who, 0, smallData());
    expect(r.status).toBe(200);
    expect(r.body).toEqual({ rev: 1 });
    const stored = await env.PROGRESS.get(`p:${who.id}`, 'json');
    expect(Object.keys(stored).sort()).toEqual(['data', 'hash', 'rev', 'updatedAt']);
    expect(stored.hash).toBe(await sha256Hex(who.key));
    expect(JSON.stringify(stored)).not.toContain(who.key);
    expect(await keysWith(`dirty:${who.id}`)).toEqual([`dirty:${who.id}:1`]);
  });
  it('refuses a wrong key on every route, and changes nothing', async () => {
    const who = newLearner();
    await post(e, who, 0, smallData());
    const thief = { id: who.id, key: newLearner().key };
    expectError(await post(e, thief, 1, smallData({ days: {} })), 403, 'forbidden');
    expectError(await getSync(e, thief), 403, 'forbidden');
    expectError(await del(e, thief), 403, 'forbidden');
    const stored = await env.PROGRESS.get(`p:${who.id}`, 'json');
    expect(stored.rev).toBe(1);
    expect(Object.keys(stored.data.days).length).toBe(1);
    expect(await keysWith('gone:')).toEqual([]);
  });
  it('saves when baseRev matches and counts up', async () => {
    const who = newLearner();
    await post(e, who, 0, smallData());
    const r = await post(e, who, 1, smallData({ goals: { weekDays: 5 } }));
    expect(r.body).toEqual({ rev: 2 });
    const got = await getSync(e, who);
    expect(got.status).toBe(200);
    expect(got.body.rev).toBe(2);
    expect(got.body.data.goals.weekDays).toBe(5);
    expect(Object.keys(got.body).sort()).toEqual(['data', 'rev']);
  });
  it('answers 409 with what is stored when baseRev differs, and does not save', async () => {
    const who = newLearner();
    await post(e, who, 0, smallData());
    await post(e, who, 1, smallData({ goals: { weekDays: 6 } }));
    const r = await post(e, who, 1, smallData({ goals: { weekDays: 1 } }));
    expect(r.status).toBe(409);
    expect(r.body.rev).toBe(2);
    expect(r.body.data.goals.weekDays).toBe(6);
    expect(Object.keys(r.body).sort()).toEqual(['data', 'rev']);
    const later = await post(e, who, 99, smallData());
    expect(later.status).toBe(409);
    expect((await getSync(e, who)).body.data.goals.weekDays).toBe(6);
    expect(await keysWith(`dirty:${who.id}`)).toEqual([`dirty:${who.id}:1`, `dirty:${who.id}:2`]);
  });
  it('after a 409 the client merges and retries, and then it saves', async () => {
    const who = newLearner();
    await post(e, who, 0, smallData());
    await post(e, who, 1, smallData({ goals: { weekDays: 6 } }));
    const conflict = await post(e, who, 1, smallData({ goals: { weekDays: 1 } }));
    const retry = await post(e, who, conflict.body.rev, smallData({ goals: { weekDays: 1 } }));
    expect(retry.status).toBe(200);
    expect(retry.body.rev).toBe(3);
  });
  it('answers 409 with nothing stored for an unknown id with a baseRev above 0', async () => {
    const r = await post(e, newLearner(), 4, smallData());
    expect(r.status).toBe(409);
    expect(r.body).toEqual({ rev: 0, data: null });
  });
  it('GET: 404 for an unknown id, and the key must be in the header', async () => {
    const who = newLearner();
    expectError(await getSync(e, who), 404, 'not_found');
    await post(e, who, 0, smallData());
    expectError(await send(e, req('GET', { url: `${URL_SYNC}?id=${who.id}&key=${who.key}` })), 401, 'unauthorized');
    expectError(await send(e, req('GET', { url: `${URL_SYNC}?id=${who.id}`, headers: { Authorization: `Basic ${who.key}` } })), 401, 'unauthorized');
    expectError(await send(e, req('GET', { url: URL_SYNC, headers: { Authorization: `Bearer ${who.key}` } })), 400, 'bad_request');
  });
  it('uses the constant-time compare, for every route', async () => {
    const who = newLearner();
    const compare = vi.fn(constantTimeEqual);
    await post(e, who, 0, smallData(), { compare });
    expect(compare).not.toHaveBeenCalled(); // Nothing to compare on a claim.
    await post(e, who, 1, smallData(), { compare });
    await getSync(e, who, who.key, { compare });
    await del(e, who, who.key, { compare });
    expect(compare).toHaveBeenCalledTimes(3);
    const hash = await sha256Hex(who.key);
    for (const call of compare.mock.calls) expect(call).toEqual([hash, hash]);
  });
  it('the compare itself is right', async () => {
    expect(constantTimeEqual('abc', 'abc')).toBe(true);
    expect(constantTimeEqual('abc', 'abd')).toBe(false);
    expect(constantTimeEqual('abc', 'abcd')).toBe(false);
    // In workerd this should be the runtime's own constant-time function.
    expect(typeof crypto.subtle.timingSafeEqual).toBe('function');
  });
  it('stableStringify gives the same bytes for any key order', () => {
    expect(stableStringify({ b: 1, a: { d: 1, c: [{ z: 1, y: 2 }] } })).toBe(stableStringify({ a: { c: [{ y: 2, z: 1 }], d: 1 }, b: 1 }));
  });
});

describe('real learners, end to end', () => {
  const e = testEnv();
  it('accepts a typical learner, sent as plain JSON or gzip', async () => {
    const data = toSyncData(typicalState);
    const who = newLearner();
    const body = JSON.stringify({ id: who.id, key: who.key, baseRev: 0, data });
    const zipped = await gzip(body);
    expect(zipped.byteLength).toBeLessThan(LIMITS.wireBytes);
    const r = await send(e, req('POST', { raw: zipped, headers: { 'Content-Type': 'application/json', 'Content-Encoding': 'gzip' } }));
    expect(r.status).toBe(200);
    expect((await getSync(e, who)).body.data).toEqual(data);
  });
  it('accepts a whole finished course, because gzip fits it in 64 KB', async () => {
    const data = toSyncData(finishedState);
    const who = newLearner();
    const text = JSON.stringify({ id: who.id, key: who.key, baseRev: 0, data });
    const zipped = await gzip(text);
    // Why gzip is in the contract at all: as plain JSON this learner is far over the limit.
    expect(text.length).toBeGreaterThan(LIMITS.wireBytes * 3);
    expect(zipped.byteLength).toBeLessThan(LIMITS.wireBytes);
    expect(text.length).toBeLessThan(LIMITS.jsonBytes);
    const plain = await send(e, req('POST', { raw: text, headers: { 'Content-Type': 'application/json' } }));
    expectError(plain, 413, 'too_large');
    const r = await send(e, req('POST', { raw: zipped, headers: { 'Content-Type': 'application/json', 'Content-Encoding': 'gzip' } }));
    expect(r.status).toBe(200);
    expect((await getSync(e, who)).body.data).toEqual(data);
    console.log(`finished course: ${Math.round(text.length / 1024)} KB of JSON, ${Math.round(zipped.byteLength / 1024)} KB gzipped`);
  });
});

describe('packForSync, the client helper', () => {
  const e = testEnv();
  const sendPack = pack => send(e, req('POST', { raw: pack.body, headers: pack.headers }));

  it('sends a short body as plain JSON', async () => {
    const who = newLearner();
    const pack = await packForSync({ ...who, baseRev: 0, data: smallData() });
    expect(typeof pack.body).toBe('string');
    expect(pack.withoutWork).toBe(false);
    expect((await sendPack(pack)).status).toBe(200);
  });
  it('gzips a long body, and work stays', async () => {
    const who = newLearner();
    const data = toSyncData(finishedState);
    const pack = await packForSync({ ...who, baseRev: 0, data });
    expect(pack.headers['Content-Encoding']).toBe('gzip');
    expect(pack.withoutWork).toBe(false);
    expect((await sendPack(pack)).status).toBe(200);
    expect((await getSync(e, who)).body.data.work).toEqual(data.work);
  });
  it('drops work, and never progress, when gzip is still too big', async () => {
    const who = newLearner();
    const data = toSyncData(finishedState);
    // Real clocks make t much harder to compress than this made-up learner's. Make it worse still.
    for (const k of Object.keys(data.work)) data.work[k].t = Math.floor(Math.random() * LIMITS.epochMs);
    for (const k of Object.keys(data.work)) data.work[k].n = Math.floor(Math.random() * LIMITS.counter);
    for (const k of Object.keys(data.work)) data.work[k].h = Math.floor(Math.random() * LIMITS.counter);
    const pack = await packForSync({ ...who, baseRev: 0, data });
    expect(pack.withoutWork).toBe(true);
    expect((await sendPack(pack)).status).toBe(200);
    const got = (await getSync(e, who)).body.data;
    expect(got.work).toBeUndefined();
    expect(got.answers).toEqual(data.answers);
    expect(got.lessons).toEqual(data.lessons);
  });
  it('gives up cleanly when nothing fits', async () => {
    const answers = {};
    for (let i = 0; i < LIMITS.answers; i++) answers['l' + i.toString(36) + '/q' + Math.random().toString(36).slice(2)] = { tries: Math.floor(Math.random() * 1e6), ok: Math.floor(Math.random() * 1e6) };
    expect(await packForSync({ ...newLearner(), baseRev: 0, data: { v: 1, answers } })).toBeNull();
  });
});

describe('what the body may be', () => {
  const e = testEnv();
  it.each([
    ['nickname', { name: 'Asha' }],
    ['notes', { notes: { '1-1-a': 'my note' } }],
    ['code', { code: { 'q:1-1-a/b': 'print("hi")' } }],
    ['unknown field', { favouriteColour: 'blue' }],
    ['bad lesson id', { lessons: { 'Bad Id': { status: 'open' } } }],
    ['bad question id', { answers: { 'no-slash': { ok: 1 } } }],
    ['bad date', { days: { 'not-a-date': { mins: 1 } } }],
    ['free text in a value', { answers: { '1-1-a/b': { saw: 'free text' } } }],
    ['typed answer in work', { work: { '1-1-a/b': { x: 'typed' } } }],
  ])('refuses %s with 400 and stores nothing', async (_, extra) => {
    const who = newLearner();
    const r = await post(e, who, 0, smallData(extra));
    expectError(r, 400, 'bad_data');
    expect(JSON.stringify(r.body)).not.toContain('Asha');
    expect(await env.PROGRESS.get(`p:${who.id}`)).toBeNull();
    expect(await keysWith(`dirty:${who.id}`)).toEqual([]);
  });
  it('refuses unknown fields beside id and key', async () => {
    const who = newLearner();
    const r = await send(e, req('POST', { body: { id: who.id, key: who.key, baseRev: 0, data: smallData(), nickname: 'Asha' } }));
    expectError(r, 400, 'bad_request');
  });
  it.each([
    ['short id', { id: 'abc' }, 'id'],
    ['upper case id', { id: 'A'.repeat(32) }, 'id'],
    ['non hex id', { id: 'z'.repeat(32) }, 'id'],
    ['id with a path', { id: `../${'a'.repeat(32)}` }, 'id'],
    ['short key', { key: 'abc' }, 'key'],
    ['number key', { key: 12345 }, 'key'],
    ['negative baseRev', { baseRev: -1 }, 'baseRev'],
    ['text baseRev', { baseRev: '1' }, 'baseRev'],
    ['fraction baseRev', { baseRev: 1.5 }, 'baseRev'],
  ])('refuses %s', async (_, over, field) => {
    const who = newLearner();
    const r = await send(e, req('POST', { body: { id: who.id, key: who.key, baseRev: 0, data: smallData(), ...over } }));
    expectError(r, 400, 'bad_request');
    expect(r.body.error.field).toBe(field);
  });
  it('refuses a body over the limit, even if Content-Length lies or is missing', async () => {
    const who = newLearner();
    const big = JSON.stringify({ id: who.id, key: who.key, baseRev: 0, data: { v: 1, pad: 'x'.repeat(70000) } });
    expectError(await send(e, req('POST', { raw: big, headers: { 'Content-Type': 'application/json' } })), 413, 'too_large');
    // A stream has no Content-Length, so the limit has to hold while reading.
    const stream = new Response(big).body;
    const r = await send(e, new Request(URL_SYNC, { method: 'POST', body: stream, duplex: 'half', headers: { Origin: ORIGIN, 'Content-Type': 'application/json' } }));
    expectError(r, 413, 'too_large');
  });
  it('checks Content-Length before reading anything', async () => {
    let read = false;
    const stream = new ReadableStream({ pull(c) { read = true; c.close(); } }, { highWaterMark: 0 });
    const fake = new Request(URL_SYNC, { method: 'POST', body: stream, duplex: 'half', headers: { Origin: ORIGIN, 'Content-Type': 'application/json', 'Content-Length': '999999' } });
    expectError(await send(e, fake), 413, 'too_large');
    expect(read).toBe(false);
  });
  it('refuses a small gzip that unpacks to something huge', async () => {
    const bomb = await gzip(' '.repeat(5 * 1024 * 1024));
    expect(bomb.byteLength).toBeLessThan(LIMITS.wireBytes);
    const r = await send(e, req('POST', { raw: bomb, headers: { 'Content-Type': 'application/json', 'Content-Encoding': 'gzip' } }));
    expectError(r, 413, 'too_large');
  });
  it('refuses broken gzip and a gzip body that is not JSON', async () => {
    const zipped = await gzip('{"id":');
    const broken = zipped.slice(0, 12);
    expectError(await send(e, req('POST', { raw: broken, headers: { 'Content-Type': 'application/json', 'Content-Encoding': 'gzip' } })), 400, 'bad_json');
    expectError(await send(e, req('POST', { raw: zipped, headers: { 'Content-Type': 'application/json', 'Content-Encoding': 'gzip' } })), 400, 'bad_json');
  });
  it('still reads a body labelled gzip that a host already unpacked', async () => {
    const who = newLearner();
    const raw = JSON.stringify({ id: who.id, key: who.key, baseRev: 0, data: smallData() });
    const r = await send(e, req('POST', { raw, headers: { 'Content-Type': 'application/json', 'Content-Encoding': 'gzip' } }));
    expect(r.status).toBe(200);
  });
  it('refuses other encodings, content types, bad JSON and non-objects', async () => {
    expectError(await send(e, req('POST', { raw: 'x', headers: { 'Content-Type': 'application/json', 'Content-Encoding': 'br' } })), 415, 'unsupported_type');
    expectError(await send(e, req('POST', { raw: '{}', headers: { 'Content-Type': 'text/plain' } })), 415, 'unsupported_type');
    expectError(await send(e, req('POST', { raw: 'a=1', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })), 415, 'unsupported_type');
    expectError(await send(e, req('POST', { raw: '{nope', headers: { 'Content-Type': 'application/json' } })), 400, 'bad_json');
    expectError(await send(e, req('POST', { raw: '[1]', headers: { 'Content-Type': 'application/json' } })), 400, 'bad_request');
    expectError(await send(e, req('POST', { raw: 'null', headers: { 'Content-Type': 'application/json' } })), 400, 'bad_request');
    expect((await send(e, req('POST', { raw: '{}', headers: { 'Content-Type': 'application/json; charset=utf-8' } }))).status).toBe(400);
  });
});

describe('CORS', () => {
  const e = testEnv();
  it.each([
    ['https://faheem-musthafa.github.io'],
    ['http://localhost:8765'],
    ['http://127.0.0.1:8765'],
  ])('answers a preflight from %s', async origin => {
    const res = await send(e, req('OPTIONS', { origin, headers: { 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type,content-encoding,authorization' } }));
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(origin);
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('DELETE');
    expect(res.headers.get('Access-Control-Allow-Headers')).toMatch(/Authorization/);
    expect(res.headers.get('Access-Control-Allow-Headers')).toMatch(/Content-Encoding/);
    expect(res.headers.get('Vary')).toBe('Origin');
  });
  it.each([
    ['https://evil.example'],
    ['https://faheem-musthafa.github.io.evil.example'],
    ['https://evil-faheem-musthafa.github.io'],
    ['http://faheem-musthafa.github.io'],
    ['http://localhost:8766'],
    ['null'],
  ])('refuses %s, with no CORS header', async origin => {
    for (const method of ['OPTIONS', 'GET']) {
      const r = await send(e, req(method, { origin, url: `${URL_SYNC}?id=${'a'.repeat(32)}` }));
      expectError(r, 403, 'origin_not_allowed');
      expect(r.headers.get('Access-Control-Allow-Origin')).toBeNull();
    }
    const who = newLearner();
    const r = await send(e, req('POST', { origin, body: { id: who.id, key: who.key, baseRev: 0, data: smallData() } }));
    expectError(r, 403, 'origin_not_allowed');
    expect(await env.PROGRESS.get(`p:${who.id}`)).toBeNull();
  });
  it('refuses sync with no Origin, but health still answers', async () => {
    const who = newLearner();
    expectError(await send(e, req('POST', { origin: null, body: { id: who.id, key: who.key, baseRev: 0, data: smallData() } })), 403, 'origin_not_allowed');
    const h = await send(e, req('GET', { origin: null, url: 'https://sync.example/v1/health' }));
    expect(h.status).toBe(200);
    expect(h.body).toEqual({ ok: true });
  });
  it('never sends a wildcard, even if someone configures one', async () => {
    const wild = testEnv({ ALLOWED_ORIGINS: '*' });
    const r = await send(wild, req('OPTIONS', {}));
    expectError(r, 403, 'origin_not_allowed');
    const ok = await send(e, req('GET', { url: 'https://sync.example/v1/health' }));
    expect(ok.headers.get('Access-Control-Allow-Origin')).toBe(ORIGIN);
    expect(ok.headers.get('Access-Control-Allow-Origin')).not.toBe('*');
  });
  it('reads allowed origins from the env var', async () => {
    const custom = testEnv({ ALLOWED_ORIGINS: 'https://other.example, https://two.example' });
    expect((await send(custom, req('OPTIONS', { origin: 'https://two.example' }))).status).toBe(204);
    expect((await send(custom, req('OPTIONS', { origin: ORIGIN }))).status).toBe(403);
  });
  it('puts the CORS header on errors too, so the browser can read them', async () => {
    const r = await post(e, { id: 'bad', key: 'bad' }, 0, {});
    expect(r.status).toBe(400);
    expect(r.headers.get('Access-Control-Allow-Origin')).toBe(ORIGIN);
    expect(r.headers.get('Access-Control-Expose-Headers')).toBe('Retry-After');
  });
});

describe('abuse limits', () => {
  const limiter = max => {
    const seen = new Map();
    return { keys: seen, async limit({ key }) { seen.set(key, (seen.get(key) || 0) + 1); return { success: seen.get(key) <= max }; } };
  };
  it('limits per IP, and the IP is hashed before it reaches the limiter', async () => {
    const RATE_IP = limiter(2);
    const e = testEnv({ RATE_IP });
    const url = `${URL_SYNC}?id=${'a'.repeat(32)}`;
    const headers = { Authorization: `Bearer ${'b'.repeat(32)}` };
    expectError(await send(e, req('GET', { url, headers, ip: '198.51.100.7' })), 404, 'not_found');
    expectError(await send(e, req('GET', { url, headers, ip: '198.51.100.7' })), 404, 'not_found');
    const blocked = await send(e, req('GET', { url, headers, ip: '198.51.100.7' }));
    expectError(blocked, 429, 'rate_limited');
    expect(blocked.headers.get('Retry-After')).toBe('60');
    expectError(await send(e, req('GET', { url, headers, ip: '198.51.100.8' })), 404, 'not_found');
    expect([...RATE_IP.keys.keys()].join()).not.toContain('198.51');
  });
  it('limits per id, whichever IP it comes from', async () => {
    const e = testEnv({ RATE_ID: limiter(1) });
    const who = newLearner();
    expect((await post(e, who, 0, smallData())).status).toBe(200);
    expectError(await send(e, req('POST', { ip: '198.51.100.20', body: { id: who.id, key: who.key, baseRev: 1, data: smallData() } })), 429, 'rate_limited');
    expect((await post(e, newLearner(), 0, smallData())).status).toBe(200);
  });
  it('limits new ids per IP', async () => {
    const e = testEnv({ RATE_CLAIM: limiter(1) });
    const a = newLearner(), b = newLearner();
    expect((await post(e, a, 0, smallData())).status).toBe(200);
    expectError(await post(e, b, 0, smallData()), 429, 'rate_limited');
    expect((await post(e, a, 1, smallData())).status).toBe(200); // Saving an old id is not a new one.
  });
  it('uses the real Rate Limiting binding from wrangler.toml', async () => {
    const e = testEnv({ RATE_IP: env.RATE_IP });
    expect(typeof env.RATE_IP.limit).toBe('function');
    const url = `${URL_SYNC}?id=${'a'.repeat(32)}`;
    const headers = { Authorization: `Bearer ${'b'.repeat(32)}` };
    const ip = `192.0.2.${Math.floor(Math.random() * 250)}`;
    const codes = [];
    for (let i = 0; i < 125; i++) codes.push((await send(e, req('GET', { url, headers, ip }))).status);
    expect(codes[0]).toBe(404);
    expect(codes.at(-1)).toBe(429);
  });
  it('still works if the limiter itself fails', async () => {
    const e = testEnv({ RATE_IP: { limit: () => { throw new Error('down'); } } });
    expect((await post(e, newLearner(), 0, smallData())).status).toBe(200);
  });
  it('enforces the minimum time between saves, without using a KV write', async () => {
    const e = testEnv({ MIN_SYNC_SECONDS: '60' });
    const who = newLearner();
    let now = Date.parse('2026-11-05T10:00:00Z');
    const deps = { now: () => now };
    expect((await post(e, who, 0, smallData(), deps)).status).toBe(200);
    now += 10000;
    const soon = await post(e, who, 1, smallData(), deps);
    expectError(soon, 429, 'too_soon');
    expect(soon.headers.get('Retry-After')).toBe('50');
    expect((await env.PROGRESS.get(`p:${who.id}`, 'json')).rev).toBe(1);
    // A conflict is still answered at once, so the client can get the data and merge.
    expect((await post(e, who, 0, smallData(), deps)).status).toBe(409);
    now += 50000;
    expect((await post(e, who, 1, smallData(), deps)).status).toBe(200);
  });
  it('caps new ids per day, but learners already here carry on', async () => {
    const e = testEnv({ MAX_NEW_IDS_PER_DAY: '2' });
    const a = newLearner();
    let now = Date.parse('2026-11-05T23:00:00Z');
    const deps = { now: () => now };
    expect((await post(e, a, 0, smallData(), deps)).status).toBe(200);
    expect((await post(e, newLearner(), 0, smallData(), deps)).status).toBe(200);
    const late = newLearner();
    const blocked = await post(e, late, 0, smallData(), deps);
    expectError(blocked, 429, 'daily_limit');
    expect(blocked.headers.get('Retry-After')).toBe('3600');
    expect(await env.PROGRESS.get(`p:${late.id}`)).toBeNull();
    expect((await post(e, a, 1, smallData(), deps)).status).toBe(200);
    now += 2 * 3600 * 1000;
    expect((await post(e, late, 0, smallData(), deps)).status).toBe(200);
  });
  it('gives a clean 503 when KV refuses a write, such as the free daily limit', async () => {
    const full = {
      get: (...a) => env.PROGRESS.get(...a),
      put: async () => { throw new Error(`KV PUT failed: 429 for ${'p:secret-id'}`); },
      delete: (...a) => env.PROGRESS.delete(...a),
    };
    const e = testEnv({ PROGRESS: full });
    const r = await post(e, newLearner(), 0, smallData());
    expectError(r, 503, 'store_unavailable');
    expect(JSON.stringify(r.body)).not.toContain('secret-id');
    expect(r.headers.get('Retry-After')).toBe('300');
  });
  it('recovers if the marker write fails: error, 409, merge, saved, marker there', async () => {
    let failMarker = true;
    const flaky = {
      get: (...a) => env.PROGRESS.get(...a),
      delete: (...a) => env.PROGRESS.delete(...a),
      put: async (k, ...rest) => {
        if (k.startsWith('dirty:') && failMarker) { failMarker = false; throw new Error('blip'); }
        return env.PROGRESS.put(k, ...rest);
      },
    };
    const e = testEnv({ PROGRESS: flaky });
    const who = newLearner();
    expect((await post(e, who, 0, smallData())).status).toBe(503);
    const conflict = await post(e, who, 0, smallData());
    expect(conflict.status).toBe(409);
    const retry = await post(e, who, conflict.body.rev, smallData());
    expect(retry.status).toBe(200);
    expect(await keysWith(`dirty:${who.id}`)).toEqual([`dirty:${who.id}:2`]);
  });
});

describe('errors and logs', () => {
  const e = testEnv();
  it('every error has the same shape', async () => {
    const who = newLearner();
    const cases = [
      await send(e, req('GET', { url: 'https://sync.example/nope' })),
      await send(e, req('PUT', { url: URL_SYNC })),
      await send(e, req('POST', { url: 'https://sync.example/v1/health' })),
      await post(e, who, 0, { v: 1, name: 'Asha' }),
      await getSync(e, who),
    ];
    for (const r of cases) {
      expect(Object.keys(r.body)).toEqual(['error']);
      expect(Object.keys(r.body.error).filter(k => !['code', 'message', 'field'].includes(k))).toEqual([]);
      expect(r.headers.get('Content-Type')).toContain('application/json');
      expect(r.headers.get('Cache-Control')).toBe('no-store');
    }
    expect(cases.map(c => c.status)).toEqual([404, 405, 405, 400, 404]);
  });
  it('logs nothing at all on the request path', async () => {
    const spies = ['log', 'info', 'warn', 'error', 'debug'].map(m => vi.spyOn(console, m));
    const who = newLearner();
    await post(e, who, 0, smallData());
    await post(e, who, 0, smallData());
    await post(e, { id: who.id, key: newLearner().key }, 1, smallData());
    await post(e, who, 1, { v: 1, name: 'Asha' });
    await getSync(e, who);
    await del(e, who);
    await post(testEnv({ PROGRESS: { get: async () => { throw new Error(who.id); } } }), who, 1, smallData());
    for (const s of spies) {
      expect(s).not.toHaveBeenCalled();
      s.mockRestore();
    }
  });
  it('health and preflight work through the deployed entry point', async () => {
    const res = await workerExports.default.fetch(new Request('https://sync.example/v1/health'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});

describe('DELETE', () => {
  const e = testEnv();
  it('erases the data at once and leaves only a tombstone with no data in it', async () => {
    const who = newLearner();
    await post(e, who, 0, smallData());
    const r = await del(e, who);
    expect(r.status).toBe(200);
    expect(r.body).toEqual({ deleted: true });
    expect(await env.PROGRESS.get(`p:${who.id}`)).toBeNull();
    const tomb = await env.PROGRESS.get(`gone:${who.id}`, 'json');
    expect(Object.keys(tomb)).toEqual(['deletedAt']);
    expect(await keysWith(`dirty:${who.id}`)).toContain(`dirty:${who.id}:del`);
  });
  it('cannot be re-created, read or written afterwards', async () => {
    const who = newLearner();
    await post(e, who, 0, smallData());
    await del(e, who);
    for (const baseRev of [0, 1, 2]) {
      expectError(await post(e, who, baseRev, smallData()), 410, 'deleted');
    }
    expectError(await getSync(e, who), 410, 'deleted');
    expect(await env.PROGRESS.get(`p:${who.id}`)).toBeNull();
    expect((await keysWith(`dirty:${who.id}`)).filter(k => !k.endsWith(':1') && !k.endsWith(':del'))).toEqual([]);
  });
  it('asking twice is fine, an unknown id is 404, and id and key are needed', async () => {
    const who = newLearner();
    expectError(await del(e, who), 404, 'not_found');
    await post(e, who, 0, smallData());
    expect((await del(e, who)).status).toBe(200);
    expect((await del(e, who)).status).toBe(200);
    expectError(await send(e, req('DELETE', { body: { id: who.id } })), 400, 'bad_request');
    expectError(await send(e, req('DELETE', { body: { key: who.key } })), 400, 'bad_request');
    expectError(await send(e, req('DELETE', {})), 415, 'unsupported_type');
  });
});
