/* Course: where every content file registers itself, plus small shared helpers. */
(function (root) {
  'use strict';

  const PARTS = {
    1: { title: 'Learn Python', about: 'Start here, even if you have never written code.' },
    2: { title: 'First data structures and algorithms', about: 'Learn to count steps and pick the right tool.' },
    3: { title: 'Trees, graphs and clever ideas', about: 'Solve bigger problems with stronger tools.' },
    4: { title: 'Advanced', about: 'The ideas that strong programmers use every week.' },
  };

  const Course = {
    PARTS,
    modules: [],
    glossary: {},    // lower-case word: {word, means, say}
    lessons: {},     // lessonId: lesson, with .module set
    questions: {},   // qid: {q, lesson}
    order: [],       // Lesson ids in course order.

    /* Called by each content file. */
    module(m) { m.lessons = m.lessons || []; this.modules.push(m); },
    lesson(moduleId, l) {
      const m = this.modules.find(x => x.id === moduleId);
      if (!m) throw new Error('No module called ' + moduleId + ' for lesson ' + l.id);
      m.lessons.push(l);
    },
    term(word, means, say) {
      const k = word.toLowerCase();
      if (!this.glossary[k]) this.glossary[k] = { word, means, say: say || '' };
    },
    /* Links everything together once all the files have loaded. */
    finish() {
      this.modules.sort((a, b) => a.num - b.num);
      this.order = [];
      const lessonNo = n => String(n).split('.').map(Number);
      for (const m of this.modules) {
        m.lessons.sort((a, b) => lessonNo(a.num)[1] - lessonNo(b.num)[1]);
        for (const l of m.lessons) {
          l.module = m;
          this.lessons[l.id] = l;
          this.order.push(l.id);
          l.qids = [];
          const add = q => {
            const qid = `${l.id}/${q.id}`;
            q.qid = qid;
            this.questions[qid] = { q, lesson: l };
            l.qids.push(qid);
          };
          (l.steps || []).forEach(s => {
            if (s.t === 'q') add(s);
            if (s.t === 'words') s.items.forEach(w => this.term(w.word, w.means, w.say));
          });
          (l.practice || []).forEach(add);
        }
      }
    },
    next(id) { const i = this.order.indexOf(id); return i >= 0 && i < this.order.length - 1 ? this.lessons[this.order[i + 1]] : null; },
    prev(id) { const i = this.order.indexOf(id); return i > 0 ? this.lessons[this.order[i - 1]] : null; },
    /* The one lesson we suggest next. Nothing is ever locked. */
    suggested() {
      const s = root.Store.state;
      if (s.lastLesson && this.lessons[s.lastLesson] && (s.lessons[s.lastLesson] || {}).status !== 'done') return this.lessons[s.lastLesson];
      if (s.lastLesson && this.lessons[s.lastLesson]) {
        let n = this.next(s.lastLesson);
        while (n) {
          if ((s.lessons[n.id] || {}).status !== 'done' && !n.optional) return n;
          n = this.next(n.id);
        }
      }
      for (const id of this.order) if ((s.lessons[id] || {}).status !== 'done' && !this.lessons[id].optional) return this.lessons[id];
      return null;
    },
  };

  /* Tag for code in content files: keeps backslashes and removes the shared indent. */
  root.py = function (strings, ...vals) {
    let t = String.raw({ raw: strings.raw }, ...vals);
    t = t.replace(/^[ \t]*\n/, '').replace(/\s+$/, '');
    const lines = t.split('\n');
    const pad = lines.filter(l => l.trim()).reduce((a, l) => Math.min(a, /^ */.exec(l)[0].length), 1e9);
    return lines.map(l => l.slice(pad === 1e9 ? 0 : pad)).join('\n');
  };

  // ----------------------------------------------------------------- UI bits
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  /* Lesson text is plain words with three marks: `code`, **bold**, and [[term]]
     or [[shown words|term]], which links to the glossary. */
  function rich(text) {
    const parts = String(text).split(/(`[^`]+`)/g);
    return parts.map(p => {
      if (p.length > 1 && p[0] === '`' && p[p.length - 1] === '`') return `<code>${esc(p.slice(1, -1))}</code>`;
      let s = esc(p);
      s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      s = s.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, a, b) => {
        const key = (b || a).toLowerCase();
        return `<button type="button" class="term" data-term="${esc(key)}">${a}</button>`;
      });
      return s;
    }).join('');
  }

  /* el('div.card', {onclick: f}, child, 'text') */
  function el(spec, attrs, ...kids) {
    const [tag, ...cls] = spec.split('.');
    const e = document.createElement(tag || 'div');
    if (cls.length) e.className = cls.join(' ');
    if (attrs && (attrs instanceof Node || typeof attrs !== 'object' || Array.isArray(attrs))) { kids.unshift(attrs); attrs = null; }
    for (const k in attrs || {}) {
      const v = attrs[k];
      if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'text') e.textContent = v;
      else if (v === true) e.setAttribute(k, '');
      else if (v !== false && v != null) e.setAttribute(k, v);
    }
    for (const c of kids.flat()) if (c != null && c !== false) e.append(c);
    return e;
  }

  /* Same order on every visit, so the page does not jump about when reopened. */
  function shuffle(list, seedText) {
    let h = 2166136261;
    for (const ch of String(seedText)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      const j = Math.abs(h) % (i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const ICON = {
    learn: '<path d="M5 5h6v6H5zM13 13h6v6h-6zM11 8h4a2 2 0 0 1 2 2v3" /><path d="m15 11 2 2 2-2"/>',
    practice: '<path d="M9 18 3 12l6-6M15 6l6 6-6 6"/>',
    review: '<path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5"/>',
    progress: '<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
    more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    check: '<path d="m5 13 4 4L19 7"/>',
    save: '<path d="M6 3h12v18l-6-4-6 4z"/>',
    note: '<path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4"/>',
    run: '<path d="M7 4.5v15l13-7.5z"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
    reset: '<path d="M4 12a8 8 0 1 0 3-6.2L4 8M4 3v5h5"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',
    hint: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.7 1 1.5 1 2.5h6c0-1 .2-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    up: '<path d="m6 15 6-6 6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 6.3M20 4v7h-7"/>',
    download: '<path d="M12 4v11M7 11l5 5 5-5M4 20h16"/>',
    upload: '<path d="M12 16V5M7 9l5-5 5 5M4 20h16"/>',
  };
  const icon = (name, size) => `<svg class="ic" viewBox="0 0 24 24" width="${size || 20}" height="${size || 20}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name] || ''}</svg>`;

  // A tiny event bus, so the animation player can talk to the tracker.
  const handlers = {};
  const DSA = {
    on(name, fn) { (handlers[name] = handlers[name] || []).push(fn); },
    emit(name, data) { (handlers[name] || []).forEach(fn => fn(data)); },
  };

  root.Course = Course;
  root.UI = { el, esc, rich, shuffle, icon };
  root.DSA = DSA;
})(typeof window !== 'undefined' ? window : globalThis);
