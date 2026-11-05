/* Visuals for module 23. Names start with the module id.
 * The first 4 show a parent list and its tree picture together, and both change at once.
 * Arrows go UP in these trees, from a child to its parent.
 * Every input may be empty or junk, so each build must cope with that.
 */
(function () {
  // ------------------------------------------------------------- small helpers
  const whole = (v, lo, hi, fallback) => {
    let n = Math.round(Number(v));
    if (v === '' || v == null || !Number.isFinite(n)) n = fallback;
    return Math.max(lo, Math.min(hi, n));
  };
  const many = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  const skipNote = skipped => (skipped ? ' Some of what you typed was skipped.' : '');

  /* A question for a frame. Drops repeats and moves the right answer around. */
  function askIt(q, right, wrongs, why, turn = 0) {
    const seen = new Set([String(right)]);
    const rest = [];
    wrongs.forEach(w => {
      const t = String(w);
      if (!seen.has(t)) { seen.add(t); rest.push(t); }
    });
    const answer = turn % (rest.length + 1);
    rest.splice(answer, 0, String(right));
    return { q, options: rest, answer, why };
  }

  /* Reads "0-1, 2-3" from a text box. Anything out of range or not a pair is skipped. */
  function readPairs(text, n, limit = 6) {
    const parts = String(text == null ? '' : text).split(/[\s,;]+/).filter(Boolean);
    const pairs = [];
    let skipped = 0;
    parts.forEach(t => {
      const m = /^(\d+)[-:>]+(\d+)$/.exec(t);
      if (!m || Number(m[1]) >= n || Number(m[2]) >= n || pairs.length >= limit) { skipped += 1; return; }
      pairs.push([Number(m[1]), Number(m[2])]);
    });
    return { pairs, skipped };
  }

  /* Reads a parent list. A bad value becomes "its own parent", and any loop gets cut. */
  function readParents(text, limit = 6) {
    const parts = String(text == null ? '' : text).split(/[\s,;]+/).filter(Boolean).slice(0, limit);
    const n = parts.length;
    const parent = parts.map((t, i) => {
      const v = Number(t);
      return Number.isInteger(v) && v >= 0 && v < n ? v : i;
    });
    let fixed = parts.some((t, i) => parent[i] === i && Number(t) !== i);
    parent.forEach((_, i) => {
      const seen = new Set();
      let x = i;
      while (parent[x] !== x) {
        if (seen.has(x)) { parent[x] = x; fixed = true; break; }
        seen.add(x);
        x = parent[x];
      }
    });
    return { parent, fixed };
  }

  const rootOf = (parent, x) => { while (parent[x] !== x) x = parent[x]; return x; };
  const hopsOf = (parent, x) => { let h = 0; while (parent[x] !== x) { x = parent[x]; h += 1; } return h; };
  const tallest = parent => parent.reduce((best, _, i) => Math.max(best, hopsOf(parent, i)), 0);
  const groupCount = parent => parent.filter((p, i) => p === i).length;
  /* "0 1 3 | 2 | 4", each group in one piece, for reading along. */
  function groupText(parent) {
    const by = new Map();
    parent.forEach((_, i) => {
      const r = rootOf(parent, i);
      if (!by.has(r)) by.set(r, []);
      by.get(r).push(i);
    });
    return [...by.values()].map(g => g.join(' ')).join(' | ');
  }

  /* The tree picture and the rows under it. Same ids in every frame, so items glide. */
  function forestKit(s, start, o = {}) {
    const parent = start.slice();
    const n = parent.length;
    const r = o.r || 17, top = o.top || 42, bottom = o.bottom || 204, maxGap = o.maxGap || 56;
    const cell = 52, gap = 6;
    const X = i => s.slotX(i, n, { cell, gap });
    const edges = new Set();
    const layout = () => {
      const kids = parent.map(() => []);
      const roots = [];
      parent.forEach((p, i) => { if (p === i) roots.push(i); else kids[p].push(i); });
      const depth = {}, slot = {};
      let next = 0, deepest = 0;
      const walk = (v, d) => {
        depth[v] = d;
        deepest = Math.max(deepest, d);
        if (!kids[v].length) { slot[v] = next; next += 1; return slot[v]; }
        const xs = kids[v].map(k => walk(k, d + 1));
        slot[v] = (xs[0] + xs[xs.length - 1]) / 2;
        return slot[v];
      };
      roots.forEach(v => walk(v, 0));
      const stepX = Math.min(84, 500 / Math.max(1, next));
      const stepY = deepest ? Math.min(maxGap, (bottom - top) / deepest) : 0;
      // A tall thin tree zigzags, so its arrows stay long enough to see.
      const zig = deepest >= 3 ? 26 : 0;
      return i => ({
        x: 280 + (slot[i] - (next - 1) / 2) * stepX + (depth[i] % 2 ? zig : -zig),
        y: top + depth[i] * stepY,
      });
    };
    const kit = {
      parent,
      /* Puts the picture in line with the list. Call it after each change to parent. */
      sync() {
        const at = layout();
        parent.forEach((p, i) => {
          const { x, y } = at(i);
          if (s.has('n' + i)) s.set('n' + i, { x, y });
          else s.circle('n' + i, x, y, i, { r });
          const tag = 'rt' + i;
          if (p === i) {
            if (s.has(tag)) s.set(tag, { x, y: y - r - 11 });
            else s.text(tag, x, y - r - 11, 'root', { size: 13, weight: 700 });
          } else s.del(tag);
          if (s.has('p' + i)) s.set('p' + i, { text: p });
        });
        const want = new Set();
        parent.forEach((p, i) => { if (p !== i) want.add(`e${i}_${p}`); });
        edges.forEach(id => { if (!want.has(id)) { s.del(id); edges.delete(id); } });
        parent.forEach((p, i) => {
          const id = `e${i}_${p}`;
          if (p !== i && !edges.has(id)) { s.edge(id, 'n' + i, 'n' + p); edges.add(id); }
        });
      },
      edgeOf: i => `e${i}_${parent[i]}`,
      /* A label on the left, then one box per item. */
      row(prefix, label, y, values, boxOpts) {
        s.text(prefix + 'L', 14, y, label, { size: 14, anchor: 'start', weight: 700 });
        values.forEach((v, i) => s.box(prefix + i, X(i), y, v, Object.assign({ w: cell, h: 36 }, boxOpts)));
      },
      index(y) {
        s.text('iL', 14, y, 'item', { size: 14, anchor: 'start', tone: 'muted' });
        parent.forEach((_, i) => s.text('i' + i, X(i), y, i, { size: 13, tone: 'muted', mono: true }));
      },
    };
    return kit;
  }

  // ---------------------------------------------------------------- lesson 23.1
  const FIND_UNION = py`
    def find(parent, x):
        while parent[x] != x:
            x = parent[x]
        return x

    def union(parent, a, b):
        ra = find(parent, a)
        rb = find(parent, b)
        if ra == rb:
            return False
        parent[rb] = ra
        return True
  `;

  Viz.register('m23-groups', {
    title: 'The parent list and the trees change together',
    size: [560, 300],
    code: FIND_UNION,
    inputs: [
      { key: 'n', label: 'How many items', type: 'number', value: 6, min: 1, max: 6 },
      { key: 'unions', label: 'Unions', type: 'text', value: '0-1, 2-3, 1-3, 0-3', size: 20 },
    ],
    tryInputs: [
      { n: 1, unions: '' }, { n: 1, unions: '0-0' }, { n: 2, unions: '0-1, 1-0, 0-1' }, { n: 6, unions: '' }, { n: 6, unions: '3-3' },
      { n: 6, unions: '1-0, 2-1, 3-2, 4-3, 5-4' }, { n: 6, unions: '0-1, 0-2, 0-3, 0-4, 0-5' }, { n: 3, unions: '0-9, cat, 1-2' }, { n: 'x', unions: 'junk' },
    ],
    build(s, p) {
      const n = whole(p.n, 1, 6, 6);
      const { pairs, skipped } = readPairs(p.unions, n, 5);
      const kit = forestKit(s, Array.from({ length: n }, (_, i) => i));
      const parent = kit.parent;
      kit.index(238);
      kit.row('p', 'parent', 264, parent);
      kit.sync();
      let gap = 3, turn = 0, hops = 0;
      const F = (say, line, ask, extra) => {
        gap = ask ? 0 : gap + 1;
        s.snap(say, { line, ask: ask || null, vars: Object.assign({ groups: groupCount(parent), hops }, extra || {}) });
      };
      const k = Math.min(2, n - 1);
      F('Each item starts alone. So each item is its own parent.' + skipNote(skipped), 0,
        askIt(`parent[${k}] holds ${k}. What does that tell you?`, `${k} is a root`, [`${k} has no group`, 'The list has a bug'],
          'An item that is its own parent has nobody above it. So it is the root of its group.', turn++));
      gap = 2;

      /* Walks up from x, one frame for each hop. line is the line that called find. */
      const walk = (x, name, line, extra) => {
        const root = rootOf(parent, x);
        const start = x;
        s.tone('n' + x, 'active');
        if (parent[x] !== x) {
          const ask = gap >= 2 ? askIt(`Follow the arrows up from ${x}. Which item is its root?`, root, [x, parent[x], (root + 1) % n],
            `Keep going up until an item is its own parent. Here that is ${root}.`, turn++) : null;
          F(`find(${x}) starts. parent[${x}] is not ${x}, so ${x} is not a root.`, 2, ask, extra);
          while (parent[x] !== x) {
            const up = parent[x];
            s.tone(kit.edgeOf(x), 'active');
            x = up;
            hops += 1;
            s.tone('n' + x, 'active');
            s.tone('p' + x, 'active');
            F(parent[x] === x ? `The arrow leads up to ${x}. That is 1 more hop.` : `The arrow leads up to ${x}. Go on from there.`, 3, null, extra);
          }
        }
        s.tone('n' + root, 'warn');
        const say = start === root ? `parent[${root}] is ${root}, so ${root} is its own root.` : `parent[${root}] is ${root}, so the root of ${start} is ${root}.`;
        F(`${say} ${name} now names ${root}.`, line, null, extra);
        return root;
      };

      pairs.forEach(([a, b]) => {
        s.clearTones();
        s.tone(['n' + a, 'n' + b], 'active');
        F(`union(${a}, ${b}) starts. It needs the root of each item first.`, 6);
        const ra = walk(a, 'ra', 7);
        s.clearTones();
        s.tone('n' + ra, 'warn');
        const rb = walk(b, 'rb', 8, { ra });
        s.tone('n' + ra, 'warn');
        if (ra === rb) {
          F(`Both roots are ${ra}. Look at what comes next.`, 9,
            askIt(`Both roots are ${ra}. What does union do?`, 'Nothing, they are together', [`It points ${a} at ${b}`, `It makes ${ra} point at itself again`],
              `One root means one group. So there is nothing to join, and union hands back False.`, turn++), { ra, rb });
          F(`${a} and ${b} are already in one group. union hands back False.`, 10, null, { ra, rb });
          return;
        }
        F(`The roots differ, so these are 2 groups. Now join them.`, 9,
          gap >= 1 ? askIt('Which spot in the parent list changes?', `parent[${rb}]`, [`parent[${ra}]`, `parent[${a}]`, `parent[${b}]`],
            `The root of b goes under the root of a. Only one spot changes, and it is the spot of root ${rb}.`, turn++) : null, { ra, rb });
        parent[rb] = ra;
        kit.sync();
        s.tone('p' + rb, 'warn');
        s.tone(kit.edgeOf(rb), 'active');
        F(`Spot ${rb} now holds ${ra}. Root ${rb} and all below it join root ${ra}.`, 11, null, { ra, rb });
      });
      s.clearTones();
      F(`Done. Spots with their own number are roots. There ${groupCount(parent) === 1 ? 'is 1 group' : `are ${groupCount(parent)} groups`}.`, 0);
    },
  });

  Viz.register('m23-wrong-join', {
    title: 'Join the roots, not the items',
    size: [560, 328],
    code: py`
      def bad_union(parent, a, b):
          parent[b] = a

      def good_union(parent, a, b):
          ra = find(parent, a)
          rb = find(parent, b)
          if ra != rb:
              parent[rb] = ra
    `,
    inputs: [
      { key: 'way', label: 'Which code', type: 'select', value: 'bad', options: [{ label: 'bad_union', value: 'bad' }, { label: 'good_union', value: 'good' }] },
      { key: 'unions', label: 'Unions', type: 'text', value: '0-1, 2-3, 1-3', size: 18 },
    ],
    tryInputs: [
      { way: 'bad', unions: '' }, { way: 'good', unions: '' }, { way: 'bad', unions: '0-1, 1-0' }, { way: 'good', unions: '0-1, 1-0' }, { way: 'bad', unions: '0-1, 2-1' },
      { way: 'bad', unions: '0-0, 1-1' }, { way: 'bad', unions: '0-1, 1-2, 2-0' }, { way: 'good', unions: '1-0, 2-1, 3-2, 4-3, 5-4' }, { way: 'bad', unions: 'cat, 9-9' }, { way: 'other', unions: '0-1, 1-1' },
    ],
    build(s, p) {
      const bad = p.way !== 'good';
      const n = 6;
      const { pairs, skipped } = readPairs(p.unions, n, 5);
      const kit = forestKit(s, Array.from({ length: n }, (_, i) => i));
      const parent = kit.parent;
      kit.index(238);
      kit.row('p', 'parent', 264, parent);
      s.text('grp', 280, 306, `groups: ${groupText(parent)}`, { size: 15, mono: true, weight: 700 });
      kit.sync();
      let turn = 0, gap = 3, lost = null;
      const F = (say, line, ask) => {
        gap = ask ? 0 : gap + 1;
        s.set('grp', { text: `groups: ${groupText(parent)}` });
        s.snap(say, { line, ask: ask || null, vars: { groups: groupCount(parent) } });
      };
      F((bad ? 'This code joins the items you name. Watch what happens to their groups.' : 'This code finds both roots first, then joins the roots.') + skipNote(skipped), bad ? 1 : 4);

      for (const [a, b] of pairs) {
        s.clearTones();
        s.tone(['n' + a, 'n' + b], 'active');
        if (!bad) {
          const ra = rootOf(parent, a), rb = rootOf(parent, b);
          s.tone(['n' + ra, 'n' + rb], 'warn');
          F(`union(${a}, ${b}). The roots are ${ra} and ${rb}.`, 6,
            ra !== rb && (a !== ra || b !== rb) ? askIt(`The roots are ${ra} and ${rb}. Which spot changes?`, `parent[${rb}]`, [`parent[${b}]`, `parent[${a}]`, `parent[${ra}]`],
              `Only root ${rb} moves, so all of its group comes along.`, turn++) : null);
          if (ra === rb) { F(`One root, so they are already together. Nothing changes.`, 7); continue; }
          parent[rb] = ra;
          kit.sync();
          s.tone('p' + rb, 'warn');
          s.tone(kit.edgeOf(rb), 'active');
          F(`Spot ${rb} now holds ${ra}. Nobody loses their group.`, 8);
          continue;
        }
        if (a === b) {
          const was = parent[a];
          if (was === a) { F(`${a} is already its own parent. Nothing changes.`, 2); continue; }
          parent[a] = a;
          kit.sync();
          s.tone('p' + a, 'bad');
          lost = [a, was];
          F(`parent[${a}] = ${a} cuts ${a} away from ${was}. It never asked about groups.`, 2);
          continue;
        }
        // Does a lead up to b? Then this line closes a loop.
        let x = a, loop = false;
        while (true) {
          if (x === b) { loop = true; break; }
          if (parent[x] === x) break;
          x = parent[x];
        }
        if (loop) {
          F(`bad_union(${a}, ${b}) is next. ${a} already leads up to ${b}.`, 2,
            askIt(`parent[${b}] is about to become ${a}. What will find do after this?`, 'Go round forever', [`Stop at ${b}`, `Stop at ${a}`],
              `Going up from ${a} reaches ${b}, and ${b} would lead back to ${a}. No item on that loop is a root.`, turn++));
          s.edge('loop', 'n' + b, 'n' + a, { tone: 'bad', dashed: true, bend: 46 });
          s.tone(['n' + a, 'n' + b], 'bad');
          s.tone('p' + b, 'bad');
          s.set('grp', { text: 'find would never end' });
          s.set('p' + b, { text: a });
          s.del('rt' + b);
          s.snap(`parent[${b}] now holds ${a}, so the arrows go round in a loop. find would never stop.`, { line: 2, vars: { groups: groupCount(parent) } });
          return;
        }
        const old = parent[b];
        if (old === b) {
          F(`bad_union(${a}, ${b}) sets parent[${b}] to ${a}. ${b} is a root, so this is safe.`, 2,
            gap >= 3 ? askIt(`${b} is a root. Does anyone lose their group?`, 'No', ['Yes'], `${b} brings its whole group along, as it is a root. The bug only shows when b is not a root.`, turn++) : null);
          parent[b] = a;
          kit.sync();
          s.tone('p' + b, 'warn');
          s.tone(kit.edgeOf(b), 'active');
          F(`It looks fine so far, as ${b} was a root.`, 2);
          continue;
        }
        F(`bad_union(${a}, ${b}) is next. Right now ${b} and ${old} are in one group.`, 2,
          askIt(`parent[${b}] is about to become ${a}. Will ${b} and ${old} still be together?`, 'No', ['Yes'],
            `${b} has only 1 arrow. If it points at ${a}, the arrow to ${old} is gone. ${old} stays behind.`, turn++));
        parent[b] = a;
        kit.sync();
        s.tone('p' + b, 'bad');
        s.tone('n' + b, 'active');
        s.tone('n' + old, 'bad');
        lost = lost || [b, old];
        F(`${b} left its old group. Look at ${old}: it has been left behind.`, 2);
      }
      s.clearTones();
      if (!pairs.length) { F('Type some unions, like 0-1, 2-3, 1-3.', 0); return; }
      if (bad && lost && rootOf(parent, lost[0]) !== rootOf(parent, lost[1])) {
        s.tone(['n' + lost[0], 'n' + lost[1]], 'bad');
        F(`${lost[0]} and ${lost[1]} were joined, but now they have different roots. The answer is wrong.`, 0);
      } else if (bad) {
        F('This time nobody got lost, but only by luck. Try 0-1, 2-3, 1-3.', 0);
      } else {
        F('Every item kept its group. Compare the groups line with bad_union.', 0);
      }
    },
  });

  // ---------------------------------------------------------------- lesson 23.2
  Viz.register('m23-compress', {
    title: 'Path compression: new arrows, same answers',
    size: [560, 366],
    code: py`
      def find(parent, x):
          root = x
          while parent[root] != root:
              root = parent[root]
          while x != root:
              up = parent[x]
              parent[x] = root
              x = up
          return root
    `,
    inputs: [
      { key: 'list', label: 'Parent list', type: 'text', value: '1, 2, 3, 3, 5, 5', size: 16 },
      { key: 'x', label: 'find(x)', type: 'number', value: 0, min: 0, max: 5 },
    ],
    tryInputs: [
      { list: '', x: 0 }, { list: '0', x: 0 }, { list: '0, 0', x: 1 }, { list: '0, 0', x: 0 }, { list: '1, 2, 3, 4, 5, 5', x: 0 }, { list: '1, 2, 3, 4, 5, 5', x: 5 },
      { list: '1, 0', x: 0 }, { list: '9, cat, 2', x: 2 }, { list: '0, 1, 2, 3, 4, 5', x: 3 }, { list: '1, 1, 1, 1', x: 5 }, { list: '2, 2, 2, 2, 2, 2, 2, 2', x: 'y' },
    ],
    build(s, p) {
      const { parent: first, fixed } = readParents(p.list);
      if (!first.length) {
        s.text('none', 280, 120, 'The parent list is empty', { size: 16, tone: 'muted' });
        s.snap('An empty list has no items to find. Type a list like 1, 2, 2.', { line: 1 });
        return;
      }
      const n = first.length;
      const x0 = whole(p.x, 0, n - 1, 0);
      const kit = forestKit(s, first, { bottom: 232, top: 40 });
      const parent = kit.parent;
      const answers = parent.map((_, i) => rootOf(parent, i));
      kit.index(268);
      kit.row('p', 'parent', 294, parent);
      kit.row('f', 'find(i)', 336, answers, { tone: 'muted' });
      kit.sync();
      let hops = 0, turn = 0;
      const F = (say, line, ask, extra) => s.snap(say, { line, ask: ask || null, vars: Object.assign({ hops }, extra || {}) });
      const need = hopsOf(parent, x0);
      const R = answers[x0];

      F(`The top row is the parent list. The bottom row holds each item's root.${fixed ? ' I fixed some bad values.' : ''}`, 1,
        askIt(`Count by hand. How many hops is it from ${x0} up to its root?`, need, [need + 1, Math.max(0, need - 1), n],
          need ? `Follow the arrows from ${x0} to ${R}. That takes ${many(need, 'hop')}.` : `${x0} is the root already. So it takes 0 hops.`, turn++));

      s.tone('n' + x0, 'active');
      let root = x0;
      const path = [];
      F(`First walk: go up from ${x0} and look for the root.`, 2, null, { x: x0, root });
      while (parent[root] !== root) {
        path.push(root);
        s.tone(kit.edgeOf(root), 'active');
        root = parent[root];
        hops += 1;
        s.tone('n' + root, 'active');
        F(`Hop ${hops}: go up to ${root}.`, 4, null, { x: x0, root });
      }
      s.tone('n' + root, 'warn');
      F(`parent[${root}] is ${root}, so ${root} is the root. The first walk ends.`, 3, null, { x: x0, root });

      if (!path.length) {
        F(`${x0} is the root. The second walk has nothing to do.`, 5, null, { x: x0, root });
      }
      path.forEach((item, step) => {
        const old = parent[item];
        s.clearTones(['n' + root, ...parent.map((_, i) => 'f' + i)]);
        s.tone('n' + item, 'active');
        if (old === root) {
          F(`${item} already points at the root. Writing ${root} again changes nothing.`, 7, null, { x: item, root, up: old });
          return;
        }
        F(`Second walk: ${item} is next. Its parent is ${old}.`, 6,
          step === 0 ? askIt(`Which number goes in parent[${item}] now?`, root, [old, item],
            `Every item on the walk gets pointed straight at the root, ${root}. That is the whole trick.`, turn++) : null, { x: item, root, up: old });
        parent[item] = root;
        kit.sync();
        s.tone('p' + item, 'warn');
        s.tone('n' + item, 'active');
        s.tone(kit.edgeOf(item), 'active');
        F(`parent[${item}] now holds ${root}. Then x moves on to ${old}.`, 7, null, { x: item, root, up: old });
      });
      s.clearTones(['n' + root, ...parent.map((_, i) => 'f' + i)]);

      const same = parent.every((_, i) => rootOf(parent, i) === answers[i]);
      const moved = parent.some((q, i) => q !== first[i]);
      F(moved ? 'The arrows changed. Now look at the find(i) row.' : 'No arrow had to change this time. Now look at the find(i) row.', 9,
        askIt('Did path compression change the root of any item?', 'No, every answer is the same', ['Yes, the walked items changed', 'Yes, the root changed'],
          'Each walked item was in this group, and it still is. It only points at the root more directly.', turn++), { x: root, root });
      parent.forEach((_, i) => { s.set('f' + i, { text: rootOf(parent, i), tone: 'ok' }); });
      F(!same ? 'Something changed. This should never happen.' : moved ? 'The find(i) row did not change. Only the parent list moved.' : 'The find(i) row did not change, and neither did the parent list.', 9, null, { root });

      const again = hopsOf(parent, x0);
      const hopsBefore = hops;
      F(`Now call find(${x0}) a second time.`, 2,
        askIt(`It took ${many(hopsBefore, 'hop')} the first time. How many now?`, again, [hopsBefore, again + 1, again + 2],
          again ? `${x0} points straight at the root now. So 1 hop is enough.` : `${x0} is the root. It needs 0 hops, as before.`, turn++), { x: x0, root });
      hops = again;
      F(again < hopsBefore ? `Same answer: ${root}. That took ${many(again, 'hop')} this time, not ${hopsBefore}.` : `Same answer: ${root}. It takes ${many(again, 'hop')}, as before.`, 9, null, { x: x0, root });
    },
  });

  /* Runs the unions with no drawing, to get the height of the tree for the other rule. */
  function plainHeight(n, pairs, useSize) {
    const parent = Array.from({ length: n }, (_, i) => i);
    const size = parent.map(() => 1);
    pairs.forEach(([a, b]) => {
      let ra = rootOf(parent, a), rb = rootOf(parent, b);
      if (ra === rb) return;
      if (useSize && size[ra] < size[rb]) { const t = ra; ra = rb; rb = t; }
      parent[rb] = ra;
      size[ra] += size[rb];
    });
    return tallest(parent);
  }

  Viz.register('m23-size', {
    title: 'Union by size: the small tree goes under',
    size: [560, 366],
    code: py`
      def union(parent, size, a, b):
          ra = find(parent, a)
          rb = find(parent, b)
          if ra == rb:
              return False
          if size[ra] < size[rb]:
              ra, rb = rb, ra
          parent[rb] = ra
          size[ra] += size[rb]
          return True
    `,
    inputs: [
      { key: 'way', label: 'Rule', type: 'select', value: 'size', options: [{ label: 'Union by size', value: 'size' }, { label: 'No rule', value: 'none' }] },
      { key: 'unions', label: 'Unions', type: 'text', value: '1-0, 2-1, 3-2, 4-3, 5-4', size: 20 },
    ],
    tryInputs: [
      { way: 'size', unions: '' }, { way: 'none', unions: '' }, { way: 'none', unions: '1-0, 2-1, 3-2, 4-3, 5-4' }, { way: 'size', unions: '0-1, 2-3, 4-5, 0-2, 0-4' },
      { way: 'none', unions: '0-1, 2-3, 4-5, 0-2, 0-4' }, { way: 'size', unions: '0-1, 0-1, 1-0' }, { way: 'size', unions: '2-2' }, { way: 'size', unions: 'cat, 9-1' }, { way: 'x', unions: '0-5' },
    ],
    build(s, p) {
      const useSize = p.way !== 'none';
      const n = 6;
      const { pairs, skipped } = readPairs(p.unions, n, 6);
      const kit = forestKit(s, Array.from({ length: n }, (_, i) => i), { bottom: 232, top: 40 });
      const parent = kit.parent;
      const size = parent.map(() => 1);
      kit.index(268);
      kit.row('p', 'parent', 294, parent);
      kit.row('z', 'size', 336, size);
      kit.sync();
      let turn = 0, gap = 2, swaps = 0;
      const F = (say, line, ask) => {
        gap = ask ? 0 : gap + 1;
        s.snap(say, { line, ask: ask || null, vars: { tallest: tallest(parent) + ' hops', groups: groupCount(parent) } });
      };
      F((useSize ? 'Each root also knows the size of its group. All sizes start at 1.' : 'No rule here: lines 6, 7 and 9 are off. The root of b goes under.') + skipNote(skipped), 1);
      if (!pairs.length) { F('Type some unions, like 1-0, 2-1, 3-2.', 0); return; }

      pairs.forEach(([a, b]) => {
        s.clearTones();
        parent.forEach((q, i) => { if (q !== i) s.tone('z' + i, 'muted'); });
        let ra = rootOf(parent, a), rb = rootOf(parent, b);
        s.tone(['n' + ra, 'n' + rb], 'active');
        if (ra === rb) { F(`union(${a}, ${b}): both roots are ${ra}, so nothing changes.`, 5); return; }
        const big = size[ra] >= size[rb] ? ra : rb, small = big === ra ? rb : ra;
        const tie = size[ra] === size[rb];
        const say = `union(${a}, ${b}): the roots are ${ra} and ${rb}.`;
        if (useSize) {
          s.tone(['z' + ra, 'z' + rb], 'active');
          F(`${say} Their sizes are ${size[ra]} and ${size[rb]}.`, 6,
            tie ? (gap >= 3 ? askIt(`Both sizes are ${size[ra]}. Does it matter which goes under?`, 'No, either is fine', [`Yes, ${ra} must go under`, `Yes, ${rb} must go under`],
              `With a tie, the group that goes under still at least doubles. So either is safe. This code keeps ra on top.`, turn++) : null)
              : askIt(`Root ${ra} has size ${size[ra]}. Root ${rb} has size ${size[rb]}. Which root goes under?`, `Root ${small}, the small one`, [`Root ${big}, the big one`, 'Either one, it never matters'],
                `Everything under the new child gets 1 hop further away. So put the smaller group under.`, turn++));
          if (!tie && size[ra] < size[rb]) {
            const t = ra; ra = rb; rb = t;
            // The swap gets its own frame twice. After that the learner knows it.
            swaps += 1;
            if (swaps <= 2) F(`Swap the names. Now ra names ${ra}, the bigger root.`, 7);
          }
        } else {
          F(`${say} No rule, so root ${rb} goes under.`, 8,
            gap >= 3 ? askIt(`Root ${rb} goes under root ${ra}. What happens to the hops from ${rb}'s group?`, 'They all grow by 1', ['They all stay the same', 'They all shrink by 1'],
              `Every item under ${rb} now has 1 more arrow to follow.`, turn++) : null);
        }
        parent[rb] = ra;
        kit.sync();
        s.tone('p' + rb, 'warn');
        s.tone(kit.edgeOf(rb), 'active');
        s.tone('z' + rb, 'muted');
        if (!useSize) {
          F(`Spot ${rb} now holds ${ra}. The tallest path is now ${many(tallest(parent), 'hop')}.`, 8);
          return;
        }
        F(`Spot ${rb} now holds ${ra}. Root ${rb} is no longer a root.`, 8);
        size[ra] += size[rb];
        s.set('z' + ra, { text: size[ra], tone: 'warn' });
        F(`Root ${ra} now has ${size[ra]} items. Only a root's size matters, so spot ${rb} goes grey.`, 9);
      });
      s.clearTones();
      parent.forEach((q, i) => { if (q !== i) s.tone('z' + i, 'muted'); });
      const other = plainHeight(n, pairs, !useSize);
      const mine = tallest(parent);
      F(`Same unions with ${useSize ? 'no rule' : 'union by size'}: ${many(other, 'hop')} tall. This way: ${many(mine, 'hop')}.`, 0);
    },
  });

  // ---------------------------------------------------- towns and roads, 23.3 and 23.4
  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
  /* The 6 spots sit on a convex ring, so a road can never run through a third town. */
  const SMALL = { A: [86, 70], B: [172, 26], C: [258, 70], D: [296, 152], E: [172, 206], F: [48, 152] };
  const BIG = { A: [120, 70], B: [280, 28], C: [440, 70], D: [510, 160], E: [280, 196], F: [50, 160] };
  const TAG = { A: [70, 44], B: [346, 20], C: [492, 44], D: [510, 200], E: [280, 234], F: [50, 200] };

  /* Reads "A-B 4, F" from a text box. A lone letter is a town with no roads. */
  function readRoads(text, limit = 9) {
    const parts = String(text == null ? '' : text).toUpperCase().split(/[,;]+/).map(t => t.trim()).filter(Boolean);
    const roads = [], lone = [], seen = new Set();
    let skipped = 0;
    parts.forEach(t => {
      if (/^[A-F]$/.test(t)) { if (!lone.includes(t)) lone.push(t); return; }
      const m = /^([A-F])\s*[-:>]?\s*([A-F])\s*[ :=]?\s*(\d{1,2})$/.exec(t);
      if (!m || m[1] === m[2] || roads.length >= limit) { skipped += 1; return; }
      const a = m[1] < m[2] ? m[1] : m[2], b = m[1] < m[2] ? m[2] : m[1];
      if (seen.has(a + b)) { skipped += 1; return; }
      seen.add(a + b);
      roads.push({ w: Number(m[3]), a, b });
    });
    const used = new Set(lone);
    roads.forEach(r => { used.add(r.a); used.add(r.b); });
    return { roads, towns: LETTERS.filter(l => used.has(l)), skipped };
  }
  const rid = r => 'e' + r.a + r.b;
  const byCost = (x, y) => x.w - y.w || (x.a < y.a ? -1 : x.a > y.a ? 1 : x.b < y.b ? -1 : x.b > y.b ? 1 : 0);
  function drawMap(s, towns, roads, spot, r) {
    towns.forEach(t => s.circle('n' + t, spot[t][0], spot[t][1], t, { r }));
    roads.forEach(e => s.edge(rid(e), 'n' + e.a, 'n' + e.b, { arrow: false, label: String(e.w), dashed: true, tone: 'muted' }));
  }
  const ROAD_TRIES = [
    { roads: '' }, { roads: 'A' }, { roads: 'A, B' }, { roads: 'A-B 3' }, { roads: 'A-B 3, B-A 9, A-A 1' }, { roads: 'A-B 2, C-D 2' }, { roads: 'A-B 1, C' },
    { roads: 'A-B 5, B-C 5, A-C 5' }, { roads: 'A-B 0, B-C 0' }, { roads: 'junk, Z-Q 3, A-B x' }, { roads: 'A-B 99, B-C 99, C-D 99, D-E 99, E-F 99, F-A 99' },
    { roads: 'A-B 1, A-C 2, A-D 3, A-E 4, A-F 5, B-C 6, B-D 7, B-E 8, B-F 9, C-D 10, C-E 11' },
  ];

  // ---------------------------------------------------------------- lesson 23.3
  Viz.register('m23-kruskal', {
    title: "Kruskal: cheapest road first, skip any loop",
    size: [560, 296],
    code: py`
      for t in towns:
          parent[t] = t
          size[t] = 1
      total = 0
      kept = []
      for w, a, b in sorted(roads):
          if union(parent, size, a, b):
              kept.append((a, b))
              total += w
      print(total, len(kept))
    `,
    inputs: [
      { key: 'roads', label: 'Roads (A to F)', type: 'text', value: 'A-F 1, B-C 2, A-B 3, A-C 4, E-F 5, C-E 6, C-D 7, D-E 8', size: 26 },
    ],
    tryInputs: ROAD_TRIES,
    build(s, p) {
      const { roads, towns, skipped } = readRoads(p.roads);
      const order = roads.slice().sort(byCost);
      let total = 0, kept = 0, finds = 0, turn = 0, gap = 3;
      const F = (say, line, ask, out) => {
        gap = ask ? 0 : gap + 1;
        s.snap(say, { line, ask: ask || null, vars: { total, kept, finds }, out: out == null ? null : out });
      };
      if (!towns.length) {
        s.text('none', 280, 120, 'There are no towns yet', { size: 16, tone: 'muted' });
        F('With no towns, there is nothing to join. The total is 0.' + skipNote(skipped), 10, null, '0 0');
        return;
      }
      drawMap(s, towns, roads, SMALL, 18);

      // The cost list on the right.
      s.text('hd', 330, 14, 'Roads, cheapest first', { size: 13, anchor: 'start', weight: 700 });
      const rowY = i => 38 + i * 22;
      order.forEach((e, i) => {
        s.text('w' + i, 352, rowY(i), e.w, { size: 14, anchor: 'end', mono: true });
        s.text('r' + i, 362, rowY(i), `${e.a}-${e.b}`, { size: 14, anchor: 'start', mono: true });
        s.text('st' + i, 416, rowY(i), '', { size: 14, anchor: 'start', weight: 700 });
      });

      // The parent list, as a dict with one key for each town.
      const parent = {}, size = {};
      towns.forEach(t => { parent[t] = t; size[t] = 1; });
      const o = { cell: 44, gap: 4 };
      s.text('iL', 14, 242, 'town', { size: 14, anchor: 'start', tone: 'muted' });
      s.text('pL', 14, 268, 'parent', { size: 14, anchor: 'start', weight: 700 });
      towns.forEach((t, i) => {
        const x = s.slotX(i, towns.length, o);
        s.text('i' + t, x, 242, t, { size: 13, tone: 'muted', mono: true });
        s.box('p' + t, x, 268, t, { w: 44, h: 34, size: 17 });
      });
      F(`The roads are sorted by cost. Each town starts as its own group.${skipNote(skipped)}`, 3,
        order.length ? askIt('Which road does Kruskal look at first?', `${order[0].a}-${order[0].b}`, order.slice(1, 3).map(e => `${e.a}-${e.b}`).concat(['Any road, the order is free']),
          `The sorted list starts with the cheapest road. That is ${order[0].a}-${order[0].b}, at cost ${order[0].w}.`, turn++) : null);
      const find = x => {
        finds += 1;
        let root = x;
        while (parent[root] !== root) root = parent[root];
        while (x !== root) { const up = parent[x]; parent[x] = root; x = up; }
        return root;
      };
      const paint = () => towns.forEach(t => s.set('p' + t, { text: parent[t] }));

      if (!order.length) {
        F(towns.length === 1 ? 'One town needs no roads. The total is 0.' : 'These towns have no roads, so they stay apart.', 10, null, '0 0');
        return;
      }
      s.area('cur', 330, rowY(0) - 11, 150, 22, '', { tone: 'muted' });
      order.forEach((e, i) => {
        towns.forEach(t => s.tone(['n' + t, 'p' + t], 'default'));
        roads.forEach(q => { if (q.status === 'kept') s.tone(rid(q), 'ok'); else s.tone(rid(q), 'muted'); });
        s.set('cur', { y: rowY(i) - 11 });
        s.tone(rid(e), 'active');
        s.set(rid(e), { dashed: false });
        s.tone(['n' + e.a, 'n' + e.b], 'active');
        // Peek at the roots with no change, so the question comes before the answer.
        const peek = x => { while (parent[x] !== x) x = parent[x]; return x; };
        const ra0 = peek(e.a), rb0 = peek(e.b);
        const joins = ra0 !== rb0;
        const ask = !joins || gap >= 2 ? askIt(`Road ${e.a}-${e.b} costs ${e.w}. Keep it or skip it?`, joins ? 'Keep it' : 'Skip it', [joins ? 'Skip it' : 'Keep it'],
          joins ? `${e.a} and ${e.b} have different roots. So this road joins 2 groups, and no loop appears.`
            : `${e.a} and ${e.b} share the root ${ra0}. They are already joined, so this road would close a loop.`, turn++) : null;
        F(`Next road: ${e.a}-${e.b}, cost ${e.w}. Do ${e.a} and ${e.b} have the same root?`, 7, ask);
        let ra = find(e.a), rb = find(e.b);
        if (ra === rb) {
          e.status = 'skip';
          s.set('st' + i, { text: 'skip', tone: 'bad' });
          s.tone(rid(e), 'muted');
          s.set(rid(e), { dashed: true, opacity: 0.45 });
          paint();
          F(`Same root, ${ra}. This road would close a loop, so skip it.`, 7);
          return;
        }
        if (size[ra] < size[rb]) { const t = ra; ra = rb; rb = t; }
        parent[rb] = ra;
        size[ra] += size[rb];
        paint();
        s.tone('p' + rb, 'warn');
        e.status = 'kept';
        kept += 1;
        total += e.w;
        s.set('st' + i, { text: 'kept', tone: 'ok' });
        s.tone(rid(e), 'ok');
        F(`Different roots, so keep it. Total is now ${total}, and parent[${rb}] is ${ra}.`, 9);
      });
      s.del('cur');
      towns.forEach(t => s.tone('n' + t, 'default'));
      towns.forEach(t => s.tone('p' + t, 'default'));
      const need = towns.length - 1;
      const out = `${total} ${kept}`;
      if (kept === need) F(`Done. ${many(kept, 'road')} join ${many(towns.length, 'town')}, for a total of ${total}.`, 10, null, out);
      else F(`Only ${many(kept, 'road')} kept, but ${need} are needed. Some towns cannot be reached.`, 10, null, out);
    },
  });

  // ---------------------------------------------------------------- lesson 23.4
  /* The same moves as Python's heapq, so the row shows the real heap list. An entry compares by cost, then town. */
  const before = (x, y) => x.w < y.w || (x.w === y.w && x.to < y.to);
  function siftDown(h, start, pos) {
    const item = h[pos];
    while (pos > start) {
      const up = (pos - 1) >> 1;
      if (before(item, h[up])) { h[pos] = h[up]; pos = up; continue; }
      break;
    }
    h[pos] = item;
  }
  function siftUp(h, pos) {
    const end = h.length, start = pos, item = h[pos];
    let kid = 2 * pos + 1;
    while (kid < end) {
      const right = kid + 1;
      if (right < end && !before(h[kid], h[right])) kid = right;
      h[pos] = h[kid];
      pos = kid;
      kid = 2 * pos + 1;
    }
    h[pos] = item;
    siftDown(h, start, pos);
  }
  const heapPush = (h, e) => { h.push(e); siftDown(h, 0, h.length - 1); };
  const heapPop = h => {
    const last = h.pop();
    if (!h.length) return last;
    const top = h[0];
    h[0] = last;
    siftUp(h, 0);
    return top;
  };

  Viz.register('m23-prim', {
    title: 'Prim: grow one tree, cheapest road out',
    size: [560, 306],
    code: py`
      def prim(graph, start):
          in_tree = set()
          heap = [(0, start)]
          total = 0
          while len(heap) > 0:
              w, town = heapq.heappop(heap)
              if town in in_tree:
                  continue
              in_tree.add(town)
              total += w
              for other, cost in graph[town]:
                  if other not in in_tree:
                      heapq.heappush(heap, (cost, other))
          return total, len(in_tree)
    `,
    inputs: [
      { key: 'roads', label: 'Roads (A to F)', type: 'text', value: 'A-F 1, B-C 2, A-B 3, A-C 4, E-F 5, C-E 6, C-D 7, D-E 8', size: 26 },
      { key: 'start', label: 'Start', type: 'text', value: 'A', size: 3 },
    ],
    tryInputs: ROAD_TRIES.concat([{ roads: 'A-B 2, C-D 2', start: 'C' }, { roads: 'A-B 2, B-C 3', start: 'Z' }, { roads: 'A-B 2, B-C 3', start: '' }, { roads: 'A-B 2, A-C 2, B-C 2', start: 'B' }]),
    build(s, p) {
      const { roads, towns, skipped } = readRoads(p.roads);
      const wanted = String(p.start == null ? '' : p.start).trim().toUpperCase();
      let total = 0, pops = 0, pushes = 0, turn = 0, gap = 3;
      const inTree = new Set();
      const F = (say, line, ask, out) => {
        gap = ask ? 0 : gap + 1;
        s.snap(say, { line, ask: ask || null, vars: { total, pushes, pops }, out: out == null ? null : out });
      };
      if (!towns.length) {
        s.text('none', 280, 120, 'There are no towns yet', { size: 16, tone: 'muted' });
        F('With no towns, there is nothing to grow. Type some roads.' + skipNote(skipped), 1);
        return;
      }
      const start = towns.includes(wanted) ? wanted : towns[0];
      const moved = wanted !== start;
      const adj = {};
      towns.forEach(t => { adj[t] = []; });
      roads.forEach(e => { adj[e.a].push({ to: e.b, w: e.w, id: rid(e) }); adj[e.b].push({ to: e.a, w: e.w, id: rid(e) }); });
      towns.forEach(t => adj[t].sort((x, y) => (x.to < y.to ? -1 : 1)));
      drawMap(s, towns, roads, BIG, 22);

      // The heap row. Tokens keep their ids, so they slide when the heap moves them.
      const heap = [];
      let serial = 0;
      const tokenX = i => 96 + i * 50;
      s.text('hL', 14, 276, 'heap', { size: 14, anchor: 'start', weight: 700 });
      s.text('pop', 14, 18, 'popped: nothing yet', { size: 14, anchor: 'start', weight: 700, mono: true });
      const paintHeap = () => {
        heap.forEach((e, i) => s.set(e.tid, { x: tokenX(i) }));
        if (heap.length) {
          if (s.has('topM')) s.set('topM', { x: tokenX(0) });
          else s.text('topM', tokenX(0), 248, 'top', { size: 13, tone: 'muted', weight: 700 });
          s.del('hE');
        } else {
          s.del('topM');
          if (!s.has('hE')) s.text('hE', 74, 276, 'empty', { size: 14, anchor: 'start', tone: 'muted' });
        }
      };
      const pushE = (w, to, id) => {
        const e = { w, to, id, tid: 'k' + serial };
        serial += 1;
        s.box(e.tid, tokenX(heap.length), 276, `${w} ${to}`, { w: 46, h: 36, size: 15, tone: 'warn' });
        heapPush(heap, e);
        pushes += 1;
      };
      const tagIn = t => s.text('t' + t, TAG[t][0], TAG[t][1], 'in tree', { size: 13, weight: 700 });
      pushE(0, start, null);
      paintHeap();

      F(`The heap starts with one entry: cost 0 to reach ${start}.${moved && wanted ? ' That town was not found, so I used the first one.' : ''}${skipNote(skipped)}`, 3,
        askIt(`The first entry is (0, ${start}). Why is its cost 0?`, 'You start there, so no road is needed', ['0 is the cheapest road', 'The heap always starts at 0'],
          'The start joins the tree for free. Each later town needs one road.', turn++));

      while (heap.length) {
        s.tone(heap.map(e => e.tid), 'warn');
        const top = heap[0];
        if (heap.length >= 2 && gap >= 2) {
          const others = heap.slice(1).filter(e => e.w !== top.w || e.to !== top.to).slice(-2).map(e => `${e.w} ${e.to}`);
          F(`The heap holds ${many(heap.length, 'entry').replace('entrys', 'entries')}. The loop pops one.`, 5,
            others.length ? askIt('Which entry comes out next?', `${top.w} ${top.to}`, others,
              `The smallest cost comes out first. Spot 0 of the heap always holds it, and it is ${top.w} ${top.to}.`, turn++) : null);
        }
        const e = heapPop(heap);
        pops += 1;
        s.del(e.tid);
        paintHeap();
        s.set('pop', { text: `popped: (${e.w}, ${e.to})` });
        if (inTree.has(e.to)) {
          F(`Popped (${e.w}, ${e.to}). Is ${e.to} already in the tree?`, 7,
            gap >= 1 ? askIt(`${e.to} is already in the tree. What does the code do?`, 'Skip this entry', [`Add ${e.w} to the total`, `Put ${e.to} in the tree again`],
              `This entry is out of date. Adding it would close a loop, so continue goes on to the next pop.`, turn++) : null);
          if (e.id && s.has(e.id)) { s.tone(e.id, 'muted'); s.set(e.id, { dashed: true, opacity: 0.45 }); }
          F(`Skip it. The road to ${e.to} is not needed now.`, 8);
          continue;
        }
        inTree.add(e.to);
        total += e.w;
        s.tone('n' + e.to, 'ok');
        tagIn(e.to);
        if (e.id) { s.tone(e.id, 'ok'); s.set(e.id, { dashed: false, opacity: 1 }); }
        F(e.id ? `${e.to} joins the tree for ${e.w}. Total is now ${total}.` : `${e.to} joins the tree for free.`, 10);
        const fresh = adj[e.to].filter(q => !inTree.has(q.to));
        if (fresh.length) {
          fresh.forEach(q => {
            pushE(q.w, q.to, q.id);
            s.tone(q.id, 'active');
            s.set(q.id, { dashed: false });
          });
          paintHeap();
          F(`Roads from ${e.to} to outside towns go in the heap. Now they can be picked.`, 13);
        } else {
          F(`Every road from ${e.to} leads back into the tree. Nothing goes in the heap.`, 12);
        }
      }
      const out = `(${total}, ${inTree.size})`;
      if (inTree.size === towns.length) F(`The heap is empty. All ${towns.length} towns are in the tree, for a total of ${total}.`, 14, null, out);
      else F(`The heap is empty, but only ${inTree.size} of ${towns.length} towns joined. There is no spanning tree.`, 14, null, out);
    },
  });
})();
