/* The hourly batch: takes everything that changed and writes it to GitHub as one commit.
 *
 * The rule that keeps data safe: a marker is cleared only after the commit is on the branch, and
 * only the exact marker keys this run saw. A learner who syncs during a run writes a marker with a
 * new key, which this run never touches, so KV's stale reads cannot lose it.
 *
 * Why the file contents go inside the tree request, and not one blob request per file: the free
 * plan allows 50 outgoing requests per run, and GitHub allows 80 content-creating requests a
 * minute. A run here makes about 5 requests however many files it holds.
 */
import { KEYS, DELETE_MARK } from './api.js';
import { intVar, stableStringify } from './util.js';

const API = 'https://api.github.com';
const API_VERSION = '2026-03-10';

// A marker this new may be ahead of what KV shows here, so wait for the next run. KV says a change
// can take 60 seconds "or more" to show everywhere, so this leaves room.
const STALE_GRACE_MS = 5 * 60 * 1000;
const BULK_IDS = 50;           // KV reads 100 keys at a time, and each id needs two.
const BULK_BYTES = 16 * 1024 * 1024; // KV refuses a bulk read over 25 MB.
const LIST_PAGES = 10;
const NON_FF_TRIES = 3;
const MAX_ATTEMPTS = 4;
const MAX_WAIT_MS = 60000;

export function mirrorConfig(env) {
  return {
    owner: env.GITHUB_OWNER || 'Faheem-Musthafa',
    repo: env.GITHUB_REPO || 'learn-python-dsa-progress',
    branch: env.GITHUB_BRANCH || 'main',
    maxFiles: intVar(env.MIRROR_MAX_FILES, 300, 1),
    maxBytes: intVar(env.MIRROR_MAX_BYTES, 384 * 1024, 1),
    // One lookup each when something is deleted. Keeps a run inside the 50 request limit.
    maxPrefixes: intVar(env.MIRROR_MAX_PREFIXES, 20, 1),
    maxGithubCalls: intVar(env.MIRROR_MAX_GITHUB_CALLS, 45, 1),
    // KV allows 1,000 operations per run.
    maxKvOps: intVar(env.MIRROR_MAX_KV_OPS, 900, 1),
  };
}

export const pathFor = id => `progress/${id.slice(0, 2)}/${id}.json`;
/* The file in the repo. Sorted and stable, with no key hash, so the same data gives the same file. */
export const mirrorText = (id, record) => `${stableStringify({ id, rev: record.rev, updatedAt: record.updatedAt, data: record.data })}\n`;

// -------------------------------------------------------------------- GitHub
class GitHubError extends Error {
  constructor(stage, status) {
    super(`github ${stage} ${status}`);
    this.stage = stage;
    this.status = status;
  }
}

function isTransient(res) {
  if (res.status >= 500 || res.status === 429) return true;
  return res.status === 403 && (res.headers.get('retry-after') !== null || res.headers.get('x-ratelimit-remaining') === '0');
}
function waitFor(res, attempt) {
  const asked = res ? Number(res.headers.get('retry-after')) : NaN;
  if (Number.isFinite(asked) && asked > 0) return Math.min(asked * 1000, MAX_WAIT_MS);
  return Math.min(500 * 2 ** (attempt - 1), MAX_WAIT_MS);
}

