/* Q: practice questions and the code block.
 * Mistakes cost nothing here. There are no lives, no timers and no lost points.
 * A wrong answer gives a useful clue, and the question comes back for review later.
 */
(function (root) {
  'use strict';
  const { el, rich, shuffle, icon } = root.UI;
  const Py = root.Py, Store = root.Store;

  const LEVELS = { 1: 'Warm-up', 2: 'Core', 3: 'Stretch' };
  const KINDS = {
    mcq: 'Pick one', predict: 'Guess the output', order: 'Put the lines in order',
    fill: 'Fill the gaps', fix: 'Fix the bug', write: 'Write the code',
    trace: 'Fill the table', match: 'Match the pairs',
  };
  /* These can be marked at a glance, so they are good for quick review. */
  const REVIEWABLE = new Set(['mcq', 'predict', 'fill', 'order', 'match', 'trace']);
  /* Answer buttons cannot hold word links: tapping the word would also choose the answer. */
  const noTerms = s => String(s).replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, '$1');
  const norm = s => String(s).replace(/\r/g, '').split('\n').map(l => l.replace(/\s+$/, '')).join('\n').replace(/\n+$/, '');

  const codeView = code => el('pre.code', { tabindex: '0', html: Py.highlight(String(code).replace(/\n$/, '')), 'aria-label': 'Python code' });

  // ------------------------------------------------------------- run results
  function errorCard(err) {
    const f = Py.friendly(err);
    if (!f) return null;
    const card = el('div.errcard', { role: 'alert' },
      el('p.err-title', el('strong', `Python stopped${f.line ? ' on line ' + f.line : ''}.`)),
      f.text ? el('pre.err-line', f.text) : null,
      el('p', f.say),
      f.fix ? el('p', el('strong', 'Try this: '), f.fix) : null,
      el('details.err-raw', el('summary', "Show Python's exact words"), el('pre', `${f.title}: ${f.raw}`)));
    return card;
  }
  function stateMessage(status) {
    if (status === 'timeout') return "Your program is still running after a few seconds, so I stopped it. A loop may never end. Look at what makes the loop stop.";
    if (status === 'flood') return 'Your program printed too much, so I stopped it. A loop may never end.';
    if (status === 'stopped') return 'You stopped the program.';
    if (status === 'replaced') return 'You ran another program, so this one stopped.';
    if (status === 'nonet') return location.protocol === 'file:'
      ? 'Python could not load. When you open this page from a file, Python comes from the internet. Check your connection, then press Run again.'
      : 'Python could not load. It needs the internet the first time. Check your connection, then press Run again.';
    return '';
  }

  /* The block with an editor, a Run button and an output panel. */
  function codeBlock(host, opts) {
    const key = opts.key;
    const saved = key && Store.state.code[key];
    const box = el('div.ide');
    const startCode = opts.code.replace(/\n$/, '');
    let ed;
    const onChange = v => {
      if (!key) return;
      if (v === startCode) delete Store.state.code[key]; else Store.state.code[key] = v;
      Store.saveSoon();
    };
    const runBtn = el('button.btn.btn-primary.btn-run', { type: 'button', html: icon('run', 18) + '<span>Run</span>', title: 'Run (Ctrl + Enter)' });
    const stopBtn = el('button.btn.btn-danger', { type: 'button', hidden: true, html: icon('stop', 18) + '<span>Stop</span>' });
    const resetBtn = el('button.btn.btn-quiet', { type: 'button', html: icon('reset', 18) + '<span>Start over</span>' });
    const copyBtn = el('button.btn.btn-quiet', { type: 'button', html: icon('copy', 18) + '<span>Copy</span>' });
    runBtn.addEventListener('click', () => run());
    const tools = el('div.ide-tools', runBtn, stopBtn, el('span.ide-gap'), resetBtn, copyBtn);
    const edHost = el('div.ide-editor');
    box.append(edHost);

    const needsInput = c => /\binput\s*\(/.test(c);
    const inputWrap = el('label.ide-input', { hidden: true }, el('span', 'Input: what you would type. Put each answer on its own line.'), el('textarea', { rows: '2', spellcheck: 'false' }));
    const inputBox = inputWrap.querySelector('textarea');
    inputBox.value = (opts.stdin || []).join('\n');
    box.append(inputWrap, tools);
    const status = el('p.ide-status', { role: 'status' });
    const outPanel = el('div.ide-out', { hidden: true }, el('p.ide-outlabel', 'What your program printed'), el('pre.ide-outtext', { tabindex: '0' }));
    const outText = outPanel.querySelector('pre');
    const extra = el('div.ide-extra');
    box.append(status, outPanel, extra);
    host.append(box);

    const syncInput = c => { inputWrap.hidden = !needsInput(c); };
    ed = Py.editor(edHost, saved || startCode, {
      onRun: () => run(),
      onChange: v => { onChange(v); syncInput(v); },
      label: opts.label,
    });
    syncInput(ed.value);

    let undoCode = null;
    resetBtn.addEventListener('click', () => {
      if (undoCode != null) {
        ed.value = undoCode;
        undoCode = null;
        resetBtn.querySelector('span').textContent = 'Start over';
        onChange(ed.value);
        return;
      }
      undoCode = ed.value;
      ed.value = startCode;
      onChange(startCode);
      resetBtn.querySelector('span').textContent = 'Undo';
      setTimeout(() => {
        if (undoCode != null) { undoCode = null; resetBtn.querySelector('span').textContent = 'Start over'; }
      }, 10000);
      outPanel.hidden = true;
      status.textContent = '';
      extra.textContent = '';
    });
    copyBtn.addEventListener('click', () => {
      const done = () => { copyBtn.querySelector('span').textContent = 'Copied'; setTimeout(() => { copyBtn.querySelector('span').textContent = 'Copy'; }, 1500); };
      if (navigator.clipboard) navigator.clipboard.writeText(ed.value).then(done).catch(() => {});
    });
    stopBtn.addEventListener('click', () => Py.stop());

    async function run() {
      extra.textContent = '';
      ed.markError(0);
      runBtn.disabled = true;
      status.textContent = 'Getting Python ready. The first time takes a few seconds.';
      const stdin = inputBox.value ? inputBox.value.split('\n') : [];
      let slow = 0;
      Py.ready().then(ok => {
        if (!ok || !runBtn.disabled) return;
        status.textContent = 'Running...';
        slow = setTimeout(() => { stopBtn.hidden = false; }, 1500);
      });
      outText.textContent = '';
      let latest = '', drawing = 0;
      const res = await Py.run(ed.value, {
        stdin,
        tests: opts.tests,
        timeout: opts.timeout,
        // A loop that prints forever sends thousands of messages. Draw once per screen refresh.
        onOut: t => {
          latest = t;
          if (drawing) return;
          drawing = requestAnimationFrame(() => { drawing = 0; outPanel.hidden = false; outText.textContent = latest; });
        },
      });
      cancelAnimationFrame(drawing);
      drawing = 0;
      clearTimeout(slow);
      stopBtn.hidden = true;
      runBtn.disabled = false;
      outPanel.hidden = !res.out && res.status !== 'ok';
      outText.textContent = res.out || '';
      outText.classList.toggle('empty', !res.out);
      if (!res.out && res.status === 'ok') outText.textContent = '(Nothing was printed.)';
      status.textContent = stateMessage(res.status);
      if (res.error) {
        ed.markError(res.error.line);
        extra.append(errorCard(res.error));
      } else if (res.status === 'nonet' && opts.output != null) {
        outPanel.hidden = false;
        outPanel.querySelector('.ide-outlabel').textContent = 'What this code prints';
        outText.textContent = opts.output;
      }
      if (opts.onResult) opts.onResult(res, ed.value, extra);
      return res;
    }
    return { get value() { return ed.value; }, run, ed };
  }

  // --------------------------------------------------------------- a question
  function render(host, q, ctx = {}) {
    const qid = q.qid;
    const prior = qid && !ctx.fresh ? Store.answerOf(qid) : null;
    const box = el('section.q', { 'data-type': q.type, 'aria-label': KINDS[q.type] || 'Question' });
    const stateBadge = el('span.q-state');
    box.append(el('div.q-head',
      el('span.q-kind', KINDS[q.type] || 'Question'),
      q.level ? el(`span.q-level.l${q.level}`, LEVELS[q.level]) : null,
      stateBadge));
    if (q.q) box.append(el('p.q-text', { html: rich(q.q) }));

    const body = el('div.q-body');
    box.append(body);
    const feedback = el('div.q-feedback', { role: 'status' });
    const actions = el('div.q-actions');
    const hintsBox = el('div.q-hints');
    const answerBox = el('div.q-answer', { hidden: true });
    box.append(actions, feedback, hintsBox, answerBox);

    let tries = 0, hinted = false, done = false;
    const reviewable = REVIEWABLE.has(q.type) && ctx.track !== false;

    function setSolved() {
      stateBadge.innerHTML = icon('check', 16) + '<span>Done</span>';
      box.classList.add('solved');
    }
    if (prior && prior.ok > 0) setSolved();

    function say(kind, text) {
      feedback.className = 'q-feedback ' + kind;
      feedback.innerHTML = '';
      feedback.append(el('p', { html: rich(text) }));
    }
    function record(ok) {
      tries += 1;
      if (qid && ctx.track !== false) Store.recordAnswer(qid, { ok, hinted, firstTry: tries === 1, reviewable });
      if (ok) {
        done = true;
        setSolved();
        if (ctx.onDone) ctx.onDone(true, { tries, hinted });
      }
      if (!ok && tries >= 2) answerBtn.hidden = false;
    }

    // Hint ladder: every step is the learner's choice.
    const hints = (q.hints || (q.hint ? [q.hint] : [])).slice();
    let hintAt = 0;
    const hintBtn = el('button.btn.btn-quiet', { type: 'button', html: icon('hint', 18) + '<span>Show a hint</span>' });
    hintBtn.addEventListener('click', () => {
      hintsBox.append(el('p.q-hint', { html: `<strong>Hint ${hintAt + 1}.</strong> ` + rich(hints[hintAt]) }));
      hinted = true;
      hintAt += 1;
      if (qid && ctx.track !== false) Store.markHint(qid);
      if (hintAt >= hints.length) hintBtn.hidden = true;
    });
    if (!hints.length || Store.state.prefs.hideHints) hintBtn.hidden = true;

    const answerBtn = el('button.btn.btn-quiet', { type: 'button', html: icon('eye', 18) + '<span>Show the answer</span>' });
    answerBtn.addEventListener('click', () => {
      if (answerBox.hidden) {
        answerBox.hidden = false;
        fillAnswer();
        answerBtn.querySelector('span').textContent = 'Hide the answer';
        if (qid && !done && ctx.track !== false) Store.markSaw(qid, reviewable);
        if (ctx.onSaw) ctx.onSaw();
      } else {
        answerBox.hidden = true;
        answerBtn.querySelector('span').textContent = 'Show the answer';
      }
    });
    let answerFilled = false;
    function fillAnswer() {
      if (answerFilled) return;
      answerFilled = true;
      answerBox.append(el('p.q-answer-label', 'The answer'));
      const a = answerContent(q);
      if (a) answerBox.append(a);
      if (q.explain) answerBox.append(el('p', { html: rich(q.explain) }));
      if (done || q.type === 'write' || q.type === 'fix') answerBox.append(el('p.q-tryagain', 'Seeing an answer is fine. Try it yourself again later, without looking.'));
    }

    // ----- each kind of question
    const type = q.type;
    let checkFn = null;
    if (type === 'mcq' || (type === 'predict' && q.options)) renderChoices();
    else if (type === 'predict') renderTyped();
    else if (type === 'order') renderOrder();
    else if (type === 'fill') renderFill();
    else if (type === 'trace') renderTrace();
    else if (type === 'match') renderMatch();
    else if (type === 'write' || type === 'fix') renderCode();

    if (checkFn) {
      const checkBtn = el('button.btn.btn-primary', { type: 'button', html: icon('check', 18) + '<span>Check</span>' });
      checkBtn.addEventListener('click', () => checkFn());
      actions.append(checkBtn);
    }
    actions.append(hintBtn, answerBtn);
    host.append(box);
    return box;

    function optionText(o) { return typeof o === 'string' ? o : o.text; }

    function renderChoices() {
      if (q.code) body.append(codeView(q.code));
      const list = el('div.q-options');
      const order = shuffle(q.options.map((o, i) => i), qid || q.q || 'x');
      const isCode = type === 'predict';
      order.forEach(i => {
        const o = q.options[i];
        const b = el(`button.q-option${isCode ? '.mono' : ''}`, { type: 'button', html: isCode ? UI.esc(optionText(o)) : rich(noTerms(optionText(o))) });
        b.addEventListener('click', () => {
          if (done) return;
          const ok = i === q.answer;
          b.classList.add(ok ? 'right' : 'wrong');
          b.setAttribute('aria-label', (ok ? 'Correct: ' : 'Not this one: ') + optionText(o));
          record(ok);
          if (ok) {
            say('good', (q.explain ? q.explain : 'Yes.'));
            list.querySelectorAll('button').forEach(x => { x.disabled = true; });
            if (type === 'predict') showRun();
          } else {
            const why = typeof o === 'object' && o.why ? o.why : (q.why && q.why[i]) || 'Not this one. Look again and try another.';
            say('tip', why);
            b.disabled = true;
          }
        });
        list.append(b);
      });
      body.append(list);
    }

    function showRun() {
      if (!q.code || box.querySelector('.ide') || ctx.mode === 'review') return;
      const holder = el('div.q-run');
      holder.append(el('p.q-runlabel', 'Now run it and see for yourself.'));
      codeBlock(holder, { code: q.code, output: q.answerText || String(optionText(q.options ? q.options[q.answer] : q.answer)), stdin: q.stdin });
      feedback.after(holder);
    }

    function renderTyped() {
      body.append(codeView(q.code));
      const ta = el('textarea.q-typed', { rows: String(Math.max(2, String(q.answer).split('\n').length)), spellcheck: 'false', 'aria-label': 'What you think it prints' });
      body.append(el('label.q-label', 'Type what you think it prints:'), ta);
      checkFn = () => {
        if (!ta.value.trim()) return say('tip', 'Type your guess first. A wrong guess is still useful.');
        const ok = norm(ta.value) === norm(q.answer);
        record(ok);
        if (ok) {
          say('good', q.explain || 'Yes, that is exactly what it prints.');
          showRun();
        } else {
          say('tip', q.why || 'Not yet. Go through the code one line at a time. Keep track of each value as you go.');
        }
      };
    }

    function renderOrder() {
      const all = q.lines.concat(q.extra || []);
      const pool = shuffle(all.map((text, i) => ({ text, i })), (qid || q.q) + 'o');
      const picked = [];
      const poolEl = el('div.order-list.order-pool');
      const pickedEl = el('ol.order-list.order-picked');
      /* The list redraws after each press, so put the keyboard focus back near where it was. */
      const refocus = (list, sel, i) => {
        const all = list.querySelectorAll(sel);
        const t = all[Math.min(i, all.length - 1)];
        if (t) t.focus();
        else { const other = list === poolEl ? pickedEl : poolEl; const o = other.querySelector('button:not(:disabled)'); if (o) o.focus(); }
      };
      const moved = n => {
        const row = pickedEl.children[n];
        const b = row && (row.querySelector('.order-move:not(:disabled)'));
        if (b) b.focus();
      };
      const draw = () => {
        poolEl.textContent = '';
        pickedEl.textContent = '';
        pool.filter(x => !picked.includes(x)).forEach((x, at) => {
          poolEl.append(el('button.order-line', {
            type: 'button',
            'aria-label': 'Add line: ' + x.text.trim(),
            html: Py.highlight(x.text),
            onclick: () => { picked.push(x); clear(); draw(); refocus(poolEl, '.order-line', at); },
          }));
        });
        if (!pool.some(x => !picked.includes(x))) poolEl.append(el('p.order-empty', 'All the lines are used.'));
        if (!picked.length) pickedEl.append(el('li.order-empty', 'Tap a line below to start.'));
        picked.forEach((x, n) => {
          const row = el('li.order-row', { 'data-n': n },
            el('button.order-line.placed', {
              type: 'button',
              'aria-label': 'Take back line: ' + x.text.trim(),
              html: Py.highlight(x.text),
              onclick: () => { picked.splice(n, 1); clear(); draw(); refocus(pickedEl, '.order-line', n); },
            }),
            el('button.order-move', { type: 'button', 'aria-label': 'Move up: ' + x.text.trim(), disabled: n === 0, html: icon('up', 16), onclick: () => { [picked[n - 1], picked[n]] = [picked[n], picked[n - 1]]; clear(); draw(); moved(n - 1); } }),
            el('button.order-move', { type: 'button', 'aria-label': 'Move down: ' + x.text.trim(), disabled: n === picked.length - 1, html: icon('down', 16), onclick: () => { [picked[n + 1], picked[n]] = [picked[n], picked[n + 1]]; clear(); draw(); moved(n + 1); } }));
          pickedEl.append(row);
        });
      };
      const clear = () => { feedback.textContent = ''; feedback.className = 'q-feedback'; };
      body.append(el('p.q-label', 'Your program'), pickedEl, el('p.q-label', 'Mixed-up lines'), poolEl);
      if (q.output != null) body.prepend(el('div.q-goal', el('span', 'It should print:'), el('pre', q.output)));
      draw();
      checkFn = () => {
        const got = picked.map(x => x.text);
        const ok = got.length === q.lines.length && got.every((t, i) => t === q.lines[i]);
        record(ok);
        pickedEl.querySelectorAll('.order-row').forEach(r => r.classList.remove('bad'));
        if (ok) return say('good', q.explain || 'Yes. The computer runs lines from top to bottom, so order matters.');
        const n = got.findIndex((t, i) => t !== q.lines[i]);
        if (n >= 0 && n < got.length) {
          const row = pickedEl.querySelector(`.order-row[data-n="${n}"]`);
          if (row) row.classList.add('bad');
          if (!q.lines.includes(got[n])) say('tip', `Line ${n + 1} is a line this program does not need. Take it back.`);
          else say('tip', `The lines above line ${n + 1} are good. Line ${n + 1} does not go there yet.`);
        } else say('tip', 'Good so far. Something is still missing.');
      };
    }

    function renderFill() {
      const pre = el('pre.code.fill');
      const pieces = String(q.code).replace(/\n$/, '').split('____');
      const inputs = [];
      pieces.forEach((p, i) => {
        pre.append(el('span', { html: Py.highlight(p) }));
        if (i < pieces.length - 1) {
          const want = [].concat(q.blanks[i]);
          const longest = want.reduce((a, w) => Math.max(a, String(w).length), 2);
          const inp = el('input.fill-gap', { type: 'text', autocapitalize: 'off', autocomplete: 'off', spellcheck: 'false', 'aria-label': `Gap ${i + 1}`, style: `width:calc(${Math.max(longest + 1, 4)}ch + 16px)` });
          inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); checkFn(); } });
          inputs.push(inp);
          pre.append(inp);
        }
      });
      body.append(pre);
      checkFn = () => {
        let firstBad = -1;
        inputs.forEach((inp, i) => {
          const ok = [].concat(q.blanks[i]).some(w => String(w).trim() === inp.value.trim());
          inp.classList.toggle('bad', !ok);
          inp.classList.toggle('good', ok);
          if (!ok && firstBad < 0) firstBad = i;
        });
        const ok = firstBad < 0;
        record(ok);
        if (ok) say('good', q.explain || 'Yes, every gap is right.');
        else {
          inputs[firstBad].focus();
          say('tip', q.why || `Look at gap ${firstBad + 1} again. Spelling and capital letters matter in Python.`);
        }
      };
    }

    function renderTrace() {
      body.append(codeView(q.code));
      const table = el('table.trace');
      table.append(el('thead', el('tr', q.head.map(h => el('th', { scope: 'col', text: h })))));
      const tbody = el('tbody');
      const given = q.given == null ? 1 : q.given;
      const cells = [];
      q.rows.forEach((row, r) => {
        tbody.append(el('tr', row.map((v, c) => {
          if (r < given) return el('td.mono', String(v));
          const inp = el('input', { type: 'text', autocapitalize: 'off', autocomplete: 'off', spellcheck: 'false', 'aria-label': `Row ${r + 1}, ${q.head[c]}` });
          inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); checkFn(); } });
          cells.push({ inp, want: String(v) });
          return el('td', inp);
        })));
      });
      table.append(tbody);
      body.append(el('div.table-wrap', table));
      checkFn = () => {
        let bad = 0;
        cells.forEach(c => {
          const ok = c.inp.value.trim() === c.want;
          c.inp.classList.toggle('bad', !ok);
          c.inp.classList.toggle('good', ok);
          if (!ok) bad += 1;
        });
        const ok = bad === 0;
        record(ok);
        if (ok) say('good', q.explain || 'Yes. You followed the code exactly as the computer does.');
        else say('tip', q.why || `${bad} of ${cells.length} boxes need another look. Go one line at a time and write each value as it changes.`);
      };
    }

    function renderMatch() {
      const lefts = shuffle(q.pairs.map((p, i) => ({ text: p[0], i })), (qid || 'm') + 'l');
      const rights = shuffle(q.pairs.map((p, i) => ({ text: p[1], i })), (qid || 'm') + 'r');
      let chosen = null, matched = 0;
      const wrap = el('div.match');
      const colL = el('div.match-col');
      const colR = el('div.match-col');
      lefts.forEach(l => {
        const b = el('button.match-item', { type: 'button', html: rich(noTerms(l.text)) });
        b.addEventListener('click', () => {
          colL.querySelectorAll('.match-item').forEach(x => x.classList.remove('on'));
          b.classList.add('on');
          chosen = { b, i: l.i };
        });
        colL.append(b);
      });
      rights.forEach(r => {
        const b = el('button.match-item', { type: 'button', html: rich(noTerms(r.text)) });
        b.addEventListener('click', () => {
          if (!chosen) return say('tip', 'Tap an item on the left first.');
          if (chosen.i === r.i) {
            chosen.b.classList.remove('on');
            chosen.b.classList.add('right');
            chosen.b.disabled = true;
            b.classList.add('right');
            b.disabled = true;
            chosen = null;
            matched += 1;
            feedback.textContent = '';
            if (matched === q.pairs.length) {
              record(true);
              say('good', q.explain || 'Yes, all the pairs match.');
            }
          } else {
            tries += 1;
            say('tip', 'Those two do not go together. Try another pair.');
            if (tries >= 2) answerBtn.hidden = false;
          }
        });
        colR.append(b);
      });
      wrap.append(colL, colR);
      body.append(wrap);
    }

    function renderCode() {
      const start = q.starter != null ? q.starter : q.code || '';
      if (q.wantOutput != null) body.append(el('div.q-goal', el('span', 'It should print:'), el('pre', q.wantOutput)));
      codeBlock(body, {
        code: start,
        key: qid ? 'q:' + qid : null,
        stdin: q.stdin,
        tests: q.tests,
        label: 'Your Python code. Press Escape, then Tab, to leave the editor.',
        onResult: (res, code, extra) => {
          if (res.status === 'nonet') return;
          const hasChecks = (q.tests && q.tests.length) || q.wantOutput != null;
          if (!hasChecks) return;
          if (res.status !== 'ok' && res.status !== 'error') return;
          const rows = (res.tests || []);
          let ok = !res.error;
          const list = el('ul.tests');
          rows.forEach(t => {
            const pass = t.ok && !t.skipped;
            if (!pass) ok = false;
            let line = t.label;
            if (t.skipped) line += ' (not tried, because the code stopped first)';
            else if (t.crash) line += `: this crashed with ${t.crash}`;
            else if (!t.ok && t.got != null) line += `: you got ${t.got}, it should be ${t.want}`;
            list.append(el(`li.${pass ? 'pass' : 'fail'}`, { html: icon(pass ? 'check' : 'close', 16) }, el('span', line)));
          });
          if (q.wantOutput != null) {
            const pass = !res.error && norm(res.out) === norm(q.wantOutput);
            if (!pass) ok = false;
            list.append(el(`li.${pass ? 'pass' : 'fail'}`, { html: icon(pass ? 'check' : 'close', 16) }, el('span', pass ? 'The output is right' : 'The output does not match yet')));
          }
          extra.prepend(list);
          record(ok);
          if (ok) say('good', q.explain || 'Yes. It passes every check.');
          else if (!res.error) say('tip', 'Not yet. Look at the first check with a cross and try that case in your head.');
          else feedback.textContent = '';
        },
      });
      answerBtn.hidden = false;
    }
  }

  function answerContent(q) {
    const t = q.type;
    if (t === 'mcq') {
      const o = q.options[q.answer];
      return el('p', { html: rich(typeof o === 'string' ? o : o.text) });
    }
    if (t === 'predict') {
      const o = q.options ? q.options[q.answer] : q.answer;
      return el('pre.answer-out', { tabindex: '0', text: typeof o === 'string' ? o : o.text });
    }
    if (t === 'order') return codeView(q.lines.join('\n'));
    if (t === 'fill') {
      let i = 0;
      return codeView(String(q.code).replace(/____/g, () => [].concat(q.blanks[i++])[0]));
    }
    if (t === 'fix' || t === 'write') return codeView(q.answer);
    if (t === 'trace') {
      return el('div.table-wrap', { tabindex: '0' }, el('table.trace', el('thead', el('tr', q.head.map(h => el('th', { text: h })))), el('tbody', q.rows.map(r => el('tr', r.map(v => el('td.mono', String(v))))))));
    }
    if (t === 'match') return el('ul', q.pairs.map(p => el('li', { html: `${rich(p[0])}: ${rich(p[1])}` })));
    return null;
  }

  root.Q = { render, codeBlock, codeView, LEVELS, KINDS, REVIEWABLE };
})(typeof window !== 'undefined' ? window : globalThis);
