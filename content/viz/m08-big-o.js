/* Visuals for module 8. Names start with the module id. */
(function () {
  // ------------------------------------------------------------ small helpers
  /* A whole number held inside lo and hi, so a typed value can never break a picture. */
  const whole = (v, lo, hi, d) => {
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d;
  };
  const fmt = n => Number(n).toLocaleString('en-US');
  /* Options for an ask. Removes repeats, so odd inputs never show the same answer twice. */
  const pick = (right, wrongs, at = 1) => {
    const r = String(right);
    const rest = [...new Set(wrongs.map(String))].filter(x => x !== r).slice(0, 2);
    const answer = Math.min(at, rest.length);
    rest.splice(answer, 0, r);
    return { options: rest, answer };
  };
  /* How many times n can be halved before it reaches 1. Same as the Python in lesson 8.3. */
  const halvings = n => {
    let c = 0;
    while (n > 1) { n = Math.floor(n / 2); c += 1; }
    return c;
  };
  /* Reads the items a learner types: spaces or commas between them. */
  const parseItems = (text, max) => String(text == null ? '' : text)
    .split(/[\s,]+/).filter(Boolean).slice(0, max).map(x => x.slice(0, 3));
  const showList = a => '[' + a.join(', ') + ']';
  const range = (a, b) => (a > b ? 'No pages' : a === b ? `Page ${a}` : `Pages ${a} to ${b}`);

  // ------------------------------------------------------------ the race track
  const LANES = {
    one: { label: 'O(1)', tone: 'ok', steps: () => 1 },
    log: { label: 'O(log n)', tone: 'active', steps: n => halvings(n) },
    line: { label: 'O(n)', tone: 'accent', steps: n => n },
    nlog: { label: 'O(n log n)', tone: 'warn', steps: n => n * halvings(n) },
    sq: { label: 'O(n^2)', tone: 'bad', steps: n => n * n },
  };
  const BAR_X = 118, BAR_W = 322, FIRST_Y = 66, LANE_H = 42;
  const laneY = i => FIRST_Y + i * LANE_H;

  function drawTrack(s, lanes) {
    s.text('nlabel', BAR_X, 26, 'n = 0', { size: 19, anchor: 'start', weight: 700, mono: true });
    s.text('stepslabel', 552, 26, 'steps', { size: 14, anchor: 'end', tone: 'muted' });
    lanes.forEach((l, i) => {
      s.text(`lab${i}`, 8, laneY(i), l.label, { size: 15, anchor: 'start', mono: true, weight: 700 });
      s.box(`bar${i}`, BAR_X, laneY(i), '', { w: 0, h: 28, tone: l.tone });
      s.text(`num${i}`, 552, laneY(i), '0', { size: 15, anchor: 'end', mono: true, weight: 700 });
    });
  }
  /* Moves every bar to its count for this n. top is the count that fills the track. */
  function setTrack(s, lanes, n, top) {
    s.set('nlabel', { text: `n = ${fmt(n)}` });
    lanes.forEach((l, i) => {
      const v = l.steps(n);
      const w = v > 0 ? Math.max(3, (v / top) * BAR_W) : 0;
      s.set(`bar${i}`, { x: BAR_X + w / 2, w });
      s.set(`num${i}`, { text: fmt(v) });
    });
  }
  const topOf = (lanes, n) => Math.max(1, ...lanes.map(l => l.steps(n)));

  // ---------------------------------------------------------------- lesson 8.1
  Viz.register('m08-two-computers', {
    title: 'Same steps, different seconds',
    size: [560, 220],
    code: py`
      steps = 0
      for i in range(n):
          steps = steps + 1
      print(steps)
    `,
    inputs: [
      { key: 'n', label: 'Trips (n)', type: 'number', value: 4, min: 1, max: 5 },
      { key: 'slow', label: 'Seconds per step, old computer', type: 'number', value: 3, min: 2, max: 5 },
    ],
    tryInputs: [{ n: 1, slow: 2 }, { n: 5, slow: 5 }, { n: 2, slow: 3 }],
    build(s, p) {
      const n = whole(p.n, 1, 5, 4), slow = whole(p.slow, 2, 5, 3);
      const Y = [86, 168];
      s.text('h1', 330, 30, 'steps', { size: 15, tone: 'muted' });
      s.text('h2', 460, 30, 'seconds', { size: 15, tone: 'muted' });
      s.text('new1', 110, Y[0] - 10, 'New computer', { size: 15, weight: 700 });
      s.text('new2', 110, Y[0] + 12, '1 s per step', { size: 13, tone: 'muted' });
      s.text('old1', 110, Y[1] - 10, 'Old computer', { size: 15, weight: 700 });
      s.text('old2', 110, Y[1] + 12, `${slow} s per step`, { size: 13, tone: 'muted' });
      const box = { w: 84, h: 56 };
      s.box('ns', 330, Y[0], 0, box);
      s.box('nt', 460, Y[0], 0, box);
      s.box('os', 330, Y[1], 0, box);
      s.box('ot', 460, Y[1], 0, box);
      s.snap('Two computers run the same code. These clock times are made up.', { line: 1, vars: { n, steps: 0 } });

      for (let t = 1; t <= n; t += 1) {
        s.set('ns', { text: t, tone: 'active' });
        s.set('os', { text: t, tone: 'active' });
        s.set('nt', { text: t });
        s.set('ot', { text: t * slow });
        const ask = t === 1 && n > 1 ? Object.assign({
          q: `The old clock shows ${slow} seconds now. After one more trip, how many steps has the old computer done?`,
          why: 'Each trip is 1 step on any computer. Only the clock runs at a different speed.',
        }, pick(2, [1 + slow, slow * 2])) : null;
        s.snap(`Trip ${t}. Both computers add 1 step. The clocks tick at their own speeds.`, { line: 3, vars: { n, steps: t }, ask });
      }

      s.tone(['ns', 'os'], 'default');
      s.snap('The loop is done. Look at both clocks.', {
        line: 2, vars: { n, steps: n },
        ask: {
          q: 'Which computer did more steps?',
          options: ['The new one', 'The old one', 'They did the same'],
          answer: 2,
          why: 'The code and the input are the same, so the step count is the same.',
        },
      });
      s.tone(['ns', 'os'], 'ok');
      s.snap(`Both did ${n} steps. Only the seconds differ. Try other numbers above.`, { line: 4, vars: { n, steps: n }, out: String(n) });
    },
  });

  Viz.register('m08-count-loop', {
    title: 'Count the steps of a loop',
    size: [560, 240],
    code: py`
      def count_steps(items):
          steps = 0
          for x in items:
              steps = steps + 1
          return steps
    `,
    inputs: [
      { key: 'n', label: 'Items in the list', type: 'number', value: 4, min: 0, max: 6 },
    ],
    tryInputs: [{ n: 0 }, { n: 1 }, { n: 2 }, { n: 6 }],
    build(s, p) {
      const n = whole(p.n, 0, 6, 4);
      const items = [4, 9, 2, 7, 1, 5].slice(0, n);
      const o = { y: 74 };
      const X = i => s.slotX(i, n, o);
      s.row('c', items, o);
      if (!n) s.text('none', 280, 74, 'an empty list', { size: 15, tone: 'muted' });
      s.box('steps', 130, 180, 0, { w: 84, h: 56, sub: 'steps' });

      if (!n) {
        s.snap('The list is empty. steps starts at 0.', {
          line: 2, vars: { n, steps: 0 },
          ask: {
            q: 'How many trips will the loop make?',
            options: ['0', '1', 'Python stops with an error'],
            answer: 0,
            why: 'An empty list has nothing to visit. The loop ends at once, with no error.',
          },
        });
        s.pulse('steps');
        s.snap('No items, so no trips. steps stays 0. Try a bigger list above.', { line: 5, vars: { n, steps: 0 } });
        return;
      }

      s.snap(`The list has ${n} items. steps starts at 0.`, {
        line: 2, vars: { n, steps: 0 },
        ask: Object.assign({
          q: 'Count by hand first. How many trips will the loop make?',
          why: 'The loop makes one trip for each item. It does not matter what the values are.',
        }, pick(n, [n - 1, n + 1], 1)),
      });

      items.forEach((v, i) => {
        if (i === 0) s.pointer('ptr', X(0), 44, 'x', { dir: 'down' });
        else { s.set('ptr', { x: X(i) }); s.tone('c' + (i - 1), 'ok'); }
        s.tone('c' + i, 'active');
        s.set('steps', { text: i + 1 });
        s.pulse('steps');
        const ask = i === 1 && n > 2 ? Object.assign({
          q: 'What will steps be after the next trip?',
          why: 'Each trip adds 1. So steps goes up by 1, whatever the next value is.',
        }, pick(3, [2, v + 1], 0)) : null;
        s.snap(`Trip ${i + 1}: x is ${v}. steps goes up to ${i + 1}.`, { line: 4, vars: { x: v, steps: i + 1 }, ask });
      });

      s.tone('c' + (n - 1), 'ok');
      s.del('ptr');
      s.snap(`No items are left, so the loop ends. steps is ${n}.`, {
        line: 5, vars: { n, steps: n },
        ask: Object.assign({
          q: `What if the list had ${2 * n} items, twice as many?`,
          why: 'One trip per item. So twice the items means twice the trips.',
        }, pick(2 * n, [n, 4 * n], 1)),
      });
      s.text('t1', 400, 160, `n = ${n} gives ${n} steps`, { size: 15, mono: true });
      s.text('t2', 400, 192, `n = ${2 * n} gives ${2 * n} steps`, { size: 15, mono: true, weight: 700 });
      s.snap('Double the items, and the steps double too. Try another size above.', { line: 5, vars: { n, steps: n } });
    },
  });

  // ---------------------------------------------------------------- lesson 8.2
  Viz.register('m08-nested-steps', {
    title: 'A loop in a loop fills a square',
    size: [560, 300],
    code: py`
      steps = 0
      for i in range(n):
          for j in range(n):
              steps = steps + 1
      print(steps)
    `,
    inputs: [
      { key: 'n', label: 'n', type: 'number', value: 3, min: 0, max: 5 },
    ],
    tryInputs: [{ n: 0 }, { n: 1 }, { n: 2 }, { n: 5 }],
    build(s, p) {
      const n = whole(p.n, 0, 5, 3);
      const CX = j => 130 + 50 * j, CY = i => 62 + 50 * i;
      s.box('steps', 470, 110, 0, { w: 92, h: 60, sub: 'steps' });
      for (let k = 0; k < n; k += 1) {
        s.text(`jl${k}`, CX(k), 22, `j=${k}`, { size: 13, tone: 'muted', mono: true });
        s.text(`il${k}`, 72, CY(k), `i=${k}`, { size: 13, tone: 'muted', mono: true });
      }
      for (let i = 0; i < n; i += 1) {
        for (let j = 0; j < n; j += 1) s.box(`g${i}${j}`, CX(j), CY(i), '', { w: 44, h: 44, tone: 'muted', size: 16 });
      }

      if (!n) {
        s.text('none', 200, 110, 'no rows, no columns', { size: 15, tone: 'muted' });
        s.snap('n is 0. The range has no numbers in it.', {
          line: 2, vars: { n, steps: 0 },
          ask: {
            q: 'How many steps will this take?',
            options: ['0', '1', 'Python stops with an error'],
            answer: 0,
            why: 'range(0) is empty. The outer loop makes no trips, so the inner loop never starts.',
          },
        });
        s.pulse('steps');
        s.snap('No trips, so steps stays 0. Try a bigger n above.', { line: 5, vars: { n, steps: 0 }, out: '0' });
        return;
      }

      s.snap(`Each square is one step. n is ${n}, so there are ${n} rows and ${n} columns.`, {
        line: 1, vars: { n, steps: 0 },
        ask: Object.assign({
          q: 'Count the squares. How many steps will this take?',
          why: `The inner loop makes ${n} trips for each of the ${n} outer trips.`,
        }, pick(n * n, [n, 2 * n, n + 1], 1)),
      });

      let k = 0, last = null;
      for (let i = 0; i < n; i += 1) {
        for (let j = 0; j < n; j += 1) {
          k += 1;
          if (last) s.tone(last, 'ok');
          last = `g${i}${j}`;
          s.set(last, { text: k, tone: 'active' });
          s.set('steps', { text: k });
          const ask = i === 0 && j === n - 1 && n > 1 ? Object.assign({
            q: `Row 0 is done, and steps is ${n}. What will steps be when row 1 is done?`,
            why: `Each row adds ${n} more steps.`,
          }, pick(2 * n, [n + 1, n * n * 2], 0)) : i === 2 && j === n - 1 && n > 3 ? Object.assign({
            q: `Row 2 is done, and steps is ${k}. How many more steps are to come?`,
            why: `There are ${n - 3} more ${n - 3 === 1 ? 'row' : 'rows'} of ${n} steps each.`,
          }, pick(n * n - k, [n, n * n], 1)) : null;
          s.snap(`i is ${i} and j is ${j}. That is step ${k}.`, { line: 4, vars: { n, i, j, steps: k }, ask });
        }
      }
      s.tone(last, 'ok');
      s.snap(`The square is full: ${n} rows of ${n} steps. That makes ${n * n}.`, {
        line: 5, vars: { n, steps: n * n }, out: String(n * n),
        ask: Object.assign({
          q: `What if n doubles to ${2 * n}? How many steps then?`,
          why: `The square gets twice as wide and twice as tall. ${2 * n} times ${2 * n} is ${4 * n * n}.`,
        }, pick(4 * n * n, [2 * n * n, 2 * n], 1)),
      });
      s.text('t1', 470, 190, `n = ${2 * n}:`, { size: 15, mono: true });
      s.text('t2', 470, 216, `${4 * n * n} steps`, { size: 15, mono: true, weight: 700 });
      s.snap('Double n, and the steps go up 4 times. Try another n above.', { line: 5, vars: { n, steps: n * n }, out: String(n * n) });
    },
  });

  Viz.register('m08-race-three', {
    title: 'The race: no loop, one loop, a loop in a loop',
    size: [560, 170],
    inputs: [
      { key: 'n', label: 'Your n', type: 'number', value: 100, min: 0, max: 1000 },
    ],
    tryInputs: [{ n: 0 }, { n: 1 }, { n: 2 }, { n: 16 }, { n: 1000 }],
    build(s, p) {
      const yours = whole(p.n, 0, 1000, 100);
      const lanes = [LANES.one, LANES.line, LANES.sq];
      const top = 256;
      drawTrack(s, lanes);

      setTrack(s, lanes, 1, top);
      s.snap('The race starts at n = 1. All 3 take 1 step, so it looks like a tie.');

      setTrack(s, lanes, 2, top);
      s.snap('n doubles to 2. O(1) stays at 1. O(n) takes 2, and O(n^2) takes 4.', {
        ask: {
          q: 'You counted this by hand. At n = 4, how many steps does O(n^2) take?',
          options: ['8', '16', '4'],
          answer: 1,
          why: 'A loop in a loop takes n times n steps, and 4 times 4 is 16.',
        },
      });

      setTrack(s, lanes, 4, top);
      s.snap('n is 4. The steps are 1, 4 and 16, the same as your table.', {
        ask: {
          q: 'n doubles to 8. Which bar will grow the most?',
          options: ['O(1)', 'O(n)', 'O(n^2)'],
          answer: 2,
          why: 'O(n^2) goes up 4 times when n doubles. O(n) only doubles, and O(1) stays still.',
        },
      });

      setTrack(s, lanes, 8, top);
      s.snap('n is 8. O(n) doubled to 8. O(n^2) went up 4 times, to 64.', {
        ask: {
          q: 'n doubles to 16. O(n^2) is 64 now. What will it be?',
          options: ['128', '80', '256'],
          answer: 2,
          why: '16 times 16 is 256. That is 4 times 64.',
        },
      });

      setTrack(s, lanes, 16, top);
      s.snap('n is 16. O(n^2) fills the track with 256 steps. O(n) has only 16.', {
        ask: Object.assign({
          q: `Now your n, ${fmt(yours)}. How many steps will O(n^2) take?`,
          why: `${fmt(yours)} times ${fmt(yours)} is ${fmt(yours * yours)}.`,
        }, pick(fmt(yours * yours), [fmt(2 * yours), fmt(yours), fmt(yours * yours + 2)], 1)),
      });

      setTrack(s, lanes, yours, topOf(lanes, yours));
      s.snap(`Your n is ${fmt(yours)}. The track rescales here, so the longest bar fits.`);
      s.snap(yours === 0
        ? 'With n at 0, the loops never run. O(1) still does its 1 step.'
        : 'Read the numbers on the right. Then try a bigger n above.');
    },
  });

  // ---------------------------------------------------------------- lesson 8.3
  Viz.register('m08-halving', {
    title: 'Open the middle, throw away half',
    size: [560, 236],
    code: py`
      lo = 1
      hi = pages
      while lo <= hi:
          mid = (lo + hi) // 2
          if mid == name_page:
              break
          if name_page > mid:
              lo = mid + 1
          else:
              hi = mid - 1
    `,
    inputs: [
      { key: 'pages', label: 'Pages in the book', type: 'number', value: 16, min: 1, max: 16 },
      { key: 'page', label: 'The name is on page', type: 'number', value: 11, min: 1, max: 20 },
    ],
    tryInputs: [{ pages: 1, page: 1 }, { pages: 1, page: 5 }, { pages: 2, page: 2 }, { pages: 16, page: 1 }, { pages: 16, page: 16 }, { pages: 8, page: 20 }, { pages: 16, page: 8 }],
    build(s, p) {
      const P = whole(p.pages, 1, 16, 16), T = whole(p.page, 1, 20, 11);
      const o = { cell: 30, gap: 3, y: 72, index: false, box: { size: 16 } };
      const X = page => s.slotX(page - 1, P, o);
      s.row('c', Array.from({ length: P }, (_, i) => i + 1), o);
      s.text('left', 280, 112, `${P} ${P === 1 ? 'page' : 'pages'} left`, { size: 15, weight: 700 });
      s.box('looks', 170, 160, 0, { w: 84, h: 50, sub: 'looks with halving' });
      s.box('flips', 400, 160, '?', { w: 84, h: 50, sub: 'flips one by one', tone: 'muted' });

      s.snap(`The book has ${P} ${P === 1 ? 'page' : 'pages'}, in order. The name is on page ${T}.`, {
        line: 1, vars: { pages: P, name_page: T },
        ask: P > 1 ? {
          q: 'You open the middle page. How many pages can you then throw away?',
          options: ['Only that 1 page', 'About half', 'All of them'],
          answer: 1,
          why: 'The names are in order. So one look tells you which half to keep.',
        } : null,
      });

      let lo = 1, hi = P, looks = 0, found = false;
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        looks += 1;
        if (looks === 1) s.pointer('ptr', X(mid), 53, 'look', { dir: 'down' });
        else s.set('ptr', { x: X(mid) });
        s.tone('c' + (mid - 1), 'active');
        s.set('looks', { text: looks });
        const vars = { lo, hi, mid, looks };
        if (mid === T) {
          found = true;
          s.tone('c' + (mid - 1), 'ok');
          s.snap(`Look ${looks}: page ${mid}. The name is here, so the search stops.`, { line: 6, vars });
          break;
        }
        const later = T > mid;
        const keep = later ? range(mid + 1, hi) : range(lo, mid - 1);
        const drop = later ? range(lo, mid - 1) : range(mid + 1, hi);
        const ask = looks <= 2 ? Object.assign({
          q: `The name is on page ${T}, and this is page ${mid}. What stays?`,
          why: later ? `${T} comes after ${mid}, so only later pages can hold the name.` : `${T} comes before ${mid}, so only earlier pages can hold the name.`,
        }, pick(keep, [drop, 'All the pages'], looks === 1 ? 1 : 0)) : null;
        s.snap(`Look ${looks}: page ${mid}. The name is on ${later ? 'a later' : 'an earlier'} page.`, { line: 7, vars, ask });

        const from = later ? lo : mid, to = later ? mid : hi;
        for (let g = from; g <= to; g += 1) s.tone('c' + (g - 1), 'muted');
        if (later) lo = mid + 1; else hi = mid - 1;
        const left = Math.max(0, hi - lo + 1);
        s.set('left', { text: `${left} ${left === 1 ? 'page' : 'pages'} left` });
        s.snap(left
          ? `${from === to ? `Page ${from} goes` : `Pages ${from} to ${to} go`} away. ${left === 1 ? '1 page is' : left + ' pages are'} left.`
          : `No pages are left, so page ${T} is not in this book.`,
        { line: later ? 8 : 10, vars: { lo, hi, mid, looks } });
      }

      const flips = found ? T : P;
      s.snap(found ? `Halving found it in ${looks} ${looks === 1 ? 'look' : 'looks'}.` : `Halving knew in ${looks} ${looks === 1 ? 'look' : 'looks'}.`, {
        line: 3, vars: { looks },
        ask: Object.assign({
          q: 'Now flip one page at a time from page 1. How many flips will it take?',
          why: found ? `You would flip pages 1 to ${T}.` : `You would flip all ${P} pages before you knew.`,
        }, pick(flips, [looks, flips + 1, flips * 2], 1)),
      });
      s.set('flips', { text: flips, tone: 'default' });
      s.snap(`Halving took ${looks}. Flipping took ${flips}. Try a far page, or one not in the book.`, { line: 3, vars: { looks, flips } });
    },
  });

  Viz.register('m08-race-five', {
    title: 'The race, now with 5 kinds of code',
    size: [560, 254],
    inputs: [
      { key: 'n', label: 'Your n', type: 'number', value: 1000, min: 0, max: 1000 },
    ],
    tryInputs: [{ n: 0 }, { n: 1 }, { n: 2 }, { n: 16 }, { n: 1000 }],
    build(s, p) {
      const yours = whole(p.n, 0, 1000, 1000);
      const lanes = [LANES.one, LANES.log, LANES.line, LANES.nlog, LANES.sq];
      const top = 256;
      drawTrack(s, lanes);

      setTrack(s, lanes, 2, top);
      s.snap('n is 2. One halving takes 2 down to 1, so O(log n) shows 1.', {
        ask: {
          q: 'Count by hand. How many times can you halve 4 before you reach 1?',
          options: ['4', '2', '3'],
          answer: 1,
          why: '4 becomes 2, and 2 becomes 1. That is 2 halvings.',
        },
      });

      setTrack(s, lanes, 4, top);
      s.snap('n is 4. O(log n) takes 2. O(n log n) takes 4 times 2, which is 8.', {
        ask: {
          q: 'n doubles to 8. What happens to O(log n)?',
          options: ['It adds 1 step', 'It doubles', 'It goes up 4 times'],
          answer: 0,
          why: 'One more halving takes 8 down to 4. After that, it is the same as before.',
        },
      });

      setTrack(s, lanes, 8, top);
      s.snap('n is 8. O(log n) has 3 steps. O(n log n) has 8 times 3, which is 24.', {
        ask: {
          q: 'At n = 16, which one lands between O(n) and O(n^2)?',
          options: ['O(log n)', 'O(n log n)', 'O(1)'],
          answer: 1,
          why: 'O(n log n) is 16 times 4, which is 64. That sits between 16 and 256.',
        },
      });

      setTrack(s, lanes, 16, top);
      s.snap('n is 16. From the top: 1, 4, 16, 64 and 256 steps.', {
        ask: Object.assign({
          q: `Now your n, ${fmt(yours)}. How many steps will O(log n) take?`,
          why: `Halve ${fmt(yours)} again and again. You reach 1 after ${halvings(yours)} halvings.`,
        }, pick(halvings(yours), [yours, halvings(yours) + 4, Math.floor(yours / 2)], 1)),
      });

      setTrack(s, lanes, yours, topOf(lanes, yours));
      s.snap(`Your n is ${fmt(yours)}. The track rescales here, so the longest bar fits.`);
      s.snap(`O(log n) takes ${halvings(yours)}, and O(n^2) takes ${fmt(yours * yours)}. Try other values of n above.`);
    },
  });

  // ---------------------------------------------------------------- lesson 8.4
  Viz.register('m08-constant-race', {
    title: 'Does the number in front decide the race?',
    size: [560, 150],
    inputs: [
      { key: 'a', label: 'Jobs per trip in code A', type: 'number', value: 10, min: 1, max: 50 },
      { key: 'n', label: 'Your n', type: 'number', value: 100, min: 0, max: 1000 },
    ],
    tryInputs: [{ a: 1, n: 0 }, { a: 1, n: 1 }, { a: 2, n: 2 }, { a: 50, n: 1000 }, { a: 50, n: 25 }, { a: 3, n: 3 }],
    build(s, p) {
      const a = whole(p.a, 1, 50, 10), yours = whole(p.n, 0, 1000, 100);
      const lanes = [
        { label: `A: ${a} * n`, tone: 'accent', steps: n => a * n },
        { label: 'B: n * n', tone: 'bad', steps: n => n * n },
      ];
      const tiny = Math.max(1, Math.round(a / 2));
      const ns = [...new Set([tiny, a, 4 * a])].sort((x, y) => x - y);
      const top = 16 * a * a;
      const verdict = n => {
        const A = a * n, B = n * n;
        return A === B ? 2 : A < B ? 0 : 1;
      };
      const opts = ['Code A', 'Code B', 'A tie'];
      const why = n => `Code A takes ${fmt(a * n)} steps and code B takes ${fmt(n * n)}.`;
      const said = n => {
        const v = verdict(n);
        if (n === 0) return 'n is 0. Neither code makes any trips, so both take 0 steps.';
        if (v === 2) return `n is ${fmt(n)}. Both take ${fmt(a * n)} ${a * n === 1 ? 'step' : 'steps'}. This is the tie point.`;
        return `n is ${fmt(n)}. A takes ${fmt(a * n)} and B takes ${fmt(n * n)}. ${v === 0 ? 'A' : 'B'} has fewer steps.`;
      };
      const askAt = n => ({
        q: `At n = ${fmt(n)}, which code takes fewer steps?`,
        options: opts,
        answer: verdict(n),
        why: why(n),
      });

      drawTrack(s, lanes);
      s.snap(`Code A does ${a} ${a === 1 ? 'job' : 'jobs'} on each trip. Code B is a loop in a loop.`, { ask: askAt(ns[0]) });
      ns.forEach((n, i) => {
        setTrack(s, lanes, n, top);
        s.snap(said(n), { ask: i < ns.length - 1 ? askAt(ns[i + 1]) : askAt(yours) });
      });
      setTrack(s, lanes, yours, topOf(lanes, yours));
      s.snap(said(yours));
      s.snap('For big n, growth wins the race. For small n, count the steps.');
    },
  });

  Viz.register('m08-best-worst', {
    title: 'Same list, different luck',
    size: [560, 226],
    code: py`
      steps = 0
      for x in items:
          steps = steps + 1
          if x == target:
              break
      print(steps)
    `,
    inputs: [
      { key: 'items', label: 'Items (up to 6)', type: 'text', value: '7 2 9 4 5', size: 14 },
      { key: 'target', label: 'Look for', type: 'text', value: '9', size: 4 },
    ],
    tryInputs: [
      { items: '', target: '5' }, { items: '8', target: '8' }, { items: '8', target: '3' },
      { items: '3 3 3', target: '3' }, { items: '7 2 9', target: '5' }, { items: '7 2 9', target: '9' },
      { items: '1 2 3 4 5 6 7 8 9', target: '9' }, { items: 'a, b', target: '' }, { items: '1234567 22', target: '1234567' },
    ],
    build(s, p) {
      const items = parseItems(p.items, 6);
      const target = String(p.target == null ? '' : p.target).trim().slice(0, 3);
      const n = items.length;
      const o = { y: 66 };
      const X = i => s.slotX(i, n, o);
      s.row('c', items, o);
      s.box('best', 110, 160, n ? 1 : 0, { w: 84, h: 44, sub: 'best case' });
      s.box('run', 280, 160, 0, { w: 84, h: 44, sub: 'this search', tone: 'active' });
      s.box('worst', 450, 160, n, { w: 84, h: 44, sub: 'worst case' });

      if (!n) {
        s.text('none', 280, 66, 'an empty list', { size: 15, tone: 'muted' });
        s.snap(`The list is empty. You look for ${target || 'nothing'}.`, {
          line: 2, vars: { target, steps: 0 },
          ask: {
            q: 'How many looks will this take?',
            options: ['0', '1', 'Python stops with an error'],
            answer: 0,
            why: 'There is nothing to look at. The loop makes no trips, and print shows 0.',
          },
        });
        s.snap('No looks at all, and no crash. Type some items above.', { line: 6, vars: { target, steps: 0 }, out: '0' });
        return;
      }

      s.snap(`The list has ${n} ${n === 1 ? 'item' : 'items'}, in any order. You look for ${target || 'nothing'}.`, {
        line: 1, vars: { target, steps: 0 },
        ask: Object.assign({
          q: 'At most, how many looks can this list need?',
          why: 'If the target is last or missing, the loop must look at every item.',
        }, pick(n, [1, n + 1], 1)),
      });

      let steps = 0, at = -1;
      for (let i = 0; i < n; i += 1) {
        steps += 1;
        if (i === 0) s.pointer('ptr', X(0), 37, 'x', { dir: 'down' });
        else { s.set('ptr', { x: X(i) }); s.tone('c' + (i - 1), 'muted'); }
        s.tone('c' + i, 'active');
        s.set('run', { text: steps });
        const hit = items[i] === target;
        if (i === 0) {
          s.snap(`Look 1: x is ${items[0]}.`, {
            line: 4, vars: { x: items[0], target, steps },
            ask: {
              q: `Will the loop stop here? It is looking for ${target || 'nothing'}.`,
              options: ['Yes', 'No'],
              answer: hit ? 0 : 1,
              why: hit ? `${items[0]} is the target, so break ends the loop.` : `${items[0]} is not the target, so the loop goes on.`,
            },
          });
        }
        if (hit) {
          at = i;
          s.tone('c' + i, 'ok');
          const more = items.slice(i + 1).includes(target);
          s.snap(`Found it on look ${steps}.${more ? ' The second match stays unseen, because break ends the loop.' : ''}`, { line: 5, vars: { x: items[i], target, steps } });
          break;
        }
        if (i > 0) s.snap(`Look ${steps}: ${items[i]} is not the target, so the loop goes on.`, { line: 4, vars: { x: items[i], target, steps } });
      }
      if (at < 0) {
        s.tone('c' + (n - 1), 'muted');
        s.del('ptr');
        s.snap(`No items are left. ${target || 'Nothing'} is not in the list, and that took ${steps} ${steps === 1 ? 'look' : 'looks'}.`, { line: 2, vars: { target, steps } });
      }

      const kind = at === 0 ? 0 : (at < 0 || at === n - 1) ? 1 : 2;
      s.snap(`print shows ${steps}.`, {
        line: 6, vars: { target, steps }, out: String(steps),
        ask: n > 1 ? {
          q: 'Which case was this search?',
          options: ['The best case', 'The worst case', 'Somewhere between'],
          answer: kind,
          why: kind === 0 ? 'The target was the very first item.' : kind === 1 ? 'The loop had to look at every item.' : 'It took more than 1 look, but fewer than all of them.',
        } : null,
      });
      s.snap(`The list size stayed at ${n}. Only your luck changed. Try the last item, or a missing one.`, { line: 6, vars: { target, steps }, out: String(steps) });
    },
  });

  // ---------------------------------------------------------------- lesson 8.5
  Viz.register('m08-memory-grow', {
    title: 'Which function needs more room?',
    size: [560, 286],
    code: py`
      def total(nums):
          t = 0
          for x in nums:
              t = t + x
          return t

      def doubled(nums):
          new = []
          for x in nums:
              new.append(x * 2)
          return new
    `,
    inputs: [
      { key: 'n', label: 'Items in nums', type: 'number', value: 4, min: 0, max: 6 },
    ],
    tryInputs: [{ n: 0 }, { n: 1 }, { n: 2 }, { n: 6 }],
    build(s, p) {
      const n = whole(p.n, 0, 6, 4);
      const nums = [3, 1, 4, 2, 5, 6].slice(0, n);
      const X = i => 100 + 58 * i;
      s.text('numsl', 40, 42, 'nums', { size: 15, mono: true, weight: 700 });
      nums.forEach((v, i) => s.box('c' + i, X(i), 42, v, { w: 52, h: 52 }));
      if (!n) s.text('none', 240, 42, 'an empty list', { size: 15, tone: 'muted' });

      s.area('A', 14, 80, 532, 88, 'total: the extra memory');
      s.area('B', 14, 178, 532, 100, 'doubled: the extra memory');
      s.text('ax', 490, 132, 'extra: 0', { size: 15, mono: true, weight: 700 });
      s.text('bx', 490, 236, 'extra: 0', { size: 15, mono: true, weight: 700 });

      s.snap(`nums already exists. It holds ${n} ${n === 1 ? 'item' : 'items'}. We count only new things.`, {
        line: 1, vars: { n },
        ask: Object.assign({
          q: `total adds up ${n} ${n === 1 ? 'item' : 'items'}. How many new values must it keep at one time?`,
          why: 'total keeps one name, t. Each trip changes that one value, so it needs no more room.',
        }, pick(1, [n, n + 1, 2], 0)),
      });

      s.box('t', 60, 132, 0, { w: 72, h: 46, sub: '', tone: 'active' });
      s.set('ax', { text: 'extra: 1' });
      s.snap('total makes one new name, t. That is 1 extra value.', { line: 2, vars: { t: 0 } });

      let t = 0;
      nums.forEach((v, i) => {
        t += v;
        s.tone('c' + i, 'active');
        if (i > 0) s.tone('c' + (i - 1), 'default');
        s.set('t', { text: t });
        s.pulse('t');
        s.snap(`Trip ${i + 1}: t becomes ${t}. The extra count stays at 1.`, { line: 4, vars: { x: v, t } });
      });
      if (n) s.tone('c' + (n - 1), 'default');

      s.snap(n ? 'total is done. Now doubled makes a new list.' : 'total is done, with t still 0. Now doubled makes a new list.', {
        line: 8,
        ask: Object.assign({
          q: `How many new items will doubled keep for ${n} ${n === 1 ? 'item' : 'items'}?`,
          why: 'doubled adds one new item on each trip, and it keeps them all.',
        }, pick(n, [1, n * 2, n + 1], 1)),
      });

      const got = [];
      nums.forEach((v, i) => {
        got.push(v * 2);
        s.tone('c' + i, 'active');
        if (i > 0) s.tone('c' + (i - 1), 'default');
        s.box('d' + i, X(i) - 40, 236, v * 2, { w: 52, h: 46, tone: 'active' });
        if (i > 0) s.tone('d' + (i - 1), 'default');
        s.set('bx', { text: `extra: ${got.length}` });
        s.snap(`Trip ${i + 1}: new gets ${v * 2}. Now the extra count is ${got.length}.`, { line: 10, vars: { x: v, new: showList(got) } });
      });
      if (n) { s.tone('c' + (n - 1), 'default'); s.tone('d' + (n - 1), 'default'); }
      s.snap(n > 1
        ? `total needs 1 extra value, so it is O(1). doubled needs ${n}, so it is O(n).`
        : 'With so few items they look alike. Try 6 items above to see them differ.',
      { line: 11, vars: { new: showList(got) } });
    },
  });

  Viz.register('m08-dup-tradeoff', {
    title: 'Spend memory to save steps',
    size: [560, 262],
    code: py`
      # Way 1: compare every pair
      for i in range(n):
          for j in range(i + 1, n):
              if nums[i] == nums[j]:
                  return True
      # Way 2: keep a set
      seen = set()
      for x in nums:
          if x in seen:
              return True
          seen.add(x)
    `,
    inputs: [
      { key: 'nums', label: 'nums (up to 6 items)', type: 'text', value: '4 7 1 9 7', size: 14 },
    ],
    tryInputs: [{ nums: '' }, { nums: '8' }, { nums: '3 3' }, { nums: '1 2' }, { nums: '1 2 3 4 5 6' }, { nums: '5 5 5 5 5 5' }, { nums: 'a, b, a' }, { nums: '1 2 3 4 5 6 7 8' }],
    build(s, p) {
      const nums = parseItems(p.nums, 6);
      const n = nums.length;
      const o = { y: 70, index: false };
      const X = i => s.slotX(i, n, o);
      s.row('c', nums, o);
      s.text('way', 280, 142, 'Way 1: compare every pair', { size: 15, weight: 700 });
      s.box('steps', 62, 200, 0, { w: 84, h: 44, sub: 'steps' });
      s.box('extra', 160, 200, 0, { w: 84, h: 44, sub: 'extra items' });

      if (!n) {
        s.text('none', 280, 70, 'an empty list', { size: 15, tone: 'muted' });
        s.snap('The list is empty, so there is nothing to compare.', {
          line: 2, vars: { n },
          ask: {
            q: 'Can an empty list have a repeat?',
            options: ['No', 'Yes'],
            answer: 0,
            why: 'A repeat needs 2 items. Both ways make no trips, and neither one crashes.',
          },
        });
        s.snap('Both ways take 0 steps and 0 extra items. Type some items above.', { line: 2, vars: { n } });
        return;
      }

      const pairs = n * (n - 1) / 2;
      s.snap(`nums has ${n} ${n === 1 ? 'item' : 'items'}. Way 1 keeps no extra items.`, {
        line: 1, vars: { n },
        ask: n > 1 ? Object.assign({
          q: `Count by hand. How many different pairs can ${n} items make?`,
          why: `Each pair is counted once. ${n} items make ${pairs} ${pairs === 1 ? 'pair' : 'pairs'}.`,
        }, pick(pairs, [n * n, n, pairs + 2], 1)) : null,
      });

      // Way 1. Work out where it stops first, so the question can come before the match.
      let stopI = -1, stopJ = -1;
      outer: for (let i = 0; i < n; i += 1) {
        for (let j = i + 1; j < n; j += 1) {
          if (nums[i] === nums[j]) { stopI = i; stopJ = j; break outer; }
        }
      }
      let way1 = 0;
      const mark = (i, j) => {
        if (way1 === 0) {
          s.pointer('pi', X(i), 41, 'i', { dir: 'down' });
          s.pointer('pj', X(j), 99, 'j', { dir: 'up' });
        } else {
          s.set('pi', { x: X(i) });
          s.set('pj', { x: X(j) });
        }
      };
      outer2: for (let i = 0; i < n; i += 1) {
        for (let j = i + 1; j < n; j += 1) {
          mark(i, j);
          way1 += 1;
          s.set('steps', { text: way1 });
          const vars = { i, j, steps: way1 };
          if (i === stopI && j === stopJ) {
            s.snap(`Pair ${way1}: spot ${i} and spot ${j}.`, {
              line: 4, vars,
              ask: {
                q: `Now it compares ${nums[i]} and ${nums[j]}. What will the code do?`,
                options: ['Keep checking more pairs', 'Stop and hand back True'],
                answer: 1,
                why: 'They match, so the code has its answer.',
              },
            });
            s.tone(['c' + i, 'c' + j], 'ok');
            s.snap(`${nums[i]} equals ${nums[j]}. Way 1 stops after ${way1} ${way1 === 1 ? 'step' : 'steps'}.`, { line: 5, vars });
            break outer2;
          }
          const ends = j === n - 1 && i < 2 && n - i - 2 > 0;
          s.snap(`Pair ${way1}: is ${nums[i]} equal to ${nums[j]}? No.`, {
            line: 4, vars,
            ask: ends ? Object.assign({
              q: `Spot ${i} is done. How many pairs will spot ${i + 1} check?`,
              why: `Spot ${i + 1} has already met the spots before it. So it only checks the ${n - i - 2} after it.`,
            }, pick(n - i - 2, [n - 1, n], 1)) : null,
          });
        }
      }
      if (s.has('pi')) s.del('pi', 'pj');
      s.clearTones(['steps', 'extra']);
      if (stopI < 0 && n > 1) s.snap(`Every pair differs, so Way 1 took all ${way1} steps.`, { line: 3, vars: { steps: way1 } });

      // Way 2.
      s.set('way', { text: 'Way 2: keep a set' });
      s.set('steps', { text: 0 });
      s.text('seenl', 226, 168, 'seen', { size: 15, mono: true, weight: 700, anchor: 'start' });
      s.snap(`Way 2 starts with an empty set. Way 1 took ${way1} ${way1 === 1 ? 'step' : 'steps'}.`, {
        line: 7, vars: { way_1_steps: way1 },
        ask: Object.assign({
          q: `With ${n} ${n === 1 ? 'item' : 'items'}, how many items can seen hold at most?`,
          why: 'seen gets one item for each different value. With no repeats, that is every item.',
        }, pick(n, [1, n * n, n + 1], 1)),
      });

      const seen = [];
      const cell = 44, gap = 5;
      const SX = i => 226 + cell / 2 + i * (cell + gap);
      let way2 = 0, dup = false;
      for (let i = 0; i < n; i += 1) {
        way2 += 1;
        if (i === 0) s.pointer('px', X(0), 41, 'x', { dir: 'down' });
        else s.set('px', { x: X(i) });
        s.set('steps', { text: way2 });
        const vars = { x: nums[i], steps: way2 };
        if (seen.includes(nums[i])) {
          dup = true;
          s.tone('c' + i, 'ok');
          s.snap(`Is ${nums[i]} in seen? Yes, so Way 2 stops after ${way2} steps.`, { line: 10, vars });
          break;
        }
        seen.push(nums[i]);
        s.box('s' + i, SX(seen.length - 1), 200, nums[i], { w: cell, h: 44, size: 16 });
        s.set('extra', { text: seen.length });
        s.snap(`Is ${nums[i]} in seen? No, so seen keeps it. That is ${seen.length} extra.`, { line: 11, vars });
      }
      s.del('px');
      s.clearTones(['steps', 'extra']);

      const verdict = way1 < way2 ? 0 : way2 < way1 ? 1 : 2;
      s.snap(dup ? 'Way 2 found the repeat.' : 'Way 2 looked at every item once.', {
        line: 8, vars: { way_1_steps: way1, way_2_steps: way2 },
        ask: {
          q: 'Which way took fewer steps on this list?',
          options: ['Way 1', 'Way 2', 'A tie'],
          answer: verdict,
          why: `Way 1 took ${way1} and Way 2 took ${way2}.`,
        },
      });
      s.snap(`Way 1: ${way1} ${way1 === 1 ? 'step' : 'steps'}, 0 extra. Way 2: ${way2} ${way2 === 1 ? 'step' : 'steps'}, ${seen.length} extra.`, { line: 8, vars: { way_1_steps: way1, way_2_steps: way2 } });
      s.snap('On long lists, Way 2 saves many steps. It pays with memory. Try a list with no repeats.', { line: 8, vars: { way_1_steps: way1, way_2_steps: way2 } });
    },
  });
})();