function githubClient({ fetchFn, token, config, sleep }) {
  let calls = 0;
  const base = `${API}/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/git`;
  async function call(stage, method, path, body, okStatuses) {
    for (let attempt = 1; ; attempt++) {
      if (calls >= config.maxGithubCalls) throw new GitHubError(stage, 'request_budget');
      calls += 1;
      let res = null;
      try {
        res = await fetchFn(`${base}${path}`, {
          method,
          headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${token}`,
            'User-Agent': 'stepwise-sync-worker',
            'X-GitHub-Api-Version': API_VERSION,
            ...(body ? { 'Content-Type': 'application/json' } : {}),
          },
          body: body ? JSON.stringify(body) : undefined,
        });
      } catch (e) {
        res = null; // A network failure. Worth another go.
      }
      if (res && okStatuses.includes(res.status)) return res;
      if (res && !isTransient(res)) {
        await res.body?.cancel().catch(() => {});
        throw new GitHubError(stage, res.status);
      }
      if (attempt >= MAX_ATTEMPTS) throw new GitHubError(stage, res ? res.status : 'network');
      const wait = waitFor(res, attempt);
      await res?.body?.cancel().catch(() => {});
      await sleep(wait);
    }
  }
  const getJson = async (stage, path) => (await call(stage, 'GET', path, null, [200])).json();
  return {
    get calls() { return calls; },
    headSha: async () => (await getJson('ref', `/ref/heads/${config.branch}`)).object.sha,
    treeOf: async commit => (await getJson('commit', `/commits/${commit}`)).tree.sha,
    listTree: async sha => (await getJson('tree', `/trees/${sha}`)).tree,
    createTree: async (baseTree, tree) => (await (await call('create-tree', 'POST', '/trees', { base_tree: baseTree, tree }, [201])).json()).sha,
    createCommit: async (message, tree, parent) => (await (await call('create-commit', 'POST', '/commits', { message, tree, parents: [parent] }, [201])).json()).sha,
    /* Returns false if the branch moved under us, which only needs another go from the new head. */
    async updateRef(sha) {
      try {
        await call('update-ref', 'PATCH', `/refs/heads/${config.branch}`, { sha, force: false }, [200]);
        return true;
      } catch (e) {
        if (e instanceof GitHubError && (e.status === 422 || e.status === 409)) return false;
        throw e;
      }
    },
  };
}

/* GitHub fails the whole tree if it is asked to delete a file that is not there, and a learner can
   delete before their first batch. So look first. Lookups are shared per folder. */
async function existingPaths(gh, baseTree, paths) {
  const found = new Set();
  if (!paths.length) return found;
  const root = await gh.listTree(baseTree);
  const progress = root.find(e => e.path === 'progress' && e.type === 'tree');
  if (!progress) return found;
  const folders = new Map((await gh.listTree(progress.sha)).filter(e => e.type === 'tree').map(e => [e.path, e.sha]));
  const byFolder = new Map();
  for (const p of paths) {
    const [, folder, file] = p.split('/');
    if (!byFolder.has(folder)) byFolder.set(folder, []);
    byFolder.get(folder).push({ path: p, file });
  }
  for (const [folder, items] of byFolder) {
    if (!folders.has(folder)) continue;
    const names = new Set((await gh.listTree(folders.get(folder))).map(e => e.path));
    for (const it of items) if (names.has(it.file)) found.add(it.path);
  }
  return found;
}

async function commitChanges(gh, puts, deletePaths) {
  for (let attempt = 1; attempt <= NON_FF_TRIES; attempt++) {
    const head = await gh.headSha();
    const baseTree = await gh.treeOf(head);
    const present = await existingPaths(gh, baseTree, deletePaths);
    const removals = deletePaths.filter(p => present.has(p));
    const entries = [
      ...puts.map(f => ({ path: f.path, mode: '100644', type: 'blob', content: f.text })),
      ...removals.map(path => ({ path, mode: '100644', type: 'blob', sha: null })),
    ];
    if (!entries.length) return { commit: null, updated: 0, removed: 0 };
    const tree = await gh.createTree(baseTree, entries);
    // Same tree as before: an earlier run already wrote this, and only failed to clear its markers.
    if (tree === baseTree) return { commit: null, updated: 0, removed: 0 };
    // Counts only. A commit message must never carry an id or any learner data.
    const message = `Mirror progress: ${puts.length} updated, ${removals.length} removed`;
    const commit = await gh.createCommit(message, tree, head);
    if (await gh.updateRef(commit)) return { commit, updated: puts.length, removed: removals.length };
  }
  throw new GitHubError('update-ref', 'moved');
}

// ------------------------------------------------------------------------ KV
function kvBudget(max) {
  let used = 0;
  return {
    take(n = 1) {
      if (used + n > max) return false;
      used += n;
      return true;
    },
  };
}

async function listMarkers(kv, budget) {
  const byId = new Map();
  let cursor;
  for (let page = 0; page < LIST_PAGES; page++) {
    if (!budget.take()) break;
    const res = await kv.list({ prefix: 'dirty:', cursor });
    for (const { name, metadata } of res.keys) {
      const m = /^dirty:([0-9a-f]{32,64}):(\d+|del)$/.exec(name);
      if (!m) continue;
      const id = m[1];
      if (!byId.has(id)) byId.set(id, { id, keys: [], deleted: false, oldest: Infinity, maxRev: 0, size: 0 });
      const row = byId.get(id);
      const at = metadata && Number.isFinite(metadata.at) ? metadata.at : 0;
      const isDelete = m[2] === DELETE_MARK;
      const rev = isDelete ? null : Number(m[2]);
      row.keys.push({ name, rev, at });
      row.oldest = Math.min(row.oldest, at);
      if (isDelete) row.deleted = true;
      else if (rev >= row.maxRev) {
        row.maxRev = rev;
        row.size = metadata && Number.isFinite(metadata.size) ? metadata.size : 0;
      }
    }
    if (res.list_complete) break;
    cursor = res.cursor;
  }
  return [...byId.values()];
}

/* Deletions first, because they are a privacy promise, then whoever has waited longest. Oldest first
   also means a busy learner cannot keep pushing out somebody who sorts later in the alphabet. */
function choose(rows, config) {
  const order = [...rows].sort((a, b) => (b.deleted - a.deleted) || (a.oldest - b.oldest) || (a.id < b.id ? -1 : 1));
  const chosen = [];
  let bytes = 0, updates = 0;
  for (const row of order) {
    if (chosen.length >= config.maxFiles) break;
    if (!row.deleted) {
      // One update always gets through, or a learner bigger than the budget would wait for ever.
      if (updates && bytes + row.size > config.maxBytes) continue;
      bytes += row.size;
      updates += 1;
    }
    chosen.push(row);
  }
  return chosen;
}

function parseRecord(text) {
  if (text === null || text === undefined) return null;
  try {
    const record = JSON.parse(text);
    return record && Number.isInteger(record.rev) ? record : null;
  } catch (e) {
    return null;
  }
}

async function readRows(kv, rows, budget) {
  const out = new Map();
  let i = 0;
  while (i < rows.length) {
    const part = [];
    let size = 0;
    while (i < rows.length && part.length < BULK_IDS && (!part.length || size + rows[i].size <= BULK_BYTES)) {
      size += rows[i].size;
      part.push(rows[i]);
      i += 1;
    }
    if (!budget.take()) break;
    const keys = part.flatMap(r => [KEYS.gone(r.id), KEYS.record(r.id)]);
    // As text: the tombstone only has to exist, and one damaged value must not stop every run.
    const got = await kv.get(keys);
    for (const r of part) out.set(r.id, { gone: got.get(KEYS.gone(r.id)) !== null, record: parseRecord(got.get(KEYS.record(r.id))) });
  }
  return out;
}

/* Sorts each row into what this run will do with it. Nothing is written to GitHub yet. */
function plan(rows, loaded, now, config) {
  const puts = [], deletes = [], drops = [];
  let carried = 0;
  const folders = new Set();
  for (const row of rows) {
    const got = loaded.get(row.id);
    if (!got) { carried += 1; continue; }
    if (row.deleted || got.gone) {
      const folder = row.id.slice(0, 2);
      if (!folders.has(folder) && folders.size >= config.maxPrefixes) { carried += 1; continue; }
      folders.add(folder);
      deletes.push({ row, path: pathFor(row.id) });
      continue;
    }
    const young = k => now - k.at < STALE_GRACE_MS;
    if (!got.record) {
      // A marker with no data. Usually KV is behind, so wait. If it is old, there is nothing to mirror.
      if (row.keys.some(young)) carried += 1;
      else drops.push(row.keys);
      continue;
    }
    // KV here is behind what the marker says. Mirroring now would write older data, so wait.
    const rev = got.record.rev;
    if (row.keys.some(k => k.rev > rev && young(k))) { carried += 1; continue; }
    puts.push({ path: pathFor(row.id), text: mirrorText(row.id, got.record), keys: row.keys });
  }
  return { puts, deletes, drops, carried };
}

// ----------------------------------------------------------------------- batch
const quietSleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/* One run of the batch. Takes everything it needs as arguments so that tests can drive it.
   Always returns a report of counts, never of ids, and only throws if KV itself fails. */
export async function runMirror({ kv, fetchFn, token, config, now = Date.now, sleep = quietSleep }) {
  const budget = kvBudget(config.maxKvOps);
  const report = { status: 'idle', updated: 0, removed: 0, carried: 0, cleared: 0, clearFailed: 0, commit: null, githubCalls: 0 };

  const all = await listMarkers(kv, budget);
  if (!all.length) return report;
  if (!token) return { ...report, status: 'failed', stage: 'config', httpStatus: 'no_token', carried: all.length };

  const chosen = choose(all, config);
  report.carried = all.length - chosen.length;
  const time = now();
  const loaded = await readRows(kv, chosen, budget);
  const { puts, deletes: wanted, drops, carried } = plan(chosen, loaded, time, config);
  report.carried += carried;

  // Erase the store's copy now. Safe to repeat, and it must not wait on GitHub being up.
  const deletes = [];
  for (const d of wanted) {
    if (!budget.take(2)) { report.carried += 1; continue; }
    await kv.delete(KEYS.record(d.row.id));
    if (!loaded.get(d.row.id).gone) await kv.put(KEYS.gone(d.row.id), JSON.stringify({ deletedAt: new Date(time).toISOString() }));
    deletes.push(d);
  }

  const gh = githubClient({ fetchFn, token, config, sleep });
  let result = { commit: null, updated: 0, removed: 0 };
  if (puts.length || deletes.length) {
    try {
      result = await commitChanges(gh, puts, deletes.map(d => d.path));
    } catch (e) {
      if (!(e instanceof GitHubError)) throw e;
      // Nothing is cleared, so the next run tries all of this again.
      return { ...report, status: 'failed', stage: e.stage, httpStatus: e.status, carried: all.length, githubCalls: gh.calls };
    }
  }

  // The commit is on the branch, or there was nothing to change. Now it is safe to clear.
  const toClear = [...puts.map(p => p.keys), ...deletes.map(d => d.row.keys), ...drops].flat();
  for (const k of toClear) {
    if (!budget.take()) { report.clearFailed += 1; continue; }
    try {
      await kv.delete(k.name);
      report.cleared += 1;
    } catch (e) {
      report.clearFailed += 1; // The next run sees the same data, makes no new commit, and clears it.
    }
  }

  return {
    ...report,
    status: result.commit ? 'committed' : 'no_change',
    updated: result.updated,
    removed: result.removed,
    commit: result.commit,
    githubCalls: gh.calls,
  };
}
