/* Visuals for module 17. Names start with the module id. */
(function () {
  // Whole numbers the learner typed. Anything else is left out, and `cut` says so.
  const readNums = (text, cap, lo = -9, hi = 99) => {
    const parts = String(text == null ? '' : text).split(/[\s,]+/).filter(Boolean);
    const good = parts.filter(t => /^-?\d+$/.test(t)).map(Number).filter(n => n >= lo && n <= hi);
    const list = good.slice(0, cap);
    return { list, cut: list.length !== parts.length };
  };
  const show = a => '[' + a.join(', ') + ']';
  const times = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

  // A question for a frame. Repeated options are dropped, so typed values cannot break it.
  const choice = (q, right, wrongs, why, turn = 0) => {
    const seen = new Set([String(right)]);
    const options = [];
    wrongs.forEach(w => {
      const t = String(w);
      if (!seen.has(t)) { seen.add(t); options.push(t); }
    });
    const at = turn % (options.length + 1);
    options.splice(at, 0, String(right));
    return { q, options, answer: at, why };
  };

  // The same merge as the lesson, with a count of compares.
  const mergeCount = (a, b) => {
    const out = [];
    let i = 0, j = 0, c = 0;
    while (i < a.length && j < b.length) {
      c += 1;
      if (a[i] <= b[j]) out.push(a[i++]);
      else out.push(b[j++]);
    }
    return { out: out.concat(a.slice(i), b.slice(j)), c };
  };

  // ---------------------------------------------------------------- lesson 17.1
  Viz.register('m17-merge-piles', {
    title: 'Merge two sorted piles',
    size: [560, 290],
    code: py`
      def merge(left, right):
          out = []
          i = 0
          j = 0
          while i < len(left) and j < len(right):
              if left[i] <= right[j]:
                  out.append(left[i])
                  i = i + 1
              else:
                  out.append(right[j])
                  j = j + 1
          return out + left[i:] + right[j:]
    `,
    inputs: [
      { key: 'left', label: 'Left pile', type: 'text', value: '1 4 7', size: 10 },
      { key: 'right', label: 'Right pile', type: 'text', value: '2 3 9', size: 10 },
    ],
    tryInputs: [
      { left: '', right: '' }, { left: '5', right: '' }, { left: '', right: '5' },
      { left: '2 2', right: '2' }, { left: '9 1', right: 'cat' }, { left: '1 2 3 4 5 6', right: '7 8 9 10 11' },
      { left: '4', right: '4' }, { left: '-9 99', right: '1000 -50' },
    ],
    build(s, p) {
      const A = readNums(p.left, 4), B = readNums(p.right, 4);
      const left = A.list.slice().sort((x, y) => x - y);
      const right = B.list.slice().sort((x, y) => x - y);
      const unsorted = show(A.list) !== show(left) || show(B.list) !== show(right);
      const n = left.length + right.length;
      const LO = { x: 135, y: 72, cell: 44, gap: 6, index: false };
      const RO = { x: 425, y: 72, cell: 44, gap: 6, index: false };
      const OO = { x: 280, y: 212, cell: 44, gap: 6, index: false };
      const LX = k => s.slotX(k, left.length, LO);
      const RX = k => s.slotX(k, right.length, RO);
      const OX = k => s.slotX(k, n, OO);
      const out = [];
      let i = 0, j = 0, c = 0;
      const vars = () => ({ i, j, compares: c, out: show(out) });

      s.text('ll', 135, 26, 'left pile', { size: 15, weight: 700 });
      s.text('rl', 425, 26, 'right pile', { size: 15, weight: 700 });
      s.text('ol', 280, 168, 'new list', { size: 15, weight: 700 });
      for (let k = 0; k < n; k++) s.box('o' + k, OX(k), OO.y, '', { w: 44, h: 44, tone: 'muted' });
      s.row('L', left, LO);
      s.row('R', right, RO);
      s.text('cmp', 280, 72, '', { size: 16, mono: true, weight: 700 });
      s.text('ct', 280, 266, 'compares: 0', { size: 15 });

      if (!n) {
        s.snap('Both piles are empty, so the new list is empty too. Type some numbers above.', { line: 12, vars: vars() });
        return;
      }
      if (left.length) s.pointer('pi', LX(0), 98, 'i', { dir: 'up' });
      if (right.length) s.pointer('pj', RX(0), 98, 'j', { dir: 'up' });
      let first = 'Each pile is sorted, smallest first. So only the 2 front cards matter.';
      if (A.cut || B.cut) first = 'The picture keeps up to 4 whole numbers in each pile, from -9 to 99.';
      else if (unsorted) first = 'A merge needs sorted piles, so the picture sorted yours first.';
      s.snap(first, { line: 2, vars: vars() });

      const place = (id, v) => {
        s.set(id, { x: OX(out.length), y: OO.y, tone: 'ok' });
        out.push(v);
      };
      let turn = 0;
      while (i < left.length && j < right.length) {
        const a = left[i], b = right[j];
        s.tone(['L' + i, 'R' + j], 'active');
        s.set('cmp', { text: `${a} <= ${b}` });
        c += 1;
        s.set('ct', { text: 'compares: ' + c });
        const ask = turn % 2 === 0 ? choice(
          'Which card goes into the new list next?',
          a <= b ? `${a} from the left` : `${b} from the right`,
          [a <= b ? `${b} from the right` : `${a} from the left`],
          a === b ? 'They tie, and the left card goes first. So ties keep their order.' : 'The smaller front card goes next. Nothing behind it can be smaller.',
          turn,
        ) : null;
        s.snap(`Compare the front cards: ${a} and ${b}.`, { line: 6, vars: vars(), ask });
        if (a <= b) {
          place('L' + i, a);
          i += 1;
          if (i < left.length) s.set('pi', { x: LX(i) }); else s.del('pi');
          if (j < right.length) s.tone('R' + j, 'default');
          s.set('cmp', { text: '' });
          s.snap(a === b ? `They tie. The left ${a} goes first.` : `${a} is smaller, so it goes next.`, { line: 7, vars: vars() });
        } else {
          place('R' + j, b);
          j += 1;
          if (j < right.length) s.set('pj', { x: RX(j) }); else s.del('pj');
          s.tone('L' + i, 'default');
          s.set('cmp', { text: '' });
          s.snap(`${b} is smaller, so it goes next.`, { line: 10, vars: vars() });
        }
        turn += 1;
      }

      const rest = i < left.length ? left.length - i : right.length - j;
      const side = i < left.length ? 'left' : 'right';
      const other = side === 'left' ? 'right' : 'left';
      s.snap(`The ${other} pile is empty. The ${side} pile still has ${times(rest, 'card')}.`, {
        line: 12, vars: vars(),
        ask: choice(
          'How many more compares do the leftover cards need?',
          '0',
          ['1', String(rest + 1)],
          'The leftover cards are sorted already, and nothing else is left to compare with.',
          1,
        ),
      });
      while (i < left.length) { place('L' + i, left[i]); i += 1; }
      while (j < right.length) { place('R' + j, right[j]); j += 1; }
      s.del('pi', 'pj');
      s.snap(`The rest of the ${side} pile goes on the end, still in order.`, { line: 12, vars: vars() });
      s.snap(`Done. ${times(n, 'card')} placed with ${times(c, 'compare')}. Each card moved once.`, { line: 12, vars: vars() });
    },
  });

  Viz.register('m17-merge-tree', {
    title: 'Split down, then merge up',
    size: [560, 386],
    code: py`
      def merge_sort(items):
          if len(items) <= 1:
              return items
          mid = len(items) // 2
          left = merge_sort(items[:mid])
          right = merge_sort(items[mid:])
          return merge(left, right)
    `,
    inputs: [
      { key: 'items', label: 'Your list', type: 'text', value: '6 2 8 1', size: 14 },
    ],
    tryInputs: [
      { items: '' }, { items: '5' }, { items: '3 1' }, { items: '2 2 2 2' }, { items: '5 2 7 1 9 3' },
      { items: '1 2 3 4 5' }, { items: 'cat dog' }, { items: '9 8 7 6 5 4 3 2' }, { items: '4 4' },
    ],
    build(s, p) {
      const R = readNums(p.items, 6);
      const items = R.list, n = items.length;
      if (n < 2) {
        s.text('e', 280, 150, n ? 'one item' : 'empty list', { size: 16, weight: 700 });
        if (n) s.box('one', 280, 200, items[0], { w: 46, h: 46, tone: 'ok' });
        s.snap(n ? 'One item is already sorted. That is the base case, so nothing runs.' : 'An empty list is already sorted. That is the base case too.', { line: 3 });
        return;
      }
      const depth = m => (m <= 1 ? 0 : 1 + depth(Math.ceil(m / 2)));
      const D = depth(n);
      const rowH = Math.min(60, 306 / (2 * D + 1));
      const cell = Math.min(46, rowH - 8);
      const spread = Math.min(120, 500 / n);
      const leaf = i => 280 + (i - (n - 1) / 2) * spread;
      const mid = (lo, hi) => (leaf(lo) + leaf(hi - 1)) / 2;
      const splitTop = 6, splitH = 30 + (D + 1) * rowH + 4;
      const mergeTop = splitTop + splitH + 6, mergeH = 30 + D * rowH + 4;
      const yS = d => splitTop + 30 + rowH / 2 + d * rowH;
      const yM = d => mergeTop + 30 + rowH / 2 + (D - 1 - d) * rowH;

      s.area('zs', 14, splitTop, 532, splitH, 'SPLIT: no comparing here');
      s.area('zm', 14, mergeTop, 532, mergeH, 'MERGE: all the compares');
      s.text('now', 300, splitTop + 18, '< NOW', { size: 14, weight: 700, tone: 'accent', anchor: 'start' });
      s.text('ct', 536, mergeTop + 18, 'compares: 0', { size: 14, anchor: 'end' });

      let compares = 0, placed = 0, lit = [], seenBase = false, seenMerge = false, firstSplit = true;
      const vars = () => ({ compares, placed });
      const light = ids => { s.tone(lit, 'default'); s.tone(ids, 'active'); lit = ids; };
      const group = (pre, vals, x, y) => s.row(pre, vals, { x, y, cell, gap: 2, index: false });
      const phase = which => s.set('now', { y: (which === 'split' ? splitTop : mergeTop) + 18 });

      const first = group('t_', items, mid(0, n), yS(0));
      light(first);
      s.snap(R.cut ? 'The picture keeps up to 6 whole numbers, from -9 to 99.' : `Here is the list of ${n} items. It starts in the SPLIT part.`, { line: 1, vars: vars() });

      const rec = (vals, lo, d, ids) => {
        if (vals.length === 1) {
          if (!seenBase) {
            seenBase = true;
            light(ids);
            s.snap(`This piece holds only ${vals[0]}. It is 1 item long.`, {
              line: 2, vars: vars(),
              ask: choice('How much work does a piece of 1 item need?', 'None. It is already sorted.', ['One swap', 'One compare'], 'A list of 1 item is always sorted. That is the base case.', 1),
            });
          }
          return { vals, ids };
        }
        const cut = Math.floor(vals.length / 2);
        const l = vals.slice(0, cut), r = vals.slice(cut);
        phase('split');
        if (firstSplit) {
          firstSplit = false;
          s.snap('The list is longer than 1 item, so it gets split.', {
            line: 4, vars: vars(),
            ask: choice('What does a split do?', 'It cuts the list in half and compares nothing.', ['It puts the items in order.', 'It finds the smallest item.'], 'A split only finds the middle and cuts. The order stays as it was.'),
          });
        }
        const lids = group(`s${d}_${lo}_`, l, mid(lo, lo + cut), yS(d + 1));
        const rids = group(`s${d}_${lo + cut}_`, r, mid(lo + cut, lo + vals.length), yS(d + 1));
        light(lids.concat(rids));
        s.snap(`Split ${show(vals)} into ${show(l)} and ${show(r)}. Nothing gets compared.`, { line: 4, vars: vars() });

        const L = rec(l, lo, d + 1, lids);
        const Rr = rec(r, lo + cut, d + 1, rids);
        const m = mergeCount(L.vals, Rr.vals);
        phase('merge');
        const last = d === 0;
        if (!seenMerge || last) {
          light(L.ids.concat(Rr.ids));
          const ask = !seenMerge
            ? choice('What does this merge give?', show(m.out), [show(L.vals.concat(Rr.vals)), show(m.out.slice().reverse()), show(m.out.slice(0, 1))], 'A merge keeps every item and puts them in order. It takes the smaller front item each time.', 2)
            : choice('How many items does this last merge place?', n, [Math.floor(n / 2), 1], 'A merge places every item in both piles, so the last one places them all.', 1);
          seenMerge = true;
          s.snap(`Now merge ${show(L.vals)} and ${show(Rr.vals)}.`, { line: 7, vars: vars(), ask });
        }
        const ids2 = group(`m${d}_${lo}_`, m.out, mid(lo, lo + vals.length), yM(d));
        compares += m.c;
        placed += m.out.length;
        s.set('ct', { text: 'compares: ' + compares });
        light(ids2);
        s.snap(`Merge ${show(L.vals)} and ${show(Rr.vals)}. That takes ${times(m.c, 'compare')}.`, { line: 7, vars: vars() });
        return { vals: m.out, ids: ids2 };
      };
      const done = rec(items, 0, 0, first);
      s.tone(done.ids, 'ok');
      s.del('now');
      s.snap(`Sorted. The MERGE part did it all: ${times(compares, 'compare')}, and ${placed} items placed.`, { line: 7, vars: vars() });
    },
  });

  // ---------------------------------------------------------------- lessons 17.2 and 17.3
  Viz.register('m17-partition', {
    title: 'Partition around a pivot',
    size: [560, 292],
    code: py`
      def partition(items, pick):
          rest = items.copy()
          pivot = rest.pop(pick)
          left = []
          right = []
          for x in rest:
              if x < pivot:
                  left.append(x)
              else:
                  right.append(x)
          return left, pivot, right
    `,
    inputs: [
      { key: 'items', label: 'Your list', type: 'text', value: '4 7 2 6 1 5', size: 14 },
      { key: 'pick', label: 'Pivot spot', type: 'number', value: 0, min: 0, max: 5 },
    ],
    tryInputs: [
      { items: '', pick: 0 }, { items: '5', pick: 3 }, { items: '3 3 3', pick: 1 },
      { items: '1 2 3 4', pick: 0 }, { items: '4 3 2 1', pick: 3 }, { items: 'cat', pick: 0 }, { items: '2 8 2 8 2 8', pick: 5 },
    ],
    build(s, p) {
      const R = readNums(p.items, 6);
      const items = R.list, n = items.length;
      const spot = Math.max(0, Math.min(Math.max(0, n - 1), Math.round(Number(p.pick)) || 0));
      const o = { x: 280, y: 74, cell: 44, gap: 6 };
      const X = k => s.slotX(k, n, o);
      if (!n) {
        s.text('e', 280, 120, 'empty list', { size: 16, weight: 700 });
        s.snap('There is nothing here to partition. Quicksort stops on an empty list.', { line: 1 });
        return;
      }
      const left = [], right = [];
      const vars = (pv) => ({ pivot: pv == null ? '?' : pv, left: show(left), right: show(right) });
      s.row('v', items, o);
      s.snap(R.cut ? 'The picture keeps up to 6 whole numbers, from -9 to 99.' : 'Here is the list. Each box has its spot number below it.', { line: 1, vars: vars() });

      const pv = items[spot];
      s.area('al', 14, 134, 226, 80, 'smaller');
      s.area('ar', 320, 134, 226, 80, 'same or bigger');
      s.text('pl', 280, 142, 'pivot', { size: 14, weight: 700 });
      s.set('v' + spot, { x: 280, y: 180, tone: 'accent' });
      s.snap(`The pivot is ${pv}, from spot ${spot}. Any spot is allowed.`, { line: 3, vars: vars(pv) });

      const others = [];
      items.forEach((v, k) => { if (k !== spot) others.push({ v, k }); });
      if (!others.length) {
        s.tone('v' + spot, 'ok');
        s.snap('No other items here, so 0 compares. The pivot is in its final spot.', { line: 11, vars: vars(pv) });
        return;
      }
      const pileX = (base, count) => base + 32 + count * 42;
      s.pointer('px', X(others[0].k), 48, 'x', { dir: 'down' });
      others.forEach((it, t) => {
        s.set('px', { x: X(it.k) });
        s.tone('v' + it.k, 'active');
        const isLeft = it.v < pv;
        const ask = t % 2 === 0 ? choice(
          `Where does ${it.v} go?`,
          isLeft ? 'The smaller pile' : 'The same or bigger pile',
          [isLeft ? 'The same or bigger pile' : 'The smaller pile'],
          it.v === pv ? `${it.v} is not smaller than the pivot, so it goes right.` : `${it.v} < ${pv} is ${isLeft ? 'True' : 'False'}.`,
          t,
        ) : null;
        s.snap(`x is ${it.v}. Is ${it.v} smaller than ${pv}?`, { line: 7, vars: vars(pv), ask });
        if (isLeft) {
          s.set('v' + it.k, { x: pileX(14, left.length), y: 186, w: 40, h: 40, tone: 'default' });
          left.push(it.v);
          s.snap(`${it.v} is smaller, so it joins the left pile.`, { line: 8, vars: vars(pv) });
        } else {
          s.set('v' + it.k, { x: pileX(320, right.length), y: 186, w: 40, h: 40, tone: 'default' });
          right.push(it.v);
          s.snap(`${it.v} is not smaller, so it joins the right pile.`, { line: 10, vars: vars(pv) });
        }
      });
      s.del('px');
      for (let k = 0; k < n; k++) s.del('vi' + k);

      s.snap('Now put the piles back in one row, with the pivot between them.', {
        line: 11, vars: vars(pv),
        ask: choice(
          'Which spot will the pivot land on?',
          `Spot ${left.length}`,
          [`Spot ${Math.floor(n / 2)}`, 'Spot 0', `Spot ${n - 1}`],
          `${times(left.length, 'item')} go before it, so it lands on spot ${left.length}. That need not be the middle.`,
          2,
        ),
      });
      let at = 0;
      const rowY = 256;
      others.filter(it => it.v < pv).forEach(it => { s.set('v' + it.k, { x: X(at), y: rowY, w: 44, h: 44 }); at += 1; });
      s.set('v' + spot, { x: X(at), y: rowY, tone: 'ok' });
      at += 1;
      others.filter(it => !(it.v < pv)).forEach(it => { s.set('v' + it.k, { x: X(at), y: rowY, w: 44, h: 44 }); at += 1; });
      s.snap(`The pivot ${pv} is in its final spot. The piles may still be out of order.`, { line: 11, vars: vars(pv) });
    },
  });

  // Draws the rows for quicksort and quickselect. Spots stay in the same column on every row.
  const columns = (n, step = 62, centre = 201) => i => centre + (i - (n - 1) / 2) * step;

  Viz.register('m17-quick-levels', {
    title: 'Quicksort, round by round',
    size: [560, 340],
    code: py`
      def quick(items):
          if len(items) <= 1:
              return items
          spot = choose_spot(items)
          pivot = items[spot]
          rest = items[:spot] + items[spot + 1:]
          left = [x for x in rest if x < pivot]
          right = [x for x in rest if x >= pivot]
          return quick(left) + [pivot] + quick(right)
    `,
    inputs: [
      { key: 'items', label: 'Your list', type: 'text', value: '4 2 6 1 5 3', size: 14 },
      { key: 'how', label: 'Pivot is the', type: 'select', value: 'first', options: [
        { label: 'first item', value: 'first' }, { label: 'middle item', value: 'middle' }, { label: 'last item', value: 'last' },
      ] },
    ],
    tryInputs: [
      { items: '' }, { items: '5' }, { items: '1 2 3 4 5 6' }, { items: '6 5 4 3 2 1' }, { items: '2 2 2 2' },
      { items: '1 2 3 4 5 6', how: 'middle' }, { items: '1 2 3 4 5 6', how: 'last' }, { items: 'cat' }, { items: '3 1', how: 'last' },
    ],
    build(s, p) {
      const R = readNums(p.items, 6);
      const items = R.list, n = items.length;
      const how = p.how === 'middle' || p.how === 'last' ? p.how : 'first';
      const X = columns(n);
      const rowY = d => 28 + d * 42;
      const doneY = 286;
      let total = 0, round = 0;
      const perRow = {};
      const vars = () => ({ pivot_is: how, compares: total });

      if (!n) {
        s.text('e', 280, 120, 'empty list', { size: 16, weight: 700 });
        s.snap('An empty list is already sorted. Quicksort stops at once, with 0 compares.', { line: 3, vars: vars() });
        return;
      }
      for (let k = 0; k < n; k++) s.box('d' + k, X(k), doneY, '', { w: 38, h: 38, tone: 'muted' });
      s.text('dl', 201, 322, 'bottom row: final spots', { size: 13, tone: 'muted' });
      s.text('tot', 480, doneY, 'total: 0', { size: 15, weight: 700 });
      const draw = (vals, lo, d) => vals.map((v, i) => s.box(`r${d}_${lo}_${i}`, X(lo + i), rowY(d), v, { w: 38, h: 38 }));
      draw(items, 0, 0);
      s.snap(R.cut ? 'The picture keeps up to 6 whole numbers, from -9 to 99.' : 'Each row is one level of the calls. A circle marks each pivot.', { line: 1, vars: vars() });

      const rec = (vals, lo, d) => {
        if (!vals.length) return;
        if (vals.length === 1) {
          s.tone(`r${d}_${lo}_0`, 'ok');
          s.set('d' + lo, { text: vals[0], tone: 'ok' });
          s.snap(`One item left: ${vals[0]}. That is the base case, so it is in its final spot.`, { line: 3, vars: vars() });
          return;
        }
        round += 1;
        const spot = how === 'first' ? 0 : how === 'last' ? vals.length - 1 : Math.floor(vals.length / 2);
        const pivot = vals[spot];
        const rest = vals.filter((_, i) => i !== spot);
        const L = rest.filter(x => x < pivot), G = rest.filter(x => x >= pivot);
        const pid = `r${d}_${lo}_${spot}`;
        const px = X(lo + spot);
        s.del(pid);
        s.circle(pid, px, rowY(d), pivot, { r: 19, tone: 'accent' });
        let ask = null;
        if (round === 1) {
          ask = choice('How many compares will this round take?', rest.length, [rest.length + 1, 1], 'Every other item gets compared with the pivot once.', 1);
        } else if (round % 2 === 0) {
          ask = choice('How many items will go in the left pile?', L.length, [G.length, L.length + 1], `The left pile takes items smaller than ${pivot}. That makes ${L.length}.`, round);
        }
        s.snap(`This round sorts ${show(vals)}. The pivot is ${pivot}.`, { line: 5, vars: vars(), ask });

        total += rest.length;
        perRow[d] = (perRow[d] || 0) + rest.length;
        const lab = 'lv' + d;
        if (s.has(lab)) s.set(lab, { text: times(perRow[d], 'compare') });
        else s.text(lab, 480, rowY(d), times(perRow[d], 'compare'), { size: 14 });
        s.set('tot', { text: 'total: ' + total });
        const target = lo + L.length;
        s.set('d' + target, { text: pivot, tone: 'ok' });
        s.tone(pid, 'ok');
        draw(L, lo, d + 1);
        draw(G, target + 1, d + 1);
        const empty = !L.length || !G.length;
        s.snap(`Left gets ${L.length}, right gets ${G.length}.${empty ? ' One pile is empty.' : ''} The pivot ${pivot} lands on spot ${target}.`, { line: 8, vars: vars() });
        rec(L, lo, d + 1);
        rec(G, target + 1, d + 1);
      };
      rec(items, 0, 0);

      const worst = n * (n - 1) / 2;
      if (n >= 2) {
        s.snap('Every item is in its final spot. Add up the numbers on the right.', {
          line: 9, vars: { pivot_is: how, compares: '?' },
          ask: choice('How many compares did this list take in all?', total, [n * n, n, total + n], `The rows add up to ${total}.`, 1),
        });
      }
      if (n >= 3 && total === worst) {
        s.snap(`Every pivot left one pile empty. That is the worst case: ${total} compares for ${n} items.`, { line: 9, vars: vars() });
      } else if (n >= 3) {
        s.snap(`The piles were more even, so it took ${total} compares. The worst case for ${n} items is ${worst}.`, { line: 9, vars: vars() });
      } else {
        s.snap(`Sorted with ${times(total, 'compare')}.`, { line: 9, vars: vars() });
      }
    },
  });

  Viz.register('m17-quickselect', {
    title: 'Find one spot with no full sort',
    size: [560, 318],
    code: py`
      def select(items, k):
          pivot = items[0]
          rest = items[1:]
          left = [x for x in rest if x < pivot]
          right = [x for x in rest if x >= pivot]
          if k < len(left):
              return select(left, k)
          if k == len(left):
              return pivot
          return select(right, k - len(left) - 1)
    `,
    inputs: [
      { key: 'items', label: 'Your list', type: 'text', value: '4 8 2 6 1 9', size: 14 },
      { key: 'k', label: 'Spot k', type: 'number', value: 3, min: 0, max: 6 },
    ],
    tryInputs: [
      { items: '', k: 0 }, { items: '5', k: 0 }, { items: '5', k: 3 }, { items: '3 3 3', k: 1 },
      { items: '1 2 3 4 5 6', k: 5 }, { items: '6 5 4 3 2 1', k: 0 }, { items: 'cat', k: 1 }, { items: '2 7 2 7', k: 3 },
    ],
    build(s, p) {
      const R = readNums(p.items, 6);
      const items = R.list, n = items.length;
      const want = Math.max(0, Math.round(Number(p.k)) || 0);
      const X = columns(n);
      const rowY = d => 62 + d * 42;
      if (want >= n) {
        s.text('e', 280, 120, n ? `only ${times(n, 'spot')}` : 'empty list', { size: 16, weight: 700 });
        s.snap(n ? `This list has spots 0 to ${n - 1}, so spot ${want} does not exist.` : 'An empty list has no spots, so there is nothing to find.', { line: 1 });
        return;
      }
      let total = 0, k = want, round = 0;
      const vars = () => ({ k, compares: total });
      s.area('band', X(want) - 27, 34, 54, rowY(n - 1) - 34 + 26, '');
      for (let i = 0; i < n; i++) s.text('h' + i, X(i), 16, i, { size: 13, tone: 'muted', mono: true });
      s.text('want', 480, 16, `want spot ${want}`, { size: 14, weight: 700 });
      const draw = (vals, lo, d) => vals.map((v, i) => s.box(`r${d}_${i}`, X(lo + i), rowY(d), v, { w: 38, h: 38 }));
      let ids = draw(items, 0, 0);
      s.snap(R.cut ? 'The picture keeps up to 6 whole numbers, from -9 to 99.' : `Goal: the item at spot ${want} of the sorted list. The band marks that spot.`, { line: 1, vars: vars() });

      let vals = items, lo = 0, d = 0;
      for (;;) {
        round += 1;
        const pivot = vals[0];
        const rest = vals.slice(1);
        const L = rest.filter(x => x < pivot), G = rest.filter(x => x >= pivot);
        const pid = ids[0];
        s.del(pid);
        s.circle(pid, X(lo), rowY(d), pivot, { r: 19, tone: 'accent' });
        s.snap(rest.length ? `The pivot is ${pivot}. It gets compared with the ${rest.length === 1 ? 'other item' : times(rest.length, 'other item')}.` : `The pivot is ${pivot}. It is alone here, so there are 0 compares.`, { line: 2, vars: vars() });

        // Partition in place on this row: smaller items, then the pivot, then the others.
        total += rest.length;
        const landed = lo + L.length;
        let at = lo;
        const others = ids.slice(1);
        const leftIds = [], rightIds = [];
        rest.forEach((v, i) => { if (v < pivot) { s.set(others[i], { x: X(at) }); leftIds.push(others[i]); at += 1; } });
        s.set(pid, { x: X(at) });
        at += 1;
        rest.forEach((v, i) => { if (!(v < pivot)) { s.set(others[i], { x: X(at) }); rightIds.push(others[i]); at += 1; } });
        s.text('lv' + d, 480, rowY(d), times(rest.length, 'compare'), { size: 14 });
        s.snap(`The pivot lands on spot ${landed}. Smaller items sit to its left.`, { line: 5, vars: vars() });

        const go = want < landed ? 'left' : want === landed ? 'stop' : 'right';
        if (rest.length) {
          s.snap(`We want spot ${want}. The pivot is on spot ${landed}.`, {
            line: 6, vars: vars(),
            ask: choice(
              'What happens next?',
              go === 'left' ? 'Search the left pile' : go === 'right' ? 'Search the right pile' : 'Stop. The pivot is the answer.',
              ['Search the left pile', 'Search the right pile', 'Stop. The pivot is the answer.'],
              go === 'stop' ? 'The pivot is in its final spot, and that is the spot we want.' : `Spot ${want} is on the ${go} of spot ${landed}. The other pile can never hold it.`,
              round,
            ),
          });
        }
        if (go === 'stop') {
          s.tone(pid, 'ok');
          s.snap(`Found it. Spot ${want} holds ${pivot}, after ${times(total, 'compare')}. The other items may still be out of order.`, { line: 9, vars: vars() });
          return;
        }
        const keep = go === 'left' ? L : G;
        const drop = go === 'left' ? rightIds : leftIds;
        s.tone(drop.concat(pid), 'muted');
        if (go === 'right') k = k - L.length - 1;
        const nextLo = go === 'left' ? lo : landed + 1;
        const nextIds = keep.map((v, i) => s.box(`r${d + 1}_${i}`, X(nextLo + i), rowY(d + 1), v, { w: 38, h: 38 }));
        s.snap(go === 'left'
          ? `The pivot and the right pile drop out. k stays ${k}.`
          : `The pivot and the left pile drop out. In the right pile, k becomes ${k}.`,
          { line: go === 'left' ? 7 : 10, vars: vars() });
        vals = keep;
        lo = nextLo;
        ids = nextIds;
        d += 1;
      }
    },
  });

  // ---------------------------------------------------------------- lesson 17.4
  Viz.register('m17-yes-no', {
    title: 'Each compare is one yes or no',
    size: [560, 206],
    inputs: [
      { key: 'a', label: 'a', type: 'number', value: 2, min: 0, max: 9 },
      { key: 'b', label: 'b', type: 'number', value: 3, min: 0, max: 9 },
      { key: 'c', label: 'c', type: 'number', value: 1, min: 0, max: 9 },
    ],
    tryInputs: [{ a: 1, b: 2, c: 3 }, { a: 3, b: 2, c: 1 }, { a: 5, b: 5, c: 5 }, { a: 1, b: 1, c: 0 }, { a: 0, b: 9, c: 9 }],
    build(s, p) {
      const val = { a: Number(p.a) || 0, b: Number(p.b) || 0, c: Number(p.c) || 0 };
      const orders = ['abc', 'acb', 'bac', 'bca', 'cab', 'cba'];
      const xs = [100, 280, 460], ys = [66, 128];
      const name = o => o.split('').join(' ');
      const before = (o, x, y) => o.indexOf(x) < o.indexOf(y);
      const pairs = [['a', 'b'], ['b', 'c'], ['a', 'c']];
      const tie = val.a === val.b || val.b === val.c || val.a === val.c;
      let left = orders.slice(), asked = 0;
      const vars = () => ({ orders_left: left.length, questions: asked });

      s.text('cards', 280, 24, `a is ${val.a}, b is ${val.b}, c is ${val.c}`, { size: 16, weight: 700 });
      orders.forEach((o, i) => s.box('o' + o, xs[i % 3], ys[i < 3 ? 0 : 1], name(o), { w: 124, h: 48 }));
      s.text('qq', 280, 182, '', { size: 16, weight: 700 });
      s.snap(tie ? 'These are all 6 orders. When 2 cards tie, the earlier letter goes first.' : 'These are all 6 orders of 3 cards. Only one is the sorted order.', { vars: vars() });

      while (left.length > 1) {
        let best = null, gap = 99;
        pairs.forEach(([x, y]) => {
          const yes = left.filter(o => before(o, x, y)).length;
          if (yes === 0 || yes === left.length) return;
          const g = Math.abs(2 * yes - left.length);
          if (g < gap) { gap = g; best = [x, y]; }
        });
        const [x, y] = best;
        const yes = val[x] <= val[y];
        asked += 1;
        s.set('qq', { text: `Does ${x} go before ${y}?` });
        s.snap(`Question ${asked}: compare ${x} and ${y}. It has only 2 answers.`, {
          vars: vars(),
          ask: choice(
            `${x} is ${val[x]} and ${y} is ${val[y]}. Does ${x} go before ${y}?`,
            yes ? 'Yes' : 'No', [yes ? 'No' : 'Yes'],
            val[x] === val[y] ? 'They tie, so the earlier letter goes first.' : `${val[x]} is ${val[x] < val[y] ? 'smaller' : 'bigger'} than ${val[y]}.`,
          ),
        });
        const out = left.filter(o => before(o, x, y) !== yes);
        left = left.filter(o => before(o, x, y) === yes);
        out.forEach(o => {
          s.tone('o' + o, 'muted');
          s.set('o' + o, { opacity: 0.45 });
          const b = s.get('o' + o);
          s.text('x' + o, b.x + 46, b.y, 'X', { size: 18, weight: 700, tone: 'bad' });
        });
        s.set('qq', { text: `${yes ? 'Yes' : 'No'}, so ${times(out.length, 'order')} ${out.length === 1 ? 'drops' : 'drop'} out.` });
        s.snap(`The answer is ${yes ? 'yes' : 'no'}. That rules out ${out.length} of the ${out.length + left.length} orders left.`, { vars: vars() });
      }
      const real = left[0];
      s.tone('o' + real, 'ok');
      const sortedVals = real.split('').map(c => val[c]).join(' ');
      s.set('qq', { text: `Sorted: ${sortedVals}` });
      s.snap(`Only ${name(real)} is left, so the values in order are ${sortedVals}. That took ${times(asked, 'question')}.`, {
        vars: vars(),
        ask: choice('How many orders can 2 yes or no answers tell apart?', '4', ['2', '6'], '2 answers give yes-yes, yes-no, no-yes or no-no. So 6 orders can need a third answer.', 1),
      });
      s.snap(asked === 3 ? 'This set of cards needed all 3 questions. No plan can always use 2.' : 'This time 2 was enough. Now try a as 2, b as 3 and c as 1.', { vars: vars() });
    },
  });

  Viz.register('m17-counting', {
    title: 'Count each value. Compare nothing.',
    size: [560, 318],
    code: py`
      def counting_sort(items):
          if len(items) == 0:
              return []
          counts = [0] * (max(items) + 1)
          for x in items:
              counts[x] = counts[x] + 1
          out = []
          for value in range(len(counts)):
              out.extend([value] * counts[value])
          return out
    `,
    inputs: [
      { key: 'items', label: 'Your list', type: 'text', value: '2 0 3 2 1 2', size: 14 },
    ],
    tryInputs: [
      { items: '' }, { items: '7' }, { items: '2 2 2' }, { items: '0 0' }, { items: '9 0' },
      { items: '-1 5 12 cat 3.5' }, { items: 'cat' }, { items: '9 8 7 6 5 4' },
    ],
    build(s, p) {
      const R = readNums(p.items, 6, 0, 9);
      const items = R.list, n = items.length;
      const io = { x: 280, y: 66, cell: 44, gap: 6, index: false };
      const IX = k => s.slotX(k, n, io);
      let steps = 0;
      const vars = obj => Object.assign({ steps, compares: 0 }, obj);
      s.text('ct', 280, 300, 'compares: 0', { size: 15, weight: 700 });
      if (!n) {
        s.text('e', 280, 120, 'empty list', { size: 16, weight: 700 });
        s.snap(R.cut ? 'The picture uses whole numbers from 0 to 9, and it found none.' : 'An empty list needs no work. The check on line 2 stops max from failing.', { line: 3, vars: vars() });
        return;
      }
      const top = Math.max(...items);
      const co = { x: 280, y: 156, cell: 44, gap: 6 };
      const CX = k => s.slotX(k, top + 1, co);
      const oo = { x: 280, y: 256, cell: 44, gap: 6, index: false };
      const OX = k => s.slotX(k, n, oo);
      const counts = new Array(top + 1).fill(0);

      s.row('v', items, io);
      s.text('il', 280, 24, 'items', { size: 15, weight: 700 });
      s.snap(R.cut ? 'The picture keeps up to 6 whole numbers from 0 to 9.' : `The biggest value is ${top}.`, { line: 4, vars: vars() });

      s.text('cl', 280, 116, 'counts: the small number is the value', { size: 14, weight: 700 });
      s.row('c', counts, co);
      s.snap(`So counts gets ${top + 1} spots, from 0 to ${top}. Each one starts at 0.`, { line: 4, vars: vars({ counts: show(counts) }) });

      s.del('il');
      s.pointer('px', IX(0), 40, 'x', { dir: 'down' });
      items.forEach((x, k) => {
        s.set('px', { x: IX(k) });
        s.tone('v' + k, 'active');
        if (k > 0) s.tone('c' + items[k - 1], 'default');
        if (k % 2 === 0) {
          s.snap(`x is ${x}. Python needs no compare to find its spot.`, {
            line: 6, vars: vars({ counts: show(counts) }),
            ask: choice(`Which spot in counts goes up for ${x}?`, `Spot ${x}`, [`Spot ${k}`, `Spot ${x + 1}`, `Spot ${x === 0 ? 1 : x - 1}`], 'The value itself is the index. Python jumps straight to that spot.', k),
          });
        }
        counts[x] += 1;
        steps += 1;
        s.set('c' + x, { text: counts[x], tone: 'active' });
        s.tone('v' + k, 'muted');
        s.snap(`Spot ${x} goes up to ${counts[x]}. Still 0 compares.`, { line: 6, vars: vars({ counts: show(counts) }) });
      });
      s.del('px');
      s.clearTones();

      s.text('ol', 280, 222, 'new list', { size: 14, weight: 700 });
      const out = [];
      let firstWrite = true, firstZero = true;
      const copies = (howMany, value) => `${howMany} ${howMany === 1 ? 'copy' : 'copies'} of ${value}`;
      s.snap('Now walk along counts, one spot at a time.', { line: 8, vars: vars({ out: show(out) }) });
      counts.forEach((c, v) => {
        s.tone('c' + v, 'active');
        if (c && firstWrite) {
          firstWrite = false;
          s.snap(`Spot ${v} holds ${c}.`, {
            line: 9, vars: vars({ out: show(out) }),
            ask: choice(`What goes in the new list for spot ${v}?`, copies(c, v), [copies(v, c), copies(c + 1, v)], 'The spot number is the value. The number inside says how many copies to write.', 1),
          });
        }
        if (!c && firstZero) {
          firstZero = false;
          s.snap(`Spot ${v} holds 0.`, {
            line: 9, vars: vars({ out: show(out) }),
            ask: choice(`What goes in the new list for spot ${v}?`, 'Nothing', [copies(1, v), copies(v + 1, 0)], `The list has no ${v}, so nothing gets written.`, 2),
          });
        }
        else if (!c && v % 4 === 3) {
          s.snap(`Spot ${v} holds 0 as well.`, {
            line: 9, vars: vars({ out: show(out) }),
            ask: choice('How many more spots must the walk visit after this one?', top - v, [n, top - v + 1, 0], 'The walk visits every spot up to the biggest value, even the empty ones.', v),
          });
        }
        for (let t = 0; t < c; t++) {
          s.box('o' + out.length, OX(out.length), oo.y, v, { w: 44, h: 44, tone: 'ok' });
          out.push(v);
        }
        steps += 1;
        s.snap(c ? `Spot ${v} holds ${c}, so write ${v} that many times.` : `Spot ${v} holds 0, so write nothing. The walk still costs a step.`, { line: 9, vars: vars({ out: show(out) }) });
        s.tone('c' + v, 'default');
      });
      s.snap(`Sorted with 0 compares. It took ${times(n, 'step')} to count and ${times(top + 1, 'step')} to walk.`, { line: 10, vars: vars({ out: show(out) }) });
    },
  });

  // ---------------------------------------------------------------- lesson 17.5 (bonus)
  Viz.register('m17-timsort-runs', {
    title: 'Find the runs, then merge them',
    size: [560, 150],
    note: 'This is a small picture of the big idea. The real Timsort sorts short pieces with insertion sort, and it picks its merges with care.',
    code: py`
      runs = find_runs(items)
      while len(runs) > 1:
          first = runs.pop(0)
          second = runs.pop(0)
          runs.insert(0, merge(first, second))
      print(runs[0])
    `,
    inputs: [
      { key: 'items', label: 'Your list', type: 'text', value: '2 4 7 9 8 5 1 6', size: 18 },
    ],
    tryInputs: [
      { items: '' }, { items: '5' }, { items: '1 2 3 4 5 6 7 8' }, { items: '8 7 6 5 4 3 2 1' }, { items: '3 3 3 3' },
      { items: '5 5 3 3 1' }, { items: '2 1 4 3 6 5 8 7' }, { items: 'cat' }, { items: '1 2 1 2' }, { items: '9 8' },
    ],
    build(s, p) {
      const R = readNums(p.items, 8);
      const items = R.list, n = items.length;
      if (!n) {
        s.text('e', 280, 90, 'empty list', { size: 16, weight: 700 });
        s.snap('An empty list has no runs, and it is already sorted.', { line: 1, out: '[]' });
        return;
      }
      const cell = 44, pad = 4, y = 92;
      // Each group is a list of {id, v}. The picture lays the groups out from left to right.
      const boxes = items.map((v, i) => ({ id: 'b' + i, v }));
      boxes.forEach((b, i) => s.box(b.id, 280 + (i - (n - 1) / 2) * (cell + pad), y, b.v, { w: cell, h: cell }));
      let compares = 0;
      const groups = [];
      const vars = () => ({ runs: groups.length, compares });
      const layout = pending => {
        const all = groups.concat(pending.length ? [pending] : []);
        const gap = 20;
        const width = n * (cell + pad) - pad + (all.length - 1) * gap;
        let x = 280 - width / 2;
        all.forEach((g, gi) => {
          const start = x;
          g.forEach(b => { s.set(b.id, { x: x + cell / 2, y }); x += cell + pad; });
          const end = x - pad;
          x += gap - pad;
          const isRun = gi < groups.length;
          const aid = 'a' + g.anchor;
          if (isRun) {
            const label = 'run ' + (gi + 1);
            if (s.has(aid)) s.set(aid, { x: start - 8, w: end - start + 16, text: label });
            else s.area(aid, start - 8, y - 56, end - start + 16, 88, label);
          }
        });
      };
      s.snap(R.cut ? 'The picture keeps up to 8 whole numbers, from -9 to 99.' : 'Look along the list for stretches that are already in order.', { line: 1, vars: vars() });

      let i = 0, firstRun = true;
      while (i < n) {
        let j = i + 1, falling = false;
        if (j < n) {
          compares += 1;
          falling = items[j] < items[j - 1];
          j += 1;
          while (j < n) {
            compares += 1;
            const down = items[j] < items[j - 1];
            if (down !== falling) break;
            j += 1;
          }
        }
        const run = boxes.slice(i, j);
        s.tone(run[0].id, 'active');
        const vals = run.map(b => b.v);
        const nextVal = j < n ? items[j] : null;
        if (firstRun) {
          firstRun = false;
          s.snap(`Start at ${items[i]} and walk along while the order holds.`, {
            line: 1, vars: vars(),
            ask: choice(
              'How many items are in this first stretch?',
              vals.length,
              [vals.length + 1, 1, n],
              nextVal != null ? `${nextVal} breaks the order, so the stretch stops before it.` : 'The order holds all the way to the end of the list.',
            ),
          });
        }
        else if (groups.length % 2 === 1 && vals.length > 1) {
          s.snap(`The next stretch starts at ${vals[0]}.`, {
            line: 1, vars: vars(),
            ask: choice('Does this stretch rise or fall?', falling ? 'It falls' : 'It rises', [falling ? 'It rises' : 'It falls'], `Look at the first 2 values: ${vals[0]} and ${vals[1]}.`, groups.length),
          });
        }
        s.tone(run.map(b => b.id), 'active');
        if (falling) {
          s.snap(`${show(vals)} falls all the way. Python can flip it in one go.`, { line: 1, vars: vars() });
          run.reverse();
          const fl = run.map(b => b.id);
          const places = fl.map(id => s.get(id).x).sort((a, b) => a - b);
          fl.forEach((id, k) => s.set(id, { x: places[k] }));
          s.pulse(fl);
          run.anchor = i;
          groups.push(run);
          layout(boxes.slice(j));
          s.snap(`Now it rises: ${show(run.map(b => b.v))}. Flipping costs no compares.`, { line: 1, vars: vars() });
        } else {
          run.anchor = i;
          groups.push(run);
          layout(boxes.slice(j));
          s.snap(`${show(vals)} is a run. It is already in order.`, { line: 1, vars: vars() });
        }
        s.tone(run.map(b => b.id), 'default');
        i = j;
      }

      if (groups.length === 1) {
        s.tone(groups[0].map(b => b.id), 'ok');
        s.snap(`One run covers the whole list, so no merge is needed. That took ${times(compares, 'compare')}.`, { line: 2, vars: vars(), out: show(groups[0].map(b => b.v)) });
        return;
      }
      s.snap(`The list has ${times(groups.length, 'run')}. Finding them took ${times(compares, 'compare')}.`, {
        line: 2, vars: vars(),
        ask: choice('How many merges will it take to leave 1 run?', groups.length - 1, [groups.length, groups.length + 1], 'Each merge turns 2 runs into 1. So the count of runs drops by 1 each time.', groups.length),
      });

      let turn = 0;
      while (groups.length > 1) {
        const a = groups[0], b = groups[1];
        const av = a.map(c => c.v), bv = b.map(c => c.v);
        const m = mergeCount(av, bv);
        s.tone(a.concat(b).map(c => c.id), 'active');
        const low = m.out[0], high = m.out[m.out.length - 1];
        s.snap(`Merge the first 2 runs: ${show(av)} and ${show(bv)}.`, {
          line: 5, vars: vars(),
          ask: turn === 0 ? choice('Which value comes first in the merged run?', low, [high, Math.max(av[0], bv[0])], 'The front of each run is its smallest value. The smaller of the 2 fronts goes first.', 1) : null,
        });
        // A stable merge: on a tie the box from the first run goes first.
        let x = 0, y2 = 0;
        const merged = [];
        while (x < a.length && y2 < b.length) merged.push(a[x].v <= b[y2].v ? a[x++] : b[y2++]);
        merged.push(...a.slice(x), ...b.slice(y2));
        s.del('a' + b.anchor);
        merged.anchor = a.anchor;
        groups.splice(0, 2, merged);
        compares += m.c;
        layout([]);
        s.snap(`The merge takes ${times(m.c, 'compare')}. Now ${times(groups.length, 'run')} left.`, { line: 5, vars: vars() });
        s.tone(merged.map(c => c.id), 'default');
        turn += 1;
      }
      s.tone(groups[0].map(b => b.id), 'ok');
      s.snap(`Sorted with ${times(compares, 'compare')} in all.`, { line: 6, vars: vars(), out: show(groups[0].map(b => b.v)) });
    },
  });
})();
