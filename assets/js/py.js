/* Py: runs real Python in the browser, plus the code editor and colouring.
 *
 * Python runs inside a web worker. That means a loop that never ends cannot
 * freeze the page: we stop the worker and start a fresh one.
 * The worker is built from a Blob so this also works from a double-clicked file.
 */
(function (root) {
  'use strict';

  const VERSION = '0.29.5';
  const CDN = `https://cdn.jsdelivr.net/pyodide/v${VERSION}/full/`;
  const LOCAL = 'vendor/pyodide/';
  const DEFAULT_TIMEOUT = 6000;

  // ------------------------------------------------------------ colouring
  const KEYWORDS = new Set(['False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield']);
  const BUILTINS = new Set(['abs', 'all', 'any', 'bin', 'bool', 'chr', 'dict', 'divmod', 'enumerate', 'filter', 'float', 'hash', 'hex', 'id', 'input', 'int', 'isinstance', 'iter', 'len', 'list', 'map', 'max', 'min', 'next', 'object', 'open', 'ord', 'pow', 'print', 'range', 'repr', 'reversed', 'round', 'set', 'sorted', 'str', 'sum', 'super', 'tuple', 'type', 'zip']);
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const TOKEN = /(#[^\n]*)|("""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$)|[rbfRBF]{0,2}"(?:\\.|[^"\\\n])*"?|[rbfRBF]{0,2}'(?:\\.|[^'\\\n])*'?)|(\b\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)/g;

  function highlight(code) {
    let out = '', last = 0, m, prev = '';
    TOKEN.lastIndex = 0;
    while ((m = TOKEN.exec(code))) {
      out += esc(code.slice(last, m.index));
      last = m.index + m[0].length;
      if (m[1]) out += `<span class="t-com">${esc(m[1])}</span>`;
      else if (m[2]) out += `<span class="t-str">${esc(m[2])}</span>`;
      else if (m[3]) out += `<span class="t-num">${esc(m[3])}</span>`;
      else {
        const w = m[4];
        if (KEYWORDS.has(w)) out += `<span class="t-key">${w}</span>`;
        else if (prev === 'def' || prev === 'class') out += `<span class="t-fn">${w}</span>`;
        else if (BUILTINS.has(w) && code[last] === '(') out += `<span class="t-bi">${w}</span>`;
        else out += esc(w);
        prev = w;
        continue;
      }
      prev = '';
    }
    return out + esc(code.slice(last));
  }

  // ------------------------------------------------------------ the worker
  const HARNESS = `
import ast, builtins, io, json, sys, traceback

def __short(v, limit=200):
    try:
        t = repr(v)
    except Exception:
        t = '<cannot show this value>'
    return t if len(t) <= limit else t[:limit] + '...'

def __error(e, code):
    info = {'type': type(e).__name__, 'msg': str(e), 'line': 0, 'text': ''}
    if isinstance(e, SyntaxError):
        info['msg'] = e.msg or str(e)
        info['line'] = e.lineno or 0
    else:
        tb = e.__traceback__
        while tb is not None:
            if tb.tb_frame.f_code.co_filename == 'main.py':
                info['line'] = tb.tb_lineno
            tb = tb.tb_next
    lines = code.split('\\n')
    if 0 < info['line'] <= len(lines):
        info['text'] = lines[info['line'] - 1].strip()
    return info

def __run(code, tests_json, want_vars):
    g = {'__name__': '__main__'}
    result = {'error': None, 'tests': [], 'vars': {}}
    try:
        exec(compile(code, 'main.py', 'exec'), g)
    except SystemExit:
        pass
    except BaseException as e:
        result['error'] = __error(e, code)
    sys.stdout.flush()
    tests = json.loads(tests_json)
    for t in tests:
        row = {'label': t.get('label') or t.get('call') or t.get('check') or 'test', 'ok': False, 'got': None, 'want': None}
        if result['error'] is not None:
            row['skipped'] = True
            result['tests'].append(row)
            continue
        saved, sys.stdout = sys.stdout, io.StringIO()
        try:
            if 'call' in t:
                got = eval(t['call'], g)
                want = eval(t['want'], g)
                row['ok'] = bool(got == want)
                row['got'], row['want'] = __short(got), __short(want)
            else:
                row['ok'] = bool(eval(t['check'], g))
        except BaseException as e:
            row['crash'] = type(e).__name__ + ': ' + str(e)
        finally:
            sys.stdout = saved
        result['tests'].append(row)
    return json.dumps(result)
`;

  /* Tries each place in order: the copy next to the page first, then the CDN. */
  const WORKER_SRC = bases => `
let py = null, queue = [];
const decoder = new TextDecoder();
(async () => {
  let why = '';
  for (const base of ${JSON.stringify(bases)}) {
    try {
      importScripts(base + 'pyodide.js');
      py = await loadPyodide({ indexURL: base });
      py.setStdout({ write(buf) { postMessage({ kind: 'out', text: decoder.decode(buf) }); return buf.length; } });
      py.setStderr({ write(buf) { postMessage({ kind: 'out', text: decoder.decode(buf) }); return buf.length; } });
      py.setStdin({ stdin: () => (queue.length ? queue.shift() + '\\n' : null) });
      py.runPython(${JSON.stringify(HARNESS)});
      postMessage({ kind: 'ready', base });
      return;
    } catch (e) {
      why = String(e);
    }
  }
  postMessage({ kind: 'loadfail', msg: why });
})();
onmessage = e => {
  const m = e.data;
  queue = (m.stdin || []).slice();
  postMessage({ kind: 'started', id: m.id });
  try {
    const run = py.globals.get('__run');
    const json = run(m.code, JSON.stringify(m.tests || []), false);
    run.destroy();
    postMessage({ kind: 'done', id: m.id, result: JSON.parse(json) });
  } catch (err) {
    postMessage({ kind: 'done', id: m.id, result: { error: { type: 'Crash', msg: String(err), line: 0, text: '' }, tests: [] } });
  }
};
`;

  let worker = null, state = 'idle', waiters = [], current = null, listeners = [];
  const absolute = rel => new URL(rel, location.href).href;

  /* A page opened from a file cannot read the files next to it, so it needs the CDN. */
  const bases = () => (location.protocol.startsWith('http') ? [absolute(LOCAL), CDN] : [CDN]);
  function setState(s) { state = s; listeners.forEach(fn => fn(s)); }
  function onState(fn) { listeners.push(fn); fn(state); }

  function boot() {
    if (worker) return;
    setState('loading');
    try {
      const url = URL.createObjectURL(new Blob([WORKER_SRC(bases())], { type: 'text/javascript' }));
      worker = new Worker(url);
      worker.onmessage = onMessage;
      worker.onerror = () => fail();
    } catch (e) {
      fail();
    }
  }
  function fail() {
    if (worker) worker.terminate();
    worker = null;
    setState('failed');
    const w = waiters; waiters = [];
    w.forEach(fn => fn(false));
    if (current) { const c = current; current = null; c.finish({ status: 'nonet', out: '', error: null, tests: [] }); }
  }
  function onMessage(e) {
    const m = e.data;
    if (m.kind === 'ready') {
      setState('ready');
      const w = waiters; waiters = [];
      w.forEach(fn => fn(true));
    } else if (m.kind === 'loadfail') {
      fail();
    } else if (!current) {
      return;
    } else if (m.kind === 'started') {
      current.timer = setTimeout(() => stop('timeout'), current.timeout);
    } else if (m.kind === 'out') {
      current.out += m.text;
      if (current.onOut) current.onOut(current.out);
      // Stops a loop that prints forever from filling up the page.
      if (current.out.length > 200000) stop('flood');
    } else if (m.kind === 'done') {
      clearTimeout(current.timer);
      const c = current; current = null;
      // After a crash this copy of Python cannot run again, so start a fresh one next time.
      if (m.result.error && m.result.error.type === 'Crash') {
        worker.terminate();
        worker = null;
        setState('idle');
      }
      c.finish(Object.assign({ status: m.result.error ? 'error' : 'ok', out: c.out }, m.result));
    }
  }
  function stop(reason) {
    if (!current) return;
    clearTimeout(current.timer);
    const c = current; current = null;
    if (worker) worker.terminate();
    worker = null;
    setState('idle');
    c.finish({ status: reason || 'stopped', out: c.out, error: null, tests: [] });
  }
  function ready() {
    return new Promise(res => {
      if (state === 'ready') return res(true);
      waiters.push(res);
      boot();
    });
  }
  let seq = 0;
  function run(code, opts = {}) {
    return new Promise(async finish => {
      if (current) stop('replaced');
      const id = ++seq;
      const ok = await ready();
      if (!ok) return finish({ status: 'nonet', out: '', error: null, tests: [] });
      // Two Run presses can both wait for Python to load. The newest one wins.
      if (id !== seq) return finish({ status: 'replaced', out: '', error: null, tests: [] });
      current = { id, out: '', onOut: opts.onOut, timeout: opts.timeout || DEFAULT_TIMEOUT, finish };
      worker.postMessage({ id, code, stdin: opts.stdin || [], tests: opts.tests || [] });
    });
  }

  // ------------------------------------------------------- friendly errors
  const has = (s, t) => (s || '').toLowerCase().includes(t);
  function friendly(err) {
    if (!err) return null;
    const { type, msg, text } = err;
    let say = '', fix = '';
    const nameMatch = /name '([^']+)' is not defined/.exec(msg || '');
    switch (type) {
      case 'SyntaxError':
        say = 'Python could not read this line. The spelling rules of code are called syntax.';
        if (has(msg, "expected ':'")) fix = 'This line needs a colon : at the end.';
        else if (has(msg, 'unterminated string') || has(msg, 'eol while')) fix = 'A quote mark is missing. Text needs one quote at the start and one at the end.';
        else if (has(msg, "maybe you meant '=='")) fix = 'To ask if two things match, use == with two equals signs.';
        else if (has(msg, 'was never closed')) fix = 'You opened a bracket and did not close it.';
        else if (has(msg, 'unmatched')) fix = 'There is a closing bracket with no opening bracket.';
        else fix = 'Check for a missing bracket, colon or quote mark. The mistake can also be on the line above.';
        break;
      case 'IndentationError':
      case 'TabError':
        say = 'The spaces at the start of a line look wrong. Those spaces are called indentation.';
        fix = has(msg, 'expected an indented block')
          ? 'A line ending in a colon : needs the next line pushed in by 4 spaces.'
          : 'Lines that belong together must start at the same place. Use 4 spaces for each level.';
        break;
      case 'NameError':
        say = nameMatch ? `Python does not know the name ${nameMatch[1]}.` : 'Python does not know this name.';
        fix = 'Check the spelling and the capital letters. Make sure you set it before you use it. If you meant text, put it in quote marks.';
        break;
      case 'TypeError':
        say = 'These two things do not work together.';
        if (has(msg, 'can only concatenate str') || has(msg, 'unsupported operand')) fix = 'You may be mixing text and numbers. Use str(5) to turn a number into text, or int("5") to turn text into a number.';
        else if (has(msg, 'argument')) fix = 'Check how many values you give the function. Count what it needs.';
        else if (has(msg, 'not subscriptable')) fix = 'You can only use [ ] on things like lists, text and dictionaries.';
        else if (has(msg, 'not iterable')) fix = 'A for loop needs something with many items, like a list or range(5).';
        else if (has(msg, 'not callable')) fix = 'You used ( ) on something that is not a function.';
        else fix = 'Look at the type of each value on this line.';
        break;
      case 'IndexError':
        say = 'You asked for a spot that does not exist.';
        fix = 'Counting starts at 0. A list with 5 items has spots 0, 1, 2, 3 and 4.';
        break;
      case 'KeyError':
        say = `This dictionary has no key called ${msg}.`;
        fix = 'Check the spelling. You can use .get(key) to stay safe when a key may be missing.';
        break;
      case 'ValueError':
        say = 'The type is right, but this value cannot be used here.';
        fix = has(msg, 'invalid literal') ? 'You tried to turn text into a number, but the text is not a number.' : 'Look at the value you passed in on this line.';
        break;
      case 'ZeroDivisionError':
        say = 'You tried to divide by 0.';
        fix = 'Nobody can split something into 0 parts. Check the number after the / sign.';
        break;
      case 'AttributeError':
        say = 'This kind of value does not have that tool.';
        fix = has(msg, 'nonetype') ? 'The value here is None, which means nothing. A function may have forgotten to return.' : 'Check the spelling of the word after the dot.';
        break;
      case 'RecursionError':
        say = 'Your function called itself too many times.';
        fix = 'Check the base case, which is the stop rule. Each call must get closer to it.';
        break;
      case 'EOFError':
        say = 'Your code asked for input, but there was nothing left to read.';
        fix = 'Add one line in the Input box for each input() in your code.';
        break;
      case 'ModuleNotFoundError':
      case 'ImportError':
        say = 'Python could not find that module.';
        fix = 'Check the spelling after the word import.';
        break;
      case 'Crash':
        say = 'Python ran out of room and had to start again.';
        fix = 'A function may be calling itself too many times. Check the base case, which is the stop rule.';
        break;
      case 'AssertionError':
        say = 'A check in the code came out False.';
        fix = 'An assert stops the program when its check is not true.';
        break;
      case 'UnboundLocalError':
        say = 'A function used a name before giving it a value.';
        fix = 'Give the name a value at the start of the function, or pass it in.';
        break;
      default:
        say = msg || 'Something went wrong.';
    }
    return { title: type, say, fix, line: err.line, text, raw: msg };
  }

  // --------------------------------------------------------------- editor
  /* A small code editor. A coloured <pre> sits behind a see-through <textarea>,
     so the learner gets normal typing, selection and screen reader support. */
  function editor(host, code, opts = {}) {
    const wrap = document.createElement('div');
    wrap.className = 'editor';
    const gutter = document.createElement('div');
    gutter.className = 'editor-gutter';
    gutter.setAttribute('aria-hidden', 'true');
    const scroller = document.createElement('div');
    scroller.className = 'editor-scroll';
    const pre = document.createElement('pre');
    pre.className = 'editor-pre';
    pre.setAttribute('aria-hidden', 'true');
    const ta = document.createElement('textarea');
    ta.className = 'editor-input';
    ta.spellcheck = false;
    ta.autocapitalize = 'off';
    ta.setAttribute('autocorrect', 'off');
    ta.setAttribute('autocomplete', 'off');
    ta.setAttribute('wrap', 'off');
    ta.setAttribute('aria-label', opts.label || 'Python code. Press Escape, then Tab, to leave the editor.');
    ta.value = code;
    scroller.append(pre, ta);
    wrap.append(gutter, scroller);
    host.appendChild(wrap);

    const paint = () => {
      const v = ta.value;
      pre.innerHTML = highlight(v) + '\n';
      const n = v.split('\n').length;
      let g = '';
      for (let i = 1; i <= n; i++) g += `<span${i === errLine ? ' class="err"' : ''}>${i}</span>`;
      gutter.innerHTML = g;
      ta.rows = n;
      const longest = v.split('\n').reduce((a, l) => Math.max(a, l.length), 0);
      ta.style.width = `calc(${longest + 2}ch + 24px)`;
    };
    let errLine = 0;
    let tabEscapes = false;
    ta.addEventListener('input', () => { errLine = 0; tabEscapes = false; paint(); if (opts.onChange) opts.onChange(ta.value); });
    /* Typing through the browser keeps Ctrl + Z working. setRangeText is the fallback. */
    const insert = (text, from, to) => {
      ta.setSelectionRange(from, to);
      if (!(document.execCommand && document.execCommand('insertText', false, text))) {
        ta.setRangeText(text, from, to, 'end');
        ta.dispatchEvent(new Event('input'));
      }
    };
    ta.addEventListener('blur', () => { tabEscapes = false; });
    ta.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (opts.onRun) opts.onRun();
        return;
      }
      if (e.key === 'Escape') { tabEscapes = true; return; }
      if (e.key === 'Tab' && !tabEscapes) {
        e.preventDefault();
        const { selectionStart: s, selectionEnd: t, value: v } = ta;
        const ls = v.lastIndexOf('\n', s - 1) + 1;
        const many = v.slice(s, t).includes('\n');
        if (e.shiftKey || many) {
          // Pushes every selected line in or out, instead of typing over the selection.
          const le = many && v[t - 1] === '\n' ? t - 1 : t;
          const lines = v.slice(ls, le).split('\n');
          const next = lines.map(l => (e.shiftKey ? l.replace(/^ {1,4}/, '') : (l.trim() ? '    ' + l : l))).join('\n');
          if (next === lines.join('\n')) return;
          const first = next.split('\n')[0].length - lines[0].length;
          insert(next, ls, ls + lines.join('\n').length);
          ta.setSelectionRange(Math.max(ls, s + first), many ? ls + next.length : Math.max(ls, s + first));
        } else {
          insert('    ', s, t);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const { selectionStart: s, selectionEnd: t, value: v } = ta;
        const ls = v.lastIndexOf('\n', s - 1) + 1;
        const line = v.slice(ls, s);
        let pad = /^ */.exec(line)[0];
        if (/:\s*(#.*)?$/.test(line)) pad += '    ';
        insert('\n' + pad, s, t);
      }
    });
    paint();
    return {
      el: wrap,
      get value() { return ta.value; },
      set value(v) { ta.value = v; errLine = 0; paint(); },
      markError(line) { errLine = line || 0; paint(); },
      focus() { ta.focus(); },
    };
  }

  root.Py = { HARNESS, highlight, esc, run, stop: () => stop('stopped'), boot, ready, friendly, editor, onState, VERSION };
})(typeof window !== 'undefined' ? window : globalThis);
