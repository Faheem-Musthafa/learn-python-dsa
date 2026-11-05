/* Visuals for module 21. Names start with the module id.
 * Node spots are fixed by hand, so the picture stays still while the search moves.
 * The 6 spots sit on a convex ring, so an edge can never run through a third node.
 * Every input may be empty or junk, so each build must cope with that.
 */
(function () {
  // ------------------------------------------------------------- small helpers
  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
  const SPOT = { A: [120, 70], B: [280, 24], C: [440, 70], D: [510, 160], E: [280, 196], F: [50, 160] };
  /* Where a node's small label goes. Each one sits on the outside of the ring. */
  const TAG = { A: [70, 46], B: [336, 14], C: [492, 46], D: [510, 200], E: [280, 234], F: [50, 200] };

  const whole = (v, lo, hi, fallback) => {
    let n = Math.round(Number(v));
    if (v === '' || v == null || !Number.isFinite(n)) n = fallback;
    return Math.max(lo, Math.min(hi, n));
  };
  const letter = (v, fallback) => {
    const t = String(v == null ? '' : v).trim().toUpperCase();
    return LETTERS.includes(t) ? t : fallback;
  };
  const words = a => (a.length ? a.join(', ') : 'nothing');
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

  /* Reads "A-B, B>C, F" from a text box. A lone letter is a node with no edges.
     Anything else, a node joined to itself, and repeats are skipped. */
  function readGraph(text, directed, allowed = LETTERS) {
    const parts = String(text == null ? '' : text).toUpperCase().split(/[\s,;]+/).filter(Boolean);
    const edges = [], lone = [], seen = new Set();
    let skipped = 0;
    parts.forEach(t => {
      const one = /^([A-F])$/.exec(t);
      if (one && allowed.includes(one[1])) { if (!lone.includes(one[1])) lone.push(one[1]); return; }
      const m = /^([A-F])[-:>]*([A-F])$/.exec(t);
      if (!m || m[1] === m[2] || !allowed.includes(m[1]) || !allowed.includes(m[2])) { skipped += 1; return; }
      const key = directed ? m[1] + m[2] : [m[1], m[2]].sort().join('');
      if (seen.has(key) || edges.length >= 12) { skipped += 1; return; }
      seen.add(key);
      edges.push([m[1], m[2]]);
    });
    const used = new Set(lone);
    edges.forEach(([a, b]) => { used.add(a); used.add(b); });
    return { edges, nodes: LETTERS.filter(l => used.has(l)), skipped };
  }
  /* Neighbours in A to Z order, the same as a Python dict of sorted lists. */
  function toAdj(nodes, edges, directed) {
    const adj = {};
    nodes.forEach(n => { adj[n] = []; });
    edges.forEach(([a, b]) => {
      adj[a].push(b);
      if (!directed) adj[b].push(a);
    });
    nodes.forEach(n => adj[n].sort());
    return adj;
  }
  const eid = (a, b, directed) => 'e' + (directed ? a + b : [a, b].sort().join(''));

  /* Draws the nodes and edges on their fixed spots. */
  function drawGraph(s, nodes, edges, directed, spot = SPOT, r = 22) {
    nodes.forEach(n => s.circle('n' + n, spot[n][0], spot[n][1], n, { r }));
    edges.forEach(([a, b]) => {
      const twin = directed && edges.some(([x, y]) => x === b && y === a);
      s.edge(eid(a, b, directed), 'n' + a, 'n' + b, { arrow: !!directed, bend: twin ? 18 : 0 });
    });
  }
  /* A small label on the outside of a node. */
  function setTag(s, n, text, tone) {
    const id = 't' + n;
    if (s.has(id)) s.set(id, { text, tone: tone || 'default' });
    else s.text(id, TAG[n][0], TAG[n][1], text, { size: 13, weight: 700, tone: tone || 'default' });
  }

  /* A row of small boxes that slide along, for a queue, a pile or a visited set. */
  function tokenRow(s, id, label, y, o = {}) {
    const x0 = o.x0 == null ? 108 : o.x0, cell = o.cell || 40, gap = o.gap == null ? 6 : o.gap;
    const h = o.h || 36, size = o.size || 17, tone = o.tone || 'default';
    const toks = [];
    let serial = 0;
    const X = i => x0 + i * (cell + gap);
    s.text(id + 'L', 14, y, label, { size: 14, anchor: 'start', weight: 700 });
    s.area(id + 'W', x0 - cell / 2 - 7, y - h / 2 - 7, (o.slots || 6) * (cell + gap) - gap + 14, h + 15, '');
    const tidy = () => {
      toks.forEach((t, i) => s.set(t.id, { x: X(i) }));
      if (toks.length) s.del(id + 'E');
      else if (!s.has(id + 'E')) s.text(id + 'E', x0 - cell / 2, y, 'empty', { size: 14, anchor: 'start', tone: 'muted' });
      if (o.mark) {
        if (!toks.length) s.del(id + 'M');
        else {
          const at = X(o.mark === 'top' ? toks.length - 1 : 0);
          if (s.has(id + 'M')) s.set(id + 'M', { x: at });
          else s.text(id + 'M', at, y - h / 2 - 16, o.mark, { size: 13, tone: 'muted', weight: 700 });
        }
      }
    };
    const kit = {
      values: () => toks.map(t => t.v),
      size: () => toks.length,
      has: v => toks.some(t => t.v === v),
      push(v) {
        const tid = id + 'k' + serial++;
        s.box(tid, X(toks.length), y, v, { w: cell, h, size, tone });
        toks.push({ id: tid, v });
        tidy();
        return tid;
      },
      shift() { const t = toks.shift(); s.del(t.id); tidy(); return t.v; },
      pop() { const t = toks.pop(); s.del(t.id); tidy(); return t.v; },
      paint(toneNow) { toks.forEach(t => s.tone(t.id, toneNow)); },
    };
    tidy();
    return kit;
  }

  // ---------------------------------------------------------------- lesson 21.1
  const SMALL = { A: [86, 70], B: [172, 26], C: [258, 70], D: [296, 152], E: [172, 206], F: [48, 152] };
  Viz.register('m21-adj-build', {
    title: 'Each edge adds to the adjacency list',
    size: [560, 262],
    code: py`
      graph = defaultdict(list)
      for a, b in edges:
          graph[a].append(b)
          if two_way:
              graph[b].append(a)
    `,
    inputs: [
      { key: 'edges', label: 'Edges (A to F)', type: 'text', value: 'A-B, A-C, B-C, C-D', size: 22 },
      { key: 'kind', label: 'Kind', type: 'select', value: 'two', options: [{ label: 'Two-way lines', value: 'two' }, { label: 'One-way arrows', value: 'one' }] },
    ],
    tryInputs: [
      { edges: '', kind: 'two' }, { edges: 'A-B', kind: 'one' }, { edges: 'A-B, A-B, B-A', kind: 'two' }, { edges: 'A-A', kind: 'two' },
      { edges: 'cat, 7, Z-Q', kind: 'one' }, { edges: 'A-B, A-C, A-D, A-E, A-F, B-C, B-D, B-E, B-F, C-D, C-E, C-F, D-E', kind: 'two' }, { edges: 'A-B, B-A', kind: 'one' }, { edges: 'F', kind: 'two' },
    ],
    build(s, p) {
      const directed = p.kind === 'one';
      const { edges, skipped } = readGraph(p.edges, directed);
      const used = new Set();
      edges.forEach(([a, b]) => { used.add(a); used.add(b); });
      const rows = {};
      const list = {};
      let entries = 0, turn = 0, keys = 0;
      s.text('dictL', 336, 18, 'graph', { size: 14, anchor: 'start', weight: 700 });
      const show = n => `${n}: [${list[n].join(', ')}]`;
      const addEntry = (a, b, line) => {
        if (!list[a]) {
          list[a] = [];
          rows[a] = 44 + keys * 32;
          keys += 1;
          s.text('row' + a, 336, rows[a], show(a), { size: 15, anchor: 'start', mono: true });
        }
        list[a].push(b);
        entries += 1;
        s.set('row' + a, { text: show(a) });
        s.pulse('row' + a);
        s.snap(`${b} goes in the list for ${a}. You can now go from ${a} to ${b}.`, { line, vars: { entries } });
      };

      if (!edges.length) {
        s.text('none', 172, 118, 'No edges yet', { size: 16, tone: 'muted' });
        s.snap('With no edges, the dict stays empty. Type edges like A-B above.' + skipNote(skipped), { line: 1, vars: { entries: 0 } });
        return;
      }

      LETTERS.filter(n => used.has(n)).forEach(n => s.circle('n' + n, SMALL[n][0], SMALL[n][1], n, { r: 20, tone: 'muted' }));
      s.snap('Here are the nodes. There are no edges yet, and the dict is empty.' + skipNote(skipped), { line: 1, vars: { entries: 0 } });

      edges.forEach(([a, b], i) => {
        const twin = directed && edges.some(([x, y]) => x === b && y === a);
        const ask = i === 0 ? askIt(
          `The edge from ${a} to ${b} comes next. How many list entries will it add?`,
          directed ? 1 : 2, [directed ? 2 : 1, 0],
          directed ? 'A one-way arrow adds 1 entry, in the list of the node it leaves.' : 'A two-way line must work from both ends. So it adds 1 entry to each list.',
          turn++,
        ) : (i === 2 ? askIt(
          `Which list does the first entry of this edge go in?`,
          `The list for ${a}`, [`The list for ${b}`, 'A new list of its own'],
          `The loop reads a first. So ${b} goes in the list for ${a}.`, turn++,
        ) : null);
        s.snap(`Next edge: ${a} and ${b}.`, { line: 2, vars: { entries, a, b }, ask });
        s.edge(eid(a, b, directed), 'n' + a, 'n' + b, { arrow: directed, bend: twin ? 16 : 0, tone: 'ok' });
        s.tone(['n' + a, 'n' + b], 'default');
        addEntry(a, b, 3);
        if (!directed) addEntry(b, a, 5);
        s.tone(eid(a, b, directed), 'default');
      });
      s.snap(`${many(edges.length, 'edge')} made ${many(entries, 'entry').replace('entrys', 'entries')}. ${directed ? 'One-way edges add 1 each.' : 'Two-way edges add 2 each.'}`, { line: 2, vars: { edges: edges.length, entries } });
    },
  });

  // ---------------------------------------------------------------- lesson 21.2
  Viz.register('m21-bfs', {
    title: 'BFS spreads out in layers',
    size: [560, 358],
    code: py`
      def bfs(graph, start):
          visited = {start}
          dist = {start: 0}
          queue = deque([start])
          while len(queue) > 0:
              node = queue.popleft()
              for other in graph[node]:
                  if other not in visited:
                      visited.add(other)
                      dist[other] = dist[node] + 1
                      queue.append(other)
          return dist
    `,
    inputs: [
      { key: 'edges', label: 'Edges (A to F)', type: 'text', value: 'A-B, A-F, B-C, B-E, C-D, D-E, E-F', size: 26 },
      { key: 'start', label: 'Start', type: 'select', value: 'A', options: LETTERS },
      { key: 'goal', label: 'Path to', type: 'select', value: 'D', options: ['none'].concat(LETTERS) },
    ],
    tryInputs: [
      { edges: '', start: 'A', goal: 'none' }, { edges: '', start: 'C', goal: 'C' }, { edges: '', start: 'A', goal: 'B' },
      { edges: 'A-B', start: 'B', goal: 'A' }, { edges: 'A-B, C-D', start: 'A', goal: 'D' }, { edges: 'A-B, A-B, A-B', start: 'A', goal: 'B' },
      { edges: 'A-B, A-C, A-D, A-E, A-F, B-C, B-D, B-E, B-F, C-D, C-E, C-F', start: 'F', goal: 'E' }, { edges: 'cat, dog', start: 'Q', goal: 'Z' }, { edges: 'A-B, B-C, C-D, D-E, E-F', start: 'F', goal: 'A' },
    ],
    build(s, p) {
      const { edges, nodes, skipped } = readGraph(p.edges, false);
      const start = letter(p.start, 'A');
      const goal = letter(p.goal, null);
      const all = LETTERS.filter(n => nodes.includes(n) || n === start);
      const adj = toAdj(all, edges, false);
      drawGraph(s, all, edges, false);
      const queue = tokenRow(s, 'q', 'queue', 282, { mark: 'front', tone: 'warn' });
      const seen = tokenRow(s, 'v', 'visited', 332, { tone: 'ok' });
      const visited = new Set([start]);
      const dist = { [start]: 0 }, from = {};
      let looks = 0, gap = 3, turn = 0, prev = null, askedSkip = false;
      const F = (say, line, ask, node) => {
        gap = ask ? 0 : gap + 1;
        s.snap(say, { line, ask: ask || null, vars: node ? { node, 'dist[node]': dist[node], 'edge checks': looks } : { 'edge checks': looks } });
      };

      s.tone('n' + start, 'active');
      queue.push(start);
      seen.push(start);
      setTag(s, start, 'dist 0');
      F(`Start at ${start}. It joins the queue and visited, with dist 0.` + skipNote(skipped), 4);

      while (queue.size()) {
        const waiting = queue.values();
        if (waiting.length > 1 && gap >= 3) {
          const last = waiting[waiting.length - 1];
          F(`The queue now holds ${waiting.join(', ')}.`, 5, askIt(
            'Which node leaves the queue next?', waiting[0], [last, waiting[1]],
            `A queue serves the front first. ${waiting[0]} joined before the others.`, turn++,
          ));
        }
        if (prev) s.tone('n' + prev, 'ok');
        const node = queue.shift();
        prev = node;
        s.tone('n' + node, 'active');
        F(`${node} leaves the front of the queue. Its dist is ${dist[node]}.`, 6, null, node);

        const old = [], fresh = [];
        adj[node].forEach(o => { looks += 1; (visited.has(o) ? old : fresh).push(o); });
        if (old.length) {
          if (gap >= 3 && !askedSkip) {
            askedSkip = true;
            F(`${node} looks at ${words(old)}.`, 8, askIt(
              `${words(old)} ${old.length === 1 ? 'is' : 'are'} in visited already. What happens?`,
              'Skip, and add nothing', ['Add to the queue again', 'BFS stops here'],
              'Visited nodes already have their dist. Adding them again would only waste steps.', turn++, ), node);
          }
          F(`Already in visited: ${words(old)}. Skip.`, 8, null, node);
        }
        fresh.forEach(o => {
          const d = dist[node] + 1;
          if (gap >= 3) {
            F(`${o} is new. It is not in visited yet.`, 8, askIt(
              `${node} has dist ${dist[node]}. What dist does ${o} get?`, d, [dist[node], d + 1],
              `${o} is 1 edge past ${node}. So its dist is ${dist[node]} + 1.`, turn++,
            ), node);
          }
          visited.add(o);
          dist[o] = d;
          from[o] = node;
          s.tone(eid(node, o), 'ok');
          s.tone('n' + o, 'warn');
          setTag(s, o, 'dist ' + d);
          seen.push(o);
          queue.push(o);
          F(`${o} is new, so mark it and queue it. Its dist is ${d}.`, 11, null, node);
        });
        if (!adj[node].length) F(`${node} has no neighbours, so nothing joins the queue.`, 7, null, node);
      }

      if (prev) s.tone('n' + prev, 'ok');
      const lost = all.filter(n => !visited.has(n));
      lost.forEach(n => { s.tone('n' + n, 'muted'); setTag(s, n, 'no dist', 'muted'); });
      F(lost.length ? `The queue is empty. No path leads to ${words(lost)}.` : 'The queue is empty, so BFS stops. Every node has its dist.', 12);

      if (goal) {
        if (goal === start) {
          s.text('pathT', 400, 306, `path: ${start}`, { size: 16, anchor: 'start', weight: 700 });
          F(`${goal} is the start, so the path has 0 edges.`, 12);
        } else if (visited.has(goal)) {
          const d = dist[goal];
          F(`Now find the path from ${start} to ${goal}.`, 12, askIt(
            `How many edges does the shortest path from ${start} to ${goal} have?`, d, [d + 1, Math.max(0, d - 1), d + 2],
            `dist[${goal}] is ${d}. BFS counts the edges from the start.`, turn++,
          ));
          const path = [goal];
          while (path[0] !== start) path.unshift(from[path[0]]);
          path.forEach((n, i) => {
            s.tone('n' + n, 'active');
            if (i) s.tone(eid(path[i - 1], n), 'accent');
          });
          s.text('pathT', 400, 306, `path: ${path.join(' ')}`, { size: 16, anchor: 'start', weight: 700 });
          F(`Each node remembers who found it. Walk back from ${goal} to get this path.`, 12);
        } else {
          setTag(s, goal, 'no path', 'bad');
          F(`${goal} was never reached. So there is no path from ${start} to ${goal}.`, 12);
        }
      }
      F(`BFS made ${many(looks, 'edge check')} and served ${many(all.length - lost.length, 'node')}. Now pick a new start.`, 12);
    },
  });

  Viz.register('m21-weighted', {
    title: 'BFS counts edges, not kilometres',
    size: [560, 250],
    inputs: [
      { key: 'direct', label: 'A to C (km)', type: 'number', value: 10, min: 1, max: 20 },
      { key: 'one', label: 'A to B (km)', type: 'number', value: 2, min: 1, max: 20 },
      { key: 'two', label: 'B to C (km)', type: 'number', value: 3, min: 1, max: 20 },
    ],
    tryInputs: [
      { direct: 1, one: 1, two: 1 }, { direct: 2, one: 1, two: 1 }, { direct: 20, one: 1, two: 1 }, { direct: 1, one: 20, two: 20 },
      { direct: '', one: '', two: '' }, { direct: 'x', one: 'y', two: 'z' }, { direct: 5, one: 2, two: 3 },
    ],
    build(s, p) {
      const direct = whole(p.direct, 1, 20, 10), one = whole(p.one, 1, 20, 2), two = whole(p.two, 1, 20, 3);
      const via = one + two;
      s.circle('nA', 90, 158, 'A');
      s.circle('nB', 280, 50, 'B');
      s.circle('nC', 470, 158, 'C');
      s.edge('eAC', 'nA', 'nC', { arrow: false, label: direct + ' km' });
      s.edge('eAB', 'nA', 'nB', { arrow: false, label: one + ' km' });
      s.edge('eBC', 'nB', 'nC', { arrow: false, label: two + ' km' });
      s.text('bfsT', 280, 206, 'BFS route: ?', { size: 15, weight: 700 });
      s.text('bestT', 280, 232, 'Cheapest route: ?', { size: 15, weight: 700 });
      s.snap(`You want to go from A to C. Each road has a length.`, {
        ask: askIt('Which route will BFS pick?', 'A to C, on the 1 road', ['A to B to C, on 2 roads', 'Whichever has fewer km'],
          'BFS counts edges and does not read the numbers. The route with 1 edge wins.', direct),
      });

      s.tone(['nA', 'nC', 'eAC'], 'accent');
      s.set('bfsT', { text: `BFS route: A C, 1 edge, ${direct} km` });
      s.snap(`BFS reaches C in 1 edge. It never read the ${direct}.`, {
        ask: askIt(`Going through B takes ${one} + ${two} km. Which route is shorter in km?`,
          via < direct ? 'A to B to C' : via > direct ? 'A to C' : 'They tie',
          ['A to B to C', 'A to C', 'They tie'],
          `A to C is ${direct} km. A to B to C is ${via} km.`, one),
      });

      if (via < direct) {
        s.tone(['eAC'], 'muted');
        s.tone(['eAB', 'eBC'], 'ok');
        s.tone('nB', 'ok');
        s.set('bestT', { text: `Cheapest route: A B C, 2 edges, ${via} km` });
        s.snap(`The route with more edges is shorter here. BFS gave the wrong answer for km.`);
      } else {
        s.set('bestT', { text: `Cheapest route: A C, 1 edge, ${direct} km` });
        s.snap(`This time BFS happens to be right. It got lucky, as it never read the km.`);
      }
      s.snap('BFS gives the shortest path only when every edge counts the same. Now try your own numbers.');
    },
  });

  // ---------------------------------------------------------------- lesson 21.3
  const WALKS = {
    ring: { label: 'Ring of arrows', directed: true, edges: [['A', 'B'], ['B', 'C'], ['C', 'A']], spot: { A: [280, 44], B: [420, 158], C: [140, 158] } },
    line: { label: 'One two-way line', directed: false, edges: [['A', 'B']], spot: { A: [180, 100], B: [380, 100] } },
    chain: { label: 'Chain, no way back', directed: true, edges: [['A', 'B'], ['B', 'C'], ['C', 'D']], spot: { A: [80, 100], B: [213, 100], C: [346, 100], D: [480, 100] } },
  };
  Viz.register('m21-no-visited', {
    title: 'What goes wrong without visited',
    size: [560, 296],
    code: py`
      def walk(node):
          visited.add(node)
          for other in graph[node]:
              if other not in visited:
                  walk(other)
    `,
    inputs: [
      { key: 'guard', label: 'Use visited?', type: 'select', value: 'off', options: [{ label: 'No visited', value: 'off' }, { label: 'With visited', value: 'on' }] },
      { key: 'shape', label: 'Graph', type: 'select', value: 'ring', options: Object.keys(WALKS).map(k => ({ label: WALKS[k].label, value: k })) },
      { key: 'limit', label: 'Safety stop', type: 'number', value: 8, min: 4, max: 14 },
    ],
    tryInputs: [
      { guard: 'off', shape: 'ring', limit: 4 }, { guard: 'on', shape: 'ring', limit: 10 }, { guard: 'off', shape: 'line', limit: 14 }, { guard: 'on', shape: 'line', limit: 4 },
      { guard: 'off', shape: 'chain', limit: 4 }, { guard: 'on', shape: 'chain', limit: 14 }, { guard: 'x', shape: 'y', limit: 'z' }, { guard: 'off', shape: 'ring', limit: '' },
    ],
    build(s, p) {
      const guard = p.guard === 'on';
      const shape = WALKS[p.shape] || WALKS.ring;
      const limit = whole(p.limit, 4, 14, 8);
      const nodes = Object.keys(shape.spot);
      const adj = toAdj(nodes, shape.edges, shape.directed);
      drawGraph(s, nodes, shape.edges, shape.directed, shape.spot);
      const pile = tokenRow(s, 'c', 'pile', 244, { x0: 88, cell: 26, gap: 4, size: 15, mark: 'top', tone: 'warn' });
      const visited = new Set();
      let calls = 0, stopped = false, asked = 0;
      const vars = () => ({ 'calls so far': calls, 'on the pile': pile.size() });
      const F = (say, line, ask) => s.snap(say, { line, ask: ask || null, vars: vars() });

      F(guard ? 'Visited is on. Each node gets a mark when you reach it.' : 'Visited is off. Pretend lines 2 and 4 are not there.', 1);

      const walk = node => {
        calls += 1;
        pile.push(node);
        nodes.forEach(n => { if (s.get('n' + n).tone === 'active') s.tone('n' + n, 'default'); });
        s.tone('n' + node, 'active');
        if (guard) {
          visited.add(node);
          s.set('n' + node, { sub: 'marked' });
        }
        F(`walk(${node}) starts and goes on the pile.`, guard ? 2 : 1);
        if (!guard && pile.size() >= limit) {
          stopped = true;
          return;
        }
        for (const o of adj[node]) {
          if (guard && visited.has(o)) {
            F(`${o} already has a mark, so this call skips it.`, 4);
            continue;
          }
          let ask = null;
          if (!guard && asked === 0 && calls >= nodes.length && shape !== WALKS.chain) {
            asked += 1;
            ask = askIt(`walk(${node}) is about to call walk(${o}) again. Will this ever stop on its own?`,
              'No, it keeps going round', ['Yes, after one more call', 'Yes, when it reaches the start'],
              'Nothing marks where it has been. So each call looks the same as the last, for ever.', calls);
          }
          if (!guard && asked === 1 && pile.size() === limit - 3 && shape !== WALKS.chain) {
            asked += 1;
            ask = askIt(`The pile holds ${pile.size()} calls. What is different from the first call?`,
              'Only the height of the pile', ['The graph got smaller', 'The job got smaller'],
              'Nothing shrinks. In module 16, each call had a smaller job. Here, the job stays the same.', calls);
          }
          if (guard && asked === 0) {
            const hits = adj[o].some(x => visited.has(x));
            if (hits) {
              asked += 1;
              ask = askIt(`Next is ${o}. It has a neighbour with a mark. Will walk call that neighbour?`,
                'No, it skips marked nodes', ['Yes, one more time', 'Yes, and it starts again'],
                'Line 4 asks if a node is in visited. A marked node gets no new call.', calls);
            }
          }
          F(`walk(${node}) calls walk(${o}).`, 5, ask);
          walk(o);
          if (stopped) return;
          s.tone('n' + node, 'active');
        }
        if (!adj[node].length && asked === 0) {
          asked += 1;
          F(`${node} has no arrows out.`, 3, askIt('What does this call do now?', 'It ends and leaves the pile', ['It calls itself again', 'It restarts from A'],
            'The loop has nothing to do, so the call ends. A chain has no way back, so it needs no marks.', calls));
        }
        pile.pop();
        s.tone('n' + node, 'ok');
        F(`walk(${node}) has no more to do. It comes off the pile.`, 3);
      };
      walk('A');

      if (stopped) {
        pile.paint('bad');
        nodes.forEach(n => s.tone('n' + n, 'bad'));
        s.text('halt', 280, 274, `Safety stop at ${limit} calls. It would never end.`, { size: 15, weight: 700, tone: 'bad' });
        F(`This picture stops at ${limit} calls. Real Python stops at its limit with a RecursionError.`, 5);
      } else if (guard) {
        s.text('halt', 280, 274, `Done: ${many(calls, 'call')}, one for each node.`, { size: 15, weight: 700, tone: 'ok' });
        F(`It ends after ${many(calls, 'call')}. Each node runs once, thanks to the marks.`, 3);
      } else {
        s.text('halt', 280, 274, `Done: ${many(calls, 'call')}, with no marks needed.`, { size: 15, weight: 700, tone: 'ok' });
        F('This graph has no way back, like a tree. So it ends with no marks at all.', 3);
      }
    },
  });

  Viz.register('m21-dfs', {
    title: 'DFS goes deep, then walks back',
    size: [560, 358],
    code: py`
      def dfs(node):
          visited.add(node)
          print(node)
          for other in graph[node]:
              if other not in visited:
                  dfs(other)

      dfs(start)
    `,
    inputs: [
      { key: 'edges', label: 'Edges (A to F)', type: 'text', value: 'A-B, A-F, B-C, B-E, E-F', size: 26 },
      { key: 'start', label: 'Start', type: 'select', value: 'A', options: LETTERS },
    ],
    tryInputs: [
      { edges: '', start: 'A' }, { edges: '', start: 'F' }, { edges: 'A-B', start: 'B' }, { edges: 'A-B, C-D', start: 'C' },
      { edges: 'A-B, A-B', start: 'A' }, { edges: 'A-B, A-C, A-D, A-E, A-F, B-C, B-D, B-E, B-F, C-D, C-E, C-F', start: 'A' }, { edges: 'hello', start: 'Z' }, { edges: 'A-B, B-C, C-D, D-E, E-F', start: 'C' },
    ],
    build(s, p) {
      const { edges, nodes, skipped } = readGraph(p.edges, false);
      const start = letter(p.start, 'A');
      const all = LETTERS.filter(n => nodes.includes(n) || n === start);
      const adj = toAdj(all, edges, false);
      drawGraph(s, all, edges, false);
      const pile = tokenRow(s, 'c', 'call pile', 282, { mark: 'top', tone: 'warn' });
      const seen = tokenRow(s, 'v', 'visited', 332, { tone: 'ok' });
      const visited = new Set();
      const order = [];
      let looks = 0, gap = 3, turn = 0, askedSkip = false, askedEnd = false;
      const F = (say, line, ask, node) => {
        gap = ask ? 0 : gap + 1;
        s.snap(say, { line, ask: ask || null, out: order.join('\n'), vars: node ? { node, 'edge checks': looks } : { 'edge checks': looks } });
      };

      F(`You start at ${start}. Nothing is marked yet.` + skipNote(skipped), 8);

      const dfs = node => {
        visited.add(node);
        order.push(node);
        pile.push(node);
        seen.push(node);
        s.tone('n' + node, 'active');
        setTag(s, node, 'visit ' + order.length);
        F(`dfs(${node}) goes on the pile. It marks ${node} and prints it.`, 3, null, node);
        let marked = [];
        const flush = () => {
          if (!marked.length) return;
          const names = words(marked), one = marked.length === 1;
          if (gap >= 3 && !askedSkip) {
            askedSkip = true;
            F(`${node} looks at ${names}.`, 5, askIt(`${names} ${one ? 'is' : 'are'} in visited. Does dfs(${node}) make a call for ${one ? 'it' : 'them'}?`, 'No, it moves on', ['Yes, one more time', 'Yes, and it clears the marks'],
              'A mark means that node had its turn already. This stops a cycle from trapping you.', turn++), node);
          }
          F(`${names} ${one ? 'has a mark' : 'have marks'}. Skip.`, 5, null, node);
          marked = [];
        };
        for (const o of adj[node]) {
          looks += 1;
          if (visited.has(o)) {
            marked.push(o);
            continue;
          }
          flush();
          const fresh = adj[node].filter(x => !visited.has(x));
          if (gap >= 3) {
            F(`${node} has unmarked neighbours: ${words(fresh)}.`, 4, askIt(`Where does DFS go next?`, o,
              fresh.length > 1 ? [fresh[fresh.length - 1], 'Back to the start'] : ['Back to the start', 'It stops here'],
              `DFS takes the first unmarked neighbour in the list, and goes deep straight away. That is ${o}.`, turn++), node);
          }
          s.tone('n' + node, 'warn');
          s.tone(eid(node, o), 'ok');
          F(`${node} waits on the pile. DFS follows the edge to ${o}.`, 6, null, node);
          dfs(o);
          s.tone('n' + node, 'active');
          if (o !== adj[node][adj[node].length - 1]) F(`Back at ${node}. It carries on from where it stopped.`, 4, null, node);
        }
        flush();
        if (gap >= 3 && pile.size() > 1 && !askedEnd) {
          askedEnd = true;
          F(`${node} has no unmarked neighbours left.`, 4, askIt('What does this call do now?', 'It ends and goes back', ['It starts again from A', 'The whole search stops'],
            'The call ends and leaves the pile. The call below it still has work to do.', turn++), node);
        }
        pile.pop();
        s.tone('n' + node, 'ok');
        F(`dfs(${node}) is done, so it comes off the pile.`, 4, null, node);
      };
      dfs(start);

      const lost = all.filter(n => !visited.has(n));
      lost.forEach(n => { s.tone('n' + n, 'muted'); setTag(s, n, 'no path', 'muted'); });
      F(lost.length ? `The pile is empty. No path from ${start} leads to ${words(lost)}.` : `The pile is empty. Visit order: ${order.join(' ')}. Now pick a new start.`, 8);
    },
  });

  // ---------------------------------------------------------------- lesson 21.4
  /* Rows are split by a slash, like "110 / 011". Anything but a 1 counts as water. */
  function readGrid(text) {
    const rows = String(text == null ? '' : text).split(/[/\n;]+/).map(x => x.replace(/[\s,]+/g, '')).filter(Boolean).slice(0, 4);
    const cols = Math.min(5, rows.reduce((m, r) => Math.max(m, r.length), 0));
    return rows.map(r => {
      const a = [];
      for (let i = 0; i < cols; i += 1) a.push(r[i] === '1' ? 1 : 0);
      return a;
    });
  }
  function gridKit(s, grid, x0 = 42, y0 = 58, cell = 44, gap = 4) {
    const rows = grid.length, cols = rows ? grid[0].length : 0;
    const id = (r, c) => `g${r}_${c}`;
    const X = c => x0 + c * (cell + gap), Y = r => y0 + r * (cell + gap);
    for (let c = 0; c < cols; c += 1) s.text('ch' + c, X(c), y0 - cell / 2 - 12, c, { size: 13, tone: 'muted', mono: true });
    for (let r = 0; r < rows; r += 1) s.text('rh' + r, x0 - cell / 2 - 12, Y(r), r, { size: 13, tone: 'muted', mono: true });
    grid.forEach((row, r) => row.forEach((v, c) => s.box(id(r, c), X(c), Y(r), v, { w: cell, h: cell, size: 17, tone: v ? 'default' : 'muted' })));
    const near = (r, c) => {
      const out = [];
      let off = 0;
      [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) off += 1;
        else if (grid[nr][nc] === 1) out.push([nr, nc]);
      });
      return { land: out, off };
    };
    return { id, rows, cols, near };
  }
  const cellText = ([r, c]) => `(${r},${c})`;

  Viz.register('m21-flood', {
    title: 'A grid is a graph: BFS fills an area',
    size: [560, 262],
    code: py`
      visited = {(r, c)}
      queue = deque([(r, c)])
      while len(queue) > 0:
          r, c = queue.popleft()
          for nr, nc in land_next_to(r, c):
              if (nr, nc) not in visited:
                  visited.add((nr, nc))
                  queue.append((nr, nc))
    `,
    inputs: [
      { key: 'grid', label: 'Grid, rows split by /', type: 'text', value: '11010 / 01110 / 00100 / 11001', size: 26 },
      { key: 'r', label: 'Start row', type: 'number', value: 0, min: 0, max: 3 },
      { key: 'c', label: 'Start col', type: 'number', value: 1, min: 0, max: 4 },
    ],
    tryInputs: [
      { grid: '', r: 0, c: 0 }, { grid: '1', r: 0, c: 0 }, { grid: '0', r: 0, c: 0 }, { grid: '11111 / 11111 / 11111 / 11111', r: 2, c: 2 },
      { grid: '101 / 010', r: 3, c: 4 }, { grid: 'cat / dog', r: 0, c: 0 }, { grid: '1 / 11 / 111', r: 0, c: 0 }, { grid: '1111111 / 1 / 1 / 1 / 1 / 1', r: '', c: 'x' },
    ],
    build(s, p) {
      const grid = readGrid(p.grid);
      const kit = gridKit(s, grid);
      s.text('qL', 292, 26, 'queue (front on the left)', { size: 14, anchor: 'start', weight: 700 });
      s.text('vL', 292, 158, 'visited: 0 cells', { size: 14, anchor: 'start', weight: 700 });
      s.text('legend', 292, 186, 'A mark like #2 means', { size: 13, anchor: 'start', tone: 'muted' });
      s.text('legend2', 292, 206, 'visited, 2 steps from the start.', { size: 13, anchor: 'start', tone: 'muted' });
      const tokenX = i => 316 + (i % 5) * 50, tokenY = i => 60 + Math.floor(i / 5) * 44;
      let toks = [], serial = 0, turn = 0, gap = 3, served = 0;
      const tidy = () => toks.forEach((t, i) => s.set(t.id, { x: tokenX(i), y: tokenY(i) }));
      const join = cell => {
        const tid = 'tok' + serial++;
        s.box(tid, tokenX(toks.length), tokenY(toks.length), cell.join(','), { w: 44, h: 36, size: 14, tone: 'warn' });
        toks.push({ id: tid, cell });
      };
      const F = (say, line, ask) => {
        gap = ask ? 0 : gap + 1;
        s.snap(say, { line, ask: ask || null, vars: { visited: seenCount, 'cell looks': looks } });
      };
      let seenCount = 0, looks = 0;

      if (!kit.rows || !kit.cols) {
        s.text('none', 150, 120, 'This grid is empty.', { size: 16, tone: 'muted' });
        F('This grid has no cells. So there is nothing to fill.', 1);
        return;
      }
      const r0 = whole(p.r, 0, kit.rows - 1, 0), c0 = whole(p.c, 0, kit.cols - 1, 0);
      if (grid[r0][c0] !== 1) {
        s.tone(kit.id(r0, c0), 'bad');
        F(`Cell (${r0},${c0}) holds 0, which is water. So there is nothing to fill.`, 1);
        return;
      }
      const dist = { [r0 + ',' + c0]: 0 };
      const mark = (cell, d, tone) => s.set(kit.id(cell[0], cell[1]), { text: '#' + d, tone });
      seenCount = 1;
      mark([r0, c0], 0, 'warn');
      s.set('vL', { text: 'visited: 1 cell' });
      join([r0, c0]);
      F(`Start at (${r0},${c0}). Mark it and put it in the queue.`, 2, askIt(
        'Which cells count as next to a cell here?', 'Up, down, left and right', ['All 8 around it', 'Only the one on the right'],
        'This grid has 4 directions. Corners touch, but they are not joined. Some problems change this rule.', r0 + c0));

      while (toks.length) {
        if (toks.length > 1 && gap >= 4) {
          F('More than one cell is waiting.', 3, askIt('Which cell leaves the queue next?', cellText(toks[0].cell),
            [cellText(toks[toks.length - 1].cell), cellText(toks[1].cell)], 'The front of the queue goes first. That keeps the layers in order.', turn++));
        }
        const t = toks.shift();
        s.del(t.id);
        tidy();
        const [r, c] = t.cell;
        const d = dist[r + ',' + c];
        const { land, off } = kit.near(r, c);
        looks += 4;
        s.set(kit.id(r, c), { tone: 'active' });
        const fresh = land.filter(([a, b]) => dist[a + ',' + b] == null);
        const offNote = off ? ` ${off} of its sides ${off === 1 ? 'is' : 'are'} off the grid.` : '';
        served += 1;
        const brief = served > 6;
        if (!brief) F(`(${r},${c}) leaves the queue.${offNote}`, 4, gap >= 3 && land.length ? askIt(
          `How many new land cells are next to (${r},${c})?`, fresh.length, [fresh.length + 1, Math.max(0, fresh.length - 1), 4],
          fresh.length ? `Look up, down, left and right. The new ones are ${fresh.map(cellText).join(', ')}.` : 'Each land cell next to it already has a mark, so none are new.', turn++) : null);
        if (fresh.length) {
          fresh.forEach(([a, b]) => {
            dist[a + ',' + b] = d + 1;
            mark([a, b], d + 1, 'warn');
            join([a, b]);
          });
          seenCount += fresh.length;
          s.set('vL', { text: `visited: ${many(seenCount, 'cell')}` });
          if (!brief) F(`New land: ${fresh.map(cellText).join(', ')}. ${fresh.length === 1 ? 'It is' : 'They are'} ${many(d + 1, 'step')} from the start.`, 8);
        }
        if (brief) F(`(${r},${c}) leaves the queue. ${fresh.length ? 'New land: ' + fresh.map(cellText).join(', ') + '.' : 'It finds no new land.'}`, 8);
        s.set(kit.id(r, c), { tone: 'ok' });
      }
      F(`The queue is empty. BFS filled ${many(seenCount, 'cell')} and made ${looks} cell looks.`, 3);
      s.snap('Land that is not joined stays unmarked. Pick a new start, or type a new grid.', { line: 3, vars: { visited: seenCount, 'cell looks': looks } });
    },
  });

  Viz.register('m21-islands', {
    title: 'Scan the grid, and fill each new island',
    size: [560, 262],
    code: py`
      count = 0
      for r in range(rows):
          for c in range(cols):
              if grid[r][c] == 1:
                  if (r, c) not in seen:
                      count += 1
                      fill(r, c)
      print(count)
    `,
    inputs: [
      { key: 'grid', label: 'Grid, rows split by /', type: 'text', value: '1100 / 1001 / 0011 / 0100', size: 26 },
    ],
    tryInputs: [
      { grid: '' }, { grid: '0' }, { grid: '1' }, { grid: '000 / 000' }, { grid: '11111 / 11111 / 11111 / 11111' },
      { grid: '10101 / 01010 / 10101 / 01010' }, { grid: 'dog' }, { grid: '1 / 11 / 111' },
    ],
    build(s, p) {
      const grid = readGrid(p.grid);
      const kit = gridKit(s, grid);
      s.text('cntL', 292, 40, 'islands so far', { size: 15, anchor: 'start', weight: 700 });
      s.box('cnt', 330, 84, 0, { w: 76, h: 56, tone: 'accent' });
      s.text('legend', 292, 146, 'A mark like #2 means', { size: 13, anchor: 'start', tone: 'muted' });
      s.text('legend2', 292, 166, 'this cell is in island 2.', { size: 13, anchor: 'start', tone: 'muted' });
      const seen = new Set();
      let count = 0, looked = 0, turn = 0;
      const vars = () => ({ count, 'cells scanned': looked });
      const F = (say, line, ask) => s.snap(say, { line, ask: ask || null, vars: vars(), out: null });

      if (!kit.rows || !kit.cols) {
        s.text('none', 150, 120, 'This grid is empty.', { size: 16, tone: 'muted' });
        s.snap('This grid has no cells, so it has 0 islands.', { line: 8, vars: vars(), out: '0' });
        return;
      }
      F('Scan from the top left, one cell at a time.', 2);

      let run = 0;
      const fill = (r, c) => {
        seen.add(r + ',' + c);
        s.set(kit.id(r, c), { text: '#' + count, tone: 'ok' });
        s.pulse(kit.id(r, c));
        F(`Fill reaches (${r},${c}). It gets the mark for island ${count}.`, 7);
        kit.near(r, c).land.forEach(([a, b]) => { if (!seen.has(a + ',' + b)) fill(a, b); });
      };
      for (let r = 0; r < kit.rows; r += 1) {
        for (let c = 0; c < kit.cols; c += 1) {
          looked += 1;
          if (grid[r][c] !== 1 || seen.has(r + ',' + c)) { run += 1; continue; }
          s.set(kit.id(r, c), { tone: 'active' });
          const text = run ? `The scan moves past ${many(run, 'cell')} of water or marked land.` : 'The scan starts here.';
          const q = count === 0 ? askIt(
            `(${r},${c}) is land with no mark. What does that tell you?`, 'It is part of a new island', ['It is part of an old island', 'It is water'],
            'A fill marks a whole island. So land with no mark must belong to a new one.', turn++)
            : count === 1 ? askIt(
              `The count is ${count}. (${r},${c}) is land with no mark. What is the count after this cell?`, count + 1, [count, count + 2],
              'No fill reached this cell. So it starts a new island, and the count goes up by 1.', turn++)
              : null;
          F(`${text} Now it is on (${r},${c}).`, 5, q);
          run = 0;
          count += 1;
          s.set('cnt', { text: count });
          s.pulse('cnt');
          F(`New island, so the count goes up to ${count}.`, 6);
          fill(r, c);
        }
      }
      const cellsWord = run > 1 ? `The scan passes the last ${run} cells.` : run === 1 ? 'The scan passes the last cell.' : 'The scan is done.';
      s.snap(`${cellsWord} There ${count === 1 ? 'is 1 island' : `are ${count} islands`} in this grid.`, { line: 8, vars: vars(), out: String(count) });
    },
  });

  // ---------------------------------------------------------------- lesson 21.5
  Viz.register('m21-components', {
    title: 'Each new start finds one whole group',
    size: [560, 306],
    code: py`
      count = 0
      visited = set()
      for node in graph:
          if node not in visited:
              count += 1
              spread(graph, node, visited)
      print(count)
    `,
    inputs: [
      { key: 'edges', label: 'Edges (A to F)', type: 'text', value: 'A-B, B-C, D-E', size: 22 },
      { key: 'n', label: 'How many nodes', type: 'number', value: 6, min: 0, max: 6 },
    ],
    tryInputs: [
      { edges: '', n: 0 }, { edges: '', n: 1 }, { edges: '', n: 6 }, { edges: 'A-B, B-C, C-D, D-E, E-F', n: 6 }, { edges: 'A-B, A-B', n: 2 },
      { edges: 'E-F', n: 3 }, { edges: 'junk', n: 'x' }, { edges: 'A-B, C-D, E-F', n: '' }, { edges: 'A-B, B-C, C-A', n: 3 },
    ],
    build(s, p) {
      const n = whole(p.n, 0, 6, 6);
      const all = LETTERS.slice(0, n);
      const { edges, skipped } = readGraph(p.edges, false, all);
      const adj = toAdj(all, edges, false);
      drawGraph(s, all, edges, false);
      all.forEach(x => s.tone('n' + x, 'muted'));
      const seen = tokenRow(s, 'v', 'visited', 276, { tone: 'ok' });
      const visited = new Set();
      let count = 0, gap = 3, turn = 0, looks = 0;
      const F = (say, line, ask, out) => {
        gap = ask ? 0 : gap + 1;
        s.snap(say, { line, ask: ask || null, vars: { count, 'edge checks': looks }, out: out == null ? null : out });
      };
      if (!all.length) {
        s.text('none', 280, 120, 'A graph with no nodes', { size: 16, tone: 'muted' });
        F('With no nodes, the loop never runs. The count stays 0.', 7, null, '0');
        return;
      }
      F(`Every node starts with no mark. There are ${many(all.length, 'node')}.` + skipNote(skipped), 3);

      const spread = (node, group) => {
        visited.add(node);
        seen.push(node);
        s.tone('n' + node, 'ok');
        setTag(s, node, 'group ' + group);
        F(`Mark ${node} as part of group ${group}.`, 6);
        adj[node].forEach(o => {
          looks += 1;
          if (!visited.has(o)) {
            s.tone(eid(node, o), 'ok');
            spread(o, group);
          }
        });
      };
      all.forEach(node => {
        if (visited.has(node)) {
          if (gap >= 4) F(`The loop reaches ${node}. It already has a mark, so skip it.`, 4);
          return;
        }
        s.tone('n' + node, 'active');
        const q = turn === 0 || adj[node].length
          ? askIt(`The loop reaches ${node}, and it has no mark. What does that mean?`, 'A new group starts here', ['It joins the last group', 'The loop can stop now'],
            'A spread marks every node it can reach. If this node has no mark, no earlier spread could reach it.', turn++)
          : askIt(`${node} has no edges at all. Does it count as a group?`, 'Yes, a group of 1', ['No, a group needs an edge', 'No, it joins the last group'],
            'Nothing can reach this node, and it can reach nothing. So it is its own group.', turn++);
        F(`The loop reaches ${node}. Look for its mark.`, 4, gap >= 2 ? q : null);
        count += 1;
        F(`${node} starts group ${count}, so the count is now ${count}.`, 5);
        spread(node, count);
      });
      F(`The loop is done. This graph has ${many(count, 'group')}. A lone node is a group too.`, 7, null, String(count));
    },
  });

  Viz.register('m21-cycle-two-way', {
    title: 'Two-way edges: skip where you came from',
    size: [560, 344],
    code: py`
      def check(node, came):
          visited.add(node)
          for other in graph[node]:
              if other == came:
                  continue
              if other in visited:
                  return True
              if check(other, node):
                  return True
          return False
    `,
    inputs: [
      { key: 'edges', label: 'Edges (A to F)', type: 'text', value: 'A-B, B-C, C-A', size: 22 },
    ],
    tryInputs: [
      { edges: '' }, { edges: 'A' }, { edges: 'A-B' }, { edges: 'A-B, B-C, C-D' }, { edges: 'A-B, C-D, D-E, E-C' }, { edges: 'A-B, A-B' },
      { edges: 'nope' }, { edges: 'A-B, A-C, A-D, A-E, A-F, B-C, B-D, B-E, B-F' }, { edges: 'A-B, B-C, C-A' },
    ],
    build(s, p) {
      const { edges, nodes, skipped } = readGraph(p.edges, false);
      const adj = toAdj(nodes, edges, false);
      drawGraph(s, nodes, edges, false);
      const pile = tokenRow(s, 'c', 'call pile', 282, { mark: 'top', tone: 'warn' });
      const visited = new Set();
      let found = null, gap = 3, turn = 0, looks = 0;
      const F = (say, line, ask, vars) => {
        gap = ask ? 0 : gap + 1;
        s.snap(say, { line, ask: ask || null, vars: Object.assign({ 'edge checks': looks }, vars || {}) });
      };
      if (!nodes.length) {
        s.text('none', 280, 120, 'A graph with no nodes', { size: 16, tone: 'muted' });
        F('With no nodes and no edges, there is no cycle.' + skipNote(skipped), 10);
        return;
      }
      F('Start a check from each node that has no mark yet.' + skipNote(skipped), 1);

      const check = (node, came) => {
        visited.add(node);
        pile.push(node);
        s.tone('n' + node, 'active');
        F(`check(${node}) starts. ${came ? `It came from ${came}.` : 'It came from nowhere.'}`, 2, null, { node, came: came || 'None' });
        for (const o of adj[node]) {
          looks += 1;
          if (o === came) {
            F(`${o} is where ${node} came from.`, 4, gap >= 3 ? askIt(`${o} has a mark, but ${node} came from it. Is this a cycle?`, 'No, it is the same edge', ['Yes, it has a mark', 'Only if it is the start'],
              `A two-way edge shows up in both lists. Going back along it does not make a cycle.`, turn++) : null, { node, came });
            F(`Same edge, so skip ${o}.`, 5, null, { node, came });
            continue;
          }
          if (visited.has(o)) {
            F(`${node} looks at ${o}, which has a mark.`, 6, gap >= 2 ? askIt(`${o} has a mark, and ${node} did not come from it. Is this a cycle?`, 'Yes, there is a second way to it', ['No, skip it', 'Only if it is the start'],
              `You reached ${o} once by another route. This new edge makes a loop.`, turn++) : null, { node, came: came || 'None' });
            s.tone(eid(node, o), 'bad');
            s.tone(['n' + node, 'n' + o], 'bad');
            F(`Cycle found: this edge joins ${node} back to ${o}.`, 7, null, { node, came: came || 'None' });
            found = [node, o];
            return true;
          }
          s.tone('n' + node, 'warn');
          s.tone(eid(node, o), 'ok');
          F(`${o} has no mark, so check(${node}) calls check(${o}).`, 8, null, { node, came: came || 'None' });
          if (check(o, node)) return true;
          s.tone('n' + node, 'active');
        }
        pile.pop();
        s.tone('n' + node, 'ok');
        F(`check(${node}) finds no cycle, and comes off the pile.`, 10, null, { node, came: came || 'None' });
        return false;
      };
      for (const n of nodes) {
        if (visited.has(n)) continue;
        if (check(n, null)) break;
      }
      s.text('res', 280, 328, found ? `Answer: True. There is a cycle.` : 'Answer: False. There is no cycle.', { size: 15, weight: 700, tone: found ? 'bad' : 'ok' });
      F(found ? 'The answer is True. The search can stop now.' : 'Every node has a mark, and no extra edge turned up. So there is no cycle.', found ? 7 : 10);
    },
  });

  Viz.register('m21-cycle-arrows', {
    title: 'Arrows: a cycle must reach your own path',
    size: [560, 358],
    code: py`
      def check(node):
          visited.add(node)
          on_path.add(node)
          for other in graph[node]:
              if other in on_path:
                  return True
              if other not in visited:
                  if check(other):
                      return True
          on_path.remove(node)
          return False
    `,
    inputs: [
      { key: 'edges', label: 'Arrows (A>B)', type: 'text', value: 'A>B, A>C, B>D, C>D', size: 22 },
    ],
    tryInputs: [
      { edges: '' }, { edges: 'A' }, { edges: 'A>B' }, { edges: 'A>B, B>A' }, { edges: 'A>B, A>C, B>D, C>D, D>A' }, { edges: 'A>B, B>C, C>A' },
      { edges: 'A>B, A>B' }, { edges: 'pizza' }, { edges: 'E>F, A>B, B>C, C>D, D>E' },
    ],
    build(s, p) {
      const { edges, nodes, skipped } = readGraph(p.edges, true);
      const adj = toAdj(nodes, edges, true);
      drawGraph(s, nodes, edges, true);
      const path = tokenRow(s, 'p', 'on_path', 282, { mark: 'top', tone: 'warn' });
      const seen = tokenRow(s, 'v', 'visited', 332, { tone: 'ok' });
      const visited = new Set();
      let found = false, gap = 3, turn = 0, looks = 0, askedDone = false;
      const F = (say, line, ask, node) => {
        gap = ask ? 0 : gap + 1;
        s.snap(say, { line, ask: ask || null, vars: node ? { node, 'edge checks': looks } : { 'edge checks': looks } });
      };
      if (!nodes.length) {
        s.text('none', 280, 120, 'A graph with no nodes', { size: 16, tone: 'muted' });
        F('With no nodes and no arrows, there is no cycle.' + skipNote(skipped), 11);
        return;
      }
      F('Start from each node that has no mark. Watch the 2 rows below.' + skipNote(skipped), 1);

      const check = node => {
        visited.add(node);
        path.push(node);
        seen.push(node);
        s.tone('n' + node, 'active');
        F(`check(${node}) starts. ${node} joins visited and on_path.`, 3, null, node);
        for (const o of adj[node]) {
          looks += 1;
          if (path.has(o)) {
            F(`${node} points at ${o}.`, 5, gap >= 2 ? askIt(`${o} is on the path you are walking now. Is this a cycle?`, 'Yes, the arrows lead back to it', ['No, skip it', 'Only if it is the first node'],
              `You walked from ${o} to ${node}, and this arrow goes back to ${o}. That is a loop.`, turn++) : null, node);
            s.tone(eid(node, o, true), 'bad');
            s.tone(['n' + node, 'n' + o], 'bad');
            F(`Cycle found: the arrow from ${node} goes back to ${o}, which is on the path.`, 6, null, node);
            found = true;
            return true;
          }
          if (visited.has(o)) {
            F(`${node} points at ${o}. It is in visited, but not on the path.`, 7, gap >= 2 ? askIt(`${o} was finished earlier, on another path. Is this a cycle?`, 'No, you can never get back from it', ['Yes, it has been visited', 'Yes, it has 2 arrows in'],
              `${o} is finished, and it did not lead back here. 2 arrows into one node is not a loop.`, turn++) : null, node);
            F(`No cycle here. Skip ${o}, because it is already done.`, 7, null, node);
            continue;
          }
          s.tone('n' + node, 'warn');
          s.tone(eid(node, o, true), 'ok');
          F(`${o} is new, so check(${node}) calls check(${o}).`, 8, null, node);
          if (check(o)) return true;
          s.tone('n' + node, 'active');
        }
        if (!askedDone) {
          askedDone = true;
          F(`${node} has no more arrows to follow.`, 10, askIt(`${node} is done. Which row does it leave?`, 'on_path only', ['visited only', 'Both rows'],
            `You are no longer walking through ${node}, so it leaves on_path. It stays in visited, so nobody checks it again.`, turn++), node);
        }
        path.pop();
        s.tone('n' + node, 'ok');
        F(`${node} is done. It leaves on_path, but it stays in visited.`, 10, null, node);
        return false;
      };
      for (const n of nodes) {
        if (visited.has(n)) continue;
        if (check(n)) break;
      }
      F(found ? 'The answer is True. Now try removing the arrow that made the loop.' : 'The answer is False. No arrow reached the path. Now add an arrow that goes back up.', found ? 6 : 11);
    },
  });

  // ---------------------------------------------------------------- lesson 21.6
  const BOXES = { socks: [70, 40], pants: [70, 106], shirt: [70, 172], shoes: [280, 30], belt: [280, 96], coat: [490, 160] };
  const DRESS = [['socks', 'shoes'], ['pants', 'shoes'], ['pants', 'belt'], ['shirt', 'belt'], ['shirt', 'coat'], ['belt', 'coat']];

  Viz.register('m21-topo', {
    title: 'Topological sort: free jobs go first',
    size: [560, 330],
    code: py`
      need = count_needs(graph)
      queue = deque(free_jobs(need))
      order = []
      while len(queue) > 0:
          job = queue.popleft()
          order.append(job)
          for later in graph[job]:
              need[later] -= 1
              if need[later] == 0:
                  queue.append(later)
      if len(order) < len(graph):
          print("Cycle: no order works")
    `,
    inputs: [
      { key: 'plan', label: 'Plan', type: 'select', value: 'dress', options: [
        { label: 'Getting dressed', value: 'dress' },
        { label: 'Rules that clash', value: 'clash' },
        { label: 'Type my own', value: 'own' },
      ] },
      { key: 'edges', label: 'My own arrows (A>B)', type: 'text', value: 'A>B, A>C, B>D, C>D', size: 20 },
    ],
    tryInputs: [
      { plan: 'dress', edges: '' }, { plan: 'clash', edges: '' }, { plan: 'own', edges: '' }, { plan: 'own', edges: 'A' }, { plan: 'own', edges: 'A, B, C' },
      { plan: 'own', edges: 'A>B, B>A' }, { plan: 'own', edges: 'A>B, A>B' }, { plan: 'own', edges: 'A>B, B>C, C>A, D>A' }, { plan: 'own', edges: 'oops' },
      { plan: 'junk', edges: 'A>B' }, { plan: 'own', edges: 'A>B, A>C, A>D, A>E, A>F, B>C, B>D, B>E, B>F, C>D, C>E, C>F' },
    ],
    build(s, p) {
      const own = p.plan === 'own';
      let jobs, rules, skipped = 0;
      if (own) {
        const g = readGraph(p.edges, true);
        jobs = g.nodes; rules = g.edges; skipped = g.skipped;
      } else {
        jobs = Object.keys(BOXES);
        rules = DRESS.slice();
        if (p.plan === 'clash') rules.push(['shoes', 'pants']);
      }
      const nid = j => 'n' + j;
      const place = j => (own ? SPOT[j] : BOXES[j]);
      jobs.forEach(j => s.box(nid(j), place(j)[0], place(j)[1], j, { w: own ? 44 : 66, h: 38, size: own ? 18 : 14 }));
      rules.forEach(([a, b]) => {
        const twin = rules.some(([x, y]) => x === b && y === a);
        s.edge(`e${a}_${b}`, nid(a), nid(b), { bend: twin ? 20 : 0 });
      });
      const graph = {}, need = {};
      jobs.forEach(j => { graph[j] = []; need[j] = 0; });
      rules.forEach(([a, b]) => { graph[a].push(b); need[b] += 1; });
      const badge = j => 'd' + j;
      const off = own ? [26, -11] : [38, -18];
      const ready = tokenRow(s, 'q', 'queue', 258, { mark: 'front', cell: own ? 40 : 58, tone: 'warn', size: own ? 17 : 14, x0: 110 });
      const out = tokenRow(s, 'o', 'order', 308, { cell: own ? 40 : 58, tone: 'ok', size: own ? 17 : 14, x0: 110 });
      const done = new Set();
      let gap = 3, turn = 0, drops = 0;
      const F = (say, line, ask, job) => {
        gap = ask ? 0 : gap + 1;
        s.snap(say, { line, ask: ask || null, vars: job ? { job, 'arrow steps': drops } : { 'arrow steps': drops } });
      };

      if (!jobs.length) {
        s.text('none', 280, 120, 'No jobs at all', { size: 16, tone: 'muted' });
        F('With no jobs, the empty order is the right answer.' + skipNote(skipped), 4);
        return;
      }
      F('Each arrow means: do this job before that job.' + skipNote(skipped), 1);

      jobs.forEach(j => s.circle(badge(j), place(j)[0] + off[0], place(j)[1] + off[1], need[j], { r: 11, size: 13, tone: need[j] ? 'default' : 'ok' }));
      const free = jobs.filter(j => need[j] === 0);
      const busy = jobs.filter(j => need[j] > 0);
      const firstAsk = free.length
        ? askIt('The small circle counts the arrows coming in. Which job can start right now?', free[0],
          busy.length ? [busy[0], busy[busy.length - 1]] : ['No job can', 'Only the last one'],
          `${free[0]} has 0 in its circle. Nothing has to come before it.`, jobs.length)
        : askIt('Every circle is above 0. Which job can start right now?', 'None of them', [jobs[0], jobs[jobs.length - 1]],
          'Each job waits for another job. So nothing can start.', jobs.length);
      F('The small circle on each job counts the arrows coming in.', 1, firstAsk);

      free.forEach(j => ready.push(j));
      free.forEach(j => s.tone(nid(j), 'warn'));
      F(free.length ? `Jobs with 0 in the circle join the queue: ${words(free)}.` : 'No job has 0 in its circle. So the queue starts empty.', 2);

      while (ready.size()) {
        const waiting = ready.values();
        if (waiting.length > 1 && gap >= 4) {
          F(`The queue holds ${words(waiting)}.`, 4, askIt('Which job goes next in the order?', waiting[0], [waiting[waiting.length - 1], 'The job with the most arrows'],
            'The front of the queue goes first. Any job in the queue is safe to do now.', turn++));
        }
        const job = ready.shift();
        out.push(job);
        done.add(job);
        s.tone(nid(job), 'ok');
        s.set(badge(job), { tone: 'muted' });
        F(`${job} leaves the queue and goes in the order.`, 6, null, job);
        for (const later of graph[job]) {
          const after = need[later] - 1;
          if (gap >= 2) {
            F(`${job} is done, and an arrow points to ${later}.`, 7, askIt(`${later} has ${need[later]} in its circle. What is it after this arrow?`, after, [need[later], after - 1 < 0 ? after + 2 : after - 1],
              `${job} is done, so ${later} waits for one less job.`, turn++), job);
          }
          need[later] = after;
          drops += 1;
          s.tone(`e${job}_${later}`, 'muted');
          s.set(badge(later), { text: after, tone: after === 0 ? 'ok' : 'default' });
          if (after === 0) {
            ready.push(later);
            s.tone(nid(later), 'warn');
            F(`${later} now needs nothing, so it joins the queue.`, 10, null, job);
          } else {
            F(`${later} still waits for ${many(after, 'more job')}.`, 8, null, job);
          }
        }
      }

      const left = jobs.filter(j => !done.has(j));
      if (left.length) {
        F(`The queue is empty, but ${many(left.length, 'job')} still ${left.length === 1 ? 'waits' : 'wait'}.`, 11, askIt('The queue is empty and jobs are left. What does that mean?', 'The rules have a cycle, so no order works', ['Run the loop one more time', 'Those jobs can go in any order'],
          'Each job left waits for another job left. So nobody can go first, and that means a cycle is there.', turn++));
        left.forEach(j => s.tone(nid(j), 'bad'));
        s.text('res', 450, 258, 'No order works.', { size: 15, weight: 700, tone: 'bad' });
        F(`Stuck: ${words(left)}. Each one waits on another. Topological sort fails on a cycle.`, 12);
      } else {
        s.text('res', 460, 258, 'All jobs placed.', { size: 15, weight: 700, tone: 'ok' });
        F(`Every job is in the order, and every rule holds. It took ${many(drops, 'arrow step')}.`, 11);
      }
    },
  });
})();
