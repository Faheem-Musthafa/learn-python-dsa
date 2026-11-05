/* Visuals for module 18. Names start with the module id.
 *
 * Every tree sits on fixed spots: level d has 2^d spots across the stage, so a node
 * never moves when another one joins, and a lopsided tree really looks lopsided.
 * Only 4 levels (depth 3) are ever drawn, so each tree fits a phone.
 * All typed values go through a reader that skips junk, so no input can break a picture.
 */
(function () {
  // ------------------------------------------------------------- small helpers
  const W = 560;
  const R = 20;
  const MAX_LEVEL = 4;
  const many = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  const whole = (v, min, max, dflt) => {
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : dflt;
  };
  const isGap = t => /^(-|_|none|null)$/i.test(t);
  const tokens = text => String(text == null ? '' : text).split(/[\s,;]+/).filter(Boolean);

  /* Options for an ask. Drops repeats, and moves the right answer around. */
  let turn = 0;
  function choices(right, wrongs) {
    const seen = new Set([String(right)]);
    const rest = [];
    wrongs.forEach(w => {
      const t = String(w);
      if (!seen.has(t)) { seen.add(t); rest.push(t); }
    });
    turn += 1;
    const at = turn % (rest.length + 1);
    rest.splice(at, 0, String(right));
    return { options: rest, answer: at };
  }
  /* Puts a question on the frame already saved, so it shows before the next change. */
  const askOnLast = (s, ask) => { if (s.frames.length) s.frames[s.frames.length - 1].ask = ask; };

  /* Reads a tree written level by level, like "A, B, C, -, E". A gap is written "-".
     Each spot has its children at 2i + 1 and 2i + 2. */
  function readTree(text, maxSlots = 15) {
    const skip = { count: 0 };
    const good = [];
    tokens(text).forEach(t => {
      if (isGap(t)) good.push(null);
      else if (/^[A-Za-z0-9]{1,3}$/.test(t)) good.push(t);
      else skip.count += 1;
    });
    if (good.length > maxSlots) skip.count += good.length - maxSlots;
    const bySlot = {};
    good.slice(0, maxSlots).forEach((v, slot) => {
      if (v == null) return;
      const up = (slot - 1) >> 1;
      if (slot > 0 && !bySlot[up]) { skip.count += 1; return; }
      const node = { id: 'tn' + slot, value: v, left: null, right: null };
      bySlot[slot] = node;
      if (slot > 0) { if (slot % 2) bySlot[up].left = node; else bySlot[up].right = node; }
    });
    return { root: bySlot[0] || null, skipped: skip.count };
  }
  const skipNote = n => (n ? ' Some of what you typed did not fit, so it was skipped.' : '');

  /* Reads whole numbers for a binary search tree. Repeats stay, so the picture can show them. */
  function readNums(text, limit) {
    const nums = [];
    let skipped = 0;
    tokens(text).forEach(t => {
      const n = Number(t);
      if (Number.isInteger(n) && n >= -99 && n <= 999 && nums.length < limit) nums.push(n);
      else skipped += 1;
    });
    return { nums, skipped };
  }

  // ------------------------------------------------------------- tree helpers
  const kidsOf = n => [n.left, n.right].filter(Boolean);
  const isLeaf = n => !n.left && !n.right;
  const heightOf = n => (n ? 1 + Math.max(heightOf(n.left), heightOf(n.right)) : 0);
  const sizeOf = n => (n ? 1 + sizeOf(n.left) + sizeOf(n.right) : 0);
  const allNodes = n => (n ? [n, ...allNodes(n.left), ...allNodes(n.right)] : []);
  const walkOrder = (n, kind) => {
    if (!n) return [];
    const l = walkOrder(n.left, kind), r = walkOrder(n.right, kind);
    if (kind === 'pre') return [n, ...l, ...r];
    if (kind === 'in') return [...l, n, ...r];
    return [...l, ...r, n];
  };

  /* Where a spot sits. Level d has 2^d spots, spread evenly over the width. */
  function spot(slot, o = {}) {
    const d = Math.floor(Math.log2(slot + 1));
    const i = slot + 1 - 2 ** d;
    const left = o.left || 0, wide = o.wide || W;
    return { x: left + (wide * (i + 0.5)) / 2 ** d, y: (o.top == null ? 52 : o.top) + d * (o.gap || 60), d };
  }

  /* Makes the picture match the tree. New nodes appear, moved nodes glide, gone nodes leave.
     Nodes deeper than 4 levels are not drawn. They come back in the list it returns. */
  function drawTree(s, root, o = {}) {
    const pre = o.prefix || '';
    const keep = new Set();
    const hidden = [];
    const place = (n, slot, parent) => {
      const p = spot(slot, o);
      if (p.d >= (o.levels || MAX_LEVEL)) { hidden.push(n); if (n.left) place(n.left, 2 * slot + 1, n); if (n.right) place(n.right, 2 * slot + 2, n); return; }
      const id = pre + n.id;
      keep.add(id);
      n.slot = slot;
      n.drawn = id;
      if (s.has(id)) s.set(id, { x: p.x, y: p.y, text: n.value, opacity: 1 });
      else s.circle(id, p.x, p.y, n.value, { r: R, size: String(n.value).length > 2 ? 16 : 19 });
      if (parent) {
        const eid = pre + 'e' + n.id;
        keep.add(eid);
        if (s.has(eid)) s.set(eid, { from: pre + parent.id, to: id });
        else s.edge(eid, pre + parent.id, id, {});
      }
      if (n.left) place(n.left, 2 * slot + 1, n);
      if (n.right) place(n.right, 2 * slot + 2, n);
    };
    if (root) place(root, 0, null);
    for (const it of [...s.items.values()]) {
      const mine = pre ? it.id.startsWith(pre) : true;
      if (mine && /^(tn|etn)/.test(pre ? it.id.slice(pre.length) : it.id) && !keep.has(it.id)) s.del(it.id);
    }
    return hidden;
  }

  /* A row of small value boxes that fills from the left. */
  const rowX = (i, n) => 280 + (i - (n - 1) / 2) * 37;
  const rowSize = v => (String(v).length > 2 ? 15 : 19);
  const nodeOf = (root, value) => allNodes(root).find(n => n.value === value);
  /* Keeps a "here" arrow above one node. */
  function here(s, x, y, label = 'here') {
    if (s.has('here')) s.set('here', { x, y: y - R - 2, text: label, opacity: 1 });
    else s.pointer('here', x, y - R - 2, label, { dir: 'down', tone: 'accent' });
  }
  const hideHere = s => { if (s.has('here')) s.set('here', { opacity: 0 }); };

  // ---------------------------------------------------------------- lesson 18.1
  const PARTS = {
    bushy: { text: 'A, B, C, D, E, F, G', say: 'a bushy tree' },
    gaps: { text: 'A, B, C, -, D, -, E', say: 'a tree with gaps' },
    line: { text: 'A, B, -, C, -, -, -, D', say: 'a tree shaped like a line' },
    one: { text: 'A', say: 'a tree with one node' },
    none: { text: '', say: 'an empty tree' },
  };
  Viz.register('m18-tree-parts', {
    title: 'The parts of a tree',
    size: [560, 288],
    inputs: [
      { key: 'shape', label: 'Shape', type: 'select', value: 'bushy', options: [
        { label: 'Bushy', value: 'bushy' },
        { label: 'With gaps', value: 'gaps' },
        { label: 'Like a line', value: 'line' },
        { label: 'One node', value: 'one' },
        { label: 'Empty', value: 'none' },
      ] },
    ],
    tryInputs: [{ shape: 'gaps' }, { shape: 'line' }, { shape: 'one' }, { shape: 'none' }, { shape: 'other' }],
    build(s, p) {
      const shape = PARTS[p.shape] || PARTS.bushy;
      const { root } = readTree(shape.text);
      const o = { top: 62, gap: 58, left: 60, wide: 500 };
      const vars = (extra) => Object.assign({ nodes: sizeOf(root) }, extra);
      if (!root) {
        s.text('empty', 280, 120, 'root is None', { size: 18, mono: true, weight: 700 });
        s.snap('An empty tree has no nodes. In code, it is the value None.', {
          vars: vars({ height: 0 }),
          ask: {
            q: 'An empty tree has no levels. What is its height?',
            options: ['0', '1', 'It has no height, so Python stops'],
            answer: 0,
            why: 'Height counts levels. No levels means a height of 0.',
          },
        });
        s.text('note', 280, 170, 'height 0', { size: 18, weight: 700 });
        s.snap('The height is 0. Good code handles this tree too.', { vars: vars({ height: 0 }) });
        return;
      }
      drawTree(s, root, o);
      const h = heightOf(root);
      const nodes = allNodes(root);
      for (let lv = 0; lv < h; lv++) s.text('lv' + lv, 8, o.top + lv * o.gap, `level ${lv + 1}`, { size: 13, anchor: 'start', tone: 'muted' });
      s.snap(`Here is ${shape.say}. Each circle is a node, and each arrow points down.`, { vars: vars() });

      s.tone(root.id, 'active');
      here(s, spot(0, o).x, spot(0, o).y, 'root');
      s.snap(`${root.value} is the root. It is the top node, and no arrow points at it.`, { vars: vars({ root: root.value }) });

      if (kidsOf(root).length) {
        s.tone(root.id, 'default');
        const kids = kidsOf(root);
        kids.forEach(k => s.tone(k.id, 'warn'));
        s.snap(`Arrows lead from ${root.value} to ${kids.map(k => k.value).join(' and ')}. ${root.value} is the parent, and ${kids.length === 1 ? 'that node is its child' : 'those are its children'}.`, { vars: vars({ root: root.value }) });
        kids.forEach(k => s.tone(k.id, 'default'));
      }

      const leaves = nodes.filter(isLeaf);
      hideHere(s);
      if (nodes.length > 1) {
        const wrong = nodes.length === leaves.length + 1 ? [nodes.length, 1] : [nodes.length, leaves.length - 1 || leaves.length + 1];
        const c = choices(leaves.length, wrong);
        askOnLast(s, {
          q: 'A leaf is a node with no children. How many leaves can you see?',
          options: c.options, answer: c.answer,
          why: `${leaves.map(l => l.value).join(', ')} have no arrows going down. That makes ${leaves.length}.`,
        });
      }
      leaves.forEach(l => s.set(l.id, { tone: 'ok', sub: 'leaf' }));
      s.snap(leaves.length === 1 && nodes.length === 1
        ? `${root.value} has no children, so it is a leaf as well as the root.`
        : `Leaves have no children, so their arrows are None.`, { vars: vars({ leaves: leaves.length }) });

      const c = choices(h, [nodes.length, h + 1, Math.max(1, h - 1)].filter(x => x !== h));
      askOnLast(s, {
        q: 'Height counts the levels from the root down. What is the height?',
        options: c.options, answer: c.answer,
        why: `The labels show ${many(h, 'level')}. Height counts levels, not nodes.`,
      });
      s.text('hLbl', 552, 20, `height ${h}`, { size: 16, anchor: 'end', weight: 700 });
      s.snap(h === nodes.length && h > 1
        ? `Height ${h}, with ${many(nodes.length, 'node')}. Only this line shape has height equal to its nodes.`
        : `Height ${h}, with ${many(nodes.length, 'node')}. Now pick another shape above.`, { vars: vars({ leaves: leaves.length, height: h }) });
    },
  });

  Viz.register('m18-tree-build', {
    title: 'Build a tree, one arrow at a time',
    size: [560, 230],
    code: py`
      class TreeNode:
          def __init__(self, value):
              self.value = value
              self.left = None
              self.right = None

      root = TreeNode("A")
      root.left = TreeNode("B")
      root.right = TreeNode("C")
      root.left.right = TreeNode("D")
      print(root.left.right.value)
    `,
    build(s) {
      const o = { top: 50, gap: 66 };
      const A = { id: 'tnA', value: 'A', left: null, right: null };
      const B = { id: 'tnB', value: 'B', left: null, right: null };
      const C = { id: 'tnC', value: 'C', left: null, right: null };
      const D = { id: 'tnD', value: 'D', left: null, right: null };
      s.snap('The class is a plan. Each node holds a value and 2 arrows, left and right.', { line: 2 });
      drawTree(s, A, o);
      s.snap('root gets a new node. Its left and right both start as None.', { line: 7, vars: { 'root.left': 'None', 'root.right': 'None' } });
      A.left = B;
      drawTree(s, A, o);
      s.tone('tnB', 'active');
      s.snap('root.left now points at a new node, B.', { line: 8, vars: { 'root.left': 'B', 'root.right': 'None' } });
      A.right = C;
      s.tone('tnB', 'default');
      drawTree(s, A, o);
      s.tone('tnC', 'active');
      s.snap('root.right points at C. A now has 2 children.', {
        line: 9, vars: { 'root.left': 'B', 'root.right': 'C' },
        ask: {
          q: 'The next line is root.left.right = TreeNode("D"). Where does D go?',
          options: ['Under C, on its right', 'Under B, on its right', 'Under A, in place of C'],
          answer: 1,
          why: 'Read it from the left. Start at root, take the left arrow to B, then fill its right arrow.',
        },
      });
      B.right = D;
      s.tone('tnC', 'default');
      drawTree(s, A, o);
      s.tone('tnD', 'active');
      s.snap('D hangs on the right of B. The left of B is still None.', { line: 10, vars: { 'root.left': 'B', 'root.right': 'C' } });
      s.tone('tnD', 'default');
      s.tone('tnA', 'warn');
      s.snap('Now print follows the arrows. It starts at root, which is A.', { line: 11, vars: { at: 'root' } });
      s.tone('tnA', 'default');
      s.tone('tnB', 'warn');
      s.snap('.left takes it to B.', { line: 11, vars: { at: 'root.left' } });
      s.tone('tnB', 'default');
      s.tone('tnD', 'ok');
      s.snap('.right takes it to D, and .value reads the letter.', { line: 11, vars: { at: 'root.left.right' }, out: 'D' });
    },
  });

  // ---------------------------------------------------------------- lesson 18.2
  const ORDERS = {
    pre: { name: 'Preorder', line: 4, why: v => `Preorder visits a node before its sides, and left goes first. So ${v} is next.`, end: 'first' },
    in: { name: 'Inorder', line: 6, why: v => `Inorder finishes the left side, then visits the node. So ${v} is next.`, end: 'after its left side and before its right' },
    post: { name: 'Postorder', line: 8, why: v => `Postorder finishes both sides, then visits the node. So ${v} is next.`, end: 'last' },
  };
  Viz.register('m18-traverse', {
    title: 'Three walks, one tree',
    size: [560, 346],
    code: py`
      def walk(node):
          if node is None:
              return
          # preorder: visit node here
          walk(node.left)
          # inorder: visit node here
          walk(node.right)
          # postorder: visit node here
    `,
    inputs: [
      { key: 'order', label: 'Walk', type: 'select', value: 'pre', options: [
        { label: 'Preorder', value: 'pre' },
        { label: 'Inorder', value: 'in' },
        { label: 'Postorder', value: 'post' },
      ] },
      { key: 'tree', label: 'Tree, level by level (- is a gap)', type: 'text', value: 'A, B, C, D, E, F, G', size: 22 },
    ],
    tryInputs: [
      { order: 'pre', tree: '' }, { order: 'in', tree: '' }, { order: 'post', tree: '' },
      { order: 'pre', tree: 'A' }, { order: 'in', tree: 'A' }, { order: 'post', tree: 'A' },
      { order: 'pre', tree: 'A, A, A, A' }, { order: 'in', tree: '2, 2, 2' }, { order: 'post', tree: 'A, A' },
      { order: 'in', tree: 'A, B, -, C, -, -, -, D' }, { order: 'post', tree: 'A, -, B, -, -, -, C' },
      { order: 'pre', tree: 'A, B, C, D, E, F, G, H, I, J, K, L, M, N, O' }, { order: 'in', tree: 'A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q' },
      { order: 'post', tree: '-, B, C' }, { order: 'other', tree: '!!, ??, A' }, { order: 'pre', tree: 'hello, big, A' },
    ],
    build(s, p) {
      const order = ORDERS[p.order] ? p.order : 'pre';
      const info = ORDERS[order];
      const { root, skipped } = readTree(p.tree);
      const o = { top: 62, gap: 58 };
      if (!root) {
        s.text('empty', 280, 100, 'walk(None)', { size: 18, mono: true, weight: 700 });
        s.snap(`This tree is empty. So the first call gets None.${skipNote(skipped)}`, {
          line: 2, vars: { node: 'None', visits: 0 },
          ask: {
            q: 'The call gets None. What does it visit?',
            options: ['Nothing, it returns at once', 'The root', 'Python stops with an error'],
            answer: 0,
            why: 'The if on line 2 catches None and returns. That is the base case.',
          },
        });
        s.text('none', 280, 150, 'No visits.', { size: 18, weight: 700 });
        s.snap('Line 3 returns, so nothing gets visited. No error happens.', { line: 3, vars: { node: 'None', visits: 0 } });
        return;
      }
      drawTree(s, root, o);
      const seq = {};
      for (const k of ['pre', 'in', 'post']) seq[k] = walkOrder(root, k);
      const total = seq.pre.length;
      s.text('rowLbl', 20, 296, 'Visit order:', { size: 14, anchor: 'start', weight: 700 });
      s.snap(`Now try ${info.name.toLowerCase()}. walk starts at the root and keeps its place on the pile.${skipNote(skipped)}`, { line: 1, vars: { node: root.value, visits: 0 } });

      let k = 0;
      const seen = new Set();
      const visit = (n, say) => {
        const left = seq[order].filter(x => !seen.has(x));
        const nextOther = ['pre', 'in', 'post'].filter(x => x !== order).map(x => seq[x].find(y => !seen.has(y)));
        if (k % 3 !== 1 && left.length >= 2) {
          const c = choices(n.value, [...new Set([...nextOther, ...left].map(x => x.value))].filter(v => v !== n.value).slice(0, 2));
          if (c.options.length >= 2) {
            askOnLast(s, {
              q: k === 0 ? `${info.name}: which node gets the first visit?` : `${info.name}: which node gets the next visit?`,
              options: c.options, answer: c.answer, why: info.why(n.value),
            });
          }
        }
        seen.add(n);
        k += 1;
        s.tone(n.id, 'ok');
        s.set(n.id, { sub: String(k), pulse: true });
        const pt = spot(n.slot, o);
        here(s, pt.x, pt.y);
        s.box('v' + k, rowX(k - 1, total), 324, n.value, { w: 34, h: 34, size: rowSize(n.value), tone: 'ok' });
        s.snap(say, { line: info.line, vars: { node: n.value, visits: k } });
      };
      const go = n => {
        const pt = spot(n.slot, o);
        if (order === 'pre') {
          visit(n, `walk arrives at ${n.value} and visits it right away.`);
        } else if (order === 'in') {
          if (n.left) {
            here(s, pt.x, pt.y);
            s.snap(`walk arrives at ${n.value}. It must finish the left side first.`, { line: 5, vars: { node: n.value, visits: k } });
            go(n.left);
            visit(n, `The left side of ${n.value} is done. So ${n.value} gets its visit.`);
          } else {
            visit(n, `${n.value} has no left child. So ${n.value} gets its visit now.`);
          }
        } else if (!isLeaf(n)) {
          here(s, pt.x, pt.y);
          s.snap(`walk arrives at ${n.value}. It must finish both sides first.`, { line: n.left ? 5 : 7, vars: { node: n.value, visits: k } });
        }
        if (order === 'pre') { if (n.left) go(n.left); }
        if (order === 'post' && n.left) go(n.left);
        if (n.right) go(n.right);
        if (order === 'post') {
          visit(n, isLeaf(n) ? `${n.value} has no children. So ${n.value} gets its visit now.` : `Both sides of ${n.value} are done. So ${n.value} gets its visit.`);
        }
      };
      go(root);
      hideHere(s);
      s.tone(root.id, 'warn');
      s.snap(`Done: ${many(total, 'visit')}, one per node. In ${info.name.toLowerCase()}, the root comes ${total === 1 ? 'alone' : info.end}.`, { line: 1, vars: { visits: k } });
    },
  });

  // ---------------------------------------------------------------- lesson 18.3
  /* Level order and its deep-first twin share one picture. Only the taking end differs. */
  function buildLine(s, p, kind) {
    const fifo = kind === 'line';
    const { root, skipped } = readTree(p.tree);
    const o = { top: 44, gap: 58 };
    const noun = fifo ? 'line' : 'pile';
    const L = { take: 6, print: 7, testL: 8, addL: 9, testR: 10, addR: 11 };
    if (!root) {
      s.text('empty', 280, 90, 'root is None', { size: 18, mono: true, weight: 700 });
      s.snap(`This tree is empty, so nothing joins the ${noun}.${skipNote(skipped)}`, {
        line: 3, vars: { [`in ${noun}`]: 0 },
        ask: {
          q: `The ${noun} is empty at line 5. What does the while loop do?`,
          options: ['It stops before its first trip', 'It takes from an empty line and stops with an error', 'It runs forever'],
          answer: 0,
          why: 'The length is 0, so the loop test is False. That is why line 3 checks for None.',
        },
      });
      s.text('none', 280, 140, 'No visits.', { size: 18, weight: 700 });
      s.snap('The loop never runs, so nothing gets visited. No error happens.', { line: 5, vars: { [`in ${noun}`]: 0 } });
      return;
    }
    drawTree(s, root, o);
    const total = sizeOf(root);
    const Y1 = 298, Y2 = 368;
    const slotX = i => 26 + i * 36;
    s.text('qLbl', 16, 272, fifo ? 'The line: new ones join at the right' : 'The pile: the top is at the right', { size: 14, anchor: 'start', weight: 700 });
    s.text('vLbl', 16, 342, 'Visit order:', { size: 14, anchor: 'start', weight: 700 });
    const line = [];
    let arrivals = 0, k = 0, widest = 0;
    const seen = new Set();
    const vars = n => ({ node: n ? n.value : '-', [`in ${noun}`]: line.length, 'most so far': widest });
    const join = (n, ln, say, ask) => {
      const x = slotX(fifo ? arrivals : line.length);
      arrivals += 1;
      line.push(n);
      widest = Math.max(widest, line.length);
      s.box('q' + n.slot, x, Y1, n.value, { w: 34, h: 34, size: rowSize(n.value), tone: 'warn' });
      markEnd();
      s.tone(n.id, 'warn');
      s.snap(say, { line: ln, vars: vars(null), ask });
    };
    const lbl = fifo ? 'front' : 'top';
    const markEnd = () => {
      const n = fifo ? line[0] : line[line.length - 1];
      if (!n) { s.del('endLbl'); return; }
      const x = s.get('q' + n.slot).x;
      if (s.has('endLbl')) s.set('endLbl', { x }); else s.text('endLbl', x, Y1 + 26, lbl, { size: 12, weight: 700 });
    };
    join(root, 4, `${root.value} joins the ${noun} first. It is the only one waiting.${skipNote(skipped)}`);
    markEnd();
    s.snap(`The loop runs while the ${noun} has someone in it.`, { line: 5, vars: vars(null) });
    let round = 0;
    while (line.length) {
      round += 1;
      const n = fifo ? line[0] : line[line.length - 1];
      if (line.length >= 2) {
        const end = fifo ? line[line.length - 1] : line[0];
        const c = choices(n.value, [end.value, ...line.map(x => x.value)].filter(v => v !== n.value).slice(0, 2));
        if (c.options.length >= 2 && round % 2 === 0) {
          askOnLast(s, {
            q: `Who leaves the ${noun} next?`,
            options: c.options, answer: c.answer,
            why: fifo ? `popleft takes the front. ${n.value} has waited longest.` : `pop takes the top. ${n.value} joined last.`,
          });
        }
      }
      if (fifo) line.shift(); else line.pop();
      seen.add(n);
      k += 1;
      s.set('q' + n.slot, { x: slotX(k - 1), y: Y2, tone: 'ok' });
      s.tone(n.id, 'ok');
      s.set(n.id, { sub: String(k) });
      markEnd();
      s.snap(`${fifo ? 'popleft takes the front' : 'pop takes the top'}. ${n.value} leaves and gets visit ${k}.`, { line: L.print, vars: vars(n) });
      if (round === 1 && kidsOf(n).length) {
        const kids = kidsOf(n).map(x => x.value);
        const right = kids.join(' then ');
        const others = kids.length === 2 ? [`${kids[1]} then ${kids[0]}`, 'Nobody'] : ['Nobody', `${kids[0]} and ${n.value}`];
        const c = choices(right, others);
        askOnLast(s, {
          q: `${n.value} has left. Who joins the ${noun} now?`,
          options: c.options, answer: c.answer,
          why: `The children of ${n.value} join, left child first. Their own children must wait.`,
        });
      }
      if (n.left) join(n.left, L.addL, `${n.left.value} is the left child of ${n.value}, so it joins.`);
      if (n.right) join(n.right, L.addR, `${n.right.value} is the right child of ${n.value}, so it joins.`);
      markEnd();
    }
    s.snap(fifo
      ? `The line is empty, so the loop ends. ${many(total, 'visit')}, level by level. The line held ${widest} at most.`
      : `The pile is empty, so the loop ends. It went deep on one side first, not level by level.`,
    { line: 5, vars: vars(null) });
  }
  const TREE_TRIES = [
    { tree: '' }, { tree: 'A' }, { tree: 'A, B' }, { tree: 'A, -, B' }, { tree: 'A, A, A, A' },
    { tree: 'A, B, -, C, -, -, -, D' }, { tree: 'A, B, C, D, E, F, G, H, I, J, K, L, M, N, O' }, { tree: '!!, ??' }, { tree: '-, A' },
  ];
  const TREE_INPUT = (value = 'A, B, C, D, E, F, G') => ({ key: 'tree', label: 'Tree, level by level (- is a gap)', type: 'text', value, size: 22 });
  const LINE_SIZE = [560, 390];
  const lineCode = take => [
    'def level_order(root):',
    '    line = deque()',
    '    if root is not None:',
    '        line.append(root)',
    '    while len(line) > 0:',
    `        node = line.${take}()`,
    '        print(node.value)',
    '        if node.left is not None:',
    '            line.append(node.left)',
    '        if node.right is not None:',
    '            line.append(node.right)',
  ].join('\n');
  Viz.register('m18-bfs', {
    title: 'Level order: the line decides who is next',
    size: LINE_SIZE,
    code: lineCode('popleft'),
    inputs: [TREE_INPUT()],
    tryInputs: TREE_TRIES,
    build(s, p) { buildLine(s, p, 'line'); },
  });
  Viz.register('m18-pile-walk', {
    title: 'Change one word: pop in place of popleft',
    size: LINE_SIZE,
    code: lineCode('pop'),
    inputs: [TREE_INPUT()],
    tryInputs: TREE_TRIES,
    build(s, p) { buildLine(s, p, 'pile'); },
  });

  // ---------------------------------------------------------------- lesson 18.4
  /* Each node asks its 2 sides, then joins the answers. The answers travel up the tree. */
  function buildAsk(s, p, job) {
    const fn = job.fn;
    const { root, skipped } = readTree(p.tree);
    const o = { top: 62, gap: 60 };
    if (!root) {
      s.text('empty', 280, 90, `${fn}(None)`, { size: 18, mono: true, weight: 700 });
      s.snap(`This tree is empty, so the first call gets None.${skipNote(skipped)}`, {
        line: 2, vars: { node: 'None' },
        ask: {
          q: `What does ${fn}(None) return?`,
          options: ['0', '1', 'An error'],
          answer: 0,
          why: 'An empty tree has no nodes and no levels. Line 3 returns 0.',
        },
      });
      s.text('ans', 280, 140, 'returns 0', { size: 18, weight: 700 });
      s.snap('Line 3 returns 0. The base case answers this one alone.', { line: 3, vars: { node: 'None' }, out: '0' });
      return;
    }
    drawTree(s, root, o);
    let calls = 0, firstLeaf = true, asks = 0;
    s.snap(`${fn}(${root.value}) starts at the root. No node knows its answer yet.${skipNote(skipped)}`, { line: 1, vars: { node: root.value } });
    const go = n => {
      calls += 1;
      const pt = spot(n.slot, o);
      if (isLeaf(n)) {
        if (firstLeaf) {
          firstLeaf = false;
          const c = choices(1, [0, 2]);
          askOnLast(s, {
            q: `${n.value} has no children. Both its calls get None, and None returns 0. What does ${n.value} return?`,
            options: c.options, answer: c.answer,
            why: job.leafWhy,
          });
        }
        here(s, pt.x, pt.y);
        s.tone(n.id, 'ok');
        s.set(n.id, { sub: '= 1' });
        n.answer = 1;
        s.snap(`${n.value} hears 0 and 0, because both children are None. So it says 1.`, { line: 6, vars: { node: n.value, left: 0, right: 0 } });
        return 1;
      }
      here(s, pt.x, pt.y);
      s.tone(n.id, 'active');
      s.snap(`${fn}(${n.value}) must wait for its 2 sides.`, { line: n.left ? 4 : 5, vars: { node: n.value } });
      const a = n.left ? go(n.left) : 0;
      const b = n.right ? go(n.right) : 0;
      const ans = job.join(a, b);
      if (asks % 2 === 0 || n === root) {
        const c = choices(ans, job.wrongs(a, b, ans));
        askOnLast(s, {
          q: `${n.value} hears ${a} from the left and ${b} from the right. What does it return?`,
          options: c.options, answer: c.answer,
          why: job.why(a, b, ans),
        });
      }
      asks += 1;
      here(s, pt.x, pt.y);
      s.tone(n.id, 'ok');
      s.set(n.id, { sub: `= ${ans}` });
      n.answer = ans;
      s.snap(job.say(n.value, a, b, ans), { line: 6, vars: { node: n.value, left: a, right: b } });
      return ans;
    };
    const ans = go(root);
    hideHere(s);
    s.snap(`The root hands back ${ans}. It took ${many(calls, 'node call')}, and every node answered once.`, { line: 8, vars: { [fn]: ans }, out: String(ans) });
  }
  const ASK_SIZE = [560, 292];
  Viz.register('m18-count', {
    title: 'Count the nodes: ask left, ask right, add yourself',
    size: ASK_SIZE,
    code: py`
      def count(node):
          if node is None:
              return 0
          left = count(node.left)
          right = count(node.right)
          return 1 + left + right

      print(count(root))
    `,
    inputs: [TREE_INPUT()],
    tryInputs: TREE_TRIES,
    build(s, p) {
      buildAsk(s, p, {
        fn: 'count',
        join: (a, b) => 1 + a + b,
        leafWhy: 'It adds 1 for itself to 0 and 0. So it returns 1.',
        wrongs: (a, b, x) => [a + b, x + 1, Math.max(a, b) + 1].filter(v => v !== x),
        why: (a, b, x) => `It adds itself to both sides: 1 + ${a} + ${b} is ${x}.`,
        say: (v, a, b, x) => `${v} says 1 + ${a} + ${b}, which is ${x}.`,
      });
    },
  });
  Viz.register('m18-height', {
    title: 'Find the height: take the taller side, add 1',
    size: ASK_SIZE,
    code: py`
      def height(node):
          if node is None:
              return 0
          left = height(node.left)
          right = height(node.right)
          return 1 + max(left, right)

      print(height(root))
    `,
    inputs: [TREE_INPUT('A, B, C, D, -, -, -, E')],
    tryInputs: TREE_TRIES,
    build(s, p) {
      buildAsk(s, p, {
        fn: 'height',
        join: (a, b) => 1 + Math.max(a, b),
        leafWhy: 'It takes the taller side, which is 0, and adds 1 for its own level.',
        wrongs: (a, b, x) => [1 + a + b, x - 1 || x + 1, Math.max(a, b)].filter(v => v !== x),
        why: (a, b, x) => `Only the taller side counts, since levels sit side by side: 1 + ${Math.max(a, b)} is ${x}.`,
        say: (v, a, b, x) => `${v} takes the taller of ${a} and ${b}, then adds 1. It says ${x}.`,
      });
    },
  });

  Viz.register('m18-mirror', {
    title: 'Mirror a tree: every node swaps its 2 sides',
    size: [560, 264],
    code: py`
      def mirror(node):
          if node is None:
              return
          node.left, node.right = node.right, node.left
          mirror(node.left)
          mirror(node.right)
    `,
    inputs: [TREE_INPUT('A, B, C, D, -, -, E')],
    tryInputs: TREE_TRIES,
    build(s, p) {
      const { root, skipped } = readTree(p.tree);
      const o = { top: 62, gap: 58 };
      if (!root) {
        s.text('empty', 280, 90, 'mirror(None)', { size: 18, mono: true, weight: 700 });
        s.snap(`This tree is empty, so there is nothing to swap.${skipNote(skipped)}`, {
          line: 2, vars: { node: 'None' },
          ask: {
            q: 'The call gets None. What happens?',
            options: ['It returns, and nothing changes', 'It swaps None with None, then stops with an error'],
            answer: 0,
            why: 'Line 2 catches None before line 4 can run. So no swap happens.',
          },
        });
        s.text('none', 280, 140, 'Still empty.', { size: 18, weight: 700 });
        s.snap('The mirror of an empty tree is an empty tree.', { line: 3, vars: { node: 'None' } });
        return;
      }
      drawTree(s, root, o);
      s.snap(`Each swap moves whole sides, not only the 2 children.${skipNote(skipped)}`, { line: 1, vars: { node: root.value, swaps: 0 } });
      let swaps = 0;
      const before = walkOrder(root, 'pre').length;
      const go = n => {
        if (isLeaf(n)) return;
        const L = n.left ? n.left.value : 'None', Rr = n.right ? n.right.value : 'None';
        s.clearTones();
        s.tone(n.id, 'active');
        const pt = spot(n.slot, o);
        here(s, pt.x, pt.y);
        const q = swaps % 2 === 0 ? (() => {
          const c = choices(Rr, [L, n.value]);
          return { q: `${n.value} has ${L} on the left and ${Rr} on the right. After line 4, what is on its left?`, options: c.options, answer: c.answer, why: `Line 4 swaps them. So ${Rr} moves to the left.` };
        })() : null;
        s.snap(`mirror(${n.value}) runs. Its left is ${L}, and its right is ${Rr}.`, { line: 1, vars: { node: n.value, swaps }, ask: q });
        [n.left, n.right] = [n.right, n.left];
        swaps += 1;
        drawTree(s, root, o);
        const p2 = spot(n.slot, o);
        here(s, p2.x, p2.y);
        s.snap(`Line 4 swaps the arrows of ${n.value}. Everything below them moves too.`, { line: 4, vars: { node: n.value, swaps } });
        if (n.left) go(n.left);
        if (n.right) go(n.right);
      };
      go(root);
      s.clearTones();
      hideHere(s);
      s.snap(swaps === 0
        ? 'One node has no sides to swap. A tree of one node is its own mirror.'
        : `Done, after ${many(swaps, 'swap')}. Run mirror again, and you get the first tree back.`, { line: 1, vars: { nodes: before, swaps } });
    },
  });

  Viz.register('m18-same', {
    title: 'Same tree? Walk both at once',
    size: [560, 240],
    code: py`
      def same(a, b):
          if a is None and b is None:
              return True
          if a is None or b is None:
              return False
          if a.value != b.value:
              return False
          left_ok = same(a.left, b.left)
          return left_ok and same(a.right, b.right)
    `,
    inputs: [
      { key: 'a', label: 'Tree a', type: 'text', value: '1, 2, 3', size: 14 },
      { key: 'b', label: 'Tree b', type: 'text', value: '1, 2, -, 3', size: 14 },
    ],
    tryInputs: [
      { a: '', b: '' }, { a: '1', b: '' }, { a: '', b: '1' }, { a: '1', b: '1' }, { a: '1, 2', b: '1, -, 2' },
      { a: '1, 2, 3', b: '1, 2, 3' }, { a: '1, 2, 3', b: '1, 3, 2' }, { a: '1, 1, 1', b: '1, 1, 1' }, { a: '!!', b: '??' },
      { a: '1, 2, 3, 4, 5, 6, 7', b: '1, 2, 3, 4, 5, 6, 7' }, { a: '1, 2, 3, 4, 5, 6, 7, 8, 9', b: '1' },
    ],
    build(s, p) {
      const ta = readTree(p.a, 7), tb = readTree(p.b, 7);
      const oa = { top: 62, gap: 58, left: 0, wide: 280, levels: 3, prefix: 'a' };
      const ob = { top: 62, gap: 58, left: 280, wide: 280, levels: 3, prefix: 'b' };
      drawTree(s, ta.root, oa);
      drawTree(s, tb.root, ob);
      s.text('la', 140, 14, ta.root ? 'tree a' : 'tree a is empty', { size: 14, weight: 700 });
      s.text('lb', 420, 14, tb.root ? 'tree b' : 'tree b is empty', { size: 14, weight: 700 });
      s.box('split', 280, 124, '', { w: 2, h: 200, tone: 'muted' });
      const note = skipNote(ta.skipped + tb.skipped);
      let checks = 0, asked = 0, failLine = 7;
      s.snap(`Walk both trees together. Each call looks at one spot in each tree.${note}`, { line: 1, vars: { checks } });
      const v = n => (n ? n.value : 'None');
      const go = (a, b, slot) => {
        checks += 1;
        if (!a && !b) return true;
        s.clearTones(['split']);
        if (a) s.tone('a' + a.id, 'active');
        if (b) s.tone('b' + b.id, 'active');
        const vars = { 'a is': v(a), 'b is': v(b), checks };
        if (!a || !b) {
          failLine = 5;
          const gap = spot(slot, a ? ob : oa);
          if (gap.d < 3) s.text('nil', gap.x, gap.y, 'None', { size: 14, mono: true, weight: 700 });
          s.snap(`One side has ${v(a || b)}, and the other side has None here.`, {
            line: 4, vars,
            ask: { q: 'One spot holds a node, and the other holds None. What does this call return?', options: ['True', 'False'], answer: 1, why: 'A node on one side and None on the other means the shapes differ.' },
          });
          return false;
        }
        const eq = a.value === b.value;
        let ask = null;
        if (!eq || asked === 0) {
          asked += 1;
          ask = { q: `The values are ${a.value} and ${b.value}. Does this call go on, or return False?`, options: ['It goes on to the sides', 'It returns False'], answer: eq ? 0 : 1, why: eq ? 'The values match, so the sides must be checked next.' : 'Different values mean different trees. No more checks are needed.' };
        }
        s.snap(`Compare ${a.value} with ${b.value}.`, { line: 6, vars, ask });
        if (!eq) return false;
        s.tone('a' + a.id, 'ok');
        s.tone('b' + b.id, 'ok');
        if (!go(a.left, b.left, 2 * slot + 1)) return false;
        return go(a.right, b.right, 2 * slot + 2);
      };
      const ans = go(ta.root, tb.root, 0);
      if (ans) {
        for (const n of allNodes(ta.root)) s.tone('a' + n.id, 'ok');
        for (const n of allNodes(tb.root)) s.tone('b' + n.id, 'ok');
      }
      s.snap(ans
        ? `Same tree: every value and every arrow matches. It took ${many(checks, 'call')}.`
        : `Not the same. It stopped early, after ${many(checks, 'call')}. Now try your own trees.`, { line: ans ? 9 : failLine, vars: { same: ans ? 'True' : 'False', checks } });
    },
  });

  // ---------------------------------------------------------------- lesson 18.5
  /* A binary search tree made of plain objects. Repeats are left out, as in the Python code. */
  function bstInsert(root, value, id) {
    const path = [];
    if (!root) return { root: { id, value, left: null, right: null }, path, added: true, depth: 0 };
    let n = root;
    for (;;) {
      path.push(n);
      if (value === n.value) return { root, path, added: false, depth: path.length - 1 };
      const side = value < n.value ? 'left' : 'right';
      if (!n[side]) {
        n[side] = { id, value, left: null, right: null };
        return { root, path, added: true, depth: path.length, under: n, side };
      }
      n = n[side];
    }
  }
  /* Builds a tree that fits the stage. Numbers that would land too deep are left out. */
  function fitBst(nums) {
    let root = null, left = 0;
    nums.forEach((v, i) => {
      const r = bstInsert(root, v, 'tn' + i);
      root = r.root;
      if (r.added && r.depth >= MAX_LEVEL) { r.under[r.side] = null; left += 1; }
    });
    return { root, left };
  }
  const TOO_DEEP = n => (n ? ` ${many(n, 'number')} would land too deep to draw, so we left ${n === 1 ? 'it' : 'them'} out.` : '');

  Viz.register('m18-bst-search', {
    title: 'Search a binary search tree',
    size: [560, 272],
    code: py`
      def find(node, target):
          while node is not None:
              if target == node.value:
                  return True
              if target < node.value:
                  node = node.left
              else:
                  node = node.right
          return False

      print(find(root, target))
    `,
    inputs: [
      { key: 'order', label: 'Insert order', type: 'text', value: '50, 30, 70, 20, 40, 60, 80', size: 20 },
      { key: 'target', label: 'Target', type: 'number', value: 40, min: -99, max: 999 },
    ],
    tryInputs: [
      { order: '', target: 5 }, { order: '5', target: 5 }, { order: '5', target: 3 }, { order: '5', target: 8 },
      { order: '5, 5, 5', target: 5 }, { order: '1, 2, 3, 4, 5, 6, 7', target: 7 }, { order: '1, 2, 3, 4', target: 4 }, { order: '4, 3, 2, 1', target: 0 },
      { order: 'a, b, !!', target: 1 }, { order: '50, 30, 70', target: '' }, { order: '50, 30, 70, 20, 40, 60, 80', target: 45 },
    ],
    build(s, p) {
      const { nums, skipped } = readNums(p.order, 7);
      const target = whole(p.target, -99, 999, 40);
      const { root, left } = fitBst(nums);
      const o = { top: 62, gap: 58 };
      drawTree(s, root, o);
      const note = skipNote(skipped) + TOO_DEEP(left);
      if (!root) {
        s.text('empty', 280, 90, 'root is None', { size: 18, mono: true, weight: 700 });
        s.snap(`This tree is empty.${note}`, {
          line: 2, vars: { target, compares: 0 },
          ask: { q: `The tree is empty. What does find return?`, options: ['False', 'True', 'An error'], answer: 0, why: 'node starts as None, so the loop never runs. Line 9 returns False.' },
        });
        s.text('ans', 280, 140, 'Not found', { size: 18, weight: 700 });
        s.snap('The loop never runs, so find returns False after 0 compares.', { line: 9, vars: { target, compares: 0 }, out: 'False' });
        return;
      }
      let compares = 0, n = root, slot = 0, ruled = 0;
      s.snap(`Search for ${target}. Start at the root, and compare.${note}`, { line: 1, vars: { target, compares } });
      for (;;) {
        const pt = spot(slot, o);
        here(s, pt.x, pt.y);
        s.tone(n.id, 'active');
        compares += 1;
        const hit = target === n.value;
        const goLeft = target < n.value;
        s.snap(`This node holds ${n.value}. Compare it with ${target}.`, {
          line: 3, vars: { target, compares, 'ruled out': ruled },
          ask: {
            q: `The target is ${target}, and this node holds ${n.value}. What happens next?`,
            options: ['Go left', 'Go right', 'Stop, it is found'],
            answer: hit ? 2 : goLeft ? 0 : 1,
            why: hit ? `${target} equals ${n.value}, so the search ends.` : `${target} is ${goLeft ? 'smaller' : 'bigger'} than ${n.value}. Everything on the ${goLeft ? 'right' : 'left'} is too ${goLeft ? 'big' : 'small'}.`,
          },
        });
        if (hit) {
          s.tone(n.id, 'ok');
          hideHere(s);
          s.snap(`Found ${target}, after ${many(compares, 'compare')}. The tree has ${many(sizeOf(root), 'node')}.`, { line: 4, vars: { target, compares, 'ruled out': ruled }, out: 'True' });
          return;
        }
        const drop = goLeft ? n.right : n.left;
        s.set(n.id, { tone: 'muted', scale: 0.78 });
        allNodes(drop).forEach(x => s.set(x.id, { tone: 'muted', scale: 0.78 }));
        ruled += 1 + sizeOf(drop);
        const next = goLeft ? n.left : n.right;
        const nextSlot = goLeft ? 2 * slot + 1 : 2 * slot + 2;
        const dropText = sizeOf(drop) ? ` That rules out ${sizeOf(drop)} more.` : '';
        if (next) {
          s.snap(`Go ${goLeft ? 'left' : 'right'}.${dropText}`, { line: goLeft ? 6 : 8, vars: { target, compares, 'ruled out': ruled } });
          n = next; slot = nextSlot;
          continue;
        }
        const end = spot(nextSlot, o);
        s.text('gone', end.d < MAX_LEVEL ? end.x : pt.x + (pt.x > 280 ? -50 : 50), end.d < MAX_LEVEL ? end.y : pt.y, 'None', { size: 14, mono: true, weight: 700 });
        hideHere(s);
        s.snap(`Go ${goLeft ? 'left' : 'right'}, but that arrow is None.${dropText}`, { line: goLeft ? 6 : 8, vars: { target, compares, 'ruled out': ruled } });
        s.snap(`${target} is not in this tree. The search took ${many(compares, 'compare')}.`, { line: 9, vars: { target, compares, 'ruled out': ruled }, out: 'False' });
        return;
      }
    },
  });

  Viz.register('m18-bst-insert', {
    title: 'Grow a tree in the order you type',
    size: [560, 296],
    code: py`
      def insert(node, value):
          if node is None:
              return TreeNode(value)
          if value < node.value:
              node.left = insert(node.left, value)
          elif value > node.value:
              node.right = insert(node.right, value)
          return node
    `,
    inputs: [
      { key: 'order', label: 'Insert order (up to 7)', type: 'text', value: '4, 2, 6, 1, 3', size: 20 },
    ],
    tryInputs: [
      { order: '' }, { order: '5' }, { order: '5, 5, 5' }, { order: '1, 2, 3, 4' }, { order: '1, 2, 3, 4, 5, 6, 7' }, { order: '7, 6, 5, 4, 3, 2, 1' },
      { order: '4, 2, 6, 1, 3, 5, 7' }, { order: '1, 7, 2, 6, 3, 5, 4' }, { order: 'cat, 3, !!, 2' }, { order: '1, 2, 3, 4, 5, 6, 7, 8, 9' }, { order: '-99, 999, 0' },
    ],
    build(s, p) {
      const { nums, skipped } = readNums(p.order, 7);
      const o = { top: 62, gap: 58 };
      let compares = 0, count = 0;
      if (!nums.length) {
        s.text('empty', 280, 90, 'root is None', { size: 18, mono: true, weight: 700 });
        s.snap(`There are no numbers, so the tree stays empty.${skipNote(skipped)} Type some above.`, { line: 2, vars: { compares: 0, height: 0 } });
        return;
      }
      let root = null;
      const deep = [];
      const showDeep = () => {
        const t = `Too deep to draw: ${deep.join(', ')}`;
        if (s.has('deep')) s.set('deep', { text: t }); else s.text('deep', 280, 278, t, { size: 14, weight: 700 });
      };
      const vars = extra => Object.assign({ compares, height: heightOf(root) }, extra);
      s.text('newLbl', 42, 18, 'new', { size: 13, weight: 700 });
      s.snap(`Numbers go in one at a time, in your order: ${nums.join(', ')}.${skipNote(skipped)}`, { line: 1, vars: vars() });
      nums.forEach((v, i) => {
        const id = 'tn' + i;
        const peek = bstInsert(JSON.parse(JSON.stringify(root)), v, id);
        const deepNow = peek.added && peek.depth >= MAX_LEVEL;
        if (!deepNow) {
          s.circle(id, 42, 46, v, { r: R, size: String(v).length > 2 ? 16 : 19, tone: 'accent' });
        }
        if (root && !deepNow) {
          let n = root, slot = 0, first = true;
          for (;;) {
            const pt = spot(slot, o);
            here(s, pt.x, pt.y);
            s.clearTones([id]);
            s.tone(n.id, 'active');
            compares += 1;
            const same = v === n.value, goLeft = v < n.value;
            s.snap(first ? `The next number is ${v}. Compare it with ${n.value}.` : `Compare ${v} with ${n.value}.`, {
              line: 4, vars: vars({ value: v }),
              ask: compares % 2 === 1 ? {
                q: `The new number is ${v}, and this node holds ${n.value}. What happens?`,
                options: ['Go left', 'Go right', 'Stop, it is already here'],
                answer: same ? 2 : goLeft ? 0 : 1,
                why: same ? `${v} is already in the tree. The code leaves it out.` : `${v} is ${goLeft ? 'smaller' : 'bigger'} than ${n.value}, so it belongs on the ${goLeft ? 'left' : 'right'}.`,
              } : null,
            });
            first = false;
            if (same) break;
            const next = goLeft ? n.left : n.right;
            if (!next) break;
            n = next;
            slot = goLeft ? 2 * slot + 1 : 2 * slot + 2;
          }
        }
        const r = bstInsert(root, v, id);
        root = r.root;
        if (!r.added) {
          s.clearTones();
          s.del(id);
          hideHere(s);
          s.snap(`${v} is already in the tree, so nothing changes.`, { line: 8, vars: vars({ value: v }) });
          return;
        }
        count += 1;
        s.clearTones();
        if (r.depth >= MAX_LEVEL) {
          const c = choices(r.depth, [Math.max(1, Math.ceil(Math.log2(count))), count + 1, 1]);
          askOnLast(s, {
            q: `The next number is ${v}. How many compares does it need to find its spot?`,
            options: c.options, answer: c.answer,
            why: `It walks past ${r.depth} nodes on the way down, and each one is a compare.`,
          });
          compares += r.depth;
          deep.push(v);
          drawTree(s, root, o);
          showDeep();
          hideHere(s);
          s.snap(`${v} takes ${r.depth} compares. It lands on level ${r.depth + 1}, below the picture.`, { line: 3, vars: vars({ value: v }) });
          return;
        }
        drawTree(s, root, o);
        s.tone(id, 'ok');
        hideHere(s);
        s.snap(r.depth === 0 ? `The tree is empty, so ${v} becomes the root. That takes 0 compares.` : `The arrow is None, so ${v} goes here on level ${r.depth + 1}.`, { line: 3, vars: vars({ value: v }) });
      });
      s.clearTones();
      s.del('newLbl');
      hideHere(s);
      const h = heightOf(root), n = sizeOf(root);
      const best = Math.floor(Math.log2(Math.max(1, n))) + 1;
      s.snap(h === n && n >= 3
        ? `A line! ${many(n, 'node')} and height ${h}. Finding the last one takes ${many(n, 'compare')}.`
        : `${many(n, 'node')} and height ${h}. The shortest shape for ${n} has height ${best}. It took ${many(compares, 'compare')} in all.`, { line: 8, vars: vars() });
    },
  });

  // ---------------------------------------------------------------- lesson 18.6
  Viz.register('m18-bst-delete', {
    title: 'Delete a value: 3 cases',
    size: [560, 298],
    code: py`
      def delete(node, value):
          if node is None:
              return None
          if value < node.value:
              node.left = delete(node.left, value)
          elif value > node.value:
              node.right = delete(node.right, value)
          elif node.left is None:
              return node.right
          elif node.right is None:
              return node.left
          else:
              big = smallest(node.right)
              node.value = big
              node.right = delete(node.right, big)
          return node
    `,
    inputs: [
      { key: 'order', label: 'Insert order', type: 'text', value: '50, 30, 70, 20, 40, 60, 80', size: 20 },
      { key: 'gone', label: 'Delete', type: 'number', value: 50, min: -99, max: 999 },
    ],
    tryInputs: [
      { order: '', gone: 5 }, { order: '5', gone: 5 }, { order: '5', gone: 9 }, { order: '5, 5, 5', gone: 5 }, { order: '1, 2, 3, 4', gone: 1 }, { order: '4, 3, 2, 1', gone: 4 },
      { order: '50, 30, 70, 20, 40, 60, 80', gone: 20 }, { order: '50, 30, 70, 20', gone: 30 }, { order: '50, 30, 70, 60, 80', gone: 50 }, { order: '50, 30, 80, 70, 60, 75', gone: 50 }, { order: '50, 30, 90, 70, 60, 75', gone: 50 },
      { order: 'x, y', gone: '' }, { order: '2, 1, 3', gone: 7 },
    ],
    build(s, p) {
      const { nums, skipped } = readNums(p.order, 7);
      const gone = whole(p.gone, -99, 999, 50);
      const fit = fitBst(nums);
      let root = fit.root;
      const o = { top: 62, gap: 54 };
      const note = skipNote(skipped) + TOO_DEEP(fit.left);
      if (!root) {
        s.text('empty', 280, 90, 'root is None', { size: 18, mono: true, weight: 700 });
        s.snap(`This tree is empty, so there is nothing to delete.${note}`, { line: 3, vars: { value: gone } });
        return;
      }
      drawTree(s, root, o);
      s.text('rowLbl', 20, 274, 'Inorder:', { size: 14, anchor: 'start', weight: 700 });
      const showRow = () => {
        const list = walkOrder(root, 'in');
        for (let i = 0; i < 8; i++) s.del('r' + i);
        list.forEach((x, i) => s.box('r' + i, 112 + i * 38, 274, x.value, { w: 34, h: 34, size: rowSize(x.value) }));
      };
      showRow();
      s.snap(`Delete ${gone}. First, search for it. Inorder must stay sorted.${note}`, { line: 1, vars: { value: gone } });
      /* Search. */
      let parent = null, side = null, n = root, compares = 0;
      if (gone !== root.value) {
        askOnLast(s, {
          q: `The root holds ${root.value}. Which way does the search for ${gone} go?`,
          options: ['Left', 'Right'],
          answer: gone < root.value ? 0 : 1,
          why: `${gone} is ${gone < root.value ? 'smaller' : 'bigger'} than ${root.value}. So it can only be on the ${gone < root.value ? 'left' : 'right'}.`,
        });
      }
      for (;;) {
        const pt = spot(n.slot, o);
        here(s, pt.x, pt.y);
        s.clearTones();
        s.tone(n.id, 'active');
        compares += 1;
        if (gone === n.value) break;
        const goLeft = gone < n.value;
        const next = goLeft ? n.left : n.right;
        s.snap(`${gone} is ${goLeft ? 'smaller' : 'bigger'} than ${n.value}, so go ${goLeft ? 'left' : 'right'}.`, { line: goLeft ? 5 : 7, vars: { value: gone, compares } });
        if (!next) {
          s.clearTones();
          hideHere(s);
          s.snap(`That arrow is None, so ${gone} is not here. The tree stays the same.`, { line: 3, vars: { value: gone, compares } });
          return;
        }
        parent = n; side = goLeft ? 'left' : 'right'; n = next;
      }
      const kids = kidsOf(n).length;
      const JOB = ['Take it away', 'Lift its child up', 'Copy in the next bigger value'];
      s.snap(`Found ${gone}. It has ${many(kids, 'child').replace('childs', 'children')}.`, {
        line: 8, vars: { value: gone, compares },
        ask: {
          q: `${gone} has ${kids === 1 ? '1 child' : kids + ' children'}. Which job does it need?`,
          options: JOB, answer: kids,
          why: kids === 0 ? 'A leaf has nothing below it. Its parent can drop the arrow.' : kids === 1 ? 'Only one side hangs below. That whole side moves up one spot.' : 'Two sides cannot both take one arrow. A value from below takes its place.',
        },
      });
      const setChild = (par, sd, child) => { if (par) par[sd] = child; else root = child; };
      if (kids === 0) {
        setChild(parent, side, null);
        hideHere(s);
        drawTree(s, root, o);
        showRow();
        s.snap(root ? `${gone} is a leaf, so it goes. The arrow above it becomes None.` : `${gone} was the only node, so the tree is now empty.`, { line: 9, vars: { value: gone, compares } });
      } else if (kids === 1) {
        const child = n.left || n.right;
        setChild(parent, side, child);
        s.clearTones();
        hideHere(s);
        drawTree(s, root, o);
        s.tone(child.id, 'ok');
        showRow();
        s.snap(`${child.value} and everything below it move up. ${gone} is gone.`, { line: n.left ? 11 : 9, vars: { value: gone, compares } });
      } else {
        let big = n.right, bigParent = n, bigSide = 'right';
        s.tone(big.id, 'warn');
        const bp = spot(big.slot, o);
        here(s, bp.x, bp.y, 'look');
        s.snap(`The next bigger value is on the right side. Step right once.`, { line: 13, vars: { value: gone, compares } });
        while (big.left) {
          s.tone(big.id, 'default');
          bigParent = big; bigSide = 'left'; big = big.left;
          s.tone(big.id, 'warn');
          const b2 = spot(big.slot, o);
          here(s, b2.x, b2.y, 'look');
          s.snap(`Then keep going left, to reach the smallest on that side.`, { line: 13, vars: { value: gone, compares } });
        }
        const list = walkOrder(root, 'in').map(x => x.value);
        const after = list[list.indexOf(big.value) + 1];
        const before = list[list.indexOf(gone) - 1];
        const c = choices(big.value, [n.right.value, before, after].filter(v => v != null && v !== big.value).slice(0, 2));
        askOnLast(s, {
          q: `In sorted order, which value comes right after ${gone}?`,
          options: c.options, answer: c.answer,
          why: `${big.value} is the smallest on the right side. So it is bigger than the left side, and smaller than the rest.`,
        });
        const bigValue = big.value;
        n.value = bigValue;
        s.set(n.id, { text: bigValue, tone: 'ok' });
        s.snap(`Copy ${bigValue} up into the spot. For a moment, ${bigValue} is in 2 places.`, { line: 14, vars: { value: gone, big: bigValue } });
        bigParent[bigSide] = big.right;
        s.clearTones();
        s.tone(n.id, 'ok');
        hideHere(s);
        drawTree(s, root, o);
        showRow();
        s.snap(`Delete the old ${bigValue} lower down. It has no left child, so it has at most 1 child.`, { line: 15, vars: { value: gone, big: bigValue } });
      }
      s.clearTones();
      s.snap(root ? 'Inorder is still sorted, so the rule still holds. Now pick another value.' : 'Nothing is left. Now pick another tree.', { line: 16, vars: { value: gone, compares } });
    },
  });

  /* Same numbers, 2 shapes. No turning code here: the second shape comes from picking the middle first. */
  const middleFirst = sorted => {
    if (!sorted.length) return null;
    const m = Math.floor(sorted.length / 2);
    return { id: 'tn' + sorted[m], value: sorted[m], left: middleFirst(sorted.slice(0, m)), right: middleFirst(sorted.slice(m + 1)) };
  };
  Viz.register('m18-balance', {
    title: 'Same numbers, 2 shapes',
    size: [560, 302],
    inputs: [
      { key: 'order', label: 'Insert order (up to 7)', type: 'text', value: '1, 2, 3, 4', size: 20 },
    ],
    tryInputs: [
      { order: '' }, { order: '5' }, { order: '5, 5' }, { order: '2, 1, 3' }, { order: '1, 2, 3, 4, 5, 6, 7' }, { order: '7, 6, 5, 4, 3, 2, 1' }, { order: '4, 2, 6, 1, 3, 5, 7' }, { order: 'x, y, !!' }, { order: '1, 2, 3, 4, 5, 6, 7, 8, 9' },
    ],
    build(s, p) {
      const { nums, skipped } = readNums(p.order, 7);
      const uniq = [...new Set(nums)];
      const o = { top: 50, gap: 60 };
      if (!uniq.length) {
        s.text('empty', 280, 90, 'root is None', { size: 18, mono: true, weight: 700 });
        s.snap(`There are no numbers here.${skipNote(skipped)} An empty tree counts as balanced.`, { vars: { nodes: 0, height: 0 } });
        return;
      }
      let plain = null;
      uniq.forEach(v => { plain = bstInsert(plain, v, 'tn' + v).root; });
      const lean = n => heightOf(n.left) - heightOf(n.right);
      const mark = root => {
        allNodes(root).forEach(n => {
          if (!n.drawn || !s.has(n.drawn)) return;
          const off = Math.abs(lean(n)) > 1;
          s.set(n.drawn, { sub: `${heightOf(n.left)}|${heightOf(n.right)}`, tone: off ? 'bad' : 'default' });
        });
      };
      const hidden = drawTree(s, plain, o);
      const hText = hidden.length ? `Below the picture: ${hidden.map(x => x.value).join(', ')}` : '';
      s.text('deep', 280, 288, hText, { size: 14, weight: 700 });
      const hp = heightOf(plain), n = sizeOf(plain);
      s.snap(`This shape comes from your order. Its height is ${hp}.${skipNote(skipped)}`, { vars: { nodes: n, height: hp } });
      mark(plain);
      const offs = allNodes(plain).filter(x => Math.abs(lean(x)) > 1);
      s.snap(`Each label shows left height | right height. Compare the 2 sides of every node.`, {
        vars: { nodes: n, height: hp },
        ask: {
          q: 'A balanced tree has sides that differ by at most 1, at every node. Is this one balanced?',
          options: ['Yes', 'No'],
          answer: offs.length ? 1 : 0,
          why: offs.length ? `${offs[0].value} has sides of ${heightOf(offs[0].left)} and ${heightOf(offs[0].right)}. They differ by more than 1.` : 'Every node has sides that differ by 0 or 1.',
        },
      });
      offs.forEach(x => { if (x.drawn && s.has(x.drawn)) s.set(x.drawn, { pulse: true }); });
      s.snap(offs.length ? `${many(offs.length, 'node')} ${offs.length === 1 ? 'breaks' : 'break'} the rule. Those labels show a gap above 1.` : 'No node breaks the rule, so this tree is balanced already.', { vars: { nodes: n, height: hp, 'rule breakers': offs.length } });

      const sorted = uniq.slice().sort((a, b) => a - b);
      const tidy = middleFirst(sorted);
      /* Both shapes use the same ids, so each circle glides to its new spot. */
      s.clearTones();
      for (const it of s.items.values()) if (it.kind === 'circle') delete it.sub;
      drawTree(s, tidy, o);
      mark(tidy);
      s.set('deep', { text: '' });
      const ht = heightOf(tidy);
      s.snap(`Same numbers, with the middle one on top each time. Now the height is ${ht}.`, { vars: { nodes: n, height: ht } });
      const c = choices(ht, [hp === ht ? ht + 1 : hp, n === ht ? ht + 2 : n, 1].filter(x => x !== ht));
      askOnLast(s, {
        q: 'How many compares does the deepest search need in this tidy shape?',
        options: c.options, answer: c.answer,
        why: `Each level costs at most one compare. This shape has ${many(ht, 'level')}.`,
      });
      s.snap(`At most ${many(ht, 'compare')} now. Before, it was up to ${hp}. The numbers did not change, only the shape.`, { vars: { nodes: n, 'height before': hp, 'height now': ht } });
    },
  });

  /* The idea of a turn, in pictures only. */
  const TURNS = {
    right: { nums: [1, 2, 3], steps: [{ top: 2, say: '2 moves up, and 1 moves down to its left.' }] },
    left: { nums: [3, 2, 1], steps: [{ top: 2, say: '2 moves up, and 3 moves down to its right.' }] },
    zig: { nums: [1, 3, 2], steps: [{ mid: true, say: 'First, a small turn makes it a plain line: 1, then 2, then 3.' }, { top: 2, say: 'A second turn lifts 2 to the top.' }] },
  };
  Viz.register('m18-turn', {
    title: 'A turn fixes a lopsided part',
    size: [560, 252],
    inputs: [
      { key: 'shape', label: 'Insert order', type: 'select', value: 'right', options: [
        { label: '1, 2, 3', value: 'right' },
        { label: '3, 2, 1', value: 'left' },
        { label: '1, 3, 2', value: 'zig' },
      ] },
    ],
    tryInputs: [{ shape: 'left' }, { shape: 'zig' }, { shape: 'other' }],
    build(s, p) {
      const t = TURNS[p.shape] || TURNS.right;
      let root = null;
      t.nums.forEach(v => { root = bstInsert(root, v, 'tn' + v).root; });
      const o = { top: 50, gap: 62 };
      drawTree(s, root, o);
      const row = () => {
        walkOrder(root, 'in').forEach((x, i) => {
          const id = 'r' + i;
          if (s.has(id)) s.set(id, { text: x.value }); else s.box(id, 330 + i * 40, 226, x.value, { w: 36, h: 36 });
        });
      };
      s.text('rowLbl', 300, 226, 'Inorder:', { size: 14, anchor: 'end', weight: 700 });
      row();
      s.snap(`Insert ${t.nums.join(', ')}, and the tree goes lopsided. Its height is ${heightOf(root)}.`, { vars: { height: heightOf(root) } });
      askOnLast(s, {
        q: 'After a turn, 2 sits on top. 1 is on its left, and 3 is on its right. Does the rule still hold?',
        options: ['Yes, smaller on the left and bigger on the right', 'No, a turn always breaks the rule'],
        answer: 0,
        why: 'A turn moves arrows, but it keeps the order. Inorder stays 1, 2, 3.',
      });
      const one = { id: 'tn1', value: 1, left: null, right: null };
      const two = { id: 'tn2', value: 2, left: null, right: null };
      const three = { id: 'tn3', value: 3, left: null, right: null };
      t.steps.forEach(st => {
        if (st.mid) { one.right = two; two.right = three; root = one; }
        else { two.left = one; two.right = three; one.right = null; three.left = null; root = two; }
        drawTree(s, root, o);
        row();
        s.clearTones();
        s.tone('tn2', 'active');
        s.snap(st.say, { vars: { height: heightOf(root) } });
      });
      s.clearTones();
      s.snap(`Now the height is ${heightOf(root)}. Inorder never changed, so the rule still holds. Pick another order above.`, { vars: { height: heightOf(root) } });
    },
  });
})();
