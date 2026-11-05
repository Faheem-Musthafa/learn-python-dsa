/* The HTTP side of sync. handleRequest takes everything it needs as arguments, so tests can run it
 * against real or fake bindings. Nothing here logs an IP, an id, a key or any learner data.
 */
import { ID_PATTERN, KEY_PATTERN, LIMITS, validateData } from './schema.js';
import { constantTimeEqual, intVar, sha256Hex } from './util.js';

const API_ALLOW_HEADERS = 'Authorization, Content-Type, Content-Encoding';
const API_ALLOW_METHODS = 'GET, POST, DELETE, OPTIONS';
// A shorter cache keeps a read from being as stale. This is the smallest value KV accepts.
const READ_FRESH = { type: 'json', cacheTtl: 30 };
// A tombstone only has to exist. Read as text so the owner can write one by hand with any value.
const READ_TOMBSTONE = { cacheTtl: 30 };

export const KEYS = {
  record: id => `p:${id}`,
  gone: id => `gone:${id}`,
  dirty: (id, rev) => `dirty:${id}:${rev}`,
  newIds: day => `count:new-ids:${day}`,
};
export const DELETE_MARK = 'del';

const ERRORS = {
  bad_request: [400, 'The request is not valid.'],
  bad_json: [400, 'The body is not valid JSON.'],
  bad_data: [400, 'The data has something that is not allowed.'],
  unauthorized: [401, 'A key is needed in the Authorization header.'],
  forbidden: [403, 'That key does not match this id.'],
  origin_not_allowed: [403, 'This site is not allowed to use sync.'],
  not_found: [404, 'Nothing is stored for this id.'],
  no_route: [404, 'There is nothing here.'],
  method_not_allowed: [405, 'That method is not allowed here.'],
  deleted: [410, 'This id was deleted and cannot be used again. Make a new id.'],
  too_large: [413, 'The body is too large.'],
  unsupported_type: [415, 'Send JSON, with Content-Type application/json.'],
  rate_limited: [429, 'Too many requests. Please wait.'],
  too_soon: [429, 'Saved a moment ago. Wait a little before saving again.'],
  daily_limit: [429, 'Sync has taken all the new learners it can today. Try again tomorrow.'],
  internal: [500, 'Something went wrong.'],
  store_unavailable: [503, 'Saving is not available right now. Try again later.'],
};

export function readConfig(env) {
  return {
    origins: String(env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(s => s && s !== '*'),
    wireBytes: intVar(env.MAX_BODY_BYTES, LIMITS.wireBytes, 1),
    jsonBytes: intVar(env.MAX_JSON_BYTES, LIMITS.jsonBytes, 1),
    minSyncSeconds: intVar(env.MIN_SYNC_SECONDS, 60),
    maxNewIdsPerDay: intVar(env.MAX_NEW_IDS_PER_DAY, 200),
  };
}

// ------------------------------------------------------------------- responses
function corsHeaders(origin) {
  if (!origin) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Expose-Headers': 'Retry-After',
    Vary: 'Origin',
  };
}
function json(status, body, origin, extra) {
  return new Response(JSON.stringify(body), {
    status,
    headers: Object.assign({
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    }, corsHeaders(origin), extra),
  });
}
/* Every error has this one shape: {error: {code, message}}. */
function fail(code, origin, extra, field) {
  const [status, message] = ERRORS[code];
  const error = { code, message };
  if (field) error.field = field;
  return json(status, { error }, origin, extra);
}

