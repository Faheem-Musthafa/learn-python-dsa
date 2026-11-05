/* Visuals for module 24. Names start with the module id.
 * Node spots are fixed by hand, so the map stays still while the search moves.
 * The heap is a real heapq list, in the same order Python keeps it.
 * Every input may be empty or junk, so each build must cope with that.
 */
(function () {
  // ------------------------------------------------------------- small helpers
  const whole = (v, lo, hi, fallback) => {
    let n = Math.round(Number(v));
    if (v === '' || v == null || !Number.isFinite(n)) n = fallback;
    return Math.max(lo, Math.min(hi, n));
  };
  const pick = (v, list, fallback) => {
    const t = String(v == null ? '' : v).trim().toUpperCase();
    return list.includes(t) ? t : fallback;
  };

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

  // ------------------------------------------------------- the bus map, 5 stops
  const STOPS = ['A', 'B', 'C', 'D', 'E'];
  const ROADS = [['A', 'B', 4], ['A', 'C', 1], ['B', 'C', 2], ['B', 'D', 1], ['C', 'D', 5], ['D', 'E', 3]];
  const ROAD_NAMES = ROADS.map(r => r[0] + '-' + r[1]);
  const SPOT = { A: [48, 128], B: [150, 46], C: [150, 212], D: [262, 128], E: [292, 234] };

  /* The roads after the learner's changes. Bad input falls back to the normal map. */
  function readRoads(p) {
    const name = pick(p.edge, ROAD_NAMES, null);
    const typed = p.fare !== '' && p.fare != null && Number.isFinite(Number(p.fare));
    const fare = typed ? whole(p.fare, p.lowest || 0, 20, 0) : null;
    const closed = pick(p.closed, ROAD_NAMES, null);
    return ROADS
      .filter(r => r[0] + '-' + r[1] !== closed)
      .map(r => (r[0] + '-' + r[1] === name && fare != null ? [r[0], r[1], fare] : r.slice()));
  }
  /* A dict of sorted lists, the same as the Python in the lessons. */
  function toAdj(stops, roads, directed) {
    const adj = {};
    stops.forEach(n => { adj[n] = []; });
    roads.forEach(([a, b, c]) => {
      adj[a].push([b, c]);
      if (!directed) adj[b].push([a, c]);
    });
    stops.forEach(n => adj[n].sort((x, y) => (x[0] < y[0] ? -1 : 1)));
    return adj;
  }
  const eid = (a, b, directed) => 'e' + (directed ? a + b : [a, b].sort().join(''));

  function drawMap(s, stops, roads, spot, directed) {
    stops.forEach(n => s.circle('n' + n, spot[n][0], spot[n][1], n, { r: 22 }));
    roads.forEach(([a, b, c]) => s.edge(eid(a, b, directed), 'n' + a, 'n' + b, { arrow: !!directed, label: String(c) }));
  }

  /* Dijkstra with a table and a finished set, with no pictures. */
  function solve(adj, start) {
    const best = { [start]: 0 }, from = {}, done = new Set();
    for (;;) {
      const open = Object.keys(best).filter(n => !done.has(n)).sort((a, b) => best[a] - best[b] || (a < b ? -1 : 1));
      if (!open.length) break;
      const node = open[0];
      done.add(node);
      adj[node].forEach(([o, c]) => {
        const nw = best[node] + c;
        if (!(o in best) || nw < best[o]) { best[o] = nw; from[o] = node; }
      });
    }
    return { best, from };
  }
  function routeTo(from, start, goal) {
    const path = [goal];
    while (path[0] !== start) path.unshift(from[path[0]]);
    return path;
  }
  const costOf = (adj, path) => path.slice(1).reduce((t, n, i) => t + adj[path[i]].find(e => e[0] === n)[1], 0);

  /* A table with one row per stop. The value box may hold a number or a ?. */
  function tableKit(s, stops, o = {}) {
    const x = o.x == null ? 334 : o.x, y0 = o.y0 == null ? 62 : o.y0, rowH = o.rowH || 38;
    const Y = i => y0 + i * rowH;
    s.text('tabH', x + 42, 24, o.title || 'best so far', { size: 14, weight: 700 });
    stops.forEach((n, i) => {
      s.text('tabL' + n, x, Y(i), n, { size: 15, weight: 700 });
      s.box('tabV' + n, x + 42, Y(i), '?', { w: 54, h: rowH - 6, size: 17, tone: 'muted' });
    });
    return {
      set(n, v, tone) {
        s.set('tabV' + n, { text: v, tone: tone || 'warn' });
        s.pulse('tabV' + n);
      },
      done(n) {
        s.set('tabV' + n, { tone: 'ok' });
        s.text('tabD' + n, x + 74, Y(stops.indexOf(n)), o.doneWord || 'done', { size: 12, anchor: 'start', weight: 700, tone: 'ok' });
      },
      note(n, word, tone) {
        const id = 'tabD' + n;
        if (s.has(id)) s.set(id, { text: word, tone: tone || 'muted' });
        else s.text(id, x + 74, Y(stops.indexOf(n)), word, { size: 12, anchor: 'start', weight: 700, tone: tone || 'muted' });
      },
      calm(n) { s.set('tabV' + n, { tone: 'default' }); },
    };
  }

  // ------------------------------------------------------------- a real heapq
  const less = (a, b) => {
    for (let i = 0; i < a.key.length; i += 1) {
      if (a.key[i] !== b.key[i]) return a.key[i] < b.key[i];
    }
    return false;
  };
  function siftDown(h, start, pos) {
    const item = h[pos];
    while (pos > start) {
      const pp = (pos - 1) >> 1;
      if (less(item, h[pp])) { h[pos] = h[pp]; pos = pp; continue; }
      break;
    }
    h[pos] = item;
  }
  function siftUp(h, pos) {
    const end = h.length, start = pos, item = h[pos];
    let child = 2 * pos + 1;
    while (child < end) {
      const right = child + 1;
      if (right < end && !less(h[child], h[right])) child = right;
      h[pos] = h[child];
      pos = child;
      child = 2 * pos + 1;
    }
    h[pos] = item;
    siftDown(h, start, pos);
  }
  const heapPush = (h, x) => { h.push(x); siftDown(h, 0, h.length - 1); };
  const heapPop = h => {
    const last = h.pop();
    if (h.length) { const ret = h[0]; h[0] = last; siftUp(h, 0); return ret; }
    return last;
  };

  /* A column of boxes that is the heap list. Spot 0 is the top. */
  function heapColumn(s, biggest) {
    const rowH = Math.min(36, Math.floor(238 / Math.max(1, biggest)));
    const x = 500, y0 = 58;
    const list = [];
    let serial = 0;
    s.text('heapH', 556, 24, 'heap, top first', { size: 14, anchor: 'end', weight: 700 });
    s.text('heapE', x, y0, 'empty', { size: 14, tone: 'muted' });
    const tidy = () => {
      list.forEach((e, i) => s.set(e.id, { x, y: y0 + i * rowH }));
      s.set('heapE', { opacity: list.length ? 0 : 1 });
    };
    return {
      push(cost, node) {
        const id = 'hp' + serial++;
        s.box(id, x, y0 + list.length * rowH, `${cost} ${node}`, { w: 62, h: rowH - 5, size: 17, tone: 'warn' });
        heapPush(list, { key: [cost, node], id });
        tidy();
      },
      pop() {
        const e = heapPop(list);
        s.del(e.id);
        tidy();
        return e;
      },
      top: () => list[0],
      size: () => list.length,
      entries: () => list.slice(),
      calm() { list.forEach(e => s.tone(e.id, 'default')); },
    };
  }

  /* A dry run, to size the heap column before anything is drawn. */
  function biggestHeap(adj, start) {
    const h = [], best = { [start]: 0 }, done = new Set();
    let most = 1;
    heapPush(h, { key: [0, start] });
    while (h.length) {
      const { key: [c, n] } = heapPop(h);
      if (done.has(n)) continue;
      done.add(n);
      adj[n].forEach(([o, p]) => {
        const nw = c + p;
        if (!(o in best) || nw < best[o]) {
          best[o] = nw;
          heapPush(h, { key: [nw, o] });
          most = Math.max(most, h.length);
        }
      });
    }
    return most;
  }

  // ---------------------------------------------------------------- lesson 24.1
  Viz.register('m24-bfs-wrong', {
    title: 'BFS finds few rides, not few coins',
    size: [560, 276],
    inputs: [
      { key: 'goal', label: 'Go from A to', type: 'select', value: 'D', options: ['B', 'C', 'D', 'E'] },
      { key: 'edge', label: 'Change a fare', type: 'select', value: 'A-B', options: ROAD_NAMES },
      { key: 'fare', label: 'New fare', type: 'number', value: 4, min: 1, max: 20 },
    ],
    tryInputs: [
      { goal: 'B', edge: 'A-B', fare: 1 }, { goal: 'C', edge: 'A-C', fare: 20 }, { goal: 'E', edge: 'D-E', fare: 20 },
      { goal: 'D', edge: 'B-D', fare: 1 }, { goal: 'D', edge: 'C-D', fare: 1 }, { goal: '', edge: '', fare: '' }, { goal: 'Z', edge: 'cat', fare: 'x' },
      { goal: 'E', edge: 'B-C', fare: 20 }, { goal: 'D', edge: 'A-C', fare: 20 },
    ],
    build(s, p) {
      const goal = pick(p.goal, ['B', 'C', 'D', 'E'], 'D');
      const roads = readRoads({ edge: p.edge, fare: p.fare, lowest: 1 });
      const adj = toAdj(STOPS, roads, false);
      drawMap(s, STOPS, roads, SPOT, false);
      s.text('bfsL', 350, 66, 'BFS route', { size: 14, anchor: 'start', weight: 700 });
      s.text('bfsR', 350, 90, '?', { size: 15, anchor: 'start', mono: true });
      s.text('bfsC', 350, 112, '', { size: 14, anchor: 'start' });
      s.text('bestL', 350, 164, 'Cheapest route', { size: 14, anchor: 'start', weight: 700 });
      s.text('bestR', 350, 188, '?', { size: 15, anchor: 'start', mono: true });
      s.text('bestC', 350, 210, '', { size: 14, anchor: 'start' });

      // Real BFS, with neighbours in A to Z order.
      const from = {}, layers = [['A']], seen = new Set(['A']);
      while (!seen.has(goal)) {
        const next = [];
        layers[layers.length - 1].forEach(n => adj[n].forEach(([o]) => {
          if (!seen.has(o)) { seen.add(o); from[o] = n; next.push(o); }
        }));
        if (!next.length) break;
        layers.push(next);
      }
      const bfsPath = routeTo(from, 'A', goal);
      const rides = bfsPath.length - 1, bfsCost = costOf(adj, bfsPath);
      const { best, from: cheapFrom } = solve(adj, 'A');
      const cheapPath = routeTo(cheapFrom, 'A', goal);
      const cheap = best[goal];

      s.tone('nA', 'active');
      s.snap(`The number on each line is a fare in coins. You want the cheapest trip from A to ${goal}.`, {
        vars: { layer: 0 },
        ask: askIt(`BFS counts edges and ignores fares. How many rides will its route use?`, rides, [rides + 1, rides + 2, Math.max(1, rides - 1)],
          `${goal} is in layer ${rides}, so BFS gets there in ${rides} ride${rides === 1 ? '' : 's'}. It never looks at a fare.`, bfsCost),
      });
      layers.slice(1).forEach((layer, i) => {
        layer.forEach(n => s.tone('n' + n, 'warn'));
        s.snap(`Layer ${i + 1}: BFS finds ${layer.join(' and ')}.`, { vars: { layer: i + 1 } });
      });
      STOPS.forEach(n => { if (!bfsPath.includes(n)) s.tone('n' + n, 'muted'); else s.tone('n' + n, 'accent'); });
      bfsPath.slice(1).forEach((n, i) => s.tone(eid(bfsPath[i], n), 'accent'));
      s.set('bfsR', { text: bfsPath.join(' ') });
      s.snap(`BFS reached ${goal}, so it stops. Its route is ${bfsPath.join(' ')}.`, {
        vars: { rides },
        ask: askIt('Add up the fares on that route. How many coins is it?', bfsCost, [rides, bfsCost + 1, Math.max(0, bfsCost - 2)],
          `The fares on ${bfsPath.join(' ')} add up to ${bfsCost}. The ride count, ${rides}, is a different number.`, rides + 1),
      });
      s.set('bfsC', { text: `${rides} ride${rides === 1 ? '' : 's'}, ${bfsCost} coins` });
      if (cheap < bfsCost) {
        s.snap(`BFS says the trip costs ${bfsCost} coins. Now look at another route.`, {
          vars: { rides, coins: bfsCost },
          ask: askIt(`Try the route ${cheapPath.join(' ')}. How many coins is it?`, cheap, [bfsCost, cheap + 1, cheapPath.length - 1],
            `The fares on ${cheapPath.join(' ')} add up to ${cheap}. That beats ${bfsCost}.`, cheap),
        });
        roads.forEach(([a, b]) => s.tone(eid(a, b), 'muted'));
        STOPS.forEach(n => s.tone('n' + n, cheapPath.includes(n) ? 'ok' : 'muted'));
        bfsPath.slice(1).forEach((n, i) => s.set(eid(bfsPath[i], n), { dashed: true }));
        cheapPath.slice(1).forEach((n, i) => s.set(eid(cheapPath[i], n), { tone: 'ok', dashed: false }));
        s.set('bestR', { text: cheapPath.join(' ') });
        s.set('bestC', { text: `${cheapPath.length - 1} rides, ${cheap} coins` });
        s.tone('bestL', 'ok');
        const more = cheapPath.length - 1 > rides ? 'More rides, fewer coins.' : 'The same rides, fewer coins.';
        s.snap(`${more} BFS gave the wrong answer, because it never read the fares.`, { vars: { 'BFS coins': bfsCost, 'cheapest coins': cheap } });
      } else {
        s.set('bestR', { text: bfsPath.join(' ') });
        s.set('bestC', { text: `${bfsCost} coins, the same` });
        s.tone('bestL', 'ok');
        s.snap(`This time no route beats ${bfsCost} coins. BFS got lucky, as it never read the fares.`, { vars: { 'BFS coins': bfsCost, 'cheapest coins': cheap } });
      }
      s.snap('BFS answers "fewest rides". For "fewest coins", you need a search that reads the fares. Try new fares.');
    },
  });

  Viz.register('m24-cheapest-first', {
    title: 'Finish the cheapest stop next',
    size: [560, 276],
    inputs: [
      { key: 'start', label: 'Start at', type: 'select', value: 'A', options: STOPS },
      { key: 'edge', label: 'Change a fare', type: 'select', value: 'B-C', options: ROAD_NAMES },
      { key: 'fare', label: 'New fare', type: 'number', value: 2, min: 0, max: 20 },
    ],
    tryInputs: [
      { start: 'E', edge: 'D-E', fare: 0 }, { start: 'C', edge: 'A-C', fare: 20 }, { start: 'D', edge: 'B-D', fare: 0 }, { start: 'B', edge: 'A-B', fare: 1 },
      { start: '', edge: '', fare: '' }, { start: 'Q', edge: 'dog', fare: 'x' }, { start: 'A', edge: 'B-C', fare: 3 }, { start: 'A', edge: 'A-B', fare: 1 },
    ],
    build(s, p) {
      const start = pick(p.start, STOPS, 'A');
      const roads = readRoads(p);
      const adj = toAdj(STOPS, roads, false);
      drawMap(s, STOPS, roads, SPOT, false);
      const tab = tableKit(s, STOPS, { x: 366, rowH: 40 });
      const best = { [start]: 0 }, from = {}, done = new Set();
      let turn = 0, tries = 0, gap = 2, lastEdge = null;
      const F = (say, ask) => {
        gap = ask ? 0 : gap + 1;
        s.snap(say, { ask: ask || null, vars: { finished: done.size, 'edge tries': tries } });
      };
      tab.set(start, 0);
      s.tone('n' + start, 'warn');
      F(`Write 0 for ${start}, the start. A ? means no route found yet.`);

      for (;;) {
        const open = STOPS.filter(n => n in best && !done.has(n)).sort((a, b) => best[a] - best[b] || (a < b ? -1 : 1));
        if (!open.length) break;
        const node = open[0];
        if (lastEdge) { s.tone(lastEdge, 'default'); lastEdge = null; }
        const tie = open.length > 1 && best[open[1]] === best[node];
        if (open.length > 1 && !tie) {
          F(`Open stops: ${open.map(n => `${n} at ${best[n]}`).join(', ')}.`, askIt('Which stop do you finish next?', node, open.slice(1),
            `${node} has the lowest cost, ${best[node]}. Any other route must pay at least that, so nothing can beat it.`, turn++));
        }
        done.add(node);
        STOPS.forEach(n => { if (n in best && !done.has(n)) tab.calm(n); });
        tab.done(node);
        s.tone('n' + node, 'ok');
        F(tie ? `${node} ties for the lowest cost, ${best[node]}. A tie can go either way. Finish ${node}.` : `${node} has the lowest cost, ${best[node]}. Finish it. Its cost is now final.`);
        adj[node].forEach(([o, c]) => {
          if (done.has(o)) return;
          tries += 1;
          const nw = best[node] + c;
          const better = !(o in best) || nw < best[o];
          if (lastEdge) s.tone(lastEdge, 'default');
          lastEdge = eid(node, o);
          s.tone(lastEdge, 'accent');
          if (gap >= 2) {
            F(`Try the ride from ${node} to ${o}. Its fare is ${c}.`, askIt(`${node} costs ${best[node]}. What does ${o} cost through ${node}?`, nw, [c, best[node], nw + 1],
              `Add the cost so far to the fare: ${best[node]} + ${c} = ${nw}.`, turn++));
          }
          if (better) {
            const old = best[o];
            best[o] = nw;
            from[o] = node;
            tab.set(o, nw);
            if (!done.has(o)) s.tone('n' + o, 'warn');
            F(old == null ? `${best[node]} + ${c} = ${nw}. ${o} now has a cost, but it is not final yet.` : `${best[node]} + ${c} = ${nw}. That beats ${old}, so ${o} gets cheaper. Good thing it was not final.`);
          } else {
            F(`${best[node]} + ${c} = ${nw}. ${o} already has ${best[o]}, so nothing changes.`);
          }
        });
      }
      if (lastEdge) s.tone(lastEdge, 'default');
      roads.forEach(([a, b]) => s.set(eid(a, b), { tone: 'muted', dashed: true }));
      Object.keys(from).forEach(o => s.set(eid(from[o], o), { tone: 'ok', dashed: false }));
      F(`Every stop is finished. The solid lines are the cheapest routes from ${start}. Now change a fare.`);
    },
  });

  // ---------------------------------------------------------------- lesson 24.2
  /* Plays Dijkstra with a heap, a table and a finished set. Lesson 24.3 reuses it. */
  function playDijkstra(s, o) {
    const { stops, adj, start, directed } = o;
    const tab = tableKit(s, stops);
    const heap = heapColumn(s, biggestHeap(adj, start));
    s.text('news', 20, 282, '', { size: 15, anchor: 'start', weight: 700, tone: 'bad' });
    const best = { [start]: 0 }, from = {}, finished = new Set();
    let pops = 0, stale = 0, checks = 0, gap = 3, turn = 0, lastEdge = null, prev = null;
    let askedStale = false, askedQuiet = false, askedOld = false;
    const F = (say, line, ask, extra) => {
      gap = ask ? 0 : gap + 1;
      s.snap(say, { line, ask: ask || null, vars: Object.assign({}, extra, { pops, stale, 'edge checks': checks }) });
    };
    const edgeOf = (a, b) => eid(a, b, directed);
    const clearEdge = () => { if (lastEdge) { s.tone(lastEdge, 'default'); lastEdge = null; } };

    tab.set(start, 0);
    heap.push(0, start);
    s.tone('n' + start, 'warn');
    F(`Start at ${start}. It costs 0, so (0, ${start}) goes in the heap.`, 3, adj[start].length ? null : askIt(
      `${start} has no roads. What happens after (0, ${start}) comes off?`, 'The heap is empty, so the search stops', [`${start} goes back in the heap`, 'Python gives an error'],
      `With no edges to try, nothing joins the heap. The table keeps only ${start}.`, 1));

    while (heap.size()) {
      const [cost, node] = heap.top().key;
      clearEdge();
      if (prev) { s.tone('n' + prev, 'ok'); prev = null; }
      stops.forEach(n => { if (n in best) s.tone('tabV' + n, finished.has(n) ? 'ok' : 'default'); });
      heap.calm();
      if (finished.has(node)) {
        const cheaper = cost <= best[node] && o.brokenPromise;
        s.tone(heap.top().id, 'bad');
        s.set('news', { text: '' });
        if (cheaper) {
          F(`The top is (${cost}, ${node}). This cost is lower, but ${node} is finished.`, 6,
            askIt(`The code asks if ${node} is in finished. What does it do with (${cost}, ${node})?`, `Skips it, as ${node} is finished`, [`Finishes ${node} again`, `Tells every neighbour of ${node}`],
              'That line never reads the cost. It treats any entry for a finished stop as stale.', turn++));
        } else {
          F(`The top is (${cost}, ${node}). But ${node} finished at ${best[node]}, so this entry is old.`, 6,
            askedStale && gap < 3 ? null : askIt('This is a stale entry. What should the code do with it?', 'Skip it', [`Finish ${node} again`, `Put ${cost} in the table`],
              `${node} already has its final cost, ${best[node]}. An old entry with a higher cost has nothing new to say.`, turn++));
        }
        askedStale = true;
        heap.pop();
        pops += 1;
        stale += 1;
        if (cheaper) {
          s.set('news', { text: `Lost: (${cost}, ${node}) was thrown away` });
          F(`(${cost}, ${node}) is thrown away. So the stops after ${node} never hear about its lower cost.`, 8, null, { cost, node });
        } else {
          s.set('news', { text: `Stale: (${cost}, ${node}) skipped` });
          F(`(${cost}, ${node}) comes off and gets skipped. The table stays as it is.`, 8, null, { cost, node });
        }
        continue;
      }
      s.set('news', { text: '' });
      const entries = heap.entries();
      if (entries.length > 1 && gap >= 3) {
        const others = entries.slice(1).map(e => `(${e.key[0]}, ${e.key[1]})`);
        F(`The heap holds ${entries.length} entries.`, 5, askIt('Which entry comes off next?', `(${cost}, ${node})`, others.slice(-2),
          'A heap hands you the smallest. Tuples compare the cost first, then the name.', turn++));
      }
      heap.pop();
      pops += 1;
      finished.add(node);
      s.tone('n' + node, 'active');
      tab.done(node);
      prev = node;
      F(`(${cost}, ${node}) comes off the top. ${node} is finished at ${cost}.`, 9, null, { cost, node });

      let quiet = [];
      const flushQuiet = () => {
        if (!quiet.length) return;
        clearEdge();
        const names = quiet.map(q => q[0]).join(' and ');
        const nums = quiet.map(q => `${q[0]} at ${best[q[0]]}`).join(', ');
        if (gap >= 3 || (!askedQuiet && gap >= 2)) {
          askedQuiet = true;
          F(`${node} now tries ${names}.`, 11, askIt(`From ${node}, ${quiet[0][0]} would cost ${quiet[0][1]}. The table says ${best[quiet[0][0]]}. What happens?`, 'Nothing changes', ['The table gets the new cost', 'The search stops'],
            'Only a cheaper cost changes the table. This one is not cheaper.', turn++), { cost, node });
        }
        F(`Nothing cheaper for ${names}. The table keeps ${nums}.`, 12, null, { cost, node });
        quiet = [];
      };
      adj[node].forEach(([other, price]) => {
        checks += 1;
        const nw = cost + price;
        const known = other in best;
        if (known && !(nw < best[other])) { quiet.push([other, nw]); return; }
        flushQuiet();
        lastEdge = edgeOf(node, other);
        s.tone(lastEdge, 'accent');
        if (known && !askedOld) {
          askedOld = true;
          F(`${node} tries ${other}. The new cost, ${nw}, beats ${best[other]}.`, 12, askIt(`The heap holds (${best[other]}, ${other}). What happens to that old entry now?`, 'It stays in the heap', ['It leaves the heap', `It changes to (${nw}, ${other})`],
            'heapq has no tool to change an item in the middle. So you push a new entry, and the old one waits.', turn++), { cost, node });
        } else if (gap >= 3) {
          F(`${node} tries the ride to ${other}, with fare ${price}.`, 11, askIt(`${node} costs ${cost}. The fare to ${other} is ${price}. What is the new cost?`, nw, [price, cost, nw + 1],
            `Add the cost so far to the fare: ${cost} + ${price} = ${nw}.`, turn++), { cost, node });
        }
        const old = best[other];
        best[other] = nw;
        from[other] = node;
        tab.set(other, nw);
        heap.push(nw, other);
        if (!finished.has(other)) s.tone('n' + other, 'warn');
        F(known ? `${cost} + ${price} = ${nw} beats ${old}. Push (${nw}, ${other}). The old entry stays in the heap.` : `${cost} + ${price} = ${nw}. ${other} is new, so push (${nw}, ${other}).`, 14, null, { cost, node });
        clearEdge();
      });
      flushQuiet();
    }
    clearEdge();
    if (prev) s.tone('n' + prev, 'ok');
    stops.forEach(n => { if (n in best) s.tone('tabV' + n, finished.has(n) ? 'ok' : 'default'); });
    s.set('news', { text: '' });
    return { best, from, finished, F, tab, pops: () => pops, stale: () => stale, checks: () => checks, turn: () => turn };
  }

  Viz.register('m24-dijkstra', {
    title: 'Dijkstra: the map, the table and the heap',
    size: [560, 296],
    code: py`
      def dijkstra(graph, start):
          best = {start: 0}
          heap = [(0, start)]
          finished = set()
          while len(heap) > 0:
              cost, node = heapq.heappop(heap)
              if node in finished:
                  continue
              finished.add(node)
              for other, price in graph[node]:
                  new = cost + price
                  if other not in best or new < best[other]:
                      best[other] = new
                      heapq.heappush(heap, (new, other))
          return best
    `,
    inputs: [
      { key: 'start', label: 'Start at', type: 'select', value: 'A', options: STOPS },
      { key: 'edge', label: 'Change a fare', type: 'select', value: 'B-C', options: ROAD_NAMES },
      { key: 'fare', label: 'New fare', type: 'number', value: 2, min: 0, max: 20 },
      { key: 'closed', label: 'Close a road', type: 'select', value: 'none', options: ['none'].concat(ROAD_NAMES) },
    ],
    tryInputs: [
      { start: 'E', edge: 'D-E', fare: 0, closed: 'none' }, { start: 'A', edge: 'A-C', fare: 20, closed: 'D-E' }, { start: 'E', edge: 'B-C', fare: 2, closed: 'D-E' },
      { start: 'C', edge: 'B-C', fare: 0, closed: 'A-B' }, { start: 'D', edge: 'C-D', fare: 1, closed: 'B-D' }, { start: 'A', edge: 'A-B', fare: 1, closed: 'A-C' },
      { start: '', edge: '', fare: '', closed: '' }, { start: 'Q', edge: 'dog', fare: 'x', closed: 'cat' }, { start: 'B', edge: 'B-D', fare: 20, closed: 'none' },
    ],
    build(s, p) {
      const start = pick(p.start, STOPS, 'A');
      const roads = readRoads(p);
      const adj = toAdj(STOPS, roads, false);
      drawMap(s, STOPS, roads, SPOT, false);
      const run = playDijkstra(s, { stops: STOPS, adj, start, directed: false });
      const lost = STOPS.filter(n => !(n in run.best));
      lost.forEach(n => { s.tone('n' + n, 'muted'); run.tab.note(n, 'no route'); });
      run.F(lost.length ? `The heap is empty. No route from ${start} reaches ${lost.join(' or ')}.` : 'The heap is empty, so the search stops. The table is final.', 15);
      roads.forEach(([a, b]) => s.set(eid(a, b), { tone: 'muted', dashed: true }));
      Object.keys(run.from).forEach(o => s.set(eid(run.from[o], o), { tone: 'ok', dashed: false }));
      s.set('news', { text: run.pops() === 1 ? '1 pop, and it was not stale' : `${run.pops()} pops, and ${run.stale()} stale` });
      s.tone('news', 'default');
      run.F(Object.keys(run.from).length ? 'The solid lines are the cheapest routes. Now pick a new start, or change a fare.' : 'No road was used, so no line is solid. Now pick a new start.', 15);
    },
  });

  /* A cost grid. Rows are split by a slash, like "2 7 1 / 3 8 2". Junk counts as 1. */
  function readCosts(text) {
    const rows = String(text == null ? '' : text).split(/[/\n;]+/).map(r => r.trim().split(/[\s,]+/).filter(Boolean)).filter(r => r.length).slice(0, 3);
    if (!rows.length) return [[1]];
    const cols = Math.min(3, rows.reduce((m, r) => Math.max(m, r.length), 0));
    return rows.map(r => {
      const a = [];
      for (let i = 0; i < cols; i += 1) a.push(whole(r[i], 1, 9, 1));
      return a;
    });
  }

  Viz.register('m24-grid', {
    title: 'A cost grid is a weighted graph',
    size: [560, 268],
    inputs: [
      { key: 'grid', label: 'Costs 1 to 9, rows split by /', type: 'text', value: '2 7 1 / 3 8 2 / 1 1 4', size: 24 },
    ],
    tryInputs: [
      { grid: '' }, { grid: '5' }, { grid: 'cat' }, { grid: '1 2 3' }, { grid: '1 / 2 / 3' }, { grid: '9 9 9 / 9 9 9 / 9 9 9' }, { grid: '1 1 1 / 1 1 1 / 1 1 1' },
      { grid: '1 / 2 3 / 4 5 6' }, { grid: '0 -4 99 / 7' }, { grid: '1 9 1 / 1 9 1 / 1 1 1' },
    ],
    build(s, p) {
      const grid = readCosts(p.grid);
      const rows = grid.length, cols = grid[0].length;
      const cell = 46, gap = 4;
      const X = (x0, c) => x0 + c * (cell + gap), Y = r => 58 + r * (cell + gap);
      const LEFT = 86, RIGHT = 332;
      s.text('costH', LEFT + 50, 20, 'cost to step on', { size: 14, weight: 700 });
      s.text('bestH', RIGHT + 50, 20, 'best so far', { size: 14, weight: 700 });
      grid.forEach((row, r) => row.forEach((v, c) => {
        s.box(`c${r}_${c}`, X(LEFT, c), Y(r), v, { w: cell, h: cell, size: 18 });
        s.box(`b${r}_${c}`, X(RIGHT, c), Y(r), '?', { w: cell, h: cell, size: 18, tone: 'muted' });
      }));
      s.text('rowHint', 26, 58, 'start', { size: 13, weight: 700 });
      s.text('goalHint', X(RIGHT, cols - 1) + cell / 2 + 8, Y(rows - 1), 'goal', { size: 13, anchor: 'start', weight: 700 });
      s.text('heapL', 14, 240, 'heap', { size: 14, anchor: 'start', weight: 700 });

      const entries = [];
      let serial = 0, pops = 0, turn = 0, askGap = 2;
      const name = e => `${e.key[0]} (${e.key[1]},${e.key[2]})`;
      const slot = i => 96 + i * 78;
      const tidy = () => entries.forEach((e, i) => s.set(e.id, { x: slot(i), y: 240 }));
      const pushIt = (cost, r, c) => {
        const id = 'g' + serial++;
        s.box(id, slot(entries.length), 240, `${cost} (${r},${c})`, { w: 74, h: 34, size: 14, tone: 'warn' });
        heapPush(entries, { key: [cost, r, c], id });
        tidy();
      };
      const F = (say, ask) => {
        askGap = ask ? 0 : askGap + 1;
        s.snap(say, { ask: ask || null, vars: { pops } });
      };
      const best = { '0,0': grid[0][0] };
      s.set('b0_0', { text: grid[0][0], tone: 'warn' });
      pushIt(grid[0][0], 0, 0);
      F(`You pay for the start cell too. So (0,0) goes in the heap at ${grid[0][0]}.`);

      const finished = new Set();
      let prev = null;
      while (entries.length) {
        const top = entries[0];
        const [cost, r, c] = top.key;
        if (prev) { s.tone(prev, 'ok'); prev = null; }
        if (entries.length > 1 && askGap >= 3) {
          const others = entries.slice(1).map(name);
          F(`The heap holds ${entries.length} entries.`, askIt('Which cell comes off next?', name(top), others.slice(-2),
            'The smallest cost comes off first, even if it joined later.', turn++));
        }
        heapPop(entries);
        s.del(top.id);
        tidy();
        pops += 1;
        finished.add(r + ',' + c);
        s.tone(`c${r}_${c}`, 'active');
        s.set(`b${r}_${c}`, { tone: 'active' });
        prev = `b${r}_${c}`;
        if (r === rows - 1 && c === cols - 1) {
          s.tone(prev, 'ok');
          F(`The goal comes off the heap at ${cost}. Finished means final, so you can stop.`);
          F(`The cheapest walk costs ${cost}, and the code made ${pops} pop${pops === 1 ? '' : 's'}. Now type your own costs.`);
          return;
        }
        const nextDoor = [[-1, 0], [1, 0], [0, -1], [0, 1]].map(([dr, dc]) => [r + dr, c + dc])
          .filter(([nr, nc]) => nr >= 0 && nc >= 0 && nr < rows && nc < cols && !((nr + ',' + nc) in best));
        if (nextDoor.length && askGap >= 2) {
          const [nr, nc] = nextDoor[0], nw = cost + grid[nr][nc];
          F(`(${r},${c}) comes off at ${cost}. It is finished.`, askIt(`Cell (${nr},${nc}) costs ${grid[nr][nc]} to step on. What is its cost through this cell?`, nw, [grid[nr][nc], cost, nw + 1],
            `Add the cost so far to the cost of the cell: ${cost} + ${grid[nr][nc]} = ${nw}.`, turn++));
        } else {
          F(`(${r},${c}) comes off at ${cost}. It is finished.`);
        }
        const priced = [];
        [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
          const nr = r + dr, nc = c + dc;
          if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) return;
          const nw = cost + grid[nr][nc], key = nr + ',' + nc;
          if (!(key in best) || nw < best[key]) {
            best[key] = nw;
            s.set(`b${nr}_${nc}`, { text: nw, tone: 'warn' });
            pushIt(nw, nr, nc);
            priced.push(`(${nr},${nc}) at ${nw}`);
          }
        });
        s.tone(`c${r}_${c}`, 'default');
        F(priced.length ? `Next door: ${priced.join(', ')}. ${priced.length === 1 ? 'It joins' : 'Each one joins'} the heap.` : 'Every cell next door already has a cost that is as low. Nothing joins the heap.');
      }
    },
  });

  // ---------------------------------------------------------------- lesson 24.3
  const NEG_STOPS = ['A', 'B', 'C', 'D'];
  const NEG_SPOT = { A: [48, 130], B: [168, 50], C: [168, 214], D: [288, 130] };
  const negRoads = cb => [['A', 'B', 2], ['A', 'C', 3], ['C', 'B', cb], ['B', 'D', 1]];
  /* Plain Bellman-Ford, to compare with. Returns null on a negative loop. */
  function bellman(stops, roads, start) {
    const best = { [start]: 0 }, from = {};
    for (let t = 0; t < stops.length; t += 1) {
      let changed = false;
      roads.forEach(([a, b, c]) => {
        if (a in best && (!(b in best) || best[a] + c < best[b])) { best[b] = best[a] + c; from[b] = a; changed = true; }
      });
      if (!changed) return { best, from };
    }
    return null;
  }

  Viz.register('m24-neg-dijkstra', {
    title: 'A negative fare breaks the promise',
    size: [560, 296],
    code: py`
      def dijkstra(graph, start):
          best = {start: 0}
          heap = [(0, start)]
          finished = set()
          while len(heap) > 0:
              cost, node = heapq.heappop(heap)
              if node in finished:
                  continue
              finished.add(node)
              for other, price in graph[node]:
                  new = cost + price
                  if other not in best or new < best[other]:
                      best[other] = new
                      heapq.heappush(heap, (new, other))
          return best
    `,
    inputs: [
      { key: 'cb', label: 'Fare from C to B', type: 'number', value: -2, min: -9, max: 9 },
    ],
    tryInputs: [{ cb: -9 }, { cb: -3 }, { cb: -1 }, { cb: 0 }, { cb: 9 }, { cb: '' }, { cb: 'x' }],
    build(s, p) {
      const cb = whole(p.cb, -9, 9, -2);
      const roads = negRoads(cb);
      const adj = toAdj(NEG_STOPS, roads, true);
      drawMap(s, NEG_STOPS, roads, NEG_SPOT, true);
      const run = playDijkstra(s, { stops: NEG_STOPS, adj, start: 'A', directed: true, brokenPromise: true });
      const truth = bellman(NEG_STOPS, roads, 'A');
      const wrong = NEG_STOPS.filter(n => run.best[n] !== truth.best[n]);
      if (wrong.length) {
        const n = wrong[0];
        const path = routeTo(truth.from, 'A', n);
        const sum = path.slice(1).map((m, i) => adj[path[i]].find(e => e[0] === m)[1]);
        run.F(`The heap is empty. The table says ${n} costs ${run.best[n]}. Check that by hand.`, 15,
          askIt(`Add up the route ${path.join(' ')}: ${sum.join(' + ').replace(/\+ -/g, '- ')}. What does it cost?`, truth.best[n], [run.best[n], truth.best[n] + 1, truth.best[n] - 1],
            `The fares add up to ${truth.best[n]}. That is lower than the ${run.best[n]} in the table.`, run.turn()));
        s.tone('tabV' + n, 'bad');
        run.tab.note(n, `real: ${truth.best[n]}`, 'bad');
        path.slice(1).forEach((m, i) => s.tone(eid(path[i], m, true), 'accent'));
        s.tone('n' + n, 'bad');
        run.F(`The table is wrong: ${n} should be ${truth.best[n]}. ${path[path.length - 2]} got cheaper after it was finished.`, 15);
        run.F('Now set the fare to -1 and to 2. See when Dijkstra is right.', 15);
      } else {
        run.F('The heap is empty. This time the table is right.', 15);
        run.F(cb < 0 ? `A fare of ${cb} did no harm on this map. Now try -2.` : `With no negative fare, the promise holds. Now try -2.`, 15);
      }
    },
  });

  const BF_SPOT = { A: [48, 110], B: [168, 40], C: [168, 190], D: [288, 110] };
  const BF_ORDER = (cb, dc) => {
    const list = [['B', 'D', 1], ['A', 'B', 2], ['A', 'C', 3], ['C', 'B', cb]];
    if (dc != null) list.push(['D', 'C', dc]);
    return list;
  };
  Viz.register('m24-bellman-ford', {
    title: 'Bellman-Ford tries every edge, round after round',
    size: [560, 324],
    code: py`
      def bellman_ford(nodes, edges, start):
          best = {start: 0}
          for turn in range(len(nodes)):
              changed = False
              for a, b, price in edges:
                  if a in best:
                      new = best[a] + price
                      if b not in best or new < best[b]:
                          best[b] = new
                          changed = True
              if not changed:
                  return best
          return None
    `,
    inputs: [
      { key: 'start', label: 'Start at', type: 'select', value: 'A', options: NEG_STOPS },
      { key: 'cb', label: 'Fare from C to B', type: 'number', value: -2, min: -9, max: 9 },
      { key: 'dc', label: 'Add a ride from D to C', type: 'select', value: 'none', options: ['none', '2', '-1', '-3'] },
    ],
    tryInputs: [
      { start: 'A', cb: -2, dc: '-1' }, { start: 'A', cb: 5, dc: 'none' }, { start: 'D', cb: -2, dc: 'none' }, { start: 'D', cb: -2, dc: '-3' }, { start: 'C', cb: 9, dc: '2' },
      { start: 'B', cb: -9, dc: '-1' }, { start: '', cb: '', dc: '' }, { start: 'Z', cb: 'x', dc: 'cat' }, { start: 'A', cb: -9, dc: '2' },
    ],
    build(s, p) {
      const start = pick(p.start, NEG_STOPS, 'A');
      const cb = whole(p.cb, -9, 9, -2);
      const dcNum = Number(p.dc);
      const dc = p.dc === 'none' || p.dc === '' || p.dc == null || !Number.isFinite(dcNum) ? null : dcNum;
      const edges = BF_ORDER(cb, dc);
      NEG_STOPS.forEach(n => s.circle('n' + n, BF_SPOT[n][0], BF_SPOT[n][1], n, { r: 22 }));
      edges.forEach(([a, b, c]) => s.edge(eid(a, b, true), 'n' + a, 'n' + b, { arrow: true, label: String(c) }));
      const tab = tableKit(s, NEG_STOPS, { x: 396 });
      const best = { [start]: 0 };
      tab.set(start, 0);
      s.tone('n' + start, 'warn');
      s.text('roundT', 438, 214, 'round 0', { size: 15, weight: 700 });
      s.text('edgesL', 20, 256, 'edges, in the order the code tries them', { size: 13, anchor: 'start', weight: 700 });
      const X = i => 56 + i * 94;
      edges.forEach(([a, b, c], i) => s.box('ed' + i, X(i), 284, `${a}>${b} ${c}`, { w: 86, h: 34, size: 15 }));
      let tries = 0, gap = 2, turn = 0, askedSkip = false, askedBetter = false;
      const F = (say, line, ask, round) => {
        gap = ask ? 0 : gap + 1;
        s.snap(say, { line, ask: ask || null, vars: { round, 'edge tries': tries } });
      };
      F(`Write 0 for ${start}. There is no heap and no finished stop here.`, 2, null, 0);
      const V = NEG_STOPS.length;
      for (let round = 1; round <= V; round += 1) {
        let changed = false;
        s.set('roundT', { text: 'round ' + round });
        if (round === 1 || round === V) {
          F(round === V ? `Round ${round}. A plain route needs only ${V - 1} rounds, so this one is a test.` : 'Round 1 begins. Try every edge, in order.', 3, null, round);
        }
        edges.forEach(([a, b, c], i) => {
          edges.forEach(([x, y], k) => { s.tone('ed' + k, 'default'); s.tone(eid(x, y, true), 'default'); });
          NEG_STOPS.forEach(n => { s.tone('n' + n, 'default'); if (n in best) tab.calm(n); });
          s.tone('ed' + i, 'active');
          s.tone(eid(a, b, true), 'accent');
          s.tone('n' + a, a in best ? 'active' : 'muted');
          tries += 1;
          if (!(a in best)) {
            F(`${a} to ${b}: ${a} has no cost yet, so skip this edge.`, 6,
              (askedSkip && gap < 4) || gap < 2 ? null : askIt(`The next edge leaves ${a}. But ${a} still shows a ?. What happens?`, 'Skip this edge for now', [`Write ${c} for ${b}`, 'Stop the search'],
                `There is no route to ${a} yet, so there is nothing to add the fare to.`, turn++), round);
            askedSkip = true;
            return;
          }
          const nw = best[a] + c;
          const better = !(b in best) || nw < best[b];
          if (!askedBetter && gap >= 2 && b in best) {
            askedBetter = true;
            F(`${a} to ${b}: ${best[a]} + ${c} = ${nw}. The table says ${best[b]}.`, 8, askIt('What does the code do?', better ? `Change ${b} to ${nw}` : `Leave ${b} at ${best[b]}`, better ? [`Leave ${b} at ${best[b]}`, 'End the round'] : [`Change ${b} to ${nw}`, 'End the round'],
              better ? `${nw} is lower than ${best[b]}, so the table changes.` : `${nw} is not lower than ${best[b]}, so the table stays.`, turn++), round);
          } else if (gap >= 4) {
            F(`Next is ${a} to ${b}, with fare ${c}.`, 7, askIt(`${a} costs ${best[a]}. What is the new cost for ${b}?`, nw, [c, best[a], nw + 1], `${best[a]} + ${c} = ${nw}.`, turn++), round);
          }
          if (better) {
            const old = best[b];
            best[b] = nw;
            changed = true;
            tab.set(b, nw);
            s.tone('n' + b, 'warn');
            F(old == null ? `${a} to ${b}: ${best[a]} + ${c} = ${nw}. ${b} now has a cost.` : `${a} to ${b}: ${best[a]} + ${c} = ${nw}. That beats ${old}, so ${b} changes.`, 9, null, round);
          } else {
            F(`${a} to ${b}: ${best[a]} + ${c} = ${nw}. That does not beat ${best[b]}.`, 8, null, round);
          }
        });
        edges.forEach(([x, y], k) => { s.tone('ed' + k, 'default'); s.tone(eid(x, y, true), 'default'); });
        NEG_STOPS.forEach(n => { s.tone('n' + n, 'default'); if (n in best) tab.calm(n); });
        if (!changed) {
          F(`Round ${round} changed nothing. So the next round would change nothing too. The table is final.`, 12, null, round);
          NEG_STOPS.forEach(n => { if (!(n in best)) { tab.note(n, 'no route'); s.tone('n' + n, 'muted'); } });
          F(`Bellman-Ford made ${tries} edge tries. Now change a fare, or add the ride from D to C.`, 12, null, round);
          return;
        }
        if (round < V) {
          F(`Round ${round} changed the table.`, 11, gap >= 2 ? askIt('Can the code stop now?', 'No, it needs another round', ['Yes, one round is enough', 'Yes, it found every stop'],
            'A change here can make a later edge cheaper. Only a round with no change proves the table is final.', turn++) : null, round);
        }
      }
      NEG_STOPS.forEach(n => { if (n in best) s.tone('tabV' + n, 'bad'); });
      s.text('loop', 438, 236, 'negative loop', { size: 14, anchor: 'middle', weight: 700, tone: 'bad' });
      F(`Round ${V} still changed the table. That proves a negative loop. No cheapest cost exists.`, 13, null, V);
      F(`Each trip round the loop pays you. The code returns None, after ${tries} edge tries.`, 13, null, V);
    },
  });
})();
