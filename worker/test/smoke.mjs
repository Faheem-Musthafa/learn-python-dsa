/* Checks a running Worker over real HTTP: `npm run smoke -- <url>`.
 *
 * Run it against `npx wrangler dev`, or once against the real Worker just after deploying. It is the
 * only check of things tests cannot show, above all that a gzip body reaches the Worker unchanged.
 *
 * It makes two made-up learners and deletes them again, using about 12 KV writes. Each leaves a small
 * tombstone in KV. It needs no token, and sends no real data.
 */
import { packForSync } from '../src/schema.js';

const base = (process.argv[2] || 'http://127.0.0.1:8787').replace(/\/$/, '');
const ORIGIN = 'https://faheem-musthafa.github.io';
const randomHex = () => [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2, '0')).join('');
const learner = () => ({ id: randomHex(), key: randomHex() });

let failed = 0;
const check = (name, ok, extra = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${extra ? ` (${extra})` : ''}`);
  if (!ok) failed += 1;
};
const call = (method, path, { body, headers = {}, origin = ORIGIN } = {}) => fetch(`${base}${path}`, {
  method,
  body,
  headers: { ...(origin ? { Origin: origin } : {}), ...headers },
});
const postJson = (method, value) => call(method, '/v1/sync', { body: JSON.stringify(value), headers: { 'Content-Type': 'application/json' } });
const read = who => call('GET', `/v1/sync?id=${who.id}`, { headers: { Authorization: `Bearer ${who.key}` } });

// A learner the size of a whole finished course: too big for 64 KB unless gzip arrives intact.
function bigData() {
  const answers = {};
  const lessons = {};
  for (let l = 0; l < 125; l++) {
    const lesson = `${l}-1-lesson-number-${l}`;
    lessons[lesson] = { status: 'done', openedAt: '2026-01-01', doneAt: '2026-01-02', last: '2026-01-02' };
    for (let q = 0; q < 11; q++) {
      answers[`${lesson}/question-${q}`] = { tries: 2, ok: 1, hints: 0, saw: false, box: 3, due: '2026-02-01', last: '2026-01-02', okDays: ['2026-01-02'] };
    }
  }
  return { v: 1, lessons, answers };
}

const small = { v: 1, days: { '2026-11-05': { mins: 3, acts: 1, lessons: 0, qs: 1 } } };

const health = await call('GET', '/v1/health');
check('health answers', health.status === 200 && (await health.json()).ok === true);
check('allowed origin gets its CORS header', health.headers.get('access-control-allow-origin') === ORIGIN);

const pre = await call('OPTIONS', '/v1/sync', { headers: { 'Access-Control-Request-Method': 'POST' } });
check('preflight answers', pre.status === 204);
const denied = await call('OPTIONS', '/v1/sync', { origin: 'https://evil.example' });
check('another origin is refused', denied.status === 403 && !denied.headers.get('access-control-allow-origin'));

const a = learner();
const first = await postJson('POST', { ...a, baseRev: 0, data: small });
check('first write claims the id', first.status === 200 && (await first.json()).rev === 1, `status ${first.status}`);
const conflict = await postJson('POST', { ...a, baseRev: 0, data: small });
check('stale baseRev gets 409', conflict.status === 409, `status ${conflict.status}`);
const wrong = await read({ id: a.id, key: randomHex() });
check('a wrong key is refused', wrong.status === 403, `status ${wrong.status}`);
const rejected = await postJson('POST', { ...learner(), baseRev: 0, data: { v: 1, name: 'Not allowed' } });
check('a nickname is refused', rejected.status === 400, `status ${rejected.status}`);

const b = learner();
const big = bigData();
const pack = await packForSync({ ...b, baseRev: 0, data: big });
check('the large learner is gzipped under 64 KB', pack && pack.headers['Content-Encoding'] === 'gzip', pack ? `${pack.body.byteLength} bytes` : 'too big');
const zipped = await call('POST', '/v1/sync', { body: pack.body, headers: pack.headers });
check('GZIP BODY ACCEPTED', zipped.status === 200, `status ${zipped.status}`);
const back = await read(b);
const stored = back.status === 200 ? await back.json() : {};
check('and it reads back the same', stored.rev === 1 && JSON.stringify(stored.data?.answers) === JSON.stringify(big.answers), `status ${back.status}`);

for (const who of [a, b]) {
  const gone = await postJson('DELETE', who);
  check('delete works', gone.status === 200, `status ${gone.status}`);
  const after = await postJson('POST', { ...who, baseRev: 0, data: small });
  // KV may take a minute to show this in other locations, which is a known window. See docs/SYNC.md.
  check('a deleted id cannot be used again', after.status === 410, `status ${after.status}`);
}

console.log(failed ? `\n${failed} check(s) failed` : '\nAll checks passed');
process.exit(failed ? 1 : 0);
