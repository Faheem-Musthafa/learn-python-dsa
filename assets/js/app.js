/* App: the page frame, routes, search box and word pop-ups. */
(function (root) {
  'use strict';
  const { el, icon, rich, esc } = root.UI;
  const { Store, Course, Views, Lesson } = root;
  const main = () => document.getElementById('main');

  const NAV = [
    ['learn', 'Learn', 'learn'],
    ['practice', 'Practice', 'practice'],
    ['review', 'Review', 'review'],
    ['progress', 'Progress', 'progress'],
    ['more', 'More', 'more'],
  ];

  function shell() {
    const top = document.getElementById('topbar');
    const moreLinks = [['glossary', 'Word list'], ['playground', 'Playground'], ['prefs', 'Settings']];
    top.append(
      el('a.logo', { href: '#home', 'aria-label': 'Stepwise home', html: logoMark() + '<span>Stepwise</span>' }),
      el('nav.topnav', { 'aria-label': 'Main' },
        NAV.filter(n => n[0] !== 'more').map(n => el('a', { href: `#${n[0]}`, 'data-nav': n[0] }, n[1], n[0] === 'review' ? el('span.nav-badge', { hidden: true }) : null)),
        moreLinks.map(n => el('a.topnav-minor', { href: `#${n[0]}`, 'data-nav': n[0] }, n[1]))),
      el('button.btn-search', { type: 'button', 'aria-label': 'Search the course', title: 'Search (Ctrl + K)', html: icon('search', 20) + '<span>Search</span>', onclick: openSearch }));
    const bottom = document.getElementById('bottombar');
    bottom.append(...NAV.map(n => el('a', { href: `#${n[0]}`, 'data-nav': n[0], html: icon(n[2], 22) + `<span>${n[1]}</span>` })));
    document.addEventListener('click', onTermClick);
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); }
      if (e.key === 'Escape') closePop();
    });
    Store.onChange(updateBadge);
  }
  function logoMark() {
    // Three stairs: the name of the course as a shape.
    return '<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><rect x="2" y="20" width="9" height="10" rx="2" class="lg-a"/><rect x="11.500" y="12" width="9" height="18" rx="2" class="lg-b"/><rect x="21" y="3" width="9" height="27" rx="2" class="lg-c"/></svg>';
  }
  function updateBadge() {
    const n = Math.min(Store.dueQuestions(Course.questions).total, Store.DAILY_CAP);
    document.querySelectorAll('.nav-badge').forEach(b => { b.hidden = !n; b.textContent = n; });
  }

  // ------------------------------------------------------------------ router
  let routed = false;
  function route() {
    const hash = (location.hash || '#home').slice(1);
    const m = main();
    closePop();
    let view, active = hash, title = 'Stepwise';
    try {
      if (hash === 'home' || !hash) { view = Views.home(); active = 'home'; }
      else if (hash === 'learn') { view = Views.map(); title = 'Course map'; }
      else if (hash.startsWith('module-')) {
        view = Views.map();
        active = 'learn';
        title = 'Course map';
        const id = hash.slice(7);
        setTimeout(() => {
          const node = document.getElementById(`mod-${id}`);
          if (node) {
            const d = node.querySelector('details');
            if (d) d.open = true;
            node.scrollIntoView({ block: 'start' });
          }
        }, 0);
      } else if (hash.startsWith('lesson-')) {
        const id = hash.slice(7);
        view = Lesson.render(id);
        active = 'learn';
        title = Course.lessons[id] ? Course.lessons[id].title.replace(/[`*]/g, '') : 'Lesson';
      } else if (hash === 'practice' || hash.startsWith('practice-')) {
        view = Views.practice(hash.startsWith('practice-') ? hash.slice(9) : null);
        active = 'practice';
        title = 'Practice';
      } else if (Views[hash] && ['review', 'progress', 'glossary', 'playground', 'prefs', 'about', 'more'].includes(hash)) {
        view = Views[hash]();
        title = { review: 'Review', progress: 'Your progress', glossary: 'Word list', playground: 'Playground', prefs: 'Settings', about: 'About', more: 'More' }[hash];
        if (['glossary', 'playground', 'prefs', 'about'].includes(hash)) active = hash;
      } else {
        view = el('div.page', el('h1', 'That page is not here'), el('p', el('a', { href: '#home' }, 'Go to the start')));
      }
    } catch (err) {
      console.error(err);
      view = el('div.page', el('h1', 'This page had a problem'), el('p', 'Your progress is safe. Try going back to the course map.'), el('p', el('a.btn.btn-primary', { href: '#learn' }, 'Go to the course')), el('pre.err-line', String(err)));
    }
    m.replaceChildren(view);
    document.title = title === 'Stepwise' ? 'Stepwise' : `${title} | Stepwise`;
    if (!hash.startsWith('module-')) window.scrollTo(0, 0);
    document.querySelectorAll('[data-nav]').forEach(a => {
      const on = a.dataset.nav === active || (a.dataset.nav === 'more' && ['glossary', 'playground', 'prefs', 'about'].includes(active));
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    updateBadge();
    // On first load the keyboard starts at the top of the page, so the skip link comes first.
    if (routed) m.focus({ preventScroll: true });
    routed = true;
  }

  // ------------------------------------------------------------------- prefs
  function applyPrefs() {
    const p = Store.state.prefs, r = document.documentElement;
    if (p.theme === 'system') r.removeAttribute('data-theme'); else r.dataset.theme = p.theme;
    r.dataset.size = p.size;
    r.dataset.spacing = p.spacing;
    r.dataset.motion = p.motion === 'auto' ? '' : p.motion;
  }

  // -------------------------------------------------------------- word popup
  let pop = null;
  function closePop() {
    if (!pop) return;
    const back = pop._from;
    pop.remove();
    pop = null;
    if (back && back.isConnected) back.focus({ preventScroll: true });
  }
  function onTermClick(e) {
    const t = e.target.closest && e.target.closest('.term');
    if (!t) {
      if (pop && !pop.contains(e.target)) closePop();
      return;
    }
    closePop();
    const g = Course.glossary[t.dataset.term];
    const body = g
      ? [el('strong', g.word), g.say ? el('span.say', ` say: ${g.say}`) : null, el('p', { html: rich(g.means) })]
      : [el('p', 'This word is not in the word list yet.')];
    pop = el('div.word-pop', { role: 'dialog', 'aria-label': `Meaning of ${t.textContent}`, tabindex: '-1' }, ...body,
      el('a', { href: '#glossary' }, 'See the word list'));
    pop._from = t;
    document.body.append(pop);
    const r = t.getBoundingClientRect();
    const w = pop.offsetWidth;
    pop.style.left = `${Math.max(12, Math.min(window.scrollX + r.left, window.scrollX + document.documentElement.clientWidth - w - 12))}px`;
    pop.style.top = `${window.scrollY + r.bottom + 8}px`;
    pop.focus({ preventScroll: true });
  }

  // ------------------------------------------------------------------ search
  function openSearch() {
    if (document.querySelector('.search-sheet')) return;
    const back = document.activeElement;
    const input = el('input', { type: 'search', id: 'search-box', placeholder: 'Try: loop, stack, binary search', autocomplete: 'off', 'aria-label': 'Search the course' });
    const results = el('ul.search-results');
    const status = el('p.muted.search-status', { role: 'status' }, 'Search lessons, topics, words and your own notes.');
    const close = () => { sheet.remove(); if (back && back.focus) back.focus({ preventScroll: true }); };
    const sheet = el('div.search-sheet', {
      role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Search',
      onclick: e => { if (e.target === sheet) close(); },
      onkeydown: e => {
        if (e.key === 'Escape') { e.stopPropagation(); close(); }
        if (e.key === 'Tab') {
          // Keeps Tab inside the search box and its results while it is open.
          const items = sheet.querySelectorAll('input, button, a[href]');
          const first = items[0], last = items[items.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      },
    }, el('div.search-box', el('div.search-row', { html: icon('search', 22) }, input,
      el('button.btn.btn-quiet', { type: 'button', onclick: close }, 'Close')), status, results));
    input.addEventListener('input', () => {
      const q = input.value.trim();
      results.textContent = '';
      if (!q) { status.textContent = 'Search lessons, topics, words and your own notes.'; return; }
      const found = Views.searchRun(q);
      status.textContent = found.length ? `${found.length} results` : 'Nothing found. Try the word list, or a shorter word.';
      const first = q.toLowerCase().split(/\s+/)[0];
      found.forEach(r => results.append(el('li', el('a', { href: r.href, onclick: () => setTimeout(close, 0) },
        el('span.search-kind', r.kind), el('strong', r.title), el('span.search-snip', Views.snippet(r.text, first))))));
    });
    document.body.append(sheet);
    input.focus();
  }

  // ---------------------------------------------------------------- start up
  /* Content files come from a list, and are added in order. */
  function loadContent(files) {
    return new Promise(resolve => {
      let left = files.length;
      if (!left) resolve();
      const failed = [];
      files.forEach(f => {
        const s = document.createElement('script');
        s.src = f;
        s.async = false;
        s.onload = s.onerror = e => {
          if (e.type === 'error') failed.push(f);
          left -= 1;
          if (!left) { if (failed.length) console.error('Could not load', failed); resolve(); }
        };
        document.body.appendChild(s);
      });
    });
  }

  async function start() {
    Store.load();
    applyPrefs();
    await loadContent(root.CONTENT_FILES || []);
    Course.finish();
    shell();
    Store.trackTime();
    if (Object.keys(Store.state.lessons).length) Store.askToPersist();
    root.addEventListener('hashchange', route);
    route();
    const loading = document.getElementById('boot');
    if (loading) loading.remove();
  }

  root.App = { route, applyPrefs, practiceFilter: null, refreshRail: () => {} };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})(typeof window !== 'undefined' ? window : globalThis);