// ------------------------------------------------------------------------ body
class BodyError extends Error {
  constructor(code) { super(code); this.code = code; }
}
async function readCapped(stream, limit) {
  const reader = stream.getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) {
      await reader.cancel().catch(() => {});
      throw new BodyError('too_large');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let at = 0;
  for (const c of chunks) { bytes.set(c, at); at += c.byteLength; }
  return bytes;
}
/* Enforces the size limit before anything is parsed, and again while unpacking. */
async function readJson(request, config) {
  const type = (request.headers.get('Content-Type') || '').split(';')[0].trim().toLowerCase();
  if (type !== 'application/json') throw new BodyError('unsupported_type');
  const declared = Number(request.headers.get('Content-Length'));
  if (Number.isFinite(declared) && declared > config.wireBytes) throw new BodyError('too_large');
  const encoding = (request.headers.get('Content-Encoding') || 'identity').trim().toLowerCase();
  if (encoding !== 'identity' && encoding !== 'gzip') throw new BodyError('unsupported_type');
  if (!request.body) throw new BodyError('bad_json');
  let bytes = await readCapped(request.body, config.wireBytes);
  // Some hosts unpack a request before the Worker sees it, so look at the bytes, not just the header.
  if (encoding === 'gzip' && bytes[0] === 0x1f && bytes[1] === 0x8b) {
    const inflated = new Response(bytes).body.pipeThrough(new DecompressionStream('gzip'));
    try {
      bytes = await readCapped(inflated, config.jsonBytes);
    } catch (e) {
      if (e instanceof BodyError) throw e;
      throw new BodyError('bad_json');
    }
  }
  try {
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch (e) {
    throw new BodyError('bad_json');
  }
}

// ---------------------------------------------------------------------- limits
async function allowed(binding, key) {
  if (!binding) return true;
  try {
    const { success } = await binding.limit({ key });
    return success !== false;
  } catch (e) {
    return true; // The per-id and daily limits below still hold if this binding has a bad moment.
  }
}
const clientKey = async request => (await sha256Hex(`ip:${request.headers.get('CF-Connecting-IP') || 'unknown'}`)).slice(0, 32);
const isKey = k => typeof k === 'string' && KEY_PATTERN.test(k);
const isId = i => typeof i === 'string' && ID_PATTERN.test(i);
const secondsToNextUtcDay = nowMs => Math.max(1, 86400 - Math.floor(nowMs / 1000) % 86400);

async function keyMatches(key, record, compare) {
  return compare(await sha256Hex(key), String(record.hash));
}

// ---------------------------------------------------------------------- routes
async function postSync(request, env, config, origin, deps) {
  const body = await readJson(request, config);
  if (!body || typeof body !== 'object' || Array.isArray(body)) return fail('bad_request', origin);
  for (const k of Object.keys(body)) {
    if (!['id', 'key', 'baseRev', 'data'].includes(k)) return fail('bad_request', origin, null, 'body');
  }
  const { id, key, baseRev, data } = body;
  if (!isId(id)) return fail('bad_request', origin, null, 'id');
  if (!isKey(key)) return fail('bad_request', origin, null, 'key');
  if (!Number.isSafeInteger(baseRev) || baseRev < 0) return fail('bad_request', origin, null, 'baseRev');
  if (!await allowed(env.RATE_ID, `id:${id}`)) return fail('rate_limited', origin, { 'Retry-After': '60' });

  const verdict = validateData(data);
  if (!verdict.ok) return fail('bad_data', origin, null, verdict.path);

  const kv = env.PROGRESS;
  const [gone, stored] = await Promise.all([kv.get(KEYS.gone(id), READ_TOMBSTONE), kv.get(KEYS.record(id), READ_FRESH)]);
  if (gone) return fail('deleted', origin);

  const now = deps.now();
  let hash;
  if (stored) {
    if (!await keyMatches(key, stored, deps.compare)) return fail('forbidden', origin);
    if (baseRev !== stored.rev) return json(409, { rev: stored.rev, data: stored.data }, origin);
    const waited = now - Date.parse(stored.updatedAt);
    if (waited < config.minSyncSeconds * 1000) {
      const left = Math.ceil((config.minSyncSeconds * 1000 - waited) / 1000);
      return fail('too_soon', origin, { 'Retry-After': String(left) });
    }
    hash = stored.hash;
  } else {
    if (baseRev !== 0) return json(409, { rev: 0, data: null }, origin);
    if (!await allowed(env.RATE_CLAIM, await clientKey(request))) return fail('rate_limited', origin, { 'Retry-After': '60' });
    const day = new Date(now).toISOString().slice(0, 10);
    const counted = Number(await kv.get(KEYS.newIds(day))) || 0;
    if (counted >= config.maxNewIdsPerDay) return fail('daily_limit', origin, { 'Retry-After': String(secondsToNextUtcDay(now)) });
    hash = await sha256Hex(key);
    await kv.put(KEYS.newIds(day), String(counted + 1), { expirationTtl: 172800 });
  }

  const rev = (stored ? stored.rev : 0) + 1;
  const text = JSON.stringify({ hash, rev, data, updatedAt: new Date(now).toISOString() });
  // Record first, then marker. If the marker fails the learner gets an error and retries,
  // sees a 409, merges, and saves again, which writes a new marker.
  await kv.put(KEYS.record(id), text);
  await kv.put(KEYS.dirty(id, rev), '1', { metadata: { at: now, size: text.length } });
  return json(200, { rev }, origin);
}

async function getSync(request, env, url, origin, deps) {
  const id = url.searchParams.get('id');
  if (!isId(id)) return fail('bad_request', origin, null, 'id');
  const m = /^Bearer ([^\s]+)$/.exec(request.headers.get('Authorization') || '');
  if (!m || !isKey(m[1])) return fail('unauthorized', origin);
  if (!await allowed(env.RATE_ID, `id:${id}`)) return fail('rate_limited', origin, { 'Retry-After': '60' });

  const kv = env.PROGRESS;
  const [gone, stored] = await Promise.all([kv.get(KEYS.gone(id), READ_TOMBSTONE), kv.get(KEYS.record(id), READ_FRESH)]);
  if (gone) return fail('deleted', origin);
  if (!stored) return fail('not_found', origin);
  if (!await keyMatches(m[1], stored, deps.compare)) return fail('forbidden', origin);
  return json(200, { rev: stored.rev, data: stored.data }, origin);
}

async function deleteSync(request, env, config, origin, deps) {
  const body = await readJson(request, config);
  if (!body || typeof body !== 'object' || Array.isArray(body)) return fail('bad_request', origin);
  const { id, key } = body;
  if (!isId(id)) return fail('bad_request', origin, null, 'id');
  if (!isKey(key)) return fail('bad_request', origin, null, 'key');
  if (!await allowed(env.RATE_ID, `id:${id}`)) return fail('rate_limited', origin, { 'Retry-After': '60' });

  const kv = env.PROGRESS;
  const [gone, stored] = await Promise.all([kv.get(KEYS.gone(id), READ_TOMBSTONE), kv.get(KEYS.record(id), READ_FRESH)]);
  if (gone) return json(200, { deleted: true }, origin); // Asking twice is fine.
  if (!stored) return fail('not_found', origin);
  if (!await keyMatches(key, stored, deps.compare)) return fail('forbidden', origin);

  // In this order, so a failure part way can always finish. The marker tells the batch to act. The
  // tombstone stops this id coming back. The batch also erases p:<id> if the last step is missed.
  const now = deps.now();
  await kv.put(KEYS.dirty(id, DELETE_MARK), '1', { metadata: { at: now, size: 0 } });
  await kv.put(KEYS.gone(id), JSON.stringify({ deletedAt: new Date(now).toISOString() }));
  await kv.delete(KEYS.record(id));
  return json(200, { deleted: true }, origin);
}

// ---------------------------------------------------------------------- router
const defaultDeps = { now: () => Date.now(), compare: constantTimeEqual };

export async function handleRequest(request, env, deps) {
  const d = Object.assign({}, defaultDeps, deps);
  const url = new URL(request.url);
  const config = readConfig(env);
  const originHeader = request.headers.get('Origin');
  const origin = originHeader && config.origins.includes(originHeader) ? originHeader : null;

  if (originHeader && !origin) return fail('origin_not_allowed', null);

  if (request.method === 'OPTIONS') {
    if (!origin) return fail('origin_not_allowed', null);
    return new Response(null, {
      status: 204,
      headers: Object.assign({
        'Access-Control-Allow-Methods': API_ALLOW_METHODS,
        'Access-Control-Allow-Headers': API_ALLOW_HEADERS,
        'Access-Control-Max-Age': '86400',
        'Cache-Control': 'no-store',
      }, corsHeaders(origin)),
    });
  }

  try {
    if (url.pathname === '/v1/health') {
      if (request.method !== 'GET') return fail('method_not_allowed', origin, { Allow: 'GET, OPTIONS' });
      return json(200, { ok: true }, origin);
    }
    if (url.pathname !== '/v1/sync') return fail('no_route', origin);
    if (!['GET', 'POST', 'DELETE'].includes(request.method)) return fail('method_not_allowed', origin, { Allow: API_ALLOW_METHODS });
    // A browser always sends Origin across sites. This is not security against a script, but it
    // does turn away casual traffic before it costs anything.
    if (!origin) return fail('origin_not_allowed', null);
    if (!await allowed(env.RATE_IP, await clientKey(request))) return fail('rate_limited', origin, { 'Retry-After': '60' });

    if (request.method === 'POST') return await postSync(request, env, config, origin, d);
    if (request.method === 'GET') return await getSync(request, env, url, origin, d);
    return await deleteSync(request, env, config, origin, d);
  } catch (e) {
    if (e instanceof BodyError) return fail(e.code, origin);
    // A KV failure (for example the daily write limit). No detail: it could carry an id.
    return fail('store_unavailable', origin, { 'Retry-After': '300' });
  }
}
