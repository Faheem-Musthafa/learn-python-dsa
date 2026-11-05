/* Visuals for module 25: repeated questions, notes, and tables that fill one cell at a time. Names start with the module id. */
(function () {
  // ------------------------------------------------------------- helpers
  const whole = (v, lo, hi, d) => {
    if (v === '' || v == null) return d;
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d;
  };
  const many = (n, word) => (n === 1 ? `1 ${word}` : `${n} ${word}s`);
  const show = a => '[' + a.join(', ') + ']';
  const andList = a => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]);

  /* Options for an ask. Repeats are dropped, and the right one moves around. */
  const mix = (right, wrongs, seed = 0) => {
    const r = String(right);
    const rest = [...new Set(wrongs.map(String))].filter(x => x !== r);
    const at = Math.abs(seed) % (rest.length + 1);
    const options = rest.slice();
    options.splice(at, 0, r);
    return { options, answer: at };
  };
  const numberAsk = (q, right, wrongs, seed, why) => {
    const m = mix(right, wrongs, seed);
    return { q, options: m.options, answer: m.answer, why };
  };

  /* Whole numbers from what the learner typed. Anything else is skipped. */
  const readNums = (text, lo, hi, most) => {
    const raw = (String(text == null ? '' : text).match(/-?\d+/g) || []).map(x => parseInt(x, 10));
    const nums = raw.filter(v => v >= lo && v <= hi).slice(0, most);
    return { nums, changed: raw.length !== nums.length };
  };

  /* An empty cell is small and pale, so colour is not the only clue. */
  const EMPTY = { tone: 'muted', scale: 0.86 };
  const emptyRow = (s, prefix, count, value, o) => s.row(prefix, Array(count).fill(value), Object.assign({}, o, { box: EMPTY }));
  const fillCell = (s, id, value, tone) => s.set(id, { text: value, tone: tone || 'active', scale: 1 });

  /* An arrow from a new cell back to a cell it reads. It arcs above the row. */
  const arc = (s, id, from, to, dist, o) => s.edge(id, from, to, Object.assign({ bend: Math.min(230, dist * 52 - 8), tone: 'accent' }, o));
  const dropAll = (s, ids) => { ids.forEach(id => { if (s.has(id)) s.del(id); }); };
  /* Ids of the cells from lo up to, but not including, hi. */
  const idsFrom = (prefix, lo, hi) => { const out = []; for (let i = lo; i < hi; i++) out.push(prefix + i); return out; };

  // ---------------------------------------------------------- lesson 25.1
  Viz.register('m25-fib-collapse', {
    title: 'Many calls, few questions',
    size: [560, 360],
    inputs: [
      { key: 'pick', label: 'fib of (0 to 5)', type: 'number', value: 5, min: 0, max: 5 },
    ],
    tryInputs: [{ pick: 0 }, { pick: 1 }, { pick: 2 }, { pick: 3 }, { pick: 4 }, { pick: 5 }, { pick: '' }, { pick: 'x' }],
    build(s, p) {
      const pick = whole(p.pick, 0, 5, 5);
      let nextId = 0;
      const all = [];
      const grow = (n, parent) => {
        const node = { id: 'n' + nextId++, value: n, parent };
        all.push(node);
        if (n > 1) { node.left = grow(n - 1, node); node.right = grow(n - 2, node); }
        return node;
      };
      const root = grow(pick, null);
      const leaves = all.filter(x => x.value <= 1).length;
      const pos = Viz.Scene.layoutTree(root, { xGap: Math.min(84, 504 / Math.max(1, leaves - 1)), yGap: 60, y: 76, x: 280 });
      const total = all.length;

      s.text('key', 14, 22, 'Each circle is one call of fib.', { size: 13, anchor: 'start' });
      s.box('count', 506, 30, total, { w: 62, h: 38, sub: 'calls' });
      all.forEach(node => {
        s.circle(node.id, pos[node.id].x, pos[node.id].y, node.value, { r: 21 });
        if (node.parent) s.edge('e' + node.id, node.parent.id, node.id, { tone: 'default' });
      });

      if (pick <= 1) {
        s.snap(`fib(${pick}) is a base case. It makes 1 call and asks nothing else.`, { vars: { calls: 1, 'different questions': 1 } });
        s.tone(root.id, 'ok');
        s.snap('There is nothing to repeat here. Try 4 or 5 in the box.', { vars: { calls: 1, 'different questions': 1 } });
        return;
      }

      const first = {};
      const repeats = [];
      const walk = node => {
        if (node.value in first) { repeats.push(node); return; }
        first[node.value] = node;
        if (node.left) { walk(node.left); walk(node.right); }
      };
      walk(root);
      repeats.sort((a, b) => b.value - a.value);

      const distinct = pick + 1;
      const vars = calls => ({ calls, 'different questions': distinct });
      s.snap(`fib(${pick}) makes ${many(total, 'call')}. Look at the numbers in the circles.`, {
        vars: { calls: total },
        ask: numberAsk(`How many different numbers n do you see in the tree?`, distinct, [total, pick, distinct + 2], 1,
          `Only 0 up to ${pick}. That is ${many(distinct, 'different question')}, asked ${many(total, 'time')}.`),
      });

      const branch = node => (node.left ? [node, ...branch(node.left), ...branch(node.right)] : [node]);
      let calls = total;
      repeats.forEach((r, k) => {
        const parts = branch(r);
        parts.forEach(x => s.tone(x.id, 'warn'));
        let ask = null;
        if (k === 0 && parts.length > 1) {
          ask = numberAsk(`This second fib(${r.value}) is orange. How many calls sit in its branch?`, parts.length, [parts.length + 2, 1, parts.length - 1], 2,
            `Count the orange circles. There are ${parts.length}, and they repeat old work.`);
        } else if (k === 1) {
          ask = {
            q: `Can this fib(${r.value}) give a different answer from the first fib(${r.value})?`,
            options: ['No, the same n gives the same answer', 'Yes, it may change each time'],
            answer: 0,
            why: 'fib depends only on n. So one answer can serve both calls.',
          };
        }
        s.snap(`This fib(${r.value}) asks a question the tree already asks.`, { vars: vars(calls), ask });

        parts.forEach((x, i) => {
          if (i > 0) { s.del(x.id); s.del('e' + x.id); }
        });
        s.del(r.id);
        s.set('e' + r.id, { to: first[r.value].id, tone: 'active', bend: -40 });
        calls -= parts.length;
        s.set('count', { text: calls });
        s.pulse('count');
        s.snap(`${many(parts.length, 'call')} gone. An arrow points at the first fib(${r.value}) instead.`, { vars: vars(calls) });
        s.set('e' + r.id, { tone: 'default' });
      });

      // Slide the questions into a row, small to big.
      const gap = Math.min(92, 500 / Math.max(1, pick));
      for (let v = 0; v <= pick; v++) {
        s.set(first[v].id, { x: 280 + (v - pick / 2) * gap, y: 200 });
      }
      all.forEach(node => {
        if (!node.parent) return;
        const id = 'e' + node.id;
        if (!s.has(id)) return;
        s.set(id, { bend: node.parent.value - node.value > 1 ? 70 : 0 });
      });
      s.snap(`Slide them into a row. fib(${pick}) needs only ${many(distinct, 'question')}.`, {
        vars: vars(calls),
        ask: {
          q: 'Each arrow points at a question this one needs. Which can you answer first?',
          options: ['The small ones on the left', `fib(${pick}) on the right`],
          answer: 0,
          why: `fib(0) and fib(1) need nothing. fib(${pick}) needs almost all the others.`,
        },
      });
      const vals = [0, 1];
      for (let v = 2; v <= pick; v++) vals[v] = vals[v - 1] + vals[v - 2];
      for (let v = 0; v <= pick; v++) s.set(first[v].id, { sub: '= ' + vals[v], tone: v === pick ? 'ok' : 'default' });
      s.snap(`Answer from left to right, once each. So fib(${pick}) is ${vals[pick]}, with no repeats.`, { vars: vars(calls) });
    },
  });

  // ---------------------------------------------------------- lesson 25.2
  Viz.register('m25-stairs-memo', {
    title: 'Start at the top, write notes on the way back',
    size: [560, 350],
    code: py`
      notes = {}

      def stairs(n):
          if n <= 1:
              return 1
          if n in notes:
              return notes[n]
          answer = stairs(n - 1) + stairs(n - 2)
          notes[n] = answer
          return answer

      print(stairs(pick))
    `,
    inputs: [
      { key: 'pick', label: 'pick (0 to 6)', type: 'number', value: 5, min: 0, max: 6 },
    ],
    tryInputs: [{ pick: 0 }, { pick: 1 }, { pick: 2 }, { pick: 3 }, { pick: 4 }, { pick: 6 }, { pick: '' }, { pick: 'x' }],
    build(s, p) {
      const pick = whole(p.pick, 0, 6, 5);
      const spots = Math.max(pick, 1);
      const dx = Math.min(88, 470 / spots), dy = Math.min(70, 236 / spots);
      const left = 280 - (spots * dx) / 2;
      for (let i = 0; i <= pick; i++) {
        s.box('st' + i, left + i * dx, 290 - i * dy, '?', { w: 58, h: 40, sub: 'stair ' + i, tone: 'muted' });
      }

      const events = [];
      const notes = {};
      let calls = 0;
      const go = (n, depth) => {
        calls += 1;
        if (n <= 1) { events.push({ kind: 'base', n, depth, calls }); return 1; }
        if (n in notes) { events.push({ kind: 'look', n, depth, calls, value: notes[n] }); return notes[n]; }
        events.push({ kind: 'work', n, depth, calls });
        const a = go(n - 1, depth + 1);
        const b = go(n - 2, depth + 1);
        notes[n] = a + b;
        events.push({ kind: 'write', n, depth, calls, a, b, value: a + b });
        return a + b;
      };
      const answer = go(pick, 1);

      const seen = {};
      const noteText = () => '{' + Object.keys(seen).map(k => `${k}: ${seen[k]}`).join(', ') + '}';
      const firstWrite = events.findIndex(e => e.kind === 'write');
      const firstLook = events.findIndex(e => e.kind === 'look');
      let prev = null;
      events.forEach((e, i) => {
        if (prev != null && s.has('st' + prev)) s.tone('st' + prev, prev in seen ? 'ok' : 'default');
        const id = 'st' + e.n;
        const next = events[i + 1];
        let ask = null;
        if (i === 0 && e.kind === 'work') {
          ask = {
            q: `stairs(${e.n}) is not in the notes. Which call does line 8 start first?`,
            options: [`stairs(${e.n - 1})`, `stairs(${e.n - 2})`, 'Both at once'],
            answer: 0,
            why: `Python works left to right. It finishes stairs(${e.n - 1}) before it starts stairs(${e.n - 2}).`,
          };
        } else if (i === 0) {
          ask = numberAsk(`n is ${e.n}, a base case. What does this call return?`, 1, [e.n === 1 ? 2 : 0, 3], 1,
            e.n === 0 ? 'One way to stand on the floor: make no hops.' : 'One way to reach stair 1: a single hop.');
        } else if (i === 1 && pick >= 3) {
          ask = {
            q: `You started at stair ${pick}. Which note gets written first?`,
            options: ['The note for stair 2', `The note for stair ${pick}`],
            answer: 0,
            why: `stairs(${pick}) waits for smaller calls. Stair 2 is the first to finish its work.`,
          };
        } else if (next && i + 1 === firstWrite && pick < 3) {
          ask = numberAsk(`stairs(${next.n}) got ${next.a} and ${next.b}. What note will it write?`, next.value, [next.a, next.value + 1], 2,
            `${next.a} + ${next.b} is ${next.value}.`);
        } else if (next && i + 1 === firstLook) {
          ask = {
            q: `Next comes stairs(${next.n}) again. What will it do?`,
            options: ['Read its note and return', 'Do all the work again'],
            answer: 0,
            why: `Line 6 finds ${next.n} in the notes. Line 7 hands back the note.`,
          };
        } else if (next && next.kind === 'write' && next.n === 3 && pick >= 4) {
          ask = numberAsk(`stairs(3) got ${next.a} and ${next.b}. What note will it write?`, next.value, [next.a, next.value + 1, next.value + 2], 2,
            `${next.a} + ${next.b} is ${next.value}.`);
        } else if (next && next.kind === 'write' && next.n === pick && pick >= 3) {
          ask = numberAsk(`stairs(${pick}) got ${next.a} and ${next.b}. What is its answer?`, next.value, [next.a, next.b + next.value, next.value + 1], pick,
            `${next.a} + ${next.b} is ${next.value}. This note is written last.`);
        }

        const v = { n: e.n, depth: e.depth, calls: e.calls, notes: noteText() };
        if (e.kind === 'write') {
          seen[e.n] = e.value;
          v.notes = noteText();
          s.set(id, { text: e.value, tone: 'active' });
          s.tone(['a' + e.n, 'b' + e.n], 'muted');
          s.snap(`${e.a} + ${e.b} is ${e.value}. Line 9 writes the note for stair ${e.n}.`, { line: 9, vars: v, ask });
        } else {
          s.tone(id, 'active');
          if (e.kind === 'base') {
            s.set(id, { text: 1 });
            s.snap(`stairs(${e.n}) is a base case. It returns 1.`, { line: 5, vars: v, ask });
          } else if (e.kind === 'look') {
            s.pulse(id);
            s.snap(`stairs(${e.n}) reads its note: ${e.value}. No more calls happen.`, { line: 7, vars: v, ask });
          } else {
            s.edge('a' + e.n, id, 'st' + (e.n - 1), { tone: 'default', bend: 0 });
            if (e.n >= 2) s.edge('b' + e.n, id, 'st' + (e.n - 2), { tone: 'default', bend: 46 });
            s.snap(`stairs(${e.n}) has no note. The last hop came from ${e.n - 1} or ${e.n - 2}.`, { line: 8, vars: v, ask });
          }
        }
        prev = e.n;
      });
      if (prev != null) s.tone('st' + prev, prev in seen ? 'ok' : 'default');
      s.snap(`${answer === 1 ? 'There is 1 way' : `There are ${answer} ways`} up. That took ${many(calls, 'call')}.`, {
        line: 12, vars: { calls, notes: noteText() }, out: String(answer),
      });
    },
  });

  // ---------------------------------------------------------- lesson 25.3
  Viz.register('m25-stairs-table', {
    title: 'Fill the table from the small end',
    size: [560, 290],
    code: py`
      def stairs(n):
          if n <= 1:
              return 1
          ways = [0] * (n + 1)
          ways[0] = 1
          ways[1] = 1
          for i in range(2, n + 1):
              ways[i] = ways[i - 1] + ways[i - 2]
          return ways[n]
    `,
    inputs: [
      { key: 'n', label: 'n (0 to 8)', type: 'number', value: 6, min: 0, max: 8 },
    ],
    tryInputs: [{ n: 0 }, { n: 1 }, { n: 2 }, { n: 3 }, { n: 8 }, { n: '' }, { n: 'x' }],
    build(s, p) {
      const n = whole(p.n, 0, 8, 6);
      s.text('head', 280, 24, 'ways[i] is the ways to reach stair i', { size: 14, weight: 700 });
      if (n <= 1) {
        s.box('ans', 280, 150, '?', { w: 70, h: 60, sub: `stairs(${n})`, tone: 'muted' });
        s.snap(`n is ${n}. What does line 2 do?`, {
          line: 2, vars: { n },
          ask: {
            q: `What does stairs(${n}) give?`,
            options: ['1', '0', 'An IndexError'],
            answer: 0,
            why: n === 0 ? 'There is one way to stay on the floor: make no hops.' : 'One hop of 1 reaches stair 1.',
          },
        });
        s.set('ans', { text: 1, tone: 'ok' });
        s.snap('Line 3 returns 1. No table is needed, so nothing can go past the end.', { line: 3, vars: { n }, out: '1' });
        return;
      }
      const opt = { cell: 52, gap: 6, y: 168 };
      emptyRow(s, 'w', n + 1, 0, opt);
      s.snap('This row is the table. A pale 0 means not filled yet.', {
        line: 4, vars: { n },
        ask: numberAsk(`n is ${n}. How many cells does the table need?`, n + 1, [n, n + 2], 1,
          `One cell per stair, from the floor (0) up to ${n}. That is ${n + 1}.`),
      });
      const ways = [1, 1];
      fillCell(s, 'w0', 1);
      s.snap('Base case: one way to stand on the floor. Make no hops.', { line: 5, vars: { n } });
      s.tone('w0', 'default');
      fillCell(s, 'w1', 1);
      s.snap('Base case: one way to reach stair 1. Make one hop.', { line: 6, vars: { n } });
      s.tone('w1', 'default');
      s.text('sum', 280, 262, '', { size: 15, mono: true, weight: 700 });
      for (let i = 2; i <= n; i++) {
        const a = ways[i - 1], b = ways[i - 2];
        ways[i] = a + b;
        dropAll(s, ['a1', 'a2']);
        s.tone('w' + i, 'active');
        s.set('w' + i, { scale: 1 });
        arc(s, 'a1', 'w' + i, 'w' + (i - 1), 1);
        arc(s, 'a2', 'w' + i, 'w' + (i - 2), 2);
        s.set('sum', { text: `ways[${i}] = ${a} + ${b}` });
        const asking = i <= 3 || i % 2 === 1 || i === n;
        s.snap(`The last hop to stair ${i} came from ${i - 1} or ${i - 2}. The arrows show those cells.`, {
          line: 8, vars: { i },
          ask: asking ? numberAsk(`What goes in cell ${i}?`, a + b, [a, b === a ? a + b + 1 : b, a + b + 2], i,
            `Add the 2 cells the arrows point to: ${a} + ${b} is ${a + b}.`) : null,
        });
        fillCell(s, 'w' + i, a + b, 'ok');
        s.snap(`Cell ${i} is ${a + b}. It never needs working out again.`, { line: 8, vars: { i, 'ways[i]': a + b } });
        s.tone('w' + i, 'default');
      }
      dropAll(s, ['a1', 'a2']);
      s.tone('w' + n, 'ok');
      s.set('sum', { text: `stairs(${n}) = ${ways[n]}` });
      s.snap(`The last cell is the answer: ${ways[n]} ways. The pile of calls never grew.`, { line: 9, vars: { n }, out: String(ways[n]) });
    },
  });

  Viz.register('m25-sweets-table', {
    title: 'Skip this house, or take it?',
    size: [560, 340],
    code: py`
      best[0] = houses[0]
      best[1] = max(houses[0], houses[1])
      for i in range(2, n):
          skip = best[i - 1]
          take = best[i - 2] + houses[i]
          best[i] = max(skip, take)
      print(best[n - 1])
    `,
    inputs: [
      { key: 'houses', label: 'sweets per house', type: 'text', value: '3 6 4 2 5', size: 14 },
    ],
    tryInputs: [
      { houses: '' }, { houses: 'cat' }, { houses: '4' }, { houses: '4 9' }, { houses: '9 4' }, { houses: '5 1 1 5' },
      { houses: '0 0 0' }, { houses: '7 7 7 7 7 7' }, { houses: '1 2 3 4 5 6 7 8 9' }, { houses: '-3 200 4' }, { houses: '99 1 99 1 99 1' },
    ],
    build(s, p) {
      const { nums: houses, changed } = readNums(p.houses, 0, 99, 6);
      const n = houses.length;
      const opt = { cell: 52, gap: 6, x: 312 };
      s.text('hl', 14, 58, 'houses', { size: 13, anchor: 'start', weight: 700 });
      s.text('bl', 14, 192, 'best', { size: 13, anchor: 'start', weight: 700 });
      s.row('h', houses, Object.assign({}, opt, { y: 58, index: false }));
      if (changed) s.snap('I kept up to 6 whole numbers from 0 to 99.', { vars: { n } });
      if (n === 0) {
        s.snap('No houses at all, so the most you can get is 0 sweets.', { out: '0', vars: { n } });
        return;
      }
      emptyRow(s, 'b', n, 0, Object.assign({}, opt, { y: 192 }));
      s.text('l1', 280, 262, '', { size: 14, mono: true });
      s.text('l2', 280, 288, '', { size: 14, mono: true });
      const best = [];
      s.snap('best[i] is the most sweets from house 0 up to house i.', { vars: { n } });
      best[0] = houses[0];
      fillCell(s, 'b0', best[0]);
      s.snap(`Base case: with one house, take it. So best[0] is ${best[0]}.`, { line: 1, vars: { n } });
      s.tone('b0', 'default');
      if (n === 1) {
        s.tone('b0', 'ok');
        s.snap(`One house means ${best[0]} sweets. There is nothing else to choose.`, { line: 7, out: String(best[0]), vars: { n } });
        return;
      }
      best[1] = Math.max(houses[0], houses[1]);
      s.snap('Base case for 2 houses. They are neighbours, so you get only one.', {
        line: 2, vars: { n },
        ask: numberAsk(`Which goes in best[1]?`, best[1], [houses[0] + houses[1], Math.min(houses[0], houses[1]), best[1] + 1], 1,
          `Pick the bigger of ${houses[0]} and ${houses[1]}. You may not take both.`),
      });
      fillCell(s, 'b1', best[1]);
      s.snap(`best[1] is ${best[1]}, the bigger of the 2 houses.`, { line: 2, vars: { n } });
      s.tone('b1', 'default');
      for (let i = 2; i < n; i++) {
        const skip = best[i - 1], take = best[i - 2] + houses[i];
        best[i] = Math.max(skip, take);
        dropAll(s, ['skipE', 'takeE', 'hE']);
        s.clearTones(idsFrom('b', i + 1, n));
        s.tone('b' + i, 'active');
        s.set('b' + i, { scale: 1 });
        s.tone('h' + i, 'accent');
        arc(s, 'takeE', 'b' + i, 'b' + (i - 2), 2, { label: 'take', bend: 112 });
        arc(s, 'skipE', 'b' + i, 'b' + (i - 1), 1, { label: 'skip', bend: 38 });
        s.edge('hE', 'b' + i, 'h' + i, { tone: 'accent' });
        s.set('l1', { text: `skip: keep best[${i - 1}] = ${skip}` });
        s.set('l2', { text: `take: ${best[i - 2]} + ${houses[i]}` });
        const asking = i <= 3 || i === n - 1;
        s.snap(`At house ${i}, read the 2 cells and this house's sweets.`, {
          line: 5, vars: { i, skip, take },
          ask: asking ? numberAsk(`What goes in best[${i}]?`, best[i], [Math.min(skip, take), skip + houses[i], best[i] + 1], i,
            `The bigger of skip (${skip}) and take (${take}) is ${best[i]}.`) : null,
        });
        fillCell(s, 'b' + i, best[i], 'ok');
        s.set('l2', { text: `take: ${best[i - 2]} + ${houses[i]} = ${take}` });
        if (take >= skip) s.del('skipE'); else { s.del('takeE'); s.del('hE'); }
        s.snap(take > skip ? `Taking wins, so best[${i}] is ${best[i]}.` : take === skip ? `A tie. Both give ${best[i]}.` : `Skipping wins, so best[${i}] stays ${best[i]}.`, {
          line: 6, vars: { i, 'best[i]': best[i] },
        });
      }
      dropAll(s, ['skipE', 'takeE', 'hE']);
      s.clearTones();
      s.tone('b' + (n - 1), 'ok');
      // Walk back to find the houses.
      const took = [];
      for (let i = n - 1; i >= 0;) {
        if (i === 0 || (i === 1 ? houses[1] >= houses[0] : best[i] !== best[i - 1])) { took.unshift(i); i -= 2; } else i -= 1;
      }
      took.forEach(i => s.tone('h' + i, 'ok'));
      houses.forEach((v, i) => { if (!took.includes(i)) s.set('h' + i, { tone: 'muted', scale: 0.86 }); });
      s.set('l1', { text: `houses ${andList(took)}: ${took.map(i => houses[i]).join(' + ')} = ${best[n - 1]}` });
      s.set('l2', { text: '' });
      s.snap(`The last cell is the answer: ${best[n - 1]} sweets. The small pale houses are skipped.`, { line: 7, out: String(best[n - 1]), vars: { n } });
      // Compare with the biggest-first rule.
      const order = houses.map((v, i) => i).sort((a, b) => houses[b] - houses[a] || a - b);
      const greedy = [];
      order.forEach(i => { if (!greedy.includes(i - 1) && !greedy.includes(i + 1)) greedy.push(i); });
      const g = greedy.reduce((t, i) => t + houses[i], 0);
      s.set('l2', { text: `biggest first: ${g}` });
      s.snap(g < best[n - 1] ? `Grabbing the biggest first gets only ${g}. Greedy loses to the table.` : `Biggest first also gets ${g} here. Now try 3 6 4 2 5.`, {
        line: 7, out: String(best[n - 1]), vars: { n },
      });
    },
  });

  // ---------------------------------------------------------- lesson 25.4
  Viz.register('m25-coin-table', {
    title: 'Try each coin as the last coin',
    size: [560, 346],
    code: py`
      BIG = amount + 1
      fewest = [BIG] * (amount + 1)
      fewest[0] = 0
      for a in range(1, amount + 1):
          for coin in coins:
              if coin <= a:
                  try_it = 1 + fewest[a - coin]
                  fewest[a] = min(fewest[a], try_it)
    `,
    inputs: [
      { key: 'coins', label: 'coins', type: 'text', value: '1 3 4', size: 14 },
      { key: 'amount', label: 'amount (0 to 10)', type: 'number', value: 6, min: 0, max: 10 },
    ],
    tryInputs: [
      { coins: '', amount: 6 }, { coins: '', amount: 0 }, { coins: '5', amount: 0 }, { coins: '1', amount: 10 },
      { coins: '3 5', amount: 7 }, { coins: '4 6', amount: 7 }, { coins: '1 5 10', amount: 10 }, { coins: '3 3 1', amount: 6 },
      { coins: '9', amount: 6 }, { coins: 'cat', amount: 4 }, { coins: '0 -2 7', amount: 7 }, { coins: '1 2 3 4 5 6 7 8', amount: 10 },
      { coins: '1 3 4', amount: '' }, { coins: '1 4 5', amount: 8 },
    ],
    build(s, p) {
      const read = readNums(p.coins, 1, 20, 9);
      const coins = [...new Set(read.nums)].sort((x, y) => x - y).slice(0, 4);
      const changed = read.changed || coins.length !== read.nums.length;
      const amount = whole(p.amount, 0, 10, 6);
      const big = amount + 1;
      const cell = amount <= 7 ? 52 : 42;
      const opt = { cell, gap: amount <= 7 ? 6 : 6, y: 172 };
      const txt = v => (v >= big ? 'X' : String(v));

      s.text('cl', s.slotX(0, amount + 1, opt) - cell / 2, 22, 'coins: ' + (coins.length ? coins.join(' ') : 'none'), { size: 14, anchor: 'start', weight: 700 });
      s.text('xl', 280, 344, 'X means no mix works', { size: 13 });
      emptyRow(s, 'f', amount + 1, 'X', opt);
      const baseVars = { amount, BIG: big };
      if (changed) s.snap('I kept up to 4 different coins, from 1 to 20.', { line: 1, vars: baseVars });
      s.snap('Each cell starts as X. X is BIG, which means no mix found yet.', { line: 2, vars: baseVars });
      const fewest = Array(amount + 1).fill(big);
      const last = Array(amount + 1).fill(0);
      fewest[0] = 0;
      fillCell(s, 'f0', 0);
      s.snap('Base case: paying 0 takes 0 coins.', { line: 3, vars: baseVars });
      s.tone('f0', 'default');

      for (let k = 0; k < 4; k++) s.text('t' + k, 280, 238 + k * 25, '', { size: 14, mono: true });
      const drop = () => dropAll(s, coins.map(c => 'c' + c));
      const blank = () => { for (let k = 0; k < 4; k++) s.set('t' + k, { text: '' }); };
      let askedFirst = false;

      for (let a = 1; a <= amount; a++) {
        drop();
        s.clearTones(idsFrom('f', a + 1, amount + 1));
        s.tone('f' + a, 'active');
        s.set('f' + a, { scale: 1 });
        const fits = coins.filter(c => c <= a);
        const tries = fits.map(c => ({ c, v: 1 + fewest[a - c] }));
        tries.forEach(t => arc(s, 'c' + t.c, 'f' + a, 'f' + (a - t.c), t.c, { label: t.c }));
        blank();
        coins.forEach((c, k) => {
          s.set('t' + k, { text: c > a ? `coin ${c}: too big` : `coin ${c}: 1 + ${txt(fewest[a - c])}` });
        });
        let value = big, lastCoin = 0;
        tries.forEach(t => { if (t.v < value) { value = t.v; lastCoin = t.c; } });
        fewest[a] = value;
        last[a] = lastCoin;

        const asking = !askedFirst || tries.length > 1 && (a % 2 === 0 || a === amount || a === 3);
        let ask = null;
        if (asking && coins.length) {
          askedFirst = true;
          const right = txt(value);
          const m = mix(right, [value >= big ? '1' : value + 1, value >= big ? '0' : 'X', value > 1 ? value - 1 : value + 2], a);
          ask = {
            q: `Amount ${a}. What goes in its cell?`,
            options: m.options, answer: m.answer,
            why: value >= big
              ? 'No coin leads to a mix that works, so the cell stays X.'
              : `Take the smallest try. Its last coin is ${lastCoin}, so ${a - lastCoin} is left, and that took ${fewest[a - lastCoin]}.`,
          };
        }
        const say = fits.length
          ? `For amount ${a}, each arrow is one coin. It points at what is left to pay.`
          : `For amount ${a}, no coin fits. So no arrow can start here.`;
        s.snap(say, { line: fits.length ? 7 : 6, vars: { a }, ask });

        fillCell(s, 'f' + a, txt(value), value >= big ? 'bad' : 'ok');
        if (value < big) s.cue('carry', 'f' + (a - lastCoin), 'f' + a, txt(value));
        coins.forEach((c, k) => {
          if (c <= a) s.set('t' + k, { text: `coin ${c}: 1 + ${txt(fewest[a - c])} = ${txt(1 + fewest[a - c])}` });
        });
        coins.forEach(c => { if (s.has('c' + c) && c !== lastCoin) s.del('c' + c); });
        if (s.has('c' + lastCoin)) s.set('c' + lastCoin, { tone: 'ok' });
        s.snap(value >= big ? `No mix makes ${a}, so the cell stays X.` : `The smallest try wins. Amount ${a} takes ${many(value, 'coin')}.`, { line: 8, vars: { a, 'fewest[a]': txt(value) } });
      }
      drop();
      blank();
      s.clearTones();

      if (amount === 0) {
        s.tone('f0', 'ok');
        s.snap('The amount is 0, so the answer is 0 coins. No loop runs.', { line: 3, vars: baseVars });
        return;
      }
      if (fewest[amount] >= big) {
        s.tone('f' + amount, 'bad');
        s.set('t0', { text: 'answer: None' });
        s.snap(`The last cell is still X. No mix makes ${amount}, so the answer is None.`, { line: 8, vars: baseVars });
        return;
      }
      s.tone('f' + amount, 'ok');
      const path = [];
      for (let a = amount; a > 0; a -= last[a]) path.push(last[a]);
      s.set('t0', { text: `fewest[${amount}] = ${fewest[amount]}` });
      s.snap(`The last cell gives the answer: ${many(fewest[amount], 'coin')}. But which coins?`, {
        line: 8, vars: baseVars,
        ask: numberAsk(`Cell ${amount} used a last coin of ${last[amount]}. Which cell does that come from?`, amount - last[amount], [amount - 1 === amount - last[amount] ? amount - 2 : amount - 1, amount, last[amount] === amount ? 1 : last[amount]], amount,
          `${amount} - ${last[amount]} is ${amount - last[amount]}. Follow the best coins back to 0.`),
      });
      let at = amount;
      path.forEach((c, k) => {
        arc(s, 'w' + k, 'f' + at, 'f' + (at - c), c, { label: c, tone: 'ok' });
        at -= c;
        s.tone('f' + at, 'ok');
      });
      s.set('t1', { text: 'coins: ' + path.join(' + ') });
      s.snap(`Follow the arrows back to 0. They use ${many(path.length, 'coin')}, listed below the table.`, { line: 8, vars: baseVars });
    },
  });

  // ---------------------------------------------------------- lesson 25.5
  Viz.register('m25-toll-recipe', {
    title: 'The recipe on a new problem',
    size: [560, 348],
    code: py`
      stairs = tolls + [0]
      n = len(stairs)
      least = [0] * n
      least[0] = stairs[0]
      least[1] = stairs[1]
      for i in order:
          cheaper = min(least[i - 1], least[i - 2])
          least[i] = stairs[i] + cheaper
      print(least[n - 1])
    `,
    inputs: [
      { key: 'tolls', label: 'tolls', type: 'text', value: '2 5 1 4 3', size: 14 },
      { key: 'order', label: 'fill order', type: 'select', value: 'up', options: [
        { label: 'small to big', value: 'up' },
        { label: 'big to small', value: 'down' },
      ] },
    ],
    tryInputs: [
      { tolls: '', order: 'up' }, { tolls: '', order: 'down' }, { tolls: 'cat', order: 'up' }, { tolls: '5', order: 'up' }, { tolls: '5', order: 'down' },
      { tolls: '5 2', order: 'down' }, { tolls: '0 0 0', order: 'up' }, { tolls: '2 5 1 4 3', order: 'down' },
      { tolls: '9 9 9 9 9 9', order: 'up' }, { tolls: '1 2 3 4 5 6 7 8 9', order: 'up' }, { tolls: '-4 300 2', order: 'down' },
    ],
    build(s, p) {
      const { nums: tolls, changed } = readNums(p.tolls, 0, 20, 6);
      const down = p.order === 'down';
      const stairs = tolls.concat(0);
      const n = stairs.length;
      const parts = ['State', 'Transition', 'Base case', 'Order'];
      parts.forEach((w, i) => s.box('part' + i, 73 + i * 138, 24, w, { w: 130, h: 34, size: 16, tone: 'muted' }));
      const on = i => { parts.forEach((w, k) => s.tone('part' + k, k < i ? 'default' : k === i ? 'active' : 'muted')); };

      const opt = { cell: 52, gap: 6, x: 318 };
      s.text('tl', 14, 96, 'tolls', { size: 13, anchor: 'start', weight: 700 });
      s.text('ll', 14, 214, 'least', { size: 13, anchor: 'start', weight: 700 });
      s.row('t', stairs, Object.assign({}, opt, { y: 96, index: false }));
      s.text('topl', s.slotX(n - 1, n, opt), 62, 'top', { size: 13, weight: 700 });
      emptyRow(s, 'l', n, 0, Object.assign({}, opt, { y: 214 }));
      s.text('n1', 280, 284, 'Pay each stair you stand on. Hop 1 or 2.', { size: 14 });
      s.text('n2', 280, 310, 'Start on stair 0 or 1. The top is free.', { size: 14 });
      if (changed) s.snap('I kept up to 6 whole numbers from 0 to 20.', { vars: { n } });
      if (tolls.length === 0) {
        s.tone('l0', 'ok');
        s.set('l0', { scale: 1 });
        s.set('n1', { text: 'No stairs to pay for.' });
        s.set('n2', { text: 'You start on the top, so the answer is 0.' });
        s.snap('With no tolls, you stand on the free top right away. The answer is 0.', { line: 9, out: '0', vars: { n } });
        return;
      }
      s.snap('Here is a new problem. Say the 4 parts of the recipe before any code.', {
        line: 1, vars: { n },
        ask: {
          q: 'First, the state. What should one cell mean?',
          options: ['The least toll to stand on stair i', 'The toll of stair i', 'The number of hops so far'],
          answer: 0,
          why: 'The problem asks for the least toll. So each cell answers that, for a smaller climb.',
        },
      });
      on(0);
      s.set('n1', { text: 'least[i]: the least toll to stand on stair i' });
      s.set('n2', { text: '' });
      s.snap('State: least[i] is the least toll to stand on stair i.', {
        line: 3, vars: { n },
        ask: {
          q: 'Next, the transition. How do you reach stair i?',
          options: ['Pay stair i, plus the cheaper of the 2 before', 'Pay stair i only', 'Pay the 2 stairs before, both'],
          answer: 0,
          why: 'Your last hop came from i - 1 or i - 2. You pick the cheaper one, then pay stair i.',
        },
      });
      on(1);
      s.set('n1', { text: 'least[i] = stairs[i] + min(least[i-1], least[i-2])' });
      s.snap('Transition: pay this stair, plus the cheaper way to get next to it.', {
        line: 8, vars: { n },
        ask: {
          q: 'Now the base case. Which cells read nothing?',
          options: ['Stairs 0 and 1, where you may start', 'Only the top', 'None of them'],
          answer: 0,
          why: 'You may start on either, so you pay only that one toll.',
        },
      });
      on(2);
      const least = Array(n).fill(0);
      least[0] = stairs[0];
      fillCell(s, 'l0', least[0], 'ok');
      fillCell(s, 'l1', stairs[1], 'ok');
      least[1] = stairs[1];
      s.set('n1', { text: `least[0] = ${least[0]}, least[1] = ${least[1]}` });
      s.snap('Base case: stairs 0 and 1 cost only their own toll.', {
        line: 5, vars: { n },
        ask: {
          q: 'Last, the order. Each cell reads the 2 cells on its left. Which way is safe?',
          options: ['Small to big, left to right', 'Big to small, right to left'],
          answer: 0,
          why: 'A cell must be full before another cell reads it. Change the fill order box to see the other way.',
        },
      });
      on(3);
      const seq = [];
      for (let i = 2; i < n; i++) seq.push(i);
      if (down) seq.reverse();
      s.set('n1', { text: down ? 'You picked big to small.' : 'Fill from small to big.' });
      s.snap(down ? 'Order: this run goes big to small, as you picked. Watch what it reads.' : 'Order: this run goes small to big, so every cell it reads is full.', {
        line: 6, vars: { order: show(seq) },
      });
      const partIds = parts.map((w, k) => 'part' + k);
      s.tone(partIds, 'default');
      const empties = new Set(seq.map(i => 'l' + i));
      seq.forEach((i, k) => {
        const a = least[i - 1], b = least[i - 2];
        const pick = Math.min(a, b);
        const value = stairs[i] + pick;
        dropAll(s, ['r1', 'r2', 'rt']);
        empties.delete('l' + i);
        s.clearTones(partIds.concat([...empties]));
        s.tone('l' + i, 'active');
        s.set('l' + i, { scale: 1 });
        s.tone('t' + i, 'accent');
        arc(s, 'r1', 'l' + i, 'l' + (i - 1), 1);
        arc(s, 'r2', 'l' + i, 'l' + (i - 2), 2);
        s.edge('rt', 'l' + i, 't' + i, { tone: 'accent' });
        s.set('n1', { text: `least[${i}] = ${stairs[i]} + min(${a}, ${b})` });
        s.set('n2', { text: '' });
        const asking = k < 2 || k === seq.length - 1;
        s.snap(down && i > 3 ? `Cell ${i} reads 2 cells that are not filled. They still say 0.` : down && i === 3 ? 'Cell 3 reads cell 2, which is not filled and still says 0. Cell 1 is a base case.' : `Cell ${i} reads the 2 cells on its left, plus its own toll.`, {
          line: 7, vars: { i },
          ask: asking ? numberAsk(`What goes in cell ${i}?`, value, [stairs[i] + Math.max(a, b) === value ? value + 1 : stairs[i] + Math.max(a, b), pick, a + b + stairs[i] === value ? value + 2 : a + b + stairs[i]], i,
            `${stairs[i]} + the smaller of ${a} and ${b} is ${value}.`) : null,
        });
        least[i] = value;
        fillCell(s, 'l' + i, value, 'ok');
        s.snap(`Cell ${i} is ${value}.`, { line: 8, vars: { i, 'least[i]': value } });
      });
      dropAll(s, ['r1', 'r2', 'rt']);
      s.clearTones(partIds);
      s.tone('l' + (n - 1), down ? 'bad' : 'ok');
      s.set('n2', { text: '' });
      const right = [];
      right[0] = stairs[0];
      if (n > 1) right[1] = stairs[1];
      for (let i = 2; i < n; i++) right[i] = stairs[i] + Math.min(right[i - 1], right[i - 2]);
      const got = least[n - 1], real = right[n - 1];
      s.set('n1', { text: `answer: ${got}` });
      if (down && got !== real) {
        s.set('n2', { text: `The real answer is ${real}.` });
        s.snap(`Python gave no error, but ${got} is wrong. The real answer is ${real}. Order matters.`, { line: 9, out: String(got), vars: { n } });
      } else if (down) {
        s.snap(`Both orders happen to agree on ${got} here. Add more tolls to see them differ.`, { line: 9, out: String(got), vars: { n } });
      } else {
        s.snap(`The top cell is the answer: ${got}. Now set fill order to big to small.`, { line: 9, out: String(got), vars: { n } });
      }
    },
  });

  // ---------------------------------------------------------- lesson 25.6
  const lisBend = d => Math.min(140, 44 + 26 * (d - 1));

  Viz.register('m25-lis-table', {
    title: 'Longest rising pick that ends here',
    size: [560, 330],
    code: py`
      longest = [1] * n
      for i in range(n):
          for j in range(i):
              if nums[j] < nums[i]:
                  try_it = longest[j] + 1
                  longest[i] = max(longest[i], try_it)
      print(max(longest))
    `,
    inputs: [
      { key: 'nums', label: 'numbers', type: 'text', value: '4 7 2 5 6 1', size: 14 },
    ],
    tryInputs: [
      { nums: '' }, { nums: 'cat' }, { nums: '5' }, { nums: '2 2 2' }, { nums: '6 5 4 3 2 1' }, { nums: '1 2 3 4 5 6 7' },
      { nums: '-1 -5 3' }, { nums: '1 2 3 4 5 6 7 8 9' }, { nums: '3 1 2 500' }, { nums: '1 3 2 4' },
    ],
    build(s, p) {
      const { nums, changed } = readNums(p.nums, -9, 99, 7);
      const n = nums.length;
      const opt = { cell: 52, gap: 6, x: 322 };
      s.text('nl', 14, 62, 'nums', { size: 13, anchor: 'start', weight: 700 });
      s.text('ll', 14, 196, 'longest', { size: 13, anchor: 'start', weight: 700 });
      s.row('v', nums, Object.assign({}, opt, { y: 62, index: false }));
      if (changed) s.snap('I kept up to 7 whole numbers from -9 to 99.', { vars: { n } });
      if (n === 0) {
        s.snap('An empty list has no picks. So the answer is 0.', { out: '0', vars: { n } });
        return;
      }
      s.row('l', Array(n).fill(1), Object.assign({}, opt, { y: 196, box: EMPTY }));
      s.text('n1', 280, 268, '', { size: 14 });
      s.text('n2', 280, 294, '', { size: 14, mono: true });
      s.snap('longest[i] is the longest rising pick that ends at number i. Each cell starts at 1.', { line: 1, vars: { n } });

      const longest = Array(n).fill(1);
      const prev = Array(n).fill(-1);
      let checks = 0, asked = 0;
      for (let i = 0; i < n; i++) {
        dropAll(s, nums.map((v, j) => 'a' + j));
        s.clearTones(idsFrom('l', i + 1, n));
        nums.forEach((v, j) => s.set('v' + j, { scale: 1 }));
        s.tone('v' + i, 'active');
        s.tone('l' + i, 'active');
        s.set('l' + i, { scale: 1 });
        const smaller = [];
        for (let j = 0; j < i; j++) {
          checks += 1;
          if (nums[j] < nums[i]) {
            smaller.push(j);
            s.tone('v' + j, 'ok');
            arc(s, 'a' + j, 'l' + i, 'l' + j, i - j, { bend: lisBend(i - j) });
            if (longest[j] + 1 > longest[i]) { longest[i] = longest[j] + 1; prev[i] = j; }
          } else {
            s.set('v' + j, { tone: 'muted', scale: 0.86 });
          }
        }
        const words = smaller.map(j => nums[j]);
        s.set('n1', { text: i === 0 ? 'Nothing comes before the first number.' : smaller.length ? `Earlier and smaller: ${andList(words)}` : `Nothing before it is smaller than ${nums[i]}.` });
        s.set('n2', { text: smaller.length ? `1 + biggest of ${andList(smaller.map(j => longest[j]))}` : '' });
        const asking = i > 0 && (asked < 3 || i === n - 1);
        let ask = null;
        if (asking) {
          asked += 1;
          ask = numberAsk(`What goes in longest[${i}]?`, longest[i], [longest[i] + 1, longest[i] === 1 ? 2 + i : longest[i] - 1, i + 1], i,
            smaller.length
              ? `Add ${nums[i]} to the longest pick that ends at a smaller number. That gives ${longest[i]}.`
              : `No earlier number is smaller. So ${nums[i]} stands alone, and the cell stays 1.`);
        }
        if (i === 0) {
          fillCell(s, 'l0', 1, 'ok');
          s.snap(`The first number, ${nums[0]}, has nothing before it. So longest[0] stays 1.`, { line: 2, vars: { i, checks } });
          continue;
        }
        s.snap(smaller.length ? `Number ${nums[i]} can follow each smaller number on its left. Arrows point to their cells.` : `${nums[i]} has nothing smaller before it. It stands alone.`, {
          line: smaller.length ? 5 : 3, vars: { i, checks }, ask,
        });
        fillCell(s, 'l' + i, longest[i], 'ok');
        s.snap(`longest[${i}] is ${longest[i]}.`, { line: 6, vars: { i, checks, 'longest[i]': longest[i] } });
      }
      dropAll(s, nums.map((v, j) => 'a' + j));
      s.clearTones();
      nums.forEach((v, j) => s.set('v' + j, { scale: 1 }));
      s.set('n1', { text: 'longest = ' + show(longest) });
      s.set('n2', { text: '' });
      const top = Math.max(...longest);
      const end = longest.indexOf(top);
      const lastCell = longest[n - 1];
      s.snap('Every cell is full. Where is the answer?', {
        line: 7, vars: { checks },
        ask: {
          q: 'Each cell says "ends here". The best pick can end anywhere. Which cell gives the answer?',
          options: ['The biggest cell', 'The last cell', 'The first cell'],
          answer: 0,
          why: lastCell === top
            ? `Here the last cell is also ${top}, but only by luck. Read the biggest cell.`
            : `The last cell says ${lastCell}, but the biggest says ${top}. Read the biggest cell.`,
        },
      });
      const chain = [];
      for (let i = end; i >= 0; i = prev[i]) chain.unshift(i);
      s.tone('l' + end, 'ok');
      for (let k = chain.length - 1; k > 0; k--) {
        arc(s, 'a' + chain[k], 'l' + chain[k], 'l' + chain[k - 1], chain[k] - chain[k - 1], { tone: 'ok', bend: lisBend(chain[k] - chain[k - 1]) });
        s.tone('l' + chain[k - 1], 'ok');
      }
      chain.forEach(i => s.tone('v' + i, 'ok'));
      nums.forEach((v, i) => { if (!chain.includes(i)) s.set('v' + i, { tone: 'muted', scale: 0.86 }); });
      s.set('n1', { text: 'One best pick: ' + chain.map(i => nums[i]).join(', ') });
      s.set('n2', { text: `max(longest) = ${top}` });
      s.snap(top === 1 ? 'The answer is 1. No number can follow another here.' : `The answer is ${top}. The arrows lead back through one best pick.`, { line: 7, vars: { checks }, out: String(top) });
    },
  });
})();
