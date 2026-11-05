/* Viz: the step-through animation engine.
 *
 * A visual is a list of frames. An author moves things around on a Scene and
 * calls snap() to save a frame. The Player tweens between frames, so anything
 * with the same id glides to its new place, and the Stage works out what kind of
 * change a step is (a compare, a swap, a value moving into a structure, a find)
 * and gives each kind the same motion everywhere.
 *
 * The viewBox is fitted to all the frames of a build, so content fills the stage.
 * Scene has no DOM access, so tools/check.mjs can run every build() in Node.
 */
(function (root) {
  'use strict';

  // ---------------------------------------------------------------- Scene
  class Scene {
    constructor(opts = {}) {
      this.w = opts.w || 560;
      this.h = opts.h || 260;
      this.items = new Map();
      this.frames = [];
    }
    _add(kind, id, base, opts) {
      if (!id && id !== 0) throw new Error('Scene: every item needs an id');
      const key = String(id);
      const item = Object.assign({ id: key, kind, tone: 'default', opacity: 1, scale: 1 }, base, opts);
      this.items.set(key, item);
      return key;
    }
    /* Square or rectangle with a value in it. x, y is the centre. */
    box(id, x, y, text, o) { return this._add('box', id, { x, y, w: 52, h: 52, text: text == null ? '' : String(text) }, o); }
    /* Circle. x, y is the centre. */
    circle(id, x, y, text, o) { return this._add('circle', id, { x, y, r: 24, text: text == null ? '' : String(text) }, o); }
    /* Words with no shape around them. */
    text(id, x, y, text, o) { return this._add('text', id, { x, y, text: String(text), size: 15, anchor: 'middle', weight: 500, mono: false }, o); }
    /* One big symbol or emoji. */
    glyph(id, x, y, ch, o) { return this._add('glyph', id, { x, y, text: String(ch), size: 34 }, o); }
    /* Bar for sorting. x is the centre, base is the y of the floor. */
    bar(id, x, base, h, text, o) { return this._add('bar', id, { x, y: base, w: 34, h, text: text == null ? '' : String(text) }, o); }
    /* Labelled arrow that points at (x, y). dir 'up' sits under the target, 'down' sits above it. */
    pointer(id, x, y, label, o) { return this._add('pointer', id, { x, y, text: String(label == null ? '' : label), dir: 'up', tone: 'accent' }, o); }
    /* Soft background region with a small label. x, y is the top-left corner. */
    area(id, x, y, w, h, label, o) { return this._add('area', id, { x, y, w, h, text: label == null ? '' : String(label), tone: 'muted' }, o); }
    /* Line from one item to another. Options: arrow, label, bend, dashed, tone. */
    edge(id, from, to, o) { return this._add('edge', id, { from: String(from), to: String(to), arrow: true, label: '', bend: 0, dashed: false }, o); }

    has(id) { return this.items.has(String(id)); }
    get(id) { return this.items.get(String(id)); }
    set(id, props) {
      const it = this.items.get(String(id));
      if (!it) throw new Error('Scene.set: no item called "' + id + '"');
      if (props && props.text != null) props = Object.assign({}, props, { text: String(props.text) });
      Object.assign(it, props);
      return this;
    }
    del() { for (const id of arguments) this.items.delete(String(id)); return this; }
    tone(ids, tone) { for (const id of [].concat(ids)) this.set(id, { tone }); return this; }
    /* Reset every shape back to the default tone, keeping any tones listed in keep. */
    clearTones(keep) {
      const k = new Set([].concat(keep || []).map(String));
      for (const it of this.items.values()) {
        if (k.has(it.id) || it.kind === 'text' || it.kind === 'area' || it.kind === 'pointer' || it.kind === 'glyph') continue;
        it.tone = 'default';
      }
      return this;
    }
    /* Row of boxes. Ids are prefix+i. Index labels below are prefix+'i'+i. Returns the box ids. */
    row(prefix, values, o = {}) {
      const cell = o.cell || 52, gap = o.gap == null ? 6 : o.gap, n = values.length;
      const total = n * cell + Math.max(0, n - 1) * gap;
      const left = (o.x == null ? this.w / 2 : o.x) - total / 2;
      const y = o.y == null ? this.h / 2 : o.y;
      const ids = [];
      values.forEach((v, i) => {
        const x = left + cell / 2 + i * (cell + gap);
        ids.push(this.box(prefix + i, x, y, v, Object.assign({ w: cell, h: cell }, o.box)));
        if (o.index !== false) this.text(prefix + 'i' + i, x, y + cell / 2 + 16, i, { size: 13, tone: 'muted', mono: true });
      });
      return ids;
    }
    /* x position of slot i in a row built with the same options. */
    slotX(i, n, o = {}) {
      const cell = o.cell || 52, gap = o.gap == null ? 6 : o.gap;
      const total = n * cell + Math.max(0, n - 1) * gap;
      return (o.x == null ? this.w / 2 : o.x) - total / 2 + cell / 2 + i * (cell + gap);
    }
    /* Swap two items' places. They hop past each other in the next frame. */
    swap(a, b, hop = 44) {
      const A = this.get(a), B = this.get(b);
      const x = A.x, y = A.y;
      A.x = B.x; A.y = B.y; B.x = x; B.y = y;
      A.hop = hop; B.hop = -hop;
      return this;
    }
    /* Make items bounce once in the next frame. */
    pulse(ids) { for (const id of [].concat(ids)) this.set(id, { pulse: true }); return this; }
    /* Name the meaning of the next frame's motion, when the engine cannot infer it from the change alone.
       Kinds: 'compare' (a, b), 'carry' (from, to, text), 'discard' (ids), 'found' (id), 'wave' (ids), 'quiet' (no inferred effects).
       Cues change only how a step moves, never what it shows. */
    cue(kind, ...args) { (this._cues = this._cues || []).push([kind, ...args]); return this; }
    /* Save a frame. say is the narration. Options: line (1-based code line), vars, out (text on screen so far), ask. */
    snap(say, o = {}) {
      const items = [];
      for (const it of this.items.values()) items.push(Object.assign({}, it));
      const frame = { items, say: say || '', line: o.line || 0, vars: o.vars || null, ask: o.ask || null, out: o.out == null ? null : String(o.out) };
      if (this._cues) { frame.cues = this._cues; this._cues = null; }
      this.frames.push(frame);
      for (const it of this.items.values()) { delete it.hop; delete it.pulse; }
      return this;
    }
    /* Tidy tree layout. node = {id, value, left, right} or {id, value, kids:[...]}.
       Returns {id: {x, y}}. */
    static layoutTree(node, o = {}) {
      const xGap = o.xGap || 56, yGap = o.yGap || 70, top = o.y == null ? 34 : o.y;
      const out = {};
      let next = 0;
      const kids = n => (n.kids ? n.kids : [n.left, n.right]).filter(Boolean);
      const walk = (n, d) => {
        const c = kids(n);
        let x;
        if (!c.length) x = next++;
        else if (!n.kids && c.length === 1) {
          // Keep a lone child on its proper side, so left looks left.
          const isLeft = c[0] === n.left;
          const cx = walk(c[0], d + 1);
          x = isLeft ? cx + 0.5 : cx - 0.5;
          if (!isLeft) next = Math.max(next, cx + 1);
        } else {
          const xs = c.map(k => walk(k, d + 1));
          x = (xs[0] + xs[xs.length - 1]) / 2;
        }
        out[n.id] = { x, y: top + d * yGap };
        return x;
      };
      walk(node, 0);
      const vals = Object.values(out).map(p => p.x);
      const min = Math.min(...vals), max = Math.max(...vals);
      const cx = o.x == null ? 280 : o.x;
      for (const p of Object.values(out)) p.x = cx + (p.x - (min + max) / 2) * xGap;
      return out;
    }
  }

  // ------------------------------------------------------------- Registry
  const registry = {};
  function register(name, def) {
    if (registry[name]) console.warn('Viz: replacing', name);
    registry[name] = def;
  }
  /* A large empty box with things placed on it is a tray: it holds them, so it draws dark and stays out of their way.
     This is decided once per build, so a box does not change its look part way through. */
  function markTrays(frames) {
    const trays = new Set();
    for (const f of frames) {
      const big = f.items.filter(b => b.kind === 'box' && !b.text && (b.w >= 70 || b.h >= 70) && !trays.has(b.id));
      if (!big.length) continue;
      for (const b of big) {
        for (const o of f.items) {
          if (o === b || o.kind === 'edge' || o.kind === 'area' || o.kind === 'pointer') continue;
          if (Math.abs(o.x - b.x) < b.w / 2 && Math.abs(o.y - b.y) < b.h / 2 && !(o.kind === 'box' && o.w >= b.w && o.h >= b.h)) { trays.add(b.id); break; }
        }
      }
    }
    if (trays.size) for (const f of frames) for (const it of f.items) if (trays.has(it.id)) it.tray = true;
  }
  function build(name, params) {
    const def = registry[name];
    if (!def) throw new Error('No visual called "' + name + '"');
    const p = {};
    (def.inputs || []).forEach(i => { p[i.key] = i.value; });
    Object.assign(p, params);
    const size = def.size || [560, 260];
    const s = new Scene({ w: size[0], h: size[1] });
    def.build(s, p);
    if (!s.frames.length) s.snap('');
    markTrays(s.frames);
    return s;
  }

  // ---------------------------------------------------------------- Fitting
  // Label sizes in stage units. app.css uses the same numbers.
  const LABEL = { val: 19, sub: 13, barval: 15, ptr: 14, area: 13, edge: 14 };
  const estimate = (text, size, o = {}) => String(text).length * size * (o.mono ? 0.6 : (o.weight || 500) >= 650 ? 0.58 : 0.54);
  const isTray = it => !!it.tray;
  const baseOf = (w, h) => Math.max(2, Math.min(5, Math.min(w, h) * 0.085));

  /* An edge label sits beside its line, not on it: above a flat edge, to the right of a steep one. */
  function edgeLabelAt(lx, ly, nx, ny, w, fs) {
    let ux = nx, uy = ny;
    if (uy > 0) { ux = -ux; uy = -uy; }
    if (Math.abs(uy) < 0.35 && ux < 0) { ux = -ux; uy = -uy; }
    const off = Math.abs(ux) * (w / 2) + Math.abs(uy) * (fs / 2) + 5;
    return [lx + ux * off, ly + uy * off];
  }
  /* A pointer's tag slides sideways if it would sit on another shape or on an earlier tag. The tip stays where it points. */
  const pillMemo = new WeakMap();
  function pillShift(it, items, floor, meas) {
    if (!it.text) return 0;
    const memo = pillMemo.get(it);
    if (memo && memo.floor === floor) return memo.sx;
    const fs = Math.max(LABEL.ptr, floor), width = t => Math.max(fs + 9, meas(t.text, fs, { mono: true, weight: 700 }) + 15), ph = fs + 10;
    const pw = width(it), up = it.dir !== 'down', y0 = up ? it.y + 10 : it.y - 10 - ph, y1 = y0 + ph;
    const clear = sx => {
      const a = it.x + sx - pw / 2, b = it.x + sx + pw / 2;
      for (const o of items) {
        if (o === it) return true; // Only tags earlier in the list hold their place against this one.
        if (o.opacity === 0 || o.tray) continue;
        if (o.kind === 'pointer' && o.text) {
          const ou = o.dir !== 'down', oy0 = ou ? o.y + 10 : o.y - 10 - ph, ow = width(o), ox = o.x + pillShift(o, items, floor, meas);
          if (Math.min(b, ox + ow / 2) - Math.max(a, ox - ow / 2) > 1 && Math.min(y1, oy0 + ph) - Math.max(y0, oy0) > 1) return false;
        }
      }
      return true;
    };
    const clearShapes = sx => {
      const a = it.x + sx - pw / 2, b = it.x + sx + pw / 2;
      for (const o of items) {
        if (o === it || (o.kind !== 'box' && o.kind !== 'circle') || o.tray || o.opacity === 0) continue;
        const hw = o.kind === 'circle' ? o.r : o.w / 2, hh = o.kind === 'circle' ? o.r : o.h / 2;
        if (Math.min(b, o.x + hw) - Math.max(a, o.x - hw) > 1 && Math.min(y1, o.y + hh) - Math.max(y0, o.y - hh) > 1) return false;
      }
      return true;
    };
    let sx = 0;
    if (!clear(0) || !clearShapes(0)) {
      const d = Math.max(0, pw / 2 - 9), o = pw + 2;
      for (const c of [-d, d, -(d + 12), d + 12, -(d + 26), d + 26, o, -o]) if (clear(c) && clearShapes(c)) { sx = c; break; }
    }
    pillMemo.set(it, { floor, sx });
    return sx;
  }

  /* The box every item of every frame stays inside, with a margin. No DOM, so check.mjs can call it too.
     floor is the smallest font size labels may draw at, in stage units. */
  function fitScene(frames, size, o = {}) {
    const floor = o.floor || 0, measure = o.measure || estimate;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const add = (a, b, c, d) => { if (a < x0) x0 = a; if (b < y0) y0 = b; if (c > x1) x1 = c; if (d > y1) y1 = d; };
    const label = (cx, cy, text, sz, opt) => {
      if (!text) return;
      const fs = Math.max(sz, floor), w = measure(text, fs, opt), hh = fs * 0.72;
      add(cx - w / 2, cy - hh, cx + w / 2, cy + hh);
    };
    for (const f of frames) {
      const byId = new Map();
      for (const it of f.items) byId.set(it.id, it);
      for (const it of f.items) {
        if (it.opacity === 0) continue;
        const s = it.scale == null ? 1 : it.scale;
        switch (it.kind) {
          case 'box': {
            const hw = it.w * s / 2, hh = it.h * s / 2, b = isTray(it) ? 0 : baseOf(it.w, it.h);
            add(it.x - hw - 2, it.y - hh - 4, it.x + hw + 2, it.y + hh + b + 2);
            if (it.sub) label(it.x, it.y + it.h / 2 + 18, it.sub, LABEL.sub, { mono: true });
            break;
          }
          case 'circle': {
            const r = it.r * s;
            add(it.x - r - 2, it.y - r - 4, it.x + r + 2, it.y + r + 7);
            if (it.sub) label(it.x, it.y + it.r + 19, it.sub, LABEL.sub, { mono: true });
            break;
          }
          case 'bar': {
            const hw = it.w / 2;
            add(it.x - hw - 2, it.y - it.h - 2, it.x + hw + 2, it.y + 6);
            if (it.text) label(it.x, it.y - it.h - 11, it.text, LABEL.barval, { mono: true });
            break;
          }
          case 'text': case 'glyph': {
            if (!it.text) break;
            const fs = Math.max(it.size || 15, floor);
            const w = (it.kind === 'glyph' ? fs * Math.max(1, it.text.length) : measure(it.text, fs, { mono: it.mono, weight: it.weight })) * s;
            const left = it.anchor === 'start' ? it.x : it.anchor === 'end' ? it.x - w : it.x - w / 2;
            const hh = fs * s * 0.72;
            add(left, it.y - hh, left + w, it.y + hh);
            break;
          }
          case 'pointer': {
            const fs = Math.max(LABEL.ptr, floor), w = it.text ? measure(it.text, fs, { mono: true, weight: 700 }) + 16 : 16;
            const ph = fs + 10, up = it.dir !== 'down', sx = pillShift(it, f.items, floor, measure);
            add(it.x + sx - w / 2, up ? it.y : it.y - 10 - ph, it.x + sx + w / 2, up ? it.y + 10 + ph : it.y);
            add(it.x - 8, up ? it.y : it.y - 12, it.x + 8, up ? it.y + 12 : it.y);
            break;
          }
          case 'area': {
            add(it.x, it.y, it.x + it.w, it.y + it.h);
            if (it.text) {
              const fs = Math.max(LABEL.area, floor);
              add(it.x + 12, it.y, it.x + 12 + measure(it.text, fs, { weight: 700 }), it.y + 18 + fs);
            }
            break;
          }
          case 'edge': {
            const a = byId.get(it.from), b = byId.get(it.to);
            if (!a || !b) break;
            const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, bend = it.bend || 0;
            const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
            const nx = -(b.y - a.y) / len, ny = (b.x - a.x) / len;
            const lx = mx + nx * bend / 2, ly = my + ny * bend / 2;
            add(Math.min(a.x, b.x, lx), Math.min(a.y, b.y, ly), Math.max(a.x, b.x, lx), Math.max(a.y, b.y, ly));
            if (it.label) {
              const fs = Math.max(LABEL.edge, floor), w = measure(it.label, fs, { mono: true, weight: 800 });
              const at = edgeLabelAt(lx, ly, nx, ny, w, fs);
              label(at[0], at[1], it.label, LABEL.edge, { mono: true, weight: 800 });
            }
            break;
          }
        }
      }
    }
    if (!Number.isFinite(x0)) return { x: 0, y: 0, w: size[0], h: size[1] };
    const m = o.margin == null ? 14 : o.margin;
    x0 -= m; y0 -= m; x1 += m; y1 += m;
    const minW = o.minW || 0, minH = o.minH || 0;
    if (x1 - x0 < minW) { const g = (minW - (x1 - x0)) / 2; x0 -= g; x1 += g; }
    if (y1 - y0 < minH) { const g = (minH - (y1 - y0)) / 2; y0 -= g; y1 += g; }
    x0 = Math.floor(x0); y0 = Math.floor(y0);
    return { x: x0, y: y0, w: Math.ceil(x1 - x0), h: Math.ceil(y1 - y0) };
  }

  // Everything below needs a browser.
  if (typeof document === 'undefined') { root.Viz = { Scene, register, build, registry, fitScene }; return; }

  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  };
  const h = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const MIN_LABEL_PX = 10;
  const TWEEN = 260;
  const SPEEDS = [1, 2, 3, 0.5];
  const clamp01 = t => (t < 0 ? 0 : t > 1 ? 1 : t);
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const easeBack = t => { const c = 1.25, u = t - 1; return 1 + (c + 1) * u * u * u + c * u * u; };
  const easeEven = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const lerp = (a, b, t) => a + (b - a) * t;
  const reduced = () =>
    document.documentElement.dataset.motion === 'off' ||
    (document.documentElement.dataset.motion !== 'on' &&
      window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* Real text widths, so a fitted stage does not clip. Cached per string at one size, as width scales evenly. */
  const FONT_BODY = "'Atkinson Hyperlegible Next', 'Atkinson Hyperlegible', 'Segoe UI', Verdana, system-ui, sans-serif";
  const FONT_CODE = "'JetBrains Mono', 'Cascadia Mono', Consolas, Menlo, monospace";
  const measureCtx = document.createElement('canvas').getContext('2d');
  let measureCache = new Map();
  function measure(text, size, o = {}) {
    if (!measureCtx) return estimate(text, size, o);
    const weight = o.weight || 500, key = (o.mono ? 'm' : 'b') + weight + '|' + text;
    let w = measureCache.get(key);
    if (w == null) {
      measureCtx.font = `${weight} 100px ${o.mono ? FONT_CODE : FONT_BODY}`;
      w = measureCtx.measureText(String(text)).width;
      measureCache.set(key, w);
    }
    return w * size / 100 + 1;
  }

  /* The learner's speed is one setting for every animation, kept with the other settings. */
  function savedSpeed() {
    const v = root.Store && root.Store.state && root.Store.state.prefs ? Number(root.Store.state.prefs.vizSpeed) : 1;
    return SPEEDS.includes(v) ? v : 1;
  }
  function saveSpeed(v) {
    if (!root.Store || !root.Store.state) return;
    root.Store.state.prefs.vizSpeed = v;
    root.Store.save();
  }

  // ---------------------------------------------------------------- Stage
  const SHAPE = k => k === 'box' || k === 'circle' || k === 'bar';
  const HOT = new Set(['active', 'warn', 'ok', 'accent']);
  const BADGE = {
    ok: 'M-3.6 0.2 L-1.1 2.8 L3.6 -2.6',
    bad: 'M-2.9 -2.9 L2.9 2.9 M2.9 -2.9 L-2.9 2.9',
    warn: 'M-2.7 0 a2.7 2.7 0 1 0 5.4 0 a2.7 2.7 0 1 0 -5.4 0',
  };
  /* A label sitting on a bright tile takes the tile's text colour, so it stays readable in every state. */
  const underCache = new WeakMap();
  function tilesUnder(frame) {
    let map = underCache.get(frame);
    if (map) return map;
    map = new Map();
    const tiles = frame.items.filter(x => SHAPE(x.kind) && x.opacity !== 0 && !isTray(x));
    for (const t of frame.items) {
      if (t.kind !== 'text' && t.kind !== 'glyph') continue;
      for (let i = tiles.length - 1; i >= 0; i--) {
        const s = tiles[i];
        const inside = s.kind === 'circle' ? Math.hypot(t.x - s.x, t.y - s.y) < s.r
          : s.kind === 'bar' ? Math.abs(t.x - s.x) < s.w / 2 && t.y < s.y && t.y > s.y - s.h
            : Math.abs(t.x - s.x) < s.w / 2 && Math.abs(t.y - s.y) < s.h / 2;
        if (inside) { map.set(t.id, s.tone || 'default'); break; }
      }
    }
    underCache.set(frame, map);
    return map;
  }

  class Stage {
    constructor(svg) {
      this.svg = svg;
      this.layers = {};
      for (const n of ['area', 'edge', 'node', 'fx', 'top']) { this.layers[n] = svgEl('g', {}); svg.appendChild(this.layers[n]); }
      this.els = new Map();
      this.raf = 0;
      this.fx = [];
      this.fxRecs = new Set();
      this.floor = 0;
    }
    _layer(kind) { return kind === 'area' ? 'area' : kind === 'edge' ? 'edge' : kind === 'pointer' || kind === 'text' ? 'top' : 'node'; }
    _create(it) {
      const g = svgEl('g', { 'data-id': it.id });
      const add = (tag, attrs, cls) => { const e = svgEl(tag, attrs); if (cls) e.setAttribute('class', cls); g.appendChild(e); return e; };
      const refs = { g };
      switch (it.kind) {
        case 'box': refs.base = add('rect', {}, 'vz-base'); refs.shape = add('rect', {}, 'vz-shape'); refs.label = add('text', {}, 'vz-val'); refs.sub = add('text', {}, 'vz-sub'); break;
        case 'bar': refs.base = add('rect', { rx: 5 }, 'vz-base'); refs.shape = add('rect', { rx: 5 }, 'vz-shape'); refs.label = add('text', {}, 'vz-barval'); break;
        case 'circle': refs.base = add('circle', {}, 'vz-base'); refs.shape = add('circle', {}, 'vz-shape'); refs.label = add('text', {}, 'vz-val'); refs.sub = add('text', {}, 'vz-sub'); break;
        case 'text': refs.label = add('text', {}, 'vz-text'); break;
        case 'glyph': refs.label = add('text', {}, 'vz-glyph'); break;
        case 'pointer': refs.tip = add('path', {}, 'vz-ptr'); refs.pill = add('rect', { rx: 7 }, 'vz-pill'); refs.label = add('text', {}, 'vz-ptrlabel'); break;
        case 'area': refs.shape = add('rect', { rx: 14, x: 0, y: 0 }, 'vz-area'); refs.label = add('text', { x: 12, y: 15 }, 'vz-arealabel'); break;
        case 'edge': refs.path = add('path', {}, 'vz-edge'); refs.head = add('path', {}, 'vz-head'); refs.label = add('text', {}, 'vz-edgelabel'); break;
      }
      this.layers[this._layer(it.kind)].appendChild(g);
      return refs;
    }
    _badge(rec, it) {
      const tone = it.tone || 'default', refs = rec.refs;
      const wanted = BADGE[tone] && !isTray(it) && (
        it.kind === 'box' ? Math.min(it.w, it.h) >= 34 : it.kind === 'circle' ? it.r >= 17 : it.kind === 'bar' ? it.w >= 24 && it.h >= 24 : false);
      if (!wanted) { if (refs.badge) refs.badge.style.display = 'none'; return; }
      if (!refs.badge) {
        refs.badge = svgEl('g', { class: 'vz-badge' });
        refs.badge.appendChild(svgEl('circle', { r: 7.5 }));
        refs.badgeMark = svgEl('path', {});
        refs.badge.appendChild(refs.badgeMark);
        refs.g.appendChild(refs.badge);
        rec.geo = null;
      }
      refs.badge.style.display = '';
      if (refs.badgeTone !== tone) { refs.badgeMark.setAttribute('d', BADGE[tone]); refs.badgeTone = tone; }
    }
    _static(it, rec, under) {
      const refs = rec.refs, tone = it.tone || 'default';
      const on = under && under.get(it.id);
      const tray = isTray(it);
      const cls = 'vz-item kind-' + it.kind + ' tone-' + tone + (tray ? ' is-tray' : '') + (on && on !== 'default' ? ' on-' + on : '');
      if (rec.cls !== cls) { refs.g.setAttribute('class', cls); rec.cls = cls; }
      const lab = refs.label;
      if (lab) {
        const text = it.kind === 'edge' ? '' : it.text == null ? '' : it.text;
        if (it.kind !== 'edge' && lab.textContent !== text) lab.textContent = text;
        if (it.kind === 'text' || it.kind === 'glyph') {
          const fs = `max(${it.size}px, var(--vz-floor, 0px))`;
          if (lab.style.fontSize !== fs) lab.style.fontSize = fs;
          lab.setAttribute('text-anchor', it.anchor || 'middle');
          lab.style.fontWeight = it.weight || '';
          lab.classList.toggle('mono', !!it.mono);
        }
        if (it.size && (it.kind === 'box' || it.kind === 'circle')) lab.style.fontSize = `${it.size}px`;
      }
      if (refs.sub) {
        if (refs.sub.textContent !== (it.sub || '')) refs.sub.textContent = it.sub || '';
        refs.sub.setAttribute('y', it.kind === 'circle' ? (it.r || 24) + 19 : (it.h || 52) / 2 + 18);
      }
      if (it.kind === 'edge') {
        refs.path.classList.toggle('dashed', !!it.dashed);
        refs.head.style.display = it.arrow === false ? 'none' : '';
      }
      if (it.kind === 'pointer') this._pointerShape(it, refs);
      if (SHAPE(it.kind)) this._badge(rec, it);
    }
    /* A pointer is a tag: a small tip touching what it names, and a pill holding its name. */
    _pointerShape(it, refs) {
      const up = it.dir !== 'down', fs = Math.max(LABEL.ptr, this.floor);
      const has = !!it.text;
      const sx = has ? pillShift(it, this.items || [], this.floor, measure) : 0;
      const pw = has ? Math.max(fs + 9, measure(it.text, fs, { mono: true, weight: 700 }) + 15) : 0, ph = fs + 10;
      const cy = up ? 10 + ph / 2 : -(10 + ph / 2);
      refs.tip.setAttribute('d', up ? 'M0 0 L-7 11 L7 11 Z' : 'M0 0 L-7 -11 L7 -11 Z');
      refs.pill.style.display = has ? '' : 'none';
      if (has) {
        refs.pill.setAttribute('x', (sx - pw / 2).toFixed(1)); refs.pill.setAttribute('y', (cy - ph / 2).toFixed(1));
        refs.pill.setAttribute('width', pw.toFixed(1)); refs.pill.setAttribute('height', ph.toFixed(1));
      }
      refs.label.setAttribute('x', sx.toFixed(1));
      refs.label.setAttribute('y', cy.toFixed(1));
    }
    /* Floors under bars, so a row of bars stands on something. */
    setFloors(frames) {
      if (this.floors) this.floors.forEach(l => l.remove());
      this.floors = [];
      const seen = new Map();
      for (const f of frames) {
        const row = new Map();
        for (const it of f.items) if (it.kind === 'bar') { const k = Math.round(it.y); (row.get(k) || row.set(k, []).get(k)).push(it); }
        for (const [y, bars] of row) {
          if (bars.length < 2) continue;
          const e = seen.get(y) || { a: Infinity, b: -Infinity };
          for (const b of bars) { e.a = Math.min(e.a, b.x - b.w / 2 - 8); e.b = Math.max(e.b, b.x + b.w / 2 + 8); }
          seen.set(y, e);
        }
      }
      for (const [y, e] of seen) {
        const l = svgEl('line', { x1: e.a, x2: e.b, y1: y + 4.5, y2: y + 4.5, class: 'vz-floorline' });
        this.layers.area.appendChild(l);
        this.floors.push(l);
      }
    }
    setFloor(floor) {
      if (Math.abs(floor - this.floor) < 0.01) return;
      this.floor = floor;
      for (const rec of this.els.values()) if (rec.kind === 'pointer') this._pointerShape(rec.item, rec.refs);
    }
    _targets(it) {
      const t = { opacity: it.opacity == null ? 1 : it.opacity, scale: it.scale == null ? 1 : it.scale };
      if (it.kind === 'edge') { t.grow = 1; return t; }
      t.x = it.x; t.y = it.y;
      if (it.w != null) t.w = it.w;
      if (it.h != null) t.h = it.h;
      if (it.r != null) t.r = it.r;
      return t;
    }
    _paint(rec) {
      const it = rec.item, refs = rec.refs, v = rec.v;
      const x = v.x + rec.dx, y = v.y + rec.dy + rec.arc;
      const s = (v.scale == null ? 1 : v.scale) * rec.ds;
      rec.px = x; rec.py = y;
      const tr = `translate(${x.toFixed(2)} ${y.toFixed(2)})` + (Math.abs(s - 1) > 0.001 ? ` scale(${s.toFixed(3)})` : '');
      if (tr !== rec.tr) { refs.g.setAttribute('transform', tr); rec.tr = tr; }
      const op = v.opacity.toFixed(3);
      if (op !== rec.op) { refs.g.setAttribute('opacity', op); rec.op = op; }
      if (it.kind === 'box') {
        const key = v.w.toFixed(2) + ',' + v.h.toFixed(2) + ',' + String(it.text || '').length;
        if (key !== rec.geo) {
          rec.geo = key;
          const rx = Math.min(10, Math.min(v.w, v.h) * 0.2);
          const set = e => { e.setAttribute('x', (-v.w / 2).toFixed(2)); e.setAttribute('width', v.w.toFixed(2)); e.setAttribute('height', v.h.toFixed(2)); e.setAttribute('rx', rx.toFixed(1)); };
          set(refs.shape); refs.shape.setAttribute('y', (-v.h / 2).toFixed(2));
          set(refs.base); refs.base.setAttribute('y', (-v.h / 2 + baseOf(v.w, v.h)).toFixed(2));
          if (refs.badge) {
            const tw = String(it.text || '').length * 0.6 * (it.size || LABEL.val), inset = tw > v.w - 34 ? -1 : 6;
            refs.badge.setAttribute('transform', `translate(${(v.w / 2 - inset).toFixed(1)} ${(-v.h / 2 + inset).toFixed(1)})`);
          }
        }
      } else if (it.kind === 'bar') {
        const key = v.w.toFixed(2) + ',' + v.h.toFixed(2);
        if (key !== rec.geo) {
          rec.geo = key;
          const bh = Math.max(0, v.h);
          for (const e of [refs.shape, refs.base]) { e.setAttribute('x', (-v.w / 2).toFixed(2)); e.setAttribute('width', v.w.toFixed(2)); e.setAttribute('height', bh.toFixed(2)); }
          refs.shape.setAttribute('y', (-bh).toFixed(2));
          refs.base.setAttribute('y', (-bh + 3.5).toFixed(2));
          refs.label.setAttribute('y', (-bh - 11).toFixed(2));
          if (refs.badge) refs.badge.setAttribute('transform', `translate(0 ${(-bh + 11).toFixed(1)})`);
        }
      } else if (it.kind === 'circle') {
        const key = v.r.toFixed(2);
        if (key !== rec.geo) {
          rec.geo = key;
          refs.shape.setAttribute('r', key); refs.base.setAttribute('r', key);
          refs.base.setAttribute('cy', Math.max(2.5, Math.min(4.5, v.r * 0.16)).toFixed(1));
          if (refs.badge) refs.badge.setAttribute('transform', `translate(${(v.r * 0.72).toFixed(1)} ${(-v.r * 0.72).toFixed(1)})`);
        }
      } else if (it.kind === 'area') {
        const key = v.w.toFixed(2) + ',' + v.h.toFixed(2);
        if (key !== rec.geo) { rec.geo = key; refs.shape.setAttribute('width', v.w.toFixed(2)); refs.shape.setAttribute('height', v.h.toFixed(2)); }
      }
    }
    /* Where an edge runs right now, from where its two ends are drawn. */
    _edgeGeom(it) {
      const a = this.els.get(it.from), b = this.els.get(it.to);
      if (!a || !b || a.px == null || b.px == null) return null;
      const ax = a.px, ay = a.py, bx = b.px, by = b.py;
      const bend = it.bend || 0;
      const mx = (ax + bx) / 2, my = (ay + by) / 2;
      const len = Math.hypot(bx - ax, by - ay) || 1;
      const nx = -(by - ay) / len, ny = (bx - ax) / len;
      const cx = mx + nx * bend, cy = my + ny * bend;
      const trim = (n, px, py, fx, fy) => {
        const dx = fx - px, dy = fy - py, d = Math.hypot(dx, dy) || 1;
        let r;
        if (n.kind === 'circle') r = n.v.r;
        else if (n.kind === 'box') {
          const hw = n.v.w / 2, hh = n.v.h / 2;
          r = Math.min(Math.abs(dx) > 0.01 ? hw / Math.abs(dx / d) : 1e9, Math.abs(dy) > 0.01 ? hh / Math.abs(dy / d) : 1e9);
        } else r = 10;
        return [px + (dx / d) * (r + 3), py + (dy / d) * (r + 3)];
      };
      const [sx, sy] = trim(a, ax, ay, cx, cy);
      const [ex, ey] = trim(b, bx, by, cx, cy);
      return { sx, sy, ex, ey, cx, cy };
    }
    _paintEdge(rec) {
      const it = rec.item, refs = rec.refs, v = rec.v;
      const g = this._edgeGeom(it);
      if (!g) { refs.g.setAttribute('opacity', 0); rec.op = '0'; return; }
      const op = v.opacity.toFixed(3);
      if (op !== rec.op) { refs.g.setAttribute('opacity', op); rec.op = op; }
      const grow = v.grow == null ? 1 : v.grow;
      // Grow along the line, so a new link looks like it is being drawn.
      const tx = (a, c, b, t) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * c + t * t * b;
      const endx = tx(g.sx, g.cx, g.ex, grow), endy = tx(g.sy, g.cy, g.ey, grow);
      const c1x = lerp(g.sx, g.cx, grow), c1y = lerp(g.sy, g.cy, grow);
      const d = `M${g.sx.toFixed(1)} ${g.sy.toFixed(1)} Q${c1x.toFixed(1)} ${c1y.toFixed(1)} ${endx.toFixed(1)} ${endy.toFixed(1)}`;
      if (d === rec.d) return;
      rec.d = d;
      refs.path.setAttribute('d', d);
      const ang = Math.atan2(endy - c1y, endx - c1x);
      const sz = 13;
      const p = (a, l) => `${(endx + Math.cos(a) * l).toFixed(1)} ${(endy + Math.sin(a) * l).toFixed(1)}`;
      refs.head.setAttribute('d', `M${p(0, 1)} L${p(ang + Math.PI - 0.48, sz)} L${p(ang + Math.PI + 0.48, sz)} Z`);
      refs.head.setAttribute('opacity', grow > 0.15 ? 1 : 0);
      if (it.label) {
        const fs = Math.max(LABEL.edge, this.floor), w = measure(it.label, fs, { mono: true, weight: 800 });
        const len = Math.hypot(g.ex - g.sx, g.ey - g.sy) || 1;
        const at = edgeLabelAt(tx(g.sx, g.cx, g.ex, 0.5), tx(g.sy, g.cy, g.ey, 0.5), -(g.ey - g.sy) / len, (g.ex - g.sx) / len, w, fs);
        refs.label.setAttribute('x', at[0].toFixed(1));
        refs.label.setAttribute('y', at[1].toFixed(1));
      }
      if (refs.label.textContent !== (it.label || '')) refs.label.textContent = it.label || '';
    }

    // ---------------------------------------------------------- effects
    _killFx() {
      for (const f of this.fx) if (f.node) f.node.remove();
      this.fx = [];
      for (const r of this.fxRecs) { r.dx = 0; r.dy = 0; r.ds = 1; }
      this.fxRecs.clear();
    }
    _addFx(at, dur, fn, node) { this.fx.push({ at, dur, fn, node, started: false }); }
    _nudge(rec, at, dur, fn) {
      this.fxRecs.add(rec);
      this._addFx(at, dur, t => fn(rec, t));
    }
    _bump(rec, at, dur, amp) { this._nudge(rec, at, dur, (r, t) => { r.ds *= 1 + Math.sin(t * Math.PI) * amp; }); }
    _ring(it, at, dur, grow = 13) {
      const tone = 'vz-ring tone-' + (it.tone || 'default');
      let node, w, hh, cy = it.y;
      if (it.kind === 'circle') { node = svgEl('circle', { r: it.r, class: tone }); w = hh = it.r * 2; }
      else {
        w = it.w; hh = it.h; if (it.kind === 'bar') cy = it.y - it.h / 2;
        node = svgEl('rect', { x: -w / 2, y: -hh / 2, width: w, height: hh, rx: Math.min(10, Math.min(w, hh) * 0.2), class: tone });
      }
      node.setAttribute('opacity', 0);
      this.layers.fx.appendChild(node);
      this._addFx(at, dur, t => {
        const e = easeOut(t);
        node.setAttribute('transform', `translate(${it.x} ${cy}) scale(${(1 + (2 * grow * e) / w).toFixed(3)} ${(1 + (2 * grow * e) / hh).toFixed(3)})`);
        node.setAttribute('opacity', ((1 - t) * 0.95).toFixed(3));
      }, node);
    }
    _dot(it, at, dur, reverse) {
      const node = svgEl('circle', { r: 6, class: 'vz-dot tone-' + (it.tone || 'default'), opacity: 0 });
      this.layers.fx.appendChild(node);
      this._addFx(at, dur, t => {
        const g = this._edgeGeom(it);
        if (!g) return;
        const e = easeEven(t), q = reverse ? 1 - e : e, u = 1 - q;
        node.setAttribute('cx', (u * u * g.sx + 2 * u * q * g.cx + q * q * g.ex).toFixed(1));
        node.setAttribute('cy', (u * u * g.sy + 2 * u * q * g.cy + q * q * g.ey).toFixed(1));
        node.setAttribute('opacity', t > 0.88 ? ((1 - t) / 0.12).toFixed(2) : 1);
      }, node);
    }
    /* A short arc that links two things being weighed against each other. */
    _link(a, b, at, dur) {
      const ay = a.kind === 'bar' ? a.y - a.h - 22 : a.y - (a.h || 2 * (a.r || 0)) / 2 - 2;
      const by = b.kind === 'bar' ? b.y - b.h - 22 : b.y - (b.h || 2 * (b.r || 0)) / 2 - 2;
      const lift = Math.min(ay, by) - Math.min(40, 14 + Math.hypot(a.x - b.x, a.y - b.y) * 0.18);
      const node = svgEl('path', { d: `M${a.x} ${ay} Q${(a.x + b.x) / 2} ${lift} ${b.x} ${by}`, class: 'vz-link', pathLength: 1, opacity: 0 });
      this.layers.fx.appendChild(node);
      this._addFx(at, dur, t => {
        node.setAttribute('stroke-dashoffset', (1 - clamp01(t / 0.45)).toFixed(3));
        node.setAttribute('opacity', t > 0.6 ? ((1 - t) / 0.4).toFixed(2) : 1);
      }, node);
    }
    /* A copy of a value that travels from where it is read to where it lands. */
    _carry(src, dst, text, at, dur, landBump) {
      const tone = HOT.has(dst.tone) ? dst.tone : HOT.has(src.tone) ? src.tone : 'active';
      const node = svgEl('g', { class: 'vz-ghost tone-' + tone, opacity: 0 });
      const fs = 17, w = Math.max(34, measure(text, fs, { mono: true, weight: 800 }) + 18), bh = 30;
      node.appendChild(svgEl('rect', { x: -w / 2, y: -bh / 2 + 3, width: w, height: bh, rx: 8, class: 'vz-base' }));
      node.appendChild(svgEl('rect', { x: -w / 2, y: -bh / 2, width: w, height: bh, rx: 8, class: 'vz-shape' }));
      const label = svgEl('text', { class: 'vz-val' });
      label.style.fontSize = fs + 'px';
      label.textContent = text;
      node.appendChild(label);
      this.layers.fx.appendChild(node);
      const sy = src.kind === 'bar' ? src.y - src.h / 2 : src.y, dy = dst.kind === 'bar' ? dst.y - dst.h / 2 : dst.y;
      const dist = Math.hypot(dst.x - src.x, dy - sy), lift = Math.min(34, 8 + dist * 0.14);
      this._addFx(at, dur, t => {
        const q = easeEven(t);
        const x = lerp(src.x, dst.x, q), y = lerp(sy, dy, q) - Math.sin(t * Math.PI) * lift;
        node.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
        node.setAttribute('opacity', t > 0.82 ? ((1 - t) / 0.18).toFixed(2) : 1);
      }, node);
      if (landBump) this._bump(landBump, at + dur * 0.8, 180 * (dur / 340), 0.14);
    }

    /* Reads what changed between two frames and gives each kind of change its own motion. */
    _choreograph(frame, prev, anim, leaving, sp, opts) {
      const byId = new Map();
      for (const a of anim) byId.set(a.it.id, a);
      const ms = n => n / sp;
      const cues = frame.cues || [];
      const cueOf = k => cues.filter(c => c[0] === k);
      if (cueOf('quiet').length) return;
      const raised = [];

      // --- things that moved
      const moved = [];
      const shifts = new Map();
      for (const a of anim) {
        const p = prev.get(a.it.id);
        if (!p || a.it.kind === 'edge' || a.it.kind === 'area') continue;
        const dx = a.it.x - p.x, dy = a.it.y - p.y;
        if (Math.hypot(dx, dy) < 1) continue;
        a.dist = Math.hypot(dx, dy); a.pdx = dx; a.pdy = dy; a.prevItem = p;
        if (SHAPE(a.it.kind) && !a.tray) {
          moved.push(a);
          const key = Math.round(dx) + ',' + Math.round(dy);
          shifts.set(key, (shifts.get(key) || 0) + 1);
        }
        if (a.it.kind === 'pointer') a.ease = easeBack;
      }
      const swapped = new Set();
      for (let i = 0; i < moved.length; i++) for (let j = i + 1; j < moved.length; j++) {
        const A = moved[i], B = moved[j];
        if (swapped.has(A) || swapped.has(B)) continue;
        if (Math.hypot(A.it.x - B.prevItem.x, A.it.y - B.prevItem.y) < 1 && Math.hypot(B.it.x - A.prevItem.x, B.it.y - A.prevItem.y) < 1) {
          swapped.add(A); swapped.add(B);
          const over = (B.it.hop || 0) > (A.it.hop || 0) ? B : A, under = over === A ? B : A;
          const lift = Math.abs(over.it.hop || 0) || Math.min(44, 16 + A.dist * 0.18);
          over.hop = lift;
          under.hop = under.it.kind === 'bar' ? 0 : -lift * 0.45;
          for (const a of [A, B]) { a.ease = easeEven; a.mult = 1.3; }
          raised.push(over);
          // The two meet in the middle: a soft bump as they land marks the swap as done.
          this._bump(A.rec, ms(TWEEN * 1.15), ms(170), 0.06);
          this._bump(B.rec, ms(TWEEN * 1.15), ms(170), 0.06);
        }
      }
      for (const a of moved) {
        if (swapped.has(a)) continue;
        const shifted = shifts.get(Math.round(a.pdx) + ',' + Math.round(a.pdy)) >= 3;
        if (shifted) continue; // A whole row sliding is one move, so it stays plain.
        if (a.dist >= 36 && a.it.kind !== 'bar') {
          if (Math.abs(a.pdx) > Math.abs(a.pdy) * 0.3) a.hop = Math.min(26, 8 + a.dist * 0.1);
          a.mult = 1.2;
          raised.push(a);
          this._bump(a.rec, ms(TWEEN * 1.05), ms(170), 0.09);
        }
      }

      // --- things that vanish in one place and appear in another
      const added = anim.filter(a => !prev.has(a.it.id) && SHAPE(a.it.kind) && !a.tray && a.it.text);
      const gone = leaving.filter(l => SHAPE(l.rec.kind) && !isTray(l.rec.item) && l.rec.item.text);
      const hotNow = anim.filter(a => SHAPE(a.it.kind) && !a.tray && a.it.text && prev.has(a.it.id) && HOT.has(a.it.tone));
      const toneMoved = a => prev.get(a.it.id).tone !== a.it.tone;
      const flew = (a, x, y, opacity, scale) => {
        const d = Math.hypot(a.it.x - x, a.it.y - y);
        if (d < 8) return false;
        a.from.x = x; a.from.y = y; a.from.opacity = opacity; a.from.scale = scale;
        a.rec.v.x = x; a.rec.v.y = y; a.rec.v.opacity = opacity; a.rec.v.scale = scale;
        a.scaleEase = easeOut;
        if (d >= 36) { a.hop = Math.min(30, 10 + d * 0.1); a.mult = 1.25; }
        a.flew = true;
        raised.push(a);
        this._bump(a.rec, ms(TWEEN * (d >= 36 ? 1.1 : 0.8)), ms(170), 0.1);
        return true;
      };
      for (const a of added) {
        const i = gone.findIndex(l => l.rec.item.text === a.it.text && !l.taken);
        if (i >= 0) {
          const l = gone[i];
          if (flew(a, l.rec.v.x, l.rec.v.y, Math.max(0.6, l.rec.v.opacity), l.rec.v.scale || 1)) {
            l.taken = true;
            l.rec.refs.g.remove();
            this.els.delete(l.id);
            leaving.splice(leaving.indexOf(l), 1);
            continue;
          }
        }
        const from = hotNow.filter(h2 => h2.it.text === a.it.text && (toneMoved(h2) || h2.it.tone === 'active'));
        if (from.length === 1) flew(a, from[0].it.x, from[0].it.kind === 'bar' ? from[0].it.y - from[0].it.h / 2 : from[0].it.y, 0.25, 0.8);
      }
      for (const l of gone) {
        if (l.taken) continue;
        const to = hotNow.filter(h2 => h2.it.text === l.rec.item.text && toneMoved(h2));
        if (to.length === 1) { l.flyTo = { x: to[0].it.x, y: to[0].it.y }; l.mult = 1.25; this._bump(to[0].rec, ms(TWEEN * 1), ms(190), 0.1); }
      }

      // --- values that changed
      const carried = new Set();
      let carries = 0;
      for (const c of cueOf('carry')) {
        const A = byId.get(String(c[1])), B = byId.get(String(c[2]));
        if (!A || !B || carries >= 3) continue;
        const text = c[3] != null ? String(c[3]) : String(A.it.text || B.it.text || '');
        if (!text) continue;
        this._carry(A.it, B.it, text, 0, ms(340), B.rec);
        carried.add(B); carries++;
      }
      for (const a of anim) {
        const p = prev.get(a.it.id);
        if (!p || a.it.text === p.text || a.it.kind === 'edge') continue;
        if (a.it.kind === 'text') { a.from.opacity = Math.min(a.from.opacity, 0.3); a.rec.v.opacity = a.from.opacity; continue; }
        if (!SHAPE(a.it.kind) || a.tray || !a.it.text || carried.has(a)) continue;
        const src = anim.filter(b => b !== a && SHAPE(b.it.kind) && !b.tray && b.it.text === a.it.text && HOT.has(b.it.tone) && (prev.get(b.it.id) || {}).text === b.it.text);
        if (src.length === 1 && carries < 2) { this._carry(src[0].it, a.it, a.it.text, 0, ms(320), a.rec); carries++; }
        else this._bump(a.rec, 0, ms(230), 0.14);
      }

      // --- what a tone change means
      const newly = t => anim.filter(a => SHAPE(a.it.kind) && !a.tray && prev.has(a.it.id) && prev.get(a.it.id).tone !== t && a.it.tone === t);
      const byX = list => list.slice().sort((a, b) => a.it.x - b.it.x || a.it.y - b.it.y);
      let rings = 0;
      const ring = (a, at, d, g) => { if (rings < 10) { rings++; this._ring(a.it, at, d, g); } };

      const act = newly('active');
      act.forEach(a => ring(a, 0, ms(340)));
      if (cueOf('compare').length) {
        for (const c of cueOf('compare')) {
          const A = byId.get(String(c[1])), B = byId.get(String(c[2]));
          if (A && B) this._link(A.it, B.it, 0, ms(520));
        }
      } else if (act.length === 2) {
        this._link(act[0].it, act[1].it, 0, ms(520));
      } else if (act.length === 1) {
        const others = anim.filter(b => b !== act[0] && SHAPE(b.it.kind) && !b.tray && (b.it.tone === 'warn' || b.it.tone === 'active') && prev.has(b.it.id));
        if (others.length === 1 && act[0].it.kind === others[0].it.kind) this._link(act[0].it, others[0].it, 0, ms(520));
      }

      const found = new Set(cueOf('found').flatMap(c => [].concat(c[1]).map(String)));
      const oks = newly('ok');
      const okStep = oks.length >= 3 ? Math.min(45, 180 / oks.length) : 0;
      byX(oks).forEach((a, n) => {
        const p = prev.get(a.it.id);
        if (found.has(a.it.id) || (a.it.scale || 1) > (p.scale || 1) + 0.01) {
          ring(a, 0, ms(420), 18); ring(a, ms(110), ms(420), 12);
          this._bump(a.rec, 0, ms(300), 0.2);
        } else {
          ring(a, ms(n * okStep), ms(340));
          this._bump(a.rec, ms(n * okStep), ms(220), 0.08);
        }
      });
      for (const a of newly('accent')) ring(a, 0, ms(340));
      for (const a of newly('warn')) this._bump(a.rec, 0, ms(200), 0.07);
      for (const a of newly('bad')) {
        this._nudge(a.rec, 0, ms(360), (r, t) => { r.dx += Math.sin(t * Math.PI * 4) * (1 - t) * 6; });
      }
      // Thrown away: the tiles drop into the floor, one after another.
      const sunk = newly('muted');
      for (const c of cueOf('discard')) for (const id of [].concat(c[1]).map(String)) {
        const a = byId.get(id);
        if (a && !sunk.includes(a)) sunk.push(a);
      }
      const sinkStep = sunk.length >= 2 ? Math.min(26, 130 / sunk.length) : 0;
      byX(sunk).forEach((a, n) => {
        this._nudge(a.rec, ms(n * sinkStep), ms(240), (r, t) => { r.dy += Math.sin(t * Math.PI) * 7; r.ds *= 1 - Math.sin(t * Math.PI) * 0.05; });
      });

      // Edges: a dot runs along the link that just lit up.
      let dots = 0;
      for (const a of anim) {
        if (a.it.kind !== 'edge' || !['active', 'ok', 'accent'].includes(a.it.tone) || dots >= 6) continue;
        const p = prev.get(a.it.id);
        if (p && p.tone === a.it.tone) continue;
        // The dot runs away from what was already reached, towards what is new.
        const A = byId.get(a.it.from), B = byId.get(a.it.to);
        const was = n => n && prev.get(n.it.id);
        const changed = n => n && (!was(n) || was(n).tone !== n.it.tone);
        const reverse = changed(A) && !changed(B) ? true : !changed(A) && !changed(B) && B && A && B.it.tone === 'active' && A.it.tone !== 'active';
        this._dot(a.it, p ? 0 : ms(60), ms(380), reverse);
        dots++;
      }

      // Finished: when the last step leaves things done, a single wave runs across them.
      const waves = [];
      if (opts.last) {
        const done = anim.filter(a => SHAPE(a.it.kind) && !a.tray && a.it.tone === 'ok');
        if (done.length >= 2) waves.push(done);
      }
      for (const c of cueOf('wave')) waves.push([].concat(c[1]).map(id => byId.get(String(id))).filter(Boolean));
      for (const w of waves) {
        const step = Math.min(50, 280 / Math.max(1, w.length));
        byX(w).forEach((a, n) => {
          this._nudge(a.rec, ms(TWEEN * 0.5 + n * step), ms(260), (r, t) => { r.dy -= Math.sin(t * Math.PI) * 8; });
        });
      }

      raised.forEach(a => { const g = a.rec.refs.g; if (g.parentNode) g.parentNode.appendChild(g); });
    }

    show(frame, opts = {}) {
      const instant = opts.instant || reduced();
      const sp = opts.speed || 1;
      const dur = instant ? 0 : TWEEN / sp;
      cancelAnimationFrame(this.raf);
      // Start from where everything is drawn right now, so a new step never stutters.
      for (const rec of this.els.values()) {
        if (rec.kind !== 'edge' && !instant && (rec.dx || rec.dy || rec.arc || rec.ds !== 1)) {
          rec.v.x += rec.dx; rec.v.y += rec.dy + rec.arc; rec.v.scale = (rec.v.scale == null ? 1 : rec.v.scale) * rec.ds;
        }
        rec.dx = 0; rec.dy = 0; rec.arc = 0; rec.ds = 1;
      }
      this._killFx();
      this.items = frame.items;
      const prev = new Map();
      for (const [id, rec] of this.els) if (!rec.leaving) prev.set(id, rec.item);
      const nextIds = new Set();
      const anim = [];
      const under = tilesUnder(frame);
      for (const it of frame.items) {
        nextIds.add(it.id);
        let rec = this.els.get(it.id);
        const to = this._targets(it);
        if (rec && rec.kind !== it.kind) { rec.refs.g.remove(); this.els.delete(it.id); prev.delete(it.id); rec = null; }
        const tray = isTray(it);
        let ease = easeOut, scaleEase = easeOut;
        if (!rec) {
          const refs = this._create(it);
          // New items appear where they sit, so nothing flies in from the corner.
          const from = Object.assign({}, to, { opacity: 0, scale: it.kind === 'text' || it.kind === 'area' || it.kind === 'pointer' ? 1 : 0.6 * (to.scale || 1) });
          if (it.kind === 'edge') { from.grow = it.dashed ? 1 : 0; from.scale = 1; }
          if (it.kind === 'bar') from.h = 0;
          if (tray) { from.y = it.y - 24; from.scale = 1; ease = easeBack; }
          if (it.kind === 'pointer') { from.y = it.y + (it.dir === 'down' ? -12 : 12); ease = easeBack; }
          if (SHAPE(it.kind) && !tray) scaleEase = easeBack;
          rec = { refs, kind: it.kind, v: from, dx: 0, dy: 0, arc: 0, ds: 1 };
          this.els.set(it.id, rec);
        }
        // A removal that is in progress gets cancelled if the item returns.
        rec.leaving = false;
        anim.push({ rec, it, tray, from: Object.assign({}, rec.v), to, hop: 0, mult: 1, ease, scaleEase, pulse: !!it.pulse });
      }
      const leaving = [];
      for (const [id, rec] of this.els) {
        if (!nextIds.has(id)) {
          rec.leaving = true;
          leaving.push({ id, rec, opacity: rec.v.opacity, scale: rec.v.scale == null ? 1 : rec.v.scale, x: rec.v.x, y: rec.v.y, mult: 1 });
        }
      }
      if (!instant) {
        if (!opts.quiet) this._choreograph(frame, prev, anim, leaving, sp, opts);
        for (const a of anim) if (a.pulse) this._bump(a.rec, 0, 300 / sp, 0.16);
      }
      // Set classes after the choreography has read the old items.
      for (const a of anim) { a.rec.item = a.it; this._static(a.it, a.rec, under); }
      for (const a of anim) {
        a.moves = !!a.hop || a.it.kind === 'edge' || Object.keys(a.to).some(k => a.from[k] !== a.to[k]);
        a.painted = false;
      }
      const edges = anim.filter(a => a.it.kind === 'edge');
      let longest = dur;
      for (const a of anim) longest = Math.max(longest, dur * a.mult);
      for (const l of leaving) longest = Math.max(longest, dur * l.mult);
      const start = performance.now();
      const step = now => {
        const el = instant ? Infinity : now - start;
        for (const r of this.fxRecs) { r.dx = 0; r.dy = 0; r.ds = 1; }
        // Effects run first, so items paint with their nudges applied.
        let busy = false;
        if (this.fx.length) {
          const left = [];
          for (const f of this.fx) {
            const t = (el - f.at) / f.dur;
            if (t < 0) { left.push(f); busy = true; continue; }
            if (t >= 1) { f.fn(1); if (f.node) f.node.remove(); continue; }
            f.fn(t);
            left.push(f);
            busy = true;
          }
          this.fx = left;
        }
        const moving = el < longest;
        for (const a of anim) {
          if (a.it.kind === 'edge') continue;
          const rec = a.rec;
          if (a.moves && !a.done) {
            const T = dur * a.mult;
            const raw = T === 0 ? 1 : clamp01(el / T);
            const v = rec.v, t = a.ease(raw), te = easeOut(raw);
            for (const k in a.to) {
              const f = a.from[k] == null ? a.to[k] : a.from[k];
              if (k === 'x' || k === 'y') v[k] = lerp(f, a.to[k], t);
              else if (k === 'scale') v[k] = lerp(f, a.to[k], a.scaleEase(raw));
              else v[k] = lerp(f, a.to[k], te);
            }
            rec.arc = a.hop ? -Math.sin(raw * Math.PI) * a.hop : 0;
            if (raw >= 1) a.done = true;
            this._paint(rec);
          } else if (!a.painted || this.fxRecs.has(rec)) {
            if (!a.moves) for (const k in a.to) rec.v[k] = a.to[k];
            this._paint(rec);
          }
          a.painted = true;
        }
        for (const a of edges) {
          const raw = dur === 0 ? 1 : clamp01(el / dur), te = easeOut(raw);
          for (const k in a.to) a.rec.v[k] = lerp(a.from[k] == null ? a.to[k] : a.from[k], a.to[k], te);
          this._paintEdge(a.rec);
        }
        for (const l of leaving) {
          const T = dur * l.mult;
          const raw = T === 0 ? 1 : clamp01(el / T), t = easeOut(raw), rec = l.rec;
          if (rec.kind === 'edge') {
            rec.v.opacity = l.opacity * (1 - t);
            rec.refs.g.setAttribute('opacity', rec.v.opacity.toFixed(3));
          } else {
            rec.v.opacity = l.flyTo ? l.opacity * (1 - raw * raw * raw) : l.opacity * (1 - t);
            if (l.flyTo) { rec.v.x = lerp(l.x, l.flyTo.x, easeEven(raw)); rec.v.y = lerp(l.y, l.flyTo.y, easeEven(raw)) - Math.sin(raw * Math.PI) * 22; }
            else if (isTray(rec.item)) rec.v.y = l.y - 22 * t;
            else if (SHAPE(rec.kind) || rec.kind === 'pointer') rec.v.scale = lerp(l.scale, l.scale * 0.8, t);
            this._paint(rec);
          }
        }
        if (moving || busy) { this.raf = requestAnimationFrame(step); return; }
        for (const l of leaving) if (l.rec.leaving) { l.rec.refs.g.remove(); this.els.delete(l.id); }
        for (const r of this.fxRecs) { r.dx = 0; r.dy = 0; r.ds = 1; this._paint(r); }
        this.fxRecs.clear();
      };
      if (instant) step(start);
      else {
        // First paint now, so tone and text answer the press in the same frame.
        step(start);
      }
    }
    clear() {
      cancelAnimationFrame(this.raf);
      this._killFx();
      for (const rec of this.els.values()) rec.refs.g.remove();
      this.els.clear();
    }
  }

  // --------------------------------------------------------------- Player
  const ICONS = {
    restart: '<path d="M5 5h3v14H5zM20 5 9.5 12 20 19z"/>',
    back: '<path d="M15 5 7 12l8 7z"/>',
    next: '<path d="m9 5 8 7-8 7z"/>',
    end: '<path d="M16 5h3v14h-3zM4 5l10.5 7L4 19z"/>',
    replay: '<path d="M4 12a8 8 0 1 0 3-6.2L4 8M4 3v5h5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    play: '<path d="M7 4.5v15l13-7.5z"/>',
    pause: '<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>',
  };
  const icon = n => `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor">${ICONS[n]}</svg>`;

  const players = new Set();

  /* Layout, top to bottom: title and inputs, the stage, the narration attached to it, one bar of controls.
     Under that, on paper, the dock: the code, always moving to the current line, then variables and output. */
  function mount(host, name, opts = {}) {
    const def = registry[name];
    const fig = h('figure', 'viz');
    fig.tabIndex = 0;
    fig.setAttribute('aria-label', (def && def.title ? def.title : 'Animation') + '. Left and right arrow keys step through it. Space plays and pauses.');
    host.appendChild(fig);
    if (!def) {
      fig.appendChild(h('p', 'viz-error', 'This picture could not load: ' + name));
      console.error('Viz: missing', name);
      return null;
    }

    const params = {};
    (def.inputs || []).forEach(i => { params[i.key] = i.value; });
    Object.assign(params, opts.params);

    if (def.title && !opts.hideTitle) fig.appendChild(h('figcaption', 'viz-title', def.title));

    // Inputs let the learner change the data, which is where the real learning happens.
    let inputsBar = null;
    if (def.inputs && def.inputs.length) {
      inputsBar = h('form', 'viz-inputs');
      inputsBar.addEventListener('submit', e => { e.preventDefault(); rebuild(); });
      def.inputs.forEach(i => {
        const wrap = h('label', 'viz-input');
        wrap.appendChild(h('span', '', i.label));
        let inp;
        if (i.type === 'select') {
          inp = h('select');
          i.options.forEach(o => {
            const op = h('option', '', o.label == null ? o : o.label);
            op.value = o.value == null ? o : o.value;
            inp.appendChild(op);
          });
        } else {
          inp = h('input');
          inp.type = i.type === 'number' ? 'number' : 'text';
          if (i.min != null) inp.min = i.min;
          if (i.max != null) inp.max = i.max;
          if (i.size) inp.size = i.size;
        }
        inp.value = params[i.key];
        inp.addEventListener('change', () => {
          if (i.type === 'number') {
            // Typing can go past min and max, and a huge number would freeze the page.
            let n = inp.value === '' ? i.value : Number(inp.value);
            if (!Number.isFinite(n)) n = i.value;
            if (i.min != null) n = Math.max(i.min, n);
            if (i.max != null) n = Math.min(i.max, n);
            inp.value = n;
            params[i.key] = n;
          } else {
            params[i.key] = inp.value;
          }
          rebuild();
        });
        wrap.appendChild(inp);
        inputsBar.appendChild(wrap);
      });
      fig.appendChild(inputsBar);
    }

    const stageWrap = h('div', 'viz-stage');
    const size = def.size || [560, 260];
    const svg = svgEl('svg', { viewBox: `0 0 ${size[0]} ${size[1]}`, role: 'img', class: 'viz-svg', preserveAspectRatio: 'xMidYMid meet' });
    stageWrap.appendChild(svg);
    fig.appendChild(stageWrap);

    const sayWrap = h('div', 'viz-saywrap');
    const say = h('p', 'viz-say');
    say.setAttribute('aria-live', 'polite');
    sayWrap.appendChild(say);
    fig.appendChild(sayWrap);

    const askBox = h('div', 'viz-ask');
    askBox.hidden = true;
    fig.appendChild(askBox);

    const controls = h('div', 'viz-controls');
    const mkBtn = (cls, label, ic) => {
      const b = h('button', 'viz-btn ' + cls);
      b.type = 'button';
      b.setAttribute('aria-label', label);
      b.title = label;
      b.innerHTML = icon(ic);
      controls.appendChild(b);
      return b;
    };
    const restartBtn = mkBtn('viz-restart', 'Go back to the start', 'restart');
    const backBtn = mkBtn('', 'One step back', 'back');
    const playBtn = mkBtn('viz-play', 'Play', 'play');
    const nextBtn = mkBtn('viz-next', 'One step forward', 'next');
    const endBtn = mkBtn('viz-end', 'Go to the last step', 'end');
    const scrubWrap = h('div', 'viz-scrubwrap');
    const scrub = h('input', 'viz-scrub');
    scrub.type = 'range';
    scrub.min = 0;
    scrub.value = 0;
    scrub.setAttribute('aria-label', 'Choose a step');
    const ticks = h('div', 'viz-ticks');
    ticks.setAttribute('aria-hidden', 'true');
    scrubWrap.append(scrub, ticks);
    controls.appendChild(scrubWrap);
    const count = h('span', 'viz-count');
    controls.appendChild(count);
    const speedBtn = h('button', 'viz-btn viz-speed');
    speedBtn.type = 'button';
    speedBtn.innerHTML = '<span class="viz-speed-word">Speed </span><b></b>';
    const speedVal = speedBtn.querySelector('b');
    controls.appendChild(speedBtn);
    fig.appendChild(controls);

    // The dock: code on the left, what the code knows on the right.
    let codeLines = null, codeBox = null, codeClip = null, codeIn = null, codeHl = null, codeOpen = !!(root.Store && root.Store.state && root.Store.state.prefs && root.Store.state.prefs.vizCodeOpen);
    let moreBtn = null, codeHead = null, lineTops = null, lineHts = null;
    const dock = h('div', 'viz-dock');
    const varsBox = h('div', 'viz-vars');
    const outBox = h('pre', 'viz-out');
    if (def.code) {
      const wrap = h('div', 'viz-codewrap');
      codeHead = h('div', 'viz-codehead');
      codeHead.appendChild(h('span', 'viz-codelabel', 'Code'));
      moreBtn = h('button', 'viz-codemore');
      moreBtn.type = 'button';
      moreBtn.addEventListener('click', () => {
        codeOpen = !codeOpen;
        if (root.Store && root.Store.state) { root.Store.state.prefs.vizCodeOpen = codeOpen; root.Store.save(); }
        layoutCode();
        placeCode(false);
      });
      codeHead.appendChild(moreBtn);
      wrap.appendChild(codeHead);
      codeBox = h('pre', 'viz-code');
      codeClip = h('div', 'viz-codeclip');
      codeIn = h('div', 'viz-codein');
      codeHl = h('div', 'viz-codehl');
      codeIn.appendChild(codeHl);
      codeLines = def.code.replace(/\n$/, '').split('\n').map(line => {
        const l = h('div', 'viz-codeline');
        l.style.setProperty('--ind', line.length - line.trimStart().length);
        l.innerHTML = root.Py && root.Py.highlight ? root.Py.highlight(line) || ' ' : line || ' ';
        codeIn.appendChild(l);
        return l;
      });
      codeClip.appendChild(codeIn);
      codeBox.appendChild(codeClip);
      wrap.appendChild(codeBox);
      dock.appendChild(wrap);
      dock.classList.add('has-code');
    }
    const stateBox = h('div', 'viz-state');
    stateBox.append(varsBox, outBox);
    dock.appendChild(stateBox);
    fig.appendChild(dock);

    if (def.note) fig.appendChild(h('p', 'viz-note', def.note));
    const stepsBox = h('details', 'viz-steps');
    const stepsSummary = h('summary', '', 'Read all the steps as text');
    const stepsList = h('ol');
    stepsBox.append(stepsSummary, stepsList);
    fig.appendChild(stepsBox);

    const stage = new Stage(svg);
    let frames = [], i = 0, playing = false, timer = 0, speed = savedSpeed(), answered = new Set(), done = false, lastWidth = 0;

    // ------------------------------------------------------- fit to the stage
    /* A wide stage shrinks on a phone. Labels stop shrinking at MIN_LABEL_PX, so they stay readable.
       That makes text wider in stage units, so the fit and the floor settle together. */
    function refit() {
      if (!frames.length) return;
      const cw = stageWrap.clientWidth;
      if (!cw) return;
      const maxH = Math.max(230, Math.min(480, (root.innerHeight || 800) * 0.58));
      svg.style.maxHeight = maxH + 'px';
      const minW = Math.max(300, cw / 1.45), minH = Math.max(170, Math.min(230, maxH / 1.9));
      let floor = 0, box = null;
      for (let n = 0; n < 5; n++) {
        box = fitScene(frames, size, { floor, measure, minW, minH });
        const k = Math.min(cw / box.w, maxH / box.h);
        const want = MIN_LABEL_PX / k;
        if (want <= floor + 0.05) break;
        floor = want;
      }
      svg.setAttribute('viewBox', `${box.x} ${box.y} ${box.w} ${box.h}`);
      svg.style.setProperty('--vz-floor', floor.toFixed(2) + 'px');
      stage.setFloor(floor);
    }
    /* Holds room for the longest narration, so the controls do not jump under the learner's finger. */
    function reserveSay() {
      const w = say.clientWidth;
      if (!w || frames.length < 2) { say.style.minHeight = ''; return; }
      const probe = h('p', 'viz-say');
      probe.style.cssText = `position:absolute;visibility:hidden;left:0;top:0;width:${w}px;min-height:0`;
      sayWrap.appendChild(probe);
      let most = 0;
      const seen = new Set();
      for (const f of frames) {
        if (!f.say || seen.has(f.say)) continue;
        seen.add(f.say);
        probe.textContent = f.say;
        most = Math.max(most, probe.offsetHeight);
      }
      probe.remove();
      say.style.minHeight = most ? most + 'px' : '';
    }
    if ('ResizeObserver' in root) {
      new ResizeObserver(() => {
        const w = stageWrap.clientWidth;
        if (Math.abs(w - lastWidth) < 1) return;
        lastWidth = w;
        refit();
        reserveSay();
        layoutCode();
        placeCode(false);
      }).observe(stageWrap);
    }
    if (document.fonts && document.fonts.status !== 'loaded') {
      document.fonts.ready.then(() => { measureCache = new Map(); if (fig.isConnected && frames.length) { refit(); reserveSay(); layoutCode(); placeCode(false); stage.show(frames[i], { instant: true }); } });
    }

    // ------------------------------------------------------- speed
    function paintSpeed() {
      speedVal.textContent = speed + 'x';
      speedBtn.setAttribute('aria-label', 'Change speed. Now ' + speed + 'x');
      speedBtn.title = 'Change speed. Now ' + speed + 'x';
      fig.style.setProperty('--vz-speed', speed);
    }
    speedBtn.addEventListener('click', () => {
      speed = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
      saveSpeed(speed);
      paintSpeed();
      if (playing) schedule();
      players.forEach(p => { if (p.fig !== fig && p.fig.isConnected) p.setSpeed(speed); });
    });
    // Every player on the page follows the same speed. Players from a page the learner left get dropped here.
    const made = Date.now();
    players.forEach(p => { if (!p.fig.isConnected && made - p.made > 5000) players.delete(p); });
    players.add({ fig, made, setSpeed(v) { speed = v; paintSpeed(); if (playing) schedule(); } });
    paintSpeed();

    function dwell(f) {
      const words = (f.say || '').trim().split(/\s+/).filter(Boolean).length;
      return Math.min(1500, 800 + words * 40) / speed;
    }
    function stop() {
      playing = false;
      clearTimeout(timer);
      paintPlay();
      say.setAttribute('aria-live', 'polite');
    }
    function paintPlay() {
      const atEnd = frames.length && i >= frames.length - 1;
      playBtn.innerHTML = icon(playing ? 'pause' : atEnd ? 'replay' : 'play');
      const label = playing ? 'Pause' : atEnd ? 'Play again' : 'Play';
      playBtn.setAttribute('aria-label', label);
      playBtn.title = label;
    }
    function schedule() {
      clearTimeout(timer);
      if (!playing) return;
      timer = setTimeout(() => {
        // The learner went to another page, so this player has nobody to play for.
        if (!fig.isConnected) { stop(); return; }
        if (i >= frames.length - 1) {
          if (opts.loop) go(0, true); else stop();
          return schedule();
        }
        go(i + 1);
        schedule();
      }, dwell(frames[i]));
    }
    function play() {
      if (frames.length < 2) return;
      if (i >= frames.length - 1) go(0, true);
      playing = true;
      paintPlay();
      // During play the narration is on screen. Screen readers hear it when paused.
      say.setAttribute('aria-live', 'off');
      schedule();
    }

    // ------------------------------------------------------- side panels
    /* How many lines the code panel shows depends on the room there is. Short code simply shows in full. */
    function codeRows() {
      const room = (root.innerHeight || 800) * 0.32;
      return Math.max(7, Math.min(13, Math.floor(room / 23)));
    }
    function layoutCode() {
      if (!codeLines) return;
      codeClip.style.height = '';
      codeBox.classList.remove('is-window');
      const lh = parseFloat(getComputedStyle(codeBox).lineHeight) || 23;
      lineTops = codeLines.map(l => l.offsetTop);
      lineHts = codeLines.map(l => l.offsetHeight);
      const all = codeIn.offsetHeight, rows = codeRows();
      const fits = all <= (rows + 1) * lh + 1;
      codeHead.hidden = fits;
      moreBtn.textContent = codeOpen ? 'Show fewer lines' : 'Show all ' + codeLines.length + ' lines';
      moreBtn.setAttribute('aria-expanded', String(codeOpen));
      if (!fits && !codeOpen) {
        codeBox.classList.add('is-window');
        codeClip.style.height = Math.round(rows * lh) + 'px';
      }
    }
    /* The highlight slides between lines. In the window the code rolls by whole lines, with the current line in the middle. */
    function placeCode(animate) {
      if (!codeLines || !frames.length) return;
      if (!lineTops) layoutCode();
      const f = frames[i];
      const k = f.line - 1, active = codeLines[k];
      codeLines.forEach((l, n) => l.classList.toggle('on', n === k));
      if (!animate) { codeHl.style.transition = 'none'; codeIn.style.transition = 'none'; }
      const windowed = codeBox.classList.contains('is-window');
      if (active) {
        codeHl.style.opacity = 1;
        codeHl.style.height = lineHts[k] + 'px';
        codeHl.style.transform = `translateY(${lineTops[k]}px)`;
      } else codeHl.style.opacity = 0;
      if (windowed) {
        const win = codeClip.clientHeight, all = codeIn.offsetHeight;
        const top = active ? lineTops[k] + lineHts[k] / 2 - win / 2 : scrollY;
        const want = Math.max(0, Math.min(all - win, top));
        // Start on a whole line, so nothing is cut through the middle at the top.
        let first = 0;
        while (first < lineTops.length - 1 && lineTops[first + 1] <= want + 1) first++;
        if (first < lineTops.length - 1 && want - lineTops[first] > lineHts[first] / 2 && lineTops[first + 1] + win <= all + lineHts[first]) first++;
        scrollY = lineTops[first];
        codeIn.style.transform = `translateY(${-scrollY}px)`;
        // A wrapped line that would be cut at the bottom waits until it fits.
        let below = 0;
        codeLines.forEach((l, n) => {
          const out = lineTops[n] + lineHts[n] > scrollY + win + 1;
          if (out) below++;
          l.style.visibility = out ? 'hidden' : '';
        });
        codeBox.classList.toggle('more-above', first > 0);
        codeBox.classList.toggle('more-below', below > 0);
      } else {
        codeIn.style.transform = '';
        codeLines.forEach(l => { l.style.visibility = ''; });
        codeBox.classList.remove('more-above', 'more-below');
      }
      if (!animate) { void codeHl.offsetHeight; codeHl.style.transition = ''; codeIn.style.transition = ''; }
    }
    let scrollY = 0;
    function renderVars(f, flash) {
      varsBox.textContent = '';
      varsBox.hidden = !f.vars;
      if (!f.vars) return;
      for (const k in f.vars) {
        const chip = h('span', 'viz-var');
        chip.appendChild(h('b', '', k));
        const val = String(f.vars[k]);
        const v = h('span', '', val);
        chip.appendChild(v);
        const prev = frames[i - 1] && frames[i - 1].vars ? frames[i - 1].vars[k] : undefined;
        if (prev !== undefined && String(prev) !== val) chip.classList.add('changed');
        if (flash && chip.classList.contains('changed')) chip.classList.add('flash');
        varsBox.appendChild(chip);
      }
    }
    function renderOut(f) {
      outBox.hidden = f.out == null;
      outBox.textContent = f.out == null ? '' : f.out;
      // The newest line is the one to read, so keep it in view.
      outBox.scrollTop = outBox.scrollHeight;
    }
    /* The old sentence fades out as the new one fades in. */
    function changeSay(text, animate) {
      if (say.textContent === text) return;
      if (sayGhost) { sayGhost.remove(); sayGhost = null; }
      if (animate && say.textContent && say.animate) {
        const ghost = h('p', 'viz-say viz-say-old', say.textContent);
        ghost.setAttribute('aria-hidden', 'true');
        sayWrap.appendChild(ghost);
        sayGhost = ghost;
        const d = 150 / speed;
        ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: d, easing: 'ease-out' }).onfinish = () => { ghost.remove(); if (sayGhost === ghost) sayGhost = null; };
        say.animate([{ opacity: 0 }, { opacity: 1 }], { duration: d, easing: 'ease-in' });
      }
      say.textContent = text;
    }
    let sayGhost = null;
    function renderAsk(f) {
      askBox.textContent = '';
      const open = f.ask && !answered.has(i);
      askBox.hidden = !f.ask;
      nextBtn.disabled = !!open || i >= frames.length - 1;
      playBtn.disabled = !!open || frames.length < 2;
      scrub.disabled = !!open;
      fig.classList.toggle('viz-asking', !!open);
      if (!f.ask) return;
      if (open) stop();
      askBox.appendChild(h('p', 'viz-askq', f.ask.q));
      const row = h('div', 'viz-askopts');
      const feedback = h('p', 'viz-askfb');
      feedback.setAttribute('role', 'status');
      f.ask.options.forEach((o, n) => {
        const b = h('button', 'viz-opt', o);
        b.type = 'button';
        b.addEventListener('click', () => {
          const right = n === f.ask.answer;
          row.querySelectorAll('button').forEach((x, k) => {
            x.disabled = true;
            if (k === f.ask.answer) x.classList.add('right');
          });
          if (!right) b.classList.add('wrong');
          feedback.textContent = (right ? 'Yes. ' : 'Good guess. Here is what really happens. ') + (f.ask.why || '');
          answered.add(i);
          fig.classList.remove('viz-asking');
          nextBtn.disabled = i >= frames.length - 1;
          playBtn.disabled = false;
          scrub.disabled = false;
          if (root.DSA && root.DSA.emit) root.DSA.emit('viz:answer', { name, right });
          nextBtn.focus({ preventScroll: true });
        });
        row.appendChild(b);
      });
      if (answered.has(i)) {
        row.querySelectorAll('button').forEach((x, n) => {
          x.disabled = true;
          if (n === f.ask.answer) x.classList.add('right');
        });
        feedback.textContent = f.ask.why || '';
      }
      askBox.appendChild(row);
      askBox.appendChild(feedback);
    }
    function go(n, instant) {
      n = Math.max(0, Math.min(frames.length - 1, n));
      // A locked question stops the learner from skipping past it by scrubbing.
      for (let q = i; q < n; q++) {
        if (frames[q].ask && !answered.has(q)) { n = q; break; }
      }
      const backward = n < i;
      const jump = instant || Math.abs(n - i) > 1;
      i = n;
      const f = frames[i];
      stage.show(f, { instant: jump, quiet: backward, speed, last: !jump && !backward && i === frames.length - 1 && frames.length > 1 });
      const calm = jump || reduced();
      changeSay(f.say || '', !calm);
      svg.setAttribute('aria-label', f.say || def.title || '');
      scrub.value = i;
      scrubWrap.style.setProperty('--p', frames.length > 1 ? i / (frames.length - 1) : 0);
      scrub.setAttribute('aria-valuetext', `Step ${i + 1} of ${frames.length}: ${f.say || ''}`);
      count.textContent = `Step ${i + 1} of ${frames.length}`;
      backBtn.disabled = i === 0;
      restartBtn.disabled = i === 0;
      nextBtn.disabled = i >= frames.length - 1;
      endBtn.disabled = i >= frames.length - 1;
      if (!playing) paintPlay();
      placeCode(!calm);
      renderVars(f, !calm && !backward);
      renderOut(f);
      renderAsk(f);
      if (i === frames.length - 1 && !done && frames.length > 1) {
        done = true;
        if (root.DSA && root.DSA.emit) root.DSA.emit('viz:done', { name });
      }
    }
    function rebuild() {
      stop();
      let scene;
      try {
        scene = build(name, params);
      } catch (e) {
        say.textContent = 'That input did not work: ' + e.message;
        return;
      }
      frames = scene.frames;
      answered = new Set();
      done = false;
      i = 0;
      stage.clear();
      stage.setFloors(frames);
      scrub.max = frames.length - 1;
      ticks.textContent = '';
      frames.forEach((f, k) => {
        if (!f.ask || frames.length < 2) return;
        const t = h('i', 'viz-tick');
        t.style.setProperty('--at', k / (frames.length - 1));
        ticks.appendChild(t);
      });
      refit();
      lastWidth = stageWrap.clientWidth;
      const hasState = frames.some(x => x.vars || x.out != null);
      dock.classList.toggle('no-state', !hasState);
      dock.hidden = !def.code && !hasState;
      layoutCode();
      scrollY = 0;
      go(0, true);
      const still = frames.length < 2;
      controls.hidden = still;
      stepsBox.hidden = still || !frames.some(f => f.say);
      stepsList.textContent = '';
      frames.forEach(f => { if (f.say) stepsList.appendChild(h('li', '', f.say)); });
      fig.classList.toggle('viz-still', still);
      reserveSay();
    }

    restartBtn.addEventListener('click', () => { stop(); go(0, true); });
    backBtn.addEventListener('click', () => { stop(); go(i - 1); });
    nextBtn.addEventListener('click', () => { stop(); go(i + 1); });
    endBtn.addEventListener('click', () => { stop(); go(frames.length - 1, true); });
    playBtn.addEventListener('click', () => { playing ? stop() : play(); });
    scrub.addEventListener('input', () => { stop(); go(Number(scrub.value), true); });
    fig.addEventListener('keydown', e => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'select') return;
      if (e.key === 'ArrowRight') { e.preventDefault(); stop(); if (!nextBtn.disabled) go(i + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); stop(); go(i - 1); }
      else if (e.key === ' ' && tag !== 'button') { e.preventDefault(); playing ? stop() : play(); }
      else if (e.key === 'Home') { e.preventDefault(); stop(); go(0, true); }
      else if (e.key === 'End') { e.preventDefault(); stop(); go(frames.length - 1, true); }
    });

    rebuild();

    // Short looping pictures start when seen and stop when they scroll away.
    if (opts.auto && !reduced() && 'IntersectionObserver' in root) {
      const io = new IntersectionObserver(es => {
        es.forEach(en => { if (en.isIntersecting) { if (!playing) play(); } else stop(); });
      }, { threshold: 0.4 });
      io.observe(fig);
    }
    return { fig, play, stop, go, frames: () => frames };
  }

  root.Viz = { Scene, register, build, registry, mount, fitScene };
})(typeof window !== 'undefined' ? window : globalThis);
