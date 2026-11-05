/* A small in-memory GitHub, with the same rules the real API documents. Trees and commits are
 * content-addressed, so writing the same files gives the same tree sha, as on real GitHub. Anything
 * this fake does not know answers 404, so an unexpected request fails the test. What it cannot show
 * is how the real GitHub behaves. See "What was not verified" in docs/SYNC.md.
 */
const sha1 = async text => {
  const d = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(text));
  return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join('');
};
const reply = (status, body, headers) => new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });

export function createFakeGitHub({ owner = 'Faheem-Musthafa', repo = 'learn-python-dsa-progress', branch = 'main', token = 'test-token-not-real' } = {}) {
  const blobs = new Map();     // sha -> text
  const trees = new Map();     // sha -> Map(flat path -> blob sha)
  const dirs = new Map();      // sha -> [{path, type, sha}], one folder level, for reading
  const commits = new Map();   // sha -> {tree, parents, message}
  const log = [];              // every request: {method, path}
  const faults = [];           // [{match, status, times, headers, network}]
  const hooks = new Map();     // route name -> fn, run once before that route answers
  let head = null, empty = false;

  async function saveTree(files) {
    const flat = [...files.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
    const sha = await sha1(`tree:${JSON.stringify(flat)}`);
    trees.set(sha, files);
    await registerDir(flat.map(([p, s]) => [p.split('/'), s]), sha);
    return sha;
  }
  /* Makes every folder level of a tree readable with GET /git/trees/<sha>. */
  async function registerDir(rows, knownSha) {
    const names = new Map();
    for (const [parts, blob] of rows) {
      if (parts.length === 1) names.set(parts[0], { path: parts[0], type: 'blob', sha: blob });
      else {
        if (!names.has(parts[0])) names.set(parts[0], { path: parts[0], type: 'tree', rows: [] });
        names.get(parts[0]).rows.push([parts.slice(1), blob]);
      }
    }
    const entries = [];
    for (const n of names.values()) {
      if (n.type === 'tree') {
        const sub = await sha1(`dir:${JSON.stringify(n.rows)}`);
        await registerDir(n.rows, sub);
        entries.push({ path: n.path, type: 'tree', mode: '040000', sha: sub });
      } else entries.push({ path: n.path, type: 'blob', mode: '100644', sha: n.sha });
    }
    dirs.set(knownSha, entries);
  }
  const isAncestor = (a, b) => {
    const queue = [b];
    while (queue.length) {
      const c = queue.pop();
      if (c === a) return true;
      queue.push(...(commits.get(c)?.parents || []));
    }
    return false;
  };
  async function makeCommit(message, tree, parents) {
    const sha = await sha1(`commit:${message}:${tree}:${parents.join()}:${commits.size}`);
    commits.set(sha, { message, tree, parents });
    return sha;
  }

  async function route(method, path, body) {
    let m;
    if (method === 'GET' && path === `/git/ref/heads/${branch}`) {
      if (empty) return reply(409, { message: 'Git Repository is empty.' });
      return reply(200, { ref: `refs/heads/${branch}`, object: { sha: head, type: 'commit' } });
    }
    if (method === 'GET' && (m = /^\/git\/commits\/([0-9a-f]+)$/.exec(path))) {
      const c = commits.get(m[1]);
      return c ? reply(200, { sha: m[1], tree: { sha: c.tree }, parents: c.parents.map(sha => ({ sha })), message: c.message }) : reply(404, { message: 'Not Found' });
    }
    if (method === 'GET' && (m = /^\/git\/trees\/([0-9a-f]+)$/.exec(path))) {
      const entries = dirs.get(m[1]);
      return entries ? reply(200, { sha: m[1], tree: entries, truncated: false }) : reply(404, { message: 'Not Found' });
    }
    if (method === 'POST' && path === '/git/trees') {
      const base = trees.get(body.base_tree);
      if (!base) return reply(422, { message: 'base_tree not found' });
      if (!Array.isArray(body.tree) || !body.tree.length) return reply(422, { message: 'Invalid tree info' });
      const files = new Map(base);
      for (const e of body.tree) {
        if ('sha' in e && 'content' in e) return reply(422, { message: 'Use either sha or content' });
        if (e.sha === null) {
          // The documented rule: deleting a file that does not exist is an error.
          if (!files.has(e.path)) return reply(422, { message: 'GitRPC::BadObjectState' });
          files.delete(e.path);
        } else if (typeof e.content === 'string') {
          const sha = await sha1(`blob:${e.content}`);
          blobs.set(sha, e.content);
          files.set(e.path, sha);
        } else return reply(422, { message: 'Invalid tree entry' });
      }
      const sha = await saveTree(files);
      return reply(201, { sha, tree: [], truncated: false });
    }
    if (method === 'POST' && path === '/git/commits') {
      if (!trees.has(body.tree)) return reply(422, { message: 'Tree SHA does not exist' });
      if (!body.parents.every(p => commits.has(p))) return reply(422, { message: 'Parent SHA does not exist' });
      return reply(201, { sha: await makeCommit(body.message, body.tree, body.parents) });
    }
    if (method === 'PATCH' && path === `/git/refs/heads/${branch}`) {
      if (!commits.has(body.sha)) return reply(422, { message: 'Object does not exist' });
      if (!body.force && !isAncestor(head, body.sha)) return reply(422, { message: 'Update is not a fast forward' });
      head = body.sha;
      return reply(200, { object: { sha: head } });
    }
    return reply(404, { message: `Not Found: ${method} ${path}` });
  }

  const fake = {
    log,
    /* Used as the batch's fetchFn. Like the real thing, it refuses a request with no token or User-Agent. */
    async fetch(url, init = {}) {
      const u = new URL(url);
      const method = init.method || 'GET';
      const prefix = `/repos/${owner}/${repo}`;
      if (u.origin !== 'https://api.github.com' || !u.pathname.startsWith(prefix)) return reply(404, { message: 'Not Found' });
      const path = u.pathname.slice(prefix.length);
      log.push({ method, path, version: init.headers['X-GitHub-Api-Version'] });
      if (init.headers.Authorization !== `Bearer ${token}`) return reply(401, { message: 'Bad credentials' });
      if (!init.headers['User-Agent']) return reply(403, { message: 'User-Agent required' });
      const name = `${method} ${path.replace(/[0-9a-f]{40}/, ':sha')}`;
      if (hooks.has(name)) {
        const fn = hooks.get(name);
        hooks.delete(name);
        await fn();
      }
      const fault = faults.find(f => f.times > 0 && name.startsWith(f.match));
      if (fault) {
        fault.times -= 1;
        if (fault.network) throw new TypeError('Network connection lost');
        return reply(fault.status, { message: 'injected' }, fault.headers);
      }
      return route(method, path, init.body ? JSON.parse(init.body) : undefined);
    },
    fail(match, status, times = 1, headers) { faults.push({ match, status, times, headers }); },
    failNetwork(match, times = 1) { faults.push({ match, times, network: true }); },
    clearFaults() { faults.length = 0; },
    before(name, fn) { hooks.set(name, fn); },
    /* The repo as it stands: path -> text. */
    files() {
      const out = {};
      const tree = trees.get(commits.get(head).tree);
      for (const [p, s] of tree) out[p] = blobs.get(s);
      return out;
    },
    commitCount: () => { let n = 0; for (let c = head; c; c = commits.get(c).parents[0]) n += 1; return n; },
    messages: () => { const out = []; for (let c = head; c; c = commits.get(c).parents[0]) out.push(commits.get(c).message); return out; },
    get head() { return head; },
    makeEmpty() { empty = true; },
    /* What the owner pushing to the repo looks like: the branch moves. */
    async pushFromElsewhere(path, text) {
      const sha = await sha1(`blob:${text}`);
      blobs.set(sha, text);
      const files = new Map(trees.get(commits.get(head).tree));
      files.set(path, sha);
      const tree = await saveTree(files);
      head = await makeCommit('Owner pushed', tree, [head]);
    },
    async init() {
      const readme = await sha1('blob:# Progress\n');
      blobs.set(readme, '# Progress\n');
      const tree = await saveTree(new Map([['README.md', readme]]));
      head = await makeCommit('Initial commit', tree, []);
      return fake;
    },
  };
  return fake;
}
