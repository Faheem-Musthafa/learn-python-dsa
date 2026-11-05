import { env } from 'cloudflare:workers';
import { handleRequest } from '../../src/api.js';

export const ORIGIN = 'https://faheem-musthafa.github.io';
export const URL_SYNC = 'https://sync.example/v1/sync';

let counter = 0;
const hex = n => n.toString(16).padStart(8, '0');
/* A fresh id and key. Random-looking and unique across a test file. */
export function newLearner() {
  counter += 1;
  const a = crypto.getRandomValues(new Uint32Array(3));
  return { id: `${hex(a[0])}${hex(counter)}${hex(a[1])}${hex(a[2])}`, key: `${hex(a[2])}${hex(a[1])}${hex(a[0])}${hex(counter)}` };
}
export const smallData = (over = {}) => ({
  v: 1,
  lessons: { '1-1-what-is-code': { status: 'done', openedAt: '2026-11-01', doneAt: '2026-11-02', last: '2026-11-02' } },
  answers: { '1-1-what-is-code/robot-steps': { tries: 2, ok: 1, hints: 0, saw: false, box: 1, due: '2026-11-03', okDays: ['2026-11-02'], last: '2026-11-02' } },
  days: { '2026-11-02': { mins: 12, acts: 4, lessons: 1, qs: 3 } },
  goals: { weekDays: 3 },
  prefs: { theme: 'system', size: '100', spacing: 'normal', motion: 'auto', hideHints: false, vizSpeed: 1, vizCodeOpen: false },
  ...over,
});

/* The real KV from Miniflare, with the default limits off so each test can set its own. */
export const testEnv = (over = {}) => ({
  ...env,
  MIN_SYNC_SECONDS: '0',
  RATE_IP: undefined,
  RATE_ID: undefined,
  RATE_CLAIM: undefined,
  ...over,
});

export function req(method, { url = URL_SYNC, origin = ORIGIN, body, headers = {}, raw, ip = '203.0.113.9' } = {}) {
  const h = new Headers(headers);
  if (origin) h.set('Origin', origin);
  if (ip) h.set('CF-Connecting-IP', ip);
  const init = { method, headers: h };
  if (raw !== undefined) init.body = raw;
  else if (body !== undefined) {
    init.body = JSON.stringify(body);
    if (!h.has('Content-Type')) h.set('Content-Type', 'application/json');
  }
  return new Request(url, init);
}
export async function send(e, request, deps) {
  const res = await handleRequest(request, e, deps);
  const text = await res.text();
  return { status: res.status, headers: res.headers, body: text ? JSON.parse(text) : null };
}
export const post = (e, who, baseRev, data, deps) => send(e, req('POST', { body: { id: who.id, key: who.key, baseRev, data } }), deps);
export const getSync = (e, who, key = who.key, deps) => send(e, req('GET', { url: `${URL_SYNC}?id=${who.id}`, headers: { Authorization: `Bearer ${key}` } }), deps);
export const del = (e, who, key = who.key, deps) => send(e, req('DELETE', { body: { id: who.id, key } }), deps);

export async function clearKv() {
  let cursor;
  do {
    const page = await env.PROGRESS.list({ cursor });
    await Promise.all(page.keys.map(k => env.PROGRESS.delete(k.name)));
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
}
export async function keysWith(prefix) {
  return (await env.PROGRESS.list({ prefix })).keys.map(k => k.name).sort();
}
export async function gzip(text) {
  const stream = new Response(text).body.pipeThrough(new CompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
