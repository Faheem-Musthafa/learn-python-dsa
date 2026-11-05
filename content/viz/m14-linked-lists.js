/* Visuals for module 14. Names start with the module id. */
(function () {
  /* Reads typed numbers. Never throws: any text gives a short, safe list. */
  function readVals(text, max) {
    return String(text == null ? '' : text).split(',').map(v => v.trim().slice(0, 3)).filter(Boolean).slice(0, max);
  }
  function readOne(text, fallback) {
    return String(text == null ? '' : text).trim().slice(0, 3) || fallback;
  }
  function readInt(v, fallback) {
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? n : fallback;
  }
  const chainText = vals => '[' + vals.join(', ') + ']';

  /* The right answer should not always sit first, so each question turns its options around. */
  function mixAsk(a) {
    if (a.options[0] === 'Yes') return a;
    const turn = a.q.length % a.options.length;
    const options = a.options.map((_, i) => a.options[(i + a.options.length - turn) % a.options.length]);
    return Object.assign({}, a, { options, answer: (a.answer + turn) % a.options.length });
  }
  function mixed(def) {
    const build = def.build;
    def.build = (s, p) => {
      const snap = s.snap.bind(s);
      s.snap = (say, o = {}) => snap(say, o.ask ? Object.assign({}, o, { ask: mixAsk(o.ask) }) : o);
      build(s, p);
    };
    return def;
  }

  /* Middles of n node slots, spread across the stage. */
  function slots(n, maxGap = 130, cx = 280) {
    const gap = n > 1 ? Math.min(maxGap, 460 / (n - 1)) : 0;
    const left = cx - (gap * (n - 1)) / 2;
    return Array.from({ length: n }, (_, i) => left + i * gap);
  }

  /* A node as in lesson 7.3: a value box joined to a small next box. */
  function drawNode(s, id, x, y, value) {
    s.box(id + 'v', x - 22, y, value, { w: 40, h: 44 });
    s.box(id + 'n', x + 20, y, '', { w: 44, h: 44 });
    s.text(id + 'x', x + 20, y, 'None', { size: 12, mono: true, weight: 700 });
  }
  function moveNode(s, id, x, y) {
    s.set(id + 'v', { x: x - 22, y });
    s.set(id + 'n', { x: x + 20, y });
    s.set(id + 'x', { x: x + 20, y });
  }
  /* Turns a node around, so its next box sits on the left. */
  function flipNode(s, id, x, y) {
    s.set(id + 'v', { x: x + 22, y });
    s.set(id + 'n', { x: x - 20, y });
    s.set(id + 'x', { x: x - 20, y });
  }
  function link(s, from, to, opts) {
    s.set(from + 'x', { text: '•', size: 22 });
    s.edge(from + 'e', from + 'n', to + 'v', opts);
  }
  function unlink(s, from) {
    s.set(from + 'x', { text: 'None', size: 12 });
    s.del(from + 'e');
  }
  function toneNode(s, id, tone) {
    s.tone([id + 'v', id + 'n'], tone);
  }

  // ------------------------------------------------------------- lesson 14.1
  Viz.register('m14-front-race', mixed({
    title: 'Add at the front: list and chain',
    size: [560, 300],
    inputs: [
      { key: 'values', label: 'Numbers, up to 4', type: 'text', value: '3,8,2,6', size: 12 },
      { key: 'x', label: 'New number', type: 'text', value: '9', size: 4 },
    ],
    tryInputs: [{ values: '' }, { values: '7' }, { values: '4,4,4' }, { values: '1,2,3,4,5,6,7', x: '' }, { values: ' , a ,, b', x: 'long' }],
    build(s, p) {
      const vals = readVals(p.values, 4);
      const x = readOne(p.x, '9');
      const n = vals.length;
      const ro = { cell: 52, gap: 6, x: 330 };
      const LX = i => s.slotX(i, n + 1, ro);
      const y1 = 66, y2 = 216;
      const X = slots(Math.max(n + 1, 2), 115);
      const ncount = () => ({ list_moves: moves, arrow_changes: arrows });
      let moves = 0, arrows = 0;

      s.text('lname', 66, y1 - 16, 'list', { size: 16, mono: true, weight: 700 });
      s.text('lcount', 66, y1 + 14, 'moves: 0', { size: 14 });
      for (let i = 0; i <= n; i++) s.text('li' + i, LX(i), y1 + 42, i, { size: 13, tone: 'muted', mono: true });
      vals.forEach((v, i) => s.box('L' + i, LX(i), y1, v, { w: 52, h: 52 }));

      s.text('cname', 380, y2 - 54, 'chain   arrows changed: 0', { size: 14 });
      vals.forEach((v, i) => drawNode(s, 'n' + i, X[i + 1], y2, v));
      vals.slice(0, -1).forEach((_, i) => link(s, 'n' + i, 'n' + (i + 1)));
      if (n) s.pointer('head', X[1], y2 + 24, 'head', { dir: 'up' });
      else s.text('hnone', X[1], y2, 'head is None', { size: 14, tone: 'muted' });

      s.snap(n ? `Both hold the same numbers. First, add ${x} at the front of the list.` : 'Both are empty. Add one number to each.', {
        vars: ncount(),
        ask: n ? {
          q: 'Spot 0 is taken. What must happen to make room?',
          options: ['Every old item moves one spot right', 'Only the first item moves', `Nothing moves. The ${x} squeezes in`],
          answer: 0,
          why: 'A list keeps its items side by side, so each item needs a new spot.',
        } : null,
      });

      for (let i = n - 1; i >= 0; i--) {
        if (i < n - 1) s.tone('L' + (i + 1), 'default');
        s.set('L' + i, { x: LX(i + 1), tone: 'warn' });
        moves += 1;
        s.set('lcount', { text: `moves: ${moves}` });
        s.snap(`${vals[i]} moves from spot ${i} to spot ${i + 1}. That is move ${moves}.`, { vars: ncount() });
      }
      if (n) s.tone('L0', 'default');
      s.box('Lnew', LX(0), y1, x, { w: 52, h: 52, tone: 'active' });
      s.snap(`Spot 0 is free now, so ${x} goes in. The list took ${moves} moves.`, {
        vars: ncount(),
        ask: {
          q: 'Now the chain. How many arrows must change to add a node at the front?',
          options: ['2', 'One for each node', 'None'],
          answer: 0,
          why: 'The new node gets an arrow, and head moves to it. No old node changes.',
        },
      });

      s.tone('Lnew', 'default');
      if (!n) s.del('hnone');
      drawNode(s, 'new', X[0], y2, x);
      toneNode(s, 'new', 'active');
      s.pointer('newp', X[0], y2 - 24, 'new', { dir: 'down', tone: 'active' });
      s.snap(`A new node holds ${x}. No other node has changed.`, { vars: ncount() });

      if (n) link(s, 'new', 'n0', { tone: 'active' });
      arrows += 1;
      s.set('cname', { text: `chain   arrows changed: ${arrows}` });
      s.snap(n ? 'new.next = head. The new node now points at the old first node.' : 'new.next = head. head is None, so new.next stays None.', { vars: ncount() });

      if (n) { s.tone('newe', 'default'); s.set('head', { x: X[0] }); }
      else s.pointer('head', X[0], y2 + 24, 'head', { dir: 'up' });
      toneNode(s, 'new', 'default');
      s.del('newp');
      arrows += 1;
      s.set('cname', { text: `chain   arrows changed: ${arrows}` });
      s.snap('head = new. Now head points at the new node. The chain is done.', { vars: ncount() });

      s.snap(n ? `List: ${moves} moves. Chain: ${arrows} arrow changes. Try 1 number, then 4.` : 'With nothing to move, the list did no moves. Now try 4 numbers.', { vars: ncount() });
    },
  }));

  Viz.register('m14-add-front', mixed({
    title: 'A LinkedList grows at the front',
    size: [560, 170],
    code: py`
      class LinkedList:
          def __init__(self):
              self.head = None

          def add_front(self, value):
              new = Node(value)
              new.next = self.head
              self.head = new

      ll = LinkedList()
      for v in values:
          ll.add_front(v)
      print(ll.to_list())
    `,
    inputs: [
      { key: 'values', label: 'Numbers to add, up to 4', type: 'text', value: '2,8,3', size: 12 },
    ],
    tryInputs: [{ values: '' }, { values: '7' }, { values: '5,5' }, { values: '1,2,3,4,5,6' }, { values: ',,,' }],
    build(s, p) {
      const vals = readVals(p.values, 4);
      const n = vals.length;
      const y = 84;
      const X = slots(Math.max(n, 2), 130);
      const at = k => X[n - 1 - k]; // The first number added ends up last.
      const final = vals.slice().reverse();
      const shown = k => chainText(vals.slice(0, k).reverse());

      s.text('hnone', 280, y, 'head is None', { size: 15, tone: 'muted' });
      s.snap('ll = LinkedList() runs. There are no nodes yet, so head is None.', { line: 10, vars: { 'self.head': 'None' } });
      if (!n) {
        s.snap('You typed no numbers, so the loop never runs.', { line: 11, vars: { 'self.head': 'None' } });
        s.snap('print shows an empty list. Type some numbers above.', { line: 13, vars: { 'self.head': 'None' }, out: '[]' });
        return;
      }

      vals.forEach((v, k) => {
        if (k === 0) s.del('hnone');
        drawNode(s, 'n' + k, at(k), y, v);
        toneNode(s, 'n' + k, 'active');
        s.pointer('newp', at(k), y - 24, 'new', { dir: 'down', tone: 'active' });
        const here = { v, 'self.head': k ? `the ${vals[k - 1]} node` : 'None' };
        s.snap(`Node(${v}) makes a new node. Its next box holds None.`, {
          line: 6, vars: here,
          ask: k === 0 ? {
            q: 'new.next = self.head runs next. What will new.next be?',
            options: ['None, because head is None', 'The new node itself', 'The number 0'],
            answer: 0,
            why: 'The chain is empty, so self.head is None. This new node will be the last node too.',
          } : k === 1 ? {
            q: 'new.next = self.head runs next. Where will the new arrow point?',
            options: ['At the old first node', 'At the last node', 'At None'],
            answer: 0,
            why: 'self.head names the old first node, so the new node points at it.',
          } : null,
        });

        if (k > 0) link(s, 'n' + k, 'n' + (k - 1), { tone: 'active' });
        s.snap(k ? 'new.next = self.head. The new node points at the old first node.' : 'new.next = self.head. It gets None, so its next box stays None.', { line: 7, vars: here });

        if (k > 0) { s.tone('n' + k + 'e', 'default'); s.set('head', { x: at(k) }); }
        else s.pointer('head', at(k), y + 24, 'head', { dir: 'up' });
        toneNode(s, 'n' + k, 'default');
        s.del('newp');
        s.snap(`self.head = new. The chain now reads ${shown(k + 1)}.`, { line: 8, vars: { v, 'self.head': `the ${v} node` } });
      });

      s.snap('print walks from the head. The last number added comes first.', { line: 13, vars: { 'self.head': `the ${vals[n - 1]} node` }, out: chainText(final) });
    },
  }));

  Viz.register('m14-read-race', mixed({
    title: 'Read one spot: list and chain',
    size: [560, 270],
    code: py`
      print(items[k])

      node = head
      for i in range(k):
          node = node.next
      print(node.value)
    `,
    inputs: [
      { key: 'values', label: 'Numbers, up to 5', type: 'text', value: '3,8,2,6,5', size: 12 },
      { key: 'k', label: 'Spot k', type: 'number', value: 3, min: 0, max: 6 },
    ],
    tryInputs: [{ values: '', k: 0 }, { values: '7', k: 0 }, { values: '7', k: 1 }, { values: '4,4,4', k: 2 }, { values: '1,2', k: 5 }, { values: '1,2,3,4,5', k: 4 }, { values: '1,2,3', k: 3 }],
    build(s, p) {
      const vals = readVals(p.values, 5);
      const n = vals.length;
      const k = Math.max(0, Math.min(6, readInt(p.k, 0)));
      const has = k < n;
      const ro = { cell: 52, gap: 6, x: 310 };
      const LX = i => s.slotX(i, n, ro);
      const y1 = 66, y2 = 196;
      const X = slots(Math.max(n, 2), 115);
      const vars = { k };

      s.text('lname', 40, y1, 'items', { size: 15, mono: true, weight: 700 });
      if (n) s.row('L', vals, Object.assign({ y: y1 }, ro));
      else s.text('lnone', 310, y1, 'The list is empty', { size: 15, tone: 'muted' });
      s.text('cname', 40, y2 - 72, 'chain', { size: 15, mono: true, weight: 700 });
      vals.forEach((v, i) => drawNode(s, 'n' + i, X[i], y2, v));
      vals.slice(0, -1).forEach((_, i) => link(s, 'n' + i, 'n' + (i + 1)));
      if (n) s.pointer('head', X[0], y2 + 24, 'head', { dir: 'up' });
      else s.text('hnone', 280, y2, 'head is None', { size: 15, tone: 'muted' });

      s.snap(n ? `Both hold the same numbers. You want the value at spot ${k}.` : `Both are empty. You still ask for spot ${k}.`, {
        line: 1, vars,
        ask: !n ? null : {
          q: `How many steps does items[${k}] take?`,
          options: ['One jump', 'One step per item before it', 'One step per item in the list'],
          answer: 0,
          why: 'Spots sit side by side, so Python works out where the spot is and goes straight there.',
        },
      });

      let out = has ? vals[k] : 'IndexError';
      if (has) {
        s.tone('L' + k, 'ok');
        s.snap(`items[${k}] jumps straight there, and finds ${vals[k]}. That took one step.`, { line: 1, vars, out });
        s.tone('L' + k, 'default');
      } else {
        s.snap(`The list has no spot ${k}. Python would stop with an IndexError.`, { line: 1, vars, out });
      }

      if (!n) {
        s.snap('The chain is empty too. head is None, so node starts as None.', { line: 3, vars: { k, node: 'None' }, out: 'IndexError' });
        s.snap('None has no .value or .next. So the chain stops Python too: an AttributeError.', { line: 6, vars: { k, node: 'None' }, out: 'IndexError\nAttributeError' });
        return;
      }

      const rightHops = has ? k : n;
      const a = rightHops, opts = [a, a + 1, a === 1 ? 3 : 1].map(String);
      s.pointer('node', X[0], y2 - 24, 'node', { dir: 'down', tone: 'active' });
      s.snap('Now the chain. The walk starts at the head.', {
        line: 3, vars: { k, node: `the ${vals[0]} node`, hops: 0 }, out,
        ask: has ? {
          q: `How many arrows must you follow to reach spot ${k}?`,
          options: opts,
          answer: 0,
          why: `A chain has no numbers, so you follow one arrow per spot. Spot ${k} takes ${k}.`,
        } : {
          q: `The chain has ${n} nodes. Can the walk reach spot ${k}?`,
          options: ['No. It runs off the end at None', 'Yes. It wraps around to the head', 'Yes. Spot numbers can go past the end'],
          answer: 0,
          why: 'The last next box holds None. There is no node after that.',
        },
      });

      let hops = 0;
      for (let i = 0; i < Math.min(k, n - 1); i++) {
        hops += 1;
        s.set('node', { x: X[i + 1] });
        s.snap(`Follow the arrow to ${vals[i + 1]}. That is ${hops} ${hops === 1 ? 'hop' : 'hops'}.`, { line: 5, vars: { k, node: `the ${vals[i + 1]} node`, hops }, out });
      }
      if (has) {
        toneNode(s, 'n' + k, 'ok');
        out += '\n' + vals[k];
        s.snap(`node reaches spot ${k}, and shows ${vals[k]}. List: 1 step. Chain: ${hops} hops.`, { line: 6, vars: { k, node: `the ${vals[k]} node`, hops }, out });
      } else {
        s.set('node', { x: X[n - 1] + 20, tone: 'bad' });
        hops += 1;
        s.snap('The walk follows the last arrow, and node becomes None.', { line: 5, vars: { k, node: 'None', hops }, out });
        s.snap('None has no .next or .value. So Python stops with an AttributeError.', { line: 6, vars: { k, node: 'None', hops }, out: out + '\nAttributeError' });
      }
    },
  }));

  // ------------------------------------------------------------- lesson 14.2
  /* Lays out the chain and the node you insert after. Returns null if the chain is empty. */
  function insertStart(s, p) {
    const vals = readVals(p.values, 4);
    const n = vals.length;
    if (!n) return null;
    const asked = Math.max(0, readInt(p.after, 0));
    const after = Math.min(asked, n - 1);
    const x = readOne(p.x, '9');
    const y = 62, yNew = 172;
    const X = slots(Math.max(n, 2), 130);
    const newX = after < n - 1 ? (X[after] + X[after + 1]) / 2 : Math.min(X[after] + 60, 500);

    vals.forEach((v, i) => drawNode(s, 'n' + i, X[i], y, v));
    vals.slice(0, -1).forEach((_, i) => link(s, 'n' + i, 'n' + (i + 1)));
    s.pointer('head', X[0], y + 24, 'head', { dir: 'up' });
    s.pointer('node', X[after], y - 24, 'node', { dir: 'down', tone: 'active' });
    toneNode(s, 'n' + after, 'active');
    const note = asked > after ? ` There is no spot ${asked}, so node is on the last one.` : '';
    return { vals, n, after, x, y, yNew, X, newX, note, rest: vals.slice(after + 1), hasRest: after < n - 1 };
  }
  const insertInputs = [
    { key: 'values', label: 'Numbers, up to 4', type: 'text', value: '3,8,2', size: 10 },
    { key: 'after', label: 'After spot', type: 'number', value: 1, min: 0, max: 4 },
    { key: 'x', label: 'New number', type: 'text', value: '9', size: 4 },
  ];
  const insertTries = [{ values: '' }, { values: '7', after: 0 }, { values: '4,4,4', after: 0 }, { values: '1,2,3', after: 2 }, { values: '1,2', after: 4 }, { values: '1,2,3,4,5,6', after: 3, x: '' }];

  Viz.register('m14-insert-early', mixed({
    title: 'Change .next too early, and nodes get lost',
    size: [560, 240],
    code: py`
      new = Node(x)
      node.next = new
      new.next = node.next
    `,
    inputs: insertInputs,
    tryInputs: insertTries,
    build(s, p) {
      const c = insertStart(s, p);
      if (!c) { s.snap('The chain is empty, so there is no node to add after. Type some numbers above.'); return; }
      const { vals, after, x, yNew, newX, note, rest, hasRest } = c;
      const reach = vals.slice(0, after + 1).concat(x);
      s.snap(`The name node is on ${vals[after]}. The new node goes after it.${note}`, { vars: { x, 'node.next': hasRest ? `the ${rest[0]} node` : 'None' } });

      drawNode(s, 'new', newX, yNew, x);
      s.pointer('newp', newX, yNew + 24, 'new', { dir: 'up' });
      s.snap(`Node(${x}) makes the new node. It is not in the chain yet.`, {
        line: 1, vars: { x, 'node.next': hasRest ? `the ${rest[0]} node` : 'None' },
        ask: hasRest ? {
          q: 'node.next = new runs next. node.next can point at one node. What happens to the arrow it has now?',
          options: ['It goes away', 'It stays, beside the new arrow', 'It moves to the new node by itself'],
          answer: 0,
          why: 'next is one arrow. Set it again and it moves, as with any name.',
        } : {
          q: 'node.next = new runs next. node is the last node. Does any node get lost?',
          options: ['No, nothing comes after node', 'Yes, the head is lost'],
          answer: 0,
          why: 'The next box only held None, so no node depended on it.',
        },
      });

      if (hasRest) s.set('n' + after + 'e', { to: 'newv', tone: 'bad' });
      else link(s, 'n' + after, 'new', { tone: 'bad' });
      if (hasRest) {
        for (let i = after + 1; i < vals.length; i++) toneNode(s, 'n' + i, 'muted');
        const mid = c.X[Math.round((after + 1 + vals.length - 1) / 2)];
        s.text('lost', Math.min(mid, 440), c.y - 40, 'lost: no arrow reaches here', { size: 14, weight: 700 });
      }
      s.snap(hasRest ? `The old arrow is gone. Nothing leads to ${rest.join(', ')} now.` : 'node now points at the new node. Nothing is lost so far.', {
        line: 2, vars: { x, 'node.next': `the ${x} node` },
        ask: {
          q: 'new.next = node.next runs next. node.next just changed. Where will new.next point?',
          options: ['At the new node itself', hasRest ? `At the ${rest[0]} node` : 'At None', 'At the head'],
          answer: 0,
          why: 'node.next points at the new node now. So new.next gets an arrow to itself.',
        },
      });

      if (s.has('n' + after + 'e')) s.tone('n' + after + 'e', 'default');
      link(s, 'new', 'new', { tone: 'bad', bend: 90 });
      toneNode(s, 'new', 'warn');
      s.snap('new now points at itself. That line did not save the chain.', { line: 3, vars: { x, 'node.next': `the ${x} node`, 'new.next': `the ${x} node` } });

      s.snap(`A walk now shows ${reach.join(', ')}, ${x}, ${x} and never stops.`, { line: 3, vars: { x, 'node.next': `the ${x} node`, 'new.next': `the ${x} node` } });
      if (hasRest) s.snap(`${rest.join(', ')} can never be reached again. The fix is to swap the 2 lines.`, { line: 3, vars: { x, 'node.next': `the ${x} node`, 'new.next': `the ${x} node` } });
      else s.snap('Nothing got lost this time, but the loop is still a bug. The fix is to swap the 2 lines.', { line: 3, vars: { x, 'node.next': `the ${x} node`, 'new.next': `the ${x} node` } });
    },
  }));

  Viz.register('m14-insert-safe', mixed({
    title: 'The new arrow first, the old arrow last',
    size: [560, 240],
    code: py`
      new = Node(x)
      new.next = node.next
      node.next = new
      print(show(head))
    `,
    inputs: insertInputs,
    tryInputs: insertTries,
    build(s, p) {
      const c = insertStart(s, p);
      if (!c) { s.snap('The chain is empty, so there is no node to add after. Type some numbers above.'); return; }
      const { vals, after, x, yNew, newX, note, rest, hasRest } = c;
      const nextName = hasRest ? `the ${rest[0]} node` : 'None';
      s.snap(`The name node is on ${vals[after]}. The new node goes after it.${note}`, { vars: { x, 'node.next': nextName } });

      drawNode(s, 'new', newX, yNew, x);
      s.pointer('newp', newX, yNew + 24, 'new', { dir: 'up' });
      s.snap(`Node(${x}) makes the new node. It is not in the chain yet.`, {
        line: 1, vars: { x, 'node.next': nextName },
        ask: {
          q: 'Which arrow should you set first?',
          options: ['new.next, so new holds on to the rest', 'node.next, so node finds new', 'It does not matter'],
          answer: 0,
          why: 'node.next still leads to the rest. So new can copy that arrow before node lets go of it.',
        },
      });

      if (hasRest) link(s, 'new', 'n' + (after + 1), { tone: 'active' });
      s.snap(hasRest ? 'new.next = node.next. Now 2 arrows lead to the rest. That is fine.' : 'new.next = node.next. That is None, so the new node will be last.', {
        line: 2, vars: { x, 'node.next': nextName, 'new.next': nextName },
        ask: {
          q: 'node.next = new runs next. Does any node get lost?',
          options: ['No. new holds on to the rest', 'Yes, the rest is lost', 'Yes, the new node is lost'],
          answer: 0,
          why: hasRest ? 'The rest of the chain has a second arrow now, from new.' : 'Nothing came after node, so there is nothing to lose.',
        },
      });

      if (hasRest) { s.tone('newe', 'default'); s.set('n' + after + 'e', { to: 'newv', tone: 'active' }); }
      else link(s, 'n' + after, 'new', { tone: 'active' });
      s.snap('node.next = new. The old arrow is gone, and nothing was lost.', { line: 3, vars: { x, 'node.next': `the ${x} node`, 'new.next': nextName } });

      s.tone('n' + after + 'e', 'default');
      const result = vals.slice(0, after + 1).concat(x, rest);
      s.snap('A walk from head visits the new node in its place.', { line: 4, vars: { x, 'node.next': `the ${x} node`, 'new.next': nextName }, out: chainText(result) });
    },
  }));

  Viz.register('m14-delete', mixed({
    title: 'Delete a node with prev and cur',
    size: [560, 230],
    code: py`
      def delete(head, target):
          if head is None:
              return None
          if head.value == target:
              return head.next
          prev = head
          cur = head.next
          while cur is not None:
              if cur.value == target:
                  prev.next = cur.next
                  return head
              prev = cur
              cur = cur.next
          return head
    `,
    inputs: [
      { key: 'values', label: 'Numbers, up to 5', type: 'text', value: '3,8,2,6', size: 12 },
      { key: 'target', label: 'Delete', type: 'text', value: '2', size: 4 },
    ],
    tryInputs: [{ values: '', target: '1' }, { values: '5', target: '5' }, { values: '5', target: '1' }, { values: '5,7,5', target: '5' }, { values: '1,2', target: '9' }, { values: '4,4,4', target: '4' }, { values: '1,2,3', target: '3' }, { values: '1,2,3,4,5', target: '5' }, { values: '1,2,3,4,5', target: '9' }, { values: '1,2', target: '' }],
    build(s, p) {
      const vals = readVals(p.values, 5);
      const t = readOne(p.target, '2');
      const n = vals.length;
      const y = 66;
      const X = slots(Math.max(n, 2), 130);
      const name = i => (i < n ? `the ${vals[i]} node` : 'None');
      let looks = 0;

      if (!n) {
        s.text('hnone', 280, y, 'head is None', { size: 15, tone: 'muted' });
        s.snap('The chain is empty.', {
          line: 1, vars: { target: t },
          ask: {
            q: 'head is None. What should delete do?',
            options: ['Give back None', 'Stop with an error', 'Make a new node'],
            answer: 0,
            why: 'There is nothing to delete, so the chain stays empty.',
          },
        });
        s.snap('The first check catches it. delete gives back None.', { line: 3, vars: { target: t }, out: '[]' });
        return;
      }

      vals.forEach((v, i) => drawNode(s, 'n' + i, X[i], y, v));
      vals.slice(0, -1).forEach((_, i) => link(s, 'n' + i, 'n' + (i + 1)));
      s.pointer('head', X[0], y + 24, 'head', { dir: 'up' });
      s.snap(`Delete the first node that holds ${t}. The chain is not empty.`, { line: 2, vars: { target: t, looks } });

      looks = 1;
      toneNode(s, 'n0', 'active');
      s.snap(`First, check the head. It holds ${vals[0]}.`, {
        line: 4, vars: { target: t, looks },
        ask: {
          q: `Is ${vals[0]} equal to ${t}?`,
          options: ['Yes', 'No'],
          answer: vals[0] === t ? 0 : 1,
          why: vals[0] === t ? 'They match, so the first node is the one to delete.' : 'They differ, so the first node stays.',
        },
      });
      if (vals[0] === t) {
        const rest = vals.slice(1);
        if (n > 1) s.set('head', { x: X[1] });
        else { s.del('head'); s.text('hnone', 280, y + 58, 'head is None', { size: 15, tone: 'muted' }); }
        moveNode(s, 'n0', X[0], y + 108);
        toneNode(s, 'n0', 'muted');
        s.snap('The first node has no node before it. So head moves to head.next.', { line: 5, vars: { target: t, looks }, out: chainText(rest) });
        s.snap('No name points at the old first node now, so Python can free it.', { line: 5, vars: { target: t, looks }, out: chainText(rest) });
        return;
      }
      toneNode(s, 'n0', 'default');

      if (n === 1) {
        s.snap(`There is no second node, so cur starts as None. ${t} is not here.`, { line: 8, vars: { target: t, looks, cur: 'None' }, out: chainText(vals) });
        return;
      }
      s.pointer('prev', X[0], y - 24, 'prev', { dir: 'down', tone: 'accent' });
      s.snap('prev starts on the head. It stays one node behind.', { line: 6, vars: { target: t, looks, prev: name(0) } });
      s.pointer('cur', X[1], y - 24, 'cur', { dir: 'down', tone: 'active' });
      s.snap('cur starts on the next node. It is the one you are looking at.', { line: 7, vars: { target: t, looks, prev: name(0), cur: name(1) } });

      for (let i = 1; i < n; i++) {
        looks += 1;
        const hit = vals[i] === t;
        toneNode(s, 'n' + i, 'active');
        const here = { target: t, looks, prev: name(i - 1), cur: name(i) };
        s.snap(`cur is on ${vals[i]}. Compare it with ${t}.`, {
          line: 9, vars: here,
          ask: i % 2 === 1 || hit || i === n - 1 ? {
            q: `Is this the node to delete?`,
            options: ['Yes', 'No'],
            answer: hit ? 0 : 1,
            why: hit ? `It holds ${t}, so this is the one.` : `It holds ${vals[i]}, not ${t}. So both names move on.`,
          } : null,
        });
        if (hit) {
          const rest = vals.slice(0, i).concat(vals.slice(i + 1));
          s.snap(`Next, prev.next = cur.next runs.`, {
            line: 10, vars: here,
            ask: {
              q: `What does the arrow from ${vals[i - 1]} do?`,
              options: [i < n - 1 ? `It skips over cur, to ${vals[i + 1]}` : 'It takes None, so this node is last', 'It stays on cur', 'It goes back to head'],
              answer: 0,
              why: 'prev takes the arrow that cur has. So the walk no longer passes through cur.',
            },
          });
          moveNode(s, 'n' + i, X[i], y + 108);
          toneNode(s, 'n' + i, 'muted');
          s.set('cur', { y: y + 84 });
          if (i < n - 1) { s.set('n' + (i - 1) + 'e', { to: 'n' + (i + 1) + 'v', tone: 'active' }); }
          else unlink(s, 'n' + (i - 1));
          s.snap('prev now skips over cur. No arrow from the chain leads to cur.', { line: 10, vars: { target: t, looks }, out: chainText(rest) });
          s.snap('delete gives back the same head. Python can free the lost node.', { line: 11, vars: { target: t, looks }, out: chainText(rest) });
          return;
        }
        toneNode(s, 'n' + i, 'default');
        s.set('prev', { x: X[i] - 24 });
        s.set('cur', { x: X[i] + 24 });
        s.snap(`No match, so prev moves up to ${vals[i]}.`, { line: 12, vars: { target: t, looks, prev: name(i), cur: name(i) } });
        if (i < n - 1) {
          s.set('prev', { x: X[i] });
          s.set('cur', { x: X[i + 1] });
          s.snap(`cur moves up to ${vals[i + 1]}.`, { line: 13, vars: { target: t, looks, prev: name(i), cur: name(i + 1) } });
        } else {
          s.set('prev', { x: X[i] });
          s.set('cur', { x: X[i] + 20, y: y + 24, dir: 'up', tone: 'bad' });
          s.snap('cur takes the None from the last next box.', { line: 13, vars: { target: t, looks, prev: name(i), cur: 'None' } });
        }
      }
      s.snap(`The loop ends. ${t} is not in the chain, so nothing changes.`, { line: 14, vars: { target: t, looks, cur: 'None' }, out: chainText(vals) });
    },
  }));

  // ------------------------------------------------------------- lesson 14.3
  /* Writes which of the walking names hold None, since those have no node to point at. */
  function noneRow(s, names, y) {
    const list = names.length > 2 ? names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] : names.join(' and ');
    const text = names.length ? list + (names.length > 1 ? ' are None' : ' is None') : '';
    if (s.has('nones')) s.set('nones', { text });
    else s.text('nones', 280, y, text, { size: 15, weight: 700 });
  }

  Viz.register('m14-reverse', mixed({
    title: 'Reverse a chain, one arrow at a time',
    size: [560, 200],
    code: py`
      def reverse(head):
          prev = None
          cur = head
          while cur is not None:
              next = cur.next
              cur.next = prev
              prev = cur
              cur = next
          return prev
    `,
    inputs: [
      { key: 'values', label: 'Numbers, up to 5', type: 'text', value: '1,2,3,4', size: 12 },
    ],
    tryInputs: [{ values: '' }, { values: '7' }, { values: '1,2' }, { values: '4,4,4' }, { values: '1,2,3,4,5' }, { values: '1,2,3,4,5,6,7,8' }],
    build(s, p) {
      const vals = readVals(p.values, 5);
      const n = vals.length;
      const y = 84, yNone = 178;
      const X = n >= 5 ? slots(n, 104) : slots(Math.max(n, 2), 130);
      const name = i => (i >= 0 && i < n ? `the ${vals[i]} node` : 'None');

      if (!n) {
        noneRow(s, ['head'], y);
        s.snap('The chain is empty, so head is None.', { line: 1, vars: { head: 'None' } });
        noneRow(s, ['head', 'prev', 'cur'], y);
        s.snap('prev starts as None, and cur takes head, which is None.', {
          line: 3, vars: { prev: 'None', cur: 'None' },
          ask: {
            q: 'cur is None. What does the loop do?',
            options: ['It never runs', 'It runs once', 'Python stops with an error'],
            answer: 0,
            why: 'The loop asks if cur is not None. The answer is False right away.',
          },
        });
        s.snap('The loop never runs. reverse gives back prev, which is None.', { line: 9, vars: { prev: 'None', cur: 'None' }, out: '[]' });
        return;
      }

      vals.forEach((v, i) => drawNode(s, 'n' + i, X[i], y, v));
      vals.slice(0, -1).forEach((_, i) => link(s, 'n' + i, 'n' + (i + 1)));
      s.pointer('head', X[0], y + 24, 'head', { dir: 'up' });
      s.snap(n > 1 ? 'Here is the chain. All the arrows point right. head is on the first node.' : 'This chain has one node. head is on it, and its next box holds None.', { line: 1, vars: { head: name(0) } });

      noneRow(s, ['prev'], yNone);
      s.snap('prev starts as None. Nothing comes behind the first node.', { line: 2, vars: { prev: 'None' } });

      s.pointer('cur', X[0], y - 24, 'cur', { dir: 'down', tone: 'active' });
      s.snap('cur starts on the first node. Its arrow is the first to turn.', {
        line: 3, vars: { prev: 'None', cur: name(0) },
        ask: {
          q: 'Why save next = cur.next before turning the arrow?',
          options: ['cur.next is the only way to the rest of the chain', 'It makes the code shorter', 'The while line needs it'],
          answer: 0,
          why: 'Once cur.next changes, nothing leads to the nodes ahead. The name next keeps hold of them.',
        },
      });

      const names = i => ({ prev: name(i - 1), cur: name(i), next: name(i + 1) });
      for (let i = 0; i < n; i++) {
        const last = i === n - 1;
        s.set('cur', { x: X[i] });
        if (last) {
          noneRow(s, i === 0 ? ['prev', 'next'] : ['next'], yNone);
        } else if (s.has('nx')) {
          s.set('nx', { x: X[i + 1] });
        } else {
          s.pointer('nx', X[i + 1], y - 24, 'next', { dir: 'down', tone: 'warn' });
        }
        if (last && s.has('nx')) s.del('nx');
        s.snap(last ? 'next = cur.next. That is None, so this is the last node.' : `next = cur.next. The name next now points at ${vals[i + 1]}.`, {
          line: 5, vars: names(i),
          ask: i === 1 ? {
            q: 'cur.next = prev runs next. Which way will this arrow point?',
            options: ['Back, at the node behind it', 'Forward, at the next node', 'At None'],
            answer: 0,
            why: 'prev names the node behind cur. So the arrow turns around to point at it.',
          } : i === 0 ? {
            q: 'cur.next = prev runs next. What will cur.next be?',
            options: ['None', 'The next node', 'The value of cur'],
            answer: 0,
            why: 'prev is None on this first trip. This node will be last when you finish.',
          } : null,
        });

        flipNode(s, 'n' + i, X[i], y);
        if (i > 0) {
          if (s.has('n' + i + 'e')) s.set('n' + i + 'e', { to: 'n' + (i - 1) + 'v', tone: 'active' });
          else link(s, 'n' + i, 'n' + (i - 1), { tone: 'active' });
        } else if (!last) unlink(s, 'n0');
        toneNode(s, 'n' + i, 'active');
        s.snap(i === 0 ? (last ? 'cur.next = prev. It is None, the same as before.' : 'cur.next = prev. The arrow of this node is now None. The name next keeps the rest safe.') : `cur.next = prev. The arrow from ${vals[i]} now points back at ${vals[i - 1]}.`, { line: 6, vars: names(i) });

        toneNode(s, 'n' + i, 'default');
        if (s.has('n' + i + 'e')) s.tone('n' + i + 'e', 'default');
        if (s.has('pv')) s.set('pv', { x: X[i] - 24 });
        else s.pointer('pv', X[i] - 24, y - 24, 'prev', { dir: 'down' });
        s.set('cur', { x: X[i] + 24 });
        const leftNone = last ? ['next'] : [];
        noneRow(s, leftNone, yNone);
        s.snap(`prev = cur. prev moves up to ${vals[i]}. The turned part of the chain starts here.`, {
          line: 7, vars: { prev: name(i), cur: name(i), next: name(i + 1) },
        });

        if (last) {
          s.del('cur');
          s.set('pv', { x: X[i] });
          noneRow(s, ['cur', 'next'], yNone);
          s.snap('cur = next. cur is None now.', {
            line: 8, vars: { prev: name(i), cur: 'None', next: 'None' },
            ask: {
              q: 'The loop stops, because cur is None. What should reverse give back?',
              options: ['prev, the new first node', 'head, the old first node', 'cur, which is None'],
              answer: 0,
              why: 'prev is on the last node you turned. That node comes first now.',
            },
          });
        } else {
          s.set('pv', { x: X[i] });
          s.set('cur', { x: X[i + 1] - 24 });
          s.set('nx', { x: X[i + 1] + 24 });
          s.snap(`cur = next. cur moves up to ${vals[i + 1]}. Its arrow is the next to turn.`, { line: 8, vars: { prev: name(i), cur: name(i + 1), next: name(i + 1) } });
        }
      }

      const result = vals.slice().reverse();
      s.set('pv', { x: X[n - 1], text: 'new head', tone: 'ok' });
      s.snap(`reverse gives back prev. The chain now reads ${result.join(', ')}.`, { line: 9, vars: { prev: name(n - 1) }, out: chainText(result) });
      s.snap(n > 1 ? `The name head is still on ${vals[0]}. So write head = reverse(head).` : 'One node reverses to itself. Try more numbers above.', { line: 9, vars: { prev: name(n - 1) }, out: chainText(result) });
    },
  }));

  Viz.register('m14-reverse-early', mixed({
    title: 'Turn the arrow too early, and the rest is lost',
    size: [560, 200],
    code: py`
      prev = None
      cur = head
      while cur is not None:
          cur.next = prev
          prev = cur
          cur = cur.next
      print(show(prev))
    `,
    inputs: [
      { key: 'values', label: 'Numbers, up to 5', type: 'text', value: '1,2,3,4', size: 12 },
    ],
    tryInputs: [{ values: '' }, { values: '7' }, { values: '1,2' }, { values: '1,2,3,4,5,6' }],
    build(s, p) {
      const vals = readVals(p.values, 5);
      const n = vals.length;
      const y = 84, yNone = 178;
      const X = n >= 5 ? slots(n, 104) : slots(Math.max(n, 2), 130);

      if (!n) {
        s.text('hnone', 280, y, 'head is None', { size: 15, tone: 'muted' });
        s.snap('The chain is empty, so the loop never runs. Nothing can get lost. Type some numbers above.', { line: 3, out: '[]' });
        return;
      }

      vals.forEach((v, i) => drawNode(s, 'n' + i, X[i], y, v));
      vals.slice(0, -1).forEach((_, i) => link(s, 'n' + i, 'n' + (i + 1)));
      s.pointer('head', X[0], y + 24, 'head', { dir: 'up' });
      noneRow(s, ['prev'], yNone);
      s.pointer('cur', X[0], y - 24, 'cur', { dir: 'down', tone: 'active' });
      s.snap('prev is None, and cur is on the first node. This code has no next name.', {
        line: 2, vars: { prev: 'None', cur: `the ${vals[0]} node` },
        ask: n > 1 ? {
          q: 'cur.next = prev runs next. What goes away?',
          options: ['The only arrow to the rest of the chain', 'Only the value in cur', 'Nothing goes away'],
          answer: 0,
          why: 'No other arrow or name leads to the nodes ahead of cur.',
        } : null,
      });

      flipNode(s, 'n0', X[0], y);
      if (n > 1) {
        unlink(s, 'n0');
        for (let i = 1; i < n; i++) toneNode(s, 'n' + i, 'muted');
        s.text('lost', X[Math.round(n / 2)], y + 46, 'lost: no arrow reaches here', { size: 14, weight: 700 });
      }
      toneNode(s, 'n0', 'active');
      s.snap(n > 1 ? `cur.next is None now. Nothing leads to ${vals.slice(1).join(', ')}.` : 'cur.next is None. It was None already, so nothing changes.', { line: 4, vars: { prev: 'None', cur: `the ${vals[0]} node` } });

      toneNode(s, 'n0', 'default');
      noneRow(s, [], yNone);
      s.pointer('pv', X[0] - 24, y - 24, 'prev', { dir: 'down' });
      s.set('cur', { x: X[0] + 24 });
      s.snap('prev = cur. Both names are on the first node now.', {
        line: 5, vars: { prev: `the ${vals[0]} node`, cur: `the ${vals[0]} node` },
        ask: {
          q: 'cur = cur.next runs next. cur.next is None now. Where does cur go?',
          options: ['To None, so the loop stops', 'To the next node', 'Back to head'],
          answer: 0,
          why: 'cur.next no longer leads forward. The way ahead was never saved.',
        },
      });

      s.del('cur');
      s.set('pv', { x: X[0] });
      noneRow(s, ['cur'], yNone);
      s.snap('cur is None, so the loop stops after one trip.', { line: 6, vars: { prev: `the ${vals[0]} node`, cur: 'None' } });
      s.snap(n > 1 ? `Only ${vals[0]} is left. The fix is next = cur.next, before the arrow turns.` : 'One node works by luck. Try more numbers above.', { line: 7, vars: { prev: `the ${vals[0]} node`, cur: 'None' }, out: chainText([vals[0]]) });
    },
  }));

  Viz.register('m14-dummy', mixed({
    title: 'A dummy node gives every node a prev',
    size: [560, 240],
    code: py`
      def remove_all(head, target):
          dummy = Node(0)
          dummy.next = head
          prev = dummy
          while prev.next is not None:
              if prev.next.value == target:
                  prev.next = prev.next.next
              else:
                  prev = prev.next
          return dummy.next
    `,
    inputs: [
      { key: 'values', label: 'Numbers, up to 4', type: 'text', value: '5,7,5,2', size: 12 },
      { key: 'target', label: 'Remove', type: 'text', value: '5', size: 4 },
    ],
    tryInputs: [{ values: '', target: '1' }, { values: '4,4,4', target: '4' }, { values: '4', target: '4' }, { values: '1,2', target: '9' }, { values: '1,2,3', target: '3' }, { values: '1,2,3,4,5,6', target: '' }],
    build(s, p) {
      const vals = readVals(p.values, 4);
      const t = readOne(p.target, '5');
      const n = vals.length;
      const y = 70;
      const X = slots(Math.max(n + 1, 2), 125);
      const NX = i => X[i + 1];
      const name = i => (i < n ? `the ${vals[i]} node` : 'None');

      drawNode(s, 'd', X[0], y, 0);
      s.text('dlabel', X[0], y + 34, 'dummy', { size: 14, weight: 700 });
      vals.forEach((v, i) => drawNode(s, 'n' + i, NX(i), y, v));
      vals.slice(0, -1).forEach((_, i) => link(s, 'n' + i, 'n' + (i + 1)));
      s.snap('dummy = Node(0). Its value is never used.', { line: 2, vars: { target: t } });

      if (n) link(s, 'd', 'n0', { tone: 'active' });
      s.snap(n ? 'dummy.next = head. Now even the first real node has a node before it.' : 'dummy.next = head. The chain is empty, so that is None.', { line: 3, vars: { target: t } });

      if (n) s.tone('de', 'default');
      s.pointer('prev', X[0], y - 24, 'prev', { dir: 'down' });
      let last = 'd';
      let prevText = 'dummy';
      s.snap('prev starts on the dummy.', {
        line: 4, vars: { target: t, prev: prevText, 'prev.next': n ? name(0) : 'None' },
        ask: n ? {
          q: 'Does the first real node need its own special code now?',
          options: ['No. It has a prev like every other node', 'Yes. It is still the first'],
          answer: 0,
          why: 'The dummy sits before it. So the same two lines handle every node.',
        } : {
          q: 'prev.next is None. What does the loop do?',
          options: ['It never runs', 'It runs once', 'Python stops with an error'],
          answer: 0,
          why: 'The loop checks prev.next first, and it is None.',
        },
      });

      const kept = [];
      let asked = 0;
      for (let i = 0; i < n; i++) {
        const hit = vals[i] === t;
        toneNode(s, 'n' + i, 'active');
        const here = { target: t, prev: prevText, 'prev.next': name(i) };
        const askNow = asked < 3 && (i === 0 || hit);
        if (askNow) asked += 1;
        s.snap(`prev.next points at ${vals[i]}. Does it match ${t}?`, {
          line: 6, vars: here,
          ask: askNow ? {
            q: `Is ${vals[i]} equal to ${t}?`,
            options: ['Yes, remove it', 'No, keep it'],
            answer: hit ? 0 : 1,
            why: hit ? 'They match, so prev skips over this node.' : 'They differ, so this node stays and prev moves on.',
          } : null,
        });
        if (hit) {
          moveNode(s, 'n' + i, NX(i), y + 110);
          toneNode(s, 'n' + i, 'muted');
          if (i < n - 1) s.set(last + 'e', { to: 'n' + (i + 1) + 'v', tone: 'active' });
          else unlink(s, last);
          s.snap(`prev.next = prev.next.next. The arrow skips over ${vals[i]}.`, {
            line: 7, vars: { target: t, prev: prevText, 'prev.next': name(i + 1) },
            ask: i < n - 1 && asked < 3 ? {
              q: 'A node was removed. Should prev move on now?',
              options: ['No. The new prev.next is not checked yet', 'Yes. prev always moves'],
              answer: 0,
              why: 'If prev moved, it would skip a node it never checked. It could be another match.',
            } : null,
          });
          if (s.has(last + 'e')) s.tone(last + 'e', 'default');
        } else {
          toneNode(s, 'n' + i, 'default');
          kept.push(vals[i]);
          s.set('prev', { x: NX(i) });
          last = 'n' + i;
          prevText = `the ${vals[i]} node`;
          s.snap(`prev = prev.next. prev moves up to ${vals[i]}, and keeps it.`, { line: 9, vars: { target: t, prev: prevText, 'prev.next': name(i + 1) } });
        }
      }

      s.snap('prev.next is None, so the loop stops.', { line: 5, vars: { target: t, prev: prevText, 'prev.next': 'None' } });
      if (kept.length) s.pointer('newhead', NX(vals.indexOf(kept[0])), y + 26, 'new head', { dir: 'up', tone: 'ok' });
      else s.text('newhead', 280, 224, 'dummy.next is None', { size: 15, weight: 700 });
      s.tone('dv', 'muted');
      s.tone('dn', 'muted');
      s.snap(kept.length ? `dummy.next is the real head. The chain reads ${kept.join(', ')}. You drop the dummy.` : 'dummy.next is None, so the chain is empty. That took no special case.', { line: 10, vars: { target: t }, out: chainText(kept) });
    },
  }));

  // ------------------------------------------------------------- lesson 14.4
  Viz.register('m14-middle', mixed({
    title: 'Fast and slow find the middle',
    size: [560, 200],
    code: py`
      def middle(head):
          slow = head
          fast = head
          while (fast is not None
                 and fast.next is not None):
              slow = slow.next
              fast = fast.next.next
          return slow
    `,
    inputs: [
      { key: 'values', label: 'Numbers, up to 5', type: 'text', value: '3,8,2,6,5', size: 12 },
    ],
    tryInputs: [{ values: '' }, { values: '7' }, { values: '1,2' }, { values: '4,4,4,4' }, { values: '1,2,3,4,5,6,7,8' }],
    build(s, p) {
      const vals = readVals(p.values, 5);
      const n = vals.length;
      const y = 92;
      const X = slots(Math.max(n, 2), 115);

      if (!n) {
        s.text('hnone', 280, y, 'head is None', { size: 15, tone: 'muted' });
        s.snap('The chain is empty, so slow and fast both start as None.', {
          line: 3, vars: { slow: 'None', fast: 'None' },
          ask: {
            q: 'fast is None. What does the loop do?',
            options: ['It never runs', 'It runs once', 'Python stops with an error'],
            answer: 0,
            why: 'The left side of and is False, so Python never looks at fast.next.',
          },
        });
        s.snap('The loop never runs. middle gives back None.', { line: 8, vars: { slow: 'None', fast: 'None' }, out: 'None' });
        return;
      }

      vals.forEach((v, i) => drawNode(s, 'n' + i, X[i], y, v));
      vals.slice(0, -1).forEach((_, i) => link(s, 'n' + i, 'n' + (i + 1)));
      s.pointer('slow', X[0], y - 24, 'slow', { dir: 'down', tone: 'active' });
      s.snap('slow starts on the head. It follows 1 arrow per turn.', { line: 2, vars: { slow: vals[0] } });
      s.pointer('fast', X[0], y + 24, 'fast', { dir: 'up', tone: 'warn' });
      s.snap('fast starts on the head too. It follows 2 arrows per turn.', {
        line: 3, vars: { slow: vals[0], fast: vals[0], turns: 0 },
        ask: n >= 3 ? {
          q: 'After one turn, which node will fast be on?',
          options: ['The third node', 'The second node', 'The last node'],
          answer: 0,
          why: '2 arrows from the first node lands on the third node.',
        } : null,
      });

      let a = 0, b = 0, turns = 0;
      while (b !== null && b + 1 < n) {
        turns += 1;
        a += 1;
        s.set('slow', { x: X[a] });
        s.snap(`Turn ${turns}: slow follows 1 arrow to ${vals[a]}.`, { line: 6, vars: { slow: vals[a], fast: vals[b], turns } });
        if (b + 2 < n) {
          b += 2;
          s.set('fast', { x: X[b] });
          const more = b + 1 < n;
          s.snap(`Turn ${turns}: fast follows 2 arrows to ${vals[b]}.`, {
            line: 7, vars: { slow: vals[a], fast: vals[b], turns },
            ask: {
              q: 'The loop checks again. Does it run another turn?',
              options: ['Yes', 'No'],
              answer: more ? 0 : 1,
              why: more ? 'fast is on a node, and that node has a next node.' : 'fast is on the last node, so fast.next is None.',
            },
          });
        } else {
          b = null;
          s.set('fast', { x: X[n - 1] + 20, tone: 'bad' });
          s.snap(`Turn ${turns}: fast follows 2 arrows and lands on the None at the end.`, {
            line: 7, vars: { slow: vals[a], fast: 'None', turns },
            ask: {
              q: 'fast is None. Is it safe to read fast.next now?',
              options: ['No. That is why the code checks fast first', 'Yes. None has a next'],
              answer: 0,
              why: 'None has no .next. The check on fast comes first, so the and stops there.',
            },
          });
        }
      }

      toneNode(s, 'n' + a, 'ok');
      const say = n === 1 ? 'With one node, slow is already on the middle.' : n % 2 ? `The loop stops. slow is on ${vals[a]}, the exact middle.` : `The loop stops. slow is on ${vals[a]}, the second of the 2 middles.`;
      s.snap(say, { line: 8, vars: { slow: vals[a], turns }, out: vals[a] });
    },
  }));

  Viz.register('m14-cycle', mixed({
    title: 'Fast catches slow if there is a cycle',
    size: [560, 220],
    code: py`
      def has_cycle(head):
          slow = head
          fast = head
          while (fast is not None
                 and fast.next is not None):
              slow = slow.next
              fast = fast.next.next
              if slow is fast:
                  return True
          return False
    `,
    inputs: [
      { key: 'values', label: 'Numbers, up to 5', type: 'text', value: '1,2,3,4,5', size: 12 },
      { key: 'back', label: 'Last node points to spot', type: 'number', value: 1, min: -1, max: 4 },
    ],
    tryInputs: [{ values: '', back: 0 }, { values: '7', back: 0 }, { values: '7', back: -1 }, { values: '1,2', back: 0 }, { values: '1,2', back: 1 }, { values: '4,4,4', back: 0 }, { values: '1,2,3,4,5', back: -1 }, { values: '1,2,3,4,5', back: 4 }, { values: '1,2,3,4', back: 4 }],
    build(s, p) {
      const vals = readVals(p.values, 5);
      const n = vals.length;
      const back = Math.min(readInt(p.back, -1), n - 1);
      const y = 80;
      const X = slots(Math.max(n, 2), 115);
      const nextOf = i => (i < n - 1 ? i + 1 : back >= 0 ? back : null);

      if (!n) {
        s.text('hnone', 280, y, 'head is None', { size: 15, tone: 'muted' });
        s.snap('The chain is empty, so fast is None. The loop never runs.', { line: 4, vars: { slow: 'None', fast: 'None' } });
        s.snap('has_cycle gives back False. An empty chain has no cycle.', { line: 10, out: 'False' });
        return;
      }

      vals.forEach((v, i) => drawNode(s, 'n' + i, X[i], y, v));
      vals.slice(0, -1).forEach((_, i) => link(s, 'n' + i, 'n' + (i + 1)));
      if (back >= 0) {
        const self = back === n - 1;
        // The arrow lands under the value box. From the side, the next box would hide its tip.
        s.box('land', X[back] - 22, y + 26, '', { w: 2, h: 2, opacity: 0 });
        s.set('n' + (n - 1) + 'x', { text: '•', size: 22 });
        s.edge('n' + (n - 1) + 'e', 'n' + (n - 1) + 'n', 'land', { bend: self ? -60 : -128, tone: 'warn' });
        toneNode(s, 'n' + back, 'warn');
      }
      const place = (a, b) => {
        s.del('slow', 'fast');
        if (a === b) {
          s.pointer('slow', X[a], y - 24, 'slow, fast', { dir: 'down', tone: 'active' });
        } else {
          s.pointer('slow', X[a], y - 24, 'slow', { dir: 'down', tone: 'active' });
          if (b === null) s.text('fast', 280, 196, 'fast is None', { size: 15, weight: 700 });
          else s.pointer('fast', X[b], y - 24, 'fast', { dir: 'down', tone: 'accent' });
        }
      };
      let a = 0, b = 0, turns = 0;
      place(0, 0);
      s.snap(back >= 0 ? `The last node points back at spot ${back}, so this chain has a cycle. Both names start on the head.` : 'This chain ends at None. Both names start on the head.', {
        line: 3, vars: { slow: vals[0], fast: vals[0], turns },
        ask: {
          q: 'Will fast ever reach None here?',
          options: back >= 0 ? ['No. It goes round and round', 'Yes, in the end'] : ['Yes, in the end', 'No. It goes round and round'],
          answer: 0,
          why: back >= 0 ? 'The arrow from the last node leads back. No arrow in the chain holds None.' : 'The last next box holds None, so the walk runs out.',
        },
      });

      let met = false;
      while (b !== null && nextOf(b) !== null && turns < 12) {
        turns += 1;
        a = nextOf(a);
        const mid = nextOf(b);
        b = nextOf(mid);
        const sameNow = a === b;
        place(a, b);
        const fastName = b === null ? 'None' : vals[b];
        s.snap(`Turn ${turns}: slow moves 1 arrow to ${vals[a]}. fast moves 2 arrows to ${fastName}.`, {
          line: 7, vars: { slow: vals[a], fast: fastName, turns },
          ask: b !== null && (turns === 1 || sameNow || turns % 2 === 0) ? {
            q: 'Are slow and fast on the very same node?',
            options: ['Yes', 'No'],
            answer: sameNow ? 0 : 1,
            why: sameNow ? 'Both names point at one node. Equal values alone would not count.' : `slow is at spot ${a}, and fast is at spot ${b}. Those are different nodes.`,
          } : null,
        });
        if (sameNow) { met = true; break; }
      }

      if (met) {
        toneNode(s, 'n' + a, 'ok');
        s.snap(`They met after ${turns} ${turns === 1 ? 'turn' : 'turns'}. Only a cycle lets fast come round behind slow.`, { line: 9, vars: { slow: vals[a], fast: vals[b], turns }, out: 'True' });
      } else {
        s.snap('fast ran out of nodes, so the loop stops. A cycle would never run out.', { line: 10, vars: { slow: vals[a], fast: b === null ? 'None' : vals[b], turns }, out: 'False' });
      }
    },
  }));

  /* A two-way node: a value box, with a next box high on the right and a prev box low on the left.
     That way the 2 arrows between 2 nodes run side by side, and do not cross. */
  function drawTwoWay(s, id, x, y, value) {
    s.box(id + 'p', x - 33, y + 11, '', { w: 26, h: 22 });
    s.box(id + 'v', x, y, value, { w: 40, h: 44 });
    s.box(id + 'n', x + 33, y - 11, '', { w: 26, h: 22 });
  }
  function moveTwoWay(s, id, x, y) {
    s.set(id + 'p', { x: x - 33, y: y + 11 });
    s.set(id + 'v', { x, y });
    s.set(id + 'n', { x: x + 33, y: y - 11 });
  }

  Viz.register('m14-doubly', mixed({
    title: 'A two-way chain removes a node in place',
    size: [560, 260],
    code: py`
      def remove(self, node):
          if node.prev is None:
              self.head = node.next
          else:
              node.prev.next = node.next
          if node.next is None:
              self.tail = node.prev
          else:
              node.next.prev = node.prev
    `,
    inputs: [
      { key: 'values', label: 'Numbers, up to 4', type: 'text', value: '3,8,2,6', size: 12 },
      { key: 'spot', label: 'Remove spot', type: 'number', value: 1, min: 0, max: 3 },
    ],
    tryInputs: [{ values: '', spot: 0 }, { values: '7', spot: 0 }, { values: '1,2', spot: 0 }, { values: '1,2', spot: 1 }, { values: '4,4,4', spot: 2 }, { values: '1,2,3', spot: 3 }, { values: '1,2,3,4,5,6', spot: 3 }],
    build(s, p) {
      const vals = readVals(p.values, 4);
      const n = vals.length;
      const y = 104;
      const X = slots(Math.max(n, 2), 125);

      if (!n) {
        s.text('hnone', 280, y, 'head and tail are None', { size: 15, tone: 'muted' });
        s.snap('The chain is empty, so there is no node to remove. Type some numbers above.');
        return;
      }

      const spot = Math.max(0, Math.min(readInt(p.spot, 0), n - 1));
      const hasPrev = spot > 0, hasNext = spot < n - 1;
      const noneL = i => s.text('noneL', X[i] - 68, y + 11, 'None', { size: 12, mono: true, weight: 700 });
      const noneR = i => s.text('noneR', X[i] + 68, y - 11, 'None', { size: 12, mono: true, weight: 700 });
      const goR = i => s.edge('f' + i, 'n' + i + 'n', 'n' + (i + 1) + 'v');
      const goL = i => s.edge('b' + i, 'n' + (i + 1) + 'p', 'n' + i + 'v');
      vals.forEach((v, i) => drawTwoWay(s, 'n' + i, X[i], y, v));
      for (let i = 0; i < n - 1; i++) { goR(i); goL(i); }
      noneL(0);
      noneR(n - 1);
      s.pointer('head', X[0], y + 24, 'head', { dir: 'up' });
      s.pointer('tail', X[n - 1], y + 24, 'tail', { dir: 'up' });
      if (n === 1) {
        s.set('head', { x: X[0] - 26 });
        s.set('tail', { x: X[0] + 26 });
      }
      s.pointer('node', X[spot], y - 48, 'node', { dir: 'down', tone: 'active' });
      s.tone('n' + spot + 'v', 'active');
      s.snap(`Each node has 2 arrows. You hold the ${vals[spot]} node, and want it out.`, {
        line: 1, vars: { node: vals[spot] },
        ask: {
          q: 'Do you need to walk from the head to find the node before it?',
          options: ['No. node.prev already leads there', 'Yes. You always walk from the head'],
          answer: 0,
          why: 'That is the point of the second arrow. In a one-way chain you would have to walk.',
        },
      });

      if (hasPrev) {
        s.tone('n' + (spot - 1) + 'n', 'active');
        s.snap(`node.prev is the ${vals[spot - 1]} node. Its next arrow must skip over node.`, {
          line: 2, vars: { node: vals[spot] },
          ask: {
            q: 'How many arrows must change in all to take this node out?',
            options: [hasNext ? '2' : '1 arrow and the tail', 'One for each node', 'None'],
            answer: 0,
            why: hasNext ? 'One next arrow and one prev arrow. No other node changes.' : 'The next arrow before it changes, and tail moves back. No other node changes.',
          },
        });
        s.del('f' + (spot - 1));
        if (hasNext) s.edge('f' + (spot - 1), 'n' + (spot - 1) + 'n', 'n' + (spot + 1) + 'v', { bend: -70, tone: 'active' });
        s.snap(hasNext ? 'node.prev.next = node.next. Going forward, the walk now skips node.' : 'node.prev.next = node.next. That is None, so this node will be last.', { line: 5, vars: { node: vals[spot] } });
        if (hasNext) s.tone('f' + (spot - 1), 'default');
        s.tone('n' + (spot - 1) + 'n', 'default');
      } else {
        if (hasNext) s.set('head', { x: X[spot + 1] });
        s.snap(hasNext ? 'node.prev is None, so this is the first node. head moves to node.next.' : 'node.prev is None, so head takes node.next. That is None too.', { line: 3, vars: { node: vals[spot] } });
      }

      if (hasNext) {
        s.tone('n' + (spot + 1) + 'p', 'active');
        s.del('b' + spot);
        if (hasPrev) s.edge('b' + spot, 'n' + (spot + 1) + 'p', 'n' + (spot - 1) + 'v', { bend: -70, tone: 'active' });
        s.snap(hasPrev ? 'node.next.prev = node.prev. Going back, the walk now skips node too.' : 'node.next.prev = node.prev. That is None, so this node is first now.', { line: 9, vars: { node: vals[spot] } });
        if (hasPrev) s.tone('b' + spot, 'default');
        s.tone('n' + (spot + 1) + 'p', 'default');
      } else {
        if (hasPrev) s.set('tail', { x: X[spot - 1] });
        s.snap(hasPrev ? 'node.next is None, so this is the last node. tail moves back to node.prev.' : 'node.next is None, so tail takes node.prev. That is None too.', { line: 7, vars: { node: vals[spot] } });
      }

      moveTwoWay(s, 'n' + spot, X[spot], y + 110);
      s.tone(['n' + spot + 'p', 'n' + spot + 'v', 'n' + spot + 'n'], 'muted');
      s.del('f' + spot, 'b' + (spot - 1), 'node');
      if (spot === 0) { s.del('noneL'); if (hasNext) noneL(1); }
      if (spot === n - 1) { s.del('noneR'); if (hasPrev) noneR(spot - 1); }
      if (n === 1) { s.del('head', 'tail'); s.text('hnone', 280, y, 'head and tail are None', { size: 15, tone: 'muted' }); }
      const rest = vals.filter((_, i) => i !== spot);
      s.snap(n > 1 ? `The node is out. No walk was needed. The chain reads ${rest.join(', ')}.` : 'The node is out, and the chain is empty.', { line: 9, vars: { node: vals[spot] }, out: chainText(rest) });
    },
  }));
})();
