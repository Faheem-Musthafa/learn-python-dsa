/* One worker thread that runs course code in the same Pyodide the browser uses.
 * Used by tools/check.mjs --pyodide. It loads the harness from assets/js/py.js,
 * so a program behaves here exactly as it does in a lesson.
 */
import { parentPort, workerData } from 'node:worker_threads';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const { root } = workerData;
const require = createRequire(import.meta.url);
vm.runInThisContext(fs.readFileSync(path.join(root, 'assets/js/py.js'), 'utf8'));

const { loadPyodide } = require(path.join(root, 'vendor/pyodide/pyodide.js'));
const py = await loadPyodide({ indexURL: path.join(root, 'vendor/pyodide') + path.sep });
const decoder = new TextDecoder();
let out = '', queue = [];
const write = { write(buf) { out += decoder.decode(buf); return buf.length; } };
py.setStdout(write);
py.setStderr(write);
py.setStdin({ stdin: () => (queue.length ? queue.shift() + '\n' : null) });
py.runPython(globalThis.Py.HARNESS);
const version = py.runPython('import sys; sys.version.split()[0]');
parentPort.postMessage({ kind: 'ready', version });

parentPort.on('message', job => {
  out = '';
  queue = (job.stdin || []).slice();
  let result;
  try {
    const run = py.globals.get('__run');
    result = JSON.parse(run(job.code, JSON.stringify(job.tests || []), false));
    run.destroy();
  } catch (e) {
    result = { crash: String(e), error: null, tests: [] };
  }
  parentPort.postMessage({ kind: 'done', id: job.id, result: { ...result, out } });
});
