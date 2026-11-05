/* Visuals for module 19. Names start with the module id.
 * Every tree grows from the real search, so a typed value can never give a false picture.
 * The undo always has its own frame, with the word UN-CHOOSE and a dashed line going back up.
 * Inputs are held to small sizes here too, so a tree always fits a phone and the frame limit.
 */
(function () {
  const W = 480;

  // ------------------------------------------------------------- small helpers
  const whole = (v, lo, hi, fallback) => {
    let n = Math.round(Number(v));
    if (v === '' || v == null || !Number.isFinite(n)) n = fallback;
    return Math.max(lo, Math.min(hi, n));
  };
  /* Reads letters or digits from a text box. Anything else is dropped. */
  const readLetters = (v, limit) => String(v == null ? '' : v)
    .toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, limit).split('').filter(Boolean);
  /* Reads whole numbers from a text box. Numbers outside lo to hi are dropped. */
  const readNums = (v, limit, lo, hi) => String(v == null ? '' : v)
    .split(/[\s,;]+/).filter(Boolean).map(Number)
    .filter(n => Number.isInteger(n) && n >= lo && n <= hi).slice(0, limit);
  /* Options for an ask. Drops repeats, and moves the right answer around. */
  const choices = (right, wrongs, turn = 0) => {
    const seen = new Set([String(right)]);
    const rest = [];
    wrongs.forEach(w => {
      const t = String(w);
      if (!seen.has(t)) { seen.add(t); rest.push(t); }
    });
    const answer = turn % (rest.length + 1);
    rest.splice(answer, 0, String(right));
    return { options: rest, answer };
  };
  /* Moves the right answer around, so it does not always sit in the same place. */
  const mixAsks = s => {
    const snap = s.snap.bind(s);
    s.snap = (say, o = {}) => {
      if (o.ask) {
        const n = o.ask.options.length;
        const turn = o.ask.q.length % n;
        const options = o.ask.options.map((_, i) => o.ask.options[(i + n - turn) % n]);
        o = Object.assign({}, o, { ask: Object.assign({}, o.ask, { options, answer: (o.ask.answer + turn) % n }) });
      }
      return snap(say, o);
    };
  };
  const plain = a => '[' + a.join(', ') + ']';
  const pyList = a => '[' + a.map(x => `'${x}'`).join(', ') + ']';
  const many = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  /* A long list would make the narration too long, so say its size instead. */
  const brief = a => (a.length > 6 ? many(a.length, 'letter') : plain(a));

  // ---------------------------------------------------------------- tree drawing
  /* Places a tree on the stage. Nodes appear one at a time, when the search reaches them. */
  function treeKit(s, root, o) {
    let leaves = 0, depth = 0;
    const walk = (n, d) => {
      depth = Math.max(depth, d);
      if (!n.kids.length) leaves += 1;
      n.kids.forEach(k => walk(k, d + 1));
    };
    walk(root, 0);
    const xGap = Math.min(o.maxGap || 96, (s.w - 60) / Math.max(1, leaves - 1));
    const yGap = Math.min(o.maxY || 76, (o.bottom - o.top) / Math.max(1, depth));
    const pos = Viz.Scene.layoutTree(root, { xGap, yGap, y: o.top, x: s.w / 2 });
    return {
      pos, yGap,
      show(node, tone = 'active') {
        const at = pos[node.id];
        s.circle(node.id, at.x, at.y, node.label, { r: o.r || 20, size: o.size || 15, tone });
        if (node.parent) {
          s.edge('e' + node.id, node.parent.id, node.id, { arrow: false, label: node.edge || '', dashed: !!node.ghost, tone: node.ghost ? 'muted' : 'default' });
        }
      },
      /* A dashed arrow that walks back up the tree. It shows for one frame. */
      back(from, to) { s.edge('back', from.id, to.id, { dashed: true, bend: 18, tone: 'bad' }); },
      noBack() { if (s.has('back')) s.del('back'); },
    };
  }

  /* The list called path, drawn as a row of boxes. */
  function pathKit(s, y, o = {}) {
    const x0 = o.x == null ? 62 : o.x, cell = o.cell || 38, gap = o.gap == null ? 4 : o.gap, size = o.size || 16;
    let serial = 0;
    const cells = [];
    s.text('pathLbl', 14, y, o.label || 'path', { size: 14, anchor: 'start', weight: 700, mono: true });
    return {
      cells,
      push(text) {
        const id = 'pc' + serial++;
        s.box(id, x0 + cell / 2 + cells.length * (cell + gap), y, text, { w: cell, h: cell, size, tone: 'active' });
        cells.push(id);
      },
      pop() { s.del(cells.pop()); },
      calm() { cells.forEach(id => { if (s.get(id).tone === 'active') s.tone(id, 'default'); }); },
    };
  }

  /* The word at the top right that names the move in this frame. */
  const badge = (s, text, tone) => {
    if (s.has('act')) s.set('act', { text, tone });
    else s.box('act', 404, 28, text, { w: 140, h: 34, size: 14, tone });
  };

  // ------------------------------------------------------------------ 19.1
  /* Shared by the right version and the version with the pop left out. */
  function buildCodes(s, p, forget) {
    const ls = readLetters(p.letters, 3);
    const k = ls.length;
    let size = whole(p.size, 0, 3, 2);
    const asked = size;
    while (k > 1 && Math.pow(k, size) > 9) size -= 1;
    const trimmed = size !== asked;

    const grow = (sofar, spot, parent, id) => {
      const node = { id, parent, spot, kids: [], want: sofar, letter: sofar[sofar.length - 1], label: sofar.join('') || '[ ]', leaf: spot === size };
      if (spot < size) ls.forEach((l, i) => node.kids.push(grow(sofar.concat(l), spot + 1, node, id + i)));
      return node;
    };
    const root = grow([], 0, null, 'n');
    const total = k === 0 ? (size === 0 ? 1 : 0) : Math.pow(k, size);
    let nonRoot = 0;
    const tally = n => n.kids.forEach(c => { nonRoot += 1; tally(c); });
    tally(root);

    const bottom = 200, pathY = 262;
    const tree = treeKit(s, root, { top: 30, bottom });
    const room = W - 62 - 14;
    const cell = forget ? Math.min(38, Math.floor(room / Math.max(1, nonRoot)) - 3) : 38;
    const path = pathKit(s, pathY, { cell, gap: forget ? 3 : 4, size: cell < 24 ? 13 : 16 });
    const real = [];
    let out = '', lines = 0, rightLines = 0, cur = root;
    let askedPrint = false, askedNext = false, askedOut = false, askedTotal = false, askedStale = false;

    const v = (spot) => ({ spot, path: plain(real) });
    s.text('lines', 14, 26, 'lines printed: 0', { size: 14, anchor: 'start', weight: 700 });
    badge(s, 'START', 'muted');
    tree.show(root);

    const printNow = node => {
      const same = real.length === node.want.length;
      lines += 1;
      if (same) rightLines += 1;
      out += (out ? '\n' : '') + pyList(real);
      s.set('lines', { text: `lines printed: ${lines}` });
      s.tone(node.id, same ? 'ok' : 'bad');
    };

    const intro = trimmed ? `That tree is too big for a phone, so this uses ${many(size, 'spot')}.` : 'path is empty. The tree starts at the top.';
    let firstAsk = null;
    if (k > 0 && size > 0) {
      const c = choices(ls[0], ls.slice(1).concat('No letter yet'), 0);
      firstAsk = { q: 'path is empty. Which letter does the loop try first?', options: c.options, answer: c.answer, why: `The for loop starts at the first letter, which is ${ls[0]}.` };
    } else if (size === 0) {
      firstAsk = { q: 'size is 0, so spot == size is True now. How many lines will print?', options: ['0', '1', '2'], answer: 1, why: 'The first call stops right away and prints the empty path. One line.' };
    } else {
      firstAsk = { q: 'There are no letters to pick. How many lines will print?', options: ['0', '1', '2'], answer: 0, why: 'The loop has nothing to go over, and spot never reaches size. So nothing prints.' };
    }
    s.snap(intro, { line: 11, vars: v(0), out, ask: firstAsk });

    if (root.leaf) {
      printNow(root);
      s.snap('spot equals size, so line 4 prints the empty path.', { line: 4, vars: v(0), out });
    }

    const visit = node => {
      node.kids.forEach((kid, idx) => {
        const L = kid.letter;
        tree.noBack();
        if (s.get(cur.id).tone === 'active') s.tone(cur.id, 'default');
        path.calm();
        real.push(L);
        path.push(L);
        kid.cellId = path.cells[path.cells.length - 1];
        tree.show(kid);
        cur = kid;
        badge(s, `CHOOSE ${L}`, 'active');

        if (kid.leaf) {
          if (!askedPrint && !forget) {
            askedPrint = true;
            s.snap(`Choose ${L}. path grows to ${plain(real)}. Now spot equals size.`, {
              line: 7, vars: v(kid.spot), out,
              ask: {
                q: 'Every spot is full. What does this call do?',
                options: ['Print path and return', 'Choose one more letter', 'Clear path and start over'],
                answer: 0,
                why: 'spot == size is True. So line 4 prints path, and line 5 returns.',
              },
            });
            printNow(kid);
            s.snap(`Line 4 prints ${pyList(real)}. This leaf is a finished answer.`, {
              line: 4, vars: v(kid.spot), out,
              ask: {
                q: 'Another letter wants this spot next. What must run first?',
                options: ['print(path) again', 'path.pop()', 'path.append(letter)'],
                answer: 1,
                why: 'The spot is taken. pop takes the letter off, so the next letter starts clean.',
              },
            });
          } else {
            printNow(kid);
            const wrong = real.length !== kid.want.length;
            let ask = null;
            if (forget && !askedPrint) {
              askedPrint = true;
              const next = plain(real.concat(ls[1] || ls[0]));
              const c = choices(next, [plain(real.slice(-1).concat(ls[1] || ls[0])), plain(real)], 1);
              if (ls.length > 1 && size > 1) ask = {
                q: `Line 9 has no pop. So what will path hold after the next choose?`,
                options: c.options, answer: c.answer,
                why: `Nothing took ${L} off. So the next letter lands after it, and path gets longer.`,
              };
            }
            s.snap(wrong
              ? `The tree wants ${plain(kid.want)}, but line 4 prints ${brief(real)}.`
              : `Choose ${L}. Every spot is full, so line 4 prints ${pyList(real)}.`, {
              line: 4, vars: v(kid.spot), out, ask,
            });
          }
        } else {
          let ask = null;
          if (node === root && idx === node.kids.length - 1 && idx > 0 && !forget && !askedTotal && total > 1) {
            askedTotal = true;
            const c = choices(total, [size * k, total + 1, k], size);
            ask = { q: 'Count the leaves this tree will have. How many lines print in all?', options: c.options, answer: c.answer, why: `Each of ${many(k, 'letter')} leads to the same shape below it. That gives ${total} leaves.` };
          }
          s.snap(`Choose ${L}. path grows to ${brief(real)}. Now explore the next spot.`, { line: 7, vars: v(kid.spot), out, ask });
        }

        visit(kid);

        tree.noBack();
        path.calm();
        const hasNext = idx < node.kids.length - 1;
        if (forget) {
          /* The letter this call added stays behind. Its box turns red. */
          s.tone(kid.cellId, 'bad');
          if (s.get(kid.id).tone === 'active') s.tone(kid.id, 'default');
          s.tone(node.id, 'active');
          tree.back(kid, node);
          cur = node;
          badge(s, 'NO UNDO', 'bad');
          let ask = null;
          if (askedPrint && !askedStale && lines >= 2 && total > lines) {
            askedStale = true;
            const longer = real.length + (size - node.spot);
            const c = choices(longer, [size, real.length], lines);
            ask = { q: 'The next leaf will print path. How many letters will it hold?', options: c.options, answer: c.answer, why: `path keeps all ${real.length} letters, and more choices land on top. It holds ${longer} at that leaf.` };
          }
          if (!ask && node === root && !hasNext && lines > 1) {
            const c = choices(rightLines, [lines, 0, lines - 1].filter(x => x !== rightLines), 1);
            ask = { q: `The tree has ${many(lines, 'leaf').replace('leafs', 'leaves')}. How many printed lines match their leaf?`, options: c.options, answer: c.answer, why: `Only the first line can match. After that, old letters stay in path.` };
          }
          s.snap(`The call returns to spot ${node.spot}. Nothing pops, so path stays ${brief(real)}.`, { line: 9, vars: v(node.spot), out, ask });
        } else {
          real.pop();
          path.pop();
          s.tone(kid.id, kid.leaf ? 'ok' : 'muted');
          s.tone(node.id, 'active');
          tree.back(kid, node);
          cur = node;
          badge(s, `UN-CHOOSE ${L}`, 'warn');
          let ask = null;
          if (kid.leaf && hasNext && !askedNext && ls[idx + 1] !== undefined) {
            askedNext = true;
            const next = ls[idx + 1];
            const c = choices(plain(real.concat(next)), [plain(real.concat(L, next)), plain([next])], 0);
            ask = { q: `The loop moves on to ${next}. What will path hold after that choice?`, options: c.options, answer: c.answer, why: `pop took ${L} off, so ${next} lands in the empty spot.` };
          } else if (kid.leaf && !hasNext && node !== root && !askedOut) {
            askedOut = true;
            ask = {
              q: 'The loop at this spot has no letters left. What runs next?',
              options: ['Python clears path by itself', 'The call returns, then the call below pops', 'The program stops here'],
              answer: 1,
              why: 'The call ends and goes back to the call that made it. That call then runs its own pop.',
            };
          }
          s.snap(`Un-choose ${L}. pop takes it off, so path is ${plain(real)}.`, { line: 9, vars: v(node.spot), out, ask });
        }
      });
    };

    visit(root);

    tree.noBack();
    badge(s, 'DONE', 'ok');
    s.tone(root.id, 'muted');
    if (forget) {
      s.snap(lines > 0
        ? `Done. ${rightLines} of ${many(lines, 'line')} came out right. path never emptied.`
        : 'Done. Nothing printed, so the missing pop did no harm here.', { line: 11, vars: v(0), out });
    } else {
      s.snap(lines > 0
        ? `Done. It printed ${many(lines, 'line')}, one per leaf. path is empty again.`
        : 'Done. Nothing printed, because there are no letters. path is still empty.', { line: 11, vars: v(0), out });
    }
  }

  const codesInputs = [
    { key: 'letters', label: 'letters (up to 3)', type: 'text', value: 'AB', size: 5 },
    { key: 'size', label: 'size (spots, 0 to 3)', type: 'number', value: 2, min: 0, max: 3 },
  ];
  const codesTries = [
    { letters: '', size: 2 }, { letters: '', size: 0 }, { letters: 'A', size: 1 }, { letters: 'A', size: 3 },
    { letters: 'AB', size: 0 }, { letters: 'AB', size: 1 }, { letters: 'AB', size: 3 }, { letters: 'AA', size: 2 },
    { letters: 'ABC', size: 1 }, { letters: 'ABC', size: 2 }, { letters: 'ABC', size: 3 }, { letters: 'abcdef', size: 3 },
    { letters: '!?', size: 2 }, { letters: 'AB', size: '' }, { letters: 12, size: 'x' },
  ];

  Viz.register('m19-choose-undo', {
    title: 'Choose, explore, un-choose',
    size: [W, 290],
    code: py`
      path = []
      def explore(spot):
          if spot == size:
              print(path)
              return
          for letter in letters:
              path.append(letter)  # choose
              explore(spot + 1)    # explore
              path.pop()           # un-choose

      explore(0)
    `,
    inputs: codesInputs,
    tryInputs: codesTries,
    build(s, p) { mixAsks(s); buildCodes(s, p, false); },
  });

  Viz.register('m19-no-undo', {
    title: 'The same code with no un-choose',
    size: [W, 290],
    code: py`
      path = []
      def explore(spot):
          if spot == size:
              print(path)
              return
          for letter in letters:
              path.append(letter)  # choose
              explore(spot + 1)    # explore
              # path.pop() is missing!

      explore(0)
    `,
    inputs: codesInputs,
    tryInputs: codesTries,
    build(s, p) { mixAsks(s); buildCodes(s, p, true); },
  });

  // ------------------------------------------------------------------ 19.2
  Viz.register('m19-subsets', {
    title: 'Take it or skip it',
    size: [W, 290],
    code: py`
      results = []
      path = []

      def explore(i):
          if i == len(items):
              results.append(path.copy())
              return
          path.append(items[i])  # take
          explore(i + 1)
          path.pop()             # un-choose
          explore(i + 1)         # skip

      explore(0)
      print(results)
    `,
    inputs: [{ key: 'items', label: 'items (up to 3 letters)', type: 'text', value: 'AB', size: 5 }],
    tryInputs: [{ items: '' }, { items: 'A' }, { items: 'AB' }, { items: 'ABC' }, { items: 'AA' }, { items: 'AAA' }, { items: 'ABCDEF' }, { items: '!!' }, { items: 7 }],
    build(s, p) {
      mixAsks(s);
      const items = readLetters(p.items, 3);
      const n = items.length;
      const grow = (sofar, i, parent, id, edge) => {
        const node = { id, parent, i, kids: [], want: sofar, edge, label: sofar.join('') || '[ ]', leaf: i === n };
        if (i < n) {
          node.take = grow(sofar.concat(items[i]), i + 1, node, id + 'T', '+' + items[i]);
          node.skip = grow(sofar, i + 1, node, id + 'S', '');
          node.kids.push(node.take, node.skip);
        }
        return node;
      };
      const root = grow([], 0, null, 'n', '');
      const pathY = 262;
      const tree = treeKit(s, root, { top: 30, bottom: 208 });
      const path = pathKit(s, pathY);
      const real = [];
      const saved = [];
      const total = Math.pow(2, n);
      let cur = root, undos = 0, askedTotal = false, askedSkip = false;
      const v = i => ({ i, path: plain(real), saved: saved.length });

      s.text('legend', 14, 26, 'Left: take. Right: skip.', { size: 14, anchor: 'start', weight: 700 });
      badge(s, 'START', 'muted');
      tree.show(root);
      s.snap(n ? `Each item is a fork. First comes ${items[0]}: take it or skip it.` : 'items is empty, so i == len(items) is True right away.', {
        line: 13, vars: v(0),
        ask: n ? {
          q: 'Line 8 runs before line 11. So what happens first?',
          options: [`Take ${items[0]}`, `Skip ${items[0]}`, 'Save an answer'],
          answer: 0,
          why: `Line 8 adds ${items[0]} to path. The skip waits until that whole side is done.`,
        } : {
          q: 'An empty list has how many subsets?',
          options: ['0', '1', '2'],
          answer: 1,
          why: 'It has one: the empty list. You can always choose nothing.',
        },
      });

      const move = (node, word, tone) => {
        tree.noBack();
        path.calm();
        if (s.get(cur.id).tone === 'active') s.tone(cur.id, 'default');
        tree.show(node);
        cur = node;
        badge(s, word, tone);
      };
      const save = node => {
        saved.push(real.slice());
        s.tone(node.id, 'ok');
      };

      let firstLeaf = true;
      const visit = node => {
        if (node.leaf) return;
        const L = items[node.i];
        real.push(L);
        path.push(L);
        move(node.take, `TAKE ${L}`, 'active');
        if (node.take.leaf) {
          if (firstLeaf) {
            firstLeaf = false;
            s.snap(`Take ${L}. path is ${plain(real)}. No items are left to decide.`, {
              line: 8, vars: v(node.take.i),
              ask: {
                q: 'i == len(items) is True now. What happens next?',
                options: ['Save a copy of path', 'Clear path', 'Stop the whole search'],
                answer: 0,
                why: 'Each leaf is one finished subset. Line 6 saves it, and line 7 goes back.',
              },
            });
          }
          save(node.take);
          s.snap(`Answer ${saved.length}: line 6 saves ${plain(real)}.`, { line: 6, vars: v(node.take.i) });
        } else {
          s.snap(`Take ${L}. path is ${plain(real)}. The next item is ${items[node.i + 1]}.`, { line: 8, vars: v(node.take.i) });
          visit(node.take);
        }

        real.pop();
        path.pop();
        tree.noBack();
        path.calm();
        s.tone(node.take.id, node.take.leaf ? 'ok' : 'muted');
        s.tone(node.id, 'active');
        tree.back(node.take, node);
        cur = node;
        badge(s, `UN-CHOOSE ${L}`, 'warn');
        undos += 1;
        let ask = null;
        if (undos === 1) {
          ask = {
            q: 'What does line 11 do now?',
            options: [`Explore with no ${L} in path`, `Take ${L} again`, 'Save the same answer again'],
            answer: 0,
            why: `pop took ${L} off. So the second call explores the side where ${L} is skipped.`,
          };
        } else if (node === root && !askedTotal && n > 1) {
          askedTotal = true;
          const c = choices(total, [n, 2 * n, saved.length], n);
          ask = {
            q: `The left side made ${many(saved.length, 'answer')}. How many will the whole tree make?`,
            options: c.options, answer: c.answer,
            why: `The right side has the same shape as the left. That makes ${total} in all.`,
          };
        }
        s.snap(`Un-choose ${L}. pop takes it off, so path is ${plain(real)}.`, { line: 10, vars: v(node.i), ask });

        move(node.skip, `SKIP ${L}`, 'accent');
        if (node.skip.leaf) {
          save(node.skip);
          s.snap(`Skip ${L}. Answer ${saved.length}: line 6 saves ${plain(real)}.`, { line: 6, vars: v(node.skip.i) });
        } else {
          let ask2 = null;
          if (!askedSkip && node !== root) {
            askedSkip = true;
            ask2 = {
              q: `You skipped ${L}. Can a later answer here hold ${L}?`,
              options: ['No, not on this side', 'Yes, it comes back later'],
              answer: 0,
              why: `Each item gets one fork. On this side of the tree, ${L} stays out.`,
            };
          }
          s.snap(`Skip ${L}. Nothing is added, so path stays ${plain(real)}.`, { line: 11, vars: v(node.skip.i), ask: ask2 });
          visit(node.skip);
        }
      };
      if (root.leaf) { save(root); s.snap('Line 6 saves the empty path as the only answer.', { line: 6, vars: v(0) }); }
      visit(root);

      tree.noBack();
      if (s.get(cur.id).tone === 'active' && !cur.leaf) s.tone(cur.id, 'default');
      badge(s, 'DONE', 'ok');
      const dup = new Set(items).size < n;
      s.snap(`Done: ${many(saved.length, 'answer')}, one per leaf.` + (dup ? ' Some repeat, because the letters repeat.' : n === 3 ? ' Try 1 item, or none.' : ' Try 3 items.'), {
        line: 14, vars: v(n), out: pyList2(saved),
      });
    },
  });

  function pyList2(lists) { return '[' + lists.map(pyList).join(', ') + ']'; }

  /* Shared by the version that saves the live list and the version that saves a copy. */
  function buildSaving(s, p, copy) {
    const items = readLetters(p.items, 2);
    const n = items.length;
    const SY = i => 56 + i * 50;
    const path = [];
    const saved = [];   // what each slot holds. With no copy, every slot is the same list.
    const v = () => ({ path: plain(path), results: '[' + saved.map(x => plain(x)).join(', ') + ']' });

    s.text('pathLbl', 92, 92, 'path', { size: 15, weight: 700, mono: true });
    s.box('path', 92, 130, plain(path), { w: 132, h: 56, size: 15, tone: 'active' });
    s.text('resLbl', 290, 24, 'results', { size: 15, weight: 700, mono: true });
    s.snap('results is empty. path is one list, and it will change a lot.', { line: 12, vars: v() });

    let saves = 0, askedPop = false;
    const refresh = () => {
      s.set('path', { text: plain(path) });
      if (copy) return;
      saved.forEach((_, i) => { s.set('val' + i, { text: plain(path) }); s.pulse('val' + i); });
    };
    const explore = i => {
      if (i === n) {
        const at = saves++;
        const y = SY(at);
        if (copy) {
          const own = path.slice();
          saved.push(own);
          s.box('val' + at, 262, y, plain(own), { w: 96, h: 38, size: 15, tone: 'ok' });
          s.text('slot' + at, 318, y, `results[${at}]`, { size: 13, anchor: 'start', mono: true });
          s.snap(`Line 5 makes a new list, ${plain(own)}, and saves that. It stands alone.`, { line: 5, vars: v() });
        } else {
          saved.push(path);
          s.box('val' + at, 262, y, plain(path), { w: 96, h: 38, size: 15, tone: 'warn' });
          s.text('slot' + at, 318, y, `results[${at}]`, { size: 13, anchor: 'start', mono: true });
          s.edge('arrow' + at, 'val' + at, 'path', { tone: 'bad' });
          s.snap('Line 5 saves path itself. The arrow shows that no new list was made.', { line: 5, vars: v() });
        }
        return;
      }
      const L = items[i];
      path.push(L);
      refresh();
      s.snap(`Take ${L}. path grows to ${plain(path)}.`, {
        line: 7, vars: v(),
        ask: i === n - 1 && saves === 0 ? {
          q: 'path is full, so line 5 runs next. How many new lists will it make?',
          options: copy ? ['1', '0', '2'] : ['0', '1', '2'],
          answer: 0,
          why: copy ? 'copy makes one new list with the same items.' : 'append stores path itself. No new list gets made.',
        } : null,
      });
      explore(i + 1);
      const before = plain(path);
      const after = plain(path.slice(0, -1));
      let ask = null;
      if (!askedPop) {
        askedPop = true;
        const c = copy ? choices(before, [after, '[]'], 1) : choices(after, [before, '[]'], 1);
        ask = {
          q: 'Line 9 pops next. After the pop, what will results[0] show?',
          options: c.options, answer: c.answer,
          why: copy
            ? 'results[0] has its own list. pop changes path, and the copy stays as it was.'
            : 'results[0] and path are two names for one list. pop changes it for both.',
        };
        s.snap(`results[0] shows ${before} for now. Make a guess before the pop.`, { line: 9, vars: v(), ask });
      }
      path.pop();
      refresh();
      let later = null;
      if (i === n - 1 && saves === 1) {
        later = {
          q: 'Line 10 will save one more answer. Then how many lists will exist in all?',
          options: copy ? ['3', '1', '2'] : ['1', '2', '3'],
          answer: 0,
          why: copy ? 'path, plus 2 copies. That makes 3 lists.' : 'path is still the only list. results holds the same one twice.',
        };
      }
      s.snap(copy
        ? `Un-choose ${L}. path shrinks, and the saved copies stay the same.`
        : `Un-choose ${L}. path shrinks, and every arrow still points at it.`, { line: 9, vars: v(), ask: later });
      explore(i + 1);
    };
    explore(0);

    const finalOut = '[' + saved.map(x => pyList(x)).join(', ') + ']';
    const wrongOut = copy
      ? '[' + saved.map(() => '[]').join(', ') + ']'
      : '[' + saved.map((_, i) => plain(items.slice(0, n - Math.min(i, n)))).join(', ') + ']';
    const rightOut = finalOut.replace(/'/g, '');
    s.tone('path', 'default');
    const c = choices(rightOut, [wrongOut, plain(items)], 1);
    s.snap('The search is done, and path is empty again.', {
      line: 12, vars: v(),
      ask: n ? {
        q: 'What will line 13 print? Quote marks are left out here.',
        options: c.options, answer: c.answer,
        why: copy
          ? 'Each slot kept the copy made at its own leaf.'
          : 'Every slot is the same list, and that list is empty now.',
      } : null,
    });
    s.snap(copy
      ? `Line 13 prints ${many(saved.length, 'saved list')}. Each answer stayed safe.`
      : `Line 13 prints ${many(saved.length, 'name')} for one list, and that list is empty.`, {
      line: 13, vars: v(), out: finalOut,
    });
  }

  const savingTries = [{ items: '' }, { items: 'A' }, { items: 'AB' }, { items: 'AA' }, { items: 'ABCDEF' }, { items: '!' }, { items: 3 }];

  Viz.register('m19-live-list', {
    title: 'Saving the live list',
    size: [W, 260],
    code: py`
      results = []
      path = []
      def explore(i):
          if i == len(items):
              results.append(path)
              return
          path.append(items[i])
          explore(i + 1)
          path.pop()
          explore(i + 1)

      explore(0)
      print(results)
    `,
    inputs: [{ key: 'items', label: 'items (up to 2 letters)', type: 'text', value: 'AB', size: 4 }],
    tryInputs: savingTries,
    build(s, p) { mixAsks(s); buildSaving(s, p, false); },
  });

  Viz.register('m19-true-copy', {
    title: 'Saving a copy',
    size: [W, 260],
    code: py`
      results = []
      path = []
      def explore(i):
          if i == len(items):
              results.append(path.copy())
              return
          path.append(items[i])
          explore(i + 1)
          path.pop()
          explore(i + 1)

      explore(0)
      print(results)
    `,
    inputs: [{ key: 'items', label: 'items (up to 2 letters)', type: 'text', value: 'AB', size: 4 }],
    tryInputs: savingTries,
    build(s, p) { mixAsks(s); buildSaving(s, p, true); },
  });

  Viz.register('m19-permutations', {
    title: 'Every order',
    size: [W, 320],
    code: py`
      results = []
      path = []

      def explore():
          if len(path) == len(items):
              results.append(path.copy())
              return
          for x in items:
              if x in path:
                  continue
              path.append(x)   # choose
              explore()
              path.pop()       # un-choose

      explore()
      print(results)
    `,
    inputs: [{ key: 'items', label: 'items (up to 3 letters)', type: 'text', value: 'ABC', size: 5 }],
    tryInputs: [{ items: '' }, { items: 'A' }, { items: 'AB' }, { items: 'ABC' }, { items: 'AA' }, { items: 'AAB' }, { items: 'ABCDEF' }, { items: '?' }, { items: 5 }],
    build(s, p) {
      mixAsks(s);
      const items = readLetters(p.items, 3);
      const n = items.length;
      const grow = (sofar, parent, id, fromIdx) => {
        const node = { id, parent, kids: [], want: sofar, fromIdx, label: sofar.join('') || '[ ]', leaf: sofar.length === n };
        if (!node.leaf) items.forEach((x, i) => { if (!sofar.includes(x)) node.kids.push(grow(sofar.concat(x), node, id + i, i)); });
        return node;
      };
      const root = grow([], null, 'n', -1);
      const leaves = (function count(a) { return a.leaf ? 1 : a.kids.reduce((t, c) => t + count(c), 0); })(root);
      const tree = treeKit(s, root, { top: 30, bottom: 192 });
      const ROWY = 244, PATHY = 292;
      const cellX = i => 120 + i * 46;
      s.text('itemsLbl', 14, ROWY, 'items', { size: 14, anchor: 'start', weight: 700, mono: true });
      s.text('pathLbl', 14, PATHY, 'path', { size: 14, anchor: 'start', weight: 700, mono: true });
      items.forEach((x, i) => {
        s.box('gh' + i, cellX(i), ROWY, '', { w: 38, h: 38, tone: 'muted' });
        s.box('pg' + i, cellX(i), PATHY, '', { w: 38, h: 38, tone: 'muted' });
      });
      items.forEach((x, i) => s.box('it' + i, cellX(i), ROWY, x, { w: 38, h: 38, size: 16 }));
      badge(s, 'START', 'muted');
      tree.show(root);

      const real = [];
      const usedIdx = [];
      const saved = [];
      let cur = root, askedSkip = 0, askedLeaf = false, askedUndo = false, askedTotal = false;
      const v = () => ({ path: plain(real), saved: saved.length });
      s.snap(n ? 'path is empty. Every item is still free.' : 'items is empty, so the path is already long enough.', {
        line: 15, vars: v(),
        ask: n ? {
          q: 'Which item goes into path first?',
          options: Array.from(new Set(items)).concat('None yet'),
          answer: 0,
          why: `The for loop starts at the first item, which is ${items[0]}.`,
        } : {
          q: 'How many orders does an empty list have?',
          options: ['0', '1', '2'],
          answer: 1,
          why: 'One: the empty order. So results holds one empty list.',
        },
      });
      const visit = node => {
        node.kids.forEach(kid => {
          const x = items[kid.fromIdx];
          tree.noBack();
          if (s.get(cur.id).tone === 'active') s.tone(cur.id, 'default');
          usedIdx.forEach(i => s.tone('it' + i, 'default'));
          real.push(x);
          usedIdx.push(kid.fromIdx);
          s.set('it' + kid.fromIdx, { x: cellX(real.length - 1), y: PATHY, tone: 'active' });
          tree.show(kid);
          cur = kid;
          badge(s, `CHOOSE ${x}`, 'active');
          if (kid.leaf) {
            saved.push(real.slice());
            s.tone(kid.id, 'ok');
            let ask = null;
            if (!askedLeaf) {
              askedLeaf = true;
              const other = items.filter(y => !real.slice(0, -2).includes(y) && y !== x);
              if (other.length) {
                const a = real.slice(0, -2).concat(x, other[0]);
                const c = choices(plain(a), [plain(real), plain(real.slice(0, -1))], 1);
                ask = { q: 'After 2 un-chooses, the loop goes on. What is the next answer it saves?', options: c.options, answer: c.answer, why: `Taking ${real[real.length - 2]} and ${x} off frees both. So ${x} can now come first.` };
              }
            }
            s.snap(`Choose ${x}. path is full, so line 6 saves ${plain(real)}.`, { line: 6, vars: v(), ask });
          } else {
            let ask = null;
            if (askedSkip < 3 && real.length === 1 && n > 1) {
              askedSkip += 1;
              const free = items.filter(y => !real.includes(y));
              if (free.length) {
                const c = choices(free[0], [x].concat(free.slice(1), 'None'), 1);
                ask = { q: `${x} is in path now. Which item does the loop choose next?`, options: c.options, answer: c.answer, why: `Line 9 sees ${x} in path, so line 10 skips it. The next free item is ${free[0]}.` };
              }
            }
            s.snap(`Choose ${x}. path grows to ${plain(real)}.`, { line: 11, vars: v(), ask });
          }
          visit(kid);
          tree.noBack();
          real.pop();
          usedIdx.pop();
          usedIdx.forEach(i => s.tone('it' + i, 'default'));
          s.set('it' + kid.fromIdx, { x: cellX(kid.fromIdx), y: ROWY, tone: 'warn' });
          s.tone(kid.id, kid.leaf ? 'ok' : (kid.kids.length ? 'muted' : 'bad'));
          s.tone(node.id, 'active');
          tree.back(kid, node);
          cur = node;
          badge(s, `UN-CHOOSE ${x}`, 'warn');
          let ask = null;
          if (!askedUndo && saved.length >= 1 && real.length >= 1) {
            askedUndo = true;
            ask = { q: `${x} goes back. Can it be chosen again on a later path?`, options: ['Yes, it is free again', 'No, each item goes once in the whole search'], answer: 0, why: 'Once only applies inside one path. pop frees it, so a later path can use it.' };
          } else if (!askedTotal && node === root && leaves > 2) {
            askedTotal = true;
            const c = choices(leaves, [n * n, 2 * n, Math.pow(2, n)], n);
            ask = { q: 'The first item made 2 answers. How many will the whole tree make?', options: c.options, answer: c.answer, why: `Each of ${n} first picks makes the same number. That gives ${leaves} orders.` };
          }
          s.snap(`Un-choose ${x}. It goes back, so path is ${plain(real)}.`, { line: 13, vars: v(), ask });
          s.tone('it' + kid.fromIdx, 'default');
        });
      };
      if (root.leaf) saved.push([]);
      visit(root);
      tree.noBack();
      badge(s, 'DONE', 'ok');
      const dup = new Set(items).size < n;
      s.snap(dup
        ? `Done: ${many(saved.length, 'answer')}. A repeat in items blocks itself, because it is already in path.`
        : `Done: ${many(saved.length, 'order')}, one per leaf. ${n === 3 ? 'Try 2 items, or a repeat like AAB.' : 'Try a repeat like AAB.'}`, {
        line: 16, vars: v(), out: pyList2(saved),
      });
    },
  });

  // ------------------------------------------------------------------ 19.3
  /* Grows the search tree for sums. Options: prune cuts numbers that are too big, once
     uses each spot one time, and dedupe skips a repeat at the same fork. */
  function sumTree(nums, target, o) {
    let serial = 0, calls = 0;
    const answers = [];
    const grow = (start, left, sofar, parent, edge) => {
      calls += 1;
      const node = { id: 'n' + serial++, parent, kids: [], left, want: sofar, edge, start, label: String(left), kind: left === 0 ? 'hit' : left < 0 ? 'over' : 'walk' };
      if (left === 0) answers.push(sofar);
      if (left <= 0) return node;
      for (let i = start; i < nums.length; i++) {
        const n = nums[i];
        if (o.dedupe && i > start && nums[i] === nums[i - 1]) {
          node.kids.push({ id: 'n' + serial++, parent: node, kids: [], label: '=', edge: '+' + n, ghost: 'same', value: n });
          continue;
        }
        if (o.prune && n > left) {
          node.kids.push({ id: 'n' + serial++, parent: node, kids: [], label: 'x', edge: '+' + n, ghost: 'cut', value: n });
          break;
        }
        const kid = grow(o.once ? i + 1 : i, left - n, sofar.concat(n), node, '+' + n);
        kid.value = n;
        node.kids.push(kid);
      }
      return node;
    };
    const root = grow(0, target, [], null, '');
    let leaves = 0, depth = 0, count = 0;
    const walk = (n, d) => {
      depth = Math.max(depth, d);
      count += 1;
      if (!n.kids.length) leaves += 1;
      n.kids.forEach(k => walk(k, d + 1));
    };
    walk(root, 0);
    return { root, calls, answers, leaves, depth, others: count - 1 };
  }
  const fits = t => t.others <= 16 && t.depth <= 4 && t.leaves <= 8;

  /* Walks a sum tree, one frame per choose and one per un-choose. */
  function walkSum(s, nums, target, t, cfg) {
    const pathY = 326;
    const tree = treeKit(s, t.root, { top: 28, bottom: 282, maxY: 64, r: 18 });
    const path = pathKit(s, pathY);
    const real = [];
    const answers = [];
    let calls = 1, cur = t.root;
    const v = (left) => ({ left, path: plain(real), calls });
    s.text('calls', 14, 26, 'calls: 1', { size: 14, anchor: 'start', weight: 700 });
    /* The root can sit far to the right in these trees, so the badge goes by the path row. */
    s.box('act', 404, pathY, 'START', { w: 140, h: 34, size: 14, tone: 'muted' });
    tree.show(t.root);
    const first = t.root.kids.find(k => !k.ghost);
    s.snap(`left is the amount still to add. It starts at ${target}.`, {
      line: cfg.lines.start, vars: v(target),
      ask: first ? (() => {
        const c = choices(first.left, [target, target + first.value, first.value].filter(x => x !== first.left), 1);
        return { q: `The first choice adds ${first.value}. What will left become?`, options: c.options, answer: c.answer, why: `left - ${first.value} is ${first.left}. Each choice uses up part of the target.` };
      })() : (t.root.left === 0 ? {
        q: 'The target is 0. What does the search do?',
        options: ['Save the empty list', 'Report an error'],
        answer: 0,
        why: 'You add nothing to reach 0. So the empty list is one true answer.',
      } : {
        q: 'No number here fits. How many answers will there be?',
        options: ['0', '1'],
        answer: 0,
        why: 'Nothing can be chosen, so nothing is ever saved. An empty result is correct here.',
      }),
    });
    if (t.root.left === 0) {
      answers.push([]);
      s.tone(t.root.id, 'ok');
      s.snap('left is 0 already. Line ' + cfg.lines.save + ' saves the empty list.', { line: cfg.lines.save, vars: v(0) });
    }
    let askedOver = false, askedStart = false, askedGhost = false, askedSame = false, askedHit = false, askedCount = false;
    /* A question about what the loop meets next at this fork. */
    const askAbout = (node, next) => {
      if (!next) return null;
      if (next.kind === 'over' && !askedOver) {
        askedOver = true;
        return {
          q: `left is ${node.left}. Choosing ${next.value} would make it ${next.left}. Can that side ever work?`,
          options: ['No, left only goes down', 'Yes, it might come back to 0'],
          answer: 0,
          why: 'Every number here is above 0. So left only goes down, and it can never climb back.',
        };
      }
      if (next.ghost === 'cut' && !askedGhost) {
        askedGhost = true;
        return {
          q: `left is ${node.left}, and the next number is ${next.value}. What should the loop do?`,
          options: ['Stop, and make no call', 'Make the call and see'],
          answer: 0,
          why: `${next.value} is too big, and the list is sorted. Every later number is too big too.`,
        };
      }
      if (next.kind === 'hit' && !askedHit) {
        askedHit = true;
        return {
          q: `left is ${node.left}. Choosing ${next.value} makes it 0. What happens then?`,
          options: ['Save a copy of path', 'Keep choosing more numbers', 'End the whole search'],
          answer: 0,
          why: 'left is 0, so path adds to the target. The call saves it, then the search goes on.',
        };
      }
      if (next.ghost === 'same' && !askedSame) {
        askedSame = true;
        return {
          q: `The next number is another ${next.value}, at the same fork. Should the loop walk in?`,
          options: ['No, it would repeat the same answers', 'Yes, it is a different item'],
          answer: 0,
          why: `The last ${next.value} already tried every group that starts this way.`,
        };
      }
      return null;
    };
    const visit = node => {
      node.kids.forEach((kid, idx) => {
        tree.noBack();
        if (s.get(cur.id).tone === 'active') s.tone(cur.id, 'default');
        path.calm();
        const nextKid = node.kids[idx + 1];
        if (kid.ghost) {
          s.tone(node.id, 'active');
          cur = node;
          tree.show(kid, 'muted');
          if (kid.ghost === 'cut') {
            badge(s, `CUT ${kid.value}`, 'bad');
            s.snap(`${kid.value} is bigger than left, which is ${node.left}. So break. No call is made.`, { line: cfg.lines.prune, vars: v(node.left) });
          } else {
            badge(s, `SKIP ${kid.value}`, 'accent');
            s.snap(`This ${kid.value} matches the one before, at the same fork. So continue.`, { line: cfg.lines.dedupe, vars: v(node.left), ask: askAbout(node, nextKid) });
          }
          return;
        }
        real.push(kid.value);
        path.push(kid.value);
        calls += 1;
        s.set('calls', { text: `calls: ${calls}` });
        tree.show(kid);
        cur = kid;
        badge(s, `CHOOSE ${kid.value}`, 'active');
        let ask = kid.kind === 'walk' ? askAbout(kid, kid.kids[0]) : null;
        if (!ask && !askedStart && cfg.askStart && node === t.root && idx > 0 && kid.kind === 'walk' && nums.length > 1) {
          askedStart = true;
          ask = {
            q: `start is ${idx} now. Can this side choose ${nums[0]}?`,
            options: ['No, that group was covered', 'Yes, any number is fine'],
            answer: 0,
            why: `Picking ${nums[0]} after ${kid.value} makes an old group in a new order. start blocks that.`,
          };
        }
        if (kid.kind === 'hit') {
          answers.push(real.slice());
          s.tone(kid.id, 'ok');
          s.snap(`Choose ${kid.value}. left is 0, so line ${cfg.lines.save} saves ${plain(real)}.`, { line: cfg.lines.save, vars: v(0), ask });
        } else if (kid.kind === 'over') {
          s.tone(kid.id, 'bad');
          s.snap(`Choose ${kid.value}. left is ${kid.left}, which went past 0. Dead end.`, { line: cfg.lines.over, vars: v(kid.left), ask });
        } else {
          s.snap(`Choose ${kid.value}. left drops to ${kid.left}.`, { line: cfg.lines.choose, vars: v(kid.left), ask });
        }
        visit(kid);
        tree.noBack();
        path.calm();
        real.pop();
        path.pop();
        s.tone(kid.id, kid.kind === 'hit' ? 'ok' : kid.kind === 'over' ? 'bad' : (kid.kids.some(k => !k.ghost) ? 'muted' : 'bad'));
        s.tone(node.id, 'active');
        tree.back(kid, node);
        cur = node;
        badge(s, `UN-CHOOSE ${kid.value}`, 'warn');
        let after = askAbout(node, nextKid);
        if (!after && node === t.root && !nextKid && !askedCount && t.calls > 2) {
          askedCount = true;
          const c = choices(t.calls, [t.calls - 1, t.calls + 2, answers.length], t.calls);
          after = { q: 'Count the solid circles, with the top one. How many calls did it take?', options: c.options, answer: c.answer, why: `Each solid circle is one call. There are ${t.calls} of them.` };
        }
        s.snap(`Un-choose ${kid.value}. pop takes it off, and left is ${node.left} in this call.`, { line: cfg.lines.undo, vars: v(node.left), ask: after });
      });
    };
    visit(t.root);
    tree.noBack();
    badge(s, 'DONE', 'ok');
    const list = answers.length ? '[' + answers.map(plain).join(', ') + ']' : '[]';
    s.snap(answers.length
      ? `Done in ${many(calls, 'call')}. ${answers.length === 1 ? 'The answer is' : 'The answers are'} ${answers.map(plain).join(' and ')}.`
      : `Done in ${many(calls, 'call')}. No group adds to ${target}, so results stays empty.`, {
      line: cfg.lines.start, vars: { calls, answers: answers.length }, out: list,
    });
  }

  /* Still picture for a tree too big for a phone. */
  function tooBig(s, t, target) {
    s.text('big1', W / 2, 90, `That search makes ${many(t.calls, 'call')}.`, { size: 18, weight: 700 });
    s.text('big2', W / 2, 130, 'Its tree is too big to draw on a phone.', { size: 15 });
    s.text('big3', W / 2, 170, `It finds ${many(t.answers.length, 'answer')} for ${target}.`, { size: 15 });
    s.snap('Try a smaller target, or fewer numbers.', { vars: { calls: t.calls, answers: t.answers.length } });
  }

  const sortUnique = a => Array.from(new Set(a)).sort((x, y) => x - y);
  const sumInputs = [
    { key: 'nums', label: 'nums (1 to 9, up to 3)', type: 'text', value: '2 3', size: 7 },
    { key: 'target', label: 'target (0 to 9)', type: 'number', value: 6, min: 0, max: 9 },
  ];
  const sumTries = [
    { nums: '', target: 6 }, { nums: '', target: 0 }, { nums: '2', target: 0 }, { nums: '2', target: 1 }, { nums: '2', target: 6 },
    { nums: '3 2', target: 6 }, { nums: '2 2', target: 4 }, { nums: '5', target: 3 }, { nums: '2 3 5', target: 8 }, { nums: '1', target: 9 },
    { nums: '1 2 3', target: 9 }, { nums: '0 -1 x', target: 5 }, { nums: '2 3', target: '' }, { nums: 7, target: 'x' }, { nums: '9', target: 9 },
  ];

  Viz.register('m19-combo-sum', {
    title: 'Numbers that add to a target',
    size: [W, 350],
    code: py`
      def explore(start, left):
          if left < 0:
              return
          if left == 0:
              results.append(path.copy())
              return
          for i in range(start, len(nums)):
              path.append(nums[i])  # choose
              explore(i, left - nums[i])
              path.pop()            # un-choose

      explore(0, target)
    `,
    inputs: sumInputs,
    tryInputs: sumTries,
    build(s, p) {
      mixAsks(s);
      const nums = sortUnique(readNums(p.nums, 3, 1, 9));
      const target = whole(p.target, 0, 9, 6);
      const t = sumTree(nums, target, {});
      if (!fits(t)) return tooBig(s, t, target);
      walkSum(s, nums, target, t, { askStart: true, lines: { start: 12, save: 5, over: 3, choose: 8, undo: 10 } });
    },
  });

  Viz.register('m19-prune', {
    title: 'Cutting a branch early',
    size: [W, 350],
    code: py`
      def explore(start, left):
          if left == 0:
              results.append(path.copy())
              return
          for i in range(start, len(nums)):
              if nums[i] > left:    # prune
                  break
              path.append(nums[i])  # choose
              explore(i, left - nums[i])
              path.pop()            # un-choose

      explore(0, target)
    `,
    inputs: sumInputs,
    tryInputs: sumTries,
    build(s, p) {
      mixAsks(s);
      const nums = sortUnique(readNums(p.nums, 3, 1, 9));
      const target = whole(p.target, 0, 9, 6);
      const t = sumTree(nums, target, { prune: true });
      if (!fits(t)) return tooBig(s, t, target);
      walkSum(s, nums, target, t, { askStart: false, lines: { start: 12, save: 3, prune: 7, over: 8, choose: 8, undo: 10 } });
    },
  });

  Viz.register('m19-skip-dups', {
    title: 'Skip a repeat at the same fork',
    size: [W, 350],
    code: py`
      def explore(start, left):
          if left == 0:
              results.append(path.copy())
              return
          for i in range(start, len(nums)):
              if i > start and nums[i] == nums[i - 1]:
                  continue
              if nums[i] > left:
                  break
              path.append(nums[i])
              explore(i + 1, left - nums[i])
              path.pop()

      explore(0, target)
    `,
    inputs: [
      { key: 'nums', label: 'nums (1 to 9, up to 4)', type: 'text', value: '1 1 2', size: 8 },
      { key: 'target', label: 'target (0 to 9)', type: 'number', value: 3, min: 0, max: 9 },
    ],
    tryInputs: [
      { nums: '', target: 3 }, { nums: '', target: 0 }, { nums: '1', target: 1 }, { nums: '1 1', target: 2 }, { nums: '1 1 1 1', target: 2 },
      { nums: '2 2 2', target: 4 }, { nums: '5 5', target: 3 }, { nums: '1 2 3 4', target: 9 }, { nums: '2 1 1', target: 3 },
      { nums: '0 x', target: 2 }, { nums: '1 1 2', target: '' }, { nums: 4, target: 'x' },
    ],
    build(s, p) {
      mixAsks(s);
      const nums = readNums(p.nums, 4, 1, 9).sort((x, y) => x - y);
      const target = whole(p.target, 0, 9, 3);
      const t = sumTree(nums, target, { prune: true, once: true, dedupe: true });
      if (!fits(t)) return tooBig(s, t, target);
      walkSum(s, nums, target, t, { once: true, askStart: false, lines: { start: 14, save: 3, prune: 9, dedupe: 7, over: 10, choose: 10, undo: 12 } });
    },
  });

  // ------------------------------------------------------------------ 19.4
  const BOARD = ['CAR', 'ATS', 'RED'];
  const MOVES = [[1, 0, 'down'], [-1, 0, 'up'], [0, 1, 'right'], [0, -1, 'left']];

  Viz.register('m19-word-search', {
    title: 'Find a word in a grid',
    size: [W, 280],
    code: py`
      def find(r, c, k):
          if k == len(word):
              return True
          if not on_board(r, c):
              return False
          if board[r][c] != word[k]:
              return False
          keep = board[r][c]
          board[r][c] = "#"      # choose
          found = False
          for dr, dc in MOVES:
              if find(r + dr, c + dc, k + 1):
                  found = True
                  break
          board[r][c] = keep     # un-choose
          return found
    `,
    inputs: [{ key: 'word', label: 'word (up to 5 letters)', type: 'text', value: 'CARS', size: 7 }],
    tryInputs: [{ word: '' }, { word: 'C' }, { word: 'Z' }, { word: 'CART' }, { word: 'CAC' }, { word: 'ATA' }, { word: 'RARAR' }, { word: 'ARARA' }, { word: 'ATATA' }, { word: 'TOOLONGWORD' }, { word: '12!' }, { word: 9 }],
    build(s, p) {
      mixAsks(s);
      const word = readLetters(p.word, 5).filter(ch => /[A-Z]/.test(ch));
      const CELL = 62, GAP = 6, X0 = 34, Y0 = 44;
      const cx = c => X0 + CELL / 2 + c * (CELL + GAP);
      const cy = r => Y0 + CELL / 2 + r * (CELL + GAP);
      const id = (r, c) => `g${r}${c}`;
      const board = BOARD.map(row => row.split(''));
      BOARD.forEach((row, r) => row.split('').forEach((ch, c) => s.box(id(r, c), cx(c), cy(r), ch, { w: CELL, h: CELL })));
      const wx = i => 268 + i * 40;
      s.text('wordLbl', 248, 56, word.length ? 'word' : 'word is empty', { size: 14, anchor: 'start', weight: 700, mono: true });
      word.forEach((ch, i) => s.box('w' + i, wx(i) + 16, 88, ch, { w: 34, h: 34, size: 15, tone: 'muted' }));
      s.box('act', 346, 142, 'START', { w: 196, h: 36, size: 14, tone: 'muted' });
      s.text('tryLbl', 248, 190, 'cells visited: 0', { size: 14, anchor: 'start', weight: 700 });

      /* Run the search first, and write down each move. */
      const events = [];
      const walk = (r, c, k) => {
        if (k === word.length) return true;
        if (r < 0 || c < 0 || r >= 3 || c >= 3) return false;
        if (board[r][c] !== word[k]) return false;
        const keep = board[r][c];
        board[r][c] = '#';
        events.push({ type: 'choose', r, c, k });
        let found = false;
        for (const [dr, dc] of MOVES) {
          if (walk(r + dr, c + dc, k + 1)) { found = true; break; }
        }
        board[r][c] = keep;
        events.push({ type: 'undo', r, c, k, found, last: k === word.length - 1 });
        return found;
      };
      let found = word.length === 0;
      if (!found) {
        outer: for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
          if (walk(r, c, 0)) { found = true; break outer; }
        }
      }

      const starts = BOARD.join('').split('').filter(ch => ch === word[0]).length;
      const askStart = word.length ? (starts ? {
        q: `Which cells can start the word ${word.join('')}?`,
        options: [`Only cells with ${word[0]}`, 'Every cell'],
        answer: 0,
        why: `The first letter must match. Any other cell fails on line 6 at once.`,
      } : {
        q: `No cell holds ${word[0]}. What will the search say?`,
        options: ['Not found', 'Found'],
        answer: 0,
        why: 'Every start fails on line 6, so no call ever returns True.',
      }) : {
        q: 'The word is empty. What does line 2 do?',
        options: ['Return True right away', 'Return False'],
        answer: 0,
        why: 'k is 0 and len(word) is 0. All of its letters are matched, because it has none.',
      };
      s.snap(word.length ? 'Each move goes down, up, right or left. A used cell turns into #.' : 'An empty word has no letters to match.', {
        vars: { word: word.join(''), found: 'not yet' }, ask: askStart,
      });

      let visits = 0, askedDead = false, askedNext = false, askedKept = false, shown = 0, stopped = false;
      const LIMIT = 30;
      const cells = new Set();
      for (let e = 0; e < events.length; e++) {
        const ev = events[e], next = events[e + 1];
        if (shown >= LIMIT) { stopped = true; break; }
        shown += 1;
        const key = id(ev.r, ev.c);
        const L = word[ev.k];
        cells.forEach(x => { if (s.get(x).tone === 'active') s.tone(x, 'warn'); });
        if (ev.type === 'choose') {
          visits += 1;
          cells.add(key);
          s.set(key, { text: '#', tone: 'active' });
          s.set('w' + ev.k, { tone: 'ok' });
          s.set('tryLbl', { text: `cells visited: ${visits}` });
          s.set('act', { text: `CHOOSE ${L}`, tone: 'active' });
          let ask = null;
          const nextChoose = next && next.type === 'choose';
          if (!askedNext && ev.k + 1 < word.length && nextChoose) {
            askedNext = true;
            const dir = MOVES.find(m => m[0] === next.r - ev.r && m[1] === next.c - ev.c)[2];
            const c = choices(dir, MOVES.map(m => m[2]).filter(d => d !== dir).slice(0, 2), ev.k + 1);
            ask = { q: `Moves go down, up, right, left. Which way finds ${word[ev.k + 1]} first?`, options: c.options, answer: c.answer, why: `Going ${dir} reaches the ${word[ev.k + 1]}. Moves that come earlier in the list fail.` };
          } else if (!askedDead && next && next.type === 'undo' && !next.found && ev.k + 1 < word.length) {
            askedDead = true;
            ask = { q: `No cell next to this one holds ${word[ev.k + 1]}. What happens now?`, options: [`Put ${L} back and return False`, 'Stop the whole search', 'Leave the # there'], answer: 0, why: 'This is a dead end. Line 15 puts the letter back, so other paths can use it.' };
          }
          s.snap(`Cell matches ${L}. Line 9 marks it #, so this path cannot use it twice.`, {
            line: 9, vars: { k: ev.k, found: 'not yet' }, ask,
          });
        } else {
          s.set(key, { text: L, tone: ev.found ? 'ok' : 'default' });
          s.set('w' + ev.k, { tone: ev.found ? 'ok' : 'muted' });
          s.set('act', { text: `UN-CHOOSE ${L}`, tone: 'warn' });
          let ask = null;
          if (!askedKept && !ev.found && next && next.type === 'choose') {
            askedKept = true;
            ask = { q: 'Why must this letter go back now?', options: ['Another path may need this cell', 'To save memory', 'Python asks for it'], answer: 0, why: 'A # blocks every later path. Only this path has used the cell, so it must free it.' };
          }
          s.snap(ev.found
            ? `The word is found. Line 15 still puts ${L} back, so the board is unchanged.`
            : `Dead end. Line 15 puts ${L} back, so another path can use this cell.`, {
            line: 15, vars: { k: ev.k, found: ev.found ? 'True' : 'not yet' }, ask,
          });
        }
      }
      if (stopped) {
        s.set('act', { text: 'AND SO ON', tone: 'muted' });
        s.snap('The search carries on the same way, so the picture stops here.', { vars: { word: word.join(''), found: found ? 'True' : 'False' } });
      }
      BOARD.forEach((row, r) => row.split('').forEach((ch, c) => s.set(id(r, c), { text: ch, tone: 'default' })));
      word.forEach((_, i) => s.set('w' + i, { tone: found ? 'ok' : 'muted' }));
      s.set('act', { text: found ? 'FOUND' : 'NOT FOUND', tone: found ? 'ok' : 'bad' });
      s.snap(found
        ? `Answer: True. The board is back as it started. Try CART, then CAC.`
        : `Answer: False. Every path hit a dead end, and the board is back as it started.`, {
        vars: { word: word.join(''), found: found ? 'True' : 'False' },
      });
    },
  });

  Viz.register('m19-queens', {
    title: 'Place queens, one row at a time',
    size: [W, 290],
    code: py`
      def solve(row):
          if row == n:
              return True
          for col in range(n):
              if safe(row, col):
                  queens.append(col)  # choose
                  if solve(row + 1):  # explore
                      return True
                  queens.pop()        # un-choose
          return False
    `,
    inputs: [{ key: 'n', label: 'n (board size, 1 to 4)', type: 'number', value: 4, min: 1, max: 4 }],
    tryInputs: [{ n: 1 }, { n: 2 }, { n: 3 }, { n: 4 }, { n: '' }, { n: 'x' }, { n: 99 }, { n: 0 }],
    build(s, p) {
      mixAsks(s);
      const n = whole(p.n, 1, 4, 4);
      const CELL = 54, GAP = 4, X0 = 34, Y0 = 34;
      const cx = c => X0 + CELL / 2 + c * (CELL + GAP);
      const cy = r => Y0 + CELL / 2 + r * (CELL + GAP);
      const id = (r, c) => `b${r}${c}`;
      for (let r = 0; r < n; r++) {
        s.text('rowL' + r, 16, cy(r), r, { size: 13, tone: 'muted', mono: true });
        s.text('colL' + r, cx(r), 18, r, { size: 13, tone: 'muted', mono: true });
        for (let c = 0; c < n; c++) s.box(id(r, c), cx(c), cy(r), '', { w: CELL, h: CELL, tone: 'muted' });
      }
      s.box('act', 372, 58, 'START', { w: 176, h: 36, size: 14, tone: 'muted' });
      s.text('tryLbl', 286, 104, 'squares tried: 0', { size: 14, anchor: 'start', weight: 700 });

      const queens = [];
      const safe = (row, col) => {
        for (let r = 0; r < row; r++) {
          const c = queens[r];
          if (c === col || Math.abs(c - col) === row - r) return false;
        }
        return true;
      };
      /* Run the search first, and write down each move. Attacked squares in a row share one move. */
      const events = [];
      const solve = row => {
        if (row === n) return true;
        let bad = [];
        const flush = () => { if (bad.length) { events.push({ type: 'blocked', row, cols: bad.slice(), queens: queens.slice() }); bad = []; } };
        for (let col = 0; col < n; col++) {
          if (safe(row, col)) {
            flush();
            queens.push(col);
            events.push({ type: 'place', row, col, queens: queens.slice() });
            if (solve(row + 1)) return true;
            queens.pop();
            events.push({ type: 'lift', row, col, queens: queens.slice() });
          } else {
            bad.push(col);
          }
        }
        flush();
        events.push({ type: 'out', row });
        return false;
      };
      const solved = solve(0);
      queens.length = 0;

      s.snap(`Each row gets one queen. A queen must not share a column or diagonal.`, {
        vars: { row: 0, queens: '[]' },
        ask: n === 1 ? {
          q: 'A 1 by 1 board has one square. Can a queen go there?',
          options: ['Yes', 'No'],
          answer: 0,
          why: 'No other queen is on the board. So that square is safe, and the job is done.',
        } : {
          q: 'Why try only one queen per row?',
          options: ['2 queens in a row attack each other', 'It looks neater', 'Python needs it'],
          answer: 0,
          why: 'Queens attack along a row. So each row can hold one queen at most.',
        },
      });

      let tried = 0, askedDead = false, askedPlace = false, askedLift = false;
      const clearX = () => {
        for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (s.get(id(r, c)).text === 'x') s.set(id(r, c), { text: '', tone: 'muted' });
      };
      const v = (row, qs) => ({ row, queens: '[' + qs.join(', ') + ']', tried });
      events.forEach((ev, e) => {
        const next = events[e + 1];
        if (ev.type === 'out') return;
        clearX();
        for (let r = 0; r < n; r++) if (s.has('q' + r)) s.tone('q' + r, 'default');
        if (ev.type === 'blocked') {
          tried += ev.cols.length;
          ev.cols.forEach(c => s.set(id(ev.row, c), { text: 'x', tone: 'bad' }));
          s.set('tryLbl', { text: `squares tried: ${tried}` });
          s.set('act', { text: 'ATTACKED', tone: 'bad' });
          const all = ev.cols.length === n;
          let ask = null;
          const after = next && next.type;
          if (!askedDead && all) {
            askedDead = true;
            ask = { q: `Every square in row ${ev.row} is attacked. What must happen?`, options: ['Lift the queen above, and try again', 'Put a queen here anyway', 'Give up on the whole board'], answer: 0, why: 'This row is a dead end. So the last choice was wrong, and it must be undone.' };
          } else if (!askedPlace && after === 'place') {
            askedPlace = true;
            const c = choices(next.col, ['None of them'].concat(ev.cols.slice(0, 1)), 1);
            ask = { q: `The x squares are attacked. Which column gets the queen in row ${ev.row}?`, options: c.options, answer: c.answer, why: `Column ${next.col} is the first square that no queen can reach.` };
          }
          s.snap(all
            ? `Row ${ev.row} has no safe square. This is a dead end.`
            : `In row ${ev.row}, ${ev.cols.length === 1 ? 'column ' + ev.cols[0] + ' is' : 'columns ' + ev.cols.join(' and ') + ' are'} attacked. safe gives False.`, {
            line: 5, vars: v(ev.row, ev.queens), ask,
          });
        } else if (ev.type === 'place') {
          tried += 1;
          s.box('q' + ev.row, cx(ev.col), cy(ev.row), 'Q', { w: CELL - 10, h: CELL - 10, size: 22, tone: 'active' });
          s.set('tryLbl', { text: `squares tried: ${tried}` });
          s.set('act', { text: `CHOOSE col ${ev.col}`, tone: 'active' });
          s.snap(`Column ${ev.col} is safe, so a queen goes in row ${ev.row}.`, { line: 6, vars: v(ev.row, ev.queens) });
        } else {
          s.del('q' + ev.row);
          s.set(id(ev.row, ev.col), { text: '', tone: 'muted' });
          s.set('act', { text: `UN-CHOOSE col ${ev.col}`, tone: 'warn' });
          let ask = null;
          if (!askedLift) {
            askedLift = true;
            const more = ev.col < n - 1;
            const pick = choices(ev.col + 1, ['0', ev.col, n], ev.col);
            ask = more ? {
              q: `The queen is off row ${ev.row}. Which column does the loop try next?`,
              options: pick.options,
              answer: pick.answer,
              why: `The loop in this call goes on from where it stopped. So column ${ev.col + 1} is next.`,
            } : {
              q: `That was the last column in row ${ev.row}. What happens next?`,
              options: ['This call returns False', 'The loop starts again at column 0'],
              answer: 0,
              why: 'The loop is done. So the call returns False, and the row above tries its next column.',
            };
          }
          s.snap(`pop lifts the queen off row ${ev.row}. That column did not lead to an answer.`, { line: 9, vars: v(ev.row, ev.queens), ask });
        }
      });
      clearX();
      const final = events.filter(ev => ev.type === 'place' || ev.type === 'lift').pop();
      const qs = solved ? final.queens : [];
      for (let r = 0; r < n; r++) if (s.has('q' + r)) s.tone('q' + r, 'ok');
      s.set('act', { text: solved ? 'SOLVED' : 'NO ANSWER', tone: solved ? 'ok' : 'bad' });
      s.snap(solved
        ? `Solved with ${many(tried, 'square')} tried. Each row holds a queen, and none attack. Now try n = 3.`
        : `No answer exists for n = ${n}. The search tried ${many(tried, 'square')} and undid them all.`, {
        line: solved ? 3 : 10, vars: v(solved ? n : 0, qs),
      });
    },
  });
})();
