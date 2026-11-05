/* Visuals for module 20. Names start with the module id.
 * A heap is drawn twice: as a tree and as a list. Each item has one circle and one box,
 * and both move together, so the learner can check the parent and child sums.
 * The heap steps copy what real heapq does, down to which child goes up on a tie.
 * Every build takes the learner's values, so it must cope with empty, one item,
 * repeats, junk text and numbers that are out of range.
 */
(function () {
  // ------------------------------------------------------------- small helpers
  /* Reads "1, 3, 5" from a text box. Anything that is not a small whole number is skipped. */
  function readNums(text, limit, low = -99, high = 999) {
    const parts = String(text == null ? '' : text).split(/[\s,;]+/).filter(Boolean);
    const nums = [];
    let skipped = 0;
    parts.forEach(t => {
      const n = Number(t);
      if (Number.isInteger(n) && n >= low && n <= high && nums.length < limit) nums.push(n);
      else skipped += 1;
    });
    return { nums, skipped };
  }
  const whole = (v, min, max, dflt) => {
    const n = Math.round(Number(v));
    return Number.isFinite(n) && String(v).trim() !== '' ? Math.max(min, Math.min(max, n)) : dflt;
  };
  const show = a => '[' + a.join(', ') + ']';
  const many = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  const skipNote = skipped => (skipped ? ' Some of what you typed was skipped.' : '');
  /* Options for an ask. Drops repeats, and puts the right answer in a spot set by `turn`. */
  function mix(right, wrongs, turn = 0) {
    const seen = new Set([String(right)]);
    const rest = [];
    wrongs.forEach(w => {
      const t = String(w);
      if (!seen.has(t)) { seen.add(t); rest.push(t); }
    });
    const answer = Math.abs(turn) % (rest.length + 1);
    rest.splice(answer, 0, String(right));
    return { options: rest, answer };
  }
  const isHeap = a => a.every((v, i) => i === 0 || a[(i - 1) >> 1] <= v);
  const isSorted = a => a.every((v, i) => i === 0 || a[i - 1] <= v);

  // ------------------------------------------------------- real heapq behaviour
  /* Compares numbers, or tuples held as arrays, the way Python does. */
  function less(a, b) {
    if (!Array.isArray(a)) return a < b;
    for (let i = 0; i < a.length; i += 1) {
      if (a[i] !== b[i]) return a[i] < b[i];
    }
    return false;
  }
  function hpush(h, x, keyOf = v => v) {
    h.push(x);
    let i = h.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!less(keyOf(h[i]), keyOf(h[p]))) break;
      [h[i], h[p]] = [h[p], h[i]];
      i = p;
    }
  }
  /* On a tie between 2 children, heapq takes the right one. */
  function hsink(h, start, keyOf = v => v) {
    let i = start;
    while (2 * i + 1 < h.length) {
      let c = 2 * i + 1;
      if (c + 1 < h.length && !less(keyOf(h[c]), keyOf(h[c + 1]))) c += 1;
      if (!less(keyOf(h[c]), keyOf(h[i]))) break;
      [h[i], h[c]] = [h[c], h[i]];
      i = c;
    }
  }
  function hpop(h, keyOf = v => v) {
    const top = h[0];
    const last = h.pop();
    if (h.length) { h[0] = last; hsink(h, 0, keyOf); }
    return top;
  }
  function hify(h) {
    for (let i = (h.length >> 1) - 1; i >= 0; i -= 1) hsink(h, i);
    return h;
  }

  // ------------------------------------------------------------ the tree + list
  /* Draws one heap as a tree above a list. Item ids stay with the value, so a swap glides
     in both pictures. Invisible circles hold the spots, and the tree lines join those. */
  function heapKit(s, opt = {}) {
    const o = Object.assign({ cx: 280, wide: 480, ys: [30, 84, 138], r: 20, listY: 218, cell: 48, gap: 6, cap: 7 }, opt);
    const rowOpt = { cell: o.cell, gap: o.gap };
    const at = [];
    const val = {};
    let next = 0;
    const level = i => Math.floor(Math.log2(i + 1));
    const tx = i => {
      const slots = 2 ** level(i);
      return o.cx + ((i + 1 - slots) + 0.5 - slots / 2) * (o.wide / slots);
    };
    const ty = i => o.ys[level(i)];
    const lx = i => s.slotX(i, o.cap, rowOpt);
    const N = id => 'n' + id, B = id => 'b' + id;

    s.text('tree', 20, 62, 'tree', { size: 14, anchor: 'start', tone: 'muted', weight: 700 });
    s.text('list', 20, o.listY, 'list', { size: 14, anchor: 'start', tone: 'muted', weight: 700 });

    const kit = {
      at, val, tx, ty, lx, o,
      get n() { return at.length; },
      vals() { return at.map(id => val[id]); },
      /* A list box only. */
      addList(v) {
        const i = at.length, id = next++;
        val[id] = v;
        at.push(id);
        s.box(B(id), lx(i), o.listY, v, { w: o.cell, h: o.cell });
        if (!s.has('li' + i)) s.text('li' + i, lx(i), o.listY + o.cell / 2 + 14, i, { size: 13, tone: 'muted', mono: true });
        return id;
      },
      /* The tree circle for a spot that is already in the list. */
      showTree(i) {
        if (!s.has('a' + i)) s.circle('a' + i, tx(i), ty(i), '', { r: o.r, opacity: 0 });
        if (i > 0 && !s.has('e' + i)) s.edge('e' + i, 'a' + ((i - 1) >> 1), 'a' + i, { arrow: false });
        if (!s.has('ti' + i)) {
          const side = i % 2 === 1 ? -1 : 1;
          s.text('ti' + i, tx(i) + side * (o.r + 8), ty(i) - o.r + 2, i, { size: 12, tone: 'muted', mono: true });
        }
        s.circle(N(at[i]), tx(i), ty(i), val[at[i]], { r: o.r });
      },
      add(v) {
        kit.addList(v);
        kit.showTree(at.length - 1);
      },
      mark(i, tone, scale = 1) {
        const id = at[i];
        if (s.has(N(id))) s.set(N(id), { tone, scale });
        if (s.has(B(id))) s.set(B(id), { tone, scale });
      },
      calm(upTo = at.length) {
        for (let i = 0; i < upTo; i += 1) kit.mark(i, 'default');
      },
      swap(i, j, quiet = false) {
        const a = at[i], b = at[j];
        at[i] = b; at[j] = a;
        if (s.has(N(a)) && s.has(N(b))) s.swap(N(a), N(b), 0);
        s.swap(B(a), B(b), quiet ? 0 : 30);
      },
      /* Takes one spot off the tree, and leaves the list box where it is. */
      offTree(i) {
        s.del(N(at[i]), 'e' + i, 'ti' + i, 'a' + i);
      },
      ptr(name, i, label, tone = 'accent') {
        if (s.has(name)) s.set(name, { x: lx(i), text: label, tone });
        else s.pointer(name, lx(i), o.listY - o.cell / 2 - 2, label, { dir: 'down', tone });
      },
      unptr(...names) { names.forEach(n => s.del(n)); },
    };
    return kit;
  }

  /* One item sinks. c holds: max (biggest on top), end, lines, vars, swaps count, asks and quiet. */
  function sinkFrames(s, kit, start, c) {
    const end = c.end == null ? kit.n : c.end;
    const value = i => kit.val[kit.at[i]];
    const word = c.max ? 'biggest' : 'smallest';
    let i = start;
    let level = 0;
    while (2 * i + 1 < end) {
      const l = 2 * i + 1, r = l + 1;
      const both = r < end;
      let k = l;
      if (both) {
        if (c.max ? value(r) > value(l) : !(value(l) < value(r))) k = r;
      }
      const v = value(i), kv = value(k);
      const stop = c.max ? v >= kv : v <= kv;
      if (c.quiet) {
        if (stop) return;
        kit.swap(i, k, true);
        i = k;
        continue;
      }
      kit.calm(end);
      kit.mark(i, 'active', 1.1);
      kit.mark(l, 'warn');
      if (both) kit.mark(r, 'warn');
      kit.ptr('p-i', i, 'item', 'active');
      kit.ptr('p-l', l, 'left', 'accent');
      if (both) kit.ptr('p-r', r, 'right', 'accent');
      else kit.unptr('p-r');
      s.set('cmp', { text: both ? `children: ${value(l)} and ${value(r)}` : `one child: ${value(l)}` });

      const tie = both && value(l) === value(r);
      const swapText = tie ? `Swap with the ${k === r ? 'right' : 'left'} ${kv}` : `Swap with ${kv}`;
      const wrongs = [];
      if (both) wrongs.push(tie ? `Swap with the ${k === r ? 'left' : 'right'} ${kv}` : `Swap with ${k === l ? value(r) : value(l)}`);
      wrongs.push('Stop here');
      const pick = stop ? mix('Stop here', wrongs.filter(w => w !== 'Stop here').concat([swapText]), level) : mix(swapText, wrongs, level);
      const showAsk = !c.asks || c.asks(level);
      const why = stop
        ? `${v} is ${c.max ? 'at least as big as' : 'no bigger than'} its children, so the rule already holds here.`
        : tie
          ? `The children tie, so either keeps the rule. ${c.max ? 'This code keeps left' : 'heapq takes the right one'}.`
          : both
            ? `The ${word} must go up. If the other child went up, it would sit above ${kv} and break the rule.`
            : `${v} is ${c.max ? 'smaller' : 'bigger'} than its one child, so this pair breaks the rule. They swap.`;
      s.snap(`Item ${v} is in spot ${i}. ${both ? `Its children sit at spots ${l} and ${r}` : `Its one child sits at spot ${l}`}.`, {
        line: c.lines.pick, vars: c.vars ? c.vars({ i, c: k }) : null, out: c.out ? c.out() : undefined,
        ask: showAsk ? { q: `Item ${v} has ${both ? `children ${value(l)} and ${value(r)}` : `one child, ${value(l)}`}. What happens?`, options: pick.options, answer: pick.answer, why } : null,
      });
      if (stop) {
        s.set('cmp', { text: `${v} ${c.max ? '>=' : '<='} ${kv}, so stop` });
        kit.unptr('p-l', 'p-r');
        s.snap(`${v} is ${c.max ? 'big' : 'small'} enough here, so it stops. The rule holds.`, { line: c.lines.stop, vars: c.vars ? c.vars({ i, c: k }) : null, out: c.out ? c.out() : undefined });
        break;
      }
      kit.calm(end);
      kit.swap(i, k);
      kit.mark(k, 'active', 1.1);
      kit.mark(i, 'ok');
      kit.unptr('p-l', 'p-r');
      kit.ptr('p-i', k, 'item', 'active');
      if (c.onSwap) c.onSwap();
      s.set('cmp', { text: `swap spots ${i} and ${k}` });
      s.snap(`${kv} goes up to spot ${i}, and ${v} sinks to spot ${k}.`, { line: c.lines.swap, vars: c.vars ? c.vars({ i: k, c: k }) : null, out: c.out ? c.out() : undefined });
      i = k;
      level += 1;
    }
    if (!c.quiet) kit.unptr('p-i', 'p-l', 'p-r');
  }

  /* The box of learner numbers for a picture that needs a real heap. */
  const heapFrom = (text, limit) => {
    const raw = readNums(text, limit);
    const made = !isHeap(raw.nums);
    return { nums: made ? hify(raw.nums.slice()) : raw.nums, made, skipped: raw.skipped };
  };

  const listTries = [
    { list: '' }, { list: '5' }, { list: '5, 5' }, { list: '3, 1' }, { list: '1, 2, 3, 4, 5, 6, 7' },
    { list: '7, 6, 5, 4, 3, 2, 1' }, { list: '4, 4, 4, 4, 4' }, { list: 'cat, dog' }, { list: '-5, 999, 3' },
    { list: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11' }, { list: '2, 1, 2, 1, 2, 1' },
  ];

  // ---------------------------------------------------------------- lesson 20.1
  Viz.register('m20-tree-list', {
    title: 'One list, drawn as a tree',
    size: [560, 272],
    inputs: [
      { key: 'list', label: 'List', type: 'text', value: '2, 5, 3, 9, 6, 4', size: 18 },
      { key: 'spot', label: 'Spot i', type: 'number', value: 1, min: 0, max: 6 },
    ],
    tryInputs: listTries.concat([{ list: '1, 2, 3', spot: 6 }, { list: '1, 2, 3, 4, 5, 6, 7', spot: 0 }, { list: '1, 2, 3, 4, 5, 6, 7', spot: 6 }, { list: '1, 2', spot: 1 }, { list: '1, 2, 3, 4', spot: 1 }, { list: '5', spot: 'cat' }]),
    build(s, p) {
      const raw = readNums(p.list, 7);
      const items = raw.nums, n = items.length;
      s.text('cmp', 20, 16, '', { size: 14, anchor: 'start', mono: true, weight: 700 });
      const kit = heapKit(s);
      if (!n) {
        s.text('empty', 280, 120, 'This list is empty.', { size: 16, tone: 'muted' });
        const c = mix('IndexError', ['0', 'None'], 1);
        s.snap(`No items means no tree.${skipNote(raw.skipped)}`, {
          ask: { q: 'What does heap[0] do on an empty list?', options: c.options, answer: c.answer, why: 'Spot 0 does not exist yet. So Python stops with an IndexError. Check first.' },
        });
        s.snap('An empty list has no top item. Now type some numbers.');
        return;
      }
      items.forEach(v => kit.addList(v));
      s.snap(`Here is a plain list. It has ${many(n, 'item')}, in numbered lockers.${skipNote(raw.skipped)}`);

      const c0 = mix('Locker 0', ['The last locker', 'The biggest number'], 0);
      s.snap('Now read the list as a tree, one level at a time.', {
        ask: { q: 'Which locker becomes the top of the tree?', options: c0.options, answer: c0.answer, why: 'A tree is read from the top. So locker 0 is the root.' },
      });
      kit.showTree(0);
      kit.mark(0, 'active');
      s.snap(`Locker 0 holds ${items[0]}. It becomes the root.`);

      if (n > 1) {
        kit.calm();
        for (let i = 1; i < Math.min(3, n); i += 1) { kit.showTree(i); kit.mark(i, 'active'); }
        s.snap(n > 2 ? 'The next 2 lockers fill the next level, from left to right.' : 'The next locker starts the next level, on the left.');
      }
      if (n > 3) {
        const c1 = mix('4', ['3', '6'], 1);
        kit.calm();
        s.snap('Each item can have 2 children. So each level can double.', {
          ask: { q: 'Level 2 holds 2 items. How many can level 3 hold?', options: c1.options, answer: c1.answer, why: '2 items with 2 children each makes 4 spots.' },
        });
        for (let i = 3; i < n; i += 1) { kit.showTree(i); kit.mark(i, 'active'); }
        s.snap(`Lockers 3 to ${n - 1} fill the last level, from left to right. No gaps.`);
      }

      const typed = whole(p.spot, 0, 6, 1);
      const i = Math.min(typed, n - 1);
      const note = typed !== i ? ` Spot ${typed} is past the end, so I used ${i}.` : '';
      kit.calm();
      kit.mark(i, 'active', 1.12);
      kit.ptr('p-i', i, 'i', 'active');
      s.set('cmp', { text: `i = ${i}` });
      s.snap(`Look at spot ${i}. It holds ${items[i]}, in the tree and in the list.${note}`, { vars: { i } });

      const l = 2 * i + 1, r = 2 * i + 2, pa = (i - 1) >> 1;
      const vars = { i };
      const cl = mix(l, [2 * i, i + 1, l + 1].filter(v => v !== l), i);
      s.snap(`Find the left child of spot ${i}.`, {
        vars,
        ask: { q: `What is 2 * ${i} + 1?`, options: cl.options, answer: cl.answer, why: `2 * ${i} is ${2 * i}. Add 1, and you get ${l}.` },
      });
      s.set('cmp', { text: `left = 2 * ${i} + 1 = ${l}` });
      vars.left = l;
      if (l < n) {
        kit.mark(l, 'ok', 1.08);
        kit.ptr('p-l', l, 'left', 'ok');
        s.snap(`Spot ${l} holds ${items[l]}. The tree line agrees: it hangs from spot ${i}, on the left.`, { vars });
      } else {
        s.snap(`Spot ${l} is past the end of the list, so spot ${i} has no left child.`, { vars });
      }

      s.set('cmp', { text: `right = 2 * ${i} + 2 = ${r}` });
      vars.right = r;
      if (r < n) {
        kit.mark(r, 'ok', 1.08);
        kit.ptr('p-r', r, 'right', 'ok');
        s.snap(`The right child is always one spot later. Spot ${r} holds ${items[r]}.`, { vars });
      } else {
        s.snap(`Spot ${r} is past the end too, so there is no right child.`, { vars });
      }

      kit.unptr('p-l', 'p-r');
      kit.calm();
      kit.mark(i, 'active', 1.12);
      if (i > 0) {
        const cp = mix(pa, [i >> 1 === pa ? pa + 1 : i >> 1, Math.max(0, pa - 1), i - 1].filter(v => v !== pa), i + 1);
        s.snap(`Now go up, from spot ${i} to its parent.`, {
          vars,
          ask: { q: `What is (${i} - 1) // 2?`, options: cp.options, answer: cp.answer, why: `${i} - 1 is ${i - 1}. Halve it and drop any part after the point. That gives ${pa}.` },
        });
        s.set('cmp', { text: `parent = (${i} - 1) // 2 = ${pa}` });
        kit.mark(pa, 'warn', 1.08);
        kit.ptr('p-p', pa, 'parent', 'accent');
        vars.parent = pa;
        s.snap(`Spot ${pa} holds ${items[pa]}, right above spot ${i} in the tree.`, { vars });
      } else {
        const cp = mix('No', ['Yes, spot -1'], 0);
        s.set('cmp', { text: '(0 - 1) // 2 = -1' });
        s.snap('Spot 0 is the root. The sum gives -1.', {
          vars,
          ask: { q: 'Does the root have a parent?', options: cp.options, answer: cp.answer, why: 'The root is at the very top. In Python, h[-1] is the last item, not a parent.' },
        });
      }
      s.snap('The sums work for every spot, so the tree needs no arrows. Try another spot.', { vars });
    },
  });

  Viz.register('m20-check-heap', {
    title: 'Is this list a heap?',
    size: [560, 272],
    code: py`
      def is_heap(h):
          for i in range(1, len(h)):
              parent = (i - 1) // 2
              if h[parent] > h[i]:
                  return False
          return True
      print(is_heap(h))
    `,
    inputs: [{ key: 'list', label: 'List', type: 'text', value: '1, 4, 2, 7, 5, 3', size: 18 }],
    tryInputs: listTries.concat([{ list: '1, 2, 3, 4, 1' }, { list: '9, 1' }, { list: '1, 1, 2' }, { list: '2, 1, 3' }]),
    build(s, p) {
      const raw = readNums(p.list, 7);
      const h = raw.nums, n = h.length;
      s.text('cmp', 20, 16, '', { size: 14, anchor: 'start', mono: true, weight: 700 });
      const kit = heapKit(s);
      if (!n) {
        s.text('empty', 280, 120, 'This list is empty.', { size: 16, tone: 'muted' });
        const c = mix('True', ['False', 'IndexError'], 0);
        s.snap(`There are no items to check.${skipNote(raw.skipped)}`, {
          line: 2,
          ask: { q: 'The loop makes no trips. What does is_heap hand back?', options: c.options, answer: c.answer, why: 'No item broke the rule, so the line after the loop runs.' },
        });
        s.snap('print shows True. An empty list breaks no rule.', { line: 7, out: 'True' });
        return;
      }
      h.forEach(v => kit.add(v));
      s.snap(`Each item must be at least as big as its parent. Spot 0 has no parent.${skipNote(raw.skipped)}`, { line: 2 });
      let bad = -1;
      for (let i = 1; i < n; i += 1) {
        const pa = (i - 1) >> 1;
        const breaks = h[pa] > h[i];
        kit.calm();
        kit.mark(i, 'active', 1.1);
        kit.mark(pa, 'warn', 1.1);
        kit.ptr('p-i', i, 'i', 'active');
        kit.ptr('p-p', pa, 'parent', 'accent');
        s.set('cmp', { text: `spot ${i}: parent is spot ${pa}` });
        const showAsk = i % 2 === 1 || breaks;
        s.snap(`Spot ${i} holds ${h[i]}. Its parent, spot ${pa}, holds ${h[pa]}.`, {
          line: 4, vars: { i, parent: pa },
          ask: showAsk ? {
            q: `Is ${h[pa]} > ${h[i]}?`,
            options: ['Yes, the rule breaks', 'No, this pair is fine'],
            answer: breaks ? 0 : 1,
            why: breaks ? `The parent ${h[pa]} is bigger than its child ${h[i]}.` : `The parent ${h[pa]} is not bigger than its child ${h[i]}.`,
          } : null,
        });
        if (breaks) { bad = i; break; }
      }
      kit.unptr('p-i', 'p-p');
      if (bad > 0) {
        const pa = (bad - 1) >> 1;
        kit.mark(bad, 'bad', 1.1);
        kit.mark(pa, 'bad', 1.1);
        s.set('cmp', { text: `${h[pa]} > ${h[bad]}, so stop` });
        s.snap('One broken pair is enough. The function stops here.', { line: 5, vars: { i: bad, parent: pa } });
        s.snap('print shows False. This list is not a heap.', { line: 7, out: 'False' });
        return;
      }
      kit.calm();
      kit.mark(0, 'ok', 1.1);
      s.set('cmp', { text: 'no pair broke the rule' });
      s.snap(`Every pair passes, so the top holds the smallest item, ${h[0]}.`, { line: 6 });
      if (n < 3 || isSorted(h)) {
        s.snap(`print shows True. ${n > 2 ? 'A sorted list always passes, but most heaps are not sorted.' : 'A list this short has few pairs to check.'}`, { line: 7, out: 'True' });
        return;
      }
      const sorted = h.slice().sort((a, b) => a - b);
      s.set('cmp', { text: 'is it sorted?' });
      const c1 = mix('No', ['Yes'], 1);
      s.snap('print shows True. Now read the list from left to right.', {
        line: 7, out: 'True',
        ask: { q: `The list is ${show(h)}. Is it sorted?`, options: c1.options, answer: c1.answer, why: `In order, it would be ${show(sorted)}. A heap only promises parent and child.` },
      });
      if (h[1] !== sorted[1]) {
        const at = h.indexOf(sorted[1], 2);
        kit.calm();
        kit.mark(1, 'warn', 1.1);
        s.set('cmp', { text: `h[1] is ${h[1]}` });
        const c2 = mix('No', ['Yes'], 0);
        s.snap(`Spot 1 holds ${h[1]}. Is that the second smallest?`, {
          line: 7, out: 'True',
          ask: { q: `The second smallest here is ${sorted[1]}. Is h[1] always the second smallest?`, options: c2.options, answer: c2.answer, why: 'The second smallest is a child of the root. It can be on either side.' },
        });
        kit.mark(at, 'ok', 1.1);
        s.set('cmp', { text: `second smallest: spot ${at}` });
        s.snap(`The second smallest, ${sorted[1]}, sits in spot ${at}. It is still a child of the root.`, { line: 7, out: 'True' });
      }
    },
  });

  // ---------------------------------------------------------------- lesson 20.2
  Viz.register('m20-push', {
    title: 'Push: add at the end, then climb',
    size: [560, 272],
    code: py`
      def push(h, x):
          h.append(x)
          i = len(h) - 1
          while i > 0:
              p = (i - 1) // 2
              if h[p] <= h[i]:
                  break
              h[p], h[i] = h[i], h[p]
              i = p
      push(h, x)
      print(h)
    `,
    inputs: [
      { key: 'list', label: 'Heap', type: 'text', value: '2, 5, 3, 9, 6, 4', size: 16 },
      { key: 'x', label: 'New item x', type: 'number', value: 1, min: -99, max: 999 },
    ],
    tryInputs: [
      { list: '', x: 3 }, { list: '5', x: 1 }, { list: '5', x: 9 }, { list: '5', x: 5 }, { list: '2, 5, 3', x: 9 },
      { list: '2, 2, 2, 2', x: 2 }, { list: '1, 2, 3, 4, 5, 6', x: 0 }, { list: '6, 5, 4, 3, 2, 1', x: 1 },
      { list: 'cat, dog', x: 1 }, { list: '1, 2, 3, 4, 5, 6, 7, 8, 9', x: 4 }, { list: '2, 5, 3', x: '' },
    ],
    build(s, p) {
      const { nums, made, skipped } = heapFrom(p.list, 6);
      const x = whole(p.x, -99, 999, 1);
      const n = nums.length;
      s.text('cmp', 20, 16, '', { size: 14, anchor: 'start', mono: true, weight: 700 });
      s.text('count', 540, 16, 'swaps: 0', { size: 15, anchor: 'end', weight: 700 });
      const kit = heapKit(s);
      nums.forEach(v => kit.add(v));
      const first = !n ? 'This heap is empty.' : made ? 'heapify made your list into a heap first.' : 'This list is a heap. Every parent is no bigger than its children.';
      s.snap(first + skipNote(skipped), { line: 10, vars: { x } });

      const c0 = n ? mix(`Spot ${n}, at the end`, ['Spot 0, at the top', 'Where the sorted order says'], n % 3) : mix('Spot 0, the only spot', ['Spot 1', 'Spot -1'], 1);
      s.snap(`Now push ${x}.`, {
        line: 2, vars: { x },
        ask: { q: `Where does ${x} go first?`, options: c0.options, answer: c0.answer, why: n ? `A tree has no gaps, so spot ${n} is the only free spot. The list stays full.` : 'The heap is empty, so the new item starts at spot 0.' },
      });
      kit.add(x);
      let i = n, swaps = 0, trip = 0;
      kit.mark(i, 'active', 1.1);
      kit.ptr('p-i', i, 'new', 'active');
      s.set('cmp', { text: `h.append(${x})` });
      s.snap(`${x} goes in spot ${i}. The shape is fine, but the rule may be broken.`, { line: 2, vars: { x, i } });

      while (i > 0) {
        const pa = (i - 1) >> 1;
        const pv = kit.val[kit.at[pa]];
        if (trip === 0) {
          const c1 = mix(pa, [i >> 1 === pa ? pa + 1 : i >> 1, i - 1, Math.max(0, pa - 1)].filter(v => v !== pa), i);
          s.snap('Find the parent, so the new item can compare.', {
            line: 5, vars: { x, i },
            ask: { q: `What is (${i} - 1) // 2?`, options: c1.options, answer: c1.answer, why: `${i} - 1 is ${i - 1}. Halve it and drop any part after the point. That gives ${pa}.` },
          });
        }
        kit.mark(pa, 'warn', 1.1);
        kit.ptr('p-p', pa, 'parent', 'accent');
        s.set('cmp', { text: `parent = (${i} - 1) // 2 = ${pa}` });
        const stop = pv <= x;
        s.snap(`The parent, in spot ${pa}, holds ${pv}.`, {
          line: 6, vars: { x, i, p: pa },
          ask: {
            q: `Is the parent ${pv} at most ${x}?`,
            options: ['Yes, so stop', 'No, so swap'],
            answer: stop ? 0 : 1,
            why: stop ? `${pv} <= ${x}, so this pair keeps the rule. A tie stops the climb too.` : `${pv} is bigger than ${x}, so this pair breaks the rule.`,
          },
        });
        if (stop) {
          s.set('cmp', { text: `${pv} <= ${x}, so stop` });
          s.snap(`The rule holds here, so ${x} stays in spot ${i}.`, { line: 7, vars: { x, i, p: pa } });
          break;
        }
        kit.swap(pa, i);
        swaps += 1;
        s.set('count', { text: `swaps: ${swaps}` });
        kit.mark(i, 'default');
        kit.mark(pa, 'active', 1.1);
        kit.unptr('p-p');
        kit.ptr('p-i', pa, 'new', 'active');
        s.set('cmp', { text: `swap spots ${pa} and ${i}` });
        s.snap(`${x} climbs to spot ${pa}, and ${pv} drops to spot ${i}.`, { line: 8, vars: { x, i: pa } });
        i = pa;
        trip += 1;
      }
      kit.unptr('p-i', 'p-p');
      kit.calm();
      kit.mark(i, 'ok', 1.1);
      if (i === 0) s.set('cmp', { text: 'i is 0, so stop' });
      const out = show(kit.vals());
      s.snap(`print shows the list. It took ${many(swaps, 'swap')}, and the tree has only ${many(kit.o.ys.filter((_, d) => 2 ** d <= kit.n).length, 'level')}.`, { line: 11, vars: { x, swaps }, out });
    },
  });

  Viz.register('m20-pop', {
    title: 'Pop: take the top, then sink',
    size: [560, 272],
    code: py`
      top = h[0]
      last = h.pop()
      if len(h) > 0:
          h[0] = last
          i = 0
          while 2 * i + 1 < len(h):
              c = 2 * i + 1
              if c + 1 < len(h) and h[c] >= h[c + 1]:
                  c = c + 1
              if h[i] <= h[c]:
                  break
              h[i], h[c] = h[c], h[i]
              i = c
      print(top, h)
    `,
    inputs: [{ key: 'list', label: 'Heap', type: 'text', value: '1, 3, 2, 8, 5, 4, 9', size: 18 }],
    tryInputs: listTries.concat([{ list: '1, 2, 2, 5, 6, 3, 4' }, { list: '1, 1, 1' }]),
    build(s, p) {
      const { nums, made, skipped } = heapFrom(p.list, 7);
      const n = nums.length;
      s.text('cmp', 20, 16, '', { size: 14, anchor: 'start', mono: true, weight: 700 });
      s.text('count', 540, 16, 'swaps: 0', { size: 15, anchor: 'end', weight: 700 });
      const kit = heapKit(s);
      if (!n) {
        s.text('empty', 280, 120, 'This heap is empty.', { size: 16, tone: 'muted' });
        const c = mix('IndexError', ['None', '0'], 0);
        s.snap(`There is nothing to take.${skipNote(skipped)}`, {
          line: 1,
          ask: { q: 'What does h[0] do on an empty heap?', options: c.options, answer: c.answer, why: 'Spot 0 does not exist. heappop gives an IndexError too. So check first.' },
        });
        s.snap('Python stops with an IndexError. Always check that the heap has items.', { line: 1, out: 'IndexError' });
        return;
      }
      nums.forEach(v => kit.add(v));
      s.snap((made ? 'heapify made your list into a heap first.' : 'This list is a heap.') + skipNote(skipped), { line: 1 });
      const topV = nums[0];
      const c0 = mix(topV, [nums[n - 1], n > 1 ? nums[1] : topV + 1, Math.max(...nums) + 1], 1);
      s.snap('You want the smallest item.', {
        line: 1,
        ask: { q: 'Which number comes out first?', options: c0.options, answer: c0.answer, why: `The rule keeps the smallest in spot 0. That is ${topV}.` },
      });
      kit.mark(0, 'ok', 1.1);
      kit.ptr('p-t', 0, 'top', 'ok');
      s.set('cmp', { text: `top = ${topV}` });
      s.snap(`top saves ${topV}. Taking from spot 0 would leave a hole.`, { line: 1, vars: { top: topV } });
      kit.unptr('p-t');

      const topId = kit.at[0];
      const lastId = kit.at[n - 1];
      const lastV = kit.val[lastId];
      if (n === 1) {
        s.text('outl', 520, 56, 'out', { size: 13, tone: 'muted', weight: 700 });
        s.set('n' + topId, { x: 520, y: 84, scale: 1, tone: 'ok' });
        s.del('b' + topId, 'e0', 'ti0', 'a0', 'li0');
        kit.at.pop();
        s.set('cmp', { text: 'h is now []' });
        s.snap('That was the last item, so the list is now empty.', { line: 2, vars: { top: topV } });
        s.snap(`print shows ${topV} and an empty list. Nothing needs to sink.`, { line: 14, vars: { top: topV }, out: `${topV} []` });
        return;
      }
      const c1 = mix(lastV, n > 2 ? [kit.val[kit.at[1]], kit.val[kit.at[2]]] : [topV], 2);
      s.snap('The list must not have a gap at the front.', {
        line: 2, vars: { top: topV },
        ask: { q: 'Which item moves into the empty top spot?', options: c1.options, answer: c1.answer, why: `Only the last spot can go without leaving a gap. So ${lastV} moves, even though it is large.` },
      });
      // The last item slides to the top. The old top leaves the list.
      s.text('outl', 520, 56, 'out', { size: 13, tone: 'muted', weight: 700 });
      s.del('b' + topId);
      s.set('n' + topId, { x: 520, y: 84, scale: 1, tone: 'ok' });
      const lastSpot = n - 1;
      s.del('e' + lastSpot, 'ti' + lastSpot, 'li' + lastSpot, 'a' + lastSpot);
      s.set('n' + lastId, { x: kit.tx(0), y: kit.ty(0), tone: 'active', scale: 1.1 });
      s.set('b' + lastId, { x: kit.lx(0), tone: 'active', scale: 1.1 });
      kit.at[0] = lastId;
      kit.at.pop();
      s.set('cmp', { text: `h[0] = ${lastV}` });
      s.snap(`${lastV} moves from the last spot to the top. The shape is fine, but the rule is not.`, { line: 4, vars: { top: topV } });

      let swaps = 0;
      sinkFrames(s, kit, 0, {
        lines: { pick: 8, stop: 11, swap: 12 },
        vars: v => ({ top: topV, i: v.i }),
        onSwap() { swaps += 1; s.set('count', { text: `swaps: ${swaps}` }); },
      });
      kit.calm();
      s.set('cmp', { text: 'the rule holds again' });
      s.snap(`print shows ${topV} and the new heap. It took ${many(swaps, 'swap')}.`, { line: 14, vars: { top: topV, swaps }, out: `${topV} ${show(kit.vals())}` });
    },
  });

  Viz.register('m20-heapify', {
    title: 'heapify: fix the small trees first',
    size: [560, 272],
    code: py`
      n = len(h)
      for start in range(n // 2 - 1, -1, -1):
          i = start
          while 2 * i + 1 < n:
              c = 2 * i + 1
              if c + 1 < n and h[c] >= h[c + 1]:
                  c = c + 1
              if h[i] <= h[c]:
                  break
              h[i], h[c] = h[c], h[i]
              i = c
      print(h)
    `,
    inputs: [{ key: 'list', label: 'List', type: 'text', value: '9, 4, 7, 1, 8, 2', size: 18 }],
    tryInputs: listTries,
    build(s, p) {
      const raw = readNums(p.list, 7);
      const n = raw.nums.length;
      s.text('cmp', 20, 16, '', { size: 14, anchor: 'start', mono: true, weight: 700 });
      s.text('count', 540, 16, 'swaps: 0', { size: 15, anchor: 'end', weight: 700 });
      const kit = heapKit(s);
      raw.nums.forEach(v => kit.add(v));
      if (!n) {
        s.text('empty', 280, 120, 'This list is empty.', { size: 16, tone: 'muted' });
        s.snap(`There is nothing to fix.${skipNote(raw.skipped)}`, { line: 1 });
        s.snap('The loop makes no trips. An empty list stays empty.', { line: 12, out: '[]' });
        return;
      }
      s.snap(`This list is in any order. Now make it a heap, with no new list.${skipNote(raw.skipped)}`, { line: 1 });
      if (n === 1) {
        s.snap('One item has no children, so the loop makes no trips.', { line: 2 });
        s.snap('print shows the same list. One item is already a heap.', { line: 12, out: show(kit.vals()) });
        return;
      }
      const lastParent = (n >> 1) - 1;
      const c0 = mix(lastParent, [n - 1, n >> 1, 0].filter(v => v !== lastParent), n);
      s.snap(`The list has ${many(n, 'item')}. Items with no children cannot break the rule.`, {
        line: 2, vars: { n },
        ask: { q: `n // 2 - 1 is the last spot with a child. What is it here?`, options: c0.options, answer: c0.answer, why: `${n} // 2 is ${n >> 1}. Take away 1, and you get ${lastParent}. Spots after that have no children.` },
      });
      for (let i = lastParent + 1; i < n; i += 1) kit.mark(i, 'ok');
      s.set('cmp', { text: `start at spot ${lastParent}` });
      s.snap(`Spots ${lastParent + 1 === n - 1 ? n - 1 : `${lastParent + 1} to ${n - 1}`} have no children. So the work starts at spot ${lastParent}.`, { line: 2, vars: { n } });

      let swaps = 0;
      for (let start = lastParent; start >= 0; start -= 1) {
        const first = start === lastParent;
        sinkFrames(s, kit, start, {
          lines: { pick: 6, stop: 9, swap: 10 },
          vars: v => ({ start, i: v.i }),
          asks: level => level === 0 && (first || start === 0 || start % 2 === 0),
          onSwap() { swaps += 1; s.set('count', { text: `swaps: ${swaps}` }); },
        });
      }
      kit.calm();
      kit.mark(0, 'ok', 1.1);
      s.set('cmp', { text: `${many(swaps, 'swap')} in all` });
      s.snap(`print shows a real heap. It took ${many(swaps, 'swap')}. Items near the bottom had little to do.`, { line: 12, vars: { swaps }, out: show(kit.vals()) });
    },
  });

  Viz.register('m20-tie-break', {
    title: 'Fair ties: (priority, count, task)',
    size: [560, 254],
    code: py`
      h = []
      count = 0
      for priority, task in jobs:
          item = (priority, count, task)
          heappush(h, item)
          count = count + 1
      while len(h) > 0:
          print(heappop(h))
    `,
    inputs: [{ key: 'jobs', label: 'Jobs (priority name)', type: 'text', value: '2 Zed, 1 Mo, 2 Ann, 2 Bo', size: 24 }],
    tryInputs: [
      { jobs: '' }, { jobs: '1 Ann' }, { jobs: '2 Zed, 2 Ann' }, { jobs: '1 A, 1 A, 1 A' }, { jobs: '5 Ed, 4 Di, 3 Cy, 2 Bo, 1 Al' },
      { jobs: '1 Al, 2 Bo, 3 Cy, 4 Di, 5 Ed' }, { jobs: 'cat, 99 dog, 3' }, { jobs: '1 Al, 1 Bo, 1 Cy, 1 Di, 1 Ed, 1 Fi, 1 Gu' }, { jobs: '3 Christopher' },
    ],
    build(s, p) {
      const parts = String(p.jobs == null ? '' : p.jobs).split(',').map(t => t.trim()).filter(Boolean);
      const jobs = [];
      let skipped = 0;
      parts.forEach(t => {
        const m = /^(\d)\s+([A-Za-z]+)$/.exec(t);
        if (m && jobs.length < 5) jobs.push({ pr: Number(m[1]), name: m[2].slice(0, 5) });
        else skipped += 1;
      });
      const leftX = 150, rightX = 420, W = 186;
      const Y = i => 54 + i * 38;
      s.text('cmp', 280, 240, '', { size: 14, mono: true, weight: 700 });
      s.text('hl', leftX, 20, 'h: the heap list', { size: 14, tone: 'muted', weight: 700 });
      s.text('sl', rightX, 20, 'served', { size: 14, tone: 'muted', weight: 700 });
      if (!jobs.length) {
        s.text('empty', 280, 110, 'No jobs yet.', { size: 16, tone: 'muted' });
        s.snap(`There are no jobs to serve.${skipNote(skipped)}`, { line: 1 });
        s.snap('The while loop makes no trips, so nothing prints. Type jobs like: 2 Zed, 1 Mo', { line: 7, out: '' });
        return;
      }
      const label = t => `(${t[0]}, ${t[1]}, '${t[2]}')`;
      const key = e => e.t;
      const h = [];
      const place = () => {
        h.forEach((e, i) => {
          s.set(e.id, { x: leftX, y: Y(i) });
          if (!s.has('si' + i)) s.text('si' + i, 40, Y(i), i, { size: 13, tone: 'muted', mono: true });
        });
        for (let i = h.length; s.has('si' + i); i += 1) s.del('si' + i);
      };
      s.snap(`Each job becomes a tuple. count goes up by 1 for each new job.${skipNote(skipped)}`, { line: 2, vars: { count: 0 } });
      let tieAsked = false;
      jobs.forEach((job, c) => {
        const t = [job.pr, c, job.name];
        const twin = h.find(e => e.t[0] === job.pr);
        let ask = null;
        if (twin && !tieAsked) {
          tieAsked = true;
          const m = mix('The counts', ['The names', 'Nothing, so it crashes'], c);
          ask = { q: `${label(t)} ties with ${label(twin.t)} on priority. What does Python compare next?`, options: m.options, answer: m.answer, why: `Tuples compare item by item. The counts ${twin.t[1]} and ${c} differ, so Python never looks at the names.` };
        }
        if (ask) {
          s.set('cmp', { text: `item = ${label(t)}` });
          s.snap(`${job.name} has the same priority as ${twin.t[2]}.`, { line: 4, vars: { priority: job.pr, count: c, task: job.name }, ask });
        }
        const e = { t, id: 't' + c };
        s.box(e.id, leftX, Y(h.length), label(t), { w: W, h: 32, size: 16, tone: 'active' });
        hpush(h, e, key);
        h.forEach(x => { if (x !== e) s.set(x.id, { tone: 'default' }); });
        place();
        s.set('cmp', { text: `heappush(h, ${label(t)})` });
        s.snap(`${job.name} gets priority ${job.pr} and count ${c}. Spot 0 holds the smallest tuple.`, { line: 5, vars: { priority: job.pr, count: c, task: job.name } });
      });
      h.forEach(x => s.set(x.id, { tone: 'default' }));
      s.text('nx', 276, Y(0), 'next', { size: 13, weight: 700 });
      let out = '';
      let served = 0;
      while (h.length) {
        const top = h[0];
        const names = h.map(e => e.t[2]);
        const rest = names.filter(x => x !== top.t[2]);
        const m = rest.length ? mix(top.t[2], rest.slice(0, 2), served) : null;
        const twin = h.find(e => e !== top && e.t[0] === top.t[0]);
        s.set(top.id, { tone: 'active' });
        s.set('cmp', { text: twin ? `tie on ${top.t[0]}: count ${top.t[1]} < ${twin.t[1]}` : `lowest priority: ${top.t[0]}` });
        s.snap(`heappop takes spot 0, the smallest tuple.`, {
          line: 8, out,
          ask: m ? {
            q: 'Who is served next?',
            options: m.options, answer: m.answer,
            why: twin ? `${top.t[2]} ties on priority, but came earlier. The lower count goes first.` : `${top.t[2]} has the lowest priority number, so ${top.t[2]} goes first.`,
          } : null,
        });
        hpop(h, key);
        s.set(top.id, { x: rightX, y: Y(served), tone: 'ok' });
        place();
        served += 1;
        out += (out ? '\n' : '') + label(top.t);
        if (!h.length) s.del('nx');
        s.set('cmp', { text: '' });
        s.snap(`${top.t[2]} is served. Number ${served} is done.`, { line: 8, out });
      }
      s.snap('Ties went in the order they came, and no name was ever compared.', { line: 7, out });
    },
  });

  // ---------------------------------------------------------------- lesson 20.3
  Viz.register('m20-top-k', {
    title: 'Keep the k biggest, with a small heap',
    size: [560, 214],
    code: py`
      def top_k(items, k):
          h = []
          for x in items:
              heappush(h, x)
              if len(h) > k:
                  heappop(h)
          return sorted(h, reverse=True)
      print(top_k(items, k))
    `,
    inputs: [
      { key: 'list', label: 'Items', type: 'text', value: '4, 9, 1, 7, 5, 8', size: 18 },
      { key: 'k', label: 'k', type: 'number', value: 3, min: 0, max: 5 },
    ],
    tryInputs: [
      { list: '', k: 3 }, { list: '5', k: 1 }, { list: '5', k: 3 }, { list: '4, 9, 1', k: 0 }, { list: '4, 9, 1', k: 5 },
      { list: '7, 7, 7, 7', k: 2 }, { list: '1, 2, 3, 4, 5, 6, 7, 8', k: 1 }, { list: '8, 7, 6, 5, 4, 3, 2, 1', k: 5 },
      { list: 'cat, dog', k: 2 }, { list: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11', k: 2 }, { list: '3, 1', k: '' },
    ],
    build(s, p) {
      const raw = readNums(p.list, 8);
      const items = raw.nums, n = items.length;
      const k = whole(p.k, 0, 5, 3);
      s.text('il', 20, 34, 'items', { size: 14, anchor: 'start', tone: 'muted', weight: 700 });
      s.text('hl', 20, 130, 'heap', { size: 14, anchor: 'start', tone: 'muted', weight: 700 });
      s.text('cmp', 280, 198, '', { size: 15, mono: true, weight: 700 });
      if (!n) {
        s.text('empty', 280, 34, 'This list is empty.', { size: 16, tone: 'muted' });
        s.snap(`There are no items, so the loop makes no trips.${skipNote(raw.skipped)}`, { line: 3, vars: { k } });
        s.snap('print shows an empty list. Nothing crashes.', { line: 8, vars: { k }, out: '[]' });
        return;
      }
      const row = { y: 34, cell: 44, gap: 6 };
      s.row('c', items, Object.assign({ index: false }, row));
      const hx = i => s.slotX(i, 6, { cell: 52, gap: 6 });
      const h = [];
      const key = e => e.v;
      const place = () => {
        h.forEach((e, i) => s.set(e.id, { x: hx(i) }));
        for (let i = 0; i < 6; i += 1) {
          if (i < h.length && !s.has('hi' + i)) s.text('hi' + i, hx(i), 172, i, { size: 13, tone: 'muted', mono: true });
          if (i >= h.length && s.has('hi' + i)) s.del('hi' + i);
        }
        if (h.length) {
          if (s.has('door')) s.set('door', { x: hx(0) });
          else s.pointer('door', hx(0), 102, 'smallest', { dir: 'down', tone: 'accent' });
        } else s.del('door');
      };
      s.snap(`You want the ${k} biggest. The heap never holds more than ${k + 1} at once.${skipNote(raw.skipped)}`, { line: 2, vars: { k } });
      let asks = 0;
      items.forEach((x, idx) => {
        s.tone('c' + idx, 'active');
        const e = { v: x, id: 'h' + idx };
        s.box(e.id, hx(h.length), 130, x, { w: 52, h: 52, tone: 'active' });
        hpush(h, e, key);
        h.forEach(o => { if (o !== e) s.set(o.id, { tone: 'default' }); });
        place();
        s.set('cmp', { text: `heappush(h, ${x})` });
        s.snap(`${x} joins the heap. Spot 0 still holds the smallest.`, { line: 4, vars: { x, k, 'len(h)': h.length } });
        if (h.length > k) {
          const small = h[0];
          asks += 1;
          const others = h.map(o => o.v).filter(v => v !== small.v);
          const m = others.length ? mix(small.v, [x === small.v ? others[others.length - 1] : x, others[0]], idx) : null;
          s.snap(`The heap holds ${h.length}, which is more than k.`, {
            line: 5, vars: { x, k, 'len(h)': h.length },
            ask: m && asks % 3 !== 0 ? {
              q: 'Which number leaves?',
              options: m.options, answer: m.answer,
              why: `heappop takes the smallest. That is ${small.v}, so it cannot be one of the ${k} biggest.`,
            } : null,
          });
          hpop(h, key);
          s.del(small.id);
          h.forEach(o => s.set(o.id, { tone: 'default' }));
          place();
          s.set('cmp', { text: `heappop(h) takes ${small.v}` });
          s.snap(`${small.v} leaves. ${small.v === x ? 'The new number was too small to stay.' : `The ${k} biggest so far stay.`}`, { line: 6, vars: { x, k, 'len(h)': h.length } });
        } else {
          h.forEach(o => s.set(o.id, { tone: 'default' }));
        }
        s.set('c' + idx, { tone: 'muted', scale: 0.78 });
      });
      const ans = h.map(e => e.v).sort((a, b) => b - a);
      s.set('cmp', { text: `sorted: ${show(ans)}` });
      s.snap(n < k ? `There are fewer than ${k} items, so you get them all.` : k === 0 ? 'With k of 0, nothing stays in the heap.' : 'The heap holds the answer. sorted puts it in order for you.', { line: 7, vars: { k } });
      s.snap(ans.length ? `print shows the ${many(ans.length, 'item')}. The heap never grew past ${k + 1}.` : 'print shows an empty list. Nothing crashes.', { line: 8, vars: { k }, out: show(ans) });
    },
  });

  Viz.register('m20-merge-k', {
    title: 'Merge sorted lists: the heap holds the fronts',
    size: [560, 244],
    code: py`
      h = []
      for which in range(len(lists)):
          row = lists[which]
          if len(row) > 0:
              heappush(h, (row[0], which, 0))
      out = []
      while len(h) > 0:
          value, which, spot = heappop(h)
          out.append(value)
          row = lists[which]
          spot = spot + 1
          if spot < len(row):
              heappush(h, (row[spot], which, spot))
      print(out)
    `,
    inputs: [
      { key: 'a', label: 'List 0', type: 'text', value: '1, 4, 7', size: 9 },
      { key: 'b', label: 'List 1', type: 'text', value: '2, 5', size: 9 },
      { key: 'c', label: 'List 2', type: 'text', value: '3, 6', size: 9 },
    ],
    tryInputs: [
      { a: '', b: '', c: '' }, { a: '5', b: '', c: '' }, { a: '', b: '', c: '5' }, { a: '1, 1', b: '1', c: '1, 1' },
      { a: '9, 2, 5', b: '4', c: 'cat' }, { a: '1, 2, 3, 4, 5', b: '6, 7, 8, 9', c: '0, 0, 0, 0' }, { a: '-5, 99', b: '-99', c: '100' },
    ],
    build(s, p) {
      const raws = [p.a, p.b, p.c].map(t => readNums(t, 3, -99, 99));
      const lists = raws.map(r => r.nums.slice().sort((x, y) => x - y));
      const skipped = raws.reduce((a, r) => a + r.skipped, 0);
      const changed = raws.some(r => !isSorted(r.nums));
      const rowY = [50, 96, 142];
      const CX = (i) => 96 + i * 44;
      const H = 420;
      s.text('hl', H, 14, 'heap: (value, which, spot)', { size: 13, tone: 'muted', weight: 700 });
      s.text('ol', 20, 204, 'out', { size: 14, anchor: 'start', tone: 'muted', weight: 700 });
      lists.forEach((row, w) => {
        s.text('rl' + w, 20, rowY[w], 'list ' + w, { size: 14, anchor: 'start', tone: 'muted', weight: 700 });
        row.forEach((v, i) => s.box(`c${w}_${i}`, CX(i), rowY[w], v, { w: 38, h: 38 }));
        if (!row.length) s.text('e' + w, 96, rowY[w], 'empty', { size: 13, anchor: 'start', tone: 'muted' });
      });
      const OX = i => 76 + i * 46;
      const total = lists.reduce((a, r) => a + r.length, 0);
      const note = (changed ? ' I sorted your lists first.' : '') + skipNote(skipped);
      if (!total) {
        s.snap(`All the lists are empty.${note}`, { line: 4 });
        s.snap('No front goes in the heap, so the loop never runs. print shows [].', { line: 14, out: '[]' });
        return;
      }
      const h = [];
      const key = e => e.t;
      const label = t => `(${t[0]}, ${t[1]}, ${t[2]})`;
      const place = () => {
        h.forEach((e, i) => {
          s.set(e.id, { x: H, y: rowY[i] });
          if (!s.has('si' + i)) s.text('si' + i, H - 106, rowY[i], i, { size: 13, tone: 'muted', mono: true });
        });
        for (let i = h.length; s.has('si' + i); i += 1) s.del('si' + i);
      };
      const addFront = (w, i) => {
        const t = [lists[w][i], w, i];
        const e = { t, id: `t${w}_${i}` };
        s.box(e.id, H, rowY[h.length], label(t), { w: 180, h: 36, size: 17, tone: 'active' });
        hpush(h, e, key);
        h.forEach(o => { if (o !== e) s.set(o.id, { tone: 'default' }); });
        place();
        s.set(`c${w}_${i}`, { tone: 'active' });
        return t;
      };
      s.snap(`Each list is sorted. So its smallest item is at its front.${note}`, { line: 2 });
      lists.forEach((row, w) => { if (row.length) addFront(w, 0); });
      h.forEach(o => s.set(o.id, { tone: 'default' }));
      s.snap(`The front of each list goes in the heap. It holds at most ${lists.length} tuples.`, { line: 5 });
      const out = [];
      let trip = 0;
      while (h.length) {
        const top = h[0];
        const [value, which, spot] = top.t;
        const others = h.filter(e => e !== top).map(e => e.t[0]);
        const m = mix(value, others.filter(v => v !== value).concat([value + 1]).slice(0, 2), trip);
        if (trip % 2 === 0) {
          s.snap('Which front is smallest? The heap knows: spot 0.', {
            line: 8, vars: { out: show(out) },
            ask: { q: 'Which value goes to out next?', options: m.options, answer: m.answer, why: `${value} is the smallest front, so it is in spot 0. Ties go to the lower list number.` },
          });
        }
        hpop(h, key);
        s.del(top.id);
        place();
        s.set(`c${which}_${spot}`, { tone: 'muted', scale: 0.78 });
        s.box('o' + out.length, OX(out.length), 204, value, { w: 40, h: 40, tone: 'ok' });
        out.push(value);
        h.forEach(o => s.set(o.id, { tone: 'default' }));
        s.snap(`${value} goes to out. It came from list ${which}, spot ${spot}.`, { line: 9, vars: { value, which, spot } });
        if (spot + 1 < lists[which].length) {
          const nt = addFront(which, spot + 1);
          s.snap(`List ${which} sends its next item, ${nt[0]}.`, { line: 13, vars: { value, which, spot: spot + 1 } });
          h.forEach(o => s.set(o.id, { tone: 'default' }));
        } else {
          s.snap(`List ${which} has no more items, so the heap shrinks.`, { line: 12, vars: { value, which, spot: spot + 1 } });
        }
        trip += 1;
      }
      s.snap(`print shows all ${total} items in order. The heap never held more than ${lists.length}.`, { line: 14, out: show(out) });
    },
  });

  Viz.register('m20-two-heaps', {
    title: 'Running median: 2 heaps, one for each half',
    size: [560, 198],
    code: py`
      def add(x):
          if len(low) == 0 or x <= -low[0]:
              heappush(low, -x)
          else:
              heappush(high, x)
          if len(low) > len(high) + 1:
              heappush(high, -heappop(low))
          elif len(high) > len(low):
              heappush(low, -heappop(high))
      def median():
          if len(low) > len(high):
              return -low[0]
          return (-low[0] + high[0]) / 2
    `,
    inputs: [{ key: 'list', label: 'Numbers', type: 'text', value: '5, 1, 9, 3, 7', size: 18 }],
    tryInputs: [
      { list: '' }, { list: '5' }, { list: '5, 5' }, { list: '5, 5, 5, 5, 5, 5' }, { list: '1, 2, 3, 4, 5, 6' }, { list: '6, 5, 4, 3, 2, 1' },
      { list: 'cat, 4' }, { list: '-5, -1, -9' }, { list: '1, 2, 3, 4, 5, 6, 7, 8, 9' }, { list: '99, -99' },
    ],
    build(s, p) {
      const raw = readNums(p.list, 6, -99, 99);
      const items = raw.nums, n = items.length;
      s.text('ll', 145, 70, 'low: stored as negatives', { size: 13, tone: 'muted', weight: 700 });
      s.text('hl', 415, 70, 'high', { size: 13, tone: 'muted', weight: 700 });
      s.box('wall', 280, 112, '', { w: 4, h: 60, tone: 'muted' });
      s.text('cmp', 280, 182, '', { size: 15, mono: true, weight: 700 });
      if (!n) {
        s.text('empty', 280, 30, 'No numbers yet.', { size: 16, tone: 'muted' });
        s.snap(`There are no numbers, so both heaps are empty.${skipNote(raw.skipped)}`, { line: 1 });
        s.snap('With no numbers, there is no median. Calling median() here gives an IndexError.', { line: 13, out: 'IndexError' });
        return;
      }
      s.row('c', items, { y: 30, cell: 40, gap: 6, index: false });
      const LX = i => 145 + (i - 1.5) * 50;
      const HX = i => 415 + (i - 1.5) * 50;
      const low = [], high = [];
      const key = e => e.v;
      const place = () => {
        low.forEach((e, i) => s.set(e.id, { x: LX(i), y: 112, text: e.v, sub: String(-e.v) }));
        high.forEach((e, i) => s.set(e.id, { x: HX(i), y: 112, text: e.v, sub: '' }));
      };
      const vars = extra => Object.assign({ 'len(low)': low.length, 'len(high)': high.length }, extra);
      const fmt = v => (Number.isInteger(v) ? `${v}.0` : String(v));
      s.snap(`low keeps the smaller half. high keeps the bigger half.${skipNote(raw.skipped)}`, { line: 1 });
      let out = '';
      items.forEach((x, idx) => {
        s.tone('c' + idx, 'active');
        const toLow = !low.length || x <= -low[0].v;
        const e = { v: toLow ? -x : x, id: 'v' + idx };
        const top = low.length ? -low[0].v : null;
        s.set('cmp', { text: top == null ? `x = ${x}, low is empty` : `x = ${x}, biggest of low = ${top}` });
        const showSide = idx < 4;
        s.snap(`Next number: ${x}.`, {
          line: 2, vars: vars({ x }), out,
          ask: showSide ? {
            q: `Which side does ${x} join?`,
            options: ['low', 'high'],
            answer: toLow ? 0 : 1,
            why: top == null ? 'low is empty, so the first number goes there.' : toLow ? `${x} is not above ${top}, the biggest of low.` : `${x} is above ${top}, the biggest of low.`,
          } : null,
        });
        s.box(e.id, toLow ? LX(low.length) : HX(high.length), 112, e.v, { w: 44, h: 44, tone: 'active' });
        if (toLow) hpush(low, e, key); else hpush(high, e, key);
        low.concat(high).forEach(o => { if (o !== e) s.set(o.id, { tone: 'default' }); });
        place();
        s.set('cmp', { text: toLow ? `heappush(low, ${-x})` : `heappush(high, ${x})` });
        s.snap(toLow ? `${x} joins low, stored as ${-x}. Spot 0 means the biggest of low.` : `${x} joins high. Spot 0 is the smallest of high.`, { line: toLow ? 3 : 5, vars: vars({ x }), out });
        if (low.length > high.length + 1) {
          const mv = hpop(low, key);
          mv.v = -mv.v;
          hpush(high, mv, key);
          low.concat(high).forEach(o => s.set(o.id, { tone: o === mv ? 'warn' : 'default' }));
          place();
          s.set('cmp', { text: `move ${mv.v} to high` });
          s.snap(`low has 2 more than high. So its biggest, ${mv.v}, moves across.`, { line: 7, vars: vars({ x }), out });
        } else if (high.length > low.length) {
          const mv = hpop(high, key);
          mv.v = -mv.v;
          hpush(low, mv, key);
          low.concat(high).forEach(o => s.set(o.id, { tone: o === mv ? 'warn' : 'default' }));
          place();
          s.set('cmp', { text: `move ${-mv.v} to low` });
          s.snap(`high is bigger than low. So its smallest, ${-mv.v}, moves across.`, { line: 9, vars: vars({ x }), out });
        }
        const odd = low.length > high.length;
        const a = -low[0].v;
        const b = high.length ? high[0].v : null;
        const med = odd ? a : (a + b) / 2;
        const medText = odd ? String(a) : fmt(med);
        low.concat(high).forEach(o => s.set(o.id, { tone: 'default' }));
        s.set(low[0].id, { tone: 'active' });
        if (!odd) s.set(high[0].id, { tone: 'active' });
        const wrongs = odd ? [high.length ? b : a + 1, a + 1] : [a, b];
        const m = mix(medText, wrongs.map(String), idx);
        s.set('cmp', { text: odd ? `median = biggest of low` : `median = (${a} + ${b}) / 2` });
        if (idx >= 1 && idx <= 3) {
          s.snap(odd ? 'low has one extra, so the middle is its biggest.' : 'The sides are level, so the middle sits between them.', {
            line: odd ? 12 : 13, vars: vars({ x }), out,
            ask: {
              q: 'What is the median now?',
              options: m.options, answer: m.answer,
              why: odd ? `${a} is the biggest of low, and low has one extra.` : `Halfway between ${a} and ${b} is ${medText}.`,
            },
          });
        }
        out += (out ? '\n' : '') + medText;
        s.set('cmp', { text: `median is ${medText}` });
        s.set('c' + idx, { tone: 'muted', scale: 0.78 });
        s.snap(`After ${many(idx + 1, 'number')}, the median is ${medText}. ${odd ? 'low has one extra.' : 'The sides are level.'}`, { line: odd ? 12 : 13, vars: vars({ x }), out });
      });
    },
  });

  // ---------------------------------------------------------------- lesson 20.5 (bonus)
  Viz.register('m20-heapsort', {
    title: 'Heapsort: the biggest goes to the back',
    size: [560, 288],
    code: py`
      def sink(a, i, end):
          while 2 * i + 1 < end:
              c = 2 * i + 1
              if c + 1 < end and a[c + 1] > a[c]:
                  c = c + 1
              if a[i] >= a[c]:
                  return
              a[i], a[c] = a[c], a[i]
              i = c
      n = len(a)
      for i in range(n // 2 - 1, -1, -1):
          sink(a, i, n)
      for end in range(n - 1, 0, -1):
          a[0], a[end] = a[end], a[0]
          sink(a, 0, end)
      print(a)
    `,
    inputs: [{ key: 'list', label: 'List', type: 'text', value: '3, 8, 5, 1, 6', size: 18 }],
    tryInputs: listTries.concat([{ list: '1, 2, 3, 4, 5, 6' }, { list: '6, 5, 4, 3, 2, 1' }, { list: '2, 2, 1, 1, 3, 3' }]),
    build(s, p) {
      const raw = readNums(p.list, 6);
      const n = raw.nums.length;
      s.text('cmp', 20, 16, '', { size: 14, anchor: 'start', mono: true, weight: 700 });
      s.text('count', 540, 16, 'swaps: 0', { size: 15, anchor: 'end', weight: 700 });
      const kit = heapKit(s);
      raw.nums.forEach(v => kit.add(v));
      if (!n) {
        s.text('empty', 280, 120, 'This list is empty.', { size: 16, tone: 'muted' });
        s.snap(`There is nothing to sort.${skipNote(raw.skipped)}`, { line: 10 });
        s.snap('Both loops make no trips. print shows [].', { line: 16, out: '[]' });
        return;
      }
      s.snap(`Start with any list.${skipNote(raw.skipped)}`, { line: 10, vars: { n } });
      if (n === 1) {
        s.snap('One item is already sorted, so both loops make no trips.', { line: 16, out: show(kit.vals()) });
        return;
      }
      let swaps = 0;
      const onSwap = () => { swaps += 1; s.set('count', { text: `swaps: ${swaps}` }); };
      for (let i = (n >> 1) - 1; i >= 0; i -= 1) sinkFrames(s, kit, i, { max: true, quiet: true });
      kit.calm();
      kit.mark(0, 'active', 1.1);
      s.set('cmp', { text: 'biggest is on top' });
      s.snap('First, make a max-heap. Each parent is at least as big as its children.', { line: 12, vars: { n } });

      for (let end = n - 1; end > 0; end -= 1) {
        const topV = kit.val[kit.at[0]];
        const lastV = kit.val[kit.at[end]];
        const round = n - 1 - end;
        const m = mix(`Spot ${end}`, ['Spot 0', `Spot ${Math.max(1, end >> 1)}`].filter(t => t !== `Spot ${end}`), round);
        kit.calm(end + 1);
        kit.mark(0, 'active', 1.1);
        kit.mark(end, 'warn', 1.1);
        s.set('cmp', { text: `end = ${end}` });
        s.snap(`The heap is spots 0 to ${end}. Its biggest item, ${topV}, is on top.`, {
          line: 14, vars: { end },
          ask: round < 2 || round === 3 ? { q: `Where should ${topV} go?`, options: m.options, answer: m.answer, why: `Spot ${end} is the last spot in the heap. In sorted order, the biggest of these belongs there.` } : null,
        });
        kit.swap(0, end);
        onSwap();
        kit.mark(end, 'ok');
        kit.offTree(end);
        s.set('b' + kit.at[end], { tone: 'ok', scale: 0.92 });
        kit.mark(0, 'active', 1.1);
        if (!s.has('sl')) s.text('sl', kit.lx(end), 274, 'sorted', { size: 13, weight: 700, tone: 'ok' });
        else s.set('sl', { x: (kit.lx(end) + kit.lx(n - 1)) / 2 });
        s.set('cmp', { text: `${topV} is done` });
        s.snap(`${topV} swaps with ${lastV}, and is now in its final spot. It leaves the tree.`, { line: 14, vars: { end } });
        sinkFrames(s, kit, 0, {
          max: true, end,
          lines: { pick: 4, stop: 7, swap: 8 },
          vars: v => ({ end, i: v.i }),
          asks: level => round < 2 && level === 0,
          onSwap,
        });
      }
      kit.mark(0, 'ok');
      kit.offTree(0);
      s.set('b' + kit.at[0], { tone: 'ok', scale: 0.92 });
      s.set('sl', { x: (kit.lx(0) + kit.lx(n - 1)) / 2 });
      s.set('cmp', { text: 'one item left' });
      s.snap('One item is left, so it is already in place.', { line: 13, vars: { end: 0 } });
      s.snap(`print shows the sorted list. It took ${many(swaps, 'swap')} after the first step, with no second list.`, { line: 16, vars: { swaps }, out: show(kit.vals()) });
    },
  });
})();
