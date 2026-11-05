/* Lesson: turns one lesson's data into a page. */
(function (root) {
  'use strict';
  const { el, rich, icon } = root.UI;
  const { Q, Viz, Store, Course } = root;

  // ------------------------------------------------- where the learner stopped
  /* The lesson on screen. Each block has a name in data-at, because the page changes height as
     questions come back, and a block stays where it is in the lesson. */
  let here = null;
  const barBottom = () => { const t = document.getElementById('topbar'); return t ? t.getBoundingClientRect().bottom : 0; };

  /* Remembers the block at the top of the screen. Above the lesson text means the top: warm-ups
     come first and stay blank, so there is nothing there to come back to. */
  function notePlace() {
    if (!here || here.settling || !here.page.isConnected) return;
    const line = barBottom() + 1;
    let at = null, atY = 0;
    for (const node of here.page.querySelectorAll('[data-at]')) {
      const y = node.getBoundingClientRect().top;
      if (y > line) break;
      at = node;
      atY = y;
    }
    const name = at && at.dataset.at;
    const finished = (Store.lessonState(here.id) || {}).status === 'done';
    if (!at || name === 'top' || (name === 'finish' && finished)) Store.setPlace(here.id, null);
    else Store.setPlace(here.id, { a: name, d: Math.round(line - 1 - atY) });
  }
  function goToPlace(rec) {
    const node = here && here.page.querySelector(`[data-at="${CSS.escape(String(rec.a))}"]`);
    if (!node) return false;
    const d = Math.min(Math.max(Number(rec.d) || 0, 0), node.offsetHeight);
    const y = Math.max(0, Math.round(window.scrollY + node.getBoundingClientRect().top - barBottom() + d));
    if (Math.abs(window.scrollY - y) > 1) window.scrollTo({ top: y, behavior: 'instant' });
    return true;
  }
  function stopSettling() { if (here) here.settling = false; }
  function dropPill() {
    if (here && here.pill) { here.pill.remove(); here.pill = null; }
  }
  function goToTop(id) {
    stopSettling();
    dropPill();
    window.scrollTo({ top: 0, behavior: 'instant' });
    Store.setPlace(id, null);
    const h = here && here.page.querySelector('h1');
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  }
  /* Takes the learner back to where they stopped. Pictures and fonts can still change the height for
     a moment, so it checks again a few times, and stops the moment the learner does anything. */
  function resume(id) {
    if (!here || here.id !== id) return false;
    const rec = Store.placeOf(id);
    if (!rec || !goToPlace(rec)) return false;
    const mine = here;
    mine.settling = true;
    const inputs = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
    const stop = () => {
      mine.settling = false;
      inputs.forEach(ev => window.removeEventListener(ev, stop, true));
    };
    inputs.forEach(ev => window.addEventListener(ev, stop, { passive: true, capture: true }));
    const again = () => { if (here === mine && mine.settling) goToPlace(rec); };
    [60, 200, 500, 1000, 1800].forEach(ms => setTimeout(again, ms));
    setTimeout(() => { again(); stop(); }, 2600);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(again);
    if (window.scrollY > 200) {
      const warm = !!here.page.querySelector('#sec-warm');
      mine.pill = el('div.resume-pill', { role: 'status' },
        el('span', warm ? 'Back where you stopped. Warm-up questions are at the top.' : 'Back where you stopped.'),
        el('button.btn.btn-quiet', { type: 'button', onclick: () => goToTop(id) }, 'Go to the top'));
      mine.pillY = window.scrollY;
      here.page.parentNode.prepend(mine.pill);
      setTimeout(() => { if (here === mine) dropPill(); }, 12000);
    }
    return true;
  }
  /* Called before the page changes, while the old lesson is still there to measure. */
  function leave() {
    notePlace();
    dropPill();
    here = null;
  }
  let scrollWait = 0;
  window.addEventListener('scroll', () => {
    if (!here) return;
    clearTimeout(scrollWait);
    scrollWait = setTimeout(notePlace, 200);
    if (here.pill && !here.settling && Math.abs(window.scrollY - here.pillY) > window.innerHeight) dropPill();
  }, { passive: true });
  Store.beforeLeave(notePlace);

  /* A question answered anywhere on this page may finish the lesson. */
  let onFinished = null;
  root.DSA.on('lesson-finished', id => { if (onFinished) onFinished(id); });

  /* Each block type becomes one piece of the page. */
  const BLOCKS = {
    h(b) { return el('h2.step-h', { id: b._anchor, html: rich(b.text) }); },
    h3(b) { return el('h3.step-h3', { html: rich(b.text) }); },
    p(b) { return el('p', { html: rich(b.text) }); },
    list(b) { return el(b.ordered ? 'ol.step-list' : 'ul.step-list', b.items.map(i => el('li', { html: rich(i) }))); },
    analogy(b) {
      return el('aside.callout.c-picture', el('p.callout-title', b.title || 'Picture this'), el('p', { html: rich(b.text) }));
    },
    big(b) { return el('aside.callout.c-big', el('p.callout-title', 'Big idea'), el('p', { html: rich(b.text) })); },
    tip(b) { return el('aside.callout.c-tip', el('p.callout-title', b.title || 'Good to know'), el('p', { html: rich(b.text) })); },
    trap(b) {
      return el('aside.callout.c-trap', el('p.callout-title', 'Careful'),
        el('p', { html: `<strong>Many people think:</strong> ${rich(b.think)}` }),
        el('p', { html: `<strong>What really happens:</strong> ${rich(b.real)}` }),
        b.code ? Q.codeView(b.code) : null);
    },
    words(b) {
      return el('aside.words', el('p.callout-title', b.items.length > 1 ? 'New words' : 'New word'),
        el('dl', b.items.map(w => el('div.word', el('dt', w.word, w.say ? el('span.say', ` say: ${w.say}`) : null), el('dd', { html: rich(w.means) })))));
    },
    table(b) {
      return el('div.table-wrap', { tabindex: '0' }, el('table.data', b.caption ? el('caption', { html: rich(b.caption) }) : null,
        el('thead', el('tr', b.head.map(h => el('th', { scope: 'col', html: rich(h) })))),
        el('tbody', b.rows.map(r => el('tr', r.map(c => el('td', { html: rich(String(c)) })))))));
    },
    /* A worked example, broken into named steps. */
    steps(b) {
      const noun = root.UI.esc(b.noun || 'Step');
      return el('div.worked', b.title ? el('p.callout-title', b.title) : null, el('ol', b.items.map((s, i) => el('li',
        el('p.worked-label', { html: `<span class="worked-n">${noun} ${i + 1}:</span> ${rich(s.label)}` }),
        s.text ? el('p', { html: rich(s.text) }) : null,
        s.code ? Q.codeView(s.code) : null))));
    },
    /* A cost card: how fast each job is. */
    cost(b) {
      return el('div.table-wrap', { tabindex: '0' }, el('table.data.cost', el('caption', b.title || 'How fast is it?'),
        el('thead', el('tr', el('th', { scope: 'col', text: 'Job' }), el('th', { scope: 'col', text: 'Steps' }), el('th', { scope: 'col', text: 'In plain words' }))),
        el('tbody', b.items.map(r => el('tr', el('td', { html: rich(r.op) }), el('td.cost-o', r.cost), el('td', { html: rich(r.why) }))))));
    },
    code(b, ctx) {
      const box = el('div.step-code');
      if (b.caption) box.append(el('p.code-caption', { html: rich(b.caption) }));
      if (b.run === false) box.append(Q.codeView(b.code));
      else Q.codeBlock(box, { code: b.code, output: b.output, stdin: b.stdin, key: `b:${ctx.lesson.id}:${ctx.n}`, timeout: b.timeout });
      return box;
    },
    viz(b) {
      const box = el('div.step-viz');
      Viz.mount(box, b.name, { params: b.params, auto: b.auto, loop: b.auto });
      if (b.caption) box.append(el('p.viz-caption', { html: rich(b.caption) }));
      return box;
    },
    q(b) {
      const box = el('div.step-q');
      Q.render(box, b);
      return box;
    },
  };

  function renderLesson(id) {
    const l = Course.lessons[id];
    if (!l) return el('div.page', el('h1', 'That lesson is not here'), el('p', el('a', { href: '#learn' }, 'Go back to the course map')));
    Store.openLesson(id);
    const finishedOnOpen = Q.finishIfAllRight(l);
    const m = l.module;
    const outline = [];

    const page = el('article.lesson');
    const saved = () => Store.state.saved.includes(id);
    const saveBtn = el('button.btn.btn-quiet.btn-icon', {
      type: 'button',
      'aria-pressed': String(saved()),
      html: icon('save', 18) + `<span>${saved() ? 'Saved' : 'Save'}</span>`,
      onclick: () => {
        const s = Store.state;
        if (saved()) s.saved = s.saved.filter(x => x !== id); else s.saved.push(id);
        Store.save();
        saveBtn.setAttribute('aria-pressed', String(saved()));
        saveBtn.querySelector('span').textContent = saved() ? 'Saved' : 'Save';
      },
    });
    const noteBox = el('div.note-box', { hidden: !Store.state.notes[id] },
      el('label', { for: 'note-text' }, 'My note for this lesson (only you can see it)'),
      el('textarea', {
        id: 'note-text', rows: '3', maxlength: '2000',
        oninput: e => {
          const v = e.target.value;
          if (v) Store.state.notes[id] = v; else delete Store.state.notes[id];
          Store.saveSoon();
        },
      }));
    noteBox.querySelector('textarea').value = Store.state.notes[id] || '';
    const noteBtn = el('button.btn.btn-quiet.btn-icon', {
      type: 'button',
      html: icon('note', 18) + '<span>Note</span>',
      onclick: () => {
        noteBox.hidden = !noteBox.hidden;
        if (!noteBox.hidden) noteBox.querySelector('textarea').focus();
      },
    });

    const head = el('header.lesson-head', { 'data-at': 'top' },
      el('p.crumb', el('a', { href: '#learn' }, 'Course'), ' / ', el('a', { href: `#module-${m.id}` }, `${m.num}. ${m.title}`), ` / Lesson ${l.num}`),
      el('h1', { html: rich(l.title) }),
      el('p.lesson-goal', { html: rich(l.goal) }),
      el('div.lesson-meta',
        el('span.chip', `About ${l.mins || 12} minutes`),
        l.optional ? el('span.chip', 'Bonus lesson') : null,
        el('span.ide-gap'),
        noteBtn, saveBtn),
      noteBox,
      Q.saveNote());
    page.append(head);

    // Remember: quick questions from earlier lessons. This is what makes things stick.
    const warm = warmups(l);
    if (warm.length) {
      const sec = el('section.warmup', { id: 'sec-warm', 'data-at': 'top' }, el('h2.step-h', 'Warm up: do you remember?'),
        el('p', 'These come from earlier lessons. A wrong answer is fine. It shows what to look at again.'));
      warm.forEach(qid => {
        const entry = Course.questions[qid];
        Q.render(sec, entry.q, { mode: 'review', fresh: true, onDone: () => {} });
      });
      page.append(sec);
      outline.push({ id: 'sec-warm', text: 'Warm up' });
    }

    const main = el('div.lesson-body');
    (l.steps || []).forEach((b, n) => {
      const make = BLOCKS[b.t];
      if (!make) { console.warn('Unknown block', b.t, 'in', l.id); return; }
      if (b.t === 'h') {
        b._anchor = `s${n}`;
        outline.push({ id: b._anchor, text: b.text.replace(/[`*]/g, '') });
      }
      const node = make(b, { lesson: l, n });
      node.dataset.at = `s${n}`;
      main.append(node);
    });
    page.append(main);

    if (l.recap && l.recap.length) {
      page.append(el('section.recap', { id: 'sec-recap', 'data-at': 'recap' }, el('h2.step-h', 'What you can do now'),
        el('ul', l.recap.map(r => el('li', { html: icon('check', 18) + `<span>${rich(r)}</span>` })))));
      outline.push({ id: 'sec-recap', text: 'What you can do now' });
    }

    const practice = l.practice || [];
    if (practice.length) {
      const counter = el('span.practice-count');
      const update = () => {
        const n = practice.filter(q => (Store.answerOf(q.qid) || {}).ok > 0).length;
        counter.textContent = `${n} of ${practice.length} done`;
      };
      update();
      const sec = el('section.practice', { id: 'sec-practice', 'data-at': 'practice' },
        el('div.practice-head', el('h2.step-h', 'Practice'), counter),
        el('p', 'Try each one yourself first. Every question has hints and an answer you can open at any time.'));
      practice.forEach(q => { Q.render(sec, q, { onDone: update }).dataset.at = `p:${q.id}`; });
      page.append(sec);
      outline.push({ id: 'sec-practice', text: 'Practice' });
    }

    // Finish
    const done = () => (Store.lessonState(id) || {}).status === 'done';
    const nxt = Course.next(id), prv = Course.prev(id);
    const finishNote = el('p.finish-note', { role: 'status' });
    const finishBtn = el('button.btn.btn-marker.btn-big', { type: 'button' });
    const paintFinish = byItself => {
      finishBtn.innerHTML = done() ? icon('check', 20) + '<span>Lesson finished</span>' : icon('check', 20) + '<span>I finished this lesson</span>';
      finishBtn.setAttribute('aria-pressed', String(done()));
      const again = 'You will see some of these questions again in a day or two. That is how memory gets strong.';
      finishNote.textContent = !done() ? '' : byItself ? `You got every question right, so this lesson is marked finished. Press the button above to undo that. ${again}` : again;
    };
    finishBtn.addEventListener('click', () => {
      if (done()) Store.reopenLesson(id); else Store.finishLesson(id);
      paintFinish();
      if (root.App && root.App.refreshRail) root.App.refreshRail();
    });
    paintFinish(finishedOnOpen);
    onFinished = doneId => { if (doneId === id) paintFinish(true); };
    page.append(el('footer.lesson-foot', { id: 'sec-finish', 'data-at': 'finish' }, finishBtn, finishNote, Q.saveNote(),
      el('nav.lesson-nav', { 'aria-label': 'Lesson order' },
        prv ? el('a.btn.btn-quiet', { href: `#lesson-${prv.id}` }, `Back: ${prv.title.replace(/[`*]/g, '')}`) : el('span'),
        nxt ? el('a.btn.btn-primary', { href: `#lesson-${nxt.id}`, html: `<span>Next: ${root.UI.esc(nxt.title.replace(/[`*]/g, ''))}</span>` + icon('arrow', 18) }) : el('a.btn.btn-primary', { href: '#progress' }, 'See your progress')),
      el('button.to-top', { type: 'button', onclick: () => goToTop(id) }, 'Back to the top of this lesson')));

    const rail = el('nav.lesson-rail', { 'aria-label': 'In this lesson' },
      el('p.rail-title', 'In this lesson'),
      el('button.to-top', { type: 'button', onclick: () => goToTop(id) }, 'Top of the lesson'),
      el('ol', outline.map(o => el('li', el('a', {
        href: `#lesson-${id}`,
        onclick: e => {
          e.preventDefault();
          stopSettling();
          const t = document.getElementById(o.id);
          if (t) { t.scrollIntoView({ block: 'start' }); t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
        },
      }, o.text)))));
    here = { id, page, settling: false, pill: null, pillY: 0 };
    return el('div.lesson-layout', page, rail);
  }

  /* Up to 3 earlier questions: anything due first, then the lesson just before. */
  function warmups(lesson) {
    const quick = qid => {
      const e = Course.questions[qid];
      return e && (e.q.type === 'mcq' || (e.q.type === 'predict' && e.q.options)) && e.lesson.id !== lesson.id;
    };
    const idx = Course.order.indexOf(lesson.id);
    const earlier = new Set(Course.order.slice(0, idx));
    const picks = [];
    const due = Store.dueQuestions(Course.questions, 50).list.filter(q => quick(q) && earlier.has(Course.questions[q].lesson.id));
    picks.push(...due.slice(0, 2));
    for (let i = idx - 1; i >= 0 && picks.length < 2; i--) {
      const qs = Course.lessons[Course.order[i]].qids.filter(quick);
      // Moves through a lesson's questions so repeat visits see different ones.
      const seed = (Store.state.lessons[lesson.id] || {}).last || '';
      for (const q of root.UI.shuffle(qs, lesson.id + seed)) {
        if (!picks.includes(q)) { picks.push(q); break; }
      }
    }
    return picks.slice(0, 3);
  }

  root.Lesson = { render: renderLesson, warmups, resume, leave };
})(typeof window !== 'undefined' ? window : globalThis);
