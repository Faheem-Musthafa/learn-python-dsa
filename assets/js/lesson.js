/* Lesson: turns one lesson's data into a page. */
(function (root) {
  'use strict';
  const { el, rich, icon } = root.UI;
  const { Q, Viz, Store, Course } = root;

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

    const head = el('header.lesson-head',
      el('p.crumb', el('a', { href: '#learn' }, 'Course'), ' / ', el('a', { href: `#module-${m.id}` }, `${m.num}. ${m.title}`), ` / Lesson ${l.num}`),
      el('h1', { html: rich(l.title) }),
      el('p.lesson-goal', { html: rich(l.goal) }),
      el('div.lesson-meta',
        el('span.chip', `About ${l.mins || 12} minutes`),
        l.optional ? el('span.chip', 'Bonus lesson') : null,
        el('span.ide-gap'),
        noteBtn, saveBtn),
      noteBox);
    page.append(head);

    // Remember: quick questions from earlier lessons. This is what makes things stick.
    const warm = warmups(l);
    if (warm.length) {
      const sec = el('section.warmup', { id: 'sec-warm' }, el('h2.step-h', 'Warm up: do you remember?'),
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
      main.append(make(b, { lesson: l, n }));
    });
    page.append(main);

    if (l.recap && l.recap.length) {
      page.append(el('section.recap', { id: 'sec-recap' }, el('h2.step-h', 'What you can do now'),
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
      const sec = el('section.practice', { id: 'sec-practice' },
        el('div.practice-head', el('h2.step-h', 'Practice'), counter),
        el('p', 'Try each one yourself first. Every question has hints and an answer you can open at any time.'));
      practice.forEach(q => Q.render(sec, q, { onDone: update }));
      page.append(sec);
      outline.push({ id: 'sec-practice', text: 'Practice' });
    }

    // Finish
    const done = () => (Store.lessonState(id) || {}).status === 'done';
    const nxt = Course.next(id), prv = Course.prev(id);
    const finishNote = el('p.finish-note', { role: 'status' });
    const finishBtn = el('button.btn.btn-marker.btn-big', { type: 'button' });
    const paintFinish = () => {
      finishBtn.innerHTML = done() ? icon('check', 20) + '<span>Lesson finished</span>' : icon('check', 20) + '<span>I finished this lesson</span>';
      finishBtn.setAttribute('aria-pressed', String(done()));
      finishNote.textContent = done() ? 'You will see some of these questions again in a day or two. That is how memory gets strong.' : '';
    };
    finishBtn.addEventListener('click', () => {
      if (done()) Store.reopenLesson(id); else Store.finishLesson(id);
      paintFinish();
      if (root.App && root.App.refreshRail) root.App.refreshRail();
    });
    paintFinish();
    page.append(el('footer.lesson-foot', { id: 'sec-finish' }, finishBtn, finishNote,
      el('nav.lesson-nav', { 'aria-label': 'Lesson order' },
        prv ? el('a.btn.btn-quiet', { href: `#lesson-${prv.id}` }, `Back: ${prv.title.replace(/[`*]/g, '')}`) : el('span'),
        nxt ? el('a.btn.btn-primary', { href: `#lesson-${nxt.id}`, html: `<span>Next: ${root.UI.esc(nxt.title.replace(/[`*]/g, ''))}</span>` + icon('arrow', 18) }) : el('a.btn.btn-primary', { href: '#progress' }, 'See your progress'))));

    const rail = el('nav.lesson-rail', { 'aria-label': 'In this lesson' },
      el('p.rail-title', 'In this lesson'),
      el('ol', outline.map(o => el('li', el('a', {
        href: `#lesson-${id}`,
        onclick: e => {
          e.preventDefault();
          const t = document.getElementById(o.id);
          if (t) { t.scrollIntoView({ block: 'start' }); t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
        },
      }, o.text)))));
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

  root.Lesson = { render: renderLesson, warmups };
})(typeof window !== 'undefined' ? window : globalThis);
