/* Views: every page except the lesson page. */
(function (root) {
  'use strict';
  const { el, rich, esc, icon } = root.UI;
  const { Store, Course, Q, Viz, Py } = root;
  const plain = s => String(s).replace(/[`*]/g, '');

  const LEVEL_NAMES = { new: 'Not started', practising: 'Practising', solid: 'Solid', mastered: 'Mastered' };
  const LEVEL_FILL = { new: 0, practising: 0.25, solid: 0.75, mastered: 1 };
  const LEVEL_MODULE = { B: 'Beginner', I: 'Intermediate', A: 'Advanced', 'B/I': 'Beginner to intermediate' };

  /* Mastery ring: shape and word together, never colour alone. */
  function ring(level, size = 22) {
    const r = size / 2 - 2.5, c = 2 * Math.PI * r, f = LEVEL_FILL[level];
    return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-track"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-fill" stroke-dasharray="${(f * c).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 ${size / 2} ${size / 2})"/>${level === 'mastered' ? `<path d="M${size * 0.3} ${size * 0.52}l${size * 0.14} ${size * 0.14} ${size * 0.26} -${size * 0.3}" class="ring-check"/>` : ''}</svg>`;
  }
  const masteryOf = l => Store.mastery(l.id, l.qids);

  // ------------------------------------------------------------- home
  function home() {
    const s = Store.state;
    const page = el('div.page.home');
    const started = Object.keys(s.lessons).length > 0;
    const next = Course.suggested();

    const stage = el('div.hero-stage');
    const hero = el('section.hero',
      el('div.hero-copy',
        el('p.eyebrow', 'Python and algorithms, from zero'),
        el('h1', 'Learn to code one small step at a time.'),
        el('p.hero-lead', 'Watch how programs really work, step by step. Run real Python right here. Practise until it sticks. Every word is written so a 10-year-old can follow.'),
        started
          ? null
          : el('div.hero-choices',
            el('a.btn.btn-primary.btn-big', { href: `#lesson-${Course.order[0]}`, onclick: () => { s.onboarded = true; Store.save(); }, html: "<span>I'm new to coding</span>" + icon('arrow', 20) }),
            el('a.btn.btn-quiet.btn-big', { href: knowPython(), html: '<span>I know some Python</span>' }),
            el('a.btn.btn-quiet.btn-big', { href: '#learn', html: '<span>Show me the whole course</span>' }))),
      stage);
    page.append(hero);
    setTimeout(() => { if (stage.isConnected) Viz.mount(stage, 'hero-sort', { auto: true, hideTitle: true }); }, 0);

    if (started) {
      const review = Store.dueQuestions(Course.questions).total;
      const r = Store.rhythm();
      const grid = el('section.home-grid');
      if (next) {
        grid.append(el('a.card.continue', { href: `#lesson-${next.id}` },
          el('p.eyebrow', `Continue: lesson ${next.num}`),
          el('h2', { html: rich(next.title) }),
          el('p', { html: rich(next.goal) }),
          el('span.btn.btn-primary', { html: `<span>Keep going</span>` + icon('arrow', 18) })));
      } else {
        grid.append(el('div.card.continue', el('h2', 'You have finished every lesson.'), el('p', 'That is a huge amount of work. Use Review to keep it strong.')));
      }
      grid.append(el('a.card.mini', { href: '#review' },
        el('p.eyebrow', 'Review'),
        el('p.mini-big', review ? `${Math.min(review, Store.DAILY_CAP)} ready` : 'All done'),
        el('p', review ? 'A few quick questions to keep things strong.' : 'Nothing is waiting for you today.')));
      grid.append(el('a.card.mini', { href: '#progress' },
        el('p.eyebrow', 'This week'),
        weekDots(),
        el('p', `${r.thisWeek} of ${r.goal} study days. ${r.thisWeek >= r.goal ? 'Goal met. Rest is part of learning.' : 'Any days count.'}`)));
      page.append(grid);
    }

    page.append(el('section.home-how',
      el('h2', 'How each lesson works'),
      el('ol.how',
        el('li', el('strong', 'See it.'), ' Step through a moving picture at your own speed. You can always go back.'),
        el('li', el('strong', 'Guess it.'), ' Say what happens next before you find out. Guessing wrong still helps you learn.'),
        el('li', el('strong', 'Run it.'), ' Change real Python code and press Run. Nothing can break.'),
        el('li', el('strong', 'Keep it.'), ' Questions come back after a few days, so you do not forget.'))));
    return page;
  }

  /* Someone who knows Python starts at part 2, once it exists. */
  function knowPython() {
    const m = Course.modules.find(x => x.part === 2);
    return m ? `#module-${m.id}` : '#learn';
  }

  function weekDots() {
    const names = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const today = Store.dayKey();
    return el('div.weekdots', { role: 'img', 'aria-label': 'Study days this week: ' + Store.week().filter(d => d.on).length },
      Store.week().map((d, i) => el(`span.weekdot${d.on ? '.on' : ''}${d.key === today ? '.today' : ''}`, { title: d.key }, names[i])));
  }

  // ------------------------------------------------------------- course map
  function map() {
    const page = el('div.page.map');
    page.append(el('header.page-head', el('h1', 'The course'),
      el('p', 'A suggested path from your first line of code to advanced algorithms. Nothing is locked. Jump to anything you like.')));
    const next = Course.suggested();
    Object.keys(Course.PARTS).forEach(p => {
      const mods = Course.modules.filter(m => m.part === Number(p));
      if (!mods.length) return;
      page.append(el('section.part',
        el('h2.part-title', Course.PARTS[p].title),
        el('p.part-about', Course.PARTS[p].about),
        el('ol.chain', mods.map(m => moduleNode(m, next)))));
    });
    return page;
  }

  function moduleNode(m, next) {
    const levels = m.lessons.map(masteryOf);
    const solid = levels.filter(x => x.level === 'solid' || x.level === 'mastered').length;
    const opened = levels.some(x => x.level !== 'new');
    const isHere = next && next.module === m;
    return el(`li.chain-node${isHere ? '.here' : ''}`, { id: `mod-${m.id}` },
      el('details', { open: isHere || undefined },
        el('summary',
          el('span.chain-num', String(m.num)),
          el('span.chain-title',
            el('strong', m.title),
            el('span.chain-sub', `${m.lessons.length} lessons. ${LEVEL_MODULE[m.level] || ''}. ${opened ? `${solid} of ${m.lessons.length} solid.` : ''}`))),
        el('p.chain-blurb', { html: rich(m.blurb) }),
        needsNote(m),
        el('ol.lessons', m.lessons.map(l => lessonRow(l, next)))));
  }
  function needsNote(m) {
    if (!m.needs || !m.needs.length) return null;
    const names = m.needs.map(id => (Course.modules.find(x => x.id === id) || {}).title).filter(Boolean);
    return names.length ? el('p.chain-needs', `Works best after: ${names.join(', ')}.`) : null;
  }
  /* What a learner missed in a lesson they have opened.
     notDone: questions with no right answer yet. tricky: solved, but only after a wrong answer. */
  function missedOf(l) {
    const out = { notDone: [], tricky: [] };
    if (!Store.state.lessons[l.id]) return out;
    l.qids.forEach(qid => {
      const a = Store.answerOf(qid);
      if (!a || !(a.ok > 0)) out.notDone.push(qid);
      else if (a.tries - a.ok >= 1) out.tricky.push(qid);
    });
    return out;
  }
  function missedText(m) {
    const bits = [];
    if (m.notDone.length) bits.push(`${m.notDone.length} not answered yet`);
    if (m.tricky.length) bits.push(`${m.tricky.length} took more than one try`);
    return bits.join(', ');
  }
  function lessonRow(l, next) {
    const ma = masteryOf(l);
    const here = next && next.id === l.id;
    const missed = missedOf(l);
    const count = missed.notDone.length + missed.tricky.length;
    return el(`li.lesson-row${here ? '.here' : ''}`,
      el('a', { href: `#lesson-${l.id}` },
        el('span.lesson-ring', { html: ring(ma.level) }),
        el('span.lesson-name', { html: `<span class="lesson-num">${esc(l.num)}</span> ${rich(l.title)}` }),
        el('span.lesson-state',
          here ? el('span.tag.tag-here', 'Start here') : null,
          l.optional ? el('span.tag', 'Bonus') : null,
          count ? el('span.tag.tag-missed', { title: missedText(missed), 'aria-label': missedText(missed) }, `${count} to revisit`) : null,
          ma.due ? el('span.tag.tag-due', { html: icon('refresh', 14) + 'Refresher' }) : null,
          el('span.tag.tag-level', LEVEL_NAMES[ma.level]))));
  }

  // ------------------------------------------------------------- practice
  function practice(modId) {
    const page = el('div.page.practice-page');
    page.append(el('header.page-head', el('h1', 'Practice'),
      el('p', 'Every question from every lesson. Pick a topic. Each one has hints and a full answer.')));
    const f = root.App.practiceFilter || (root.App.practiceFilter = { level: 'all', status: 'all' });
    const sel = el('select', { id: 'pr-mod', onchange: e => { location.hash = e.target.value === 'all' ? '#practice' : `#practice-${e.target.value}`; } },
      el('option', { value: 'all' }, 'Surprise me: mixed set'),
      Course.modules.map(m => el('option', { value: m.id, selected: m.id === modId || undefined }, `${m.num}. ${m.title}`)));
    const levelSel = el('select', { id: 'pr-level', onchange: e => { f.level = e.target.value; draw(); } },
      ['all', '1', '2', '3'].map(v => el('option', { value: v, selected: f.level === v || undefined }, v === 'all' ? 'All levels' : Q.LEVELS[v])));
    const statSel = el('select', { id: 'pr-status', onchange: e => { f.status = e.target.value; draw(); } },
      el('option', { value: 'all', selected: f.status === 'all' || undefined }, 'All questions'),
      el('option', { value: 'open', selected: f.status === 'open' || undefined }, 'Not done yet'),
      el('option', { value: 'done', selected: f.status === 'done' || undefined }, 'Done'));
    page.append(el('div.filters',
      el('label', { for: 'pr-mod' }, 'Topic', sel),
      el('label', { for: 'pr-level' }, 'Level', levelSel),
      el('label', { for: 'pr-status' }, 'Show', statSel)));
    const holder = el('div.q-list');
    page.append(holder);

    function draw() {
      holder.textContent = '';
      let lessons = modId ? (Course.modules.find(m => m.id === modId) || { lessons: [] }).lessons : Object.values(Course.lessons);
      const pick = q => (f.level === 'all' || String(q.level || 1) === f.level) &&
        (f.status === 'all' || ((Store.answerOf(q.qid) || {}).ok > 0 ? f.status === 'done' : f.status === 'open'));
      if (!modId) {
        // A mixed set from topics the learner has started, or from the start of the course.
        const open = lessons.filter(l => Store.lessonState(l.id));
        const pool = (open.length ? open : lessons.slice(0, 6)).flatMap(l => (l.practice || []).filter(pick));
        const seed = Store.dayKey();
        const mix = root.UI.shuffle(pool, seed).slice(0, 5);
        holder.append(el('p.q-list-note', mix.length ? 'Here are 5 mixed questions from topics you have opened. There is a new set each day.' : 'No questions match. Try another level.'));
        mix.forEach(q => {
          const l = Course.questions[q.qid].lesson;
          holder.append(el('p.q-from', el('a', { href: `#lesson-${l.id}` }, `From lesson ${l.num}: ${plain(l.title)}`)));
          Q.render(holder, q);
        });
        return;
      }
      let count = 0;
      lessons.forEach(l => {
        const qs = (l.practice || []).filter(pick);
        if (!qs.length) return;
        holder.append(el('h2.q-group', el('a', { href: `#lesson-${l.id}` }, `${l.num} ${plain(l.title)}`)));
        qs.forEach(q => { Q.render(holder, q); count += 1; });
      });
      if (!count) holder.append(el('p.q-list-note', 'No questions match. Try another level or show all questions.'));
    }
    draw();
    return page;
  }

  // ------------------------------------------------------------- review
  function review() {
    const page = el('div.page.narrow');
    page.append(el('header.page-head', el('h1', 'Review'),
      el('p', 'Short questions that come back just as you start to forget. This is the best way to make memory last.')));
    const due = Store.dueQuestions(Course.questions);
    if (!due.list.length) {
      page.append(el('div.card.empty',
        el('h2', 'Nothing to review today'),
        el('p', Object.keys(Store.state.answers).length ? 'You are all caught up. Come back another day, or try something new.' : 'Answer some questions in a lesson first. They will come back here in a day or two.'),
        el('a.btn.btn-primary', { href: '#learn' }, 'Go to the course')));
      return page;
    }
    const total = due.list.length;
    let at = 0;
    const bar = el('div.review-bar', { role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(total), 'aria-valuenow': '0' }, el('span'));
    const label = el('p.review-label');
    const holder = el('div');
    page.append(el('div.review-top', label, bar), holder);
    const paint = () => {
      label.textContent = `Question ${Math.min(at + 1, total)} of ${total}. About ${Math.max(1, total)} minutes.`;
      bar.firstChild.style.width = `${(at / total) * 100}%`;
      bar.setAttribute('aria-valuenow', String(at));
    };
    function show() {
      holder.textContent = '';
      paint();
      if (at >= total) {
        const r = el('div.card.empty', el('h2', 'Review finished'),
          el('p', 'Each question will come back later, after a longer gap if you got it right.'),
          el('a.btn.btn-primary', { href: `#${Course.suggested() ? 'lesson-' + Course.suggested().id : 'learn'}` }, 'Back to learning'));
        holder.append(r);
        return;
      }
      const qid = due.list[at];
      const { q, lesson } = Course.questions[qid];
      holder.append(el('p.q-from', `From lesson ${lesson.num}: ${plain(lesson.title)}`));
      const nextBtn = el('button.btn.btn-primary', { type: 'button', hidden: true, onclick: () => { at += 1; show(); window.scrollTo(0, 0); } }, at === total - 1 ? 'Finish' : 'Next question');
      const skip = el('button.btn.btn-quiet', { type: 'button', onclick: () => { Store.recordAnswer(qid, { ok: false, reviewable: true }); at += 1; show(); } }, 'I do not remember');
      Q.render(holder, q, {
        fresh: true,
        mode: 'review',
        onDone: () => { nextBtn.hidden = false; skip.hidden = true; nextBtn.focus({ preventScroll: true }); },
        onSaw: () => { nextBtn.hidden = false; skip.hidden = true; },
      });
      holder.append(el('div.review-actions', skip, nextBtn));
    }
    show();
    return page;
  }

  // ------------------------------------------------------------- progress
  function progress() {
    const s = Store.state;
    const page = el('div.page.progress');
    const r = Store.rhythm();
    const days = Store.daysStudied();
    const next = Course.suggested();
    const doneCount = Object.values(s.lessons).filter(l => l.status === 'done').length;
    const totalLessons = Course.order.length;
    const solved = Object.values(s.answers).filter(a => a.ok > 0).length;

    const nameInput = el('input', {
      id: 'nick', type: 'text', maxlength: '24', value: s.name || '', placeholder: 'Add a nickname (optional)', 'aria-label': 'Your nickname. It stays on this device.',
      onchange: e => { s.name = e.target.value.trim(); Store.save(); render(); },
    });
    page.append(el('header.page-head.progress-head',
      el('div',
        el('h1', s.name ? `Hi ${s.name}` : 'Your progress'),
        el('p', 'This is yours. It stays on this device. Nobody else can see it.')),
      next ? el('a.btn.btn-primary', { href: `#lesson-${next.id}`, html: `<span>Continue lesson ${esc(next.num)}</span>` + icon('arrow', 18) }) : null));

    if (!Store.storageOk) {
      page.append(el('p.banner', 'This browser is blocking saved data, so your progress will be lost when you close the page. Try a normal window, not a private one.'));
    }
    // Backup nudge.
    const today = Store.dayKey();
    const lastBackup = s.backup.last;
    const needBackup = days.length >= 3 && (!lastBackup || Store.addDays(lastBackup, 7) <= today) && (!s.backup.snoozed || s.backup.snoozed <= today);
    if (needBackup) {
      const banner = el('div.banner', el('p', 'Save a copy of your progress? Browsers can clear saved data, and some do it after a week away.'),
        el('div.banner-actions',
          el('button.btn.btn-primary', { type: 'button', onclick: () => { doExport(); banner.remove(); } }, 'Download my progress'),
          el('button.btn.btn-quiet', { type: 'button', onclick: () => { s.backup.snoozed = Store.addDays(today, 14); Store.save(); banner.remove(); } }, 'Not now')));
      page.append(banner);
    }

    const grid = el('div.dash');
    page.append(grid);

    // ---- Weekly rhythm
    const goalSel = el('select', {
      id: 'goal-days',
      onchange: e => { s.goals.weekDays = Number(e.target.value); Store.save(); render(); },
    }, [1, 2, 3, 4, 5, 6, 7].map(n => el('option', { value: n, selected: s.goals.weekDays === n || undefined }, n === 1 ? '1 day' : `${n} days`)));
    const runLine = r.run > 0
      ? `${r.run} ${r.run === 1 ? 'week' : 'weeks'} in a row at your goal.`
      : r.lastRun > 0 ? `Your last run was ${r.lastRun} ${r.lastRun === 1 ? 'week' : 'weeks'}. You can start a new run any time.` : 'Meet your goal this week to start a run.';
    grid.append(el('section.card.dash-rhythm', { 'aria-labelledby': 'h-rhythm' },
      el('h2', { id: 'h-rhythm' }, 'Your week'),
      weekDots(),
      el('p.big-line', `${r.thisWeek} of ${r.goal} study days`),
      el('p', r.thisWeek >= r.goal ? 'You met your goal. Rest is part of learning.' : 'Any days count. They do not have to be in a row.'),
      el('p.muted', runLine),
      el('label.inline-field', { for: 'goal-days' }, 'My goal each week', goalSel)));

    // ---- Totals that only go up.
    const stat = (n, label) => el('div.stat', el('span.stat-n', String(n)), el('span.stat-l', label));
    const totalMins = Object.values(s.days).reduce((a, d) => a + (d.mins || 0), 0);
    grid.append(el('section.card.dash-totals', { 'aria-labelledby': 'h-tot' },
      el('h2', { id: 'h-tot' }, 'So far'),
      el('div.stats',
        stat(`${doneCount}/${totalLessons}`, 'lessons finished'),
        stat(solved, 'questions solved'),
        stat(days.length, 'study days in total'),
        stat(Store.longestDayRun(), 'longest run of days'),
        stat(fmtMins(totalMins), 'time learning'),
        stat(Math.max(r.best, 0), 'best run of weeks')),
      el('p.muted', 'These numbers only go up. Missing a day never takes anything away.')));

    // ---- Heatmap
    grid.append(heatmapCard());

    // ---- Time this week
    grid.append(timeCard());

    // ---- What you missed: questions skipped or answered wrong, lesson by lesson
    const missedRows = Course.order.map(id => Course.lessons[id])
      .map(l => ({ l, m: missedOf(l) }))
      .filter(x => x.m.notDone.length || x.m.tricky.length);
    const missedTotal = missedRows.reduce((n, x) => n + x.m.notDone.length + x.m.tricky.length, 0);
    grid.append(el('section.card.dash-tricky', { 'aria-labelledby': 'h-tricky' },
      el('h2', { id: 'h-tricky' }, 'What you missed'),
      missedRows.length
        ? [el('p.muted', `${missedTotal} questions in ${missedRows.length} ${missedRows.length === 1 ? 'lesson' : 'lessons'}. Open a lesson to try them again.`),
          el('ul.missed-list', missedRows.slice(0, 12).map(({ l, m }) => el('li',
            el('a', { href: `#lesson-${l.id}` }, `${l.num} ${plain(l.title)}`),
            el('span.muted', missedText(m)),
            m.notDone.length ? el('details.missed-qs', el('summary', 'Which questions?'),
              el('ul', m.notDone.slice(0, 8).map(qid => {
                const { q } = Course.questions[qid];
                return el('li', `${Q.KINDS[q.type]}${q.q ? ': ' + plain(q.q).slice(0, 80) : ''}`);
              }))) : null))),
          missedRows.length > 12 ? el('p.muted', `And ${missedRows.length - 12} more lessons.`) : null]
        : el('p.muted', Object.keys(s.lessons).length
          ? 'Nothing missed. Every question in the lessons you opened has a right answer, first try.'
          : 'Questions you skip, or get wrong first, will show up here. Everyone misses some.')));

    // ---- Saved and notes
    const savedList = s.saved.filter(id => Course.lessons[id]);
    const noteIds = Object.keys(s.notes).filter(id => Course.lessons[id]);
    grid.append(el('section.card.dash-notes', { 'aria-labelledby': 'h-notes' },
      el('h2', { id: 'h-notes' }, 'Saved lessons and notes'),
      savedList.length ? el('ul.linklist', savedList.map(id => el('li', el('a', { href: `#lesson-${id}` }, `${Course.lessons[id].num} ${plain(Course.lessons[id].title)}`)))) : el('p.muted', 'Press Save on any lesson to keep it here.'),
      noteIds.length ? el('ul.notelist', noteIds.map(id => el('li', el('a', { href: `#lesson-${id}` }, `${Course.lessons[id].num} ${plain(Course.lessons[id].title)}`), el('p', s.notes[id])))) : el('p.muted', 'Press Note on any lesson to write something for yourself.')));

    // ---- Mastery map
    const q = el('section.card.dash-mastery', { 'aria-labelledby': 'h-mastery' },
      el('h2', { id: 'h-mastery' }, 'What you know'),
      el('details.help', el('summary', 'What do the rings mean?'),
        el('ul',
          el('li', el('strong', 'Practising: '), 'you have opened the lesson.'),
          el('li', el('strong', 'Solid: '), 'you finished it and got most of its questions right.'),
          el('li', el('strong', 'Mastered: '), 'you still got questions right when they came back on later days.'),
          el('li', el('strong', 'Refresher: '), 'a quick review will help this stick. You have not lost anything.'))),
      el('div.mastery-list', Course.modules.map(m => {
        const rows = m.lessons.map(l => ({ l, ma: masteryOf(l) }));
        const strong = rows.filter(x => x.ma.level === 'solid' || x.ma.level === 'mastered').length;
        return el('details.mastery-mod',
          el('summary',
            el('span.mastery-name', `${m.num}. ${m.title}`),
            el('span.mastery-bar', { 'aria-hidden': 'true' }, rows.map(x => el(`span.mseg.lv-${x.ma.level}`))),
            el('span.mastery-count', `${strong} of ${rows.length} solid`)),
          el('ul.mastery-lessons', rows.map(x => el('li',
            el('a', { href: `#lesson-${x.l.id}`, html: ring(x.ma.level, 20) + `<span>${esc(x.l.num)} ${rich(x.l.title)}</span>` }),
            el('span.tag.tag-level', LEVEL_NAMES[x.ma.level]),
            x.ma.due ? el('span.tag.tag-due', { html: icon('refresh', 14) + 'Refresher' }) : null))));
      })));
    grid.append(q);

    // ---- Your data
    grid.append(dataCard(nameInput));
    return page;

    function render() { root.App.route(); }
  }

  function fmtMins(m) {
    if (m < 60) return `${m} min`;
    return `${Math.floor(m / 60)} h ${m % 60} min`;
  }

  /* Activity heatmap: one hue, light to dark. Each cell is a button so it works by keyboard. */
  function heatmapCard() {
    const s = Store.state;
    const WEEKS = 16;
    const nowStart = Store.weekStart(Store.dayKey());
    const start = Store.addDays(nowStart, -7 * (WEEKS - 1));
    const stepOf = a => (a <= 0 ? 0 : a <= 2 ? 1 : a <= 5 ? 2 : a <= 10 ? 3 : 4);
    const read = el('p.heat-read', { role: 'status' }, 'Choose a square to see that day.');
    const grid = el('div.heat', { role: 'group', 'aria-label': `Activity for the last ${WEEKS} weeks` });
    const today = Store.dayKey();
    const rows = [];
    for (let w = 0; w < WEEKS; w++) {
      const col = el('div.heat-col');
      for (let d = 0; d < 7; d++) {
        const key = Store.addDays(start, w * 7 + d);
        if (key > today) { col.append(el('span.heat-cell.future')); continue; }
        const v = s.days[key] || { mins: 0, acts: 0, lessons: 0, qs: 0 };
        const many = (n, word) => `${n || 0} ${word}${n === 1 ? '' : 's'}`;
        const txt = `${Store.parseDay(key).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}: ${many(v.lessons, 'lesson')}, ${many(v.qs, 'question')}, ${v.mins || 0} min`;
        if (v.acts || v.mins) rows.push([key, v]);
        col.append(el(`button.heat-cell.h${stepOf(v.acts)}`, { type: 'button', 'aria-label': txt, title: txt, onclick: () => { read.textContent = txt; } }));
      }
      grid.append(col);
    }
    // On a phone the grid scrolls sideways. Start at the newest weeks, not the oldest.
    const wrap = el('div.heat-wrap', grid);
    setTimeout(() => { wrap.scrollLeft = wrap.scrollWidth; }, 0);
    const table = el('details.help', el('summary', 'See this as a list'),
      rows.length
        ? el('div.table-wrap', el('table.data', el('thead', el('tr', ['Day', 'Lessons', 'Questions', 'Minutes'].map(h => el('th', { scope: 'col', text: h })))),
          el('tbody', rows.slice(-30).reverse().map(([k, v]) => el('tr', el('td', k), el('td', String(v.lessons || 0)), el('td', String(v.qs || 0)), el('td', String(v.mins || 0)))))))
        : el('p.muted', 'No study days yet.'));
    return el('section.card.dash-heat', { 'aria-labelledby': 'h-heat' },
      el('h2', { id: 'h-heat' }, 'When you studied'),
      wrap,
      el('div.heat-legend', { 'aria-hidden': 'true' }, 'Less', [0, 1, 2, 3, 4].map(n => el(`span.heat-cell.h${n}`)), 'More'),
      read, table);
  }

  /* Bars for one series, so no legend. Height comes from one scale with labelled values. */
  function timeCard() {
    const days = Store.week();
    const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const max = Math.max(10, ...days.map(d => d.mins));
    const today = Store.dayKey();
    return el('section.card.dash-time', { 'aria-labelledby': 'h-time' },
      el('h2', { id: 'h-time' }, 'Time this week'),
      el('ul.bars', days.map((d, i) => el(`li.bar-col${d.key === today ? '.today' : ''}`, { title: `${names[i]}: ${d.mins} minutes` },
        el('span.bar-val', d.mins ? String(d.mins) : ''),
        el('span.bar-track', { 'aria-hidden': 'true' }, el('span.bar-fill', { style: `height:${(d.mins / max) * 100}%` })),
        el('span.bar-name', { 'aria-label': `${names[i]}: ${d.mins} minutes` }, names[i])))),
      el('p.muted', 'Minutes on the page while you are active. More time is not the goal. Understanding is.'));
  }

  function doExport() {
    const text = Store.exportData();
    const blob = new Blob([text], { type: 'application/json' });
    const a = el('a', { href: URL.createObjectURL(blob), download: `stepwise-progress-${Store.dayKey()}.json` });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  function dataCard(nameInput) {
    const s = Store.state;
    const status = el('p.muted', { role: 'status' }, s.backup.last ? `Last saved copy: ${s.backup.last}.` : 'You have not saved a copy yet.');
    const summary = el('div.import-sum', { hidden: true });
    const file = el('input', {
      id: 'import-file', type: 'file', accept: 'application/json,.json',
      onchange: async e => {
        const f = e.target.files[0];
        if (!f) return;
        summary.textContent = '';
        summary.hidden = false;
        try {
          if (f.size > 5 * 1024 * 1024) throw new Error('This file is too big to be a Stepwise backup.');
          const data = Store.parseImport(await f.text());
          const sum = Store.summarize(data);
          summary.append(
            el('p', `This file has: study days ${sum.days}, finished lessons ${sum.lessons}, questions ${sum.questions}, notes ${sum.notes}.`),
            el('div.banner-actions',
              el('button.btn.btn-primary', { type: 'button', onclick: () => { Store.importData(data, 'merge'); root.App.applyPrefs(); root.App.route(); } }, 'Add it to what I have'),
              el('button.btn.btn-quiet', { type: 'button', onclick: () => { doExport(); Store.importData(data, 'replace'); root.App.applyPrefs(); root.App.route(); } }, 'Replace what I have')),
            el('p.muted', 'Replace downloads a copy of your current progress first.'));
        } catch (err) {
          summary.append(el('p.err-inline', err.message));
        }
      },
    });
    return el('section.card.dash-data', { 'aria-labelledby': 'h-data' },
      el('h2', { id: 'h-data' }, 'Keep your progress safe'),
      el('p', 'Your progress lives only in this browser. Download a copy now and then. You can load it on another computer too.'),
      el('div.data-actions',
        el('button.btn.btn-primary', { type: 'button', html: icon('download', 18) + '<span>Download my progress</span>', onclick: () => { doExport(); status.textContent = `Last saved copy: ${Store.state.backup.last}.`; } }),
        el('label.btn.btn-quiet.file-btn', { for: 'import-file', html: icon('upload', 18) + '<span>Load a saved copy</span>' }), file),
      summary, status,
      el('label.inline-field', { for: 'nick' }, 'Nickname', nameInput));
  }

  // ------------------------------------------------------------- glossary
  function glossary() {
    const page = el('div.page.narrow');
    page.append(el('header.page-head', el('h1', 'Word list'), el('p', 'Every technical word in the course, in plain words.')));
    const list = el('dl.glossary');
    const items = [...new Set(Object.values(Course.glossary))].sort((a, b) => a.word.localeCompare(b.word));
    const filter = el('input', { id: 'gl-filter', type: 'search', placeholder: 'Find a word', 'aria-label': 'Find a word', oninput: draw });
    const counter = el('p.muted', { role: 'status' });
    page.append(filter, counter, list);
    function draw() {
      const f = filter.value.trim().toLowerCase();
      list.textContent = '';
      const rows = items.filter(i => !f || i.word.toLowerCase().includes(f) || i.means.toLowerCase().includes(f));
      counter.textContent = `${rows.length} words`;
      rows.forEach(i => {
        list.append(el('div.gl-row', el('dt', i.word, i.say ? el('span.say', ` say: ${i.say}`) : null), el('dd', { html: rich(i.means) })));
      });
    }
    draw();
    return page;
  }

  // ------------------------------------------------------------- playground
  function playground() {
    const page = el('div.page.narrow');
    page.append(el('header.page-head', el('h1', 'Playground'), el('p', 'Your own space for trying things. Write any Python and press Run. Your code is saved on this device.')));
    Q.codeBlock(page, {
      key: 'playground',
      code: '# Try anything here!\nname = "friend"\n\nfor i in range(3):\n    print("Hello,", name, i)\n',
      label: 'Playground code. Press Escape, then Tab, to leave the editor.',
    });
    page.append(el('p.muted.tip-line', 'Press Ctrl + Enter to run. Press Escape, then Tab, to move out of the editor with the keyboard.'));
    return page;
  }

  // ------------------------------------------------------------- settings
  function prefs() {
    const s = Store.state;
    const page = el('div.page.narrow');
    page.append(el('header.page-head', el('h1', 'Settings'), el('p', 'Changes save straight away. Everything stays on this device.')));
    const seg = (id, label, key, opts) => el('fieldset.seg', el('legend', label),
      opts.map(([v, text]) => el('label', el('input', {
        type: 'radio', name: id, value: v, checked: s.prefs[key] === v || undefined,
        onchange: () => { s.prefs[key] = v; Store.save(); root.App.applyPrefs(); },
      }), el('span', text))));
    const hints = el('input', { type: 'checkbox', id: 'hide-hints', checked: s.prefs.hideHints || undefined, onchange: e => { s.prefs.hideHints = e.target.checked; Store.save(); } });
    page.append(
      el('section.settings',
        el('h2', 'How it looks'),
        seg('theme', 'Theme', 'theme', [['system', 'Match my device'], ['light', 'Light'], ['dark', 'Dark']]),
        seg('size', 'Text size', 'size', [['100', 'Normal'], ['115', 'Bigger'], ['130', 'Big'], ['150', 'Very big']]),
        seg('spacing', 'Space between letters and lines', 'spacing', [['normal', 'Normal'], ['roomy', 'Roomy']])),
      el('section.settings',
        el('h2', 'Movement'),
        seg('motion', 'Moving pictures', 'motion', [['auto', 'Match my device'], ['on', 'Smooth'], ['off', 'No movement']]),
        el('p.muted', 'No movement changes each step straight away, with no sliding.')),
      el('section.settings',
        el('h2', 'Practice'),
        el('label.check-row', { for: 'hide-hints' }, hints, el('span', 'Hide the hint buttons. Good once you feel confident.'))),
      el('section.settings',
        el('h2', 'Your data'),
        el('p', 'To save or load your progress, go to ', el('a', { href: '#progress' }, 'Progress'), '.'),
        wipeBox()));
    return page;
  }
  function wipeBox() {
    const input = el('input', { id: 'wipe-word', type: 'text', autocomplete: 'off', oninput: e => { go.disabled = e.target.value.trim().toUpperCase() !== 'DELETE'; } });
    const go = el('button.btn.btn-danger', { type: 'button', disabled: true, onclick: () => { Store.wipe(); root.App.applyPrefs(); location.hash = '#home'; root.App.route(); } }, 'Delete everything');
    return el('details.help', el('summary', 'Delete all my progress'),
      el('p', 'This removes your lessons, answers, notes and code from this browser. It cannot be undone. Type DELETE to confirm.'),
      el('label', { for: 'wipe-word' }, 'Type DELETE'), input, go);
  }

  // ------------------------------------------------------------- about
  function about() {
    const page = el('div.page.narrow');
    page.append(el('header.page-head', el('h1', 'About this course')),
      el('p', 'Stepwise teaches Python first, then data structures and algorithms. It has no accounts, no ads and no tracking.'),
      el('h2', 'Why it works this way'),
      el('ul.step-list',
        el('li', el('strong', 'You control every animation.'), ' Studies show that watching alone teaches little. Guessing and changing the input is what helps.'),
        el('li', el('strong', 'Questions come back.'), ' Trying to remember after a gap is one of the best tested ways to learn.'),
        el('li', el('strong', 'You read before you write.'), ' Reading code, ordering lines and fixing bugs prepare you to write your own.'),
        el('li', el('strong', 'No streak to lose.'), ' Fear of losing a number can push children to do easy work. Your totals here only go up.')),
      el('h2', 'Sources we used'),
      el('p', 'The order of topics draws on roadmap.sh, NeetCode, Hello Algo, Grokking Algorithms, MIT 6.006, Princeton Algorithms and CS50P. The speed facts come from the Python documentation. The teaching methods come from research by Hundhausen, Naps, Ericson, Sentance, Dunlosky and others. The research notes are in the docs folder.'),
      el('h2', 'How your code runs'),
      el('p', `Your Python runs inside your own browser using Pyodide ${Py.VERSION}, which is Python 3.13. Your code is never sent anywhere. Python comes from the internet if you open this page straight from a file. If you run the course from a local server, it works with no internet at all.`));
    return page;
  }

  // ------------------------------------------------------------- more menu (phone)
  function more() {
    const page = el('div.page.narrow');
    page.append(el('header.page-head', el('h1', 'More')));
    const row = (href, ic, title, sub) => el('a.card.more-row', { href, html: icon(ic, 24) + `<span><strong>${title}</strong><br><span class="muted">${sub}</span></span>` });
    page.append(el('div.more-list',
      row('#glossary', 'book', 'Word list', 'Every technical word in plain words.'),
      row('#playground', 'practice', 'Playground', 'Write and run your own Python.'),
      row('#prefs', 'gear', 'Settings', 'Theme, text size and movement.'),
      row('#about', 'hint', 'About', 'How this course was made.')));
    return page;
  }

  // ------------------------------------------------------------- search
  let index = null;
  /* All the readable words in a block, whatever its shape. */
  function blockWords(b) {
    const out = [b.text, b.think, b.real, b.title, b.code, b.caption, b.q];
    (b.items || []).forEach(i => (typeof i === 'string' ? out.push(i) : out.push(i.label, i.text, i.code, i.word, i.means, i.op, i.why)));
    (b.head || []).forEach(h => out.push(h));
    (b.rows || []).forEach(r => r.forEach(c => out.push(c)));
    return out.filter(x => x != null).join(' ');
  }
  function buildIndex() {
    index = [];
    Course.modules.forEach(m => {
      index.push({ kind: 'Topic', title: `${m.num}. ${m.title}`, text: m.blurb || '', href: `#module-${m.id}` });
      m.lessons.forEach(l => {
        const words = (l.steps || []).map(blockWords).join(' ');
        index.push({ kind: 'Lesson', title: `${l.num} ${plain(l.title)}`, text: `${l.goal} ${words}`, href: `#lesson-${l.id}` });
      });
    });
    new Set(Object.values(Course.glossary)).forEach(g => index.push({ kind: 'Word', title: g.word, text: g.means, href: '#glossary' }));
  }
  function searchRun(q) {
    if (!index) buildIndex();
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    const scored = [];
    const notes = Store.state.notes;
    const rows = index.concat(Object.keys(notes).filter(id => Course.lessons[id]).map(id => ({ kind: 'My note', title: `${Course.lessons[id].num} ${plain(Course.lessons[id].title)}`, text: notes[id], href: `#lesson-${id}` })));
    rows.forEach(r => {
      const t = r.title.toLowerCase(), x = r.text.toLowerCase();
      let score = 0;
      for (const term of terms) {
        const inT = t.includes(term), inX = x.includes(term);
        if (!inT && !inX) { score = 0; break; }
        score += (inT ? 10 : 0) + (inX ? 1 : 0);
      }
      if (score) scored.push({ r, score });
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 20).map(s => s.r);
  }
  function snippet(text, term) {
    const clean = plain(text).replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, '$1');
    const at = clean.toLowerCase().indexOf(term);
    if (at < 0) return clean.slice(0, 90);
    const start = Math.max(0, at - 30);
    return (start ? '...' : '') + clean.slice(start, start + 100) + '...';
  }

  root.Views = { home, map, practice, review, progress, glossary, playground, prefs, about, more, searchRun, snippet, ring };
})(typeof window !== 'undefined' ? window : globalThis);
